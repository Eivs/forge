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
  isAvailable?: boolean;
}

interface MCPServerState {
  servers: MCPServer[];
  selectedServerId: string | null;
  isLoading: boolean;
  isTesting: boolean;
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
  isTesting: false,

  // 获取所有 MCP 服务器
  fetchServers: async () => {
    try {
      if (!get().isLoading) set({ isLoading: true });
      const mcpServers = await window.electron.mcpServers.getAll();

      if (mcpServers && mcpServers.length > 0) {
        // 处理从数据库返回的数据
        const processedServers = mcpServers.map(server => ({
          ...server,
          args: server.args ? JSON.parse(server.args) : [],
          env: server.env ? JSON.parse(server.env) : {},
        }));

        // 检查当前选中的服务器是否还存在
        let selectedId: string | null = null;
        const currentSelectedId = get().selectedServerId;
        if (processedServers.length > 0) {
          const serverExists = processedServers.some(ser => String(ser.id) === currentSelectedId);
          if (serverExists) {
            selectedId = currentSelectedId;
          }
        }

        set({
          servers: processedServers,
          selectedServerId: selectedId,
        });
      } else {
        set({ servers: [], selectedServerId: null });
      }
    } catch (error) {
      console.error('Error loading MCP servers:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 选择服务器
  selectServer: serverId => {
    console.log(serverId);
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
      let testResult;
      if (server.isEnabled && !server.isAvailable) {
        testResult = await window.electron.mcp.testConnect(server);
        console.log(testResult);
      }

      const serverData = {
        ...server,
        args: Array.isArray(server.args) ? server.args : [],
        env: typeof server.env === 'object' ? server.env : {},
        isAvailable: testResult?.success || false,
      };

      console.log(testResult);

      let savedServer;
      // 检查是否为临时 ID
      if (server.id && typeof server.id === 'string' && server.id.startsWith('temp-')) {
        // 创建新服务器
        savedServer = await window.electron.mcpServers.create(serverData);
      } else {
        // 更新现有服务器
        savedServer = await window.electron.mcpServers.update(Number(server.id), serverData);
      }

      // 保持当前服务器选中状态
      set({ selectedServerId: String(savedServer.id) });
      // 重新加载服务器列表
      await get().fetchServers();
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
      console.log(serverId);

      if (serverId?.startsWith('temp-')) {
        set(state => ({
          servers: state.servers.filter(s => String(s.id) !== serverId),
        }));
        return;
      }
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
      set({ isLoading: true, isTesting: true });

      // 检查是否为临时服务器（未保存到数据库）
      const isTemporaryServer = typeof server.id === 'string' && server.id.startsWith('temp-');

      const testResult = await window.electron.mcp.testConnect(server);

      // 只有已保存的服务器才更新数据库
      if (!isTemporaryServer) {
        await window.electron.mcpServers.update(Number(server.id), {
          isAvailable: testResult.success,
        });
        // 重新加载服务器列表
        // await get().fetchServers();
      }
      set(state => ({
        servers: state.servers.map(s =>
          s.id === server.id ? { ...server, isAvailable: testResult.success } : s
        ),
      }));

      return testResult.success;
    } catch (error) {
      console.error('Error testing MCP server:', error);
      return false;
    } finally {
      set({ isLoading: false, isTesting: false });
    }
  },

  // 断开连接
  disconnect: async serverId => {
    try {
      set({ isLoading: true });

      await window.electron.mcp.disconnect();

      // 重新加载服务器列表
      await get().fetchServers();
    } catch (error) {
      console.error('Error disconnecting from MCP server:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
