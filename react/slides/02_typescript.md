---
layout: cover
---

# 2 - TypeScript for React developers

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** what TypeScript adds to JavaScript — and what it does not do at runtime
- **Type** variables, functions and objects, and **choose** between `type` and
  `interface`
- **Model** states with **union types** and **narrow** them with `typeof`, `in` and
  discriminants
- **Write** an exhaustive `switch` guarded by `never`, and a **type guard** for
  `unknown` data
- **Write** generic functions with constraints
- **Derive** types from existing ones with `Partial`, `Pick`, `Omit`, `Record`…

---

# What is TypeScript?

- A **superset** of JavaScript, developed by Microsoft: every JS file is valid TS
- Adds **static types**, checked at compile time — **erased** at runtime
- Files use the `.ts` extension, `.tsx` when they contain JSX
- **TypeScript 7** is a native port of the compiler (written in Go): type checks
  around **10× faster**, same language

```ts
function lowercase(word: string): string {
  return word.toLowerCase();
}

lowercase('React');            // ✅
lowercase(42);                 // ❌ Argument of type 'number' is not assignable…
lowercase('React').length;     // ✅ number
lowercase('React').push('x');  // ❌ Property 'push' does not exist on type 'string'
```

> Types are **not** a validation layer: data coming from an API must still be checked
> at runtime (type guards, Zod…).

---

# Basic types and inference

```ts
let title = 'Star Wars';            // string — inferred, no annotation needed
const episode = 4;                  // 4 — a literal type, it is a const
let heights: number[] = [];         // annotate when the initial value says nothing
let pair: [string, number] = ['Luke', 172];   // a tuple

let anything: any;                  // opt-out of type checking — avoid
let data: unknown = JSON.parse('{}');         // must be narrowed before use

function log(message: string, level?: 'info' | 'warn'): void {
  console[level ?? 'info'](message);
}

const add = (a: number, b: number) => a + b;  // return type inferred: number
```

- **Let inference work** for locals and return values; annotate **parameters** and
  public APIs
- Prefer **`unknown`** to `any`: it forces you to check before you use

---

# Object types: `type` or `interface`

```ts
type Person = {
  id: string;
  name: string;
  height: number;
  mass?: number;                 // optional
  readonly createdAt: Date;      // cannot be reassigned
};

interface Starship {
  name: string;
  pilots: Person[];
}

interface CargoShip extends Starship {   // extension
  capacity: number;
}

type Pilot = Person & { ship: Starship };  // intersection
```

- Both describe object shapes; **`type`** also handles unions, tuples and mapped types
- This training uses `type` for props and models — pick one convention per project

---

# Union types and narrowing

```ts
type Id = string | number;

function format(id: Id) {
  if (typeof id === 'number') {
    return id.toFixed(0);        // id: number
  }
  return id.toUpperCase();       // id: string
}

type Film = { title: string; episode: number };
type Series = { title: string; seasons: number };

function describeShow(show: Film | Series) {
  if ('episode' in show) return `Episode ${show.episode}`;   // show: Film
  return `${show.seasons} seasons`;                          // show: Series
}
```

- **Narrowing**: TypeScript follows `typeof`, `in`, `instanceof`, `===` and
  early `return`s to refine a type inside each branch
- Literal unions replace enums nicely: `type Gender = 'male' | 'female' | 'n/a'`

---

# Discriminated unions

```ts
type RemoteData<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function describe(state: RemoteData<Person[]>): string {
  switch (state.status) {
    case 'idle':    return 'Nothing yet';
    case 'loading': return 'Loading…';
    case 'success': return `${state.data.length} people`;   // data exists here
    case 'error':   return state.error.message;             // error exists here
    default: {
      const unreachable: never = state;   // ❌ compile error if a case is missing
      return unreachable;
    }
  }
}
```

- One **discriminant** field (`status`) — impossible states become unrepresentable:
  no `data` while loading, no `error` on success
- The `never` check makes the `switch` **exhaustive**: add a status, the compiler
  lists every place to update

---

# Type guards for `unknown` data

```ts
function isPerson(value: unknown): value is Person {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'name' in value && typeof value.name === 'string'
  );
}

const body: unknown = await response.json();
if (isPerson(body)) {
  console.log(body.name);       // body: Person
}
```

- `value is Person` — a **type predicate**: when the function returns `true`, the
  caller's variable is narrowed
- The compiler trusts your predicate: a wrong guard is a lie. For real API payloads,
  a schema library (**Zod**) writes the guard **and** the type for you

---

# Generics

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

first([1, 2, 3]);           // number | undefined
first(['Luke', 'Leia']);    // string | undefined

function groupBy<T, K extends PropertyKey>(items: T[], getKey: (item: T) => K) {
  const groups = {} as Record<K, T[]>;
  for (const item of items) {
    (groups[getKey(item)] ??= []).push(item);
  }
  return groups;
}

groupBy(people, (p) => p.gender);   // Record<string, Person[]>
```

- A generic is a **type parameter**: reuse the code, keep the types
- `K extends PropertyKey` is a **constraint**: `K` must be usable as an object key
- You already use them daily: `Array<T>`, `Promise<T>`, `useState<T>()`

---

# Generics — `keyof` and constraints

```ts
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) result[key] = obj[key];
  return result;
}

const luke = pick(person, ['name', 'height']);   // { name: string; height: number }
pick(person, ['planet']);                        // ❌ 'planet' is not a key of Person

function sortBy<T>(items: readonly T[], key: keyof T): T[] {
  return items.toSorted((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0));
}
```

- `keyof T` is the union of the keys of `T`: `'id' | 'name' | 'height' | …`
- `T[K]` is the type of the property `K` of `T` — an **indexed access type**

---

# Utility types

```ts
type PersonDraft = Partial<Person>;               // every field optional
type FullPerson = Required<Person>;               // every field required
type PersonSummary = Pick<Person, 'id' | 'name'>; // keep some fields
type NewPerson = Omit<Person, 'id' | 'createdAt'>;// drop some fields
type FrozenPerson = Readonly<Person>;             // every field readonly

type PeopleById = Record<string, Person>;         // a dictionary
type Status = RemoteData<unknown>['status'];      // 'idle' | 'loading' | …

type Loaded = Extract<RemoteData<Person>, { status: 'success' }>;
type Settled = Exclude<Status, 'idle' | 'loading'>;   // 'success' | 'error'

type Fetcher = (id: string) => Promise<Person>;
type FetcherResult = Awaited<ReturnType<Fetcher>>;    // Person
```

- Derive types instead of copying them: change `Person`, everything follows
- `ReturnType`, `Parameters`, `Awaited` read types **from** functions

---

# `satisfies` and `as const`

```ts
const routes = {
  home: '/',
  person: '/people/:id',
} as const;                       // readonly, literal types: '/' and '/people/:id'

type RouteName = keyof typeof routes;   // 'home' | 'person'

const theme = {
  primary: '#ffe81f',
  background: '#000',
} satisfies Record<string, `#${string}`>;   // checked, but not widened

theme.primary;     // '#ffe81f' — the precise type is kept
```

- `as const` freezes an object into literal types
- `satisfies` **checks** a value against a type **without** replacing its inferred type
- Avoid `as SomeType` on data: it is a cast, not a check

---

# TypeScript in a React project

```tsx
import { useState, type ComponentProps } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  return <button data-variant={variant} {...props} />;
}

const [person, setPerson] = useState<Person | null>(null);   // explicit when null
```

- Props are a **plain object type** — no `React.FC` needed
- `import { type … }`: type-only imports, erased at build time
  (`verbatimModuleSyntax`)
- `"strict": true` in `tsconfig.json` — always: it enables `strictNullChecks`

---

# Recap

- TypeScript checks types at **compile time** and erases them: runtime data still
  needs checking
- Let **inference** work; annotate parameters and public APIs; `unknown` over `any`
- **Unions + narrowing** model alternatives; a **discriminated union** makes
  impossible states unrepresentable, and `never` makes a `switch` exhaustive
- A **type guard** (`value is T`) narrows `unknown` data — or let Zod write it
- **Generics** reuse code without losing types; `keyof` and `extends` constrain them
- **Utility types** derive types: `Partial`, `Pick`, `Omit`, `Record`, `ReturnType`…

---

# Quiz — Question 1 / 3

**In `function f(x: string | number)`, what is the type of `x` after
`if (typeof x === 'string') return;`?**

- **A.** `string | number`
- **B.** `string`
- **C.** `number`
- **D.** `never`

<v-click>

> ✅ **C** — The early `return` removes `string` from the union: TypeScript's control
> flow analysis narrows `x` to `number` for the rest of the function.

</v-click>

---

# Quiz — Question 2 / 3

**What does the `const unreachable: never = state` line of an exhaustive `switch`
buy you?**

- **A.** A runtime error when the state is invalid
- **B.** A compile error as soon as a new case of the union is not handled
- **C.** Faster code
- **D.** Nothing, TypeScript removes it

<v-click>

> ✅ **B** — If every case is handled, `state` is `never` in `default` and the
> assignment compiles. Add `{ status: 'refreshing' }` to the union without a `case`,
> and `state` is no longer `never`: the compiler points at every unhandled `switch`.

</v-click>

---

# Quiz — Question 3 / 3

**You need the type of a person without its `id`, to create one. Which is best?**

- **A.** Copy `Person` into a new type and remove `id`
- **B.** `Partial<Person>`
- **C.** `Omit<Person, 'id'>`
- **D.** `Person` with `id` typed `any`

<v-click>

> ✅ **C** — `Omit` derives the type from `Person`: add a field to `Person`, the
> creation type follows. `Partial` would make *every* field optional, not only drop `id`.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 2 - TypeScript for React developers
