import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { notificationsSlice } from '../../store/slices';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Bell, Flame, BookOpen, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export function Notifications() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.notifications);
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
      default:
        return 'bg-primary/10';
    }
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

      <div className="flex-1 overflow-y-auto">
        {items.length > 0 ?
        <div className="flex flex-col">
            <AnimatePresence>
              {items.map((item) =>
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
              onClick={() => {
                // In a real app, this would mark as read and navigate
                if (item.type === 'meal') navigate('/home');
                if (item.type === 'learn') navigate('/learn');
              }}>
              
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
                  {!item.read &&
              <div className="w-2.5 h-2.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              }
                </motion.div>
            )}
            </AnimatePresence>
          </div> :

        <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-bold text-text mb-1">All caught up!</h3>
            <p className="text-text-muted text-sm">
              You have no new notifications.
            </p>
          </div>
        }
      </div>
    </div>);

}