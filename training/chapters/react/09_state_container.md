---
layout: cover
---

# State Container

---

# State Container

* Une gestion centralisée de l'état de l'application permet :
  * D'avoir une seule source de vérité
  * Centraliser toutes les actions sur cet état
  * Eviter de passer des props de composant en composant enfant
  * Eviter d'avoir du code spaghetti
* Attention le mindset à avoir est différent de celui que nous avons depuis le début de cette formation
* Plusieurs solutions possibles : Context, Redux, MobX ou encore Recoil

---
src: ./includes/10_context.md
hide: false
---

--- 

# Redux

* Redux est une librairie que nous devons installer via NPM
* Elle propose une architecture unidirectionnelle de la gestion de la donnée.
* Plusieurs acteurs vont intervenir :
  * Le `Store`
  * Le `State`
  * Les actions
  * Les reducers
  * Les sélecteurs

---

# Redux

* Avant d'utiliser Redux, nous devons d'abord l'installer

```shell
npm install redux react-redux redux-logger
```

---

# Redux - Reducers

* Un reducer est une fonction acceptant deux paramètres
  * le `state` précédent
  * une action
* Il doit retourner le nouveau `state`

```javascript
export function count(state: { value: number}, action: { type: string, payload: number }) {
  switch (action.type) {
    case "INC":
      return {
        value: state.value + action.payload
      };
    case "DECR":
      return {
        value: state.value - action.payload
      }
    default:
      return state;
  }
}
```

---

# Redux - Création

* Nous sommes à présent capable d'initialiser notre Store

```javascript
import { createStore, applyMiddleware, compose } from "redux";
import { createLogger } from "redux-logger";
import { count } from "./reducer";

const store = createStore(
  count,
  {
    value: 0
  }
);
export default store;
```

---

# Redux - Création

* Dans une vraie application, nous allons avoir plusieurs **Reducers**

```javascript
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { todos } from './todos'
import { count } from './count'

const store = createStore(
  combineReducers({
    todos,
    count
  }),
  {}
);
export default store;
```

---

# Redux - Middlewares

* Nous pouvons associer des *middlewares* à Redux. 
* Ils seront exécutés à chaque actions émises.

```typescript
const middleware: ThunkMiddleware<State, BasicAction, ExtraThunkArg> =
  ({ dispatch, getState }) =>
  next =>
  action => {
    // The thunk middleware looks for any functions that were passed to `store.dispatch`.
    // If this "action" is really a function, call it and return the result.
    if (typeof action === 'function') {
      // Inject the store's `dispatch` and `getState` methods, as well as any "extra arg"
      return action(dispatch, getState, extraArgument)
    }

    // Otherwise, pass the action down the middleware chain as usual
    return next(action)
  }
```

---

# Redux - Middlewares

* Voici un exemple avec le middleware **redux-logger**.

```javascript
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { createLogger } from "redux-logger";
import { todos } from './todos'
import { count } from './count'

const store = createStore(
  combineReducers({
    todos,
    count
  }),
  {},
  compose(applyMiddleware(createLogger())
);
export default store;
```

---

# Redux - Création

* Pour activer le plugin Chrome `Redux`

```javascript
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { createLogger } from "redux-logger";
import { todos } from './todos'
import { count } from './count'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  combineReducers({
    todos,
    count
  }),
  {},
  composeEnhancers(applyMiddleware(createLogger())
);
export default store;
```

---

# Redux - Activation du store

* Pour activer le store, nous allons, un peu comme un Context, wrapper une partie de notre application par un composant `Provider`

```javascript
import { Provider } from "react-redux";
import store from "./store";
...
<Provider store={store}>
    ...
</Provider>
```

---

# Redux - Composant connecté

* Dernière étape est de créer nos `DumbComponent` et `ConnectedComponent`
* Toutes les données et actions récupérées par les composants connectés seront disponibles en `props` dans le `DumbComponent`

```javascript
type DumbCounterProps = {
  count: number;
  inc: (value: number) => void,
  decr: (value: number) => void
}
export const DumbCounter = ({
  count, inc, decr,
}: DumbCounterProps) => (
  <>
    <button onClick={() => decr(1)}> -1 </button>
    <span> {count} </span>
    <button onClick={() => inc(1)}> +1 </button>
  </>
)
```

---

# Redux - Composant connecté

* Une fois le *Dumb component* créé, nous allons pouvois le connecter au store. 

```javascript
import { connect } from "react-redux";

const mapStateToProps = (state) => {
  return {
    count: state.count.value, 
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    inc: (p: number) => dispatch({ type: 'INC', payload: p }),
    decr: (p: number) => dispatch({ type: 'DECR' paryload: p}),
  }
}

export const DumbCounter = ...

export default connect(mapStateToProps, mapDispatchToProps)(DumbCounter);
```

---

# Redux - Hooks

* Créer cette séparation n'est pas une obligation. Votre composant peut directement intéragir avec Redux. 
* React Redux propose les hooks `useDispatch` et `useSelector`.

```javascript
import { useDispatch, useSelector} from "react-redux";
import { getCount } from "./store";

export default () => {
  const count = useSelector(state => state.count.value)
  const dispatch = useDispatch();
  const inc = (p: number) => dispatch({ type: 'INC', payload: p})
  const decr = (p: number) => dispatch({ type: 'DECR', payload: p})

  return (
      <>
        <button onClick={() => decr(1)}> -1 </button>
        <span> {count} </span>
        <button onClick={() => inc(1)}> +1 </button>
      </>
  )
}
```

---

# Redux - Selecteurs

* Afin de faciliter l'accés au `store`, nous allons définir des sélecteurs

```javascript
import { connect } from "react-redux";

export const getCounter = (state) => state.count.value;
export const isGreaterThan = (state, limit) => state.count.value > limit;

const mapStateToProps = (state) => {
  return {
    count: getCounter(state),
    isGreaterThan100: isGreaterThan(state, 100) 
  }
}

const mapDispatchToProps = ...

export const DumbCounter = ...

export default connect(mapStateToProps, mapDispatchToProps)(DumbCounter);
```

---

# Structure de fichiers

* Nous pouvons trouver deux types de structures pour définir un store Redux :
  * Découpage technique (un répertoire actions, un répertoire reducers, ...)
  * Découpage fonctionnel (à privilégier)

```javascript
// Example de fichier manipulant une partie du state

export const INC = 'INC';
export const DECR = 'DECR';

export const getCount = state => state.count.value;

export const incr = (p) => ({ type: INC, payload: p});
export const decr = (p) => ({ type: DECR, payload: p});

export default function reducer(state, action) {}
```

---

# Redux Toolkit

* Redux évolue et propose à présent une solution mieux packagée pour intéragir avec les Stores.
* Une partie d'un `store Redux` sera configuré via un `Slice`.
* La méthode **createSlice** utilise **createAction**, **createReducer** et la librairie **Immer**.

```javascript
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type CounterState = { value: number }
const initialState: CounterState = {
  value: 0,
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    inc: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
    decr: (state, action: PayloadAction<number>) => {
      state.value -= action.payload
    }
  }
})
```

---

# Redux Toolkit

* Un `slice` peut ainsi exposer
  * les actions que nous pourrons utiliser dans nos composants
  * le `reducer` que nous pourrons activer dans notre `store`

```javascript
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: 0,
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    inc: ...,
    decr: ...
  }
})

export const { inc, decr } = counterSlice.actions
export default counterSlice.reducer
```

---

# Redux Toolkit - Reducer

* Enregistrement du `reducer` dans le `store`

```typescript
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'

const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export default store

```

---

# Redux Toolkit - Actions

* Utilisation des actions générées dans un composant

```javascript
import { RootState } from '../../app/store'
import { useSelector, useDispatch } from 'react-redux'
import { decr, inc } from './counterSlice'

export function Counter() {
  const count = useSelector((state: RootState) => state.counter.value)
  const dispatch = useDispatch()

  return (
    <>
        <button onClick={() => dispatch(decr(1))}> -1 </button>
        <span> {count} </span>
        <button onClick={() => dispatch(inc(1))}> +1 </button>
    </>
  )
}
```

---
layout: cover
---

# Travaux Pratiques

---

# Introduction à Redux Saga

* Redux Saga est un librairie permettant de rendre les code asynchrone
  * plus simple à implémenter
  * plus simple à maintenir
  * plus simple à tester

* Il utilise une syntaxe JavaScript que nous nommons les **générateurs**.
* Il se veut le concurrent de **redux-thunk** sans le *callback hell** 
* Possibe d'utiliser une version typé de Saga via le module **typed-redux-saga**.

```shell
npm install redux-saga
```

--- 

# Installation

* Saga est un *middleware* à Redux. 

```javascript
import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'

import reducer from './reducers'
import mySaga from './sagas'

const sagaMiddleware = createSagaMiddleware()
const store = configureStore({
  reducer, 
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
})

sagaMiddleware.run(mySaga)

```

--- 

# Concepts fondamentaux

```javascript
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import Api from '...'

export function* fetchUser(action) {
  try {
    const user = yield call(Api.fetchUser, action.payload.userId)
    yield put({ type: 'USER_FETCH_SUCCEEDED', user: user })
  } catch (e) {
    yield put({ type: 'USER_FETCH_FAILED', message: e.message })
  }
}


function* mySaga() {
  yield takeEvery('USER_FETCH_REQUESTED', fetchUser)
  // yield takeLatest('USER_FETCH_REQUESTED', fetchUser)
}

export default mySaga
```

---

# Tests Unitaires

* L'un des avantages poussés par Saga est sa testabilité. 

```javascript
import { call, put } from 'redux-saga/effects'
import Api from '...'
import { fetchUser } from './sagas'

test('fetchUser Saga test', (assert) => {
  const gen = fetchUser({ payload: {userId: 1 }})

  assert.deepEqual(
    gen.next().value,
    call(Api.fetchUser, 1),
    'fetchUser Saga must call Api.fetchUser(1)'
  )

  assert.deepEqual(
    gen.next().value,
    put({type: 'USER_FETCH_SUCCEEDED'}),
    'fetchUser Saga must dispatch an USER_FETCH_SUCCEEDED action'
  )

  assert.deepEqual(
    gen.next(),
    { done: true, value: undefined },
    'fetchUser Saga must be done'
  )

  assert.end()
})
```
