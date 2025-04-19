import { PrismaClient } from '@prisma/client';
import { app } from 'electron';
import path from 'path';

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = app.isPackaged
      ? new PrismaClient({
          datasources: {
            db: {
              url: `file:${path.join(process.resourcesPath, 'prisma/forge.sqlite')}`,
            },
          },
        })
      : new PrismaClient({ log: ['error', 'warn'] });
  }
  return prisma;
}

export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
  }
}
