import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ArrowLeft } from 'lucide-react';

export function AdminAffiliateHeader({
  title,
  right,
  backTo = '/admin'
}: {
  title: string;
  right?: React.ReactNode;
  backTo?: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
      <button
        onClick={() => navigate(backTo)}
        className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
        <ArrowLeft className="w-6 h-6" strokeWidth={1.75} />
      </button>
      <h1 className="text-base font-bold text-text">{title}</h1>
      {right ?? <div className="w-10" />}
    </div>
  );
}

export function AdminAffiliateGuard({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((state: RootState) => state.auth);
  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}
