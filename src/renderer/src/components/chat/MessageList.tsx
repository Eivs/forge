import { Message } from '../../store/chatStore';
import Markdown from '../ui/markdown';
import { useEffect, useState } from 'react';
import { useLanguage } from '../../locales';
import ErrorMessage from './ErrorMessage';

interface MessageListProps {
  messages: Message[];
  isGenerating: boolean;
}

// Loading animation component
const LoadingDots = () => {
  const [dots, setDots] = useState('.');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '.' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <span className="text-muted-foreground animate-pulse">{dots}</span>;
};

const MessageList = ({ messages, isGenerating }: MessageListProps) => {
  const { t } = useLanguage();

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center max-w-md mx-auto bg-card rounded-lg p-8 shadow-md">
          <p className="text-muted-foreground text-base leading-relaxed">
            {t.common.welcomeMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {messages.map((message, index) => {
        const isLastAssistantMessage =
          message.role === 'assistant' && index === messages.length - 1 && isGenerating;
        return (
          <div
            key={message.id}
            className={`${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                {message.role === 'user' ? 'U' : message.role === 'assistant' ? 'A' : 'S'}
              </div>
              <div className="flex-1 overflow-hidden">
                {message.content.includes('**ERROR_TITLE:**') ? (
                  <ErrorMessage content={message.content} />
                ) : (
                  <Markdown>{message.content}</Markdown>
                )}
                {isLastAssistantMessage && message.content === '' && <LoadingDots />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
