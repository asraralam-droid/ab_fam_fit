import React from 'react';
import { Home, Users, Camera, Gift, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
export function BottomTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = [
  {
    id: 'home',
    path: '/home',
    icon: Home,
    label: 'Home'
  },
  {
    id: 'community',
    path: '/community',
    icon: Users,
    label: 'Community'
  },
  {
    id: 'log',
    path: '/log',
    icon: Camera,
    label: 'Log',
    isFab: true
  },
  {
    id: 'affiliate',
    path: '/affiliate',
    icon: Gift,
    label: 'Affiliates'
  },
  {
    id: 'profile',
    path: '/profile',
    icon: User,
    label: 'Profile'
  }];

  return (
    <div className="h-20 bg-surface border-t border-border sticky bottom-0 z-40 px-2 pb-safe">
      <div className="flex justify-around items-center h-full">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          const Icon = tab.icon;
          if (tab.isFab) {
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="relative -top-5 flex flex-col items-center justify-center"
                aria-label={tab.label}>
                
                <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 transform transition-transform active:scale-95 ring-4 ring-surface">
                  <Icon className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <span className="text-[10px] font-semibold mt-1 text-text-muted">
                  {tab.label}
                </span>
              </button>);

          }
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${isActive ? 'text-primary' : 'text-text-muted hover:text-text'}`}
              aria-label={tab.label}>
              
              <Icon
                className="w-[22px] h-[22px]"
                strokeWidth={isActive ? 2 : 1.5} />
              
              <span
                className={`text-[10px] tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                
                {tab.label}
              </span>
            </button>);

        })}
      </div>
    </div>);

}