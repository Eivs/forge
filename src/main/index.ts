import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initializeDatabase } from './database';
import { setupAPIHandlers } from './api';

// 处理在 Windows 上安装/卸载时创建/删除快捷方式。
if (await import('electron-squirrel-startup').then(module => module.default)) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // 创建浏览器窗口。
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      // 添加安全设置
      sandbox: true,
      webSecurity: true,
    },
  });

  // 设置内容安全策略
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';",
          "script-src 'self';",
          "style-src 'self' 'unsafe-inline';",
          "img-src 'self' data: https:;",
          "font-src 'self' data:;",
          "connect-src 'self' https:;",
        ].join(' '),
      },
    });
  });

  // 加载应用的 index.html。
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 在生产环境中，加载构建好的 html 文件
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
};

// 当 Electron 完成初始化并准备好创建浏览器窗口时，
// 将调用此方法。
app.whenReady().then(async () => {
  try {
    // 初始化数据库
    await initializeDatabase();

    // 设置 API 处理程序
    setupAPIHandlers();

    // 创建窗口
    createWindow();
  } catch (error) {
    console.error('Error during app initialization:', error);
  }

  app.on('activate', () => {
    // 在 macOS 上，当点击程序坞图标且没有其他窗口打开时，
    // 通常会在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 当所有窗口关闭时退出，除了在 macOS 上。在 macOS 上，
// 应用程序及其菜单栏通常会保持活动状态，
// 直到用户使用 Cmd + Q 显式退出。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
