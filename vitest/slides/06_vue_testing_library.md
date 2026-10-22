---
layout: cover
---

# 6 - Vue Testing Library

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** why a component test should look for what the user sees, not for
  how the component is built
- **Configure** Vitest for Vue components: the Vue plugin, jsdom, jest-dom
- **Render** a component with props, slots and plugins
- **Query** it by role, label and text — and pick between `getBy`, `queryBy` and `findBy`
- **Interact** with it through `user-event`, and **assert** on its emitted events

---

# The philosophy

> The more your tests resemble the way your software is used, the more
> confidence they can give you. — Kent C. Dodds

- The user sees **text, labels, buttons** — not `ref`s, not `data`, not CSS classes
- Query the DOM the way they find things: **by role and accessible name**
- Interact the way they do: **click, type, tab**
- A refactor that keeps the screen identical keeps the tests **green**
- Bonus: a component you cannot query by role is often an **accessibility** bug

---

# Install

```bash
npm install -D @testing-library/vue @testing-library/user-event \
  @testing-library/jest-dom @vitejs/plugin-vue jsdom
```

| Package | Role |
|---|---|
| `@testing-library/vue` | `render`, `screen`, the queries — on top of `@vue/test-utils` |
| `@testing-library/user-event` | realistic interactions: typing, clicking, keyboard |
| `@testing-library/jest-dom` | DOM matchers: `toBeInTheDocument`, `toHaveValue`… |
| `@vitejs/plugin-vue` | compiles the `.vue` files, as in the app |
| `jsdom` | a DOM in Node.js |

---

# Configure

```ts
// vitest.config.ts
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
});
```

```ts
// tests/setup.ts
import '@testing-library/jest-dom/vitest';
```

- `jest-dom/vitest` extends Vitest's `expect` **and** its types
- Testing Library **unmounts** after each test on its own when `globals: true`;
  without globals, add `afterEach(cleanup)` to the setup file

---

# `render` and `screen`

```ts
import { render, screen } from '@testing-library/vue';
import BookCard from './BookCard.vue';

it('shows the title and the price', () => {
  render(BookCard, {
    props: { book: { isbn: '9780132350884', title: 'Clean Code', priceInCents: 3500 } },
  });

  expect(screen.getByRole('heading', { name: 'Clean Code' })).toBeInTheDocument();
  expect(screen.getByText('€35.00')).toBeVisible();
});
```

- `render` mounts the component into `document.body`
- `screen` queries the whole document — no destructuring to keep in sync
- Props, slots, `global` plugins: the options of `@vue/test-utils`'s `mount`

---

# Slots and plugins

```ts
render(Modal, {
  props: { open: true },
  slots: {
    default: '<p>Remove Clean Code from the cart?</p>',
    footer: '<button>Confirm</button>',
  },
});

render(CartPage, {
  global: {
    plugins: [createTestingPinia(), router],
    stubs: { BookCover: true },          // a heavy child, replaced by a stub
    provide: { currency: 'EUR' },
  },
});
```

- `global.plugins`: Pinia, the router, i18n — what `app.use()` installs in the app
- Stub only what is **heavy or external**: a chart, a map, a video player

---

# The queries — in order of preference

| Priority | Query | Finds |
|---|---|---|
| 1 | **`getByRole`** | `button`, `heading`, `textbox`, `checkbox`, `link`… + its accessible **name** |
| 2 | `getByLabelText` | a form field by its `<label>` |
| 3 | `getByPlaceholderText` | when there is no label (there should be) |
| 4 | `getByText` | non-interactive text: a paragraph, a price |
| 5 | `getByDisplayValue` | a field by its current value |
| 6 | `getByAltText`, `getByTitle` | images, titles |
| last | `getByTestId` | `data-testid` — when nothing a user sees identifies it |

```ts
screen.getByRole('button', { name: /add to cart/i });
screen.getByRole('textbox', { name: 'Coupon code' });
screen.getByRole('heading', { level: 2, name: 'Your cart' });
```

---

# `getBy`, `queryBy`, `findBy`

| | Nothing found | Several found | Async |
|---|---|---|---|
| **`getBy…`** | throws | throws | no |
| **`queryBy…`** | returns `null` | throws | no |
| **`findBy…`** | rejects (after 1 s) | rejects | **yes** — retries |
| `getAllBy…` / `queryAllBy…` / `findAllBy…` | — | an array | |

```ts
expect(screen.getByRole('button', { name: 'Checkout' })).toBeEnabled();      // must be there
expect(screen.queryByRole('alert')).not.toBeInTheDocument();                  // must NOT be there
expect(await screen.findByText('Order confirmed')).toBeInTheDocument();       // will appear
```

- `queryBy` **only** to assert absence
- `findBy` for what appears **later**: after a fetch, a timer, a transition

---

# `user-event`

```ts
import userEvent from '@testing-library/user-event';

it('applies a coupon', async () => {
  const user = userEvent.setup();
  render(CartSummary, { props: { totalInCents: 5000 } });

  await user.type(screen.getByRole('textbox', { name: 'Coupon code' }), 'SAVE10');
  await user.click(screen.getByRole('button', { name: 'Apply' }));

  expect(screen.getByText('Total: €45.00')).toBeInTheDocument();
});
```

- `userEvent.setup()` **before** `render`, then `await` every interaction
- `type` fires `keydown`, `input`, `keyup` for each key, as a browser does;
  `fireEvent.update` fires one event and skips the rest
- A disabled button does not react to `user.click` — as for a real user

---

# `user-event` — more interactions

```ts
const user = userEvent.setup();

await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'price');
await user.click(screen.getByRole('checkbox', { name: 'Gift wrap' }));
await user.clear(screen.getByRole('textbox', { name: 'Coupon code' }));
await user.keyboard('{Enter}');
await user.tab();                                     // focus moves to the next field
await user.hover(screen.getByRole('img', { name: 'Clean Code' }));
await user.upload(screen.getByLabelText('Cover'), new File(['…'], 'cover.png', { type: 'image/png' }));
```

- With fake timers: `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`

---

# Emitted events

```ts
it('emits remove with the ISBN', async () => {
  const user = userEvent.setup();
  const { emitted } = render(CartLine, {
    props: { line: { isbn: '9780132350884', title: 'Clean Code', quantity: 2 } },
  });

  await user.click(screen.getByRole('button', { name: 'Remove Clean Code' }));

  expect(emitted('remove')).toEqual([['9780132350884']]);
});
```

- `emitted(name)`: one entry per emit, each an array of its arguments
- Or pass a handler as a prop — `props: { onRemove: vi.fn() }` — and assert on it
- The **contract** of a component is its rendering **and** its events

---

# Async rendering

```ts
it('loads the catalogue', async () => {
  vi.mocked(fetchBooks).mockResolvedValue([cleanCode, refactoring]);
  render(Catalogue);

  expect(screen.getByText('Loading…')).toBeInTheDocument();
  expect(await screen.findAllByRole('article')).toHaveLength(2);
  expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
});
```

- Vue updates the DOM **asynchronously**: `await` the interaction, or `findBy`
- `waitFor(() => expect(…))` retries any assertion until it passes or times out
- `waitForElementToBeRemoved` for what must **go**

---

# `debug` and Testing Playground

```ts
render(CartPage);

screen.debug();                                    // the whole DOM, pretty-printed
screen.debug(screen.getByRole('list'));            // one element
screen.logTestingPlaygroundURL();                  // a link to testing-playground.com
```

- `debug` prints the DOM **as the test sees it** — the first reflex when a query fails
- **Testing Playground** (https://testing-playground.com) suggests the best
  query for each element
- The error of a failing `getByRole` already lists the **roles** available

---

# Recap

- Test what the user **sees and does**, not how the component is built
- `plugins: [vue()]`, `environment: 'jsdom'`, `@testing-library/jest-dom/vitest`
- `render` with `props`, `slots`, `global.plugins`; query with **`screen`**
- **`getByRole`** first, `getByTestId` last
- `getBy` must exist, `queryBy` to assert absence, `findBy` to wait
- `userEvent.setup()` and `await` every interaction; `emitted()` for events

---

# Quiz — Question 1 / 3

**You want to check that no error message is shown. Which query?**

- **A.** `expect(screen.getByRole('alert')).toBeNull()`
- **B.** `expect(screen.queryByRole('alert')).not.toBeInTheDocument()`
- **C.** `expect(await screen.findByRole('alert')).toBeFalsy()`
- **D.** `expect(screen.getAllByRole('alert')).toHaveLength(0)`

<v-click>

> ✅ **B** — `getBy…` and `getAllBy…` **throw** when nothing is found, before
> `expect` even runs; `findBy…` rejects. `queryBy…` returns `null`: the one made
> for absence.

</v-click>

---

# Quiz — Question 2 / 3

**A list is rendered after a `fetch`. `screen.getAllByRole('article')` fails
right after `render`. The fix?**

- **A.** `await nextTick()` once
- **B.** `await screen.findAllByRole('article')`
- **C.** Add a `setTimeout` of 1 s
- **D.** Use `getAllByTestId`

<v-click>

> ✅ **B** — `findBy…` retries until the elements appear (1 s by default). One
> `nextTick` (**A**) does not wait for a promise you do not control, and a fixed
> delay (**C**) is slow and flaky.

</v-click>

---

# Quiz — Question 3 / 3

**Which query is the most robust to find the "Add to cart" button?**

- **A.** `container.querySelector('.btn-primary')`
- **B.** `screen.getByTestId('add-to-cart')`
- **C.** `screen.getByRole('button', { name: 'Add to cart' })`
- **D.** `screen.getByText('Add to cart')`

<v-click>

> ✅ **C** — It finds the element as a user (and a screen reader) does: a
> **button** named "Add to cart". A CSS class changes with the design; a test id
> is invisible to users; `getByText` would also match a paragraph.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 6 - Vue Testing Library
