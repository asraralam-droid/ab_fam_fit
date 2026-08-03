import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { normalizeAdminProgram, adminProgramsSlice } from '../../store/adminProgramsSlice';
import {
  programCoverImage,
  programSummaryLabel,
  computeProgress
} from '../../utils/programDisplay';
import { ArrowLeft, ChevronRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export function Programs() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { programs: rawPrograms } = useSelector(
    (state: RootState) => state.adminPrograms
  );
  const { enrolledIds: rawEnrolled, enrolledAt: rawEnrolledAt, completedItemKeys: rawCompleted } =
    useSelector((state: RootState) => state.programs);
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
        .map((p) => normalizeAdminProgram(p as unknown as Record<string, unknown>))
        .filter((p) => p.active),
    [rawPrograms]
  );

  const enrolled = programs.filter((p) => enrolledIds.includes(p.id));
  const available = programs.filter((p) => !enrolledIds.includes(p.id));

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-surface">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-text">Programs</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 pt-5 flex flex-col gap-6">
        {enrolled.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
              My Programs
            </h2>
            <div className="flex flex-col gap-3">
              {enrolled.map((p) => {
                const progress = computeProgress(p, completedItemKeys, {
                  enrolled: true,
                  enrolledAt: enrolledAtMap[p.id]
                });
                return (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => navigate(`/programs/${p.id}`)}
                    className="bg-surface border border-border rounded-2xl overflow-hidden text-left shadow-sm hover:shadow-md transition-all">
                    <div className="flex gap-3 p-3">
                      <img
                        src={programCoverImage(p)}
                        alt={p.title}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        {p.subtitle && (
                          <span className="text-[9px] uppercase tracking-wider font-bold text-text-muted block mb-0.5 truncate">
                            {p.subtitle}
                          </span>
                        )}
                        <h3 className="font-bold text-text text-sm mb-1 line-clamp-2">
                          {p.title}
                        </h3>
                        <p className="text-[10px] text-text-muted mb-2">
                          {programSummaryLabel(p)}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-text-muted">
                            {progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
            {enrolled.length > 0 ? 'More Programs' : 'Available Programs'}
          </h2>
          {available.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted bg-surface border border-dashed border-border rounded-2xl">
              {programs.length === 0
                ? 'No programs published yet.'
                : "You're enrolled in all available programs."}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {available.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/programs/${p.id}`)}
                  className="bg-surface border border-border rounded-2xl overflow-hidden text-left shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-[16/7] relative">
                    <img
                      src={programCoverImage(p)}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-white bg-black/40 backdrop-blur px-2 py-1 rounded inline-flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Program
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    {p.subtitle && (
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                        {p.subtitle}
                      </p>
                    )}
                    <h3 className="font-bold text-text text-sm mb-1">{p.title}</h3>
                    <p className="text-xs text-text-muted leading-snug line-clamp-2">
                      {p.description || programSummaryLabel(p)}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-3 text-primary font-bold text-xs">
                      View program <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
