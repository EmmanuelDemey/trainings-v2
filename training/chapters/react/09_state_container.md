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

---

# State Container

* Attention le mindset à avoir est différent de celui que nous avons depuis le début de cette formation
* Plusieurs solutions possibles : Context, Redux, MobX ou encore Recoil

---
src: ./includes/10_context.md
hide: false
---

# Redux

* Redux est une librairie que nous devons installer via NPM
* Elle propose une architecture unidirectionnelle de la gestion de la donnée.

---

# Redux

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

---

# Redux - Reducers

```javascript
export function count(state, action) {
  switch (action.type) {
    case "INC":
      return state + action.payload;
    case "DECR":
      return state - action.payload;
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
  0,
  compose(applyMiddleware(createLogger())
);
export default store;
```

---

# Redux - Création

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

# Redux - Conmposant connecté

* Dernière étape est de créer nos `DumbComponent` et `ConnectedComponent`
* Toutes les données et actions récupérées par les composants connectés seront disponibles en `props` dans le `DumbComponent`

---

# Redux - Composant connecté

```javascript
import { connect } from "react-redux";
...

export const DumbCounter = ({
  count,
  inc,
  decr,
}) => {
  <>
    <button onClick={() => decr(1)}> -1 </button>
    <span> {count} </span>
    <button onClick={() => inc(1)}> +1 </button>
  </>
}
```

---

# Redux - Hooks

* React Redux propose les hooks `useDispatch` et `useSelector`.

```javascript
import { useDispatch, useSelector} from "react-redux";
import { getCount } from "./store";

export const DumbCounter = () => {
  const count = useSelector(state => getCount(state))
  const dispatch = useDispatch();
  const inc = (p) => dispatch({ type: 'INC', payload: p})
  const decr = (p) => dispatch({ type: 'DECR', payload: p})

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
export const getCount = (state) => state;
export const isGreaterThan = (state, limit) => state > limit;
```

---

# Structure de fichiers

* Nous pouvons trouver deux types de structures pour définir un store Redux :
  * Découpage technique (un répertoire actions, un répertoire reducers, ...)
  * Découpage fonctionnel (à privilégier)

---

# Structure de fichiers

```javascript
// Example de fichier manipulant une partie du state

export const INC = 'INC';
export const DECR = 'DECR';

export const getCount = state => state;

export const incr = (p) => ({ type: INC, payload: p});
export const decr = (p) => ({ type: DECR, payload: p});

export default function reducer(state, action) {}
```

---

# Outils

* Nous vous conseillons d'installer les outils suivants :
  * React Redux : Plugin Chrome
  * Redux Toolkit : Librairie utilitaire permettant "simplifier" la création d'un store.

---

# Redux Toolkit

* Une partie d'un `store Redux` sera configuré via un `Slice`.

```javascript
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: 0,
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    inc: (state, action) => {
      state.value += action.payload
    },
    decr: (state, action) => {
      state.value -= action.payload
    }
  }
})
```

---

# Redux Toolkit

* Un `slice` pour ainsi exposer
  * les actions que nous pourrons utiliser dans nos composants
  * le `reducer` que nous pourrons activer dans notre `store`

```javascript
export const { inc, decr } = counterSlice.actions

export default counterSlice.reducer
```

---

# Redux Toolkit - Reducer

* Enregistrement du `reducer` dans le `store`

```javascript
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'

export default configureStore({
  reducer: {
    counter: counterReducer,
  },
})
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
        <button onClick={() => dispatch(decr())}> -1 </button>
        <span> {count} </span>
        <button onClick={() => dispatch(inc())}> +1 </button>
    </>
  )
}
```