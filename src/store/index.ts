import { configureStore, combineReducers } from '@reduxjs/toolkit';

import {
  themeSlice,
  authSlice,
  onboardingSlice,
  homeSlice,
  mealsSlice,
  recipesSlice,
  learnSlice,
  activitySlice,
  challengesSlice,
  bestieSlice,
  notificationsSlice,
  profileSlice,
  checkInSlice } from
'./slices';
import { communitySlice, type CommunityEvent } from './communitySlice';
import { affiliateSlice } from './affiliateSlice';

const defaultAffiliateState = affiliateSlice.getInitialState();
import { programsSlice } from './programsSlice';
import { adminSlice } from './adminSlice';

const defaultAdminState = adminSlice.getInitialState();
import { contentSlice } from './contentSlice';
import {
  adminProgramsSlice,
  normalizeAdminProgram
} from './adminProgramsSlice';
import { chatSlice } from './chatSlice';
import { membershipSlice } from './membershipSlice';

const rootReducer = combineReducers({
  theme: themeSlice.reducer,
  auth: authSlice.reducer,
  onboarding: onboardingSlice.reducer,
  membership: membershipSlice.reducer,
  home: homeSlice.reducer,
  meals: mealsSlice.reducer,
  recipes: recipesSlice.reducer,
  learn: learnSlice.reducer,
  activity: activitySlice.reducer,
  challenges: challengesSlice.reducer,
  bestie: bestieSlice.reducer,
  notifications: notificationsSlice.reducer,
  profile: profileSlice.reducer,
  checkIn: checkInSlice.reducer,
  community: communitySlice.reducer,
  affiliate: affiliateSlice.reducer,
  programs: programsSlice.reducer,
  admin: adminSlice.reducer,
  content: contentSlice.reducer,
  adminPrograms: adminProgramsSlice.reducer,
  chat: chatSlice.reducer
});

const STORAGE_KEY = 'abi-root-v7';

function loadPreloadedState(): any {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const state = JSON.parse(raw);
    if (state?.adminPrograms?.programs?.length) {
      state.adminPrograms.programs = state.adminPrograms.programs.map(
        (p: Record<string, unknown>) => normalizeAdminProgram(p)
      );
    }
    const adminProgramIds = (state?.adminPrograms?.programs ?? []).map(
      (p: { id: string }) => p.id
    );
    if (state?.programs?.programs?.length) {
      const legacy = state.programs.programs as Array<{ id: string; enrolled?: boolean }>;
      let enrolledIds = legacy
        .filter((p) => p.enrolled)
        .map((p) => p.id)
        .filter((id) => adminProgramIds.includes(id));
      if (!enrolledIds.length && adminProgramIds.includes('prog-jab')) {
        enrolledIds = ['prog-jab'];
      }
      state.programs = {
        enrolledIds,
        enrolledAt: Object.fromEntries(
          enrolledIds.map((id: string) => [id, Date.now()])
        ),
        paidProgramIds: [...enrolledIds],
        paidAt: Object.fromEntries(
          enrolledIds.map((id: string) => [id, new Date().toISOString()])
        ),
        paidAmountUsd: Object.fromEntries(
          enrolledIds.map((id: string) => [id, id === 'prog-jab' ? 197 : 0])
        ),
        demoDayOffsetByProgram: {},
        completedItemKeys: Array.isArray(state.programs.completedItemKeys)
          ? state.programs.completedItemKeys
          : []
      };
    } else if (state?.programs?.enrolledIds) {
      state.programs.enrolledIds = Array.isArray(state.programs.enrolledIds)
        ? state.programs.enrolledIds.filter((id: string) =>
            adminProgramIds.length ? adminProgramIds.includes(id) : true
          )
        : [];
      state.programs.completedItemKeys = Array.isArray(state.programs.completedItemKeys)
        ? state.programs.completedItemKeys
        : [];
      if (!state.programs.enrolledAt || typeof state.programs.enrolledAt !== 'object') {
        state.programs.enrolledAt = {};
      }
      const enrolledAt = state.programs.enrolledAt as Record<string, number>;
      for (const id of state.programs.enrolledIds as string[]) {
        if (enrolledAt[id] === undefined) {
          enrolledAt[id] = Date.now();
        }
      }
      if (!Array.isArray(state.programs.paidProgramIds)) {
        state.programs.paidProgramIds = [...state.programs.enrolledIds];
      }
      if (!state.programs.paidAt || typeof state.programs.paidAt !== 'object') {
        state.programs.paidAt = {};
      }
      if (
        !state.programs.paidAmountUsd ||
        typeof state.programs.paidAmountUsd !== 'object'
      ) {
        state.programs.paidAmountUsd = {};
      }
      if (
        !state.programs.demoDayOffsetByProgram ||
        typeof state.programs.demoDayOffsetByProgram !== 'object'
      ) {
        state.programs.demoDayOffsetByProgram = {};
      }
      for (const id of state.programs.enrolledIds as string[]) {
        if (!state.programs.paidProgramIds.includes(id)) {
          state.programs.paidProgramIds.push(id);
        }
        if (!state.programs.paidAt[id]) {
          state.programs.paidAt[id] = new Date().toISOString();
        }
        if (state.programs.paidAmountUsd[id] === undefined) {
          state.programs.paidAmountUsd[id] = id === 'prog-jab' ? 197 : 0;
        }
      }
    } else if (state?.programs) {
      const enrolledIds = adminProgramIds.includes('prog-jab') ? ['prog-jab'] : [];
      const enrolledAt: Record<string, number> = {};
      for (const id of enrolledIds) {
        enrolledAt[id] = Date.now();
      }
      state.programs = {
        enrolledIds,
        enrolledAt,
        paidProgramIds: [...enrolledIds],
        paidAt: Object.fromEntries(
          enrolledIds.map((id: string) => [id, new Date().toISOString()])
        ),
        paidAmountUsd: Object.fromEntries(
          enrolledIds.map((id: string) => [id, id === 'prog-jab' ? 197 : 0])
        ),
        demoDayOffsetByProgram: {},
        completedItemKeys: []
      };
    }
    if (state?.admin && !state.admin.platformActivity?.length) {
      state.admin.platformActivity = defaultAdminState.platformActivity;
    }
    if (state?.community && !Array.isArray(state.community.events)) {
      state.community.events = communitySlice.getInitialState().events;
    }
    if (state?.community?.events?.length) {
      const defaultEvents = Object.fromEntries(
        communitySlice.getInitialState().events.map((e) => [e.id, e])
      );
      state.community.events = state.community.events.map(
        (e: CommunityEvent & { attendeeIds?: string[] }) => {
          const fallback = defaultEvents[e.id];
          return {
            ...e,
            attendeeIds: Array.isArray(e.attendeeIds) ?
              e.attendeeIds :
              fallback?.attendeeIds ?? [],
            imageUrl: fallback?.imageUrl ?? e.imageUrl
          };
        }
      );
    }
    if (state?.community && !Array.isArray(state.community.reportedPosts)) {
      state.community.reportedPosts =
        communitySlice.getInitialState().reportedPosts;
    }
    if (state?.community?.reportedPosts?.length) {
      state.community.reportedPosts = state.community.reportedPosts.map(
        (r: {
          reportType?: 'post' | 'user';
          postId?: string;
          reasonCode?: string;
          reason?: string;
        }) => ({
          ...r,
          reportType: r.reportType ?? 'post',
          reasonCode: r.reasonCode ?? 'other',
          reason: r.reason ?? 'Reported content'
        })
      );
    }
    if (state?.community?.posts?.length) {
      state.community.posts = state.community.posts.map(
        (p: { pinned?: boolean; commentsDisabled?: boolean }) => ({
          ...p,
          pinned: p.pinned ?? false,
          commentsDisabled: p.commentsDisabled ?? false
        })
      );
    }
    if (state?.community && !Array.isArray(state.community.bannedUsers)) {
      state.community.bannedUsers =
        communitySlice.getInitialState().bannedUsers;
    }
    if (state?.community?.groups?.length) {
      const defaultGroups = Object.fromEntries(
        communitySlice.getInitialState().groups.map((g) => [g.id, g])
      );
      state.community.groups = state.community.groups.map(
        (g: {
          id: string;
          memberIds?: string[];
          adminIds?: string[];
          members?: number;
        }) => {
          const fallback = defaultGroups[g.id];
          const memberIds =
            Array.isArray(g.memberIds) ?
              g.memberIds :
              fallback?.memberIds ?? [];
          const adminIds =
            Array.isArray(g.adminIds) ?
              g.adminIds :
              fallback?.adminIds ?? [];
          return {
            ...g,
            memberIds,
            adminIds,
            members: memberIds.length
          };
        }
      );
    }
    if (state?.affiliate) {
      const a = state.affiliate;
      if (a.isEnrolled === undefined) a.isEnrolled = defaultAffiliateState.isEnrolled;
      if (!a.viewMode) a.viewMode = defaultAffiliateState.viewMode;
      if (a.availableBalance === undefined) a.availableBalance = defaultAffiliateState.availableBalance;
      if (!a.profile) a.profile = defaultAffiliateState.profile;
      if (!a.paymentMethods?.length) a.paymentMethods = defaultAffiliateState.paymentMethods;
      if (!a.payoutHistory?.length) a.payoutHistory = defaultAffiliateState.payoutHistory;
      if (!a.affiliates?.length) a.affiliates = defaultAffiliateState.affiliates;
      if (!a.commissionRules?.length) a.commissionRules = defaultAffiliateState.commissionRules;
      if (!a.allReferrals?.length) a.allReferrals = defaultAffiliateState.allReferrals;
      if (!a.payoutQueue?.length) a.payoutQueue = defaultAffiliateState.payoutQueue;
      if (!a.fraudFlags?.length) a.fraudFlags = defaultAffiliateState.fraudFlags;
      if (!a.revenueChart?.length) a.revenueChart = defaultAffiliateState.revenueChart;
      if (a.referrals?.length && a.referrals[0].purchaseValue === undefined) {
        a.referrals = defaultAffiliateState.referrals;
      }
    }
    if (state?.recipes) {
      const defaultRecipes = recipesSlice.getInitialState();
      state.recipes.ingredientChecks =
        state.recipes.ingredientChecks ?? defaultRecipes.ingredientChecks;
      state.recipes.favorites =
        state.recipes.favorites ?? defaultRecipes.favorites;
      const defaultsById = Object.fromEntries(
        defaultRecipes.recipes.map((r) => [r.id, r])
      );
      state.recipes.recipes = (state.recipes.recipes ?? defaultRecipes.recipes).map(
        (r: (typeof defaultRecipes.recipes)[number]) => {
          const def = defaultsById[r.id];
          if (!def) {
            return {
              ...r,
              ingredients: r.ingredients ?? [],
              instructions: r.instructions ?? [],
              servings: r.servings ?? 2
            };
          }
          return {
            ...def,
            ...r,
            // Demo brand refresh: seed recipe images win over stale localStorage.
            image: def.image,
            ingredients:
              Array.isArray(r.ingredients) && r.ingredients.length > 0 ?
                r.ingredients :
                def.ingredients,
            instructions:
              Array.isArray(r.instructions) && r.instructions.length > 0 ?
                r.instructions :
                def.instructions,
            servings: r.servings ?? def.servings
          };
        }
      );
    }
    if (state?.content?.recipes?.length) {
      const defaultContent = contentSlice.getInitialState();
      const contentById = Object.fromEntries(
        defaultContent.recipes.map((r) => [r.id, r])
      );
      state.content.recipes = state.content.recipes.map(
        (r: { id: string; image?: string }) => {
          const def = contentById[r.id];
          return def ? { ...r, image: def.image } : r;
        }
      );
    }
    if (state && !state.chat) {
      state.chat = chatSlice.getInitialState();
    }
    if (state && !state.membership) {
      state.membership = membershipSlice.getInitialState();
    } else if (state?.membership) {
      if (state.membership.workedWithMisty === undefined) {
        state.membership.workedWithMisty =
          state.membership.tier === 'coaching' ||
          state.membership.tier === 'challenge';
      }
    }
    if (state?.notifications) {
      if (state.notifications.lastDailyRunDate === undefined) {
        state.notifications.lastDailyRunDate = null;
      }
      if (state.notifications.todaysPrompt === undefined) {
        state.notifications.todaysPrompt = null;
      }
      if (!Array.isArray(state.notifications.sentTrackingReminderIds)) {
        state.notifications.sentTrackingReminderIds = [];
      }
    }
    if (state?.community?.groups?.length) {
      const defaults = communitySlice.getInitialState().groups;
      state.community.groups = defaults.map((def) => {
        const existing = state.community.groups.find(
          (g: { id: string }) => g.id === def.id
        );
        return existing
          ? {
              ...def,
              ...existing,
              pillarId: def.pillarId,
              isNonprofit: def.isNonprofit,
              entryPrice: def.entryPrice ?? existing.entryPrice,
              landingTagline: def.landingTagline ?? existing.landingTagline
            }
          : def;
      });
    }
    if (state?.challenges) {
      const defaults = challengesSlice.getInitialState();
      if (!Array.isArray(state.challenges.dailyLogs)) {
        state.challenges.dailyLogs = defaults.dailyLogs;
      }
      if (Array.isArray(state.challenges.challenges)) {
        state.challenges.challenges = state.challenges.challenges.map(
          (c: Record<string, unknown>) => ({
            ...c,
            createdByMisty: c.createdByMisty ?? true,
            requiresDailyLogs: c.requiresDailyLogs ?? true
          })
        );
      }
    }
    if (state?.affiliate?.commissionRules?.length) {
      state.affiliate.commissionRules = state.affiliate.commissionRules.map(
        (r: { appliesTo?: string }) => ({
          ...r,
          appliesTo: r.appliesTo ?? 'all'
        })
      );
      const hasUpgrade = state.affiliate.commissionRules.some(
        (r: { appliesTo?: string }) => r.appliesTo === 'upgrade'
      );
      if (!hasUpgrade) {
        state.affiliate.commissionRules =
          defaultAffiliateState.commissionRules;
      }
    }
    if (state?.onboarding) {
      const legacyToNew: Record<string, string> = {
        'health-wellness': 'authentic-body',
        'health-fitness': 'authentic-body',
        nutrition: 'authentic-body',
        'family-community': 'authentic-body',
        business: 'authentic-business',
        'financial-business': 'authentic-business',
        'life-coaching': 'authentic-brain',
        'mental-coaching': 'authentic-brain',
        emotional: 'authentic-brain',
        'purpose-spiritual': 'authentic-brain'
      };
      const validPillars = new Set([
        'authentic-body',
        'authentic-brain',
        'authentically-becoming',
        'authentic-behavior',
        'authentic-bonding',
        'authentic-beauty',
        'authentic-business'
      ]);
      state.onboarding.pillars = (state.onboarding.pillars ?? [])
        .map((p: string) => legacyToNew[p] ?? p)
        .filter((p: string) => validPillars.has(p));
      state.onboarding.behavioralStage =
        state.onboarding.behavioralStage ?? null;
      state.onboarding.identityRole = state.onboarding.identityRole ?? null;
      state.onboarding.improveAreas = state.onboarding.improveAreas ?? [];
      state.onboarding.biggestObstacle =
        state.onboarding.biggestObstacle ?? '';
      state.onboarding.assessments = state.onboarding.assessments ?? {};
      state.onboarding.fitnessFollowUp =
        state.onboarding.fitnessFollowUp ?? null;
      state.onboarding.businessFollowUp =
        state.onboarding.businessFollowUp ?? null;
      state.onboarding.mentalFollowUp =
        state.onboarding.mentalFollowUp ?? null;
    }
    if (state?.admin?.members?.length) {
      state.admin.members = state.admin.members.map(
        (m: { plan?: string }) => ({
          ...m,
          plan:
            m.plan === 'Free' || m.plan === 'Lifetime' ?
              'Books' :
              m.plan
        })
      );
    }
    if (state?.admin?.pricing?.tiers?.length) {
      const hasBooksTier = state.admin.pricing.tiers.some(
        (t: { id?: string }) => t.id === 'tier-books'
      );
      if (!hasBooksTier) {
        state.admin.pricing = defaultAdminState.pricing;
      }
    }
    if (state?.home) {
      state.home.dailyCheckInCompleted =
        state.home.dailyCheckInCompleted ?? false;
      state.home.dailyCheckInDate = state.home.dailyCheckInDate ?? null;
      state.home.dailyCheckInFeeling = state.home.dailyCheckInFeeling ?? null;
    }
    if (Array.isArray(state?.challenges?.challenges)) {
      state.challenges.challenges = state.challenges.challenges.map(
        (c: { pillarId?: string; id?: string }) => ({
          ...c,
          pillarId:
            c.pillarId ??
            (c.id === 'c4' ? 'authentically-becoming' : 'authentic-body')
        })
      );
    }
    return state;
  } catch {
    return undefined;
  }
}

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadPreloadedState()
});

if (typeof window !== 'undefined') {
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  store.subscribe(() => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(store.getState())
        );
      } catch {

        // ignore quota / serialization errors
      }}, 200);
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;