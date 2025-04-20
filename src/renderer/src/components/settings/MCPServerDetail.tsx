import { memo, useState, useEffect, useCallback } from 'react';
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
import { TrashIcon } from '@radix-ui/react-icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useLanguage } from '../../locales';
import { useToast } from '../ui/use-toast';
import { MCPServer } from './MCPSettings';

interface MCPServerDetailProps {
  server: MCPServer | null;
  onSave: (server: MCPServer) => Promise<void>;
  onDelete: (serverId: string) => Promise<void>;
  onTest: (server: MCPServer) => Promise<boolean>;
}

// 基础信息表单组件
const BasicInfoForm = ({
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
};

// STDIO 配置表单组件
const StdioConfigForm = ({
  server,
  onChange,
  disabled,
}: {
  server: MCPServer;
  onChange: (updates: Partial<MCPServer>) => void;
  disabled: boolean;
}) => {
  const { t } = useLanguage();

  // 将状态初始化移到组件顶部
  const [mcpArgs, setMcpArgs] = useState('');
  const [mcpEnv, setMcpEnv] = useState('');
  const [mcpCommand, setMcpCommand] = useState('');

  // 环境变量转换函数
  const envToStr = useCallback((env: Record<string, string> | undefined) => {
    if (env && Object.keys(env).length > 0) {
      return Object.entries(env)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    }
    return '';
  }, []);

  // 统一的初始化 effect
  useEffect(() => {
    setMcpCommand(server.command || '');
    setMcpArgs(server.args?.join('\n') || '');
    setMcpEnv(server.env ? envToStr(server.env) : '');
  }, [server.command, server.args, server.env, envToStr]);

  // 处理参数变化
  const handleArgsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMcpArgs(text);
    const args = text.split('\n').filter(line => line.trim() !== '');
    onChange({ args });
  };

  // 处理环境变量变化
  const handleEnvChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMcpEnv(text);

    const envObj: Record<string, string> = {};
    text
      .split('\n')
      .filter(line => line.trim() !== '')
      .forEach(line => {
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

  // 处理命令变化
  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setMcpCommand(text);
    onChange({ command: text });
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
          value={mcpCommand}
          onChange={handleCommandChange}
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
          value={mcpArgs}
          onChange={handleArgsChange}
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
          value={mcpEnv}
          onChange={handleEnvChange}
          placeholder="KEY1=value1&#10;KEY2=value2"
          disabled={disabled}
        />
      </div>
    </>
  );
};

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

// 设置组件名称
BasicInfoForm.displayName = 'BasicInfoForm';
StdioConfigForm.displayName = 'StdioConfigForm';
SSEConfigForm.displayName = 'SSEConfigForm';
DeleteConfirmDialog.displayName = 'DeleteConfirmDialog';

const MCPServerDetail = ({ server, onSave, onDelete, onTest }: MCPServerDetailProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [editedServer, setEditedServer] = useState<MCPServer | null>(server);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (server) {
      setEditedServer({ ...server });
    } else {
      setEditedServer(null);
    }
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

    try {
      await onSave(editedServer);
    } catch (error: any) {
      toast({
        title: t.mcp.error,
        description: error.message || t.mcp.error,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!editedServer) return false;

    setIsLoading(true);

    try {
      // 只进行测试，不自动保存
      const success = await onTest(editedServer);
      return success;
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
      toast({
        title: t.mcp.error,
        description: error.message || t.mcp.error,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
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
            <Button
              onClick={handleTest}
              disabled={
                isLoading ||
                (editedServer.type === 'stdio' ? !editedServer.command : !editedServer.url) ||
                !editedServer.name
              }
              className="h-8 text-xs px-4"
              variant="outline"
            >
              {isLoading ? t.common.loading : t.mcp.test}
            </Button>

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
        </CompactCardContent>
      </CompactCard>
    </div>
  );
};

MCPServerDetail.displayName = 'MCPServerDetail';

export default MCPServerDetail;
