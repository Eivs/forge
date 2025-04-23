import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { MultiServerMCPClient, loadMcpTools } from '@langchain/mcp-adapters';
import { getDatabase } from '../database';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

// 全局 MCP 客户端实例
let multiServerClient: MultiServerMCPClient | null = null;
let sseClient: Client | null = null;
let connectionStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
let mcpTools: any[] = [];

/**
 * 获取系统中的可执行文件路径
 * @param command 要查找的命令
 * @param defaultPath 如果找不到命令时的默认路径
 * @returns 命令的完整路径
 */
function getExecutablePath(command: string, defaultPath?: string): string {
  try {
    // 尝试使用 which 命令获取路径
    const path = execSync(`which ${command}`).toString().trim();
    if (path && existsSync(path)) {
      console.log(`Found ${command} path: ${path}`);
      return path;
    }
  } catch (error) {
    console.warn(`Could not determine ${command} path using which command:`, error);
  }

  if (command === 'node' && !defaultPath) {
    console.warn('Could not find Node.js path, using process.execPath');
    return process.execPath;
  }

  console.warn(`Could not find ${command} path, using default "${defaultPath || command}"`);
  return defaultPath || command;
}

/**
 * 获取 Node.js 路径
 * @returns Node.js 的完整路径
 */
function getNodePath(): string {
  return getExecutablePath('node');
}

/**
 * 准备执行环境变量
 * @param env 原始环境变量对象
 * @returns 增强后的环境变量对象
 */
function prepareEnvironment(env: Record<string, string> = {}): Record<string, string> {
  const enhancedEnv = { ...env };

  // 获取 Node.js 路径
  const nodePath = getNodePath();

  // 确保 PATH 环境变量包含 Node.js 路径
  const nodeBinDir = nodePath.substring(0, nodePath.lastIndexOf('/'));
  enhancedEnv.PATH = process.env.PATH ? `${nodeBinDir}:${process.env.PATH}` : nodeBinDir;

  // 添加 NODE_PATH 环境变量
  if (!enhancedEnv.NODE_PATH) {
    enhancedEnv.NODE_PATH = process.env.NODE_PATH || nodePath;
  }

  // 添加 SHELL 环境变量以确保 sh 命令可用
  if (!enhancedEnv.SHELL) {
    enhancedEnv.SHELL = process.env.SHELL || '/bin/sh';
  }

  return enhancedEnv;
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

    // 初始化配置

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
        // 解析参数和环境变量
        let args = [];
        let env = {};

        try {
          args = server.args ? JSON.parse(server.args) : [];
        } catch (error) {
          console.error(`Error parsing args for server ${serverName}:`, error);
        }

        try {
          env = server.env ? JSON.parse(server.env) : {};
        } catch (error) {
          console.error(`Error parsing env for server ${serverName}:`, error);
        }

        // 准备环境变量
        const enhancedEnv = prepareEnvironment(env);

        // 如果命令是 npx 或 uvx，确保使用完整路径
        const finalCommand = ['npx', 'uvx'].includes(server.command)
          ? getExecutablePath(server.command, server.command)
          : server.command;

        // 构建服务器配置
        const serverConfig = {
          transport: 'stdio',
          command: finalCommand,
          args,
          env: enhancedEnv,
          restart: {
            enabled: true,
            maxAttempts: 3,
            delayMs: 1000,
          },
        };

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
  // 测试 MCP 连接
  ipcMain.handle('mcp:testConnect', async (_: IpcMainInvokeEvent, serverConfig: any) => {
    let testClient;
    try {
      const { type: serverType, url, command, args = [], env = {} } = serverConfig;

      if (!serverType) {
        throw new Error('Server type is required');
      }

      // 创建测试客户端
      testClient = new Client({
        name: 'forge-ai-assistant-test',
        version: '1.0.0',
      });

      let transport;

      if (serverType === 'sse') {
        if (!url) {
          throw new Error('URL is required for SSE server');
        }
        console.log(`Testing connection to SSE MCP server at ${url}`);
        transport = new SSEClientTransport(new URL(url));
      } else if (serverType === 'stdio') {
        if (!command) {
          throw new Error('Command is required for stdio server');
        }

        const finalCommand = ['npx', 'uvx'].includes(command)
          ? getExecutablePath(command, command)
          : command;

        const preparedEnv = prepareEnvironment(env);

        console.log('Testing stdio server with:', {
          command: finalCommand,
          args,
          env: preparedEnv,
        });

        transport = new StdioClientTransport({
          command: finalCommand,
          args,
          env: preparedEnv,
        });
      } else {
        throw new Error(`Unsupported server type: ${serverType}`);
      }

      // 统一的连接测试逻辑
      await testClient.connect(transport);
      const mcpServer = (await testClient.listTools()) || [];

      return {
        success: true,
        status: `${serverType} connection successful`,
        tools: mcpServer.tools,
      };
    } catch (error: any) {
      console.error('Error testing connection to MCP server:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to MCP server',
      };
    } finally {
      // 确保在任何情况下都尝试关闭客户端
      if (testClient) {
        try {
          await testClient.close();
        } catch (closeError) {
          console.warn('Error closing test client:', closeError);
        }
      }
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

  // 检查 MCP 服务器状态
  ipcMain.handle('mcp:isAvailable', () => {
    return (!!sseClient || !!multiServerClient) && connectionStatus === 'connected';
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
