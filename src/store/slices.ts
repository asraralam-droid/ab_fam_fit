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
  isAuthenticated: false,
  user: null,
  familyCode: null
};
export const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    login: (
    state,
    action: PayloadAction<{user: User;familyCode?: string;}>) =>
    {
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

// --- Onboarding Slice ---
export interface OnboardingFitnessFollowUp {
  challenges: string[];
  goals: string[];
  outcomes: string[];
  expectations: string;
}
export interface OnboardingBusinessFollowUp {
  orgType: string;
  consultingNeeds: string[];
  automationNeeds: string[];
  notes: string;
}
export interface OnboardingMentalFollowUp {
  focusAreas: string[];
  expectations: string;
}
export interface OnboardingState {
  completed: boolean;
  /** Selected Authentic Balance pillars (multi-select). */
  pillars: string[];
  goals: string[];
  dietary: string[];
  currentWeight: number | null;
  goalWeight: number | null;
  fitnessFollowUp: OnboardingFitnessFollowUp | null;
  businessFollowUp: OnboardingBusinessFollowUp | null;
  mentalFollowUp: OnboardingMentalFollowUp | null;
  /** Assessment scores keyed by question id (1–5). */
  assessments: Record<string, number>;
}
const initialOnboardingState: OnboardingState = {
  completed: false,
  pillars: [],
  goals: [],
  dietary: [],
  currentWeight: null,
  goalWeight: null,
  fitnessFollowUp: null,
  businessFollowUp: null,
  mentalFollowUp: null,
  assessments: {}
};
export const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState: initialOnboardingState,
  reducers: {
    completeOnboarding: (state) => {
      state.completed = true;
    },
    setOnboardingData: (
    state,
    action: PayloadAction<Partial<OnboardingState>>) =>
    {
      return { ...state, ...action.payload };
    }
  }
});

// --- Home Slice ---
interface HomeState {
  streakDays: number;
  longestStreak: number;
  waterCount: number;
  journeyDay: number;
  checkInCompleted: boolean;
  weeklyWord: string | null;
}
const initialHomeState: HomeState = {
  streakDays: 12,
  longestStreak: 28,
  waterCount: 5,
  journeyDay: 47,
  checkInCompleted: false,
  weeklyWord: null
};
export const homeSlice = createSlice({
  name: 'home',
  initialState: initialHomeState,
  reducers: {
    incrementWater: (state) => {
      if (state.waterCount < 8) state.waterCount += 1;
    },
    completeCheckIn: (state, action: PayloadAction<string>) => {
      state.checkInCompleted = true;
      state.weeklyWord = action.payload;
    },
    incrementStreak: (state) => {
      state.streakDays += 1;
      if (state.streakDays > state.longestStreak) {
        state.longestStreak = state.streakDays;
      }
    }
  }
});

// --- Meals Slice ---
export interface Meal {
  id: string;
  type: string;
  description: string;
  time: string;
  date?: string;
  image?: string;
}
interface MealsState {
  loggedMeals: Meal[];
}
const initialMealsState: MealsState = {
  loggedMeals: [
  {
    id: '1',
    type: 'Breakfast',
    description: 'Green juice with kale',
    time: '8:00 AM'
  },
  {
    id: '2',
    type: 'Lunch',
    description: 'Quinoa Buddha Bowl',
    time: '12:30 PM'
  }]

};
export const mealsSlice = createSlice({
  name: 'meals',
  initialState: initialMealsState,
  reducers: {
    logMeal: (state, action: PayloadAction<Meal>) => {
      state.loggedMeals.push(action.payload);
    }
  }
});

// --- Recipes Slice ---
export interface Recipe {
  id: string;
  title: string;
  category: string;
  dietary: string[];
  prepTime: string;
  difficulty: string;
  image: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
}
interface RecipesState {
  favorites: string[];
  recipes: Recipe[];
  /** recipeId → indices of checked ingredients */
  ingredientChecks: Record<string, number[]>;
}
const initialRecipesState: RecipesState = {
  favorites: [],
  ingredientChecks: {},
  recipes: [
  {
    id: '1',
    title: 'Morning Green Juice',
    category: 'Juices',
    dietary: ['Vegan', 'GF'],
    prepTime: '10 min',
    difficulty: 'Easy',
    servings: 2,
    image:
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
    ingredients: [
    '1 cup fresh spinach',
    '1/2 green apple, cored',
    '1/2 cucumber',
    '1 celery stalk',
    '1/2 lemon, juiced',
    '1 inch ginger root'],
    instructions: [
    'Wash all produce thoroughly under cold water.',
    'Chop the apple, cucumber, and celery to fit your juicer or blender.',
    'Juice or blend all ingredients; strain if using a blender.',
    'Stir in lemon juice and serve immediately over ice if desired.']
  },
  {
    id: '2',
    title: 'Quinoa Buddha Bowl',
    category: 'Lunch',
    dietary: ['Vegan', 'GF', 'High-protein'],
    prepTime: '20 min',
    difficulty: 'Medium',
    servings: 2,
    image:
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
    ingredients: [
    '1 cup cooked quinoa',
    '1 cup roasted sweet potato cubes',
    '1 cup chickpeas, drained',
    '1 cup shredded kale',
    '2 tbsp tahini',
    '1 lemon, juiced',
    'Salt and pepper to taste'],
    instructions: [
    'Cook quinoa according to package directions and fluff with a fork.',
    'Roast sweet potato until tender; warm chickpeas in a pan.',
    'Whisk tahini with lemon juice and 2 tbsp water to make dressing.',
    'Layer quinoa, vegetables, and chickpeas in bowls; drizzle with dressing.']
  },
  {
    id: '3',
    title: 'Lentil Soup',
    category: 'Soups',
    dietary: ['Vegan', 'GF', 'High-protein'],
    prepTime: '45 min',
    difficulty: 'Easy',
    servings: 4,
    image:
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80',
    ingredients: [
    '1 cup dry red lentils, rinsed',
    '1 onion, diced',
    '2 carrots, diced',
    '2 celery stalks, diced',
    '3 cloves garlic, minced',
    '4 cups vegetable broth',
    '1 tsp cumin',
    'Fresh parsley for garnish'],
    instructions: [
    'Sauté onion, carrots, and celery in a large pot until softened.',
    'Add garlic and cumin; cook 1 minute until fragrant.',
    'Stir in lentils and broth; simmer 25–30 minutes until lentils are tender.',
    'Season to taste and garnish with parsley before serving.']
  },
  {
    id: '4',
    title: 'Berry Smoothie',
    category: 'Snacks',
    dietary: ['Vegan', 'GF'],
    prepTime: '5 min',
    difficulty: 'Easy',
    servings: 1,
    image:
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80',
    ingredients: [
    '1 cup mixed frozen berries',
    '1 banana',
    '1/2 cup almond milk',
    '1 tbsp almond butter',
    '1 tbsp chia seeds',
    'Optional: handful of spinach'],
    instructions: [
    'Add berries, banana, almond milk, and almond butter to blender.',
    'Blend until smooth, adding more milk if needed.',
    'Stir in chia seeds and pour into a glass.',
    'Serve immediately for best texture.']
  }]

};
export const recipesSlice = createSlice({
  name: 'recipes',
  initialState: initialRecipesState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const index = state.favorites.indexOf(action.payload);
      if (index >= 0) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(action.payload);
      }
    },
    toggleIngredientCheck: (
      state,
      action: PayloadAction<{ recipeId: string; index: number }>
    ) => {
      if (!state.ingredientChecks) {
        state.ingredientChecks = {};
      }
      const { recipeId, index } = action.payload;
      const current = state.ingredientChecks[recipeId] ?? [];
      const exists = current.includes(index);
      state.ingredientChecks[recipeId] = exists ?
        current.filter((i) => i !== index) :
        [...current, index];
    },
    resetIngredientChecks: (state, action: PayloadAction<string>) => {
      if (!state.ingredientChecks) {
        state.ingredientChecks = {};
        return;
      }
      delete state.ingredientChecks[action.payload];
    }
  }
});

// --- Learn Slice ---
interface LearnState {
  completedLessons: string[];
  lessonsTotal: number;
  bookProgress: Record<string, number>;
}
const initialLearnState: LearnState = {
  completedLessons: [
  'lesson-1',
  'lesson-2',
  'lesson-3',
  'lesson-4',
  'lesson-5',
  'lesson-6',
  'lesson-7',
  'lesson-8'],

  lessonsTotal: 24,
  bookProgress: {
    'book-1': 45,
    'book-2': 0,
    'book-3': 0
  }
};
export const learnSlice = createSlice({
  name: 'learn',
  initialState: initialLearnState,
  reducers: {
    markLessonComplete: (state, action: PayloadAction<string>) => {
      if (!state.completedLessons.includes(action.payload)) {
        state.completedLessons.push(action.payload);
      }
    }
  }
});

// --- Activity Slice ---
export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  type: 'meal' | 'workout' | 'win' | 'check-in';
  content: string;
  time: string;
  likes: number;
}
interface ActivityState {
  feed: ActivityItem[];
}
const initialActivityState: ActivityState = {
  feed: [
  {
    id: '1',
    userId: 'jordan',
    userName: 'Jordan',
    type: 'meal',
    content: 'logged Lunch',
    time: '2h ago',
    likes: 2
  },
  {
    id: '2',
    userId: 'sam',
    userName: 'Sam',
    type: 'win',
    content: 'finished a lesson',
    time: '4h ago',
    likes: 1
  },
  {
    id: '3',
    userId: 'alex',
    userName: 'Alex',
    type: 'win',
    content: 'hit a 7-day streak!',
    time: 'Yesterday',
    likes: 4
  }]

};
export const activitySlice = createSlice({
  name: 'activity',
  initialState: initialActivityState,
  reducers: {
    addActivity: (state, action: PayloadAction<ActivityItem>) => {
      state.feed.unshift(action.payload);
    },
    likeActivity: (state, action: PayloadAction<string>) => {
      const item = state.feed.find((i) => i.id === action.payload);
      if (item) item.likes += 1;
    }
  }
});

// --- Challenges Slice ---
export interface ChallengeLeaderboardRow {
  rank: number;
  name: string;
  points: number;
  isYou?: boolean;
  group?: 'family' | 'community';
}

export interface ChallengeDailyLog {
  id: string;
  challengeId: string;
  date: string;
  waterGlasses: number;
  meals: string;
  weightLbs: number | null;
  mood: number;
  notes?: string;
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
  /** Phase 1: only Misty (admin) creates challenges. */
  createdByMisty: boolean;
  creator: string;
  referralLink: string;
  joined: boolean;
  completed?: boolean;
  rank?: number;
  points?: number;
  daysLeft?: number;
  leaderboard: ChallengeLeaderboardRow[];
  /** High-end exclusive cohort (capped, paid, waitlist). */
  isExclusive?: boolean;
  maxParticipants?: number;
  price?: number;
  waitlistCount?: number;
  onWaitlist?: boolean;
  requiresDailyLogs?: boolean;
}

const defaultLeaderboard: ChallengeLeaderboardRow[] = [
{ rank: 1, name: 'Jordan Lee', points: 380, group: 'family' },
{ rank: 2, name: 'Sam Rivera', points: 312, group: 'family' },
{ rank: 3, name: 'Misty A.', points: 240, isYou: true, group: 'family' },
{ rank: 4, name: 'Alex Chen', points: 215, group: 'family' },
{ rank: 5, name: 'Priya Singh', points: 198, group: 'community' },
{ rank: 6, name: 'Marcus Hill', points: 176, group: 'community' },
{ rank: 7, name: 'Diana K.', points: 162, group: 'community' },
{ rank: 8, name: 'Robin O.', points: 144, group: 'community' },
{ rank: 9, name: 'Casey M.', points: 121, group: 'community' },
{ rank: 10, name: 'Toni B.', points: 98, group: 'community' }];


interface ChallengesState {
  challenges: Challenge[];
  dailyLogs: ChallengeDailyLog[];
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
    createdByMisty: true,
    creator: 'Misty A.',
    referralLink: 'https://authenticbalance.app/c/march-steps',
    joined: true,
    rank: 3,
    points: 240,
    daysLeft: 12,
    leaderboard: defaultLeaderboard,
    requiresDailyLogs: true
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
    createdByMisty: true,
    creator: 'Misty A.',
    referralLink: 'https://authenticbalance.app/c/juice-reset',
    joined: false,
    leaderboard: defaultLeaderboard,
    requiresDailyLogs: true
  },
  {
    id: 'c3',
    title: 'Hydration Hero',
    description: 'Drink 8 glasses of water a day for 14 days straight.',
    type: 'solo',
    durationDays: 14,
    startDate: 'Apr 1',
    endDate: 'Apr 14',
    participants: 72,
    createdByUser: false,
    createdByMisty: true,
    creator: 'Misty A.',
    referralLink: 'https://authenticbalance.app/c/hydration-hero',
    joined: false,
    leaderboard: defaultLeaderboard,
    requiresDailyLogs: true
  },
  {
    id: 'c4',
    title: 'Elite Monthly Transformation',
    description:
    'Exclusive high-touch cohort with Misty. Cap of 10. Daily metrics required.',
    type: 'solo',
    durationDays: 30,
    startDate: 'May 1',
    endDate: 'May 30',
    participants: 10,
    createdByUser: false,
    createdByMisty: true,
    creator: 'Misty A.',
    referralLink: 'https://authenticbalance.app/c/elite-monthly',
    joined: false,
    leaderboard: defaultLeaderboard,
    isExclusive: true,
    maxParticipants: 10,
    price: 997,
    waitlistCount: 6,
    requiresDailyLogs: true
  }],
  dailyLogs: [
  {
    id: 'log1',
    challengeId: 'c1',
    date: new Date().toISOString().slice(0, 10),
    waterGlasses: 6,
    meals: 'Green juice, salad bowl, herbal tea',
    weightLbs: 164,
    mood: 4,
    notes: 'Felt steady today'
  }]
};

export const challengesSlice = createSlice({
  name: 'challenges',
  initialState: initialChallengesState,
  reducers: {
    joinChallenge: (state, action: PayloadAction<string>) => {
      const challenge = state.challenges.find((c) => c.id === action.payload);
      if (!challenge || challenge.joined) return;
      if (
        challenge.isExclusive &&
        challenge.maxParticipants &&
        challenge.participants >= challenge.maxParticipants
      ) {
        return;
      }
      challenge.joined = true;
      challenge.onWaitlist = false;
      challenge.participants += 1;
      challenge.rank = challenge.leaderboard.length + 1;
      challenge.points = 0;
      challenge.daysLeft = challenge.durationDays;
    },
    joinWaitlist: (state, action: PayloadAction<string>) => {
      const challenge = state.challenges.find((c) => c.id === action.payload);
      if (!challenge || challenge.joined || challenge.onWaitlist) return;
      challenge.onWaitlist = true;
      challenge.waitlistCount = (challenge.waitlistCount ?? 0) + 1;
    },
    leaveChallenge: (state, action: PayloadAction<string>) => {
      const challenge = state.challenges.find((c) => c.id === action.payload);
      if (challenge && challenge.joined) {
        challenge.joined = false;
        challenge.completed = false;
        challenge.participants = Math.max(0, challenge.participants - 1);
        challenge.rank = undefined;
        challenge.points = undefined;
        challenge.daysLeft = undefined;
      }
    },
    completeChallenge: (state, action: PayloadAction<string>) => {
      const challenge = state.challenges.find((c) => c.id === action.payload);
      if (challenge && challenge.joined && !challenge.completed) {
        challenge.completed = true;
        challenge.daysLeft = 0;
      }
    },
    createChallenge: (state, action: PayloadAction<Challenge>) => {
      state.challenges.unshift(action.payload);
    },
    logChallengeDaily: (state, action: PayloadAction<ChallengeDailyLog>) => {
      const existing = state.dailyLogs.findIndex(
        (l) =>
        l.challengeId === action.payload.challengeId &&
        l.date === action.payload.date
      );
      if (existing >= 0) {
        state.dailyLogs[existing] = action.payload;
      } else {
        state.dailyLogs.unshift(action.payload);
      }
      const challenge = state.challenges.find(
        (c) => c.id === action.payload.challengeId
      );
      if (challenge && challenge.joined) {
        challenge.points = (challenge.points ?? 0) + 10;
      }
    }
  }
});

// --- Bestie Slice ---
export interface Message {
  id: string;
  role: 'user' | 'bestie';
  content: string;
}
interface BestieState {
  messages: Message[];
}
const initialBestieState: BestieState = {
  messages: [
  {
    id: 'm1',
    role: 'bestie',
    content:
    "Hi Misty! I'm your Authentic Bestie. How can I support your wellness journey today?"
  }]

};
export const bestieSlice = createSlice({
  name: 'bestie',
  initialState: initialBestieState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    }
  }
});

// --- Notifications Slice ---
export interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
}
interface NotificationsState {
  items: Notification[];
}
const initialNotificationsState: NotificationsState = {
  items: [
  {
    id: 'n1',
    message: 'Jordan logged dinner',
    time: '1h ago',
    read: false,
    type: 'meal'
  },
  {
    id: 'n2',
    message: 'Sam finished a lesson',
    time: '3h ago',
    read: false,
    type: 'learn'
  },
  {
    id: 'n3',
    message: "You're on a 12-day streak!",
    time: 'Yesterday',
    read: true,
    type: 'streak'
  }]

};
export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: initialNotificationsState,
  reducers: {
    markAllRead: (state) => {
      state.items.forEach((item) => item.read = true);
    }
  }
});

// --- Profile Slice ---
interface ProfileState {
  familyMembers: {id: string;name: string;streak: number;}[];
}
const initialProfileState: ProfileState = {
  familyMembers: [
  { id: 'misty', name: 'Misty (you)', streak: 12 },
  { id: 'jordan', name: 'Jordan', streak: 5 },
  { id: 'sam', name: 'Sam', streak: 2 },
  { id: 'alex', name: 'Alex', streak: 7 }]

};
export const profileSlice = createSlice({
  name: 'profile',
  initialState: initialProfileState,
  reducers: {}
});

// --- CheckIn Slice ---
export interface CheckInEntry {
  id: string;
  date: string;
  feeling: number;
  word: string;
  win: string;
  struggle: string;
  need: string;
}
interface CheckInState {
  entries: CheckInEntry[];
}
const initialCheckInState: CheckInState = {
  entries: [
  {
    id: 'ci1',
    date: 'Week of Mar 3',
    feeling: 4,
    word: 'Steady',
    win: 'Drank water every day',
    struggle: 'Late night snacking',
    need: 'More sleep'
  }]

};
export const checkInSlice = createSlice({
  name: 'checkIn',
  initialState: initialCheckInState,
  reducers: {
    addCheckIn: (state, action: PayloadAction<CheckInEntry>) => {
      state.entries.unshift(action.payload);
    }
  }
});