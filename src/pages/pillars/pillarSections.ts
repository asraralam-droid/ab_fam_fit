import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  ClipboardList,
  FileText,
  Headphones,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Target,
  Trophy,
  Video
} from 'lucide-react';

/** V1 pillar flow — same section list for every Authentic pillar. */
export type PillarSectionId =
  | 'introduction'
  | 'check-in'
  | 'lessons'
  | 'videos'
  | 'podcast'
  | 'books'
  | 'worksheets'
  | 'challenges'
  | 'products'
  | 'bestie'
  | 'progress';

export type PillarSectionDef = {
  id: PillarSectionId;
  /** URL segment under /pillars/:pillarId/ */
  path: PillarSectionId;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Wired to a real screen vs placeholder until a later step. */
  status: 'ready' | 'placeholder';
};

export const PILLAR_SECTIONS: PillarSectionDef[] = [
  {
    id: 'introduction',
    path: 'introduction',
    label: 'Introduction',
    description: 'Where this pillar begins',
    icon: Sparkles,
    status: 'ready'
  },
  {
    id: 'check-in',
    path: 'check-in',
    label: 'Daily Check In',
    description: 'How are you showing up today?',
    icon: ClipboardList,
    status: 'ready'
  },
  {
    id: 'lessons',
    path: 'lessons',
    label: 'Lessons',
    description: 'Guided learning for this pillar',
    icon: BookOpen,
    status: 'ready'
  },
  {
    id: 'videos',
    path: 'videos',
    label: 'Videos',
    description: 'Watch and learn',
    icon: Video,
    status: 'ready'
  },
  {
    id: 'podcast',
    path: 'podcast',
    label: 'Podcast Episodes',
    description: 'Listen on the go',
    icon: Headphones,
    status: 'ready'
  },
  {
    id: 'books',
    path: 'books',
    label: 'Books',
    description: 'Read and grow',
    icon: BookOpen,
    status: 'ready'
  },
  {
    id: 'worksheets',
    path: 'worksheets',
    label: 'Worksheets',
    description: 'Practice and reflect',
    icon: FileText,
    status: 'ready'
  },
  {
    id: 'challenges',
    path: 'challenges',
    label: 'Challenges',
    description: 'Stay accountable',
    icon: Trophy,
    status: 'ready'
  },
  {
    id: 'products',
    path: 'products',
    label: 'Recommended Products',
    description: 'Tools that support this path',
    icon: ShoppingBag,
    status: 'ready'
  },
  {
    id: 'bestie',
    path: 'bestie',
    label: 'AI Coach',
    description: 'Ask Authentic Bestie',
    icon: MessageCircle,
    status: 'ready'
  },
  {
    id: 'progress',
    path: 'progress',
    label: 'Progress Tracker',
    description: 'See how far you’ve come',
    icon: Target,
    status: 'ready'
  }
];

export function pillarSectionByPath(
  path: string | undefined
): PillarSectionDef | undefined {
  if (!path) return undefined;
  return PILLAR_SECTIONS.find((s) => s.path === path);
}
