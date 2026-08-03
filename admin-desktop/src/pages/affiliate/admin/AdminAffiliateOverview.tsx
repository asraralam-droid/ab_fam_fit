import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../store';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  UserCheck,
  Scale,
  ChevronRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { AdminAffiliateGuard, AdminAffiliateHeader } from '../../admin/adminAffiliateUi';

export function AdminAffiliateOverview() {
  const navigate = useNavigate();
  const {
    affiliates,
    allReferrals,
    revenueChart,
    commissionRules
  } = useSelector((state: RootState) => state.affiliate);

  const activeAffiliates = affiliates.filter((a) => a.status === 'active').length;

  const kpis = [
    { label: 'Active Affiliates', value: activeAffiliates, icon: Users, color: 'sage' },
    { label: 'Total Referrals', value: allReferrals.length, icon: UserPlus, color: 'primary' }
  ];

  const affiliateLinks = [
    {
      label: 'Affiliates',
      desc: `${affiliates.length} total · suspend & activate`,
      icon: UserCheck,
      to: '/admin/affiliate/affiliates'
    },
    {
      label: 'Commission Rules',
      desc: `${commissionRules.length} rules · create & edit`,
      icon: Scale,
      to: '/admin/affiliate/rules'
    },
    {
      label: 'Referrals',
      desc: `${allReferrals.length} total · cross-affiliate view`,
      icon: UserPlus,
      to: '/admin/affiliate/referrals'
    },
    // {
    //   label: 'Payouts',
    //   desc: `${pendingPayouts} pending · approve queue`,
    //   icon: Wallet,
    //   to: '/admin/affiliate/payouts'
    // },
    // {
    //   label: 'Fraud Alerts',
    //   desc: `${openFraud} open · review flags`,
    //   icon: ShieldAlert,
    //   to: '/admin/affiliate/fraud'
    // }
  ];

  const colorBg: Record<string, string> = {
    sage: 'bg-accent-sage/15 text-accent-sage',
    primary: 'bg-primary/10 text-primary',
    lavender: 'bg-accent-lavender/30 text-primary',
    gold: 'bg-accent-gold/20 text-accent-gold'
  };

  const cssVar = (name: string) =>
    typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue(name).trim()
      : '#2D1B5E';
  const primaryColor = cssVar('--primary') || '#2D1B5E';
  const sageColor = cssVar('--accent-sage') || '#7E9568';

  return (
    <AdminAffiliateGuard>
      <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
        <AdminAffiliateHeader title="Affiliates" />
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-5">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface border border-border rounded-2xl p-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${colorBg[kpi.color]}`}>
                  <kpi.icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-text">{kpi.value}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">{kpi.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-surface border border-border rounded-2xl p-4 mb-5">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">
              Revenue vs Commissions · 7 days
            </p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke={cssVar('--border') || '#DCD6C7'} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: cssVar('--text-muted') }} />
                  <YAxis tick={{ fontSize: 10, fill: cssVar('--text-muted') }} width={36} />
                  <Tooltip
                    contentStyle={{
                      background: cssVar('--surface') || '#fff',
                      border: `1px solid ${cssVar('--border')}`,
                      borderRadius: 12,
                      fontSize: 12
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke={primaryColor} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="commissions" name="Commissions" stroke={sageColor} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
            Manage
          </h3>
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {affiliateLinks.map((link, i, arr) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.label}
                  onClick={() => navigate(link.to)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-surface-2 transition-colors text-left ${
                    i !== arr.length - 1 ? 'border-b border-border' : ''
                  }`}>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text">{link.label}</p>
                    <p className="text-xs text-text-muted">{link.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AdminAffiliateGuard>
  );
}
