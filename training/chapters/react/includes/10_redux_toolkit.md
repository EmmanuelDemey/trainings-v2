# Redux Toolkit

- Redux évolue et propose à présent une solution mieux packagée pour intéragir avec les Stores.
- Une partie d'un `store Redux` sera configuré via un `Slice`.
- La méthode **createSlice** utilise **createAction**, **createReducer** et la librairie **Immer**.

```javascript
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type CounterState = { value: number };
const initialState: CounterState = {
  value: 0,
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    inc: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    decr: (state, action: PayloadAction<number>) => {
      state.value -= action.payload;
    },
  },
});
```

---

# Redux Toolkit

- Un `slice` peut ainsi exposer
  - les actions que nous pourrons utiliser dans nos composants
  - le `reducer` que nous pourrons activer dans notre `store`

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

- Enregistrement du `reducer` dans le `store`

```typescript
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";

const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
```

---

# Redux Toolkit - Actions

- Utilisation des actions générées dans un composant

```javascript
import { RootState } from "../../app/store";
import { useSelector, useDispatch } from "react-redux";
import { decr, inc } from "./counterSlice";

export function Counter() {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <>
      <button onClick={() => dispatch(decr(1))}> -1 </button>
      <span> {count} </span>
      <button onClick={() => dispatch(inc(1))}> +1 </button>
    </>
  );
}
```

---

# Redux Toolkit - createSelector

- Redux Toolkit réexporte la fonction **createSelector** du module **reselect**

```typescript
mport { createSelector } from "@reduxjs/toolkit";

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

# Redux Toolkit - createAsyncThunk

- Redux Toolkit active par défaut **Redux Thunk**
- Pour créer un thunk, nous allons utiliser la méthode **createAsyncThunk**
- Nous pourrons automatiquement intéragir avec les différents états du traitement asynchrone: pending, fulfilled ou rejected

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const response = await client.get('/fakeApi/todos')
  return response.todos
})

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: { },
  extraReducers: builder => {
    builder
      .addCase(fetchTodos.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        ...
      })
  }
})
```

