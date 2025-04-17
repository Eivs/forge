import { memo, useState, useEffect } from 'react';
import {
  CompactCard,
  CompactCardContent,
  CompactCardHeader,
  CompactCardTitle,
} from './CompactCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Switch } from '../ui/switch';
import { TrashIcon, ExclamationTriangleIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useLanguage } from '../../locales';
import { MCPServer } from './MCPSettings';

interface MCPServerDetailProps {
  server: MCPServer | null;
  onSave: (server: MCPServer) => Promise<void>;
  onDelete: (serverId: string) => Promise<void>;
  onTest: (server: MCPServer) => Promise<void>;
}

// 基础信息表单组件
const BasicInfoForm = memo(
  ({
    server,
    onChange,
    disabled,
  }: {
    server: MCPServer;
    onChange: (updates: Partial<MCPServer>) => void;
    disabled: boolean;
  }) => {
    const { t } = useLanguage();

    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="mcpName" className="flex items-center">
            <span className="text-red-500 mr-1">*</span>
            {t.mcp.name}
          </Label>
          <Input
            id="mcpName"
            value={server.name}
            onChange={e => onChange({ name: e.target.value })}
            placeholder="MCP 服务器"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mcpDescription">{t.mcp.description}</Label>
          <Input
            id="mcpDescription"
            value={server.description || ''}
            onChange={e => onChange({ description: e.target.value })}
            placeholder=""
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center">
            <span className="text-red-500 mr-1">*</span>
            {t.mcp.type}
          </Label>
          <RadioGroup
            value={server.type}
            onValueChange={(value: 'stdio' | 'sse') => onChange({ type: value })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="stdio" id="stdio" />
              <Label htmlFor="stdio" className="cursor-pointer">
                {t.mcp.stdioType}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sse" id="sse" />
              <Label htmlFor="sse" className="cursor-pointer">
                {t.mcp.sseType}
              </Label>
            </div>
          </RadioGroup>
        </div>
      </>
    );
  }
);

// STDIO 配置表单组件
const StdioConfigForm = memo(
  ({
    server,
    onChange,
    disabled,
  }: {
    server: MCPServer;
    onChange: (updates: Partial<MCPServer>) => void;
    disabled: boolean;
  }) => {
    const { t } = useLanguage();

    const handleEnvChange = (text: string) => {
      const envLines = text.split('\n').filter(line => line.trim() !== '');
      const envObj: Record<string, string> = {};

      envLines.forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim();
          if (key) {
            envObj[key] = value;
          }
        }
      });

      onChange({ env: envObj });
    };

    return (
      <>
        <div className="space-y-1">
          <Label htmlFor="mcpCommand" className="text-xs flex items-center">
            <span className="text-red-500 mr-1">*</span>
            {t.mcp.command}
          </Label>
          <Input
            id="mcpCommand"
            className="h-8 text-xs"
            value={server.command || ''}
            onChange={e => onChange({ command: e.target.value })}
            placeholder="uvx or npx"
            disabled={disabled}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="mcpArgs" className="text-xs">
            {t.mcp.arguments}
          </Label>
          <Textarea
            id="mcpArgs"
            className="h-20 text-xs"
            value={server.args?.join('\n') || ''}
            onChange={e =>
              onChange({
                args: e.target.value.split('\n').filter(line => line.trim() !== ''),
              })
            }
            placeholder="arg1&#10;arg2"
            disabled={disabled}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="mcpEnv" className="text-xs">
            {t.mcp.environment}
          </Label>
          <Textarea
            id="mcpEnv"
            className="h-20 text-xs"
            value={
              server.env && Object.keys(server.env).length > 0
                ? Object.entries(server.env)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('\n')
                : ''
            }
            onChange={e => handleEnvChange(e.target.value)}
            placeholder="KEY1=value1&#10;KEY2=value2"
            disabled={disabled}
          />
        </div>
      </>
    );
  }
);

// SSE 配置表单组件
const SSEConfigForm = memo(
  ({
    server,
    onChange,
    disabled,
  }: {
    server: MCPServer;
    onChange: (updates: Partial<MCPServer>) => void;
    disabled: boolean;
  }) => {
    const { t } = useLanguage();

    return (
      <div className="space-y-1">
        <Label htmlFor="mcpUrl" className="text-xs flex items-center">
          <span className="text-red-500 mr-1">*</span>
          {t.mcp.serverUrl}
        </Label>
        <Input
          id="mcpUrl"
          className="h-8 text-xs"
          value={server.url || ''}
          onChange={e => onChange({ url: e.target.value })}
          placeholder="e.g. http://localhost:8000"
          disabled={disabled}
        />
      </div>
    );
  }
);

// 删除确认对话框组件
const DeleteConfirmDialog = memo(
  ({
    isOpen,
    serverName,
    isLoading,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    serverName: string;
    isLoading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }) => {
    const { t } = useLanguage();

    return (
      <Dialog open={isOpen} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.common.deleteConfirmation}</DialogTitle>
            <DialogDescription>
              {t.common.deleteConfirmationDescription.replace('{name}', serverName)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              {t.common.cancel}
            </Button>
            <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? t.common.loading : t.common.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

// 状态提示组件
const StatusAlert = memo(
  ({
    error,
    isConnected,
    connectionStatus,
    serverType,
  }: {
    error: string;
    isConnected: boolean;
    connectionStatus: string;
    serverType: 'stdio' | 'sse';
  }) => {
    const { t } = useLanguage();

    if (error) {
      return (
        <Alert variant="destructive" className="py-2 text-xs">
          <ExclamationTriangleIcon className="h-3 w-3" />
          <AlertTitle className="text-xs font-medium">{t.mcp.error}</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      );
    }

    if (isConnected && serverType === 'sse') {
      return (
        <Alert className="py-2 text-xs">
          <CheckCircledIcon className="h-3 w-3" />
          <AlertTitle className="text-xs font-medium">{t.mcp.connected}</AlertTitle>
          <AlertDescription className="text-xs">
            {connectionStatus || t.mcp.connectedDescription}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }
);

// 设置组件名称
BasicInfoForm.displayName = 'BasicInfoForm';
StdioConfigForm.displayName = 'StdioConfigForm';
SSEConfigForm.displayName = 'SSEConfigForm';
DeleteConfirmDialog.displayName = 'DeleteConfirmDialog';
StatusAlert.displayName = 'StatusAlert';

const MCPServerDetail = memo(({ server, onSave, onDelete, onTest }: MCPServerDetailProps) => {
  const { t } = useLanguage();
  const [editedServer, setEditedServer] = useState<MCPServer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (server) {
      setEditedServer({ ...server });
      setIsConnected(server.isConnected || false);
      setConnectionStatus(server.connectionStatus || '');
    } else {
      setEditedServer(null);
      setIsConnected(false);
      setConnectionStatus('');
    }
    setError('');
  }, [server]);

  if (!editedServer) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t.mcp.selectServer}</p>
      </div>
    );
  }

  const handleServerUpdate = (updates: Partial<MCPServer>) => {
    setEditedServer(prev => (prev ? { ...prev, ...updates } : null));
  };

  const handleSave = async () => {
    if (!editedServer) return;

    setIsLoading(true);
    setError('');

    try {
      await onSave(editedServer);
    } catch (error: any) {
      setError(error.message || t.mcp.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!editedServer) return;

    setIsLoading(true);
    setError('');

    try {
      await onTest(editedServer);
      setIsConnected(true);
      setConnectionStatus(t.mcp.testSuccess);
    } catch (error: any) {
      setError(error.message || t.mcp.testFailed);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!editedServer) return;
    setIsLoading(true);
    setShowDeleteConfirm(false);
    try {
      await onDelete(String(editedServer.id));
    } catch (error: any) {
      setError(error.message || t.mcp.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center mb-4">
        <h3 className="font-medium flex-1">{editedServer.name}</h3>
      </div>

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        serverName={editedServer.name}
        isLoading={isLoading}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <CompactCard>
        <CompactCardHeader>
          <div className="flex justify-between items-center">
            <CompactCardTitle>{t.mcp.serverConfig}</CompactCardTitle>
            <div className="flex items-center space-x-1">
              <Switch
                checked={editedServer.isEnabled}
                onCheckedChange={isEnabled => handleServerUpdate({ isEnabled })}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                title={t.common.delete}
              >
                <TrashIcon />
              </Button>
            </div>
          </div>
        </CompactCardHeader>
        <CompactCardContent className="space-y-4">
          <BasicInfoForm server={editedServer} onChange={handleServerUpdate} disabled={isLoading} />

          {editedServer.type === 'stdio' ? (
            <StdioConfigForm
              server={editedServer}
              onChange={handleServerUpdate}
              disabled={isLoading}
            />
          ) : (
            <SSEConfigForm
              server={editedServer}
              onChange={handleServerUpdate}
              disabled={isLoading}
            />
          )}

          <div className="flex justify-between">
            {editedServer.type === 'sse' && (
              <Button
                onClick={handleTest}
                disabled={isLoading || !editedServer.url || !editedServer.name}
                className="h-8 text-xs px-4"
                variant="outline"
              >
                {isLoading ? t.common.loading : t.mcp.test}
              </Button>
            )}

            <div className={editedServer.type === 'sse' ? '' : 'ml-auto'}>
              <Button
                onClick={handleSave}
                disabled={
                  isLoading ||
                  (editedServer.type === 'stdio' ? !editedServer.command : !editedServer.url) ||
                  !editedServer.name
                }
                className="h-8 text-xs px-4"
              >
                {isLoading ? t.common.saving : t.common.save}
              </Button>
            </div>
          </div>

          <StatusAlert
            error={error}
            isConnected={isConnected}
            connectionStatus={connectionStatus}
            serverType={editedServer.type}
          />
        </CompactCardContent>
      </CompactCard>
    </div>
  );
});

MCPServerDetail.displayName = 'MCPServerDetail';

export default MCPServerDetail;
