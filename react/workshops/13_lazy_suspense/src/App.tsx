import { useState } from 'react';
import { PeoplePage } from './pages/PeoplePage';
// TODO 1.1: this static import puts the statistics page in the main bundle,
//   even for users who never open it. Replace it with `React.lazy`, declared
//   at module level, so that Vite emits the page in its own chunk.
import StatsPage from './pages/StatsPage';

type Page = 'people' | 'stats';

export function App() {
  const [page, setPage] = useState<Page>('people');

  return (
    <main>
      <h1>Star Wars people</h1>
      <nav aria-label="Pages">
        <button
          type="button"
          aria-current={page === 'people' ? 'page' : undefined}
          onClick={() => setPage('people')}
        >
          People
        </button>
        <button
          type="button"
          aria-current={page === 'stats' ? 'page' : undefined}
          onClick={() => setPage('stats')}
        >
          Statistics
        </button>
      </nav>
      {/* TODO 1.2: wrap the pages in a <Suspense> whose fallback is
          <Loader label="Loading page…" /> (from './components/Loader'). */}
      {page === 'people' ? <PeoplePage /> : <StatsPage />}
    </main>
  );
}
