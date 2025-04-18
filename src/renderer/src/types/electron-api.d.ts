/**
 * 这个文件提供了 window.electron API 的详细类型定义
 * 仅作为参考，不用于实际类型检查，以避免与现有代码的类型冲突
 */

declare global {
  interface Window {
    electron: {
      chats: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (data: any) => Promise<any>;
        update: (id: number, data: any) => Promise<any>;
        delete: (id: number) => Promise<any>;
        rename: (id: number, title: string) => Promise<any>;
        clearMessages: (id: number) => Promise<any>;
      };
      messages: {
        getByChatId: (chatId: number) => Promise<any[]>;
        create: (data: any) => Promise<any>;
        update: (id: number, data: any) => Promise<any>;
        delete: (id: number) => Promise<any>;
      };
      models: {
        getAll: () => Promise<any[]>;
        getActive: () => Promise<any[]>;
        create: (data: any) => Promise<any>;
        update: (id: number, data: any) => Promise<any>;
        delete: (id: number) => Promise<any>;
        setActive: (id: number, isActive: boolean) => Promise<any>;
      };
      providers: {
        getAll: () => Promise<any[]>;
        getActive: () => Promise<any[]>;
        create: (data: any) => Promise<any>;
        update: (id: number, data: any) => Promise<any>;
        delete: (id: number) => Promise<any>;
        setActive: (id: number, isActive: boolean) => Promise<any>;
      };
      settings: {
        getAll: () => Promise<any[]>;
        getByKey: (key: string) => Promise<any>;
        set: (key: string, value: string) => Promise<void>;
      };
      llm: {
        chat: (messages: any[], modelParams: any) => Promise<any>;
        streamChat: (messages: any[], modelParams: any) => Promise<any>;
        streamChunk: (callback: (data: any) => void) => () => void;
        abortGeneration: () => Promise<void>;
      };
      mcp: {
        connect: (url: string) => Promise<boolean>;
        disconnect: () => Promise<void>;
        isConnected: () => Promise<boolean>;
        getConnectionStatus: () => Promise<string>;
        createMCPModel: (modelParams: any) => Promise<any>;
      };
      mcpServers: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (data: any) => Promise<any>;
        update: (id: number, data: any) => Promise<any>;
        delete: (id: number) => Promise<any>;
      };
      shell: {
        openExternal: (url: string) => Promise<void>;
      };
    };
  }
}

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
