## PW8 - React Router

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://reacttraining.com/react-router/web/guides/quick-start[React Router]

Nous allons à présent ajouter une deuxième page à notre application. Cette page sera utilisée lorsque l'utilisateur cliquera sur le nom d'un personnage. Elle affichera les informations du personnage selectionné.

Vous devez tout d'abord installer la dépendance `react-router-dom`.

```shell
npm install react-router-dom
```

Un fois installée, suivez les étapes suivantes afin d'implémenter le fonctionnel souhaité :

* Externalisez le contenu du composant `App` dans un nouveau composant `Home`
* Créez un composant `Person` qui pour l'instant retournera l'HTML de votre choix
* Configurez le router dans le composant principal. Nous souhaitons que le composant `Home` soit affiché par défaut, et le composant `Person` si l'url est égale à `/person/:id`.
* Ajoutez un lien dans le composant `PeopleItem` permettant de faire la redirection
* Implementez le composant `Person`. Vous devez récupérez l'id passé dans l'URL et faire une nouvelle requête HTTP vers l'API afin de récupérer les informations du personnage selectionné.
* Vous pouvez éventuellement réutiliser le hook `useFetch` créé précédemment pour récupérer les informations du personnage.
* Si vous avez ajouté un loader pour le composant `Person`, vous pouvez également externaliser ce loader dans un nouveau composant React.

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
