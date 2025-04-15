import { useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useLanguage } from '../../locales';
import { SessionsList, SessionListItem, SessionGroups, SessionsGroup } from 'reachat';
import { chatsToSessions } from '../../adapters/reachatAdapter';
import { Dialog } from 'reablocks';
import { Button } from '../ui/button-reablocks';

const ChatList = () => {
  const { chats, activeChat, setActiveChat, deleteChat, fetchChats } = useChatStore();
  const { t } = useLanguage();

  // 将 chats 转换为 reachat 的 sessions 格式
  const sessions = chatsToSessions(chats);
  const activeSessionId = activeChat?.id.toString();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // 处理会话选择
  const handleSelectSession = (sessionId: string) => {
    const chat = chats.find(c => c.id.toString() === sessionId);
    if (chat) {
      setActiveChat(chat);
    }
  };

  // 处理会话删除
  const handleDeleteSession = async (sessionId: string) => {
    // 显示确认对话框
    if (
      confirm(
        t.common.deleteConfirmation.replace(
          '{name}',
          chats.find(c => c.id.toString() === sessionId)?.title || ''
        )
      )
    ) {
      await deleteChat(parseInt(sessionId));
    }
  };

  // 按日期对会话进行分组
  const groupSessions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const groups = [
      {
        heading: t.common.today,
        sessions: sessions.filter(session => {
          const sessionDate = new Date(session.createdAt);
          return sessionDate >= today;
        }),
      },
      {
        heading: t.common.yesterday,
        sessions: sessions.filter(session => {
          const sessionDate = new Date(session.createdAt);
          return sessionDate >= yesterday && sessionDate < today;
        }),
      },
      {
        heading: t.common.lastWeek,
        sessions: sessions.filter(session => {
          const sessionDate = new Date(session.createdAt);
          return sessionDate >= lastWeek && sessionDate < yesterday;
        }),
      },
      {
        heading: t.common.lastMonth,
        sessions: sessions.filter(session => {
          const sessionDate = new Date(session.createdAt);
          return sessionDate >= lastMonth && sessionDate < lastWeek;
        }),
      },
      {
        heading: t.common.older,
        sessions: sessions.filter(session => {
          const sessionDate = new Date(session.createdAt);
          return sessionDate < lastMonth;
        }),
      },
    ];

    // 只返回有会话的组
    return groups.filter(group => group.sessions.length > 0);
  };

  return (
    <SessionsList>
      <SessionGroups>
        {() => {
          const groups = groupSessions();
          return (
            <>
              {groups.map(({ heading, sessions }) => (
                <SessionsGroup heading={heading} key={heading}>
                  {sessions.map(session => (
                    <SessionListItem key={session.id} session={session} />
                  ))}
                </SessionsGroup>
              ))}

              {sessions.length === 0 && (
                <div className="text-center text-muted-foreground bg-card-muted rounded-lg p-4">
                  {t.common.noChatsYet}
                </div>
              )}
            </>
          );
        }}
      </SessionGroups>
    </SessionsList>
  );
};

export default ChatList;
