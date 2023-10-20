# Introduction à Redux Saga

- Redux Saga est un librairie permettant de rendre les code asynchrone

  - plus simple à implémenter
  - plus simple à maintenir
  - plus simple à tester

- Il utilise une syntaxe JavaScript que nous nommons les **générateurs**.
- Il se veut le concurrent de **redux-thunk** sans le \*callback hell\*\*
- Possibe d'utiliser une version typé de Saga via le module **typed-redux-saga**.

```shell
npm install redux-saga
```

---

# Installation

- Saga est un _middleware_ à Redux.

```javascript
import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

import reducer from "./reducers";
import mySaga from "./sagas";

const sagaMiddleware = createSagaMiddleware();
const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
});

sagaMiddleware.run(mySaga);
```

---

# Concepts fondamentaux

```javascript
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import Api from "...";

export function* fetchUser(action) {
  try {
    const user = yield call(Api.fetchUser, action.payload.userId);
    yield put({ type: "USER_FETCH_SUCCEEDED", user: user });
  } catch (e) {
    yield put({ type: "USER_FETCH_FAILED", message: e.message });
  }
}

function* mySaga() {
  yield takeEvery("USER_FETCH_REQUESTED", fetchUser);
  // yield takeLatest('USER_FETCH_REQUESTED', fetchUser)
}

export default mySaga;
```

---

# Tests Unitaires

- L'un des avantages poussés par Saga est sa testabilité.

```javascript
import { call, put } from "redux-saga/effects";
import Api from "...";
import { fetchUser } from "./sagas";

test("fetchUser Saga test", (assert) => {
  const gen = fetchUser({ payload: { userId: 1 } });

  assert.deepEqual(gen.next().value, call(Api.fetchUser, 1), "fetchUser Saga must call Api.fetchUser(1)");

  assert.deepEqual(
    gen.next().value,
    put({ type: "USER_FETCH_SUCCEEDED" }),
    "fetchUser Saga must dispatch an USER_FETCH_SUCCEEDED action"
  );

  assert.deepEqual(gen.next(), { done: true, value: undefined }, "fetchUser Saga must be done");

  assert.end();
});
```
