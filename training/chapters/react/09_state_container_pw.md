## PW9 - State Container

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://redux.js.org/basics/usage-with-react[React Redux]
* https://bulma.io/documentation/elements/button/[Les boutons avec Bulma]

Dans ce TP, nous allons ajouter la fonctionnalité permettant d'aimer des personnages. Cette information sera centralisée dans un store Redux.

Avant de commencer, nous devons tout d'abord installer les dépendances nécessaires.

```shell
npm install redux react-redux redux-logger
```

Les actions qui pourront étre exécutées par l'utilisateur sont des actions permettant d'aimer (LIKE) ou ne plus aimer (DISLIKE) un personnage.

Nous allons commencer tout d'abord par le reducer de notre store.
Implémentez une méthode `starWarsLike` qui, en fonction de ces paramètres `state` et `action`, retourne la nouvelle valeur du `state`.

Une fois ce reducer défini, nous pouvons créé notre store. Pour cela nous allons faire appel à la méthode `createStore`.
Afin de faciliter le debogage , nous allons ajouter le middleware `redux-logger`.

```javascript
import { createLogger } from "redux-logger";
import { createStore, applyMiddleware, compose } from "redux";
import { starWarsLike } from "./starWarsLike";

const store = createStore(
  starWarsLike,
  [],
  compose(applyMiddleware(createLogger()))
);
```

Dans l'ensemble de notre application, nous allons avoir besoin de deux informations relatives au `store`
* Le nombre de personnages mis en favoris
* Un booléen permettant d'indiquer si un personnage en particulier a été mis en favoris.

Pour cela, nous allons créer deux selecteurs :
* `getAllLikesCount`
* `isLiked`

Pour rappel, un selecteur prend notamment en paramètre le state lui même. Vous devez tout simplement retourner la donnée désirée en fonction du state que vous avez en paramètre.

Une fois le store défini, nous somme capable maintenant de l'utiliser dans notre application. Tout d'abord ajouter le composant `Provider` dans le composant principal de l'application.

Dans le composant `Home`, juste en dessous du titre `h1`, nous allons ajouter le code HTML suivant :

```html
<h2>Vous aimez X personnages</h2>
```

Dans le composant `PeopleItem`, nous allons ajouter une nouvelle colonne permettant d'afficher un bouton permettant d'aimer ou de ne plus aimer un personnage.

```javascript
<button
    type="button"
    className="button is-warning"
    onClick={ ... } >
  I Like
</button>
```

Connectez les composants `Home` et `PeopleItem` permettant d'implémenter le fonctionnement souhaité.

