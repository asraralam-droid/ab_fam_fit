import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { RootState } from '../../store';
import {
  ArrowLeft,
  Users,
  Utensils,
  UserPlus,
  Activity as ActivityIcon,
  Shield,
  Ticket,
  Sparkles,
  BookOpen,
  ChevronRight,
  Gift } from
'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats, members, promoCodes, aiRecipes } = useSelector(
    (state: RootState) => state.admin
  );
  const { affiliates, allReferrals, payoutQueue } = useSelector(
    (state: RootState) => state.affiliate
  );
  const { challenges, dailyLogs } = useSelector(
    (state: RootState) => state.challenges
  );
  const activeChallenges = challenges.filter((c) => !c.completed);
  const exclusiveChallenges = challenges.filter((c) => c.isExclusive);
  const waitlistTotal = challenges.reduce(
    (sum, c) => sum + (c.waitlistCount ?? 0),
    0
  );
  const recentChallengeLogs = [...dailyLogs].slice(0, 5);
  if (!user || user.role !== 'admin' && user.role !== 'staff') {
    return <Navigate to="/home" replace />;
  }
  // Recent signups: last 5 by joinedAt (already roughly sorted in seed)
  const recentSignups = [...members].
  sort((a, b) => a.joinedAt < b.joinedAt ? 1 : -1).
  slice(0, 5);
  // Recent activity: pick most-recently active members
  const recentActivity = [...members].
  filter((m) =>
  ['min', 'hr', 'Yesterday'].some((k) => m.lastActive.includes(k))
  ).
  slice(0, 5);
  const todayLogs = stats.dailyFoodLogs[stats.dailyFoodLogs.length - 1].value;
  const todaySignups = stats.newSignups[stats.newSignups.length - 1].value;
  const totalMembers = members.length;
  const activePromos = promoCodes.filter((p) => p.active).length;
  const heroStats = [
  {
    label: 'Daily food logs',
    value: todayLogs,
    delta: '+24% vs yesterday',
    icon: Utensils,
    color: 'sage'
  },
  {
    label: 'New signups today',
    value: todaySignups,
    delta: '+12% wk/wk',
    icon: UserPlus,
    color: 'primary'
  },
  {
    label: 'Total members',
    value: totalMembers,
    delta: 'Paid entry',
    icon: Users,
    color: 'lavender'
  },
  {
    label: 'Active promos',
    value: activePromos,
    delta: `${promoCodes.length} total`,
    icon: Ticket,
    color: 'sage'
  }];

  const colorBg: Record<string, string> = {
    sage: 'bg-accent-sage/15 text-accent-sage',
    primary: 'bg-primary/10 text-primary',
    lavender: 'bg-accent-lavender/30 text-primary'
  };
  // Read CSS variables for chart colors
  const cssVar = (name: string) =>
  typeof window !== 'undefined' ?
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() :
  '#2D1B5E';
  const primaryColor = cssVar('--primary') || '#2D1B5E';
  const sageColor = cssVar('--accent-sage') || '#7E9568';
  const borderColor = cssVar('--border') || '#DCD6C7';
  const textMuted = cssVar('--text-muted') || '#6E6657';
  const adminLinks = [
  {
    label: 'Members',
    desc: `${totalMembers} total · search & manage`,
    icon: Users,
    to: '/admin/members'
  },
  {
    label: 'Activity',
    desc: 'Platform-wide logs · filter by type & time',
    icon: ActivityIcon,
    to: '/admin/activity'
  },
  {
    label: 'Content',
    desc: 'Recipes, categories, lessons, quotes',
    icon: Utensils,
    to: '/admin/content'
  },
  ...(user.role === 'admin' ?
  [
  {
    label: 'Programs',
    desc: 'Programs, books, PDF & audio tags',
    icon: BookOpen,
    to: '/admin/programs'
  }] :
  []),
  {
    label: 'Promo Codes',
    desc: `${activePromos} active · ${promoCodes.length} total`,
    icon: Ticket,
    to: '/admin/promos'
  },
  {
    label: 'AI Recipe Generator',
    desc: `${aiRecipes.length} generated`,
    icon: Sparkles,
    to: '/admin/recipes'
  },
  {
    label: 'Affiliates',
    desc: `${affiliates.filter((a) => a.status === 'active').length} active · ${allReferrals.length} referrals · ${payoutQueue.filter((p) => p.status === 'pending').length} pending payouts`,
    icon: Gift,
    to: '/admin/affiliate'
  }];

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          
          <ArrowLeft className="w-6 h-6" strokeWidth={1.75} />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h1 className="text-base font-bold text-text">Admin</h1>
        </div>
        <div className="w-10" />
      </div>

      <div className="px-4 pt-5 pb-2">
        <h2 className="text-2xl font-extrabold text-text mb-1">Overview</h2>
        <p className="text-sm text-text-muted">
          Live snapshot of your community.
        </p>
      </div>

      {/* Hero stats grid */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        {heroStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{
                opacity: 0,
                y: 6
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: i * 0.05
              }}
              className="bg-surface border border-border rounded-2xl p-4">
              
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${colorBg[s.color]}`}>
                
                <Icon className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <p className="text-2xl font-extrabold text-text leading-tight">
                {s.value}
              </p>
              <p className="text-[11px] text-text-muted font-semibold mb-0.5">
                {s.label}
              </p>
              <p className="text-[10px] text-accent-sage font-bold">
                {s.delta}
              </p>
            </motion.div>);

        })}
      </div>

      {/* Challenge metrics for Misty */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Challenge metrics
          </h3>
          <span className="text-xs font-bold text-primary">
            {dailyLogs.length} daily logs
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-surface border border-border rounded-xl p-3">
            <p className="text-lg font-extrabold text-text">
              {activeChallenges.length}
            </p>
            <p className="text-[10px] text-text-muted font-semibold">Active</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3">
            <p className="text-lg font-extrabold text-text">
              {exclusiveChallenges.length}
            </p>
            <p className="text-[10px] text-text-muted font-semibold">
              Exclusive
            </p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3">
            <p className="text-lg font-extrabold text-text">{waitlistTotal}</p>
            <p className="text-[10px] text-text-muted font-semibold">
              Waitlist
            </p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {recentChallengeLogs.length === 0 ? (
            <p className="p-4 text-sm text-text-muted text-center">
              No challenge daily logs yet.
            </p>
          ) : (
            recentChallengeLogs.map((log, i) => {
              const challenge = challenges.find(
                (c) => c.id === log.challengeId
              );
              return (
                <div
                  key={log.id}
                  className={`p-3 ${i !== recentChallengeLogs.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-text truncate">
                      {challenge?.title ?? 'Challenge'}
                    </p>
                    <span className="text-[10px] text-text-muted font-medium shrink-0">
                      {log.date}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    Water {log.waterGlasses}/8 · Mood {log.mood}/5
                    {log.weightLbs != null ? ` · ${log.weightLbs} lbs` : ''}
                  </p>
                  {log.meals && (
                    <p className="text-xs text-text mt-1 line-clamp-1">
                      {log.meals}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Daily food logs chart */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Daily food logs · last 7 days
          </h3>
          <span className="text-xs font-bold text-primary">
            {stats.dailyFoodLogs.reduce((a, b) => a + b.value, 0)} total
          </span>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-3">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyFoodLogs}>
                <defs>
                  <linearGradient id="logsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sageColor} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={sageColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke={borderColor}
                  strokeDasharray="3 3"
                  vertical={false} />
                
                <XAxis
                  dataKey="day"
                  stroke={textMuted}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false} />
                
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    border: `1px solid ${borderColor}`,
                    borderRadius: 12,
                    fontSize: 12
                  }}
                  labelStyle={{
                    color: textMuted,
                    fontWeight: 600
                  }} />
                
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={sageColor}
                  strokeWidth={2.5}
                  fill="url(#logsGrad)" />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* New signups chart */}
      <section className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            New signups · last 7 days
          </h3>
          <span className="text-xs font-bold text-primary">
            {stats.newSignups.reduce((a, b) => a + b.value, 0)} total
          </span>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-3">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.newSignups} barCategoryGap="22%">
                <CartesianGrid
                  stroke={borderColor}
                  strokeDasharray="3 3"
                  vertical={false} />
                
                <XAxis
                  dataKey="day"
                  stroke={textMuted}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false} />
                
                <YAxis hide />
                <Tooltip
                  cursor={{
                    fill: 'transparent'
                  }}
                  contentStyle={{
                    background: 'var(--surface)',
                    border: `1px solid ${borderColor}`,
                    borderRadius: 12,
                    fontSize: 12
                  }}
                  labelStyle={{
                    color: textMuted,
                    fontWeight: 600
                  }} />
                
                <Bar
                  dataKey="value"
                  fill={primaryColor}
                  radius={[6, 6, 0, 0]} />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Recent signups */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Recent signups
          </h3>
          <button
            onClick={() => navigate('/admin/members')}
            className="text-xs font-bold text-primary hover:underline">
            
            View all
          </button>
        </div>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {recentSignups.map((m, i) =>
          <div
            key={m.id}
            className={`p-3 flex items-center gap-3 ${i !== recentSignups.length - 1 ? 'border-b border-border' : ''}`}>
            
              <div className="w-9 h-9 rounded-full bg-accent-sage/20 text-accent-sage flex items-center justify-center font-bold text-sm flex-shrink-0">
                {m.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text truncate">{m.name}</p>
                <p className="text-xs text-text-muted truncate">{m.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-text">{m.plan}</p>
                <p className="text-[10px] text-text-muted">{m.joinedAt}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent activity */}
      <section className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Recent activity
          </h3>
          <button
            onClick={() => navigate('/admin/activity')}
            className="text-xs font-bold text-primary hover:underline">
            
            View all
          </button>
        </div>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {recentActivity.map((m, i) =>
          <div
            key={m.id}
            className={`p-3 flex items-center gap-3 ${i !== recentActivity.length - 1 ? 'border-b border-border' : ''}`}>
            
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <ActivityIcon className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text truncate">{m.name}</p>
                <p className="text-xs text-text-muted truncate">
                  Logged a meal · {m.lastActive}
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent-sage bg-accent-sage/15 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Admin module links */}
      <section className="px-4 mt-6">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
          Admin tools
        </h3>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {adminLinks.map((link, i, arr) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={() => navigate(link.to)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-surface-2 transition-colors text-left ${i !== arr.length - 1 ? 'border-b border-border' : ''}`}>
                
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text">{link.label}</p>
                  <p className="text-xs text-text-muted">{link.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </button>);

          })}
        </div>
      </section>
    </div>);

}