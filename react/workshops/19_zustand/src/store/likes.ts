import { create } from 'zustand';

/** What the store holds — its data AND the actions that change it. */
export interface LikesState {
  likedIds: string[];
  like: (id: string) => void;
  unlike: (id: string) => void;
  reset: () => void;
}

// TODO 4.1: wrap the initializer below in the `persist` middleware
// (`zustand/middleware`), under the localStorage key 'star-wars-likes'.
// Persist `likedIds` only (`partialize`), and give it a `version`.
export const useLikes = create<LikesState>()((set) => ({
  likedIds: [],

  like: (id) => {
    // TODO 1.1: add `id` to `likedIds` with `set`. Liking someone already
    // liked must leave the state untouched — and notify nobody.
  },

  unlike: (id) => {
    // TODO 1.2: remove `id` from `likedIds`, without mutating the array.
  },

  reset: () => {
    // TODO 1.3: forget every like.
  },
}));

/** Whether one given person is liked. */
export const selectIsLiked =
  (id: string) =>
  (state: LikesState): boolean => {
    // TODO 2.1: read it from `state`.
    return false;
  };

/** How many people are liked. */
export const selectLikeCount = (state: LikesState): number => {
  // TODO 2.2: count them.
  return 0;
};
