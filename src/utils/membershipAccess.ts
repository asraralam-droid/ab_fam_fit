/**
 * Membership access rules (Phase 1+).
 *
 * - No free tier: entry requires the $77 book package (or higher).
 * - Books tier: books + basic self-guided tools + pillar community.
 * - Premium: structured lessons, coaching, active challenges.
 * - Challenge create: Misty at launch; later unlocked after completing
 *   a Misty challenge AND working with her.
 */

export type MembershipTier = 'none' | 'books' | 'coaching' | 'challenge';

export type AppFeature =
  | 'books'
  | 'selfGuidedTools'
  | 'structuredLessons'
  | 'coaching'
  | 'joinChallenges'
  | 'createChallenges'
  | 'bestie';

const TIER_RANK: Record<MembershipTier, number> = {
  none: 0,
  books: 1,
  coaching: 2,
  challenge: 3
};

const FEATURE_MIN_TIER: Record<AppFeature, MembershipTier> = {
  books: 'books',
  selfGuidedTools: 'books',
  bestie: 'books',
  joinChallenges: 'coaching',
  structuredLessons: 'coaching',
  coaching: 'coaching',
  createChallenges: 'books'
};

export const BOOK_PACKAGE_PRICE = 77;
export const BOOK_PACKAGE_TITLE = 'JAB Book Series — All 4 Books';

export const BOOK_PACKAGE_FEATURES = [
  'All 4 Authentic Balance books (read & listen)',
  'Basic self-guided tools for your selected pillar',
  'Authentic Bestie companion',
  'Access to your pillar community'
];

export const BOOK_PACKAGE_EXCLUDED = [
  'Structured step-by-step lessons',
  'Personalized coaching (“what to eat/juice”)',
  'Active Misty challenges & high-end cohorts',
  'Other pillar communities (join separately)'
];

export function hasPaidAccess(tier: MembershipTier): boolean {
  return TIER_RANK[tier] >= TIER_RANK.books;
}

export function canAccessFeature(
  tier: MembershipTier,
  feature: AppFeature,
  opts?: {
    role?: 'admin' | 'staff' | 'end-user';
    completedMistyChallenge?: boolean;
    workedWithMisty?: boolean;
  }
): boolean {
  const role = opts?.role;
  if (role === 'admin' || role === 'staff') return true;

  if (feature === 'createChallenges') {
    return canCreateChallenge(
      opts?.completedMistyChallenge ?? false,
      opts?.workedWithMisty ?? false,
      role
    );
  }

  const min = FEATURE_MIN_TIER[feature];
  return TIER_RANK[tier] >= TIER_RANK[min];
}

/**
 * Launch: Misty (admin) creates challenges.
 * Later: members who completed a Misty challenge AND worked with her.
 */
export function canCreateChallenge(
  completedMistyChallenge: boolean,
  workedWithMisty: boolean,
  role?: 'admin' | 'staff' | 'end-user' | null
): boolean {
  if (role === 'admin') return true;
  if (role === 'staff') return false;
  return completedMistyChallenge && workedWithMisty;
}

export function isMistyAdmin(role?: string | null): boolean {
  return role === 'admin';
}

/** Product journey shared across AB offerings. */
export const AB_PRODUCT_JOURNEY = [
  'Assessment',
  'Basic Entry Product',
  'Premium Coaching',
  'Programs',
  'Ongoing Growth'
] as const;
