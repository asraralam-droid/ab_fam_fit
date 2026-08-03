import type { ContentQuote } from '../store/contentSlice';

export type QuoteDisplayMode = 'random' | 'scheduled';

const DEFAULT_QUOTE: ContentQuote = {
  id: 'default',
  text: "Authentic balance isn't about perfection — it's about consistency and grace.",
  author: 'Authentic Balance',
  status: 'published'
};

function dateSeed(date: Date): number {
  const key = date.toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickRandomPublished(
  published: ContentQuote[],
  date: Date
): ContentQuote | null {
  if (published.length === 0) return null;
  const index = dateSeed(date) % published.length;
  return published[index];
}

function pickScheduledForDay(
  published: ContentQuote[],
  dayOfWeek: number
): ContentQuote | null {
  const scheduled = published.filter((q) =>
    (q.scheduleDays ?? []).includes(dayOfWeek)
  );
  if (scheduled.length === 0) return null;
  return scheduled[0];
}

export function getQuoteForDisplay(
  quotes: ContentQuote[],
  mode: QuoteDisplayMode,
  date: Date = new Date()
): ContentQuote {
  const published = quotes.filter((q) => q.status === 'published');
  if (published.length === 0) return DEFAULT_QUOTE;

  const dayOfWeek = date.getDay();

  if (mode === 'scheduled') {
    const scheduled = pickScheduledForDay(published, dayOfWeek);
    if (scheduled) return scheduled;
    const fallback = pickRandomPublished(published, date);
    return fallback ?? DEFAULT_QUOTE;
  }

  return pickRandomPublished(published, date) ?? DEFAULT_QUOTE;
}

export const WEEKDAY_LABELS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
] as const;
