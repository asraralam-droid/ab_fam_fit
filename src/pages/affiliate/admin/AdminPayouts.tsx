import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { updatePayoutStatus } from '../../../store/affiliateSlice';
import { motion } from 'framer-motion';
import { Check, X, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { AdminAffiliateGuard, AdminAffiliateHeader } from '../../admin/adminAffiliateUi';

export function AdminPayouts() {
  const dispatch = useDispatch();
  const { payoutQueue } = useSelector((state: RootState) => state.affiliate);

  const act = (id: string, status: 'approved' | 'rejected' | 'paid') => {
    dispatch(updatePayoutStatus({ id, status }));
    const labels = { approved: 'approved', rejected: 'rejected', paid: 'marked as paid' };
    toast.success(`Payout ${labels[status]}`);
  };

  const statusClass = (status: string) => {
    if (status === 'paid') return 'bg-accent-sage/20 text-accent-sage';
    if (status === 'rejected') return 'bg-red-500/15 text-red-600';
    if (status === 'approved') return 'bg-primary/10 text-primary';
    return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400';
  };

  return (
    <AdminAffiliateGuard>
      <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
        <AdminAffiliateHeader title="Payouts" backTo="/admin/affiliate" />
        <div className="p-4 flex flex-col gap-3">
      {payoutQueue.length === 0 ? (
        <div className="p-10 text-center text-sm text-text-muted">Payout queue is empty</div>
      ) : (
        payoutQueue.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-surface border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-text">{p.affiliateName}</p>
                <p className="text-xs text-text-muted">{p.requestedAt}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-text">${p.amount}</p>
                <span
                  className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${statusClass(p.status)}`}>
                  {p.status}
                </span>
              </div>
            </div>
            {p.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => act(p.id, 'approved')}
                  className="flex-1 h-9 bg-primary/10 text-primary rounded-xl font-bold text-xs flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => act(p.id, 'rejected')}
                  className="flex-1 h-9 bg-red-500/10 text-red-600 rounded-xl font-bold text-xs flex items-center justify-center gap-1">
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            )}
            {p.status === 'approved' && (
              <button
                onClick={() => act(p.id, 'paid')}
                className="w-full h-9 bg-accent-sage/15 text-accent-sage rounded-xl font-bold text-xs flex items-center justify-center gap-1">
                <Banknote className="w-3.5 h-3.5" /> Mark as Paid
              </button>
            )}
          </motion.div>
        ))
      )}
        </div>
      </div>
    </AdminAffiliateGuard>
  );
}
