# Travaux Pratiques

Voici le contenu nécessaire pour la partie pratique de la formation Accessibilité.

Durant ces parties pratiques, nous allons nous concentrer sur du code HTML et JavaScript.
Nous ne travaillerons pas, en tout cas de façon prioritaire, sur le style de nos pages HTML.
L'objectif est de créer une application accessible en appliquant les bonnes pratiques vues en formation.

## PW 01 - Synthétiseur vocal

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [Assistive Tech - VoiceOver](https://youtu.be/5R-6WvAihms)
- [Assistive Tech - NVDA](https://youtu.be/Jao3s_CwdRU)
:::

Dans ce premier exercice, et en préparation des suivants, nous allons nous assurer que
vous avez un logiciel de synthèse vocale (lecteur d'écran) installé.

En fonction de votre système d'exploitation, vous serez peut-être dans l'obligation d'en installer un.

**Installation :**
- **Windows** : Installez [NVDA](https://www.nvda-fr.org/cat.php?id=2) (gratuit et open-source)
- **macOS** : Utilisez VoiceOver (déjà installé, activez-le avec Cmd + F5)
- **Linux** : Installez Orca (via votre gestionnaire de paquets)

**Premiers pas :**

1. **Raccourcis essentiels à maîtriser :**
   - **NVDA (Windows)** :
     - Insert + Down : mode navigation
     - Insert + Espace : basculer mode formulaire/navigation
     - H : naviguer entre les titres
     - K : naviguer entre les liens
     - F : naviguer entre les champs de formulaire
   - **VoiceOver (macOS)** :
     - VO + A : lire tout
     - VO + Flèches : naviguer
     - VO + U : menu de navigation (titres, liens, formulaires)
     - Ctrl : arrêter la lecture

2. **Exercice pratique :**
   - Naviguez sur quelques sites web pour comprendre l'expérience utilisateur
   - Testez la navigation par titres, liens et formulaires
   - Essayez de remplir un formulaire les yeux fermés
   - Notez les difficultés rencontrées

## PW 02 - Auditer un site

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* [https://www.w3.org/TR/WCAG/](https://www.w3.org/TR/WCAG/)
:::

Dans cet exercice, nous allons vous demander de détecter manuellement les éventuels problèmes d'accessibilité
d'une application web.

**Objectifs :**
- Identifier les problèmes d'accessibilité
- Catégoriser les problèmes par niveau WCAG (A, AA, AAA)
- Proposer des solutions

**Site à auditer :**
Vous pouvez soit auditer l'une de vos applications, soit utiliser : https://www.cdiscount.com/

**Points à vérifier :**
- Navigation au clavier (Tab, Shift+Tab, Entrée)
- Présence et pertinence des alternatives textuelles (images, icônes)
- Contraste des couleurs (textes, boutons)
- Structure des titres (h1, h2, h3...)
- Labels des formulaires
- Utilisation du lecteur d'écran

## PW 03 - Focus

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [MDN - :focus-visible](https://developer.mozilla.org/fr/docs/Web/CSS/:focus-visible)
- [WebAIM - Skip Navigation Links](https://webaim.org/techniques/skipnav/)
- [WCAG - Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)
:::

Durant cette partie pratique, nous allons créer des templates HTML permettant de créer une application de gestion d'arbres généalogiques.

**Contexte du projet :** Application "Genea11y" (Genealogy + a11y)

Nous allons faire très simple, nous allons juste gérer les informations générales d'une personne, ainsi que son ascendance directe.

Afin d'initier le projet, veuillez créer les fichiers suivants :

- `index.html` contenant la structure de la page
- `style.css` contenant le design
- `script.js` contenant la dynamisation

Dans le fichier HTML, créez un squelette de page vide en important les deux autres fichiers créés.

**Serveur local :**

Pour les besoins des TPs suivants, nous allons héberger notre application sur un serveur local.
Vous pouvez soit utiliser Apache (WAMP, LAMP, MAMP), soit exécuter la ligne de commande suivante (nécessitant Node.js) :

```shell
npx serve
```

**Étapes :**

1. Dans le contenu du fichier `index.html`, copiez le contenu suivant dans la balise `<body>` (ce contenu sera modifié dans un prochain exercice) :

```html
<h1>Genea11y</h1>
<a href="/">Home</a>
<a href="/creation.html">Création</a>
Main Contenu
<button>Action</button>
```

2. Une fois ce code inséré, ajoutez le système de **Skip Link** permettant d'aller directement au contenu principal du site.
   - Créez un lien "Aller au contenu principal" en tout début de page
   - Masquez-le visuellement par défaut
   - Affichez-le au focus (`:focus`)
   - Faites-le pointer vers l'ID du contenu principal

3. Définissez un style particulier (de votre choix) pour le bouton lorsqu'il reçoit le focus.
   - Utilisez `:focus-visible` pour n'afficher l'indicateur qu'au clavier
   - Assurez un contraste suffisant (minimum 3:1)

## PW 04 - HTML

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* [https://html.spec.whatwg.org/multipage/](https://html.spec.whatwg.org/multipage/)
:::

Nous allons définir, dans la page précédemment créée, une structure HTML sémantique plus propre.

**Objectifs :**

1. **Structure sémantique :**
   - Utilisez les balises `<header>`, `<nav>`, et `<main>`
   - Dans le `<header>`, affichez un menu contenant deux liens :
     - Un lien pour aller sur la page principale du site (page que nous sommes en train d'éditer)
     - Un lien pour créer une nouvelle personne
   - Ajoutez un `<h1>` pour le titre de l'application

2. **Page active dans le menu :**
   - Gérez le cas où le lien d'un élément correspond à la page en cours d'affichage
   - Utilisez l'attribut `aria-current="page"` sur le lien actif
   - Ajoutez un style visuel différent pour le lien actif

3. **Tableau de données :**

Dans la partie centrale de notre page, ajoutez un tableau permettant de lister des personnes.

**Caractéristiques du tableau :**
- Utilisez un `<caption>` pour décrire le tableau
- Utilisez `<thead>` et `<tbody>` pour structurer
- Colonnes : Nom, Prénom, Date de naissance, Actions
- Dans la colonne Actions, ajoutez un lien vers une page `details.html` (que nous n'implémenterons pas durant cette formation)
- Assurez-vous que tous les en-têtes utilisent `<th>` avec l'attribut `scope="col"`

**Données exemple :**
```javascript
const personnes = [
  { nom: "Dupont", prenom: "Jean", dateNaissance: "1980-05-15" },
  { nom: "Martin", prenom: "Marie", dateNaissance: "1975-03-22" },
  { nom: "Bernard", prenom: "Pierre", dateNaissance: "1990-11-08" }
];
```

:::note
**Partie bonus - Système de tri :**

Implémentez un système de tri pour le tableau. L'utilisateur pourra trier par nom ou prénom (ascendant/descendant).

- Utilisez l'attribut `aria-sort` sur les `<th>` cliquables
- Valeurs possibles : `none`, `ascending`, `descending`
- Gérez les événements au clavier (Entrée/Espace) en plus du clic
- Mettez à jour `aria-sort` dynamiquement en JavaScript
:::

## PW 05 - Les formulaires

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [MDN - Formulaires HTML](https://developer.mozilla.org/fr/docs/Learn/Forms)
- [WebAIM - Creating Accessible Forms](https://webaim.org/techniques/forms/)
- [WCAG - Labels or Instructions](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html)
:::

Nous allons à présent créer la seconde page HTML permettant de définir un formulaire pour ajouter une nouvelle personne à notre arbre généalogique.

**Objectifs :**

Dans un fichier `creation.html`, créez un formulaire permettant de saisir les informations suivantes :

1. **Champs du formulaire :**
   - Nom et Prénom de la nouvelle personne
   - Date de naissance (`<input type="date">`)
   - Date de décès (optionnel)
   - Sexe (utiliser des boutons radio dans un `<fieldset>` avec `<legend>`)
   - Nom et Prénom des deux parents (groupés dans un `<fieldset>`)

2. **Accessibilité du formulaire :**
   - Tous les champs doivent avoir un `<label>` associé (attribut `for`)
   - Utilisez `<fieldset>` et `<legend>` pour grouper les champs liés
   - Ajoutez l'attribut `required` sur les champs obligatoires
   - Ajoutez l'attribut `autocomplete` approprié sur les champs

3. **Validation et gestion des erreurs :**
   - Le nom et le prénom sont **obligatoires**
   - Si les données sont invalides :
     - Affichez un message d'erreur clair près du champ concerné
     - Utilisez `aria-invalid="true"` sur le champ en erreur
     - Reliez le message d'erreur avec `aria-describedby`
   - Modifiez la feuille de style pour un look spécifique quand le champ est en erreur
     - Exemple : `input[aria-invalid="true"] { border-color: red; }`
   - S'il y a des erreurs, mettez le focus sur le premier élément en erreur
   - Affichez un résumé des erreurs en haut du formulaire (liste avec liens vers les champs)

## PW 06 - Les Attributs ARIA

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* [https://www.w3.org/TR/wai-aria/](https://www.w3.org/TR/wai-aria/)
* [WAI ARIA Practices - Radio](https://www.w3.org/TR/2017/WD-wai-aria-practices-1.1-20170628/examples/radio/radio-1/radio-1.html)
:::

Dans cette partie pratique, nous allons implémenter un nouveau composant `radio` personnalisé qui sera utilisé dans notre formulaire
à la place du composant natif (bien évidemment c'est dans un but pédagogique uniquement).

**⚠️ Rappel important :** En production, utilisez toujours `<input type="radio">` natif !

**Objectifs :**

1. **Structure HTML :**
   - Créez des `<div>` avec `role="radio"`
   - Groupez-les dans un conteneur avec `role="radiogroup"`
   - Ajoutez `aria-labelledby` sur le groupe pour le label

2. **Attributs ARIA requis :**
   - `aria-checked="true"` ou `"false"` sur chaque radio
   - `tabindex="0"` sur le radio sélectionné, `tabindex="-1"` sur les autres
   - Le groupe doit avoir un label (via `aria-labelledby` ou `aria-label`)

3. **Navigation au clavier :**
   - **Tab** : entre dans le groupe (focus sur l'élément sélectionné)
   - **Flèches haut/bas** ou **gauche/droite** : sélectionne le radio précédent/suivant
   - **Espace** : sélectionne le radio focusé
   - Implémentez le pattern "roving tabindex"

4. **Gestion JavaScript :**
   - Mettez à jour `aria-checked` lors de la sélection
   - Gérez le déplacement du focus avec les flèches
   - Mettez à jour les `tabindex` pour le roving tabindex

**Référence :** Consultez [WAI ARIA Practices - Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)

## PW 07 - Les composants complexes

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [WAI ARIA Practices - Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [MDN - The Dialog element](https://developer.mozilla.org/fr/docs/Web/HTML/Element/dialog)
- [A11ycasts - Dialog](https://www.youtube.com/watch?v=JS68faEUduk)
:::

Dans cette partie pratique, nous allons ouvrir une modale suite au clic sur une ligne du tableau. La modale affichera
le détail de la personne sélectionnée.

**Objectifs :**

1. **Structure de la modale :**
   - Utilisez `<dialog>` natif (recommandé) ou `role="dialog"` avec ARIA
   - Ajoutez `aria-modal="true"` pour indiquer que c'est une modale
   - Ajoutez `aria-labelledby` pointant vers le titre de la modale
   - Incluez un bouton de fermeture clairement identifiable

2. **Gestion du focus :**
   - **À l'ouverture :** mettez le focus sur le bouton "Fermer" en premier
   - **Piège à focus :** le focus doit rester dans la modale (Tab/Shift+Tab en boucle)
   - **À la fermeture :** remettez le focus sur l'élément à l'origine de l'ouverture (ligne du tableau)

3. **Navigation au clavier :**
   - **Échap** : ferme la modale
   - **Tab** : navigue entre les éléments focusables de la modale
   - **Shift+Tab** : navigation inverse
   - Le focus ne doit jamais sortir de la modale tant qu'elle est ouverte

4. **Contenu de la modale :**
   - Titre : "Détails de [Prénom Nom]"
   - Affichage des informations : nom, prénom, date de naissance
   - Bouton "Fermer" clairement visible

5. **Accessibilité supplémentaire :**
   - Masquez le contenu derrière la modale avec `aria-hidden="true"`
   - Empêchez le scroll du body quand la modale est ouverte
   - Ajoutez un overlay semi-transparent

**Référence :** Consultez [WAI ARIA Practices - Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

## PW 08 - Audit

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* [Lighthouse](https://developers.google.com/web/tools/lighthouse/?utm_campaign=chrome_series_lighthouse_110317&utm_source=chromedev&utm_medium=yt-desc)
* [Playwright](https://playwright.dev/docs/accessibility-testing)
:::

Nous allons dans cette partie pratique mettre en place une solution permettant d'assurer un niveau d'accessibilité dans notre application.
Pour cela, nous allons utiliser les outils suivants :

- **Lighthouse** (Chrome DevTools)
- **Playwright** avec **Axe-core**

### Lighthouse

**Objectifs :**

1. Ouvrez votre application dans Chrome
2. Ouvrez les DevTools (F12)
3. Allez dans l'onglet "Lighthouse"
4. Sélectionnez uniquement "Accessibility" dans les catégories
5. Lancez l'audit
6. Analysez les résultats :
   - Score global
   - Liste des problèmes détectés
   - Recommandations pour corriger

**À faire :**
- Identifiez les problèmes critiques (score < 90)
- Corrigez au moins 3 problèmes détectés
- Relancez l'audit et visez un score > 95

### Playwright

**Installation :**

1. Initialisez un nouveau projet Playwright :
```bash
npm init playwright@latest
```

2. Installez axe-core :
```bash
npm install -D @axe-core/playwright
```

Suite à cette commande, un nouveau répertoire **tests** a été ajouté à votre projet.

**Objectifs :**

3. Créez un fichier `tests/accessibility.spec.js` :

```javascript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Tests d\'accessibilité', () => {
  test('Page d\'accueil doit être accessible', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page de création doit être accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/creation.html');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

4. Exécutez les tests :
```bash
npx playwright test
```

5. Si des violations sont détectées, corrigez-les et relancez les tests

**Bonus :**
- Ajoutez des tests pour différents états de l'application (modale ouverte, formulaire en erreur)
- Configurez Playwright pour tester sur plusieurs navigateurs

## PW 09 - Microdata

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* [Outils de test des données structurées](https://search.google.com/structured-data/testing-tool/u/0/?hl=fr)
:::

Nous allons à présent ajouter des microdonnées (microdata) sur notre code HTML existant pour enrichir la sémantique.

**Objectifs :**

Dans le tableau listant toutes les personnes de notre arbre généalogique, ajoutez les microdonnées nécessaires afin
de structurer nos données pour les moteurs de recherche.

1. **Schema.org - Person :**

Utilisez le vocabulaire [Schema.org/Person](https://schema.org/Person) pour marquer les données des personnes :

```html
<tr itemscope itemtype="https://schema.org/Person">
  <td itemprop="familyName">Dupont</td>
  <td itemprop="givenName">Jean</td>
  <td itemprop="birthDate">1980-05-15</td>
  <td><a href="details.html">Détails</a></td>
</tr>
```

2. **Propriétés à utiliser :**
   - `familyName` : nom de famille
   - `givenName` : prénom
   - `birthDate` : date de naissance
   - `deathDate` : date de décès (si applicable)

3. **Test des microdonnées :**

Une fois implémenté, testez vos microdonnées avec :
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

**Bonus :**
- Ajoutez des microdonnées sur le formulaire de création
- Utilisez `itemscope` imbriqué pour les relations parent-enfant
- Explorez d'autres vocabulaires comme `FamilyTree` ou `Person.parent`