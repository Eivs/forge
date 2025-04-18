import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { MultiServerMCPClient, loadMcpTools } from '@langchain/mcp-adapters';
import { getDatabase } from '../database';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import testMCPIntegration from './mcpTest';

// 全局 MCP 客户端实例
let multiServerClient: MultiServerMCPClient | null = null;
let sseClient: Client | null = null;
let connectionStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
let mcpTools: any[] = [];

// 获取系统 Node.js 路径
function getNodePath() {
  try {
    // 尝试使用 which 命令获取 node 路径
    const nodePath = execSync('which node').toString().trim();
    if (nodePath && existsSync(nodePath)) {
      console.log(`Found Node.js path: ${nodePath}`);
      return nodePath;
    }
  } catch (error) {
    console.warn('Could not determine Node.js path using which command:', error);
  }

  console.warn('Could not find Node.js path, using default "node"');
  return process.execPath;
}

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

    // 获取 Node.js 路径
    const nodePath = getNodePath();

    // 构建 MultiServerMCPClient 配置
    const mcpConfig: any = {
      // 全局工具配置选项
      throwOnLoadError: false, // 改为 false 以避免单个服务器错误导致整个客户端失败
      prefixToolNameWithServerName: true,
      additionalToolNamePrefix: 'mcp',
      mcpServers: {},
    };

    // 为每个服务器添加配置
    mcpServers.forEach(server => {
      const serverName = server.name.replace(/\s+/g, '_').toLowerCase();

      if (server.type === 'stdio' && server.command) {
        // 构建基本配置
        const serverConfig: any = {
          transport: 'stdio',
          command: server.command,
          args: server.args ? JSON.parse(server.args) : [],
          restart: {
            enabled: true,
            maxAttempts: 3,
            delayMs: 1000,
          },
        };

        // 添加环境变量
        let env: Record<string, string> = {};
        if (server.env) {
          try {
            env = JSON.parse(server.env);
          } catch (error) {
            console.error(`Error parsing env for server ${serverName}:`, error);
          }
        }

        // 确保 PATH 环境变量包含 Node.js 路径
        const nodeBinDir = nodePath.substring(0, nodePath.lastIndexOf('/'));
        env.PATH = env.PATH ? `${nodeBinDir}:${env.PATH}` : nodeBinDir;

        // 添加 NODE_PATH 环境变量
        if (!env.NODE_PATH) {
          env.NODE_PATH = process.env.NODE_PATH || nodePath;
        }

        // 添加 SHELL 环境变量以确保 sh 命令可用
        if (!env.SHELL) {
          env.SHELL = process.env.SHELL || '/bin/sh';
        }

        // 如果命令是 npx 或 uvx，确保使用完整路径
        if (server.command === 'npx' || server.command === 'uvx') {
          const npmBinPath = execSync('which ' + server.command)
            .toString()
            .trim();
          if (npmBinPath) {
            serverConfig.command = npmBinPath;
          }
        }

        serverConfig.env = env;
        mcpConfig.mcpServers[serverName] = serverConfig;

        console.log(`Configured stdio server ${serverName}:`, {
          command: serverConfig.command,
          args: serverConfig.args,
          env: {
            PATH: serverConfig.env.PATH,
            NODE_PATH: serverConfig.env.NODE_PATH,
            SHELL: serverConfig.env.SHELL,
          },
        });
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
        console.log(`Configured SSE server ${serverName}: ${server.url}`);
      }
    });

    console.log('Creating MultiServerMCPClient with config:', JSON.stringify(mcpConfig, null, 2));

    // 创建 MultiServerMCPClient 实例
    const client = new MultiServerMCPClient(mcpConfig);

    // 加载所有工具
    console.log('Loading MCP tools...');
    const tools = await client.getTools();
    mcpTools = tools;
    mcpTools.forEach(tool => {
      console.log(`Loaded tool: ${tool.name}`);
    });
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
  // 测试 MCP 集成
  ipcMain.handle('mcp:test', async () => {
    try {
      const result = await testMCPIntegration();
      return result;
    } catch (error: any) {
      console.error('Error testing MCP integration:', error);
      return { success: false, error: error.message };
    }
  });

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
