---
layout: cover
---

# Rappels

---

# Sélecteurs

* Voici différentes syntaxes permettant de sélectionner un élément HTML
* Ces sélecteurs peuvent être utilisés :

* en CSS
```css
#id { }
.className { }
button { }
[aria-hidden='true'] { }
img[aria-hidden='true'] { }
```

* et en JavaScript (syntaxe moderne recommandée)
```javascript
// Recommandé : querySelector (plus flexible)
const element = document.querySelector(selector);
const input = document.querySelector('#nameInput');
const button = document.querySelector('button[aria-label="Submit"]');

// Ancienne syntaxe (toujours fonctionnelle)
const elementById = document.getElementById("nameInput");
```
---

# Manipulation d'éléments HTML

- Une fois un élément récupéré, nous pouvons manipuler les attributs :

```javascript
const elt = document.querySelector(selector);

elt.hasAttribute("aria-invalid");
elt.setAttribute("aria-invalid", "true");
elt.removeAttribute("aria-invalid");
```

---

# Sélection d'éléments HTML

- Pour sélectionner plusieurs éléments :

```javascript
// Recommandé : querySelectorAll (sélecteurs CSS)
const buttons = document.querySelectorAll("button");
const errorFields = document.querySelectorAll('[aria-invalid="true"]');

// Ancienne syntaxe (toujours fonctionnelle)
const paragraphs = document.getElementsByTagName("p");
const errors = document.getElementsByClassName("error");
```

- La méthode **querySelectorAll** retourne un objet **NodeList**

```javascript
const buttons = document.querySelectorAll("button");
// Boucle classique
for (let i = 0; i < buttons.length; i++) {
  console.log(buttons[i]);
}
```

- Nous pouvons convertir en **Array** pour utiliser les méthodes modernes

```javascript
// Conversion en Array (2 méthodes)
const buttons = Array.from(document.querySelectorAll("button"));
// ou
const buttons2 = [...document.querySelectorAll("button")];

// Utilisation des méthodes Array avec gestion d'erreurs
if (!buttons.length) {
  console.log("Aucun bouton trouvé");
} else {
  buttons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Bouton cliqué:', button.textContent);
    });
  });
}
```

---

# Event Listener

- Pour écouter un événement d'un élément, nous allons utiliser la méthode **addEventListener**.
- Un événement se propage par défaut d'élément en élément.
- Ce système se nomme le **bubbling**.
- Nous pouvons désactiver le **bubbling** et le fonctionnement par défaut de cet événement.


```javascript
const button = document.querySelector('button');

button.addEventListener('click', e => {
    e.stopPropagation();
    e.preventDefault();
    ...
});
```

---

# Event Listener

- Nous avons par exemple l'événement **DOMContentLoaded** permettant d'exécuter du code une fois que l'ensemble de la page a été chargée.

```javascript
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
});
```

---

# Rappel CSS - Classe .sr-only

**Screen Reader Only** : cacher visuellement mais garder accessible aux lecteurs d'écran

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
  border-width: 0;
}
```

---

# Pourquoi .sr-only ?

**Contexte** : Certaines informations sont évidentes visuellement mais pas pour les lecteurs d'écran

**Cas d'usage courants** :
- **Skip links** : "Aller au contenu principal"
- **Labels cachés** : icônes sans texte visible
- **Instructions** : aide pour naviguer un composant complexe
- **Contexte supplémentaire** : "s'ouvre dans un nouvel onglet"

```html
<!-- Skip link -->
<a href="#main-content" class="sr-only">Aller au contenu principal</a>

<!-- Bouton avec icône -->
<button>
  <span class="sr-only">Fermer</span>
  <svg aria-hidden="true"><!-- icône X --></svg>
</button>

<!-- Lien externe -->
<a href="https://example.com" target="_blank">
  Documentation
  <span class="sr-only">(s'ouvre dans un nouvel onglet)</span>
</a>
```

---

# .sr-only vs autres techniques

**À NE PAS utiliser pour cacher du contenu accessible** :

```css
/* ❌ display: none - Ignoré par les lecteurs d'écran */
.hidden {
  display: none;
}

/* ❌ visibility: hidden - Aussi ignoré */
.invisible {
  visibility: hidden;
}

/* ❌ opacity: 0 - Peut créer de la confusion */
.transparent {
  opacity: 0;
}

/* ✅ .sr-only - Visible uniquement pour lecteurs d'écran */
.sr-only {
  /* ... code ci-dessus ... */
}
```

---

# Et dans les frameworks ?

* Les concepts vus (sélection d'éléments, événements, manipulation d'attributs) s'appliquent aussi dans les frameworks
* React, Vue, Angular, Svelte proposent leurs propres APIs pour gérer le focus et les attributs ARIA
* Nous y reviendrons dans le chapitre dédié aux **Frameworks et Bibliothèques**
* Pour cette formation, les TPs seront en **pur HTML, CSS et JavaScript**
