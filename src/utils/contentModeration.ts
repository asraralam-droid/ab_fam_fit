const BAD_WORDS = [
  'spam',
  'scam',
  'fraud',
  'hate',
  'kill',
  'idiot',
  'stupid',
  'damn',
  'hell',
  'shit',
  'fuck',
  'asshole',
  'bitch',
  'bastard',
  'nazi',
  'racist'
];

export type ModerationResult = {
  blocked: boolean;
  matches: string[];
};

export function containsBadWords(text: string): ModerationResult {
  const normalized = text.toLowerCase();
  const matches = BAD_WORDS.filter((word) => {
    const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return pattern.test(normalized);
  });
  return {
    blocked: matches.length > 0,
    matches
  };
}

export function moderationErrorMessage(matches: string[]) {
  if (!matches.length) return 'This content cannot be posted.';
  const shown = matches.slice(0, 3).join(', ');
  return `Your post contains language that isn't allowed (${shown}). Please revise and try again.`;
}
