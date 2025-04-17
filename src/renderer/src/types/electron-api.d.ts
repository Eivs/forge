/**
 * 这个文件提供了 window.electron API 的详细类型定义
 * 仅作为参考，不用于实际类型检查，以避免与现有代码的类型冲突
 */

// 消息类型定义
export interface MessageType {
  id: number;
  role: 'system' | 'user' | 'assistant';
  content: string;
  chatId: number;
  createdAt: Date;
  updatedAt?: Date;
}

// 聊天类型定义
export interface ChatType {
  id: number;
  title: string;
  systemPrompt?: string;
  temperature: number;
  topP: number;
  maxTokens?: number;
  model: ModelType;
  messages: MessageType[];
  createdAt: Date;
  updatedAt?: Date;
}

// 模型类型定义
export interface ModelType {
  id: number;
  name: string;
  provider: ProviderType;
  contextSize: number;
  isActive: boolean;
}

// 提供商类型定义
export interface ProviderType {
  id: number;
  name: string;
  baseUrl: string;
  apiKey: string;
  isActive: boolean;
}

// 消息创建参数
export interface CreateMessageParams {
  role: 'system' | 'user' | 'assistant';
  content: string;
  chatId: number;
}

// 消息更新参数
export interface UpdateMessageParams {
  content?: string;
  role?: 'system' | 'user' | 'assistant';
}

// 聊天创建参数
export interface CreateChatParams {
  title: string;
  systemPrompt?: string;
  temperature: number;
  topP: number;
  maxTokens?: number;
  model: ModelType | { id: number };
}

// 聊天更新参数
export interface UpdateChatParams {
  title?: string;
  systemPrompt?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  modelId?: number;
}

// 模型创建参数
export interface CreateModelParams {
  name: string;
  contextSize?: number;
  isActive?: boolean;
  provider: ProviderType | { id: number };
}

// 模型更新参数
export interface UpdateModelParams {
  name?: string;
  contextSize?: number;
  isActive?: boolean;
  providerId?: number;
}

// 提供商创建参数
export interface CreateProviderParams {
  name: string;
  baseUrl: string;
  apiKey: string;
  isActive?: boolean;
}

// 提供商更新参数
export interface UpdateProviderParams {
  name?: string;
  baseUrl?: string;
  apiKey?: string;
  isActive?: boolean;
}

// LLM 流式响应
export interface StreamResponse {
  type: 'content' | 'error';
  content?: string;
  error?: string;
  success: boolean;
}

// LLM 流式块
export interface StreamChunk {
  type: 'content' | 'error';
  content?: string;
  error?: string;
  done?: boolean;
}

/**
 * window.electron API 的详细类型定义
 * 这些类型仅作为参考，不用于实际类型检查
 */
export interface ElectronAPI {
  // 聊天相关 API
  chats: {
    getAll: () => Promise<ChatType[]>;
    getById: (id: number) => Promise<ChatType>;
    create: (data: CreateChatParams) => Promise<ChatType>;
    update: (id: number, data: UpdateChatParams) => Promise<ChatType>;
    delete: (id: number) => Promise<void>;
    rename: (id: number, title: string) => Promise<ChatType>;
    clearMessages: (id: number) => Promise<ChatType>;
  };

  // 消息相关 API
  messages: {
    getByChatId: (chatId: number) => Promise<MessageType[]>;
    create: (data: CreateMessageParams) => Promise<MessageType>;
    update: (id: number, data: UpdateMessageParams) => Promise<MessageType>;
    delete: (id: number) => Promise<void>;
  };

  // 模型相关 API
  models: {
    getAll: () => Promise<ModelType[]>;
    getActive: () => Promise<ModelType[]>;
    create: (data: CreateModelParams) => Promise<ModelType>;
    update: (id: number, data: UpdateModelParams) => Promise<ModelType>;
    delete: (id: number) => Promise<void>;
    setActive: (id: number, isActive: boolean) => Promise<ModelType>;
  };

  // 提供商相关 API
  providers: {
    getAll: () => Promise<ProviderType[]>;
    getActive: () => Promise<ProviderType[]>;
    create: (data: CreateProviderParams) => Promise<ProviderType>;
    update: (id: number, data: UpdateProviderParams) => Promise<ProviderType>;
    delete: (id: number) => Promise<void>;
    setActive: (id: number, isActive: boolean) => Promise<ProviderType>;
  };

  // 设置相关 API
  settings: {
    getAll: () => Promise<{ key: string; value: string }[]>;
    getByKey: (key: string) => Promise<string>;
    set: (key: string, value: string) => Promise<void>;
  };

  // LLM 相关 API
  llm: {
    chat: (messages: any[], modelParams: any) => Promise<string>;
    streamChat: (messages: any[], modelParams: any) => Promise<StreamResponse>;
    streamChunk: (callback: (data: StreamChunk) => void) => () => void;
    abortGeneration: () => Promise<void>;
  };

  // MCP 相关 API
  mcp: {
    connect: (url: string) => Promise<boolean>;
    disconnect: () => Promise<void>;
    isConnected: () => Promise<boolean>;
    getConnectionStatus: () => Promise<'connected' | 'disconnected' | 'error'>;
    createMCPModel: (modelParams: any) => Promise<any>;
  };
}

// 使用示例：
//
// import { ElectronAPI } from './types/electron-api';
//
// // 获取类型化的 API
// const api = window.electron as unknown as ElectronAPI;
//
// // 使用类型化的 API
// const chats = await api.chats.getAll();
// const messages = await api.messages.getByChatId(chatId);
