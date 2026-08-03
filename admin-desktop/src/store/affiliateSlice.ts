import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AffiliateReferral {
  id: string;
  name: string;
  joinedVia: string;
  status: 'pending' | 'active' | 'paid' | 'converted';
  reward: number;
  purchaseValue: number;
  date: string;
  affiliateId: string;
}

export type AffiliateViewMode = 'affiliate' | 'admin';

export interface CommissionRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
}

export interface AdminAffiliate {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended';
  referralCount: number;
  totalEarnings: number;
  referralCode: string;
}

export interface AffiliatePayout {
  id: string;
  affiliateId: string;
  affiliateName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestedAt: string;
}

export interface FraudFlag {
  id: string;
  affiliateId: string;
  affiliateName: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
  flaggedAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'bank' | 'paypal';
  label: string;
  last4?: string;
  email?: string;
  isDefault: boolean;
}

export interface PayoutRecord {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'rejected';
  date: string;
}

export interface AffiliateProfile {
  name: string;
  email: string;
  notifyNewReferral: boolean;
  notifyPayout: boolean;
  notifyPromo: boolean;
}

export interface ChartDataPoint {
  day: string;
  revenue: number;
  commissions: number;
}

export interface AffiliateState {
  isEnrolled: boolean;
  viewMode: AffiliateViewMode;
  referralCode: string;
  referralLink: string;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  availableBalance: number;
  totalReferrals: number;
  conversionRate: number;
  referrals: AffiliateReferral[];
  profile: AffiliateProfile;
  paymentMethods: PaymentMethod[];
  payoutHistory: PayoutRecord[];
  affiliates: AdminAffiliate[];
  commissionRules: CommissionRule[];
  allReferrals: AffiliateReferral[];
  payoutQueue: AffiliatePayout[];
  fraudFlags: FraudFlag[];
  revenueChart: ChartDataPoint[];
}

const CURRENT_AFFILIATE_ID = 'aff-me';

const seedReferrals: AffiliateReferral[] = [
  {
    id: 'r1',
    name: 'Jordan Lee',
    joinedVia: '7-Day Juice Reset',
    status: 'converted',
    reward: 24,
    purchaseValue: 79,
    date: '2026-06-09',
    affiliateId: CURRENT_AFFILIATE_ID
  },
  {
    id: 'r2',
    name: 'Alex Chen',
    joinedVia: 'Foundations Program',
    status: 'converted',
    reward: 49,
    purchaseValue: 149,
    date: '2026-06-04',
    affiliateId: CURRENT_AFFILIATE_ID
  },
  {
    id: 'r3',
    name: 'Priya Singh',
    joinedVia: 'JAB Book Series',
    status: 'pending',
    reward: 40,
    purchaseValue: 99,
    date: '2026-06-08',
    affiliateId: CURRENT_AFFILIATE_ID
  },
  {
    id: 'r4',
    name: 'Marcus Hill',
    joinedVia: '7-Day Juice Reset',
    status: 'converted',
    reward: 24,
    purchaseValue: 79,
    date: '2026-05-28',
    affiliateId: CURRENT_AFFILIATE_ID
  }
];

const seedAllReferrals: AffiliateReferral[] = [
  ...seedReferrals,
  {
    id: 'r5',
    name: 'Sam Rivera',
    joinedVia: 'Foundations Program',
    status: 'converted',
    reward: 35,
    purchaseValue: 149,
    date: '2026-06-07',
    affiliateId: 'aff-2'
  },
  {
    id: 'r6',
    name: 'Taylor Brooks',
    joinedVia: '7-Day Juice Reset',
    status: 'pending',
    reward: 18,
    purchaseValue: 79,
    date: '2026-06-10',
    affiliateId: 'aff-3'
  },
  {
    id: 'r7',
    name: 'Casey Nguyen',
    joinedVia: 'JAB Book Series',
    status: 'converted',
    reward: 42,
    purchaseValue: 99,
    date: '2026-06-06',
    affiliateId: 'aff-2'
  }
];

const initialState: AffiliateState = {
  isEnrolled: true,
  viewMode: 'affiliate',
  referralCode: 'MISTY24',
  referralLink: 'https://authenticbalance.app/r/MISTY24',
  totalEarnings: 248,
  pendingEarnings: 64,
  paidEarnings: 184,
  availableBalance: 64,
  totalReferrals: 12,
  conversionRate: 38,
  referrals: seedReferrals,
  profile: {
    name: 'Misty Johnson',
    email: 'misty@example.com',
    notifyNewReferral: true,
    notifyPayout: true,
    notifyPromo: false
  },
  paymentMethods: [
    {
      id: 'pm-1',
      type: 'bank',
      label: 'Chase Checking',
      last4: '4821',
      isDefault: true
    },
    {
      id: 'pm-2',
      type: 'paypal',
      label: 'PayPal',
      email: 'misty@example.com',
      isDefault: false
    }
  ],
  payoutHistory: [
    { id: 'ph-1', amount: 120, status: 'paid', date: 'Apr 1, 2026' },
    { id: 'ph-2', amount: 64, status: 'paid', date: 'Mar 1, 2026' },
    { id: 'ph-3', amount: 48, status: 'processing', date: 'May 28, 2026' }
  ],
  affiliates: [
    {
      id: CURRENT_AFFILIATE_ID,
      name: 'Misty Johnson',
      email: 'misty@example.com',
      status: 'active',
      referralCount: 12,
      totalEarnings: 248,
      referralCode: 'MISTY24'
    },
    {
      id: 'aff-2',
      name: 'Jordan Lee',
      email: 'jordan@example.com',
      status: 'active',
      referralCount: 8,
      totalEarnings: 186,
      referralCode: 'JORDAN88'
    },
    {
      id: 'aff-3',
      name: 'Alex Chen',
      email: 'alex@example.com',
      status: 'active',
      referralCount: 5,
      totalEarnings: 92,
      referralCode: 'ALEXFIT'
    },
    {
      id: 'aff-4',
      name: 'Priya Singh',
      email: 'priya@example.com',
      status: 'suspended',
      referralCount: 3,
      totalEarnings: 45,
      referralCode: 'PRIYA23'
    }
  ],
  commissionRules: [
    { id: 'rule-1', name: 'Program Purchase', type: 'percentage', value: 25 },
    { id: 'rule-2', name: 'Book Sales', type: 'percentage', value: 15 },
    { id: 'rule-3', name: 'Challenge Signup', type: 'fixed', value: 10 }
  ],
  allReferrals: seedAllReferrals,
  payoutQueue: [
    {
      id: 'po-1',
      affiliateId: CURRENT_AFFILIATE_ID,
      affiliateName: 'Misty Johnson',
      amount: 64,
      status: 'pending',
      requestedAt: 'Jun 5, 2026'
    },
    {
      id: 'po-2',
      affiliateId: 'aff-2',
      affiliateName: 'Jordan Lee',
      amount: 120,
      status: 'pending',
      requestedAt: 'Jun 4, 2026'
    },
    {
      id: 'po-3',
      affiliateId: 'aff-3',
      affiliateName: 'Alex Chen',
      amount: 45,
      status: 'approved',
      requestedAt: 'Jun 1, 2026'
    }
  ],
  fraudFlags: [
    {
      id: 'fr-1',
      affiliateId: 'aff-4',
      affiliateName: 'Priya Singh',
      description: 'Multiple signups from same IP within 10 minutes',
      riskLevel: 'high',
      status: 'open',
      flaggedAt: 'Jun 7, 2026'
    },
    {
      id: 'fr-2',
      affiliateId: 'aff-3',
      affiliateName: 'Alex Chen',
      description: 'Unusual referral velocity — 5 signups in 1 hour',
      riskLevel: 'medium',
      status: 'open',
      flaggedAt: 'Jun 6, 2026'
    },
    {
      id: 'fr-3',
      affiliateId: 'aff-2',
      affiliateName: 'Jordan Lee',
      description: 'Self-referral pattern detected',
      riskLevel: 'low',
      status: 'resolved',
      flaggedAt: 'May 30, 2026'
    }
  ],
  revenueChart: [
    { day: 'Mon', revenue: 420, commissions: 84 },
    { day: 'Tue', revenue: 380, commissions: 72 },
    { day: 'Wed', revenue: 510, commissions: 98 },
    { day: 'Thu', revenue: 290, commissions: 55 },
    { day: 'Fri', revenue: 640, commissions: 124 },
    { day: 'Sat', revenue: 480, commissions: 91 },
    { day: 'Sun', revenue: 350, commissions: 68 }
  ]
};

function recalcAffiliateStats(state: AffiliateState) {
  const mine = state.allReferrals.filter((r) => r.affiliateId === CURRENT_AFFILIATE_ID);
  state.referrals = mine;
  state.totalReferrals = mine.length;
  const converted = mine.filter(
    (r) => r.status === 'converted' || r.status === 'paid' || r.status === 'active'
  ).length;
  state.conversionRate =
    mine.length > 0 ? Math.round((converted / mine.length) * 100) : 0;
  const me = state.affiliates.find((a) => a.id === CURRENT_AFFILIATE_ID);
  if (me) {
    me.referralCount = mine.length;
    me.totalEarnings = mine.reduce((s, r) => s + r.reward, 0);
    state.totalEarnings = me.totalEarnings;
  }
}

export const affiliateSlice = createSlice({
  name: 'affiliate',
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<AffiliateViewMode>) {
      state.viewMode = action.payload;
    },
    joinProgram(state) {
      state.isEnrolled = true;
    },
    leaveProgram(state) {
      state.isEnrolled = false;
    },
    updateProfile(state, action: PayloadAction<Partial<AffiliateProfile>>) {
      state.profile = { ...state.profile, ...action.payload };
    },
    addPaymentMethod(state, action: PayloadAction<PaymentMethod>) {
      if (action.payload.isDefault) {
        state.paymentMethods.forEach((m) => {
          m.isDefault = false;
        });
      }
      state.paymentMethods.push(action.payload);
    },
    requestPayout(state) {
      if (state.availableBalance <= 0) return;
      const amount = state.availableBalance;
      state.payoutQueue.unshift({
        id: `po-${Date.now()}`,
        affiliateId: CURRENT_AFFILIATE_ID,
        affiliateName: state.profile.name,
        amount,
        status: 'pending',
        requestedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      });
      state.payoutHistory.unshift({
        id: `ph-${Date.now()}`,
        amount,
        status: 'pending',
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      });
      state.pendingEarnings += amount;
      state.availableBalance = 0;
    },
    setAffiliateStatus(
      state,
      action: PayloadAction<{ id: string; status: 'active' | 'suspended' }>
    ) {
      const aff = state.affiliates.find((a) => a.id === action.payload.id);
      if (aff) aff.status = action.payload.status;
    },
    addCommissionRule(state, action: PayloadAction<CommissionRule>) {
      state.commissionRules.push(action.payload);
    },
    updateCommissionRule(state, action: PayloadAction<CommissionRule>) {
      const idx = state.commissionRules.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) state.commissionRules[idx] = action.payload;
    },
    deleteCommissionRule(state, action: PayloadAction<string>) {
      state.commissionRules = state.commissionRules.filter((r) => r.id !== action.payload);
    },
    updatePayoutStatus(
      state,
      action: PayloadAction<{ id: string; status: AffiliatePayout['status'] }>
    ) {
      const payout = state.payoutQueue.find((p) => p.id === action.payload.id);
      if (!payout) return;
      payout.status = action.payload.status;

      const history = state.payoutHistory.find(
        (h) => h.amount === payout.amount && h.status === 'pending'
      );
      if (history) {
        if (action.payload.status === 'paid') history.status = 'paid';
        else if (action.payload.status === 'rejected') history.status = 'rejected';
        else if (action.payload.status === 'approved') history.status = 'processing';
      }

      if (
        payout.affiliateId === CURRENT_AFFILIATE_ID &&
        action.payload.status === 'paid'
      ) {
        state.paidEarnings += payout.amount;
        state.pendingEarnings = Math.max(0, state.pendingEarnings - payout.amount);
      }
      if (
        payout.affiliateId === CURRENT_AFFILIATE_ID &&
        action.payload.status === 'rejected'
      ) {
        state.availableBalance += payout.amount;
        state.pendingEarnings = Math.max(0, state.pendingEarnings - payout.amount);
      }
    },
    resolveFraudFlag(state, action: PayloadAction<string>) {
      const flag = state.fraudFlags.find((f) => f.id === action.payload);
      if (flag) flag.status = 'resolved';
    },
    banAffiliateFromFraud(state, action: PayloadAction<string>) {
      const flag = state.fraudFlags.find((f) => f.id === action.payload);
      if (!flag) return;
      flag.status = 'resolved';
      const aff = state.affiliates.find((a) => a.id === flag.affiliateId);
      if (aff) aff.status = 'suspended';
    }
  }
});

export const {
  setViewMode,
  joinProgram,
  leaveProgram,
  updateProfile,
  addPaymentMethod,
  requestPayout,
  setAffiliateStatus,
  addCommissionRule,
  updateCommissionRule,
  deleteCommissionRule,
  updatePayoutStatus,
  resolveFraudFlag,
  banAffiliateFromFraud
} = affiliateSlice.actions;

export { CURRENT_AFFILIATE_ID };
