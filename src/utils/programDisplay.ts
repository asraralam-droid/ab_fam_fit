import type { AdminProgram, ProgramSection } from '../store/adminProgramsSlice';
import { flattenProgramSections } from '../store/adminProgramsSlice';
import { PROGRAM_FALLBACK_COVERS } from './brandMedia';

/** Days between each section unlock after enrollment. */
export const SECTION_UNLOCK_INTERVAL_DAYS = 30;
export const MS_PER_SECTION_UNLOCK = SECTION_UNLOCK_INTERVAL_DAYS * 24 * 60 * 60 * 1000;

const COVERS = PROGRAM_FALLBACK_COVERS;

export function programCover(programId: string): string {
  let hash = 0;
  for (let i = 0; i < programId.length; i++) {
    hash = (hash + programId.charCodeAt(i) * (i + 1)) % COVERS.length;
  }
  return COVERS[hash];
}

export function programCoverImage(program: AdminProgram): string {
  return program.coverImageUrl ?? programCover(program.id);
}

export function sectionCoverImage(section: ProgramSection, programId: string): string {
  return section.imageUrl ?? programCover(programId);
}

export function moduleCoverImage(
  mod: { imageUrl?: string },
  programId: string
): string {
  return mod.imageUrl ?? programCover(programId);
}

export function countSectionItems(section: ProgramSection) {
  const books = (section.bookLessons ?? []).reduce(
    (n, book) =>
      n + (book.topics ?? []).reduce((tn, t) => tn + (t.parts?.length ?? 0), 0),
    0
  );
  const videos = (section.videoLessons ?? []).reduce(
    (n, m) => n + (m.videos?.length ?? 0),
    0
  );
  const audio = (section.audioLessons ?? []).reduce(
    (n, m) => n + (m.tracks?.length ?? 0),
    0
  );
  const text = (section.textLessons ?? []).reduce(
    (n, m) => n + (m.parts?.length ?? 0),
    0
  );
  const images = (section.imageLessons ?? []).reduce(
    (n, m) => n + (m.images?.length ?? 0),
    0
  );
  return { books, videos, audio, images, text, total: books + videos + audio + images + text };
}

export function countProgramItems(program: AdminProgram) {
  return flattenProgramSections(program).reduce(
    (acc, section) => {
      const c = countSectionItems(section);
      return {
        books: acc.books + c.books,
        videos: acc.videos + c.videos,
        audio: acc.audio + c.audio,
        images: acc.images + c.images,
        text: acc.text + c.text,
        total: acc.total + c.total
      };
    },
    { books: 0, videos: 0, audio: 0, images: 0, text: 0, total: 0 }
  );
}

export function countSectionModules(section: ProgramSection) {
  return {
    books: section.bookLessons?.length ?? 0,
    video: section.videoLessons?.length ?? 0,
    audio: section.audioLessons?.length ?? 0,
    images: section.imageLessons?.length ?? 0,
    text: section.textLessons?.length ?? 0
  };
}

export function countProgramModules(program: AdminProgram) {
  return flattenProgramSections(program).reduce(
    (acc, section) => {
      const m = countSectionModules(section);
      return {
        books: acc.books + m.books,
        video: acc.video + m.video,
        audio: acc.audio + m.audio,
        images: acc.images + m.images,
        text: acc.text + m.text
      };
    },
    { books: 0, video: 0, audio: 0, images: 0, text: 0 }
  );
}

export function sectionSummaryLabel(section: ProgramSection) {
  const mods = countSectionModules(section);
  const lessonGroups =
    mods.books + mods.video + mods.audio + mods.images + mods.text;
  if (!lessonGroups) return 'No lessons yet';
  const parts: string[] = [];
  if (mods.books) parts.push(`${mods.books} book lesson${mods.books === 1 ? '' : 's'}`);
  if (mods.video) parts.push(`${mods.video} video lesson${mods.video === 1 ? '' : 's'}`);
  if (mods.audio) parts.push(`${mods.audio} audio lesson${mods.audio === 1 ? '' : 's'}`);
  if (mods.images) parts.push(`${mods.images} image lesson${mods.images === 1 ? '' : 's'}`);
  if (mods.text) parts.push(`${mods.text} text lesson${mods.text === 1 ? '' : 's'}`);
  return parts.join(' · ');
}

export function programSummaryLabel(program: AdminProgram) {
  const moduleCount = program.modules?.length ?? 0;
  const sectionCount = flattenProgramSections(program).length;
  if (sectionCount || moduleCount) {
    const mods = countProgramModules(program);
    const lessonContainers =
      (mods.books ?? 0) +
      (mods.video ?? 0) +
      (mods.audio ?? 0) +
      (mods.images ?? 0) +
      (mods.text ?? 0);
    const parts: string[] = [];
    if (moduleCount) {
      parts.push(`${moduleCount} module${moduleCount === 1 ? '' : 's'}`);
    }
    if (sectionCount) {
      parts.push(`${sectionCount} section${sectionCount === 1 ? '' : 's'}`);
    }
    if (lessonContainers) {
      parts.push(
        `${lessonContainers} lesson group${lessonContainers === 1 ? '' : 's'}`
      );
    }
    return parts.join(' · ');
  }
  return 'No content yet';
}

export function isFirstProgramSection(program: AdminProgram, sectionId: string): boolean {
  const flat = flattenProgramSections(program);
  return flat.length > 0 && flat[0].id === sectionId;
}

export function itemKey(
  programId: string,
  sectionId: string,
  kind: 'book' | 'video' | 'audio' | 'image' | 'text',
  ...ids: string[]
) {
  return `${programId}:${sectionId}:${kind}:${ids.join(':')}`;
}

/** Pre-sections format — kept for completion migration. */
export function legacyItemKey(
  programId: string,
  kind: 'book' | 'video' | 'audio' | 'image' | 'text',
  ...ids: string[]
) {
  return `${programId}:${kind}:${ids.join(':')}`;
}

function isItemComplete(completed: Set<string>, key: string, legacyKey: string) {
  return completed.has(key) || completed.has(legacyKey);
}

export function sortedSections(sections: ProgramSection[]): ProgramSection[] {
  return [...sections].sort((a, b) => a.order - b.order);
}

export function sectionIndexInProgram(
  sections: ProgramSection[],
  sectionId: string
): number {
  return sortedSections(sections).findIndex((s) => s.id === sectionId);
}

/** Flat ordered sections for lock/progress (module order, then section order). */
export function programSectionsForLocks(program: AdminProgram): ProgramSection[] {
  return sortedSections(flattenProgramSections(program));
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Cumulative days from program start when this section unlocks. */
export function sectionUnlockDaysFromStart(
  sections: ProgramSection[],
  sectionId: string
): number {
  const sorted = sortedSections(sections);
  let cumulative = 0;
  for (let i = 0; i < sorted.length; i++) {
    const sec = sorted[i];
    const lockDays =
      sec.lockDays !== undefined && sec.lockDays !== null
        ? Math.max(0, Number(sec.lockDays) || 0)
        : i === 0
          ? 0
          : SECTION_UNLOCK_INTERVAL_DAYS;
    cumulative += lockDays;
    if (sec.id === sectionId) return cumulative;
  }
  return 0;
}

export function sectionUnlocksAtMs(enrolledAt: number, unlockAfterDays: number): number {
  return enrolledAt + unlockAfterDays * MS_PER_DAY;
}

/** When this section becomes available (ms). Respects lockDaysUpdatedAt for admin lock changes. */
export function computeSectionUnlocksAt(
  sections: ProgramSection[],
  sectionId: string,
  enrolledAt: number
): number {
  const sorted = sortedSections(sections);
  const idx = sorted.findIndex((s) => s.id === sectionId);
  if (idx < 0) return enrolledAt;

  const section = sorted[idx];
  const lockDays = resolveSectionLockDays(sections, section);

  if (idx === 0) {
    if (lockDays <= 0) return enrolledAt;
    if (section.lockDaysUpdatedAt) {
      return Math.max(
        enrolledAt,
        section.lockDaysUpdatedAt + lockDays * MS_PER_DAY
      );
    }
    return Math.max(enrolledAt, Date.now() + lockDays * MS_PER_DAY);
  }

  const prevUnlock = computeSectionUnlocksAt(sections, sorted[idx - 1].id, enrolledAt);
  if (lockDays <= 0) return prevUnlock;

  const anchor = section.lockDaysUpdatedAt;
  if (!anchor) {
    return Math.max(prevUnlock, Date.now() + lockDays * MS_PER_DAY);
  }
  return Math.max(prevUnlock, anchor + lockDays * MS_PER_DAY);
}

export function resolveSectionLockDays(
  sections: ProgramSection[],
  section: ProgramSection
): number {
  const sorted = sortedSections(sections);
  const idx = sorted.findIndex((s) => s.id === section.id);
  if (section.lockDays !== undefined && section.lockDays !== null) {
    return Math.max(0, Number(section.lockDays) || 0);
  }
  if (idx <= 0) return 0;
  return SECTION_UNLOCK_INTERVAL_DAYS;
}

export function formatSectionLockDaysLabel(
  sections: ProgramSection[],
  section: ProgramSection
): string {
  const sorted = sortedSections(sections);
  const idx = sorted.findIndex((s) => s.id === section.id);
  const lockDays = resolveSectionLockDays(sections, section);
  if (idx <= 0) {
    return lockDays === 0 ? 'Unlocks on program start' : `${lockDays}-day delay after start`;
  }
  return lockDays === 0
    ? 'Opens when previous section opens'
    : `${lockDays}-day lock after previous section opens`;
}

/** Admin / member preview assuming a member started the program at `memberStartedAt`. */
export function getSectionLockPreview(
  sections: ProgramSection[],
  sectionId: string,
  options?: { memberStartedAt?: number; now?: number }
): SectionLockStatus {
  const now = options?.now ?? Date.now();
  const memberStartedAt = options?.memberStartedAt ?? now;
  return getSectionLockStatus(sections, sectionId, {
    enrolled: true,
    enrolledAt: memberStartedAt,
    now
  });
}

export function formatSectionLockDaysBadge(
  sections: ProgramSection[],
  section: ProgramSection
): string {
  const days = resolveSectionLockDays(sections, section);
  if (days <= 0) return 'No lock';
  return `${days} day${days === 1 ? '' : 's'}`;
}

export function formatLockDaysUpdatedAt(updatedAt?: number): string | null {
  if (!updatedAt) return null;
  return formatUnlockDate(updatedAt);
}

export interface SectionLockStatus {
  unlocked: boolean;
  sectionIndex: number;
  /** Configured lock days for this section. */
  unlockAfterDays: number;
  unlocksAt?: number;
  daysRemaining?: number;
  lockDaysUpdatedAt?: number;
}

export function getSectionLockStatus(
  sections: ProgramSection[],
  sectionId: string,
  options: {
    enrolled: boolean;
    enrolledAt?: number;
    now?: number;
  }
): SectionLockStatus {
  const { enrolled, enrolledAt, now = Date.now() } = options;
  const sectionIndex = sectionIndexInProgram(sections, sectionId);
  const sorted = sortedSections(sections);
  const section = sorted.find((s) => s.id === sectionId);
  const configuredLockDays = section
    ? resolveSectionLockDays(sections, section)
    : sectionUnlockDaysFromStart(sections, sectionId);

  if (sectionIndex < 0) {
    return { unlocked: false, sectionIndex: -1, unlockAfterDays: 0 };
  }

  if (!enrolled || enrolledAt === undefined) {
    return {
      unlocked: false,
      sectionIndex,
      unlockAfterDays: configuredLockDays,
      daysRemaining: configuredLockDays > 0 ? configuredLockDays : undefined,
      lockDaysUpdatedAt: section?.lockDaysUpdatedAt
    };
  }

  const unlocksAt = computeSectionUnlocksAt(sections, sectionId, enrolledAt);
  const unlocked = now >= unlocksAt;

  if (unlocked) {
    return {
      unlocked: true,
      sectionIndex,
      unlockAfterDays: configuredLockDays,
      unlocksAt,
      lockDaysUpdatedAt: section?.lockDaysUpdatedAt
    };
  }

  const daysRemaining = Math.ceil((unlocksAt - now) / MS_PER_DAY);
  return {
    unlocked: false,
    sectionIndex,
    unlockAfterDays: configuredLockDays,
    unlocksAt,
    daysRemaining,
    lockDaysUpdatedAt: section?.lockDaysUpdatedAt
  };
}

export function formatSectionUnlockLabel(
  status: SectionLockStatus,
  enrolled: boolean
): string {
  if (status.unlocked) return 'Unlocked';
  if (!enrolled) {
    if (status.unlockAfterDays <= 0) return 'Locked';
    if (status.unlockAfterDays === 1) return '1 day after start';
    return `${status.unlockAfterDays} days after start`;
  }
  if (status.daysRemaining === undefined || !status.unlocksAt) return 'Locked';
  if (status.daysRemaining <= 0) return 'Unlocks today';
  if (status.daysRemaining === 1) return '1 day left';
  return `${status.daysRemaining} days left`;
}

/** Member-facing line for locked sections (countdown or pre-enrollment hint). */
export function formatSectionDaysLeft(
  status: SectionLockStatus,
  enrolled: boolean,
  sections?: ProgramSection[],
  section?: ProgramSection
): string | null {
  if (status.unlocked) return null;

  if (!enrolled) {
    if (status.unlockAfterDays <= 0) {
      return 'Start the program to unlock this section';
    }
    if (status.unlockAfterDays === 1) {
      return 'Unlocks 1 day after you start the program';
    }
    return `Unlocks ${status.unlockAfterDays} days after you start the program`;
  }
  if (status.daysRemaining === undefined) return 'This section is locked';

  const configured = sections && section ? resolveSectionLockDays(sections, section) : null;
  const waitNote =
    configured !== null && configured > 0
      ? section?.lockDaysUpdatedAt
        ? ` (${configured}-day lock from last update)`
        : ` (${configured}-day lock)`
      : '';

  if (status.daysRemaining <= 0) {
    return `Unlocks today — check back soon${waitNote}`;
  }
  if (status.daysRemaining === 1) {
    return `1 day left to unlock${waitNote}`;
  }
  return `${status.daysRemaining} days left to unlock${waitNote}`;
}

export function formatSectionLockProgressDetail(
  status: SectionLockStatus,
  sections: ProgramSection[],
  section: ProgramSection
): string | null {
  if (status.unlocked || status.daysRemaining === undefined) return null;
  const configured = resolveSectionLockDays(sections, section);
  const idx = sortedSections(sections).findIndex((s) => s.id === section.id);
  const settingLabel =
    idx <= 0
      ? configured === 0
        ? 'Opens when you start'
        : `${configured}-day delay after start`
      : configured === 0
        ? 'Opens when previous section opens'
        : `${configured}-day lock`;

  if (section.lockDaysUpdatedAt && configured > 0) {
    const elapsedDays = Math.max(
      0,
      Math.floor((Date.now() - section.lockDaysUpdatedAt) / MS_PER_DAY)
    );
    const dayInLock = Math.min(elapsedDays + 1, configured);
    return `${settingLabel} · Countdown from last update · Day ${dayInLock} of ${configured} · ${status.daysRemaining} days left`;
  }

  const elapsed = Math.max(0, status.unlockAfterDays - status.daysRemaining);
  return `${settingLabel} · Day ${elapsed + 1} of ${status.unlockAfterDays} · ${status.daysRemaining} days left`;
}

export function formatUnlockDate(unlocksAt: number): string {
  return new Date(unlocksAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export interface ItemProgressStats {
  completed: number;
  total: number;
  percent: number;
}

function collectUnlockedItemKeys(
  program: AdminProgram,
  options?: {
    enrolled?: boolean;
    enrolledAt?: number;
  }
) {
  const keys: { key: string; legacyKey: string }[] = [];

  for (const section of flattenProgramSections(program)) {
    const sections = programSectionsForLocks(program);
    const lock = getSectionLockStatus(sections, section.id, {
      enrolled: options?.enrolled ?? true,
      enrolledAt: options?.enrolledAt
    });
    if (!lock.unlocked) continue;

    for (const book of section.bookLessons ?? []) {
      for (const topic of book.topics ?? []) {
        for (const part of topic.parts ?? []) {
          keys.push({
            key: itemKey(program.id, section.id, 'book', book.id, topic.id, part.id),
            legacyKey: legacyItemKey(program.id, 'book', book.id, topic.id, part.id)
          });
        }
      }
    }
    for (const mod of section.videoLessons ?? []) {
      for (const video of mod.videos ?? []) {
        keys.push({
          key: itemKey(program.id, section.id, 'video', mod.id, video.id),
          legacyKey: legacyItemKey(program.id, 'video', mod.id, video.id)
        });
      }
    }
    for (const mod of section.audioLessons ?? []) {
      for (const track of mod.tracks ?? []) {
        keys.push({
          key: itemKey(program.id, section.id, 'audio', mod.id, track.id),
          legacyKey: legacyItemKey(program.id, 'audio', mod.id, track.id)
        });
      }
    }
    for (const mod of section.imageLessons ?? []) {
      for (const img of mod.images ?? []) {
        keys.push({
          key: itemKey(program.id, section.id, 'image', mod.id, img.id),
          legacyKey: legacyItemKey(program.id, 'image', mod.id, img.id)
        });
      }
    }
    for (const mod of section.textLessons ?? []) {
      for (const part of mod.parts ?? []) {
        keys.push({
          key: itemKey(program.id, section.id, 'text', mod.id, part.id),
          legacyKey: legacyItemKey(program.id, 'text', mod.id, part.id)
        });
      }
    }
  }

  return keys;
}

/** Completed / total unlocked items for a program (Learn syncs from this). */
export function computeItemStats(
  program: AdminProgram,
  completedKeys: string[] | undefined,
  options?: {
    enrolled?: boolean;
    enrolledAt?: number;
  }
): ItemProgressStats {
  const completed = new Set(Array.isArray(completedKeys) ? completedKeys : []);
  const keys = collectUnlockedItemKeys(program, options);
  if (!keys.length) return { completed: 0, total: 0, percent: 0 };
  const done = keys.filter(({ key, legacyKey }) =>
    isItemComplete(completed, key, legacyKey)
  ).length;
  return {
    completed: done,
    total: keys.length,
    percent: Math.round((done / keys.length) * 100)
  };
}

export function computeProgress(
  program: AdminProgram,
  completedKeys: string[] | undefined,
  options?: {
    enrolled?: boolean;
    enrolledAt?: number;
  }
) {
  return computeItemStats(program, completedKeys, options).percent;
}

/** Aggregate Learn progress across enrolled programs (single source of truth). */
export function computeEnrolledLearningProgress(
  programs: AdminProgram[],
  completedKeys: string[] | undefined,
  options: {
    enrolledIds: string[];
    enrolledAt?: Record<string, number>;
  }
): ItemProgressStats {
  let completed = 0;
  let total = 0;
  const enrolledIds = Array.isArray(options.enrolledIds) ? options.enrolledIds : [];
  const enrolledAt = options.enrolledAt ?? {};

  for (const program of programs) {
    if (!enrolledIds.includes(program.id)) continue;
    const stats = computeItemStats(program, completedKeys, {
      enrolled: true,
      enrolledAt: enrolledAt[program.id]
    });
    completed += stats.completed;
    total += stats.total;
  }

  return {
    completed,
    total,
    percent: total ? Math.round((completed / total) * 100) : 0
  };
}

export type NextLearningStep = {
  programId: string;
  programTitle: string;
  sectionId: string;
  sectionTitle: string;
  itemLabel: string;
  href: string;
  progress: ItemProgressStats;
};

type UnlockedItemMeta = {
  key: string;
  legacyKey: string;
  sectionId: string;
  sectionTitle: string;
  itemLabel: string;
};

function collectUnlockedItemMeta(
  program: AdminProgram,
  options?: {
    enrolled?: boolean;
    enrolledAt?: number;
  }
): UnlockedItemMeta[] {
  const items: UnlockedItemMeta[] = [];

  for (const section of flattenProgramSections(program)) {
    const sections = programSectionsForLocks(program);
    const lock = getSectionLockStatus(sections, section.id, {
      enrolled: options?.enrolled ?? true,
      enrolledAt: options?.enrolledAt
    });
    if (!lock.unlocked) continue;
    const sectionTitle = section.title || 'Section';

    for (const book of section.bookLessons ?? []) {
      for (const topic of book.topics ?? []) {
        for (const part of topic.parts ?? []) {
          items.push({
            key: itemKey(program.id, section.id, 'book', book.id, topic.id, part.id),
            legacyKey: legacyItemKey(program.id, 'book', book.id, topic.id, part.id),
            sectionId: section.id,
            sectionTitle,
            itemLabel: part.label || topic.title || book.title || 'Book lesson'
          });
        }
      }
    }
    for (const mod of section.videoLessons ?? []) {
      for (const video of mod.videos ?? []) {
        items.push({
          key: itemKey(program.id, section.id, 'video', mod.id, video.id),
          legacyKey: legacyItemKey(program.id, 'video', mod.id, video.id),
          sectionId: section.id,
          sectionTitle,
          itemLabel: video.label || mod.title || 'Video lesson'
        });
      }
    }
    for (const mod of section.audioLessons ?? []) {
      for (const track of mod.tracks ?? []) {
        items.push({
          key: itemKey(program.id, section.id, 'audio', mod.id, track.id),
          legacyKey: legacyItemKey(program.id, 'audio', mod.id, track.id),
          sectionId: section.id,
          sectionTitle,
          itemLabel: track.label || mod.title || 'Audio lesson'
        });
      }
    }
    for (const mod of section.imageLessons ?? []) {
      for (const img of mod.images ?? []) {
        items.push({
          key: itemKey(program.id, section.id, 'image', mod.id, img.id),
          legacyKey: legacyItemKey(program.id, 'image', mod.id, img.id),
          sectionId: section.id,
          sectionTitle,
          itemLabel: img.label || mod.title || 'Image lesson'
        });
      }
    }
    for (const mod of section.textLessons ?? []) {
      for (const part of mod.parts ?? []) {
        items.push({
          key: itemKey(program.id, section.id, 'text', mod.id, part.id),
          legacyKey: legacyItemKey(program.id, 'text', mod.id, part.id),
          sectionId: section.id,
          sectionTitle,
          itemLabel: part.label || mod.title || 'Text lesson'
        });
      }
    }
  }

  return items;
}

/** First incomplete unlocked lesson across enrolled programs (continue / recommended). */
export function getNextLearningStep(
  programs: AdminProgram[],
  completedKeys: string[] | undefined,
  options: {
    enrolledIds: string[];
    enrolledAt?: Record<string, number>;
  }
): NextLearningStep | null {
  const completed = new Set(Array.isArray(completedKeys) ? completedKeys : []);
  const enrolledIds = Array.isArray(options.enrolledIds) ? options.enrolledIds : [];
  const enrolledAt = options.enrolledAt ?? {};

  for (const program of programs) {
    if (!enrolledIds.includes(program.id)) continue;
    const progress = computeItemStats(program, completedKeys, {
      enrolled: true,
      enrolledAt: enrolledAt[program.id]
    });
    const items = collectUnlockedItemMeta(program, {
      enrolled: true,
      enrolledAt: enrolledAt[program.id]
    });
    const next = items.find(
      (item) => !isItemComplete(completed, item.key, item.legacyKey)
    );
    if (!next) continue;
    return {
      programId: program.id,
      programTitle: program.title,
      sectionId: next.sectionId,
      sectionTitle: next.sectionTitle,
      itemLabel: next.itemLabel,
      href: `/programs/${program.id}/section/${next.sectionId}`,
      progress
    };
  }
  return null;
}
