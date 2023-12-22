# Redux

- Redux est une librairie que nous devons installer via NPM
- Elle propose une architecture unidirectionnelle de la gestion de la donnée.
- Elle peutêtre étendue via l'utilisation des modules **redux-saga**, **redux-observable**, **redux-persist** ...
- Plusieurs acteurs vont intervenir :
  - Le `Store`
  - Le `State`
  - Les actions
  - Les reducers
  - Les sélecteurs

---

# Redux

- Avant d'utiliser Redux, nous devons d'abord l'installer

```shell
npm install redux react-redux redux-logger
```

---

# Redux - Reducers

- Un reducer est une fonction acceptant deux paramètres
  - le `state` précédent
  - une action
- Il doit retourner le nouveau `state`

```typescript
export function count(state: { value: number }, action: { type: string; payload: number }) {
  switch (action.type) {
    case "INC":
      return {
        value: state.value + action.payload,
      };
    case "DECR":
      return {
        value: state.value - action.payload,
      };
    default:
      return state;
  }
}
```

---

# Redux - Création

- Nous sommes à présent capable d'initialiser notre Store

```typescript
import { createStore, applyMiddleware, compose } from "redux";
import { createLogger } from "redux-logger";
import { count } from "./reducer";

const store = createStore(count, {
  value: 0,
});
export default store;
```

---

# Redux - Création

- Dans une vraie application, nous allons avoir plusieurs **Reducers**

```typescript
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { todos } from "./todos";
import { count } from "./count";

const store = createStore(
  combineReducers({
    todos,
    count,
  }),
  {}
);
export default store;
```

---

# Redux - Middlewares

- Nous pouvons associer des _middlewares_ à Redux.
- Ils seront exécutés à chaque actions émises.

```typescript
const middleware: ThunkMiddleware<State, BasicAction, ExtraThunkArg> =
  ({ dispatch, getState }) =>
  (next) =>
  (action) => {
    // The thunk middleware looks for any functions that were passed to `store.dispatch`.
    // If this "action" is really a function, call it and return the result.
    if (typeof action === "function") {
      // Inject the store's `dispatch` and `getState` methods, as well as any "extra arg"
      return action(dispatch, getState, extraArgument);
    }

    // Otherwise, pass the action down the middleware chain as usual
    return next(action);
  };
```

---

# Redux - Middlewares

- Voici un exemple avec le middleware **redux-logger**.

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

- Pour activer le plugin Chrome `Redux`

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

- Pour activer le store, nous allons, un peu comme un Context, wrapper une partie de notre application par un composant `Provider`

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

- Dernière étape est de créer nos `DumbComponent` et `ConnectedComponent`
- Toutes les données et actions récupérées par les composants connectés seront disponibles en `props` dans le `DumbComponent`

```javascript
type DumbCounterProps = {
  count: number,
  inc: (value: number) => void,
  decr: (value: number) => void,
};
export const DumbCounter = ({ count, inc, decr }: DumbCounterProps) => (
  <>
    <button onClick={() => decr(1)}> -1 </button>
    <span> {count} </span>
    <button onClick={() => inc(1)}> +1 </button>
  </>
);
```

---

# Redux - Composant connecté

- Une fois le _Dumb component_ créé, nous allons pouvois le connecter au store.

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

- Créer cette séparation n'est pas une obligation. Votre composant peut directement intéragir avec Redux.
- React Redux propose les hooks `useDispatch` et `useSelector`.

```javascript
import { useDispatch, useSelector } from "react-redux";
import { getCount } from "./store";

export default () => {
  const count = useSelector((state) => state.count.value);
  const dispatch = useDispatch();
  const inc = (p: number) => dispatch({ type: "INC", payload: p });
  const decr = (p: number) => dispatch({ type: "DECR", payload: p });

  return (
    <>
      <button onClick={() => decr(1)}> -1 </button>
      <span> {count} </span>
      <button onClick={() => inc(1)}> +1 </button>
    </>
  );
};
```

---

# Redux - Selecteurs

- Afin de faciliter l'accés au `store`, nous allons définir des sélecteurs

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

# Redux - Immer

- Ecrire du code immutable peut par dois être complexe à écrire (quand nous manipulons des tableaux ou des objets par exemple).
- Nous pouvons utiliser la librairie **Immer** permettant d'écrire du code immutable avec un syntaxe mutable.

```typescript
export function userReducerWithoutImmer(state: User, action: { type: string; payload: Address }) {
  switch (action.type) {
    case "ADD_ADDRESS":
      return {
        ...state,
        info: {
          ...state.info,
          address: action.payload,
        },
      };
    default:
      return state;
  }
}
export function userReducerWithImmer(state: User, action: { type: string; payload: Address }) {
  switch (action.type) {
    case "ADD_ADDRESS":
      return produce(state, (draftState) => {
        state.info.address = action.payload;
      });
    default:
      return state;
  }
}
```

---

# Redux et Reselect

- Nous pouvons utiliser la libraire **reselect** afin d'avoir des _selecteurs_ mémoisé.

```typescript
import { createSelector } from "reselect";

const selectShopItems = (state) => state.shop.items;
const selectTaxPercent = (state) => state.shop.taxPercent;

const selectSubtotal = createSelector(selectShopItems, (items) =>
  items.reduce((subtotal, item) => subtotal + item.value, 0)
);

const selectTax = createSelector(
  selectSubtotal,
  selectTaxPercent,
  (subtotal, taxPercent) => subtotal * (taxPercent / 100)
);

const selectTotal = createSelector(selectSubtotal, selectTax, (subtotal, tax) => ({ total: subtotal + tax }));
```

---

# Redux Thunk

- Le middleware **Redux Thunk** permet d'avoir du code asynchrone dans les actions _dispatchées_

```typescript
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers/index";

const store = createStore(rootReducer, applyMiddleware(thunk));

export const fetchTodoById = (todoId) => async (dispatch, getState) => {
  const response = await client.get(`/fakeApi/todo/${todoId}`);
  dispatch(todosLoaded(response.todos));
};

/**
 function TodoComponent({ todoId }) {
  const dispatch = useDispatch()

  const onFetchClicked = () => {
    dispatch(fetchTodoById(todoId))
  }
}
 */
```

---

# Structure de fichiers

- Nous pouvons trouver deux types de structures pour définir un store Redux :
  - Découpage technique (un répertoire actions, un répertoire reducers, ...)
  - Découpage fonctionnel (à privilégier)

```javascript
// Example de fichier manipulant une partie du state

export const INC = "INC";
export const DECR = "DECR";

export const getCount = (state) => state.count.value;

export const incr = (p) => ({ type: INC, payload: p });
export const decr = (p) => ({ type: DECR, payload: p });

export default function reducer(state, action) {}
```

---
