import React from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const pageTitles: Record<string, string> = {
  '/affiliate': 'Affiliate',
  '/affiliate/earnings': 'Earnings',
  '/affiliate/profile': 'Profile'
};

export function AffiliateShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isEnrolled } = useSelector((state: RootState) => state.affiliate);

  if (!isEnrolled && location.pathname !== '/affiliate/join') {
    return <Navigate to="/affiliate/join" replace />;
  }

  if (isEnrolled && location.pathname === '/affiliate/join') {
    return <Navigate to="/affiliate" replace />;
  }

  const title = pageTitles[location.pathname] ?? 'Affiliate';

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="h-14 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-20">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-text">{title}</h1>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
