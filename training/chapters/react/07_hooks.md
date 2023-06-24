---
layout: cover
---

# Les hooks

---

# Hook

* Un hook est une nouvelle syntaxe permettant de ne plus utiliser les classes pour définir les composants
* Nous permet d'accrocher du code (`to hook`) au cycle de vie du composant
* React propose des *hooks* par défaut, mais il est possible de créer les notres

---

# Hook

* Un hook possède quelques contraintes :
    * Ne peut pas étre défini dans des loop, if, sous-fonctions,...
    * Ne peut être utilisé que par des composants implémentés avec une fonction

---

# Hook - useState

* Permet de définir l'état d'un composant
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
                <button onClick={() => setOpened(!opened)}>
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

# Hook - useEffect

* Hook permettant de définir des effets de bords
* Un effet peut éventuellement nécessité une phase de `cleanup`
* Définition d'un tableau de dépendances pour éviter les exécutions multiples

---

# Hook - useEffect

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
}, [];
useEffect(function saveForm(){
   ...
}, []);
```

---

# Hook - useEffect

* Attention lorsque vous avez du code asynchrone dans le useEffect
* La fonction retournera une `Promise` si nous utilisons `async/await`

```
// Erreur
useEffect(async () => {
    await fetch();
}, [])
```

---

# Hook - useEffect

* Vous devez définir le traitement asynchrone dans une nouvelle fonction

```javascript
useEffect(async () => {
    async function fetchData(){
        await fetchDate();
    }
    fetchData();
}, [])
```

---

# Hook - useMemo

* De manière similaire à `useCallback`, permet de `mémoizer` une valeur

```javascript
import { useMemo }  from 'react';

const PeopleTable = ({ people }) => {
    const filteredData = useMemo(() => {
        return people.filter(d => ...)
    }, [people])

    return (
       ...
    )
}
export default App;
```

---

# Hook - useCallback

* Le problème avec la solution ci-dessous est que la méthode est redéfinir lors de chaque rendu.

```javascript
const Button = ({ id }) => {
    return (
        <button onClick={() => { ... }}> Title </button>
    )
}
export default Button;
```

---

# Hook - useCallback

* Ce hook permet d'éviter de redéfinir une nouvelle instance à chaque rendu d'un composant
* Notre fonction est `memoizé`

```javascript
import { useCallback }  from 'react';

const Button = ({ id }) => {
    const clickHandler = useCallback(() => {
        ...
    }, [id]);

    return (
        <button onClick={clickHandler}> Title </button>
    )
}
export default Button;
```

---

# Hook - custom

* Nous pouvons définir nos propres hook
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