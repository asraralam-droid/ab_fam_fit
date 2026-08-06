import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { RootState } from '../store';
import { notificationsSlice } from '../store/slices';
import {
  buildDailyMessages,
  getPrimaryDailyPrompt
} from '../utils/dailyMessaging';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Demo stand-in for automated daily push/in-app messaging.
 * Runs once per calendar day when the signed-in user is in the app shell.
 */
export function DailyMessagingRunner() {
  const dispatch = useDispatch();
  const ranRef = useRef(false);

  const isAuthenticated = useSelector(
    (s: RootState) => s.auth.isAuthenticated
  );
  const lastDailyRunDate = useSelector(
    (s: RootState) => s.notifications.lastDailyRunDate
  );
  const firstName = useSelector(
    (s: RootState) => s.auth.user?.name?.split(/\s+/)[0] || ''
  );
  const pillars = useSelector((s: RootState) => s.onboarding.pillars);
  const improveAreas = useSelector(
    (s: RootState) => s.onboarding.improveAreas
  );
  const biggestObstacle = useSelector(
    (s: RootState) => s.onboarding.biggestObstacle
  );
  const enrolledIds = useSelector((s: RootState) => s.programs.enrolledIds);
  const adminPrograms = useSelector(
    (s: RootState) => s.adminPrograms.programs
  );
  const journeyDay = useSelector((s: RootState) => s.home.journeyDay);
  const streakDays = useSelector((s: RootState) => s.home.streakDays);
  const waterCount = useSelector((s: RootState) => s.home.waterCount);
  const checkInCompleted = useSelector(
    (s: RootState) => s.home.checkInCompleted
  );
  const mealsLoggedToday = useSelector(
    (s: RootState) => s.meals.loggedMeals.length
  );

  useEffect(() => {
    if (!isAuthenticated || ranRef.current) return;

    const today = todayKey();
    if (lastDailyRunDate === today) {
      ranRef.current = true;
      return;
    }

    const programTitles = enrolledIds
      .map((id) => adminPrograms.find((p) => p.id === id)?.title)
      .filter((t): t is string => !!t);

    const drafts = buildDailyMessages({
      firstName,
      pillars,
      improveAreas,
      biggestObstacle,
      programTitles,
      journeyDay,
      streakDays,
      waterCount,
      waterGoal: 8,
      mealsLoggedToday,
      checkInCompleted
    });

    ranRef.current = true;
    dispatch(notificationsSlice.actions.addNotifications(drafts));
    dispatch(
      notificationsSlice.actions.setDailyMessagingRun({
        date: today,
        prompt: getPrimaryDailyPrompt(drafts)
      })
    );

    const primary = getPrimaryDailyPrompt(drafts);
    if (primary) {
      toast(primary, {
        description: 'Daily Bestie prompt',
        duration: 5000
      });
    }
  }, [
    isAuthenticated,
    lastDailyRunDate,
    firstName,
    pillars,
    improveAreas,
    biggestObstacle,
    enrolledIds,
    adminPrograms,
    journeyDay,
    streakDays,
    waterCount,
    mealsLoggedToday,
    checkInCompleted,
    dispatch
  ]);

  return null;
}
