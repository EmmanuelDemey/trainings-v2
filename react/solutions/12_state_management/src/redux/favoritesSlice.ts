import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface FavoritesState {
  ids: string[];
}

const initialState: FavoritesState = { ids: [] };

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // Immer gives the reducer a DRAFT: `push` and `splice` record changes, and
    // Redux receives a brand-new, frozen state.
    toggled(state, action: PayloadAction<string>) {
      const index = state.ids.indexOf(action.payload);
      if (index === -1) state.ids.push(action.payload);
      else state.ids.splice(index, 1);
    },
    cleared(state) {
      state.ids = [];
    },
  },
});

export const { toggled, cleared } = favoritesSlice.actions;

// The selectors only know the part of the root state they read: no import of
// the store here, so no import cycle.
type WithFavorites = { favorites: FavoritesState };

export const selectFavoriteIds = (state: WithFavorites) => state.favorites.ids;
export const selectFavoriteCount = (state: WithFavorites) => state.favorites.ids.length;
// A boolean: `useSelector` compares it with `===`, so a row re-renders only
// when ITS star changes.
export const selectIsFavorite = (state: WithFavorites, id: string) => state.favorites.ids.includes(id);
