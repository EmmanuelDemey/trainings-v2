import { HomePage } from './pages/HomePage';

export function App() {
  // TODO 2.3: hold the current page with `useReducer(navigationReducer,
  //           initialNavigation)`, render <PersonPage> or <HomePage> from it,
  //           and dispatch 'showPerson' / 'goHome' from their callbacks.
  return <HomePage onSelect={() => {}} />;
}
