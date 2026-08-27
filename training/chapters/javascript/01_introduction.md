---
layout: cover
---

# 1 - Introduction

---

# A short history of JavaScript

- **1995**: created in 10 days by **Brendan Eich** at Netscape (first called *Mocha*, then *LiveScript*)
- **1996-1997**: standardized as **ECMAScript** (ECMA-262)
- **2009**: **ES5** — the baseline still supported everywhere
- **2015**: **ES2015 / ES6** — `const`, `let`, arrow functions, classes, modules...
- Since 2015: **one new version every year** (ES2016, ES2017, ... ES2025)

<br />

> JavaScript ≠ Java. The name was a marketing choice, the languages are unrelated.

---

# JavaScript today

- The **only language natively executed by browsers**
- Runs everywhere:
  - **Browser**: interactivity, SPAs (React, Angular, Vue...)
  - **Server**: Node.js, Deno, Bun
  - **Mobile / Desktop**: React Native, Electron
- Specified by **TC39**, the committee that evolves ECMAScript
- In this training we focus on **JavaScript in the browser**

---

# How the browser runs your code

- The browser loads an **HTML** page
- The `<script>` tag loads and executes JavaScript

```html
<!doctype html>
<html>
  <body>
    <h1>Hello</h1>
    <!-- defer: run the script once the HTML is fully parsed -->
    <script src="app.js" defer></script>
  </body>
</html>
```

- `defer` ➜ the script runs **after** the HTML is parsed
- One page, one shared JavaScript environment

---

# Developer tools

- Open them with **F12** (or `Ctrl+Shift+I` / `Cmd+Opt+I`)
- Your best friends for the whole training:

| Panel | Purpose |
|-------|---------|
| **Elements** | Inspect and edit the HTML / CSS live |
| **Console** | Run JavaScript, read logs and errors |
| **Sources** | Debug with breakpoints |
| **Network** | Watch requests made by the page |

---

# The Console

- A **REPL**: type JavaScript, get the result immediately

```javascript
console.log('Hello world');
2 + 3;                // 5
'Hello'.toUpperCase() // 'HELLO'
```

- `console.log()` is your first debugging tool
- Errors appear here — **always keep the console open** while coding

---

# Reading an error

```javascript
const languages = [{ name: 'JavaScript' }];
console.log(languages.lenght.toFixed(2));
// ❌ Uncaught TypeError: Cannot read properties of undefined (reading 'toFixed')
//    at app.js:2:32
```

- **The type**: `TypeError`, `ReferenceError`, `SyntaxError` — three different problems
- **The message**: names the value that failed, here `undefined`
- **The location**: `app.js:2:32` — file, line, column. **Click it.**

> "Cannot read properties of X" always accuses the value **before the dot**.
> Here `languages.lenght` is `undefined` — the typo is the real bug.

---

# Debugging: the Sources panel

`console.log` tells you what a value **was**. A breakpoint lets you ask
**anything**, at the moment it happens.

- **Sources** panel ➜ click a line number ➜ reload: the page freezes there
- The **Scope** pane lists every variable and its current value
- The console still works, **in the paused context**: type a variable name

| Key | Action |
|-----|--------|
| **F8** | Resume until the next breakpoint |
| **F10** | Step over — run the line, stay in this function |
| **F11** | Step into — enter the function being called |

> `debugger;` written in your code is a breakpoint too. Just never commit it.

---

# Hands-on

## Workshop 1 - First steps

<div style="opacity:.7; font-size:.85em">📁 <code>chapters/javascript/tp/01_introduction/</code> — ⏱ ~30 min — open <code>index.html</code>, steps in its <code>README.md</code></div>

- Open the developer tools on any website
- Inspect and modify an element in the **Elements** panel
- Run your first instructions in the **Console**
- Create an HTML page that loads a `.js` file and logs a message
