import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

/**
 * 测试 MCP 集成
 * 这个文件包含一个简单的测试函数，用于验证 MCP 集成是否正常工作
 */

// 测试配置
const apiKey = 'sk-';
const baseURL = 'https://openapi.coreshub.cn/v1';
const modelName = 'DeepSeek-V3';

// MCP 服务器配置
const mcpServers = {
  math: {
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@playwright/mcp@latest'],
    restart: {
      enabled: true,
      maxAttempts: 3,
      delayMs: 1000,
    },
  },
};

// 初始化 MCP 客户端
function initMCPClient(mcpServers: any) {
  try {
    // 创建客户端并连接到服务器
    const client = new MultiServerMCPClient({
      // 全局工具配置选项
      // 是否在工具加载失败时抛出错误（可选，默认：true）
      throwOnLoadError: true,
      // 是否在工具名称前添加服务器名称前缀（可选，默认：true）
      prefixToolNameWithServerName: true,
      // 可选的工具名称附加前缀（可选，默认："mcp"）
      additionalToolNamePrefix: 'mcp',
      mcpServers,
    });

    return client;
  } catch (error) {
    console.error('Initialize MCPClient failed:', error);
    throw error;
  }
}

// 获取 MCP 工具
async function getTools(mcpServers: any) {
  try {
    const client = initMCPClient(mcpServers);
    const tools = await client.getTools();
    if (!tools || tools.length === 0) {
      console.log('No tools found');
      return [];
    } else {
      console.log('Found MCP tools:');
      tools.forEach(tool => console.log(`- ${tool.name}: ${tool.description}`));
      return tools;
    }
  } catch (error) {
    console.error('Error getting tools:', error);
    throw error;
  }
}

// 测试 MCP 集成
export async function testMCPIntegration() {
  try {
    console.log('Testing MCP integration...');

    // 创建 OpenAI 模型
    const model = new ChatOpenAI({
      modelName: modelName,
      temperature: 0.7,
      topP: 0.9,
      streaming: false,
      openAIApiKey: apiKey,
      apiKey,
      timeout: 15000,
      verbose: true,
      configuration: {
        baseURL,
      },
    });

    // 获取 MCP 工具
    console.log('Getting MCP tools...');
    const tools = await getTools(mcpServers);

    if (tools.length === 0) {
      console.error('No MCP tools found, cannot create agent');
      return { success: false, error: 'No MCP tools found' };
    }

    // 创建 ReAct 代理
    console.log('Creating ReAct agent...');
    const agent = createReactAgent({
      llm: model,
      tools,
    });

    // 运行代理
    console.log('Running agent...');
    const response = await agent.invoke({
      messages: [{ role: 'user', content: '用浏览器打开青云控制台，查看青云控制台的使用说明' }],
    });

    // 记录完整响应
    console.log('Agent response:', JSON.stringify(response, null, 2));

    // 提取助手消息
    let assistantMessage = '';
    if (Array.isArray(response)) {
      // 如果响应是数组，查找助手消息
      for (let i = response.length - 1; i >= 0; i--) {
        const message = response[i];
        if ((message.role === 'assistant' || message.type === 'ai') && message.content) {
          assistantMessage = message.content;
          break;
        }
      }
    } else if (response.messages) {
      // 如果响应包含 messages 数组
      const messages = response.messages;
      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        if ((message.role === 'assistant' || message.type === 'ai') && message.content) {
          assistantMessage = message.content;
          break;
        }
      }
    }

    return {
      success: true,
      response,
      assistantMessage,
    };
  } catch (error) {
    console.error('Error during agent execution:', error);
    // 工具抛出 ToolException 表示工具特定错误
    if ((error as any).name === 'ToolException') {
      console.error('Tool execution failed:', (error as any).message);
    }
    return { success: false, error };
  }
}

// 导出测试函数
export default testMCPIntegration;
