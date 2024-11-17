---
layout: cover
---

# 11 - Custom hook

---

# Présentation générale

- Fonction réutilisable qui encapsule une logique personnalisée
- Permet de centraliser, déporter et réutiliser de la logique
- Fonction permettant la réutilisation des hooks natifs ou custom

Un hook custom suit les mêmes règles que les hook natifs :

- Le nom de la fonction doit commencer par `use`
- Ne pas être appelé dans des blocs conditionnels ou des boucles.
- Être utilisé dans un composant fonctionnel ou un autre Hook custom.

---

# Exemple sans custom hook

```javascript
import { useState } from "react";

function CounterComponent() {
    const [count, setCount] = useState(initialValue);

    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);
    const reset = () => setCount(initialValue);

    return (
    <div>
        <p>Count: {count}</p>
        <button onClick={increment}>Increment</button>
        <button onClick={decrement}>Decrement</button>
        <button onClick={reset}>Reset</button>
    </div>
    );
}

export default CounterComponent;
```

---

# Exemple - Création de useCounter

```typescript
import { useState } from "react";

function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}
```

---

# Exemple - Utilisation de useCounter

```javascript
import { useState } from "react";

function CounterComponent() {
    const { count, increment, decrement, reset } = useCounter(10);

    return (
    <div>
        <p>Count: {count}</p>
        <button onClick={increment}>Increment</button>
        <button onClick={decrement}>Decrement</button>
        <button onClick={reset}>Reset</button>
    </div>
    );
}

export default CounterComponent;
```

---
layout: cover
---

# Travaux Pratiques

## WP 11