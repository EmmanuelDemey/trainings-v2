---
layout: cover
---

# 5 - First steps with JSX

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** what JSX compiles to, and why it is "just JavaScript"
- **Interpolate** values and expressions, and **use** the JSX attribute names
  (`className`, `htmlFor`, `style`…)
- **Return** several elements with a **fragment**
- **Render** conditionally with `&&`, the ternary and early returns — and avoid
  the `0` trap
- **Render** a list with `map`, and **choose** a stable `key`

---

# JSX

- A **syntax extension** of JavaScript: HTML-like tags inside your code
- Compiled away by the build tool (Vite, via the React plugin): the browser never
  sees JSX
- Since React 17, the **automatic runtime** inserts the imports: no
  `import React from 'react'` needed

```tsx
const element = (
  <h1 className="title">
    Hello, <strong>Luke</strong>
  </h1>
);
```

compiles to:

```ts
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';

const element = _jsxs('h1', {
  className: 'title',
  children: ['Hello, ', _jsx('strong', { children: 'Luke' })],
});
```

---

# Elements and components

```tsx
import { createElement } from 'react';

// These two lines are equivalent
const a = <PersonCard name="Luke" />;
const b = createElement(PersonCard, { name: 'Luke' });

// lowercase → an HTML element, Capitalized → a component
<button />          // 'button'
<Button />          // the Button function in scope
```

- A JSX tag produces a **React element**: a plain, immutable object describing
  what to render — not a DOM node
- React turns the tree of elements into DOM nodes, and updates them when it changes
- Component names **must** start with a capital letter

---

# Interpolation

```tsx
export function PersonCard() {
  const name = 'Luke Skywalker';
  const avatar = '/images/luke.png';
  const height = 172;

  return (
    <article>
      <h2>{name.toUpperCase()}</h2>
      <img src={avatar} alt={`Portrait of ${name}`} />
      <p>{height / 100} m — {height > 180 ? 'tall' : 'average'}</p>
      <p>{/* a comment in JSX */}</p>
    </article>
  );
}
```

- `{ expression }` inserts **any JavaScript expression**: variables, calls, ternaries
- Not **statements**: no `if`, `for` or `const` inside `{ }`
- Strings, numbers and elements render; `true`, `false`, `null` and `undefined`
  render **nothing**
- Interpolated text is **escaped**: no HTML injection by default

---

# Attributes in JSX

```tsx
<label htmlFor="filter">Filter</label>
<input
  id="filter"
  className="input input--large"
  type="search"
  maxLength={50}
  autoFocus
  aria-describedby="filter-help"
  data-testid="filter"
  onChange={(event) => console.log(event.target.value)}
/>
<div style={{ backgroundColor: '#ffe81f', marginTop: 8 }}>…</div>
```

- `class` and `for` are reserved words: **`className`** and **`htmlFor`**
- Attributes are **camelCase** (`maxLength`, `tabIndex`, `onClick`) — except
  `aria-*` and `data-*`
- `style` takes an **object**, with camelCase properties; numbers mean pixels
- An attribute without a value is `true`: `autoFocus` = `autoFocus={true}`
- Every tag must be **closed**: `<img />`, `<input />`, `<br />`

---

# Fragments

A component returns **one** root. Wrapping in a `<div>` pollutes the DOM — and can
break the HTML (a `<div>` inside a `<tr>` is invalid):

```tsx
import { Fragment } from 'react';

function PersonCells({ person }: { person: Person }) {
  return (
    <>
      <td>{person.name}</td>
      <td>{person.height}</td>
    </>
  );
}

function Glossary({ terms }: { terms: Term[] }) {
  return (
    <dl>
      {terms.map((term) => (
        <Fragment key={term.id}>          {/* the long form accepts a key */}
          <dt>{term.word}</dt>
          <dd>{term.definition}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
```

---

# Conditional rendering

```tsx
function PeopleSection({ people, loading }: { people: Person[]; loading: boolean }) {
  if (loading) {
    return <p>Loading…</p>;                       // early return
  }

  return (
    <section>
      {people.length === 0 && <p>No one found</p>}            {/* && */}
      {people.length > 0 ? <PeopleTable people={people} /> : <EmptyIllustration />}
      <p className={people.length > 10 ? 'many' : undefined}>{people.length} people</p>
    </section>
  );
}
```

- `cond && <X />` — render `X` or nothing
- `cond ? <A /> : <B />` — one or the other
- An **early return** keeps the main JSX readable
- Returning `null` from a component renders nothing

---

# The `0` trap

```tsx
// ❌ renders "0" when the list is empty
{people.length && <PeopleTable people={people} />}

// ✅ the condition is a real boolean
{people.length > 0 && <PeopleTable people={people} />}
```

- `&&` returns its **left operand** when it is falsy — `false` renders nothing, but
  `0` and `NaN` **are rendered**
- Always put a **boolean** on the left of `&&`

<br />

Nested ternaries become unreadable fast — extract a variable or a component:

```tsx
let content;
if (error) content = <ErrorMessage error={error} />;
else if (people.length === 0) content = <p>No one found</p>;
else content = <PeopleTable people={people} />;

return <section>{content}</section>;
```

---

# Rendering lists

```tsx
type Person = { id: string; name: string; height: number };

function PeopleList({ people }: { people: Person[] }) {
  return (
    <ul>
      {people.map((person) => (
        <li key={person.id}>
          {person.name} — {person.height} cm
        </li>
      ))}
    </ul>
  );
}
```

- `map` turns an array of data into an array of elements — no special syntax
- Filter and sort **before** mapping:
  `people.filter(matches).toSorted(byName).map(…)`
- Each element of the array needs a **`key`** prop

---

# The `key` prop

- `key` tells React **which item is which** between two renders: it can then move,
  insert and remove DOM nodes instead of re-creating or mixing them up
- It must be **unique among siblings** and **stable** over time

```tsx
// ✅ an id from the data
{people.map((p) => <PersonRow key={p.id} person={p} />)}

// ⚠️ the index: only for a static list that is never reordered, filtered or edited
{people.map((p, index) => <PersonRow key={index} person={p} />)}

// ❌ a new key on every render: every row is re-created, inputs lose their state
{people.map((p) => <PersonRow key={crypto.randomUUID()} person={p} />)}
```

- With the index as `key`, removing the first row makes React **reuse** its DOM
  node — and its input's state — for the next person
- `key` is not a prop: the component never receives it

---

# Recap

- JSX compiles to `jsx()` calls producing **React elements** — plain objects
- `{ }` takes **expressions**, never statements; `null`, `false`, `undefined` render nothing
- `className`, `htmlFor`, camelCase attributes, `style` as an object, every tag closed
- **Fragments** (`<>…</>`, or `<Fragment key>`) return several elements without a wrapper
- Conditional rendering: `&&` with a **boolean** on the left, ternary, early return
- Lists: `map` + a **stable, unique `key`** from the data — not the index of a
  changing list

---

# Quiz — Question 1 / 3

**What does `<div>{count && <Badge count={count} />}</div>` render when `count` is `0`?**

- **A.** Nothing
- **B.** `<div>0</div>`
- **C.** A `Badge` showing `0`
- **D.** A runtime error

<v-click>

> ✅ **B** — `0 && x` evaluates to `0`, and React renders numbers. Write
> `count > 0 && …` so the left operand is a boolean.

</v-click>

---

# Quiz — Question 2 / 3

**A list of editable rows uses `key={index}`. The user deletes the first row. What
goes wrong?**

- **A.** Nothing, the index is unique
- **B.** React throws a duplicate key error
- **C.** The rows shift: the state of the deleted row's input moves to the next person
- **D.** The whole list is unmounted

<v-click>

> ✅ **C** — The keys `0, 1, 2` become `0, 1`: React thinks the *last* row was removed
> and reuses the first DOM node — and its local state — for the person who moved up.
> Use `key={person.id}`.

</v-click>

---

# Quiz — Question 3 / 3

**Which JSX is valid?**

- **A.** `<label for="name" class="label">Name</label>`
- **B.** `<label htmlFor="name" className="label">Name</label>`
- **C.** `<label htmlfor="name" classname="label">Name</label>`
- **D.** `<label for={name} class={label}>Name</label>`

<v-click>

> ✅ **B** — `for` and `class` are reserved words in JavaScript, so JSX uses the DOM
> property names, in camelCase: `htmlFor` and `className`.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 5 - First steps with JSX
