import { PrismaClient } from '@prisma/client';
import { app } from 'electron';
import path from 'path';

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: app.isPackaged
            ? `file:${path.join(process.resourcesPath, 'prisma/db.sqlite')}`
            : undefined,
        },
      },
    });
  }
  return prisma;
}

export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
  }
}
