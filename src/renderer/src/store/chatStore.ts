import { create } from 'zustand';

// 将接口定义移到单独的类型文件中
export interface Message {
  id: number;
  role: 'system' | 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface Chat {
  id: number;
  title: string;
  systemPrompt?: string;
  temperature: number;
  topP: number;
  maxTokens?: number;
  model: Model;
  messages: Message[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface Model {
  id: number;
  name: string;
  provider: Provider;
  providerId?: number;
  contextSize: number;
  isActive: boolean;
}

export interface Provider {
  id: number;
  name: string;
  baseUrl: string;
  apiKey: string;
  isActive: boolean;
}

interface ChatUpdateData extends Partial<Chat> {
  modelId?: number;
}

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  isGenerating: boolean;
  fetchChats: () => Promise<void>;
  setActiveChat: (chat: Chat | null) => void;
  createChat: (data: Partial<Chat>) => Promise<Chat>;
  updateChat: (id: number, data: ChatUpdateData) => Promise<Chat>;
  deleteChat: (id: number) => Promise<void>;
  renameChat: (id: number, title: string) => Promise<Chat>;
  clearMessages: (id: number) => Promise<Chat>;
  addMessage: (chatId: number, message: Partial<Message>) => Promise<Message>;
  generateResponse: (chatId: number) => Promise<void>;
  abortGeneration: () => Promise<void>;
}

// 抽取错误处理逻辑
const handleError = (error: unknown, message: string): never => {
  console.error(message, error);
  throw error;
};

// 抽取消息更新逻辑
const updateMessageInChat = (chat: Chat, messageId: number, newContent: string): Chat => ({
  ...chat,
  messages: chat.messages.map(msg =>
    msg.id === messageId ? { ...msg, content: newContent } : msg
  ),
});

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  isGenerating: false,

  fetchChats: async () => {
    try {
      const chats = await window.electron.chats.getAll();
      set({ chats });
      if (!get().activeChat) {
        set({ activeChat: chats[0] || null });
      }
    } catch (error) {
      handleError(error, 'Error fetching chats:');
    }
  },

  setActiveChat: chat => set({ activeChat: chat }),

  createChat: async data => {
    try {
      const chat = await window.electron.chats.create(data);
      set(state => ({
        chats: [...state.chats, chat],
        activeChat: chat,
      }));
      return chat;
    } catch (error) {
      handleError(error, 'Error creating chat:');
    }
  },

  updateChat: async (id, data) => {
    try {
      const updatedChat = await window.electron.chats.update(id, data);
      set(state => ({
        chats: state.chats.map(chat => (chat.id === id ? updatedChat : chat)),
        activeChat: state.activeChat?.id === id ? updatedChat : state.activeChat,
      }));
      return updatedChat;
    } catch (error) {
      handleError(error, 'Error updating chat:');
    }
  },

  deleteChat: async id => {
    try {
      await window.electron.chats.delete(id);
      set(state => ({
        chats: state.chats.filter(chat => chat.id !== id),
        activeChat: state.activeChat?.id === id ? null : state.activeChat,
      }));
    } catch (error) {
      handleError(error, 'Error deleting chat:');
    }
  },

  renameChat: async (id, title) => {
    try {
      const updatedChat = await window.electron.chats.rename(id, title);
      set(state => ({
        chats: state.chats.map(chat => (chat.id === id ? { ...chat, title } : chat)),
        activeChat: state.activeChat?.id === id ? { ...state.activeChat, title } : state.activeChat,
      }));
      return updatedChat;
    } catch (error) {
      handleError(error, 'Error renaming chat:');
    }
  },

  clearMessages: async id => {
    try {
      const updatedChat = await window.electron.chats.clearMessages(id);
      set(state => ({
        chats: state.chats.map(chat => (chat.id === id ? updatedChat : chat)),
        activeChat: state.activeChat?.id === id ? updatedChat : state.activeChat,
      }));
      return updatedChat;
    } catch (error) {
      handleError(error, 'Error clearing chat messages:');
    }
  },

  addMessage: async (chatId, message) => {
    try {
      const newMessage = await window.electron.messages.create({
        ...message,
        chatId,
      });

      set(state => ({
        chats: state.chats.map(chat =>
          chat.id === chatId ? { ...chat, messages: [...chat.messages, newMessage] } : chat
        ),
        activeChat:
          state.activeChat?.id === chatId
            ? { ...state.activeChat, messages: [...state.activeChat.messages, newMessage] }
            : state.activeChat,
      }));

      return newMessage;
    } catch (error) {
      handleError(error, 'Error adding message:');
    }
  },

  generateResponse: async chatId => {
    const { activeChat } = get();

    if (!activeChat || activeChat.id !== chatId) {
      throw new Error('No active chat or chat ID does not match');
    }

    set({ isGenerating: true });
    let tempMessage: Message | null = null;
    let cleanupChunkEvent: (() => void) | undefined;

    try {
      const messages = activeChat.messages.map(({ role, content }) => ({ role, content }));
      // 检查是否有 MCP 工具可用
      const mcpStatus = await window.electron.mcp.isConnected();

      const modelParams = {
        modelId: activeChat.model.id,
        temperature: activeChat.temperature,
        topP: activeChat.topP,
        maxTokens: activeChat.maxTokens,
        useMCP: mcpStatus, // 如果 MCP 已连接，则使用 MCP 工具
      };

      tempMessage = await get().addMessage(chatId, {
        role: 'assistant',
        content: '',
      });

      let fullContent = '';

      const handleChunk = (data: { content: string; done?: boolean; error?: boolean }) => {
        fullContent += data.content;

        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? updateMessageInChat(chat, tempMessage!.id, fullContent) : chat
          ),
          activeChat:
            state.activeChat?.id === chatId
              ? updateMessageInChat(state.activeChat, tempMessage!.id, fullContent)
              : state.activeChat,
        }));

        if (data.done || data.error) {
          set({ isGenerating: false });
          if (cleanupChunkEvent) cleanupChunkEvent();
        }
        if (data.done) {
          try {
            window.electron.messages.update(tempMessage!.id, { content: fullContent });
          } catch (dbError) {
            console.error('Error updating message in database:', dbError);
          }
        }
      };

      cleanupChunkEvent = window.electron.llm.streamChunk(handleChunk);
      const response = await window.electron.llm.streamChat(messages, modelParams);

      if (response.error) {
        if (cleanupChunkEvent) cleanupChunkEvent();
        throw new Error(response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
      const errorContent = `**ERROR_TITLE:** ${errorMessage}\n\nERROR_HINT`;

      if (tempMessage) {
        set(state => ({
          isGenerating: false,
          chats: state.chats.map(chat =>
            chat.id === chatId ? updateMessageInChat(chat, tempMessage!.id, errorContent) : chat
          ),
          activeChat:
            state.activeChat?.id === chatId
              ? updateMessageInChat(state.activeChat, tempMessage!.id, errorContent)
              : state.activeChat,
        }));

        try {
          await window.electron.messages.update(tempMessage.id, { content: errorContent });
        } catch (dbError) {
          console.error('Error updating message in database:', dbError);
        }
      } else {
        await get().addMessage(chatId, {
          role: 'assistant',
          content: errorContent,
        });
        set({ isGenerating: false });
      }
    }
  },

  abortGeneration: async () => {
    try {
      await window.electron.llm.abortGeneration();
      set({ isGenerating: false });
    } catch (error) {
      handleError(error, 'Error aborting generation:');
    }
  },
}));
