import { useEffect } from 'react';
import { useLanguage } from '../../locales';
import MCPServerList from './MCPServerList';
import MCPServerDetail from './MCPServerDetail';
import { useToast } from '../ui/use-toast';
import { useMCPServerStore } from '../../store';

const MCPSettings = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { fetchServers, saveServer, testServer } = useMCPServerStore();

  // 初始加载服务器列表
  useEffect(() => {
    const loadServers = async () => {
      try {
        await fetchServers();
      } catch (error) {
        console.error('Error loading MCP servers:', error);
        toast({
          title: t.mcp.error,
          description: String(error),
          variant: 'destructive',
        });
      }
    };
    loadServers();
  }, [fetchServers, t, toast]);

  // 处理保存服务器
  const handleSaveServer = async (server: any) => {
    try {
      const success = await saveServer(server);

      if (success) {
        toast({
          title: t.common.save,
          description: `${server.name} ${t.mcp.saveSuccess}`,
          variant: 'default',
        });
      } else {
        toast({
          title: t.mcp.error,
          description: t.mcp.testFailedDesc || t.mcp.testFailed,
          variant: 'destructive',
        });
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

  // 处理测试服务器连接
  const handleTestServer = async (server: any): Promise<boolean> => {
    try {
      const success = await testServer(server);

      if (success) {
        toast({
          title: t.mcp.testSuccess,
          description: t.mcp.testSuccessDesc || t.mcp.testSuccess,
          variant: 'default',
        });
      } else {
        toast({
          title: t.mcp.testFailed,
          description: t.mcp.testFailedDesc || t.mcp.testFailed,
          variant: 'destructive',
        });
      }

      return success;
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

  return (
    <div className="flex flex-col h-full border-t">
      <div className="p-3 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">{t.mcp.serverConfig}</h3>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 border-r h-full overflow-y-auto">
          <MCPServerList />
        </div>
        <div className="w-3/4 p-3 h-full overflow-y-auto">
          <MCPServerDetail onSave={handleSaveServer} onTest={handleTestServer} />
        </div>
      </div>
    </div>
  );
};

export default MCPSettings;
