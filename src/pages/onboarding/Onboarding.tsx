import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authSlice, onboardingSlice } from '../../store/slices';
import { communitySlice } from '../../store/communitySlice';
import type { RootState } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AB_PILLARS,
  BUSINESS_AUTOMATION_OPTIONS,
  BUSINESS_CONSULTING_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  FITNESS_CHALLENGE_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  FITNESS_OUTCOME_OPTIONS,
  MENTAL_FOCUS_OPTIONS,
  PILLAR_ASSESSMENTS,
  needsBusinessFollowUp,
  needsFitnessFollowUp,
  needsMentalFollowUp,
  type AbPillarId
} from '../../utils/abPillars';

type StepId =
  | 'pillars'
  | 'fitness'
  | 'business'
  | 'mental'
  | 'assessment'
  | 'profile'
  | 'done';

function toggleInList(list: string[], value: string) {
  return list.includes(value) ?
    list.filter((v) => v !== value) :
    [...list, value];
}

export function Onboarding() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [pillars, setPillars] = useState<AbPillarId[]>([]);
  const [fitnessChallenges, setFitnessChallenges] = useState<string[]>([]);
  const [fitnessGoals, setFitnessGoals] = useState<string[]>([]);
  const [fitnessOutcomes, setFitnessOutcomes] = useState<string[]>([]);
  const [fitnessExpectations, setFitnessExpectations] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [orgType, setOrgType] = useState('');
  const [consultingNeeds, setConsultingNeeds] = useState<string[]>([]);
  const [automationNeeds, setAutomationNeeds] = useState<string[]>([]);
  const [businessNotes, setBusinessNotes] = useState('');
  const [mentalFocus, setMentalFocus] = useState<string[]>([]);
  const [mentalExpectations, setMentalExpectations] = useState('');
  const [assessments, setAssessments] = useState<Record<string, number>>({});
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const assessmentQuestions = useMemo(
    () => pillars.flatMap((p) => PILLAR_ASSESSMENTS[p] ?? []),
    [pillars]
  );

  const steps = useMemo((): StepId[] => {
    const s: StepId[] = ['pillars'];
    if (needsFitnessFollowUp(pillars)) s.push('fitness');
    if (needsBusinessFollowUp(pillars)) s.push('business');
    if (needsMentalFollowUp(pillars)) s.push('mental');
    if (assessmentQuestions.length) s.push('assessment');
    s.push('profile', 'done');
    return s;
  }, [pillars, assessmentQuestions.length]);

  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  const canContinue = () => {
    if (step === 'pillars') return pillars.length > 0;
    if (step === 'business') {
      return (
        !!orgType &&
        (consultingNeeds.length > 0 || automationNeeds.length > 0)
      );
    }
    if (step === 'assessment') {
      return assessmentQuestions.every((q) => assessments[q.id] >= 1);
    }
    return true;
  };

  const handleNext = () => {
    if (!canContinue()) {
      toast.error('Please complete this step to continue');
      return;
    }
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
    else handleComplete();
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleComplete = () => {
    dispatch(
      onboardingSlice.actions.setOnboardingData({
        pillars,
        goals: fitnessGoals,
        dietary: [],
        currentWeight: currentWeight ? Number(currentWeight) : null,
        goalWeight: goalWeight ? Number(goalWeight) : null,
        assessments,
        fitnessFollowUp: needsFitnessFollowUp(pillars) ?
          {
            challenges: fitnessChallenges,
            goals: fitnessGoals,
            outcomes: fitnessOutcomes,
            expectations: fitnessExpectations
          } :
          null,
        businessFollowUp: needsBusinessFollowUp(pillars) ?
          {
            orgType,
            consultingNeeds,
            automationNeeds,
            notes: businessNotes
          } :
          null,
        mentalFollowUp: needsMentalFollowUp(pillars) ?
          {
            focusAreas: mentalFocus,
            expectations: mentalExpectations
          } :
          null
      })
    );

    // Unlock only communities for selected pillars (avoid access-everything chaos)
    for (const pillar of AB_PILLARS) {
      const shouldJoin = pillars.includes(pillar.id);
      dispatch(
        communitySlice.actions.setGroupJoined({
          groupId: pillar.communityId,
          joined: shouldJoin
        })
      );
    }

    if (displayName.trim()) {
      dispatch(
        authSlice.actions.updateProfile({
          name: displayName.trim(),
          avatar: uploadedAvatar
        })
      );
    }
    dispatch(onboardingSlice.actions.completeOnboarding());
    navigate('/home');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedAvatar(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const chip = (
    selected: boolean,
    label: string,
    onClick: () => void
  ) => (
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
      case 'pillars':
        return (
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-2">
              Which Authentic Balance path is yours?
            </h2>
            <p className="text-text-muted mb-6">
              Choose one or more AB pillars. You&apos;ll start in that
              community only — other spaces stay locked until you join them
              intentionally.
            </p>
            <div className="flex flex-col gap-3">
              {AB_PILLARS.map((pillar) => {
                const selected = pillars.includes(pillar.id);
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() =>
                      setPillars((prev) =>
                        prev.includes(pillar.id) ?
                          prev.filter((p) => p !== pillar.id) :
                          [...prev, pillar.id]
                      )
                    }
                    className={`p-4 rounded-xl border text-left transition-all ${selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-surface hover:border-primary/50'}`}>
                    <span
                      className={`font-medium block ${selected ? 'text-primary' : 'text-text'}`}>
                      {pillar.label}
                    </span>
                    <span className="text-xs text-text-muted mt-1 block">
                      {pillar.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'fitness':
        return (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Health &amp; Wellness</h2>
              <p className="text-text-muted">
                Goals, current challenges, and desired outcomes.
              </p>
            </div>
            <div>
              <p className="text-sm font-bold text-text mb-2">
                Current challenges
              </p>
              <div className="flex flex-wrap gap-2">
                {FITNESS_CHALLENGE_OPTIONS.map((opt) =>
                  chip(fitnessChallenges.includes(opt), opt, () =>
                    setFitnessChallenges((p) => toggleInList(p, opt))
                  )
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-text mb-2">Goals</p>
              <div className="flex flex-wrap gap-2">
                {FITNESS_GOAL_OPTIONS.map((opt) =>
                  chip(fitnessGoals.includes(opt), opt, () =>
                    setFitnessGoals((p) => toggleInList(p, opt))
                  )
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-text mb-2">
                Desired outcomes
              </p>
              <div className="flex flex-wrap gap-2">
                {FITNESS_OUTCOME_OPTIONS.map((opt) =>
                  chip(fitnessOutcomes.includes(opt), opt, () =>
                    setFitnessOutcomes((p) => toggleInList(p, opt))
                  )
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text">
                  Current weight (lbs)
                </label>
                <input
                  type="number"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  placeholder="Optional"
                  className="w-full h-12 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text">
                  Goal weight (lbs)
                </label>
                <input
                  type="number"
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(e.target.value)}
                  placeholder="Optional"
                  className="w-full h-12 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none"
                />
              </div>
            </div>
            <textarea
              value={fitnessExpectations}
              onChange={(e) => setFitnessExpectations(e.target.value)}
              rows={3}
              placeholder="Anything else about your desired outcomes?"
              className="w-full p-3 rounded-xl bg-surface-2 border border-border outline-none resize-none text-sm"
            />
          </div>
        );

      case 'business':
        return (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Business</h2>
              <p className="text-text-muted">
                Business type, consulting needs, and automation needs.
              </p>
            </div>
            <div>
              <p className="text-sm font-bold text-text mb-2">Business type</p>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_TYPE_OPTIONS.map((opt) =>
                  chip(orgType === opt, opt, () => setOrgType(opt))
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-text mb-2">
                Consulting needs
              </p>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_CONSULTING_OPTIONS.map((opt) =>
                  chip(consultingNeeds.includes(opt), opt, () =>
                    setConsultingNeeds((p) => toggleInList(p, opt))
                  )
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-text mb-2">
                Automation needs
              </p>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_AUTOMATION_OPTIONS.map((opt) =>
                  chip(automationNeeds.includes(opt), opt, () =>
                    setAutomationNeeds((p) => toggleInList(p, opt))
                  )
                )}
              </div>
            </div>
            <textarea
              value={businessNotes}
              onChange={(e) => setBusinessNotes(e.target.value)}
              rows={3}
              placeholder="Industry, timeline, team size…"
              className="w-full p-3 rounded-xl bg-surface-2 border border-border outline-none resize-none text-sm"
            />
          </div>
        );

      case 'mental':
        return (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Life Coaching / Mental Wellness
              </h2>
              <p className="text-text-muted">
                What kind of coaching support are you seeking?
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {MENTAL_FOCUS_OPTIONS.map((opt) =>
                chip(mentalFocus.includes(opt), opt, () =>
                  setMentalFocus((p) => toggleInList(p, opt))
                )
              )}
            </div>
            <textarea
              value={mentalExpectations}
              onChange={(e) => setMentalExpectations(e.target.value)}
              rows={3}
              placeholder="What would meaningful progress look like?"
              className="w-full p-3 rounded-xl bg-surface-2 border border-border outline-none resize-none text-sm"
            />
          </div>
        );

      case 'assessment':
        return (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold mb-2">Quick assessment</h2>
              <p className="text-text-muted text-sm">
                Rate each item from 1 (needs work) to 5 (strong). This feeds
                your personalized dashboard and Misty&apos;s admin metrics.
              </p>
            </div>
            {assessmentQuestions.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-border bg-surface">
                <p className="text-sm font-semibold text-text mb-3">
                  {q.prompt}
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setAssessments((prev) => ({ ...prev, [q.id]: n }))
                      }
                      className={`flex-1 h-10 rounded-lg font-bold text-sm border ${assessments[q.id] === n ? 'bg-primary text-white border-primary' : 'bg-surface-2 border-border text-text'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'profile':
        return (
          <div className="flex flex-col">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <h2 className="text-2xl font-bold mb-2">Set up your profile</h2>
            <p className="text-text-muted mb-6">How should we call you?</p>
            <div className="flex flex-col gap-6">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border outline-none"
                placeholder="Display name"
              />
              <div className="flex flex-col gap-3 items-center">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-primary/40 bg-surface-2 flex items-center justify-center">
                  {uploadedAvatar ? (
                    <img
                      src={uploadedAvatar}
                      alt="Uploaded avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-text-muted" />
                  )}
                </button>
              </div>
            </div>
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
              Your pillar community and basic tools are ready. Upgrade anytime
              for coaching, programs, and Misty challenges.
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
        <div className="flex gap-1.5">
          {steps.map((id, i) => (
            <div
              key={id}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === stepIndex ? 'w-6 bg-primary' : i < stepIndex ? 'w-2 bg-primary/40' : 'w-2 bg-border'}`}
            />
          ))}
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
          {step === 'done' ? 'Go to Dashboard' : 'Continue'}
          {step !== 'done' && <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
