import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BRAND_MEDIA } from '../utils/brandMedia';

export interface ContentRecipe {
  id: string;
  title: string;
  category: string;
  tags: string[];
  status: 'published' | 'draft';
  aiGenerated: boolean;
  image?: string;
  description?: string;
}

export interface ContentCategory {
  id: string;
  name: string;
  recipeCount: number;
  color: string;
}

export interface ContentLesson {
  id: string;
  title: string;
  module: string;
  duration: string;
  status: 'published' | 'draft';
}

export type QuoteDisplayMode = 'random' | 'scheduled';

export interface ContentQuote {
  id: string;
  text: string;
  author: string;
  status: 'published' | 'draft';
  /** 0 = Sun … 6 = Sat — used when display mode is scheduled */
  scheduleDays?: number[];
}

interface ContentState {
  recipes: ContentRecipe[];
  categories: ContentCategory[];
  lessons: ContentLesson[];
  quotes: ContentQuote[];
  quoteDisplayMode: QuoteDisplayMode;
}

const initialState: ContentState = {
  recipes: [
    {
      id: 'r1',
      title: 'Ginger-Lime Cabbage and Asparagus Stir-Fry',
      category: 'Lunch',
      tags: [
        'Vegan',
        'Keto',
        'Gluten-Free',
        'Quick',
        'Anti-Inflammatory',
        'Detox',
        'Low-Carb'
      ],
      status: 'published',
      aiGenerated: true,
      image: BRAND_MEDIA.stirFryGreens
    },
    {
      id: 'r2',
      title: 'Zucchini Noodles with Creamy Basil Pesto',
      category: 'Lunch',
      tags: [
        'Vegan',
        'Keto',
        'Gluten-Free',
        'Quick',
        'Low-Carb',
        'Italian',
        'Dairy-Free'
      ],
      status: 'published',
      aiGenerated: true,
      image: BRAND_MEDIA.zucchiniNoodles
    },
    {
      id: 'r3',
      title: 'Roasted Turmeric Cauliflower and Avocado Bowl',
      category: 'Lunch',
      tags: [
        'Vegan',
        'Keto',
        'Anti-Inflammatory',
        'Bowl',
        'Gluten-Free',
        'High-Fiber',
        'Detox'
      ],
      status: 'published',
      aiGenerated: true,
      image: BRAND_MEDIA.turmericBowl
    },
    {
      id: 'r4',
      title: 'Garden Fresh Cucumber and Radish Salad',
      category: 'Snack',
      tags: ['Vegan', 'Gluten-Free', 'Low-Cal', 'Raw', 'Quick'],
      status: 'published',
      aiGenerated: true,
      image: BRAND_MEDIA.cucumberSalad
    },
    {
      id: 'r5',
      title: 'Lemon Herb Roasted Asparagus with Toasted Almonds',
      category: 'Snack',
      tags: ['Vegan', 'Gluten-Free', 'Quick', 'High-Fiber', 'Keto'],
      status: 'published',
      aiGenerated: true,
      image: BRAND_MEDIA.asparagus
    },
    {
      id: 'r6',
      title: 'Anti-Inflammatory Green Glow Juice',
      category: 'Juice',
      tags: ['Vegan', 'Detox', 'Anti-Inflammatory', 'Raw'],
      status: 'published',
      aiGenerated: true,
      image: BRAND_MEDIA.greenJuice
    },
    {
      id: 'r7',
      title: 'High-Protein Overnight Oats with Berries',
      category: 'Breakfast',
      tags: ['Vegetarian', 'High-Protein', 'Quick'],
      status: 'published',
      aiGenerated: true,
      image: BRAND_MEDIA.oatsBerries
    },
    {
      id: 'r8',
      title: 'Coconut Curry Lentil Soup',
      category: 'Dinner',
      tags: ['Vegan', 'Gluten-Free', 'Comfort', 'High-Fiber'],
      status: 'published',
      aiGenerated: false,
      image: BRAND_MEDIA.soupBowl
    },
    {
      id: 'r9',
      title: 'Berry Chia Pudding',
      category: 'Breakfast',
      tags: ['Vegan', 'Gluten-Free', 'High-Fiber'],
      status: 'published',
      aiGenerated: false,
      image: BRAND_MEDIA.berryBowl
    },
    {
      id: 'r10',
      title: 'Spicy Black Bean Tacos',
      category: 'Dinner',
      tags: ['Vegan', 'High-Protein'],
      status: 'published',
      aiGenerated: false,
      image: BRAND_MEDIA.veggieTacos
    },
    {
      id: 'r11',
      title: 'Tropical Mango Smoothie Bowl',
      category: 'Breakfast',
      tags: ['Vegan', 'Gluten-Free'],
      status: 'published',
      aiGenerated: false,
      image: BRAND_MEDIA.smoothieBowl
    },
    {
      id: 'r12',
      title: 'Garlic Herb Cauliflower Rice',
      category: 'Lunch',
      tags: ['Keto', 'Gluten-Free', 'Low-Carb'],
      status: 'published',
      aiGenerated: true,
      image: BRAND_MEDIA.cauliflower
    },
    {
      id: 'r13',
      title: 'Beet & Carrot Detox Juice',
      category: 'Juice',
      tags: ['Vegan', 'Detox', 'Raw'],
      status: 'published',
      aiGenerated: false,
      image: BRAND_MEDIA.beetJuice
    },
    {
      id: 'r14',
      title: 'Maple Tahini Energy Bites',
      category: 'Snack',
      tags: ['Vegan', 'Gluten-Free', 'No-Bake'],
      status: 'published',
      aiGenerated: false,
      image: BRAND_MEDIA.energyBites
    }
  ],

  categories: [
    { id: 'c1', name: 'Breakfast', recipeCount: 3, color: '#B89150' },
    { id: 'c2', name: 'Lunch', recipeCount: 4, color: '#7E9568' },
    { id: 'c3', name: 'Dinner', recipeCount: 2, color: '#2D1B5E' },
    { id: 'c4', name: 'Snack', recipeCount: 3, color: '#C9BDD9' },
    { id: 'c5', name: 'Juice', recipeCount: 2, color: '#7E9568' }
  ],

  lessons: [
    {
      id: 'l1',
      title: 'Understanding Your Gut',
      module: 'Module 2',
      duration: '8 min',
      status: 'published'
    },
    {
      id: 'l2',
      title: 'Hydration & Energy',
      module: 'Module 1',
      duration: '5 min',
      status: 'published'
    },
    {
      id: 'l3',
      title: 'Setting Your Why',
      module: 'Module 1',
      duration: '6 min',
      status: 'published'
    },
    {
      id: 'l4',
      title: 'Building Daily Rituals',
      module: 'Module 2',
      duration: '9 min',
      status: 'draft'
    }
  ],

  quotes: [
    {
      id: 'q1',
      text: 'You are not starting over. You are starting from experience.',
      author: 'Authentic Balance',
      status: 'published',
      scheduleDays: [1]
    },
    {
      id: 'q2',
      text: "Authentic balance isn't about perfection — it's about consistency and grace.",
      author: 'Authentic Balance',
      status: 'published',
      scheduleDays: [2, 4]
    },
    {
      id: 'q3',
      text: 'Small daily steps create the life you want.',
      author: 'Misty A.',
      status: 'published',
      scheduleDays: [3, 5, 6]
    },
    {
      id: 'q4',
      text: 'Your body is listening to every word you speak.',
      author: 'Unknown',
      status: 'draft',
      scheduleDays: [0]
    }
  ],

  quoteDisplayMode: 'random'
};

export const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    addRecipe: (state, action: PayloadAction<ContentRecipe>) => {
      state.recipes.unshift(action.payload);
    },
    updateRecipe: (state, action: PayloadAction<ContentRecipe>) => {
      const idx = state.recipes.findIndex((r) => r.id === action.payload.id);
      if (idx >= 0) state.recipes[idx] = action.payload;
    },
    deleteRecipe: (state, action: PayloadAction<string>) => {
      state.recipes = state.recipes.filter((r) => r.id !== action.payload);
    },
    toggleRecipeStatus: (state, action: PayloadAction<string>) => {
      const r = state.recipes.find((r) => r.id === action.payload);
      if (r) r.status = r.status === 'published' ? 'draft' : 'published';
    },
    duplicateRecipe: (state, action: PayloadAction<string>) => {
      const r = state.recipes.find((x) => x.id === action.payload);
      if (!r) return;
      state.recipes.unshift({
        ...r,
        id: `r-${Date.now()}`,
        title: `${r.title} (copy)`,
        status: 'draft'
      });
    },
    addCategory: (state, action: PayloadAction<ContentCategory>) => {
      state.categories.push(action.payload);
    },
    updateCategory: (state, action: PayloadAction<ContentCategory>) => {
      const idx = state.categories.findIndex((c) => c.id === action.payload.id);
      if (idx >= 0) state.categories[idx] = action.payload;
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter((c) => c.id !== action.payload);
    },
    addLesson: (state, action: PayloadAction<ContentLesson>) => {
      state.lessons.unshift(action.payload);
    },
    updateLesson: (state, action: PayloadAction<ContentLesson>) => {
      const idx = state.lessons.findIndex((l) => l.id === action.payload.id);
      if (idx >= 0) state.lessons[idx] = action.payload;
    },
    deleteLesson: (state, action: PayloadAction<string>) => {
      state.lessons = state.lessons.filter((l) => l.id !== action.payload);
    },
    toggleLessonStatus: (state, action: PayloadAction<string>) => {
      const l = state.lessons.find((l) => l.id === action.payload);
      if (l) l.status = l.status === 'published' ? 'draft' : 'published';
    },
    addQuote: (state, action: PayloadAction<ContentQuote>) => {
      state.quotes.unshift(action.payload);
    },
    updateQuote: (state, action: PayloadAction<ContentQuote>) => {
      const idx = state.quotes.findIndex((q) => q.id === action.payload.id);
      if (idx >= 0) state.quotes[idx] = action.payload;
    },
    deleteQuote: (state, action: PayloadAction<string>) => {
      state.quotes = state.quotes.filter((q) => q.id !== action.payload);
    },
    toggleQuoteStatus: (state, action: PayloadAction<string>) => {
      const q = state.quotes.find((q) => q.id === action.payload);
      if (q) q.status = q.status === 'published' ? 'draft' : 'published';
    },
    setQuoteDisplayMode: (state, action: PayloadAction<QuoteDisplayMode>) => {
      state.quoteDisplayMode = action.payload;
    }
  }
});
