import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
import { call, cancelled, delay, put, takeLatest } from 'redux-saga/effects';
import type { PeopleApi } from './api';
import { searchFailed, searchRequested, searchSucceeded } from './searchSlice';

export const SEARCH_DEBOUNCE_MS = 300;

/**
 * One search. `takeLatest` CANCELS the previous task when a new query comes:
 * while it waits in `delay`, that is a debounce; while it waits for the API,
 * its answer is simply never put.
 */
function* search(api: PeopleApi, action: PayloadAction<string>): SagaIterator {
  yield delay(SEARCH_DEBOUNCE_MS);
  const controller = new AbortController();
  try {
    // `call` rather than `api.searchPeople(…)`: the effect is a plain object,
    // a saga test could check it without running the API.
    const results = yield call(api.searchPeople, action.payload, controller.signal);
    yield put(searchSucceeded(results));
  } catch (error) {
    yield put(searchFailed(error instanceof Error ? error.message : 'Unknown error'));
  } finally {
    // Cancelled by a newer search: abort the HTTP request too.
    if (yield cancelled()) controller.abort();
  }
}

export function* rootSaga(api: PeopleApi): SagaIterator {
  yield takeLatest(searchRequested.type, search, api);
}
