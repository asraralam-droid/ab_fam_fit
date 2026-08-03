import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MoreVertical,
  Send,
  UserPlus,
  UserMinus,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { RootState } from '../../store';
import {
  addGroupMember,
  markDirectChatRead,
  markGroupChatRead,
  removeGroupMember,
  sendDirectMessage,
  sendGroupMessage,
  type DirectChat,
  type GroupChat
} from '../../store/chatSlice';
import { SheetModal } from '../../components/modals';
import {
  formatChatTime,
  formatMessageTime,
  getChatUserId,
  getMemberName
} from '../../utils/chatUser';

type ChatTab = 'direct' | 'group';
type ActiveThread =
  | { type: 'direct'; chat: DirectChat }
  | { type: 'group'; chat: GroupChat }
  | null;

type GroupMenuView = 'options' | 'members' | 'add' | 'remove';

export function Chat() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { members } = useSelector((state: RootState) => state.admin);
  const { directChats, groupChats } = useSelector(
    (state: RootState) => state.chat
  );

  const [tab, setTab] = useState<ChatTab>('direct');
  const [activeThread, setActiveThread] = useState<ActiveThread>(null);
  const [input, setInput] = useState('');
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const [groupMenuView, setGroupMenuView] = useState<GroupMenuView>('options');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = getChatUserId(user, members);
  const currentUserName = user?.name ?? 'You';
  const isPlatformAdmin = user?.role === 'admin';

  const myDirectChats = useMemo(
    () =>
      directChats
        .filter((c) => c.participantIds.includes(currentUserId))
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [directChats, currentUserId]
  );

  const myGroupChats = useMemo(
    () =>
      groupChats
        .filter((c) => c.memberIds.includes(currentUserId))
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [groupChats, currentUserId]
  );

  const totalUnread = useMemo(() => {
    const direct = myDirectChats.reduce((sum, c) => sum + c.unreadCount, 0);
    const group = myGroupChats.reduce((sum, c) => sum + c.unreadCount, 0);
    return direct + group;
  }, [myDirectChats, myGroupChats]);

  const openDirect = (chat: DirectChat) => {
    setActiveThread({ type: 'direct', chat });
    dispatch(markDirectChatRead(chat.id));
  };

  const openGroup = (chat: GroupChat) => {
    setActiveThread({ type: 'group', chat });
    dispatch(markGroupChatRead(chat.id));
  };

  const closeThread = () => {
    setActiveThread(null);
    setInput('');
  };

  const getOtherParticipant = (chat: DirectChat) => {
    const otherId =
      chat.participantIds.find((id) => id !== currentUserId) ??
      chat.participantIds[0];
    return getMemberName(otherId, members);
  };

  const getLastMessagePreview = (messages: DirectChat['messages']) => {
    const last = messages[messages.length - 1];
    if (!last) return 'No messages yet';
    return last.content;
  };

  const liveThread = useMemo(() => {
    if (!activeThread) return null;
    if (activeThread.type === 'direct') {
      const chat = directChats.find((c) => c.id === activeThread.chat.id);
      return chat ? { type: 'direct' as const, chat } : null;
    }
    const chat = groupChats.find((c) => c.id === activeThread.chat.id);
    return chat ? { type: 'group' as const, chat } : null;
  }, [activeThread, directChats, groupChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveThread?.chat.messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !liveThread) return;

    const message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      content: input.trim(),
      sentAt: new Date().toISOString()
    };

    if (liveThread.type === 'direct') {
      dispatch(
        sendDirectMessage({ chatId: liveThread.chat.id, message })
      );
    } else {
      dispatch(sendGroupMessage({ chatId: liveThread.chat.id, message }));
    }
    setInput('');
  };

  const closeGroupMenu = () => {
    setGroupMenuOpen(false);
    setGroupMenuView('options');
  };

  const handleAddMember = (memberId: string) => {
    if (!liveThread || liveThread.type !== 'group') return;
    dispatch(addGroupMember({ chatId: liveThread.chat.id, memberId }));
    toast.success(`${getMemberName(memberId, members)} added to group`);
    setGroupMenuView('members');
  };

  const handleRemoveMember = (memberId: string) => {
    if (!liveThread || liveThread.type !== 'group') return;
    if (memberId === currentUserId) {
      toast.error('You cannot remove yourself from here');
      return;
    }
    dispatch(removeGroupMember({ chatId: liveThread.chat.id, memberId }));
    toast.success(`${getMemberName(memberId, members)} removed from group`);
  };

  const addableMembers =
    liveThread?.type === 'group'
      ? members.filter(
          (m) =>
            m.status === 'active' &&
            !liveThread.chat.memberIds.includes(m.id)
        )
      : [];

  const removableMembers =
    liveThread?.type === 'group'
      ? liveThread.chat.memberIds.filter((id) => id !== currentUserId)
      : [];

  if (liveThread) {
    const title =
      liveThread.type === 'direct'
        ? getOtherParticipant(liveThread.chat)
        : `${liveThread.chat.icon} ${liveThread.chat.name}`;

    return (
      <div className="flex flex-col h-full bg-background">
        <div className="h-16 px-4 flex items-center justify-between border-b border-border bg-surface sticky top-0 z-10">
          <button
            type="button"
            onClick={closeThread}
            className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" strokeWidth={1.75} />
          </button>
          <div className="flex-1 min-w-0 text-center px-2">
            <h1 className="text-base font-bold text-text truncate">{title}</h1>
            {liveThread.type === 'group' && (
              <p className="text-[10px] text-text-muted">
                {liveThread.chat.memberIds.length} members
              </p>
            )}
          </div>
          {liveThread.type === 'group' ? (
            <button
              type="button"
              onClick={() => {
                setGroupMenuView('options');
                setGroupMenuOpen(true);
              }}
              className="p-2 -mr-2 text-text-muted hover:text-text hover:bg-surface-2 rounded-full transition-colors"
              aria-label="Group options">
              <MoreVertical className="w-5 h-5" strokeWidth={1.75} />
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {liveThread.chat.messages.map((msg) => {
              const isMine = msg.senderId === currentUserId;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  {liveThread.type === 'group' && !isMine && (
                    <span className="text-[10px] text-text-muted mb-1 ml-1">
                      {msg.senderName}
                    </span>
                  )}
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl ${
                      isMine
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-surface border border-border text-text rounded-tl-sm'
                    }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isMine ? 'text-white/70' : 'text-text-muted'
                      }`}>
                      {formatMessageTime(msg.sentAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-surface border-t border-border">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 h-11 px-4 rounded-full bg-surface-2 border border-border focus:border-primary outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 hover:bg-primary-hover transition-colors shrink-0">
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>

        <SheetModal
          open={groupMenuOpen}
          onClose={closeGroupMenu}
          title={
            groupMenuView === 'options'
              ? 'Group options'
              : groupMenuView === 'members'
                ? 'Group members'
                : groupMenuView === 'add'
                  ? 'Add member'
                  : 'Remove member'
          }>
          {groupMenuView === 'options' && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setGroupMenuView('members')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 text-left transition-colors">
                <Users className="w-5 h-5 text-primary" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-bold text-text">Group members</p>
                  <p className="text-xs text-text-muted">
                    View everyone in this chat
                  </p>
                </div>
              </button>
              {isPlatformAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => setGroupMenuView('add')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 text-left transition-colors">
                    <UserPlus
                      className="w-5 h-5 text-accent-sage"
                      strokeWidth={1.75}
                    />
                    <div>
                      <p className="text-sm font-bold text-text">Add member</p>
                      <p className="text-xs text-text-muted">
                        Admin only — invite someone to the group
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupMenuView('remove')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 text-left transition-colors">
                    <UserMinus
                      className="w-5 h-5 text-red-500"
                      strokeWidth={1.75}
                    />
                    <div>
                      <p className="text-sm font-bold text-text">
                        Remove member
                      </p>
                      <p className="text-xs text-text-muted">
                        Admin only — remove someone from the group
                      </p>
                    </div>
                  </button>
                </>
              )}
            </div>
          )}

          {groupMenuView === 'members' && liveThread.type === 'group' && (
            <div className="flex flex-col gap-2">
              {liveThread.chat.memberIds.map((memberId) => (
                <div
                  key={memberId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {getMemberName(memberId, members).charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text truncate">
                      {getMemberName(memberId, members)}
                      {memberId === currentUserId && (
                        <span className="text-text-muted font-normal"> (you)</span>
                      )}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {members.find((m) => m.id === memberId)?.email ?? memberId}
                    </p>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setGroupMenuView('options')}
                className="mt-2 text-sm font-semibold text-primary">
                Back
              </button>
            </div>
          )}

          {groupMenuView === 'add' && isPlatformAdmin && (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {addableMembers.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-6">
                  No members available to add
                </p>
              ) : (
                addableMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleAddMember(member.id)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 text-left transition-colors">
                    <div className="w-9 h-9 rounded-full bg-accent-sage/15 text-accent-sage flex items-center justify-center text-xs font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {member.email}
                      </p>
                    </div>
                    <UserPlus className="w-4 h-4 text-primary shrink-0" />
                  </button>
                ))
              )}
              <button
                type="button"
                onClick={() => setGroupMenuView('options')}
                className="mt-2 text-sm font-semibold text-primary">
                Back
              </button>
            </div>
          )}

          {groupMenuView === 'remove' && isPlatformAdmin && (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {removableMembers.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-6">
                  No members to remove
                </p>
              ) : (
                removableMembers.map((memberId) => (
                  <button
                    key={memberId}
                    type="button"
                    onClick={() => handleRemoveMember(memberId)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/5 text-left transition-colors">
                    <div className="w-9 h-9 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xs font-bold">
                      {getMemberName(memberId, members).charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text truncate">
                        {getMemberName(memberId, members)}
                      </p>
                    </div>
                    <UserMinus className="w-4 h-4 text-red-500 shrink-0" />
                  </button>
                ))
              )}
              <button
                type="button"
                onClick={() => setGroupMenuView('options')}
                className="mt-2 text-sm font-semibold text-primary">
                Back
              </button>
            </div>
          )}
        </SheetModal>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background pb-20">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border bg-surface sticky top-0 z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" strokeWidth={1.75} />
        </button>
        <h1 className="text-lg font-bold text-text">Messages</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 pt-4">
        <div className="flex p-1 bg-surface-2 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setTab('direct')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              tab === 'direct'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted'
            }`}>
            Direct
            {myDirectChats.some((c) => c.unreadCount > 0) && (
              <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-accent-gold" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab('group')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              tab === 'group'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted'
            }`}>
            Groups
            {myGroupChats.some((c) => c.unreadCount > 0) && (
              <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-accent-gold" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {tab === 'direct' ? (
          myDirectChats.length === 0 ? (
            <div className="p-10 text-center text-sm text-text-muted">
              No direct messages yet
            </div>
          ) : (
            myDirectChats.map((chat) => {
              const name = getOtherParticipant(chat);
              const last = chat.messages[chat.messages.length - 1];
              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => openDirect(chat)}
                  className="w-full flex items-center gap-3 p-4 bg-surface border border-border rounded-2xl hover:border-primary/30 transition-colors text-left">
                  <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-text truncate">
                        {name}
                      </p>
                      {last && (
                        <span className="text-[10px] text-text-muted shrink-0">
                          {formatChatTime(last.sentAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {getLastMessagePreview(chat.messages)}
                    </p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 bg-accent-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )
        ) : myGroupChats.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-muted">
            No group chats yet
          </div>
        ) : (
          myGroupChats.map((chat) => {
            const last = chat.messages[chat.messages.length - 1];
            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => openGroup(chat)}
                className="w-full flex items-center gap-3 p-4 bg-surface border border-border rounded-2xl hover:border-primary/30 transition-colors text-left">
                <div className="w-11 h-11 rounded-2xl bg-surface-2 flex items-center justify-center text-xl shrink-0">
                  {chat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-text truncate">
                      {chat.name}
                    </p>
                    {last && (
                      <span className="text-[10px] text-text-muted shrink-0">
                        {formatChatTime(last.sentAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted truncate mt-0.5">
                    {last
                      ? `${last.senderName}: ${last.content}`
                      : 'No messages yet'}
                  </p>
                  <p className="text-[10px] text-text-muted mt-1">
                    {chat.memberIds.length} members
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 bg-accent-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                    {chat.unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {totalUnread > 0 && (
        <p className="sr-only">{totalUnread} unread messages</p>
      )}
    </div>
  );
}
