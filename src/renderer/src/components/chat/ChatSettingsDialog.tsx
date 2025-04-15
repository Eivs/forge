import { useState, useEffect } from 'react';
import { Dialog } from 'reablocks';
import { Button } from '../ui/button-reablocks';
import { Input } from 'reablocks';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { useChatStore } from '../../store/chatStore';
import { useModelStore } from '../../store/modelStore';
import { Select } from 'reablocks';
import { useLanguage } from '../../locales';

interface ChatSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: number | null;
}

const ChatSettingsDialog = ({ open, onOpenChange, chatId }: ChatSettingsDialogProps) => {
  const { chats, updateChat } = useChatStore();
  const { models, fetchModels } = useModelStore();
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1.0);
  const [modelId, setModelId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && chatId) {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setTitle(chat.title);
        setSystemPrompt(chat.systemPrompt || '');
        setTemperature(chat.temperature);
        setTopP(chat.topP);
        setModelId(chat.model.id);
      }
    }
  }, [open, chatId, chats]);

  // Initial model loading
  useEffect(() => {
    fetchModels();
  }, []);

  const handleSave = async () => {
    if (!chatId) return;

    setIsLoading(true);
    try {
      // 只传递模型 ID，而不是整个模型对象
      if (!modelId) return;

      await updateChat(chatId, {
        title,
        systemPrompt,
        temperature,
        topP,
        modelId: Number(modelId), // 确保 modelId 是数字
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating chat settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      header={t.chat.settings}
      className="sm:max-w-[500px]"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? t.common.saving : t.common.save}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t.chat.title}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder={t.chat.chatTitle}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">{t.model.model}</Label>
            <Select
              value={modelId?.toString() || ''}
              onChange={(value: string) => setModelId(parseInt(value))}
              placeholder={t.model.selectModel}
              id="model"
            >
              {models
                .filter(m => m.isActive)
                .map(model => (
                  <option key={model.id} value={model.id.toString()}>
                    {model.name} ({model.provider.name})
                  </option>
                ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemPrompt">{t.model.systemPrompt}</Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              placeholder={t.model.enterSystemPrompt}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="temperature">
                {t.model.temperature}: {temperature.toFixed(1)}
              </Label>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.1}
              value={[temperature]}
              onValueChange={(value: number[]) => setTemperature(value[0])}
            />
            <p className="text-xs text-muted-foreground">{t.model.temperatureDescription}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="topP">
                {t.model.topP}: {topP.toFixed(1)}
              </Label>
            </div>
            <Slider
              id="topP"
              min={0}
              max={1}
              step={0.1}
              value={[topP]}
              onValueChange={(value: number[]) => setTopP(value[0])}
            />
            <p className="text-xs text-muted-foreground">{t.model.topPDescription}</p>
          </div>
        </div>
    </Dialog>
  );
};

export default ChatSettingsDialog;
