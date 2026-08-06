import knowledge from '../data/bestieKnowledge.json';
import type { BestieUserContext } from './bestieUserContext';

export type BestieTopic = {
  id: string;
  label: string;
  keywords: string[];
  suggestedPrompts?: string[];
  replies: string[];
};

type BestieKnowledge = {
  topics: BestieTopic[];
  fallback: { id: string; label: string; replies: string[] };
  suggestedPromptChips: string[];
};

const data = knowledge as BestieKnowledge;

/** Demo topic: answered from live Redux user context. */
const USER_PROGRESS_TOPIC: BestieTopic = {
  id: 'user_progress',
  label: 'My Progress & Personal Context',
  keywords: [
    'how am i',
    'my progress',
    'my goals',
    'my goal',
    'my pillar',
    'where am i',
    'my program',
    'my journey',
    'doing today',
    'remind me about my',
    'my focus',
    'about me',
    'my profile',
    'entry point',
    'check-in',
    'check in',
    'accountable',
    'obstacle',
    'clean swap',
    'protocol'
  ],
  replies: []
};

/** Last reply text used, so we rotate when a topic has multiple replies. */
let lastReplyByTopic: Record<string, string> = {};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function keywordMatches(message: string, keyword: string): boolean {
  const k = keyword.toLowerCase().trim();
  if (!k) return false;
  if (k.includes(' ')) {
    return message.includes(k);
  }
  return new RegExp(`\\b${escapeRegex(k)}\\b`, 'i').test(message);
}

function scoreTopic(message: string, topic: BestieTopic): number {
  let score = 0;
  for (const keyword of topic.keywords) {
    if (keywordMatches(message, keyword)) {
      score += Math.max(keyword.trim().length, 2) + 2;
    }
  }
  return score;
}

function pickReply(topicId: string, replies: string[]): string {
  if (replies.length === 0) return '';
  if (replies.length === 1) return replies[0];

  const last = lastReplyByTopic[topicId];
  const pool = last ? replies.filter((r) => r !== last) : replies;
  const choices = pool.length > 0 ? pool : replies;
  const reply = choices[Math.floor(Math.random() * choices.length)];
  lastReplyByTopic[topicId] = reply;
  return reply;
}

function listOr(items: string[], fallback: string) {
  if (!items.length) return fallback;
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function buildProgressReply(ctx: BestieUserContext, message: string): string {
  const name = ctx.firstName || 'friend';
  const wantsCheckIn =
    message.includes('check-in') ||
    message.includes('check in') ||
    message.includes('accountable');
  const wantsProtocol =
    message.includes('protocol') ||
    message.includes('clean swap') ||
    message.includes('swap');
  const wantsGoals =
    message.includes('goal') || message.includes('improve') || message.includes('obstacle');
  const wantsPillar =
    message.includes('pillar') || message.includes('focus') || message.includes('entry');

  if (wantsProtocol) {
    return `${name}, no shame if a meal drifted off protocol — progress over perfection. Choose a veggie-loaded bowl or cauliflower-crust style option when you can, hydrate, and get back to your next clean meal. Want a specific swap idea? Tell me what you logged.`;
  }

  if (wantsCheckIn) {
    if (ctx.checkInCompleted) {
      return `${name}, your check-in is already done — love the honesty. Keep stacking those small daily wins.`;
    }
    return `${name}, your weekly/feeling check-in is still open. Two minutes of honesty keeps you accountable — open Home and complete it when you're ready.`;
  }

  if (wantsGoals) {
    const goals = ctx.goals.length
      ? listOr(ctx.goals, '')
      : ctx.improveAreas.length
        ? listOr(ctx.improveAreas, '')
        : '';
    if (goals) {
      let reply = `${name}, you're working on: ${goals}.`;
      if (ctx.biggestObstacle) {
        reply += ` Your biggest obstacle right now is “${ctx.biggestObstacle}” — we'll keep chipping at that with small daily wins.`;
      }
      return reply;
    }
    return `${name}, I don't have specific goals saved yet. Finish onboarding or set coaching goals and I'll mirror them back anytime.`;
  }

  if (wantsPillar) {
    if (ctx.entryPillar) {
      return `${name}, your entry point is ${ctx.entryPillar}${
        ctx.identityRole ? ` as a ${ctx.identityRole}` : ''
      }. That's the lens I use when I coach you in-app.`;
    }
    return `${name}, pick your Authentic pillar in onboarding so I can personalize your dashboard and advice.`;
  }

  const parts: string[] = [`Here's your snapshot, ${name}:`];
  if (ctx.entryPillar) parts.push(`Pillar/entry point: ${ctx.entryPillar}.`);
  if (ctx.programTitles.length) {
    parts.push(`Program: ${ctx.programTitles.join(', ')}.`);
  }
  parts.push(`Journey day ${ctx.journeyDay}, ${ctx.streakDays}-day streak.`);
  parts.push(
    `Today: ${ctx.waterCount}/${ctx.waterGoal} water, ${ctx.mealsLoggedToday} meal${
      ctx.mealsLoggedToday === 1 ? '' : 's'
    } logged${ctx.checkInCompleted ? ', check-in done' : ', check-in still open'}.`
  );
  if (ctx.completedItemCount > 0) {
    parts.push(`${ctx.completedItemCount} program item${ctx.completedItemCount === 1 ? '' : 's'} marked complete.`);
  }
  if (ctx.membershipTier === 'none') {
    parts.push('Entry package not marked paid yet — books tier unlocks Bestie tools fully.');
  } else {
    parts.push(`Membership: ${ctx.membershipTier} tier.`);
  }
  parts.push('Want a nudge on hydration, meals, or your next module step?');
  return parts.join(' ');
}

function personalizeReply(
  baseReply: string,
  ctx: BestieUserContext | undefined,
  topicId: string
): string {
  if (!ctx) return baseReply;

  const extras: string[] = [];
  const name = ctx.firstName;

  if (topicId === 'hydration') {
    extras.push(
      `You've logged ${ctx.waterCount}/${ctx.waterGoal} glasses today${
        name ? `, ${name}` : ''
      }.${
        ctx.waterCount >= ctx.waterGoal
          ? ' Hydration goal crushed!'
          : ` ${ctx.waterGoal - ctx.waterCount} to go.`
      }`
    );
  }

  if (topicId === 'meals_recipes_food') {
    extras.push(
      ctx.mealsLoggedToday > 0
        ? `I see ${ctx.mealsLoggedToday} meal${ctx.mealsLoggedToday === 1 ? '' : 's'} logged today — keep those Authentic Body choices coming.`
        : 'No meals logged yet today — even one clean meal check-in keeps you honest.'
    );
  }

  if (topicId === 'modules_progress' || topicId === 'juicing_jab') {
    if (ctx.programTitles.length) {
      extras.push(
        `You're enrolled in ${ctx.programTitles[0]} (day ${ctx.journeyDay}).`
      );
    } else if (ctx.journeyDay) {
      extras.push(`You're on journey day ${ctx.journeyDay}.`);
    }
    if (ctx.completedItemCount > 0) {
      extras.push(`${ctx.completedItemCount} lesson item(s) checked off so far.`);
    }
  }

  if (topicId === 'pillars' && ctx.entryPillar) {
    extras.push(
      `Your selected entry point is ${ctx.entryPillar}${
        ctx.behavioralStage ? ` — and you shared: “${ctx.behavioralStage}”` : ''
      }.`
    );
  }

  if (topicId === 'daily_rituals_tracking') {
    extras.push(
      `Streak: ${ctx.streakDays} day${ctx.streakDays === 1 ? '' : 's'}. Water ${ctx.waterCount}/${ctx.waterGoal}${
        ctx.checkInCompleted ? '; check-in complete' : '; check-in still waiting'
      }.`
    );
  }

  if (topicId === 'motivation_accountability') {
    if (ctx.biggestObstacle) {
      extras.push(`Remember your obstacle — “${ctx.biggestObstacle}” — and take one tiny step past it today.`);
    } else if (ctx.improveAreas.length) {
      extras.push(`You're growing in: ${listOr(ctx.improveAreas, 'your chosen areas')}.`);
    }
  }

  if (topicId === 'books_membership') {
    extras.push(
      ctx.booksPurchased || ctx.membershipTier !== 'none'
        ? `Your access shows as ${ctx.membershipTier} tier.`
        : 'I don’t see the entry book package marked paid yet on your profile.'
    );
  }

  if (topicId === 'fallback' && name) {
    extras.push(`I'm here for you, ${name} — ask about your progress, pillar, or today's habits.`);
  }

  if (!extras.length) return baseReply;
  return `${baseReply}\n\n${extras.join(' ')}`;
}

export function getBestieSuggestedPrompts(): string[] {
  return data.suggestedPromptChips ?? [];
}

export function getBestieReply(
  userMessage: string,
  ctx?: BestieUserContext
): {
  topicId: string;
  topicLabel: string;
  reply: string;
} {
  const message = userMessage.toLowerCase().trim();
  if (!message) {
    const reply = personalizeReply(
      pickReply('fallback', data.fallback.replies),
      ctx,
      'fallback'
    );
    return {
      topicId: data.fallback.id,
      topicLabel: data.fallback.label,
      reply
    };
  }

  const allTopics: BestieTopic[] = [USER_PROGRESS_TOPIC, ...data.topics];

  let best: BestieTopic | null = null;
  let bestScore = 0;

  for (const topic of allTopics) {
    const score = scoreTopic(message, topic);
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }

  if (!best || bestScore === 0) {
    const reply = personalizeReply(
      pickReply('fallback', data.fallback.replies),
      ctx,
      'fallback'
    );
    return {
      topicId: data.fallback.id,
      topicLabel: data.fallback.label,
      reply
    };
  }

  if (best.id === 'user_progress') {
    const reply = ctx
      ? buildProgressReply(ctx, message)
      : "I don't have your profile context loaded yet. Complete onboarding and check back — I'll personalize from your pillar, goals, and progress.";
    lastReplyByTopic.user_progress = reply;
    return {
      topicId: best.id,
      topicLabel: best.label,
      reply
    };
  }

  const base = pickReply(best.id, best.replies);
  return {
    topicId: best.id,
    topicLabel: best.label,
    reply: personalizeReply(base, ctx, best.id)
  };
}
