---
layout: cover
---

# 5 - The DOM

---

# What is the DOM?

- **D**ocument **O**bject **M**odel
- The browser parses your HTML and builds a **tree of objects**
- JavaScript can **read** and **modify** this tree — the page updates live

```html
<body>
  <h1>My shop</h1>
  <ul id="cart">
    <li class="item">Apple</li>
    <li class="item">Kiwi</li>
  </ul>
</body>
```

- `document` is the root object: `document.body`, `document.title`...
- The **Elements** panel of the devtools *is* a view of the DOM

---

# Selecting an element

- **`querySelector`** uses the **CSS selectors you already know**

```javascript
const title = document.querySelector('h1');
const cart = document.querySelector('#cart');
const firstItem = document.querySelector('.item');      // first match
const items = document.querySelectorAll('.item');       // all matches

items.forEach((item) => console.log(item.textContent));
```

- `querySelector` returns **`null`** if nothing matches — check before using!
- `querySelectorAll` returns a **NodeList** (iterable with `forEach` / `for...of`)

---

# Reading and modifying content

```javascript
const title = document.querySelector('h1');

title.textContent;              // 'My shop'  — text only
title.textContent = 'My store'; // replaces the text

const link = document.querySelector('a');
link.getAttribute('href');      // read an attribute
link.setAttribute('href', '/home');
link.href = '/home';            // shortcut for standard attributes
```

> Prefer **`textContent`** over `innerHTML` for text:
> `innerHTML` parses HTML and opens the door to **XSS injections**.

---

# Modifying styles with `classList`

- Don't set styles one by one — **toggle CSS classes**

```css
.hidden  { display: none; }
.active  { border-color: royalblue; }
```

```javascript
const menu = document.querySelector('#menu');

menu.classList.add('active');
menu.classList.remove('hidden');
menu.classList.toggle('open');       // add if absent, remove if present
menu.classList.contains('active');   // true
```

- Keeps the **appearance in CSS** and the **logic in JavaScript**

---

# Creating and removing elements

```javascript
// Create
const li = document.createElement('li');
li.textContent = 'Mango';
li.classList.add('item');

// Insert into the page
const cart = document.querySelector('#cart');
cart.append(li);          // at the end
cart.prepend(li);         // at the beginning

// Remove
li.remove();
```

- Typical pattern: **array of data ➜ DOM elements**

```javascript
const fruits = ['Apple', 'Kiwi', 'Mango'];
fruits.forEach((fruit) => {
  const li = document.createElement('li');
  li.textContent = fruit;
  cart.append(li);
});
```

---

# Hands-on

## Workshop 5 - Manipulating the page

<div style="opacity:.7; font-size:.85em">📁 <code>chapters/javascript/tp/05_dom/</code> — ⏱ ~1h — open <code>index.html</code>, steps in its <code>README.md</code></div>

- Select the title of a page and change its text
- Hide / show a block by toggling a `hidden` class
- Render an array of products as an HTML list with `createElement`
- Add a "Remove" behavior that deletes an item from the list
