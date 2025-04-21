import { useEffect, useState } from 'react';
import { useLanguage } from '../../locales';
import MCPServerList from './MCPServerList';
import MCPServerDetail from './MCPServerDetail';
import { useToast } from '../ui/use-toast';

// MCP 服务器类型定义
export interface MCPServer {
  id: string | number;
  name: string;
  description?: string;
  type: 'stdio' | 'sse';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  isEnabled: boolean;
  isConnected?: boolean;
  connectionStatus?: string;
}

const MCPSettings = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  useEffect(() => {
    const loadMCPServers = async () => {
      try {
        // 从数据库加载 MCP 服务器列表
        const mcpServers = await window.electron.mcpServers.getAll();
        if (mcpServers && mcpServers.length > 0) {
          // 处理从数据库返回的数据
          const processedServers = mcpServers.map(server => ({
            ...server,
            args: server.args ? JSON.parse(server.args) : [],
            env: server.env ? JSON.parse(server.env) : {},
          }));
          setServers(processedServers);
          // 选择第一个服务器
          setSelectedServerId(String(processedServers[0].id));
        }
      } catch (error) {
        console.error('Error loading MCP servers:', error);
        toast({
          title: t.mcp.error,
          description: String(error),
          variant: 'destructive',
        });
      }
    };
    loadMCPServers();
  }, [t, toast]);

  const handleSaveServer = async (server: MCPServer) => {
    try {
      // 先测试连接
      const isConnected = await handleTestServer(server);
      if (!isConnected) {
        toast({
          title: t.mcp.testFailed,
          description: t.mcp.testFailedDesc || t.mcp.testFailed,
          variant: 'destructive',
        });
        return;
      }

      const serverData = {
        ...server,
        args: Array.isArray(server.args) ? server.args : [],
        env: typeof server.env === 'object' ? server.env : {},
      };

      let savedServer;
      // Check if the ID is a temporary string ID
      if (server.id && typeof server.id === 'string' && server.id.startsWith('temp-')) {
        // Create new server
        savedServer = await window.electron.mcpServers.create(serverData);
      } else {
        // Update existing server
        savedServer = await window.electron.mcpServers.update(Number(server.id), serverData);
      }
      console.log(savedServer);

      // 更新服务器列表
      const allServers = await window.electron.mcpServers.getAll();
      const processedServers = allServers.map((s: any) => ({
        ...s,
        args: s.args ? JSON.parse(s.args) : [],
        env: s.env ? JSON.parse(s.env) : {},
      }));

      setServers(processedServers);

      // 保持当前服务器选中状态
      setSelectedServerId(String(savedServer.id));

      // 显示保存成功提示
      toast({
        title: t.common.save,
        description: `${server.name} ${t.mcp.saveSuccess}`,
        variant: 'default',
      });

      // 如果启用了连接，尝试连接到 MCP 服务器
      if (server.isEnabled) {
        if (server.type === 'sse') {
          // 对于 SSE 类型，使用 URL
          if (server.url) {
            await window.electron.mcp.connect(server.url);
            const status = await window.electron.mcp.getConnectionStatus();

            // 更新服务器连接状态
            await window.electron.mcpServers.update(Number(savedServer.id), {
              isConnected: true,
              connectionStatus: status,
            });

            // 重新加载服务器列表
            const updatedServers = await window.electron.mcpServers.getAll();
            const processedUpdatedServers = updatedServers.map((s: any) => ({
              ...s,
              args: s.args ? JSON.parse(s.args) : [],
              env: s.env ? JSON.parse(s.env) : {},
            }));

            setServers(processedUpdatedServers);
          }
        } else {
          // 对于 stdio 类型，使用命令
          if (server.command) {
            // 这里需要实现 stdio 类型的连接逻辑
            // 目前只是模拟连接成功
            await window.electron.mcpServers.update(Number(savedServer.id), {
              isConnected: true,
              connectionStatus: 'Connected via stdio',
            });

            // 重新加载服务器列表
            const updatedServers = await window.electron.mcpServers.getAll();
            const processedUpdatedServers = updatedServers.map((s: any) => ({
              ...s,
              args: s.args ? JSON.parse(s.args) : [],
              env: s.env ? JSON.parse(s.env) : {},
            }));

            setServers(processedUpdatedServers);
          }
        }
      } else {
        // 如果禁用了连接，断开连接
        await handleDisconnect(savedServer.id.toString());
      }
    } catch (error) {
      console.error('Error saving MCP server:', error);
      toast({
        title: t.mcp.error,
        description: String(error),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    try {
      // 先断开连接
      await handleDisconnect(serverId);

      // 从数据库中删除服务器
      await window.electron.mcpServers.delete(Number(serverId));

      // 重新加载服务器列表
      const allServers = await window.electron.mcpServers.getAll();
      const processedServers = allServers.map((s: any) => ({
        ...s,
        args: s.args ? JSON.parse(s.args) : [],
        env: s.env ? JSON.parse(s.env) : {},
      }));

      setServers(processedServers);

      // 如果还有其他服务器，选择第一个
      if (processedServers.length > 0) {
        setSelectedServerId(String(processedServers[0].id));
      } else {
        setSelectedServerId(null);
      }
    } catch (error) {
      console.error('Error deleting MCP server:', error);
    }
  };

  const handleTestServer = async (server: MCPServer): Promise<boolean> => {
    try {
      // 检查是否为临时服务器（未保存到数据库）
      const isTemporaryServer = typeof server.id === 'string' && server.id.startsWith('temp-');

      // 使用新的 testConnect 方法测试连接
      // @ts-expect-error - 忽略 TypeScript 类型检查
      const testResult = await window.electron.mcp.testConnect(server);

      if (!testResult.success) {
        throw new Error(testResult.error || t.mcp.testFailedDesc || t.mcp.testFailed);
      }

      // 只有已保存的服务器才更新数据库
      if (!isTemporaryServer) {
        // 更新服务器连接状态
        await window.electron.mcpServers.update(Number(server.id), {
          isConnected: true,
          connectionStatus: testResult.status || 'Connected',
        });
      }

      // 对于临时服务器，不更新服务器列表状态
      // 移除 setServers 调用，避免触发重新渲染

      toast({
        title: t.mcp.testSuccess,
        description: t.mcp.testSuccessDesc || t.mcp.testSuccess,
        variant: 'default',
      });

      return true;
    } catch (error: any) {
      console.error('Error testing MCP server:', error);
      toast({
        title: t.mcp.testFailed,
        description: error.message || t.mcp.testFailedDesc || t.mcp.testFailed,
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleDisconnect = async (serverId: string) => {
    try {
      await window.electron.mcp.disconnect();

      // 更新服务器连接状态
      await window.electron.mcpServers.update(Number(serverId), {
        isConnected: false,
        connectionStatus: '',
      });

      // 重新加载服务器列表
      const updatedServers = await window.electron.mcpServers.getAll();
      const processedUpdatedServers = updatedServers.map((s: any) => ({
        ...s,
        args: s.args ? JSON.parse(s.args) : [],
        env: s.env ? JSON.parse(s.env) : {},
      }));

      setServers(processedUpdatedServers);
    } catch (error) {
      console.error('Error disconnecting from MCP server:', error);
    }
  };

  const handleAddServer = () => {
    // 创建新的服务器对象，使用临时 ID
    const tempId = `temp-${Date.now()}`;
    const newServer: MCPServer = {
      id: tempId, // 使用临时 ID，保存时会替换为数据库生成的 ID
      name: `${t.mcp.serverConfig} ${servers.length + 1}`,
      type: 'stdio',
      isEnabled: true,
      command: '',
      args: [],
      env: {},
      url: '',
      description: '',
    };
    // 添加到列表并选中
    setServers([...servers, newServer]);
    setSelectedServerId(tempId);
  };

  const handleSelectServer = (serverId: string) => {
    setSelectedServerId(serverId);
  };

  return (
    <div className="flex flex-col h-full border-t">
      <div className="p-3 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">{t.mcp.serverConfig}</h3>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 border-r h-full overflow-y-auto">
          <MCPServerList
            servers={servers}
            selectedServerId={selectedServerId}
            onSelectServer={handleSelectServer}
            onAddServer={handleAddServer}
          />
        </div>
        <div className="w-3/4 p-3 h-full overflow-y-auto">
          <MCPServerDetail
            server={
              selectedServerId ? servers.find(s => String(s.id) === selectedServerId) || null : null
            }
            onSave={handleSaveServer}
            onDelete={handleDeleteServer}
            onTest={handleTestServer}
          />
        </div>
      </div>
    </div>
  );
};

export default MCPSettings;
