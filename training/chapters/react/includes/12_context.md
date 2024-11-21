# Context

* Un context un objet natif de React permettant de propager de la donnée sur tous les éléments d'un arbre
* Cette syntaxe permet d'éviter le passage de `props` de composant en composant
* Tous les `consumer` seront regénéres si le context change
* Ce mécanisme se base sur deux concepts :
    * `Provider` : ou la donnée est centralisée
    * `Consumer` : client permettant d'intéragir avec cette donnée

---

# Création du context

* Voici comment nous devons créer un **Context** 

```typescript
import { createContext } from 'react';

export const themes: Record<string, Theme> = {
  light: {
  },
  dark: {
  },
};

export const ThemeContext = createContext<Theme | undefined>(themes);
```

---

# Création du Provider

* Une fois créé, nous pouvons l'utiliser via le **Provider** associé. 

```typescript
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

* Nous pouvons consommer cette donnée avec le hook `useContext`

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

* Un context n'est pas limité qu'à de la donnée en lecture seule .
* Nous pouvons y définir également des fonctions permettant de modifier cette donnée.

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
import { useContext } from 'react'
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

# Utilisation d'un context avec useReducer

* Nous pouvons bien evidemment utiliser le hook *useReducer* dans un Context
    * Nous nous approchons de la syntaxe de *Redux* . 

```typescript
import { TasksContext, TasksDispatchContext } from './TasksContext.js';

export default function TaskApp() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  // ...
  return (
    <TasksContext.Provider value={tasks}>
      <TasksDispatchContext.Provider value={dispatch}>
        ...
      </TasksDispatchContext.Provider>
    </TasksContext.Provider>
  );
}
```

---

# Bonnes pratiques

* Nous recommandons de créer son propre `Provider` et son propre `hook`.

```typescript
import { createContext } from 'react';

export const themes = {
  light: {
  },
  dark: {
  },
};

const ThemeContext = createContext(
  themes.dark // valeur par défaut
);

export const ThemeProvider = ThemeContext.Provider;
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context;
}
```
