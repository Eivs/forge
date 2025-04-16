// 注意：这里的类型定义仅用于 window.electron 接口
// 实际应用中的类型定义在 src/renderer/src/store/chatStore.ts 中

interface Window {
  requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback: (handle: number) => void;
  electron: {
    // 聊天相关 API
    chats: {
      getAll: () => Promise<any[]>;
      getById: (id: number) => Promise<any>;
      create: (data: any) => Promise<any>;
      update: (id: number, data: any) => Promise<any>;
      delete: (id: number) => Promise<void>;
      rename: (id: number, title: string) => Promise<any>;
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
      getAll: () => Promise<{ key: string; value: string }[]>;
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
      isConnected: () => Promise<boolean>;
      getConnectionStatus: () => Promise<'connected' | 'disconnected' | 'error'>;
      createMCPModel: (modelParams: any) => Promise<any>;
    };
  };
}

interface IdleRequestCallback {
  (deadline: IdleDeadline): void;
}

interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
}
