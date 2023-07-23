# Gestion du style

* Bonne pratique de définir une feuille de styles par composant
    * Meilleure maintenabilité
    * Si le composant n'est jamais utilisé, la feuille de style ne sera jamais importée.
* Les syntaxes Less, Sass ou SCSS sont utilisables.

---

# Gestion du style

```javascript
import './nav.css';

export const Nav = () => {

}
```

---

# Gestion du style

* Pour scoper la feuille de style d'un composant, vous pouvez utiliser des classes CSS "à usage unique".
* Et utiliser cette classe CSS dans vos sélecteurs ou dans vos déclarations imbriquées SCSS.
* Vous pouvez également manipuler des syntaxe **BEM** afin de normaliser vos noms de classes CSS.

```javascript
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

# CSS-in-JS

* Une autre syntaxe est également possible via le pattern `CSS-in-JS`
* Permet de `scoper` les feuilles de styles aux composants
* Permet de ne pas importer la feuille de style si le composant n'est plus importé
* Plusieurs librairies sont disponibles comme par exemple `styled-component` ou `emotion`.

```javascript
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

// Create a Wrapper component that'll render a <section> tag with some styles
const Wrapper = styled.section`
  padding: 4em;
  background: papayawhip;
`;

// Use Title and Wrapper like any other React component – except they're styled!
const App = () => (
  <Wrapper>
    <Title>
      Hello World!
    </Title>
  </Wrapper>
);
```