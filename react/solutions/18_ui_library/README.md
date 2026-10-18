# TP 18 — Integrating a UI library: Material UI

> This TP is **autonomous**: it does not depend on any other TP. The page — a
> header, a title and the people table — is provided and working, styled by
> hand with one CSS file; your job is to move it to Material UI: two themes, a
> persisted dark-mode switch, MUI components, `styled` and `sx`.

## Goal

Chapter 18 — Integrate a component library into an existing React app:

- **Themes**: `createTheme` for a light and a dark palette, and what MUI derives from `mode`
- **`ThemeProvider` + `CssBaseline`**: one prop switches the whole page
- **A `ThemeSwitcher`** whose choice survives a reload (`localStorage`), and which follows
  the operating system until the user chooses
- **MUI components**: `AppBar`, `Container`, `Table` with sortable columns (`TableSortLabel`)
- **Styling the MUI way**: `styled()` for a reusable component, `sx` for one-off styles

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- `@mui/material`, `@mui/icons-material`, `@emotion/react` and `@emotion/styled` are
  already in `package.json` — MUI 9 uses Emotion as its default style engine.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

The specs are already written:

| Spec | Grades |
|---|---|
| `src/theme/themes.spec.ts` | step 1 — the two themes |
| `src/theme/useThemeMode.spec.ts` | step 2 — the mode, its toggle, its persistence |
| `src/App.spec.tsx` | step 2 — the switch repaints the page, and survives a reload |
| `src/components/PeopleTable.spec.tsx` | step 3 — the MUI table and its sorting |
| `src/components/Title.spec.tsx` | step 4 — the styled title follows the theme |

They are red on the starter. They read the page as a user would — roles, names,
`aria-sort`, and the **computed** colours (Emotion injects real `<style>` tags, which
jsdom applies) — so they do not care which MUI component you pick, only that it behaves.

**Already done for you:**

- `src/data/people.ts` — six people.
- `src/App.tsx`, `src/components/*` — the page, in plain HTML + `src/style.css`.
- `ThemeSwitcher` — its accessible label ("Switch to dark mode") already follows the
  `mode` prop.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Write the light and the dark theme | `src/theme/themes.ts` | `themes.spec.ts` is green |
| 2 | The mode hook, `ThemeProvider` + `CssBaseline`, an MUI switcher | `src/theme/useThemeMode.ts`, `src/App.tsx`, `src/components/ThemeSwitcher.tsx` | The switch repaints the page and survives a reload |
| 3 | The layout and the table with MUI, sortable | `src/App.tsx`, `src/components/PeopleTable.tsx` | Clicking "Height" sorts, and `aria-sort` says so |
| 4 | A title built with `styled` | `src/components/Title.tsx` | Its colour is the theme's primary, in both modes |

## Steps

### 1. Two themes — `src/theme/themes.ts`

1. Write the part both themes share — `typography` and `shape` — as a plain object.
2. `lightTheme = createTheme({ ...shared, palette: { mode: 'light', primary, background } })`
   with the values of the TODO.
3. The same for `darkTheme`, with `mode: 'dark'`.

Look at `darkTheme.palette.text.primary` in the debugger or a `console.log`: you never
set it. What else does `mode` decide for you?

→ **Done when** `src/theme/themes.spec.ts` is green.

### 2. Switching themes — `src/theme/useThemeMode.ts`, `src/App.tsx`, `src/components/ThemeSwitcher.tsx`

1. In `useThemeMode`, keep the user's choice in a state initialised **lazily** —
   `useState(readStoredMode)`, not `useState(readStoredMode())` — from
   `localStorage`, accepting only `'light'` and `'dark'`.
2. With no choice yet, let `useMediaQuery('(prefers-color-scheme: dark)')` decide.
3. The toggle flips the mode, stores it in state **and** in `localStorage` — inside a
   `try/catch`: a private window may refuse storage, and the switch must still work.
4. In `App`, wrap the page in `<ThemeProvider theme={themes[mode]}>` with a
   `<CssBaseline />` first. Delete `src/style.css` and its import in `main.tsx`.
5. Make `ThemeSwitcher` an MUI `IconButton` with `LightModeIcon` / `DarkModeIcon`,
   inside a `Tooltip` showing the label. Keep the `aria-label`: an icon is not a name.

Reload the page in dark mode: does it flash light first? Why not — and when would it
(think server rendering)?

**Why by hand, when MUI has `useColorScheme`?** MUI 9 can do all of step 2 itself:
`createTheme({ colorSchemes: { light: {…}, dark: {…} }, cssVariables: true })`, one
`ThemeProvider`, and `const { mode, setMode } = useColorScheme()` (from
`@mui/material/styles`) — `setMode` already persists to `localStorage` and follows the
OS with `'system'`. That is what to use in a real app (see "Going further"). Here you
write it once by hand to see what it does for you: a lazy state, a media query, storage
that may fail. The other difference is the CSS: with `cssVariables`, the theme becomes
`var(--mui-palette-…)` custom properties and switching the mode changes no component's
class — the trade-off that removes the flash on a server-rendered page.

→ **Done when** `useThemeMode.spec.ts` and `App.spec.tsx` are green.

### 3. MUI components — `src/App.tsx`, `src/components/PeopleTable.tsx`

1. In `App`: the header becomes an `AppBar` > `Toolbar`, with the brand in a
   `Typography` whose `sx` makes it grow; `<main>` becomes a `Container`.
2. Rebuild `PeopleTable` with `TableContainer component={Paper}`, `Table`,
   `TableHead`, `TableBody`, `TableRow` and `TableCell`. Keep the name as the row's
   header (`component="th" scope="row"`), align numbers right.
3. Make Name, Height and Mass sortable: a `{ key, direction }` state, a
   `TableSortLabel` in each of their headers, and `sortDirection` on the header cell —
   it is what sets `aria-sort`. Sort a copy with `toSorted`, during render: the sorted
   list is **derived**, not a second state.

Switch to dark mode: the table's paper, its dividers and its hover colour follow, with
no CSS from you. What does `component={Paper}` do, exactly?

→ **Done when** `PeopleTable.spec.tsx` is green.

### 4. `styled` — `src/components/Title.tsx`

1. `const StyledTitle = styled('h1')(({ theme }) => ({ ...theme.typography.h1, color:
   theme.palette.primary.main, marginTop: 0, marginBottom: theme.spacing(3) }))`.
2. Render `<StyledTitle>{children}</StyledTitle>`.

When would you write `sx` instead, and when a theme override
(`components.MuiTypography.styleOverrides`) instead of both?

→ **Done when** `npm test` is entirely green.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the themes, the mode hook, the switch, the table, the title
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing, and `src/style.css` is gone
- [ ] No MUI or React warning in the browser console

**The behaviour is there**

- [ ] The switch turns the whole page dark — background, app bar, table, title — and back
- [ ] The choice survives a reload; with no choice, the page follows the OS setting
- [ ] Clicking a column header sorts by it; clicking again flips the order; `aria-sort`
      is on the sorted column only
- [ ] The switch has an accessible name and a tooltip

**You can explain**

- [ ] What `createTheme` fills in, and what `mode: 'dark'` changes by itself
- [ ] What `CssBaseline` does to `<body>`
- [ ] `styled` vs `sx` vs a theme's `styleOverrides`: which one for which need
- [ ] Why the sorted rows are computed during render instead of kept in state

## Going further

- Replace the two themes and `useThemeMode` with MUI's own **colour schemes**:
  `createTheme({ colorSchemes: { light: {...}, dark: {...} }, cssVariables: true })` and
  `useColorScheme()`. It persists the mode itself, and with the
  `InitColorSchemeScript` it never flashes the wrong theme — compare the generated CSS.
- Add a theme override so that every `TableCell` of the head is bold, and remove any
  bold you wrote by hand.
- Add a search `TextField` above the table and a `Chip` with the number of results.
- Measure: `npx vite-bundle-visualizer` — how much of the bundle is MUI, and does
  importing `@mui/material/Table` instead of `{ Table } from '@mui/material'` change it
  with Vite?
