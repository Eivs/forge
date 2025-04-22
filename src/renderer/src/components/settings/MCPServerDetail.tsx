import { memo, useState, useEffect, useRef } from 'react';
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
import { useMCPServerStore, MCPServer } from '../../store';

interface MCPServerDetailProps {
  onSave: (server: MCPServer) => Promise<void>;
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

// 环境变量转换函数
const envToStr = (env: Record<string, string> | undefined): string => {
  if (env && Object.keys(env).length > 0) {
    return Object.entries(env)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  }
  return '';
};

// 环境变量文本转对象函数
const strToEnv = (text: string): Record<string, string> => {
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
  return envObj;
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
  const [formState, setFormState] = useState({
    command: '',
    args: '',
    env: '',
  });
  const initializedRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (!initializedRef.current || server.id !== initializedRef.current) {
      setFormState({
        command: server.command || '',
        args: Array.isArray(server.args) ? server.args.join('\n') : '',
        env: server.env ? envToStr(server.env) : '',
      });
      initializedRef.current = server.id;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server.id]);

  // 处理参数修改
  const handleArgsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setFormState(prev => ({ ...prev, args: text }));
    const args = text.split('\n').filter(line => line.trim() !== '');
    onChange({ args });
  };

  // 处理环境变量修改
  const handleEnvChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setFormState(prev => ({ ...prev, env: text }));
    onChange({ env: strToEnv(text) });
  };

  // 处理命令变化
  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setFormState(prev => ({ ...prev, command: text }));
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
          value={formState.command}
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
          value={formState.args}
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
          value={formState.env}
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

const MCPServerDetail = ({ onSave, onTest }: MCPServerDetailProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { servers, selectedServerId, isLoading, deleteServer } = useMCPServerStore();
  const [editedServer, setEditedServer] = useState<MCPServer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 获取当前选中的服务器
  const server = selectedServerId
    ? servers.find(s => String(s.id) === selectedServerId) || null
    : null;

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

    try {
      await onSave(editedServer);
    } catch (error: any) {
      toast({
        title: t.mcp.error,
        description: error.message || t.mcp.error,
        variant: 'destructive',
      });
    }
  };

  const handleTest = async () => {
    if (!editedServer) return false;

    try {
      const success = await onTest(editedServer);
      return success;
    } catch (error) {
      console.error('Error testing server:', error);
      return false;
    }
  };

  const confirmDelete = async () => {
    if (!editedServer) return;
    setShowDeleteConfirm(false);
    try {
      await deleteServer(String(editedServer.id));
    } catch (error: any) {
      toast({
        title: t.mcp.error,
        description: error.message || t.mcp.error,
        variant: 'destructive',
      });
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
