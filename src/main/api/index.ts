import { ipcMain } from 'electron';
import { getDatabase } from '../database';
import { setupLLMHandlers } from './llm';
import { setupMCPHandlers } from './mcp';

export function setupAPIHandlers() {
  setupLLMHandlers();
  setupMCPHandlers();

  // 获取所有对话
  ipcMain.handle('chats:getAll', async () => {
    const prisma = getDatabase();
    return prisma.chat.findMany({
      include: {
        model: {
          include: {
            provider: true,
          },
        },
        messages: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  // 获取单个对话
  ipcMain.handle('chats:getById', async (_, id: number) => {
    const prisma = getDatabase();
    return prisma.chat.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            provider: true,
          },
        },
        messages: true,
      },
    });
  });

  // 创建对话
  ipcMain.handle('chats:create', async (_, data: any) => {
    const prisma = getDatabase();

    // 获取模型
    const model = await prisma.model.findUnique({ where: { id: data.model.id } });
    if (!model) {
      throw new Error('Model not found');
    }

    // 从设置中获取默认用户 ID 或使用第一个用户
    let userId = data.user?.id;
    if (!userId) {
      const defaultUserIdSetting = await prisma.setting.findUnique({
        where: { key: 'defaultUserId' },
      });
      if (defaultUserIdSetting) {
        userId = parseInt(defaultUserIdSetting.value);
      } else {
        // 回退到第一个用户
        const firstUser = await prisma.user.findFirst();
        if (!firstUser) {
          throw new Error('No users found in the database');
        }
        userId = firstUser.id;
      }
    }

    // 创建对话记录
    const chat = await prisma.chat.create({
      data: {
        title: data.title,
        systemPrompt: data.systemPrompt,
        temperature: data.temperature || 0.7,
        topP: data.topP || 1.0,
        userId: userId,
        modelId: model.id,
      },
    });

    // 如果提供了系统提示，则添加系统消息
    if (data.systemPrompt) {
      await prisma.message.create({
        data: {
          role: 'system',
          content: data.systemPrompt,
          chatId: chat.id,
        },
      });
    }

    // 返回带有关系的聊天
    return prisma.chat.findUnique({
      where: { id: chat.id },
      include: {
        model: {
          include: {
            provider: true,
          },
        },
        messages: true,
      },
    });
  });

  // 更新对话
  ipcMain.handle('chats:update', async (_, id: number, data: any) => {
    const prisma = getDatabase();

    // 处理数据以正确设置关系
    const updateData: any = {
      title: data.title,
      systemPrompt: data.systemPrompt,
      temperature: data.temperature,
      topP: data.topP,
      updatedAt: new Date(),
    };

    // 如果提供了模型 ID，则设置模型关系
    if (data.modelId) {
      updateData.modelId = data.modelId;
    }

    await prisma.chat.update({
      where: { id },
      data: updateData,
    });

    return prisma.chat.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            provider: true,
          },
        },
        messages: true,
      },
    });
  });

  // 删除对话
  ipcMain.handle('chats:delete', async (_, id: number) => {
    const prisma = getDatabase();

    // 使用事务确保数据一致性
    await prisma.$transaction(async tx => {
      // 首先删除与聊天相关的所有消息
      await tx.message.deleteMany({
        where: { chatId: id },
      });

      // 然后删除聊天本身
      await tx.chat.delete({
        where: { id },
      });
    });
  });

  // 重命名对话
  ipcMain.handle('chats:rename', async (_, id: number, title: string) => {
    const prisma = getDatabase();

    await prisma.chat.update({
      where: { id },
      data: {
        title,
        updatedAt: new Date(),
      },
    });

    return prisma.chat.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            provider: true,
          },
        },
        messages: true,
      },
    });
  });

  // 清空对话消息，但保留对话本身
  ipcMain.handle('chats:clearMessages', async (_, id: number) => {
    const prisma = getDatabase();

    // 删除与该对话相关的所有消息
    await prisma.message.deleteMany({
      where: { chatId: id },
    });

    // 更新对话的更新时间
    await prisma.chat.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // 返回更新后的对话
    return prisma.chat.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            provider: true,
          },
        },
        messages: true,
      },
    });
  });

  // 获取对话消息
  ipcMain.handle('messages:getByChatId', async (_, chatId: number) => {
    const prisma = getDatabase();
    return prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });
  });

  // 创建对话消息
  ipcMain.handle('messages:create', async (_, data: any) => {
    const prisma = getDatabase();

    // 检查聊天是否存在
    const chat = await prisma.chat.findUnique({ where: { id: data.chatId } });
    if (!chat) {
      throw new Error('Chat not found');
    }

    // 创建消息
    const message = await prisma.message.create({
      data: {
        role: data.role,
        content: data.content,
        chatId: data.chatId,
      },
    });

    // 更新聊天的 updatedAt
    await prisma.chat.update({
      where: { id: data.chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  });

  // 更新对话消息
  ipcMain.handle('messages:update', async (_, id: number, data: any) => {
    const prisma = getDatabase();

    await prisma.message.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return prisma.message.findUnique({ where: { id } });
  });

  // 删除对话消息
  ipcMain.handle('messages:delete', async (_, id: number) => {
    const prisma = getDatabase();
    await prisma.message.delete({ where: { id } });
  });

  // 模型 API 处理程序
  ipcMain.handle('models:getAll', async () => {
    const prisma = getDatabase();
    return prisma.model.findMany({
      include: { provider: true },
      orderBy: { name: 'asc' },
    });
  });

  // 获取所有激活的模型
  ipcMain.handle('models:getActive', async () => {
    const prisma = getDatabase();
    return prisma.model.findMany({
      where: { isActive: true },
      include: { provider: true },
      orderBy: { name: 'asc' },
    });
  });

  // 创建模型
  ipcMain.handle('models:create', async (_, data: any) => {
    const prisma = getDatabase();

    // 检查提供商是否存在
    const provider = await prisma.provider.findUnique({ where: { id: data.provider.id } });
    if (!provider) {
      throw new Error('Provider not found');
    }

    const model = await prisma.model.create({
      data: {
        name: data.name,
        contextSize: data.contextSize || 4000,
        isActive: data.isActive || false,
        providerId: provider.id,
      },
    });

    return prisma.model.findUnique({
      where: { id: model.id },
      include: { provider: true },
    });
  });

  // 更新模型
  ipcMain.handle('models:update', async (_, id: number, data: any) => {
    const prisma = getDatabase();

    await prisma.model.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return prisma.model.findUnique({
      where: { id },
      include: { provider: true },
    });
  });

  // 删除模型
  ipcMain.handle('models:delete', async (_, id: number) => {
    const prisma = getDatabase();
    await prisma.model.delete({ where: { id } });
  });

  // 激活模型
  ipcMain.handle('models:setActive', async (_, id: number, isActive: boolean) => {
    const prisma = getDatabase();

    const model = await prisma.model.findUnique({
      where: { id },
      include: { provider: true },
    });

    if (!model) {
      throw new Error('Model not found');
    }

    await prisma.model.update({
      where: { id },
      data: { isActive, updatedAt: new Date() },
    });

    return prisma.model.findUnique({
      where: { id },
      include: { provider: true },
    });
  });

  // 获取所有提供商
  ipcMain.handle('providers:getAll', async () => {
    const prisma = getDatabase();
    return prisma.provider.findMany({
      orderBy: { name: 'asc' },
    });
  });

  // 获取所有以启用的提供商
  ipcMain.handle('providers:getActive', async () => {
    const prisma = getDatabase();
    return prisma.provider.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  });

  // 创建提供商
  ipcMain.handle('providers:create', async (_, data: any) => {
    const prisma = getDatabase();

    const provider = await prisma.provider.create({
      data,
    });

    return provider;
  });

  // 更新提供商
  ipcMain.handle('providers:update', async (_, id: number, data: any) => {
    const prisma = getDatabase();

    await prisma.provider.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return prisma.provider.findUnique({ where: { id } });
  });

  // 删除提供商
  ipcMain.handle('providers:delete', async (_, id: number) => {
    const prisma = getDatabase();
    await prisma.provider.delete({ where: { id } });
    await prisma.model.deleteMany({ where: { providerId: id } });
  });

  // 设置提供商的启用状态
  ipcMain.handle('providers:setActive', async (_, id: number, isActive: boolean) => {
    const prisma = getDatabase();

    await prisma.provider.update({
      where: { id },
      data: { isActive, updatedAt: new Date() },
    });

    await prisma.model.updateMany({
      where: {
        providerId: id,
      },
      data: {
        isActive: isActive,
        updatedAt: new Date(),
      },
    });

    return prisma.provider.findUnique({ where: { id } });
  });

  // 设置 API 处理程序
  ipcMain.handle('settings:getAll', async () => {
    const prisma = getDatabase();
    return prisma.setting.findMany();
  });

  // 根据键获取设置项
  ipcMain.handle('settings:getByKey', async (_, key: string) => {
    const prisma = getDatabase();
    const setting = await prisma.setting.findUnique({ where: { key } });
    return setting ? setting.value : null;
  });

  // 设置设置项
  ipcMain.handle('settings:set', async (_, key: string, value: string) => {
    const prisma = getDatabase();

    // 检查设置是否存在
    const existingSetting = await prisma.setting.findUnique({ where: { key } });

    if (existingSetting) {
      // 更新现有设置
      await prisma.setting.update({
        where: { key },
        data: {
          value,
          updatedAt: new Date(),
        },
      });
    } else {
      // 创建新设置
      await prisma.setting.create({
        data: { key, value },
      });
    }
  });
}
