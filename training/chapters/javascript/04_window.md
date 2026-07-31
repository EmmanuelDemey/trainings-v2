---
layout: cover
---

# 4 - The window

---

# The `window` object

- The **global object** of JavaScript in the browser
- Represents the **browser tab** running your code
- Every global variable and function is a property of `window`

```javascript
window.console.log('hi'); // same as console.log('hi')
window.alert('Hello');    // same as alert('Hello')
```

- In practice you omit `window.` — it is implicit

---

# Classic properties

| Property | Description |
|----------|-------------|
| `window.innerWidth` | Width of the viewport (px) |
| `window.innerHeight` | Height of the viewport (px) |
| `window.location` | Current URL (read / navigate) |
| `window.history` | Navigation history (`back()`, `forward()`) |
| `window.navigator` | Browser info (`language`, `onLine`...) |
| `window.document` | Entry point to the **DOM** (next chapter) |

```javascript
console.log(window.innerWidth);      // 1280
console.log(location.href);          // 'https://example.com/page'
location.href = '/checkout';         // navigates to another page
```

---

# Classic methods

```javascript
alert('Message to the user');         // blocking popup
const ok = confirm('Are you sure?');  // true / false
const name = prompt('Your name?');    // string or null

open('https://example.com');          // new tab
scrollTo({ top: 0, behavior: 'smooth' });
```

> `alert` / `confirm` / `prompt` **freeze the page** — fine for quick tests,
> avoid them in real interfaces (we will build better dialogs with the DOM).

---

# Scheduling: `setTimeout`

- Run a function **once**, after a delay (in milliseconds)

```javascript
const timerId = setTimeout(() => {
  console.log('3 seconds later');
}, 3000);

clearTimeout(timerId); // cancel before it fires
```

- The delay is a **minimum**, not a guarantee
- `setTimeout(fn, 0)` ➜ "as soon as possible, but after the current code"

---

# Scheduling: `setInterval`

- Run a function **repeatedly**, every *n* milliseconds

```javascript
let seconds = 0;

const intervalId = setInterval(() => {
  seconds++;
  console.log(`${seconds}s elapsed`);
}, 1000);

// later — ALWAYS stop your intervals
clearInterval(intervalId);
```

- Forgetting `clearInterval` = code running forever in the background
- Perfect building block for a **countdown** (Day 3 project!)

---

# Hands-on

## Workshop 4 - The window
- Log the viewport size and the current URL in the console
- Display a message 2 seconds after page load with `setTimeout`
- Build a timer that logs every second and stops after 10 seconds
- Bonus: a "Back to top" smooth scroll with `scrollTo`
