import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { MultiServerMCPClient, loadMcpTools } from '@langchain/mcp-adapters';
import { getDatabase } from '../database';

// 全局 MCP 客户端实例
let multiServerClient: MultiServerMCPClient | null = null;
let sseClient: Client | null = null;
let connectionStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
let mcpTools: any[] = [];

// 初始化 MCP 客户端
async function initializeMultiServerClient() {
  try {
    // 获取所有启用的 MCP 服务器
    const prisma = getDatabase();
    const mcpServers = await prisma.mCPServer.findMany({
      where: {
        isEnabled: true,
      },
    });

    if (mcpServers.length === 0) {
      console.log('No enabled MCP servers found');
      return null;
    }

    // 构建 MultiServerMCPClient 配置
    const mcpConfig: any = {
      // 全局工具配置选项
      throwOnLoadError: true,
      prefixToolNameWithServerName: true,
      additionalToolNamePrefix: 'mcp',
      mcpServers: {},
    };

    // 为每个服务器添加配置
    mcpServers.forEach(server => {
      const serverName = server.name.replace(/\s+/g, '_').toLowerCase();

      if (server.type === 'stdio' && server.command) {
        mcpConfig.mcpServers[serverName] = {
          transport: 'stdio',
          command: server.command,
          args: server.args ? JSON.parse(server.args) : [],
          restart: {
            enabled: true,
            maxAttempts: 3,
            delayMs: 1000,
          },
        };

        // 如果有环境变量，添加到配置中
        if (server.env) {
          mcpConfig.mcpServers[serverName].env = JSON.parse(server.env);
        }
      } else if (server.type === 'sse' && server.url) {
        mcpConfig.mcpServers[serverName] = {
          transport: 'sse',
          url: server.url,
          reconnect: {
            enabled: true,
            maxAttempts: 5,
            delayMs: 2000,
          },
        };
      }
    });

    // 创建 MultiServerMCPClient 实例
    const client = new MultiServerMCPClient(mcpConfig);

    // 加载所有工具
    const tools = await client.getTools();
    mcpTools = tools;

    console.log(`Loaded ${tools.length} MCP tools`);
    connectionStatus = 'connected';

    return client;
  } catch (error) {
    console.error('Error initializing MultiServerMCPClient:', error);
    connectionStatus = 'error';
    throw error;
  }
}

export function setupMCPHandlers() {
  // 连接到 MCP 服务器 (SSE 模式)
  ipcMain.handle('mcp:connect', async (_: IpcMainInvokeEvent, url: string) => {
    try {
      // 断开现有连接
      if (sseClient) {
        await sseClient.close();
        sseClient = null;
      }

      console.log(`Connecting to MCP server at ${url}`);

      // 创建 SSE 客户端
      const transport = new SSEClientTransport(new URL(url));

      // 初始化客户端
      sseClient = new Client({
        name: 'forge-ai-assistant',
        version: '1.0.0',
      });

      // 连接到服务器
      await sseClient.connect(transport);

      // 加载工具
      const tools = await loadMcpTools('sse-server', sseClient, {
        throwOnLoadError: true,
        prefixToolNameWithServerName: true,
        additionalToolNamePrefix: 'mcp',
      });

      // 添加到全局工具列表
      mcpTools = [...mcpTools, ...tools];

      connectionStatus = 'connected';
      return true;
    } catch (error: any) {
      console.error('Error connecting to MCP server:', error);
      connectionStatus = 'error';
      throw error;
    }
  });

  // 断开 MCP 服务器连接
  ipcMain.handle('mcp:disconnect', async () => {
    try {
      // 断开 SSE 客户端连接
      if (sseClient) {
        await sseClient.close();
        sseClient = null;
      }

      // 断开 MultiServerMCPClient 连接
      if (multiServerClient) {
        await multiServerClient.close();
        multiServerClient = null;
      }

      // 清空工具列表
      mcpTools = [];
      connectionStatus = 'disconnected';
      return true;
    } catch (error: any) {
      console.error('Error disconnecting from MCP server:', error);
      throw error;
    }
  });

  // 检查是否已连接到 MCP 服务器
  ipcMain.handle('mcp:isConnected', () => {
    return (!!sseClient || !!multiServerClient) && connectionStatus === 'connected';
  });

  // 获取 MCP 连接状态
  ipcMain.handle('mcp:getConnectionStatus', () => {
    return connectionStatus;
  });

  // 创建使用 MCP 上下文的 LLM
  ipcMain.handle('mcp:createMCPModel', async (_: IpcMainInvokeEvent, _modelParams: any) => {
    if (!sseClient && !multiServerClient) {
      // 尝试初始化 MultiServerMCPClient
      multiServerClient = await initializeMultiServerClient();

      if (!multiServerClient) {
        throw new Error('MCP client not connected');
      }

      // 加载工具
      mcpTools = await multiServerClient.getTools();
    }

    try {
      // 返回工具列表，供 LLM API 使用
      return {
        success: true,
        tools: mcpTools,
      };
    } catch (error: any) {
      console.error('Error creating MCP model:', error);
      throw error;
    }
  });

  // 初始化 MCP 客户端
  ipcMain.handle('mcp:initialize', async () => {
    try {
      // 初始化 MultiServerMCPClient
      multiServerClient = await initializeMultiServerClient();

      if (multiServerClient) {
        return { success: true };
      } else {
        return { success: false, message: 'No enabled MCP servers found' };
      }
    } catch (error: any) {
      console.error('Error initializing MCP client:', error);
      return { success: false, message: error.message };
    }
  });
}

// 导出 MCP 工具列表，供其他模块使用
export function getMCPTools() {
  return mcpTools;
}

// 导出 MultiServerMCPClient 实例，供其他模块使用
export function getMultiServerClient() {
  return multiServerClient;
}

// 导出 SSE 客户端实例，供其他模块使用
export function getSSEClient() {
  return sseClient;
}
