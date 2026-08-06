import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BRAND_MEDIA } from '../utils/brandMedia';

/** PDF/audio items inside a book topic (ordered). */
export interface BookPartItem {
  id: string;
  label: string;
  order: number;
  pdfFileName?: string;
  pdfUrl?: string;
  audioFileName?: string;
  audioUrl?: string;
}

export interface BookTopicItem {
  id: string;
  title: string;
  description: string;
  order: number;
  parts: BookPartItem[];
}

export interface BookLessonModule {
  id: string;
  title: string;
  description: string;
  order: number;
  coverImageUrl?: string;
  topics: BookTopicItem[];
}

export interface VideoMediaItem {
  id: string;
  label: string;
  order: number;
  type: 'upload' | 'embed';
  fileName?: string;
  fileUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
}

/** @deprecated use VideoMediaItem */
export type VideoPlaylistItem = VideoMediaItem;

export interface VideoLessonModule {
  id: string;
  title: string;
  description: string;
  order: number;
  imageUrl?: string;
  videos: VideoMediaItem[];
}

export interface AudioTrackItem {
  id: string;
  label: string;
  order: number;
  fileName?: string;
  fileUrl?: string;
}

export interface AudioLessonModule {
  id: string;
  title: string;
  description: string;
  order: number;
  imageUrl?: string;
  tracks: AudioTrackItem[];
}

export interface TextPartItem {
  id: string;
  label: string;
  order: number;
  content: string;
  imageUrl?: string;
}

export interface TextLessonModule {
  id: string;
  title: string;
  description: string;
  order: number;
  imageUrl?: string;
  parts: TextPartItem[];
}

export interface ImageMediaItem {
  id: string;
  label: string;
  order: number;
  fileName?: string;
  imageUrl?: string;
  caption?: string;
}

export interface ImageLessonModule {
  id: string;
  title: string;
  description: string;
  order: number;
  coverImageUrl?: string;
  images: ImageMediaItem[];
}

export interface ProgramSection {
  id: string;
  title: string;
  description: string;
  order: number;
  imageUrl?: string;
  /** Days locked: first program section = after start; later = after previous section unlocks. */
  lockDays?: number;
  /** When lock days were last set in admin — member countdown starts from this date. */
  lockDaysUpdatedAt?: number;
  bookLessons: BookLessonModule[];
  videoLessons: VideoLessonModule[];
  audioLessons: AudioLessonModule[];
  imageLessons: ImageLessonModule[];
  textLessons: TextLessonModule[];
}

/** Top-level curriculum module; contains ordered sections. */
export interface ProgramModule {
  id: string;
  title: string;
  description: string;
  order: number;
  imageUrl?: string;
  /**
   * Days after program payment/start before this module unlocks.
   * 0 = Module 1.0 (Days 1–28), 28 = Module 2.0, 90 = Module 3.0, 120 = Module 4.0.
   */
  unlockAfterDays?: number;
  /** Member-facing window label, e.g. "Days 1–28". */
  timeWindow?: string;
  sections: ProgramSection[];
}

export interface AdminProgram {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  active: boolean;
  coverImageUrl?: string;
  /** Brand pillar this program belongs under (Pillar → Program → …). */
  pillarId?: string;
  /** One-time program price (USD). Pay once — not per module. */
  priceUsd?: number;
  modules: ProgramModule[];
}

export function sortedProgramModules(program: AdminProgram): ProgramModule[] {
  return [...(program.modules ?? [])].sort((a, b) => a.order - b.order);
}

export function flattenProgramSections(program: AdminProgram): ProgramSection[] {
  return sortedProgramModules(program).flatMap((mod) =>
    [...(mod.sections ?? [])].sort((a, b) => a.order - b.order)
  );
}

export function findProgramSection(
  program: AdminProgram,
  sectionId: string
): ProgramSection | undefined {
  for (const mod of program.modules ?? []) {
    const sec = mod.sections?.find((s) => s.id === sectionId);
    if (sec) return sec;
  }
  return undefined;
}

export function findProgramModuleForSection(
  program: AdminProgram,
  sectionId: string
): ProgramModule | undefined {
  return (program.modules ?? []).find((mod) =>
    mod.sections?.some((s) => s.id === sectionId)
  );
}

interface AdminProgramsState {
  programs: AdminProgram[];
}

const JAB_COVER = BRAND_MEDIA.greenJuice;
/** Foundations / mindset modules — calm ritual, not plated food. */
const SECTION_IMG = BRAND_MEDIA.journalCalm;
const MODULE2_IMG = BRAND_MEDIA.welcomeLifestyle;
const MODULE3_IMG = BRAND_MEDIA.yogaCalm;
const MODULE4_IMG = BRAND_MEDIA.familyWellness;

const jabSectionContent: Omit<ProgramSection, 'id' | 'title' | 'description' | 'order'> = {
  imageUrl: SECTION_IMG,
  bookLessons: [
    {
      id: 'bl1',
      title: 'Book 1: Authentic Foundation',
      description: 'Building Your Authentic Balance — mindset before meals.',
      order: 1,
      coverImageUrl: BRAND_MEDIA.bookStudy,
      topics: [
        {
          id: 'bt1',
          title: 'Introduction',
          description: 'Overview and getting started.',
          order: 1,
          parts: [
            {
              id: 'bp1',
              label: 'Intro PDF & audio',
              order: 1,
              pdfFileName: 'jab-book-1-intro.pdf',
              audioFileName: 'jab-book-1-intro.mp3'
            }
          ]
        },
        {
          id: 'bt2',
          title: 'Chapter 1 — Core Principles',
          description: 'Foundational concepts.',
          order: 2,
          parts: [
            {
              id: 'bp2',
              label: 'Chapter 1 PDF & audio',
              order: 1,
              pdfFileName: 'jab-book-1-ch1.pdf',
              audioFileName: 'jab-book-1-ch1.mp3'
            }
          ]
        }
      ]
    },
    {
      id: 'bl2',
      title: 'Book 2: The Practice',
      description: 'Daily rituals and routines.',
      order: 2,
      coverImageUrl: BRAND_MEDIA.greenJuice,
      topics: [
        {
          id: 'bt3',
          title: 'Full book',
          description: '',
          order: 1,
          parts: [
            {
              id: 'bp3',
              label: 'Full book PDF',
              order: 1,
              pdfFileName: 'jab-book-2.pdf'
            }
          ]
        }
      ]
    }
  ],
  videoLessons: [
    {
      id: 'vl1',
      title: 'Program overview',
      description: 'Welcome videos for new members.',
      order: 1,
      videos: [
        {
          id: 'vp1',
          label: 'Welcome message',
          order: 1,
          type: 'embed',
          embedUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ'
        }
      ]
    }
  ],
  audioLessons: [
    {
      id: 'al1',
      title: 'Guided listen-along',
      description: 'Audio companion for Book 1.',
      order: 1,
      tracks: [
        { id: 'at1', label: 'Introduction', order: 1, fileName: 'jab-intro.mp3' }
      ]
    }
  ],
  imageLessons: [
    {
      id: 'il1',
      title: 'Visual guides',
      description: 'Reference photos and infographics.',
      order: 1,
      coverImageUrl:
        'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=200&q=80',
      images: [
        {
          id: 'im1',
          label: 'Juicing setup',
          order: 1,
          fileName: 'juicing-setup.jpg',
          imageUrl:
            'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=400&q=80',
          caption: 'Recommended juicer placement and prep area.'
        }
      ]
    }
  ],
  textLessons: [
    {
      id: 'tl1',
      title: 'Getting started',
      description: 'Read before your first topic.',
      order: 1,
      parts: [
        {
          id: 'tp1',
          label: 'Quick start guide',
          order: 1,
          content: 'Welcome to JAB! Complete topics in order and check in weekly.'
        }
      ]
    }
  ]
};

const initialState: AdminProgramsState = {
  programs: [
    {
      id: 'prog-jab',
      title: 'Juicing for Authentic Balance (JAB Series)',
      subtitle: 'By Misty Angelique',
      description:
        'A comprehensive program teaching the Authentic Balance juicing methodology.',
      active: true,
      coverImageUrl: JAB_COVER,
      pillarId: 'authentic-body',
      priceUsd: 197,
      modules: [
        {
          id: 'mod-jab-1',
          title: 'Authentic Foundation',
          description: 'Module 1.0 — Days 1–28. Mindset & juicing foundations (unlocks on payment).',
          order: 1,
          unlockAfterDays: 0,
          timeWindow: 'Days 1–28',
          imageUrl: SECTION_IMG,
          sections: [
            {
              id: 'sec-jab-1',
              title: 'Mindset setup',
              description: 'Core books, welcome videos, and getting started guides.',
              order: 1,
              lockDays: 0,
              imageUrl: SECTION_IMG,
              ...jabSectionContent
            }
          ]
        },
        {
          id: 'mod-jab-2',
          title: 'Implementation',
          description: 'Module 2.0 — Days 29–56. Unlocks after the first 28 days.',
          order: 2,
          unlockAfterDays: 28,
          timeWindow: 'Days 29–56',
          imageUrl: MODULE2_IMG,
          sections: [
            {
              id: 'sec-jab-2',
              title: 'Daily rituals',
              description: 'Build habits through the second 28-day window.',
              order: 1,
              lockDays: 0,
              imageUrl: MODULE2_IMG,
              bookLessons: [],
              videoLessons: [],
              audioLessons: [],
              imageLessons: [],
              textLessons: [
                {
                  id: 'tl-jab-2',
                  title: 'Daily rituals intro',
                  description: 'Opens with Module 2.0',
                  order: 1,
                  parts: [
                    {
                      id: 'tp-jab-2',
                      label: 'Welcome to Module 2.0',
                      order: 1,
                      content:
                        'Module 2.0 unlocks automatically after 28 days from program payment — no extra charge.'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'mod-jab-3',
          title: 'Integration',
          description: 'Module 3.0 — Day 90+. Unlocks after the Day 90 milestone.',
          order: 3,
          unlockAfterDays: 90,
          timeWindow: 'Day 90+',
          imageUrl: MODULE3_IMG,
          sections: [
            {
              id: 'sec-jab-3',
              title: '90-day checkpoint',
              description: 'Integrate foundations into lasting practice.',
              order: 1,
              lockDays: 0,
              imageUrl: MODULE3_IMG,
              bookLessons: [],
              videoLessons: [],
              audioLessons: [],
              imageLessons: [],
              textLessons: [
                {
                  id: 'tl-jab-3',
                  title: 'Day 90 checkpoint',
                  description: '',
                  order: 1,
                  parts: [
                    {
                      id: 'tp-jab-3',
                      label: 'Welcome to Module 3.0',
                      order: 1,
                      content:
                        'Module 3.0 opens at the Day 90 milestone. Stay consistent through Modules 1 and 2.'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'mod-jab-4',
          title: 'Mastery',
          description: 'Module 4.0 — Day 120+. Unlocks after completing prior stages.',
          order: 4,
          unlockAfterDays: 120,
          timeWindow: 'Day 120+',
          imageUrl: MODULE4_IMG,
          sections: [
            {
              id: 'sec-jab-4',
              title: 'Sustain & lead',
              description: 'Lock in mastery and lead your household forward.',
              order: 1,
              lockDays: 0,
              imageUrl: MODULE4_IMG,
              bookLessons: [],
              videoLessons: [],
              audioLessons: [],
              imageLessons: [],
              textLessons: [
                {
                  id: 'tl-jab-4',
                  title: 'Day 120 mastery',
                  description: '',
                  order: 1,
                  parts: [
                    {
                      id: 'tp-jab-4',
                      label: 'Welcome to Module 4.0',
                      order: 1,
                      content:
                        'Module 4.0 unlocks at Day 120 after prior modules. Full program was paid up front.'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'prog-test',
      title: 'AB Fam Fit Foundations',
      subtitle: 'By Misty Angelique',
      description:
        'Family-fit program under Authentic Body. Demo for program-level checkout (pay once — not per module).',
      active: true,
      coverImageUrl: BRAND_MEDIA.familyWellness,
      pillarId: 'authentic-body',
      priceUsd: 97,
      modules: [
        {
          id: 'mod-fam-1',
          title: 'Family Kickoff',
          description: 'Shared habits for the household.',
          order: 1,
          sections: [
            {
              id: 'sec-fam-1',
              title: 'Week 1 together',
              description: 'Start your family rhythm.',
              order: 1,
              lockDays: 0,
              bookLessons: [],
              videoLessons: [],
              audioLessons: [],
              imageLessons: [],
              textLessons: [
                {
                  id: 'tl-fam-1',
                  title: 'Family kickoff note',
                  description: 'Read together.',
                  order: 1,
                  parts: [
                    {
                      id: 'tp-fam-1',
                      label: 'Welcome',
                      order: 1,
                      content:
                        'Welcome to AB Fam Fit. This program is unlocked with one program payment — modules are not sold separately.'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

type SectionLessonPayload<T> = {
  programId: string;
  sectionId: string;
  lesson: T;
};

function migrateBookTopic(raw: Record<string, unknown>, fallbackIdx: number): BookTopicItem {
  const parts = Array.isArray(raw.parts)
    ? (raw.parts as BookPartItem[]).map((p, i) => ({
        ...p,
        order: p.order ?? i + 1
      }))
    : [];
  return {
    id: String(raw.id ?? `bt-mig-${fallbackIdx}`),
    title: String(raw.title ?? 'Topic'),
    description: String(raw.description ?? ''),
    order: Number(raw.order) || fallbackIdx,
    parts
  };
}

function migrateBookLesson(raw: Record<string, unknown>): BookLessonModule {
  if (Array.isArray(raw.topics) && raw.topics.length) {
    return {
      id: String(raw.id),
      title: String(raw.title ?? ''),
      description: String(raw.description ?? ''),
      order: Number(raw.order) || 1,
      coverImageUrl: raw.coverImageUrl as string | undefined,
      topics: (raw.topics as Record<string, unknown>[]).map((t, i) =>
        migrateBookTopic(t, i + 1)
      )
    };
  }
  if (Array.isArray(raw.parts) && raw.parts.length) {
    return {
      id: String(raw.id),
      title: String(raw.title ?? ''),
      description: String(raw.description ?? ''),
      order: Number(raw.order) || 1,
      topics: [
        migrateBookTopic(
          {
            id: `bt-mig-${raw.id}`,
            title: 'Main content',
            description: '',
            order: 1,
            parts: raw.parts
          },
          1
        )
      ]
    };
  }
  return {
    id: String(raw.id),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    order: Number(raw.order) || 1,
    topics: []
  };
}

function migrateVideoLesson(raw: Record<string, unknown>): VideoLessonModule {
  const videos = Array.isArray(raw.videos)
    ? (raw.videos as VideoMediaItem[])
    : Array.isArray(raw.playlist)
      ? (raw.playlist as VideoMediaItem[]).map((v, i) => ({
          id: String(v.id ?? `vm-${i}`),
          label: String(v.label ?? 'Video'),
          order: Number(v.order) || i + 1,
          type: v.type === 'embed' ? ('embed' as const) : ('upload' as const),
          fileName: v.fileName,
          fileUrl: v.fileUrl,
          embedUrl: v.embedUrl,
          thumbnailUrl: v.thumbnailUrl
        }))
      : [];
  return {
    id: String(raw.id),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    order: Number(raw.order) || 1,
    imageUrl: raw.imageUrl as string | undefined,
    videos
  };
}

function migrateAudioLesson(raw: Record<string, unknown>): AudioLessonModule {
  if (Array.isArray(raw.tracks) && raw.tracks.length) {
    return {
      id: String(raw.id),
      title: String(raw.title ?? ''),
      description: String(raw.description ?? ''),
      order: Number(raw.order) || 1,
      imageUrl: raw.imageUrl as string | undefined,
      tracks: raw.tracks as AudioTrackItem[]
    };
  }
  const tracks: AudioTrackItem[] = [];
  if (raw.audioFileName || raw.fileName) {
    tracks.push({
      id: `at-mig-${raw.id}`,
      label: String(raw.title ?? 'Track 1'),
      order: 1,
      fileName: String(raw.audioFileName ?? raw.fileName ?? ''),
      fileUrl: raw.audioUrl as string | undefined
    });
  }
  return {
    id: String(raw.id),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    order: Number(raw.order) || 1,
    tracks
  };
}

function migrateTextLesson(raw: Record<string, unknown>): TextLessonModule {
  if (Array.isArray(raw.parts) && raw.parts.length) {
    return {
      id: String(raw.id),
      title: String(raw.title ?? ''),
      description: String(raw.description ?? ''),
      order: Number(raw.order) || 1,
      imageUrl: raw.imageUrl as string | undefined,
      parts: raw.parts as TextPartItem[]
    };
  }
  return {
    id: String(raw.id),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    order: Number(raw.order) || 1,
    parts: [
      {
        id: `tp-mig-${raw.id}`,
        label: String(raw.title ?? 'Section 1'),
        order: 1,
        content: String(raw.content ?? '')
      }
    ]
  };
}

function migrateImageLesson(raw: Record<string, unknown>): ImageLessonModule {
  const images = Array.isArray(raw.images)
    ? (raw.images as ImageMediaItem[]).map((img, i) => ({
        ...img,
        order: img.order ?? i + 1
      }))
    : [];
  return {
    id: String(raw.id),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    order: Number(raw.order) || 1,
    coverImageUrl: (raw.coverImageUrl ?? raw.imageUrl) as string | undefined,
    images
  };
}

function ensureSectionArrays(section: ProgramSection): ProgramSection {
  return {
    ...section,
    bookLessons: (section.bookLessons ?? []).map((b) => {
      const legacy = b as BookLessonModule & { parts?: BookPartItem[] };
      const topics =
        legacy.topics ??
        (legacy.parts?.length
          ? [
              {
                id: `bt-legacy-${legacy.id}`,
                title: 'Main content',
                description: '',
                order: 1,
                parts: legacy.parts
              }
            ]
          : []);
      return {
        ...legacy,
        topics: topics.map((t) => ({ ...t, parts: t.parts ?? [] }))
      };
    }),
    videoLessons: (section.videoLessons ?? []).map((v) => ({
      ...v,
      videos: v.videos ?? []
    })),
    audioLessons: (section.audioLessons ?? []).map((a) => ({
      ...a,
      tracks: a.tracks ?? []
    })),
    imageLessons: (section.imageLessons ?? []).map((img) => ({
      ...img,
      images: img.images ?? []
    })),
    textLessons: (section.textLessons ?? []).map((t) => ({
      ...t,
      parts: t.parts ?? []
    }))
  };
}

function migrateSection(raw: Record<string, unknown>, programId: string): ProgramSection {
  if (Array.isArray(raw.sections) && raw.sections === undefined) {
    // noop - handled below
  }
  const fromSection = raw.id
    ? {
        id: String(raw.id),
        title: String(raw.title ?? 'Section'),
        description: String(raw.description ?? ''),
        order: Number(raw.order) || 1,
        imageUrl: raw.imageUrl as string | undefined,
        lockDays:
          raw.lockDays !== undefined && raw.lockDays !== null
            ? Math.max(0, Number(raw.lockDays) || 0)
            : undefined,
        lockDaysUpdatedAt:
          raw.lockDaysUpdatedAt !== undefined && raw.lockDaysUpdatedAt !== null
            ? Number(raw.lockDaysUpdatedAt) || undefined
            : undefined,
        bookLessons: Array.isArray(raw.bookLessons)
          ? (raw.bookLessons as Record<string, unknown>[]).map(migrateBookLesson)
          : [],
        videoLessons: Array.isArray(raw.videoLessons)
          ? (raw.videoLessons as Record<string, unknown>[]).map(migrateVideoLesson)
          : [],
        audioLessons: Array.isArray(raw.audioLessons)
          ? (raw.audioLessons as Record<string, unknown>[]).map(migrateAudioLesson)
          : [],
        imageLessons: Array.isArray(raw.imageLessons)
          ? (raw.imageLessons as Record<string, unknown>[]).map(migrateImageLesson)
          : [],
        textLessons: Array.isArray(raw.textLessons)
          ? (raw.textLessons as Record<string, unknown>[]).map(migrateTextLesson)
          : []
      }
    : null;

  if (fromSection) return ensureSectionArrays(fromSection);

  return ensureSectionArrays({
    id: `sec-mig-${programId}`,
    title: 'Main section',
    description: 'All program content',
    order: 1,
    bookLessons: Array.isArray(raw.bookLessons)
      ? (raw.bookLessons as Record<string, unknown>[]).map(migrateBookLesson)
      : [],
    videoLessons: Array.isArray(raw.videoLessons)
      ? (raw.videoLessons as Record<string, unknown>[]).map(migrateVideoLesson)
      : [],
    audioLessons: Array.isArray(raw.audioLessons)
      ? (raw.audioLessons as Record<string, unknown>[]).map(migrateAudioLesson)
      : [],
    imageLessons: Array.isArray(raw.imageLessons)
      ? (raw.imageLessons as Record<string, unknown>[]).map(migrateImageLesson)
      : [],
    textLessons: Array.isArray(raw.textLessons)
      ? (raw.textLessons as Record<string, unknown>[]).map(migrateTextLesson)
      : []
  });
}

function ensureModuleArrays(mod: ProgramModule): ProgramModule {
  return {
    ...mod,
    sections: (mod.sections ?? []).map(ensureSectionArrays)
  };
}

/** Legacy localStorage may still have flat lesson arrays on the program. */
export function normalizeAdminProgram(raw: Record<string, unknown>): AdminProgram {
  const id = String(raw.id ?? `prog-${Date.now()}`);

  let modules: ProgramModule[];

  if (Array.isArray(raw.modules) && raw.modules.length) {
    modules = (raw.modules as Record<string, unknown>[]).map((m, mi) => {
      const order = Number(m.order) || mi + 1;
      const unlockRaw = m.unlockAfterDays;
      const unlockAfterDays =
        unlockRaw !== undefined && unlockRaw !== null
          ? Math.max(0, Number(unlockRaw) || 0)
          : order === 1
            ? 0
            : order === 2
              ? 28
              : order === 3
                ? 90
                : order === 4
                  ? 120
                  : (order - 1) * 28;
      return ensureModuleArrays({
        id: String(m.id ?? `mod-${id}-${mi + 1}`),
        title: String(m.title ?? `Module ${mi + 1}`),
        description: String(m.description ?? ''),
        order,
        imageUrl: m.imageUrl as string | undefined,
        unlockAfterDays,
        timeWindow:
          typeof m.timeWindow === 'string' && m.timeWindow.trim()
            ? m.timeWindow.trim()
            : order === 1
              ? 'Days 1–28'
              : order === 2
                ? 'Days 29–56'
                : order === 3
                  ? 'Day 90+'
                  : order === 4
                    ? 'Day 120+'
                    : undefined,
        sections: Array.isArray(m.sections)
          ? (m.sections as Record<string, unknown>[]).map((s, si) =>
              ensureSectionArrays(
                migrateSection({ ...s, order: s.order ?? si + 1 }, id)
              )
            )
          : []
      });
    });
  } else {
    let sections: ProgramSection[];
    if (Array.isArray(raw.sections) && raw.sections.length) {
      sections = (raw.sections as Record<string, unknown>[]).map((s, i) =>
        ensureSectionArrays(
          migrateSection({ ...s, order: s.order ?? i + 1 }, id)
        )
      );
    } else {
      sections = [migrateSection(raw, id)];
    }
    modules = [
      ensureModuleArrays({
        id: `mod-${id}-1`,
        title: 'Module 1',
        description: '',
        order: 1,
        sections
      })
    ];
  }

  const pillarId =
    typeof raw.pillarId === 'string' && raw.pillarId.trim()
      ? raw.pillarId.trim()
      : id === 'prog-jab'
        ? 'authentic-body'
        : undefined;

  const priceRaw = raw.priceUsd;
  const priceUsd =
    typeof priceRaw === 'number' && Number.isFinite(priceRaw)
      ? priceRaw
      : id === 'prog-jab'
        ? 197
        : undefined;

  return {
    id,
    title: String(raw.title ?? ''),
    subtitle: String(raw.subtitle ?? ''),
    description: String(raw.description ?? ''),
    active: raw.active !== false,
    coverImageUrl: raw.coverImageUrl as string | undefined,
    pillarId,
    priceUsd,
    modules
  };
}

function findProgram(state: AdminProgramsState, programId: string) {
  const idx = state.programs.findIndex((p) => p.id === programId);
  if (idx < 0) return undefined;
  const normalized = ensureProgramArrays(
    normalizeAdminProgram(state.programs[idx] as unknown as Record<string, unknown>)
  );
  state.programs[idx] = normalized;
  return state.programs[idx];
}

function findSection(state: AdminProgramsState, programId: string, sectionId: string) {
  const program = findProgram(state, programId);
  if (!program) return undefined;
  return findProgramSection(program, sectionId);
}

function findModule(state: AdminProgramsState, programId: string, moduleId: string) {
  const program = findProgram(state, programId);
  if (!program) return undefined;
  return program.modules.find((m) => m.id === moduleId);
}

function ensureProgramArrays(program: AdminProgram): AdminProgram {
  return {
    ...program,
    modules: (program.modules ?? []).map(ensureModuleArrays)
  };
}

/** One-time anchor for sections that have lockDays but no saved countdown start. */
function applySectionLockAnchors(program: AdminProgram): AdminProgram {
  return {
    ...program,
    modules: program.modules.map((mod) => ({
      ...mod,
      sections: mod.sections.map((s) => {
        const lockDays = s.lockDays ?? 0;
        if (lockDays > 0 && !s.lockDaysUpdatedAt) {
          return { ...s, lockDaysUpdatedAt: Date.now() };
        }
        return s;
      })
    }))
  };
}

export const adminProgramsSlice = createSlice({
  name: 'adminPrograms',
  initialState,
  reducers: {
    addProgram: (state, action: PayloadAction<AdminProgram>) => {
      state.programs.push(ensureProgramArrays(action.payload));
    },
    updateProgram: (state, action: PayloadAction<AdminProgram>) => {
      const idx = state.programs.findIndex((p) => p.id === action.payload.id);
      if (idx >= 0) state.programs[idx] = ensureProgramArrays(action.payload);
    },
    deleteProgram: (state, action: PayloadAction<string>) => {
      state.programs = state.programs.filter((p) => p.id !== action.payload);
    },
    addModule: (
      state,
      action: PayloadAction<{ programId: string; module: ProgramModule }>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (program) program.modules.push(ensureModuleArrays(action.payload.module));
    },
    updateModule: (
      state,
      action: PayloadAction<{ programId: string; module: ProgramModule }>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (!program) return;
      const idx = program.modules.findIndex((m) => m.id === action.payload.module.id);
      if (idx >= 0) program.modules[idx] = ensureModuleArrays(action.payload.module);
    },
    deleteModule: (
      state,
      action: PayloadAction<{ programId: string; moduleId: string }>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (!program) return;
      program.modules = program.modules.filter((m) => m.id !== action.payload.moduleId);
    },
    addSection: (
      state,
      action: PayloadAction<{ programId: string; moduleId: string; section: ProgramSection }>
    ) => {
      const mod = findModule(state, action.payload.programId, action.payload.moduleId);
      if (mod) mod.sections.push(ensureSectionArrays(action.payload.section));
    },
    updateSection: (
      state,
      action: PayloadAction<{ programId: string; section: ProgramSection }>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (!program) return;
      for (const mod of program.modules) {
        const idx = mod.sections.findIndex((s) => s.id === action.payload.section.id);
        if (idx >= 0) {
          mod.sections[idx] = ensureSectionArrays(action.payload.section);
          return;
        }
      }
    },
    deleteSection: (
      state,
      action: PayloadAction<{ programId: string; sectionId: string }>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (!program) return;
      for (const mod of program.modules) {
        mod.sections = mod.sections.filter((s) => s.id !== action.payload.sectionId);
      }
    },
    addBookLesson: (state, action: PayloadAction<SectionLessonPayload<BookLessonModule>>) => {
      const section = findSection(
        state,
        action.payload.programId,
        action.payload.sectionId
      );
      if (section) section.bookLessons.push(action.payload.lesson);
    },
    updateBookLesson: (state, action: PayloadAction<SectionLessonPayload<BookLessonModule>>) => {
      const section = findSection(
        state,
        action.payload.programId,
        action.payload.sectionId
      );
      if (!section) return;
      const idx = section.bookLessons.findIndex((l) => l.id === action.payload.lesson.id);
      if (idx >= 0) section.bookLessons[idx] = action.payload.lesson;
    },
    deleteBookLesson: (
      state,
      action: PayloadAction<{ programId: string; sectionId: string; lessonId: string }>
    ) => {
      const section = findSection(
        state,
        action.payload.programId,
        action.payload.sectionId
      );
      if (!section) return;
      section.bookLessons = section.bookLessons.filter(
        (l) => l.id !== action.payload.lessonId
      );
    },
    addVideoLesson: (state, action: PayloadAction<SectionLessonPayload<VideoLessonModule>>) => {
      const section = findSection(
        state,
        action.payload.programId,
        action.payload.sectionId
      );
      if (section) section.videoLessons.push(action.payload.lesson);
    },
    updateVideoLesson: (state, action: PayloadAction<SectionLessonPayload<VideoLessonModule>>) => {
      const section = findSection(
        state,
        action.payload.programId,
        action.payload.sectionId
      );
      if (!section) return;
      const idx = section.videoLessons.findIndex((l) => l.id === action.payload.lesson.id);
      if (idx >= 0) section.videoLessons[idx] = action.payload.lesson;
    },
    deleteVideoLesson: (
      state,
      action: PayloadAction<{ programId: string; sectionId: string; lessonId: string }>
    ) => {
      const section = findSection(
        state,
        action.payload.programId,
        action.payload.sectionId
      );
      if (!section) return;
      section.videoLessons = section.videoLessons.filter(
        (l) => l.id !== action.payload.lessonId
      );
    },
    addAudioLesson: (state, action: PayloadAction<SectionLessonPayload<AudioLessonModule>>) => {
      const section = findSection(
        state,
        action.payload.programId,
        action.payload.sectionId
      );
      if (section) section.audioLessons.push(action.payload.lesson);
    },
    updateAudioLesson: (state, action: PayloadAction<SectionLessonPayload<AudioLessonModule>>) => {
      const section = findSection(
        state,
        action.payload.programId,
        action.payload.sectionId
      );
      if (!section) return;
      const idx = section.audioLessons.findIndex((l) => l.id === action.payload.lesson.id);
      if (idx >= 0) section.audioLessons[idx] = action.payload.lesson;
    },
    deleteAudioLesson: (
      state,
      action: PayloadAction<{ programId: string; sectionId: string; lessonId: string }>
    ) => {
      const section = findSection(
        state,
        action.payload.programId,
        action.payload.sectionId
      );
      if (!section) return;
      section.audioLessons = section.audioLessons.filter(
        (l) => l.id !== action.payload.lessonId
      );
    },
    addImageLesson: (state, action: PayloadAction<SectionLessonPayload<ImageLessonModule>>) => {
      const section = findSection(
        state,
        action.payload.programId,
        action.payload.sectionId
      );
      if (section) section.imageLessons.push(action.payload.lesson);
    },
    updateImageLesson: (state, action: PayloadAction<SectionLessonPayload<ImageLessonModule>>) => {
      const section = findSection(
        state,
        action.payload.programId,
        action.payload.sectionId
      );
      if (!section) return;
      const idx = section.imageLessons.findIndex((l) => l.id === action.payload.lesson.id);
      if (idx >= 0) section.imageLessons[idx] = action.payload.lesson;
    },
    deleteImageLesson: (
      state,
      action: PayloadAction<{ programId: string; sectionId: string; lessonId: string }>
    ) => {
      const section = findSection(
        state,
        action.payload.programId,
        action.payload.sectionId
      );
      if (!section) return;
      section.imageLessons = section.imageLessons.filter(
        (l) => l.id !== action.payload.lessonId
      );
    },
    addTextLesson: (state, action: PayloadAction<SectionLessonPayload<TextLessonModule>>) => {
      const section = findSection(
        state,
        action.payload.programId,
        action.payload.sectionId
      );
      if (section) section.textLessons.push(action.payload.lesson);
    },
    updateTextLesson: (state, action: PayloadAction<SectionLessonPayload<TextLessonModule>>) => {
      const section = findSection(
        state,
        action.payload.programId,
        action.payload.sectionId
      );
      if (!section) return;
      const idx = section.textLessons.findIndex((l) => l.id === action.payload.lesson.id);
      if (idx >= 0) section.textLessons[idx] = action.payload.lesson;
    },
    deleteTextLesson: (
      state,
      action: PayloadAction<{ programId: string; sectionId: string; lessonId: string }>
    ) => {
      const section = findSection(
        state,
        action.payload.programId,
        action.payload.sectionId
      );
      if (!section) return;
      section.textLessons = section.textLessons.filter(
        (l) => l.id !== action.payload.lessonId
      );
    },
    migratePrograms: (state) => {
      const seedJab = initialState.programs.find((p) => p.id === 'prog-jab');
      state.programs = state.programs.map((p) => {
        let normalized = applySectionLockAnchors(
          ensureProgramArrays(
            normalizeAdminProgram(p as unknown as Record<string, unknown>)
          )
        );
        // Demo: refresh JAB brand copy/covers + time-gated modules from seed.
        if (normalized.id === 'prog-jab' && seedJab) {
          normalized = {
            ...normalized,
            title: seedJab.title,
            subtitle: seedJab.subtitle,
            description: seedJab.description,
            coverImageUrl: seedJab.coverImageUrl,
            pillarId: seedJab.pillarId,
            priceUsd: seedJab.priceUsd,
            modules: seedJab.modules.map((seedMod) =>
              ensureModuleArrays({ ...seedMod })
            )
          };
        }
        const seedFam = initialState.programs.find((p) => p.id === 'prog-test');
        if (normalized.id === 'prog-test' && seedFam) {
          normalized = {
            ...normalized,
            coverImageUrl: seedFam.coverImageUrl ?? normalized.coverImageUrl,
            title: seedFam.title || normalized.title,
            priceUsd: seedFam.priceUsd ?? normalized.priceUsd
          };
        }
        return normalized;
      });
    }
  }
});
