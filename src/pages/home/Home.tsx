import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { homeSlice } from '../../store/slices';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Droplet,
  CheckCircle2,
  ChevronRight,
  Copy,
  BookOpen,
  Plus,
  X,
  Users,
  Trophy,
  Gift,
  GraduationCap,
  NotebookPen,
  Briefcase,
  Cog,
  Heart,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { WeeklyCheckInModal } from '../../components/modals/WeeklyCheckInModal';
import { CheckInFeelingDisplay } from '../../components/journal/CheckInFeelingDisplay';
import { SheetModal, CenteredModal } from '../../components/modals';
import { getQuoteForDisplay } from '../../utils/quoteDisplay';
import { canAccessFeature } from '../../utils/membershipAccess';
import { UpgradeGate } from '../../components/membership/UpgradeGate';
import {
  normalizePillarId,
  pillarById,
  primaryDashboardMode,
  type AbPillarId
} from '../../utils/abPillars';


export function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    streakDays,
    longestStreak,
    waterCount,
    journeyDay,
    checkInCompleted,
    weeklyWord
  } = useSelector((state: RootState) => state.home);
  const { loggedMeals } = useSelector((state: RootState) => state.meals);
  const { user, familyCode } = useSelector((state: RootState) => state.auth);
  const { tier } = useSelector(
    (state: RootState) => state.membership
  );
  const {
    pillars,
    businessFollowUp,
    mentalFollowUp,
    fitnessFollowUp,
    identityRole,
    improveAreas,
    biggestObstacle
  } = useSelector((state: RootState) => state.onboarding);
  const { entries } = useSelector((state: RootState) => state.checkIn);
  const { quotes, quoteDisplayMode } = useSelector(
    (state: RootState) => state.content
  );

  const normalizedPillars = useMemo(() => {
    const mapped = pillars
      .map((p) => normalizePillarId(p))
      .filter((p): p is AbPillarId => !!p);
    // Infer from follow-ups if pillars weren't persisted
    if (!mapped.length && businessFollowUp)
      return ['authentic-business'] as AbPillarId[];
    if (!mapped.length && mentalFollowUp)
      return ['authentic-brain'] as AbPillarId[];
    if (!mapped.length && fitnessFollowUp)
      return ['authentic-body'] as AbPillarId[];
    return mapped;
  }, [pillars, businessFollowUp, mentalFollowUp, fitnessFollowUp]);

  const homeMode = normalizedPillars.length
    ? primaryDashboardMode(normalizedPillars)
    : 'fitness';
  const needsPillarSetup = normalizedPillars.length === 0;
  const startingPillar = normalizedPillars[0]
    ? pillarById(normalizedPillars[0])
    : undefined;
  const showFitness =
    !needsPillarSetup &&
    (homeMode === 'fitness' || homeMode === 'mixed');
  const showBusiness =
    !needsPillarSetup &&
    (homeMode === 'business' || homeMode === 'mixed');
  const showCoaching =
    !needsPillarSetup &&
    (homeMode === 'coaching' || homeMode === 'mixed');

  const businessOrgType =
    businessFollowUp?.orgType || identityRole || 'Authentic Business';
  const businessConsultingNeeds =
    businessFollowUp?.consultingNeeds?.length ?
      businessFollowUp.consultingNeeds :
      improveAreas.filter((a) =>
        ['My business', 'My leadership', 'My organization', 'My community'].includes(
          a
        )
      );
  const businessAutomationNeeds =
    businessFollowUp?.automationNeeds?.length ?
      businessFollowUp.automationNeeds :
      improveAreas.filter((a) =>
        ['My habits', 'My organization', 'My business'].includes(a)
      );
  const businessNotes =
    businessFollowUp?.notes || biggestObstacle || '';

  const fitnessGoals =
    fitnessFollowUp?.goals?.length ?
      fitnessFollowUp.goals :
      improveAreas.filter((a) =>
        ['My health', 'My habits', 'My confidence'].includes(a)
      );
  const fitnessNotes =
    fitnessFollowUp?.expectations || biggestObstacle || '';

  const coachingFocusAreas =
    mentalFollowUp?.focusAreas?.length ?
      mentalFollowUp.focusAreas :
      improveAreas.filter((a) =>
        [
          'My mindset',
          'My habits',
          'My relationships',
          'My confidence',
          'My leadership',
          'My community'
        ].includes(a)
      );
  const coachingNotes =
    mentalFollowUp?.expectations || biggestObstacle || '';

  const dashboardLabel = startingPillar
    ? `${startingPillar.label} dashboard`
    : homeMode === 'business'
      ? 'Business dashboard'
      : homeMode === 'coaching'
        ? 'Coaching dashboard'
        : homeMode === 'mixed'
          ? 'Multi-pillar dashboard'
          : 'Wellness dashboard';

  const canAccessLessons = canAccessFeature(tier, 'structuredLessons', {
    role: user?.role
  });
  const dailyQuote = useMemo(
    () => getQuoteForDisplay(quotes, quoteDisplayMode ?? 'random'),
    [quotes, quoteDisplayMode]
  );
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [journalVisibleCount, setJournalVisibleCount] = useState(4);

  const consultingProgress = businessConsultingNeeds.length
    ? Math.min(90, businessConsultingNeeds.length * 28)
    : 35;
  const automationProgress = businessAutomationNeeds.length
    ? Math.min(90, businessAutomationNeeds.length * 30)
    : 20;

  const handleWaterTap = () => {
    if (waterCount < 8) {
      dispatch(homeSlice.actions.incrementWater());
    } else {
      toast.success("You've reached your daily water goal!");
    }
  };
  const copyCode = () => {
    if (familyCode) {
      navigator.clipboard.writeText(familyCode);
      toast.success('Family code copied!');
    }
  };

  const journeyLabel = startingPillar
    ? `of your ${startingPillar.label} journey`
    : homeMode === 'business'
      ? 'of your business journey'
      : homeMode === 'coaching'
        ? 'of your coaching journey'
        : homeMode === 'mixed'
          ? 'of your Authentic Balance journey'
          : 'of your wellness journey';

  const streakIcon =
    homeMode === 'business' ? (
      <Briefcase className="w-6 h-6 text-white" />
    ) : homeMode === 'coaching' ? (
      <Sparkles className="w-6 h-6 text-white" />
    ) : (
      <Flame className="w-6 h-6 text-orange-300 fill-orange-300" />
    );

  const streakSubcopy =
    homeMode === 'business'
      ? 'Keep showing up for your business goals'
      : homeMode === 'coaching'
        ? 'Keep showing up for your growth'
        : `Longest: ${longestStreak} days`;

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-text">
          Good morning, {user?.name?.split(' ')[0] || 'Misty'}
        </h1>
        <p className="text-text-muted font-medium">
          Day {journeyDay} {journeyLabel}
        </p>
        <p className="text-[11px] text-primary font-bold uppercase tracking-wider mt-1">
          {needsPillarSetup ? 'Complete your path setup' : dashboardLabel}
        </p>
      </div>

      <div className="px-4 flex flex-col gap-6">
        {!canAccessLessons && homeMode !== 'business' && (
          <UpgradeGate
            compact
            title="Books + self-guided tools unlocked"
            description="Want step-by-step lessons, meal/juice guidance, or coaching? Request to work with Misty or join a paid challenge."
          />
        )}

        {needsPillarSetup && (
          <section className="bg-primary/5 rounded-2xl border border-primary/20 p-5">
            <h3 className="text-lg font-bold text-text mb-1">
              Set your Authentic Balance path
            </h3>
            <p className="text-sm text-text-muted mb-4">
              Your home dashboard is personalized by your starting pillar.
              Complete onboarding to see the right path for you.
            </p>
            <button
              type="button"
              onClick={() => navigate('/onboarding')}
              className="w-full h-11 rounded-xl bg-primary text-white text-sm font-bold">
              Choose my pillar
            </button>
          </section>
        )}

        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowStreakModal(true)}
          className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-5 text-white shadow-lg shadow-primary/20 cursor-pointer relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                {streakIcon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {streakDays} Day Streak
                </h2>
                <p className="text-white/80 text-sm">{streakSubcopy}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/50" />
          </div>
        </motion.div>

        {showBusiness && (
          <>
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-text">
                  Consulting progress
                </h3>
              </div>
              <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-text">
                      {businessOrgType}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {consultingProgress}%
                  </span>
                </div>
                <div className="h-2 bg-surface-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${consultingProgress}%` }}
                  />
                </div>
                <p className="text-xs text-text-muted">
                  {(businessConsultingNeeds.length
                    ? businessConsultingNeeds
                    : ['Front-end strategy', 'Client experience']
                  ).join(' · ')}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-text mb-3">
                Next business steps
              </h3>
              <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm space-y-3">
                {[
                  businessConsultingNeeds[0]
                    ? `Advance: ${businessConsultingNeeds[0]}`
                    : 'Define consulting priorities',
                  businessAutomationNeeds[0]
                    ? `Automate: ${businessAutomationNeeds[0]}`
                    : 'Map automation opportunities',
                  businessNotes
                    ? `Note: ${businessNotes}`
                    : 'Document business goals for Misty'
                ].map((step, i) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-text pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-text">
                    Automation progress
                  </h3>
                  <p className="text-sm text-text-muted">
                    {(businessAutomationNeeds.length
                      ? businessAutomationNeeds
                      : ['Back-end build-outs']
                    ).join(' · ')}
                  </p>
                </div>
                <div className="text-2xl font-bold text-accent-sage">
                  {automationProgress}%
                </div>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-accent-sage rounded-full"
                  style={{ width: `${automationProgress}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Cog className="w-4 h-4" />
                Systems, workflows & ops infrastructure
              </div>
            </section>
          </>
        )}

        {showFitness && (
          <>
            {(fitnessGoals.length > 0 || fitnessNotes) && (
              <section className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
                <h3 className="text-lg font-bold text-text mb-3">
                  Your 90-day focus
                </h3>
                {fitnessGoals.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {fitnessGoals.map((goal) => (
                      <span
                        key={goal}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                        {goal}
                      </span>
                    ))}
                  </div>
                )}
                {fitnessNotes ? (
                  <p className="text-sm text-text-muted">
                    Biggest obstacle: {fitnessNotes}
                  </p>
                ) : null}
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-text">Today&apos;s Meals</h3>
                <button
                  type="button"
                  onClick={() => navigate('/log')}
                  className="text-sm font-medium text-primary flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Log
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
                {loggedMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="min-w-[140px] bg-surface rounded-2xl border border-border overflow-hidden snap-start shadow-sm">
                    <div className="h-24 bg-surface-2 relative">
                      {meal.image ? (
                        <img
                          src={meal.image}
                          alt={meal.type}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-accent-sage/20 text-accent-sage">
                          <BookOpen className="w-8 h-8 opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-text">
                        {meal.type}
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-text line-clamp-1">
                        {meal.description}
                      </p>
                      <p className="text-xs text-text-muted mt-1">{meal.time}</p>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => navigate('/log')}
                  className="min-w-[140px] bg-surface-2 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center gap-2 snap-start hover:bg-border/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shadow-sm">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-text-muted">
                    Log another
                  </span>
                </button>
              </div>
            </section>

            <section className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-text">Hydration</h3>
                  <p className="text-sm text-text-muted">
                    {waterCount} of 8 glasses
                  </p>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round((waterCount / 8) * 100)}%
                </div>
              </div>
              <div className="flex justify-between">
                {Array.from({ length: 8 }).map((_, i) => {
                  const isFilled = i < waterCount;
                  return (
                    <motion.button
                      key={i}
                      type="button"
                      whileTap={{ scale: 0.8 }}
                      onClick={handleWaterTap}
                      className="relative">
                      <Droplet
                        className={`w-8 h-8 transition-colors duration-300 ${isFilled ? 'text-blue-400 fill-blue-400' : 'text-border fill-surface-2'}`}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {showCoaching && (
          <section className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="w-5 h-5 text-accent-lavender" />
              <h3 className="text-lg font-bold text-text">
                {startingPillar?.label || 'Coaching'} focus
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {(coachingFocusAreas.length
                ? coachingFocusAreas
                : ['Clarity', 'Accountability']
              ).map((area) => (
                <span
                  key={area}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  {area}
                </span>
              ))}
            </div>
            {coachingNotes ? (
              <p className="text-sm text-text-muted">
                Biggest obstacle: {coachingNotes}
              </p>
            ) : null}
          </section>
        )}

        {(showFitness || showCoaching || showBusiness) && (
          <section
            onClick={() => setShowCheckIn(true)}
            className="bg-accent-lavender/20 rounded-2xl border border-accent-lavender/30 p-5 flex items-center justify-between cursor-pointer hover:bg-accent-lavender/30 transition-colors">
            <div>
              <h3 className="text-lg font-bold text-primary">Weekly Check-in</h3>
              {checkInCompleted ? (
                <>
                  <p className="text-sm text-text mt-1">
                    This week&apos;s reflection: done!
                  </p>
                  <p className="text-sm text-text-muted mt-0.5">
                    Your word: &quot;{weeklyWord}&quot;
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setJournalVisibleCount(4);
                      setShowJournal(true);
                    }}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-sage hover:underline">
                    <NotebookPen className="w-4 h-4" />
                    View My Journal →
                  </button>
                </>
              ) : (
                <p className="text-sm text-primary/80 mt-1">
                  Due this week. Tap to complete.
                </p>
              )}
            </div>
            {checkInCompleted ? (
              <span className="text-sm font-semibold text-accent-sage inline-flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Done
              </span>
            ) : (
              <ChevronRight className="w-5 h-5 text-primary/50" />
            )}
          </section>
        )}

        <section className="bg-surface rounded-2xl border border-border p-6 shadow-sm text-center relative overflow-hidden">
          <p className="text-text font-medium italic relative z-10">
            &quot;{dailyQuote.text}&quot;
          </p>
          {dailyQuote.author && (
            <p className="text-xs text-text-muted mt-3 relative z-10">
              — {dailyQuote.author}
            </p>
          )}
        </section>

        <section>
          <h3 className="text-lg font-bold text-text mb-3">Explore</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'Community',
                icon: Users,
                to: '/community',
                color: 'bg-accent-sage/15 text-accent-sage'
              },
              {
                label: 'Challenges',
                icon: Trophy,
                to: '/challenges',
                color: 'bg-primary/10 text-primary'
              },
              {
                label: 'Programs',
                icon: GraduationCap,
                to: '/programs',
                color: 'bg-accent-lavender/30 text-primary'
              },
              {
                label: 'Affiliate',
                icon: Gift,
                to: '/affiliate',
                color: 'bg-accent-sage/15 text-accent-sage'
              },
              {
                label: 'All',
                icon: ChevronRight,
                to: '/discover',
                color: 'bg-surface-2 text-text-muted'
              }
            ].map((tile) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.label}
                  type="button"
                  onClick={() => navigate(tile.to)}
                  className="bg-surface border border-border rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.98] text-left">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${tile.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-bold text-text">{tile.label}</p>
                </button>
              );
            })}
          </div>
        </section>

        {familyCode && (
          <section className="bg-surface-2 rounded-xl p-4 flex items-center justify-between border border-border border-dashed">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">
                Family Code
              </p>
              <p className="font-bold text-primary tracking-widest">
                {familyCode}
              </p>
            </div>
            <button
              type="button"
              onClick={copyCode}
              className="p-2 bg-surface rounded-lg border border-border text-text hover:bg-border transition-colors">
              <Copy className="w-5 h-5" />
            </button>
          </section>
        )}
      </div>

      <CenteredModal
        open={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        hideHeader
        panelClassName="relative !p-8 flex flex-col items-center text-center">
        <button
          type="button"
          onClick={() => setShowStreakModal(false)}
          className="absolute top-4 right-4 p-2 -mr-2 text-text-muted hover:text-text"
          aria-label="Close">
          <X className="w-5 h-5" />
        </button>
        <div className="w-24 h-24 bg-orange-100 dark:bg-primary/20 rounded-full flex items-center justify-center mb-6">
          {homeMode === 'business' ? (
            <Briefcase className="w-12 h-12 text-primary" />
          ) : homeMode === 'coaching' ? (
            <Sparkles className="w-12 h-12 text-primary" />
          ) : (
            <Flame className="w-12 h-12 text-orange-500 fill-orange-500" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">{streakDays} Days!</h2>
        <p className="text-sm text-text-muted">
          {homeMode === 'business'
            ? 'Consistency compounds. Keep moving your business goals forward.'
            : homeMode === 'coaching'
              ? 'Keep showing up. Growth happens one day at a time.'
              : "You're on fire! Keep up the amazing work building healthy habits."}
        </p>
      </CenteredModal>

      <WeeklyCheckInModal
        open={showCheckIn}
        onClose={() => setShowCheckIn(false)}
      />

      <SheetModal
        open={showJournal}
        onClose={() => setShowJournal(false)}
        panelClassName="max-h-[88vh]"
        header={
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-text">My Journal</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Showing {Math.min(journalVisibleCount, entries.length)} of{' '}
                {entries.length} entries
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowJournal(false)}
              className="p-2 -mr-2 text-text-muted hover:text-text"
              aria-label="Close journal">
              <X className="w-5 h-5" />
            </button>
          </div>
        }>
        <div className="overflow-y-auto max-h-[65vh] -mx-1 px-1">
          {entries.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted bg-surface-2 border border-dashed border-border rounded-2xl">
              No journal entries yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {entries.slice(0, journalVisibleCount).map((entry) => (
                <div
                  key={entry.id}
                  className="bg-surface-2 border border-border rounded-2xl p-3.5">
                  <p className="text-xs font-bold text-text-muted mb-2">
                    {entry.date}
                  </p>
                  <CheckInFeelingDisplay feeling={entry.feeling} />
                  {entry.win && (
                    <p className="text-sm text-text mb-1.5">
                      <span className="font-semibold text-accent-sage">
                        Win:
                      </span>{' '}
                      {entry.win}
                    </p>
                  )}
                  {entry.struggle && (
                    <p className="text-sm text-text mb-1.5">
                      <span className="font-semibold text-accent-gold">
                        Struggle:
                      </span>{' '}
                      {entry.struggle}
                    </p>
                  )}
                  {entry.word && (
                    <p className="text-sm text-text mb-1.5">
                      <span className="font-semibold text-accent-lavender">
                        One word:
                      </span>{' '}
                      {entry.word}
                    </p>
                  )}
                  {entry.need && (
                    <p className="text-sm text-text">
                      <span className="font-semibold text-primary">
                        Next week:
                      </span>{' '}
                      {entry.need}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {entries.length > journalVisibleCount && (
          <button
            type="button"
            onClick={() => setJournalVisibleCount((prev) => prev + 4)}
            className="w-full h-11 mt-4 rounded-xl border border-border bg-surface-2 text-text font-semibold hover:bg-border/40 transition-colors">
            Load 4 more
          </button>
        )}
      </SheetModal>
    </div>
  );
}
