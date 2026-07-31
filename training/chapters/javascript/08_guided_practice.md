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

---

# The pattern for every project

```javascript
// 1. State — the data of the application
let tasks = [];

// 2. Render — rebuild the display from the state
function render() {
  list.innerHTML = '';
  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.textContent = task;
    list.append(li);
  });
}

// 3. Events — update the state, then re-render
form.addEventListener('submit', (event) => {
  event.preventDefault();
  tasks.push(input.value);
  render();
});
```

---

# Mini-project 1: Countdown

- An input to choose a duration, a **Start** button
- The remaining time is displayed and updated **every second**
- At zero: a message appears and the timer stops

<br />

**Concepts used**: `setInterval` / `clearInterval`, DOM updates, `click` event

**Bonus**: Pause / Resume buttons, red text under 10 seconds (`classList`)

---

# Mini-project 2: Password generator

- Options: length (slider), digits, uppercase, symbols (checkboxes)
- A **Generate** button builds a random password
- The result is displayed with a **Copy** button

<br />

**Concepts used**: strings and arrays, `Math.random()`, functions with parameters, form events

**Bonus**: strength indicator (weak / medium / strong) with colored classes

---

# Mini-project 3: Staff directory

- An array of people (name, role, photo) rendered as **cards**
- A search field **filters** the cards as you type
- A select **sorts** by name or role

<br />

**Concepts used**: `map` / `filter` / `sort`, `createElement`, `input` event, render pattern

**Bonus**: responsive grid — 1 column on mobile, 3 on desktop

---

# Mini-project 4: Mini social network

- A form to publish a message (author + text)
- Messages appear in a **feed**, newest first
- **Like** button with counter on each message, **Delete** on your own messages

<br />

**Concepts used**: everything! state array of objects, render pattern, forms, events, `classList`

**Bonus**: character limit with live counter, empty-feed message

---

# Wrap-up

- **Day 1**: values, variables, equality, conditions, loops, functions, arrays
- **Day 2**: `window`, DOM selection & modification, events, responsive
- **Day 3**: the **state ➜ render ➜ events** pattern on real mini-projects

<br />

## Going further

- ES modules, `fetch` and promises, `localStorage`
- Then: TypeScript, and a component framework (React, Vue, Angular...)
