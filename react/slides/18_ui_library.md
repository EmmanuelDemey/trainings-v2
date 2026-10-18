---
layout: cover
---

# 18 - Integrating a UI library: Material UI

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Choose** between a styled component library and a headless one, knowing
  what each costs
- **Install** Material UI and **provide** a theme with `ThemeProvider` and
  `CssBaseline`
- **Customize** the palette, the typography and the default props of components
- **Style** a component three ways: theme overrides, the `sx` prop, `styled`
- **Add** a dark mode with `colorSchemes`, CSS variables and `useColorScheme`
- **Test** MUI components through their accessible roles

---

# Why a UI library?

- Accessible **widgets** you do not want to write again: dialog, menu, select,
  autocomplete, date picker, data grid — focus trap, keyboard, ARIA included
- A **design system** out of the box: spacing, colors, typography, breakpoints
- The trade-off: bundle size, a styling engine to learn, and a look to fight
  if your designers want something else

<br />

| Kind | Examples | You get |
|---|---|---|
| **Styled** | Material UI, Ant Design, Mantine, Chakra UI | components **and** their look |
| **Headless** | Base UI, Radix, React Aria, Headless UI | behaviour + a11y, **you** style |
| **Copy-paste** | shadcn/ui (Radix/Base UI + Tailwind) | the source code, in your repo |

<br />

- This chapter uses **Material UI v9** — the concepts (theme, provider, overrides)
  carry over to the others

---

# Installation

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material        # optional, ~2 000 icons
```

```tsx
// src/main.tsx
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
);
```

- **Emotion** is MUI's default CSS-in-JS engine (chapter 7)
- **`ThemeProvider`** puts the theme in a React context, for every component below
- **`CssBaseline`** — a normalize: margins, `box-sizing`, background and text
  colors from the theme
- Import icons one by one, by **path**, to keep dev builds fast:
  `import DeleteIcon from '@mui/icons-material/Delete'`

---

# Creating a theme

```ts
// src/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#ffe81f' },          // light / dark / contrastText are computed
    secondary: { main: '#1976d2' },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
  },
  shape: { borderRadius: 8 },
  spacing: 8,                              // theme.spacing(2) === '16px'
});
```

- `createTheme` **deep-merges** your options into the defaults
- Every value is read by the components: change `primary.main`, every `Button`,
  `Link`, `Switch`… follows
- Need a custom color (`palette.brand`)? **Augment** the `Palette` interface with
  `declare module '@mui/material/styles'`

---

# Using components

```tsx
import { Button, Stack, TextField, Typography } from '@mui/material';

export function PeopleFilter({ value, onChange }: PeopleFilterProps) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography variant="h2" component="h1">Star Wars people</Typography>
      <TextField
        label="Search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        size="small"
      />
      <Button variant="contained" onClick={() => onChange('')}>Clear</Button>
    </Stack>
  );
}
```

- `variant="h2" component="h1"`: the **look** of an `h2`, the **semantics** of an `h1`
- `TextField` renders a `<label>` tied to the `<input>` — `getByLabelText('Search')` works
- Layout primitives: `Box`, `Stack`, `Container`, `Grid` (responsive `size` prop)

---

# A table of people

```tsx
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

export function PeopleTable({ people }: { people: Person[] }) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="Star Wars people" size="small">
        <TableHead>
          <TableRow><TableCell>Name</TableCell><TableCell align="right">Height</TableCell></TableRow>
        </TableHead>
        <TableBody>
          {people.map((person) => (
            <TableRow key={person.id} hover>
              <TableCell>{person.name}</TableCell>
              <TableCell align="right">{person.height} cm</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

- Real `<table>`, `<thead>`, `<td>` underneath: `getByRole('table', { name: 'Star Wars people' })`
- `component={Paper}` — the **polymorphic** prop: render the container as a `Paper`

---

# Styling, way 1 — the `sx` prop

```tsx
<Box
  sx={{
    p: 2,                                   // padding: theme.spacing(2)
    mt: { xs: 1, md: 4 },                   // responsive values
    bgcolor: 'background.paper',            // a path into the palette
    color: 'primary.main',
    borderRadius: 1,                        // × theme.shape.borderRadius
    '&:hover': { boxShadow: 3 },            // nested selectors, theme.shadows[3]
  }}
>
  …
</Box>
```

- **One-off** styles, right where they are used, with access to the **theme**
- Shorthands (`p`, `mt`, `bgcolor`) and **theme paths** as strings
- Pass a **function** to read the theme: `sx={(theme) => ({ borderColor: theme.palette.divider })}`
- Available on **every** MUI component

---

# Styling, way 2 — `styled`

```tsx
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

export const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: '0.1em',
  color: theme.palette.primary.main,
  textTransform: 'uppercase',
  [theme.breakpoints.down('sm')]: { fontSize: '1.5rem' },
}));
```

```tsx
<Title variant="h1">Star Wars people</Title>
```

- A **reusable** styled component, built on top of an MUI component or a tag (`styled('section')`)
- Keeps every prop of the base component — `variant`, `component`, `sx`
- Rule of thumb: `sx` for **one place**, `styled` for **a component you reuse**,
  the theme for **every instance**

---

# Styling, way 3 — the theme's `components` key

```ts
export const theme = createTheme({
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true, variant: 'contained' },
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 999 },
      },
    },
    MuiTableCell: {
      styleOverrides: { head: ({ theme }) => ({ fontWeight: theme.typography.fontWeightBold }) },
    },
  },
});
```

- **Default props** and **style overrides** for every instance of a component
- Each key (`root`, `head`, …) is a **slot** listed in the component's API page
- Inner elements are customized with **`slotProps`** — e.g. the `htmlInput`
  slot of a `TextField` receives the native `<input>` attributes

---

# Dark mode

```ts
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },  // emits --mui-palette-* variables
  colorSchemes: {
    light: { palette: { primary: { main: '#1976d2' } } },
    dark: { palette: { primary: { main: '#ffe81f' } } },
  },
});
```

```tsx
import { useColorScheme } from '@mui/material/styles';

export function ThemeSwitcher() {
  const { mode, setMode } = useColorScheme();
  if (!mode) return null;                         // not resolved yet (first render)
  return (
    <ToggleButtonGroup exclusive value={mode} onChange={(_, next) => next && setMode(next)}>
      <ToggleButton value="light">Light</ToggleButton>
      <ToggleButton value="system">System</ToggleButton>
      <ToggleButton value="dark">Dark</ToggleButton>
    </ToggleButtonGroup>
  );
}
```

- `setMode` **persists** the choice in `localStorage` and follows `prefers-color-scheme` on `system`
- With CSS variables, switching mode swaps a class — **no re-render** of the tree

---

# Styles that depend on the mode

```tsx
<Box
  sx={(theme) => ({
    bgcolor: '#fff',
    ...theme.applyStyles('dark', { bgcolor: theme.vars.palette.grey[900] }),
  })}
/>
```

- **`theme.applyStyles('dark', …)`** instead of `theme.palette.mode === 'dark' ? … : …`
  — it works with CSS variables and avoids a flash on load
- **`theme.vars.*`** reads the CSS variables: `var(--mui-palette-grey-900)`
- A server-rendered app adds `<InitColorSchemeScript />` to set the class
  **before** React hydrates

<br />

### Two simpler alternatives

- Two `createTheme` calls and a `ThemeProvider` whose `theme` comes from state
  (re-renders everything, but easy to reason about)
- No dark mode in the theme at all: drive CSS variables yourself (chapter 7)

---

# Testing MUI components

```tsx
it('filters the people when typing in the search field', async () => {
  const user = userEvent.setup();
  render(<ThemeProvider theme={theme}><App /></ThemeProvider>);

  await user.type(screen.getByLabelText('Search'), 'sky');

  expect(screen.getAllByRole('row')).toHaveLength(2);       // header + Luke
});

it('switches to dark mode', async () => {
  const user = userEvent.setup();
  render(<ThemeProvider theme={theme}><ThemeSwitcher /></ThemeProvider>);

  await user.click(screen.getByRole('button', { name: 'Dark' }));

  expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
});
```

- MUI renders **accessible HTML**: query by role and label, as for your own components
- Do **not** assert on generated class names (`css-1x2y3z`): they change
- Wrap renders in a small `renderWithTheme()` helper

---

# Recap

- A **styled** library gives components and a look; a **headless** one gives
  behaviour and accessibility, and leaves the look to you
- MUI = `@mui/material` + **Emotion**; `ThemeProvider` + `CssBaseline` at the root
- **`createTheme`**: palette, typography, spacing, shape, breakpoints — merged
  into defaults
- Three styling levels: the theme's **`components`** (every instance),
  **`styled`** (a reusable component), **`sx`** (one place)
- Dark mode: **`colorSchemes`** + **`cssVariables`**, `useColorScheme()` to read
  and switch, `theme.applyStyles('dark', …)` for mode-specific styles
- Test through **roles and labels**, never class names

---

# Quiz — Question 1 / 3

**Every `Button` of the app must have `textTransform: 'none'`. Where does it go?**

- **A.** An `sx` prop on each `Button`
- **B.** `components.MuiButton.styleOverrides.root` in the theme
- **C.** A global CSS rule on `.MuiButton-root` with `!important`
- **D.** A `styled(Button)` that every file must import instead of `Button`

<v-click>

> ✅ **B** — The theme's `components` key applies to every instance, including
> the buttons rendered inside other MUI components (dialogs, pickers). `sx`
> is for one place, `styled` for a variant you name.

</v-click>

---

# Quiz — Question 2 / 3

```tsx
<Typography variant="h2" component="h1">Star Wars people</Typography>
```

**What does this render?**

- **A.** An `<h2>` styled like an `<h1>`
- **B.** An `<h1>` styled like an `<h2>`
- **C.** Both an `<h1>` and an `<h2>`
- **D.** A `<p>` — `component` is only for layout components

<v-click>

> ✅ **B** — `variant` picks the **look** from the theme's typography,
> `component` picks the **element**. It keeps the heading outline right while
> using the visual scale you want.

</v-click>

---

# Quiz — Question 3 / 3

**With `colorSchemes` and `cssVariables` enabled, what is the recommended way to
write a style that differs in dark mode?**

- **A.** `theme.palette.mode === 'dark' ? a : b` in `sx`
- **B.** `theme.applyStyles('dark', { … })`
- **C.** A `useEffect` that adds a class to `<body>`
- **D.** A second `ThemeProvider` inside the dark part of the page

<v-click>

> ✅ **B** — `applyStyles` emits a rule scoped to the dark color scheme selector,
> so switching mode only swaps a class: no re-render, and no flash of the wrong
> theme on load.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 18 - Integrating a UI library: Material UI
