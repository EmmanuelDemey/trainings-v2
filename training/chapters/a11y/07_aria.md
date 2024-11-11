---
layout: cover
---

# Norme Aria

---

# Norme Aria

* Rappel: Il est recommandé d'utiliser au maximum les éléments HTML
* Si pour une certaine raison, cela n'est pas possible
    * vous pouvez créer vos propres éléments HTML
    * et y ajouter des attributs supplémentaires
* Ces attributs sont définis dans la spécification *WAI-ARIA*

---

# Norme Aria

* **Web Accessibility Initiative – Accessible Rich Interactive Applications**
* Ajout de marqueur de sémantique aux contenus HTML
* Cette norme doit être utilisée si et seulement si HTML ne propose pas un élément natif
* Elle est définie en deux catégories : `Attributes` et `States and Properties`.

---

# Norme Aria

* Les attributs ARIA permettent
    * d'ajouter de la sémantique au code HTML
    * de gérer le support des navigateurs
    * de copier le fonctionnement HTML existant pour des problématiques de style.

---

# Norme Aria

* Les balises n'auront un impact que sur l'Accessibility tree
* Elles n'auront pas d'impact sur :
    * l'apparence des éléments
    * le fonctionnement des éléments
    * le coté focusable
    * le support du clavier

---

# Norme Aria

* D'ou la necessite d'utiliser tout d'abord des éléments HTML natifs.

---

# Norme Aria

* Aria Design Guide(https://www.w3.org/TR/wai-aria-practices-1.1/)

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

# Rôles

* Les rôles sont découpés en six catégories :
    * Abstract Role
    * Document Structure Role (toolbar, ...)
    * Landmark Role
    * Live Region Role
    * Widget Role
    * Window Role

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

* La plupart des rôles peuvent être associés à une balise sémantique HTML
* À utiliser pour gérer la comptabilité navigateur et synthétiseurs vocaux.

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

# State

* Un `state`  s'ajoute en spécifiant l'attribut `aria-*` à un élément HTML.
* Un `state` sera/devra être modifié en JavaScript en fonction des intéractions utilisateurs.

```html
<span aria-busy="true">
    ...
</span>
```

---

# State

* Nous pouvons utiliser les `state` suivant :
    * `aria-busy`
    * `aria-checked`
    * `aria-current`
    * `aria-disabled`
    * `aria-expanded`
    * `aria-hidden`
    * `aria-invalid`
    * `aria-pressed`
    * `aria-selected`

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

# Properties

* La norme *ARIA* propose également des propriétés qui seront rarement modifiées en JavaScript
    * `aria-controls`
    * `aria-label`
    * `aria-labelledby`
    * `aria-live`
    * `aria-required`
    * ...

---

# Créer un bouton avec un role plus spécifique

```html
<button role="switch" aria-checked="true">
    Enable
</button>
```

---

# Intégration

* Nous conseillons d'inclure au maximum l'accessibilité dans vos composants.
* Nous pouvons utiliser cette technique pour des Web Components créés pour votre projet.

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

* Dans un futur *proche*, nous allons pouvoir utiliser la syntaxe IDL pour mettre à jour ces propriétés

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

# Intégration

* Ou encore un exemple dans la librairie `Angular Material`

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

# Checkbox Custom

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

# Radio Custom

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

# Collapsible Panel

* Lorsque vous devez implémenter un `Collapsible Panel`, vous devez ajoutez les attributs `aria-controls` et `aria-expanded`.
* Ces attributs doivent être dynamiser en fonction des interactions de l'utilisateur.

```html
<button aria-controls="list" aria-expanded="true">Open</button>
<ul id="list" hidden>
    ...
</ul>
```

---

# Alternative textuelle

* Quatre solutions pour définir des alternatives textuelles
    * `aria-label` accepte comme valeur le label que nous souhaitons utiliser
    * `aria-labelledby` contiendra l'identifiant d'un autre élément HTML
    * Par une zone visible que par les synthétiseurs vocaux (internationalisable)
    * par le contenu

---

# Alternative textuelle

* Nous pouvons également ajouter l'attribut `aria-describedby` pour donner une description complémentaire.

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

# CSS

* L'utilisation d'attribut aria peut simplifier les feuilles de styles

```css
input[aria-invalid='true']{
    ...
}
```

---
layout: cover
---

# PW
