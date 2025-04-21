// 生成预初始化的 SQLite 数据库
import { execSync } from 'child_process';
import process from 'node:process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取 __dirname 等价物
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保 prisma 目录存在
const prismaDir = path.join(process.cwd(), 'prisma');
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}

// 设置 DATABASE_URL 环境变量指向 prisma 目录中的 SQLite 文件
process.env.DATABASE_URL = `file:${path.join(prismaDir, 'forge.sqlite')}`;

/* global console */
console.log('Generating Prisma client...');
// 生成 Prisma 客户端
execSync('npx prisma generate', { stdio: 'inherit' });

console.log('Creating SQLite database...');
// 创建 SQLite 数据库
if (fs.existsSync(path.join(prismaDir, 'forge.sqlite'))) {
  console.log('Database already exists, removing it...');
  fs.unlinkSync(path.join(prismaDir, 'forge.sqlite'));
}

// 使用 Prisma 创建数据库
execSync('npx prisma db push', { stdio: 'inherit' });

console.log('Database created successfully!');
