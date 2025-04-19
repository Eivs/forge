/**
 * 图标生成脚本
 *
 * 此脚本使用 electron-icon-builder 生成 Forge 应用程序所需的图标
 * 需要安装以下依赖：
 * npm install --save-dev electron-icon-builder
 *
 * 使用方法：
 * node scripts/generate-icons.js
 */

import { execSync } from 'child_process';
import process from 'node:process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/* global console */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保目录存在
const buildDir = path.join(__dirname, '../build');
const iconsDir = path.join(buildDir, 'icons');

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// 源图标路径 - 使用 PNG 格式
const iconPath = path.join(__dirname, '../build/icons/png/icon.png');

// 检查源图标是否存在
if (!fs.existsSync(iconPath)) {
  console.error('Error: Source icon not found:', iconPath);
  console.error('Please ensure icon.png exists in the build/icons/png directory');
  process.exit(1);
}

console.log('Starting icon generation...');

try {
  // 使用 electron-icon-builder 生成图标
  const command = 'npx electron-icon-builder --input="' + iconPath + '" --output=build';
  console.log('Executing command:', command);
  execSync(command, { stdio: 'inherit' });

  console.log('Icons generated successfully!');
  console.log('Icon file locations:');
  console.log('- Windows: build/icons/win/icon.ico');
  console.log('- macOS: build/icons/mac/icon.icns');
  console.log('- Linux: build/icons/png/*.png');
} catch (error) {
  console.error('Error generating icons:', error.message);
  process.exit(1);
}
