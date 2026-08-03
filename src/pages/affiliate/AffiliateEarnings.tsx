import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { requestPayout } from '../../store/affiliateSlice';
import { motion } from 'framer-motion';
import { DollarSign, Wallet, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function AffiliateEarnings() {
  const dispatch = useDispatch();
  const { availableBalance, totalEarnings, pendingEarnings, payoutHistory } = useSelector(
    (state: RootState) => state.affiliate
  );

  const handlePayout = () => {
    if (availableBalance <= 0) {
      toast.error('No available balance to request');
      return;
    }
    dispatch(requestPayout());
    toast.success('Payout requested successfully');
  };

  const statusClass = (status: string) => {
    if (status === 'paid') return 'bg-accent-sage/20 text-accent-sage';
    if (status === 'rejected') return 'bg-red-500/15 text-red-600';
    if (status === 'processing') return 'bg-primary/10 text-primary';
    return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400';
  };

  return (
    <div className="p-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary text-white rounded-3xl p-5 mb-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80">
              Available balance
            </span>
          </div>
          <p className="text-4xl font-bold mb-4">${availableBalance}</p>
          <button
            onClick={handlePayout}
            disabled={availableBalance <= 0}
            className="w-full h-11 bg-white text-primary rounded-xl font-bold text-sm hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Request Payout
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <DollarSign className="w-4 h-4 text-accent-sage mb-2" />
          <p className="text-xl font-bold text-text">${totalEarnings}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Total Earned</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <Clock className="w-4 h-4 text-accent-lavender mb-2" />
          <p className="text-xl font-bold text-text">${pendingEarnings}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Pending Payouts</p>
        </div>
      </div>

      <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
        Payout history
      </h2>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {payoutHistory.length === 0 ? (
          <div className="p-8 text-center text-sm text-text-muted">No payouts yet</div>
        ) : (
          payoutHistory.map((p, i) => (
            <div
              key={p.id}
              className={`p-4 flex items-center justify-between ${i !== payoutHistory.length - 1 ? 'border-b border-border' : ''}`}>
              <div>
                <p className="text-sm font-bold text-text">${p.amount}</p>
                <p className="text-xs text-text-muted">{p.date}</p>
              </div>
              <span
                className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${statusClass(p.status)}`}>
                {p.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
