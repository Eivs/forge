// 为 window.electron 添加类型定义

interface ElectronAPI {
  // 聊天相关 API
  chats: {
    getAll: () => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<void>;
    rename: (id: number, title: string) => Promise<any>;
    clearMessages: (id: number) => Promise<any>;
  };

  // 消息相关 API
  messages: {
    getByChatId: (chatId: number) => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<void>;
  };

  // 模型相关 API
  models: {
    getAll: () => Promise<any[]>;
    getActive: () => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<void>;
    setActive: (id: number, isActive: boolean) => Promise<any>;
  };

  // 提供商相关 API
  providers: {
    getAll: () => Promise<any[]>;
    getActive: () => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<void>;
    setActive: (id: number, isActive: boolean) => Promise<any>;
  };

  // 设置相关 API
  settings: {
    getAll: () => Promise<Record<string, string>>;
    getByKey: (key: string) => Promise<string>;
    set: (key: string, value: string) => Promise<void>;
  };

  // LLM 相关 API
  llm: {
    chat: (messages: any[], modelParams: any) => Promise<string>;
    streamChat: (messages: any[], modelParams: any) => Promise<any>;
    streamChunk: (callback: (data: any) => void) => () => void;
    abortGeneration: () => Promise<void>;
  };

  // MCP 相关 API
  mcp: {
    connect: (url: string) => Promise<boolean>;
    disconnect: () => Promise<void>;
    isAvailable: () => Promise<boolean>;
    createMCPModel: (modelParams: any) => Promise<any>;
    initialize: () => Promise<any>;
    test: () => Promise<any>; // 添加测试 MCP 集成的 API
  };

  // MCP 服务器管理相关 API
  mcpServers: {
    getAll: () => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<void>;
  };

  // shell 相关 API
  shell: {
    openExternal: (url: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
