## PW5 - Composant

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://fr.reactjs.org/docs/react-component.html[React Components]


Nous allons à présent ajouter un champ de recherche permettant de filtrer les personnages. Juste au dessus du tableau, ajoutez le code HTML ci-dessous :

```html
<div className="field">
    <div className="control">
        <input
        className="input is-info"
        type="text"
        />
    </div>
</div>
```

Vous etes pour l'instant incapable de filtre la liste de personnages, car nous n'avons pas encore aborder les hooks. Pour le moment,
affichez dans la console la valeur du champ de formulaire dès que l'utilisateur insère une lettre.

Nous allons ensuite externaliser le code créé précédemment dans trois composants bien spécifique :

* `PeopleFilter` : Ce composant aura en charge de gérer le champ de formulaire permettant de filtrer les personnages
* `PeopleTable` : Ce composant aura en charge la génération du tableau.
* `PeopleItem` : Ce composant aura en charge la génération d'un item du tableau.

Nous vous conseillons d'ajouter les `PropTypes` au fur et à mesure afin de bénéficier des warnings si vous utilisez le composant de la mauvaise façon.


Comme partie bonus, nous allons créer une méthode `withTitle` pour définir un HoC. Ce HoC aura pour but de définir le titre de la page.
Cette méthode sera utilisée de cette façon.

```javascript
const componentWithTitle = withTitle(Component, 'Titre de la page');
```
