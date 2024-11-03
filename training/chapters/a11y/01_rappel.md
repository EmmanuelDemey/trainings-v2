---
layout: cover
---

# Rappels

---

- JavaScript
- CSS

---

# Rappel JavaScript

* Sélection d'éléments HTML
* Event Listener

---

# Sélecteurs

```
#id
.className
button
[aria-hidden='true']
img[aria-hidden='true']
```

---

# Sélection d'éléments HTML

* Pour sélectionner un élément :

```javascript
document.querySelector(selector);
document.getElementById('nameInput');
```

---

# Sélection d'éléments HTML

* Pour sélectionner plusieurs éléments :

```javascript
document.querySelectorAll(selector);
document.getElementsByTagName('p');
document.getElementsByClassName('error');
```

---

# Sélection d'éléments HTML

* Une fois un élément récupéré, nous pouvons manipuler les attributs :

```javascript
const elt = document.querySelector(selector);

elt.hasAttribute('aria-invalid');
elt.setAttribute('aria-invalid', 'true');
elt.removeAttribute('aria-invalid');
```

---

# Sélection d'éléments HTML

* La méthode `querySelectorAll` retourne un object `NodeList`

```javascript
const buttons = document.querySelectorAll('button');
for(let i = 0; i < buttons.length; i++){
    console.log(buttons[i]);
}
```

---

# Sélection d'éléments HTML

* Nous pouvons convertir en `Array` afin de faciliter le traitement.

```javascript
const buttonsNodeList = document.querySelectorAll('button');
const buttons = Array.from(buttonsNodeList);
//const buttons = Array.prototype.slice.call(buttonsNodeList);

buttons.forEach(button => {
    console.log(button);
});
```

---

# Event Listener

* Pour écouter un événement d'un élément, nous allons utiliser la méthode `addEventListener`.
* Un événement se propage par défaut d'élément en élément.
* Ce système se nomme le `bubbling`.
* Nous pouvons désactiver le `bubbling` et le fonctionnement par défaut de cet événement.

---

# Event Listener

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

* Nous avons par exemple l'événement `DOMContentLoaded` permettant d'exécuter du code une fois que l'ensemble de la page a été chargée.

```javascript
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
});
```

---

# Rappel CSS

* En CSS, nous pouvons appliquer les même selecteurs que ceux utilisés via les méthodes `querySelector` et `querySelectorAll`.

```css
[aria-invalid='true'] {
    border-color: red
}
```

---

# Cacher des éléments

```css
.sr-only {
    position: absolute;
    top: 0;
    left: -1000px;
}
```