---
layout: cover
---

# 19 - Zustand

---

# Présentation générale

- Bibliothèque légère pour la gestion d’état
- API simple et performante, sans boilerplate
- Particulièrement adaptée pour des projets où Redux ou d'autres bibliothèques peuvent sembler trop lourdes

---

# Création d'un store Zustand

```typescript
import create from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

export default useCounterStore;
```

---

# Utilisation du store Zustand dans un composant

```typescript
import React from 'react';
import useCounterStore from './store';

const Counter = () => {
  const { count, increment, decrement } = useCounterStore();

  return (
    <div>
      <h1>Compteur : {count}</h1>
      <button onClick={increment}>Incrémenter</button>
      <button onClick={decrement}>Décrémenter</button>
    </div>
  );
};

export default Counter;
```

---

# Tester le comportement des stores Zustand

```typescript
import useCounterStore from './store';

test('incrémente le compteur', () => {
  const { count, increment } = useCounterStore.getState();

  expect(count).toBe(0);
  increment();
  expect(useCounterStore.getState().count).toBe(1);
});
```

---
layout: cover
---

# Travaux Pratiques

## WP 19
