import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { BookOpen, Headphones } from 'lucide-react';
import { RootState } from '../../store';
import {
  adminProgramsSlice,
  flattenProgramSections,
  normalizeAdminProgram,
  type BookLessonModule
} from '../../store/adminProgramsSlice';
import { resolveProgramPillarId } from '../../utils/brandHierarchy';
import { programCoverImage } from '../../utils/programDisplay';
import type { PillarOutletContext } from './pillarOutletContext';

type BookRow = {
  key: string;
  programId: string;
  programTitle: string;
  sectionId: string;
  coverUrl: string;
  book: BookLessonModule;
};

export function PillarBooks() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pillarId, pillarLabel } = useOutletContext<PillarOutletContext>();
  const { programs: rawPrograms } = useSelector(
    (s: RootState) => s.adminPrograms
  );

  useEffect(() => {
    dispatch(adminProgramsSlice.actions.migratePrograms());
  }, [dispatch]);

  const books = useMemo(() => {
    const rows: BookRow[] = [];
    const programs = rawPrograms
      .map((p) =>
        normalizeAdminProgram(p as unknown as Record<string, unknown>)
      )
      .filter((p) => p.active && resolveProgramPillarId(p) === pillarId);

    for (const program of programs) {
      for (const section of flattenProgramSections(program)) {
        const list = [...(section.bookLessons ?? [])].sort(
          (a, b) => a.order - b.order
        );
        for (const book of list) {
          rows.push({
            key: `${program.id}-${section.id}-${book.id}`,
            programId: program.id,
            programTitle: program.title,
            sectionId: section.id,
            coverUrl: book.coverImageUrl || programCoverImage(program),
            book
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
        <h2 className="text-lg font-bold text-text">Books</h2>
        <p className="text-sm text-text-muted mt-1">
          Program books for this pillar — read or listen.
        </p>
      </div>

      {books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
          <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-bold text-text">No books yet</p>
          <p className="text-sm text-text-muted mt-2 leading-relaxed">
            {pillarLabel} doesn&apos;t have program books yet.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {books.map((row) => (
              <li
                key={row.key}
                className="rounded-2xl border border-border bg-surface overflow-hidden">
                <div className="flex gap-3 p-3">
                  <img
                    src={row.coverUrl}
                    alt=""
                    className="w-14 h-20 rounded-lg object-cover flex-shrink-0 bg-surface-2"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-text truncate">
                      {row.book.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 truncate">
                      {row.programTitle}
                    </p>
                    {row.book.description && (
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">
                        {row.book.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/learn/book/${row.book.id}/read`)
                        }
                        className="flex-1 h-9 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Read
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/learn/book/${row.book.id}/listen`)
                        }
                        className="flex-1 h-9 rounded-xl border border-border bg-surface-2 text-text text-xs font-bold flex items-center justify-center gap-1.5">
                        <Headphones className="w-3.5 h-3.5" />
                        Listen
                      </button>
                    </div>
                  </div>
                </div>
              </li>
          ))}
        </ul>
      )}
    </div>
  );
}
