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

# `Date` and its four traps

```javascript
const d = new Date(2026, 11, 31); // ⚠️ months start at 0 → this is December
d.setDate(d.getDate() + 1);       // mutable: d changed, nothing was returned
new Date('31/12/2026');           // Invalid Date — that format is not portable
d.getHours();                     // in the timezone of the machine, whichever it is
```

- Months are **0-indexed**, days are **1-indexed**
- A `Date` is **mutable**: every `setX()` rewrites the object in place
- Only the ISO form (`'2026-12-31T20:00:00'`) parses the same everywhere
- **One single type** for a day, a time, an instant and a timezone

> `Date` was copied from Java 1.0 in ten days, in 1995, and never changed since.

---

# `Temporal`, the new date API

- The standard replacement for `Date` — **stage 4 since March 2026** (ES2026)
- **Immutable** objects, one **explicit type** per need, months starting at 1

```javascript
const today = Temporal.Now.plainDateISO();        // 2026-09-03, no time, no zone
const party = Temporal.PlainDate.from('2026-12-31');

today.month;                    // 9 — September really is 9
today.add({ days: 30 });        // a NEW date, `today` is untouched
party.since(today).days;        // 119
Temporal.PlainDate.compare(today, party); // -1 — sorts like a comparator

Temporal.Now.zonedDateTimeISO('Europe/Paris');    // an instant, in a real zone
Temporal.Duration.from({ minutes: 90 }).total('hours'); // 1.5
```

> `PlainDate` (a day), `PlainTime`, `PlainDateTime`, `ZonedDateTime` (an instant
> in a zone), `Instant` (a point on the timeline), `Duration` (a length of time).

---

# `Temporal` — can I use it today?

| Browser | State |
|---------|-------|
| Chrome / Edge **144+** | ✅ shipped (January 2026) |
| Firefox **139+** | ✅ shipped (May 2025) |
| Safari | ⚠️ Technology Preview only |

- Not **Baseline** yet: one browser short, so not usable bare in production
- A polyfill covers the gap: `temporal-polyfill` or `@js-temporal/polyfill`
- Existing code bridges over: `new Date().toTemporalInstant()`

> For this training: keep `Date` for *storing* an instant (`Date.now()`), and
> `Intl` for *displaying* it. Know that `Temporal` is what you will write next.

---

# `Intl` — formatting for humans

- Never build a displayed number or date by hand: the browser knows the rules

```javascript
const price = 1234.5;

new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
// '1 234,50 €'          — the separators, the position of the symbol, all of it
new Intl.NumberFormat('en-US', { style: 'percent' }).format(0.256);  // '26%'
new Intl.NumberFormat('en', { notation: 'compact' }).format(48000);  // '48K'

new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' })
  .format(new Date());  // 'Thursday 3 September 2026 at 14:05'
```

- `toLocaleDateString()` / `toLocaleString()` are the same engine, one-shot
- Build the formatter **once** and reuse it — creating one is the costly part
- Locale: `'fr-FR'`, `navigator.language` (the user's), or `undefined` (default)

---

# `Intl` — the four others

```javascript
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
rtf.format(-1, 'day');   // 'yesterday'
rtf.format(3, 'hour');   // 'in 3 hours'

new Intl.ListFormat('en').format(['Ada', 'Grace', 'Linus']);
// 'Ada, Grace, and Linus'

new Intl.PluralRules('en').select(1);   // 'one'  — English has 2 forms, Polish 4
new Intl.PluralRules('en').select(0);   // 'other'

const collator = new Intl.Collator('fr');
['Zoé', 'Émile', 'Emma'].sort(collator.compare); // Émile, Emma, Zoé
```

- `localeCompare` of chapter 3 **is** a `Collator` — built again on every
  comparison. On a long list, create it once and pass `collator.compare` to `sort`
- `${n} day${n > 1 ? 's' : ''}` only ever works in English — that is `PluralRules`

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
- Going further: display the date and a price with `Intl`, in two locales
