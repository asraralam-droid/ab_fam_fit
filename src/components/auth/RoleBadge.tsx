import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Briefcase, User } from 'lucide-react';
import type { UserRole } from '../../store/slices';
const roleMeta: Record<
  UserRole,
  {
    label: string;
    icon: ComponentType<{
      className?: string;
    }>;
  }> =
{
  admin: {
    label: 'Admin',
    icon: Shield
  },
  staff: {
    label: 'Staff',
    icon: Briefcase
  },
  'end-user': {
    label: 'Member',
    icon: User
  }
};
export function RoleBadge({
  role,
  intent



}: {role: UserRole;intent: 'login' | 'signup';}) {
  const meta = roleMeta[role];
  const Icon = meta.icon;
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border mb-6">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted">
            {intent === 'signup' ? 'Signing up as' : 'Signing in as'}
          </span>
          <span className="text-sm font-semibold text-text">{meta.label}</span>
        </div>
      </div>
      <Link
        to="/role-select"
        state={{
          intent
        }}
        replace
        className="text-xs font-semibold text-primary hover:underline">
        
        Change
      </Link>
    </div>);

}