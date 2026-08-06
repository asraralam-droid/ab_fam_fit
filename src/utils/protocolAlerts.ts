/**
 * Demo Authentic Body / program food protocol checks.
 * Keyword matching only — not real photo AI.
 */

export type ProtocolFlag = {
  id: string;
  label: string;
  keywords: string[];
  severity: 'warning' | 'alert';
  tip: string;
};

export const PROTOCOL_FLAGS: ProtocolFlag[] = [
  {
    id: 'pasta',
    label: 'Heavy pasta',
    keywords: ['pasta', 'spaghetti', 'lasagna', 'macaroni', 'mac and cheese', 'noodles', 'fettuccine', 'penne', 'ravioli'],
    severity: 'alert',
    tip: 'Swap for zucchini noodles, cauliflower rice, or a big green salad.'
  },
  {
    id: 'pizza',
    label: 'Pizza',
    keywords: ['pizza', 'pepperoni', 'calzone'],
    severity: 'alert',
    tip: 'Choose a veggie-loaded bowl or cauliflower-crust style option when you can.'
  },
  {
    id: 'fried',
    label: 'Fried foods',
    keywords: [
      'fried',
      'deep fried',
      'deep-fried',
      'french fries',
      'fries',
      'fried chicken',
      'nuggets',
      'tempura',
      'onion rings'
    ],
    severity: 'alert',
    tip: 'Bake, air-fry, steam, or sauté lightly instead of deep frying.'
  },
  {
    id: 'packaged',
    label: 'Packaged / processed',
    keywords: [
      'packaged',
      'processed',
      'fast food',
      'drive-thru',
      'drive thru',
      'chips',
      'candy',
      'soda',
      'soft drink',
      'junk food',
      'microwave meal',
      'frozen dinner',
      'hot dog',
      'burger',
      'cheeseburger'
    ],
    severity: 'warning',
    tip: 'Reach for whole foods, juices, or a recipe from Authentic Balance when possible.'
  },
  {
    id: 'sugary',
    label: 'Heavy sugar / desserts',
    keywords: [
      'cake',
      'cookie',
      'cookies',
      'ice cream',
      'donut',
      'doughnut',
      'pastry',
      'candy bar',
      'milkshake'
    ],
    severity: 'warning',
    tip: 'Try berry chia pudding or a green glow juice for a cleaner treat.'
  },
  {
    id: 'alcohol',
    label: 'Alcohol',
    keywords: ['beer', 'wine', 'cocktail', 'alcohol', 'vodka', 'whiskey', 'margarita'],
    severity: 'warning',
    tip: 'Hydrate and return to your juicing / water ritual for the next check-in.'
  }
];

export type ProtocolCheckResult = {
  flagged: boolean;
  matches: ProtocolFlag[];
  matchedKeywords: string[];
  severity: 'none' | 'warning' | 'alert';
  summary: string;
  bestieMessage: string;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function textHasKeyword(text: string, keyword: string): boolean {
  const k = keyword.toLowerCase().trim();
  if (!k) return false;
  if (k.includes(' ')) return text.includes(k);
  return new RegExp(`\\b${escapeRegex(k)}\\b`, 'i').test(text);
}

export function checkMealAgainstProtocol(
  description: string,
  mealType?: string
): ProtocolCheckResult {
  const text = `${description} ${mealType ?? ''}`.toLowerCase().trim();
  if (!text) {
    return {
      flagged: false,
      matches: [],
      matchedKeywords: [],
      severity: 'none',
      summary: '',
      bestieMessage: ''
    };
  }

  const matches: ProtocolFlag[] = [];
  const matchedKeywords: string[] = [];

  for (const flag of PROTOCOL_FLAGS) {
    const hit = flag.keywords.find((kw) => textHasKeyword(text, kw));
    if (hit) {
      matches.push(flag);
      matchedKeywords.push(hit);
    }
  }

  if (!matches.length) {
    return {
      flagged: false,
      matches: [],
      matchedKeywords: [],
      severity: 'none',
      summary: '',
      bestieMessage: ''
    };
  }

  const severity = matches.some((m) => m.severity === 'alert')
    ? 'alert'
    : 'warning';
  const labels = matches.map((m) => m.label);
  const summary =
    severity === 'alert'
      ? `Protocol alert: this looks like it may include ${labels.join(', ')}.`
      : `Gentle protocol note: possible ${labels.join(', ')} detected.`;

  const tip = matches[0]?.tip ?? 'Choose the next meal with Authentic Body in mind.';
  const bestieMessage = `${summary} No shame — progress over perfection. ${tip} Want help picking a clean swap? Ask me in Bestie.`;

  return {
    flagged: true,
    matches,
    matchedKeywords,
    severity,
    summary,
    bestieMessage
  };
}
