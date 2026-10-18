import { lazy, Suspense, useState } from 'react';
import { Loader } from './components/Loader';
import { PeoplePage } from './pages/PeoplePage';

// `lazy` turns the static import into a dynamic `import()`: Vite emits the page
// in its own chunk, downloaded the first time it renders. Declared at module
// level — inside the component it would be a NEW component on each render,
// remounted (and its state lost) every time.
const StatsPage = lazy(() => import('./pages/StatsPage'));

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
      {/* The fallback shows while the chunk downloads — once, the first time. */}
      <Suspense fallback={<Loader label="Loading page…" />}>
        {page === 'people' ? <PeoplePage /> : <StatsPage />}
      </Suspense>
    </main>
  );
}
