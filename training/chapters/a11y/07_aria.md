---
layout: cover
---

# Norme Aria

---

# Norme ARIA

* **WAI-ARIA** : Web Accessibility Initiative – Accessible Rich Interactive Applications
* Permet d'ajouter de la sémantique aux contenus HTML
* Trois catégories principales :
    * **Roles** : définissent le type d'élément
    * **States** (états) : propriétés qui changent (ex: `aria-checked`)
    * **Properties** (propriétés) : caractéristiques statiques (ex: `aria-label`)

---

# Règle n°1 d'ARIA : Préférer HTML natif

* **⚠️ Important** : À utiliser uniquement si HTML ne propose pas d'élément natif équivalent
* **HTML natif** offre gratuitement :
    * Sémantique native
    * Navigation au clavier
    * Focus management
    * Comportement attendu
* **ARIA** nécessite de tout coder manuellement :
    * Apparence visuelle (CSS)
    * Comportement (JavaScript)
    * Focusabilité (`tabindex`)
    * Navigation clavier (événements)

---

# Norme ARIA - Cas d'usage

* Utiliser ARIA seulement si nécessaire pour :
    * Ajouter de la sémantique au code HTML non sémantique
    * Gérer la compatibilité avec d'anciens navigateurs
    * Créer des composants personnalisés accessibles (widgets)
* **Ne jamais utiliser ARIA** pour contourner des problèmes de CSS/style
* Les attributs ARIA n'ont d'impact **que** sur l'Accessibility Tree

---

# Norme ARIA - Ressources

* **ARIA Authoring Practices Guide (APG)** : https://www.w3.org/WAI/ARIA/apg/
* Guide officiel du W3C avec patterns et exemples
* **Indispensable** pour implémenter correctement des composants ARIA

---

# Exemple d'une checkbox custom

```html
<div tabindex="0" role="checkbox" aria-checked="true">
    suivre la formation accessibilité
</div>
```

---

# Rôles

* Un rôle s'ajoute en spécifiant l'attribut `role` à un élément HTML.

```html
<tr role="...">
    ...
</tr>
```

---

# Rôles ARIA

* Les rôles sont découpés en six catégories :
    * **Abstract Role** : ne jamais utiliser (usage interne)
    * **Document Structure Role** : structure du document (toolbar, tooltip, etc.)
    * **Landmark Role** : régions principales (navigation, main, etc.)
    * **Live Region Role** : contenus dynamiques (alert, status, etc.)
    * **Widget Role** : composants interactifs (button, slider, tabs, etc.)
    * **Window Role** : fenêtres (dialog, alertdialog)

---

# Liste des rôles

* alert
* banner
* checkbox
* complementary
* contentinfo
* combobox
* link
* search

---

# Liste des rôles

* switch
* radio
* radiogroup
* tab
* tablist
* tabpanel

---

# Liste des rôles

* toolbar
* tree
* treeitem

---

# Landmark Role

* La plupart des landmark roles ont un équivalent en HTML5
* À utiliser **uniquement** pour gérer la compatibilité avec d'anciens navigateurs
* **Aujourd'hui** : les balises HTML5 suffisent dans la plupart des cas

```html
<nav role="navigation">
  <ul>
    <li><a href="#a">Dexter</a></li>
    <li><a href="#b">Doctor Who</a></li>
    <li><a href="#c">Futurama</a></li>
  </ul>
</nav>
```

---

# Landmark Role

```html
<form role="search">
  <label for="search-input">Search this site</label>
  <input type="text" id="search-input" name="search">
  <input type="submit" name="submit-btn" value="Search" />
</form>
```

--- 

# Landmark Role

```html
<footer role="contentinfo">
  <p>&copy; 2020 Small Business Ltd. All rights reserved.</p>
</footer>
```

---

# States (États)

* Un **state** s'ajoute via un attribut `aria-*` sur un élément HTML
* Un state **doit être mis à jour dynamiquement** en JavaScript selon les interactions utilisateur
* Exemple : `aria-checked` doit changer entre `true`/`false` au clic

```html
<span aria-busy="true">
    ...
</span>
```

---

# States - Les plus courants

* Liste des states les plus utilisés :
    * `aria-busy` : élément en cours de chargement
    * `aria-checked` : état coché/non coché (checkbox, radio)
    * `aria-current` : élément actuel (page, step, date, etc.)
    * `aria-disabled` : élément désactivé
    * `aria-expanded` : élément déplié/replié
    * `aria-hidden` : masquer un élément aux lecteurs d'écran
    * `aria-invalid` : valeur invalide dans un formulaire
    * `aria-pressed` : bouton toggle activé/désactivé
    * `aria-selected` : élément sélectionné (tab, option)

---

# State

```html
<form>
    <label>
        Name
        <input aria-invalid="true"/>
    </label>
    <button type="submit">
        <em class="fa fa-home" aria-hidden="true" />
        Valider
    </button>
</form>
```

---

# Properties (Propriétés)

* La norme ARIA propose également des **propriétés** généralement statiques
* Différence avec les states : rarement modifiées après l'initialisation
    * `aria-controls` : identifie l'élément contrôlé
    * `aria-describedby` : référence une description
    * `aria-label` : label textuel invisible
    * `aria-labelledby` : référence un élément servant de label
    * `aria-live` : région mise à jour dynamiquement
    * `aria-required` : champ obligatoire
    * `aria-haspopup` : indique un menu/dialog qui peut s'ouvrir

---

# Créer un bouton avec un role plus spécifique

```html
<button role="switch" aria-checked="true">
    Enable
</button>
```

---

# Intégration - Web Components

* **Bonne pratique** : inclure l'accessibilité directement dans vos composants
* Pour les Web Components : ajouter les attributs ARIA dans le `connectedCallback`
* Ainsi, l'accessibilité est native et ne peut pas être oubliée

```javascript
class SwitchButton extends HTMLElement {
  connectedCallback(){
    this.setAttribute('role', 'switch');
    this.setAttribute('aria-checked', 'false');
    this.setAttribute('tabindex', '0');
  }
}

window.customElements.define('button-switch', SwitchButton)
```

* **Nouvelle API** : L'API Reflection ARIA permet d'utiliser les propriétés JavaScript natives

```javascript
class SwitchButton extends HTMLElement {
  connectedCallback(){
    this.role = 'switch';
    this.ariaChecked = false;
    this.tabIndex = 0;
  }
}

window.customElements.define('button-switch', SwitchButton)
```

---

# Intégration - Frameworks

* Exemple avec Angular CDK (Component Dev Kit)
* Les directives `cdkFocusRegion*` gèrent automatiquement le focus

```html
<a mat-list-item routerLink cdkFocusRegionStart>
    Focus region start
</a>
<a mat-list-item routerLink>Link</a>
<a mat-list-item routerLink cdkFocusInitial>
    Initially focused
</a>
<a mat-list-item routerLink cdkFocusRegionEnd>
    Focus region end
</a>
```

---

# Checkbox Custom - Exemple complet

* **⚠️ Rappel** : Préférez toujours `<input type="checkbox">` natif
* Cet exemple montre ce qu'il faut implémenter si vous devez créer une checkbox custom

```html
<p id="question">Question</p>
<ul aria-labelledby="question" role="group">
  <li role="checkbox" aria-checked="false" tabindex="0">
    <img aria-hidden="true" src="checkbox.svg" alt="Non sélectionné : " />
    Choix 1
  </li>
  <li role="checkbox" aria-checked="true" tabindex="0">
    <img aria-hidden="true" src="checkbox-checked.svg" alt="Sélectionné : " />
    Choix 2
  </li>
  <li role="checkbox" aria-checked="false" tabindex="0">
    <img aria-hidden="true" src="checkbox.svg" alt="Non sélectionné : " />
    Choix 3
  </li>
</ul>
```

---

# Radio Custom - Exemple complet

* **⚠️ Rappel** : Préférez toujours `<input type="radio">` natif
* Notez la différence de `tabindex` : seul l'élément sélectionné a `tabindex="0"`

```html
<p id="question">Question</p>
<ul aria-labelledby="question" role="radiogroup">
  <li role="radio" aria-checked="false" tabindex="-1">
    <img aria-hidden="true" src="radio.svg" alt="Non sélectionné : " />
    Choix 1
  </li>
  <li role="radio" aria-checked="true" tabindex="0">
    <img aria-hidden="true" src="radio-checked.svg" alt="Sélectionné : " />
    Choix 2
  </li>
  <li role="radio" aria-checked="false" tabindex="-1">
    <img aria-hidden="true" src="radio.svg" alt="Non sélectionné : " />
    Choix 3
  </li>
</ul>
```

---

# Collapsible Panel (Panneau dépliant)

* Pour implémenter un panneau dépliant accessible :
    * `aria-controls` : relie le bouton au panneau qu'il contrôle
    * `aria-expanded` : indique l'état ouvert (`true`) ou fermé (`false`)
* Ces attributs **doivent être mis à jour dynamiquement** en JavaScript
* Alternative moderne : utilisez `<details>` et `<summary>` HTML natifs !

```html
<button aria-controls="list" aria-expanded="true">Open</button>
<ul id="list" hidden>
    ...
</ul>
```

---

# Alternative textuelle

* Quatre solutions pour définir des alternatives textuelles (par ordre de priorité) :
    1. **Contenu textuel** de l'élément (préféré)
    2. **`aria-labelledby`** : référence un élément existant (ID)
    3. **`aria-label`** : texte directement dans l'attribut (non internationalisable)
    4. **Texte caché** avec `.sr-only` (internationalisable)

* **Règle** : `aria-labelledby` > `aria-label` > label visible > contenu

---

# Description complémentaire

* `aria-describedby` : fournit une description **en plus** du label
* Différence avec `aria-labelledby` :
    * `aria-labelledby` : **nomme** l'élément (essentiel)
    * `aria-describedby` : **décrit** l'élément (complémentaire)
* Exemple : label="Email", description="Format: nom@domaine.com"

---

# aria-label / aria-labelledby

```html
<button id="search" aria-label="Search"><img src="..." alt="" /></button>

<h2 id="searchLabel">Search</h2>

<label for="search">Enter search term
  <input type="search" id="search">
</label>

<button aria-labelledby="searchLabel"><img src="..." alt="" /></button>
```

---

# CSS - Sélecteurs ARIA

* L'utilisation d'attributs ARIA peut simplifier les feuilles de styles
* **Avantage** : le style suit automatiquement l'état

```css
/* Style pour les champs invalides */
input[aria-invalid='true'] {
    border-color: red;
}

/* Style pour les boutons toggle actifs */
button[aria-pressed='true'] {
    background-color: #007bff;
}

/* Style pour les éléments étendus */
[aria-expanded='true'] .icon {
    transform: rotate(180deg);
}
```

---

# ARIA - Récapitulatif

* ✅ **Règle n°1** : Ne pas utiliser ARIA si HTML natif existe
* ✅ **Règle n°2** : Ne jamais changer la sémantique native
* ✅ **Règle n°3** : Les éléments avec role interactif doivent être focusables
* ✅ **Règle n°4** : Les éléments focusables doivent être accessibles au clavier
* ✅ **Règle n°5** : Ne pas utiliser `role="presentation"` ou `aria-hidden` sur des éléments focusables

* **Documentation** : https://www.w3.org/WAI/ARIA/apg/

---
layout: cover
---

# Mise en Pratique

---
layout: cover
---

# PW
