import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Mail } from 'lucide-react';
import { toast } from 'sonner';

const faqs = [
  {
    q: 'How do I get paid?',
    a: 'Request a payout from the Earnings tab once your available balance meets the minimum threshold. Payouts are processed monthly via Stripe.'
  },
  {
    q: 'When do I earn commission?',
    a: 'Basic members can refer people. You earn on the first qualifying purchase (one-time entry) and again if that person upgrades later — upgrade commissions stay with the original referrer.'
  },
  {
    q: 'What commission types exist?',
    a: 'One-time entry (books/basic package), membership upgrades, program purchases, and challenge signups. Rules are listed under Admin → Affiliates → Commission Rules.'
  },
  {
    q: 'Can I change my referral code?',
    a: 'Referral codes are assigned at enrollment. Contact support if you need a custom code for branding purposes.'
  },
  {
    q: 'What happens if I leave the program?',
    a: 'Your dashboard resets to the join screen, but your earnings history and pending payouts are preserved.'
  }
];

export function AffiliateHelpSupport() {
  const navigate = useNavigate();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const contact = () => {
    window.open('mailto:support@authenticbalance.app?subject=Affiliate%20Support', '_blank');
    toast.success('Opening email client…');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 px-4 flex items-center gap-3 border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-text">Help & Support</h1>
      </div>

      <div className="p-4 pb-24">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">FAQ</p>
        <div className="space-y-2 mb-6">
          {faqs.map((faq, i) => (
            <div key={faq.q} className="bg-surface border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left">
                <span className="text-sm font-bold text-text pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform ${openIdx === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openIdx === i && (
                <div className="px-4 pb-4 text-sm text-text-muted leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={contact}
          className="w-full flex items-center justify-center gap-2 h-12 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary-hover transition-colors">
          <Mail className="w-4 h-4" />
          Contact Support
        </button>
      </div>
    </div>
  );
}
