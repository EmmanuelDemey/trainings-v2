---
layout: cover
---

# 8 - Les hooks

---

# Retour dans le passé - Cycle de vie React

![React lifecycle](/images/react_lifecycle.png)


---

# Hook

* Un hook est une nouvelle syntaxe permettant de ne plus utiliser les classes pour définir les composants
* Nous permet d'accrocher du code (`to hook`) au cycle de vie du composant
* React propose des *hooks* par défaut, mais il est possible de créer les notres

* Un hook possède quelques contraintes :
    * Ne peut pas être défini dans des loop, if, sous-fonctions,...
    * Ne peut être utilisé que par des composants implémentés avec une fonction

---

# Hook - useState

* Permet de définir l'état d'un composant
* C'est l'équivalent du **this.setState** d'un composant utilisant la syntaxe des classes
* La valeur retournée est un tuple composé
    * de la valeur du state
    * d'une méthode permettant de le modifier
* A chaque modification du `state`, le composant sera regéné

---

# Hook - useState

```javascript
import { useState }  from 'react';

const CollapsiblePanel = () => {
    const [opened, setOpened] = useState(true);

    return (
        <section>
            <h2>
                <button type="button" onClick={() => setOpened(!opened)}>
                    Title
                </button>
            </h2>
            {opened && <div> ... </div>}
        </section>
    )
}
export default CollapsiblePanel;
```

---

# Hook - Automatic Batching

* Depuis **React 18**, React ne met à jour le composant qu'une seule fois même si plusieurs *state* sont mis à jour. 
* Cette fonctionnalité se nomme **Automatic Batching**

```jsx
const CollapsiblePanel = () => {
    const [opened, setOpened] = useState(true);
    const [focused, setFocused] = useState(true);

    const onClickHandler = () => {
        setOpened(!opened);
        setFocused(!focused)
    }

    return (
        <section>
            <h2>
                <button type="button" onClick={onClickHandler}>
                    Title
                </button>
            </h2>
            {opened && <div> ... </div>}
        </section>
    )
}
```

---

# Hook - useReducer

* **useReducer** est un hook permettant de faire un traitement similaire au **useState**. 
    * Modifier l'état interne d'un composant
    * Nous allons *dispatcher* une action
    * Puis créer un *reducer* permettant de *muter* l'état du composant. 

```typescript
import { useReducer } from 'react';

function reducer(state, action) {
  if (action.type === 'incremented_age') {
    return {
      age: state.age + 1
    };
  }
  throw Error('Unknown action.');
}

export default function Counter() {
  const [state, dispatch] = useReducer(reducer, { age: 42 });

  return (
    <>
      <button onClick={() => {
        dispatch({ type: 'incremented_age' })
      }}>
        Increment age
      </button>
      <p>Hello! You are {state.age}.</p>
    </>
  );
}
```

--- 

# Hook - useEffect

* Hook permettant de définir des effets de bords
* C'est l'équivalent de **componentDidMount** / **componentDidUpdate** / **componentWillUnmount** d'un composant utilisant la syntaxe des classes
* Un effet peut éventuellement nécessité une phase de `cleanup`
* Définition d'un tableau de dépendances pour éviter les exécutions multiples

```javascript
const [id, setId] = useState('');
useEffect(() => {
    fetch('api/' + id)
        .then(response => response.json())
        .then(body => ...);
}, [id]);
```

---

# Hook - useEffect

* La méthode peut retourner une fonction de `cleanup`
* Cette fonction sera automatiquement appelée par React

```javascript
useEffect(() => {
  const interval = setInterval(() => {
      ...
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

---

# Hook - useEffect

* Le code peut devenir vite illisible
* Afin de facilier la maintenabilité du code nous conseillons de nommer vos fonctions useEffect

```javascript
useEffect(function fetchData(){
   ...
}, []);
useEffect(function saveForm(){
   ...
}, []);
```

---

# Hook - useEffect

* Attention lorsque vous avez du code asynchrone dans le useEffect
* La fonction retournera une `Promise` si nous utilisons `async/await`

```javascript
// Erreur
useEffect(async () => {
    await fetch();
}, [])
```

* Vous devez définir le traitement asynchrone dans une nouvelle fonction interne

```javascript
useEffect(() => {
    async function fetchData(){
        await fetch('/api/data');
    }
    fetchData();
}, [])
```

---

# Hook - useRef

* `useRef` permet de créer une référence mutable qui persiste entre les rendus
* Utilisé pour accéder à des éléments DOM ou stocker des valeurs sans déclencher de re-rendu

```typescript
import { useRef } from 'react';

const TextInput = () => {
    const inputRef = useRef<HTMLInputElement>(null);

    const focusInput = () => {
        inputRef.current?.focus();
    };

    return (
        <>
            <input ref={inputRef} type="text" />
            <button onClick={focusInput}>Focus</button>
        </>
    );
}
```

---

# Hook - useMemo

* `useMemo` mémorise le résultat d'un calcul coûteux
* Le calcul n'est réexécuté que si l'une des dépendances change

```typescript
import { useMemo } from 'react';

const UserList = ({ users, filter }) => {
    const filteredUsers = useMemo(
        () => users.filter(u => u.name.includes(filter)),
        [users, filter]
    );

    return <ul>{filteredUsers.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

---

# Hook - useCallback

* `useCallback` mémorise une fonction pour éviter qu'elle ne soit recréée à chaque rendu
* Utile quand on passe une callback à un composant enfant optimisé avec `React.memo`

```typescript
import { useCallback } from 'react';

const Parent = () => {
    const [count, setCount] = useState(0);

    const increment = useCallback(() => {
        setCount(c => c + 1);
    }, []);

    return <Child onIncrement={increment} />;
}
```

---

# Hook - useTransition

* `useTransition` (React 18+) permet de marquer des mises à jour comme non-urgentes
* L'UI reste réactive pendant que la transition s'exécute en arrière-plan

```typescript
import { useState, useTransition } from 'react';

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isPending, startTransition] = useTransition();

    const handleChange = (e) => {
        setQuery(e.target.value);
        startTransition(() => {
            setResults(filterLargeList(e.target.value));
        });
    };

    return (
        <>
            <input value={query} onChange={handleChange} />
            {isPending && <span>Recherche...</span>}
            <ResultList results={results} />
        </>
    );
}
```

---

# Hook - custom

* Nous pouvons définir nos propres hooks
* Un hook custom correspond à un wrapper sur des hooks existant
* Permet de cacher la complexité d'une implémentation

---

# Hook - custom

```javascript
import { useMemo, useEffect, useState }  from 'react';

const useFilteredData = (filterValue) => {
    const [data, setData] = useState();

    useEffect(() => ..., []);

    return useMemo(() => data.filter(d => d.includes(filterValue)), [data, filterValue])
}
export default () => {
    const filteredData = useFilteredData("Luke");

    return (
       ...
    )
}
```

---
layout: cover
---

# Travaux Pratiques

## PW 8
