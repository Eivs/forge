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
/* eslint-disable */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
  console.error('错误: 源图标不存在:', iconPath);
  console.error('请确保在 build/icons/png 目录中有 icon.png 文件');
  process.exit(1);
}

console.log('开始生成应用图标...');

try {
  // 使用 electron-icon-builder 生成图标
  const command = 'npx electron-icon-builder --input="' + iconPath + '" --output=build';
  console.log('执行命令:', command);
  execSync(command, { stdio: 'inherit' });

  console.log('图标生成成功！');
  console.log('图标文件位置：');
  console.log('- Windows: build/icons/win/icon.ico');
  console.log('- macOS: build/icons/mac/icon.icns');
  console.log('- Linux: build/icons/png/*.png');
} catch (error) {
  console.error('生成图标时出错:', error.message);
  process.exit(1);
}
