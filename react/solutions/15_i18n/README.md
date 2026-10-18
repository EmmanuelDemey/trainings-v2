# TP 15 — Internationalisation with i18next and Intl

> This TP is **autonomous**: it does not depend on any other TP. The people
> table, the likes and the English catalogue are provided and working, in
> English only. Your job is to make the app speak French as well: messages,
> plurals, numbers and dates.

## Goal

Chapter 15 — Internationalise a small React app, the standard way:

- **i18next + react-i18next**: an instance, inline resources, `useTranslation`
- **A language switcher**, and a `<html lang>` that follows it
- **Interpolation** (`{{name}}`) and **plurals** (`count`, `Intl.PluralRules`), French rules included
- **`Intl.NumberFormat`** for heights and masses, **`Intl.DateTimeFormat`** and
  **`Intl.RelativeTimeFormat`** for dates
- **Typed keys**: a misspelled key is a compile error

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

The specs are already written and red on the starter. Keep
`npm run test:watch` open in a second terminal and turn them green:

- **`src/i18n/i18n.spec.ts`**: the instance, the French catalogue, interpolation and plurals (steps 1, 3 and 4)
- **`src/App.spec.tsx`**: the app as a user sees it, in both languages (steps 2 to 5)
- **`src/format.spec.ts`**: the four `Intl` formatters (step 5)

Every app spec renders through `src/tests/render.tsx`, which wraps `<App />` in
an `<I18nextProvider>` with a **fresh** instance from `createI18n(lng)`. One
test switching to French cannot leak into the next. `src/main.tsx` wires the app
the same way.

**Already done for you:**

- `src/i18n/en.ts`, the English catalogue, `as const`, with its `Translation`
  type: the same keys, every message widened to `string`
- `src/i18n/index.ts`: `languages`, `resources` and the `createI18n` factory, without its `init`
- `src/App.tsx` (the likes state), `src/components/*`, `src/data/people.ts`

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Initialise i18next, translate the catalogue | `src/i18n/index.ts` + `src/i18n/fr.ts` | `createI18n('fr').t('title')` is French |
| 2 | Replace the hard-coded strings with `t()` | `src/components/Header.tsx` + `PeopleTable.tsx` | `renderApp('fr')` shows a French page |
| 3 | The language switcher and `<html lang>` | `src/components/LanguageSwitcher.tsx` + `src/i18n/index.ts` | "FR" switches the whole page, live |
| 4 | Interpolation and plurals | `PeopleTable.tsx`, `LikesSummary.tsx`, `fr.ts` | "Vous aimez 0 personnage." |
| 5 | Numbers and dates with `Intl` | `src/format.ts` + `PeopleTable.tsx` | "1,75 m", "1 358 kilogrammes", "il y a 12 ans" |
| 6 | Typed keys | `src/i18n/i18next.d.ts` (new) | `t('titel')` fails `npm run typecheck` |

## Steps

### 1. The instance — `src/i18n/index.ts` + `src/i18n/fr.ts`

1. In `createI18n`, call `instance.use(initReactI18next).init({ … })` with the
   options listed in the TODO. Two of them matter more than they look:
   `initAsync: false` makes the instance ready on the next line, because the
   resources are already in memory. `escapeValue: false` stops i18next from
   escaping what React escapes already: without it, "R2&D2" would show as `R2&amp;D2`.
2. Translate `fr.ts`. It `satisfies Translation`, so try deleting a key: it is a
   compile error.

→ **Done when** the `createI18n` spec "is ready at once" and the "translate every
message" spec are green.

### 2. `useTranslation` — `src/components/Header.tsx` + `PeopleTable.tsx`

1. `const { t } = useTranslation()`, then `t('title')`, `t('intro')`.
2. In the table, translate the column headers with the nested keys:
   `t('table.name')`, and so on. `.` is the key separator.

→ **Done when** `renderApp('fr')` shows "Personnages de Star Wars" and French
column headers.

### 3. Switching language — `LanguageSwitcher.tsx` + `src/i18n/index.ts`

1. In `LanguageSwitcher`, take `{ t, i18n }` from `useTranslation()`. Label the
   group with `t('language')`. A button is `aria-pressed` when
   `i18n.resolvedLanguage` is its language, and a click calls
   `i18n.changeLanguage(language)`. Every component that called
   `useTranslation` re-renders.
2. In `createI18n`, listen to `'languageChanged'` and set
   `document.documentElement.lang`. Register the listener **before** `init`,
   which fires the first event. Screen readers use `lang` to pick a voice, and
   browsers use it for hyphenation and spell-checking.

→ **Done when** "FR" translates the page without a reload and `<html lang="fr">`
follows it.

### 4. Interpolation and plurals — `PeopleTable.tsx`, `LikesSummary.tsx`, `fr.ts`

1. The like buttons concatenate `'Like ' + name`. That only works in a language
   where the name comes last. Use `t('table.like', { name: person.name })`
   (and `table.unlike`): the translator decides where `{{name}}` goes.
2. In `LikesSummary`, `t('likes', { count })`. `count` is special: i18next asks
   `Intl.PluralRules` for the form and appends its suffix, `likes_one` or `likes_other`.
3. Run `new Intl.PluralRules('fr').select(n)` in the console for 0, 1, 2 and
   1000000. In French, **0 is `one`**, so "0 personnage" is singular. Millions
   are `many`, and take "de". Add a `likes_many` message to `fr.ts` (its type
   allows the extra key), or the million shows the bare key.

→ **Done when** the counter reads "You like 0 characters." / "Vous aimez 0
personnage." and both plural specs are green.

### 5. `Intl` — `src/format.ts` + `PeopleTable.tsx`

1. Implement the four formatters. Each doc comment shows the expected output:
   - `formatHeight`: `Intl.NumberFormat` with `style: 'unit'`, `unit: 'meter'`
     and two decimals, on `cm / 100`
   - `formatMass`: `unit: 'kilogram'`, `unitDisplay: 'long'`
   - `formatDate`: `Intl.DateTimeFormat` with `dateStyle: 'long'` and
     `timeZone: 'UTC'`. Without the time zone, a record edited at 23:59 UTC
     shows the next day in Paris.
   - `formatRelative`: pick the largest unit that fits (year, month, day, hour,
     minute, then second), then `Intl.RelativeTimeFormat` with `numeric: 'auto'`.
     That option is what turns "1 day ago" into "yesterday".
2. In `PeopleTable`, format with `i18n.resolvedLanguage`, not a hard-coded `'en'`.

French output uses **no-break** spaces (U+202F in `1 358` and `1,72 m`, U+00A0
before `kilogrammes`), so a number never wraps away from its unit. The specs
normalise them. Never build these strings by hand.

→ **Done when** Jabba's row reads "1,75 m" and "1 358 kilogrammes" in French, and
`format.spec.ts` is green.

### 6. Typed keys — `src/i18n/i18next.d.ts`

Create the file:

```ts
import 'i18next';
import type { en } from './en';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof en };
  }
}
```

This is why `en` is `as const`. Type `t('` in an editor: the keys are completed.
`t('titel')` now fails with "Did you mean 'title'?". No spec can check a compile
error *and* stay compilable on the starter, so this one is checked by hand.

→ **Done when** a misspelled key fails `npm run typecheck`.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] No i18next warning (`missingKey`…) in the browser console

**The behaviour is there**

- [ ] The app opens in the browser's language (French if `navigator.language` is French)
- [ ] "EN" / "FR" switch every text, number and date at once, and `<html lang>` follows
- [ ] "Vous aimez 0 personnage." / "You like 0 characters."
- [ ] Each like button is named after its person, in the current language
- [ ] Heights, masses and dates follow the language; the full date shows on hover
- [ ] `t('titel')` is a compile error

**You can explain**

- [ ] Why concatenating translated fragments breaks in other languages
- [ ] What `count` does that a plain `{{n}}` does not, and why French needs a `_many`
- [ ] Why the formatters take a locale instead of reading a global one
- [ ] Why the specs create one i18next instance per test

## Going further

- Use `<Trans>` for a sentence with a link inside, such as "Data from
  <a>SWAPI</a>": the translator moves the link, React keeps it a real element.
- Use i18next's built-in formatting, `{{mass, number}}` or
  `{{date, datetime}}`, and compare it with `format.ts`. Which one is easier to test?
- Add `i18next-browser-languagedetector` and persist the choice in `localStorage`.
- Load each language on demand with `i18next-resources-to-backend` and
  `import('./fr.ts')`, then check in `dist/` that French is a separate chunk.
- Add ICU MessageFormat with `i18next-icu`:
  `{count, plural, =0 {…} one {…} other {…}}`.
