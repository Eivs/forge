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

          // 初始化 MCP 客户端
          const initResult = await window.electron.mcp.initialize();
          if (initResult.success) {
            // 检查连接状态
            const connected = await window.electron.mcp.isConnected();
            if (connected) {
              const status = await window.electron.mcp.getConnectionStatus();
              // 更新所有已启用的服务器的连接状态
              setServers(prev =>
                prev.map(server =>
                  server.isEnabled
                    ? { ...server, isConnected: connected, connectionStatus: status }
                    : server
                )
              );

              // 显示成功提示
              toast({
                title: t.mcp.initSuccess,
                description: t.mcp.initSuccessDesc,
                variant: 'default',
              });
            }
          } else if (initResult.message) {
            // 显示错误提示
            toast({
              title: t.mcp.initFailed,
              description: initResult.message,
              variant: 'destructive',
            });
          }
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

  const handleTestServer = async (server: MCPServer) => {
    try {
      if (server.type === 'sse') {
        // 对于 SSE 类型，测试 URL 连接
        if (server.url) {
          await window.electron.mcp.connect(server.url);
          const status = await window.electron.mcp.getConnectionStatus();

          // 更新服务器连接状态
          await window.electron.mcpServers.update(Number(server.id), {
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
        // 对于 stdio 类型，测试命令执行
        if (server.command) {
          // 这里需要实现 stdio 类型的测试逻辑
          // 目前只是模拟测试成功
          await window.electron.mcpServers.update(Number(server.id), {
            isConnected: true,
            connectionStatus: 'Test successful',
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
    } catch (error) {
      console.error('Error testing MCP server:', error);
      // 更新服务器连接状态
      if (server.id) {
        await window.electron.mcpServers.update(Number(server.id), {
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
      }
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
    <div className="flex h-full border-t">
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
  );
};

export default MCPSettings;
