import { contextBridge, ipcRenderer } from 'electron';

// 在 Electron 的渲染进程中，通过 contextBridge.exposeInMainWorld 方法将 API 暴露给渲染进程
contextBridge.exposeInMainWorld('electron', {
  // 聊天相关 API
  chats: {
    getAll: () => ipcRenderer.invoke('chats:getAll'),
    getById: (id: number) => ipcRenderer.invoke('chats:getById', id),
    create: (data: any) => ipcRenderer.invoke('chats:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('chats:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('chats:delete', id),
    rename: (id: number, title: string) => ipcRenderer.invoke('chats:rename', id, title),
    clearMessages: (id: number) => ipcRenderer.invoke('chats:clearMessages', id),
  },

  // 消息相关 API
  messages: {
    getByChatId: (chatId: number) => ipcRenderer.invoke('messages:getByChatId', chatId),
    create: (data: any) => ipcRenderer.invoke('messages:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('messages:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('messages:delete', id),
  },

  // 模型相关 API
  models: {
    getAll: () => ipcRenderer.invoke('models:getAll'),
    getActive: () => ipcRenderer.invoke('models:getActive'),
    create: (data: any) => ipcRenderer.invoke('models:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('models:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('models:delete', id),
    setActive: (id: number, isActive: boolean) =>
      ipcRenderer.invoke('models:setActive', id, isActive),
  },

  // 提供商相关 API
  providers: {
    getAll: () => ipcRenderer.invoke('providers:getAll'),
    getActive: () => ipcRenderer.invoke('providers:getActive'),
    create: (data: any) => ipcRenderer.invoke('providers:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('providers:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('providers:delete', id),
    setActive: (id: number, isActive: boolean) =>
      ipcRenderer.invoke('providers:setActive', id, isActive),
  },

  // 设置相关 API
  settings: {
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    getByKey: (key: string) => ipcRenderer.invoke('settings:getByKey', key),
    set: (key: string, value: string) => ipcRenderer.invoke('settings:set', key, value),
  },

  // LLM 相关 API
  llm: {
    // 非流式对话
    chat: (messages: any[], modelParams: any) =>
      ipcRenderer.invoke('llm:chat', messages, modelParams),
    // 流式对话
    streamChat: async (messages: any[], modelParams: any) => {
      try {
        // 发起请求前设置监听器
        const result = await ipcRenderer.invoke('llm:streamChat', { messages, modelParams });
        const { success } = result;

        if (!success) {
          return {
            type: 'error' as const,
            error: 'Unable to communicate with the LLM service',
          };
        }
        return {
          type: 'content' as const,
          ...result,
        };
      } catch (error) {
        console.error('Stream setup error:', error);
        return {
          type: 'error' as const,
          error: 'Unable to communicate with the LLM service',
        };
      }
    },
    streamChunk: (callback: (data: any) => void) => {
      const handleChunk = (_: any, data: any) => {
        callback({
          type: data.error ? 'error' : 'content',
          ...data,
        });
      };

      // 添加监听器
      ipcRenderer.on('llm:stream-chunk', handleChunk);

      // 返回清理函数，只移除特定的监听器
      return () => {
        ipcRenderer.removeListener('llm:stream-chunk', handleChunk);
      };
    },
    abortGeneration: () => ipcRenderer.invoke('llm:abortGeneration'),
  },

  // MCP 相关 API
  mcp: {
    connect: (url: string) => ipcRenderer.invoke('mcp:connect', url),
    disconnect: () => ipcRenderer.invoke('mcp:disconnect'),
    isConnected: () => ipcRenderer.invoke('mcp:isConnected'),
    getConnectionStatus: () => ipcRenderer.invoke('mcp:getConnectionStatus'),
    createMCPModel: (modelParams: any) => ipcRenderer.invoke('mcp:createMCPModel', modelParams),
  },

  // MCP 服务器相关 API
  mcpServers: {
    getAll: () => ipcRenderer.invoke('mcpServers:getAll'),
    getById: (id: number) => ipcRenderer.invoke('mcpServers:getById', id),
    create: (data: any) => ipcRenderer.invoke('mcpServers:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('mcpServers:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('mcpServers:delete', id),
  },

  // shell 相关 API
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  },
});
