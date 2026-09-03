---
layout: cover
---

# 8 - Guided practice

---

# Day 3 objectives

- **Reinforce** the understanding of the concepts seen on Day 1 and 2
- Build **writing reflexes**: from a need to working code, without copy-pasting
- Learn to make your code **maintainable**:
  - small, well-named functions
  - separate **data**, **DOM rendering** and **event handling**
  - no duplication: factor repeated code into functions

<br />

> No new syntax today. Everything you need, you already saw.
> What is new is the **method**.

---

# How today runs

| | |
|---|---|
| **Morning, part 1** | Warm-up, the errors you will make, the debugging reflex |
| **Morning, part 2** | The method: from a need to code — and the pattern |
| **Morning, part 3** | Mini-project 1 (countdown), corrected together |
| **Afternoon** | Mini-projects 2, 3, 4 — you write, we review |

- Each project: a **spec**, then **you code**, then a **collective correction**
- The solutions exist. They are handed out **after** the correction, not before
- Finishing all four is not the goal. Finishing one *well* is

---
layout: cover
---

# Part 1 - Reinforcing the concepts

---

# Warm-up: predict the output

```javascript
// 1
const list = ['a', 'b'];
const copy = list;
copy.push('c');
console.log(list.length);

// 2
const prices = [10, 9, 100];
console.log(prices.sort()[0]);

// 3
console.log(document.querySelector('#nope'));

// 4
function add(a, b) { a + b; }
console.log(add(2, 3));
```

> Write your four answers down **before** the next slide.

---

# Warm-up: the answers

| | Answer | Why |
|---|---|---|
| 1 | `3` | `copy` and `list` point at the **same array** — one value, two wires |
| 2 | `10` | `sort()` with no comparator compares **strings**: `'10' < '9'` |
| 3 | `null` | No match is not an error. The crash comes on the **next** line |
| 4 | `undefined` | No `return` ➜ the function returns `undefined` |

<br />

- Each of these four is a **whole day of debugging** for someone, somewhere, today
- They are not tricks: they are the four mental models of Day 1

---

# The eight errors you will make today

| # | Symptom | Cause |
|---|---------|-------|
| 1 | The page reloads and everything is lost | `preventDefault()` missing on `submit` |
| 2 | `Cannot read properties of null` | The selector matches nothing |
| 3 | The counter goes negative / speeds up | `clearInterval` missing, or a double `setInterval` |
| 4 | The display is right, then wrong | Two copies of the truth: the state **and** the DOM |
| 5 | Clicking row 2 deletes row 3 | You captured an **index** instead of an **id** |
| 6 | `removeEventListener` does nothing | The listener was an **inline arrow** |
| 7 | The page is wrong until the first resize | The initial `render()` call is missing |
| 8 | A message posted by a user runs code | `innerHTML` with user data — **XSS** |

---

# The debugging reflex

When nothing happens, ask the three questions **in this order**:

1. **Is my code running at all?**
   A `console.log('here')` at the top of the handler. No log ➜ the problem is
   the wiring, not the logic.
2. **Is my selector matching?**
   `console.log(element)` right after the `querySelector`. `null` ➜ typo, or
   the script runs before the element exists.
3. **Is my state right?**
   `console.log(state)` **before** the render. If the state is wrong, the
   display was never the problem.

<br />

> Three logs, twenty seconds. Faster than staring at the code — always.

---
layout: cover
---

# Part 2 - Writing reflexes

---

# From a need to code: five steps

Given *"a list of people, a search field, a sort dropdown"*:

1. **The data** — what does one person look like? `{ name, role, team }`
2. **The state** — what changes? The search text, the sort key. That is all
3. **The pure logic** — `visiblePeople()`: data + state ➜ the array to display.
   No DOM, testable in the console
4. **The render** — one function that draws the state, and nothing else does
5. **The wiring** — each event updates the state, then calls `render()`

<br />

> Write them in this order. Starting with `querySelector` is how you end up with
> the logic scattered across four handlers.

---

# Step 1: start with the data

```javascript
// The shape of ONE item drives everything else
const PEOPLE = [
  { name: 'Ada Lovelace', role: 'Developer', team: 'Platform' },
  { name: 'Grace Hopper', role: 'Architect', team: 'Platform' },
];
```

- Ask: **what does the interface need to display?** Those are your keys
- Ask: **what do I need to find an item again after a click?** That is your `id`

```javascript
{ id: crypto.randomUUID(), author, text, likes: 0, createdAt: Date.now() }
```

> Adding a feature later should mean **adding a key**, not restructuring
> everything. Time spent here is not lost.

---

# Step 3: pure logic first

```javascript
// No DOM in here. Values in, values out.
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
```

- You can call it **from the console**: `formatTime(95)` ➜ `'01:35'`
- You can be sure it works **before** anything is on screen
- It is the part that would be unit-tested in a real project

<br />

> A function that both computes *and* writes to the page is a function you can
> only test by clicking. Split it.

---

# Naming

```javascript
// ❌
const d = ppl.filter((x) => x.a >= 18);
function proc() { /* 40 lines */ }

// ✅
const adults = people.filter((person) => person.age >= 18);
function renderMessageList() { /* ... */ }
```

- A **function** is a verb: `render`, `createCard`, `formatTime`, `isEven`
- A **boolean** reads like a question: `isMobile`, `hasErrors`, `menuOpen`
- A **collection** is plural: `messages`, `people`. One item is singular
- A magic number gets a name: `const MAX_LENGTH = 280;`

> The name is the documentation that cannot go stale.

---

# Guard clauses

```javascript
// ❌ the real work drifts to the right
function publish() {
  if (author !== '') {
    if (text !== '') {
      if (text.length <= 280) {
        messages.unshift({ author, text });
      }
    }
  }
}

// ✅ handle the exits first, then the happy path, flat
function publish() {
  if (author === '') return showError('A name is required.');
  if (text === '') return showError('The message is empty.');
  if (text.length > 280) return showError('Too long.');

  messages.unshift({ author, text });
}
```

---

# One function, one job

```javascript
// ❌ the same computation, in two places — they WILL diverge
addButton.addEventListener('click', () => {
  list.append(createRow(item));
  summary.textContent = `${items.length} items, ${total(items)} €`;
});
removeButton.addEventListener('click', () => {
  row.remove();
  summary.textContent = `${items.length} items`;   // 🐛 the total is gone
});
```

- Duplicated code is not a style issue: it is **two things to keep in sync**
- The day you change one, you forget the other. Always
- Rule of thumb: writing the same thing a **second** time ➜ extract a function

---
layout: cover
---

# Part 3 - Maintainable code

---

# The pattern: state ➜ render ➜ events

```javascript
// 1. STATE — the data of the application, the single source of truth
let tasks = [];

// 2. RENDER — rebuilds the display FROM the state. The only one writing to the page
function render() {
  list.textContent = '';
  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.textContent = task;
    list.append(li);
  });
}

// 3. EVENTS — change the state, then re-render. Nothing else
form.addEventListener('submit', (event) => {
  event.preventDefault();
  tasks.push(input.value);
  render();
});
```

---

# Rule 1: the state is the truth

The DOM is a **picture** of the state, never a place to store it.

```javascript
// ❌ the number of likes now exists only on screen
likeButton.textContent = `♥ ${count + 1}`;

// ✅ the array knows; the screen finds out
message.likes++;
render();
```

<br />

- Test: **could you rebuild the whole screen from your state alone?**
  If not, something on screen is information that lives nowhere else
- Corollary: never read data back out of the page — `Number(cell.textContent)`
  is a bug waiting for a translation, a unit, or a space

---

# Rule 2: one render, and it rebuilds everything

```javascript
function render() {
  // empty, then rebuild — always the same path
  feed.textContent = '';
  messages.forEach((message) => feed.append(createMessage(message)));

  emptyMessage.classList.toggle('hidden', messages.length > 0);
  counter.textContent = `${messages.length} message(s)`;
}
```

- Slower on paper. **Immune** to two parts of the screen disagreeing
- The first display goes through the **same function** as all the others —
  call `render()` once at the bottom of your file
- `textContent = ''` and not `innerHTML = ''`: same result, no HTML parsing

---

# Rule 3: handlers stay thin

```javascript
searchInput.addEventListener('input', (event) => {
  search = event.target.value;   // 1. change ONE piece of state
  render();                      // 2. redraw
});

sortSelect.addEventListener('change', (event) => {
  sortKey = event.target.value;
  render();
});
```

- Two lines each. A handler that grows is logic that belongs in a function
- Because the sort handler only touches `sortKey`, the current search
  **survives it for free** — that property is the whole point of the pattern
- A handler never knows what a card looks like

---

# Rule 4: three layers, in this order

```javascript
// --- State -------------------------------------------
let messages = [];

// --- Pure logic (no DOM below this line) --------------
function relativeTime(timestamp) { /* ... */ }
function visibleMessages() { /* ... */ }

// --- Render (the only code writing to the page) -------
function createMessage(message) { /* ... */ }
function render() { /* ... */ }

// --- Events ------------------------------------------
form.addEventListener('submit', ...);

render();
```

> Same order in every file. Six months later, you know where to look.

---

# Rule 5: identify by id, never by index

```javascript
// ❌ indexes shift as soon as something is removed above
messages.splice(index, 1);

// ✅ the id stays true whatever happens to the list
messages = messages.filter((message) => message.id !== id);
```

```javascript
article.dataset.id = message.id;              // the id travels with the element
const li = event.target.closest('[data-id]'); // and comes back on click
```

- `crypto.randomUUID()` gives you one, for free, in every browser
- This is the same reason `key` exists in React and `:key` in Vue

---

# Rule 6: `textContent`, not `innerHTML`

```javascript
const text = '<img src=x onerror="steal(document.cookie)">';

element.textContent = text;  // ✅ displayed as characters
element.innerHTML  = text;   // ❌ parsed as HTML — the code RUNS
```

- Any string that came from a **user** is hostile until proven otherwise
- `innerHTML` is a shortcut that costs you a **stored XSS**: the visitor's
  session, handed to whoever posted the message
- `createElement` + `textContent` is three lines longer and cannot be exploited

> Try it in your own feed today. Post the line above and watch what happens.

---

# The skeleton to copy

```javascript
// --- State ---------------------------------------------------------
let items = [];

// --- Pure logic ----------------------------------------------------
function visibleItems() { return items; }

// --- Render --------------------------------------------------------
const list = document.querySelector('#list');

function createItem(item) { /* returns an element */ }

function render() {
  list.textContent = '';
  visibleItems().forEach((item) => list.append(createItem(item)));
}

// --- Events --------------------------------------------------------
// each handler: change the state, then render()

render();
```

---

# Where this stops

- Rebuilding everything is fine at **12 cards**, or **200 messages**
- At a few thousand rows, redrawing on every keystroke starts to show
- The fix is to keep the elements and only move what changed — which is
  **exactly** what React, Vue and Angular do for you

<br />

> You have just written, by hand, the idea every framework is built on:
> **state ➜ view**, and the view is never the truth.
> That is why today is the right preparation for tomorrow's framework.

---
layout: cover
---

# Part 4 - Mini-projects

---

# How a mini-project runs

1. Read the **spec** — the slide is the whole requirement
2. Open the folder, read its `README.md`: the steps are numbered
3. **Write the state first**, then the pure logic, then the render, then the events
4. Stuck for more than 10 minutes? Ask. That is what the room is for
5. Collective **correction**, then the solution folder is opened

<br />

| Project | Roughly | Difficulty |
|---------|---------|-----------|
| 1 - Countdown | 1h | the pattern, on the smallest possible state |
| 2 - Password generator | 1h15 | strings, arrays, randomness |
| 3 - Staff directory | 1h15 | two controls, one derived list |
| 4 - Mini social network | 1h30 | everything |

---

# Mini-project 1: Countdown

- An input to choose a duration, a **Start** button
- The remaining time is displayed and updated **every second**
- At zero: a message appears and the timer stops

<br />

**Concepts used**: `setInterval` / `clearInterval`, DOM updates, `click` event

**Bonus**: Pause / Resume buttons, red text under 10 seconds (`classList`)

**The trap**: click Start twice. Two intervals, one variable — the clock runs
twice as fast and only one of them can ever be stopped.

<div style="opacity:.7; font-size:.85em">📁 <code>chapters/javascript/tp/08_countdown/</code></div>

---

# Mini-project 2: Password generator

- Options: length (slider), digits, uppercase, symbols (checkboxes)
- A **Generate** button builds a random password
- The result is displayed with a **Copy** button

<br />

**Concepts used**: strings and arrays, `Math.random()`, functions with parameters, form events

**Bonus**: strength indicator (weak / medium / strong) with colored classes

**The trap**: forcing "at least one digit" by overwriting the first character
puts every class at a fixed position — and quietly destroys the randomness.

<div style="opacity:.7; font-size:.85em">📁 <code>chapters/javascript/tp/09_password_generator/</code></div>

---

# Mini-project 3: Staff directory

- An array of people (name, role, photo) rendered as **cards**
- A search field **filters** the cards as you type
- A select **sorts** by name or role

<br />

**Concepts used**: `map` / `filter` / `sort`, `createElement`, `input` event, render pattern

**Bonus**: responsive grid — 1 column on mobile, 3 on desktop

**The trap**: storing the filtered list in a variable. Change the sort, and the
search silently disappears — two copies of the truth, again.

<div style="opacity:.7; font-size:.85em">📁 <code>chapters/javascript/tp/10_staff_directory/</code></div>

---

# Mini-project 4: Mini social network

- A form to publish a message (author + text)
- Messages appear in a **feed**, newest first
- **Like** button with counter on each message, **Delete** on your own messages

<br />

**Concepts used**: everything! state array of objects, render pattern, forms, events, `classList`

**Bonus**: character limit with live counter, empty-feed message

**The trap**: `likeButton.textContent = '♥ ' + (n + 1)`. It works, and it puts a
number on screen that exists nowhere in your state. Re-render, and it is gone.

<div style="opacity:.7; font-size:.85em">📁 <code>chapters/javascript/tp/11_social_network/</code></div>

---

# Cross-review checklist

Swap keyboards with your neighbour and go through the list on **their** project:

- [ ] Could I rebuild the whole screen from the state alone?
- [ ] Is there exactly **one** function writing to the page?
- [ ] Does every handler fit in a few lines: change state, then render?
- [ ] Is there any `innerHTML` receiving text typed by a user?
- [ ] Is any computation written twice?
- [ ] Does every name say what the thing **is** or **does**?
- [ ] Are the intervals cleared, the forms `preventDefault`-ed, the buttons `<button>`?

> Reading someone else's code for ten minutes teaches more than writing your own
> for an hour.

---

# Wrap-up

- **Day 1**: values, variables, equality, conditions, loops, functions, arrays
- **Day 2**: `window`, DOM selection & modification, events, responsive
- **Day 3**: the **state ➜ render ➜ events** pattern on real mini-projects

<br />

The four projects are the same twenty lines of structure, four times.
That repetition **is** the skill: you now have a default shape to reach for
in front of an empty file.

---

# What we did not cover, and why

| Subject | Why it was left out | Where to start |
|---------|--------------------|----------------|
| `fetch` and promises | Needs the async model — half a day on its own | **optional module** — chapter 9 |
| ES modules | Needs a server, changes the tooling | **optional module** — chapter 10 |
| `localStorage` | Ten minutes, once the state pattern is solid | **optional module** — chapter 11 |
| Classes, `this` | Rarely needed to write an interface today | after the three above |
| A framework | It only makes sense once today's pattern hurts | React, Vue, Angular |

> In that order. Each one assumes the previous. The first three exist as
> **optional modules**, with their own workshop — ask for them.

---

# Going further

- **MDN** — `developer.mozilla.org`, the reference. Not W3Schools
- **javascript.info** — the best free course, in the same spirit as Day 1
- **caniuse.com** — before using a recent method in production

<br />

## The natural next steps

1. `fetch` + `async` / `await`: an interface that talks to a server
2. **TypeScript**: the same language, with the errors caught before runtime
3. A component framework: the pattern of Day 3, industrialised

<br />

> Thanks — and keep the console open.
