import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { RootState } from '../../store';
import {
  ArrowLeft,
  Trophy,
  Users,
  User,
  Plus,
  ChevronRight,
  Flame } from
'lucide-react';
import { motion } from 'framer-motion';
import { canCreateChallenge } from '../../utils/membershipAccess';
import type { PillarOutletContext } from '../pillars/pillarOutletContext';
import { pillarById, type AbPillarId } from '../../utils/abPillars';

export function Challenges() {
  const navigate = useNavigate();
  const params = useParams<{ pillarId?: string }>();
  const outlet = useOutletContext<PillarOutletContext | undefined>();
  const pillarId = outlet?.pillarId || params.pillarId;
  const pillar = pillarId
    ? pillarById(pillarId as AbPillarId)
    : undefined;
  const inPillarShell = !!outlet?.pillarId;
  const { challenges } = useSelector((state: RootState) => state.challenges);
  const { user } = useSelector((state: RootState) => state.auth);
  const { completedMistyChallenge, workedWithMisty } = useSelector(
    (state: RootState) => state.membership
  );
  const canCreate = canCreateChallenge(
    completedMistyChallenge,
    workedWithMisty,
    user?.role
  );
  const scoped = useMemo(() => {
    if (!pillarId) return challenges;
    return challenges.filter((c) => c.pillarId === pillarId);
  }, [challenges, pillarId]);
  const joined = scoped.filter((c) => c.joined);
  const available = scoped.filter((c) => !c.joined);
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-surface">
      {!inPillarShell && (
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-text">Challenges</h1>
        {canCreate ?
        <button
          onClick={() => navigate('/challenges/new')}
          className="p-2 -mr-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
          
          <Plus className="w-5 h-5" />
        </button> :

        <div className="w-10" />
        }
      </div>
      )}

      <div className="px-4 pt-5 flex flex-col gap-6">
        {pillar && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
              {pillar.label} challenges
            </p>
            <p className="text-sm text-text-muted">
              Challenges scoped to this pillar. Browse the global list anytime.
            </p>
          </div>
        )}
        <section>
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
            My Challenges ({joined.length})
          </h2>
          {joined.length === 0 ?
          <div className="p-6 rounded-2xl bg-surface-2 border border-dashed border-border text-center text-sm text-text-muted">
              You haven't joined any challenges yet.
            </div> :

          <div className="flex flex-col gap-3">
              {joined.map((c) =>
            <motion.button
              key={c.id}
              initial={{
                opacity: 0,
                y: 6
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              onClick={() => navigate(`/challenges/${c.id}`)}
              className="bg-primary text-white rounded-2xl p-4 text-left shadow-md shadow-primary/20 relative overflow-hidden">
              
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base mb-1">{c.title}</h3>
                      <p className="text-xs text-white/80">
                        {c.startDate} – {c.endDate}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-white/20 px-2 py-1 rounded">
                      {c.type === 'team' ?
                  <Users className="w-3 h-3 inline mr-1" /> :

                  <User className="w-3 h-3 inline mr-1" />
                  }
                      {c.type}
                    </span>
                  </div>
                  <div className="relative flex items-end justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider opacity-70 font-bold">
                          Rank
                        </p>
                        <p className="text-xl font-bold">#{c.rank}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider opacity-70 font-bold">
                          {c.completed ? 'Status' : 'Days left'}
                        </p>
                        <p className="text-xl font-bold">
                          {c.completed ? 'Done' : c.daysLeft}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-70" />
                  </div>
                </motion.button>
            )}
            </div>
          }
        </section>

        <section>
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
            Available ({available.length})
          </h2>
          <div className="flex flex-col gap-3">
            {available.map((c) =>
            <button
              key={c.id}
              onClick={() => navigate(`/challenges/${c.id}`)}
              className="bg-surface border border-border rounded-2xl p-4 text-left shadow-sm hover:border-primary/30 transition-all">
              
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-surface-2 text-text-muted px-2 py-1 rounded">
                    {c.type}
                  </span>
                </div>
                <h3 className="font-bold text-text text-sm mb-1">{c.title}</h3>
                <p className="text-xs text-text-muted leading-snug mb-3">
                  {c.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted font-medium flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    {c.isExclusive
                      ? `${c.participants}/${c.maxParticipants ?? 10} seats`
                      : `${c.participants} joined`}
                  </span>
                  <span className="text-primary font-bold">
                    {c.isExclusive && c.price
                      ? `$${c.price.toLocaleString()}`
                      : `${c.durationDays} days`}
                  </span>
                </div>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>);

}