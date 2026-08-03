import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import {
  ArrowLeft,
  Copy,
  Share2,
  DollarSign,
  Users,
  TrendingUp,
  Gift } from
'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
export function Affiliate() {
  const navigate = useNavigate();
  const {
    referralCode,
    referralLink,
    totalEarnings,
    pendingEarnings,
    paidEarnings,
    totalReferrals,
    conversionRate,
    referrals
  } = useSelector((state: RootState) => state.affiliate);
  const copy = () => {
    navigator.clipboard?.writeText(referralLink);
    toast.success('Referral link copied');
  };
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-surface">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-text">Affiliate</h1>
        <div className="w-10" />
      </div>

      <div className="p-5">
        <motion.div
          initial={{
            opacity: 0,
            y: 8
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="bg-primary text-white rounded-3xl p-5 mb-5 relative overflow-hidden">
          
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-accent-sage/30 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80">
                Your earnings
              </span>
            </div>
            <p className="text-4xl font-bold mb-1">${totalEarnings}</p>
            <p className="text-sm opacity-80">
              ${pendingEarnings} pending · ${paidEarnings} paid
            </p>
          </div>
        </motion.div>

        <div className="bg-surface border border-border rounded-2xl p-4 mb-5">
          <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-2">
            Your referral link
          </p>
          <div className="flex items-center gap-2 bg-surface-2 rounded-xl p-3 border border-border mb-3">
            <span className="text-xs font-mono text-text flex-1 truncate">
              {referralLink}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copy}
              className="flex-1 h-11 bg-surface-2 border border-border text-text rounded-xl font-bold flex items-center justify-center gap-2 text-sm hover:bg-border transition-colors">
              
              <Copy className="w-4 h-4" /> Copy
            </button>
            <button
              onClick={() => {
                copy();
                toast.success('Ready to share — link copied');
              }}
              className="flex-1 h-11 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm hover:bg-primary-hover transition-colors shadow-md shadow-primary/20">
              
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
          <p className="text-[10px] text-text-muted mt-3 text-center font-medium">
            Code: <span className="font-bold text-primary">{referralCode}</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-surface border border-border rounded-2xl p-3 text-center">
            <Users className="w-4 h-4 text-accent-sage mx-auto mb-1" />
            <p className="text-lg font-bold text-text">{totalReferrals}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
              Referrals
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-3 text-center">
            <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-text">{conversionRate}%</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
              Conversion
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-3 text-center">
            <DollarSign className="w-4 h-4 text-accent-lavender mx-auto mb-1" />
            <p className="text-lg font-bold text-text">${pendingEarnings}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
              Pending
            </p>
          </div>
        </div>

        <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Recent referrals
        </h2>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {referrals.map((r, i) =>
          <div
            key={r.id}
            className={`p-4 flex items-center gap-3 ${i !== referrals.length - 1 ? 'border-b border-border' : ''}`}>
            
              <div className="w-9 h-9 rounded-full bg-accent-sage/20 text-accent-sage flex items-center justify-center font-bold text-sm flex-shrink-0">
                {r.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text truncate">{r.name}</p>
                <p className="text-xs text-text-muted truncate">
                  via {r.joinedVia} · {r.date}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text">+${r.reward}</p>
                <span
                className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${r.status === 'paid' ? 'bg-accent-sage/20 text-accent-sage' : r.status === 'pending' ? 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400' : 'bg-primary/10 text-primary'}`}>
                
                  {r.status}
                </span>
              </div>
            </div>
          )}
        </div>

        <p className="text-[11px] text-text-muted text-center mt-4">
          Earnings are paid out monthly via Stripe. Payouts processed by GHL.
        </p>
      </div>
    </div>);

}
