import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { RootState } from '../../store';
import { membershipSlice } from '../../store/membershipSlice';

export function WorkWithMisty() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { coachingRequest } = useSelector(
    (state: RootState) => state.membership
  );

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [goals, setGoals] = useState('');
  const [preferredPath, setPreferredPath] = useState<
    'work-with-misty' | 'join-challenge' | ''
  >('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !goals.trim() || !preferredPath) {
      toast.error('Please complete all fields');
      return;
    }
    dispatch(
      membershipSlice.actions.submitCoachingRequest({
        name: name.trim(),
        email: email.trim(),
        goals: goals.trim(),
        preferredPath
      })
    );
    toast.success('Request submitted — Misty’s team will follow up');
    navigate(-1);
  };

  if (coachingRequest.submitted) {
    return (
      <div className="flex flex-col h-full bg-surface">
        <div className="h-16 px-4 flex items-center border-b border-border">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold pr-10">
            Work with Misty
          </h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-accent-sage/20 text-accent-sage flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Request received</h2>
          <p className="text-text-muted text-sm mb-6">
            Submitted {coachingRequest.submittedAt ?
              new Date(coachingRequest.submittedAt).toLocaleDateString() :
              'recently'}
            . We&apos;ll reach out about{' '}
            {coachingRequest.preferredPath === 'join-challenge' ?
              'joining a paid challenge' :
              'working 1:1 with Misty'}
            .
          </p>
          <button
            type="button"
            onClick={() => navigate('/challenges')}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold">
            Browse challenges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface overflow-y-auto">
      <div className="h-16 px-4 flex items-center border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold pr-10">
          Work with Misty
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5 pb-10">
        <div>
          <h2 className="text-xl font-bold mb-1">Upgrade your access</h2>
          <p className="text-sm text-text-muted">
            Books unlock reading and self-guided tools. For step-by-step
            lessons, personalized guidance, or coaching, request to work with
            Misty or join a paid challenge.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-text">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-text">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-text">
            What do you want help with?
          </label>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={4}
            placeholder="Meals/juicing plans, lessons, accountability…"
            className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none resize-none text-sm"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-text">Preferred path</label>
          <button
            type="button"
            onClick={() => setPreferredPath('work-with-misty')}
            className={`p-4 rounded-xl border text-left ${preferredPath === 'work-with-misty' ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <p className="font-bold text-sm text-text">Work with Misty</p>
            <p className="text-xs text-text-muted mt-1">
              Personalized coaching and guidance
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPreferredPath('join-challenge')}
            className={`p-4 rounded-xl border text-left ${preferredPath === 'join-challenge' ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <p className="font-bold text-sm text-text">Join a paid challenge</p>
            <p className="text-xs text-text-muted mt-1">
              Including exclusive cohorts (capped at 10)
            </p>
          </button>
        </div>

        <button
          type="submit"
          className="w-full h-14 mt-2 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30">
          Submit request
        </button>
      </form>
    </div>
  );
}
