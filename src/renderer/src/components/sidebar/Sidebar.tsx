import { useState, useEffect } from 'react'
import { useTheme } from '../theme-provider'
import { useChatStore } from '../../store/chatStore'
import { useModelStore } from '../../store/modelStore'
import ChatList from './ChatList'
import { Button } from '../ui/button'
import { Settings, Plus, Sun, Moon, MonitorSmartphone } from 'lucide-react'
import { Model } from '../../store/chatStore'
import SettingsDialog from '../settings/SettingsDialog'
import { useLanguage } from '../../locales'

const Sidebar = () => {
  const { theme, setTheme } = useTheme()
  const { createChat } = useChatStore()
  const { models, fetchModels } = useModelStore()
  const { t } = useLanguage()
  const [activeModel, setActiveModel] = useState<Model | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Initial model loading
  useEffect(() => {
    fetchModels()
  }, [])

  // When the model list updates, set the active model
  useEffect(() => {
    const activeModels = models.filter(model => model.isActive)
    if (activeModels.length > 0) {
      setActiveModel(activeModels[0])
    }
  }, [models])

  const handleNewChat = async () => {
    if (!activeModel) return

    await createChat({
      title: t.chat.newChat,
      systemPrompt: '',
      temperature: 0.7,
      topP: 1.0,
      model: activeModel
    })
  }

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="flex flex-col h-full w-64 border-r border-border bg-card shadow-md">
      <div className="p-4 border-b border-border bg-card-muted">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2 shadow-sm hover:shadow transition-all"
          disabled={!activeModel}
          variant="default"
        >
          <Plus size={18} />
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
            <Moon size={20} />
          ) : theme === 'dark' ? (
            <Sun size={20} />
          ) : (
            <MonitorSmartphone size={20} />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          title={t.settings.settings}
          onClick={() => setIsSettingsOpen(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings size={20} />
        </Button>

        <SettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
        />
      </div>
    </div>
  )
}

export default Sidebar