import type { AdminProgram } from '../store/adminProgramsSlice';

const COVERS = [
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80'
];

export function programCover(programId: string): string {
  let hash = 0;
  for (let i = 0; i < programId.length; i++) {
    hash = (hash + programId.charCodeAt(i) * (i + 1)) % COVERS.length;
  }
  return COVERS[hash];
}

export function countProgramItems(program: AdminProgram) {
  const books = (program.bookLessons ?? []).reduce(
    (n, book) =>
      n + (book.topics ?? []).reduce((tn, t) => tn + (t.parts?.length ?? 0), 0),
    0
  );
  const videos = (program.videoLessons ?? []).reduce(
    (n, m) => n + (m.videos?.length ?? 0),
    0
  );
  const audio = (program.audioLessons ?? []).reduce(
    (n, m) => n + (m.tracks?.length ?? 0),
    0
  );
  const text = (program.textLessons ?? []).reduce(
    (n, m) => n + (m.parts?.length ?? 0),
    0
  );
  return { books, videos, audio, text, total: books + videos + audio + text };
}

export function countProgramModules(program: AdminProgram) {
  return {
    books: program.bookLessons?.length ?? 0,
    video: program.videoLessons?.length ?? 0,
    audio: program.audioLessons?.length ?? 0,
    text: program.textLessons?.length ?? 0
  };
}

export function programSummaryLabel(program: AdminProgram) {
  const mods = countProgramModules(program);
  const parts: string[] = [];
  if (mods.books) parts.push(`${mods.books} book${mods.books === 1 ? '' : 's'}`);
  if (mods.video) parts.push(`${mods.video} video`);
  if (mods.audio) parts.push(`${mods.audio} audio`);
  if (mods.text) parts.push(`${mods.text} text`);
  return parts.length ? parts.join(' · ') : 'No content yet';
}

export function itemKey(
  programId: string,
  kind: 'book' | 'video' | 'audio' | 'text',
  ...ids: string[]
) {
  return `${programId}:${kind}:${ids.join(':')}`;
}

export function computeProgress(
  program: AdminProgram,
  completedKeys: string[] | undefined
) {
  const completed = new Set(Array.isArray(completedKeys) ? completedKeys : []);
  const keys: string[] = [];

  for (const book of program.bookLessons ?? []) {
    for (const topic of book.topics ?? []) {
      for (const part of topic.parts ?? []) {
        keys.push(itemKey(program.id, 'book', book.id, topic.id, part.id));
      }
    }
  }
  for (const mod of program.videoLessons ?? []) {
    for (const video of mod.videos ?? []) {
      keys.push(itemKey(program.id, 'video', mod.id, video.id));
    }
  }
  for (const mod of program.audioLessons ?? []) {
    for (const track of mod.tracks ?? []) {
      keys.push(itemKey(program.id, 'audio', mod.id, track.id));
    }
  }
  for (const mod of program.textLessons ?? []) {
    for (const part of mod.parts ?? []) {
      keys.push(itemKey(program.id, 'text', mod.id, part.id));
    }
  }

  if (!keys.length) return 0;
  const done = keys.filter((k) => completed.has(k)).length;
  return Math.round((done / keys.length) * 100);
}
