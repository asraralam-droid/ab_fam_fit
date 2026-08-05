/** Authentic Balance Institute — 7 Authentic pillars for onboarding & community access. */
export type AbPillarId =
  | 'authentic-body'
  | 'authentic-brain'
  | 'authentically-becoming'
  | 'authentic-behavior'
  | 'authentic-bonding'
  | 'authentic-beauty'
  | 'authentic-business';

/** Community groups still use these three access buckets. */
export type CommunityPillarId =
  | 'health-wellness'
  | 'business'
  | 'life-coaching';

export interface AbPillar {
  id: AbPillarId;
  label: string;
  description: string;
  communityId: string;
  communityPillarId: CommunityPillarId;
}

export const AB_PILLARS: AbPillar[] = [
  {
    id: 'authentic-body',
    label: 'Authentic Body',
    description: 'Physical health, energy, and vitality',
    communityId: 'g-health',
    communityPillarId: 'health-wellness'
  },
  {
    id: 'authentic-brain',
    label: 'Authentic Brain',
    description: 'Mindset, clarity, and mental focus',
    communityId: 'g-coaching',
    communityPillarId: 'life-coaching'
  },
  {
    id: 'authentically-becoming',
    label: 'Authentically Becoming',
    description: 'Growth, purpose, and who you are becoming',
    communityId: 'g-coaching',
    communityPillarId: 'life-coaching'
  },
  {
    id: 'authentic-behavior',
    label: 'Authentic Behavior',
    description: 'Habits, discipline, and consistent action',
    communityId: 'g-coaching',
    communityPillarId: 'life-coaching'
  },
  {
    id: 'authentic-bonding',
    label: 'Authentic Bonding',
    description: 'Relationships, connection, and community',
    communityId: 'g-coaching',
    communityPillarId: 'life-coaching'
  },
  {
    id: 'authentic-beauty',
    label: 'Authentic Beauty',
    description: 'Confidence, presence, and self-expression',
    communityId: 'g-health',
    communityPillarId: 'health-wellness'
  },
  {
    id: 'authentic-business',
    label: 'Authentic Business',
    description: 'Leadership, systems, and enterprise growth',
    communityId: 'g-business',
    communityPillarId: 'business'
  }
];

export const BEHAVIORAL_STAGE_OPTIONS = [
  "I'm just getting started.",
  "I've started before but struggle with consistency.",
  "I'm doing well but want accountability.",
  "I'm ready to grow to the next level."
] as const;

export const IDENTITY_ROLE_OPTIONS = [
  'Individual',
  'Entrepreneur',
  'Business Owner',
  'Nonprofit Leader',
  'Organizational Leader',
  'Community Leader'
] as const;

export const IMPROVE_AREA_OPTIONS = [
  'My health',
  'My mindset',
  'My habits',
  'My relationships',
  'My confidence',
  'My leadership',
  'My business',
  'My organization',
  'My community'
] as const;

/** Short assessments scored 1–5 per community pillar (used when joining a space). */
export const PILLAR_ASSESSMENTS: Record<
  CommunityPillarId,
  { id: string; prompt: string }[]
> = {
  'health-wellness': [
    { id: 'hw1', prompt: 'How consistent are your daily health habits?' },
    { id: 'hw2', prompt: 'How confident are you about what to eat / juice?' },
    { id: 'hw3', prompt: 'How supported do you feel in your wellness journey?' }
  ],
  business: [
    { id: 'b1', prompt: 'How clear is your current business model?' },
    { id: 'b2', prompt: 'How automated are your core operations today?' },
    { id: 'b3', prompt: 'How ready are you to invest in premium consulting?' }
  ],
  'life-coaching': [
    { id: 'lc1', prompt: 'How clear do you feel about your next life season?' },
    { id: 'lc2', prompt: 'How well do you manage stress day to day?' },
    { id: 'lc3', prompt: 'How accountable do you feel to your personal goals?' }
  ]
};

export function pillarById(id: AbPillarId) {
  return AB_PILLARS.find((p) => p.id === id);
}

export function toCommunityPillar(
  id: AbPillarId | string
): CommunityPillarId | null {
  const pillar = AB_PILLARS.find((p) => p.id === id);
  if (pillar) return pillar.communityPillarId;
  if (
    id === 'health-wellness' ||
    id === 'business' ||
    id === 'life-coaching'
  ) {
    return id;
  }
  return null;
}

export function primaryDashboardMode(
  pillars: string[]
): 'fitness' | 'business' | 'coaching' | 'mixed' {
  const modes = new Set(
    pillars
      .map((p) => toCommunityPillar(p))
      .filter((p): p is CommunityPillarId => !!p)
      .map((p) =>
        p === 'business' ? 'business' : p === 'life-coaching' ? 'coaching' : 'fitness'
      )
  );
  if (modes.size > 1) return 'mixed';
  if (modes.has('business')) return 'business';
  if (modes.has('coaching')) return 'coaching';
  return 'fitness';
}

export function hasFitnessPillar(pillars: string[]) {
  return pillars.some((p) => toCommunityPillar(p) === 'health-wellness');
}

export function hasBusinessPillar(pillars: string[]) {
  return pillars.some((p) => toCommunityPillar(p) === 'business');
}

export function hasCoachingPillar(pillars: string[]) {
  return pillars.some((p) => toCommunityPillar(p) === 'life-coaching');
}

type OnboardingAnswers = {
  identityRole: string;
  improveAreas: string[];
  biggestObstacle: string;
};

/** Build business home follow-up from onboarding answers. */
export function buildBusinessFollowUpFromAnswers(input: OnboardingAnswers) {
  const consultingKeys = new Set([
    'My business',
    'My leadership',
    'My organization',
    'My community',
    'My confidence'
  ]);
  const automationKeys = new Set([
    'My habits',
    'My organization',
    'My business'
  ]);

  const consultingNeeds = input.improveAreas.filter((a) =>
    consultingKeys.has(a)
  );
  const automationNeeds = input.improveAreas.filter((a) =>
    automationKeys.has(a)
  );

  return {
    orgType: input.identityRole || 'Business',
    consultingNeeds:
      consultingNeeds.length > 0 ?
        consultingNeeds :
        ['Business growth strategy'],
    automationNeeds:
      automationNeeds.length > 0 ?
        automationNeeds :
        ['Systems & workflows'],
    notes: input.biggestObstacle.trim()
  };
}

/** Build health / body home follow-up from onboarding answers. */
export function buildFitnessFollowUpFromAnswers(input: OnboardingAnswers) {
  const goalKeys = new Set(['My health', 'My habits', 'My confidence']);
  const goals = input.improveAreas.filter((a) => goalKeys.has(a));
  const obstacle = input.biggestObstacle.trim();

  return {
    challenges: obstacle ? [obstacle] : [],
    goals: goals.length > 0 ? goals : input.improveAreas.slice(0, 3),
    outcomes: [],
    expectations: obstacle
  };
}

/** Build coaching / mindset home follow-up from onboarding answers. */
export function buildMentalFollowUpFromAnswers(input: OnboardingAnswers) {
  const focusKeys = new Set([
    'My mindset',
    'My habits',
    'My relationships',
    'My confidence',
    'My leadership',
    'My community'
  ]);
  const focusAreas = input.improveAreas.filter((a) => focusKeys.has(a));
  const obstacle = input.biggestObstacle.trim();

  return {
    focusAreas:
      focusAreas.length > 0 ? focusAreas : input.improveAreas.slice(0, 3),
    expectations: obstacle
  };
}

/** Resolve which home dashboard mode a starting pillar should open. */
export function homeModeForPillar(
  pillarId: AbPillarId | string | null | undefined
): 'fitness' | 'business' | 'coaching' {
  const community = pillarId ? toCommunityPillar(pillarId) : null;
  if (community === 'business') return 'business';
  if (community === 'life-coaching') return 'coaching';
  return 'fitness';
}

/** Map legacy pillar ids from earlier prototype builds. */
export function normalizePillarId(id: string): AbPillarId | null {
  if (AB_PILLARS.some((p) => p.id === id)) return id as AbPillarId;
  if (
    id === 'health-wellness' ||
    id === 'health-fitness' ||
    id === 'nutrition' ||
    id === 'family-community'
  ) {
    return 'authentic-body';
  }
  if (id === 'business' || id === 'financial-business') {
    return 'authentic-business';
  }
  if (
    id === 'life-coaching' ||
    id === 'mental-coaching' ||
    id === 'emotional' ||
    id === 'purpose-spiritual'
  ) {
    return 'authentic-brain';
  }
  return null;
}
