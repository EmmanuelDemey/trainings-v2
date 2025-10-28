---
layout: cover
---

# Focus

---

# Focus

* Les utilisateurs naviguant avec le clavier vont utiliser
    * la touche **Tab** pour aller à l'élément sélectionnable suivant
    * les touches **Shift + Tab** pour aller à l'élément précédent
    * Attention, sur Safari / macOS : **Option + Tab**
    * les touches **flèche haut/bas** pour naviguer dans un contrôle

---

# Éléments focusables

* Par défaut, les éléments HTML suivants sont **focusables** :
    * les boutons
    * les liens
    * les contrôles de formulaire (`input`, `select`, `textarea`)
    * la balise `summary`
    * les éléments éditables (`contenteditable`)
* Ces éléments doivent être focusables dans le même ordre que celui utilisé pour l'affichage.

---

# Pourquoi le focus est important ?

* **Navigation au clavier** : seul moyen d'interagir pour certains utilisateurs
* **Lecteurs d'écran** : le focus détermine ce qui est annoncé
* **Handicaps moteurs** : impossibilité d'utiliser une souris
* **Efficacité** : raccourcis clavier pour utilisateurs avancés
* **WCAG 2.4.7** (AA) : Le focus doit être visible

---

# Cas d'utilisation

* Seuls les éléments interactifs doivent être focusables
* Car sinon cela va alourdir la navigation au clavier
* **Règle d'or** : Si on peut cliquer dessus, on doit pouvoir y accéder au clavier

---

# Cas d'utilisation - SPA

* Des exceptions possibles pour les **SPA** (Single Page Applications)
    * Permettre de mettre le focus sur le titre de la page chargée (gestion de la navigation)
    * Mettre le focus sur un nouveau contenu pour que l'utilisateur soit notifié de cette information (notifications, messages d'erreur)
    * Gérer le piège à focus (modales, menus déroulants)

---

# Tab Order

* L'ordre des éléments focusables doit être logique et suivre l'ordre visuel
* À ne pas faire

```html
<section>
  <a href="#">1</a>
  <a href="#">2</a>
  <a href="#">3</a>
  <a href="#">4</a>
</section>
```

--- 

# Tab Order

```css
section {
  display: flex;
  flex-direction: row-reverse;
}
```

---

# Tab Order

* Comment gérer les éléments focusables cachés ?
    * les supprimer du **tab order**
    * `display: none` ou `visibility: hidden`
    * avec l'attribut `hidden`

---

# Tab Order - JavaScript

* Comment savoir quel élément a le focus ?

```javascript
// Obtenir l'élément actuellement focusé
const focusedElement = document.activeElement;
console.log(focusedElement);

// Mettre le focus programmatiquement
const element = document.querySelector('#main');
element.focus();

// Écouter les changements de focus
element.addEventListener('focus', () => {
    console.log('Element has focus');
});

element.addEventListener('blur', () => {
    console.log('Element lost focus');
});
```

---

# Tabindex

* L'attribut `tabindex` permet de :
    * rendre un élément focusable (valeur `0`)
    * rendre un élément focusable uniquement programmatiquement (valeur `-1`)
    * modifier l'ordre de tabulation (valeur positive - **antipattern**)
    * retirer un élément du tab order (avec une valeur négative)

```html
<!-- Élément focusable via Tab -->
<div tabindex="0">DIV focusable</div>

<!-- Élément focusable uniquement via JavaScript -->
<div tabindex="-1">DIV focusable programmatiquement</div>

<!-- Élément naturellement focusable -->
<button>Valider</button>
```

---

# Tabindex

* Nous pouvons également définir des `tabindex` avec une valeur supérieure à 0
* Les éléments avec le `tabindex` le plus petit (> 0) seront prioritaires dans le parcours au clavier
* Puis les éléments avec `tabindex="0"` ou naturellement focusables

```html
<div tabindex="0">DIV focusable (ordre 3)</div>
<div tabindex="5">DIV focusable (ordre 2)</div>
<div tabindex="1">DIV focusable (ordre 1)</div>
<button>Valider (ordre 4)</button>
```

* **⚠️ Attention : Antipattern** - Ne jamais utiliser de valeurs positives !
* Cela crée un ordre de navigation imprévisible et confus

---

# Skip Link

* Cette fonctionnalité permet de sauter rapidement des sections répétitives (menu, header)
* Particulièrement utile pour les utilisateurs au clavier et lecteurs d'écran
* Un **Skip Link** est composé de :
    * un lien caché par défaut, placé en tout début de page
    * le lien devient visible quand il reçoit le focus (via Tab)
    * au clic, le focus est déplacé directement au contenu principal
* Permet d'éviter de naviguer à travers tous les liens du menu à chaque page

---

# Skip Link

* Voici quelques exemples
    * https://axesslab.com/[Axesslab]
    * https://github.com/[Github]
    * https://www2.hm.com/fr_fr/index.html[H&M]

---
layout: statement
---

Comment allez-vous implémenter un **skip link** en pur HTML/CSS/JavaScript ?

---

# Skip Link

```html
<a class="skip-link" href="#main">Go to main content</a>

<main id="main" tabindex="-1">
    ...
</main>
```
```css
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
}

.skip-link:focus {
    top: 0;
}
```

---

# CSS - Focus visible

* Il est **obligatoire** de rendre visible le focus sur tous les éléments interactifs
* Utiliser `:focus-visible` plutôt que `:focus` (évite le focus au clic souris)
* Ne **jamais** utiliser `outline: none` sans alternative visuelle

```css
button:focus-visible {
    outline: 3px solid #32a1ce;
    outline-offset: 2px;
}
```

---

# CSS - Focus personnalisé

* Nous pouvons définir un design différent si nécessaire
* Assurez-vous que le contraste est suffisant (ratio 3:1 minimum)

```css
.button:focus-visible {
    outline: 0; /* Seulement si on fournit une alternative */
    box-shadow: 0 0 0 3px #fff, 0 0 0 6px #32a1ce;
}

/* Ou avec un pseudo-élément */
.button:focus-visible::before {
    content: '';
    position: absolute;
    inset: -4px;
    border: 2px solid #32a1ce;
    border-radius: 4px;
}
```

---

# Piège à focus (Focus Trap)

* Certains composants nécessitent de **piéger le focus** :
    * Modales / Dialogues
    * Menus déroulants
    * Panneaux latéraux (sidebars)
* Le focus doit rester à l'intérieur du composant jusqu'à sa fermeture
* Empêche l'utilisateur de naviguer vers du contenu caché

---

# Piège à focus - Exemple

```javascript
const modal = document.querySelector('.modal');
const focusableElements = modal.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
);
const firstElement = focusableElements[0];
const lastElement = focusableElements[focusableElements.length - 1];

modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
});
```

---

# Bonnes pratiques

* ✅ **À faire** :
    * Toujours rendre le focus visible
    * Suivre l'ordre naturel du DOM
    * Utiliser des éléments HTML natifs quand c'est possible
    * Tester la navigation au clavier régulièrement

* ❌ **À éviter** :
    * `outline: none` sans alternative
    * `tabindex` avec valeurs positives
    * Ordre de focus illogique
    * Éléments cliquables non focusables

---

# Outils de test

* **Navigateur** : utiliser uniquement la touche Tab
* **Extension Chrome** : Accessibility Insights
* **Extension Chrome/Firefox** : axe DevTools
* **Test manuel** : débrancher la souris !
* **Raccourci Chrome** : `chrome://accessibility` pour voir l'arbre d'accessibilité

---
layout: cover
---

# PW