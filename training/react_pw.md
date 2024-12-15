# Formation React

Durant cette formation, nous allons développer une application permettant la visualisation des personnages des films Star Wars.

Si vous utilisez VSCode, voici des snippets de code que j'utilise souvant. N'hésitez pas à créer les votre.

```json
{
  "useStateTS": {
    "scope": "typescript,typescriptreact",
    "prefix": "useState",
    "body": ["const [${1}, set${1/(.*)/${1:/capitalize}/}] = useState<$2>($3)"]
  },
  "useStateJS": {
    "scope": "javascript,javascriptreact",
    "prefix": "useState",
    "body": ["const [${1}, set${1/(.*)/${1:/capitalize}/}] = useState($2)"]
  }
}
```

## PW1 - Introduction

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [Vite](https://vitejs.dev/guide/)
- [Prettier](https://prettier.io/docs/en/install)
  :::

### Initialisation d'un projet React via Vite

Dans ce TP, nous allons tout d'abord initialiser un projet React via le module `vite`.

Dans votre terminal, veuillez exécuter les commandes suivantes :

```shell
npm create vite@latest react-trainings -- --template react-ts
```

Une fois le projet créé, vous pouvez exécuter les commandes suivantes afin de vérifier qu'il est bien fonctionnel.

```shell
cd react-trainings
npm install # or npm i
npm run dev
```

Vous pouvez également générer la version de production et émuler le fonctionnement d'un serveur web.

```shell
npm run build
cd dist
npx serve
```

### Support des path absolus dans vite

Installer le plugin :

```shell
npm i -D vite-tsconfig-paths
```

Déclarer le plugin dans la configuration `vite` :

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
});
```

Enrichir la configuration du projet dans `tsconfig.app.json` :

```json
{
  ...
  // alias
  "baseUrl": ".",
  "paths": {
    "@components/*": ["src/components/*"],
    "@pages/*": ["src/pages/*"],
    "@utils/*": ["src/utils/*"],
    "@model/*": ["src/model/*"]
  }
  ...
}
```


### Installation / Configuration de Prettier

- Installer les extensions VS Code pour `prettier` (et `eslint`)
- Configurer l'extension Prettier pour formatter les fichiers à la sauvegarde
- Ajouter une configuration Prettier au sein de votre projet
- Ajouter un script Prettier dans votre `package.json`

## PW2 - TypeScript

- Créer un fichier `src/fake-data.ts` contenant l'objet suivant :

```typescript
export const data = [
  {
    name: "Luke Skywalker",
    height: "172",
    mass: "77",
    hair_color: "blond",
    skin_color: "fair",
    eye_color: "blue",
    birth_year: "19BBY",
    gender: "male",
    homeworld: "http://swapi.dev/api/planets/1/",
    films: [
      "http://swapi.dev/api/films/1/",
      "http://swapi.dev/api/films/2/",
      "http://swapi.dev/api/films/3/",
      "http://swapi.dev/api/films/6/",
    ],
    species: [],
    vehicles: [
      "http://swapi.dev/api/vehicles/14/",
      "http://swapi.dev/api/vehicles/30/",
    ],
    starships: [
      "http://swapi.dev/api/starships/12/",
      "http://swapi.dev/api/starships/22/",
    ],
    created: "2014-12-09T13:50:51.644000Z",
    edited: "2014-12-20T21:17:56.891000Z",
    url: "http://swapi.dev/api/people/1/",
  },
  {
    name: "C-3PO",
    height: "167",
    mass: "75",
    hair_color: "n/a",
    skin_color: "gold",
    eye_color: "yellow",
    birth_year: "112BBY",
    gender: "n/a",
    homeworld: "http://swapi.dev/api/planets/1/",
    films: [
      "http://swapi.dev/api/films/1/",
      "http://swapi.dev/api/films/2/",
      "http://swapi.dev/api/films/3/",
      "http://swapi.dev/api/films/4/",
      "http://swapi.dev/api/films/5/",
      "http://swapi.dev/api/films/6/",
    ],
    species: ["http://swapi.dev/api/species/2/"],
    vehicles: [],
    starships: [],
    created: "2014-12-10T15:10:51.357000Z",
    edited: "2014-12-20T21:17:50.309000Z",
    url: "http://swapi.dev/api/people/2/",
  },
  {
    name: "R2-D2",
    height: "96",
    mass: "32",
    hair_color: "n/a",
    skin_color: "white, blue",
    eye_color: "red",
    birth_year: "33BBY",
    gender: "n/a",
    homeworld: "http://swapi.dev/api/planets/8/",
    films: [
      "http://swapi.dev/api/films/1/",
      "http://swapi.dev/api/films/2/",
      "http://swapi.dev/api/films/3/",
      "http://swapi.dev/api/films/4/",
      "http://swapi.dev/api/films/5/",
      "http://swapi.dev/api/films/6/",
    ],
    species: ["http://swapi.dev/api/species/2/"],
    vehicles: [],
    starships: [],
    created: "2014-12-10T15:11:50.376000Z",
    edited: "2014-12-20T21:17:50.311000Z",
    url: "http://swapi.dev/api/people/3/",
  },
  {
    name: "Darth Vader",
    height: "202",
    mass: "136",
    hair_color: "none",
    skin_color: "white",
    eye_color: "yellow",
    birth_year: "41.9BBY",
    gender: "male",
    homeworld: "http://swapi.dev/api/planets/1/",
    films: [
      "http://swapi.dev/api/films/1/",
      "http://swapi.dev/api/films/2/",
      "http://swapi.dev/api/films/3/",
      "http://swapi.dev/api/films/6/",
    ],
    species: [],
    vehicles: [],
    starships: ["http://swapi.dev/api/starships/13/"],
    created: "2014-12-10T15:18:20.704000Z",
    edited: "2014-12-20T21:17:50.313000Z",
    url: "http://swapi.dev/api/people/4/",
  },
];
```

- Créer un fichier `src/model/person.ts` contenant le type suivant :

```typescript
export type Person = {
  name: string;
  url: string;
  height?: string;
  mass?: string;
  hair_color?: string;
  skin_color?: string;
  eye_color?: string;
  birth_year?: string;
  gender?: string;
  homeworld?: string;
  films?: string[];
  species?: any[];
  vehicles?: string[];
  starships?: string[];
  created?: string;
  edited?: string;
};
```

- Créer dans ce même fichier le type `Persons`, définit comme un tableau de `Person`

- Affecter le type `Persons` à l'objet `data`

- Modifier les données / le type (temporairement) pour faire apparaître des erreurs TypeScript

## PW3 - Tests unitaires

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [Vitest](https://vitest.dev/)
- [React testing library](https://testing-library.com/docs/react-testing-library/intro/)
  :::

Dans ce TP, nous allons ajouter des tests unitaires dans notre application.

Nous le faisons si tôt dans cette formation, afin de vous laissez l'opportunité d'écrire vos tests au fur et à mesure des travaux pratiques.

Vous pouvez par exemple vérifier que le document contient

- un titre `h1` contenant la chaine de caractéres `React`.
- un paragraphe contenant la chaine de caractéres `HMR`.

En :

- installant `vitest` et `react-testing-library`
- créant un script `test` dans le fichier `package.json`
- créer une configuration vitest dans le fichier `vitest.config.ts`
- ajoutant un fichier `App.test.tsx` dans `src`

## PW4 - EcmaScript moderne

- Créer un fichier `src/utils/es6.spec.ts` avec le contenu suivant :

```typescript
import { describe, it, expect } from "vitest";
import * as ES6 from "./es6";
import { data } from "../fake-data";

describe("es6", () => {
  it("test array lenght", () => {
    expect(ES6.getLength(data)).toEqual(4);
  });
  it("test male array lenght", () => {
    expect(ES6.getMales(data)).toEqual(2);
  });
  it("returns names", () => {
    expect(ES6.getNames(data)).toEqual([
      "Luke Skywalker",
      "C-3PO",
      "R2-D2",
      "Darth Vader",
    ]);
  });
  it("returns names", () => {
    expect(ES6.getAttr("name")(data)).toEqual([
      "Luke Skywalker",
      "C-3PO",
      "R2-D2",
      "Darth Vader",
    ]);
  });
  it("test first element contains name and url keys and not dummy", () => {
    expect(ES6.checkFirstElementKeys([])).toBeNull();
    const keys = ES6.checkFirstElementKeys(data);
    expect(keys).toContain("name");
    expect(keys).toContain("url");
    expect(keys).not.toContain("dummy");
  });
  it("build an array with `key: value` elements for last person and check `skin_color: white` is in", () => {
    expect(ES6.buildInfosForLastElement([])).toBeNull();
    expect(ES6.buildInfosForLastElement(data)).toContain("skin_color: white");
  });
  it("returns persons median", () => {
    expect(ES6.getMassAverage([])).toBe(null);
    expect(ES6.getMassAverage([...data, { name: "ko", url: "ko_url" }])).toBe(
      null,
    );
    expect(ES6.getMassAverage(data)).toBe(80);
  });
  it("returns partial last person with 1 added", () => {
    expect(Object.keys(ES6.addOneForLastElement([]))).toHaveLength(0);
    const result = ES6.addOneForLastElement(data);
    expect(Object.keys(result)).toHaveLength(2);
    expect(result.height).toBe("203");
    expect(result.mass).toBe("137");
  });
});
```

- Créer un fichier `src/utils/es6.ts` avec le contenu suivant :

```typescript
import { Person, Persons } from "../model/person";

// Get array of Person length
export const getLength = (arr: Persons): number => 0;

// Returns only males from array of Person
export const getMales = (arr: Persons): number => [];

// Return array of names from array of Person
export const getNames = (arr: Persons): string[] => [];

// Return array of an attribute from array of Person
export const getAttr =
  (attr: "name" | "url") =>
  (arr: Persons): string[] => [];

// Returns array of keys of the first Person in array
export const checkFirstElementKeys = (arr: Persons): string[] | null => null;

// Returns "key: value" for each elements of the last Person in array
export const buildInfosForLastElement = (arr: Persons): string[] | null => {
  return null;
};

// Calculate the mass average from the array of Person
export const getMassAverage = (arr: Persons) => {
  return 0;
};

// For last Person, keep elements where value is assignable to numeric, and add one to each field
export const addOneForLastElement = (arr: Persons): Partial<Person> => {
  return {};
};
```

- Implémenter les fonctions

## PW5 - Premiers pas avec React

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [Bulma](https://bulma.io/)
  :::

### Thème CSS

- Installation :

```shell
npm install bulma
```

- Importer la librairie dans votre application. Nous avons l'habitude de faire ce genre d'import au plus haut niveau de l'application. Donc par exemple dans le fichier `src/main.tsx`.

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'bulma/css/bulma.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- Modifier le contenu du fichier `index.html` avec le contenu suivante :

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hello Bulma!</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- Mettre à jour le composant `src/App.tsx` avec les classes Bulma.

```typescript
import "./App.css";

function App() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Hello World</h1>
        <p className="subtitle">
          My first website with <strong>Bulma</strong>!
        </p>
      </div>
    </section>
  );
}

export default App;
```

### Créer un composant

Dans cette section, nous allons créer un composant permettant d'afficher des personnages de Star Wars.

- Créer un composant dans `src/components/PeopleTable.tsx`
- Importer la liste des personnages
- Faire retourner le fragment HTML suivant à votre composant, en générant autant de balise `tr` que de personnages à afficher.

```html
<table className="table is-fullwidth">
  <thead>
    <tr>
      <th>Nom</th>
      <th>Genre</th>
      <th>Année de naissance</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
  </tbody>
</table>
```

- Instancier votre composant dans le composant `src/App.tsx`

## PW6 - Composants & props

- Créer les composants `src/components/Title.tsx`, `src/components/PeopleFilter.tsx`
- Le composant `Title` prendra en paramètre un `text` à afficher
- Le composant `PeopleFilter` génèrera un champ input, avec le rendu HTML suivant :

```html
<div className="field">
  <div className="control">
    <input className="input is-info" type="text" />
  </div>
</div>
```

- Instancier `Title`, `PeopleFilter` et `PeopleTable` dans `App`
- Retirer l'import de `fake-data` de `PeopleTable` pour l'importer dans `App`
- Bonus : abstraire le composant d'input sous `src/components/Input.tsx` et le consommer dans `PeopleFilter`

## PW7 - Style & (s)css

- Installer `sass`
- Remplacer le fichier `App.css` par `App.scss`
- Ajouter du style

## PW8 - Composants & state & hooks

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [https://fr.reactjs.org/docs/hooks-intro.html](Hook)
- [Les boutons avec Bulma](https://bulma.io/documentation/elements/button/)
  :::

### Filtrer le tableau

- Créer un état pour mémoriser la valeur du champ input de `PeopleFilter`
- Filtrer le tableau contenu dans `PersonTable` par `name` en fonction de la valeur de l'état du filtre

### Créer des pages

Nous utiliserons un routeur plus tard dans la formation.

En attendant, afin de continuer à structurer notre code, tout en s'amusant avec les états, nous pouvons initialiser nos 2 premières pages.

- Créer les composants `src/pages/Home.tsx` et `src/pages/People.tsx`
- Peupler le composant `Home` des composants présent dans `App` jusque là
- `People` peut à ce stade renvoyer uniquement le titre "Personnage"
- Créer un nouvel état permettant de stocker la page et la personne courante :
  - l'attribut page prendra pour valeurs `home` et `people`
  - l'attribut personne sera un string (l'URL de la personne sélectionnée)
- Conditionner `App` pour afficher la bonne page courante
- Ajouter un bouton de retour à l'accueil au composant `People` :

```javascript
<button
    type="button"
    className="button is-warning"
    onClick={ ... } >
  Home
</button>
```

## PW9 - Récupération de données

:::note
Documentation :

- [Vite env](https://vitejs.dev/guide/env-and-mode)

Attention :

Comparativement aux données fictives, l'API renvoie des attributs en camel case et l'attribut url est remplacée par l'attribut id.
:::

### Fetch

- récupérer la liste des personnes et les attributs d'une personne via l'API :
  - créer un composant `PeopleTableContainer`
  - créer un composant `PersonContainer`
- gérer l'état de chargement et les erreurs

```typescript
const [data, setData] = useState(...);
const [loading, setLoading] = useState(...);
const [errorMessage, setErrorMessage] = useState(...);

useEffect(() => {fetch(...)}, [...]);

if (loading) {
  return (
    <progress className="progress is-small is-primary" max="100"></progress>
  );
}

if (errorMessage) {
  return (
    <>
      <div className="icon-text">
        <span className="icon has-text-danger">
          <i className="fas fa-ban"></i>
        </span>
        <span>Loading error:</span>
      </div>
      <p className="block">
        {errorMessage}
      </p>
    </>
  )
}

return (...)
```

- Bonus : créer des composants `Loader` et `Error` dans `src/components/common` afin de factoriser et déporter ces morceaux d'UI de façon réutilisable et facilement testable.

### Variables d'environnement

Externaliser la base de l'url de l'API consommée.

- Créer 2 fichiers, `.env`, `.env.local` à la racine de votre projet
- Ajouter `VITE_API_BASE_URL=` au fichier `.env`
- Ajouter `VITE_API_BASE_URL=XXX` au fichier `.env.local`
- Penser à relancer son serveur à chaque modification de ces fichiers
- Ajouter l'utilitaire suivant dans `src/utils/env.ts` :

```typescript
const getEnv = (k: string): string => import.meta.env['VITE_'.concat(k)];

export const API_BASE_URL = getEnv('API_BASE_URL');
```

- Utiliser cette constante dans vos instanciation de `fetch`

## PW10 - Périmètres d'erreur

- Ajouter un `ErrorBoundaries` "protégeant" le champ de filtrage de façon à ce que la page d'accueil continue de s'afficher même si le composant `PeopleFilter` renvoie une erreur

- Tester en simulant une erreur dans le composant `PeopleFilter`

## PW11 - Custom hook

Comme seconde partie bonus, nous allons créer un `custom hook`. Ce hook, que nous nommerons `useFetch` devra gérer la récupération des données et la gestion des variables `loading` et `error`.

Ce hook s'utilisera de cette façon :

```typescript
const { data, loading, error } = useFetch(`url`);
```

## PW12 - State container - Context

### FilterContext

- Conserver l'état `filter` et le setter `setFilter` et supprimer toutes les `props` passées aux composants enfants
- Créer un context `FilterContext`, le provider `FilterProvider` et le hook `useFilter` dans `src/context/filter`
- Instancier le provider avec sa `value` et consommer cette valeur dans les composants enfants ayant besoin des informations

### Bonus - LikeContext

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [API Context](https://react.dev/learn/passing-data-deeply-with-context)
  :::

Nous pouvons ajouter la fonctionnalité permettant d'aimer des personnages. Cette information sera centralisée dans un context.

Les actions qui pourront étre exécutées par l'utilisateur sont des actions permettant d'aimer (LIKE) ou ne plus aimer (DISLIKE) un personnage.

- Ajouter une nouvelles colonne dans le tableau de `PeopleTable`. Cette colonne affichera trois boutons permettant d'aimer, de ne plus aimer un personnage ou de réinitialiser.

```javascript
<button
    type="button"
    className="button is-warning"
    onClick={ ... } >
  I Like
</button>
<button
    type="button"
    className="button is-warning"
    onClick={ ... } >
  Reset
</button>
<button
    type="button"
    className="button is-warning"
    onClick={ ... } >
  I Dislike
</button>
```

- Créer un context `LikesContext` dans `src/context/likes`, contenant :
  - un object `likes` ayant pour clé l'id des personnages, comme valeur -1, 0 ou 1
  - une fonction `setLikes` permettant de mettre à jour la valeur pour un personnage

- Créer également le provider `LikesProvider` et le hook `useLikes` 

- Instancier le provider avec sa `value` et consommer cette valeur dans les composants enfants ayant besoin des informations

- Dans le composant `Home`, juste en dessous du titre, ajouter le code HTML suivant :

```html
<h2>Vous aimez X personnage(s)</h2>
```

Le X devra être remplacer par le nombre de personnes aimés.

## PW13 - Lazy loading - Suspense

- Créer un composant `Loading` partagé (sous `src/components/common`)
- Importer de façon "paresseuse" votre page `People`
- Vérifiez :
  - que `npm run build` produise un second fichier `*.js`
  - en actualisant votre app, en allant dans les networks, en les effaçant, en cliquant sur un personnage dans le tableau, que le fichier contenant le code de la page `Person` est chargé

## PW14 - React Router

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [React Router](https://reactrouter.com/en/main/start/tutorial)
  :::

Nous allons à présent ajouter une deuxième page à notre application. Cette page sera utilisée lorsque l'utilisateur cliquera sur le nom d'un personnage. Elle affichera les informations du personnage selectionné.

Vous devez tout d'abord installer la dépendance `react-router-dom`.

```shell
npm install react-router-dom@^6.0.0
# installer la dernière version 6.X.X tant que la v7 est buggée (TS issue)
```

Un fois installée, suivez les étapes suivantes afin d'implémenter le fonctionnel souhaité :

- Supprimer l'état permettant de gérer les pages jusque là
- Créer une configuration de routing dans `src/router`
- Instancier le `RouterProvider` dans `src/App`. Nous souhaitons que le composant `Home` soit affiché par défaut sur la route `/`, et le composant `Person` lorsque l'url respecte le pattern `/person/:id`. La route de `Person` devra être lazy loadée
- Ajouter un composant `src/components/common/NotFound` pour les autres routes
- Ajoutez un lien dans le composant `PeopleTable` permettant de faire la redirection
- Corrigé le composant `Person`

## PW15 - Internationalisation

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [react-i18next](https://react.i18next.com/)
  :::

Dans cette partie, nous allons internationaliser l'application.

Nous allons tout d'abord installer le module `react-i18next` en executant la commande suivante.

```shell
npm install react-i18next i18next
```

Nous allons ensuite créer un fichier `i18n.ts` dans lequel nous allons configurer le module.

Dans ce fichier, nous allons tout d'abord définir les traductions pour le français et l'anglais des différentes chaines de caractéres
de l'application (sauf celles affichant le nombre de personnages aimés par l'utilisateur )

Une fois cette configuration realisée, nous allons initialiser le module `react-i18next`.

```javascript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = { ... }
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en",
  });

export default i18n;
```

La dernière étape est d'internationaliser le message indiquant le nombre de personnes que l'utilisateur aime.

- Pour cela, nous allons tout d'abord installer le module `i18next-icu`.

```shell
npm install i18next-icu intl-messageformat
```

- Une fois installé, nous devons l'ajouter à la configuration du module `react-i18next`.

```typescript
import ICU from "i18next-icu";
...

i18n
  .use(ICU))
```

- Dans la configuration définie précédemment, nous allons ajouter un message, via la syntaxe ICU, permettant d'internationaliser le dernier message de notre application.

```html
<h2>Vous aimez X personnages</h2>
```

Une fois cette configuration réalisée, nous allons à présent pouvoir intégrer `react-i18next` dans l'application. Dans le fichier `App.js`, importez le module précédemment crée.

- Dans le composant `Home`, utiliser la méthode `useTranslation` pour récupérer puis ensuite afficher le message souhaité.

- Créer un composant `Header` et y ajouter deux boutons permettant de choisir la langue française ou anglaise. Pour cela, vous pouvez utiliser le code HTML suivant :

```html
<div className="is-pulled-right">
  <button type="button" className="button" onClick="{...}">FR</button>
  <button type="button" className="button" onClick="{...}">EN</button>
</div>
```

- Instancier ce composant pour toutes vos pages

## PW16 - Formik

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [Formik](https://formik.org/)
  :::

Afin de mettre en place **Formik** sur notre application, un TP a été ajouté permettant de s'initier à ce module.

- Ajouter une route `/create`
- Créer une page `src/pages/Create.tsx`
- Implémenter un formulaire avec les contraintes suivantes :
  - Le nom est obligatoire
  - La propriété _height_ est un entier compris entre 0 et 250
  - La propriété _hairColor_ doit utiliser un composant _select_
  - La propriété _gender_ doit utiliser des _radios_
  - La propriété _birthYear_ est un datepicker

Afin d'améliorer notre formulaire, vous devez également ajouter les messages d'erreurs adéquates.

- Mettre en place une requête `POST` vers le serveur
- Rediriger vers la page `People` de l'élément nouvellement créé

## PW17 - TanStack Query

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/installation)
- [Le server state facile avec Tanstack Query](https://www.youtube.com/watch?v=kNaBVAdwbR4)
  :::

Nous allons remplacer nos appels API jusque là simplement exécutés via `fetch` par les méthodes de `TanStack`.

- Instancier un `QueryClient`
- Déclarer un `QueryClientProvider`
- Remplacer les appels de `useFetch` par `useQuery`, l'appel `POST` par `useMutation`
- Configurer `TanStack` pour que la liste de la page d'accueil soit :
  - rafraichie automatiquement toutes les X secondes
  - chargée une fois au plus toutes les Y secondes
- Vérifier dans les devtools, onglet network, que cela fonctionne

## PW18 - Material UI

- Retirer Bulma de votre projet
- Ajouter MUI à votre projet :
  - Créer un `theme`
  - Instancier le `Provider`
  - Modifier un / des / les composants UI en utilisant MUI

## PW19 - Zustand

:::note

- [Zustand](https://github.com/pmndrs/zustand)
  :::

Nous avons utilisé l'API `context` pour gérer les likes jusqu'ici.
Dans cette partie, nous allons externaliser la gestion des états des likes dans un state manager : Zustand.

- Supprimer tous les objets liés au `context` des likes
- Installer `zustand`
- Créer un store pour gérer les likes

## PW20 - Storybook

:::note

- [Storybook](https://storybook.js.org/tutorials/intro-to-storybook/react/en/get-started/)
  :::

- Ajouter `Storybook` à votre projet :

```shell
npx storybook@latest init
```

- S'inspirer des éléments du dossier `src/stories` pour créer une story documentant nos composants UI

- Lancer `Storybook` :

```
npm run storybook
```

# PW21 - Cypress

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [Cypress](https://www.cypress.io/)
  :::

Nous allons à présent ajouter des tests Cypress. Pour cela, il est d'abord nécéssaire d'installer la dépendance.

```shell
npm install -D cypress
```

Une fois installée, nous allons ajouter un script dans notre fichier `package.json`.

```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run"
  }
}
```

Si à présent vous exécutez la commande `npm run cypress:open`, l'interface graphique doit étre visible vous permettant de lancer les tests générés par Cypress.

Vous devez à présent supprimer les tests générés et créer vos propres tests afin de tester l'interface graphique de votre application.

- Ajouter un fichier `.eslintignore` à la racine du projet pour exclure le linting pour le code auto-généré par Cypress

# PW22 - Docker & Kubernetes

## Docker

- Installation de `vite-envs` :

```shell
npm i -D vite-envs
```

- Supprimer le préfixe `VITE_` dans les fichiers `.env`

- Ajouter un script :

```json
{
  ...
  "postinstall": "vite-envs update-types"
  ...
}
```

- Mettre à jour le fichier `src/utils/env.ts` :

```typescript
export const API_BASE_URL = import.meta.env['API_BASE_URL'];
```

- À la racine du projet, ajouter les fichiers suivants avec les contenus associés :
 - `.dockerignore` :

```bash
node_modules

dist

.git
.gitignore

.env.local

# IDE settings
.idea
.vscode

yarn-error.log*

# Operating system files
.DS_Store
Thumbs.db
```

  - `nginx.conf` :

```bash
server {
    listen 8080;

    gzip on; 
    gzip_vary on; 
    gzip_min_length 1024; 
    gzip_proxied expired no-cache no-store private auth; 
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/javascript application/xml; 
    gzip_disable "MSIE [1-6]\.";

    root /usr/share/nginx/html;
    index index.html;      

    try_files $uri $uri/ /index.html;

    # Vite generates filenames with hashes so we can
    # tell the browser to keep in cache the resources.
    location ^~ /static/ {
        try_files $uri =404;
        expires 1y;
        access_log off;
        add_header Cache-Control "public";
    }

    location ~* \.(html|json|txt)$ {
        try_files $uri =404;
        expires -1;  # No cache for these file types
    }
}
```

 - `Dockerfile` :

```bash
 # build environment
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
ENTRYPOINT sh -c "./vite-envs.sh && nginx -g 'daemon off;'"
```

- Contruisez votre image docker, à la racine exécuter :

```bash
docker build . -t react-trainings
```

- Instancier localement votre image docker en définissant avec la variable d'environnement :

```bash
docker run -p 80:8080 --env API_BASE_URL="URL" react-trainings
```

- Vous pouvez également mettre en place une action Github pour construire et pousser votre image docker sur dockerhub :
  - Ajouter `DOCKERHUB_USERNAME` et `DOCKERHUB_TOKEN` dans les secrets de votre repository Github
  - Dans le fichier `.github/workflows/deploy-app-docker.yml` ajouter :

```bash
name: Deploy React training app to Docker Hub

on:
  push:
    tags:
      - '*'

jobs:
  dockerhub:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies and build
        run: |
          cd trainings-v2/react-trainings
          yarn
          yarn build
          cd ..

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Build and push
        uses: docker/build-push-action@v3
        with:
          context: ./trainings-v2/react-trainings
          file: ./trainings-v2/react-trainings/Dockerfile
          platforms: linux/amd64,linux/arm64
          push: true
          tags: |
            ${{ secrets.DOCKERHUB_USERNAME }}/react-trainings:${{ github.ref_name }}
            ${{ secrets.DOCKERHUB_USERNAME }}/react-trainings:latest
```

## Kubernetes

- Installer le cli `kubectl`

- Définir les 3 objets suivants dans un dossier `.kubernetes` :
  - `Deployment.yml` :

```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: react-trainings
  labels:
    app: react-trainings
spec:
  replicas: 1
  selector:
    matchLabels:
      app: react-trainings
  template:
    metadata:
      labels:
        app: react-trainings
    spec:
      containers:
        - name: react-trainings
          image: nicolaval/react-trainings:0.1.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
          env:
            - name: API_BASE_URL
              value: ''
          resources:
            requests:
              memory: '64Mi'
              cpu: '50m'
            limits:
              memory: '128Mi'
              cpu: '200m'
```

  - `Service.yml` :

```bash
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: react-trainings
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: react-trainings.example.com # Replace by your custom URL
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: react-trainings
                port:
                  number: 8080
```

  - `Ingress.yml` :

```bash
apiVersion: v1
kind: Service
metadata:
  name: react-trainings
spec:
  selector:
    app: react-trainings
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
  type: ClusterIP
```

- Instancier les objets dans un cluster :

```bash
cd .kubernetes
kubectl apply -f .
```
