import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { challengesSlice } from '../../store/slices';
import type { RootState } from '../../store';
import { ArrowLeft, Users, User, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { canCreateChallenge } from '../../utils/membershipAccess';

export function ChallengeCreate() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { completedMistyChallenge, workedWithMisty } = useSelector(
    (state: RootState) => state.membership
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'team' | 'solo'>('solo');
  const [days, setDays] = useState(30);
  const [isExclusive, setIsExclusive] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [price, setPrice] = useState(997);
  const [requiresDailyLogs, setRequiresDailyLogs] = useState(true);

  const allowed = canCreateChallenge(
    completedMistyChallenge,
    workedWithMisty,
    user?.role
  );
  if (!allowed) {
    return <Navigate to="/challenges" replace />;
  }

  const isMisty = user?.role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Give your challenge a title');
      return;
    }
    if (isExclusive && (price < 997 || price > 5000)) {
      toast.error('Exclusive challenges are priced $997–$5,000');
      return;
    }
    const id = `c-${Date.now()}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    dispatch(
      challengesSlice.actions.createChallenge({
        id,
        title: title.trim(),
        description:
          description.trim() ||
          'A Misty-led Authentic Balance challenge.',
        type,
        durationDays: days,
        startDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        endDate: new Date(Date.now() + days * 86400000).toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric'
          }
        ),
        participants: 0,
        createdByUser: !isMisty,
        createdByMisty: isMisty,
        creator: isMisty ? 'Misty A.' : user?.name || 'Member',
        referralLink: `https://authenticbalance.app/c/${slug}`,
        joined: false,
        leaderboard: [],
        isExclusive,
        maxParticipants: isExclusive ? maxParticipants : undefined,
        price: isExclusive ? price : undefined,
        waitlistCount: 0,
        requiresDailyLogs
      })
    );
    toast.success('Challenge created by Misty');
    navigate(`/challenges/${id}`, { replace: true });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-surface">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-text">New Challenge</h1>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5 flex-1">
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 flex items-center gap-2">
          <Crown className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-text-muted">
            {isMisty
              ? 'Misty launch mode: you can create exclusive cohorts with caps, pricing, and daily metrics.'
              : 'Unlocked after completing a Misty challenge and working with her.'}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-text">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Elite Monthly Transformation"
            className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-text">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's the goal? Who's it for?"
            rows={3}
            className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none resize-none text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-text">Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('team')}
              className={`flex-1 p-4 rounded-xl border text-left transition-all ${type === 'team' ? 'border-primary bg-primary/5' : 'border-border bg-surface'}`}>
              <Users
                className={`w-5 h-5 mb-2 ${type === 'team' ? 'text-primary' : 'text-text-muted'}`}
              />
              <p
                className={`font-bold text-sm ${type === 'team' ? 'text-primary' : 'text-text'}`}>
                Team
              </p>
            </button>
            <button
              type="button"
              onClick={() => setType('solo')}
              className={`flex-1 p-4 rounded-xl border text-left transition-all ${type === 'solo' ? 'border-primary bg-primary/5' : 'border-border bg-surface'}`}>
              <User
                className={`w-5 h-5 mb-2 ${type === 'solo' ? 'text-primary' : 'text-text-muted'}`}
              />
              <p
                className={`font-bold text-sm ${type === 'solo' ? 'text-primary' : 'text-text'}`}>
                Solo
              </p>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-text">Duration</label>
          <div className="flex gap-2">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`flex-1 h-12 rounded-xl border font-bold text-sm transition-all ${days === d ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-text'}`}>
                {d} days
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center justify-between p-4 rounded-xl border border-border">
          <div>
            <p className="text-sm font-bold text-text">Exclusive high-end</p>
            <p className="text-xs text-text-muted">
              Cap at 10 · $997–$5,000 · waitlist overflow
            </p>
          </div>
          <input
            type="checkbox"
            checked={isExclusive}
            onChange={(e) => setIsExclusive(e.target.checked)}
            className="w-5 h-5 accent-primary"
          />
        </label>

        {isExclusive && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-text">Max seats</label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxParticipants}
                onChange={(e) =>
                  setMaxParticipants(Math.min(10, Number(e.target.value) || 10))
                }
                className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-text">Price ($)</label>
              <input
                type="number"
                min={997}
                max={5000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 997)}
                className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border outline-none"
              />
            </div>
          </div>
        )}

        <label className="flex items-center justify-between p-4 rounded-xl border border-border">
          <div>
            <p className="text-sm font-bold text-text">Require daily metrics</p>
            <p className="text-xs text-text-muted">
              Water, meals, weight, mood → Admin Dashboard
            </p>
          </div>
          <input
            type="checkbox"
            checked={requiresDailyLogs}
            onChange={(e) => setRequiresDailyLogs(e.target.checked)}
            className="w-5 h-5 accent-primary"
          />
        </label>

        <div className="mt-auto pt-4">
          <button
            type="submit"
            className="w-full h-14 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-[0.98] transition-all">
            Create Challenge
          </button>
        </div>
      </form>
    </div>
  );
}
