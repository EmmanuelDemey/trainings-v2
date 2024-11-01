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

## PW1 - Getting Started

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [React](https://fr.reactjs.org/)
- [Vite](https://vitejs.dev/guide/)
- [Bulma](https://bulma.io/)
  :::

Dans ce TP, nous allons tout d'abord initialiser un projet React via le module `create-react-app`.

Dans votre terminal, veuillez exécuter les commandes suivantes :

```shell
npm create vite@latest react-trainings-v2 -- --template react-ts
```

Une fois le projet créé, vous pouvez exécuter les commandes suivantes afin de vérifier qu'il est bien fonctionnel.

```shell
cd react-trainings-v2
npm run dev
```

Nous allons ensuite installer la librairie CSS `Bulma`, nous permettant de nous aider lors de la création du style de notre application.
Pour cela, vous devez exécuter la commande suivante :

```shell
npm install bulma
```

Une fois installée, vous devez l'importer dans votre application. Nous avons l'habitude de faire ce genre d'import au plus haut niveau de l'application. Donc par exemple dans le fichier `src/main.tsx`.

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

Nous allons ensuite intégrer le _layout_ de base de la librairie Bulma. Modifiez tout d'abord le contenu du fichier `index.html` avec le contenu suivante :

```html
<!DOCTYPE html>
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

Nous allons terminer par la modification du fichier `src/App.tsx`.

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

Vous pouvez également générer la version de production et émuler le fonctionnement d'un serveur web.

```shell
npm run build
cd dist
npx serve
```

## PW2 - Tests unitaires

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [Vitest](https://vitest.dev/)
- [Liste de matchers](https://github.com/testing-library/jest-dom)
- [React testing library](https://testing-library.com/docs/react-testing-library/intro/)
:::

Dans ce TP, nous allons ajouter des tests unitaires dans notre application. Nous le faisons si tôt dans cette formation, afin de vous laissez l'opportunité d'écrire vos tests au fur et à mesure des travaux pratiques.

Vous pouvez par exemple vérifier que le document contient

- un titre `h1` contenant la chaine de caractéres `Hello World`.
- un paragraphe contenant la chaine de caractéres `Bulma`.

En :

- installant `vitest` et `react-testing-library`
- créant un script `test` dans le fichier `package.json`
- étendant la configuration vite dans le fichier `vite.config.ts`
- ajoutant un fichier `App.test.tsx` dans `src`


## PW3 - Outillage

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

- Installer les extensions VS Code pour `prettier` et `eslint`

- Configurer `prettier` dans votre projet

- Ajouter un fichier `.eslintignore` à la racine du projet pour exclure le linting pour le code auto-généré par Cypress

## PW4 - Template

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [Array.prototypemap](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/map)
  :::

Dans ce TP, nous allons afficher des personnages de Star Wars. Nous n'allons pas créer de nouveaux composants ou encore récupérer les données depuis une API Rest pour le moment.

Tout se fera en mémoire pour le moment et dans le fichier `App.tsx`.

Dans ce fichier, déclarez une variable contenant le tableau suivant :

```json
[
  {
    "name": "Luke Skywalker",
    "height": "172",
    "mass": "77",
    "hair_color": "blond",
    "skin_color": "fair",
    "eye_color": "blue",
    "birth_year": "19BBY",
    "gender": "male",
    "homeworld": "http://swapi.dev/api/planets/1/",
    "films": [
      "http://swapi.dev/api/films/1/",
      "http://swapi.dev/api/films/2/",
      "http://swapi.dev/api/films/3/",
      "http://swapi.dev/api/films/6/"
    ],
    "species": [],
    "vehicles": ["http://swapi.dev/api/vehicles/14/", "http://swapi.dev/api/vehicles/30/"],
    "starships": ["http://swapi.dev/api/starships/12/", "http://swapi.dev/api/starships/22/"],
    "created": "2014-12-09T13:50:51.644000Z",
    "edited": "2014-12-20T21:17:56.891000Z",
    "url": "http://swapi.dev/api/people/1/"
  },
  {
    "name": "C-3PO",
    "height": "167",
    "mass": "75",
    "hair_color": "n/a",
    "skin_color": "gold",
    "eye_color": "yellow",
    "birth_year": "112BBY",
    "gender": "n/a",
    "homeworld": "http://swapi.dev/api/planets/1/",
    "films": [
      "http://swapi.dev/api/films/1/",
      "http://swapi.dev/api/films/2/",
      "http://swapi.dev/api/films/3/",
      "http://swapi.dev/api/films/4/",
      "http://swapi.dev/api/films/5/",
      "http://swapi.dev/api/films/6/"
    ],
    "species": ["http://swapi.dev/api/species/2/"],
    "vehicles": [],
    "starships": [],
    "created": "2014-12-10T15:10:51.357000Z",
    "edited": "2014-12-20T21:17:50.309000Z",
    "url": "http://swapi.dev/api/people/2/"
  },
  {
    "name": "R2-D2",
    "height": "96",
    "mass": "32",
    "hair_color": "n/a",
    "skin_color": "white, blue",
    "eye_color": "red",
    "birth_year": "33BBY",
    "gender": "n/a",
    "homeworld": "http://swapi.dev/api/planets/8/",
    "films": [
      "http://swapi.dev/api/films/1/",
      "http://swapi.dev/api/films/2/",
      "http://swapi.dev/api/films/3/",
      "http://swapi.dev/api/films/4/",
      "http://swapi.dev/api/films/5/",
      "http://swapi.dev/api/films/6/"
    ],
    "species": ["http://swapi.dev/api/species/2/"],
    "vehicles": [],
    "starships": [],
    "created": "2014-12-10T15:11:50.376000Z",
    "edited": "2014-12-20T21:17:50.311000Z",
    "url": "http://swapi.dev/api/people/3/"
  },
  {
    "name": "Darth Vader",
    "height": "202",
    "mass": "136",
    "hair_color": "none",
    "skin_color": "white",
    "eye_color": "yellow",
    "birth_year": "41.9BBY",
    "gender": "male",
    "homeworld": "http://swapi.dev/api/planets/1/",
    "films": [
      "http://swapi.dev/api/films/1/",
      "http://swapi.dev/api/films/2/",
      "http://swapi.dev/api/films/3/",
      "http://swapi.dev/api/films/6/"
    ],
    "species": [],
    "vehicles": [],
    "starships": ["http://swapi.dev/api/starships/13/"],
    "created": "2014-12-10T15:18:20.704000Z",
    "edited": "2014-12-20T21:17:50.313000Z",
    "url": "http://swapi.dev/api/people/4/"
  }
]
```

Afin de bénéficier de toutes la puissance de TypeScript, vous pouvez typer la variable précédente en utilisant ce type.

```typescript
type Person = {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: any[];
  vehicles: string[];
  starships: string[];
  created: string;
  edited: string;
  url: string;
};
type People = Array<Person>;
```

Dans un prochain TP, nous récupérons cette donnée directement depuis l'API swapi.

Dans l'implementation du composant `App`, ajoutez ce template HTML

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

Vous devez ensuite générer autant de balise `tr` que de personnages à afficher Pour cela, nous allons utiliser la méthode `map`.

## PW5 - Composant

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [React Components](https://fr.reactjs.org/docs/react-component.html)
  :::

Nous allons à présent ajouter un champ de recherche permettant de filtrer les personnages. Juste au dessus du tableau, ajoutez le code HTML ci-dessous :

```html
<div className="field">
  <div className="control">
    <input className="input is-info" type="text" />
  </div>
</div>
```

Nous allons ensuite externaliser le code créé précédemment dans trois composants bien spécifique :

- `PeopleFilter` : Ce composant aura en charge de gérer le champ de formulaire permettant de filtrer les personnages
- `PeopleTable` : Ce composant aura en charge la génération du tableau.
- `PeopleItem` : Ce composant aura en charge la génération d'un item du tableau.

Veuillez faire le nécessaire pour que le tableau de personnages soit filtré à chaque lettre insérée dans le champ de formulaire. Pour cela, nous allons devoir utiliser un concept pas encore abordé dans la formation : le hook `useState`. Veuillez demander un conseil au formatteur si besoin.

## PW6 - Hook

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [https://fr.reactjs.org/docs/hooks-intro.html](Hook)
- [SWAPI](https://swapi.dev/)
  :::

Dans les travaux précédents, les données étaient définies en mémoire. Nous allons récupérer dans ce TP les données depuis l'API REST swapi.

Nous allons tout d'abord supprimer le tableau défini précédemment

Une fois cette étape réalisée, définissez un nouvelle variable d'état via le hook `useState`. Nous nommerons
cette variable `people`. A présent c'est sur cette variable que vous devriez appliquer votre filtre.

Via l'utilisation du hook `useEffect`, faites une requéte `GET` vers le endpoint : `https://swapi.dev/api/people/`. Faites attention à la structure de la réponse HTTP.

Nous allons également ajouter un `loader` dans les cas ou l'API pourrait prendre du temps pour répondre. Ce loader sera affiché en fonction d'une nouvelle donnée disponible dans une variable d'état du composant.

Juste avant le JSX de notre composant App, ajoutez le code ci-dessous.

```javascript
if (loading) {
  return <progress className="progress is-small is-primary" max="100"></progress>;
}
```

Vous devez a présent faire le nécessaire pour définir cette variable `loading` au bon moment. Pour tester
cet ajout, vous devrez peut-être ralentir votre connexion. Pour cela, vous pouvez émuler une connexion lente via les Devtools de votre navigateur.

Pour finaliser cette partie pratique, dès que l'utilisateur modifie la valeur du champ de formulaire, réalisez une nouvelle requête HTTP afin d'exécuter la recherche coté API. Pour cela, vous devez utiliser la route `https://swapi.dev/api/people/?search=r2` ou `r2` est la chaine de caractères que l'utilisateur recherche.

Comme partie bonus, nous allons gérer la pagination de notre tableau. En effet, l'API que nous utilisons retourne 10 personnages par page. Sur la page dévelopée, ajoutez deux boutons afin de naviguer de page en page, et ainsi visualiser l'ensemble des personnages de Star Wars.

Comme seconde partie bonus, nous allons créer un `custom hook`. Ce hook, que nous nommerons `useFetch` devra gérer la récupération des données et la gestion de la variable `loading`.

Ce hook s'utilisera de cette façon :

```typescript
const [data, loading] = useFetch();
```

Si vous avez fait la partie bonus précédente, il se peut que ce hook gère plus de choses.

## PW7 - State Container

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [API Context](https://react.dev/learn/passing-data-deeply-with-context)
- [Les boutons avec Bulma](https://bulma.io/documentation/elements/button/)
  :::

Dans ce TP, nous allons ajouter la fonctionnalité permettant d'aimer des personnages. Cette information sera centralisée dans un context.

Les actions qui pourront étre exécutées par l'utilisateur sont des actions permettant d'aimer (LIKE) ou ne plus aimer (DISLIKE) un personnage.

Nous allons commencer tout d'abord par définir le typage TypeScript des données que nous souhaitons exposer depuis notre context. Nous souhaitons exposer

- un tableau de personnages
- une fonction permettant d'ajouter un personnage
- une fonction permettant de supprimer un personnage

Une fois cette étape définie, nous pouvons créer notre context grâce à la méthode `createContext`.

Dans l'ensemble de notre application, nous allons avoir besoin de deux informations relatives au `store`

Une fois le context défini, nous somme capable maintenant de l'utiliser dans notre application. Tout d'abord ajouter le composant `Provider` dans le composant principal de l'application et créez un objet respectant le type défini ci-dessus.

Dans le composant `Home`, juste en dessous du titre `h1`, nous allons ajouter le code HTML suivant :

```html
<h2>Vous aimez X personnages</h2>
```

Le X devra être remplacer par le nombre de personnes aimés.

Dans le composant `PeopleItem`, nous allons ajouter une nouvelle colonne permettant d'afficher deux boutons permettant d'aimer ou de ne plus aimer un personnage. Si nous n'aimons pas le personnage, nous devons afficer le bouton **I Like**, dans le cas contraire le bouton **I Dislike**.

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
  I Dislike
</button>
```

Connectez les composants `Home` et `PeopleItem` au context afin d'implémenter le fonctionnement souhaité.

## PW8 - React Router

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [React Router](https://reactrouter.com/en/main/start/tutorial)
  :::

Nous allons à présent ajouter une deuxième page à notre application. Cette page sera utilisée lorsque l'utilisateur cliquera sur le nom d'un personnage. Elle affichera les informations du personnage selectionné.

Vous devez tout d'abord installer la dépendance `react-router-dom`.

```shell
npm install react-router-dom
```

Un fois installée, suivez les étapes suivantes afin d'implémenter le fonctionnel souhaité :

- Externalisez le contenu du composant `App` dans un nouveau composant `Home`
- Créez un composant `Person` qui pour l'instant retournera l'HTML de votre choix
- Configurez le router dans le composant principal. Nous souhaitons que le composant `Home` soit affiché par défaut, et le composant `Person` si l'url est égale à `/person/:id`.
- Ajoutez un lien dans le composant `PeopleItem` permettant de faire la redirection
- Implementez le composant `Person`. Vous devez récupérez l'id passé dans l'URL et faire une nouvelle requête HTTP vers l'API afin de récupérer les informations du personnage selectionné.
- Vous pouvez éventuellement réutiliser le hook `useFetch` créé précédemment pour récupérer les informations du personnage.
- Si vous avez ajouté un loader pour le composant `Person`, vous pouvez également externaliser ce loader dans un nouveau composant React.

L'API utilisée ne retourne pas d'identifiant pour les objets.
Vous pouvez tout de même en calculer un en se basant sur la propriété `url` de l'objet.
Pour cela, vous pouvez utiliser la fonction suivante :

```typescript
// http://swapi.dev/api/people/1/
function getIDFromUrl(url: string): string {
  const withoutPrefix = url.replace("https://swapi.dev/api/people/", "");
  return withoutPrefix.replace("/", "");
}
```

## PW9 - Internationalisation

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [react-i18next](https://react.i18next.com/)
- [Les boutons avec Bulma](https://bulma.io/documentation/elements/button/)
  :::

Dans cette dernière partie pratique, nous allons internationaliser l'application.

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
Pour cela, nous allons tout d'abord installer le module `i18next-icu`.

```shell
npm install i18next-icu intl-messageformat
```

Une fois installé, nous devons l'ajouter à la configuration du module `react-i18next`.

```typescript
import ICU from "i18next-icu";
...

i18n
  .use(ICU))
```

Dans la configuration définie précédemment, nous allons ajouter un message, via la syntaxe ICU, permettant d'internationaliser le dernier message de notre application.

```html
<h2>Vous aimez X personnages</h2>
```

Une fois cette configuration réalisée, nous allons à présent pouvoir intégrer `react-i18next` dans l'application. Dans le fichier `App.js`, importez le module précédemment crée.

Dans les composants `PeopleList`, `DumbPeopleItem` et `DumbHome`, utilisez la méthode `useTranslation` pour récupérer puis ensuite afficher le message souhaité.

Dans le composant `DumbHome`, ajoutez deux boutons permettant de choisir la langue française ou anglaise. Pour cela, vous pouvez utiliser le code HTML suivant :

```html
<div className="is-pulled-right">
  <button type="button" className="button" onClick="{...}">FR</button>
  <button type="button" className="button" onClick="{...}">EN</button>
</div>
```

## PW10 - Formik

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [Formik](https://formik.org/)
  :::

Afin de mettre en place **Formik** sur notre application, un TP a été ajouté permettant de s'initier à ce module.

Dans la page affichant le détail d'un personnage, nous allons à présent mettre un formulaire (rien ne se passera au click sur le bouton submit malheureusement, car nous n'avons pas la main en écriture sur l'API).

Dans le formulaire, vous devez resepectez les contraintes suivantes :

- Le nom est obligatoire
- La propriété _hair_color_ doit utiliser un composant _select_
- La propriété _gender_ doit utiliser des _radios_
- La propriété _height_ doit obligatoirement être supérieur à 0

Afin d'améliorer notre formulaire, vous devez également ajouter les messages d'erreurs adéquates.

## PW11 - TanStack Query

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [TanStack Query](https://tanstack.com/query/latest/docs/react/overview)
- [TanStack Query v4](https://www.learnwithjason.dev/tanstack-query-v4)
- [Le server state facile avec Tanstack Query](https://www.youtube.com/watch?v=kNaBVAdwbR4)
  :::

Dans cette partie théorique, nous allons mettre en place **TanStack Query** afin de s'assurer qu'aucune requête n'est faite en double (requêtes récupérant la liste des personnages et celles récupérant un personnage)

## PW12 - Variables d'environnement

:::note
- [Vite env](https://vitejs.dev/guide/env-and-mode)
  :::

Externaliser la base de l'url de l'API consommée.
Pour cela, créer un fichier `.env` avec une valeur par défaut, et un fichier `.env.local` surchargeant cette valeur. Utiliser cette variable d'environnement dans vos composants, de sorte que votre code soit portable.

## PW13 - State manager - Recoil

:::note
- [Recoil](https://recoiljs.org/fr/docs/introduction/getting-started)
  :::

Nous avons utilisé l'API `context` pour gérer les likes jusqu'ici.
Dans cette partie, nous allons externaliser la gestion des états des likes dans un state manager : recoil.

Pour cela, nous allons tout d'abord installer le module `recoil`.

```shell
npm install recoil
```

Une fois installé, nous devons ajouter la provider recoil, `RecoilRoot` au niveau le plus haut de notre application (fichier `main.tsx`). Tous les composants enfants pourront alors communiquer avec les états gérés par recoil.

```typescript
...
import { RecoilRoot } from "recoil";

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RecoilRoot>
			<RouterProvider router={router} />
		</RecoilRoot>
	</React.StrictMode>
);
```

Nous allons ensuite définir un `atom` (morceau d'état).
Nous pouvons créer un dossier `store` à la racine de src pour définir nos morceaux d'état

```typescript
const likeState = atom({
  key: 'likeState',
  default: {} as Record<string, number>,
});
```

A la façon de `useState`, nous pouvons utiliser `useRecoilState` pour accéder à la valeur et au setter de l'atom `likeState`

```typescript
import { FC } from 'react'
import { useRecoilState } from 'recoil'

const Component: FC = () => {
  const [text, setText] = useRecoilState(textState);
  return ...
}
```

# PW Bonus

- React 19
- factoriser les composants UI dans un répertoire `common` : fixer / améliorer un composant nécessitera la modification d'un seul fichier au lieu de X morceaux de jsx
- dockeriser l'application :
  - ajouter un fichier `Dockerfile`
  - ajouter une configuration de CI
- next.js