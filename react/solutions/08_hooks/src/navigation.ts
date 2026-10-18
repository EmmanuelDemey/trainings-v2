// Which page is shown — a tiny state machine. A router replaces it in
// chapter 14; until then, it is a perfect fit for `useReducer`.

export type NavigationState = { page: 'home' } | { page: 'person'; personId: string };

export type NavigationAction = { type: 'showPerson'; personId: string } | { type: 'goHome' };

export const initialNavigation: NavigationState = { page: 'home' };

/**
 * A reducer is a PURE function: (state, action) → next state. No side effect,
 * no mutation — it returns a new object, which is how React knows something
 * changed.
 */
export function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'showPerson':
      return { page: 'person', personId: action.personId };
    case 'goHome':
      // Already home: return the SAME object, and React skips the re-render.
      return state.page === 'home' ? state : { page: 'home' };
  }
}
