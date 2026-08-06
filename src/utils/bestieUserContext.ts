import type { RootState } from '../store';
import { pillarById, type AbPillarId } from './abPillars';

export type BestieUserContext = {
  firstName: string;
  fullName: string;
  pillars: string[];
  pillarLabels: string[];
  entryPillar: string | null;
  behavioralStage: string | null;
  identityRole: string | null;
  improveAreas: string[];
  goals: string[];
  biggestObstacle: string;
  membershipTier: string;
  booksPurchased: boolean;
  programTitles: string[];
  enrolledProgramIds: string[];
  completedItemCount: number;
  journeyDay: number;
  streakDays: number;
  waterCount: number;
  waterGoal: number;
  mealsLoggedToday: number;
  checkInCompleted: boolean;
  onboardingCompleted: boolean;
};

/** Slices Bestie reads for personalized demo replies (local stand-in for MCP/tools). */
export type BestieContextSource = Pick<
  RootState,
  | 'auth'
  | 'onboarding'
  | 'membership'
  | 'programs'
  | 'adminPrograms'
  | 'home'
  | 'meals'
>;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function buildBestieUserContext(state: BestieContextSource): BestieUserContext {
  const user = state.auth.user;
  const fullName = user?.name?.trim() || '';
  const firstName = fullName.split(/\s+/)[0] || '';

  const pillars = state.onboarding.pillars ?? [];
  const pillarLabels = pillars
    .map((id) => pillarById(id as AbPillarId)?.label)
    .filter((label): label is string => !!label);

  const enrolledIds = state.programs.enrolledIds ?? [];
  const programTitles = enrolledIds
    .map((id) => state.adminPrograms.programs.find((p) => p.id === id)?.title)
    .filter((title): title is string => !!title);

  const goals = [
    ...(state.onboarding.goals ?? []),
    ...(state.onboarding.fitnessFollowUp?.goals ?? []),
    ...(state.membership.coachingRequest?.goals
      ? [state.membership.coachingRequest.goals]
      : [])
  ].filter(Boolean);

  const uniqueGoals = [...new Set(goals.map((g) => g.trim()).filter(Boolean))];

  const mealsToday = (state.meals.loggedMeals ?? []).filter((m) => {
    if (!m.date) return true; // seed meals without date count as today for demo
    return m.date.slice(0, 10) === todayKey();
  }).length;

  return {
    firstName,
    fullName,
    pillars,
    pillarLabels,
    entryPillar: pillarLabels[0] ?? null,
    behavioralStage: state.onboarding.behavioralStage,
    identityRole: state.onboarding.identityRole,
    improveAreas: state.onboarding.improveAreas ?? [],
    goals: uniqueGoals,
    biggestObstacle: state.onboarding.biggestObstacle?.trim() || '',
    membershipTier: state.membership.tier,
    booksPurchased: state.membership.booksPurchased,
    programTitles,
    enrolledProgramIds: enrolledIds,
    completedItemCount: state.programs.completedItemKeys?.length ?? 0,
    journeyDay: state.home.journeyDay,
    streakDays: state.home.streakDays,
    waterCount: state.home.waterCount,
    waterGoal: 8,
    mealsLoggedToday: mealsToday,
    checkInCompleted: state.home.checkInCompleted,
    onboardingCompleted: state.onboarding.completed
  };
}

export function buildBestieWelcome(ctx: BestieUserContext): string {
  const name = ctx.firstName || 'friend';
  const pillar = ctx.entryPillar;
  const program = ctx.programTitles[0];

  if (pillar && program) {
    return `Hi ${name}! I'm your Authentic Bestie. I see you're focused on ${pillar} and enrolled in ${program} — day ${ctx.journeyDay} of your journey. How can I support you today?`;
  }
  if (pillar) {
    return `Hi ${name}! I'm your Authentic Bestie. Your entry point is ${pillar}. Ask me about your goals, progress, juicing, or today's rituals.`;
  }
  if (ctx.onboardingCompleted) {
    return `Hi ${name}! I'm your Authentic Bestie. How can I support your Authentic Balance journey today?`;
  }
  return `Hi ${name}! I'm your Authentic Bestie. Complete onboarding so I can personalize support around your pillar and goals — or ask me anything about Misty's programs.`;
}

export function getContextChips(ctx: BestieUserContext): string[] {
  const chips: string[] = [];
  if (ctx.entryPillar) chips.push(ctx.entryPillar);
  if (ctx.programTitles[0]) {
    const short =
      ctx.programTitles[0].length > 28
        ? `${ctx.programTitles[0].slice(0, 26)}…`
        : ctx.programTitles[0];
    chips.push(short);
  }
  chips.push(`Day ${ctx.journeyDay}`);
  chips.push(`${ctx.waterCount}/${ctx.waterGoal} water`);
  if (ctx.streakDays > 0) chips.push(`${ctx.streakDays}-day streak`);
  if (ctx.membershipTier && ctx.membershipTier !== 'none') {
    chips.push(`${ctx.membershipTier} tier`);
  } else if (!ctx.booksPurchased) {
    chips.push('Entry pending');
  }
  return chips.slice(0, 6);
}

export function getPersonalizedSuggestedPrompts(ctx: BestieUserContext): string[] {
  const prompts = [
    'How am I doing today?',
    ctx.entryPillar ? `Remind me about my ${ctx.entryPillar} focus` : 'What is my pillar?',
    'What are my goals?',
    'Remind me about hydration',
    ctx.programTitles[0] ? 'Where am I in my program?' : 'What is the JAB program?',
    'Help me build a daily ritual'
  ];
  return [...new Set(prompts)];
}
