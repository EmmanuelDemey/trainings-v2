# Formation Angular

Durant cette formation, nous allons développer une application permettant la visualisation des personnages des films Star Wars.

## PW1 - Getting Started

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://angular.dev/docs[Angular]
* https://angular.dev/cli[@angular/cli]
* https://bulma.io/[Bulma]


Dans ce TP, nous allons tout d'abord initialiser un projet Angular via le module `@angular/cli`.

Dans votre terminal, veuillez exécuter les commandes suivantes :

```shell
npm install -g @angular/cli
ng new first-project
```

Une fois le projet créé, vous pouvez exécuter les commandes suivantes afin de vérifier qu'il est bien fonctionnel.

```shell
cd first-project
npm run start
```

Nous allons ensuite installer la librairie CSS `Bulma`, nous permettant de nous aider lors de la création du style de notre application.
Pour cela, vous devez exécuter la commande suivante :

```shell
npm install bulma
```

Une fois installée, vous devez l'importer dans votre application. Nous avons l'habitude de faire ce genre d'import au plus haut niveau de l'application. Donc par exemple dans le fichier `src/main.ts`, veuillez ajouter l'import ci-dessous.

```javascript
import "bulma/css/bulma.css";
```

Nous allons ensuite intégrer le *layout* de base de la librairie Bulma. Modifiez tout d'abord le contenu du fichier `src/index.html` avec le contenu suivante :

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hello Bulma!</title>
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

Nous allons terminer par la modification du fichier `src/app/app.component.ts` afin qu'il utilise le template suivant.

```html
<section class="section">
  <div class="container">
    <h1 class="title">Hello World</h1>
    <p class="subtitle">
      My first website with <strong>Bulma</strong>!
    </p>
  </div>
</section>
```

Veuillez vérifier que les modifications apportées sont bien prises en compte dans votre navigateur. 

Vous pouvez également générer la version de production et émuler le fonctionnement d'un serveur web.

```shell
npm run build
cd dist/first-project
npx serve
```

## PW2 - Template

Dans ce TP, nous allons afficher des personnages de Star Wars. Nous n'allons pas créer de nouveaux composants ou encore récupérer les données depuis une API Rest pour le moment.

Tout se fera en mémoire pour le moment et dans le fichier `app.component.ts`.

Dans ce fichier, déclarez une variable d'instance contenant cette valeur :

```json
[{
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
            "vehicles": [
                "http://swapi.dev/api/vehicles/14/",
                "http://swapi.dev/api/vehicles/30/"
            ],
            "starships": [
                "http://swapi.dev/api/starships/12/",
                "http://swapi.dev/api/starships/22/"
            ],
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
            "species": [
                "http://swapi.dev/api/species/2/"
            ],
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
            "species": [
                "http://swapi.dev/api/species/2/"
            ],
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
            "starships": [
                "http://swapi.dev/api/starships/13/"
            ],
            "created": "2014-12-10T15:18:20.704000Z",
            "edited": "2014-12-20T21:17:50.313000Z",
            "url": "http://swapi.dev/api/people/4/"
        }
]
```

Dans un prochain TP, nous récupérons cette donnée directement depuis l'API swapi.

Dans l'implementation du composant `app.component.ts`, ajoutez ce template HTML

```html
<table class="table is-fullwidth">
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

Vous devez ensuite générer autant de balises `tr` que de personnages à afficher. Pour cela, nous allons utiliser la syntaxe `@for`.

```html
@for (person of people; track person.url) {
  <tr>
    <td>{{ person.name }}</td>
    <td>{{ person.gender }}</td>
    <td>{{ person.birth_year }}</td>
  </tr>
}
```

## PW3 - Composant

Nous allons à présent ajouter un champ de recherche permettant de filtrer les personnages. Juste au dessus du tableau, ajoutez le code HTML ci-dessous :

```html
<div class="field">
    <div class="control">
        <input class="input is-info" type="text" />
    </div>
</div>
```

Nous allons ensuite externaliser le code créé précédemment dans trois composants bien spécifique :

* `PeopleFilter` : Ce composant aura en charge de gérer le champ de formulaire permettant de filtrer les personnages
* `PeopleTable` : Ce composant aura en charge la génération du tableau.
* `PeopleItem` : Ce composant aura en charge la génération d'un item du tableau.

Veuillez implémenter les communications entre les composants afin de faire le traitement souhaité. 

## PW4 - RX.js et Http

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* HTTP Communication [https://angular.dev/guide/http-server-communication]
* https://swapi.dev/[SWAPI]

Dans les travaux précédents, les données étaient définies en mémoire. Nous allons dans ce TP récuper les données depuis l'API REST swapi.

Nous allons tout d'abord supprimer le tableau statique défini précédemment

Une fois cette étape réalisée, ajouter un appel HTTP afin de récupérer la liste des personnages de StarWars en utilisation l'API **SWAPI**.

Pour finaliser cette partie pratique, dès que l'utilisateur modifie la valeur du champ de formulaire, réalisez une nouvelle requête HTTP afin
d'exécuter la recherche coté API. Pour cela, vous devez utiliser la route `https://swapi.dev/api/people/?search=r2` ou `r2` est la chaine de caractères que l'utilisateur recherche.

Comme partie bonus, nous allons gérer la pagination de notre tableau. En effet, l'API que nous utilisons retourne 10 personnages par page. Sur la page dévelopée, ajoutez deux boutons afin de naviguer de page en page, et ainsi visualiser l'ensemble des personnages de Star Wars.


## PW5 - Router

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://angular.dev/guide/router-reference[Router]

Nous allons à présent ajouter une deuxième page à notre application. Cette page sera utilisée lorsque l'utilisateur cliquera sur le nom d'un personnage. Elle affichera les informations du personnage selectionné.

Vous devez tout d'abord installer la dépendance `@angular/router`.

```shell
npm install @angular/router
```

Un fois installée, suivez les étapes suivantes afin d'implémenter le fonctionnel souhaité :

* Externalisez le contenu du composant `App` dans un nouveau composant `Home`
* Créez un composant `Person` qui pour l'instant retournera l'HTML de votre choix
* Configurez le router dans le composant principal. Nous souhaitons que le composant `Home` soit affiché par défaut, et le composant `Person` si l'url est égale à `/person/:id`.
* Ajoutez un lien dans le composant `PeopleItem` permettant de faire la redirection
* Implementez le composant `Person`. Vous devez récupérez l'identifiant passé dans l'URL et faire une nouvelle requête HTTP vers l'API afin de récupérer les informations du personnage selectionné.

L'API utilisée ne retourne pas d'identifiant pour les objets.
Vous pouvez tout de même en calculer un en se basant sur la propriété `url` de l'objet.
Pour cela, vous pouvez utiliser la fonction suivante :

```javascript
// http://swapi.dev/api/people/1/
function getIDFromUrl(url: string){
    const withoutPrefix = url.replace("https://swapi.dev/api/people/", "")
    return withoutPrefix.replace("/", "");
}
```

## PW6 - Services

Dans ce TP, nous allons ajouter la fonctionnalité permettant d'aimer des personnages. Cette information sera centralisée dans un service.

Veuillez créer un service proposant 
* des méthodes *like* et *dislike*. 
* un observable permettant d'émettre le tableau de personnages aimés
* un second observable, basé sur le premier, afin de retourner le nombre des personnages aimés. 

Veuillez ajouter le code nécessaire dans ce service afin d'implémenter le fonctionnemtn souhaité : 
  * Au click sur un bouton, on aime ou on n'aime pas le personnage
  * Il faut afficher un bouton *like* ou *dislike* en fonction de l'état actuel du personnage. 

```html
<button
    type="button"
    class="button is-warning"
    (click)="..." >
  I Like
</button>
```

Enfin dans le composant **Home**, veuillez ajouter et dynamiser le template HTML suivant, afin d'afficher le nombre de personnages aimés. 

```html
<h2>Vous aimez X personnages</h2>
```
