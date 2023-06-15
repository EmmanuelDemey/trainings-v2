## PW7 - Hook

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* Hook[https://fr.reactjs.org/docs/hooks-intro.html]
* https://swapi.dev/[SWAPI]

Dans les travaux précédents, les données étaient définies en mémoire. Nous allons dans ce TP, récupéz les données
depuis l'API REST swapi.

Nous allons tout d'abord supprimer le tableau défini précédemment

Une fois cette étape réalisée, définissez un nouvelle variable d'état via le hook `useState`. Nous nommerons
cette variable `people`. A présent c'est sur cette variable que vous devriez appliquer votre filtre.

Via l'utilisation du hook `useEffect`, faites un requéte `GET` vers le endpoint : `https://swapi.dev/api/people/`. Faites attention à la structure de la réponse HTTP.

Nous allons également ajouter un `loader` dans les cas ou l'API pourrait prendre du temps pour répondre. Ce loader sera affiché en fonction d'une nouvelle donnée disponible dans une variable d'état du composant.

Juste avant le JSX de notre composant App, ajoutez le code ci-dessous.

```javascript
if (loading) {
    return (
      <progress className="progress is-small is-primary" max="100"></progress>
    );
}
```

Vous devez a présent faire le nécessaire pour définir cette variable `loading` au bon moment. Pour tester
cet ajout, vous devrez peut-être ralentir votre connexion. Pour cela, vous pouvez émuler une connexion lente via les Devtools de votre navigateur.

Pour finaliser cette partie pratique, dès que l'utilisateur modifie la valeur du champ de formulaire, réalisez une nouvelle requête HTTP afin
d'exécuter la recherche coté API. Pour cela, vous devez utiliser la route `https://swapi.dev/api/people/?search=r2` ou `r2` est la chaine de
caractères que l'utilisateur recherche.

Comme partie bonus, nous allons gérer la pagination de notre tableau. En effet, l'API que nous utilisons retourne 10 personnages
par page. Sur la page dévelopée, ajoutez deux boutons afin de naviguer de page en page, et ainsi visualiser l'ensemble
des personnages de Star Wars.

Comme seconde partie bonus, nous allons créer un `custom hook`. Ce hook, que nous nommerons `useFetch` devra gérer la récupération
des données et la gestion de la variable `loading`.

Ce hook s'utilisera de cette façon :

```javascript
const [data, loading] = useFetch();
```

Si vous avez fait la partie bonus précédente, il se peut que ce hook gère plus de choses.
