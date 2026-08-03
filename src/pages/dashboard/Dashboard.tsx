import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import {
  ArrowLeft,
  Flame,
  Droplet,
  Target,
  Book,
  TrendingUp,
  Activity as ActivityIcon,
  Briefcase,
  Cog,
  CalendarCheck,
  Heart,
  NotebookPen,
  Sparkles,
  Copy,
  Share
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { normalizeAdminProgram } from '../../store/adminProgramsSlice';
import { computeEnrolledLearningProgress } from '../../utils/programDisplay';
import {
  normalizePillarId,
  primaryDashboardMode,
  type AbPillarId
} from '../../utils/abPillars';

type DashView = 'fitness' | 'business' | 'coaching';

export function Dashboard() {
  const navigate = useNavigate();
  const { streakDays, longestStreak, waterCount, journeyDay } = useSelector(
    (state: RootState) => state.home
  );
  const { programs: rawPrograms } = useSelector(
    (state: RootState) => state.adminPrograms
  );
  const {
    enrolledIds: rawEnrolled,
    enrolledAt: rawEnrolledAt,
    completedItemKeys: rawCompleted
  } = useSelector((state: RootState) => state.programs);
  const { loggedMeals } = useSelector((state: RootState) => state.meals);
  const { entries } = useSelector((state: RootState) => state.checkIn);
  const { user, familyCode } = useSelector((state: RootState) => state.auth);
  const inviteCode = familyCode || 'ABFAM2K9';
  const {
    pillars,
    currentWeight,
    goalWeight,
    businessFollowUp,
    fitnessFollowUp,
    mentalFollowUp,
    assessments
  } = useSelector((state: RootState) => state.onboarding);
  const { dailyLogs } = useSelector((state: RootState) => state.challenges);
  const { tier, coachingRequest } = useSelector(
    (state: RootState) => state.membership
  );

  const normalizedPillars = useMemo(() => {
    const mapped = pillars
      .map((p) => normalizePillarId(p))
      .filter((p): p is AbPillarId => !!p);
    if (!mapped.length && businessFollowUp) return ['business'] as AbPillarId[];
    if (!mapped.length && mentalFollowUp)
      return ['life-coaching'] as AbPillarId[];
    if (!mapped.length && fitnessFollowUp)
      return ['health-wellness'] as AbPillarId[];
    return mapped;
  }, [pillars, businessFollowUp, mentalFollowUp, fitnessFollowUp]);

  const mode = normalizedPillars.length
    ? primaryDashboardMode(normalizedPillars)
    : 'fitness';
  const availableViews = useMemo(() => {
    const views: DashView[] = [];
    if (normalizedPillars.includes('health-wellness')) views.push('fitness');
    if (normalizedPillars.includes('business')) views.push('business');
    if (normalizedPillars.includes('life-coaching')) views.push('coaching');
    return views;
  }, [normalizedPillars]);

  const defaultView: DashView =
    mode === 'business'
      ? 'business'
      : mode === 'coaching'
        ? 'coaching'
        : mode === 'mixed'
          ? availableViews[0] ?? 'fitness'
          : 'fitness';

  const [activeView, setActiveView] = useState<DashView>(defaultView);
  const view =
    availableViews.length === 0
      ? 'fitness'
      : availableViews.includes(activeView)
        ? activeView
        : defaultView;

  const enrolledIds = Array.isArray(rawEnrolled) ? rawEnrolled : [];
  const enrolledAtMap =
    rawEnrolledAt && typeof rawEnrolledAt === 'object'
      ? (rawEnrolledAt as Record<string, number>)
      : {};
  const completedItemKeys = Array.isArray(rawCompleted) ? rawCompleted : [];
  const programs = useMemo(
    () =>
      rawPrograms
        .map((p) =>
          normalizeAdminProgram(p as unknown as Record<string, unknown>)
        )
        .filter((p) => p.active),
    [rawPrograms]
  );
  const learning = computeEnrolledLearningProgress(programs, completedItemKeys, {
    enrolledIds,
    enrolledAt: enrolledAtMap
  });
  const weekData = [4, 6, 8, 7, 8, 5, 8];
  const completionRate = learning.percent;

  const consultingProgress = businessFollowUp?.consultingNeeds?.length
    ? Math.min(90, businessFollowUp.consultingNeeds.length * 28)
    : 35;
  const automationProgress = businessFollowUp?.automationNeeds?.length
    ? Math.min(90, businessFollowUp.automationNeeds.length * 30)
    : 20;
  const retainerActive = tier === 'coaching' || tier === 'challenge';

  const weightProgress =
    currentWeight != null && goalWeight != null && currentWeight > goalWeight
      ? Math.min(
          100,
          Math.round(
            ((168 - currentWeight) / Math.max(1, 168 - goalWeight)) * 100
          )
        )
      : currentWeight != null && goalWeight != null
        ? 40
        : 24;

  const titles: Record<DashView, { title: string; subtitle: string }> = {
    fitness: {
      title: 'Fitness dashboard',
      subtitle: 'Meals, hydration, progress, weight & journaling.'
    },
    business: {
      title: 'Business dashboard',
      subtitle: 'Consulting, automation, next steps & retainer.'
    },
    coaching: {
      title: 'Life coaching dashboard',
      subtitle: 'Mindset, feelings, accountability & growth.'
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-surface">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-text">My Dashboard</h1>
        <div className="w-10" />
      </div>

      <div className="p-5">
        <h2 className="text-2xl font-bold text-text mb-1">
          Hi {user?.name?.split(' ')[0] || 'Misty'}
        </h2>
        <p className="text-sm text-text-muted mb-4">
          {availableViews.length === 0
            ? 'Complete onboarding to personalize this dashboard by pillar.'
            : titles[view].subtitle}
        </p>

        <section className="mb-5">
          <div className="bg-surface border border-border rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent-sage/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Share className="w-5 h-5 text-accent-sage" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">Invite your family</h3>
                <p className="text-xs text-text-muted">
                  Share this code so they can join your team.
                </p>
              </div>
            </div>
            <div className="p-4 bg-surface-2 rounded-xl border border-border mb-3 text-center">
              <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wider font-medium">
                Your Family Code
              </p>
              <p className="text-2xl font-bold text-primary tracking-widest">
                {inviteCode}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(inviteCode);
                  toast.success('Family code copied!');
                }}
                className="flex-1 h-11 bg-surface border border-border rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button
                type="button"
                onClick={() => toast.success('Share sheet opened')}
                className="flex-1 h-11 bg-primary text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                <Share className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </section>

        {availableViews.length === 0 && (
          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="w-full h-11 mb-5 rounded-xl bg-primary text-white text-sm font-bold">
            Choose my pillar
          </button>
        )}

        {availableViews.length > 1 && (
          <div className="flex gap-2 mb-5 overflow-x-auto hide-scrollbar">
            {availableViews.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setActiveView(v)}
                className={`px-3 h-9 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${view === v ? 'bg-primary text-white border-primary' : 'bg-surface text-text border-border'}`}>
                {v === 'fitness'
                  ? 'Health & Wellness'
                  : v === 'business'
                    ? 'Business'
                    : 'Life Coaching'}
              </button>
            ))}
          </div>
        )}

        {availableViews.length > 0 && (
          <p className="text-[11px] text-primary font-bold uppercase tracking-wider mb-5">
            {titles[view].title}
            {tier !== 'none' ? ` · ${tier} tier` : ''}
          </p>
        )}

        {availableViews.length > 0 && view === 'fitness' && (
          <FitnessDashboard
            streakDays={streakDays}
            longestStreak={longestStreak}
            waterCount={waterCount}
            journeyDay={journeyDay}
            weekData={weekData}
            loggedMeals={loggedMeals}
            currentWeight={currentWeight}
            goalWeight={goalWeight}
            weightProgress={weightProgress}
            entries={entries}
            dailyLogsCount={dailyLogs.length}
            fitnessGoals={fitnessFollowUp?.goals ?? []}
            learningCompleted={learning.completed}
            learningTotal={learning.total}
            completionRate={completionRate}
          />
        )}

        {availableViews.length > 0 && view === 'business' && (
          <BusinessDashboard
            consultingProgress={consultingProgress}
            automationProgress={automationProgress}
            orgType={businessFollowUp?.orgType || ''}
            consultingNeeds={businessFollowUp?.consultingNeeds ?? []}
            automationNeeds={businessFollowUp?.automationNeeds ?? []}
            notes={businessFollowUp?.notes || ''}
            retainerActive={retainerActive}
            coachingSubmitted={coachingRequest.submitted}
            journeyDay={journeyDay}
            learningCompleted={learning.completed}
            learningTotal={learning.total}
            completionRate={completionRate}
            onUpgrade={() => navigate('/work-with-misty')}
          />
        )}

        {availableViews.length > 0 && view === 'coaching' && (
          <CoachingDashboard
            streakDays={streakDays}
            longestStreak={longestStreak}
            journeyDay={journeyDay}
            entries={entries}
            focusAreas={mentalFollowUp?.focusAreas ?? []}
            expectations={mentalFollowUp?.expectations || ''}
            assessments={assessments}
            learningCompleted={learning.completed}
            learningTotal={learning.total}
            completionRate={completionRate}
          />
        )}
      </div>
    </div>
  );
}

function FitnessDashboard({
  streakDays,
  longestStreak,
  waterCount,
  journeyDay,
  weekData,
  loggedMeals,
  currentWeight,
  goalWeight,
  weightProgress,
  entries,
  dailyLogsCount,
  fitnessGoals,
  learningCompleted,
  learningTotal,
  completionRate
}: {
  streakDays: number;
  longestStreak: number;
  waterCount: number;
  journeyDay: number;
  weekData: number[];
  loggedMeals: { id: string; description: string; type: string; time: string }[];
  currentWeight: number | null;
  goalWeight: number | null;
  weightProgress: number;
  entries: { feeling: number }[];
  dailyLogsCount: number;
  fitnessGoals: string[];
  learningCompleted: number;
  learningTotal: number;
  completionRate: number;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard
          icon={<Droplet className="w-5 h-5 text-accent-lavender" />}
          value={`${waterCount}/8`}
          label="Hydration"
          sub={`${Math.round((waterCount / 8) * 100)}% of goal`}
        />
        <StatCard
          icon={<ActivityIcon className="w-5 h-5 text-accent-sage" />}
          value={loggedMeals.length}
          label="Meals logged"
          sub="Personal + community"
          delay={0.05}
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-primary" />}
          value={
            currentWeight != null ? `${currentWeight}` : '—'
          }
          label="Weight"
          sub={goalWeight != null ? `Goal ${goalWeight} lbs` : 'Set a goal'}
          delay={0.1}
        />
        <StatCard
          icon={<NotebookPen className="w-5 h-5 text-primary" />}
          value={entries.length}
          label="Journaling"
          sub={
            entries[0]
              ? `Latest feeling ${entries[0].feeling}/5`
              : 'No check-ins yet'
          }
          delay={0.15}
        />
      </div>

      <section className="mb-5">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Hydration · week at a glance
        </h3>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                Glasses
              </p>
              <p className="text-lg font-bold text-text">
                {weekData.reduce((a, b) => a + b, 0)} this week
              </p>
            </div>
            <span className="text-xs text-accent-sage font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +12%
            </span>
          </div>
          <div className="flex items-end justify-between gap-2 h-24">
            {weekData.map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full bg-surface-2 rounded-t-md relative h-full flex items-end overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / 8) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="w-full bg-accent-lavender rounded-t-md"
                  />
                </div>
                <span className="text-[10px] text-text-muted font-bold">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-5">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Meals
        </h3>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {loggedMeals.length === 0 ? (
            <p className="p-4 text-sm text-text-muted text-center">
              No meals logged yet.
            </p>
          ) : (
            loggedMeals.slice(0, 4).map((meal, i) => (
              <div
                key={meal.id}
                className={`p-3 flex items-center gap-3 ${i !== Math.min(loggedMeals.length, 4) - 1 ? 'border-b border-border' : ''}`}>
                <div className="w-9 h-9 rounded-lg bg-accent-sage/20 text-accent-sage flex items-center justify-center flex-shrink-0">
                  <ActivityIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text truncate">
                    {meal.description}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {meal.type} · {meal.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mb-5">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Progress
        </h3>
        <div className="bg-surface border border-border rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-text">
                {streakDays}-day streak
              </span>
            </div>
            <span className="text-xs text-text-muted">
              Best {longestStreak} · Day {journeyDay}
            </span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-text flex items-center gap-1.5">
                <Book className="w-3.5 h-3.5" /> Lessons
              </span>
              <span className="text-xs text-text-muted">
                {learningCompleted}/{learningTotal}
              </span>
            </div>
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          {fitnessGoals.length > 0 && (
            <p className="text-xs text-text-muted">
              Goals: {fitnessGoals.join(', ')}
            </p>
          )}
          <p className="text-xs text-text-muted">
            Challenge metrics: {dailyLogsCount} daily logs → Admin Dashboard
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Weight & journaling
        </h3>
        <div className="bg-surface border border-border rounded-2xl p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-text">Weight goal</span>
              <span className="text-xs text-text-muted">
                {currentWeight ?? '—'} → {goalWeight ?? '—'} lbs
              </span>
            </div>
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-sage rounded-full"
                style={{ width: `${Math.max(8, weightProgress)}%` }}
              />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <NotebookPen className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-text">Journal check-ins</p>
              <p className="text-xs text-text-muted mt-0.5">
                {entries.length} entries · latest feeling{' '}
                {entries[0]?.feeling ?? '—'}/5
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function BusinessDashboard({
  consultingProgress,
  automationProgress,
  orgType,
  consultingNeeds,
  automationNeeds,
  notes,
  retainerActive,
  coachingSubmitted,
  journeyDay,
  learningCompleted,
  learningTotal,
  completionRate,
  onUpgrade
}: {
  consultingProgress: number;
  automationProgress: number;
  orgType: string;
  consultingNeeds: string[];
  automationNeeds: string[];
  notes: string;
  retainerActive: boolean;
  coachingSubmitted: boolean;
  journeyDay: number;
  learningCompleted: number;
  learningTotal: number;
  completionRate: number;
  onUpgrade: () => void;
}) {
  const nextSteps = [
    consultingNeeds.length
      ? `Advance consulting: ${consultingNeeds[0]}`
      : 'Define consulting priorities',
    automationNeeds.length
      ? `Build automation: ${automationNeeds[0]}`
      : 'Map automation opportunities',
    retainerActive
      ? 'Prepare for next Misty session'
      : 'Upgrade to work with Misty',
    notes ? `Note: ${notes}` : 'Document business goals for Misty'
  ].slice(0, 3);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard
          icon={<Briefcase className="w-5 h-5 text-primary" />}
          value={`${consultingProgress}%`}
          label="Consulting"
          sub={orgType || 'In progress'}
        />
        <StatCard
          icon={<Cog className="w-5 h-5 text-accent-sage" />}
          value={`${automationProgress}%`}
          label="Automation"
          sub={
            automationNeeds.length
              ? `${automationNeeds.length} focus areas`
              : 'Not started'
          }
          delay={0.05}
        />
        <StatCard
          icon={<CalendarCheck className="w-5 h-5 text-accent-lavender" />}
          value={journeyDay}
          label="Journey day"
          sub="Business track"
          delay={0.1}
        />
        <StatCard
          icon={<Sparkles className="w-5 h-5 text-primary" />}
          value={retainerActive ? 'Active' : 'Pending'}
          label="Retainer"
          sub={
            retainerActive
              ? 'Coaching engaged'
              : coachingSubmitted
                ? 'Request submitted'
                : 'Upgrade required'
          }
          delay={0.15}
        />
      </div>

      <section className="mb-5">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Consulting progress
        </h3>
        <ProgressRow
          icon={<Briefcase className="w-4 h-4 text-primary" />}
          title="Consulting engagement"
          detail={
            consultingNeeds.length
              ? consultingNeeds.join(' · ')
              : 'Front-end strategy, offers, client experience'
          }
          percent={consultingProgress}
          color="bg-primary"
        />
      </section>

      <section className="mb-5">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Automation progress
        </h3>
        <ProgressRow
          icon={<Cog className="w-4 h-4 text-accent-sage" />}
          title="Back-end build-outs"
          detail={
            automationNeeds.length
              ? automationNeeds.join(' · ')
              : 'CRM, workflows, billing automation'
          }
          percent={automationProgress}
          color="bg-accent-sage"
        />
      </section>

      <section className="mb-5">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Next business steps
        </h3>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <ul className="space-y-3">
            {nextSteps.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-text pt-0.5">{step}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-5">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Retainer status
        </h3>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-bold text-text">
                {retainerActive
                  ? 'Active Misty retainer'
                  : 'No active retainer'}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {retainerActive
                  ? 'Premium coaching & consulting access is unlocked.'
                  : coachingSubmitted
                    ? 'Your Work with Misty request is in review.'
                    : 'Upgrade for personalized consulting and guidance.'}
              </p>
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex-shrink-0 ${retainerActive ? 'bg-accent-sage/20 text-accent-sage' : 'bg-surface-2 text-text-muted'}`}>
              {retainerActive ? 'Active' : 'Pending'}
            </span>
          </div>
          {!retainerActive && (
            <button
              type="button"
              onClick={onUpgrade}
              className="w-full h-11 rounded-xl bg-primary text-white text-sm font-bold">
              Work with Misty
            </button>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Program progress
        </h3>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-text">
              Lessons completed
            </span>
            <span className="text-xs text-text-muted">
              {learningCompleted}/{learningTotal}
            </span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function CoachingDashboard({
  streakDays,
  longestStreak,
  journeyDay,
  entries,
  focusAreas,
  expectations,
  assessments,
  learningCompleted,
  learningTotal,
  completionRate
}: {
  streakDays: number;
  longestStreak: number;
  journeyDay: number;
  entries: { id: string; feeling: number; word: string; win: string }[];
  focusAreas: string[];
  expectations: string;
  assessments: Record<string, number>;
  learningCompleted: number;
  learningTotal: number;
  completionRate: number;
}) {
  const assessmentValues = Object.values(assessments || {});
  const assessmentAvg =
    assessmentValues.length > 0
      ? Math.round(
          (assessmentValues.reduce((a, b) => a + b, 0) /
            assessmentValues.length) *
            10
        ) / 10
      : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard
          icon={<Heart className="w-5 h-5 text-accent-lavender" />}
          value={entries[0]?.feeling ?? '—'}
          label="Latest feeling"
          sub={entries[0]?.word || 'Complete a check-in'}
        />
        <StatCard
          icon={<NotebookPen className="w-5 h-5 text-primary" />}
          value={entries.length}
          label="Journal entries"
          sub="Accountability log"
          delay={0.05}
        />
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          value={streakDays}
          label="Day streak"
          sub={`Best ${longestStreak}`}
          delay={0.1}
        />
        <StatCard
          icon={<Sparkles className="w-5 h-5 text-accent-sage" />}
          value={assessmentAvg ?? '—'}
          label="Assessment"
          sub={assessmentAvg != null ? 'Out of 5' : 'Not completed'}
          delay={0.15}
        />
      </div>

      <section className="mb-5">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Focus areas
        </h3>
        <div className="bg-surface border border-border rounded-2xl p-4">
          {focusAreas.length ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {focusAreas.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  {area}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted mb-3">
              No focus areas set yet.
            </p>
          )}
          {expectations && (
            <p className="text-xs text-text-muted leading-relaxed">
              Expectations: {expectations}
            </p>
          )}
          <p className="text-xs text-text-muted mt-2">Journey day {journeyDay}</p>
        </div>
      </section>

      <section className="mb-5">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Recent journaling
        </h3>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {entries.length === 0 ? (
            <p className="p-4 text-sm text-text-muted text-center">
              No journal entries yet.
            </p>
          ) : (
            entries.slice(0, 4).map((entry, i) => (
              <div
                key={entry.id}
                className={`p-3 ${i !== Math.min(entries.length, 4) - 1 ? 'border-b border-border' : ''}`}>
                <p className="text-sm font-semibold text-text">
                  Feeling {entry.feeling}/5 · {entry.word}
                </p>
                <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                  Win: {entry.win || '—'}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Progress
        </h3>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-text">Lessons</span>
            <span className="text-xs text-text-muted">
              {learningCompleted}/{learningTotal}
            </span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function StatCard({
  icon,
  value,
  label,
  sub,
  delay = 0
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
  sub: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-surface border border-border rounded-2xl p-4">
      <div className="mb-2">{icon}</div>
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-[11px] text-text-muted font-semibold">{label}</p>
      <p className="text-[10px] text-text-muted mt-1">{sub}</p>
    </motion.div>
  );
}

function ProgressRow({
  icon,
  title,
  detail,
  percent,
  color
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  percent: number;
  color: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-sm font-bold text-text">{title}</p>
        <span className="ml-auto text-xs font-bold text-text-muted">
          {percent}%
        </span>
      </div>
      <p className="text-xs text-text-muted mb-2 line-clamp-2">{detail}</p>
      <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
