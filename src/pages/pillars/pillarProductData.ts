import type { AbPillarId } from '../../utils/abPillars';

export type PillarProductDemo = {
  id: string;
  name: string;
  note: string;
};

const SHARED_FALLBACK: PillarProductDemo[] = [
  {
    id: 'support-tools',
    name: 'Pillar Support Tools',
    note: 'Resources that reinforce your daily practice in this pillar.'
  }
];

export const PILLAR_PRODUCTS_DEMO: Record<AbPillarId, PillarProductDemo[]> = {
  'authentic-body': [
    {
      id: 'jab-program',
      name: 'Juicing for Authentic Balance 1.0',
      note: 'Full Body program with books, videos, and tracking.'
    },
    {
      id: 'body-recipe-pack',
      name: 'Body Reset Recipe Pack',
      note: 'Simple juices and meals that support energy and recovery.'
    }
  ],
  'authentic-brain': [
    {
      id: 'brain-focus-guide',
      name: 'Clarity & Focus Guide',
      note: 'Mindset practices for calmer, clearer thinking.'
    },
    {
      id: 'brain-journal',
      name: 'Mental Reset Journal',
      note: 'Short daily prompts for awareness and focus.'
    }
  ],
  'authentically-becoming': [
    {
      id: 'becoming-identity',
      name: 'Becoming Identity Workbook',
      note: 'Reflect on who you are becoming over 90 days.'
    },
    {
      id: 'becoming-vision',
      name: 'Vision Mapping Kit',
      note: 'A gentle next-step map for purpose and growth.'
    }
  ],
  'authentic-behavior': [
    {
      id: 'behavior-habits',
      name: 'Habit Consistency Tracker',
      note: 'Build small, repeatable actions without overwhelm.'
    },
    {
      id: 'behavior-accountability',
      name: 'Accountability Starter Pack',
      note: 'Tools to stay consistent when motivation dips.'
    }
  ],
  'authentic-bonding': [
    {
      id: 'bonding-connection',
      name: 'Connection Conversation Cards',
      note: 'Prompts that deepen relationships and community.'
    },
    {
      id: 'bonding-family',
      name: 'Family Rhythm Guide',
      note: 'Simple practices for healthier bonding at home.'
    }
  ],
  'authentic-beauty': [
    {
      id: 'beauty-presence',
      name: 'Presence & Confidence Rituals',
      note: 'Daily practices for authentic self-expression.'
    },
    {
      id: 'beauty-care',
      name: 'Inner Beauty Care Guide',
      note: 'Confidence rooted in care, not performance.'
    }
  ],
  'authentic-business': [
    {
      id: 'business-systems',
      name: 'Authentic Business Systems',
      note: 'Foundations for entrepreneurs building with integrity.'
    },
    {
      id: 'business-consulting',
      name: 'Business Clarity Session',
      note: 'A guided next step toward consulting support.'
    }
  ]
};

export function productsForPillar(pillarId: AbPillarId): PillarProductDemo[] {
  return PILLAR_PRODUCTS_DEMO[pillarId] ?? SHARED_FALLBACK;
}
