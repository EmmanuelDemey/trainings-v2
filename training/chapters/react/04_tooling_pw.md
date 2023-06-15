# PW3 - Outillage

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.cypress.io/[Cypress]

Nous allons à présent ajouter des tests Cypress. Pour cela, il est d'abord nécéssaire d'installer la dépendance.

```shell
npm install -D cypress
```

Une fois installée, nous allons ajouter un script dans notre fichier `package.json`.

```json
{
  "scripts":{
    "cypress:open": "cypress open",
    "cypress:run": "cypress run"
  }
}
----

Si à présent vous exécutez la commande `npm run cypress:open`, l'interface graphique doit étre visible vous permettant de lancer les tests générés par Cypress.

Vous devez à présent supprimer les tests générés et créer vos propres tests afin de tester l'interface graphique de votre application.

