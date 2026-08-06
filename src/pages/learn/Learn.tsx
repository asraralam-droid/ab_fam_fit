import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Headphones,
  Lock,
  Unlock,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  normalizeAdminProgram,
  flattenProgramSections,
  sortedProgramModules
} from '../../store/adminProgramsSlice';
import {
  computeEnrolledLearningProgress,
  itemKey,
  legacyItemKey,
  countSectionModules,
  sectionSummaryLabel
} from '../../utils/programDisplay';
import { canAccessFeature } from '../../utils/membershipAccess';
import { UpgradeGate } from '../../components/membership/UpgradeGate';
import { BrandHierarchyTrail } from '../../components/BrandHierarchyTrail';
import { buildProgramHierarchyCrumbs } from '../../utils/brandHierarchy';
import { moduleDisplayTitle } from '../programs/curriculum';

function isItemDone(completed: string[], key: string, legacyKey: string) {
  return completed.includes(key) || completed.includes(legacyKey);
}

export function Learn() {
  const navigate = useNavigate();
  const { programs: rawPrograms } = useSelector(
    (state: RootState) => state.adminPrograms
  );
  const {
    enrolledIds: rawEnrolled,
    enrolledAt: rawEnrolledAt,
    completedItemKeys: rawCompleted
  } = useSelector((state: RootState) => state.programs);
  const { user } = useSelector((state: RootState) => state.auth);
  const { tier } = useSelector((state: RootState) => state.membership);
  const canAccessLessons = canAccessFeature(tier, 'structuredLessons', {
    role: user?.role
  });

  const enrolledIds = Array.isArray(rawEnrolled) ? rawEnrolled : [];
  const enrolledAtMap =
    rawEnrolledAt && typeof rawEnrolledAt === 'object'
      ? (rawEnrolledAt as Record<string, number>)
      : {};
  const completedItemKeys = Array.isArray(rawCompleted) ? rawCompleted : [];

  const programs = useMemo(
    () =>
      rawPrograms
        .map((p) =>
          normalizeAdminProgram(p as unknown as Record<string, unknown>)
        )
        .filter((p) => p.active),
    [rawPrograms]
  );

  const learning = computeEnrolledLearningProgress(programs, completedItemKeys, {
    enrolledIds,
    enrolledAt: enrolledAtMap
  });

  const jabProgram =
    programs.find((p) => p.id === 'prog-jab') ??
    programs.find((p) => enrolledIds.includes(p.id));

  /** Book progress % from program book lessons (same card UI as before). */
  const programBookProgress = useMemo(() => {
    if (!jabProgram) return [45, 0, 0];
    const percents: number[] = [];
    for (const section of flattenProgramSections(jabProgram)) {
      const books = [...(section.bookLessons ?? [])].sort(
        (a, b) => a.order - b.order
      );
      for (const book of books) {
        const partKeys: { key: string; legacyKey: string }[] = [];
        for (const topic of book.topics ?? []) {
          for (const part of topic.parts ?? []) {
            partKeys.push({
              key: itemKey(
                jabProgram.id,
                section.id,
                'book',
                book.id,
                topic.id,
                part.id
              ),
              legacyKey: legacyItemKey(
                jabProgram.id,
                'book',
                book.id,
                topic.id,
                part.id
              )
            });
          }
        }
        const done = partKeys.filter(({ key, legacyKey }) =>
          isItemDone(completedItemKeys, key, legacyKey)
        ).length;
        percents.push(
          partKeys.length ? Math.round((done / partKeys.length) * 100) : 0
        );
      }
    }
    while (percents.length < 3) percents.push(0);
    return percents;
  }, [jabProgram, completedItemKeys]);

  const [activeTab, setActiveTab] = useState<'lessons' | 'jab'>('lessons');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const progressPercent = learning.percent;

  const curriculumModules = useMemo(() => {
    if (!jabProgram) return [];
    return sortedProgramModules(jabProgram).map((mod) => ({
      id: mod.id,
      title: moduleDisplayTitle(mod),
      sections: [...(mod.sections ?? [])]
        .sort((a, b) => a.order - b.order)
        .map((sec) => ({
          id: sec.id,
          title: sec.title,
          summary: sectionSummaryLabel(sec),
          lessonGroups: Object.values(countSectionModules(sec)).reduce(
            (a, b) => a + b,
            0
          )
        }))
    }));
  }, [jabProgram]);

  useEffect(() => {
    if (!expandedModule && curriculumModules[0]) {
      setExpandedModule(curriculumModules[0].id);
    }
  }, [curriculumModules, expandedModule]);

  const books = [
    {
      id: 'book-1',
      title: 'Book 1: Authentic Foundation',
      status: 'unlocked' as const,
      progress: programBookProgress[0],
      cover:
        'https://images.unsplash.com/photo-1544716278-e513176f20b5?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'book-2',
      title: 'Book 2: The Practice',
      status: (programBookProgress[0] >= 100 ? 'unlocked' : 'locked') as
        | 'unlocked'
        | 'locked',
      req: 'Complete Book 1',
      progress: programBookProgress[1],
      cover:
        'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'book-3',
      title: 'Maintaining the Lifestyle',
      status: (programBookProgress[1] >= 100 ? 'unlocked' : 'locked') as
        | 'unlocked'
        | 'locked',
      req: 'Complete Book 2',
      progress: programBookProgress[2],
      cover:
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80'
    }
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24">
      <div className="px-4 pt-6 pb-2 sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold text-text mb-4">Learn</h1>

        {/* Tabs */}
        <div className="flex p-1 bg-surface-2 rounded-xl mb-4">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'lessons' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text'}`}>
            Modules & Lessons
          </button>
          <button
            onClick={() => setActiveTab('jab')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'jab' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text'}`}>
            Program Books
          </button>
        </div>
      </div>

      <div className="px-4">
        {jabProgram && (
          <div className="rounded-2xl border border-border bg-surface p-3.5 mb-4 shadow-sm">
            <BrandHierarchyTrail
              showLegend
              crumbs={buildProgramHierarchyCrumbs({ program: jabProgram })}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'lessons' ? (
            <motion.div
              key="lessons"
              initial={{
                opacity: 0,
                x: -20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              exit={{
                opacity: 0,
                x: 20
              }}
              transition={{
                duration: 0.2
              }}>
              {!canAccessLessons ? (
                <UpgradeGate
                  title="Structured lessons are locked"
                  description="Your book package includes the JAB books (read & listen) and self-guided tools. Step-by-step lessons and personalized guidance require working with Misty or joining a paid challenge."
                />
              ) : (
                <>
              {/* Progress */}
              <div className="bg-surface rounded-2xl border border-border p-5 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-text">Overall Progress</h3>
                  <span className="text-sm font-bold text-primary">
                    {learning.completed} / {learning.total}
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{
                      width: `${progressPercent}%`
                    }}
                  />
                </div>
              </div>

              {/* Modules → Sections → Lessons */}
              <div className="flex flex-col gap-4">
                {curriculumModules.length === 0 ? (
                  <div className="p-8 text-center text-sm text-text-muted bg-surface border border-dashed border-border rounded-2xl">
                    No modules published yet.
                  </div>
                ) : (
                  curriculumModules.map((mod) => (
                    <div
                      key={mod.id}
                      className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedModule(
                            expandedModule === mod.id ? null : mod.id
                          )
                        }
                        className="w-full p-4 flex items-center justify-between bg-surface hover:bg-surface-2 transition-colors text-left">
                        <div className="flex items-center gap-2 min-w-0">
                          <Layers className="w-4 h-4 text-primary flex-shrink-0" />
                          <h3 className="font-bold text-text truncate">
                            {mod.title}
                          </h3>
                        </div>
                        {expandedModule === mod.id ? (
                          <ChevronUp className="w-5 h-5 text-text-muted" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-text-muted" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedModule === mod.id && (
                          <motion.div
                            initial={{
                              height: 0,
                              opacity: 0
                            }}
                            animate={{
                              height: 'auto',
                              opacity: 1
                            }}
                            exit={{
                              height: 0,
                              opacity: 0
                            }}
                            className="border-t border-border">
                            {mod.sections.length === 0 ? (
                              <p className="p-4 text-sm text-text-muted">
                                No sections in this module yet.
                              </p>
                            ) : (
                              mod.sections.map((sec, idx) => (
                                <button
                                  key={sec.id}
                                  type="button"
                                  onClick={() =>
                                    jabProgram &&
                                    navigate(
                                      `/programs/${jabProgram.id}/section/${sec.id}`
                                    )
                                  }
                                  className={`w-full p-4 flex items-center gap-3 text-left hover:bg-surface-2 transition-colors ${
                                    idx !== mod.sections.length - 1
                                      ? 'border-b border-border'
                                      : ''
                                  }`}>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
                                      Section
                                    </p>
                                    <p className="font-medium text-text text-sm">
                                      {sec.title}
                                    </p>
                                    <p className="text-xs text-text-muted mt-0.5">
                                      {sec.summary}
                                    </p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                                </button>
                              ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </div>

              {jabProgram && (
                <button
                  type="button"
                  onClick={() => navigate(`/programs/${jabProgram.id}`)}
                  className="w-full mt-4 h-11 rounded-xl border border-primary/30 text-primary text-sm font-bold bg-primary/5">
                  Open full program hierarchy
                </button>
              )}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="jab"
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              exit={{
                opacity: 0,
                x: -20
              }}
              transition={{
                duration: 0.2
              }}>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-text mb-1">
                  {jabProgram?.title ?? 'Juicing for Authentic Balance'}
                </h2>
                <p className="text-text-muted text-sm">
                  Program books (lesson type) inside your pillar path
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className={`bg-surface rounded-2xl border border-border overflow-hidden shadow-sm flex ${book.status === 'locked' ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                    <div className="w-1/3 aspect-[3/4] relative">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                      {book.status === 'locked' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                          <Lock className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="w-2/3 p-4 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-text text-sm leading-tight">
                          {book.title}
                        </h3>
                        {book.status === 'unlocked' && (
                          <Unlock className="w-4 h-4 text-accent-sage flex-shrink-0" />
                        )}
                      </div>

                      {book.status === 'unlocked' ? (
                        <>
                          <div className="mt-auto mb-4">
                            <div className="flex justify-between text-xs text-text-muted mb-1">
                              <span>Progress</span>
                              <span>{book.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: `${book.progress}%`
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                navigate(`/learn/book/${book.id}/read`)
                              }
                              className="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-primary-hover transition-colors">
                              <BookOpen className="w-3.5 h-3.5" /> Read
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/learn/book/${book.id}/listen`)
                              }
                              className="flex-1 py-2 bg-surface-2 text-text rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-border transition-colors border border-border">
                              <Headphones className="w-3.5 h-3.5" /> Listen
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="mt-auto">
                          <p className="text-xs font-medium text-text-muted bg-surface-2 p-2 rounded-lg inline-block">
                            Requires: {book.req}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
