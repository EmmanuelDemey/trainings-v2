---
layout: cover
---

# 5 - Premiers pas avec React

<br />

## Génération de la vue

---

# JSX

* JSX est une extension du langage JavaScript
* Il apporte du sucre syntaxique permettant de manipuler les éléments d'une application React
* Il sera ensuite "converti" par des outils comme *Babel*
* React possède plusieurs `renderer` : 
    * `react-dom`, 
    * `next.js` 
    * `react native`


```jsx
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

# JSX

```jsx
import { createElement } from 'react';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  createElement(
    HelloMessage, {content: 'Hello'},
      createElement(Title, {content: 'World'}, null)
    )
);
```

---

# Interpolation

* L'interpolation est le mécanisme permettant d'insérer une valeur dans du code JSX.
* Nous utilisons la syntaxe `{ expession }`.
* Attention : `class` et `for` sont des mots reservés en JavaScript. Il faut donc utiliser `className` et `htmlFor`.

```typescript
const App = () => {
   const title: string = 'Title';
   const src: string = 'http://domain.com/image.png';

   return (
       <div>
            <h1> {title} </h1>
            <img src={src} alt=""/>
        </div>
   );
}
export default App;
```

---

# Fragment

* Un composant React doit toujours retourner une grape de composants composés d'un élément `root`.
* Afin d'éviter d'insérer des éléments HTML inutiles, vous pouvez utiliser les `Fragment`.
* Utilisation des balises `<Fragment>...</Fragment>` ou `<>...</>`

```typescript
import { Fragment } from 'react';

const App = () => {
   const title: string = 'Title';
   const src: string = 'http://domain.com/image.png';

   return (
       <Fragment>
            <h1> {title} </h1>
            <img src={src} alt=""/>
        </Fragment>
   );
}
export default App;
```

---

# JSX et JavaScript

* Facilité de manipuler des éléments HTML via l'utilisation des méthodes disponibles dans l'API JavaScript
* Nous pouvons par exemple afficher un élément JSX en fonction d'une condition.

```javascript
const LogoutButton = () => {
    const isLoggedIN = ....

    return isLoggedIN && <button>Logout</button>
}
export default LogoutButton;
```

---

# JSX et JavaScript

* Ou encore avoir autant d'éléments JSX que d'éléments dans un tableau

```typescript
type MenuItem = {
    id: string;
    link: string;
    label: string;
}

const Nav = () => {
    const menuItems: MenuItem[] = [ ... ];
    return (
        <ul>
            {menuItems.map(({link, label}) => {
                return <li><a href={link}>{label}</a></li>
            })}
        </ul>
    )
}
export default Nav;
```

---

# Utilisation de l'attribut key

* Pour des raisons de performance, il est fortement recommandé de définir l'attribut `key` dès que nous itérons sur un tableau.
* Nous pouvons utiliser 
    * soit en utilisant l'attribut `index` des fonctions `forEach`et `map`
    * soit via une propriété de l'objet

---

# Utilisation de l'attribut key

```typescript
type MenuItem = {
    id: string;
    link: string;
    label: string;
}

const Nav = () => {
    const menuItems: MenuItem[] = [ ... ];
    return (
        <ul>
            {menuItems.map(({link, label, id}) => {
                return <li key={id}><a href={link}>{label}</a></li>
            })}
        </ul>
    )
}
export default Nav;
```

---
layout: cover
---

# Travaux Pratiques

## PW 5
