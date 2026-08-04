import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../store';
import { challengesSlice } from '../../store/slices';
import { membershipSlice } from '../../store/membershipSlice';
import {
  ArrowLeft,
  Calendar,
  Users,
  User,
  Share2,
  Copy,
  Crown,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { canAccessFeature } from '../../utils/membershipAccess';
import { UpgradeGate } from '../../components/membership/UpgradeGate';

type ParticipantTab = 'all' | 'family' | 'community';

const PARTICIPANT_TABS: { id: ParticipantTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'family', label: 'Family' },
  { id: 'community', label: 'Community' }
];

export function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [participantTab, setParticipantTab] = useState<ParticipantTab>('all');
  const challenge = useSelector((state: RootState) =>
    state.challenges.challenges.find((c) => c.id === id)
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const { tier } = useSelector((state: RootState) => state.membership);

  const canJoinChallenges = canAccessFeature(tier, 'joinChallenges', {
    role: user?.role
  });

  const filteredParticipants = useMemo(() => {
    if (!challenge) return [];
    if (participantTab === 'all') return challenge.leaderboard;
    return challenge.leaderboard.filter((row) => row.group === participantTab);
  }, [challenge, participantTab]);

  const tabCount = (tab: ParticipantTab) => {
    if (!challenge) return 0;
    if (tab === 'all') return challenge.leaderboard.length;
    return challenge.leaderboard.filter((row) => row.group === tab).length;
  };

  if (!challenge) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center bg-surface">
        <p className="text-text">Challenge not found.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-primary font-bold text-sm">
          Go back
        </button>
      </div>
    );
  }

  const isFull =
    !!challenge.isExclusive &&
    !!challenge.maxParticipants &&
    challenge.participants >= challenge.maxParticipants;

  const handleJoin = () => {
    if (!canJoinChallenges) {
      navigate('/work-with-misty');
      return;
    }
    if (challenge.joined) {
      dispatch(challengesSlice.actions.leaveChallenge(challenge.id));
      toast.success('Left challenge');
      return;
    }
    if (isFull) {
      dispatch(challengesSlice.actions.joinWaitlist(challenge.id));
      toast.success('Added to waitlist');
      return;
    }
    dispatch(challengesSlice.actions.joinChallenge(challenge.id));
    toast.success('Joined challenge!');
  };

  const handleComplete = () => {
    dispatch(challengesSlice.actions.completeChallenge(challenge.id));
    if (challenge.createdByMisty) {
      dispatch(membershipSlice.actions.markMistyChallengeCompleted());
    }
    toast.success('Challenge completed — great work!');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(challenge.referralLink);
    toast.success('Referral link copied — share to earn rewards');
  };

  const joinLabel = challenge.joined
    ? 'Leave Challenge'
    : !canJoinChallenges
      ? 'Upgrade to join'
      : challenge.onWaitlist
        ? 'On waitlist'
        : isFull
          ? 'Join waitlist'
          : 'Join Challenge';

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-40 bg-surface">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-text truncate px-2">
          {challenge.title}
        </h1>
        <button
          type="button"
          onClick={handleShare}
          className="p-2 -mr-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${challenge.type === 'team' ? 'bg-accent-sage/15 text-accent-sage' : 'bg-accent-lavender/30 text-primary'}`}>
            {challenge.type === 'team' ? (
              <Users className="w-3 h-3 inline mr-1" />
            ) : (
              <User className="w-3 h-3 inline mr-1" />
            )}
            {challenge.type}
          </span>
          {challenge.createdByMisty && (
            <span className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-2 py-1 rounded inline-flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Misty-led
            </span>
          )}
          {challenge.isExclusive && (
            <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-1 rounded">
              Exclusive · ${challenge.price?.toLocaleString()}
            </span>
          )}
          {challenge.completed && (
            <span className="text-[10px] uppercase tracking-wider font-bold bg-accent-sage/15 text-accent-sage px-2 py-1 rounded inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Completed
            </span>
          )}
        </div>

        <h2 className="text-2xl font-bold text-text mb-2">{challenge.title}</h2>
        <p className="text-sm text-text-muted leading-relaxed mb-5">
          {challenge.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-surface-2 rounded-xl p-3 border border-border">
            <Calendar className="w-4 h-4 text-primary mb-1.5" />
            <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-0.5">
              Dates
            </p>
            <p className="text-sm font-bold text-text">
              {challenge.startDate} – {challenge.endDate}
            </p>
          </div>
          <div className="bg-surface-2 rounded-xl p-3 border border-border">
            <Users className="w-4 h-4 text-primary mb-1.5" />
            <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-0.5">
              {challenge.isExclusive ? 'Seats' : 'Participants'}
            </p>
            <p className="text-sm font-bold text-text">
              {challenge.participants}
              {challenge.maxParticipants
                ? ` / ${challenge.maxParticipants}`
                : ''}
              {challenge.waitlistCount
                ? ` · ${challenge.waitlistCount} waitlist`
                : ''}
            </p>
          </div>
        </div>

        {!canJoinChallenges && !challenge.joined && (
          <div className="mb-6">
            <UpgradeGate
              compact
              title="Coaching / challenge membership required"
              description="Book-only access does not include active challenges. Request to work with Misty or join a paid challenge."
            />
          </div>
        )}

        <div className="rounded-2xl bg-accent-lavender/15 border border-accent-lavender/30 p-4 mb-6">
          <p className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1">
            Challenge Link
          </p>
          <p className="text-xs text-text mb-3 leading-snug">
            Share this link with your family and community.
          </p>
          <div className="flex items-center gap-2 bg-surface rounded-lg p-2 border border-border">
            <span className="text-xs text-text font-mono flex-1 truncate">
              {challenge.referralLink}
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="text-xs font-bold text-primary p-1.5 hover:bg-primary/10 rounded">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Participants
        </h3>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 -mx-1 px-1">
          {PARTICIPANT_TABS.map(({ id: tabId, label }) => {
            const active = participantTab === tabId;
            return (
              <button
                key={tabId}
                type="button"
                onClick={() => setParticipantTab(tabId)}
                className={`px-3 h-9 rounded-full text-xs font-bold whitespace-nowrap border transition-all shrink-0 ${active ? 'bg-primary text-white border-primary' : 'bg-surface text-text border-border hover:border-primary/40'}`}>
                {label} ({tabCount(tabId)})
              </button>
            );
          })}
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {filteredParticipants.length === 0 ? (
            <p className="p-6 text-sm text-text-muted text-center">
              No participants in this group yet.
            </p>
          ) : (
            filteredParticipants.map((row, i) => (
              <div
                key={`${row.rank}-${row.name}`}
                className={`flex items-center gap-3 p-3 ${i !== filteredParticipants.length - 1 ? 'border-b border-border' : ''} ${row.isYou ? 'bg-primary/5' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${row.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' : row.rank <= 3 ? 'bg-surface-2 text-text' : 'bg-surface-2 text-text-muted'}`}>
                  {row.rank === 1 ? <Crown className="w-4 h-4" /> : row.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm font-semibold ${row.isYou ? 'text-primary' : 'text-text'}`}>
                    {row.name}
                    {row.isYou && (
                      <span className="text-[10px] ml-2 uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                        You
                      </span>
                    )}
                  </span>
                  {row.group && (
                    <p className="text-[10px] text-text-muted capitalize mt-0.5">
                      {row.group}
                    </p>
                  )}
                </div>
                <span className="text-xs font-bold text-text-muted">
                  {row.points} pts
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/90 backdrop-blur border-t border-border z-30 max-w-[420px] mx-auto pb-safe flex flex-col gap-2">
        {challenge.joined && !challenge.completed && (
          <button
            type="button"
            onClick={handleComplete}
            className="w-full h-12 rounded-2xl font-bold text-base bg-accent-sage text-white shadow-md shadow-accent-sage/20 hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Complete Challenge
          </button>
        )}
        <button
          type="button"
          onClick={handleJoin}
          disabled={!!challenge.onWaitlist && !challenge.joined}
          className={`w-full h-14 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-60 ${challenge.joined ? 'bg-surface-2 text-text border border-border' : 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover'}`}>
          {joinLabel}
        </button>
      </div>
    </div>
  );
}
