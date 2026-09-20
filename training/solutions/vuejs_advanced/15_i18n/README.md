# TP 15 — Internationalization with vue-i18n

> This TP is **autonomous**: it does not depend on any other TP. The shop works
> and it speaks French, through a hand-rolled dictionary — the version that works
> for about a week. It also ships two broken messages and a plural rule that is
> wrong for the only language it supports.

## Goal

Chapter 15 — Treat translation as a **formatting** problem, not a lookup problem:

- `createI18n({ legacy: false })`, the chapter-4 plugin pattern again
- The **four message forms** — named, list, linked, escaped — and the two
  characters that are syntax
- **Pluralization**, vue-i18n's default rule in full, and why French needs its own
- **`n()`** with formats **named once**, not `Intl` options at every call site
- **Lazy loading** with `import.meta.glob`, and the four holes the naive version
  leaves open

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

`tests/` is given, and **twenty of its twenty-four specs are red**:

| File | What it holds |
|---|---|
| `tests/messages.spec.ts` | the four forms, the plurals, the number formats |
| `tests/setLocale.spec.ts` | lazy loading, and the four holes |
| `tests/shop.spec.ts` | the app itself, in French and after a switch |

Three catalogues are provided: `fr`, `en`, `de`. The English and German ones are
already correct — read them when a French message will not behave.

## Steps

### 1. Configure the plugin — `src/i18n/index.ts`

1. `fallbackLocale: 'en'`, so a missing key falls back instead of rendering as
   itself.
2. `numberFormats` — `currency`, `percent` and `compact`, per locale. Named
   **here, once**: inlining `Intl` options at a call site is how an app ends up
   with three currency renderings and no single place to change.
3. `pluralRules` for `fr`. This is the whole default rule:

   ```ts
   choice = Math.abs(choice);
   if (choicesLength === 2) return choice === 1 ? 0 : 1;
   return Math.min(choice, 2);
   ```

   That is **English grammar, hard-coded**. It is not CLDR and not
   `Intl.PluralRules`. In French, `0` takes the **singular** — *0 article*.
   Write the French rule.

> `legacy: false` is not optional: the default is still `true`, and Legacy mode
> has none of the Composition API surface used below.

### 2. Use it — the four components

Replace `naiveT` / `naiveEuros` with `useI18n()` (or `$t` / `$n`, which
`globalInjection` already provides), then delete `src/i18n/naive.ts`:

- `CatalogPanel` — `n(price, 'currency')`, `n(rate, 'percent')`, `n(views, 'compact')`
- `CartPanel` — `t('cart.items', count)`; the number is injected into the message
  as both `count` and `n`
- `LegalPanel` — the named, list, linked and escaped messages
- `LocaleSwitcher` — see step 4

### 3. Fix the two broken French messages — `src/locales/fr.json`

Both fail the same way on screen: the raw key, or a word that never arrives.

```json
"accept": "J'accepte les @:tos."
```

A linked key runs until a **space**, so this looks up `tos.` — dot included.
Wrap it: `@:{'legal.tos'}`.

```json
"currencyNote": "Les prix sont exprimés en {devise}"
```

`{` and `}` are syntax. To print them, escape them: `{'{'}devise{'}'}`. (`@` too:
`{'@'}`.)

### 4. Lazy-load a locale — `src/i18n/setLocale.ts`

The naive version is four lines and misses four things. Write the one that ships:

1. **Do not re-download.** Check `i18n.global.availableLocales` first.
2. **Win the race.** `await import()` has no cancellation: switch to `de`, then
   to `en` before German resolves, and German lands last and wins. Keep the last
   requested locale in a module-level `pending` and bail out when overtaken.
3. **Set `<html lang>`.** Screen readers, hyphenation and CSS `:lang()` all read
   that attribute.
4. **Update `Accept-Language`** on `apiHeaders`, or the backend keeps answering in
   French.

Load with `import.meta.glob('../locales/*.json')`: the set of locales becomes
explicit and statically analysable — one chunk per locale, and an unknown one
throws here instead of 404-ing at fetch time.

Then wire the switcher. `locale` is a **ref**: `i18n.global.locale = 'en'` without
`.value` is the single most common vue-i18n bug — nothing throws, nothing
re-renders.

### 5. Read the build

```bash
npm run build
```

You should see one chunk per lazily-loaded locale (`en-*.js`, `de-*.js`) — and a
warning that `fr.json` is both statically and dynamically imported. That one is
**expected**: French ships with the bundle because it is the startup locale.

### 6. *(Bonus)* The languages the default rule cannot express

Add a `ru` catalogue with `cart.items` in three forms and write its plural rule:
Russian picks on the **last digits**, not on the value — 1, 21, 31 take one form,
2–4 another, 5–20 a third. Then say what `Math.min(choice, 2)` would have done.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the twenty-four specs
- [ ] `npm run build` succeeds, with **one chunk per lazily-loaded locale**
- [ ] `grep -rn TODO src` returns nothing
- [ ] `src/i18n/naive.ts` is gone

**The messages**

- [ ] Named and list placeholders render
- [ ] `legal.accept` renders the linked text **followed by a full stop**
- [ ] `legal.shout` renders in upper case
- [ ] `legal.currencyNote` prints literal braces
- [ ] `fallbackLocale` is `en`

**The numbers and plurals**

- [ ] `0` items renders **"0 article"**, singular, in French
- [ ] English keeps `no item / one item / N items`
- [ ] Prices render `1 234,50 €` in French and `$1,234.50` in English
- [ ] The percentage and the compact notation go through **named** formats

**The switch**

- [ ] A locale not in the bundle is downloaded on demand — **once**
- [ ] An unknown locale throws, naming it
- [ ] Two overlapping switches leave the **newest** one active
- [ ] `document.documentElement.lang` follows
- [ ] `Accept-Language` follows
- [ ] The active button is marked, and every translated string re-renders

**You can explain**

- [ ] Why a lookup table is not enough, in three sentences
- [ ] What `choicesLength === 2` does to French, and to Russian
- [ ] Why the variable in a dynamic `import()` must sit in the last path segment
- [ ] Why the build warns about `fr.json`, and why that warning is fine here

## Going further

- Put a component inside a translated sentence with `<i18n-t keypath="…">` — a
  link in the middle of a legal notice, without splitting the message in three.
- Add `datetimeFormats` and `d()`, then render the same timestamp in the three
  locales side by side.
- Switch to the message compiler's **runtime-only** build and see what breaks:
  which of your messages needed compilation at runtime?
- Load a feature's namespace on top of an already-loaded locale with
  `mergeLocaleMessage()`, and decide where that call belongs.
