import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { App } from './App';
import { inMemoryPeopleApi } from './redux/api';
import { ReduxSearchPage } from './redux/ReduxSearchPage';
import { makeStore } from './redux/store';

// Part 1 (Context) at `/`, part 2 (Redux) at `/#redux` — no router needed.
const root = createRoot(document.getElementById('root')!);

if (window.location.hash === '#redux') {
  const store = makeStore({ api: inMemoryPeopleApi, storage: localStorage });
  root.render(
    <StrictMode>
      <Provider store={store}>
        <ReduxSearchPage />
      </Provider>
    </StrictMode>,
  );
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
