import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../store';
import { programsSlice } from '../../store/programsSlice';
import {
  normalizeAdminProgram,
  adminProgramsSlice,
  findProgramSection,
  findProgramModuleForSection,
  sortedProgramModules
} from '../../store/adminProgramsSlice';
import {
  computeProgress,
  formatSectionUnlockLabel,
  formatUnlockDate,
  formatSectionDaysLeft,
  formatSectionLockProgressDetail,
  getSectionLockStatus,
  formatSectionLockDaysBadge,
  resolveSectionLockDays,
  programSectionsForLocks,
  programCoverImage,
  sectionCoverImage,
  itemKey,
  legacyItemKey
} from '../../utils/programDisplay';
import {
  buildSectionLessonRows,
  moduleDisplayTitle,
  sectionCurriculumHeading,
  type ProgramLessonTab,
  type CurriculumRow
} from './curriculum';
import {
  ArrowLeft,
  Play,
  Headphones,
  FileText,
  BookOpen,
  CheckCircle2,
  Circle,
  Lock,
  ChevronDown,
  ChevronUp,
  Video,
  ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = ProgramLessonTab;

const TABS: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'audio', label: 'Audio', icon: Headphones },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'text', label: 'Text', icon: FileText }
];

function sortedByOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

function isComplete(completedKeys: string[], key: string, legacyKey: string) {
  return completedKeys.includes(key) || completedKeys.includes(legacyKey);
}

export function ProgramDetail() {
  const { id, sectionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const rawProgram = useSelector((state: RootState) =>
    state.adminPrograms.programs.find((p) => p.id === id)
  );
  const {
    enrolledIds: rawEnrolled,
    enrolledAt: rawEnrolledAt,
    completedItemKeys: rawCompleted
  } = useSelector((state: RootState) => state.programs);
  const enrolledIds = Array.isArray(rawEnrolled) ? rawEnrolled : [];
  const enrolledAtMap =
    rawEnrolledAt && typeof rawEnrolledAt === 'object'
      ? (rawEnrolledAt as Record<string, number>)
      : {};
  const completedItemKeys = Array.isArray(rawCompleted) ? rawCompleted : [];

  useEffect(() => {
    dispatch(adminProgramsSlice.actions.migratePrograms());
  }, [dispatch]);

  const program = useMemo(
    () =>
      rawProgram
        ? normalizeAdminProgram(rawProgram as unknown as Record<string, unknown>)
        : null,
    [rawProgram]
  );

  const section = useMemo(
    () => (program ? findProgramSection(program, sectionId ?? '') : null),
    [program, sectionId]
  );

  const lockSections = useMemo(
    () => (program ? programSectionsForLocks(program) : []),
    [program]
  );

  const sortedModules = useMemo(
    () => (program ? sortedProgramModules(program) : []),
    [program]
  );

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  const enrolled = program ? enrolledIds.includes(program.id) : false;
  const enrolledAt = program ? enrolledAtMap[program.id] : undefined;
  const progress = program
    ? computeProgress(program, completedItemKeys, {
        enrolled,
        enrolledAt
      })
    : 0;

  const sectionModule = useMemo(
    () =>
      program && section ? findProgramModuleForSection(program, section.id) : null,
    [program, section]
  );

  const sectionLock =
    program && section
      ? getSectionLockStatus(lockSections, section.id, {
          enrolled,
          enrolledAt,
          now
        })
      : null;

  const defaultTab = useMemo((): Tab => {
    if (!section) return 'books';
    if (section.bookLessons.length) return 'books';
    if (section.videoLessons.length) return 'video';
    if (section.audioLessons.length) return 'audio';
    if (section.imageLessons.length) return 'images';
    return 'text';
  }, [section]);

  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (sectionId) return;
    if (sortedModules.length === 0) return;
    setExpandedModules((prev) => {
      if (prev.size > 0) return prev;
      return new Set([sortedModules[0].id]);
    });
    setExpandedSections((prev) => {
      if (prev.size > 0) return prev;
      const ids = sortedModules.flatMap((m) =>
        sortedByOrder(m.sections ?? []).map((s) => s.id)
      );
      return new Set(ids);
    });
  }, [sectionId, sortedModules]);

  useEffect(() => {
    const tab = (location.state as { tab?: Tab } | null)?.tab;
    if (tab && TABS.some((t) => t.id === tab)) {
      setActiveTab(tab);
      return;
    }
    setActiveTab(defaultTab);
  }, [defaultTab, sectionId, location.state]);

  if (!program || !program.active) {
    return (
      <div className="flex h-full items-center justify-center bg-surface">
        <button
          onClick={() => navigate(-1)}
          className="text-primary font-bold text-sm">
          Go back
        </button>
      </div>
    );
  }

  const handleEnroll = () => {
    dispatch(programsSlice.actions.enrollInProgram(program.id));
    toast.success(`Started ${program.title}`);
  };

  const handleLessonOpen = (secId: string, tab: Tab) => {
    if (!program) return;
    const lock = getSectionLockStatus(lockSections, secId, {
      enrolled,
      enrolledAt,
      now
    });
    if (!lock.unlocked) {
      const sec = findProgramSection(program, secId);
      const msg = formatSectionDaysLeft(lock, enrolled, lockSections, sec);
      if (!enrolled) {
        toast.error(msg ?? 'Start the program to access sections');
        return;
      }
      toast.error(msg ?? formatSectionUnlockLabel(lock, true));
      return;
    }
    navigate(`/programs/${program.id}/section/${secId}`, { state: { tab } });
  };

  const toggleModuleExpanded = (modId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(modId)) next.delete(modId);
      else next.add(modId);
      return next;
    });
  };

  const toggleSectionExpanded = (secId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(secId)) next.delete(secId);
      else next.add(secId);
      return next;
    });
  };

  const renderCurriculumLessonRow = (
    secId: string,
    row: CurriculumRow,
    isLast: boolean,
    locked = false
  ) => {
    const done =
      !locked &&
      enrolled &&
      isComplete(completedItemKeys, row.completeKey, row.legacyKey);
    const KindIcon = row.KindIcon;
    const metaDisplay = row.meta.replace(/ · /g, ' · ');
    return (
      <button
        key={row.id}
        type="button"
        onClick={() => handleLessonOpen(secId, row.tab)}
        aria-disabled={locked}
        className={`w-full px-4 py-3.5 flex items-center gap-3 transition-colors text-left ${
          locked
            ? 'opacity-55 cursor-not-allowed'
            : 'hover:bg-surface-2'
        } ${!isLast ? 'border-b border-border/70' : ''}`}>
        {locked ? (
          <Lock className="w-5 h-5 text-text-muted flex-shrink-0" />
        ) : done ? (
          <CheckCircle2 className="w-6 h-6 text-accent-sage flex-shrink-0" />
        ) : (
          <Circle className="w-6 h-6 text-text-muted/45 flex-shrink-0" strokeWidth={1.5} />
        )}
        <KindIcon className="w-5 h-5 text-text-muted flex-shrink-0" />
        <div className="flex-1 min-w-0 text-left">
          <p className={`font-medium text-sm ${done || locked ? 'text-text-muted' : 'text-text'}`}>
            {row.title}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5 tracking-wide">{metaDisplay}</p>
        </div>
      </button>
    );
  };

  const toggleComplete = (key: string, legacyKey: string, label: string) => {
    if (!enrolled) {
      toast.error('Start the program to access this content');
      return;
    }
    if (sectionLock && !sectionLock.unlocked) {
      toast.error(
        formatSectionDaysLeft(sectionLock, true, lockSections, section ?? undefined) ?? 'This section is still locked'
      );
      return;
    }
    const wasDone = isComplete(completedItemKeys, key, legacyKey);
    if (wasDone) {
      if (completedItemKeys.includes(key)) {
        dispatch(programsSlice.actions.toggleItemComplete(key));
      }
      if (completedItemKeys.includes(legacyKey)) {
        dispatch(programsSlice.actions.toggleItemComplete(legacyKey));
      }
    } else {
      dispatch(programsSlice.actions.toggleItemComplete(key));
    }
    toast.success(wasDone ? `Marked incomplete: ${label}` : `Completed: ${label}`);
  };

  const renderStatus = (key: string, legacyKey: string) => {
    if (!enrolled || (sectionLock && !sectionLock.unlocked)) {
      return <Lock className="w-5 h-5 text-text-muted flex-shrink-0" />;
    }
    return isComplete(completedItemKeys, key, legacyKey) ? (
      <CheckCircle2 className="w-5 h-5 text-accent-sage flex-shrink-0" />
    ) : (
      <Circle className="w-5 h-5 text-text-muted flex-shrink-0" />
    );
  };

  // Program overview — sections list
  if (!sectionId || !section) {
    return (
      <div className="flex flex-col h-full overflow-y-auto pb-32 bg-background">
        <div className="relative h-56 w-full">
          <img
            src={programCoverImage(program)}
            alt={program.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/35" />
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur text-white flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
            {enrolled && (
              <span className="text-[10px] uppercase tracking-wider font-bold bg-accent-sage text-white px-2.5 py-1 rounded-md shadow-sm">
                Enrolled
              </span>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-5">
            {program.subtitle && (
              <span className="inline-block text-[10px] uppercase tracking-wider font-bold text-white/95 bg-white/15 backdrop-blur px-2 py-0.5 rounded mb-2">
                {program.subtitle}
              </span>
            )}
            <h1 className="text-2xl font-bold text-white leading-snug">{program.title}</h1>
          </div>
        </div>

        <div className="px-4 pt-5">
          {program.description && (
            <p className="text-sm text-text-muted leading-relaxed mb-5">
              {program.description}
            </p>
          )}

          {enrolled && (
            <div className="bg-surface rounded-2xl p-4 border border-border mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Your progress
                </span>
                <span className="text-sm font-bold text-primary tabular-nums">{progress}%</span>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">
            Curriculum
          </h2>

          {sortedModules.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted bg-surface border border-dashed border-border rounded-2xl">
              No modules published yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {sortedModules.map((mod) => {
                const modExpanded = expandedModules.has(mod.id);
                const modSections = sortedByOrder(mod.sections ?? []);
                return (
                  <div
                    key={mod.id}
                    className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleModuleExpanded(mod.id)}
                      className="w-full p-4 flex items-center justify-between gap-3 hover:bg-surface-2 transition-colors text-left">
                      <h3 className="font-bold text-text text-base leading-snug flex-1">
                        {moduleDisplayTitle(mod)}
                      </h3>
                      {modExpanded ? (
                        <ChevronUp className="w-5 h-5 text-text-muted shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-muted shrink-0" />
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {modExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border overflow-hidden">
                          {modSections.length === 0 ? (
                            <p className="px-4 py-5 text-sm text-text-muted text-center">
                              No sections in this module yet.
                            </p>
                          ) : (
                            modSections.map((sec, secIdx) => {
                              const lock = getSectionLockStatus(lockSections, sec.id, {
                                enrolled,
                                enrolledAt,
                                now
                              });
                              const locked = !lock.unlocked;
                              const secExpanded = expandedSections.has(sec.id);
                              const daysLeftLine = formatSectionDaysLeft(
                                lock,
                                enrolled,
                                lockSections,
                                sec
                              );
                              const lockDetail =
                                enrolled && locked
                                  ? formatSectionLockProgressDetail(lock, lockSections, sec)
                                  : null;
                              const rows = buildSectionLessonRows(program.id, sec);

                              return (
                                <div
                                  key={sec.id}
                                  className={secIdx > 0 ? 'border-t border-border' : ''}>
                                  <button
                                    type="button"
                                    onClick={() => toggleSectionExpanded(sec.id)}
                                    className="w-full px-4 pt-4 pb-2 flex items-start justify-between gap-3 hover:bg-surface-2/60 transition-colors text-left">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                        {sectionCurriculumHeading(sec)}
                                      </p>
                                      {locked && (
                                        <div className="mt-2 space-y-1">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-2 text-text-muted border border-border">
                                              {formatSectionUnlockLabel(lock, enrolled)}
                                            </span>
                                            {resolveSectionLockDays(lockSections, sec) > 0 && (
                                              <span className="text-[10px] text-text-muted">
                                                {formatSectionLockDaysBadge(lockSections, sec)}{' '}
                                                lock
                                              </span>
                                            )}
                                          </div>
                                          {daysLeftLine && (
                                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                              {daysLeftLine}
                                            </p>
                                          )}
                                          {lockDetail && (
                                            <p className="text-[10px] text-text-muted">
                                              {lockDetail}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {secExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                                    )}
                                  </button>

                                  <AnimatePresence initial={false}>
                                    {secExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden">
                                        {rows.length === 0 ? (
                                          <p className="px-4 pb-4 text-sm text-text-muted">
                                            {locked
                                              ? lock.unlocksAt && enrolled
                                                ? `No content yet · Opens ${formatUnlockDate(lock.unlocksAt)}`
                                                : daysLeftLine ??
                                                  'Complete previous sections to unlock'
                                              : 'No lessons in this section yet.'}
                                          </p>
                                        ) : (
                                          <div className="pb-1">
                                            {rows.map((row, rowIdx) =>
                                              renderCurriculumLessonRow(
                                                sec.id,
                                                row,
                                                rowIdx === rows.length - 1,
                                                locked
                                              )
                                            )}
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!enrolled && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/95 backdrop-blur border-t border-border z-30 max-w-[420px] mx-auto pb-safe">
            <button
              onClick={handleEnroll}
              className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98]">
              Start Program
            </button>
            <p className="text-[10px] text-center text-text-muted mt-2">
              Your first section unlocks based on program settings when you start.
            </p>
          </div>
        )}
      </div>
    );
  }

  const tabCount = (tab: Tab) => {
    if (tab === 'books') return section.bookLessons.length;
    if (tab === 'video') return section.videoLessons.length;
    if (tab === 'audio') return section.audioLessons.length;
    if (tab === 'images') return section.imageLessons.length;
    return section.textLessons.length;
  };

  if (sectionLock && !sectionLock.unlocked) {
    return (
      <div className="flex flex-col h-full overflow-y-auto pb-32 bg-surface">
        <div className="relative h-48 w-full">
          <img
            src={sectionCoverImage(section, program.id)}
            alt={section.title}
            className="w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute top-0 left-0 right-0 p-4">
            <button
              onClick={() => navigate(`/programs/${program.id}`)}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur text-white flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
            <Lock className="w-10 h-10 mb-3" />
            <p className="text-lg font-bold">Section locked</p>
            <p className="text-sm text-white/80 mt-1">
              {formatSectionDaysLeft(sectionLock, enrolled, lockSections, section) ??
                (!enrolled
                  ? 'Start the program to access this section.'
                  : 'This section is not available yet.')}
            </p>
            {enrolled && (
              <p className="text-xs text-white/60 mt-2 max-w-xs">
                {formatSectionLockProgressDetail(sectionLock, lockSections, section)}
              </p>
            )}
            {enrolled && sectionLock.unlocksAt && (
              <p className="text-xs text-white/70 mt-2">
                Opens on {formatUnlockDate(sectionLock.unlocksAt)}
              </p>
            )}
            {enrolled &&
              sectionLock.daysRemaining !== undefined &&
              sectionLock.daysRemaining > 0 && (
                <p className="text-2xl font-extrabold mt-4 tabular-nums">
                  {sectionLock.daysRemaining}
                  <span className="text-sm font-bold ml-1">
                    day{sectionLock.daysRemaining === 1 ? '' : 's'} left
                  </span>
                </p>
              )}
          </div>
        </div>
        {!enrolled && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/95 backdrop-blur border-t border-border z-30 max-w-[420px] mx-auto pb-safe">
            <button
              onClick={handleEnroll}
              className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98]">
              Start Program
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-32 bg-surface">
      <div className="relative h-48 w-full">
        <img
          src={sectionCoverImage(section, program.id)}
          alt={section.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="absolute top-0 left-0 right-0 p-4">
          <button
            onClick={() => navigate(`/programs/${program.id}`)}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur text-white flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-white/70 mb-0.5">
            {sectionModule ? moduleDisplayTitle(sectionModule) : program.title}
          </p>
          <h1 className="text-xl font-bold text-white leading-snug">
            {sectionCurriculumHeading(section)}
          </h1>
        </div>
      </div>

      <div className="p-5">
        {section.description && (
          <p className="text-sm text-text-muted leading-relaxed mb-4">{section.description}</p>
        )}

        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 -mx-1 px-1">
          {TABS.filter((t) => tabCount(t.id) > 0).map(({ id: tabId, label, icon: Icon }) => {
            const active = activeTab === tabId;
            return (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTab(tabId)}
                className={`px-3 h-9 rounded-full text-xs font-bold whitespace-nowrap border transition-all shrink-0 flex items-center gap-1.5 ${active ? 'bg-primary text-white border-primary' : 'bg-surface text-text border-border hover:border-primary/40'}`}>
                <Icon className="w-3.5 h-3.5" />
                {label} ({tabCount(tabId)})
              </button>
            );
          })}
        </div>

        <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Curriculum
        </h2>

        {activeTab === 'books' && (
          <div className="flex flex-col gap-3">
            {sortedByOrder(section.bookLessons).map((book) => (
              <div
                key={book.id}
                className="bg-surface border border-border rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedBookId(expandedBookId === book.id ? null : book.id)
                  }
                  className="w-full p-4 flex items-center gap-3 hover:bg-surface-2 transition-colors text-left">
                  {book.coverImageUrl && (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-10 h-14 object-cover rounded shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text text-sm">
                      #{book.order} {book.title}
                    </p>
                    {book.description && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                        {book.description}
                      </p>
                    )}
                  </div>
                  {expandedBookId === book.id ? (
                    <ChevronUp className="w-5 h-5 text-text-muted shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-text-muted shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedBookId === book.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border">
                      {sortedByOrder(book.topics ?? []).map((topic) => (
                        <div key={topic.id} className="border-b border-border last:border-0">
                          <div className="px-4 pt-3 pb-2 bg-surface-2/50">
                            <p className="text-[11px] uppercase tracking-wider font-bold text-text-muted">
                              #{topic.order} {topic.title}
                            </p>
                          </div>
                          {sortedByOrder(topic.parts ?? []).map((part) => {
                            const key = itemKey(
                              program.id,
                              section.id,
                              'book',
                              book.id,
                              topic.id,
                              part.id
                            );
                            const legacy = legacyItemKey(
                              program.id,
                              'book',
                              book.id,
                              topic.id,
                              part.id
                            );
                            return (
                              <button
                                key={part.id}
                                type="button"
                                onClick={() => toggleComplete(key, legacy, part.label)}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-2 transition-colors text-left">
                                {renderStatus(key, legacy)}
                                <BookOpen className="w-4 h-4 text-text-muted flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-text truncate">
                                    {part.label}
                                  </p>
                                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                                    {part.pdfFileName ? 'PDF' : ''}
                                    {part.pdfFileName && part.audioFileName ? ' · ' : ''}
                                    {part.audioFileName ? 'Audio' : 'Book content'}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'video' &&
          sortedByOrder(section.videoLessons).map((mod) => (
            <div
              key={mod.id}
              className="bg-surface border border-border rounded-2xl overflow-hidden mb-3">
              <div className="px-4 pt-3 pb-2 bg-surface-2/50 border-b border-border flex items-center gap-3">
                {mod.imageUrl && (
                  <img
                    src={mod.imageUrl}
                    alt={mod.title}
                    className="w-10 h-10 object-cover rounded-lg shrink-0"
                  />
                )}
                <div>
                  <p className="text-sm font-bold text-text">
                    #{mod.order} {mod.title}
                  </p>
                  {mod.description && (
                    <p className="text-xs text-text-muted mt-0.5">{mod.description}</p>
                  )}
                </div>
              </div>
              {sortedByOrder(mod.videos ?? []).map((video) => {
                const key = itemKey(program.id, section.id, 'video', mod.id, video.id);
                const legacy = legacyItemKey(program.id, 'video', mod.id, video.id);
                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => toggleComplete(key, legacy, video.label)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-2 transition-colors text-left border-b border-border last:border-0">
                    {renderStatus(key, legacy)}
                    <Play className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{video.label}</p>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                        {video.type === 'embed' ? 'Embed video' : 'Uploaded video'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

        {activeTab === 'audio' &&
          sortedByOrder(section.audioLessons).map((mod) => (
            <div
              key={mod.id}
              className="bg-surface border border-border rounded-2xl overflow-hidden mb-3">
              <div className="px-4 pt-3 pb-2 bg-surface-2/50 border-b border-border flex items-center gap-3">
                {mod.imageUrl && (
                  <img
                    src={mod.imageUrl}
                    alt={mod.title}
                    className="w-10 h-10 object-cover rounded-lg shrink-0"
                  />
                )}
                <p className="text-sm font-bold text-text">
                  #{mod.order} {mod.title}
                </p>
              </div>
              {sortedByOrder(mod.tracks ?? []).map((track) => {
                const key = itemKey(program.id, section.id, 'audio', mod.id, track.id);
                const legacy = legacyItemKey(program.id, 'audio', mod.id, track.id);
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => toggleComplete(key, legacy, track.label)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-2 transition-colors text-left border-b border-border last:border-0">
                    {renderStatus(key, legacy)}
                    <Headphones className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{track.label}</p>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                        Audio
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

        {activeTab === 'images' &&
          sortedByOrder(section.imageLessons).map((mod) => (
            <div
              key={mod.id}
              className="bg-surface border border-border rounded-2xl overflow-hidden mb-3">
              <div className="px-4 pt-3 pb-2 bg-surface-2/50 border-b border-border flex items-center gap-3">
                {mod.coverImageUrl && (
                  <img
                    src={mod.coverImageUrl}
                    alt={mod.title}
                    className="w-10 h-10 object-cover rounded-lg shrink-0"
                  />
                )}
                <div>
                  <p className="text-sm font-bold text-text">
                    #{mod.order} {mod.title}
                  </p>
                  {mod.description && (
                    <p className="text-xs text-text-muted mt-0.5">{mod.description}</p>
                  )}
                </div>
              </div>
              {sortedByOrder(mod.images ?? []).map((img) => {
                const key = itemKey(program.id, section.id, 'image', mod.id, img.id);
                const legacy = legacyItemKey(program.id, 'image', mod.id, img.id);
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => toggleComplete(key, legacy, img.label)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-2 transition-colors text-left border-b border-border last:border-0">
                    {renderStatus(key, legacy)}
                    {img.imageUrl ? (
                      <img
                        src={img.imageUrl}
                        alt={img.label}
                        className="w-10 h-10 object-cover rounded-lg shrink-0"
                      />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{img.label}</p>
                      <p className="text-[10px] text-text-muted line-clamp-1">
                        {img.caption || 'Image'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

        {activeTab === 'text' &&
          sortedByOrder(section.textLessons).map((mod) => (
            <div
              key={mod.id}
              className="bg-surface border border-border rounded-2xl overflow-hidden mb-3">
              <div className="px-4 pt-3 pb-2 bg-surface-2/50 border-b border-border flex items-center gap-3">
                {mod.imageUrl && (
                  <img
                    src={mod.imageUrl}
                    alt={mod.title}
                    className="w-10 h-10 object-cover rounded-lg shrink-0"
                  />
                )}
                <p className="text-sm font-bold text-text">
                  #{mod.order} {mod.title}
                </p>
              </div>
              {sortedByOrder(mod.parts ?? []).map((part) => {
                const key = itemKey(program.id, section.id, 'text', mod.id, part.id);
                const legacy = legacyItemKey(program.id, 'text', mod.id, part.id);
                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => toggleComplete(key, legacy, part.label)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-2 transition-colors text-left border-b border-border last:border-0">
                    {renderStatus(key, legacy)}
                    <FileText className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{part.label}</p>
                      <p className="text-[10px] text-text-muted line-clamp-1">
                        {part.content || 'Text lesson'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
      </div>

      {!enrolled && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/95 backdrop-blur border-t border-border z-30 max-w-[420px] mx-auto pb-safe">
          <button
            onClick={handleEnroll}
            className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98]">
            Start Program
          </button>
        </div>
      )}
    </div>
  );
}
