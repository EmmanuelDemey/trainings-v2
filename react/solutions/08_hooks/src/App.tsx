import { useReducer } from 'react';
import { initialNavigation, navigationReducer } from './navigation';
import { HomePage } from './pages/HomePage';
import { PersonPage } from './pages/PersonPage';

export function App() {
  // `useReducer` instead of two `useState` (page + personId): the two values
  // change together, and the reducer makes an impossible combination — a
  // person page without a person — impossible to write.
  const [navigation, dispatch] = useReducer(navigationReducer, initialNavigation);

  // Each page is mounted on its own: going home unmounts PersonPage (its
  // effect cleans up) and remounts HomePage (its effect focuses the filter).
  return navigation.page === 'person' ? (
    <PersonPage personId={navigation.personId} onBack={() => dispatch({ type: 'goHome' })} />
  ) : (
    <HomePage onSelect={(personId) => dispatch({ type: 'showPerson', personId })} />
  );
}
