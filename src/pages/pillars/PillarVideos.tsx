import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ChevronRight, Video } from 'lucide-react';
import { RootState } from '../../store';
import {
  adminProgramsSlice,
  flattenProgramSections,
  normalizeAdminProgram,
  type VideoLessonModule
} from '../../store/adminProgramsSlice';
import { resolveProgramPillarId } from '../../utils/brandHierarchy';
import { programCoverImage } from '../../utils/programDisplay';
import type { PillarOutletContext } from './pillarOutletContext';

type VideoRow = {
  key: string;
  programId: string;
  programTitle: string;
  sectionId: string;
  sectionTitle: string;
  module: VideoLessonModule;
  coverUrl?: string;
};

export function PillarVideos() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pillarId, pillarLabel } = useOutletContext<PillarOutletContext>();
  const { programs: rawPrograms } = useSelector(
    (s: RootState) => s.adminPrograms
  );

  useEffect(() => {
    dispatch(adminProgramsSlice.actions.migratePrograms());
  }, [dispatch]);

  const videos = useMemo(() => {
    const rows: VideoRow[] = [];
    const programs = rawPrograms
      .map((p) =>
        normalizeAdminProgram(p as unknown as Record<string, unknown>)
      )
      .filter((p) => p.active && resolveProgramPillarId(p) === pillarId);

    for (const program of programs) {
      for (const section of flattenProgramSections(program)) {
        const lessons = [...(section.videoLessons ?? [])].sort(
          (a, b) => a.order - b.order
        );
        for (const mod of lessons) {
          rows.push({
            key: `${program.id}-${section.id}-${mod.id}`,
            programId: program.id,
            programTitle: program.title,
            sectionId: section.id,
            sectionTitle: section.title,
            module: mod,
            coverUrl: mod.imageUrl || programCoverImage(program)
          });
        }
      }
    }
    return rows;
  }, [rawPrograms, pillarId]);

  return (
    <div className="px-4 pt-6 pb-24 flex flex-col gap-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
          {pillarLabel}
        </p>
        <h2 className="text-lg font-bold text-text">Videos</h2>
        <p className="text-sm text-text-muted mt-1">
          Program video lessons for this pillar.
        </p>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
          <Video className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-bold text-text">No videos yet</p>
          <p className="text-sm text-text-muted mt-2 leading-relaxed">
            {pillarLabel} doesn&apos;t have program video lessons yet. When
            they&apos;re added in Programs, they&apos;ll show up here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {videos.map((row) => (
            <li key={row.key}>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/programs/${row.programId}/section/${row.sectionId}`
                  )
                }
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border bg-surface text-left hover:border-primary/40 transition-colors">
                <span className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-2 flex-shrink-0">
                  {row.coverUrl ? (
                    <img
                      src={row.coverUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-text-muted">
                      <Video className="w-6 h-6" />
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-text truncate">
                    {row.module.title}
                  </span>
                  <span className="block text-xs text-text-muted mt-0.5 truncate">
                    {row.programTitle} · {row.sectionTitle}
                  </span>
                  {(row.module.videos?.length ?? 0) > 0 && (
                    <span className="block text-[11px] text-text-muted mt-1">
                      {row.module.videos.length} video
                      {row.module.videos.length === 1 ? '' : 's'}
                    </span>
                  )}
                </span>
                <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
