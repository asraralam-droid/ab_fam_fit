import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MembershipTier } from '../utils/membershipAccess';

export interface CoachingRequest {
  submitted: boolean;
  name: string;
  email: string;
  goals: string;
  preferredPath: 'work-with-misty' | 'join-challenge' | '';
  submittedAt: string | null;
}

export interface MembershipState {
  /** Current access tier. 'none' until $77 book package (or higher) is paid. */
  tier: MembershipTier;
  booksPurchased: boolean;
  paidAt: string | null;
  /** True after user completes a Misty-led challenge. */
  completedMistyChallenge: boolean;
  /** True after working with Misty / coaching engagement. */
  workedWithMisty: boolean;
  coachingRequest: CoachingRequest;
}

const initialState: MembershipState = {
  tier: 'none',
  booksPurchased: false,
  paidAt: null,
  completedMistyChallenge: false,
  workedWithMisty: false,
  coachingRequest: {
    submitted: false,
    name: '',
    email: '',
    goals: '',
    preferredPath: '',
    submittedAt: null
  }
};

export const membershipSlice = createSlice({
  name: 'membership',
  initialState,
  reducers: {
    purchaseBookPackage: (state) => {
      state.booksPurchased = true;
      state.paidAt = new Date().toISOString();
      if (state.tier === 'none') state.tier = 'books';
    },
    setMembershipTier: (state, action: PayloadAction<MembershipTier>) => {
      state.tier = action.payload;
      if (action.payload !== 'none') {
        state.booksPurchased = true;
        if (!state.paidAt) state.paidAt = new Date().toISOString();
      }
      if (action.payload === 'coaching' || action.payload === 'challenge') {
        state.workedWithMisty = true;
      }
    },
    markMistyChallengeCompleted: (state) => {
      state.completedMistyChallenge = true;
    },
    markWorkedWithMisty: (state) => {
      state.workedWithMisty = true;
    },
    submitCoachingRequest: (
      state,
      action: PayloadAction<Omit<CoachingRequest, 'submitted' | 'submittedAt'>>
    ) => {
      state.coachingRequest = {
        ...action.payload,
        submitted: true,
        submittedAt: new Date().toISOString()
      };
      if (action.payload.preferredPath === 'work-with-misty') {
        state.workedWithMisty = true;
      }
    },
    resetMembership: () => initialState
  }
});
