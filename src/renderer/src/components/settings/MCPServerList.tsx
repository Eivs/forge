import { memo } from 'react';
import { Button } from '../ui/button';
import { PlusIcon, ArchiveIcon } from '@radix-ui/react-icons';
import { useLanguage } from '../../locales';
import { cn } from '../../lib/utils';
import { useMCPServerStore, MCPServer } from '../../store';

// 提取服务器项组件
const ServerItem = memo(
  ({
    server,
    isSelected,
    onSelect,
  }: {
    server: MCPServer;
    isSelected: boolean;
    onSelect: (id: string) => void;
  }) => {
    const { t } = useLanguage();

    return (
      <button
        className={cn(
          'flex items-center justify-between w-full py-2 px-2 rounded-md cursor-pointer transition-colors text-xs text-left',
          isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
        )}
        onClick={() => onSelect(server.id.toString())}
      >
        <ArchiveIcon className="h-3 w-3 mr-2 opacity-70" />
        <div className="flex flex-col flex-1 w-36 space-y-1">
          <div className="font-medium line-clamp-1">{server.name}</div>
          <span className="text-xs opacity-80">
            {server.type === 'stdio' ? t.mcp.stdioType : t.mcp.sseType}
          </span>
        </div>
        {server.isEnabled && server.isAvailable && (
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
        )}
      </button>
    );
  }
);

ServerItem.displayName = 'ServerItem';

const MCPServerList = memo(() => {
  const { t } = useLanguage();
  const { servers, selectedServerId, selectServer, addServer } = useMCPServerStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-3 border-b sticky top-0 bg-background z-10">
        <h3 className="text-sm font-medium">{t.mcp.servers}</h3>
        <Button
          onClick={addServer}
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          title={t.mcp.addServer}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {servers.length === 0 ? (
          <div className="p-3 text-xs text-muted-foreground">{t.mcp.noServersConfigured}</div>
        ) : (
          <ul className="space-y-1 p-2">
            {servers.map(server => (
              <li key={server.id}>
                <ServerItem
                  server={server}
                  isSelected={selectedServerId === String(server.id)}
                  onSelect={selectServer}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

MCPServerList.displayName = 'MCPServerList';

export default MCPServerList;
