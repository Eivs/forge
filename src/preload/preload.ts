import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // 聊天相关 API
  chats: {
    getAll: () => ipcRenderer.invoke('chats:getAll'),
    getById: (id: number) => ipcRenderer.invoke('chats:getById', id),
    create: (data: any) => ipcRenderer.invoke('chats:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('chats:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('chats:delete', id),
    rename: (id: number, title: string) => ipcRenderer.invoke('chats:rename', id, title),
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
    streamChat: (messages: any[], modelParams: any) => {
      console.log('Creating stream object');

      // 创建一个 EventEmitter 风格的对象
      const stream = {
        _onmessage: (_?: any) => {},
        set onMessage(handler) {
          console.log('Setting onmessage handler:', handler);
          this._onmessage = handler;
        },
        get onMessage() {
          return this._onmessage;
        },
      };

      // 立即调用主进程的 streamChat 方法
      ipcRenderer
        .invoke('llm:streamChat', { messages, modelParams })
        .then(result => {
          console.log('Stream setup result:', result);
          if (!result.success) {
            if (stream._onmessage) {
              stream._onmessage({
                data: {
                  type: 'error',
                  error: '无法创建流式连接',
                },
              });
            }
            return;
          }

          const { requestId } = result;

          // 设置监听器
          const chunkListener = (_: any, data: any) => {
            if (data.requestId !== requestId) return;
            console.log('Received chunk:', data);
            if (stream._onmessage) {
              stream._onmessage({
                data: {
                  type: 'content',
                  content: data.fullContent,
                },
              });
            }
          };

          const doneListener = (_: any, data: any) => {
            if (data.requestId !== requestId) return;
            if (stream._onmessage) {
              stream._onmessage({
                data: {
                  type: 'done',
                  content: data.content,
                },
              });
            }
            cleanup();
          };

          const errorListener = (_: any, data: any) => {
            if (data.requestId !== requestId) return;
            if (stream._onmessage) {
              stream._onmessage({
                data: {
                  type: 'error',
                  error: data.error,
                },
              });
            }
            cleanup();
          };

          const cleanup = () => {
            ipcRenderer.removeListener('llm:stream-chunk', chunkListener);
            ipcRenderer.removeListener('llm:stream-done', doneListener);
            ipcRenderer.removeListener('llm:stream-error', errorListener);
          };

          ipcRenderer.on('llm:stream-chunk', chunkListener);
          ipcRenderer.on('llm:stream-done', doneListener);
          ipcRenderer.on('llm:stream-error', errorListener);
        })
        .catch(error => {
          console.error('Stream setup error:', error);
          if (stream._onmessage) {
            stream._onmessage({
              data: {
                type: 'error',
                error: '无法与 LLM 服务通信',
              },
            });
          }
        });

      return stream;
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
});
