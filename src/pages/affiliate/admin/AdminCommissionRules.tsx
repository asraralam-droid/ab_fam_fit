import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Percent, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdminAffiliateGuard, AdminAffiliateHeader } from '../../admin/adminAffiliateUi';

export function AdminCommissionRules() {
  const { commissionRules } = useSelector((state: RootState) => state.affiliate);

  return (
    <AdminAffiliateGuard>
      <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
        <AdminAffiliateHeader title="Commission Rules" backTo="/admin/affiliate" />
        <div className="p-4 flex flex-col gap-3">
          {commissionRules.map((rule, i) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  {rule.type === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text">{rule.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {rule.type === 'percentage' ? `${rule.value}%` : `$${rule.value} fixed`}
                    {' · '}
                    {(rule.appliesTo ?? 'all').replace('_', '-')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminAffiliateGuard>
  );
}
