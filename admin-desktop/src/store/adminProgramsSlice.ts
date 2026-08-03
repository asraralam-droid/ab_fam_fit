import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

/** A book in the program; contains multiple topics. */
export interface BookLessonModule {
  id: string;
  title: string;
  description: string;
  order: number;
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
}

/** @deprecated use VideoMediaItem */
export type VideoPlaylistItem = VideoMediaItem;

export interface VideoLessonModule {
  id: string;
  title: string;
  description: string;
  order: number;
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
  tracks: AudioTrackItem[];
}

export interface TextPartItem {
  id: string;
  label: string;
  order: number;
  content: string;
}

export interface TextLessonModule {
  id: string;
  title: string;
  description: string;
  order: number;
  parts: TextPartItem[];
}

export interface AdminProgram {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  active: boolean;
  bookLessons: BookLessonModule[];
  videoLessons: VideoLessonModule[];
  audioLessons: AudioLessonModule[];
  textLessons: TextLessonModule[];
}

interface AdminProgramsState {
  programs: AdminProgram[];
}

const jabBookLessons: BookLessonModule[] = [
  {
    id: 'bl1',
    title: 'Book 1: The Foundation',
    description: 'Building Your Authentic Balance.',
    order: 1,
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
];

const initialState: AdminProgramsState = {
  programs: [
    {
      id: 'prog-jab',
      title: 'Juicing for Authentic Balance (JAB Series)',
      subtitle: 'By Misty Angelique',
      description:
        'A comprehensive program teaching the Authentic Balance juicing methodology.',
      active: true,
      bookLessons: jabBookLessons,
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
              embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            },
            {
              id: 'vp2',
              label: 'How to use the app',
              order: 2,
              type: 'embed',
              embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
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
            {
              id: 'at1',
              label: 'Introduction',
              order: 1,
              fileName: 'jab-intro.mp3'
            },
            {
              id: 'at2',
              label: 'Chapter 1',
              order: 2,
              fileName: 'jab-ch1.mp3'
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
              content:
                'Welcome to JAB! Complete topics in order and check in weekly.'
            }
          ]
        }
      ]
    },
    {
      id: 'prog-test',
      title: 'Testing Program',
      subtitle: '',
      description: '',
      active: true,
      bookLessons: [],
      videoLessons: [],
      audioLessons: [],
      textLessons: []
    }
  ]
};

type ProgramLessonPayload<T> = { programId: string; lesson: T };

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
    ? (raw.videos as    [ ])
    : Array.isArray(raw.playlist)
      ? (raw.playlist as VideoMediaItem[]).map((v, i) => ({
          id: String(v.id ?? `vm-${i}`),
          label: String(v.label ?? 'Video'),
          order: Number(v.order) || i + 1,
          type: v.type === 'embed' ? 'embed' : 'upload',
          fileName: v.fileName,
          fileUrl: v.fileUrl,
          embedUrl: v.embedUrl
        }))
      : [];
  return {
    id: String(raw.id),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    order: Number(raw.order) || 1,
    videos: videos as VideoMediaItem[]
  };
}

function migrateAudioLesson(raw: Record<string, unknown>): AudioLessonModule {
  if (Array.isArray(raw.tracks) && raw.tracks.length) {
    return {
      id: String(raw.id),
      title: String(raw.title ?? ''),
      description: String(raw.description ?? ''),
      order: Number(raw.order) || 1,
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

/** Legacy localStorage may still have `books` or flat lesson modules. */
export function normalizeAdminProgram(raw: Record<string, unknown>): AdminProgram {
  const bookLessons = Array.isArray(raw.bookLessons)
    ? (raw.bookLessons as Record<string, unknown>[]).map(migrateBookLesson)
    : Array.isArray(raw.books)
      ? (raw.books as Array<Record<string, unknown>>).map((b, i) =>
          migrateBookLesson({
            ...b,
            order: b.order ?? i + 1
          })
        )
      : [];

  return {
    id: String(raw.id ?? `prog-${Date.now()}`),
    title: String(raw.title ?? ''),
    subtitle: String(raw.subtitle ?? ''),
    description: String(raw.description ?? ''),
    active: raw.active !== false,
    bookLessons,
    videoLessons: Array.isArray(raw.videoLessons)
      ? (raw.videoLessons as Record<string, unknown>[]).map(migrateVideoLesson)
      : [],
    audioLessons: Array.isArray(raw.audioLessons)
      ? (raw.audioLessons as Record<string, unknown>[]).map(migrateAudioLesson)
      : [],
    textLessons: Array.isArray(raw.textLessons)
      ? (raw.textLessons as Record<string, unknown>[]).map(migrateTextLesson)
      : []
  };
}

function findProgram(state: AdminProgramsState, programId: string) {
  const idx = state.programs.findIndex((p) => p.id === programId);
  if (idx < 0) return undefined;
  const normalized = ensureProgramArrays(
    normalizeAdminProgram(
      state.programs[idx] as unknown as Record<string, unknown>
    )
  );
  state.programs[idx] = normalized;
  return state.programs[idx];
}

function ensureProgramArrays(program: AdminProgram): AdminProgram {
  return {
    ...program,
    bookLessons: (program.bookLessons ?? []).map((b) => {
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
        topics: topics.map((t) => ({
          ...t,
          parts: t.parts ?? []
        }))
      };
    }),
    videoLessons: (program.videoLessons ?? []).map((v) => ({
      ...v,
      videos: v.videos ?? []
    })),
    audioLessons: (program.audioLessons ?? []).map((a) => ({
      ...a,
      tracks: a.tracks ?? []
    })),
    textLessons: (program.textLessons ?? []).map((t) => ({
      ...t,
      parts: t.parts ?? []
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
    addBookLesson: (
      state,
      action: PayloadAction<ProgramLessonPayload<BookLessonModule>>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (program) program.bookLessons.push(action.payload.lesson);
    },
    updateBookLesson: (
      state,
      action: PayloadAction<ProgramLessonPayload<BookLessonModule>>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (!program) return;
      const idx = program.bookLessons.findIndex(
        (l) => l.id === action.payload.lesson.id
      );
      if (idx >= 0) program.bookLessons[idx] = action.payload.lesson;
    },
    deleteBookLesson: (
      state,
      action: PayloadAction<{ programId: string; lessonId: string }>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (!program) return;
      program.bookLessons = program.bookLessons.filter(
        (l) => l.id !== action.payload.lessonId
      );
    },
    addVideoLesson: (
      state,
      action: PayloadAction<ProgramLessonPayload<VideoLessonModule>>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (program) program.videoLessons.push(action.payload.lesson);
    },
    updateVideoLesson: (
      state,
      action: PayloadAction<ProgramLessonPayload<VideoLessonModule>>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (!program) return;
      const idx = program.videoLessons.findIndex(
        (l) => l.id === action.payload.lesson.id
      );
      if (idx >= 0) program.videoLessons[idx] = action.payload.lesson;
    },
    deleteVideoLesson: (
      state,
      action: PayloadAction<{ programId: string; lessonId: string }>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (!program) return;
      program.videoLessons = program.videoLessons.filter(
        (l) => l.id !== action.payload.lessonId
      );
    },
    addAudioLesson: (
      state,
      action: PayloadAction<ProgramLessonPayload<AudioLessonModule>>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (program) program.audioLessons.push(action.payload.lesson);
    },
    updateAudioLesson: (
      state,
      action: PayloadAction<ProgramLessonPayload<AudioLessonModule>>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (!program) return;
      const idx = program.audioLessons.findIndex(
        (l) => l.id === action.payload.lesson.id
      );
      if (idx >= 0) program.audioLessons[idx] = action.payload.lesson;
    },
    deleteAudioLesson: (
      state,
      action: PayloadAction<{ programId: string; lessonId: string }>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (!program) return;
      program.audioLessons = program.audioLessons.filter(
        (l) => l.id !== action.payload.lessonId
      );
    },
    addTextLesson: (
      state,
      action: PayloadAction<ProgramLessonPayload<TextLessonModule>>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (program) program.textLessons.push(action.payload.lesson);
    },
    updateTextLesson: (
      state,
      action: PayloadAction<ProgramLessonPayload<TextLessonModule>>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (!program) return;
      const idx = program.textLessons.findIndex(
        (l) => l.id === action.payload.lesson.id
      );
      if (idx >= 0) program.textLessons[idx] = action.payload.lesson;
    },
    deleteTextLesson: (
      state,
      action: PayloadAction<{ programId: string; lessonId: string }>
    ) => {
      const program = findProgram(state, action.payload.programId);
      if (!program) return;
      program.textLessons = program.textLessons.filter(
        (l) => l.id !== action.payload.lessonId
      );
    },
    migratePrograms: (state) => {
      state.programs = state.programs.map((p) =>
        ensureProgramArrays(
          normalizeAdminProgram(p as unknown as Record<string, unknown>)
        )
      );
    }
  }
});
