import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { PeopleApi } from './api';
import { favoritesSlice } from './favoritesSlice';
import type { FavoritesStorage } from './persistMiddleware';
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
  // TODO 8.3: `preloadedState: { favorites: { ids: loadFavorites(storage) } }`, and
  //   `middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(createPersistMiddleware(storage))`.
  // TODO 9.3: `const sagaMiddleware = createSagaMiddleware()` (from 'redux-saga'),
  //   add it to the `concat`, and `sagaMiddleware.run(rootSaga, api)` once the
  //   store exists.
  void api;
  void storage;
  const store = configureStore({
    reducer: rootReducer,
    devTools: { name: 'TP 12 — favorites' },
  });
  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];

// TODO 7.1: typed hooks, so no component writes `RootState` by hand.
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
