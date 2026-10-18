/** The ids of the favorite characters, in the order they were added. */
export type FavoritesState = readonly string[];

/** Every way the favorites can change — named after what HAPPENED. */
export type FavoritesAction = { type: 'toggled'; id: string } | { type: 'cleared' };

/** A pure function: same state + same action = same result, no mutation. */
export function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  // TODO 3.1: 'toggled' adds the id when it is missing, removes it otherwise.
  // TODO 3.2: 'cleared' empties the list — returning the SAME array when it is
  //           already empty. Use a `switch` on `action.type`: TypeScript then
  //           narrows `action`, and checks that every case returns.
  void action;
  return state;
}
