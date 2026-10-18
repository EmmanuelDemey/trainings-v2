# TP 20 — Documenting components with Storybook

> This TP is **autonomous**: it does not depend on any other TP. The `Button`,
> `Input` and `PeopleTable` components are provided and working, and Storybook 10
> is installed; your job is to configure it, write the stories, and let the same
> stories run as Vitest specs.

## Goal

Chapter 20 — Develop and document UI components in isolation:

- **Storybook 10 with Vite**: `.storybook/main.ts`, `.storybook/preview.ts`, the `storybook` scripts
- **CSF3 stories**: a `meta` default export, one object per story, `satisfies Meta<typeof Component>`
- **Args and controls**: shared args in the meta, per-story overrides, `argTypes`
- **Actions** with `fn()` from `storybook/test`
- **Portable stories**: `composeStories` renders the very same stories in Vitest
- *(Bonus)* An interaction test in a `play` function

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 6 (components & props) and chapter 3 (Testing Library)

## Setup

```bash
npm install
npm run dev          # the app, http://localhost:5173
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

From step 1 on, you also get:

```bash
npm run storybook        # http://localhost:6006
npm run build-storybook  # the static site, in storybook-static/
```

Four spec files grade this TP, and they are red on the starter:

- **`src/storybook-setup.spec.ts`** — the scripts in `package.json`, and what
  `.storybook/main.ts` declares.
- **`src/components/*/*.spec.tsx`** — one per component. They do not render the
  components: they import **your stories** with `composeStories` and render
  those. An empty story fails; a story with the wrong args fails. That is the
  whole point of portable stories: the stories you look at **are** the tests.

**Already done for you:**

- `src/components/Button`, `Input`, `PeopleTable` — the three components, with
  their CSS. `Input` links its error message with `aria-describedby`;
  `PeopleTable` has a loading and an empty state.
- `storybook`, `@storybook/react-vite` and `@storybook/addon-docs` are in the
  `devDependencies` — the result of `npm create storybook@latest`, minus the
  example stories it generates.
- `.storybook/main.ts` already names the framework, `@storybook/react-vite`: it
  reuses **this** project's `vite.config.ts`.
- `src/tests/setup.ts` calls `setProjectAnnotations` with your
  `.storybook/preview.ts`, so a composed story gets the same global parameters
  and decorators in Vitest as on screen.
- Each `*.stories.tsx` file exists, with an empty meta and empty stories, so
  that the specs compile.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Scripts, stories glob, docs addon, preview | `package.json` + `.storybook/` | `npm run storybook` opens on your components |
| 2 | The `Button` meta and its five stories | `src/components/Button/Button.stories.tsx` | `Button.spec.tsx` is green; the Actions panel logs clicks |
| 3 | The `Input` stories, and the required `label` | `src/components/Input/Input.stories.tsx` | `Input.spec.tsx` is green |
| 4 | The `PeopleTable` stories, with data and an action | `src/components/PeopleTable/PeopleTable.stories.tsx` | `PeopleTable.spec.tsx` is green |
| 5 | *(Bonus)* An interaction test in `play` | `PeopleTable.stories.tsx` | The Interactions panel shows it passing |

## Steps

### 1. Set Storybook up — `package.json` + `.storybook/`

1. **TODO 1.1** — add two scripts to `package.json`:
   `"storybook": "storybook dev -p 6006"` and `"build-storybook": "storybook build"`.
2. **TODO 1.2** — in `.storybook/main.ts`, set `stories` to
   `['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)']`. The paths are relative
   to `.storybook/`.
3. **TODO 1.3** — set `addons` to `['@storybook/addon-docs']`. Controls,
   actions, viewport and backgrounds are part of Storybook 10 itself: no
   `addon-essentials` anymore.
4. **TODO 1.4** — in `.storybook/preview.ts`, `import '../src/styles.css'` and add
   `layout: 'centered'` to `parameters`. Everything in `preview.ts` applies to
   every story.

Run `npm run storybook`: the sidebar lists `Button`, `Input` and `PeopleTable`
(their stories are still empty).

→ **Done when** `storybook-setup.spec.ts` is green and Storybook opens.

### 2. The `Button` stories — `src/components/Button/Button.stories.tsx`

1. **TODO 2.1** — complete the meta: `title: 'UI/Button'`, `tags: ['autodocs']`,
   `args: { children: 'Save', onClick: fn() }` (`fn` comes from `'storybook/test'`)
   and `argTypes` turning `variant` into an `inline-radio` control and `size` into
   a `select`. Keep `satisfies Meta<typeof Button>`: the meta stays checked
   **and** keeps its precise type for `StoryObj<typeof meta>`.
2. **TODO 2.2** — write the stories, overriding only what differs from the meta:

   | Story | Args | Shows |
   |---|---|---|
   | `Primary` | `variant: 'primary'` | "Save" |
   | `Secondary` | `variant: 'secondary'`, `children: 'Cancel'` | "Cancel" |
   | `Danger` | `variant: 'danger'`, `children: 'Delete'` | "Delete" |
   | `Disabled` | `disabled: true` | "Save", disabled |
   | `Small` | `size: 'small'` | "Save", small |

3. In Storybook, play with the controls, click the button and watch the
   **Actions** panel. Open the **Docs** page: the props table comes from the types.

→ **Done when** `Button.spec.tsx` is green. Read it: `Primary.args.onClick` is
the very `fn()` of your meta.

### 3. The `Input` stories — `src/components/Input/Input.stories.tsx`

1. **TODO 3.1** — `label` is **required** by `Input`. Because the meta gives it,
   `StoryObj<typeof meta>` makes it optional in each story; remove it from the
   meta and watch every story become a type error. Set
   `args: { label: 'Name', placeholder: 'Luke Skywalker' }`, plus a title
   (`'UI/Input'`), the `autodocs` tag, and `argTypes` for `type` (a `select`) and
   `error` (a `text` control).
2. **TODO 3.2** — the stories:

   | Story | Args |
   |---|---|
   | `Default` | none |
   | `Filled` | `defaultValue: 'Leia Organa'` |
   | `WithError` | `error: 'Name is required'` |
   | `Disabled` | `disabled: true`, `defaultValue: 'Darth Vader'` |

   `defaultValue`, not `value`: a controlled `value` without `onChange` freezes
   the field in the canvas.

→ **Done when** `Input.spec.tsx` is green — including the accessible
description on `WithError`.

### 4. The `PeopleTable` stories — `src/components/PeopleTable/PeopleTable.stories.tsx`

1. **TODO 4.1** — the meta: `title: 'People/PeopleTable'`, `tags: ['autodocs']`,
   `args: { people, onSelect: fn() }` with `people` from `src/data/people.ts`, and
   `parameters: { layout: 'padded' }` — a story's parameters override the
   preview's.
2. **TODO 4.2** — `Default` (no override), `Empty` (`people: []`), `Loading`
   (`loading: true`).
3. Click a name in the `Default` story: the Actions panel shows the whole
   `Person` passed to `onSelect`.

→ **Done when** `PeopleTable.spec.tsx` is green and `npm run build-storybook`
succeeds.

### 5. *(Bonus)* An interaction test — `PeopleTable.stories.tsx`

Add a `SelectingAPerson` story with a `play` function:

```tsx
export const SelectingAPerson: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Leia Organa' }));
    await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Leia Organa' }));
  },
};
```

`expect`, `fn`, `userEvent` and `within` all come from `'storybook/test'`. Open
the story and the **Interactions** panel: step through it, rewind it.

→ **Done when** the Interactions panel shows the test passing.

## Definition of Done

Tick every box before moving on. Step 5 and the "Going further" section are
**not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the setup and the stories of the three components
- [ ] `npm run build` and `npm run build-storybook` succeed
- [ ] `grep -rn TODO src .storybook` returns nothing
- [ ] `npm run storybook` shows every story, and each component has a Docs page

**The behaviour is there**

- [ ] Every control in the Controls panel changes the rendered component
- [ ] Clicking a `Button` or a name in `PeopleTable` logs in the Actions panel
- [ ] `PeopleTable` has a story for each of its states: data, empty, loading

**You can explain**

- [ ] What the meta is for, compared with a story
- [ ] Why `satisfies Meta<typeof X>` + `StoryObj<typeof meta>` beats `const meta: Meta<typeof X>`
- [ ] What `composeStories` merges together, and what `setProjectAnnotations` adds
- [ ] Why a spec that renders a story is better than a spec that renders the component with the same props written twice

## Going further

- Run the `play` function in Vitest too: `await SelectingAPerson.run()` on the
  composed story renders it **and** runs its interactions.
- Add `@storybook/addon-vitest` (`npx storybook add @storybook/addon-vitest`): it
  turns every story into a test, run in a real browser through Vitest's browser
  mode, with a "Run tests" button in the Storybook UI.
- Add `@storybook/addon-a11y`, and fix what it reports on `Input`.
- Add a global decorator in `preview.ts` that wraps every story in a `<main>`
  with a light or dark theme, switched from the toolbar with `globalTypes`.
- Write a `Button.mdx` docs page with `<Meta of={ButtonStories} />`, `<Canvas>` and
  `<Controls>`.
- Publish the static Storybook (`storybook-static/`) on Netlify or GitHub Pages,
  or try Chromatic for visual regression tests.
