import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from './prisma';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { defaultProviders, defaultModels, defaultUser, defaultSettings } from './defaultData';

export async function initializeDatabase() {
  try {
    // 获取 SQLite 数据库的用户数据路径
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'forge.sqlite');
    const prismaDbPath = path.join(process.cwd(), 'prisma', 'forge.sqlite');

    // 检查数据库是否存在于用户数据目录中
    if (fs.existsSync(dbPath)) {
      console.log('Existing database found, copying to Prisma directory');
      // 如果 prisma 目录不存在，则创建它
      const prismaDir = path.join(process.cwd(), 'prisma');
      if (!fs.existsSync(prismaDir)) {
        fs.mkdirSync(prismaDir, { recursive: true });
      }

      // 将数据库文件复制到 Prisma 目录
      fs.copyFileSync(dbPath, prismaDbPath);
    }

    const prisma = getPrismaClient();

    // 初始化默认提供商
    await initializeDefaultProviders(prisma);

    // 初始化默认模型
    await initializeDefaultModels(prisma);

    // 初始化默认设置和用户
    await initializeDefaultSettings(prisma);

    console.log('Database has been initialized!');
    return prisma;
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
}

async function initializeDefaultSettings(prisma: PrismaClient) {
  // 如果不存在默认用户，则初始化默认用户
  const existingUsers = await prisma.user.findMany();

  let createdUser;
  if (existingUsers.length === 0) {
    createdUser = await prisma.user.create({
      data: defaultUser,
    });

    console.log('Default user has been created');
  } else {
    createdUser = existingUsers[0];
  }

  // 如果不存在默认设置，则初始化默认设置
  const existingSettings = await prisma.setting.findMany();

  if (existingSettings.length === 0) {
    // 创建默认设置
    for (const setting of defaultSettings) {
      await prisma.setting.create({
        data: setting,
      });
    }

    // 创建默认用户设置
    await prisma.setting.create({
      data: {
        key: 'defaultUserId',
        value: createdUser.id.toString(),
      },
    });

    // 创建默认模型设置
    const defaultModel = await prisma.model.findFirst({ where: { isActive: true } });
    if (defaultModel) {
      await prisma.setting.create({
        data: {
          key: 'defaultModelId',
          value: defaultModel.id.toString(),
        },
      });
    }
    console.log('Default settings have been initialized');
  }
}

async function initializeDefaultProviders(prisma: PrismaClient) {
  // 如果不存在默认提供商，则初始化默认提供商
  const existingProviders = await prisma.provider.findMany();

  if (existingProviders.length !== 0) return;

  // 创建默认提供商
  await prisma.provider.createMany({
    data: defaultProviders,
  });

  console.log('Default providers have been initialized');
}

async function initializeDefaultModels(prisma: PrismaClient) {
  // 如果不存在默认模型，则初始化默认模型
  const existingModels = await prisma.model.findMany();

  if (existingModels.length === 0) {
    const openAIProvider = await prisma.provider.findFirst({ where: { name: 'OpenAI' } });
    const anthropicProvider = await prisma.provider.findFirst({ where: { name: 'Anthropic' } });
    const googleProvider = await prisma.provider.findFirst({ where: { name: 'Google' } });
    const deepSeekProvider = await prisma.provider.findFirst({ where: { name: 'DeepSeek' } });
    const coresHubProvider = await prisma.provider.findFirst({ where: { name: 'CoresHub' } });

    // 使用默认模型数据创建模型
    if (coresHubProvider && defaultModels.CoresHub) {
      await prisma.model.createMany({
        data: defaultModels.CoresHub.map(model => ({
          ...model,
          providerId: coresHubProvider.id,
        })),
      });
    }

    if (deepSeekProvider && defaultModels.DeepSeek) {
      await prisma.model.createMany({
        data: defaultModels.DeepSeek.map(model => ({
          ...model,
          providerId: deepSeekProvider.id,
        })),
      });
    }

    if (openAIProvider && defaultModels.OpenAI) {
      await prisma.model.createMany({
        data: defaultModels.OpenAI.map(model => ({
          ...model,
          providerId: openAIProvider.id,
        })),
      });
    }

    if (anthropicProvider && defaultModels.Anthropic) {
      await prisma.model.createMany({
        data: defaultModels.Anthropic.map(model => ({
          ...model,
          providerId: anthropicProvider.id,
        })),
      });
    }

    if (googleProvider && defaultModels.Google) {
      await prisma.model.createMany({
        data: defaultModels.Google.map(model => ({
          ...model,
          providerId: googleProvider.id,
        })),
      });
    }

    console.log('Default models have been initialized');
  }
}

export function getDatabase() {
  return getPrismaClient();
}
