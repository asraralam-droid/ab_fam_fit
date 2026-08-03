import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// --- Theme Slice ---
type ThemeMode = 'light' | 'dark' | 'system';
interface ThemeState {
  mode: ThemeMode;
}
const initialThemeState: ThemeState = { mode: 'system' };
export const themeSlice = createSlice({
  name: 'theme',
  initialState: initialThemeState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
    }
  }
});

// --- Auth Slice ---
export type UserRole = 'admin' | 'staff' | 'end-user';

interface User {
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  familyCode: string | null;
}
const initialAuthState: AuthState = {
  isAuthenticated: true,
  user: {
    name: 'Alex Admin',
    email: 'admin@example.com',
    role: 'admin'
  },
  familyCode: null
};
export const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ user: User; familyCode?: string }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      if (action.payload.familyCode) {
        state.familyCode = action.payload.familyCode;
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.familyCode = null;
    },
    setFamilyCode: (state, action: PayloadAction<string>) => {
      state.familyCode = action.payload;
    },
    updateProfile: (
      state,
      action: PayloadAction<{ name?: string; avatar?: string | null }>
    ) => {
      if (!state.user) return;
      const { name, avatar } = action.payload;
      if (typeof name === 'string') {
        state.user.name = name;
      }
      if ('avatar' in action.payload) {
        state.user.avatar = avatar ?? undefined;
      }
    }
  }
});

// --- Challenges Slice (used by Admin Content) ---
export interface ChallengeLeaderboardRow {
  rank: number;
  name: string;
  points: number;
  isYou?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'team' | 'solo';
  durationDays: number;
  startDate: string;
  endDate: string;
  participants: number;
  createdByUser: boolean;
  creator: string;
  referralLink: string;
  joined: boolean;
  rank?: number;
  points?: number;
  daysLeft?: number;
  leaderboard: ChallengeLeaderboardRow[];
}

const defaultLeaderboard: ChallengeLeaderboardRow[] = [
  { rank: 1, name: 'Jordan Lee', points: 380 },
  { rank: 2, name: 'Sam Rivera', points: 312 },
  { rank: 3, name: 'Misty A.', points: 240, isYou: true },
  { rank: 4, name: 'Alex Chen', points: 215 },
  { rank: 5, name: 'Priya Singh', points: 198 }
];

interface ChallengesState {
  challenges: Challenge[];
}

const initialChallengesState: ChallengesState = {
  challenges: [
    {
      id: 'c1',
      title: 'March Family Steps',
      description: 'Hit 10,000 steps a day as a family team for 31 days.',
      type: 'team',
      durationDays: 31,
      startDate: 'Mar 1',
      endDate: 'Mar 31',
      participants: 48,
      createdByUser: false,
      creator: 'Authentic Balance',
      referralLink: 'https://authenticbalance.app/c/march-steps',
      joined: true,
      rank: 3,
      points: 240,
      daysLeft: 12,
      leaderboard: defaultLeaderboard
    },
    {
      id: 'c2',
      title: '7-Day Juice Reset',
      description: 'A 7-day green-juice reset to refresh your gut and energy.',
      type: 'solo',
      durationDays: 7,
      startDate: 'Apr 5',
      endDate: 'Apr 11',
      participants: 124,
      createdByUser: false,
      creator: 'Authentic Balance',
      referralLink: 'https://authenticbalance.app/c/juice-reset',
      joined: false,
      leaderboard: defaultLeaderboard
    }
  ]
};

export const challengesSlice = createSlice({
  name: 'challenges',
  initialState: initialChallengesState,
  reducers: {
    joinChallenge: (state, action: PayloadAction<string>) => {
      const challenge = state.challenges.find((c) => c.id === action.payload);
      if (challenge && !challenge.joined) {
        challenge.joined = true;
        challenge.participants += 1;
        challenge.rank = challenge.leaderboard.length + 1;
        challenge.points = 0;
        challenge.daysLeft = challenge.durationDays;
      }
    },
    leaveChallenge: (state, action: PayloadAction<string>) => {
      const challenge = state.challenges.find((c) => c.id === action.payload);
      if (challenge && challenge.joined) {
        challenge.joined = false;
        challenge.participants = Math.max(0, challenge.participants - 1);
        challenge.rank = undefined;
        challenge.points = undefined;
        challenge.daysLeft = undefined;
      }
    },
    createChallenge: (state, action: PayloadAction<Challenge>) => {
      state.challenges.unshift(action.payload);
    }
  }
});
