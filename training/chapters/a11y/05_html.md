---
layout: cover
---

# HTML

---
layout: statement
---

De manière générale, utilisez toujours la balise HTML qui est dédiée à l'interaction que vous souhaitez implémenter.

---

# HTML

* Pour développer un site web accessible :
    * écrivez tout d'abord le code HTML sémantique
    * ajoutez le style ensuite avec du CSS
    * enfin dynamisez avec du JavaScript
* Cette approche garantit que les fondations de votre page sont solides
* **Progressive Enhancement** : le contenu reste accessible même sans CSS/JS 

---


# HTML - Les bases

* Nous devons définir un **DOCTYPE** valide pour chaque page
* Ainsi qu'un **encoding** (UTF-8 recommandé)

```html
<!doctype html>
<html>
    <head>
      <meta charset="utf-8">
    </head>
    <body>
      ...
      <!-- Le contenu -->
      ...
    </body>
</html>
```

---

# Langue

* Nous devons définir la langue du document dans la balise `html`
* **Critère WCAG 3.1.1** (niveau A) : La langue de la page doit être définie
* Ceci aura un impact sur :
    * l'accent et la prononciation utilisés par les lecteurs d'écran
    * la traduction automatique du navigateur
    * l'auto-correction et la vérification orthographique
    * la césure des mots (hyphenation)

```html
<html lang="en">
...
</html>
```

---

# Langue - Césure

* L'attribut `lang` est également utilisé pour la césure automatique avec la propriété CSS `hyphens`

```css
p {
    hyphens: auto;
}
```

---


# Langue - Changement de langue

* Si une partie du site utilise une autre langue, vous pouvez utiliser l'attribut `lang` sur n'importe quel élément HTML
* **Critère WCAG 3.1.2** (niveau AA) : Les changements de langue doivent être indiqués

```html
<div lang="en">
...
</div>
```

---


# Identifiants

* L'attribut `id` d'un élément **doit être unique** dans toute la page
* Quand vous développez des composants avec un framework, évitez de mettre des identifiants statiques dans vos composants, car vous ne savez pas combien de fois votre composant va être instancié dans la page
* Solution : générez des IDs uniques dynamiquement
* **⚠️ À ne pas faire :**

```html
<input id="name" name="lastName"/>
<input id="name" name="firstName"/>
```

---


# Landmarks

![Lens](/images/a11y/landmarks.png)

---


# Landmarks

* Depuis HTML5, de nouvelles balises sont disponibles afin de structurer une page
* Ces balises définissent les **régions** de votre page
* Permettent aux utilisateurs de lecteurs d'écran de naviguer rapidement
    * `header` : en-tête de la page ou d'une section
    * `search` : zone de recherche (tout nouveau, HTML 2023)
    * `nav` : navigation principale ou secondaire
    * `main` : contenu principal (unique par page)
    * `aside` : contenu complémentaire ou barre latérale
    * `footer` : pied de page

---


# Landmarks

```html
<header>
    <h1> Titre de l'application</h1>
    <nav> <ul> ... </ul> </nav>

    <search>
        <label>
           Search For 
           <input type="search">
        </label>
        <button>Go</button>
    </search>
</header>
<aside> ... </aside>
<main> ... </main>
<footer> ... </footer>
```

---

# Landmarks - Compatibilité

* Pour des raisons de compatibilité avec d'anciens navigateurs, vous pourriez avoir besoin d'ajouter des attributs `role`
* **Note** : Dans la plupart des cas modernes, les balises HTML5 suffisent

```html
<header role="banner">
    <h1> Titre de l'application</h1>
    <nav role="navigation"> ... </nav>
</header>
<aside role="complementary"> ... </aside>
<main role="main"> ... </main>
<footer role="contentinfo"> ... </footer>
```

---

# Landmarks - Avantages

* Ces landmarks permettent de définir un squelette à votre application
* Ces éléments permettent de définir une structure claire pour votre page
* Le contenu est plus facilement accessible via des raccourcis clavier pour les utilisateurs de lecteurs d'écran
* Améliore la navigation et la compréhension de la structure du site
* **Critère WCAG 1.3.1** (niveau A) : Information et relations

---

# Titre de la page

* Le titre de la page doit être défini via l'élément `<title>` dans le `<head>`
* Le titre principal du contenu doit utiliser `<h1>`
* Chaque page doit avoir un titre unique et descriptif
* **Critère WCAG 2.4.2** (niveau A) : Page Titled
* Bonnes pratiques :
    * `[SITE NAME]` pour les page d'accueil
    * `[PAGE NAME] - [SITE NAME]` pour les autres pages

---

# Hiérarchie des titres

* **La navigation par titres** est le moyen le plus utilisé par les utilisateurs de lecteurs d'écran
* Les titres doivent suivre une hiérarchie logique et séquentielle
    * Comme lors de l'écriture d'un document Word ou d'un livre
    * Toujours dans un ordre croissant : `h1` → `h2` → `h3` → ... → `h6`
    * **❌ Ne pas sauter de niveau** (h1 → h3 est interdit)
    * **✅ Un seul h1 par page** (le titre principal)
* **Critère WCAG 1.3.1** (niveau A) et **2.4.6** (niveau AA)

```javascript
const headings = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
for(let i=0; i < headings.length; i++){
   console.dir(headings[i])
}
```

---


# Titres cachés visuellement

* Si vous ne souhaitez pas afficher un titre dans votre design mais qu'il est nécessaire pour la structure
    * ajoutez tout de même la balise HTML
    * cachez-le visuellement en CSS (classe `.sr-only` ou `.visually-hidden`)
    * **Ne pas utiliser** `display: none` ou `visibility: hidden` (masque pour les lecteurs d'écran aussi)

---

# Implémentation .sr-only complète

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Pour les éléments focusables (skip links) */
.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

**Pourquoi chaque propriété** :
- `position: absolute; width/height: 1px` - Retirer du flux layout
- `margin: -1px` - Empêcher l'espace inutile
- `overflow: hidden` - Assurer aucun overflow visuel
- `clip: rect(0,0,0,0)` - Masquage visuel additionnel
- `white-space: nowrap` - Éviter les problèmes de wrapping

---

# Balises sémantiques

* `<article>` : contenu autonome qui pourrait être distribué indépendamment (article de blog, commentaire, widget)
* `<section>` : regroupement thématique de contenu homogène, généralement avec un titre
    * Exemples : "Top 5 articles", "À propos de nous", "Commentaires"
* **Règle** : Chaque `<section>` devrait avoir un titre (`h2`, `h3`, etc.)

---


# NAV

* Élément permettant de définir une zone de navigation
* Nous pouvons avoir plusieurs éléments `<nav>` par page (navigation principale, secondaire, fil d'Ariane)
* **Nécessité** : définir un label distinct pour différencier les navigations multiples
* Utilisez `aria-label` ou `aria-labelledby`

```html
<nav aria-label="main menu">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/contact">Contact</a></li>
    </ul>
</nav>
```

---

# Navigation - Page active

* Nous devons indiquer clairement quel item du menu correspond à la page actuelle
* **Deux approches possibles** :
    * Garder le lien et ajouter `aria-current="page"`
    * **Ou** remplacer le lien par un `<span>` avec `aria-current="page"`
* L'attribut `aria-current` annonce à l'utilisateur qu'il est sur cette page

---


# Navigation

```html
<nav aria-label="main">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/contact" aria-current="page">Contact</a></li>
    </ul>
</nav>
```

---

# Navigation imbriquée

* Si nous avons deux niveaux de menu

```html
<nav aria-label="main">
    <ul>
        <li><a href="/">Home</a></li>
        <li>
            <button aria-current="true">Messagerie</button>
            <ul>
                <li><a href="/contact" aria-current="page">Contacts</a></li>
                <li><a href="/sendbox">Sendbox</a></li>
            </ul>
        </li>
    </ul>
</nav>
```

---

# Aria-current

* L'attribut `aria-current` peut prendre différentes valeurs selon le contexte :
    * `aria-current="page"` : page actuelle dans une navigation
    * `aria-current="step"` : étape en cours dans un wizard/processus
    * `aria-current="date"` : date courante dans un datepicker
    * `aria-current="time"` : heure courante dans un timepicker
    * `aria-current="location"` : localisation actuelle dans un plan
    * `aria-current="true"` : élément actuel (usage générique)

---

# L'élément Button

```html
<div onclick="" class="btn clickable"></div>
<a class="btn" onclick=""></a>


<div onclick=""
    class="btn"
    tabindex="0"
    role="button"></div>
```

---
layout: statement
---

<blockquote>
La balise button n'est pas stylisable
<p>Un développeur (qui se trompe)</p>
</blockquote>

---

# Button - Pourquoi utiliser `<button>` ?

* Si vous utilisez `<div>` ou `<span>` comme bouton, vous devez :
    * Ajouter `role="button"`
    * Ajouter `tabindex="0"` pour le rendre focusable
    * Écrire du JavaScript pour gérer le clic via **Entrée** et **Espace**
    * Gérer l'état `disabled` manuellement avec `aria-disabled`
* Avec `<button>` natif : **tout est géré automatiquement** ! 🎉

---


# Lien - Antipatterns

* **❌ À éviter absolument :**

```html
<span onclick="goTo(...)"> ... </span>
<a onclick="goTo(...)"> ... </a>
<a href="#" onclick="goTo(...)"> ... </a>
<a href="page"><img src="..." /></a>
```

---


# Lien - Problèmes des antipatterns

* **Conséquences** :
    * Ne s'affichera pas dans la liste des liens du rotor des lecteurs d'écran
    * Ne fonctionnera pas au clavier (Tab + Entrée)
    * Ne pourra pas être mis en favori (bookmarkable)
    * Clic droit → "Ouvrir dans un nouvel onglet" ne fonctionnera pas
    * Pas d'aperçu de l'URL au survol
    * Impact négatif sur le SEO

---

# Learn More antipattern

```html
<p> Lorem Ipsum <a href="...">Learn more</a></p>

<p>
    Lorem Ipsum
    <a href="..." aria-label="Learn more about Lorem Ipsum">Learn more</a>
</p>
```
---

# Button vs Lien - Quand utiliser quoi ?

* **Lien (`<a href>`)** :
    * ✅ Navigation vers une autre page ou une autre section
    * ✅ Téléchargement d'un fichier
    * ✅ Ancre vers une section (#section)

* **Bouton (`<button>`)** :
    * ✅ Exécute une action (soumettre un formulaire, ouvrir une modale)
    * ✅ Modifie l'état de l'application
    * ✅ Déclenche une interaction JavaScript

---

# Styliser un bouton

* Sur mobile, s'assurer que la zone cliquable est assez grande (**minimum 44×44px**)
* **Mythe** : "Les `<div>` sont plus faciles à styliser"
* **Réalité** : Réinitialiser les styles d'un `<button>` est simple :

```css
button {
  background-color: rgba(255,255,255,0);
  padding: 0;
  border: none;
  border-radius: 0;
}
```

---

# Button - Type

* ⚠️ **Important** : Le type par défaut d'un `<button>` est `submit`
* Cela peut causer des soumissions de formulaire involontaires
* **Bonne pratique** : toujours définir explicitement le type

```html
<button type="submit">...</button>
<button type="button">...</button>
<button type="reset">...</button>
```
---

# Images

* **Critère WCAG 1.1.1** (niveau A) : Toute image doit avoir une alternative textuelle
* L'attribut `alt` est **obligatoire** sur toutes les balises `<img>`

```html
<!-- Image informative : alt descriptif -->
<img src="logo.png" alt="Logo de l'entreprise Acme" />

<!-- Image décorative : alt vide (pas d'absence d'attribut) -->
<img src="decoration.png" alt="" />
```

* **Note** : `alt=""` signale aux lecteurs d'écran d'ignorer l'image

---


# Images - Contexte

* Essayez d'être le plus explicite possible en ajoutant du contexte
* L'alternative doit transmettre la même information que l'image


```html
<img src="" alt="Ceci est le logo de la société" />
<img src="" alt="Logo" />
```


---


# Images - Icônes et Emoji

* Ce travail doit être réalisé également pour les icônes et les emoji
* Les icônes de fonts (Font Awesome, Bootstrap Icons) doivent avoir un label


```html
<em role="img" aria-label="calendrier">📅</em>
<button aria-label="Ajouter"><i aria-hidden="true" class="bi bi-bag-plus"></i></button>
```

---


# Listes

* Deux types principaux de listes :
    * `<ul>` : liste non-ordonnée (unordered list)
    * `<ol>` : liste ordonnée (ordered list)
* Dès que vous devez afficher une liste d'éléments, utilisez l'un de ces éléments
* ⚠️ **Attention** : La sémantique d'une liste peut être perdue sur Safari/VoiceOver si vous ajoutez `list-style: none`
    * Solution : ajouter `role="list"` sur `<ul>`/`<ol>` et `role="listitem"` sur les `<li>`


---


# Listes

* Liste  non-ordonnée

```html
<ul>
    <li>item</li>
    <li>item</li>
    <li>item</li>
</ul>
```

* Liste ordonnée

```html
<ol>
    <li>item 1</li>
    <li>item 2</li>
    <li>item 3</li>
</ol>
```


---


# DL / DD / DT

* **Description List** : élément permettant de définir une liste de paires clé-valeur
    * `<dl>` : Description List (conteneur)
    * `<dt>` : Description Term (terme/clé)
    * `<dd>` : Description Details (définition/valeur)
* Cas d'usage :
    * Glossaires
    * Métadonnées
    * Paires question-réponse (FAQ)

---

# DL / DD / DT

* Glossaire

```html
<dl>
  <dt>RSS</dt>
  <dd>An XML format for aggregating information from websites whose
    content is frequently updated.</dd>

  <dt>Weblog</dt>
  <dd>Contraction of the term "web log", a weblog is a
    website that is periodically updated, like a journal</dd>
</dl>
```

---

# DL / DD / DT

* Metadata

```html
<dl>
  <dt>Authors:</dt>
  <dd>Remy Sharp</dd>
  <dd>Rich Clark</dd>
  <dt>Editor:</dt>
  <dd>Brandan Lennox</dd>
  <dt>Category:</dt>
  <dd>Comment</dd>
</dl>
```

---

# Table

```html
<table>
    <caption>Average daily tea and coffee consumption</caption>
    <thead>
        <tr>
            <th>Person</th>
            <th>Coffee</th>
            <th>Tea</th>
        </tr>
    </thead>
    <tbody>
         <tr>
            <td>Njoki</td>
            <td>5 cups</td>
            <td>0 cups</td>
        </tr>
    </tbody>
    <tfoot>
        ...
    </tfoot>
</table>
```

---

# Table - Tri

* Si vous souhaitez un système de tri (ordonnancement)
* Utilisez `aria-sort` pour indiquer l'ordre de tri actuel


```html
<thead>
    <tr>
        <th aria-sort="descending">
            Person
            <button type="button" aria-label="Tri ascendant"> ^ </button>
        </th>
        ...
    </tr>
</thead>
```

---

# Table - Accessibilité

* **Bonnes pratiques** pour les tableaux accessibles :
    * Toujours utiliser `<caption>` pour décrire le tableau
    * Utiliser `<thead>`, `<tbody>`, `<tfoot>` pour structurer
    * Utiliser `<th>` pour les en-têtes (avec `scope="col"` ou `scope="row"`)
    * Pour les tableaux complexes, utiliser `headers` et `id`
* **Ne jamais utiliser** de tableaux pour la mise en page (layout)

---

# Details

* Élément permettant de créer un **Collapsible Panel**


```html
<details>
    <summary>Details</summary>
    Something small enough to escape casual notice.
</details>
```

* Nous pouvons légèrement styliser cet élément

```css
summary::-webkit-details-marker {
    display: none;
    /* and display the image you want in HTML */
}
details > summary {
  /* closed styles as necessary */
}

details[open] > summary {
  /* opened styles as necessary */
}
```

* De nouvelles syntaxes CSS vont arriver prochainement pour avoir plus de contrôle sur le style de cet élément
* Notamment avec les pseudo-éléments `::details-content` 

---

# Time

* Balise permettant de définir une date/heure dans un format lisible par les machines
* Améliore l'accessibilité et le SEO
* Nous pouvons définir :
    * une date (format ISO 8601)
    * une heure
    * une durée


```html
<time datetime="2018-07-07">July 7</time>
<time datetime="20:00">20:00</time>
<time datetime="PT2H30M">2h 30m</time>
```

--- 

# Principes généraux

* Préférez les dimensions relatives
* **%** pour **width**
* **em** ou **rem** pour les textes
* **vw** ou **vh** pour les **width** et **height**

---

# Principes généraux - Taille des cibles

* S'assurer que les éléments interactifs sur mobile ont une taille suffisante
* **WCAG 2.5.5** (niveau AAA) : minimum **44×44px** (ou 44dp)
* **WCAG 2.5.8** (niveau AA, WCAG 2.2) : minimum **24×24px**
* Avoir une marge d'au moins **8px** entre deux éléments focusables (idéalement 32px)

---

# Principes généraux - Préférences utilisateur

* Respecter les préférences système de vos utilisateurs :
    * thème sombre ou clair (`prefers-color-scheme`)
    * réduction des animations (`prefers-reduced-motion`)
    * contraste élevé (`prefers-contrast`)
* Les navigateurs modernes exposent ces préférences via des media queries CSS
* Chrome/Edge/Firefox proposent des options pour tester ces préférences

---

# Thème sombre / clair

* Respecter la préférence de thème de l'utilisateur
* Particulièrement utile pour les personnes atteintes de :
    * photophobie (sensibilité à la lumière)
    * migraines déclenchées par la lumière forte
    * fatigue oculaire

```css
:root {
    --font-color: black;
}

/* @media (prefers-color-scheme: light) { */
@media (prefers-color-scheme: dark) {
    :root {
        --font-color: white;
    }
}
```

---

# Désactivation des animations

* **WCAG 2.3.1** (niveau A) : Three Flashes or Below Threshold
* **WCAG 2.3.2** (niveau AAA) : Three Flashes
* **WCAG 2.3.3** (niveau AAA) : Animation from Interactions
* **WCAG 2.2.2** (niveau A) : Pause, Stop, Hide
* Les animations peuvent déclencher des crises d'épilepsie ou des vertiges

---

# Désactivation des animations


```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

```

---

# Désactivation des animations - Approche alternative

* Pour des problématiques de support des navigateurs plus anciens, nous pouvons inverser la logique
* **Mobile-first accessibility** : désactiver par défaut, activer si préférence

```css

 *,
  *::before,
  *::after {
    /* Désactivation des animations */
  }

@media (prefers-reduced-motion: no-preference) {
  *,
  *::before,
  *::after {
    /* Activer les animations */
  }
}

```

---

# MatchMedia API

* Nous pouvons détecter et réagir aux media queries en JavaScript avec l'API `matchMedia`
* Permet d'adapter dynamiquement le comportement de l'application


```javascript
const mql = window.matchMedia("(orientation: portrait)");
/**
 * window.matchMedia("(prefers-reduced-motion: no-preference)");
 * window.matchMedia("(forced-colors: active)");
 * window.matchMedia("(prefers-color-scheme: dark)");
 */

// If there are matches, we're in portrait
if(mql.matches) {
	// Portrait orientation
} else {
	// Landscape orientation
}
```

---

# Orientation


```javascript
mql.addListener(function(m) {
	if(m.matches) {
		// Changed to portrait
	}
	else {
		// Changed to landscape
	}
});
```

---


# Orientation

* **WCAG 1.3.4** (niveau AA) : Ne jamais forcer ou bloquer une orientation
* Ne jamais bloquer l'orientation `landscape` ou `portrait`
* Certains utilisateurs ont leur appareil fixé dans une orientation (support de fauteuil roulant)
* **⚠️ À éviter** : l'utilisation de `Screen Orientation API` pour verrouiller l'orientation


```javascript
screen.orientation.lock('portrait')
screen.orientation.lock('landscape')
screen.orientation.unlock()
```

---

# Orientation - CSS

* Si vous souhaitez adapter le style de votre application en fonction de l'orientation
* Utilisez les media queries CSS (ne forcez jamais l'orientation)


```css
body {
    flex-direction: row;
}

/* @media (orientation: landscape) { */
@media (orientation: portrait) {
  body {
    flex-direction: column;
  }
}
```

---

# Contrast Ratio (Ratio de contraste)

* Le ratio de contraste compare la couleur d'un texte par rapport à la couleur du fond
* **Critères WCAG** :
    * **WCAG 1.4.3** (niveau AA) : minimum **4.5:1** pour le texte normal
    * **WCAG 1.4.3** (niveau AA) : minimum **3:1** pour le texte large (18pt+ ou 14pt+ gras)
    * **WCAG 1.4.6** (niveau AAA) : minimum **7:1** pour le texte normal
* Le calcul se base sur la **luminance relative** d'une couleur
    * 0 = noir absolu
    * 1 = blanc absolu
* Formule : `(L1 + 0.05) / (L2 + 0.05)`
* Résultat entre `1:1` (aucun contraste) et `21:1` (contraste maximum)

---

# Contrast Ratio - Outils

* **Chrome DevTools** : onglet "Color Picker" affiche le ratio automatiquement
* **Extensions navigateur** :
    * WAVE
    * axe DevTools
    * Lighthouse
* **Outils en ligne** :
    * WebAIM Contrast Checker
    * Contrast Ratio de Lea Verou
* **Tip** : Utilisez ces outils dès la phase de design !

---

# Récapitulatif - Checklist HTML

* ✅ Toujours utiliser la balise HTML sémantique appropriée
* ✅ Définir l'attribut `lang` sur `<html>`
* ✅ Utiliser les landmarks (`header`, `nav`, `main`, `aside`, `footer`)
* ✅ Respecter la hiérarchie des titres (h1 → h2 → h3)
* ✅ Fournir un `alt` pour toutes les images
* ✅ Utiliser `<button>` pour les actions, `<a>` pour la navigation
* ✅ Associer tous les champs de formulaire avec des `<label>`
* ✅ Assurer un contraste suffisant (minimum 4.5:1)
* ✅ Respecter les préférences utilisateur (dark mode, animations)
* ✅ Tester la navigation au clavier

---
layout: cover
---

# Mise en Pratique

---
layout: cover
---

# PW