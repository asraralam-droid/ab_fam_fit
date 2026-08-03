import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { RootState } from '../../store';
import { adminSlice } from '../../store/adminSlice';
import {
  ArrowLeft,
  Search,
  Flame,
  ChevronDown,
  Pause,
  Play,
  Shield } from
'lucide-react';
import { toast } from 'sonner';
const planColors: Record<string, string> = {
  Books: 'bg-primary/10 text-primary',
  Coaching: 'bg-accent-sage/15 text-accent-sage',
  Challenge: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  Business: 'bg-accent-gold/20 text-accent-gold'
};
const statusColors: Record<string, string> = {
  active: 'bg-accent-sage/15 text-accent-sage',
  paused: 'bg-accent-gold/20 text-accent-gold',
  inactive: 'bg-text-muted/10 text-text-muted'
};
const roleColors: Record<string, string> = {
  admin: 'bg-primary text-white',
  staff: 'bg-accent-lavender/40 text-primary',
  'end-user': 'bg-surface-2 text-text-muted'
};
const filters = ['All', 'Active', 'Paused', 'Inactive'] as const;
type Filter = (typeof filters)[number];
export function AdminMembers() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { members } = useSelector((state: RootState) => state.admin);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!user || user.role !== 'admin' && user.role !== 'staff') {
    return <Navigate to="/home" replace />;
  }
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const matchesQuery =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q);
      const matchesFilter =
      filter === 'All' ||
      filter === 'Active' && m.status === 'active' ||
      filter === 'Paused' && m.status === 'paused' ||
      filter === 'Inactive' && m.status === 'inactive';
      return matchesQuery && matchesFilter;
    });
  }, [members, query, filter]);
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          
          <ArrowLeft className="w-6 h-6" strokeWidth={1.75} />
        </button>
        <h1 className="text-base font-bold text-text">Members</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 pt-4 sticky top-16 bg-background/95 backdrop-blur z-10 pb-3">
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
            strokeWidth={1.75} />
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-11 pl-9 pr-4 rounded-xl bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" />
          
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4">
          {filters.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 h-8 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${active ? 'bg-primary text-white border-primary' : 'bg-surface text-text border-border hover:border-primary/40'}`}>
                
                {f}
              </button>);

          })}
          <span className="ml-auto text-xs text-text-muted self-center font-medium">
            {filtered.length} member{filtered.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="px-4 mt-2 flex flex-col gap-2">
        {filtered.length === 0 ?
        <div className="p-10 text-center text-sm text-text-muted bg-surface border border-border border-dashed rounded-2xl">
            No members match your filters.
          </div> :

        filtered.map((m) => {
          const isOpen = expanded === m.id;
          return (
            <div
              key={m.id}
              className="bg-surface border border-border rounded-2xl overflow-hidden">
              
                <button
                onClick={() => setExpanded(isOpen ? null : m.id)}
                className="w-full p-3 flex items-center gap-3 hover:bg-surface-2 transition-colors text-left">
                
                  <div className="w-10 h-10 rounded-full bg-accent-sage text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-text truncate">
                        {m.name}
                      </p>
                      {m.role !== 'end-user' &&
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${roleColors[m.role]}`}>
                      
                          {m.role}
                        </span>
                    }
                    </div>
                    <p className="text-xs text-text-muted truncate">
                      {m.email}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                    className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${planColors[m.plan]}`}>
                    
                      {m.plan}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-orange-500">
                      <Flame className="w-3 h-3 fill-orange-500" />
                      {m.streak}
                    </span>
                  </div>
                  <ChevronDown
                  className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                
                </button>

                {isOpen &&
              <div className="border-t border-border bg-surface-2/40 p-4 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-0.5">
                          Joined
                        </p>
                        <p className="font-semibold text-text">{m.joinedAt}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-0.5">
                          Last active
                        </p>
                        <p className="font-semibold text-text">
                          {m.lastActive}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-0.5">
                          Status
                        </p>
                        <span
                      className={`inline-block text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${statusColors[m.status]}`}>
                      
                          {m.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-0.5">
                          Plan
                        </p>
                        <span
                      className={`inline-block text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${planColors[m.plan]}`}>
                      
                          {m.plan}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border">
                      <select
                    value={m.role}
                    onChange={(e) => {
                      dispatch(
                        adminSlice.actions.updateMemberRole({
                          id: m.id,
                          role: e.target.value as any
                        })
                      );
                      toast.success(`Role updated for ${m.name}`);
                    }}
                    className="flex-1 h-9 px-3 rounded-lg bg-surface border border-border text-xs font-semibold text-text outline-none focus:border-primary">
                    
                        <option value="end-user">Member</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                    onClick={() => {
                      dispatch(adminSlice.actions.toggleMemberStatus(m.id));
                      toast.success(
                        m.status === 'active' ?
                        `${m.name} paused` :
                        `${m.name} activated`
                      );
                    }}
                    className="px-3 h-9 rounded-lg bg-surface border border-border text-xs font-bold text-text hover:bg-surface-2 transition-colors flex items-center gap-1">
                    
                        {m.status === 'active' ?
                    <>
                            <Pause className="w-3 h-3" /> Pause
                          </> :

                    <>
                            <Play className="w-3 h-3" /> Activate
                          </>
                    }
                      </button>
                    </div>
                  </div>
              }
              </div>);

        })
        }
      </div>
    </div>);

}