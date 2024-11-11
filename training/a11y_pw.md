# Travaux Pratiques

Voici le contenu nécessaire pour la partie pratique de la formation Accessibilité.

Durant ces parties pratiques, nous allons nous concentre sur du code HTML et JavaScript.
Nous ne travaillerons pas, en tout cas de façon prioritaire, sur le style de nos pages HTML.

## PW 01 - Synthétiseur vocal

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [Assistive Tech - VoiceOver](https://youtu.be/5R-6WvAihms)
- [Assistive Tech - NVDA](https://youtu.be/Jao3s_CwdRU)
:::

Dans ce premier exercice, et en préparation des suivants, nous allons nous assurer que
vous avez un logiciel de synthèse vocale installée.

En fonction de votre système d'exploitation, vous serez peut etre dans l'obligation d'en installer un.

- Pour Windows, vous pouvez installer NVDA(https://www.nvda-fr.org/cat.php?id=2).
- Pour les utilisateurs de MacOS, vous pouvez utiliser directement VoiceOver.

## PW 02 - Auditer un site

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* [https://www.w3.org/TR/WCAG/](https://www.w3.org/TR/WCAG/)
:::

Dans cet exemple, nous allons vous demander de detecter manuellement les eventuels problèmes d'accessibilité
d'une application Web.

Vous pouvez soit auditer l'une de vos applications, soit j'ai un bon candidat pour vous : https://www.cdiscount.com/

## PW 03 - Focus

Durant cette partie pratique, nous allons créer des templates HTML permettant de créer une application de gestion d'arbres de généalogie.

Nous allons faire très simple, nous allons juste gérer les informations générales d'une personne, ainsi que son ascendance directe.

Afin d'initier le projet, veuillez créer les fichiers suivants :

- `index.html` contenant le structure de la page
- `style.css` contenant le design
- `script.js` contenant la dynamisation.

Dans le fichier HTML, créer un squelette de page vide en important les deux autres fichiers crées.

Pour les besoins des TPs suivants, nous allons hébergé notre application sur un serveur. Vous pouvez soit utiliser Apache (WAMP, LAMP,...). Pour ma part, j'executerai la ligne de commande suivante (nécessitant Node.js)

```shell
npx serve
```

* Dans le contenu du fichier `index.html`, veuillez coller le contenu suivant dans la valise body (ce contenu sera modifié dans un prochain exercice)

```html
<h1> Genea11y </h1>
<a href="/">Home</a>
<a href="/creation.html">Creation</a>
Main Contenu
<button>Action</button>
```

* Une fois ce code inséré, veuillez ajouter le système de `SkipLink` permettant d'aller directement au contenu principal du site.
* Veuillez définir un style particilier (de votre choix) pour le bouton lorsqu'il reçoit le focus.

## PW 04 - HTML

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* [https://html.spec.whatwg.org/multipage/](https://html.spec.whatwg.org/multipage/)
:::

Nous allons définir, dans la page précédemment crée, une structure plus propre.

Pour cela, vous pouvez :

* Utiliser les balises de structures main et header
** Afficher un menu contenant deux liens
*** un lien pour aller sur la page principale du site (page que nous sommes en train d'éditer)
*** un lien pou créer une nouvelle personne

* Dans le menu, vous devez gérer le cas ou le lien d'un élément correspond à la page en cours d'affichage.

Dans la partie centrale de notre page, nous allons ajouter un tableau permettant de lister des personnes.

* Ce tableau aura les caractéristiques suivantes :
** Il affichera le nom, le prénom et date de naissance.
** Ainsi qu'un lien vers une page `details.html` (que nous n'implémenterons pas durant cette formation)

:::note
Comme partie bonus, nous allons implémenter un système de tri pour notre tableu. Notre utilisateur pourra trier soit
par nom soit par prénom (de manière ascendante et descendante).

Tous ces traitements se ferons en JavaScript. Pour les données, vous pouvez définir une variable JavaScript contenant un tableau de personnes.
:::

## PW 05 - Les formulaires

Nous allons à présent créer la seconde page HTML permettant de définir un formulaire dans le but d'ajouter une nouvelle personne à notre arbre généalogique.

Dans un fichier `creation.html`, nous allons définir un formulaire permettant d'insérer les informations suivantes :

* Nom et Prénom d'une nouvelle personne
* Date de Naissance
* Date de Deces
* Le sexe en utilisant des composants `radio`
* Nom et Prénom des deux parents

De plus, ce formulaire doit respecter une contrainte de validité lors du `submit` du formulaire.

* Le nom et le prénom sont obligatoires
* Si ces données sont invalides, ajoutez un message d'erreur pour votre utilisateur.
* Modifiez éventuellement la feuille de style afin de définir un look spécifique quand le champ est en erreur.
* Si il y a des erreurs, veuillez mettre le focus sur le premier élément en erreur.

## PW 06 - Les Attributs ARIA

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* [https://www.w3.org/TR/wai-aria/](https://www.w3.org/TR/wai-aria/)
* [WAI ARIA Practices - Radio](https://www.w3.org/TR/2017/WD-wai-aria-practices-1.1-20170628/examples/radio/radio-1/radio-1.html)
:::

Dans cette partie pratique, nous allons implémenter un nouveau composant `radio` qui sera utilisé dans notre formulaire
à la place du composant natif (bien evidemment c'est dans un but pédagogique)

Il faudra ajouter tous les attributs ARIA et les accés au clavier nécessaire en fonction des guides proposés par la norme WCAG.

## PW 07 : Les composants complexes

Dans cette partie pratique, nous allons ouvrir une modale suite au `click` sur un ligne du tableau. La modale affichera
le détail de la personne selectionnée.

* Cette modale doit respecter les contraintes suivantes :
** Mettre le focus sur un bouton `close` en premier
** Une fois la modale fermée, remettre le `focus` sur la ligne à l'origine de l'ouverture de la modale.
** Cette modale affichera les nom et prénom de la personne.

## PW 08 - Audit

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* [Lighthouse](https://developers.google.com/web/tools/lighthouse/?utm_campaign=chrome_series_lighthouse_110317&utm_source=chromedev&utm_medium=yt-desc)
* [Playwright](https://playwright.dev/docs/accessibility-testing)
:::

Nous allons dans cette partie pratique, mettre en place une solution permet d'assurer un niveau d'accessibilité dans notre application.
Pour cela nous allons utiliser les outils :

* Lighthouse (Chrome)
* Playwright

### Lighthouse

* Depuis Chrome, lancez un nouvel audit d'accessibilité afin de s'assurer que votre site est conforme.

### Playwright

* Veuillez initialiser un nouveau projet Playwright/

Suite à cette dernière commande, un nouveau répertoire **tests** a été ajouté à votre projet.

* Ecrire un test permettant d'exécuter Axe pour la page d'accueil de votre application.

## PW 09 - Microdata

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* [Outils de test des données structurées](https://search.google.com/structured-data/testing-tool/u/0/?hl=fr)
:::

* Nous allons à présent ajouter des microdatas sur notre code HTML existant.

Dans le tableau listant toutes les personnes de notre arbre généalogique, ajoutez les microdonnées nécessaires afin
de structurer nos données pour le mieux.