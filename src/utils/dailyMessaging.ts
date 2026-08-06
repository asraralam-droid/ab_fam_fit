import {
  normalizePillarId,
  pillarById,
  primaryDashboardMode,
  type AbPillarId
} from './abPillars';

export type DailyNotificationDraft = {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: 'daily' | 'motivation' | 'hydration' | 'meal' | 'learn' | 'streak';
  link?: string;
};

export type DailyMessagingInput = {
  firstName: string;
  pillars: string[];
  improveAreas: string[];
  biggestObstacle: string;
  programTitles: string[];
  journeyDay: number;
  streakDays: number;
  waterCount: number;
  waterGoal: number;
  mealsLoggedToday: number;
  checkInCompleted: boolean;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function resolveMode(pillars: string[]) {
  const normalized = pillars
    .map((p) => normalizePillarId(p))
    .filter((p): p is AbPillarId => !!p);
  if (!normalized.length) return 'fitness' as const;
  return primaryDashboardMode(normalized);
}

function pillarLabel(pillars: string[]) {
  const id = normalizePillarId(pillars[0] ?? '');
  return id ? pillarById(id)?.label ?? null : null;
}

/** Build 1–3 automated daily prompts from plan / entry point / live tracking (demo). */
export function buildDailyMessages(
  input: DailyMessagingInput
): DailyNotificationDraft[] {
  const day = todayKey();
  const name = input.firstName || 'friend';
  const mode = resolveMode(input.pillars);
  const pillar = pillarLabel(input.pillars);
  const program = input.programTitles[0];
  const messages: DailyNotificationDraft[] = [];

  // 1) Morning motivation — entry point / plan
  if (mode === 'business') {
    messages.push({
      id: `daily-morning-${day}`,
      message: program
        ? `${name}, day ${input.journeyDay}: lead with intention in ${program}. One leadership or systems action keeps Authentic Business moving.`
        : `${name}, day ${input.journeyDay} of Authentic Business — clarify one priority and take one decisive action before noon.`,
      time: 'Just now',
      read: false,
      type: 'daily',
      link: '/home'
    });
  } else if (mode === 'coaching') {
    messages.push({
      id: `daily-morning-${day}`,
      message: pillar
        ? `${name}, day ${input.journeyDay} on ${pillar}: pause, breathe, and choose one growth action that matches your season.`
        : `${name}, day ${input.journeyDay}: progress over perfection — one honest check-in keeps your coaching journey alive.`,
      time: 'Just now',
      read: false,
      type: 'daily',
      link: '/home'
    });
  } else {
    messages.push({
      id: `daily-morning-${day}`,
      message: program
        ? `${name}, day ${input.journeyDay} in ${program}${
            pillar ? ` (${pillar})` : ''
          }: juice or hydrate, log with honesty, and keep showing up.`
        : `${name}, day ${input.journeyDay}${
            pillar ? ` of your ${pillar} journey` : ''
          }: small daily steps create Authentic Balance. Start with water or a clean meal log.`,
      time: 'Just now',
      read: false,
      type: 'daily',
      link: '/home'
    });
  }

  // 2) Plan / program nudge
  if (program) {
    const moduleHint =
      input.journeyDay <= 28
        ? 'Stay with Foundations — Module 1 energy.'
        : input.journeyDay <= 56
          ? 'You’re in the next milestone window — keep daily rituals strong.'
          : 'Honor your current stage and complete what’s unlocked.';
    messages.push({
      id: `daily-program-${day}`,
      message: `${program}: ${moduleHint} Open your program when you’re ready.`,
      time: 'Just now',
      read: false,
      type: 'learn',
      link: '/programs'
    });
  } else if (input.improveAreas[0]) {
    messages.push({
      id: `daily-focus-${day}`,
      message: `Today’s focus from your entry path: ${input.improveAreas[0]}. One intentional step is enough.`,
      time: 'Just now',
      read: false,
      type: 'motivation',
      link: '/bestie'
    });
  }

  // 3) Soft check-in / obstacle nudge (hydration & meals handled by TrackingReminderRunner)
  if ((mode === 'fitness' || mode === 'mixed') && !input.checkInCompleted) {
    messages.push({
      id: `daily-checkin-${day}`,
      message: `Your weekly/feeling check-in is still open. Two minutes of honesty keeps you accountable.`,
      time: 'Just now',
      read: false,
      type: 'motivation',
      link: '/home'
    });
  } else if (input.biggestObstacle) {
    messages.push({
      id: `daily-obstacle-${day}`,
      message: `Remember your obstacle — “${input.biggestObstacle}” — and take one tiny step past it today.`,
      time: 'Just now',
      read: false,
      type: 'motivation',
      link: '/bestie'
    });
  }

  // Streak celebration spice (only if already strong)
  if (input.streakDays > 0 && input.streakDays % 7 === 0) {
    messages.push({
      id: `daily-streak-${day}`,
      message: `${input.streakDays}-day streak — consistency looks good on you. Keep the chain alive!`,
      time: 'Just now',
      read: false,
      type: 'streak',
      link: '/home'
    });
  }

  return messages.slice(0, 3);
}

export function getPrimaryDailyPrompt(
  messages: DailyNotificationDraft[]
): string | null {
  return messages.find((m) => m.type === 'daily')?.message ?? messages[0]?.message ?? null;
}
