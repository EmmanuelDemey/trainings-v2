---
layout: cover
---

# Génération de la vue

---

# JSX

* JSX est une extension du langage JavaScript
* Il apporte du sucre syntaxique permettant de manipuler les éléments d'une application React
* Il sera ensuite "converti" par des outils comme *Babel*
* React possède plusieurs `renderer` : `react-dom`, `next.js` ou encore `react native`

---

# JSX

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
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  React.createElement(
    HelloMessage, {content: 'Hello'},
      React.createElement(Title, {content: 'World'}, null)
    )
);
```

---

# Interpolation

* L'interpolation est le mécanisme permettant d'insérer une valeur dans du code JSX.
* Nous utilisons la syntaxe `{ expession }`.
* Attention : `class` et `for` sont des mots reservés en JavaScript. Il faut donc utiliser `className` et `htmlFor`.

---

# Interpolation

```javascript
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

* Un composant React doit toujours étre composé d'un élément `root`.
* Afin d'éviter d'insérer des éléments HTML inutiles, vous pouvez utiliser les `Fragment`.
* Utilisation des balises `<Fragment>...</Fragment>` ou `<>...</>`

---

# Fragment

```javascript
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

```javascript
type MenuItem = {
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

* Pour des raisons de performance, il est recommandé de définir l'attribut `key` dès que nous itérons sur un tableau.
* Soit en utilisant l'attribut `index` soit via une propriété de l'objet

---

# Utilisation de l'attribut key

```javascript
const Nav = () => {
    const menuItems: MenuItem[] = [ ... ];
    return (
        <ul>
            {menuItems.map(({link, label}, index) => {
                return <li key={index}><a href={link}>{label}</a></li>
            })}
        </ul>
    )
}
export default Nav;
```
