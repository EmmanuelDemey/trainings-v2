import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import type { PeopleApi } from './api';
import { favoritesSlice } from './favoritesSlice';
import { createPersistMiddleware, loadFavorites, type FavoritesStorage } from './persistMiddleware';
import { rootSaga } from './searchSaga';
import { searchSlice } from './searchSlice';

const rootReducer = combineReducers({
  favorites: favoritesSlice.reducer,
  search: searchSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

interface StoreDependencies {
  api: PeopleApi;
  storage: FavoritesStorage;
}

/**
 * A function, not a module-level singleton: every spec builds a fresh store
 * with its own fakes, and the app builds the real one in `main.tsx`.
 */
export function makeStore({ api, storage }: StoreDependencies) {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: rootReducer,
    preloadedState: { favorites: { ids: loadFavorites(storage) } },
    // Keep the defaults (thunk, the immutability and serializability checks in
    // development), add ours after them.
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(sagaMiddleware, createPersistMiddleware(storage)),
    // The Redux DevTools extension is on by default outside production; the
    // name tells the stores apart in its dropdown.
    devTools: { name: 'TP 12 — favorites' },
  });

  // After the store exists: the saga middleware needs it to run.
  sagaMiddleware.run(rootSaga, api);
  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];

export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
