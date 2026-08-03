import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import {
  addCommissionRule,
  updateCommissionRule,
  deleteCommissionRule,
  CommissionRule
} from '../../../store/affiliateSlice';
import { Plus, Pencil, Trash2, Percent, DollarSign } from 'lucide-react';
import { SheetModal, ConfirmModal } from '../../../components/modals';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AdminAffiliateGuard, AdminAffiliateHeader } from '../../admin/adminAffiliateUi';

const emptyRule = (): CommissionRule => ({
  id: '',
  name: '',
  type: 'percentage',
  value: 10
});

export function AdminCommissionRules() {
  const dispatch = useDispatch();
  const { commissionRules } = useSelector((state: RootState) => state.affiliate);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CommissionRule>(emptyRule());
  const [editing, setEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNew = () => {
    setDraft(emptyRule());
    setEditing(false);
    setOpen(true);
  };

  const openEdit = (rule: CommissionRule) => {
    setDraft({ ...rule });
    setEditing(true);
    setOpen(true);
  };

  const save = () => {
    if (!draft.name.trim()) {
      toast.error('Name is required');
      return;
    }
    const payload = { ...draft, id: editing ? draft.id : `rule-${Date.now()}` };
    if (editing) {
      dispatch(updateCommissionRule(payload));
      toast.success('Rule updated');
    } else {
      dispatch(addCommissionRule(payload));
      toast.success('Rule created');
    }
    setOpen(false);
  };

  const remove = () => {
    if (!deleteId) return;
    dispatch(deleteCommissionRule(deleteId));
    toast.success('Rule deleted');
    setDeleteId(null);
  };

  return (
    <AdminAffiliateGuard>
      <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
        <AdminAffiliateHeader
          title="Commission Rules"
          backTo="/admin/affiliate"
          right={
            <button
              onClick={openNew}
              className="p-2 -mr-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
              {/* <Plus className="w-5 h-5" strokeWidth={1.75} /> */}
            </button>
          }
        />
      <div className="p-4 flex flex-col gap-3">
        {commissionRules.map((rule, i) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-surface border border-border rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                {rule.type === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text">{rule.name}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {rule.type === 'percentage' ? `${rule.value}%` : `$${rule.value} fixed`}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(rule)} className="p-2 text-text-muted hover:text-primary rounded-lg">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteId(rule.id)} className="p-2 text-text-muted hover:text-red-600 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <SheetModal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Rule' : 'New Rule'}>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1.5 block">Name</label>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm"
            />
          </div>
          <div className="flex gap-2">
            {(['percentage', 'fixed'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setDraft({ ...draft, type: t })}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize ${
                  draft.type === t ? 'bg-primary text-white' : 'bg-surface-2 border border-border text-text-muted'
                }`}>
                {t}
              </button>
            ))}
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1.5 block">Value</label>
            <input
              type="number"
              value={draft.value}
              onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })}
              className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm"
            />
          </div>
          <button onClick={save} className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm">
            {editing ? 'Save Changes' : 'Create Rule'}
          </button>
        </div>
      </SheetModal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete rule?"
        message="This commission rule will be permanently removed."
        confirmLabel="Delete"
      />
      </div>
    </AdminAffiliateGuard>
  );
}
