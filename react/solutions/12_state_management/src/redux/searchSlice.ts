import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Person } from '../model/person';

export interface SearchState {
  query: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  results: Person[];
  error: string | null;
}

const initialState: SearchState = { query: '', status: 'idle', results: [], error: null };

// Plain actions only: the reducer records what happened, the SAGA decides when
// to call the API. No thunk, no async in here.
export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    searchRequested(state, action: PayloadAction<string>) {
      state.query = action.payload;
      state.status = 'loading';
      state.error = null;
    },
    searchSucceeded(state, action: PayloadAction<Person[]>) {
      state.status = 'succeeded';
      state.results = action.payload;
    },
    searchFailed(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const { searchRequested, searchSucceeded, searchFailed } = searchSlice.actions;
