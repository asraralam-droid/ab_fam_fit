import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ClipboardList, Target } from 'lucide-react';
import { RootState } from '../../store';
import {
  adminProgramsSlice,
  normalizeAdminProgram
} from '../../store/adminProgramsSlice';
import { resolveProgramPillarId } from '../../utils/brandHierarchy';
import { computeProgress } from '../../utils/programDisplay';
import { getCheckInFeelingLabel } from '../../utils/checkInFeelings';
import type { PillarOutletContext } from './pillarOutletContext';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function PillarProgress() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pillarId, pillarLabel } = useOutletContext<PillarOutletContext>();
  const { dailyCheckInDate, dailyCheckInFeeling } = useSelector(
    (s: RootState) => s.home
  );
  const { programs: rawPrograms } = useSelector(
    (s: RootState) => s.adminPrograms
  );
  const { enrolledIds: rawEnrolled, enrolledAt: rawEnrolledAt, completedItemKeys: rawCompleted } =
    useSelector((s: RootState) => s.programs);
  const enrolledIds = Array.isArray(rawEnrolled) ? rawEnrolled : [];
  const enrolledAtMap =
    rawEnrolledAt && typeof rawEnrolledAt === 'object'
      ? (rawEnrolledAt as Record<string, number>)
      : {};
  const completedItemKeys = Array.isArray(rawCompleted) ? rawCompleted : [];

  useEffect(() => {
    dispatch(adminProgramsSlice.actions.migratePrograms());
  }, [dispatch]);

  const doneToday = dailyCheckInDate === todayKey();
  const feelingLabel =
    dailyCheckInFeeling != null
      ? getCheckInFeelingLabel(dailyCheckInFeeling)
      : null;

  const programRows = useMemo(() => {
    return rawPrograms
      .map((p) =>
        normalizeAdminProgram(p as unknown as Record<string, unknown>)
      )
      .filter(
        (p) =>
          p.active &&
          resolveProgramPillarId(p) === pillarId &&
          enrolledIds.includes(p.id)
      )
      .map((p) => ({
        program: p,
        progress: computeProgress(p, completedItemKeys, {
          enrolled: true,
          enrolledAt: enrolledAtMap[p.id]
        })
      }));
  }, [
    rawPrograms,
    pillarId,
    enrolledIds,
    completedItemKeys,
    enrolledAtMap
  ]);

  return (
    <div className="px-4 pt-6 pb-24 flex flex-col gap-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
          {pillarLabel}
        </p>
        <h2 className="text-lg font-bold text-text">Progress Tracker</h2>
        <p className="text-sm text-text-muted mt-1">
          Check-in status and program progress for this pillar.
        </p>
      </div>

      <section
        className={`rounded-2xl border p-4 ${
          doneToday
            ? 'border-primary/30 bg-primary/5'
            : 'border-border bg-surface'
        }`}>
        <div className="flex items-start gap-3">
          {doneToday ? (
            <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          ) : (
            <ClipboardList className="w-6 h-6 text-text-muted flex-shrink-0 mt-0.5" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-text">Daily check-in</p>
            <p className="text-sm text-text-muted mt-1">
              {doneToday
                ? `Done today · Feeling: ${feelingLabel ?? 'Saved'}${
                    dailyCheckInFeeling != null
                      ? ` (${dailyCheckInFeeling}/5)`
                      : ''
                  }`
                : 'Not checked in yet today'}
            </p>
            <button
              type="button"
              onClick={() => navigate(`/pillars/${pillarId}/check-in`)}
              className="mt-3 text-xs font-bold text-primary">
              {doneToday ? 'View check-in' : 'Go to check-in'}
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Program progress
        </h3>

        {programRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-5 text-center">
            <Target className="w-7 h-7 text-text-muted mx-auto mb-2" />
            <p className="text-sm font-bold text-text">No enrolled programs</p>
            <p className="text-sm text-text-muted mt-1">
              Enroll in a {pillarLabel} program to track lesson progress here.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/pillars/${pillarId}/lessons`)}
              className="mt-3 text-xs font-bold text-primary">
              View lessons
            </button>
          </div>
        ) : (
          programRows.map(({ program, progress }) => (
            <button
              key={program.id}
              type="button"
              onClick={() => navigate(`/programs/${program.id}`)}
              className="w-full rounded-2xl border border-border bg-surface p-3.5 text-left hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-text truncate">
                  {program.title}
                </p>
                <span className="text-xs font-bold text-primary flex-shrink-0">
                  {progress.percent}%
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                Open program
                <ChevronRight className="w-3.5 h-3.5" />
              </p>
            </button>
          ))
        )}
      </section>
    </div>
  );
}
