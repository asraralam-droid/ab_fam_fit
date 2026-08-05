import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { onboardingSlice } from '../../store/slices';
import { communitySlice } from '../../store/communitySlice';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  AB_PILLARS,
  BEHAVIORAL_STAGE_OPTIONS,
  IDENTITY_ROLE_OPTIONS,
  IMPROVE_AREA_OPTIONS,
  buildBusinessFollowUpFromAnswers,
  buildFitnessFollowUpFromAnswers,
  buildMentalFollowUpFromAnswers,
  toCommunityPillar,
  type AbPillarId
} from '../../utils/abPillars';

type StepId =
  | 'welcome'
  | 'pillar'
  | 'stage'
  | 'role'
  | 'improve'
  | 'obstacle'
  | 'done';

const STEPS: StepId[] = [
  'welcome',
  'pillar',
  'stage',
  'role',
  'improve',
  'obstacle',
  'done'
];

function toggleInList(list: string[], value: string) {
  return list.includes(value) ?
    list.filter((v) => v !== value) :
    [...list, value];
}

export function Onboarding() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [startingPillar, setStartingPillar] = useState<AbPillarId | null>(null);
  const [behavioralStage, setBehavioralStage] = useState('');
  const [identityRole, setIdentityRole] = useState('');
  const [improveAreas, setImproveAreas] = useState<string[]>([]);
  const [biggestObstacle, setBiggestObstacle] = useState('');
  const [stepIndex, setStepIndex] = useState(0);

  const step = STEPS[Math.min(stepIndex, STEPS.length - 1)];
  const questionNumber = useMemo(() => {
    const map: Partial<Record<StepId, number>> = {
      pillar: 1,
      stage: 2,
      role: 3,
      improve: 4,
      obstacle: 5
    };
    return map[step] ?? null;
  }, [step]);

  const canContinue = () => {
    if (step === 'pillar') return !!startingPillar;
    if (step === 'stage') return !!behavioralStage;
    if (step === 'role') return !!identityRole;
    if (step === 'improve') return improveAreas.length > 0;
    if (step === 'obstacle') return biggestObstacle.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (!canContinue()) {
      toast.error('Please complete this step to continue');
      return;
    }
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
    else handleComplete();
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleComplete = () => {
    if (!startingPillar) return;

    const answers = {
      identityRole,
      improveAreas,
      biggestObstacle
    };
    const community = toCommunityPillar(startingPillar);
    const fitnessFollowUp =
      community === 'health-wellness' ?
        buildFitnessFollowUpFromAnswers(answers) :
        null;
    const businessFollowUp =
      community === 'business' ?
        buildBusinessFollowUpFromAnswers(answers) :
        null;
    const mentalFollowUp =
      community === 'life-coaching' ?
        buildMentalFollowUpFromAnswers(answers) :
        null;

    dispatch(
      onboardingSlice.actions.setOnboardingData({
        pillars: [startingPillar],
        behavioralStage,
        identityRole,
        improveAreas,
        biggestObstacle: biggestObstacle.trim(),
        goals: improveAreas,
        dietary: [],
        currentWeight: null,
        goalWeight: null,
        assessments: {},
        fitnessFollowUp,
        businessFollowUp,
        mentalFollowUp
      })
    );

    // Unlock only the community for the starting pillar
    const joinedCommunityIds = new Set<string>();
    for (const pillar of AB_PILLARS) {
      if (pillar.id !== startingPillar) continue;
      joinedCommunityIds.add(pillar.communityId);
    }
    for (const pillar of AB_PILLARS) {
      dispatch(
        communitySlice.actions.setGroupJoined({
          groupId: pillar.communityId,
          joined: joinedCommunityIds.has(pillar.communityId)
        })
      );
    }

    dispatch(onboardingSlice.actions.completeOnboarding());
    navigate('/home');
  };

  const optionCard = (
    selected: boolean,
    label: string,
    onClick: () => void,
    description?: string
  ) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className={`p-4 rounded-xl border text-left transition-all ${selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-surface hover:border-primary/50'}`}>
      <span
        className={`font-medium block ${selected ? 'text-primary' : 'text-text'}`}>
        {label}
      </span>
      {description ? (
        <span className="text-xs text-text-muted mt-1 block">{description}</span>
      ) : null}
    </button>
  );

  const chip = (selected: boolean, label: string, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-full border text-sm font-medium transition-all ${selected ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-text'}`}>
      {label}
    </button>
  );

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="flex flex-col justify-center h-full min-h-[50vh] text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Authentic Balance Institute
            </p>
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              Welcome to the Authentic Balance Institute.
            </h2>
            <p className="text-text-muted text-lg">
              Let&apos;s discover where your journey begins.
            </p>
          </div>
        );

      case 'pillar':
        return (
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-2">
              Which area of your life would you most like to strengthen right
              now?
            </h2>
            <p className="text-text-muted mb-6">Choose one.</p>
            <div className="flex flex-col gap-3">
              {AB_PILLARS.map((pillar) =>
                optionCard(
                  startingPillar === pillar.id,
                  pillar.label,
                  () => setStartingPillar(pillar.id),
                  pillar.description
                )
              )}
            </div>
          </div>
        );

      case 'stage':
        return (
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-2">
              Which statement best describes you today?
            </h2>
            <p className="text-text-muted mb-6">Choose one.</p>
            <div className="flex flex-col gap-3">
              {BEHAVIORAL_STAGE_OPTIONS.map((opt) =>
                optionCard(behavioralStage === opt, opt, () =>
                  setBehavioralStage(opt)
                )
              )}
            </div>
          </div>
        );

      case 'role':
        return (
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-2">Who are you?</h2>
            <p className="text-text-muted mb-6">Choose one.</p>
            <div className="flex flex-col gap-3">
              {IDENTITY_ROLE_OPTIONS.map((opt) =>
                optionCard(identityRole === opt, opt, () =>
                  setIdentityRole(opt)
                )
              )}
            </div>
          </div>
        );

      case 'improve':
        return (
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-2">
              What would you most like to improve over the next 90 days?
            </h2>
            <p className="text-text-muted mb-6">Select all that apply.</p>
            <div className="flex flex-wrap gap-2">
              {IMPROVE_AREA_OPTIONS.map((opt) =>
                chip(improveAreas.includes(opt), opt, () =>
                  setImproveAreas((prev) => toggleInList(prev, opt))
                )
              )}
            </div>
          </div>
        );

      case 'obstacle':
        return (
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-2">
              What is your biggest obstacle right now?
            </h2>
            <p className="text-text-muted mb-6">
              Share in your own words — this helps us support you better.
            </p>
            <textarea
              value={biggestObstacle}
              onChange={(e) => setBiggestObstacle(e.target.value)}
              rows={6}
              placeholder="Type your answer here…"
              className="w-full p-4 rounded-xl bg-surface-2 border border-border outline-none resize-none text-sm focus:border-primary"
            />
          </div>
        );

      case 'done':
        return (
          <div className="flex flex-col items-center text-center justify-center h-full py-10">
            <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center mb-8 shadow-xl shadow-primary/30 relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: 0.2
                }}>
                <Check className="w-16 h-16 text-white" />
              </motion.div>
            </div>
            <h2 className="text-3xl font-bold mb-4">You&apos;re all set!</h2>
            <p className="text-text-muted text-lg">
              Your starting path is ready. We&apos;ll use your answers to guide
              recommendations as you continue.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border">
        {stepIndex > 0 && step !== 'done' ? (
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 text-text-muted hover:text-text">
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <div className="flex flex-col items-center gap-1">
          {questionNumber ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Question {questionNumber} of 5
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              {step === 'welcome' ? 'Welcome' : 'Complete'}
            </span>
          )}
          <div className="flex gap-1.5">
            {STEPS.map((id, i) => (
              <div
                key={id}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === stepIndex ? 'w-6 bg-primary' : i < stepIndex ? 'w-2 bg-primary/40' : 'w-2 bg-border'}`}
              />
            ))}
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full">
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 pt-2 border-t border-border bg-surface">
        <button
          type="button"
          onClick={handleNext}
          className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          {step === 'done' ?
            'Go to Home' :
            step === 'welcome' ?
              'Begin' :
              'Continue'}
          {step !== 'done' && <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
