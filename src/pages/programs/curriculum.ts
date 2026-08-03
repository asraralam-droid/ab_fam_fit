import type { ProgramSection } from '../../store/adminProgramsSlice';
import { itemKey, legacyItemKey } from '../../utils/programDisplay';
import {
  BookOpen,
  File,
  FileText,
  Headphones,
  ImageIcon,
  Play,
  type LucideIcon
} from 'lucide-react';

export type ProgramLessonTab = 'books' | 'video' | 'audio' | 'images' | 'text';

export type CurriculumRow = {
  id: string;
  title: string;
  meta: string;
  tab: ProgramLessonTab;
  completeKey: string;
  legacyKey: string;
  KindIcon: LucideIcon;
};

function sortedByOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

export function moduleDisplayTitle(mod: { order: number; title: string }): string {
  const orderLabel = Number.isFinite(mod.order) ? `${mod.order}.0` : String(mod.order);
  return `Module ${orderLabel} — ${mod.title}`;
}

export function sectionCurriculumHeading(sec: ProgramSection): string {
  return `SECTION ${sec.order}: ${sec.title.toUpperCase()}`;
}

/** Flat lesson list for a section (books → video → audio → images → text). */
export function buildSectionLessonRows(
  programId: string,
  section: ProgramSection
): CurriculumRow[] {
  const rows: CurriculumRow[] = [];

  for (const book of sortedByOrder(section.bookLessons ?? [])) {
    for (const topic of sortedByOrder(book.topics ?? [])) {
      for (const part of sortedByOrder(topic.parts ?? [])) {
        const completeKey = itemKey(
          programId,
          section.id,
          'book',
          book.id,
          topic.id,
          part.id
        );
        const legacyKey = legacyItemKey(programId, 'book', book.id, topic.id, part.id);
        const meta =
          part.pdfFileName && part.audioFileName
            ? 'PDF · AUDIO'
            : part.pdfFileName
              ? 'PDF'
              : part.audioFileName
                ? 'AUDIO'
                : 'BOOK';
        rows.push({
          id: completeKey,
          title: part.label,
          meta,
          tab: 'books',
          completeKey,
          legacyKey,
          KindIcon: part.pdfFileName ? File : BookOpen
        });
      }
    }
  }

  for (const mod of sortedByOrder(section.videoLessons ?? [])) {
    for (const video of sortedByOrder(mod.videos ?? [])) {
      const completeKey = itemKey(programId, section.id, 'video', mod.id, video.id);
      const legacyKey = legacyItemKey(programId, 'video', mod.id, video.id);
      rows.push({
        id: completeKey,
        title: video.label,
        meta: video.type === 'embed' ? 'VIDEO · EMBED' : 'VIDEO',
        tab: 'video',
        completeKey,
        legacyKey,
        KindIcon: Play
      });
    }
  }

  for (const mod of sortedByOrder(section.audioLessons ?? [])) {
    for (const track of sortedByOrder(mod.tracks ?? [])) {
      const completeKey = itemKey(programId, section.id, 'audio', mod.id, track.id);
      const legacyKey = legacyItemKey(programId, 'audio', mod.id, track.id);
      rows.push({
        id: completeKey,
        title: track.label,
        meta: 'AUDIO',
        tab: 'audio',
        completeKey,
        legacyKey,
        KindIcon: Headphones
      });
    }
  }

  for (const mod of sortedByOrder(section.imageLessons ?? [])) {
    for (const img of sortedByOrder(mod.images ?? [])) {
      const completeKey = itemKey(programId, section.id, 'image', mod.id, img.id);
      const legacyKey = legacyItemKey(programId, 'image', mod.id, img.id);
      rows.push({
        id: completeKey,
        title: img.label,
        meta: 'IMAGE',
        tab: 'images',
        completeKey,
        legacyKey,
        KindIcon: ImageIcon
      });
    }
  }

  for (const mod of sortedByOrder(section.textLessons ?? [])) {
    for (const part of sortedByOrder(mod.parts ?? [])) {
      const completeKey = itemKey(programId, section.id, 'text', mod.id, part.id);
      const legacyKey = legacyItemKey(programId, 'text', mod.id, part.id);
      rows.push({
        id: completeKey,
        title: part.label,
        meta: 'TEXT',
        tab: 'text',
        completeKey,
        legacyKey,
        KindIcon: FileText
      });
    }
  }

  return rows;
}
