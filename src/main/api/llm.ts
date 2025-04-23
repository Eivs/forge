import { ipcMain } from 'electron';
import { ChatOpenAI } from '@langchain/openai';
import { randomUUID } from 'crypto';
import { getDatabase } from '../database';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { getMCPTools } from './mcp';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

// 存储正在进行的 LLM 生成任务的中止控制器映射
const abortControllers = new Map<string, AbortController>();
const defaultSystemPrompt = `You are a helpful assistant. today is ${new Date().toLocaleDateString()}`;

/**
 * 根据模型 ID 获取 LLM 模型
 * @param modelId 模型 ID
 * @param temperature 模型温度
 * @param topP 模型 top-p
 * @param streaming 是否流式传输
 * @param useMCP 是否使用 MCP 工具
 */
async function getLLMModel(
  modelId: number,
  temperature: number,
  topP: number,
  maxTokens?: number | null,
  streaming: boolean = false,
  useMCP: boolean = false
) {
  console.log(
    `Getting LLM model with ID ${modelId}, temperature ${temperature}, topP ${topP}, maxTokens ${maxTokens}, streaming ${streaming}, useMCP ${useMCP}`
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
    throw new Error(`API key for provider ${model.provider.name} not found. `);
  }

  // 创建基本配置
  const config: any = {
    modelName: model.name,
    temperature,
    topP,
    streaming,
    openAIApiKey: apiKey,
    apiKey,
    timeout: 15000,
    verbose: process.env.NODE_ENV === 'development' ? true : false,
    maxTokens,
    configuration: {
      baseURL: model.provider.baseUrl,
    },
  };

  // 创建 LLM 模型实例
  let llmModel;
  switch (model.provider.name.toLowerCase()) {
    case 'openai':
      llmModel = new ChatOpenAI(config);
      break;
    // TODO: 根据需要添加其他提供商的处理

    default:
      console.log(
        `Using ${model.provider.name} API with baseURL: ${model.provider.baseUrl}, apiKey: ${apiKey ? 'set' : 'not set'}`
      );
      llmModel = new ChatOpenAI(config);
      break;
  }

  // 如果需要使用 MCP 工具，则创建 ReAct 代理
  if (useMCP) {
    const mcpTools = getMCPTools();
    if (mcpTools && mcpTools.length > 0) {
      console.log(`Creating ReAct agent with ${mcpTools.length} MCP tools`);
      try {
        // 创建 ReAct 代理
        const agent = createReactAgent({
          llm: llmModel as any,
          tools: mcpTools,
        });
        return agent;
      } catch (error) {
        console.error('Error creating ReAct agent:', error);
        // 如果创建代理失败，返回原始模型
        console.log('Falling back to original model without tools');
        return llmModel;
      }
    } else {
      console.warn('No MCP tools available to bind');
    }
  }
  return llmModel;
}

/**
 * 将消息格式化为 LangChain 兼容格式
 * @param messages 要格式化的消息数组
 */
function formatMessagesForLLM(messages: any[]) {
  console.log('Formatting messages for LLM:', JSON.stringify(messages, null, 2));

  if (!messages || messages.length === 0) {
    console.warn('No messages to format, returning default system message');
    return [new SystemMessage(defaultSystemPrompt)];
  }

  // 检查是否有系统消息，如果没有，使用默认系统消息作为系统消息
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
        return new HumanMessage(msg);
      case 'assistant':
        return new AIMessage(msg);
      case 'system':
        return new SystemMessage(msg);
      default:
        console.warn(`Unknown message role: ${msg.role}, treating as human`);
        return new HumanMessage(msg);
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
    const { modelId, temperature, topP, maxTokens, useMCP = false } = modelParams;

    try {
      const model = await getLLMModel(modelId, temperature, topP, maxTokens, false, useMCP);

      // 将消息格式化为 LangChain 格式
      const formattedMessages = formatMessagesForLLM(messages);

      // 生成完成响应
      const response = await model.invoke(formattedMessages as any);
      if (response) {
        console.log(response);
      }
      // 处理不同类型的响应
      // 使用类型断言来处理不同类型的响应
      console.log('Processing response:', JSON.stringify(response, null, 2));

      if (useMCP) {
        // 记录完整的响应对象，用于调试
        console.log('Full ReAct agent response:', JSON.stringify(response, null, 2));

        // 处理 ReAct 代理的响应
        // 检查新版本 createReactAgent 返回的消息格式
        if ((response as any).messages) {
          // ReAct 代理返回的是包含 messages 数组的对象
          const messages = (response as any).messages;
          console.log(`Response has ${messages.length} messages`);

          // 找到最后一条助手消息
          for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i];
            if ((message.role === 'assistant' || message.type === 'ai') && message.content) {
              console.log(`Found assistant message with content: ${message.content}`);
              return message.content;
            }
          }

          // 如果没有找到助手消息，返回最后一条消息的内容
          if (messages.length > 0 && messages[messages.length - 1].content) {
            return messages[messages.length - 1].content;
          }
        } else if ((response as any).agent && (response as any).agent.messages) {
          // 处理包含 agent 字段的响应
          const messages = (response as any).agent.messages;
          console.log(`Agent response has ${messages.length} messages`);

          // 找到最后一条助手消息
          for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i];
            if ((message.role === 'assistant' || message.type === 'ai') && message.content) {
              console.log(`Found assistant message with content: ${message.content}`);
              return message.content;
            }
          }

          // 如果没有找到助手消息，返回最后一条消息的内容
          if (messages.length > 0 && messages[messages.length - 1].content) {
            return messages[messages.length - 1].content;
          }
        } else if (Array.isArray(response)) {
          // 处理直接返回消息数组的情况
          console.log(`Response is an array with ${response.length} items`);

          // 找到最后一条助手消息
          for (let i = response.length - 1; i >= 0; i--) {
            const message = response[i];
            if ((message.role === 'assistant' || message.type === 'ai') && message.content) {
              console.log(`Found assistant message with content: ${message.content}`);
              return message.content;
            }
          }

          // 如果没有找到助手消息，返回最后一条消息的内容
          if (response.length > 0 && response[response.length - 1].content) {
            return response[response.length - 1].content;
          }
        }

        // 如果还是没有找到内容，返回默认消息
        console.warn('Could not extract content from ReAct agent response');
        return '我将帮助您完成这个任务。';
      }

      // 处理标准 LLM 响应
      if ((response as any).content) {
        return (response as any).content;
      }

      // 其他情况，尝试将整个响应转换为字符串
      console.log('No content found in response, returning JSON string');
      return JSON.stringify(response);
    } catch (error) {
      console.error('Error in LLM chat:', error);
      throw error;
    }
  });

  // 处理流式聊天请求
  ipcMain.handle('llm:streamChat', async (event, { messages, modelParams }) => {
    const { modelId, temperature, topP, maxTokens, useMCP = false } = modelParams;
    console.log(`Received stream chat request with modelId: ${modelId}, useMCP: ${useMCP}`);

    // 创建一个中止控制器
    const abortController = new AbortController();
    const requestId = randomUUID();
    abortControllers.set(requestId, abortController);

    try {
      const model = await getLLMModel(modelId, temperature, topP, maxTokens, true, useMCP);
      console.log(`Got model for streaming:`, model);
      console.log(`Formatted messages:`, messages);
      const formattedMessages = formatMessagesForLLM(messages);

      // 使用中止信号创建流
      // const stream = await model.stream(formattedMessages as any, {
      //   signal: abortController.signal,
      // });
      const stream = await model.stream(
        { messages: messages },
        {
          signal: abortController.signal,
        }
      );

      let fullContent = '';

      // 处理流式响应
      if (useMCP) {
        // 处理 ReAct 代理的流式响应
        console.log('Processing ReAct agent stream response');
        let hasContent = false;
        let lastSentContent = ''; // 记录最后发送的内容，避免重复
        const processedChunks = new Set(); // 记录已处理的块，避免重复处理

        for await (const chunk of stream) {
          // 生成块的唯一标识符，避免重复处理
          const chunkId = JSON.stringify(chunk);
          if (processedChunks.has(chunkId)) {
            console.log('Skipping already processed chunk');
            continue;
          }
          processedChunks.add(chunkId);

          // 如果是 ReAct 代理的响应，它可能包含 agent 或 tools 字段
          if ((chunk as any).agent && (chunk as any).agent.messages) {
            const messages = (chunk as any).agent.messages;
            console.log(`Agent chunk has ${messages.length} messages`);

            // 找到最后一条助手消息
            for (let i = messages.length - 1; i >= 0; i--) {
              const message = messages[i];
              if ((message.role === 'assistant' || message.type === 'ai') && message.content) {
                const content = message.content;

                // 检查是否与上次发送的内容相同
                if (content === lastSentContent) {
                  console.log('Skipping duplicate content');
                  break;
                }

                console.log(`Found assistant message with content: ${content}`);
                fullContent = content; // 替换为完整内容
                lastSentContent = content;
                hasContent = true;
                event.sender.send(`llm:stream-chunk`, {
                  requestId,
                  content: content,
                  fullContent: fullContent,
                });
                break;
              }
            }
          } else if ((chunk as any).tools && (chunk as any).tools.messages) {
            // 处理工具消息
            console.log('Processing tool messages');
            const toolMessages = (chunk as any).tools.messages;
            for (const message of toolMessages) {
              if (message.content) {
                console.log(`Tool message content: ${message.content}`);
                // 将工具消息也发送到前端，但不更新 fullContent
                // 不将工具消息发送到前端，只记录在日志中
                // event.sender.send(`llm:stream-chunk`, {
                //   requestId,
                //   toolMessage: message.content,
                // });
              }
            }
          } else if ((chunk as any).messages) {
            // 直接处理消息数组
            console.log('Processing direct messages array');
            const messages = (chunk as any).messages;
            for (let i = messages.length - 1; i >= 0; i--) {
              const message = messages[i];
              if ((message.role === 'assistant' || message.type === 'ai') && message.content) {
                const content = message.content;

                // 检查是否与上次发送的内容相同
                if (content === lastSentContent) {
                  console.log('Skipping duplicate content');
                  break;
                }

                console.log(`Found assistant message with content: ${content}`);
                fullContent = content;
                lastSentContent = content;
                hasContent = true;
                event.sender.send(`llm:stream-chunk`, {
                  requestId,
                  content: content,
                  fullContent: fullContent,
                });
                break;
              }
            }
          } else if (Array.isArray(chunk)) {
            // 处理直接返回数组的情况
            console.log(`Chunk is an array with ${chunk.length} items`);

            // 找到最后一条助手消息
            for (let i = chunk.length - 1; i >= 0; i--) {
              const message = chunk[i];
              if ((message.role === 'assistant' || message.type === 'ai') && message.content) {
                const content = message.content;

                // 检查是否与上次发送的内容相同
                if (content === lastSentContent) {
                  console.log('Skipping duplicate content');
                  break;
                }

                console.log(`Found assistant message with content: ${content}`);
                fullContent = content;
                lastSentContent = content;
                hasContent = true;
                event.sender.send(`llm:stream-chunk`, {
                  requestId,
                  content: content,
                  fullContent: fullContent,
                });
                break;
              }
            }
          }
        }

        // 如果没有找到内容，发送一个默认消息
        if (!hasContent) {
          console.log('No content found in ReAct agent response, sending default message');
          fullContent = 'No content found in ReAct agent response';
          event.sender.send(`llm:stream-chunk`, {
            requestId,
            content: fullContent,
            fullContent: fullContent,
          });
        }
      } else {
        // 处理标准 LLM 流式响应
        for await (const chunk of stream) {
          if ((chunk as any).content) {
            fullContent += (chunk as any).content;
            // 将每个块发送到渲染进程
            event.sender.send(`llm:stream-chunk`, {
              requestId,
              content: (chunk as any).content,
              fullContent: fullContent,
            });
          }
        }
      }

      // 发送完成信号
      // 确保只发送一次完成信号
      console.log(`Sending completion signal with content: ${fullContent}`);
      event.sender.send('llm:stream-chunk', {
        requestId,
        content: fullContent,
        done: true,
      });

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
