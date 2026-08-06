/**
 * Demo hydration & meal reminder schedule.
 * Simulates "push by a certain time" using local clock + app open checks.
 */

export type TrackingReminderSlot = {
  id: 'midmorning' | 'afternoon' | 'evening';
  /** Local hour (0–23) when this reminder becomes due. */
  hour: number;
  label: string;
  /** Expected minimum water glasses by this time. */
  waterMin: number;
  /** Expected minimum meals logged by this time. */
  mealMin: number;
  mealHint: string;
};

export const WATER_GOAL = 8;

export const TRACKING_REMINDER_SLOTS: TrackingReminderSlot[] = [
  {
    id: 'midmorning',
    hour: 10,
    label: '10:00 AM',
    waterMin: 3,
    mealMin: 1,
    mealHint: 'breakfast or your first meal'
  },
  {
    id: 'afternoon',
    hour: 14,
    label: '2:00 PM',
    waterMin: 5,
    mealMin: 2,
    mealHint: 'lunch'
  },
  {
    id: 'evening',
    hour: 18,
    label: '6:00 PM',
    waterMin: 8,
    mealMin: 2,
    mealHint: 'dinner or today’s meals'
  }
];

export type TrackingReminderDraft = {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: 'hydration' | 'meal';
  link: string;
};

export type TrackingReminderInput = {
  firstName: string;
  waterCount: number;
  mealsLoggedToday: number;
  /** Already-sent reminder ids (persisted). */
  sentIds: string[];
  /** Current local hour; injectable for tests/demo. */
  nowHour?: number;
  todayKey: string;
};

function reminderId(
  kind: 'hydration' | 'meal',
  slotId: string,
  day: string
) {
  return `track-${kind}-${slotId}-${day}`;
}

/** Build due hydration/meal reminders for slots whose time has passed. */
export function buildDueTrackingReminders(
  input: TrackingReminderInput
): TrackingReminderDraft[] {
  const hour = input.nowHour ?? new Date().getHours();
  const name = input.firstName || 'friend';
  const sent = new Set(input.sentIds);
  const drafts: TrackingReminderDraft[] = [];

  for (const slot of TRACKING_REMINDER_SLOTS) {
    if (hour < slot.hour) continue;

    const waterId = reminderId('hydration', slot.id, input.todayKey);
    const mealId = reminderId('meal', slot.id, input.todayKey);

    if (
      input.waterCount < slot.waterMin &&
      !sent.has(waterId) &&
      !drafts.some((d) => d.id === waterId)
    ) {
      const remaining = Math.max(WATER_GOAL - input.waterCount, 0);
      drafts.push({
        id: waterId,
        message:
          slot.id === 'evening'
            ? `${name}, evening hydration reminder: you’re at ${input.waterCount}/${WATER_GOAL} glasses. ${remaining} to go before the day wraps.`
            : `${name}, ${slot.label} hydration reminder: ${input.waterCount}/${WATER_GOAL} glasses so far (aim for at least ${slot.waterMin} by now).`,
        time: 'Just now',
        read: false,
        type: 'hydration',
        link: '/home'
      });
    }

    if (
      input.mealsLoggedToday < slot.mealMin &&
      !sent.has(mealId) &&
      !drafts.some((d) => d.id === mealId)
    ) {
      drafts.push({
        id: mealId,
        message: `${name}, ${slot.label} meal reminder: log ${slot.mealHint} when you can — ${input.mealsLoggedToday} meal${input.mealsLoggedToday === 1 ? '' : 's'} logged today.`,
        time: 'Just now',
        read: false,
        type: 'meal',
        link: '/log'
      });
    }
  }

  // Prefer one hydration + one meal max per run (latest due slot wins).
  const latestHydration = [...drafts]
    .reverse()
    .find((d) => d.type === 'hydration');
  const latestMeal = [...drafts].reverse().find((d) => d.type === 'meal');
  return [latestHydration, latestMeal].filter(
    (d): d is TrackingReminderDraft => !!d
  );
}

export function getNextReminderSlot(nowHour?: number): TrackingReminderSlot | null {
  const hour = nowHour ?? new Date().getHours();
  return TRACKING_REMINDER_SLOTS.find((s) => hour < s.hour) ?? null;
}

export function countMealsForDate(
  meals: { date?: string }[],
  dayKey: string
): number {
  return meals.filter((m) => {
    if (!m.date) return true;
    return m.date.slice(0, 10) === dayKey;
  }).length;
}
