---
layout: cover
---

# 3 - Unit testing

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Position** a test in the pyramid: unit, component, end-to-end
- **Configure** Vitest with jsdom and Testing Library in a Vite project
- **Structure** a suite with `describe` / `it` and hooks, and **write** assertions
  with Vitest's and jest-dom's matchers
- **Replace** a dependency with `vi.fn` / `vi.spyOn`, the spy declared with `using`
- **Control** time with fake timers
- **Render** a component and **query** it the way a user would, then **interact**
  with `user-event`

---

# The testing strategy

```
        /\
       /e2e\          ← Cypress / Playwright — real browser, few, slow   (chapter 21)
      /------\
     /  comp  \       ← Testing Library + jsdom — the bulk of the suite
    /----------\
   /    unit    \     ← pure functions, hooks, stores — fast, numerous
  /--------------\
```

<br />

| Level | What it proves | Cost |
|---|---|---|
| Unit | A function returns the right value | ms |
| Component | A component renders and reacts to the user | tens of ms |
| E2E | A user journey works end to end | seconds |

> Test **behaviour**, not implementation. If a refactor breaks your test but not
> the app, the test was wrong.

---

# Setting up Vitest

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',                    // a DOM in Node.js
    setupFiles: ['src/tests/setup.ts'],
    include: ['src/**/*.spec.{ts,tsx}'],
  },
});
```

```ts
// src/tests/setup.ts
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';   // toBeInTheDocument(), toHaveValue()…

afterEach(() => cleanup());                  // unmount what each test rendered
```

- Vitest reuses the **Vite pipeline**: same plugins, same aliases, TS out of the box

---

# Running the tests

```bash
npx vitest              # watch mode — re-runs the tests affected by a change
npx vitest run          # once, for the CI   (npm test)
npx vitest run people   # only the files whose path matches "people"
npx vitest --ui         # a browser UI to explore the results
npx vitest run --coverage   # needs @vitest/coverage-v8
```

- In watch mode: `p` filters by file name, `t` by test name, `f` re-runs the failures
- Files live **next to the code**: `PeopleTable.tsx` + `PeopleTable.spec.tsx`

---

# Structuring a suite

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { filterPeople } from './filter-people';

describe('filterPeople', () => {
  let people: Person[];

  beforeEach(() => {
    people = [luke, leia, vader];      // a fresh copy for every test
  });

  it('returns everyone when the filter is empty', () => {
    expect(filterPeople(people, '')).toEqual(people);
  });

  it('matches names case-insensitively', () => {
    expect(filterPeople(people, 'LU')).toEqual([luke]);
  });

  it.todo('ignores leading and trailing spaces');
});
```

- `describe` groups, `it` (or `test`) declares one behaviour — name it as a sentence
- `beforeEach` / `afterEach` / `beforeAll` / `afterAll` for setup and teardown
- `it.todo`, `it.skip`, `it.only` while you work

---

# Assertions

```ts
expect(1 + 2).toBe(3);                         // ===
expect({ name: 'Luke' }).toEqual({ name: 'Luke' });   // deep equality
expect(people).toHaveLength(3);
expect(people).toContainEqual(luke);
expect(person).toMatchObject({ name: 'Luke' }); // a subset of the fields
expect(height).toBeGreaterThan(150);
expect(value).toBeUndefined();
expect(() => parse('')).toThrow('empty input');
await expect(fetchPerson('404')).rejects.toThrow();
```

- `toBe` for primitives, `toEqual` for objects and arrays
- One test = **one reason to fail**: several `expect`s are fine if they check the
  same behaviour

---

# Mocks: `vi.fn`

```ts
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

it('notifies the parent when the user likes a person', async () => {
  const onLike = vi.fn();
  render(<LikeButton personId="1" onLike={onLike} />);

  await userEvent.click(screen.getByRole('button', { name: 'Like' }));

  expect(onLike).toHaveBeenCalledExactlyOnceWith('1');
});

const fetcher = vi.fn<(id: string) => Promise<Person>>()
  .mockResolvedValue(luke);              // a typed fake
```

- `vi.fn()` creates a function that **records** its calls
- `mockReturnValue`, `mockResolvedValue`, `mockImplementation` give it a behaviour
- Pass fakes as **props or parameters**: do not mock the modules you own

---

# Spies and the `using` keyword

```ts
it('logs an error when the height is not a number', () => {
  using error = vi.spyOn(console, 'error').mockImplementation(() => {});

  formatHeight(Number.NaN);

  expect(error).toHaveBeenCalledOnce();
});   // ← mockRestore() called automatically here

it('picks a random quote', () => {
  using _random = vi.spyOn(Math, 'random').mockReturnValue(0);

  expect(randomQuote()).toBe('May the Force be with you');
});
```

- `vi.spyOn(object, 'method')` wraps a **real** method — and can replace it
- `using` (Explicit Resource Management) restores it at the end of the scope: no
  `let spy` + `afterEach(() => spy.mockRestore())`
- Prefix with `_` when the spy is never read; needs TypeScript >= 5.2, Vitest >= 3

---

# Fake timers

```ts
import { act } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it('hides the toast after 3 seconds', () => {
  render(<Toast message="Saved" />);
  expect(screen.getByRole('status')).toHaveTextContent('Saved');

  act(() => vi.advanceTimersByTime(3000));

  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
```

- `setTimeout`, `setInterval` and `Date` are under your control: no real waiting
- `vi.advanceTimersByTimeAsync` also flushes the promises resolved by the timers
- `act()` (from `react`) flushes the React updates the timer triggered
- With `user-event`: `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`

---

# Snapshot testing

```tsx
it('renders the people table', () => {
  const { asFragment } = render(<PeopleTable people={[luke, leia]} />);
  expect(asFragment()).toMatchSnapshot();
});

it('formats a person', () => {
  expect(formatPerson(luke)).toMatchInlineSnapshot(`"Luke Skywalker (172 cm)"`);
});
```

- The first run **writes** the snapshot (in `__snapshots__/`, committed); next runs
  **compare** — `npx vitest -u` updates them
- Good for small, stable outputs; a 300-line HTML snapshot is reviewed by nobody
- `react-test-renderer` is **deprecated** since React 19: snapshot the DOM instead

---

# Testing Library

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('<PeopleTable />', () => {
  it('shows one row per person', () => {
    render(<PeopleTable people={[luke, leia]} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);   // header + 2
    expect(screen.getByRole('cell', { name: 'Luke Skywalker' })).toBeVisible();
  });

  it('shows an empty state without people', () => {
    render(<PeopleTable people={[]} />);
    expect(screen.getByText('No one found')).toBeInTheDocument();
  });
});
```

- Renders into jsdom, then queries the DOM **like a user**: no access to state or props
- *"The more your tests resemble the way your software is used, the more confidence
  they can give you."*

---

# Queries

| Variant | No match | Several matches | Async |
|---|---|---|---|
| `getBy…` | throws | throws | no |
| `queryBy…` | `null` | throws | no |
| `findBy…` | rejects | rejects | **yes**, retries until it appears |
| `getAllBy…` / `queryAllBy…` / `findAllBy…` | — | an array | — |

<br />

Pick the query in this order of priority:

1. `getByRole('button', { name: 'Save' })` — what assistive technologies see
2. `getByLabelText('Name')` — form fields
3. `getByPlaceholderText`, `getByText`, `getByDisplayValue`
4. `getByTestId` — last resort

- `queryBy` to assert that something is **absent**, `findBy` for what appears **later**

---

# Interacting with `user-event`

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('filters the table as the user types', async () => {
  const user = userEvent.setup();
  render(<PeopleSearch people={[luke, leia]} />);

  await user.type(screen.getByLabelText('Filter'), 'lei');

  expect(screen.getByRole('cell', { name: 'Leia Organa' })).toBeInTheDocument();
  expect(screen.queryByRole('cell', { name: 'Luke Skywalker' })).not.toBeInTheDocument();
});
```

- `user-event` simulates **real interactions**: focus, keydown, input, keyup, click…
  — `fireEvent` only dispatches one event
- Every call returns a promise: **always `await`** it
- `user.click`, `user.type`, `user.clear`, `user.selectOptions`, `user.keyboard('{Enter}')`

---

# jest-dom matchers

```ts
expect(button).toBeDisabled();
expect(input).toHaveValue('Luke');
expect(input).toHaveFocus();
expect(checkbox).toBeChecked();
expect(row).toHaveTextContent('Skywalker');
expect(badge).toHaveClass('active');
expect(link).toHaveAttribute('href', '/people/1');
expect(dialog).toBeVisible();
expect(field).toHaveAccessibleDescription('Required');
expect(list).toBeEmptyDOMElement();
```

- Imported once in the setup file: `import '@testing-library/jest-dom/vitest'`
- Failure messages show the **DOM**, not just `expected true to be false`

---

# Structuring component tests

```tsx
function renderSearch(people = [luke, leia]) {
  const user = userEvent.setup();
  render(<PeopleSearch people={people} />);
  return {
    user,
    filter: screen.getByLabelText('Filter'),
    rows: () => screen.getAllByRole('row'),
  };
}

it('clears the filter with the Reset button', async () => {
  const { user, filter, rows } = renderSearch();

  await user.type(filter, 'lei');
  await user.click(screen.getByRole('button', { name: 'Reset' }));

  expect(filter).toHaveValue('');
  expect(rows()).toHaveLength(3);
});
```

- A small **render helper** keeps each test focused on its scenario
- Arrange → Act → Assert, separated by a blank line

---

# Recap

- Many **unit** tests, a solid layer of **component** tests, a few **e2e** tests
- Vitest + jsdom + Testing Library + jest-dom, wired in `vitest.config.ts` and a
  setup file
- `toBe` for primitives, `toEqual` for objects, jest-dom matchers for the DOM
- `vi.fn()` for fakes passed as props, `using spy = vi.spyOn(…)` for real methods
- Fake timers: `vi.useFakeTimers()`, `advanceTimersByTime`, `useRealTimers()` after
- Query **by role** first; `getBy` present, `queryBy` absent, `findBy` later
- `userEvent.setup()`, then **`await`** every interaction

---

# Quiz — Question 1 / 3

**How do you assert that the "Delete" button is NOT rendered?**

- **A.** `expect(screen.getByRole('button', { name: 'Delete' })).toBeNull()`
- **B.** `expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()`
- **C.** `await screen.findByRole('button', { name: 'Delete' })`
- **D.** `expect(screen.getByTestId('delete')).toBeFalsy()`

<v-click>

> ✅ **B** — `getBy…` **throws** when nothing matches, so the assertion never runs.
> `queryBy…` returns `null`, which is exactly what you want to check for an absence.

</v-click>

---

# Quiz — Question 2 / 3

**Why declare a spy with `using error = vi.spyOn(console, 'error')`?**

- **A.** It makes the spy faster
- **B.** The spy is restored automatically at the end of the block
- **C.** It is required by Testing Library
- **D.** It silences TypeScript errors

<v-click>

> ✅ **B** — `using` calls the spy's `[Symbol.dispose]()`, which runs `mockRestore()`
> when the scope ends — even if the test throws. No `afterEach` to forget, no spy
> leaking into the next test.

</v-click>

---

# Quiz — Question 3 / 3

**A test types into an input with `user.type(…)` but the assertion right after
sees an empty value. The most likely cause?**

- **A.** jsdom does not support inputs
- **B.** The `user.type(…)` call is not awaited
- **C.** `getByLabelText` returns a copy of the element
- **D.** The component needs `StrictMode`

<v-click>

> ✅ **B** — Every `user-event` interaction is asynchronous. Without `await`, the
> assertion runs before the keystrokes are dispatched.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 3 - Unit testing with Vitest and Testing Library
