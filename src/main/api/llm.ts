import { ipcMain } from 'electron';
import { ChatOpenAI } from '@langchain/openai';
import { randomUUID } from 'crypto';
import { getDatabase } from '../database';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

// 存储正在进行的 LLM 生成任务的中止控制器映射
const abortControllers = new Map<string, AbortController>();
const defaultSystemPrompt = 'You are a helpful assistant.';

/**
 * 根据模型 ID 获取 LLM 模型
 * @param modelId 模型 ID
 * @param temperature 模型温度
 * @param topP 模型 top-p
 * @param streaming 是否流式传输
 */
async function getLLMModel(
  modelId: number,
  temperature: number,
  topP: number,
  streaming: boolean = false
) {
  console.log(
    `Getting LLM model with ID ${modelId}, temperature ${temperature}, topP ${topP}, streaming ${streaming}`
  );
  const prisma = getDatabase();

  const model = await prisma.model.findUnique({
    where: { id: modelId },
    include: { provider: true },
  });

  if (!model) {
    throw new Error(`Model with ID ${modelId} not found`);
  }

  console.log(`Found model: ${model.name}, provider: ${model.provider.name}`);

  // 直接使用数据库中存储的 API 密钥
  const apiKey = model.provider.apiKey;

  if (!apiKey) {
    console.error(`API key for provider ${model.provider.name} not found. `);
    console.log('Using default API key for development');
    return new ChatOpenAI({
      modelName: model.name,
      temperature,
      topP,
      streaming,
      openAIApiKey: 'sk-dummy-key-for-development',
      configuration: {
        baseURL: model.provider.baseUrl,
      },
    });
  }

  switch (model.provider.name) {
    case 'OpenAI':
      return new ChatOpenAI({
        modelName: model.name,
        temperature,
        topP,
        streaming,
        openAIApiKey: apiKey,
        configuration: {
          baseURL: model.provider.baseUrl,
        },
      });

    // 根据需要添加其他提供商的处理
    default:
      console.log(
        `Using {model.provider.name} API with baseURL: ${model.provider.baseUrl}, apiKey: ${apiKey ? 'set' : 'not set'}`
      );
      return new ChatOpenAI({
        modelName: model.name,
        temperature,
        topP,
        streaming,
        openAIApiKey: apiKey,
        configuration: {
          baseURL: model.provider.baseUrl,
        },
      });
  }
}

/**
 * 将消息格式化为 LangChain 兼容格式
 * @param messages 要格式化的消息数组
 */
function formatMessagesForLLM(messages: any[]) {
  console.log('Formatting messages for LLM:', JSON.stringify(messages, null, 2));

  // 确保至少有一条消息
  if (!messages || messages.length === 0) {
    console.warn('No messages to format, returning default system message');
    return [new SystemMessage(defaultSystemPrompt)];
  }

  // 检查是否有系统消息，如果没有，添加一个
  const hasSystemMessage = messages.some(msg => msg.role === 'system');
  const formattedMessages = [];

  if (!hasSystemMessage) {
    formattedMessages.push(new SystemMessage(defaultSystemPrompt));
  }

  // 格式化其余消息
  const converted = messages.map(msg => {
    // 转换为 LangChain 消息格式
    switch (msg.role) {
      case 'user':
        return new HumanMessage(msg.content);
      case 'assistant':
        return new AIMessage(msg.content);
      case 'system':
        return new SystemMessage(msg.content);
      default:
        console.warn(`Unknown message role: ${msg.role}, treating as human`);
        return new HumanMessage(msg.content);
    }
  });

  formattedMessages.push(...converted);
  console.log('Formatted messages:', formattedMessages);

  // 尝试强制转换为兼容的格式
  try {
    return formattedMessages;
  } catch (error) {
    console.error('Error converting messages:', error);
    // 如果转换失败，返回原始消息
    return formattedMessages;
  }
}

export function setupLLMHandlers() {
  // 处理非流式聊天完成
  ipcMain.handle('llm:chat', async (_, messages: any[], modelParams: any) => {
    const { modelId, temperature, topP } = modelParams;

    try {
      const model = await getLLMModel(modelId, temperature, topP);

      // 将消息格式化为 LangChain 格式
      const formattedMessages = formatMessagesForLLM(messages);

      // 生成完成响应
      // @ts-expect-error Disable type checking for now
      const response = await model.invoke(formattedMessages);

      return response.content;
    } catch (error) {
      console.error('Error in LLM chat:', error);
      throw error;
    }
  });

  // 处理流式聊天请求
  ipcMain.handle('llm:streamChat', async (event, { messages, modelParams }) => {
    const { modelId, temperature, topP } = modelParams;
    console.log(`Received stream chat request with modelId: ${modelId}`);

    // 创建一个中止控制器
    const abortController = new AbortController();
    const requestId = randomUUID();
    abortControllers.set(requestId, abortController);

    try {
      const model = await getLLMModel(modelId, temperature, topP, true);
      console.log(`Got model for streaming:`, model?.lc_kwargs);
      const formattedMessages = formatMessagesForLLM(messages);

      // 使用中止信号创建流
      // @ts-expect-error Disable type checking for now
      const stream = await model.stream(formattedMessages, {
        signal: abortController.signal,
      });

      let fullContent = '';

      // 处理流式响应
      for await (const chunk of stream) {
        if (chunk.content) {
          fullContent += chunk.content;
          // 将每个块发送到渲染进程
          event.sender.send(`llm:stream-chunk`, {
            requestId,
            content: chunk.content,
            fullContent: fullContent,
          });
        }
      }

      // 发送完成信号
      event.sender.send('llm:stream-chunk', {
        requestId,
        content: fullContent,
        done: true,
      });
      console.log('Stream done:', fullContent);

      // 清理中止控制器
      abortControllers.delete(requestId);

      console.log('Stream completed successfully');
      return { success: true, requestId };
    } catch (error: any) {
      console.error('Error in LLM stream chat:', error);

      // 发送错误信息
      event.sender.send('llm:stream-chunk', {
        requestId,
        error: error?.message || 'Unknown error',
      });

      // 清理中止控制器
      abortControllers.delete(requestId);

      return { success: false, requestId };
    }
  });

  // 处理中止生成
  ipcMain.handle('llm:abortGeneration', async () => {
    for (const controller of abortControllers.values()) {
      controller.abort();
    }
    abortControllers.clear();
  });
}
