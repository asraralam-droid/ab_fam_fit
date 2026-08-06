import type { AdminProgram, ProgramModule } from '../store/adminProgramsSlice';
import { sortedProgramModules } from '../store/adminProgramsSlice';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Brand schedule: Module 1.0 → 2.0 → 3.0 → 4.0 */
export const MODULE_UNLOCK_SCHEDULE = [
  {
    order: 1,
    unlockAfterDays: 0,
    timeWindow: 'Days 1–28',
    titleHint: 'Foundations'
  },
  {
    order: 2,
    unlockAfterDays: 28,
    timeWindow: 'Days 29–56',
    titleHint: 'Implementation'
  },
  {
    order: 3,
    unlockAfterDays: 90,
    timeWindow: 'Day 90+',
    titleHint: 'Integration'
  },
  {
    order: 4,
    unlockAfterDays: 120,
    timeWindow: 'Day 120+',
    titleHint: 'Mastery'
  }
] as const;

export type ModuleLockStatus = {
  unlocked: boolean;
  unlockAfterDays: number;
  timeWindow: string;
  /** Program day when this module opens (1-based display). */
  opensOnProgramDay: number;
  unlocksAt?: number;
  daysRemaining?: number;
  /** Days since program start (1-based for display). */
  currentProgramDay: number;
};

export function defaultUnlockAfterDaysForOrder(order: number): number {
  const row = MODULE_UNLOCK_SCHEDULE.find((s) => s.order === order);
  if (row) return row.unlockAfterDays;
  if (order <= 1) return 0;
  if (order === 2) return 28;
  if (order === 3) return 90;
  return 120 + (order - 4) * 30;
}

export function defaultTimeWindowForOrder(order: number): string {
  const row = MODULE_UNLOCK_SCHEDULE.find((s) => s.order === order);
  return row?.timeWindow ?? `Day ${defaultUnlockAfterDaysForOrder(order) + 1}+`;
}

export function resolveModuleUnlockAfterDays(mod: ProgramModule): number {
  if (mod.unlockAfterDays !== undefined && mod.unlockAfterDays !== null) {
    return Math.max(0, Number(mod.unlockAfterDays) || 0);
  }
  return defaultUnlockAfterDaysForOrder(mod.order);
}

export function resolveModuleTimeWindow(mod: ProgramModule): string {
  if (mod.timeWindow?.trim()) return mod.timeWindow.trim();
  return defaultTimeWindowForOrder(mod.order);
}

/** Days elapsed since enrollment (0 = start day). */
export function programDaysElapsed(
  enrolledAt: number,
  now: number,
  demoDayOffset = 0
): number {
  const elapsed = Math.floor((now - enrolledAt) / MS_PER_DAY) + demoDayOffset;
  return Math.max(0, elapsed);
}

/** 1-based program day for member-facing copy. */
export function programDayNumber(
  enrolledAt: number,
  now: number,
  demoDayOffset = 0
): number {
  return programDaysElapsed(enrolledAt, now, demoDayOffset) + 1;
}

export function getModuleLockStatus(
  mod: ProgramModule,
  options: {
    enrolled: boolean;
    enrolledAt?: number;
    now?: number;
    /** Demo: add fake days since start without waiting. */
    demoDayOffset?: number;
  }
): ModuleLockStatus {
  const now = options.now ?? Date.now();
  const unlockAfterDays = resolveModuleUnlockAfterDays(mod);
  const timeWindow = resolveModuleTimeWindow(mod);
  const opensOnProgramDay = unlockAfterDays + 1;

  if (!options.enrolled || options.enrolledAt === undefined) {
    return {
      unlocked: false,
      unlockAfterDays,
      timeWindow,
      opensOnProgramDay,
      daysRemaining: unlockAfterDays > 0 ? unlockAfterDays : undefined,
      currentProgramDay: 1
    };
  }

  const demoDayOffset = options.demoDayOffset ?? 0;
  const daysElapsed = programDaysElapsed(
    options.enrolledAt,
    now,
    demoDayOffset
  );
  const currentProgramDay = daysElapsed + 1;
  const unlocked = daysElapsed >= unlockAfterDays;

  if (unlocked) {
    return {
      unlocked: true,
      unlockAfterDays,
      timeWindow,
      opensOnProgramDay,
      unlocksAt: options.enrolledAt + unlockAfterDays * MS_PER_DAY,
      currentProgramDay
    };
  }

  return {
    unlocked: false,
    unlockAfterDays,
    timeWindow,
    opensOnProgramDay,
    unlocksAt: options.enrolledAt + unlockAfterDays * MS_PER_DAY,
    daysRemaining: unlockAfterDays - daysElapsed,
    currentProgramDay
  };
}

export function formatModuleUnlockLabel(
  status: ModuleLockStatus,
  enrolled: boolean
): string {
  if (status.unlocked) return 'Unlocked';
  if (!enrolled) {
    return status.unlockAfterDays <= 0
      ? 'Opens on program payment'
      : `Opens on program day ${status.opensOnProgramDay}`;
  }
  if (status.daysRemaining === undefined) return 'Locked';
  if (status.daysRemaining <= 0) return 'Unlocks today';
  if (status.daysRemaining === 1) return '1 day left';
  return `${status.daysRemaining} days left`;
}

export function findModuleInProgram(
  program: AdminProgram,
  moduleId: string
): ProgramModule | undefined {
  return sortedProgramModules(program).find((m) => m.id === moduleId);
}
