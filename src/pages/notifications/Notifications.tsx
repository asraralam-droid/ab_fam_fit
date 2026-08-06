import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { notificationsSlice } from '../../store/slices';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Bell,
  Flame,
  BookOpen,
  Utensils,
  Sparkles,
  Droplet,
  Heart,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Notifications() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, todaysPrompt } = useSelector(
    (state: RootState) => state.notifications
  );

  const handleMarkAllRead = () => {
    dispatch(notificationsSlice.actions.markAllRead());
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'meal':
        return <Utensils className="w-5 h-5 text-accent-sage" />;
      case 'learn':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'streak':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'hydration':
        return <Droplet className="w-5 h-5 text-sky-500" />;
      case 'daily':
        return <Sparkles className="w-5 h-5 text-primary" />;
      case 'motivation':
        return <Heart className="w-5 h-5 text-rose-500" />;
      case 'protocol':
        return <ShieldAlert className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'meal':
        return 'bg-accent-sage/10';
      case 'learn':
        return 'bg-blue-500/10';
      case 'streak':
        return 'bg-orange-500/10';
      case 'hydration':
        return 'bg-sky-500/10';
      case 'daily':
        return 'bg-primary/10';
      case 'motivation':
        return 'bg-rose-500/10';
      case 'protocol':
        return 'bg-orange-500/10';
      default:
        return 'bg-primary/10';
    }
  };

  const openNotification = (item: {
    id: string;
    type: string;
    message: string;
    link?: string;
  }) => {
    dispatch(notificationsSlice.actions.markNotificationRead(item.id));
    const goesToBestie =
      item.link === '/bestie' ||
      item.type === 'daily' ||
      item.type === 'motivation' ||
      item.type === 'protocol';

    if (goesToBestie) {
      const seedAsk =
        item.type === 'protocol'
          ? 'I got a protocol note on my meal. Can you help me pick a clean swap?'
          : item.message.toLowerCase().includes('check-in')
            ? 'My check-in is still open — can you help me stay accountable?'
            : item.message.toLowerCase().includes('obstacle')
              ? 'Remind me of my biggest obstacle and how to take one small step today.'
              : item.message;

      navigate('/bestie', {
        state: {
          seedMessage: seedAsk,
          notificationId: item.id
        }
      });
      return;
    }

    if (item.link) {
      navigate(item.link);
      return;
    }
    if (item.type === 'meal' || item.type === 'hydration') navigate('/home');
    if (item.type === 'learn') navigate('/programs');
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-text">Notifications</h1>
        <button
          onClick={handleMarkAllRead}
          className="p-2 -mr-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
          title="Mark all as read">
          <Check className="w-5 h-5" />
        </button>
      </div>

      {todaysPrompt && (
        <div className="px-4 pt-4">
          <div className="rounded-2xl border border-accent-sage/30 bg-accent-sage/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-accent-sage mb-1">
              Today&apos;s automated prompt
            </p>
            <p className="text-sm text-text leading-relaxed">{todaysPrompt}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {items.length > 0 ? (
          <div className="flex flex-col">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{
                    opacity: 0,
                    y: 10
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  className={`p-4 flex gap-4 border-b border-border cursor-pointer hover:bg-surface-2 transition-colors ${!item.read ? 'bg-primary/5' : 'bg-surface'}`}
                  onClick={() => openNotification(item)}>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getBgColor(item.type)}`}>
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 pt-1">
                    <p
                      className={`text-sm ${!item.read ? 'font-bold text-text' : 'font-medium text-text-muted'}`}>
                      {item.message}
                    </p>
                    <p className="text-xs text-text-muted mt-1">{item.time}</p>
                  </div>
                  {!item.read && (
                    <div className="w-2.5 h-2.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-text-muted p-8">
            <Bell className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
