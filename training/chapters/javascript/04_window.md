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

# Dates and timestamps

```javascript
Date.now();                    // 1756310400000 — ms since 1 Jan 1970 (UTC)
const now = new Date();        // a Date object
const party = new Date('2026-12-31T20:00:00');

party.getTime() - Date.now();  // ms remaining — a plain number
now.toLocaleDateString('en');  // '8/27/2026'  — localised for display
now.toLocaleTimeString('en');  // '3:04:11 PM'
now.toISOString();             // '2026-08-27T13:04:11.000Z' — for machines
```

- A date is really **a number**: milliseconds since 1970
- Subtract two dates ➜ a duration in ms. `/ 1000` ➜ seconds
- Store and transmit the **number**, format only at display time

---

# Why a countdown drifts

```javascript
// ❌ counts TICKS — late after a minute in a background tab
let remaining = 60;
setInterval(() => { remaining--; render(); }, 1000);

// ✅ counts TIME — always exact, whatever the browser did
const target = Date.now() + 60_000;
setInterval(() => {
  const remaining = Math.round((target - Date.now()) / 1000);
  render();
}, 1000);
```

- `setInterval` guarantees **nothing** about the delay: a background tab throttles
  it to one tick per second at best, often far less
- Fix: keep a **fixed target**, recompute on every tick
- The interval then only decides **how often you refresh the display**

---

# Hands-on

## Workshop 4 - The window

<div style="opacity:.7; font-size:.85em">📁 <code>chapters/javascript/tp/04_window/</code> — ⏱ ~45 min — open <code>index.html</code>, steps in its <code>README.md</code></div>

- Log the viewport size and the current URL in the console
- Display a message 2 seconds after page load with `setTimeout`
- Build a timer that logs every second and stops after 10 seconds
- Bonus: a "Back to top" smooth scroll with `scrollTo`
