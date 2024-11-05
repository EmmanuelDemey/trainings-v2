---
layout: cover
---

# Focus

---

# Focus

* Les utilisateurs naviguant avec le clavier vont utiliser
    * la touche `tab` pour aller à l'élément selectionnable suivant
    * les touches `Shift` `Tab` pour aller à l'élément précédent.
    * Attention, sur Safari / MacOS : `Option` + `Tab`.
    * les touches flèche haut/bas pour naviguer dans un control.

---

# Éléments focusable

* Par défaut, les éléments HTML suivants sont `focusable` :
    * les boutons
    * les liens
    * les controles de formulaire
* Ces éléments doivent être focusable dans le même ordre que celui utilisé pour l'affichage.

---

# Cas d'utilisation

* Seuls les éléments précédent doivent etre focusable
* Une exception possible pour les `SPA`
    * Permettre de mettre le focus sur le titre de la page chargée

---

# Tab Order

* L'ordre des éléments focusable doit être logique
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
    * les supprimer du `tab order`
    * `display:none` ou `visibility:hidden`

---

# Tab Order

* Comment savoir quel élément a le focus ?

```javascript
document.activeElement
```

---

# Tabindex

* La propriété `tabindex` permet
    * d'ordonner les éléments focusable
    * indiquer qu'un élément peut etre être focusable programmatiquement
    * Désactiver la propriété `focusable` d'un élémént.

---

# Tabindex

```html
<div tabindex="0">DIV focusable</div>
<div tabindex="-1">DIV focusable programmatiquement</div>
<button>Valider</button>
```

---

# Tabindex

* Nous pouvons également définir des `tabindex` avec une valeur supérieure à 0
* Les éléments avec le `tabindex` le plus grand seront prioritaire dans le parcours au clavier de la page.

```html
<div tabindex="0">DIV focusable</div>
<div tabindex="5">DIV focusable</div>
<button>Valider</button>
```

* Attention: Antipattern pour faire un site accessible

---

# Skip Link

* Cette fonctionnalité est à utiliser pour passer une partie de la page qui est présente sur l'ensemble de votre site (menu)
* Un `Skip Link` est composé
    * d'un bouton/lien caché par défaut, situé juste avant la zone à ignorer
    * une fois que le bouton/lien a le focus, il devient visible
    * Une fois le click sur le bouton/lien, la prochaine zone clickable devient le contenu situé après la zone ignorée.

---

# Skip Link

* Voici quelques exemples
    * https://axesslab.com/[Axesslab]
    * https://github.com/[Github]
    * https://www2.hm.com/fr_fr/index.html[H&M]

---

# Skip Link

* Comment allez vous implémenter un `skip link` ?

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
    background: green;
    color: white;
    padding: 9px;''''
    z-index: 100;
}

.skip-link:focus {
    top: 0;
}
```

---

# CSS

* Il est recommandé de donner un style lorsqu'un élément a le focus.

```css
button:focus {
    outline: thick double #32a1ce;
}
```

---

# CSS

* Nous pouvons définir un design différent si nécessaire

```css
.button:focus {
    outline: 0;
    outline-offset: -3px;
}
.button:focus::before {
    ...
}
```

---
layout: cover
---

# PW