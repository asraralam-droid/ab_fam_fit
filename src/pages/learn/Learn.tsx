import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Headphones,
  Lock,
  Unlock
} from 'lucide-react';
import { normalizeAdminProgram } from '../../store/adminProgramsSlice';
import {
  computeEnrolledLearningProgress,
  itemKey,
  legacyItemKey,
  sortedSections
} from '../../utils/programDisplay';
import { canAccessFeature } from '../../utils/membershipAccess';
import { UpgradeGate } from '../../components/membership/UpgradeGate';

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

  /** Flat non-book program items — used to mirror lesson checkmarks from program progress. */
  const programLessonKeys = useMemo(() => {
    if (!jabProgram) return [] as { key: string; legacyKey: string }[];
    const keys: { key: string; legacyKey: string }[] = [];
    for (const section of sortedSections(jabProgram.sections ?? [])) {
      for (const mod of section.videoLessons ?? []) {
        for (const video of mod.videos ?? []) {
          keys.push({
            key: itemKey(jabProgram.id, section.id, 'video', mod.id, video.id),
            legacyKey: legacyItemKey(jabProgram.id, 'video', mod.id, video.id)
          });
        }
      }
      for (const mod of section.audioLessons ?? []) {
        for (const track of mod.tracks ?? []) {
          keys.push({
            key: itemKey(jabProgram.id, section.id, 'audio', mod.id, track.id),
            legacyKey: legacyItemKey(jabProgram.id, 'audio', mod.id, track.id)
          });
        }
      }
      for (const mod of section.textLessons ?? []) {
        for (const part of mod.parts ?? []) {
          keys.push({
            key: itemKey(jabProgram.id, section.id, 'text', mod.id, part.id),
            legacyKey: legacyItemKey(jabProgram.id, 'text', mod.id, part.id)
          });
        }
      }
      for (const mod of section.imageLessons ?? []) {
        for (const img of mod.images ?? []) {
          keys.push({
            key: itemKey(jabProgram.id, section.id, 'image', mod.id, img.id),
            legacyKey: legacyItemKey(jabProgram.id, 'image', mod.id, img.id)
          });
        }
      }
    }
    return keys;
  }, [jabProgram]);

  /** Book progress % from program book lessons (same card UI as before). */
  const programBookProgress = useMemo(() => {
    if (!jabProgram) return [45, 0, 0];
    const percents: number[] = [];
    for (const section of sortedSections(jabProgram.sections ?? [])) {
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
  const [expandedModule, setExpandedModule] = useState<string | null>('mod1');
  const progressPercent = learning.percent;
  const modules = [
    {
      id: 'mod1',
      title: 'Module 1: Foundations',
      lessons: [
        {
          id: 'lesson-1',
          title: 'Why Plant-Forward?',
          duration: '8 min'
        },
        {
          id: 'lesson-2',
          title: 'Understanding Your Gut',
          duration: '12 min'
        },
        {
          id: 'lesson-3',
          title: 'Hydration Basics',
          duration: '5 min'
        }
      ]
    },
    {
      id: 'mod2',
      title: 'Module 2: Mindset',
      lessons: [
        {
          id: 'lesson-4',
          title: 'Family Accountability 101',
          duration: '10 min'
        },
        {
          id: 'lesson-5',
          title: 'Overcoming Cravings',
          duration: '15 min'
        }
      ]
    }
  ];

  const books = [
    {
      id: 'book-1',
      title: 'Juicing for Authentic Balance',
      status: 'unlocked' as const,
      progress: programBookProgress[0],
      cover:
        'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'book-2',
      title: 'The 30-Day Reset',
      status: (programBookProgress[0] >= 100 ? 'unlocked' : 'locked') as
        | 'unlocked'
        | 'locked',
      req: 'Complete Book 1',
      progress: programBookProgress[1],
      cover:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80'
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
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const flatLessons = modules.flatMap((m) => m.lessons);

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24">
      <div className="px-4 pt-6 pb-2 sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold text-text mb-4">Learn</h1>

        {/* Tabs */}
        <div className="flex p-1 bg-surface-2 rounded-xl mb-4">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'lessons' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text'}`}>
            Lessons
          </button>
          <button
            onClick={() => setActiveTab('jab')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'jab' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text'}`}>
            JAB Program
          </button>
        </div>
      </div>

      <div className="px-4">
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

              {/* Modules */}
              <div className="flex flex-col gap-4">
                {modules.map((mod) => (
                  <div
                    key={mod.id}
                    className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                    <button
                      onClick={() =>
                        setExpandedModule(
                          expandedModule === mod.id ? null : mod.id
                        )
                      }
                      className="w-full p-4 flex items-center justify-between bg-surface hover:bg-surface-2 transition-colors">
                      <h3 className="font-bold text-text">{mod.title}</h3>
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
                          {mod.lessons.map((lesson, idx) => {
                            const lessonIndex = flatLessons.findIndex(
                              (l) => l.id === lesson.id
                            );
                            const mapped = programLessonKeys[lessonIndex];
                            const isCompleted = mapped
                              ? isItemDone(
                                  completedItemKeys,
                                  mapped.key,
                                  mapped.legacyKey
                                )
                              : false;
                            return (
                              <div
                                key={lesson.id}
                                onClick={() =>
                                  navigate(`/learn/lesson/${lesson.id}`)
                                }
                                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-surface-2 transition-colors ${idx !== mod.lessons.length - 1 ? 'border-b border-border' : ''}`}>
                                {isCompleted ? (
                                  <CheckCircle2 className="w-6 h-6 text-accent-sage flex-shrink-0" />
                                ) : (
                                  <PlayCircle className="w-6 h-6 text-primary/40 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <p
                                    className={`font-medium ${isCompleted ? 'text-text-muted' : 'text-text'}`}>
                                    {lesson.title}
                                  </p>
                                  <p className="text-xs text-text-muted mt-0.5">
                                    {lesson.duration}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
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
                  Juicing for Authentic Balance
                </h2>
                <p className="text-text-muted text-sm">
                  The complete JAB Series
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
