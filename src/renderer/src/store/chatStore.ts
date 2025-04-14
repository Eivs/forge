import { create } from 'zustand';

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
  model: Model;
  messages: Message[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface Model {
  id: number;
  name: string;
  provider: Provider;
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

// 用于更新聊天的接口，包含 modelId 字段
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
  addMessage: (chatId: number, message: Partial<Message>) => Promise<Message>;
  generateResponse: (chatId: number) => Promise<void>;
  abortGeneration: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  isGenerating: false,

  fetchChats: async () => {
    try {
      const chats = await window.electron.chats.getAll();
      console.log(chats);
      set({ chats });
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  },

  setActiveChat: chat => set({ activeChat: chat }),

  createChat: async data => {
    try {
      const chat = await window.electron.chats.create(data);
      set(state => ({ chats: [...state.chats, chat], activeChat: chat }));
      return chat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
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
      console.error('Error updating chat:', error);
      throw error;
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
      console.error('Error deleting chat:', error);
      throw error;
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
      console.error('Error renaming chat:', error);
      throw error;
    }
  },

  addMessage: async (chatId, message) => {
    try {
      const newMessage = await window.electron.messages.create({
        ...message,
        chatId,
      });

      set(state => ({
        chats: state.chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
            };
          }
          return chat;
        }),
        activeChat:
          state.activeChat?.id === chatId
            ? { ...state.activeChat, messages: [...state.activeChat.messages, newMessage] }
            : state.activeChat,
      }));

      return newMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  },

  generateResponse: async chatId => {
    const { activeChat } = get();

    if (!activeChat || activeChat.id !== chatId) {
      console.error('No active chat or chat ID does not match');
      return;
    }

    set({ isGenerating: true });

    // 为助手响应创建一个占位消息
    let tempMessage: any = null;

    try {
      const messages = activeChat.messages.map(({ role, content }) => ({ role, content }));
      const modelParams = {
        modelId: activeChat.model.id,
        temperature: activeChat.temperature,
        topP: activeChat.topP,
      };

      // 为助手响应创建一个占位消息
      tempMessage = await get().addMessage(chatId, {
        role: 'assistant',
        content: '',
      });

      // 使用流式响应
      try {
        console.log('Starting streaming LLM response');

        // 获取流式响应
        const port = window.electron.llm.streamChat(messages, modelParams);
        let fullContent = '';
        let responseReceived = false;

        // 设置安全超时
        const safetyTimeout = setTimeout(() => {
          if (get().isGenerating) {
            console.log('Safety timeout triggered: resetting isGenerating state');
            set({ isGenerating: false });
          }
        }, 30000); // 30秒超时

        // 监听流式响应
        port.onmessage = async event => {
          responseReceived = true;

          if (event.data.type === 'content') {
            // 更新内容
            fullContent = event.data.content;
            console.log('Received content update, length:', fullContent.length);

            // 更新UI
            set(state => ({
              chats: state.chats.map(chat => {
                if (chat.id === chatId) {
                  return {
                    ...chat,
                    messages: chat.messages.map(msg => {
                      if (msg.id === tempMessage.id) {
                        return { ...msg, content: fullContent };
                      }
                      return msg;
                    }),
                  };
                }
                return chat;
              }),
              activeChat:
                state.activeChat?.id === chatId
                  ? {
                      ...state.activeChat,
                      messages: state.activeChat.messages.map(msg => {
                        if (msg.id === tempMessage.id) {
                          return { ...msg, content: fullContent };
                        }
                        return msg;
                      }),
                    }
                  : state.activeChat,
            }));
          } else if (event.data.type === 'done') {
            // 流式响应完成
            console.log('Stream completed, final content length:', fullContent.length);
            clearTimeout(safetyTimeout);

            // 更新数据库
            await window.electron.messages.update(tempMessage.id, { content: fullContent });

            // 重置生成状态
            set({ isGenerating: false });
          } else if (event.data.type === 'error') {
            // 处理错误
            console.error('Error in stream:', event.data.error);
            clearTimeout(safetyTimeout);

            const errorContent = `**错误:** ${event.data.error || '未知错误'}\n\n请检查以下可能的问题:\n- API 密钥是否已配置\n- 网络连接是否正常\n- 服务提供商是否可用`;

            // 更新UI和数据库
            set(state => ({
              isGenerating: false,
              chats: state.chats.map(chat => {
                if (chat.id === chatId) {
                  return {
                    ...chat,
                    messages: chat.messages.map(msg => {
                      if (msg.id === tempMessage.id) {
                        return { ...msg, content: errorContent };
                      }
                      return msg;
                    }),
                  };
                }
                return chat;
              }),
              activeChat:
                state.activeChat?.id === chatId
                  ? {
                      ...state.activeChat,
                      messages: state.activeChat.messages.map(msg => {
                        if (msg.id === tempMessage.id) {
                          return { ...msg, content: errorContent };
                        }
                        return msg;
                      }),
                    }
                  : state.activeChat,
            }));

            await window.electron.messages.update(tempMessage.id, { content: errorContent });
          }
        };

        // 如果在短时间内没有收到响应，重置状态
        setTimeout(() => {
          if (!responseReceived && get().isGenerating) {
            console.log('No response received within timeout, resetting state');
            set({ isGenerating: false });
          }
        }, 30000); // 30秒超时
      } catch (error: any) {
        console.error('Error setting up stream:', error);

        // 处理错误
        const errorContent = `**错误:** ${error?.message || '未知错误'}\n\n请检查以下可能的问题:\n- API 密钥是否已配置\n- 网络连接是否正常\n- 服务提供商是否可用`;

        // 更新UI和数据库
        set(state => ({
          isGenerating: false,
          chats: state.chats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.map(msg => {
                  if (msg.id === tempMessage.id) {
                    return { ...msg, content: errorContent };
                  }
                  return msg;
                }),
              };
            }
            return chat;
          }),
          activeChat:
            state.activeChat?.id === chatId
              ? {
                  ...state.activeChat,
                  messages: state.activeChat.messages.map(msg => {
                    if (msg.id === tempMessage.id) {
                      return { ...msg, content: errorContent };
                    }
                    return msg;
                  }),
                }
              : state.activeChat,
        }));

        await window.electron.messages.update(tempMessage.id, { content: errorContent });
      }
    } catch (error: any) {
      console.error('Error generating response:', error);

      // Update the message with the error information
      const errorContent = `**错误:** ${error?.message || '未知错误'}\n\n请检查以下可能的问题:\n- API 密钥是否已配置\n- 网络连接是否正常\n- 服务提供商是否可用`;

      // If we have a temporary message, update it with the error
      if (tempMessage) {
        // Update the message in the UI and database
        set(state => ({
          isGenerating: false,
          chats: state.chats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.map(msg => {
                  if (msg.id === tempMessage.id) {
                    return { ...msg, content: errorContent };
                  }
                  return msg;
                }),
              };
            }
            return chat;
          }),
          activeChat:
            state.activeChat?.id === chatId
              ? {
                  ...state.activeChat,
                  messages: state.activeChat.messages.map(msg => {
                    if (msg.id === tempMessage.id) {
                      return { ...msg, content: errorContent };
                    }
                    return msg;
                  }),
                }
              : state.activeChat,
        }));

        // Update the message in the database
        try {
          await window.electron.messages.update(tempMessage.id, { content: errorContent });
        } catch (dbError) {
          console.error('Error updating message in database:', dbError);
        }
      } else {
        // If we don't have a temporary message, create a new one with the error
        try {
          await get().addMessage(chatId, {
            role: 'assistant',
            content: errorContent,
          });
        } catch (addError) {
          console.error('Error adding error message:', addError);
        }

        set({ isGenerating: false });
      }
    }
  },

  abortGeneration: async () => {
    try {
      await window.electron.llm.abortGeneration();
      set({ isGenerating: false });
    } catch (error) {
      console.error('Error aborting generation:', error);
    }
  },
}));
