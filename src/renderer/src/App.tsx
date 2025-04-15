import { useEffect, useState } from 'react';
import Sidebar from './components/sidebar/Sidebar';
import ChatWindow from './components/chat/ChatWindow';
import { useThemeStore, useSystemTheme } from './store/themeStore';
import { useChatStore } from './store/chatStore';
import { LanguageProvider, useLanguage } from './locales';
import { ThemeProvider } from 'reablocks';
import { lightTheme, darkTheme } from './styles/reablocks-theme';
import { Chat, ChatInput, SessionMessagePanel } from 'reachat';
import { chatsToSessions } from './adapters/reachatAdapter';
import { chatTheme } from './styles/reachat-theme';

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
  const { theme, setTheme } = useThemeStore();
  // 使用 useSystemTheme hook 来监听系统主题变化
  const systemTheme = useSystemTheme();
  const {
    chats,
    activeChat,
    setActiveChat,
    fetchChats,
    isGenerating,
    abortGeneration,
    addMessage,
    generateResponse,
  } = useChatStore();
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // 将当前的聊天数据转换为 reachat 期望的格式
  const sessions = chatsToSessions(chats);
  const activeSessionId = activeChat ? activeChat.id.toString() : undefined;

  // 处理发送消息
  const handleSendMessage = async (message: string) => {
    if (!activeChat) return;

    // 添加用户消息
    await addMessage(activeChat.id, { role: 'user', content: message });

    // 生成回复
    await generateResponse(activeChat.id);
  };

  // 处理停止生成
  const handleStopMessage = () => {
    abortGeneration();
  };

  const handleSelectSession = (sessionId: string) => {
    const chat = chats.find(c => c.id.toString() === sessionId);
    if (chat) {
      setActiveChat(chat);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (
      confirm(
        t.common.deleteConfirmation.replace(
          '{name}',
          chats.find(c => c.id.toString() === sessionId)?.title || ''
        )
      )
    ) {
      await window.electron.chats.delete(parseInt(sessionId));
    }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        // 从 electron store 加载主题设置
        const themeSetting = await window.electron.settings.getByKey('theme');
        if (
          themeSetting &&
          (themeSetting === 'light' || themeSetting === 'dark' || themeSetting === 'system')
        ) {
          setTheme(themeSetting);
        }

        // 加载聊天记录
        await fetchChats();

        setLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setLoading(false);
      }
    };

    initApp();
  }, [setTheme, fetchChats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 根据当前主题选择对应的 reablocks 主题
  const currentTheme =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark') ? darkTheme : lightTheme;

  return (
    <LanguageProvider>
      <ThemeProvider theme={currentTheme}>
          <Chat
          sessions={sessions}
          activeSessionId={activeSessionId}
          viewType="console"
          isLoading={isGenerating}
          onSendMessage={handleSendMessage}
          onStopMessage={handleStopMessage}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          theme={chatTheme}
        >
          <Sidebar />
          <SessionMessagePanel>
            {activeChat ? <ChatWindow /> : <WelcomeScreen />}
            <ChatInput placeholder={t.chat.typeMessage || 'Type a message...'} />
          </SessionMessagePanel>
        </Chat>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
