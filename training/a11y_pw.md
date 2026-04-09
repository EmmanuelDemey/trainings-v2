# Travaux Pratiques

Voici le contenu nécessaire pour la partie pratique de la formation Accessibilité.

Durant ces parties pratiques, nous allons travailler en **pur HTML, CSS et JavaScript**.
L'objectif est de créer une application accessible en appliquant les bonnes pratiques vues en formation.

## Projet Genea11y

Tout au long des TPs, nous travaillerons sur **Genea11y** (Genealogy + a11y), une application de gestion d'arbres généalogiques.

### Récupération du squelette

Un squelette de projet est fourni avec les fichiers suivants :

```
tp/a11y/
├── index.html        # Page d'accueil (liste des personnes)
├── creation.html     # Page de création d'une personne
├── style.css         # Feuille de styles (avec TODO à compléter)
└── script.js         # JavaScript (données + TODO à compléter)
```

Copiez le dossier `tp/a11y/` sur votre poste de travail.

### Serveur local

Pour tester l'application, lancez un serveur local. Vous pouvez utiliser :

```shell
# Avec Node.js (recommandé)
npx serve

# Ou avec Python
python -m http.server 3000

# Ou avec PHP
php -S localhost:3000
```

Ouvrez ensuite http://localhost:3000 dans votre navigateur.

---

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

**Livrables :**
Rédigez un mini-rapport listant au moins 5 problèmes identifiés, avec pour chacun :
- Description du problème
- Critère WCAG concerné (ex: 1.1.1 niveau A)
- Solution proposée

## PW 03 - Focus et Skip Link

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [MDN - :focus-visible](https://developer.mozilla.org/fr/docs/Web/CSS/:focus-visible)
- [WebAIM - Skip Navigation Links](https://webaim.org/techniques/skipnav/)
- [WCAG - Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)
:::

Nous allons travailler sur le squelette du projet Genea11y pour ajouter la gestion du focus et un skip link.

**Fichiers concernés :** `index.html`, `creation.html`, `style.css`

### Étape 1 : Skip Link

1. Dans `index.html` et `creation.html`, ajoutez un lien **en tout début du `<body>`** :
   ```html
   <a class="skip-link" href="#main">Aller au contenu principal</a>
   ```

2. Dans `style.css`, complétez le style de `.skip-link` :
   - Position absolute, caché au-dessus de la page (ex: `top: -40px`)
   - Au `:focus`, ramenez-le à `top: 0` avec un fond visible
   - Assurez un contraste suffisant (texte blanc sur fond sombre par exemple)

3. Vérifiez que l'attribut `id="main"` est bien présent sur la balise `<main>`

**Test :** Rechargez la page, appuyez sur Tab. Le skip link doit apparaître en haut, et un clic dessus doit envoyer le focus sur le `<main>`.

### Étape 2 : Focus visible

1. Dans `style.css`, ajoutez un style `:focus-visible` sur les boutons et les liens :
   ```css
   button:focus-visible,
   a:focus-visible {
       outline: 3px solid var(--color-focus);
       outline-offset: 2px;
   }
   ```

2. Assurez-vous que le outline a un contraste suffisant (minimum 3:1 par rapport au fond)

3. Vérifiez que le focus n'apparaît **pas** lors d'un clic souris (c'est le comportement de `:focus-visible`)

**Test :** Naviguez au clavier dans la page. Chaque élément focusable doit avoir un indicateur de focus visible et clair.

## PW 04 - HTML sémantique

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* [https://html.spec.whatwg.org/multipage/](https://html.spec.whatwg.org/multipage/)
:::

Nous allons restructurer le HTML du projet Genea11y avec une sémantique correcte.

**Fichiers concernés :** `index.html`, `style.css`, `script.js`

### Étape 1 : Structure sémantique

1. Dans le `<header>`, transformez les liens de navigation en un vrai menu :
   ```html
   <header>
     <h1>Genea11y</h1>
     <nav aria-label="Menu principal">
       <ul>
         <li><a href="/" aria-current="page">Home</a></li>
         <li><a href="/creation.html">Création</a></li>
       </ul>
     </nav>
   </header>
   ```

2. Ajoutez un style CSS pour le lien actif :
   ```css
   nav a[aria-current="page"] {
       font-weight: bold;
       border-bottom: 2px solid white;
   }
   ```

3. Dans `creation.html`, mettez `aria-current="page"` sur le lien "Création" à la place

### Étape 2 : Tableau de données

Dans `index.html`, remplacez le contenu du `<main>` par un tableau structuré :

```html
<table>
  <caption>Liste des personnes de l'arbre généalogique</caption>
  <thead>
    <tr>
      <th scope="col">Nom</th>
      <th scope="col">Prénom</th>
      <th scope="col">Date de naissance</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody id="personnes-body">
    <!-- Lignes générées en JavaScript -->
  </tbody>
</table>
```

### Étape 3 : Génération JavaScript

Dans `script.js`, créez une fonction qui génère les lignes du tableau à partir du tableau `personnes` :

```javascript
function renderTableau() {
  const tbody = document.querySelector("#personnes-body");
  tbody.innerHTML = "";

  personnes.forEach((personne) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${personne.nom}</td>
      <td>${personne.prenom}</td>
      <td><time datetime="${personne.dateNaissance}">${personne.dateNaissance}</time></td>
      <td><a href="details.html?id=${personne.id}">Voir détails</a></td>
    `;
    tbody.appendChild(tr);
  });
}
```

Appelez cette fonction dans le `DOMContentLoaded`.

**Test :** Vérifiez avec votre lecteur d'écran que le tableau est bien annoncé avec son caption et que les en-têtes sont correctement associés aux cellules.

:::note
**Partie bonus - Système de tri :**

Implémentez un système de tri pour le tableau. L'utilisateur pourra trier par nom ou prénom (ascendant/descendant).

- Transformez les `<th>` "Nom" et "Prénom" en boutons cliquables :
  ```html
  <th scope="col" aria-sort="none">
    <button type="button">Nom</button>
  </th>
  ```
- Gérez les événements `click` et `keydown` (Entrée/Espace)
- Mettez à jour `aria-sort` dynamiquement (`ascending`, `descending`, `none`)
- Re-rendez le tableau trié
:::

## PW 05 - Les formulaires

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [MDN - Formulaires HTML](https://developer.mozilla.org/fr/docs/Learn/Forms)
- [WebAIM - Creating Accessible Forms](https://webaim.org/techniques/forms/)
- [WCAG - Labels or Instructions](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html)
:::

Nous allons créer le formulaire accessible dans la page `creation.html`.

**Fichiers concernés :** `creation.html`, `style.css`, `script.js`

### Étape 1 : Structure du formulaire

Dans le `<main>` de `creation.html`, remplacez le placeholder par :

```html
<form id="creation-form" novalidate>
  <!-- Identité -->
  <fieldset>
    <legend>Identité</legend>

    <label for="nom">Nom <span aria-hidden="true">*</span></label>
    <input type="text" id="nom" name="nom" required autocomplete="family-name" />

    <label for="prenom">Prénom <span aria-hidden="true">*</span></label>
    <input type="text" id="prenom" name="prenom" required autocomplete="given-name" />

    <label for="date-naissance">Date de naissance</label>
    <input type="date" id="date-naissance" name="dateNaissance" autocomplete="bday" />

    <label for="date-deces">Date de décès <span class="sr-only">(optionnel)</span></label>
    <input type="date" id="date-deces" name="dateDeces" />
  </fieldset>

  <!-- Sexe -->
  <fieldset>
    <legend>Sexe</legend>
    <div>
      <input type="radio" id="sexe-m" name="sexe" value="M" />
      <label for="sexe-m">Masculin</label>
    </div>
    <div>
      <input type="radio" id="sexe-f" name="sexe" value="F" />
      <label for="sexe-f">Féminin</label>
    </div>
  </fieldset>

  <!-- Parents -->
  <fieldset>
    <legend>Parents</legend>

    <label for="parent1-nom">Nom du parent 1</label>
    <input type="text" id="parent1-nom" name="parent1Nom" />

    <label for="parent1-prenom">Prénom du parent 1</label>
    <input type="text" id="parent1-prenom" name="parent1Prenom" />

    <label for="parent2-nom">Nom du parent 2</label>
    <input type="text" id="parent2-nom" name="parent2Nom" />

    <label for="parent2-prenom">Prénom du parent 2</label>
    <input type="text" id="parent2-prenom" name="parent2Prenom" />
  </fieldset>

  <button type="submit">Ajouter la personne</button>
</form>
```

Notez l'utilisation de :
- `novalidate` sur le `<form>` pour gérer la validation nous-mêmes
- `<fieldset>` et `<legend>` pour grouper les champs liés
- `required` sur les champs obligatoires
- `autocomplete` pour les champs d'identité
- `aria-hidden="true"` sur l'astérisque décorative

### Étape 2 : Validation et gestion des erreurs

Dans `script.js`, créez la logique de validation :

1. **Au submit du formulaire**, vérifiez que le nom et le prénom sont remplis
2. Pour chaque champ en erreur :
   - Ajoutez `aria-invalid="true"` sur l'input
   - Ajoutez un message d'erreur avec `aria-describedby` :
     ```html
     <p class="error-message" id="nom-error">Le nom est obligatoire</p>
     ```
   - Reliez avec `aria-describedby="nom-error"` sur l'input
3. En haut du formulaire, affichez un **résumé des erreurs** :
   ```html
   <div class="error-summary" role="alert">
     <h3>Il y a des erreurs dans le formulaire</h3>
     <ul>
       <li><a href="#nom">Le nom est obligatoire</a></li>
     </ul>
   </div>
   ```
4. Mettez le **focus sur le premier champ en erreur**

### Étape 3 : Style des erreurs

Dans `style.css`, ajoutez :

```css
input[aria-invalid="true"] {
    border-color: var(--color-error);
    border-width: 2px;
}
```

**Test :**
- Soumettez le formulaire vide et vérifiez que les erreurs apparaissent
- Vérifiez avec le lecteur d'écran que les erreurs sont annoncées
- Corrigez un champ et vérifiez que l'erreur disparaît

## PW 06 - Les Attributs ARIA (Radio custom)

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* [https://www.w3.org/TR/wai-aria/](https://www.w3.org/TR/wai-aria/)
* [WAI ARIA Practices - Radio](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
:::

Dans cette partie pratique, nous allons implémenter un composant `radio` personnalisé qui remplacera les radios natifs du formulaire
(dans un but pédagogique uniquement).

**Rappel important :** En production, utilisez toujours `<input type="radio">` natif !

**Fichiers concernés :** `creation.html`, `style.css`, `script.js`

### Étape 1 : Structure HTML

Dans `creation.html`, remplacez le fieldset "Sexe" par :

```html
<fieldset>
  <legend id="sexe-label">Sexe</legend>
  <div role="radiogroup" aria-labelledby="sexe-label">
    <div role="radio" aria-checked="false" tabindex="0" data-value="M">
      Masculin
    </div>
    <div role="radio" aria-checked="false" tabindex="-1" data-value="F">
      Féminin
    </div>
  </div>
</fieldset>
```

Notez :
- `role="radiogroup"` sur le conteneur
- `aria-labelledby` pointant vers la legend
- `role="radio"` et `aria-checked` sur chaque option
- `tabindex="0"` uniquement sur le premier (ou le sélectionné), `-1` sur les autres

### Étape 2 : Navigation au clavier

Dans `script.js`, implémentez le pattern **roving tabindex** :

1. **Tab** : entre dans le groupe, focus sur l'élément avec `tabindex="0"`
2. **Flèches haut/bas** ou **gauche/droite** : passe au radio précédent/suivant
3. **Espace** : sélectionne le radio focusé
4. Quand on sélectionne un radio :
   - Mettre `aria-checked="true"` dessus, `aria-checked="false"` sur les autres
   - Mettre `tabindex="0"` dessus, `tabindex="-1"` sur les autres
   - Mettre le focus sur le radio sélectionné

### Étape 3 : Style visuel

Les styles pour `[role="radio"]` et `[role="radio"][aria-checked="true"]` sont déjà fournis dans `style.css`.
Vérifiez qu'ils sont suffisamment distincts visuellement.

**Test :**
- Vérifiez la navigation au clavier (Tab entre dans le groupe, flèches changent la sélection)
- Vérifiez avec le lecteur d'écran que le rôle "radio" et l'état "coché/non coché" sont annoncés

## PW 07 - Les composants complexes (Modale)

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

- [WAI ARIA Practices - Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [MDN - The Dialog element](https://developer.mozilla.org/fr/docs/Web/HTML/Element/dialog)
- [A11ycasts - Dialog](https://www.youtube.com/watch?v=JS68faEUduk)
:::

Nous allons ajouter une modale qui s'ouvre au clic sur une ligne du tableau pour afficher le détail d'une personne.

**Fichiers concernés :** `index.html`, `style.css`, `script.js`

### Étape 1 : Structure de la modale

Dans `index.html`, ajoutez avant la fermeture de `</body>` :

```html
<div class="modal-overlay" id="modal-overlay"></div>

<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" id="modal">
  <button class="close-btn" type="button" aria-label="Fermer">✕</button>
  <h2 id="modal-title">Détails</h2>
  <dl id="modal-content">
    <!-- Contenu généré en JS -->
  </dl>
  <button type="button" id="modal-close">Fermer</button>
</div>
```

Notez l'utilisation de :
- `role="dialog"` et `aria-modal="true"`
- `aria-labelledby` pointant vers le titre
- `aria-label="Fermer"` sur le bouton de fermeture (icône seule)
- `<dl>` pour les paires clé/valeur des détails

### Étape 2 : Ouverture de la modale

Dans `script.js` :

1. Modifiez la colonne "Actions" du tableau pour ajouter un bouton :
   ```javascript
   `<td><button type="button" class="btn-details" data-id="${personne.id}">Voir détails</button></td>`
   ```

2. Écoutez le clic sur ces boutons et ouvrez la modale :
   ```javascript
   function openModal(personne, triggerElement) {
     // Sauvegarder l'élément déclencheur pour y remettre le focus
     // Remplir le contenu de la modale
     // Afficher la modale et l'overlay
     // Mettre le focus sur le bouton "Fermer" (ou le premier élément focusable)
   }
   ```

### Étape 3 : Piège à focus

Implémentez le piège à focus (focus trap) :

1. Listez tous les éléments focusables dans la modale
2. Sur `Tab` au dernier élément : reboucler sur le premier
3. Sur `Shift+Tab` au premier élément : reboucler sur le dernier

```javascript
function trapFocus(modal, event) {
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.key === "Tab") {
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
```

### Étape 4 : Fermeture de la modale

1. **Échap** : ferme la modale
2. **Clic sur l'overlay** : ferme la modale
3. **Clic sur le bouton Fermer** : ferme la modale
4. À la fermeture :
   - Masquer la modale et l'overlay
   - Remettre le focus sur l'élément déclencheur

### Étape 5 : Masquer le contenu derrière

Ajoutez `aria-hidden="true"` et `inert` sur le contenu derrière la modale quand elle est ouverte :

```javascript
document.querySelector("header").setAttribute("inert", "");
document.querySelector("main").setAttribute("inert", "");
// et les retirer à la fermeture
```

**Test :**
- Ouvrez la modale, vérifiez que le focus est piégé dedans
- Appuyez sur Échap, vérifiez que le focus revient sur le bouton d'origine
- Testez avec le lecteur d'écran que le contenu derrière n'est plus accessible

## PW 08 - Audit automatisé

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* [Lighthouse](https://developers.google.com/web/tools/lighthouse/)
* [Playwright](https://playwright.dev/docs/accessibility-testing)
:::

Nous allons auditer notre application avec des outils automatisés.

### Partie 1 : Lighthouse (sans installation)

1. Ouvrez votre application dans Chrome
2. Ouvrez les DevTools (F12)
3. Allez dans l'onglet **Lighthouse**
4. Sélectionnez uniquement **Accessibility** dans les catégories
5. Lancez l'audit

**À faire :**
- Notez le score obtenu
- Identifiez les problèmes critiques
- Corrigez les problèmes détectés
- Relancez l'audit et visez un score > 95

### Partie 2 : axe DevTools (extension navigateur)

1. Installez l'extension [axe DevTools](https://www.deque.com/axe/devtools/)
2. Ouvrez les DevTools → onglet **axe DevTools**
3. Lancez un scan complet
4. Comparez les résultats avec ceux de Lighthouse

### Partie 3 : Playwright + Axe-core (optionnel)

Si vous souhaitez automatiser les tests d'accessibilité :

**Installation :**

```bash
npm init playwright@latest
npm install -D @axe-core/playwright
```

**Créez un fichier `tests/accessibility.spec.js` :**

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

**Exécution :**

```bash
npx playwright test
```

**Bonus :**
- Ajoutez des tests pour la modale ouverte et le formulaire en erreur
- Filtrez par tags WCAG : `.withTags(['wcag2a', 'wcag2aa'])`

## PW 09 - Microdata (bonus)

:::note
Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* [Outils de test des données structurées](https://search.google.com/structured-data/testing-tool/u/0/?hl=fr)
:::

Nous allons ajouter des microdonnées (microdata) sur notre code HTML existant pour enrichir la sémantique.

**Fichiers concernés :** `index.html`

### Objectifs

Dans le tableau listant toutes les personnes, ajoutez les microdonnées Schema.org :

1. **Sur chaque ligne `<tr>`** :
   ```html
   <tr itemscope itemtype="https://schema.org/Person">
     <td itemprop="familyName">Dupont</td>
     <td itemprop="givenName">Jean</td>
     <td><time itemprop="birthDate" datetime="1980-05-15">1980-05-15</time></td>
     <td><button type="button" class="btn-details" data-id="1">Voir détails</button></td>
   </tr>
   ```

2. Mettez à jour la fonction `renderTableau()` dans `script.js` pour générer ces attributs

3. **Test des microdonnées :**
   - [Google Rich Results Test](https://search.google.com/test/rich-results)
   - [Schema.org Validator](https://validator.schema.org/)

**Bonus :**
- Ajoutez des microdonnées sur le formulaire de création
- Utilisez `itemscope` imbriqué pour les relations parent-enfant
