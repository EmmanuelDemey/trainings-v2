// Which page is shown — a tiny state machine. A router replaces it in
// chapter 14; until then, it is a perfect fit for `useReducer`.

export type NavigationState = { page: 'home' } | { page: 'person'; personId: string };

export type NavigationAction = { type: 'showPerson'; personId: string } | { type: 'goHome' };

export const initialNavigation: NavigationState = { page: 'home' };

export function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  // TODO 2.1: 'showPerson' → the person page of `action.personId`.
  // TODO 2.2: 'goHome' → the home page. When already home, return `state`
  //           itself. Never mutate `state`.
  return state;
}
