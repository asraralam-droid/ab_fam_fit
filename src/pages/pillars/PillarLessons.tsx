import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { RootState } from '../../store';
import {
  adminProgramsSlice,
  normalizeAdminProgram
} from '../../store/adminProgramsSlice';
import { resolveProgramPillarId } from '../../utils/brandHierarchy';
import {
  computeProgress,
  programCoverImage,
  programSummaryLabel
} from '../../utils/programDisplay';
import type { PillarOutletContext } from './pillarOutletContext';

export function PillarLessons() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pillarId, pillarLabel } = useOutletContext<PillarOutletContext>();
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

  const programs = useMemo(
    () =>
      rawPrograms
        .map((p) =>
          normalizeAdminProgram(p as unknown as Record<string, unknown>)
        )
        .filter(
          (p) => p.active && resolveProgramPillarId(p) === pillarId
        ),
    [rawPrograms, pillarId]
  );

  const enrolled = programs.filter((p) => enrolledIds.includes(p.id));
  const available = programs.filter((p) => !enrolledIds.includes(p.id));

  return (
    <div className="px-4 pt-6 pb-24 flex flex-col gap-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
          {pillarLabel}
        </p>
        <h2 className="text-lg font-bold text-text">Lessons</h2>
        <p className="text-sm text-text-muted mt-1">
          Programs and lessons for this pillar.
        </p>
      </div>

      {programs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
          <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-bold text-text">No lessons yet</p>
          <p className="text-sm text-text-muted mt-2 leading-relaxed">
            {pillarLabel} doesn&apos;t have program lessons in the app yet.
            Check back as this pillar grows — or continue with Daily Check In
            and Podcasts.
          </p>
        </div>
      ) : (
        <>
          {enrolled.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Continue learning
              </h3>
              {enrolled.map((p) => {
                const progress = computeProgress(p, completedItemKeys, {
                  enrolled: true,
                  enrolledAt: enrolledAtMap[p.id]
                });
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => navigate(`/programs/${p.id}`)}
                    className="w-full flex gap-3 p-3 rounded-2xl border border-border bg-surface text-left hover:border-primary/40 transition-colors">
                    <img
                      src={programCoverImage(p)}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-text truncate">
                        {p.title}
                      </span>
                      <span className="block text-xs text-text-muted mt-0.5">
                        {programSummaryLabel(p)} · {progress.percent}% complete
                      </span>
                      <span className="mt-2 block h-1.5 rounded-full bg-surface-2 overflow-hidden">
                        <span
                          className="block h-full bg-primary rounded-full"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-text-muted self-center flex-shrink-0" />
                  </button>
                );
              })}
            </section>
          )}

          {available.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Available in this pillar
              </h3>
              {available.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => navigate(`/programs/${p.id}`)}
                  className="w-full flex gap-3 p-3 rounded-2xl border border-border bg-surface text-left hover:border-primary/40 transition-colors">
                  <img
                    src={programCoverImage(p)}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-text truncate">
                      {p.title}
                    </span>
                    <span className="block text-xs text-text-muted mt-0.5">
                      {programSummaryLabel(p)}
                    </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-text-muted self-center flex-shrink-0" />
                </button>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
