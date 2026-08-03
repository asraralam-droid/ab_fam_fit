import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { leaveProgram } from '../../store/affiliateSlice';
import { ChevronRight, Settings, CreditCard, HelpCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '../../components/modals';

export function AffiliateProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.affiliate);
  const [confirmLeave, setConfirmLeave] = React.useState(false);

  const links = [
    { label: 'Account Settings', desc: 'Name, email & notifications', icon: Settings, to: '/affiliate/profile/settings' },
    { label: 'Payment Methods', desc: 'Bank & PayPal accounts', icon: CreditCard, to: '/affiliate/profile/payment' },
    { label: 'Help & Support', desc: 'FAQ & contact support', icon: HelpCircle, to: '/affiliate/profile/help' }
  ];

  const handleLeave = () => {
    dispatch(leaveProgram());
    setConfirmLeave(false);
    toast.success('You have left the affiliate program');
    navigate('/affiliate/join', { replace: true });
  };

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center gap-4 bg-surface border border-border rounded-2xl p-4 mb-5">
        <div className="w-14 h-14 rounded-full bg-accent-sage text-white flex items-center justify-center font-bold text-lg">
          {profile.name.charAt(0)}
        </div>
        <div>
          <p className="text-base font-bold text-text">{profile.name}</p>
          <p className="text-sm text-text-muted">{profile.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        {links.map((link) => (
          <button
            key={link.to}
            onClick={() => navigate(link.to)}
            className="flex items-center gap-3 bg-surface border border-border rounded-2xl p-4 text-left hover:bg-surface-2 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <link.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text">{link.label}</p>
              <p className="text-xs text-text-muted">{link.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0" />
          </button>
        ))}
      </div>

      <button
        onClick={() => setConfirmLeave(true)}
        className="w-full flex items-center justify-center gap-2 h-12 border border-red-500/30 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-500/5 transition-colors">
        <LogOut className="w-4 h-4" />
        Leave Program
      </button>

      <ConfirmModal
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        onConfirm={handleLeave}
        title="Leave affiliate program?"
        message="You'll lose access to your dashboard until you rejoin. Your earnings history is preserved."
        confirmLabel="Leave Program"
      />
    </div>
  );
}
