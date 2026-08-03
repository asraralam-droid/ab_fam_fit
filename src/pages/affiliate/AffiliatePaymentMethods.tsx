import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addPaymentMethod, PaymentMethod } from '../../store/affiliateSlice';
import { ArrowLeft, Plus, Building2, Wallet } from 'lucide-react';
import { SheetModal } from '../../components/modals';
import { toast } from 'sonner';

export function AffiliatePaymentMethods() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { paymentMethods } = useSelector((state: RootState) => state.affiliate);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'bank' | 'paypal'>('bank');
  const [label, setLabel] = useState('');
  const [detail, setDetail] = useState('');

  const save = () => {
    if (!label.trim() || !detail.trim()) {
      toast.error('All fields are required');
      return;
    }
    const method: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type,
      label: label.trim(),
      isDefault: paymentMethods.length === 0,
      ...(type === 'bank' ? { last4: detail.slice(-4) } : { email: detail.trim() })
    };
    dispatch(addPaymentMethod(method));
    toast.success('Payment method added');
    setOpen(false);
    setLabel('');
    setDetail('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-text">Payment Methods</h1>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 -mr-2 text-primary hover:bg-primary/10 rounded-full">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 pb-24 space-y-3">
        {paymentMethods.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-muted border border-dashed border-border rounded-2xl">
            No payment methods yet
          </div>
        ) : (
          paymentMethods.map((m) => (
            <div key={m.id} className="flex items-center gap-3 bg-surface border border-border rounded-2xl p-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {m.type === 'bank' ? <Building2 className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-text">{m.label}</p>
                <p className="text-xs text-text-muted">
                  {m.type === 'bank' ? `•••• ${m.last4}` : m.email}
                </p>
              </div>
              {m.isDefault && (
                <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-accent-sage/20 text-accent-sage">
                  default
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <SheetModal open={open} onClose={() => setOpen(false)} title="Add Payment Method">
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['bank', 'paypal'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize ${
                  type === t ? 'bg-primary text-white' : 'bg-surface-2 border border-border text-text-muted'
                }`}>
                {t === 'bank' ? 'Bank' : 'PayPal'}
              </button>
            ))}
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1.5 block">Label</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={type === 'bank' ? 'Chase Checking' : 'PayPal'}
              className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1.5 block">
              {type === 'bank' ? 'Account number' : 'PayPal email'}
            </label>
            <input
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm"
            />
          </div>
          <button onClick={save} className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm">
            Add Method
          </button>
        </div>
      </SheetModal>
    </div>
  );
}
