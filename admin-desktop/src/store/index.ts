import { configureStore, combineReducers } from '@reduxjs/toolkit';

import { themeSlice, authSlice, challengesSlice } from './slices';
import { affiliateSlice } from './affiliateSlice';
import { adminSlice } from './adminSlice';
import { contentSlice } from './contentSlice';
import {
  adminProgramsSlice,
  normalizeAdminProgram
} from './adminProgramsSlice';

const defaultAdminState = adminSlice.getInitialState();
const defaultAffiliateState = affiliateSlice.getInitialState();

const rootReducer = combineReducers({
  theme: themeSlice.reducer,
  auth: authSlice.reducer,
  challenges: challengesSlice.reducer,
  admin: adminSlice.reducer,
  affiliate: affiliateSlice.reducer,
  content: contentSlice.reducer,
  adminPrograms: adminProgramsSlice.reducer
});

const STORAGE_KEY = 'abi-admin-desktop-v1';

function loadPreloadedState(): Record<string, unknown> | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const state = JSON.parse(raw) as Record<string, any>;

    if (state?.adminPrograms?.programs?.length) {
      state.adminPrograms.programs = state.adminPrograms.programs.map(
        (p: Record<string, unknown>) => normalizeAdminProgram(p)
      );
    }
    if (state?.admin && !state.admin.platformActivity?.length) {
      state.admin.platformActivity = defaultAdminState.platformActivity;
    }
    if (state?.affiliate) {
      const a = state.affiliate;
      if (a.isEnrolled === undefined) a.isEnrolled = defaultAffiliateState.isEnrolled;
      if (!a.viewMode) a.viewMode = defaultAffiliateState.viewMode;
      if (a.availableBalance === undefined) {
        a.availableBalance = defaultAffiliateState.availableBalance;
      }
      if (!a.profile) a.profile = defaultAffiliateState.profile;
      if (!a.paymentMethods?.length) {
        a.paymentMethods = defaultAffiliateState.paymentMethods;
      }
      if (!a.payoutHistory?.length) {
        a.payoutHistory = defaultAffiliateState.payoutHistory;
      }
      if (!a.affiliates?.length) a.affiliates = defaultAffiliateState.affiliates;
      if (!a.commissionRules?.length) {
        a.commissionRules = defaultAffiliateState.commissionRules;
      }
      if (!a.allReferrals?.length) {
        a.allReferrals = defaultAffiliateState.allReferrals;
      }
      if (!a.payoutQueue?.length) {
        a.payoutQueue = defaultAffiliateState.payoutQueue;
      }
      if (!a.fraudFlags?.length) a.fraudFlags = defaultAffiliateState.fraudFlags;
      if (!a.revenueChart?.length) {
        a.revenueChart = defaultAffiliateState.revenueChart;
      }
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
      }
    }, 200);
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
