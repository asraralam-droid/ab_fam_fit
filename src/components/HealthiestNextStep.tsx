import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Compass } from 'lucide-react';
import { RootState } from '../store';
import { normalizeAdminProgram } from '../store/adminProgramsSlice';
import { getNextLearningStep } from '../utils/programDisplay';
import { resolveHealthiestNextStep } from '../utils/healthiestNextStep';
import { countMealsForDate } from '../utils/trackingReminders';

/** Compact shared cue shown across authenticated screens. */
export function HealthiestNextStepBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const home = useSelector((s: RootState) => s.home);
  const meals = useSelector((s: RootState) => s.meals);
  const onboarding = useSelector((s: RootState) => s.onboarding);
  const programsState = useSelector((s: RootState) => s.programs);
  const adminPrograms = useSelector((s: RootState) => s.adminPrograms);

  const hideOn =
    location.pathname.startsWith('/affiliate') ||
    location.pathname.startsWith('/admin') ||
    location.pathname === '/bestie' ||
    location.pathname.startsWith('/chat');

  const todayKey = new Date().toISOString().slice(0, 10);
  const mealsToday = countMealsForDate(meals.loggedMeals, todayKey);

  const programs = useMemo(
    () =>
      (adminPrograms.programs ?? []).map((p) =>
        normalizeAdminProgram(p as unknown as Record<string, unknown>)
      ),
    [adminPrograms.programs]
  );

  const nextLesson = useMemo(
    () =>
      getNextLearningStep(
        programs,
        programsState.completedItemKeys,
        {
          enrolledIds: programsState.enrolledIds ?? [],
          enrolledAt: programsState.enrolledAt
        }
      ),
    [
      programs,
      programsState.completedItemKeys,
      programsState.enrolledIds,
      programsState.enrolledAt
    ]
  );

  const step = useMemo(
    () =>
      resolveHealthiestNextStep({
        pillars: onboarding.pillars,
        waterCount: home.waterCount,
        mealsToday,
        weeklyCheckInDone: home.checkInCompleted,
        nextLesson,
        enrolledCount: (programsState.enrolledIds ?? []).length
      }),
    [
      onboarding.pillars,
      home.waterCount,
      home.checkInCompleted,
      mealsToday,
      nextLesson,
      programsState.enrolledIds
    ]
  );

  if (hideOn) return null;

  return (
    <button
      type="button"
      onClick={() => navigate(step.href)}
      className="mx-4 mt-2 mb-1 flex w-[calc(100%-2rem)] items-center gap-3 rounded-xl border border-accent-sage/30 bg-accent-sage/10 px-3 py-2.5 text-left transition-colors hover:bg-accent-sage/15">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent-sage/20 text-accent-sage">
        <Compass className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-accent-sage">
          Healthiest next step
        </span>
        <span className="block truncate text-sm font-bold text-text">
          {step.title}
        </span>
        <span className="block truncate text-[11px] text-text-muted">
          {step.detail}
        </span>
      </span>
      <span className="flex flex-shrink-0 items-center gap-0.5 text-xs font-bold text-primary">
        {step.cta}
        <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
