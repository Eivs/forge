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
    setActive: (id: number, isActive: boolean) => ipcRenderer.invoke('models:setActive', id, isActive),
  },

  // 提供商相关 API
  providers: {
    getAll: () => ipcRenderer.invoke('providers:getAll'),
    getActive: () => ipcRenderer.invoke('providers:getActive'),
    create: (data: any) => ipcRenderer.invoke('providers:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('providers:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('providers:delete', id),
    setActive: (id: number, isActive: boolean) => ipcRenderer.invoke('providers:setActive', id, isActive),
  },

  // 设置相关 API
  settings: {
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    getByKey: (key: string) => ipcRenderer.invoke('settings:getByKey', key),
    set: (key: string, value: string) => ipcRenderer.invoke('settings:set', key, value),
  },

  // LLM 相关 API
  llm: {
    chat: (messages: any[], modelParams: any) => ipcRenderer.invoke('llm:chat', messages, modelParams),
    streamChat: (messages: any[], modelParams: any) => {
      // 创建一个新的 MessageChannel 用于与渲染进程通信
      const { port1, port2 } = new MessageChannel();

      // 调用主进程的 streamChat 方法
      ipcRenderer.invoke('llm:streamChat', { messages, modelParams })
        .then(result => {
          if (!result.success) {
            console.error('Stream setup failed');
            port2.postMessage({
              type: 'error',
              error: '无法创建流式连接'
            });
            return;
          }

          const { requestId } = result;
          console.log('Stream setup successful, requestId:', requestId);

          // 设置监听器来接收流式响应
          const chunkListener = (_: any, data: any) => {
            if (data.requestId !== requestId) return;

            console.log('Received chunk, length:', data.fullContent.length);
            port2.postMessage({
              type: 'content',
              content: data.fullContent
            });
          };

          const doneListener = (_: any, data: any) => {
            if (data.requestId !== requestId) return;

            console.log('Stream completed');
            port2.postMessage({ type: 'done', content: data.content });

            // 移除监听器
            ipcRenderer.removeListener('llm:stream-chunk', chunkListener);
            ipcRenderer.removeListener('llm:stream-done', doneListener);
            ipcRenderer.removeListener('llm:stream-error', errorListener);

            // 关闭端口
            setTimeout(() => {
              try {
                port2.close();
              } catch (err) {
                console.error('Error closing port:', err);
              }
            }, 1000);
          };

          const errorListener = (_: any, data: any) => {
            if (data.requestId !== requestId) return;

            console.error('Stream error:', data.error);
            port2.postMessage({ type: 'error', error: data.error });

            // 移除监听器
            ipcRenderer.removeListener('llm:stream-chunk', chunkListener);
            ipcRenderer.removeListener('llm:stream-done', doneListener);
            ipcRenderer.removeListener('llm:stream-error', errorListener);

            // 关闭端口
            setTimeout(() => {
              try {
                port2.close();
              } catch (err) {
                console.error('Error closing port:', err);
              }
            }, 1000);
          };

          // 添加监听器
          ipcRenderer.on('llm:stream-chunk', chunkListener);
          ipcRenderer.on('llm:stream-done', doneListener);
          ipcRenderer.on('llm:stream-error', errorListener);
        })
        .catch(error => {
          console.error('Error invoking streamChat:', error);
          port2.postMessage({
            type: 'error',
            error: '无法与 LLM 服务通信'
          });

          setTimeout(() => port2.close(), 1000);
        });

      return port1;
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
  }
});
