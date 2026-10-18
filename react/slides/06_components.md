---
layout: cover
---

# 6 - Components &amp; props

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Describe** how React renders a tree of components and reconciles it through the
  virtual DOM
- **Write** a function component with **typed props**, defaults and destructuring
- **Pass** content with `children`, and **notify** a parent through callback props
- **Handle** DOM events with typed handlers
- **Wrap** a native element with `ComponentProps<'input'>` and the rest/spread of props
- **Choose** between composition, render props and higher-order components
- **Organise** a project by feature

---

# A tree of components

```
<App>
├── <Header />
├── <PeoplePage>
│   ├── <PeopleFilter value onChange />
│   └── <PeopleTable people>
│       └── <PersonRow person />  × n
└── <Footer />
```

- An application is a **tree of components**; data flows **down**, through props
- When a component's state changes, React **re-renders** it — and, by default, all
  of its children
- A render is a **function call**: it must be **pure** — same props and state, same
  JSX, no side effects
- The **React DevTools** show this tree, the props of each node, and why it rendered

---

# The virtual DOM and reconciliation

- A render returns a tree of **React elements** — a lightweight description in memory,
  often called the **virtual DOM**
- React **compares** the new tree with the previous one (*reconciliation*):
  - same type at the same place → **update** the existing DOM node's attributes
  - different type → **unmount** the old subtree, **mount** a new one
  - in lists, the `key` identifies each item
- Then it **commits** only the necessary DOM operations, in one batch

<br />

```
state change → render (call the components) → diff → commit (touch the DOM)
```

> Re-rendering is cheap; touching the DOM is not. React minimises the second.

---

# Function components

```tsx
type TitleProps = {
  content: string;
  level?: 1 | 2 | 3;
};

export function Title({ content, level = 1 }: TitleProps) {
  const Tag = `h${level}` as const;
  return <Tag className="title">{content}</Tag>;
}

// <Title content="Star Wars people" />
// <Title content="Details" level={2} />
```

- A component is a **function** that takes **one object** — its props — and returns JSX
- **Destructure** the props in the signature; default values replace `defaultProps`
- Props are **read-only**: a component never modifies them
- Class components (`extends Component`) still work but are **legacy** — the only
  remaining use case is the error boundary (chapter 10)

---

# `children`

```tsx
import type { ReactNode } from 'react';

type CardProps = {
  title: string;
  children: ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="card__body">{children}</div>
    </section>
  );
}

<Card title="Luke Skywalker">
  <p>Height: 172 cm</p>
  <LikeButton personId="1" />
</Card>
```

- What you put **between the tags** arrives as the `children` prop
- `ReactNode` accepts elements, strings, numbers, arrays, `null`…
- `PropsWithChildren<P>` adds an optional `children` to an existing props type

---

# Several slots

```tsx
type LayoutProps = {
  header: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
};

export function Layout({ header, sidebar, children }: LayoutProps) {
  return (
    <div className="layout">
      <header>{header}</header>
      {sidebar && <aside>{sidebar}</aside>}
      <main>{children}</main>
    </div>
  );
}

<Layout header={<Title content="People" />} sidebar={<PeopleFilter … />}>
  <PeopleTable people={people} />
</Layout>
```

- Any prop can carry JSX: that is React's version of **named slots**
- Composition with `children` avoids passing data through layers that do not use it

---

# Callback props

```tsx
type PeopleFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

export function PeopleFilter({ value, onChange }: PeopleFilterProps) {
  return (
    <label>
      Filter
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

// In the parent:
<PeopleFilter value={filter} onChange={setFilter} />
```

- Data goes **down** as props; events go **up** as **functions** passed as props
- Name them `onSomething`; the parent decides what happens
- The child stays **dumb** and reusable: it knows nothing of where the state lives

---

# Handling events

```tsx
import type { ChangeEvent, FormEvent, MouseEvent } from 'react';

export function SearchForm({ onSearch }: { onSearch: (query: string) => void }) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSearch(String(data.get('query')));
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    console.log('clicked at', event.clientX);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="query" onChange={(e: ChangeEvent<HTMLInputElement>) => console.log(e.target.value)} />
      <button onClick={handleClick}>Search</button>
    </form>
  );
}
```

- `onClick={handleClick}` — pass the function, **do not call it**: `onClick={handleClick()}`
  runs it during render
- React passes a **synthetic event**, typed by element: `MouseEvent<HTMLButtonElement>`

---

# `ComponentProps` — wrapping native elements

```tsx
import { useId, type ComponentProps } from 'react';

type InputProps = ComponentProps<'input'> & {
  label: string;
};

export function Input({ label, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} {...props} />
    </div>
  );
}

<Input label="Name" name="name" required placeholder="Luke" />
```

- `ComponentProps<'input'>` = every attribute of `<input>`, `ref` included (React 19)
- Pull out what you use, **spread the rest** on the native element
- `ComponentProps<typeof Button>` reads the props of any component — even from a
  library that does not export its types

---

# Composition over configuration

```tsx
// ❌ a "god component": one prop per variation
<Card title="Luke" subtitle="Jedi" showLike showAvatar avatarSize="large"
      footerText="Tatooine" footerAlign="right" onLike={…} />

// ✅ small pieces composed by the caller
<Card title="Luke">
  <Avatar person={luke} size="large" />
  <p>Jedi</p>
  <Card.Footer align="right">Tatooine <LikeButton personId="1" /></Card.Footer>
</Card>
```

- Too many props → a component that does everything, badly, and is hard to test
- Prefer **small components** composed through `children` and slot props
- Atomic design gives a vocabulary: atoms → molecules → organisms → templates → pages

---

# Render props

```tsx
type ListProps<T> = {
  items: T[];
  renderItem: (item: T) => ReactNode;
  empty?: ReactNode;
};

export function List<T extends { id: string }>({ items, renderItem, empty }: ListProps<T>) {
  if (items.length === 0) return <>{empty}</>;
  return (
    <ul>
      {items.map((item) => <li key={item.id}>{renderItem(item)}</li>)}
    </ul>
  );
}

<List items={people} renderItem={(p) => <strong>{p.name}</strong>} empty="No one" />
```

- A prop that is a **function returning JSX**: the component owns the logic, the
  caller owns the markup
- Still useful for generic lists, tables and virtualisers; for **sharing logic**,
  custom hooks (chapter 11) replaced them

---

# Higher-order components

```tsx
import type { ComponentType } from 'react';

function withLoader<P extends object>(Wrapped: ComponentType<P>) {
  return function WithLoader({ loading, ...props }: P & { loading: boolean }) {
    if (loading) return <p>Loading…</p>;
    return <Wrapped {...(props as P)} />;
  };
}

const PeopleTableWithLoader = withLoader(PeopleTable);
// <PeopleTableWithLoader loading={loading} people={people} />
```

- A function that takes a component and returns an **enhanced** one
- Common in older code (`connect` from Redux, `withRouter`, `withTranslation`)
- Drawbacks: props collisions, hard-to-type wrappers, deep trees in the DevTools
- Today: **custom hooks** for logic, **composition** for markup

---

# Project structure

```
src/
├── features/
│   ├── people/
│   │   ├── components/
│   │   │   ├── PeopleTable.tsx
│   │   │   ├── PeopleTable.module.css
│   │   │   └── PeopleTable.spec.tsx
│   │   ├── hooks/
│   │   └── people-api.ts
│   └── starships/
├── shared/
│   ├── components/      ← Button, Input, Card
│   └── utils/
├── App.tsx
└── main.tsx
```

- Group **by feature**, then by technical role inside a feature
- Keep a component, its styles and its tests **side by side**
- A feature may import from `shared/`, never from another feature's internals

---

# Recap

- A component is a **pure function** of its props; React re-renders it and its
  children when state changes, and **reconciles** to touch the DOM as little as possible
- Typed props, destructured in the signature, defaults inline, never mutated
- `children` and slot props for **composition**; callback props (`onX`) to send
  events **up**
- Pass handlers, do not call them; events are typed by element
- `ComponentProps<'input'>` + rest/spread to wrap native elements
- Composition first; render props for generic rendering; HOCs are legacy
- Structure the project **by feature**, tests and styles next to the component

---

# Quiz — Question 1 / 3

**`<button onClick={deletePerson(person.id)}>Delete</button>` — what happens?**

- **A.** The person is deleted on click
- **B.** `deletePerson` runs during **every render**, and the click does nothing useful
- **C.** A TypeScript error, always
- **D.** React wraps it automatically in an arrow function

<v-click>

> ✅ **B** — The expression is evaluated while rendering, and its *return value* becomes
> the handler. Write `onClick={() => deletePerson(person.id)}`.

</v-click>

---

# Quiz — Question 2 / 3

**A child component needs to tell its parent that the filter changed. How?**

- **A.** It modifies the `filter` prop directly
- **B.** It receives an `onChange` callback prop and calls it with the new value
- **C.** It dispatches a DOM `CustomEvent` on `window`
- **D.** It imports the parent's state

<v-click>

> ✅ **B** — Props are read-only and flow down; events flow up through functions the
> parent passes. The parent owns the state and decides what to do.

</v-click>

---

# Quiz — Question 3 / 3

**Which type gives a wrapper component every attribute of a native `<button>`?**

- **A.** `HTMLButtonElement`
- **B.** `ButtonHTMLAttributes`
- **C.** `ComponentProps<'button'>`
- **D.** `ReactNode`

<v-click>

> ✅ **C** — `ComponentProps<'button'>` lists the props React accepts on `<button>`,
> event handlers and `ref` included. `HTMLButtonElement` is the DOM node itself.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 6 - Components &amp; props
