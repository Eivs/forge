import { useEffect, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { TrashIcon } from '@radix-ui/react-icons';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useLanguage } from '../../locales';

const ChatList = () => {
  const { chats, activeChat, setActiveChat, deleteChat, fetchChats } = useChatStore();
  const { t } = useLanguage();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const handleChatClick = (chatId: number) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setActiveChat(chat);
    }
  };

  const openDeleteDialog = (chat: { id: number; title: string }, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(chat);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteChat = async () => {
    if (chatToDelete) {
      await deleteChat(chatToDelete.id);
      setIsDeleteDialogOpen(false);
      setChatToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {chats.length === 0 ? (
          <div className="text-center text-muted-foreground bg-card-muted rounded-lg p-4">
            {t.common.noChatsYet}
          </div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all group ${
                activeChat?.id === chat.id
                  ? 'bg-primary/10 border-l-4 border-primary shadow-sm'
                  : 'hover:bg-accent hover:shadow-sm border-l-4 border-transparent'
              }`}
              onClick={() => handleChatClick(chat.id)}
            >
              <div className="truncate flex-1 font-medium">{chat.title}</div>

              <Button
                variant="ghost"
                size="icon"
                onClick={e => openDeleteDialog({ id: chat.id, title: chat.title }, e)}
                className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-destructive/10 transition-opacity"
                title={t.common.delete}
              >
                <TrashIcon className="h-[16px] w-[16px]" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog - Reused from ChatWindow.tsx */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{t.chat.deleteChat}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              {t.common.deleteConfirmation.replace('{name}', chatToDelete?.title || '')}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="shadow-sm"
            >
              {t.common.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDeleteChat} className="shadow-sm">
              {t.common.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatList;
