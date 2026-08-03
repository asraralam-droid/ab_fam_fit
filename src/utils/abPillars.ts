/** Authentic Balance Institute — primary pillars for onboarding & community access. */
export type AbPillarId = 'health-wellness' | 'business' | 'life-coaching';

export interface AbPillar {
  id: AbPillarId;
  label: string;
  description: string;
  communityId: string;
}

export const AB_PILLARS: AbPillar[] = [
  {
    id: 'health-wellness',
    label: 'Health & Wellness',
    description: 'Fitness, nutrition, juicing, and physical vitality',
    communityId: 'g-health'
  },
  {
    id: 'business',
    label: 'Business',
    description: 'Consulting, systems, automation, and growth',
    communityId: 'g-business'
  },
  {
    id: 'life-coaching',
    label: 'Life Coaching / Mental Wellness',
    description: 'Mindset, clarity, emotional balance, and life transitions',
    communityId: 'g-coaching'
  }
];

export const FITNESS_CHALLENGE_OPTIONS = [
  'Weight management',
  'Low energy',
  'Inconsistent habits',
  'Gut / digestion',
  'Post-pregnancy recovery',
  'Other'
];

export const FITNESS_GOAL_OPTIONS = [
  'Lose weight',
  'Build strength',
  'Feel more energized',
  'Create lasting habits',
  'Prepare for a challenge'
];

export const FITNESS_OUTCOME_OPTIONS = [
  'Clear meal / juice plan',
  'Daily accountability',
  'Sustainable lifestyle change',
  'Challenge-ready body'
];

export const BUSINESS_TYPE_OPTIONS = [
  'For-profit',
  'Non-profit',
  'Solopreneur',
  'Small team',
  'Scaling company'
];

export const BUSINESS_CONSULTING_OPTIONS = [
  'Front-end strategy & offers',
  'Brand & client experience',
  'Operations consulting',
  'Team / leadership'
];

export const BUSINESS_AUTOMATION_OPTIONS = [
  'CRM / funnel automation',
  'Back-office workflows',
  'Scheduling & billing',
  'Custom build-outs'
];

export const MENTAL_FOCUS_OPTIONS = [
  'Clarity & focus',
  'Stress management',
  'Confidence',
  'Life transitions',
  'Accountability',
  'Emotional regulation'
];

/** Short assessments scored 1–5 per pillar. */
export const PILLAR_ASSESSMENTS: Record<
  AbPillarId,
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

export function needsFitnessFollowUp(pillars: AbPillarId[]) {
  return pillars.includes('health-wellness');
}

export function needsBusinessFollowUp(pillars: AbPillarId[]) {
  return pillars.includes('business');
}

export function needsMentalFollowUp(pillars: AbPillarId[]) {
  return pillars.includes('life-coaching');
}

export function primaryDashboardMode(
  pillars: string[]
): 'fitness' | 'business' | 'coaching' | 'mixed' {
  const hasH = pillars.includes('health-wellness');
  const hasB = pillars.includes('business');
  const hasC = pillars.includes('life-coaching');
  const count = [hasH, hasB, hasC].filter(Boolean).length;
  if (count > 1) return 'mixed';
  if (hasB) return 'business';
  if (hasC) return 'coaching';
  return 'fitness';
}

export function pillarById(id: AbPillarId) {
  return AB_PILLARS.find((p) => p.id === id);
}

/** Map legacy pillar ids from earlier prototype builds. */
export function normalizePillarId(id: string): AbPillarId | null {
  if (id === 'health-wellness' || id === 'business' || id === 'life-coaching') {
    return id;
  }
  if (
    id === 'health-fitness' ||
    id === 'nutrition' ||
    id === 'family-community'
  ) {
    return 'health-wellness';
  }
  if (id === 'financial-business') return 'business';
  if (
    id === 'mental-coaching' ||
    id === 'emotional' ||
    id === 'purpose-spiritual'
  ) {
    return 'life-coaching';
  }
  return null;
}
