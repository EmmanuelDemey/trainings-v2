---
layout: cover
---

# 4 - Modern JavaScript

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Situate** the ECMAScript versions, from ES2015 to ES2025
- **Use** `const` / `let`, arrow functions and template literals
- **Destructure** objects and arrays, and **copy** them with the spread operator
- **Organise** code in ES modules — named and default exports
- **Read** nested data safely with `?.` and `??`
- **Transform** collections with `map` / `filter` / `reduce`, `toSorted`,
  `Object.groupBy` — without mutating them
- **Write** asynchronous code with promises and `async` / `await`

---

# One version a year

| Version | Highlights |
|---|---|
| **ES2015** (ES6) | `let`/`const`, arrow functions, classes, modules, destructuring, promises |
| ES2016–2017 | `includes`, `**`, `async` / `await`, `Object.entries` |
| ES2018–2019 | object spread, `Promise.finally`, `flat`, `Object.fromEntries` |
| ES2020 | `?.`, `??`, `Promise.allSettled`, `BigInt` |
| ES2021–2022 | `??=`, `replaceAll`, `at()`, top-level `await`, `Object.hasOwn` |
| ES2023 | `toSorted`, `toReversed`, `with`, `findLast` |
| ES2024 | `Object.groupBy`, `Promise.withResolvers` |
| ES2025 | `Set` methods (`union`, `intersection`…), iterator helpers, `RegExp.escape` |

<br />

- **TC39** publishes a new edition every **June**; browsers ship features earlier
- Vite and TypeScript transpile to the `target` you configure

---

# `const`, `let` and arrow functions

```ts
const name = 'Luke';       // cannot be reassigned — the default choice
let count = 0;             // when the binding really changes
count += 1;
// var — function-scoped, hoisted: no longer used

const double = (n: number) => n * 2;            // implicit return
const toPerson = (name: string) => ({ name });  // returning an object: parentheses
const greet = (name: string) => {
  const message = `Hello, ${name}!`;            // template literal
  return message;
};
```

- `const` prevents **reassignment**, not mutation: `const people = []; people.push(x)`
  works
- Arrow functions have no own `this` — handy in callbacks
- React components and handlers are mostly **arrow functions or function
  declarations**, both are fine

---

# Destructuring

```ts
const person = { name: 'Luke Skywalker', height: 172, homeworld: { name: 'Tatooine' } };

const { name, height } = person;
const { name: fullName } = person;                  // rename
const { mass = 'unknown' } = person as { mass?: string };   // default value
const { homeworld: { name: planet } } = person;     // nested

const [first, second, ...others] = ['Luke', 'Leia', 'Han', 'Chewie'];
const [, , third] = ['Luke', 'Leia', 'Han'];        // skip items

function describe({ name, height }: { name: string; height: number }) {
  return `${name} — ${height} cm`;                  // destructured parameters
}

const [count, setCount] = useState(0);              // React's favourite pattern
```

---

# Spread and rest

```ts
const luke = { name: 'Luke', height: 172 };

const taller = { ...luke, height: 180 };           // copy and override
const withId = { id: '1', ...luke };                // copy and extend
const { height, ...withoutHeight } = luke;          // rest: everything else

const jedi = ['Luke', 'Yoda'];
const all = [...jedi, 'Obi-Wan'];                   // copy and append
const max = Math.max(...[172, 150, 202]);           // spread as arguments

function log(level: string, ...messages: string[]) {}   // rest parameters
```

- Spread makes a **shallow** copy: nested objects are shared
- A **deep** copy: `structuredClone(value)` — dates, maps and cycles included
- In React, state is **never mutated**: you build a new object with spread

---

# ES modules

```ts
// people.ts
export type Person = { id: string; name: string };
export const people: Person[] = [];
export function findPerson(id: string) {
  return people.find((p) => p.id === id);
}
export default function PeopleTable() {}
```

```ts
// App.tsx
import PeopleTable, { findPerson, people } from './people';
import { findPerson as find } from './people';     // rename
import * as peopleApi from './people';             // namespace
import type { Person } from './people';            // type only, erased

const { HeavyChart } = await import('./HeavyChart');   // dynamic import → a chunk
```

- Prefer **named exports**: one name everywhere, better refactoring and auto-imports
- `import()` returns a promise — the basis of code splitting (chapter 13)

---

# Optional chaining and nullish coalescing

```ts
type Person = { name: string; homeworld?: { name?: string }; films?: string[]; mass?: number };

const planet = person.homeworld?.name;          // undefined instead of a TypeError
const firstFilm = person.films?.[0];             // on an index
onSelect?.(person);                             // on a call

const mass = person.mass ?? 'unknown';           // only null / undefined fall back
const massOr = person.mass || 'unknown';         // ⚠️ 0 also falls back!

settings.theme ??= 'dark';                       // assign only when nullish
counter.value ||= 1;                             // assign when falsy
```

- `??` treats `0`, `''` and `false` as **real values** — `||` does not
- Do not sprinkle `?.` everywhere: if a value *must* exist, let the error surface

---

# Array methods — transforming

```ts
const people = [
  { name: 'Luke', height: 172, gender: 'male' },
  { name: 'Leia', height: 150, gender: 'female' },
  { name: 'Chewbacca', height: 228, gender: 'male' },
];

people.map((p) => p.name);                         // ['Luke', 'Leia', 'Chewbacca']
people.filter((p) => p.height > 160);              // Luke, Chewbacca
people.find((p) => p.name === 'Leia');             // the object, or undefined
people.some((p) => p.height > 200);                // true
people.every((p) => p.height > 100);               // true
people.reduce((total, p) => total + p.height, 0);  // 550
people.at(-1);                                     // the last one
people.flatMap((p) => p.name.split(''));           // map + flatten one level
```

- `map` in JSX **renders lists**: `people.map((p) => <li key={p.name}>{p.name}</li>)`
- Chain them: `people.filter(…).map(…)` reads like a sentence

---

# Array methods — without mutating

```ts
people.sort((a, b) => a.height - b.height);       // ⚠️ mutates people!

const byHeight = people.toSorted((a, b) => a.height - b.height);   // ES2023: a copy
const reversed = people.toReversed();
const updated = people.with(0, { ...people[0], height: 173 });     // replace index 0
const withoutFirst = people.toSpliced(0, 1);

const byGender = Object.groupBy(people, (p) => p.gender);
// { male: [Luke, Chewbacca], female: [Leia] }

const names = new Set(['Luke', 'Leia']).union(new Set(['Han']));   // ES2025
```

- `sort`, `reverse`, `splice` **mutate** the array — a classic React bug when that
  array is state or props
- The `to…` variants and `with` return a **new** array: always prefer them in React
- `Object.groupBy` and the `Set` methods need `"lib": ["es2024"]` / `["es2025"]` (or
  `esnext`) in `tsconfig.json`

---

# Promises

```ts
fetch('/api/people/1')
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((person) => console.log(person.name))
  .catch((error) => console.error(error))
  .finally(() => console.log('done'));

const [luke, leia] = await Promise.all([getPerson('1'), getPerson('5')]);

const results = await Promise.allSettled([getPerson('1'), getPerson('404')]);
// [{ status: 'fulfilled', value: … }, { status: 'rejected', reason: … }]
```

- `Promise.all` rejects as soon as **one** fails; `allSettled` waits for **all**
- `Promise.race` / `Promise.any`: the first settled / the first fulfilled
- `fetch` does **not** reject on a 404 or a 500 — check `response.ok`

---

# `async` / `await`

```ts
async function getPerson(id: string): Promise<Person> {
  const response = await fetch(`/api/people/${id}`);
  if (!response.ok) {
    throw new Error(`Person ${id} not found`);
  }
  return response.json();
}

try {
  const person = await getPerson('1');
  console.log(person.name);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
}
```

- An `async` function **always returns a promise**
- `await` pauses the function, not the page; use `try` / `catch` for errors
- Independent calls: `await Promise.all([…])`, not two `await`s in a row
- Top-level `await` works in ES modules

---

# Recap

- A new ECMAScript edition **every June**; ES2015 was the big one
- `const` by default, arrow functions, template literals
- **Destructuring** reads, **spread** copies — shallowly; `structuredClone` copies deeply
- **Named exports** and `import type`; `import()` splits the bundle
- `?.` reads safely, `??` falls back on `null` / `undefined` only
- `map` / `filter` / `reduce`, and the non-mutating `toSorted`, `with`,
  `Object.groupBy` — React state is never mutated
- `async` / `await` + `try` / `catch`; `Promise.all` for parallel calls; check
  `response.ok`

---

# Quiz — Question 1 / 3

**`person.mass` is `0`. What do `person.mass || 'unknown'` and
`person.mass ?? 'unknown'` return?**

- **A.** `0` and `0`
- **B.** `'unknown'` and `'unknown'`
- **C.** `'unknown'` and `0`
- **D.** `0` and `'unknown'`

<v-click>

> ✅ **C** — `||` falls back on any **falsy** value, `0` included. `??` only falls back
> on `null` and `undefined`, so `0` is kept.

</v-click>

---

# Quiz — Question 2 / 3

**`people` is a prop. Why is `people.sort(byName)` in a component a bug?**

- **A.** `sort` is not available on arrays of objects
- **B.** `sort` mutates the array in place — the parent's data changes behind its back
- **C.** `sort` is asynchronous
- **D.** It is not a bug

<v-click>

> ✅ **B** — `sort` reorders the original array, which belongs to the parent (or to
> state). Use `people.toSorted(byName)`, which returns a sorted **copy**.

</v-click>

---

# Quiz — Question 3 / 3

**`const copy = { ...person }`, then `copy.homeworld.name = 'Naboo'`. What happens
to `person.homeworld.name`?**

- **A.** It stays unchanged
- **B.** It becomes `'Naboo'` too — spread is a shallow copy
- **C.** It throws a `TypeError`
- **D.** It becomes `undefined`

<v-click>

> ✅ **B** — Spread only copies the first level: `copy.homeworld` and
> `person.homeworld` are the same object. Spread each nested level you change, or
> use `structuredClone`.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 4 - Modern JavaScript, from ES2015 to ES2025
