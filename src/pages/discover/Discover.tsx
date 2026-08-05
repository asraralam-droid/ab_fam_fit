import React, { type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  ArrowLeft,
  Users,
  Trophy,
  Gift,
  GraduationCap,
  ChefHat,
  LayoutDashboard,
  MessageCircle,
  Bell,
  Shield,
  Scale,
  BookOpen,
  ChevronRight } from
'lucide-react';
import { motion } from 'framer-motion';
type Tile = {
  label: string;
  desc: string;
  icon: ComponentType<{
    className?: string;
  }>;
  to: string;
  accent: 'sage' | 'lavender' | 'primary';
  badge?: string;
};
export function Discover() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';
  const isAdminOrStaff = isAdmin || user?.role === 'staff';
  const tiles: Tile[] = [
  {
    label: 'Community',
    desc: 'Posts, groups, and conversations.',
    icon: Users,
    to: '/community',
    accent: 'sage'
  },
  {
    label: 'Recipes',
    desc: 'Browse meals, favorites, and filters.',
    icon: ChefHat,
    to: '/recipes',
    accent: 'lavender'
  },
  {
    label: 'Challenges',
    desc: 'Join, create, and lead the leaderboard.',
    icon: Trophy,
    to: '/challenges',
    accent: 'primary',
    badge: 'New'
  },
  {
    label: 'Affiliate',
    desc: 'Refer friends and earn rewards.',
    icon: Gift,
    to: '/affiliate',
    accent: 'lavender'
  },
  {
    label: 'Programs',
    desc: 'Modules, courses, and content series.',
    icon: GraduationCap,
    to: '/programs',
    accent: 'sage'
  },
  {
    label: 'Log Weight',
    desc: 'Track your latest weight entry.',
    icon: Scale,
    to: '/profile?tab=progress',
    accent: 'primary'
  },
  {
    label: 'Dashboard',
    desc: 'Your personalized home by pillar.',
    icon: LayoutDashboard,
    to: '/home',
    accent: 'primary'
  },
  {
    label: 'Authentic Bestie',
    desc: 'Your dedicated AI companion.',
    icon: MessageCircle,
    to: '/bestie',
    accent: 'sage'
  },
  {
    label: 'Notifications',
    desc: 'Updates from your team.',
    icon: Bell,
    to: '/notifications',
    accent: 'lavender'
  }];

  if (isAdmin) {
    tiles.push({
      label: 'Manage Programs',
      desc: 'Programs, books, PDF & audio tags.',
      icon: BookOpen,
      to: '/admin/programs',
      accent: 'primary'
    });
  }

  if (isAdminOrStaff) {
    tiles.push({
      label: 'Admin',
      desc: 'Team analytics and platform tools.',
      icon: Shield,
      to: '/admin',
      accent: 'primary'
    });
  }
  const accentClasses = {
    sage: 'bg-accent-sage/15 text-accent-sage',
    lavender: 'bg-accent-lavender/25 text-primary',
    primary: 'bg-primary/10 text-primary'
  };
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-surface">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-text">Discover</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 pt-5">
        <h2 className="text-2xl font-bold text-text mb-1">Explore</h2>
        <p className="text-sm text-text-muted mb-6">
          Everything Authentic Balance — in one place.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {tiles.map((tile, idx) => {
            const Icon = tile.icon;
            return (
              <motion.button
                key={tile.label}
                initial={{
                  opacity: 0,
                  y: 8
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay: idx * 0.03
                }}
                onClick={() => navigate(tile.to)}
                className="bg-surface border border-border rounded-2xl p-4 text-left shadow-sm hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.98] relative">
                
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accentClasses[tile.accent]}`}>
                  
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-text text-sm">{tile.label}</h3>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
                <p className="text-xs text-text-muted mt-1 leading-snug">
                  {tile.desc}
                </p>
                {tile.badge &&
                <span className="absolute top-3 right-3 text-[9px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    {tile.badge}
                  </span>
                }
              </motion.button>);

          })}
        </div>
      </div>
    </div>);

}