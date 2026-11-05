import { cleared, selectFavoriteCount } from './favoritesSlice';
import { ReduxFavoriteButton } from './ReduxFavoriteButton';
import { searchRequested } from './searchSlice';
import { useAppDispatch, useAppSelector } from './store';

/** The Redux half of the TP: a debounced search, and the same stars. */
export function ReduxSearchPage() {
  const dispatch = useAppDispatch();
  const query = useAppSelector((state) => state.search.query);
  const status = useAppSelector((state) => state.search.status);
  const results = useAppSelector((state) => state.search.results);
  const error = useAppSelector((state) => state.search.error);
  const count = useAppSelector(selectFavoriteCount);

  return (
    <main className="app">
      <header className="header">
        <h1>Star Wars search</h1>
        <p>Favorites: {count}</p>
        <button type="button" onClick={() => dispatch(cleared())} disabled={count === 0}>
          Clear favorites
        </button>
      </header>
      <p>
        <label htmlFor="people-search">Search by name</label>{' '}
        <input
          id="people-search"
          type="search"
          value={query}
          onChange={(event) => dispatch(searchRequested(event.target.value))}
        />
      </p>
      {status === 'loading' && <p role="status">Searching…</p>}
      {status === 'failed' && <p role="alert">{error}</p>}
      {status === 'succeeded' && (
        <ul aria-label="Results">
          {results.map((person) => (
            <li key={person.id}>
              <ReduxFavoriteButton person={person} /> {person.name}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
