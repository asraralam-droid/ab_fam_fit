import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { RootState } from '../../store';
import { adminSlice, PromoCode } from '../../store/adminSlice';
import { ArrowLeft, Plus, Pencil, Trash2, Power, Ticket, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SheetModal, ConfirmModal } from '../../components/modals';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
const emptyDraft = (): PromoCode => ({
  id: '',
  code: '',
  discount: 10,
  uses: 0,
  maxUses: null,
  expires: null,
  active: true,
  createdAt: new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  })
});
export function AdminPromos() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { promoCodes } = useSelector((state: RootState) => state.admin);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<PromoCode>(emptyDraft());
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  if (!user || user.role !== 'admin' && user.role !== 'staff') {
    return <Navigate to="/home" replace />;
  }
  const openNew = () => {
    setDraft(emptyDraft());
    setIsEditing(false);
    setEditorOpen(true);
  };
  const openEdit = (p: PromoCode) => {
    setDraft({
      ...p
    });
    setIsEditing(true);
    setEditorOpen(true);
  };
  const save = () => {
    if (!draft.code.trim()) {
      toast.error('Code is required');
      return;
    }
    if (draft.discount < 1 || draft.discount > 100) {
      toast.error('Discount must be 1–100%');
      return;
    }
    const payload: PromoCode = {
      ...draft,
      code: draft.code.trim().toUpperCase(),
      id: isEditing ? draft.id : `p-${Date.now()}`
    };
    if (isEditing) {
      dispatch(adminSlice.actions.updatePromoCode(payload));
      toast.success(`${payload.code} updated`);
    } else {
      dispatch(adminSlice.actions.addPromoCode(payload));
      toast.success(`${payload.code} created`);
    }
    setEditorOpen(false);
  };
  const remove = (id: string) => {
    const code = promoCodes.find((p) => p.id === id)?.code;
    dispatch(adminSlice.actions.deletePromoCode(id));
    setConfirmDelete(null);
    toast.success(`${code} deleted`);
  };
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          
          <ArrowLeft className="w-6 h-6" strokeWidth={1.75} />
        </button>
        <h1 className="text-base font-bold text-text">Promo Codes</h1>
        <button
          onClick={openNew}
          className="p-2 -mr-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
          
          <Plus className="w-5 h-5" strokeWidth={1.75} />
        </button>
      </div>

      <div className="px-4 pt-5">
        <p className="text-sm text-text-muted mb-4">
          {promoCodes.filter((p) => p.active).length} active ·{' '}
          {promoCodes.length} total
        </p>

        <div className="flex flex-col gap-3">
          {promoCodes.length === 0 ?
          <div className="p-10 text-center text-sm text-text-muted bg-surface border border-border border-dashed rounded-2xl">
              No promo codes yet. Tap + to create one.
            </div> :

          promoCodes.map((p) =>
          <motion.div
            key={p.id}
            initial={{
              opacity: 0,
              y: 6
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="bg-surface border border-border rounded-2xl p-4">
            
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Ticket className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-lg font-extrabold text-primary tracking-wider">
                          {p.code}
                        </p>
                        <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${p.active ? 'bg-accent-sage/15 text-accent-sage' : 'bg-text-muted/10 text-text-muted'}`}>
                      
                          {p.active ? 'active' : 'disabled'}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        {p.discount}% off · {p.uses} uses
                        {p.maxUses ? ` / ${p.maxUses}` : ' · unlimited'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                  <div className="bg-surface-2 rounded-lg px-2.5 py-1.5">
                    <p className="text-[9px] text-text-muted uppercase tracking-wider font-bold">
                      Expires
                    </p>
                    <p className="font-bold text-text">
                      {p.expires || 'Never'}
                    </p>
                  </div>
                  <div className="bg-surface-2 rounded-lg px-2.5 py-1.5">
                    <p className="text-[9px] text-text-muted uppercase tracking-wider font-bold">
                      Created
                    </p>
                    <p className="font-bold text-text">{p.createdAt}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                onClick={() =>
                dispatch(adminSlice.actions.togglePromoActive(p.id))
                }
                className="flex-1 h-9 rounded-lg border border-border text-xs font-bold text-text hover:bg-surface-2 transition-colors flex items-center justify-center gap-1">
                
                    <Power className="w-3 h-3" />
                    {p.active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                onClick={() => openEdit(p)}
                className="flex-1 h-9 rounded-lg border border-border text-xs font-bold text-text hover:bg-surface-2 transition-colors flex items-center justify-center gap-1">
                
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                onClick={() => setConfirmDelete(p.id)}
                className="w-9 h-9 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center"
                aria-label="Delete">
                
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
          )
          }
        </div>
      </div>

      <SheetModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={isEditing ? 'Edit promo code' : 'New promo code'}
        panelClassName="max-h-[85vh]">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                    Code
                  </label>
                  <input
                  type="text"
                  value={draft.code}
                  onChange={(e) =>
                  setDraft({
                    ...draft,
                    code: e.target.value
                  })
                  }
                  placeholder="SUMMER25"
                  className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all uppercase tracking-wider font-bold text-text" />
                
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                    Discount (%)
                  </label>
                  <input
                  type="number"
                  min={1}
                  max={100}
                  value={draft.discount}
                  onChange={(e) =>
                  setDraft({
                    ...draft,
                    discount: Number(e.target.value)
                  })
                  }
                  className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                    Max uses (blank = unlimited)
                  </label>
                  <input
                  type="number"
                  min={0}
                  value={draft.maxUses ?? ''}
                  onChange={(e) =>
                  setDraft({
                    ...draft,
                    maxUses: e.target.value ? Number(e.target.value) : null
                  })
                  }
                  placeholder="Unlimited"
                  className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                    Expires
                  </label>
                  <input
                  type="text"
                  value={draft.expires ?? ''}
                  onChange={(e) =>
                  setDraft({
                    ...draft,
                    expires: e.target.value || null
                  })
                  }
                  placeholder="e.g. Dec 31, 2026 (blank = never)"
                  className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                
                </div>

                <ToggleSwitch
                  label="Active"
                  checked={draft.active}
                  onChange={(active) =>
                    setDraft({
                      ...draft,
                      active
                    })
                  }
                />

                <button
                onClick={save}
                className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">
                
                  {isEditing ? 'Save changes' : 'Create code'}
                </button>
              </div>
      </SheetModal>

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete promo code?"
        message="This action can't be undone. Existing redemptions stay."
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && remove(confirmDelete)}
      />
    </div>);

}