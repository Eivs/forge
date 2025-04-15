import { Chat, Message } from '../store/chatStore';
import { Session, Conversation } from 'reachat';

/**
 * 将应用的 Chat 对象转换为 reachat 的 Session 对象
 */
export const chatToSession = (chat: Chat): Session => {
  // 将消息按照用户和助手的对话组织成会话
  const conversations: Conversation[] = [];

  // 跳过系统消息，只处理用户和助手的对话
  let currentQuestion = '';

  for (let i = 0; i < chat.messages.length; i++) {
    const message = chat.messages[i];

    if (message.role === 'user') {
      currentQuestion = message.content;
    } else if (message.role === 'assistant' && currentQuestion) {
      conversations.push({
        id: `${chat.id}-${message.id}`,
        question: currentQuestion,
        response: message.content,
        createdAt: message.createdAt,
        updatedAt: message.createdAt,
      });

      // 重置当前问题
      currentQuestion = '';
    }
  }

  // 如果最后一条消息是用户消息，没有对应的助手回复，也添加到会话中
  if (currentQuestion) {
    const lastMessage = chat.messages[chat.messages.length - 1];
    conversations.push({
      id: `${chat.id}-${lastMessage.id}`,
      question: currentQuestion,
      response: '', // 空回复
      createdAt: lastMessage.createdAt,
      updatedAt: lastMessage.createdAt,
    });
  }

  return {
    id: chat.id.toString(),
    title: chat.title,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt || chat.createdAt,
    conversations,
  };
};

/**
 * 将多个 Chat 对象转换为 Session 数组
 */
export const chatsToSessions = (chats: Chat[]): Session[] => {
  return chats.map(chatToSession);
};

/**
 * 将 reachat 的 Conversation 转换回应用的 Message 对象
 */
export const conversationToMessages = (conversation: Conversation, chatId: number): Message[] => {
  const userMessage: Message = {
    id: parseInt(conversation.id.split('-')[1]),
    role: 'user',
    content: conversation.question,
    createdAt: conversation.createdAt,
  };

  const assistantMessage: Message = {
    id: parseInt(conversation.id.split('-')[1]) + 1,
    role: 'assistant',
    content: conversation.response,
    createdAt: conversation.createdAt,
  };

  return [userMessage, assistantMessage];
};
