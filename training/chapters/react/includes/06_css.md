# Gestion du style

* Bonne pratique de définir une feuille de styles par composant
    * Meilleure maintenabilité
    * Si le composant n'est jamais utilisé, la feuille de style ne sera jamais importée.
    * Attention: la feuille de styles ne sera pas scopée.
* Les syntaxes Less, Sass ou SCSS sont utilisables.

---

# Gestion du style

```typescript
import './nav.css';

export const Nav = () => {

}
```

---

# Gestion du style

* Pour scoper la feuille de style d'un composant, vous pouvez utiliser des classes CSS "à usage unique".
* Et utiliser cette classe CSS dans vos sélecteurs ou dans vos déclarations imbriquées SCSS.
* Vous pouvez également manipuler des syntaxe **BEM** afin de normaliser vos noms de classes CSS.

```typescript
import './nav.css';

export const Nav = () => {
    return (
        <nav className="nav">
            ...
        </nav>
    );
}
```

---

# CSS Modules

* Vous pouvez également utiliser les **CSS Modules**
* CRA fournit par défaut le support et l'outillage nécessaire. 
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
