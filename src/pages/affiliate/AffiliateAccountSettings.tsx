import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateProfile } from '../../store/affiliateSlice';
import { ArrowLeft } from 'lucide-react';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { toast } from 'sonner';

export function AffiliateAccountSettings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.affiliate);
  const [draft, setDraft] = useState({ ...profile });

  const save = () => {
    if (!draft.name.trim() || !draft.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    dispatch(updateProfile(draft));
    toast.success('Settings saved');
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 px-4 flex items-center gap-3 border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-text">Account Settings</h1>
      </div>

      <div className="p-4 flex-1 pb-24">
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1.5 block">Name</label>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm text-text"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1.5 block">Email</label>
            <input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm text-text"
            />
          </div>
        </div>

        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Notifications</p>
        <div className="space-y-2 mb-6">
          <ToggleSwitch
            checked={draft.notifyNewReferral}
            onChange={(v) => setDraft({ ...draft, notifyNewReferral: v })}
            label="New referral alerts"
          />
          <ToggleSwitch
            checked={draft.notifyPayout}
            onChange={(v) => setDraft({ ...draft, notifyPayout: v })}
            label="Payout updates"
          />
          <ToggleSwitch
            checked={draft.notifyPromo}
            onChange={(v) => setDraft({ ...draft, notifyPromo: v })}
            label="Promotional emails"
          />
        </div>

        <button
          onClick={save}
          className="w-full h-12 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary-hover transition-colors">
          Save
        </button>
      </div>
    </div>
  );
}
