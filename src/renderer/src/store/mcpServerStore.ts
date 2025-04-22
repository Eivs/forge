import { create } from 'zustand';

// MCPServer 接口定义
export interface MCPServer {
  id: string | number;
  name: string;
  description?: string;
  type: 'stdio' | 'sse';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  isEnabled: boolean;
  isConnected?: boolean;
  connectionStatus?: string;
}

interface MCPServerState {
  servers: MCPServer[];
  selectedServerId: string | null;
  isLoading: boolean;
  fetchServers: () => Promise<void>;
  selectServer: (serverId: string | null) => void;
  addServer: () => void;
  saveServer: (server: MCPServer) => Promise<boolean>;
  deleteServer: (serverId: string) => Promise<void>;
  testServer: (server: MCPServer) => Promise<boolean>;
  disconnect: (serverId: string) => Promise<void>;
}

export const useMCPServerStore = create<MCPServerState>((set, get) => ({
  servers: [],
  selectedServerId: null,
  isLoading: false,

  // 获取所有 MCP 服务器
  fetchServers: async () => {
    try {
      set({ isLoading: true });
      const mcpServers = await window.electron.mcpServers.getAll();

      if (mcpServers && mcpServers.length > 0) {
        // 处理从数据库返回的数据
        const processedServers = mcpServers.map(server => ({
          ...server,
          args: server.args ? JSON.parse(server.args) : [],
          env: server.env ? JSON.parse(server.env) : {},
        }));

        set({
          servers: processedServers,
          // 如果没有选中的服务器，选择第一个
          selectedServerId: get().selectedServerId || String(processedServers[0].id),
        });
      } else {
        set({ servers: [] });
      }
    } catch (error) {
      console.error('Error loading MCP servers:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 选择服务器
  selectServer: serverId => {
    set({ selectedServerId: serverId });
  },

  // 添加新服务器
  addServer: () => {
    const { servers, selectServer } = get();
    // 创建新的服务器对象，使用临时 ID
    const tempId = `temp-${Date.now()}`;
    const newServer: MCPServer = {
      id: tempId,
      name: `MCP Server ${servers.length + 1}`,
      type: 'stdio',
      isEnabled: true,
      command: '',
      args: [],
      env: {},
      url: '',
      description: '',
    };

    // 添加到列表并选中
    set(state => ({ servers: [...state.servers, newServer] }));
    selectServer(tempId);
  },

  // 保存服务器
  saveServer: async server => {
    try {
      set({ isLoading: true });

      // 先测试连接
      const isConnected = await get().testServer(server);
      if (!isConnected) {
        return false;
      }

      const serverData = {
        ...server,
        args: Array.isArray(server.args) ? server.args : [],
        env: typeof server.env === 'object' ? server.env : {},
      };

      let savedServer;
      // 检查是否为临时 ID
      if (server.id && typeof server.id === 'string' && server.id.startsWith('temp-')) {
        // 创建新服务器
        savedServer = await window.electron.mcpServers.create(serverData);
      } else {
        // 更新现有服务器
        savedServer = await window.electron.mcpServers.update(Number(server.id), serverData);
      }

      // 更新服务器列表
      await get().fetchServers();

      // 保持当前服务器选中状态
      set({ selectedServerId: String(savedServer.id) });

      // 如果启用了连接，尝试连接到 MCP 服务器
      if (server.isEnabled) {
        if (server.type === 'sse') {
          // 对于 SSE 类型，使用 URL
          if (server.url) {
            await window.electron.mcp.connect(server.url);
            const status = await window.electron.mcp.getConnectionStatus();

            // 更新服务器连接状态
            await window.electron.mcpServers.update(Number(savedServer.id), {
              isConnected: true,
              connectionStatus: status,
            });

            // 重新加载服务器列表
            await get().fetchServers();
          }
        } else {
          // 对于 stdio 类型，使用命令
          if (server.command) {
            // 这里需要实现 stdio 类型的连接逻辑
            // 目前只是模拟连接成功
            await window.electron.mcpServers.update(Number(savedServer.id), {
              isConnected: true,
              connectionStatus: 'Connected via stdio',
            });

            // 重新加载服务器列表
            await get().fetchServers();
          }
        }
      } else {
        // 如果禁用了连接，断开连接
        await get().disconnect(savedServer.id.toString());
      }

      return true;
    } catch (error) {
      console.error('Error saving MCP server:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // 删除服务器
  deleteServer: async serverId => {
    try {
      set({ isLoading: true });

      // 先断开连接
      await get().disconnect(serverId);

      // 从数据库中删除服务器
      await window.electron.mcpServers.delete(Number(serverId));

      // 重新加载服务器列表
      await get().fetchServers();

      // 更新选中的服务器
      const { servers } = get();
      if (servers.length > 0) {
        set({ selectedServerId: String(servers[0].id) });
      } else {
        set({ selectedServerId: null });
      }
    } catch (error) {
      console.error('Error deleting MCP server:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 测试服务器连接
  testServer: async server => {
    try {
      set({ isLoading: true });

      // 检查是否为临时服务器（未保存到数据库）
      const isTemporaryServer = typeof server.id === 'string' && server.id.startsWith('temp-');

      const testResult = await window.electron.mcp.testConnect(server);

      if (!testResult.success) {
        return false;
      }

      // 只有已保存的服务器才更新数据库
      if (!isTemporaryServer) {
        await window.electron.mcpServers.update(Number(server.id), {
          isConnected: true,
          connectionStatus: testResult.status || 'Connected',
        });

        // 重新加载服务器列表
        await get().fetchServers();
      }

      return true;
    } catch (error) {
      console.error('Error testing MCP server:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // 断开连接
  disconnect: async serverId => {
    try {
      set({ isLoading: true });

      await window.electron.mcp.disconnect();

      // 更新服务器连接状态
      await window.electron.mcpServers.update(Number(serverId), {
        isConnected: false,
        connectionStatus: '',
      });

      // 重新加载服务器列表
      await get().fetchServers();
    } catch (error) {
      console.error('Error disconnecting from MCP server:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
