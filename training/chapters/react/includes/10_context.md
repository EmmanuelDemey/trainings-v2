# Context

* Un context un objet natif de React permettant de propager de la donnée sur tous les éléments d'un arbre
* Cette syntaxe permet d'éviter le passage de `props` de composant en composant
* Tous les `consumer` seront regénéres si le context change

---

# Context

* Se base sur deux concepts :
    * `Provider` : ou la donnée est centralisée
    * `Consumer` : client permettant d'intéragir avec cette donnée

---

# Création du context

```javascript
export const themes = {
  light: {
  },
  dark: {
  },
};

export const ThemeContext = React.createContext(
  themes.dark // valeur par défaut
);
```

---

# Création du Provider

```javascript
import { ThemeContext, themes } from './context';

const App = () => {
    return (
        <ThemeContext.Provider value={themes.light}>
            <Toolbar changeTheme={this.toggleTheme} />
        </ThemeContext.Provider>
    )
}
export default App;
```

---

# Abonnement au context

* Nous pouvons également consommer cette donnée avec le hook `useContext`

```javascript
const Button = () => {
    const theme = useContext(ThemeContext);

    return (
        <button
            style={{backgroundColor: theme.background}}>
            Changer le thème
        </button>
    );
}
export default Button;
```

---

# Lecture et Ecriture

* Un context n'est pas limité qu'à de la données en lecture seule .
* Nous pouvons y définir également des fonctions permettant de modifier cette données.

```javascript
import { DataContext } from './context';

const App = () => {
    const [data, setData] = useState({ })
    return (
        <DataContext.Provider value={ { data, setData } }>

        </DataContext.Provider>
    )
}
export default App;
```

---

# Lecture et Ecriture

```javascript
import { DataContext } from './context';

const Form = () => {
    const { data, setData}  = useContext(DataContext)
    return (
        <label>
            Name:
            <input onChange={e => setData({ ...data, name: e.target.value }) } />
        </label>
    )
}
export default Form;
```

---

# Bonnes pratiques

* Nous recommandons de créer son propre `Provider` et son propre `hook`.

```javascript
export const themes = {
  light: {
  },
  dark: {
  },
};

export const ThemeContext = React.createContext(
  themes.dark // valeur par défaut
);

export const ThemeProvider = ThemeContext.Provider;
export const useTheme = () => useContext(ThemeContext);
```
