---
layout: cover
---

# Rappels

---

# Sélecteurs

* Voici différentes syntaxes permettant de sélectionner un élément HTML
* Ces sélécteurs peuvent être utilisés :

* en CSS
```css
#id { }
.className { }
button { }
[aria-hidden='true'] { }
img[aria-hidden='true'] { }
```

* et en JavaScript
```javascript
document.querySelector(selector);
document.getElementById("nameInput");
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
document.querySelectorAll(selector);
document.getElementsByTagName("p");
document.getElementsByClassName("error");
```

- La méthode **querySelectorAll** retourne un object **NodeList**

```javascript
const buttons = document.querySelectorAll("button");
for (let i = 0; i < buttons.length; i++) {
  console.log(buttons[i]);
}
```

- Nous pouvons convertir en **Array** afin de faciliter le traitement.

```javascript
const buttonsNodeList = document.querySelectorAll("button");
const buttons = Array.from(buttonsNodeList);

buttons.forEach((button) => console.log(button));
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

# Rappel CSS

Pour visuellement cacher un élément,  nous allons retrouver cette classe utilitaire.

```css
.sr-only {
  position: absolute;
  top: 0;
  left: -1000px;
}
```

---

# Et en React

* Bien evidemment en react, ces syntaxe sont légèrement différentes. 
* Pour écouter un évènement, nous allons utiliser les *props* **onSomething** (*onClick*, *onFocus*, ...)
* Pour garder une référence vers un élément, nous allons utiliser une *reference* via le hook *useRef*.

```typescript
import { useRef } from 'react';

function MyComponent() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  };

  return (
    <>
      <input ref={inputRef} type="text" />
      <button type="button" onClick={focusInput}>Focus on Input</button>
    </>
  );
}

export default MyComponent;
```

---

# Pour aller plus loin...

* Pour qu'un composant expose une référence vers un élément HTML à son composant parent, nous allons utiliser la méthode *forwardRef*

```typescript
import { useRef, forwardRef } from 'react';

const MyInput = forwardRef((props, ref) => {
  return <input ref={ref} type="text" />
});

function MyComponent() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  };

  return (
    <>
      <MyInput ref={inputRef} type="text" />
      <button type="button" onClick={focusInput}>Focus on Input</button>
    </>
  );
}

export default MyComponent;
```