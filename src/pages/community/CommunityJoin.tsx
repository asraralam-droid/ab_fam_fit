import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Check, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { RootState } from '../../store';
import { communitySlice } from '../../store/communitySlice';
import { AB_PRODUCT_JOURNEY } from '../../utils/membershipAccess';
import { PILLAR_ASSESSMENTS, type AbPillarId } from '../../utils/abPillars';

type Step = 'intro' | 'assessment' | 'payment' | 'done';

export function CommunityJoin() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const group = useSelector((state: RootState) =>
    state.community.groups.find((g) => g.id === groupId)
  );
  const { pillars } = useSelector((state: RootState) => state.onboarding);

  const [step, setStep] = useState<Step>('intro');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [paying, setPaying] = useState(false);

  const assessmentQs = useMemo(() => {
    const pillar = group?.pillarId as AbPillarId | null | undefined;
    if (!pillar) return PILLAR_ASSESSMENTS['health-wellness'].slice(0, 2);
    return PILLAR_ASSESSMENTS[pillar] ?? [];
  }, [group?.pillarId]);

  if (!group) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 bg-surface">
        <p className="text-text">Community not found.</p>
        <button
          type="button"
          onClick={() => navigate('/community')}
          className="text-primary font-bold text-sm">
          Back to Community
        </button>
      </div>
    );
  }

  if (group.joined) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 bg-surface text-center">
        <Check className="w-10 h-10 text-accent-sage" />
        <h2 className="text-xl font-bold">You&apos;re already in</h2>
        <p className="text-sm text-text-muted">{group.name}</p>
        <button
          type="button"
          onClick={() => navigate('/community')}
          className="mt-2 h-11 px-6 rounded-xl bg-primary text-white font-bold">
          Open feed
        </button>
      </div>
    );
  }

  const requiresPay = (group.entryPrice ?? 0) > 0;
  const assessmentDone = assessmentQs.every((q) => scores[q.id] >= 1);

  const finishJoin = () => {
    dispatch(
      communitySlice.actions.setGroupJoined({
        groupId: group.id,
        joined: true
      })
    );
    setStep('done');
    toast.success(`Joined ${group.name}`);
  };

  const handleContinue = () => {
    if (step === 'intro') {
      setStep('assessment');
      return;
    }
    if (step === 'assessment') {
      if (!assessmentDone) {
        toast.error('Complete the assessment first');
        return;
      }
      if (requiresPay) setStep('payment');
      else finishJoin();
      return;
    }
    if (step === 'payment') {
      setPaying(true);
      setTimeout(() => {
        setPaying(false);
        finishJoin();
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface overflow-y-auto">
      <div className="h-16 px-4 flex items-center border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold pr-10 truncate">
          Join {group.name}
        </h1>
      </div>

      {step === 'done' ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-accent-sage/20 text-accent-sage flex items-center justify-center mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome in</h2>
          <p className="text-sm text-text-muted mb-6">
            You now have access to {group.name}. Other communities stay locked
            until you join them the same way.
          </p>
          <button
            type="button"
            onClick={() => navigate('/community')}
            className="w-full h-12 rounded-xl bg-primary text-white font-bold">
            Go to community
          </button>
        </div>
      ) : (
        <div className="p-5 flex flex-col gap-5 pb-28">
          {step === 'intro' && (
            <>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: group.color + '25' }}>
                {group.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text mb-1">
                  {group.name}
                </h2>
                <p className="text-sm text-primary font-semibold mb-3">
                  {group.landingTagline}
                </p>
                <p className="text-sm text-text-muted leading-relaxed">
                  {group.description}
                </p>
              </div>

              {group.isNonprofit && (
                <div className="rounded-xl border border-accent-gold/40 bg-accent-gold/10 p-4">
                  <p className="text-sm font-bold text-text mb-1">
                    Team Pursuit Nonprofit
                  </p>
                  <p className="text-xs text-text-muted leading-relaxed">
                    This space is separate from Authentic Balance business
                    communities. There is no AB FamFit tab here — the only
                    connection is promo codes for nonprofit members when
                    Misty provides them.
                  </p>
                </div>
              )}

              {group.pillarId && !pillars.includes(group.pillarId) && (
                <div className="rounded-xl border border-border bg-surface-2 p-4 flex gap-3">
                  <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-text-muted leading-relaxed">
                    This pillar wasn&apos;t in your original onboarding. Completing
                    this join flow unlocks it without opening every community
                    at once.
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  AB product journey
                </p>
                <div className="flex flex-col gap-2">
                  {AB_PRODUCT_JOURNEY.map((stage, i) => (
                    <div
                      key={stage}
                      className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-text font-medium">{stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'assessment' && (
            <>
              <div>
                <h2 className="text-xl font-bold mb-1">Community assessment</h2>
                <p className="text-sm text-text-muted">
                  Rate 1–5 so we can personalize this space for you.
                </p>
              </div>
              {assessmentQs.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-border">
                  <p className="text-sm font-semibold mb-3">{q.prompt}</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() =>
                          setScores((prev) => ({ ...prev, [q.id]: n }))
                        }
                        className={`flex-1 h-10 rounded-lg font-bold text-sm border ${scores[q.id] === n ? 'bg-primary text-white border-primary' : 'bg-surface-2 border-border'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {step === 'payment' && (
            <div className="rounded-2xl border border-border p-5">
              <h2 className="text-xl font-bold mb-1">Entry for this community</h2>
              <p className="text-sm text-text-muted mb-4">
                Some pillar communities require a basic entry product before
                access.
              </p>
              <p className="text-4xl font-bold text-text mb-1">
                ${group.entryPrice}
              </p>
              <p className="text-xs text-text-muted mb-6">one-time entry</p>
              <ul className="space-y-2 text-sm text-text mb-2">
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-accent-sage" /> Community feed
                  access
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-accent-sage" /> Pillar-specific
                  tools
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-accent-sage" /> Path to premium
                  coaching
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      {step !== 'done' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/95 border-t border-border max-w-[420px] mx-auto">
          <button
            type="button"
            onClick={handleContinue}
            disabled={paying}
            className="w-full h-14 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2">
            {paying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : step === 'intro' ? (
              'Continue to assessment'
            ) : step === 'assessment' && requiresPay ? (
              'Continue to payment'
            ) : step === 'payment' ? (
              `Pay $${group.entryPrice}`
            ) : (
              'Join community'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
