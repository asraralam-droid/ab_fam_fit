import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProgramsState {
  enrolledIds: string[];
  /** programId → enrollment timestamp (ms) */
  enrolledAt: Record<string, number>;
  completedItemKeys: string[];
}

const initialState: ProgramsState = {
  enrolledIds: ['prog-jab'],
  enrolledAt: {},
  completedItemKeys: []
};

export const programsSlice = createSlice({
  name: 'programs',
  initialState,
  reducers: {
    enrollInProgram: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (!state.enrolledIds.includes(id)) {
        state.enrolledIds.push(id);
      }
      if (state.enrolledAt[id] === undefined) {
        state.enrolledAt[id] = Date.now();
      }
    },
    leaveProgram: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.enrolledIds = state.enrolledIds.filter((x) => x !== id);
      delete state.enrolledAt[id];
      state.completedItemKeys = state.completedItemKeys.filter(
        (key) => !key.startsWith(`${id}:`)
      );
    },
    toggleItemComplete: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      const idx = state.completedItemKeys.indexOf(key);
      if (idx >= 0) {
        state.completedItemKeys.splice(idx, 1);
      } else {
        state.completedItemKeys.push(key);
      }
    }
  }
});
