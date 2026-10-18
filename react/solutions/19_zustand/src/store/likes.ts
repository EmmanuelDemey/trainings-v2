import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** What the store holds — its data AND the actions that change it. */
export interface LikesState {
  likedIds: string[];
  like: (id: string) => void;
  unlike: (id: string) => void;
  reset: () => void;
}

/**
 * The likes, shared by every component that asks for them — no Provider.
 *
 * `create<LikesState>()(…)` is curried on purpose: the empty first call fixes
 * the state type, so TypeScript can still infer the middleware's own types
 * (this is what gives `useLikes.persist` its API).
 */
export const useLikes = create<LikesState>()(
  persist(
    (set) => ({
      likedIds: [],

      // Returning the SAME state object tells Zustand nothing changed: no
      // subscriber is notified, no component re-renders. A double click on
      // "like" stays free.
      like: (id) =>
        set((state) => (state.likedIds.includes(id) ? state : { likedIds: [...state.likedIds, id] })),

      // `set` MERGES at the top level, so returning only `likedIds` keeps the
      // actions. Never mutate `state.likedIds` in place: the array must be new
      // for the selectors below to see a change.
      unlike: (id) => set((state) => ({ likedIds: state.likedIds.filter((likedId) => likedId !== id) })),

      reset: () => set({ likedIds: [] }),
    }),
    {
      // The localStorage key — look for it in the DevTools, Application tab.
      name: 'star-wars-likes',
      storage: createJSONStorage(() => localStorage),
      // Persist the data only. The actions are recreated on every start, and
      // anything transient you add later (a hovered id, a loading flag…) has
      // no business surviving a reload.
      partialize: (state) => ({ likedIds: state.likedIds }),
      // Bump it, and add a `migrate`, the day `likedIds` changes shape.
      version: 1,
    },
  ),
);

/*
 * Selectors live next to the store, as plain functions of the state: they are
 * reused, named, and testable without React. A component re-renders only when
 * what its selector returns changes (compared with `Object.is`).
 */

/** Whether one given person is liked — a boolean, so only that row re-renders. */
export const selectIsLiked =
  (id: string) =>
  (state: LikesState): boolean =>
    state.likedIds.includes(id);

/** How many people are liked. */
export const selectLikeCount = (state: LikesState): number => state.likedIds.length;
