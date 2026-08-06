import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProgramsState {
  enrolledIds: string[];
  /** programId → enrollment timestamp (ms) */
  enrolledAt: Record<string, number>;
  /** Programs paid for at program level (not per module). */
  paidProgramIds: string[];
  /** programId → ISO paid-at */
  paidAt: Record<string, string>;
  /** programId → amount paid (USD demo) */
  paidAmountUsd: Record<string, number>;
  /**
   * Demo only: fake days added since enrollment for time-gate testing
   * (Module 1→2→3→4 schedule).
   */
  demoDayOffsetByProgram: Record<string, number>;
  completedItemKeys: string[];
}

const initialState: ProgramsState = {
  enrolledIds: ['prog-jab'],
  enrolledAt: { 'prog-jab': Date.now() },
  paidProgramIds: ['prog-jab'],
  paidAt: { 'prog-jab': new Date().toISOString() },
  paidAmountUsd: { 'prog-jab': 197 },
  demoDayOffsetByProgram: {},
  completedItemKeys: []
};

function ensureEnrolled(state: ProgramsState, id: string) {
  if (!state.enrolledIds.includes(id)) {
    state.enrolledIds.push(id);
  }
  if (state.enrolledAt[id] === undefined) {
    state.enrolledAt[id] = Date.now();
  }
}

export const programsSlice = createSlice({
  name: 'programs',
  initialState,
  reducers: {
    enrollInProgram: (state, action: PayloadAction<string>) => {
      ensureEnrolled(state, action.payload);
    },
    /** Demo: one-time program payment unlocks the entire program (all modules). */
    purchaseProgram: (
      state,
      action: PayloadAction<{ programId: string; amountUsd: number }>
    ) => {
      const { programId, amountUsd } = action.payload;
      ensureEnrolled(state, programId);
      if (!state.paidProgramIds.includes(programId)) {
        state.paidProgramIds.push(programId);
      }
      state.paidAt[programId] = new Date().toISOString();
      state.paidAmountUsd[programId] = amountUsd;
    },
    leaveProgram: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.enrolledIds = state.enrolledIds.filter((x) => x !== id);
      delete state.enrolledAt[id];
      state.paidProgramIds = state.paidProgramIds.filter((x) => x !== id);
      delete state.paidAt[id];
      delete state.paidAmountUsd[id];
      delete state.demoDayOffsetByProgram[id];
      state.completedItemKeys = state.completedItemKeys.filter(
        (key) => !key.startsWith(`${id}:`)
      );
    },
    setDemoDayOffset: (
      state,
      action: PayloadAction<{ programId: string; days: number }>
    ) => {
      const days = Math.max(0, Math.floor(action.payload.days));
      state.demoDayOffsetByProgram[action.payload.programId] = days;
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
