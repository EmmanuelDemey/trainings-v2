import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface FavoritesState {
  ids: string[];
}

const initialState: FavoritesState = { ids: [] };

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // TODO 6.1: add the id when it is missing, remove it otherwise. You may
    //   "mutate" `state` (`push`, `splice`): Immer turns it into a copy.
    toggled(state, action: PayloadAction<string>) {
      void state;
      void action;
    },
    // TODO 6.1: empty the list.
    cleared(state) {
      void state;
    },
  },
});

export const { toggled, cleared } = favoritesSlice.actions;

// The selectors only know the part of the root state they read: no import of
// the store here, so no import cycle.
type WithFavorites = { favorites: FavoritesState };

// TODO 6.2: return the ids, their count, and whether `id` is one of them.
export const selectFavoriteIds = (state: WithFavorites): string[] => {
  void state;
  return [];
};
export const selectFavoriteCount = (state: WithFavorites): number => {
  void state;
  return 0;
};
export const selectIsFavorite = (state: WithFavorites, id: string): boolean => {
  void state;
  void id;
  return false;
};
