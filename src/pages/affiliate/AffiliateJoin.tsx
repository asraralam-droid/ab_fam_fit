import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { joinProgram } from '../../store/affiliateSlice';
import { Gift, Link2, DollarSign, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const steps = [
  {
    icon: Link2,
    title: 'Share your link',
    desc: 'Get a unique referral link to share with friends and followers.'
  },
  {
    icon: Users,
    title: 'They sign up',
    desc: 'When someone joins through your link, we track the referral.'
  },
  {
    icon: DollarSign,
    title: 'Earn commissions',
    desc: 'Get paid for every qualifying purchase your referrals make.'
  }
];

export function AffiliateJoin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleJoin = () => {
    dispatch(joinProgram());
    toast.success('Welcome to the affiliate program!');
    navigate('/affiliate', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-6">
        <Gift className="w-10 h-10" />
      </motion.div>
      <h1 className="text-2xl font-bold text-text mb-2">Become an Affiliate</h1>
      <p className="text-sm text-text-muted mb-8 max-w-xs">
        Earn commissions by referring new members to Authentic Balance. Basic
        members can refer — you still earn if they upgrade later.
      </p>

      <div className="w-full max-w-sm space-y-3 mb-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 bg-surface border border-border rounded-2xl p-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-accent-sage/15 text-accent-sage flex items-center justify-center flex-shrink-0">
              <step.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text">{step.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={handleJoin}
        className="w-full max-w-sm h-12 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary-hover transition-colors">
        Join Affiliate Program
      </button>
    </div>
  );
}
