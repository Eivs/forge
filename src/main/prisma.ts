import { PrismaClient } from '@prisma/client';

// 创建一个单例 PrismaClient 实例
let prisma: PrismaClient;

export function getPrismaClient() {
  if (!prisma) {
    // 创建一个新的 PrismaClient 实例
    prisma = new PrismaClient();
  }

  return prisma;
}

export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
  }
}
