import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { RootState } from '../../store';
import {
  PlatformActivityType,
  PLATFORM_ACTIVITY_TYPE_LABELS
} from '../../store/adminSlice';
import { ArrowLeft, ChevronDown } from 'lucide-react';

const TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Types' },
  ...(
    Object.entries(PLATFORM_ACTIVITY_TYPE_LABELS) as [
    PlatformActivityType,
    string][]
  ).map(([value, label]) => ({ value, label }))
];

const TIME_FILTER_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' }
] as const;

type TimeFilter = (typeof TIME_FILTER_OPTIONS)[number]['value'];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

function daysAgoFromIso(iso: string) {
  const then = new Date(iso + 'T12:00:00');
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.floor((now.getTime() - then.getTime()) / 86400000);
}

function matchesTimeFilter(daysAgo: number, filter: TimeFilter) {
  switch (filter) {
    case 'today':
      return daysAgo === 0;
    case '7d':
      return daysAgo <= 7;
    case '30d':
      return daysAgo <= 30;
    case '90d':
      return daysAgo <= 90;
    default:
      return true;
  }
}

export function AdminActivity() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { platformActivity } = useSelector((state: RootState) => state.admin);
  const [typeFilter, setTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return <Navigate to="/admin" replace />;
  }

  const filtered = useMemo(() => {
    return [...platformActivity].
    filter((item) => {
      const matchesType =
        typeFilter === 'all' || item.type === typeFilter;
      const daysAgo = daysAgoFromIso(item.occurredAt);
      const matchesTime = matchesTimeFilter(daysAgo, timeFilter);
      return matchesType && matchesTime;
    }).
    sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }, [platformActivity, typeFilter, timeFilter]);

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          
          <ArrowLeft className="w-6 h-6" strokeWidth={1.75} />
        </button>
        <h1 className="text-base font-bold text-text">Activity</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 pt-5 pb-2">
        <h2 className="text-2xl font-extrabold text-primary mb-1">
          Platform Activity
        </h2>
        <p className="text-sm text-text-muted mb-4">
          Browse member actions across the app — filter by type or time range.
        </p>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1 min-w-0">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full appearance-none bg-surface border border-border rounded-xl px-3 py-2.5 pr-9 text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-primary/20">
              
              {TYPE_FILTER_OPTIONS.map((opt) =>
              <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              )}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
              strokeWidth={1.75} />
            
          </div>
          <div className="relative flex-1 min-w-0">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="w-full appearance-none bg-surface border border-border rounded-xl px-3 py-2.5 pr-9 text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-primary/20">
              
              {TIME_FILTER_OPTIONS.map((opt) =>
              <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              )}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
              strokeWidth={1.75} />
            
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-2">
        {filtered.length === 0 ?
        <div className="bg-surface border border-border rounded-2xl p-8 text-center text-sm text-text-muted">
            No activity matches these filters.
          </div> :

        filtered.map((item) =>
        <div
          key={item.id}
          className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
          
            <div className="w-10 h-10 rounded-full bg-accent-sage text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {initials(item.userName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text truncate">
                {item.userName}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-text-muted border border-border px-2 py-0.5 rounded-full">
                  {PLATFORM_ACTIVITY_TYPE_LABELS[item.type]}
                </span>
                <span className="text-xs text-text-muted truncate">
                  {item.detail}
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-text-muted flex-shrink-0">
              {item.dateLabel}
            </span>
          </div>
        )
        }
      </div>
    </div>);

}
