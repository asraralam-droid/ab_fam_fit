import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { setAffiliateStatus } from '../../../store/affiliateSlice';
import { motion } from 'framer-motion';
import { Users, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AdminAffiliateGuard, AdminAffiliateHeader } from '../../admin/adminAffiliateUi';

export function AdminAffiliatesList() {
  const dispatch = useDispatch();
  const { affiliates } = useSelector((state: RootState) => state.affiliate);

  const toggle = (id: string, current: 'active' | 'suspended') => {
    const next = current === 'active' ? 'suspended' : 'active';
    dispatch(setAffiliateStatus({ id, status: next }));
    const name = affiliates.find((a) => a.id === id)?.name;
    toast.success(`${name} ${next === 'active' ? 'activated' : 'suspended'}`);
  };

  return (
    <AdminAffiliateGuard>
      <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
        <AdminAffiliateHeader title="Affiliates" backTo="/admin/affiliate" />
        {affiliates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center p-4">
            <Users className="w-12 h-12 text-text-muted/40 mb-3" />
            <p className="text-sm font-bold text-text">No affiliates yet</p>
          </div>
        ) : (
    <div className="p-4 flex flex-col gap-3">
      {affiliates.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-accent-sage/20 text-accent-sage flex items-center justify-center font-bold">
              {a.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text truncate">{a.name}</p>
              <p className="text-xs text-text-muted truncate">{a.email}</p>
            </div>
            <span
              className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                a.status === 'active'
                  ? 'bg-accent-sage/20 text-accent-sage'
                  : 'bg-red-500/15 text-red-600'
              }`}>
              {a.status}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="bg-surface-2 rounded-xl py-2">
              <p className="text-sm font-bold text-text">{a.referralCount}</p>
              <p className="text-[9px] text-text-muted uppercase font-bold">Referrals</p>
            </div>
            <div className="bg-surface-2 rounded-xl py-2">
              <p className="text-sm font-bold text-text">${a.totalEarnings}</p>
              <p className="text-[9px] text-text-muted uppercase font-bold">Earnings</p>
            </div>
            <div className="bg-surface-2 rounded-xl py-2">
              <p className="text-xs font-bold text-primary">{a.referralCode}</p>
              <p className="text-[9px] text-text-muted uppercase font-bold">Code</p>
            </div>
          </div>
          <button
            onClick={() => toggle(a.id, a.status)}
            className={`w-full h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
              a.status === 'active'
                ? 'bg-red-500/10 text-red-600 hover:bg-red-500/15'
                : 'bg-accent-sage/15 text-accent-sage hover:bg-accent-sage/25'
            }`}>
            {a.status === 'active' ? (
              <><Ban className="w-4 h-4" /> Suspend</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Activate</>
            )}
          </button>
        </motion.div>
      ))}
    </div>
        )}
      </div>
    </AdminAffiliateGuard>
  );
}
