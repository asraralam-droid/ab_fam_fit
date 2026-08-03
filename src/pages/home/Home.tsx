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
  LayoutDashboard,
  NotebookPen,
  Briefcase,
  Cog,
  CalendarCheck,
  Sparkles,
  Heart
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
  const { tier, coachingRequest } = useSelector(
    (state: RootState) => state.membership
  );
  const { pillars, businessFollowUp, mentalFollowUp, fitnessFollowUp } =
    useSelector((state: RootState) => state.onboarding);
  const { entries } = useSelector((state: RootState) => state.checkIn);
  const { quotes, quoteDisplayMode } = useSelector(
    (state: RootState) => state.content
  );

  const normalizedPillars = useMemo(() => {
    const mapped = pillars
      .map((p) => normalizePillarId(p))
      .filter((p): p is AbPillarId => !!p);
    // Infer from follow-ups if pillars weren't persisted
    if (!mapped.length && businessFollowUp) return ['business'] as AbPillarId[];
    if (!mapped.length && mentalFollowUp)
      return ['life-coaching'] as AbPillarId[];
    if (!mapped.length && fitnessFollowUp)
      return ['health-wellness'] as AbPillarId[];
    return mapped;
  }, [pillars, businessFollowUp, mentalFollowUp, fitnessFollowUp]);

  const homeMode = normalizedPillars.length
    ? primaryDashboardMode(normalizedPillars)
    : 'fitness';
  const needsPillarSetup = normalizedPillars.length === 0;
  const showFitness =
    !needsPillarSetup &&
    (homeMode === 'fitness' || homeMode === 'mixed');
  const showBusiness =
    !needsPillarSetup &&
    (homeMode === 'business' || homeMode === 'mixed');
  const showCoaching =
    !needsPillarSetup &&
    (homeMode === 'coaching' || homeMode === 'mixed');

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

  const consultingProgress = businessFollowUp?.consultingNeeds?.length
    ? Math.min(90, businessFollowUp.consultingNeeds.length * 28)
    : 35;
  const automationProgress = businessFollowUp?.automationNeeds?.length
    ? Math.min(90, businessFollowUp.automationNeeds.length * 30)
    : 20;
  const retainerActive = tier === 'coaching' || tier === 'challenge';

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

  const journeyLabel =
    homeMode === 'business'
      ? 'of your business journey'
      : homeMode === 'coaching'
        ? 'of your coaching journey'
        : homeMode === 'mixed'
          ? 'of your Authentic Balance journey'
          : 'of your wellness journey';

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
          {needsPillarSetup
            ? 'Complete your path setup'
            : homeMode === 'business'
              ? 'Business home'
              : homeMode === 'coaching'
                ? 'Life coaching home'
                : homeMode === 'mixed'
                  ? 'Multi-pillar home'
                  : 'Health & wellness home'}
        </p>
      </div>

      <div className="px-4 flex flex-col gap-6">
        {!canAccessLessons && (
          <UpgradeGate
            compact
            title={
              homeMode === 'business'
                ? 'Basic business entry unlocked'
                : 'Books + self-guided tools unlocked'
            }
            description={
              homeMode === 'business'
                ? 'Want premium consulting, automation build-outs, or coaching? Request to work with Misty.'
                : 'Want step-by-step lessons, meal/juice guidance, or coaching? Request to work with Misty or join a paid challenge.'
            }
          />
        )}

        {needsPillarSetup && (
          <section className="bg-primary/5 rounded-2xl border border-primary/20 p-5">
            <h3 className="text-lg font-bold text-text mb-1">
              Set your Authentic Balance path
            </h3>
            <p className="text-sm text-text-muted mb-4">
              Your home is personalized by pillar. Complete onboarding so we
              show Business, Health, or Life Coaching — not everything at once.
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
                {homeMode === 'business' ? (
                  <Briefcase className="w-6 h-6 text-white" />
                ) : (
                  <Flame className="w-6 h-6 text-orange-300 fill-orange-300" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {homeMode === 'business'
                    ? `${streakDays}-Day Momentum`
                    : `${streakDays} Day Streak`}
                </h2>
                <p className="text-white/80 text-sm">
                  {homeMode === 'business'
                    ? 'Keep showing up for your business goals'
                    : `Longest: ${longestStreak} days`}
                </p>
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
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="text-sm font-medium text-primary flex items-center gap-1">
                  Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-text">
                      {businessFollowUp?.orgType || 'Business track'}
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
                  {(businessFollowUp?.consultingNeeds?.length
                    ? businessFollowUp.consultingNeeds
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
                  businessFollowUp?.consultingNeeds?.[0]
                    ? `Advance: ${businessFollowUp.consultingNeeds[0]}`
                    : 'Define consulting priorities',
                  businessFollowUp?.automationNeeds?.[0]
                    ? `Automate: ${businessFollowUp.automationNeeds[0]}`
                    : 'Map automation opportunities',
                  retainerActive
                    ? 'Prep for your next Misty session'
                    : 'Upgrade to work with Misty'
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
                    {(businessFollowUp?.automationNeeds?.length
                      ? businessFollowUp.automationNeeds
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

            <section className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-lavender/30 text-primary flex items-center justify-center flex-shrink-0">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text">
                      Retainer status
                    </h3>
                    <p className="text-sm text-text-muted mt-0.5">
                      {retainerActive
                        ? 'Active Misty consulting retainer'
                        : coachingRequest.submitted
                          ? 'Work with Misty request submitted'
                          : 'No active retainer yet'}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex-shrink-0 ${retainerActive ? 'bg-accent-sage/20 text-accent-sage' : 'bg-surface-2 text-text-muted'}`}>
                  {retainerActive ? 'Active' : 'Pending'}
                </span>
              </div>
              {!retainerActive && (
                <button
                  type="button"
                  onClick={() => navigate('/work-with-misty')}
                  className="w-full h-11 mt-4 rounded-xl bg-primary text-white text-sm font-bold">
                  Work with Misty
                </button>
              )}
            </section>
          </>
        )}

        {showFitness && (
          <>
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

        {showCoaching && !showFitness && (
          <section className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="w-5 h-5 text-accent-lavender" />
              <h3 className="text-lg font-bold text-text">Focus areas</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {(mentalFollowUp?.focusAreas?.length
                ? mentalFollowUp.focusAreas
                : ['Clarity', 'Accountability']
              ).map((area) => (
                <span
                  key={area}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  {area}
                </span>
              ))}
            </div>
            {mentalFollowUp?.expectations && (
              <p className="text-sm text-text-muted">
                {mentalFollowUp.expectations}
              </p>
            )}
          </section>
        )}

        {(showFitness || showCoaching) && (
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

        {showBusiness && !showFitness && !showCoaching && (
          <section
            onClick={() => navigate('/dashboard')}
            className="bg-primary/5 rounded-2xl border border-primary/20 p-5 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-lg font-bold text-primary">
                  Open business dashboard
                </h3>
                <p className="text-sm text-text-muted mt-0.5">
                  Full consulting, automation & retainer metrics
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-primary/50" />
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
                label: 'My Dashboard',
                icon: LayoutDashboard,
                to: '/dashboard',
                color: 'bg-primary/10 text-primary'
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
          ) : (
            <Flame className="w-12 h-12 text-orange-500 fill-orange-500" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">{streakDays} Days!</h2>
        <p className="text-sm text-text-muted">
          {homeMode === 'business'
            ? 'Consistency compounds. Keep moving your business goals forward.'
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
