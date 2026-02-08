# Formation TypeScript

Durant cette formation, nous allons développer un petit utilitaire en ligne de commande permettant de lister, sauvegarder, ajouter des éléments dans une *todo list*

## PW1 - Getting Started

* Initier un projet TypeScript avec un fichier TypeScript `cli.ts` exposant une fonction basique
* Vérifier que la compilation fonctionne
* Tester ts-node (ou `tsx` comme alternative plus moderne)
* Installer jest et écrire un premier test et eslint

## PW2

```
ts-node cli.ts add ...
ts-node cli.ts list
ts-node cli.ts toggle ...
ts-node cli.ts delete ...
```

* Définir un type permettant d'avoir les options add / list / toggle / delete
* Créer une interface TodoList qui implémente les 4 fonctions
* Créer une implémentation FileSystem et implémenter le code
* Ajouter le typage pour node (`@types/node`)
* Dans cli.ts, instancier FileSystem, et appeler la bonne méthode en fonction de la commande
* Créer un module pour définir le code de la classe et l'interface
* Remplacer les types add | list par des enums
* À nos todos, on va ajouter un identifiant unique (Math.random())
  * Chaque méthode doit pouvoir accepter une string ou un number
  * Utiliser de la surcharge de méthode et un typeof guard
