export type PodcastMediaType = 'audio' | 'video';

export type PodcastEpisode = {
  id: string;
  title: string;
  description: string;
  host: string;
  series: string;
  durationLabel: string;
  publishedLabel: string;
  type: PodcastMediaType;
  coverImage: string;
  /** Streamable audio URL (demo CDN). */
  audioUrl?: string;
  /** YouTube (or similar) embed URL for video episodes. */
  videoEmbedUrl?: string;
  tags: string[];
  /** Authentic Balance pillar this episode belongs under. */
  pillarId?: string;
};

/** Demo podcast catalog — public sample streams for prototype playback. */
export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    id: 'ep-jab-foundations',
    title: 'Juicing Foundations with Misty',
    description:
      'Kick off your Authentic Body path with Misty’s juicing mindset, greens basics, and how to start without overwhelm.',
    host: 'Misty Angelique',
    series: 'Authentic Balance Podcast',
    durationLabel: '18 min',
    publishedLabel: 'Week 1',
    type: 'audio',
    coverImage:
      'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=800&q=80',
    audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    tags: ['Juicing', 'JAB', 'Authentic Body'],
    pillarId: 'authentic-body'
  },
  {
    id: 'ep-hydration-rituals',
    title: 'Hydration Rituals That Stick',
    description:
      'How to hit 8 glasses with grace — morning cues, travel tips, and pairing water with your juice ritual.',
    host: 'Misty Angelique',
    series: 'Authentic Balance Podcast',
    durationLabel: '12 min',
    publishedLabel: 'Week 2',
    type: 'audio',
    coverImage:
      'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80',
    audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    tags: ['Hydration', 'Habits'],
    pillarId: 'authentic-body'
  },
  {
    id: 'ep-daily-rituals',
    title: 'Building Daily Rituals (Module Energy)',
    description:
      'A listen-along companion for daily rituals — consistency over perfection, family-friendly rhythms, and check-ins.',
    host: 'Misty Angelique',
    series: 'Authentic Balance Podcast',
    durationLabel: '22 min',
    publishedLabel: 'Week 3',
    type: 'audio',
    coverImage:
      'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=800&q=80',
    audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    tags: ['Rituals', 'Mindset'],
    pillarId: 'authentic-behavior'
  },
  {
    id: 'ep-welcome-video',
    title: 'Welcome to Authentic Balance (Video)',
    description:
      'Misty’s welcome message for new members — pillar overview, program flow, and how to use the app this week.',
    host: 'Misty Angelique',
    series: 'Authentic Balance Video Pod',
    durationLabel: '8 min',
    publishedLabel: 'Start here',
    type: 'video',
    coverImage:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    videoEmbedUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
    tags: ['Welcome', 'Onboarding'],
    pillarId: 'authentically-becoming'
  },
  {
    id: 'ep-juice-setup-video',
    title: 'Juicing Setup Walkthrough',
    description:
      'Visual guide energy: prep area, juicer placement, and a simple first green juice flow you can follow along.',
    host: 'Misty Angelique',
    series: 'Authentic Balance Video Pod',
    durationLabel: '14 min',
    publishedLabel: 'JAB visual',
    type: 'video',
    coverImage:
      'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=800&q=80',
    videoEmbedUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
    tags: ['Juicing', 'How-to'],
    pillarId: 'authentic-body'
  }
];

export function getPodcastEpisode(id: string): PodcastEpisode | undefined {
  return PODCAST_EPISODES.find((ep) => ep.id === id);
}

export function episodesForPillar(pillarId?: string | null): PodcastEpisode[] {
  if (!pillarId) return PODCAST_EPISODES;
  return PODCAST_EPISODES.filter((ep) => ep.pillarId === pillarId);
}
