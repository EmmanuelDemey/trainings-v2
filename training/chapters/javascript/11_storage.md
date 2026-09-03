---
layout: cover
---

# 11 - Local & Session Storage

<div style="opacity: 0.75; font-size: 0.9em">Optional module — ~1h with its workshop</div>

---

# The page forgets everything

- Reload, and every variable is gone. The state of Day 3 lives in memory only
- Four places a browser can remember something:

| | Lifetime | Size | Sent to the server |
|---|---|---|---|
| A variable | until reload | RAM | no |
| `sessionStorage` | until the **tab** closes | ~5 MB | no |
| `localStorage` | **forever**, until cleared | ~5 MB | no |
| A cookie | its expiry date | 4 kB | **on every request** |

- Bigger or structured needs: **IndexedDB** (asynchronous, another API)

> `localStorage` is the right answer to "keep my todo list after a reload".
> It is never the right answer to "keep the user logged in".

---

# Four methods, and that is all

```javascript
localStorage.setItem('theme', 'dark');
localStorage.getItem('theme');      // 'dark'
localStorage.getItem('nope');       // null — not undefined
localStorage.removeItem('theme');
localStorage.clear();               // everything for this origin

localStorage.length;                // how many keys
```

- `sessionStorage` has **exactly** the same API
- Storage is **per origin**: `http://localhost:3000` and `https://example.com`
  see two different boxes. Two tabs of the same site share `localStorage`
- The **Application** panel of the devtools shows and edits it live

---

# Strings only

```javascript
localStorage.setItem('count', 3);
localStorage.getItem('count');           // '3'   — a STRING
localStorage.getItem('count') + 1;       // '31'  😱

localStorage.setItem('user', { name: 'Ada' });
localStorage.getItem('user');            // '[object Object]' — lost
```

- Everything is converted with `String()`. Numbers come back as text
- So: **JSON on the way in, JSON on the way out**

```javascript
localStorage.setItem('messages', JSON.stringify(messages));
const messages = JSON.parse(localStorage.getItem('messages'));
```

> `JSON.stringify` drops functions, `undefined` and a `Date` becomes a string.
> Store plain data — which the flat states of Day 3 already are.

---

# Reading it back, safely

```javascript
const KEY = 'trainings.todos.v1';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];            // hand-edited, truncated, or written by an old version
  }
}

function save(todos) {
  localStorage.setItem(KEY, JSON.stringify(todos));
}
```

- `JSON.parse(null)` returns `null`, `JSON.parse('oops')` **throws**
- Always a **default value**, always a `try` / `catch`
- Prefix your keys and **version** them: the storage outlives your code, and
  yesterday's shape will meet tomorrow's `render()`

---

# Plugging it into the Day 3 pattern

```javascript
let state = { todos: load() };     // 1. read once, at startup

function render() { /* unchanged */ }

function update(next) {            // 2. one single place writes
  state = next;
  save(state.todos);
  render();
}
```

- Read **once** at startup, write on **every** state change
- Do not scatter `setItem` through the handlers: one funnel, like `render()`
- Writing is **synchronous** and blocks the page: fine for a to-do list, wrong
  inside a `mousemove`. Store on change, not on every keystroke

---

# What not to store

- ❌ A token, a password, a card number, anything personal
- Any `<script>` running on the page reads the whole box — one **XSS** and it
  is all gone. `localStorage` has **no** protection, no `HttpOnly`, no expiry
- ~5 MB per origin: past that, `setItem` **throws** a `QuotaExceededError`
- In private mode, or with cookies blocked, reading can throw too

```javascript
try {
  localStorage.setItem(KEY, JSON.stringify(state));
} catch (error) {
  console.warn('storage unavailable, staying in memory', error.name);
}
```

> Rule of thumb: the app must still work with storage disabled. It is a
> **convenience**, never the source of truth.

---

# Two tabs, one storage

```javascript
window.addEventListener('storage', (event) => {
  if (event.key !== KEY) return;
  state = { todos: JSON.parse(event.newValue) };
  render();               // another tab just changed it
});
```

- The `storage` event fires in the **other** tabs, never in the one that wrote
- Free multi-tab synchronisation, in six lines
- `sessionStorage` never fires it: each tab has its own box

---

# Hands-on

## Workshop 14 - Remembering

<div style="opacity:.7; font-size:.85em">📁 <code>chapters/javascript/tp/14_storage/</code> — ⏱ ~1h — <b>run it with <code>npx serve</code></b>, steps in its <code>README.md</code></div>

- Persist a to-do list in `localStorage` and survive a reload
- `JSON.stringify` in, `JSON.parse` out, with a default and a `try` / `catch`
- Keep the unsent draft in `sessionStorage` and see how the two differ
- Add a *Clear* button, and check the result in the Application panel
- Bonus: synchronise two tabs with the `storage` event
