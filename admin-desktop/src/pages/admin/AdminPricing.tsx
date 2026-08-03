import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { RootState } from '../../store';
import { adminSlice, PricingTier } from '../../store/adminSlice';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Power,
  X,
  Users,
  Crown,
  TrendingUp,
  DollarSign } from
'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SheetModal, ConfirmModal } from '../../components/modals';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell } from
'recharts';
const emptyDraft = (): PricingTier => ({
  id: '',
  name: '',
  price: 0,
  description: '',
  active: true
});
export function AdminPricing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { pricing, familySettings } = useSelector(
    (state: RootState) => state.admin
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<PricingTier>(emptyDraft());
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [familySizeDraft, setFamilySizeDraft] = useState(familySettings.maxSize);
  if (!user || user.role !== 'admin' && user.role !== 'staff') {
    return <Navigate to="/admin" replace />;
  }
  // Family stats
  const { avg, largest, atMax, distribution } = useMemo(() => {
    const sizes = familySettings.families.map((f) => f.size);
    const sum = sizes.reduce((a, b) => a + b, 0);
    const avg = sizes.length ? (sum / sizes.length).toFixed(1) : '0';
    const largest = Math.max(...sizes, 0);
    const atMax = familySettings.families.filter(
      (f) => f.size >= familySettings.maxSize
    ).length;
    // Distribution buckets 1–4, 5–8, 9–12, 13+
    const buckets = [
    {
      label: '1–4',
      value: 0
    },
    {
      label: '5–8',
      value: 0
    },
    {
      label: '9–12',
      value: 0
    },
    {
      label: '13+',
      value: 0
    }];

    sizes.forEach((s) => {
      if (s <= 4) buckets[0].value++;else
      if (s <= 8) buckets[1].value++;else
      if (s <= 12) buckets[2].value++;else
      buckets[3].value++;
    });
    return {
      avg,
      largest,
      atMax,
      distribution: buckets
    };
  }, [familySettings]);
  const openNew = () => {
    setDraft(emptyDraft());
    setIsEditing(false);
    setEditorOpen(true);
  };
  const openEdit = (t: PricingTier) => {
    setDraft({
      ...t
    });
    setIsEditing(true);
    setEditorOpen(true);
  };
  const save = () => {
    if (!draft.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (draft.price < 0) {
      toast.error('Price must be 0 or more');
      return;
    }
    const payload: PricingTier = {
      ...draft,
      name: draft.name.trim(),
      description: draft.description.trim(),
      id: isEditing ? draft.id : `tier-${Date.now()}`
    };
    if (isEditing) {
      dispatch(adminSlice.actions.updatePricingTier(payload));
      toast.success(`${payload.name} updated`);
    } else {
      dispatch(adminSlice.actions.addPricingTier(payload));
      toast.success(`${payload.name} created`);
    }
    setEditorOpen(false);
  };
  const remove = (id: string) => {
    const name = pricing.tiers.find((t) => t.id === id)?.name;
    dispatch(adminSlice.actions.deletePricingTier(id));
    setConfirmDelete(null);
    toast.success(`${name} deleted`);
  };
  const saveMaxSize = () => {
    if (familySizeDraft < 1) {
      toast.error('Must be at least 1');
      return;
    }
    dispatch(adminSlice.actions.setMaxFamilySize(familySizeDraft));
    toast.success(`Max family size set to ${familySizeDraft}`);
  };
  const sageColor =
  typeof window !== 'undefined' ?
  getComputedStyle(document.documentElement).
  getPropertyValue('--accent-sage').
  trim() || '#7E9568' :
  '#7E9568';
  const primaryColor =
  typeof window !== 'undefined' ?
  getComputedStyle(document.documentElement).
  getPropertyValue('--primary').
  trim() || '#2D1B5E' :
  '#2D1B5E';
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          
          <ArrowLeft className="w-6 h-6" strokeWidth={1.75} />
        </button>
        <h1 className="text-base font-bold text-text">Pricing & Family</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 pt-5">
        {/* === Pricing tiers === */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Pricing tiers ({pricing.currency})
            </h2>
            <button
              onClick={openNew}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              
              <Plus className="w-3.5 h-3.5" />
              Add tier
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {pricing.tiers.map((t) =>
            <motion.div
              key={t.id}
              initial={{
                opacity: 0,
                y: 6
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="bg-surface border border-border rounded-2xl p-4">
              
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-text text-sm">{t.name}</p>
                        <span
                        className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${t.active ? 'bg-accent-sage/15 text-accent-sage' : 'bg-text-muted/10 text-text-muted'}`}>
                        
                          {t.active ? 'active' : 'disabled'}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 leading-snug">
                        {t.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-extrabold text-primary">
                      ${t.price}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                  onClick={() =>
                  dispatch(adminSlice.actions.togglePricingTier(t.id))
                  }
                  className="flex-1 h-9 rounded-lg border border-border text-xs font-bold text-text hover:bg-surface-2 transition-colors flex items-center justify-center gap-1">
                  
                    <Power className="w-3 h-3" />
                    {t.active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                  onClick={() => openEdit(t)}
                  className="flex-1 h-9 rounded-lg border border-border text-xs font-bold text-text hover:bg-surface-2 transition-colors flex items-center justify-center gap-1">
                  
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                  onClick={() => setConfirmDelete(t.id)}
                  className="w-9 h-9 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center">
                  
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* === Family settings === */}
        <section>
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
            Family settings
          </h2>

          <div className="bg-surface border border-border rounded-2xl p-4 mb-4">
            <p className="text-sm font-bold text-text mb-1">Max family size</p>
            <p className="text-xs text-text-muted mb-3">
              Largest team a single family code can hold.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={familySizeDraft}
                onChange={(e) =>
                setFamilySizeDraft(Number(e.target.value) || 1)
                }
                className="flex-1 h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-lg font-bold text-text" />
              
              <button
                onClick={saveMaxSize}
                disabled={familySizeDraft === familySettings.maxSize}
                className="h-11 px-5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                
                Save
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-surface border border-border rounded-2xl p-3">
              <Users className="w-4 h-4 text-accent-sage mb-1.5" />
              <p className="text-xl font-extrabold text-text leading-tight">
                {avg}
              </p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                Avg size
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-3">
              <Crown className="w-4 h-4 text-accent-gold mb-1.5" />
              <p className="text-xl font-extrabold text-text leading-tight">
                {largest}
              </p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                Largest
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-3">
              <TrendingUp className="w-4 h-4 text-primary mb-1.5" />
              <p className="text-xl font-extrabold text-text leading-tight">
                {atMax}
              </p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                At max
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-3 mb-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-1">
              Family size distribution
            </p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)" />
                  
                  <XAxis
                    dataKey="label"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--text-muted)" />
                  
                  <YAxis hide />
                  <Tooltip
                    cursor={{
                      fill: 'transparent'
                    }}
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      fontSize: 12
                    }} />
                  
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {distribution.map((b, i) =>
                    <Cell
                      key={i}
                      fill={
                      b.label === '13+' ?
                      '#EF4444' :
                      b.label === '9–12' ?
                      sageColor :
                      primaryColor
                      } />

                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-1">
            All families
          </p>
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {familySettings.families.map((f, i) => {
              const isMax = f.size >= familySettings.maxSize;
              return (
                <div
                  key={f.id}
                  className={`p-3 flex items-center gap-3 ${i !== familySettings.families.length - 1 ? 'border-b border-border' : ''}`}>
                  
                  <div className="w-8 h-8 rounded-lg bg-surface-2 text-text flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {f.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text truncate">
                      {f.name}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold ${isMax ? 'text-accent-gold' : 'text-text-muted'}`}>
                    
                    {f.size} / {familySettings.maxSize}
                  </span>
                  {isMax &&
                  <span className="text-[9px] uppercase tracking-wider font-bold text-accent-gold bg-accent-gold/15 px-1.5 py-0.5 rounded">
                      Max
                    </span>
                  }
                </div>);

            })}
          </div>
        </section>
      </div>

      <SheetModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={isEditing ? 'Edit pricing tier' : 'New pricing tier'}
        panelClassName="max-h-[85vh]">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                    Name
                  </label>
                  <input
                  type="text"
                  value={draft.name}
                  onChange={(e) =>
                  setDraft({
                    ...draft,
                    name: e.target.value
                  })
                  }
                  placeholder="Lifetime Member"
                  className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none" />
                
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                    Price ({pricing.currency})
                  </label>
                  <input
                  type="number"
                  min={0}
                  step={1}
                  value={draft.price}
                  onChange={(e) =>
                  setDraft({
                    ...draft,
                    price: Number(e.target.value)
                  })
                  }
                  className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none" />
                
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                    Description
                  </label>
                  <textarea
                  value={draft.description}
                  onChange={(e) =>
                  setDraft({
                    ...draft,
                    description: e.target.value
                  })
                  }
                  placeholder="What's included?"
                  rows={3}
                  className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none" />
                
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
                
                  {isEditing ? 'Save changes' : 'Create tier'}
                </button>
              </div>
      </SheetModal>

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete pricing tier?"
        message="Existing customers on this tier aren't affected."
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && remove(confirmDelete)}
      />
    </div>);

}