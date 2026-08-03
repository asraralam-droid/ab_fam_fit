import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { resolveFraudFlag, banAffiliateFromFraud } from '../../../store/affiliateSlice';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { AdminAffiliateGuard, AdminAffiliateHeader } from '../../admin/adminAffiliateUi';

export function AdminFraud() {
  const dispatch = useDispatch();
  const { fraudFlags } = useSelector((state: RootState) => state.affiliate);

  const riskClass = (level: string) => {
    if (level === 'high') return 'bg-red-500/15 text-red-600';
    if (level === 'medium') return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400';
    return 'bg-text-muted/10 text-text-muted';
  };

  const resolve = (id: string) => {
    dispatch(resolveFraudFlag(id));
    toast.success('Flag resolved');
  };

  const ban = (id: string) => {
    dispatch(banAffiliateFromFraud(id));
    toast.success('User banned — affiliate suspended');
  };

  return (
    <AdminAffiliateGuard>
      <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
        <AdminAffiliateHeader title="Fraud Alerts" backTo="/admin/affiliate" />
        <div className="p-4 flex flex-col gap-3">
      {fraudFlags.length === 0 ? (
        <div className="p-10 text-center text-sm text-text-muted">No fraud flags</div>
      ) : (
        fraudFlags.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-surface border border-border rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${riskClass(f.riskLevel)}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-text">{f.affiliateName}</p>
                  <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${riskClass(f.riskLevel)}`}>
                    {f.riskLevel} risk
                  </span>
                  {f.status === 'resolved' && (
                    <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-accent-sage/20 text-accent-sage">
                      resolved
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-1">{f.description}</p>
                <p className="text-[10px] text-text-muted mt-1">{f.flaggedAt}</p>
              </div>
            </div>
            {f.status === 'open' && (
              <div className="flex gap-2">
                <button
                  onClick={() => resolve(f.id)}
                  className="flex-1 h-9 bg-accent-sage/15 text-accent-sage rounded-xl font-bold text-xs flex items-center justify-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Resolve
                </button>
                <button
                  onClick={() => ban(f.id)}
                  className="flex-1 h-9 bg-red-500/10 text-red-600 rounded-xl font-bold text-xs flex items-center justify-center gap-1">
                  <Ban className="w-3.5 h-3.5" /> Ban User
                </button>
              </div>
            )}
          </motion.div>
        ))
      )}
        </div>
      </div>
    </AdminAffiliateGuard>
  );
}
