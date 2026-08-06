import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { RootState } from '../store';
import { notificationsSlice } from '../store/slices';
import {
  buildDueTrackingReminders,
  countMealsForDate
} from '../utils/trackingReminders';
import {
  hasFitnessPillar,
  normalizePillarId,
  type AbPillarId
} from '../utils/abPillars';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Demo stand-in for timed push reminders (hydration + meals).
 * Checks on mount and every minute; fires once per slot/day when behind.
 */
export function TrackingReminderRunner() {
  const dispatch = useDispatch();
  const lastCheckRef = useRef<string>('');

  const isAuthenticated = useSelector(
    (s: RootState) => s.auth.isAuthenticated
  );
  const firstName = useSelector(
    (s: RootState) => s.auth.user?.name?.split(/\s+/)[0] || ''
  );
  const pillars = useSelector((s: RootState) => s.onboarding.pillars);
  const waterCount = useSelector((s: RootState) => s.home.waterCount);
  const loggedMeals = useSelector((s: RootState) => s.meals.loggedMeals);
  const sentIds = useSelector(
    (s: RootState) => s.notifications.sentTrackingReminderIds
  );

  const fitnessRelevant = (() => {
    const normalized = pillars
      .map((p) => normalizePillarId(p))
      .filter((p): p is AbPillarId => !!p);
    if (!normalized.length) return true; // demo default: show tracking
    return hasFitnessPillar(normalized);
  })();

  useEffect(() => {
    if (!isAuthenticated || !fitnessRelevant) return;

    const runCheck = () => {
      const day = todayKey();
      const hour = new Date().getHours();
      const checkKey = `${day}-${hour}-${waterCount}-${loggedMeals.length}-${sentIds.length}`;
      if (lastCheckRef.current === checkKey) return;

      const mealsToday = countMealsForDate(loggedMeals, day);
      const drafts = buildDueTrackingReminders({
        firstName,
        waterCount,
        mealsLoggedToday: mealsToday,
        sentIds,
        nowHour: hour,
        todayKey: day
      });

      lastCheckRef.current = checkKey;
      if (!drafts.length) return;

      dispatch(notificationsSlice.actions.addNotifications(drafts));
      dispatch(
        notificationsSlice.actions.markTrackingRemindersSent(
          drafts.map((d) => d.id)
        )
      );

      const first = drafts[0];
      toast(first.message, {
        description:
          first.type === 'hydration'
            ? 'Hydration reminder'
            : 'Meal log reminder',
        duration: 5000
      });
    };

    runCheck();
    const timer = window.setInterval(runCheck, 60_000);
    return () => window.clearInterval(timer);
  }, [
    isAuthenticated,
    fitnessRelevant,
    firstName,
    waterCount,
    loggedMeals,
    sentIds,
    dispatch
  ]);

  return null;
}
