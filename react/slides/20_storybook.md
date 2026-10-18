---
layout: cover
---

# 20 - Storybook

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** what developing components in isolation brings to a team
- **Install** Storybook 10 in a Vite + React project, and **read** its configuration
- **Write** stories in CSF3 with `Meta`, `StoryObj`, `args` and `argTypes`
- **Document** components with autodocs and **check** them with the a11y addon
- **Script** an interaction with a `play` function
- **Reuse** stories as tests in Vitest with portable stories (`composeStories`)

---

# What is Storybook?

- A **workshop** for UI components: each component rendered **in isolation**,
  outside the app, in every state it can be in
- A **story** = one state of a component: `Primary`, `Disabled`, `Loading`,
  `Empty`, `WithError`…
- No need to click through the app to reach a state — no login, no API, no data setup
- A living **catalogue** for developers, designers and product people
- A **test** surface: interactions, accessibility, visual regressions

<br />

<div style="display: flex; gap: 2em;">
<div>

### Without Storybook

"To see the error state of the table, log in, stop the API, reload the page…"

</div>
<div>

### With Storybook

`PeopleTable` › `WithError` — one click, shareable URL, reviewed in the PR

</div>
</div>

---

# Installation

```bash
npm create storybook@latest
```

- Detects **React + Vite**, installs `storybook` and `@storybook/react-vite`,
  adds the scripts and a `.storybook/` folder

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

- `storybook dev` — the UI on `http://localhost:6006`, with hot reload
- `storybook build` — a **static site** (`storybook-static/`) to deploy (Netlify,
  Chromatic, GitHub Pages)
- Storybook 10 is **ESM-only** (recent Node.js required), and reuses your
  **`vite.config.ts`** — aliases, plugins, CSS Modules, Sass work as in the app

---

# Configuration

```ts
// .storybook/main.ts
import { defineMain } from '@storybook/react-vite/node';

export default defineMain({
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
});
```

```tsx
// .storybook/preview.tsx
import type { Preview } from '@storybook/react-vite';
import '../src/index.css';

const preview: Preview = {
  parameters: { controls: { expanded: true } },
  decorators: [(Story) => <main style={{ padding: 16 }}><Story /></main>],
};
export default preview;
```

- **`main.ts`** — where the stories are, which framework, which addons (Node side)
- **`preview.tsx`** — what wraps **every** story (global CSS, providers), in the browser
- Controls, actions, viewport, backgrounds are **built in** since Storybook 9

---

# A first story — CSF3

```tsx
// src/components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',            // optional: inferred from the file path
  component: Button,
  args: { children: 'Like', onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Disabled: Story = { args: { disabled: true } };
```

- **Component Story Format**: the **default export** describes the component, each
  **named export** is a story
- A story is mostly **data** (`args`) — no render function needed
- `satisfies Meta<…>` keeps the precise type of `meta`, so `StoryObj` knows which
  args are already provided
- `fn()` — a spy: the call appears in the **Actions** panel, and can be asserted

---

# Args and controls

```tsx
const meta = {
  component: Input,
  args: { label: 'Search', placeholder: 'Luke…', onChange: fn() },
  argTypes: {
    size: { control: 'inline-radio', options: ['small', 'medium'] },
  },
} satisfies Meta<typeof Input>;

export const WithError: Story = {
  args: { error: 'Name is required' },
};
```

- **Args** are the component's props, editable live in the **Controls** panel
- Storybook infers controls from the **TypeScript props**: a union becomes a
  select, a boolean a toggle
- **`argTypes`** refines them: the control kind, the options, hidden props
- Args merge: global (`preview`) → component (`meta`) → story

---

# Stories with data and providers

```tsx
// src/components/PeopleTable.stories.tsx
const meta = {
  component: PeopleTable,
  args: { people },
} satisfies Meta<typeof PeopleTable>;

export const Default: Story = {};
export const Empty: Story = { args: { people: [] } };
export const OnePerson: Story = { args: { people: people.slice(0, 1) } };

export const WithRouter: Story = {
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
};
```

- Pass **data as args**: the component stays dumb, the story chooses the state
- **Decorators** wrap a story — a router, a `QueryClientProvider`, a theme
- A container that fetches? Mock the network with **MSW** (`msw-storybook-addon`),
  or story the **presentational** component instead
- `parameters: { layout: 'centered' | 'fullscreen' | 'padded' }` per story or per file

---

# Docs and accessibility

```tsx
const meta = {
  component: Button,
  tags: ['autodocs'],                  // generate a documentation page
  parameters: {
    docs: { description: { component: 'The main call to action.' } },
  },
} satisfies Meta<typeof Button>;
```

- **Autodocs** (`@storybook/addon-docs`) builds a page per component: every story,
  the props table from the TypeScript types and JSDoc comments, live controls
- `.mdx` files for hand-written docs mixing Markdown and stories
- **`@storybook/addon-a11y`** runs **axe** on each story: contrast, labels, roles —
  violations listed in the **Accessibility** panel
- `parameters: { a11y: { test: 'error' } }` makes them **fail** the story's test

---

# Interactions — the `play` function

```tsx
import { expect } from 'storybook/test';

export const FilterByName: Story = {
  args: { people },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Search'), 'sky');

    await expect(canvas.getAllByRole('row')).toHaveLength(2);
  },
};

export const ClickCallsOnClick: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Like' }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
```

- Runs **after** the story renders, in the browser — step by step in the
  **Interactions** panel, with rewind
- `canvas` — Testing Library queries scoped to the story; `userEvent` — set up for you
- The same queries and matchers as your Vitest specs

---

# Stories as tests — the Vitest addon

```bash
npx storybook add @storybook/addon-vitest
```

- Turns **every story** into a test: it renders without error, its `play`
  function passes, its a11y checks pass
- Runs in **Vitest browser mode** (Playwright, Chromium) — a real browser
- From the Storybook UI (the **Run tests** button, with coverage), or the CLI:

```bash
npx vitest --project=storybook
```

- A story without `play` is still a **smoke test**: "this state renders"
- In CI: `vitest run --project=storybook`, next to the unit tests

---

# Portable stories in your own specs

```tsx
// src/components/Button.spec.tsx
import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import * as stories from './Button.stories';

const { Primary, Disabled } = composeStories(stories);

it('renders the primary button with its label', () => {
  render(<Primary />);
  expect(screen.getByRole('button', { name: 'Like' })).toBeInTheDocument();
});

it('cannot be clicked when disabled', () => {
  render(<Disabled />);
  expect(screen.getByRole('button', { name: 'Like' })).toBeDisabled();
});
```

- **`composeStories`** turns stories into components — args, decorators and
  `preview` annotations applied
- Runs in **jsdom** with Testing Library: no browser needed
- `await Primary.run()` renders the story **and** runs its `play` function
- Global annotations: `setProjectAnnotations(previewAnnotations)` in the Vitest setup file

---

# Good practices

- **One story per meaningful state**, named after the state (`Empty`, `Loading`),
  not after the props (`PeopleIsEmptyArray`)
- Story **presentational** components; give containers their data through
  args, decorators or MSW
- Keep stories **next to the component** (`Button.tsx`, `Button.stories.tsx`,
  `Button.spec.tsx`)
- Put providers (theme, router, query client) in **`preview` decorators** once
- Make the a11y checks **fail** in CI rather than just warn
- Deploy the built Storybook on every PR: reviewers **see** the change
- Visual regression testing: **Chromatic** (by the Storybook team) or the Vitest
  browser mode `toMatchScreenshot`

---

# Recap

- Storybook renders components **in isolation**, one **story** per state
- `npm create storybook@latest`; `.storybook/main.ts` (stories, framework, addons)
  and `preview.tsx` (global decorators and parameters)
- **CSF3**: `meta` (default export, `satisfies Meta<typeof C>`) + named
  `StoryObj` exports, mostly **`args`**
- **Controls** from TypeScript props, refined with `argTypes`; `fn()` for callbacks
- **Autodocs** and the **a11y** addon document and check every story
- **`play`** scripts an interaction with `canvas` + `userEvent` + `expect`
- Stories **are** tests: `@storybook/addon-vitest` in a browser, or
  `composeStories` in your own specs

---

# Quiz — Question 1 / 3

```tsx
const meta = { component: Button, args: { children: 'Like' } } satisfies Meta<typeof Button>;
export default meta;
export const Disabled: StoryObj<typeof meta> = { args: { disabled: true } };
```

**What does the `Disabled` story render?**

- **A.** A disabled button with no label — story args replace the meta args
- **B.** A disabled button labelled "Like" — story args are merged over the meta args
- **C.** Nothing — a story needs a `render` function
- **D.** A type error: `children` is missing from the story

<v-click>

> ✅ **B** — Args are merged from `preview` to `meta` to the story. With no
> `render`, Storybook renders `<Button {...args} />`. And `satisfies` lets
> `StoryObj<typeof meta>` know `children` is already provided.

</v-click>

---

# Quiz — Question 2 / 3

**Where do you add a `QueryClientProvider` that every story needs?**

- **A.** In each component, around its JSX
- **B.** In `.storybook/main.ts`, in `addons`
- **C.** As a **decorator** in `.storybook/preview.tsx`
- **D.** In `vite.config.ts`

<v-click>

> ✅ **C** — `preview.tsx` runs in the browser and wraps every story with its
> `decorators`. `main.ts` is Node-side configuration: which files, which
> framework, which addons.

</v-click>

---

# Quiz — Question 3 / 3

**What does `composeStories(stories)` give you in a Vitest spec?**

- **A.** A snapshot of every story
- **B.** React components for each story, with its args, decorators and global
  annotations applied — renderable with Testing Library
- **C.** A running Storybook server
- **D.** The list of story names, as strings

<v-click>

> ✅ **B** — Portable stories reuse the exact states you designed in Storybook
> as test fixtures: `render(<Disabled />)`, or `await Disabled.run()` to also
> execute its `play` function.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 20 - Documenting components with Storybook
