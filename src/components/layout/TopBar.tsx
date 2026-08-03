import React from 'react';
import { Bell, Menu, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getChatUserId } from '../../utils/chatUser';
export function TopBar() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.notifications);
  const { directChats, groupChats } = useSelector(
    (state: RootState) => state.chat
  );
  const { members } = useSelector((state: RootState) => state.admin);
  const unread = items.filter((i) => !i.read).length;

  const chatUserId = getChatUserId(user, members);

  const chatUnread =
    directChats
      .filter((c) => c.participantIds.includes(chatUserId))
      .reduce((sum, c) => sum + c.unreadCount, 0) +
    groupChats
      .filter((c) => c.memberIds.includes(chatUserId))
      .reduce((sum, c) => sum + c.unreadCount, 0);
  const initials =
  user?.name?.
  split(' ').
  map((p) => p[0]).
  slice(0, 2).
  join('').
  toUpperCase() || 'AB';
  return (
    <div className="h-16 px-4 flex items-center justify-between bg-surface border-b border-border sticky top-0 z-40">
      {/* Brand — left */}
      <button
        onClick={() => navigate('/home')}
        className="flex flex-col items-start leading-none -mt-0.5"
        aria-label="Go home">
        
        <span className="font-extrabold text-[18px] text-primary tracking-tight">
          Authentic Balance
        </span>
        <span className="text-[10px] text-text-muted tracking-wide font-medium mt-0.5">
          Institute
        </span>
      </button>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/discover')}
          aria-label="Open menu"
          className="w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
          
          <Menu className="w-5 h-5" strokeWidth={1.75} />
        </button>

        <button
          onClick={() => navigate('/chat')}
          aria-label="Messages"
          className="relative w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
          <MessageCircle className="w-5 h-5" strokeWidth={1.75} />
          {chatUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-accent-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface">
              {chatUnread > 9 ? '9+' : chatUnread}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
          
          <Bell className="w-5 h-5" strokeWidth={1.75} />
          {unread > 0 &&
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-accent-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface">
              {unread > 9 ? '9+' : unread}
            </span>
          }
        </button>

        {user?.role && user.role !== 'end-user' &&
        <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-full">
            {user.role}
          </span>
        }

        <button
          onClick={() => navigate('/profile')}
          aria-label="Profile"
          className="w-9 h-9 rounded-full bg-accent-sage text-white font-bold text-xs flex items-center justify-center ring-2 ring-surface shadow-sm hover:opacity-90 transition-opacity">
          
          {initials}
        </button>
      </div>
    </div>);

}