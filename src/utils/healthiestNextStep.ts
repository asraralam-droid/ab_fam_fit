import type { AbPillarId } from './abPillars';
import { primaryDashboardMode, normalizePillarId } from './abPillars';
import type { NextLearningStep } from './programDisplay';
import { WATER_GOAL } from './trackingReminders';

export type HealthiestNextStep = {
  id: string;
  title: string;
  detail: string;
  cta: string;
  href: string;
};

export type HealthiestNextStepInput = {
  pillars: string[];
  waterCount: number;
  mealsToday: number;
  weeklyCheckInDone: boolean;
  nextLesson: NextLearningStep | null;
  enrolledCount: number;
};

function resolveMode(pillars: string[]) {
  const normalized = pillars
    .map((p) => normalizePillarId(p))
    .filter((p): p is AbPillarId => !!p);
  if (!normalized.length) return 'fitness' as const;
  return primaryDashboardMode(normalized);
}

/** One clear "healthiest next step" from live tracking + learning state. */
export function resolveHealthiestNextStep(
  input: HealthiestNextStepInput
): HealthiestNextStep {
  const mode = resolveMode(input.pillars);

  if (mode !== 'business' && input.waterCount < WATER_GOAL) {
    const left = WATER_GOAL - input.waterCount;
    return {
      id: 'hydrate',
      title: 'Hydrate',
      detail: `${left} glass${left === 1 ? '' : 'es'} left to hit today’s water goal.`,
      cta: 'Log water',
      href: '/home'
    };
  }

  if (mode !== 'business' && input.mealsToday < 1) {
    return {
      id: 'log-meal',
      title: 'Log a meal',
      detail: 'Capture breakfast or your first clean meal of the day.',
      cta: 'Log food',
      href: '/log'
    };
  }

  if (input.nextLesson) {
    return {
      id: 'continue-lesson',
      title: 'Continue learning',
      detail: `${input.nextLesson.itemLabel} · ${input.nextLesson.programTitle}`,
      cta: 'Resume',
      href: input.nextLesson.href
    };
  }

  if (input.enrolledCount === 0) {
    return {
      id: 'browse-programs',
      title: 'Start a program',
      detail:
        mode === 'business'
          ? 'Pick a program that matches your business priorities.'
          : 'Enroll in a program to unlock your next lesson.',
      cta: 'Browse',
      href: '/programs'
    };
  }

  if (!input.weeklyCheckInDone) {
    return {
      id: 'weekly-check-in',
      title: 'Weekly reflection',
      detail: 'Capture one win and one need before the week closes.',
      cta: 'Reflect',
      href: '/home?checkin=weekly'
    };
  }

  if (mode === 'business') {
    return {
      id: 'business-action',
      title: 'One business action',
      detail: 'Take one leadership or systems step before noon.',
      cta: 'Open Bestie',
      href: '/bestie'
    };
  }

  if (mode === 'coaching') {
    return {
      id: 'coaching-action',
      title: 'One growth action',
      detail: 'Ask Bestie for a small step that matches your season.',
      cta: 'Ask Bestie',
      href: '/bestie'
    };
  }

  return {
    id: 'keep-streak',
    title: 'Keep your streak',
    detail: 'You’re on track — open Explore and stay consistent.',
    cta: 'Explore',
    href: '/discover'
  };
}
