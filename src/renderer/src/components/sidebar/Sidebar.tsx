import { useState, useEffect } from 'react';
import { useTheme } from '../theme-provider';
import { useChatStore } from '../../store/chatStore';
import { useModelStore } from '../../store/modelStore';
import ChatList from './ChatList';
import { Button } from '../ui/button';
import { GearIcon, PlusIcon, SunIcon, MoonIcon, LaptopIcon } from '@radix-ui/react-icons';

import SettingsDialog from '../settings/SettingsDialog';
import { useLanguage } from '../../locales';

const Sidebar = () => {
  const { theme, setTheme } = useTheme();
  const { createChat } = useChatStore();
  const { fetchModels, loadDefaultModel, defaultModel } = useModelStore();
  const { t } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initial model loading
  useEffect(() => {
    const initializeModels = async () => {
      await fetchModels();
      await loadDefaultModel();
    };
    initializeModels();
  }, [fetchModels, loadDefaultModel]);

  const handleNewChat = async () => {
    if (!defaultModel) return;

    await createChat({
      title: t.chat.newChat,
      systemPrompt: '',
      temperature: 0.7,
      topP: 1.0,
      model: defaultModel,
    });
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex flex-col h-full w-64 border-r border-border bg-card shadow-md">
      <div className="p-4 border-b border-border bg-card-muted">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2 shadow-sm hover:shadow transition-all"
          disabled={!defaultModel}
          variant="default"
        >
          <PlusIcon className="h-[18px] w-[18px]" />
          {t.chat.newChat}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <ChatList />
      </div>

      <div className="p-4 border-t border-border flex justify-between bg-card-muted">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleThemeToggle}
          title={`${t.settings.theme}: ${theme === 'light' ? t.settings.dark : t.settings.light}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {theme === 'light' ? (
            <MoonIcon className="h-[20px] w-[20px]" />
          ) : theme === 'dark' ? (
            <SunIcon className="h-[20px] w-[20px]" />
          ) : (
            <LaptopIcon className="h-[20px] w-[20px]" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          title={t.settings.settings}
          onClick={() => setIsSettingsOpen(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <GearIcon className="h-[20px] w-[20px]" />
        </Button>

        <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      </div>
    </div>
  );
};

export default Sidebar;
