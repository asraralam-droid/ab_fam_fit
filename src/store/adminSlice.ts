import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  plan: 'Books' | 'Coaching' | 'Challenge' | 'Business';
  streak: number;
  lastActive: string;
  joinedAt: string;
  role: 'admin' | 'staff' | 'end-user';
  status: 'active' | 'inactive' | 'paused' | 'banned';
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number; // percent
  uses: number;
  maxUses: number | null;
  expires: string | null;
  active: boolean;
  createdAt: string;
}

export interface AIRecipe {
  id: string;
  title: string;
  prompt: string;
  category: string;
  ingredients: string[];
  steps: string[];
  createdAt: string;
  favorite: boolean;
}

export interface DailyStat {
  day: string;
  value: number;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  description: string;
  active: boolean;
}

export interface FamilyRecord {
  id: string;
  name: string;
  size: number;
}

export type PlatformActivityType =
  | 'food_log'
  | 'lesson_completed'
  | 'workout_log'
  | 'check_in'
  | 'signup';

export const PLATFORM_ACTIVITY_TYPE_LABELS: Record<
PlatformActivityType,
string> =
{
  food_log: 'Food Log',
  lesson_completed: 'Lesson Completed',
  workout_log: 'Workout Log',
  check_in: 'Check-in',
  signup: 'Signup'
};

export interface PlatformActivityItem {
  id: string;
  userId: string;
  userName: string;
  type: PlatformActivityType;
  detail: string;
  /** ISO date (YYYY-MM-DD) for filtering */
  occurredAt: string;
  /** Short display label, e.g. "1 Jun" */
  dateLabel: string;
}

interface AdminState {
  members: AdminMember[];
  platformActivity: PlatformActivityItem[];
  promoCodes: PromoCode[];
  aiRecipes: AIRecipe[];
  stats: {
    dailyFoodLogs: DailyStat[];
    newSignups: DailyStat[];
    weeklyActivity: DailyStat[];
  };
  pricing: {
    currency: string;
    tiers: PricingTier[];
  };
  familySettings: {
    maxSize: number;
    families: FamilyRecord[];
  };
}

const today = new Date();
const dayLabel = (offset: number) =>
new Date(today.getTime() - offset * 86400000).toLocaleDateString('en-US', {
  weekday: 'short'
});

const isoDaysAgo = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

const shortDateLabel = (daysAgo: number) =>
new Date(today.getTime() - daysAgo * 86400000).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'short'
});

const initialState: AdminState = {
  members: [
  {
    id: 'u1',
    name: 'Misty Alvarez',
    email: 'misty@authenticbalance.app',
    plan: 'Books',
    streak: 12,
    lastActive: '2 min ago',
    joinedAt: 'Jan 14, 2024',
    role: 'admin',
    status: 'active'
  },
  {
    id: 'u2',
    name: 'Jordan Lee',
    email: 'jordan.lee@gmail.com',
    plan: 'Books',
    streak: 28,
    lastActive: '1 hr ago',
    joinedAt: 'Feb 22, 2024',
    role: 'end-user',
    status: 'active'
  },
  {
    id: 'u3',
    name: 'Sam Rivera',
    email: 'sam.r@outlook.com',
    plan: 'Coaching',
    streak: 5,
    lastActive: '4 hr ago',
    joinedAt: 'Mar 03, 2024',
    role: 'end-user',
    status: 'active'
  },
  {
    id: 'u4',
    name: 'Priya Singh',
    email: 'priya.s@gmail.com',
    plan: 'Books',
    streak: 2,
    lastActive: 'Yesterday',
    joinedAt: 'May 11, 2025',
    role: 'end-user',
    status: 'active'
  },
  {
    id: 'u5',
    name: 'Alex Chen',
    email: 'alex.chen@me.com',
    plan: 'Books',
    streak: 18,
    lastActive: 'Yesterday',
    joinedAt: 'Mar 18, 2024',
    role: 'staff',
    status: 'active'
  },
  {
    id: 'u6',
    name: 'Marcus Hill',
    email: 'marcus.hill@gmail.com',
    plan: 'Books',
    streak: 0,
    lastActive: '3 days ago',
    joinedAt: 'Apr 01, 2024',
    role: 'end-user',
    status: 'paused'
  },
  {
    id: 'u7',
    name: 'Diana K.',
    email: 'diana.k@yahoo.com',
    plan: 'Business',
    streak: 9,
    lastActive: '5 hr ago',
    joinedAt: 'Dec 02, 2023',
    role: 'end-user',
    status: 'active'
  },
  {
    id: 'u8',
    name: 'Robin Oluwa',
    email: 'robin.o@gmail.com',
    plan: 'Books',
    streak: 0,
    lastActive: '12 days ago',
    joinedAt: 'May 24, 2025',
    role: 'end-user',
    status: 'inactive'
  },
  {
    id: 'u9',
    name: 'Casey Mitchell',
    email: 'casey.m@gmail.com',
    plan: 'Coaching',
    streak: 21,
    lastActive: '1 hr ago',
    joinedAt: 'Feb 09, 2024',
    role: 'end-user',
    status: 'active'
  },
  {
    id: 'u10',
    name: 'Toni Bauer',
    email: 'toni.b@gmail.com',
    plan: 'Books',
    streak: 14,
    lastActive: '2 hr ago',
    joinedAt: 'Nov 17, 2023',
    role: 'end-user',
    status: 'active'
  }],

  platformActivity: [
  {
    id: 'pa1',
    userId: 'u1',
    userName: 'Misty Alvarez',
    type: 'food_log',
    detail: 'Grilled salmon & greens',
    occurredAt: isoDaysAgo(0),
    dateLabel: shortDateLabel(0)
  },
  {
    id: 'pa2',
    userId: 'u2',
    userName: 'Jordan Lee',
    type: 'lesson_completed',
    detail: 'Module 2 · Balance basics',
    occurredAt: isoDaysAgo(1),
    dateLabel: shortDateLabel(1)
  },
  {
    id: 'pa3',
    userId: 'u3',
    userName: 'Sam Rivera',
    type: 'food_log',
    detail: 'Overnight oats bowl',
    occurredAt: isoDaysAgo(1),
    dateLabel: shortDateLabel(1)
  },
  {
    id: 'pa4',
    userId: 'u5',
    userName: 'Alex Chen',
    type: 'workout_log',
    detail: '20 min strength circuit',
    occurredAt: isoDaysAgo(2),
    dateLabel: shortDateLabel(2)
  },
  {
    id: 'pa5',
    userId: 'u4',
    userName: 'Priya Singh',
    type: 'lesson_completed',
    detail: 'Welcome & overview',
    occurredAt: isoDaysAgo(3),
    dateLabel: shortDateLabel(3)
  },
  {
    id: 'pa6',
    userId: 'u9',
    userName: 'Casey Mitchell',
    type: 'check_in',
    detail: 'Weekly weigh-in posted',
    occurredAt: isoDaysAgo(5),
    dateLabel: shortDateLabel(5)
  },
  {
    id: 'pa7',
    userId: 'u10',
    userName: 'Toni Bauer',
    type: 'food_log',
    detail: 'Meal prep lunch boxes',
    occurredAt: isoDaysAgo(7),
    dateLabel: shortDateLabel(7)
  },
  {
    id: 'pa8',
    userId: 'u7',
    userName: 'Diana K.',
    type: 'lesson_completed',
    detail: 'Mindful eating intro',
    occurredAt: isoDaysAgo(13),
    dateLabel: shortDateLabel(13)
  },
  {
    id: 'pa9',
    userId: 'u6',
    userName: 'Marcus Hill',
    type: 'food_log',
    detail: 'Post-workout smoothie',
    occurredAt: isoDaysAgo(14),
    dateLabel: shortDateLabel(14)
  },
  {
    id: 'pa10',
    userId: 'u8',
    userName: 'Robin Oluwa',
    type: 'signup',
    detail: 'Joined via family code',
    occurredAt: isoDaysAgo(21),
    dateLabel: shortDateLabel(21)
  },
  {
    id: 'pa11',
    userId: 'u2',
    userName: 'Jordan Lee',
    type: 'food_log',
    detail: 'High-protein breakfast',
    occurredAt: isoDaysAgo(28),
    dateLabel: shortDateLabel(28)
  },
  {
    id: 'pa12',
    userId: 'u3',
    userName: 'Sam Rivera',
    type: 'lesson_completed',
    detail: 'Hydration habits',
    occurredAt: isoDaysAgo(45),
    dateLabel: shortDateLabel(45)
  },
  {
    id: 'pa13',
    userId: 'u4',
    userName: 'Priya Singh',
    type: 'check_in',
    detail: 'Shared a win with family',
    occurredAt: isoDaysAgo(60),
    dateLabel: shortDateLabel(60)
  },
  {
    id: 'pa14',
    userId: 'u1',
    userName: 'Misty Alvarez',
    type: 'workout_log',
    detail: 'Morning walk — 8k steps',
    occurredAt: isoDaysAgo(75),
    dateLabel: shortDateLabel(75)
  }],


  promoCodes: [
  {
    id: 'p1',
    code: 'LOYALTY',
    discount: 50,
    uses: 184,
    maxUses: null,
    expires: null,
    active: true,
    createdAt: 'Jan 10, 2024'
  },
  {
    id: 'p2',
    code: 'SPRING25',
    discount: 25,
    uses: 42,
    maxUses: 500,
    expires: 'Jun 30, 2026',
    active: true,
    createdAt: 'Mar 01, 2026'
  },
  {
    id: 'p3',
    code: 'EARLYBIRD',
    discount: 30,
    uses: 320,
    maxUses: 320,
    expires: 'Mar 31, 2026',
    active: false,
    createdAt: 'Dec 15, 2025'
  },
  {
    id: 'p4',
    code: 'FRIEND10',
    discount: 10,
    uses: 67,
    maxUses: null,
    expires: null,
    active: true,
    createdAt: 'Apr 22, 2026'
  }],


  aiRecipes: [
  {
    id: 'ar1',
    title: 'Anti-Inflammatory Green Glow Juice',
    prompt:
    'A green juice that supports gut healing and reduces inflammation',
    category: 'Juice',
    ingredients: [
    '1 cup spinach',
    '1/2 cucumber',
    '1 inch ginger',
    '1/2 lemon, juiced',
    '1 green apple',
    '2 celery stalks'],

    steps: [
    'Wash and chop all produce.',
    'Add to juicer in this order: leafy greens first, then harder produce.',
    'Stir in lemon juice.',
    'Serve immediately over ice if desired.'],

    createdAt: '2 days ago',
    favorite: true
  },
  {
    id: 'ar2',
    title: 'High-Protein Overnight Oats with Berries',
    prompt: 'Quick breakfast for busy moms — high protein, low sugar',
    category: 'Breakfast',
    ingredients: [
    '1/2 cup rolled oats',
    '1 scoop vanilla protein powder',
    '1 tbsp chia seeds',
    '3/4 cup almond milk',
    '1/2 cup mixed berries'],

    steps: [
    'Combine oats, protein, chia, and milk in a jar.',
    'Stir well, top with berries.',
    'Refrigerate overnight.'],

    createdAt: '1 week ago',
    favorite: false
  },
  {
    id: 'ar3',
    title: 'Roasted Veggie Buddha Bowl',
    prompt: 'Plant-based lunch with grains and tahini dressing',
    category: 'Lunch',
    ingredients: [
    '1 cup quinoa',
    '1 sweet potato, cubed',
    '1 cup broccoli florets',
    '1 cup chickpeas',
    '2 tbsp tahini',
    '1 lemon, juiced'],

    steps: [
    'Roast sweet potato and broccoli at 400°F for 25 min.',
    'Cook quinoa according to package.',
    'Whisk tahini with lemon and water.',
    'Assemble bowls and drizzle with dressing.'],

    createdAt: '2 weeks ago',
    favorite: true
  }],


  stats: {
    dailyFoodLogs: Array.from({ length: 7 }, (_, i) => ({
      day: dayLabel(6 - i),
      value: [82, 94, 73, 108, 121, 96, 134][i]
    })),
    newSignups: Array.from({ length: 7 }, (_, i) => ({
      day: dayLabel(6 - i),
      value: [12, 18, 9, 22, 14, 27, 31][i]
    })),
    weeklyActivity: Array.from({ length: 7 }, (_, i) => ({
      day: dayLabel(6 - i),
      value: [240, 285, 198, 312, 348, 290, 402][i]
    }))
  },

  pricing: {
    currency: 'USD',
    tiers: [
    {
      id: 'tier-books',
      name: 'Book Package (Entry)',
      price: 77,
      description:
      'Required entry: all 4 books (read/listen) + basic self-guided tools. No free tier.',
      active: true
    },
    {
      id: 'tier-coaching',
      name: 'Work with Misty / Coaching',
      price: 997,
      description:
      'Structured lessons, personalized guidance, and 1:1 coaching. Request via form.',
      active: true
    },
    {
      id: 'tier-challenge-elite',
      name: 'Elite Challenge Cohort',
      price: 997,
      description:
      'Exclusive Misty-led challenge capped at 10 seats ($997–$5,000). Waitlist for overflow.',
      active: true
    }]

  },

  familySettings: {
    maxSize: 12,
    families: [
    { id: 'f1', name: 'Alvarez', size: 12 },
    { id: 'f2', name: 'Lee Crew', size: 8 },
    { id: 'f3', name: 'Rivera Team', size: 5 },
    { id: 'f4', name: 'Singh House', size: 4 },
    { id: 'f5', name: 'Chen Family', size: 6 },
    { id: 'f6', name: 'Hill Tribe', size: 12 },
    { id: 'f7', name: 'Kim Krew', size: 3 },
    { id: 'f8', name: 'Oluwa', size: 2 },
    { id: 'f9', name: 'Mitchell', size: 7 },
    { id: 'f10', name: 'Bauer', size: 4 },
    { id: 'f11', name: 'Patel', size: 9 },
    { id: 'f12', name: 'Garcia', size: 5 },
    { id: 'f13', name: 'Brooks', size: 12 },
    { id: 'f14', name: 'Nguyen', size: 6 }]

  }
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Promo codes
    addPromoCode: (state, action: PayloadAction<PromoCode>) => {
      state.promoCodes.unshift(action.payload);
    },
    updatePromoCode: (state, action: PayloadAction<PromoCode>) => {
      const idx = state.promoCodes.findIndex((p) => p.id === action.payload.id);
      if (idx >= 0) state.promoCodes[idx] = action.payload;
    },
    togglePromoActive: (state, action: PayloadAction<string>) => {
      const p = state.promoCodes.find((p) => p.id === action.payload);
      if (p) p.active = !p.active;
    },
    deletePromoCode: (state, action: PayloadAction<string>) => {
      state.promoCodes = state.promoCodes.filter((p) => p.id !== action.payload);
    },
    // AI recipes
    addAIRecipe: (state, action: PayloadAction<AIRecipe>) => {
      state.aiRecipes.unshift(action.payload);
    },
    updateAIRecipe: (state, action: PayloadAction<AIRecipe>) => {
      const idx = state.aiRecipes.findIndex((r) => r.id === action.payload.id);
      if (idx >= 0) state.aiRecipes[idx] = action.payload;
    },
    toggleAIRecipeFavorite: (state, action: PayloadAction<string>) => {
      const r = state.aiRecipes.find((r) => r.id === action.payload);
      if (r) r.favorite = !r.favorite;
    },
    deleteAIRecipe: (state, action: PayloadAction<string>) => {
      state.aiRecipes = state.aiRecipes.filter((r) => r.id !== action.payload);
    },
    // Members — minimal mutators
    updateMemberRole: (
    state,
    action: PayloadAction<{
      id: string;
      role: 'admin' | 'staff' | 'end-user';
    }>) =>
    {
      const m = state.members.find((m) => m.id === action.payload.id);
      if (m) m.role = action.payload.role;
    },
    toggleMemberStatus: (state, action: PayloadAction<string>) => {
      const m = state.members.find((m) => m.id === action.payload);
      if (!m || m.status === 'banned') return;
      m.status = m.status === 'active' ? 'paused' : 'active';
    },
    banMember: (
    state,
    action: PayloadAction<{ id: string; reason?: string }>) =>
    {
      const m = state.members.find((m) => m.id === action.payload.id);
      if (m) m.status = 'banned';
    },
    unbanMember: (state, action: PayloadAction<string>) => {
      const m = state.members.find((m) => m.id === action.payload);
      if (m && m.status === 'banned') m.status = 'active';
    },

    // Pricing CRUD
    addPricingTier: (state, action: PayloadAction<PricingTier>) => {
      state.pricing.tiers.push(action.payload);
    },
    updatePricingTier: (state, action: PayloadAction<PricingTier>) => {
      const idx = state.pricing.tiers.findIndex(
        (t) => t.id === action.payload.id
      );
      if (idx >= 0) state.pricing.tiers[idx] = action.payload;
    },
    deletePricingTier: (state, action: PayloadAction<string>) => {
      state.pricing.tiers = state.pricing.tiers.filter(
        (t) => t.id !== action.payload
      );
    },
    togglePricingTier: (state, action: PayloadAction<string>) => {
      const t = state.pricing.tiers.find((t) => t.id === action.payload);
      if (t) t.active = !t.active;
    },

    // Family settings
    setMaxFamilySize: (state, action: PayloadAction<number>) => {
      state.familySettings.maxSize = Math.max(1, action.payload);
      // Trim any family over the new cap
      state.familySettings.families.forEach((f) => {
        if (f.size > state.familySettings.maxSize) {
          f.size = state.familySettings.maxSize;
        }
      });
    }
  }
});