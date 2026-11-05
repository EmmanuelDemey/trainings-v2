import type { SagaIterator } from 'redux-saga';
import type { PeopleApi } from './api';

export const SEARCH_DEBOUNCE_MS = 300;

// TODO 9.1: write `function* search(api: PeopleApi, action: PayloadAction<string>)`:
//   - `yield delay(SEARCH_DEBOUNCE_MS)` — the debounce
//   - create an `AbortController`
//   - in a `try`: `const results = yield call(api.searchPeople, action.payload, controller.signal)`,
//     then `yield put(searchSucceeded(results))`
//   - in the `catch`: `yield put(searchFailed(message))`
//   - in the `finally`: `if (yield cancelled()) controller.abort()`
//   The effects come from 'redux-saga/effects', the actions from './searchSlice'.

export function* rootSaga(api: PeopleApi): SagaIterator {
  // TODO 9.2: `yield takeLatest(searchRequested.type, search, api)` — a new
  //   query CANCELS the task of the previous one.
  void api;
}
