import { ipcMain } from 'electron';
import { getDatabase } from '../database';

export function setupMCPServerHandlers() {
  // 获取所有 MCP 服务器
  ipcMain.handle('mcpServers:getAll', async () => {
    const prisma = getDatabase();
    return prisma.mCPServer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  // 获取单个 MCP 服务器
  ipcMain.handle('mcpServers:getById', async (_, id: number) => {
    const prisma = getDatabase();
    return prisma.mCPServer.findUnique({
      where: { id },
    });
  });

  // 创建 MCP 服务器
  ipcMain.handle('mcpServers:create', async (_, data: any) => {
    const prisma = getDatabase();

    // 处理 args 和 env，将它们转换为 JSON 字符串
    const args = data.args ? JSON.stringify(data.args) : null;
    const env = data.env ? JSON.stringify(data.env) : null;

    const mcpServer = await prisma.mCPServer.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        command: data.command,
        args,
        env,
        url: data.url,
        isEnabled: data.isEnabled !== false,
        isConnected: data.isConnected || false,
        connectionStatus: data.connectionStatus,
      },
    });

    return {
      ...mcpServer,
      args: mcpServer.args ? JSON.parse(mcpServer.args) : [],
      env: mcpServer.env ? JSON.parse(mcpServer.env) : {},
    };
  });

  // 更新 MCP 服务器
  ipcMain.handle('mcpServers:update', async (_, id: number, data: any) => {
    const prisma = getDatabase();

    // 处理 args 和 env，将它们转换为 JSON 字符串
    const updateData: any = { ...data };
    
    if (data.args !== undefined) {
      updateData.args = data.args ? JSON.stringify(data.args) : null;
    }
    
    if (data.env !== undefined) {
      updateData.env = data.env ? JSON.stringify(data.env) : null;
    }

    // 更新时间戳
    updateData.updatedAt = new Date();

    const mcpServer = await prisma.mCPServer.update({
      where: { id },
      data: updateData,
    });

    return {
      ...mcpServer,
      args: mcpServer.args ? JSON.parse(mcpServer.args) : [],
      env: mcpServer.env ? JSON.parse(mcpServer.env) : {},
    };
  });

  // 删除 MCP 服务器
  ipcMain.handle('mcpServers:delete', async (_, id: number) => {
    const prisma = getDatabase();
    await prisma.mCPServer.delete({
      where: { id },
    });
    return { success: true };
  });
}
