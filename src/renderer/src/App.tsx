import { useEffect, useState } from 'react'
import { ThemeProvider } from './components/theme-provider'
import Sidebar from './components/sidebar/Sidebar'
import ChatWindow from './components/chat/ChatWindow'
import { useThemeStore } from './store/themeStore'
import { useChatStore } from './store/chatStore'
import { LanguageProvider, useLanguage } from './locales'

// 欢迎屏幕组件
const WelcomeScreen = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <h2 className="text-2xl font-bold mb-4">{t.common.welcome}</h2>
      <p className="text-muted-foreground mb-8">{t.common.welcomeMessage}</p>
    </div>
  );
};

function App() {
  const { setTheme } = useThemeStore()
  const { activeChat, fetchChats } = useChatStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initApp = async () => {
      try {
        // 从 electron store 加载主题设置
        const themeSetting = await window.electron.settings.getByKey('theme')
        if (themeSetting && (themeSetting === 'light' || themeSetting === 'dark' || themeSetting === 'system')) {
          setTheme(themeSetting)
        }

        // 加载聊天记录
        await fetchChats()

        setLoading(false)
      } catch (error) {
        console.error('Error initializing app:', error)
        setLoading(false)
      }
    }

    initApp()
  }, [setTheme, fetchChats])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <LanguageProvider>
      <ThemeProvider defaultTheme="system" storageKey="forge-ui-theme">
        <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
          <Sidebar />
          {activeChat ? (
            <ChatWindow />
          ) : (
            <WelcomeScreen />
          )}
        </div>
      </ThemeProvider>
    </LanguageProvider>
  )
}

export default App