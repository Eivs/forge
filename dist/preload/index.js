"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  // 聊天相关 API
  chats: {
    getAll: () => electron.ipcRenderer.invoke("chats:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("chats:getById", id),
    create: (data) => electron.ipcRenderer.invoke("chats:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("chats:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("chats:delete", id),
    rename: (id, title) => electron.ipcRenderer.invoke("chats:rename", id, title)
  },
  // 消息相关 API
  messages: {
    getByChatId: (chatId) => electron.ipcRenderer.invoke("messages:getByChatId", chatId),
    create: (data) => electron.ipcRenderer.invoke("messages:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("messages:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("messages:delete", id)
  },
  // 模型相关 API
  models: {
    getAll: () => electron.ipcRenderer.invoke("models:getAll"),
    getActive: () => electron.ipcRenderer.invoke("models:getActive"),
    create: (data) => electron.ipcRenderer.invoke("models:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("models:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("models:delete", id),
    setActive: (id, isActive) => electron.ipcRenderer.invoke("models:setActive", id, isActive)
  },
  // 提供商相关 API
  providers: {
    getAll: () => electron.ipcRenderer.invoke("providers:getAll"),
    getActive: () => electron.ipcRenderer.invoke("providers:getActive"),
    create: (data) => electron.ipcRenderer.invoke("providers:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("providers:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("providers:delete", id),
    setActive: (id, isActive) => electron.ipcRenderer.invoke("providers:setActive", id, isActive)
  },
  // 设置相关 API
  settings: {
    getAll: () => electron.ipcRenderer.invoke("settings:getAll"),
    getByKey: (key) => electron.ipcRenderer.invoke("settings:getByKey", key),
    set: (key, value) => electron.ipcRenderer.invoke("settings:set", key, value)
  },
  // LLM 相关 API
  llm: {
    chat: (messages, modelParams) => electron.ipcRenderer.invoke("llm:chat", messages, modelParams),
    streamChat: (messages, modelParams) => {
      const { port1, port2 } = new MessageChannel();
      electron.ipcRenderer.invoke("llm:streamChat", { messages, modelParams }).then((result) => {
        if (!result.success) {
          console.error("Stream setup failed");
          port2.postMessage({
            type: "error",
            error: "无法创建流式连接"
          });
          return;
        }
        const { requestId } = result;
        console.log("Stream setup successful, requestId:", requestId);
        const chunkListener = (_, data) => {
          if (data.requestId !== requestId) return;
          console.log("Received chunk, length:", data.fullContent.length);
          port2.postMessage({
            type: "content",
            content: data.fullContent
          });
        };
        const doneListener = (_, data) => {
          if (data.requestId !== requestId) return;
          console.log("Stream completed");
          port2.postMessage({ type: "done", content: data.content });
          electron.ipcRenderer.removeListener("llm:stream-chunk", chunkListener);
          electron.ipcRenderer.removeListener("llm:stream-done", doneListener);
          electron.ipcRenderer.removeListener("llm:stream-error", errorListener);
          setTimeout(() => {
            try {
              port2.close();
            } catch (err) {
              console.error("Error closing port:", err);
            }
          }, 1e3);
        };
        const errorListener = (_, data) => {
          if (data.requestId !== requestId) return;
          console.error("Stream error:", data.error);
          port2.postMessage({ type: "error", error: data.error });
          electron.ipcRenderer.removeListener("llm:stream-chunk", chunkListener);
          electron.ipcRenderer.removeListener("llm:stream-done", doneListener);
          electron.ipcRenderer.removeListener("llm:stream-error", errorListener);
          setTimeout(() => {
            try {
              port2.close();
            } catch (err) {
              console.error("Error closing port:", err);
            }
          }, 1e3);
        };
        electron.ipcRenderer.on("llm:stream-chunk", chunkListener);
        electron.ipcRenderer.on("llm:stream-done", doneListener);
        electron.ipcRenderer.on("llm:stream-error", errorListener);
      }).catch((error) => {
        console.error("Error invoking streamChat:", error);
        port2.postMessage({
          type: "error",
          error: "无法与 LLM 服务通信"
        });
        setTimeout(() => port2.close(), 1e3);
      });
      return port1;
    },
    abortGeneration: () => electron.ipcRenderer.invoke("llm:abortGeneration")
  },
  // MCP 相关 API
  mcp: {
    connect: (url) => electron.ipcRenderer.invoke("mcp:connect", url),
    disconnect: () => electron.ipcRenderer.invoke("mcp:disconnect"),
    isConnected: () => electron.ipcRenderer.invoke("mcp:isConnected"),
    getConnectionStatus: () => electron.ipcRenderer.invoke("mcp:getConnectionStatus"),
    createMCPModel: (modelParams) => electron.ipcRenderer.invoke("mcp:createMCPModel", modelParams)
  }
});
