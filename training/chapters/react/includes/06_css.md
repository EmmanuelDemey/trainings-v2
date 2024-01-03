# Gestion du style

* Bonne pratique de définir une feuille de styles par composant
    * Meilleure maintenabilité
    * Si le composant n'est jamais utilisé, la feuille de style ne sera jamais importée.
    * Attention: la feuille de styles ne sera pas scopée.
* Les syntaxes Less, Sass ou SCSS sont également utilisables.
    * Le langage CSS fournir de plus en plus de fonctionnalités. Ces préprocesseurs ne sont peut-être utile. 

---

# Gestion du style

```typescript
import './nav.css';

export const Nav = () => {
  return (
    <nav>
      ...
    </nav>
  )
}
```

---

# Gestion du style

* Pour scoper la feuille de style d'un composant, vous pouvez utiliser des classes CSS "à usage unique".
* Et utiliser cette classe CSS dans vos sélecteurs ou dans vos déclarations imbriquées SCSS.
* Vous pouvez également manipuler des syntaxe **BEM** (*Blocks, Elements and Modifiers*) afin de normaliser vos noms de classes CSS.

```typescript
import './nav.css';

export const Nav = () => {
    return (
        <nav className="navigation">
            <ul>
              <li className="navigation__item"> ... </li>

              <li className="navigation__item--active"> ... </li>
            </ul>
        </nav>
    );
}
```

---

# Gestion du style


```scss
.navigation {
  &__item {
    ...

    &--active {
      ...
    }
  }
}
```

---

# CSS Modules

* Vous pouvez également utiliser les **CSS Modules**
* CRA ou Vite fournissent par défaut le support et l'outillage nécessaire. 
* A la compilation, un classe CSS unique sera générée
* Le fichier CSS doit absolument être suffixé par **.module.css**. 

```css
.nav {
  ...
}
```

```typescript
import styles from './nav.module.css';

export const Nav = () => {
    return (
        <nav className={styles.nav}>
            ...
        </nav>
    );
}
```

---

# CSS-in-JS

* Une autre syntaxe est également possible via le pattern `CSS-in-JS`
* Permet de `scoper` les feuilles de styles aux composants
* Permet de ne pas importer la feuille de style si le composant n'est plus importé
* Plusieurs librairies sont disponibles comme par exemple `styled-component`, `styleX` ou `emotion`.

```typescript
import { css } from 'emotion'

export const Nav = () => {
    return (
        <nav className={css`background: #eee;`}>
            ...
        </nav>
    )
}
```

---

# CSS-in-JS

* Voici ci-dessous un exemple avec **styled-component** 

```typescript
import styled from 'styled-components';

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: #BF4F74;
`;

const Wrapper = styled.section`
  padding: 4em;
  background: papayawhip;
`;

const App = () => (
  <Wrapper>
    <Title>
      Hello World!
    </Title>
  </Wrapper>
);
```

---

# Tailwind CSS

* La dernière solution pour écrire du CSS est d'utiliser la librairie **Tailwind CSS**
* Cette librairie met à disposition un ensemble de classe CSS minimale et extensible
* Lors de la compilation du projet, une fichier CSS sera généré à partir des classes CSS utilisées. 

```shell
npm install -D tailwindcss
npx tailwindcss init
```

<v-click>
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
</v-click>

<v-click>
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
</v-click>

---

# Tailwind CSS

```typescript
export default function App() {
  return (
    <h1 className="text-3xl font-bold underline">
      Hello world!
    </h1>
  )
}
```