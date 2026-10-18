/** The ids of the favorite characters, in the order they were added. */
export type FavoritesState = readonly string[];

/** Every way the favorites can change — named after what HAPPENED. */
export type FavoritesAction = { type: 'toggled'; id: string } | { type: 'cleared' };

/**
 * A pure function: same state + same action = same result, no mutation, no
 * side effect. That is what makes it testable without React at all.
 */
export function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'toggled':
      return state.includes(action.id) ? state.filter((id) => id !== action.id) : [...state, action.id];
    case 'cleared':
      // Already empty: return the SAME array, so React can skip the re-render.
      return state.length === 0 ? state : [];
  }
}
