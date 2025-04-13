import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from './prisma';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

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

    // 如果不存在默认设置，则初始化默认设置
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

  let defaultUser;
  if (existingUsers.length === 0) {
    defaultUser = await prisma.user.create({
      data: {
        name: 'Default User',
        email: 'user@example.com'
      }
    });

    console.log('Default user has been created');
  } else {
    defaultUser = existingUsers[0];
  }

  // 如果不存在默认设置，则初始化默认设置
  const existingSettings = await prisma.setting.findMany();

  if (existingSettings.length === 0) {
    // 创建默认主题设置
    await prisma.setting.create({
      data: {
        key: 'theme',
        value: 'light'
      }
    });

    // 创建默认语言设置
    await prisma.setting.create({
      data: {
        key: 'language',
        value: 'en'
      }
    });

    // 创建默认用户设置
    await prisma.setting.create({
      data: {
        key: 'defaultUserId',
        value: defaultUser.id.toString()
      }
    });

    console.log('Default settings have been initialized');
  }

  // 如果不存在默认提供商，则初始化默认提供商
  const existingProviders = await prisma.provider.findMany();

  if (existingProviders.length === 0) {
    // 创建默认提供商
    await prisma.provider.createMany({
      data: [
        {
          name: 'DeepSeek',
          baseUrl: 'https://api.deepseek.com/v1',
          apiKey: '',
          isActive: true
        },
        {
          name: 'CoresHub',
          baseUrl: 'https://openapi.coreshub.cn/v1',
          apiKey: '',
          isActive: true
        },
        {
          name: 'OpenAI',
          baseUrl: 'https://api.openai.com/v1',
          apiKey: '',
          isActive: false
        },
        {
          name: 'Anthropic',
          baseUrl: 'https://api.anthropic.com/v1',
          apiKey: '',
          isActive: false
        },
        {
          name: 'Google',
          baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
          apiKey: '',
          isActive: false
        },
      ]
    });

    console.log('Default providers have been initialized');
  }

  // 如果不存在默认模型，则初始化默认模型
  const existingModels = await prisma.model.findMany();

  if (existingModels.length === 0) {
    const openAIProvider = await prisma.provider.findFirst({ where: { name: 'OpenAI' } });
    const anthropicProvider = await prisma.provider.findFirst({ where: { name: 'Anthropic' } });
    const googleProvider = await prisma.provider.findFirst({ where: { name: 'Google' } });
    const deepSeekProvider = await prisma.provider.findFirst({ where: { name: 'DeepSeek' } });

    if (openAIProvider) {
      await prisma.model.createMany({
        data: [
          {
            name: 'gpt-4-turbo',
            providerId: openAIProvider.id,
            contextSize: 128000,
            isActive: false
          },
          {
            name: 'gpt-4o',
            providerId: openAIProvider.id,
            contextSize: 128000,
            isActive: false
          },
          {
            name: 'gpt-3.5-turbo',
            providerId: openAIProvider.id,
            contextSize: 16000,
            isActive: false
          }
        ]
      });
    }

    if (anthropicProvider) {
      await prisma.model.createMany({
        data: [
          {
            name: 'claude-3-haiku',
            providerId: anthropicProvider.id,
            contextSize: 200000,
            isActive: false
          },
          {
            name: 'claude-3-sonnet',
            providerId: anthropicProvider.id,
            contextSize: 200000,
            isActive: false
          },
          {
            name: 'claude-3-opus',
            providerId: anthropicProvider.id,
            contextSize: 200000,
            isActive: false
          }
        ]
      });
    }

    if (googleProvider) {
      await prisma.model.createMany({
        data: [
          {
            name: 'gemini-pro',
            providerId: googleProvider.id,
            contextSize: 32000,
            isActive: false
          },
          {
            name: 'gemini-ultra',
            providerId: googleProvider.id,
            contextSize: 32000,
            isActive: false
          }
        ]
      });
    }

    if (deepSeekProvider) {
      await prisma.model.createMany({
        data: [
          {
            name: 'deepseek-chat',
            providerId: deepSeekProvider.id,
            contextSize: 32000,
            isActive: true
          },
          {
            name: 'deepseek-reasoner',
            providerId: deepSeekProvider.id,
            contextSize: 32000,
            isActive: true
          }
        ]
      });
    }

    console.log('Default models have been initialized');
  }
}

export function getDatabase() {
  return getPrismaClient();
}