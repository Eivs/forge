import { useState, useRef, KeyboardEvent } from 'react';
import { useChatStore } from '../../store/chatStore';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, StopCircle } from 'lucide-react';
import { useLanguage } from '../../locales';

interface ChatInputProps {
  chatId: number;
  isGenerating: boolean;
  onStopGeneration: () => void;
}

const ChatInput = ({ chatId, isGenerating, onStopGeneration }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const { addMessage, generateResponse } = useChatStore();
  const { t } = useLanguage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!message.trim() || isGenerating) return;

    // Add user message
    await addMessage(chatId, { role: 'user', content: message });
    setMessage('');

    // Generate response
    await generateResponse(chatId);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t.chat.typeMessage || 'Type a message...'} // Fallback in case the key doesn't exist yet
        className="min-h-[60px] resize-none chat-input flex-1 focus:ring-2 focus:ring-primary/20 transition-all"
        disabled={isGenerating}
      />

      <Button
        className="mb-1 shadow-sm hover:shadow-md transition-all"
        size="icon"
        disabled={!message.trim() && !isGenerating}
        onClick={isGenerating ? onStopGeneration : handleSubmit}
        variant={isGenerating ? 'destructive' : 'default'}
      >
        {isGenerating ? <StopCircle size={20} /> : <Send size={20} />}
      </Button>
    </div>
  );
};

export default ChatInput;
