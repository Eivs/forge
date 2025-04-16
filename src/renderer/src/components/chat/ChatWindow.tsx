import { useRef, useEffect, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import { InfoCircledIcon, GearIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import ChatSettingsDialog from './ChatSettingsDialog';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useLanguage } from '../../locales';

const ChatWindow = () => {
  const { activeChat, isGenerating, abortGeneration, renameChat, deleteChat } = useChatStore();
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    // 当消息变化时滚动到底部
    if (messagesEndRef.current) {
      requestIdleCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
      });
    }

    // 当活动聊天变化时更新标题
    if (activeChat) {
      setNewTitle(activeChat.title);
    }
  }, [activeChat?.messages, activeChat]);

  const handleRename = async () => {
    if (activeChat && newTitle.trim()) {
      await renameChat(activeChat.id, newTitle);
      setIsRenameOpen(false);
    }
  };

  const handleDelete = async () => {
    if (activeChat) {
      await deleteChat(activeChat.id);
      setIsDeleteOpen(false);
    }
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto bg-card rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold mb-4">{t.common.welcome}</h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            {t.common.welcomeMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {activeChat && (
        <>
          <div className="flex flex-col flex-1 h-full overflow-hidden bg-background">
            {/* 标题区域 */}
            <div
              id="chat-title"
              className="p-4 border-b border-border flex justify-between items-center bg-card shadow-sm"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{activeChat.title}</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <InfoCircledIcon className="h-[16px] w-[16px]" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover text-popover-foreground p-4 rounded-md shadow-md">
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Model:</strong> {activeChat.model.name}
                        </p>
                        <p>
                          <strong>Provider:</strong> {activeChat.model.provider.name}
                        </p>
                        <p>
                          <strong>Temperature:</strong> {activeChat.temperature}
                        </p>
                        <p>
                          <strong>Top-P:</strong> {activeChat.topP}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSettingsOpen(true)}
                  title={t.chat.settings}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <GearIcon className="h-[18px] w-[18px]" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsRenameOpen(true)}
                  title={t.chat.rename}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil1Icon className="h-[18px] w-[18px]" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDeleteOpen(true)}
                  title={t.chat.deleteChat}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <TrashIcon className="h-[18px] w-[18px]" />
                </Button>
              </div>
            </div>

            {/* 消息区域 */}
            <div id="chat-messages" className="flex-1 overflow-y-auto bg-background">
              <MessageList messages={activeChat.messages} isGenerating={isGenerating} />
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div id="chat-input" className="p-4 border-t border-border bg-card shadow-sm">
              <ChatInput
                chatId={activeChat.id}
                isGenerating={isGenerating}
                onStopGeneration={abortGeneration}
              />
            </div>
          </div>

          {/* Chat Settings Dialog */}
          <ChatSettingsDialog
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            chatId={activeChat.id}
          />

          {/* Rename Dialog */}
          <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.chat.renameChat}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  value={newTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                  placeholder={t.chat.enterNewTitle}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
                  {t.common.cancel}
                </Button>
                <Button onClick={handleRename}>{t.common.save}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.chat.deleteChat}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>{t.common.deleteConfirmation.replace('{name}', activeChat.title)}</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                  {t.common.cancel}
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  {t.common.delete}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};

export default ChatWindow;
