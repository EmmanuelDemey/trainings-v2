---
layout: cover
---

# 8ter - Internationalization with vue-i18n

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Install** vue-i18n in Composition API mode and **explain** why `legacy: false`
  is not optional today
- **Choose** between the global scope and a component-local scope, and **type**
  your catalogue so a missing key is a `vue-tsc` error
- **Write** named, list and linked messages, and **place a component inside a
  sentence** with `<i18n-t>` instead of concatenating fragments
- **Read** vue-i18n's default pluralization rule, **name** the languages it gets
  wrong, and **replace** it with `Intl.PluralRules`
- **Format** numbers, currencies and dates with `n()` and `d()`, and **fill** the
  gap vue-i18n leaves on relative time
- **Lazy-load** a locale, wire it into the router, and **avoid** the two races
  that come with it
- **Drop** the message compiler from the production bundle and **measure** what
  that actually saves

---

# Why a library, and not a dictionary

```ts
// The "we only need a lookup" version — it works for about a week
const messages: Record<string, string> = { 'cart.title': 'Panier' };
const t = (key: string) => messages[key] ?? key;
```

| The requirement | What a lookup cannot do |
|---|---|
| `no item` / `1 item` / `3 items` | pick a form **per language, per number** |
| `1 234,50 €` — and `€1,234.50` | locale-aware number, currency, date formatting |
| `Read the <a>terms</a> first` | put a **component** inside a translated sentence |
| 12 locales in the app | ship **only the one** the user asked for |
| A key missing in `de` | fall back, warn in dev, stay silent in prod |

> Translation is a **formatting** problem, not a lookup problem. Everything in this
> chapter is about the formatting — the lookup is the easy 5%.

---

# Setup — it is a plugin, and you have read its source

```ts
// src/i18n/index.ts
import { createI18n } from 'vue-i18n';
import fr from './locales/fr.json';

export const i18n = createI18n({
  legacy: false,          // ⚠️ Composition API mode — the default is still `true`
  globalInjection: true,  // $t / $d / $n in templates, without useI18n()  (default)
  locale: 'fr',
  fallbackLocale: 'en',
  messages: { fr },
});
```

```ts
createApp(App).use(i18n).mount('#app');   // chapter 3bis, exactly
```

- `createI18n()` is a **factory returning a plugin** — the pattern of chapter 3bis:
  options resolved once, state owned by the returned object, one instance per app
- Read its `install()` and you will find `app.mixin()` (Legacy mode only) and a
  **monkey-patched `app.unmount`** — the pre-3.5 way to get an `onUnmount` hook

---

# `legacy: false` — say it out loud

```ts
// Simplified from createI18n(), vue-i18n 11.4
const __legacyMode = isBoolean(options.legacy) ? options.legacy : true;
if (__legacyMode) {
  warnOnce(getWarnMessage(I18nWarnCodes.DEPRECATE_LEGACY_MODE));
}
```

- The default is **still the Vue 2 API** — `$t` via a mixin, `this.$i18n`, `$tc`
- Up to v10, `useI18n()` **threw** in Legacy mode unless you also passed
  `allowComposition: true`. v11 dropped that gate — it now hands back the legacy
  instance's composer, so a half-migrated app runs. Only `useScope: 'isolated'`
  still refuses
- v11 **deprecates** it and warns once; **v12 removes** it, along with `$tc`,
  `PluralizationRulesMap` and the `v-t` directive

<br />

| | Legacy (`legacy: true`) | Composition (`legacy: false`) |
|---|---|---|
| Access | `this.$i18n`, mixin | `useI18n()`, `i18n.global` |
| Locale | `i18n.global.locale = 'fr'` | `i18n.global.locale.value = 'fr'` |
| Plurals | `$tc(key, n)` | `t(key, n)` |
| Status | deprecated, gone in v12 | the API |

> The locale row is the one that bites during a migration: a `WritableComputedRef`
> assigned like a string fails **silently**.

---

# Two scopes: global, and one per component

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n';

// No options -> the GLOBAL composer. This is what you want 95% of the time.
const { t, d, n, locale } = useI18n();
</script>

<template>
  <h1>{{ t('cart.title') }}</h1>
  <p>{{ $t('cart.title') }}</p>   <!-- same thing, via globalInjection -->
</template>
```

```vue
<script setup lang="ts">
// With options -> a LOCAL composer, its own catalogue, its own instance
const { t } = useI18n({
  useScope: 'local',
  messages: {
    fr: { title: 'Détail de la facture' },
    en: { title: 'Invoice detail' },
  },
});
</script>
```

- A local scope **inherits** the global locale (`inheritLocale`, default `true`)
  and **falls back** to the global catalogue (`fallbackRoot`, default `true`)
- The `<i18n>` custom block in an SFC is the same thing with build-time support
  (it needs `@intlify/unplugin-vue-i18n`, see the bundle section)

---

# Local scope: the tempting choice, and its bill

| What a local scope promises | What it costs |
|---|---|
| Messages sit next to the component that uses them | Translators need **one file per component** |
| Delete the component, delete its messages | A key used twice is **duplicated**, and the two copies drift |
| No 4000-line `fr.json` to merge on every branch | Messages live **inside the JS chunk** — no per-locale splitting |
| The component is self-contained, publishable as-is | Extraction tooling and translation platforms expect **files** |

<br />

> Default to the **global scope with namespaced keys** (`cart.title`,
> `invoice.status.paid`). Reach for a local scope when a component is genuinely
> standalone — a published library component, a widget embedded in a host app.

---

# Message syntax — the four forms

```json
{
  "greeting": "Bonjour {name}",
  "range": "De {0} à {1}",
  "tos": "conditions générales",
  "accept": "J'accepte les @:{'tos'}.",
  "shout": "@.upper:tos",
  "price": "Le prix est de {'{'}devise{'}'}"
}
```

```ts
t('greeting', { name: 'Manu' });      // named   -> "Bonjour Manu"
t('range', ['lundi', 'vendredi']);    // list    -> "De lundi à vendredi"
t('accept');                          // linked  -> "J'accepte les conditions générales."
t('shout');                           // modifier -> "CONDITIONS GÉNÉRALES"
t('price');                           // escaped -> "Le prix est de {devise}"
```

- **Linked messages** (`@:key`) keep one wording in one place — a product name, a
  legal term. Built-in modifiers: `@.upper:`, `@.lower:`, `@.capitalize:`
- ⚠️ A linked key runs until a **space**: `"@:tos."` looks up `tos.`, dot included,
  and renders the raw key. Wrap it — `@:{'tos'}` — whenever punctuation follows
- `{` and `}` are syntax: escape them as `{'{'}`. `@` too: `{'@'}`

---

# HTML in messages — the answer is "no"

```json
{ "cgu": "J'accepte les <a href=\"/cgu\">conditions générales</a>." }
```

```vue
<p v-html="$t('cgu')" />   <!-- ❌ XSS the day a translation comes from an API -->
```

- vue-i18n warns on it: `warnHtmlMessage` is `true` by default in Vue 3
- `escapeParameter: true` escapes **interpolated values** — useful when a value can
  come from user input, but it does not make `v-html` safe
- And it does not even work well: the translator has to copy the markup, the link
  is not a `<RouterLink>`, and the a11y attributes drift

> The correct tool is `<i18n-t>`.

---

# `<i18n-t>` — components inside a sentence

```json
{ "cgu": "J'accepte les {terms} et la {privacy}." }
```

```vue
<i18n-t keypath="cgu" tag="p" scope="global">
  <template #terms>
    <RouterLink :to="{ name: 'terms' }">{{ t('terms') }}</RouterLink>
  </template>
  <template #privacy>
    <RouterLink :to="{ name: 'privacy' }">{{ t('privacy') }}</RouterLink>
  </template>
</i18n-t>
```

- Each **named placeholder** becomes a **named slot** — the translator moves the
  placeholders around freely, word order stays a translation concern
- `tag` wraps the result (omit it for a Fragment), `plural` selects a plural form
- `scope` defaults to **`parent`**: inside a component that declared a local scope,
  a global key needs `scope="global"` — a very common "key not found" cause

> The rule: **never concatenate translated fragments**. Word order is not universal.

---

# Pluralization — the syntax

```json
{
  "car": "voiture | voitures",
  "apple": "aucune pomme | une pomme | {count} pommes",
  "banana": "aucune | {n} banane | {n} bananes"
}
```

```ts
t('car', 1);                          // voiture
t('car', 2);                          // voitures
t('apple', 0);                        // aucune pomme
t('apple', 12);                       // 12 pommes        <- {count} filled in
t('banana', 3);                       // 3 bananes        <- {n} filled in
t('apple', 12, { count: 12 });        // same, written out
```

- Forms are separated by `|`, **whitespace around the pipe is trimmed**
- `count` **and** `n` are injected automatically from the number you passed:

```ts
// createMessageContext, vue-i18n 11.4
if (isNumber(options.pluralIndex)) {
  _named.count ||= options.pluralIndex;
  _named.n     ||= options.pluralIndex;
}
```

---

# Pluralization — the default rule, in full

```ts
// This is the ENTIRE default rule. Read it twice.
function pluralDefault(choice: number, choicesLength: number): number {
  choice = Math.abs(choice);
  if (choicesLength === 2) {
    return choice === 1 ? 0 : 1;          // singular | plural
  }
  return Math.min(choice, 2);             // zero | singular | plural
}
```

- It is **English grammar**, hard-coded. It is **not** CLDR, and **not**
  `Intl.PluralRules`
- With two forms it is right for English, German, Dutch, Spanish, Italian…
- It is **wrong for French**: `0` must take the singular — *0 article*, not
  *0 articles*
- It is **very wrong** for Russian, Polish, Czech, Arabic, Welsh — 3, 4 or 6 forms
  chosen on the last digits, not on the value

> Two forms and a `Math.min` cannot express Slavic grammar. Nothing warns you.

---

# Pluralization — plugging in `Intl.PluralRules`

```ts
import type { PluralizationRule } from 'vue-i18n';

const CLDR_ORDER = ['zero', 'one', 'two', 'few', 'many', 'other'] as const;

function cldrRule(locale: string): PluralizationRule {
  const pr = new Intl.PluralRules(locale);
  // ⚠️ only the categories THIS locale uses — 'few' is index 3 of the six,
  //    but index 1 of Russian's own list. Indexing the six is the classic bug.
  const used = CLDR_ORDER.filter((c) =>
    pr.resolvedOptions().pluralCategories.includes(c),
  );

  return (choice, choicesLength) => {
    const index = used.indexOf(pr.select(Math.abs(choice)));
    return Math.min(index < 0 ? used.length - 1 : index, choicesLength - 1);
  };
}

createI18n({
  legacy: false,
  pluralRules: { ru: cldrRule('ru'), pl: cldrRule('pl') },  // `pluralizationRules` in Legacy
});
```

```json
{ "item": "товар | товара | товаров | товара" }
```

```ts
t('item', 1);    // товар     t('item', 21);  // товар
t('item', 2);    // товара    t('item', 22);  // товара
t('item', 5);    // товаров   t('item', 100); // товаров
```

---

# Pluralization — your catalogue now owes CLDR an order

```ts
new Intl.PluralRules(locale).resolvedOptions().pluralCategories
```

| Locale | Categories it actually uses | Forms to write |
|---|---|---|
| `en` | one, other | 2 |
| `fr` | one, many, other | 2 (`many` is for 1 000 000+) |
| `ru`, `pl` | one, few, many, other | 4 |
| `ar`, `cy` | zero, one, two, few, many, other | 6 |

- Install a CLDR rule for a locale, and that locale's messages must be written in
  **CLDR category order** — nothing checks it, and a mismatch is silent
- vue-i18n's own three-form convention is **zero | singular | plural**, which is
  *not* CLDR. `aucun | un | {count}` under `cldrRule('fr')` renders **"aucun
  article" for 1**: French's first category is `one`, and `one` selects form 0

> Pick one convention **per locale** and write it down next to the catalogue.
> Mixing them is the bug you will not find by reading the JSON.

---

# Pluralization — the French zero, two honest options

**A. Three forms, vue-i18n's own convention** — no custom rule at all

```json
{ "item": "aucun article | un article | {count} articles" }
```

```ts
t('item', 0);   // aucun article        <- Math.min(0, 2) -> form 0
t('item', 1);   // un article
t('item', 12);  // 12 articles
```

**B. Two forms plus `cldrRule('fr')`** — when the catalogue is generated

```ts
createI18n({ legacy: false, pluralRules: { fr: cldrRule('fr') } });
// "article | articles" -> 0 article, 1 article, 2 articles
```

- **A** reads better in the product (*aucun résultat* beats *0 résultat*) and costs
  nothing. Prefer it, and keep custom rules for the languages that truly need them
- **B** is the one to reach for when the same message shape must hold across
  30 locales and a human is not writing each one

---

# Numbers and currencies — `n()`

```ts
createI18n({
  legacy: false,
  numberFormats: {
    fr: {
      currency: { style: 'currency', currency: 'EUR', currencyDisplay: 'symbol' },
      percent:  { style: 'percent', maximumFractionDigits: 1 },
      compact:  { notation: 'compact', compactDisplay: 'short' },
    },
    en: {
      currency: { style: 'currency', currency: 'USD' },
      percent:  { style: 'percent', maximumFractionDigits: 1 },
      compact:  { notation: 'compact' },
    },
  },
});
```

```ts
n(1234.5, 'currency');                        // 1 234,50 €
n(0.128, 'percent');                          // 12,8 %
n(1234.5, 'currency', { currency: 'CHF' });   // per-call override
n(1234.5, 'currency', 'en');                  // per-call locale
```

- The options object is **`Intl.NumberFormat` verbatim** — vue-i18n adds naming,
  caching and locale resolution, nothing else
- Formatter instances are **cached per locale + format**: `new Intl.NumberFormat()`
  costs real milliseconds, and this is why you name formats instead of inlining them

---

# Dates — `d()`, and the currency that is not a format

```ts
datetimeFormats: {
  fr: {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long:  { dateStyle: 'full', timeStyle: 'short' },
  },
},
```

```ts
d(new Date(), 'short');           // 19/08/2026
d(invoice.issuedAt, 'long');      // mardi 19 août 2026 à 14:30
d(new Date(), 'long', 'en');
```

- Same deal: **`Intl.DateTimeFormat` options**, named once, cached
- Accepts a `Date`, a timestamp, or an **ISO-8601 string** — and *only* ISO: any
  other string shape (`19/08/2026`, `Aug 19, 2026`) throws
  `INVALID_ISO_DATE_ARGUMENT`, on purpose, because `new Date(string)` parses
  differently across browsers
- `timeZone` belongs in the format when the value is a server timestamp; the
  browser default is the user's, which is right for "when did I do this" and wrong
  for "when does the shop open"

> **A currency is not a locale.** `fr` + EUR and `fr-CA` + CAD are two different
> settings. Keep the ISO code on the **data**, pass it as an override.

---

# What vue-i18n does *not* format: relative time

```ts
// composables/useRelativeTime.ts — 15 lines, no dependency
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { useI18n } from 'vue-i18n';

const DIVISIONS = [
  { amount: 60, unit: 'second' }, { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },   { amount: 7,  unit: 'day' },
  { amount: 4.34524, unit: 'week' }, { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
] as const;

export function useRelativeTime(date: MaybeRefOrGetter<Date>) {
  const { locale } = useI18n();
  return computed(() => {
    const rtf = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' });
    let duration = (toValue(date).getTime() - Date.now()) / 1000;
    for (const { amount, unit } of DIVISIONS) {
      if (Math.abs(duration) < amount) return rtf.format(Math.round(duration), unit);
      duration /= amount;
    }
  });
}
```

- `Intl.RelativeTimeFormat` gives you *il y a 3 jours* / *3 days ago* for free, with
  `numeric: 'auto'` producing *hier* instead of *il y a 1 jour*
- Same story for `Intl.ListFormat` (*A, B et C*) and `Intl.Collator` (sorting) —
  reach for the platform before adding a dependency

---

# Typing the catalogue

```ts
// src/i18n/schema.ts
import fr from './locales/fr.json';

export type MessageSchema = typeof fr;      // fr is the source of truth
```

```ts
// src/i18n/index.ts
export const i18n = createI18n<[MessageSchema], 'fr' | 'en'>({
  legacy: false,
  locale: 'fr',
  messages: { fr, en },     // ❗ `en` must now structurally match `fr`
});
```

```ts
// src/i18n/vue-i18n.d.ts — makes $t and useI18n() aware everywhere
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
}
export {};
```

- `t('cart.titel')` becomes a **compile error**, and autocompletion lists your keys
- The **English file is now checked against the French one** — a translator dropping
  a key breaks CI instead of production
- The catch: it only works on **statically imported** catalogues. With lazy loading,
  keep the reference locale static (it is one file) and load the others at runtime

---

# Lazy loading — the naive version, and why it is not enough

```ts
async function setLocale(locale: string) {
  const messages = await import(`../locales/${locale}.json`);
  i18n.global.setLocaleMessage(locale, messages.default);
  i18n.global.locale.value = locale;
}
```

That is the shape. Four things are missing:

1. **Re-downloading** on every switch — check `availableLocales` first
2. A **race**: switch to `de`, then to `es` before `de` resolves, and `de` wins
3. `document.documentElement.lang` is still `fr` — screen readers, hyphenation and
   `:lang()` CSS all read that attribute
4. The **HTTP `Accept-Language`** header of your API calls is not updated

> A dynamic `import()` built from a template literal is fine with Vite: the
> variable sits in the **last path segment**, so Rollup can enumerate the
> directory at build time. Move the variable earlier in the path and you get
> one chunk per file in your project.

---

# Lazy loading — the version that ships

```ts
// src/i18n/setLocale.ts
import { nextTick } from 'vue';
import { i18n } from './index';

export const SUPPORTED = ['fr', 'en', 'de'] as const;
export type SupportedLocale = (typeof SUPPORTED)[number];

const loaders = import.meta.glob<{ default: Record<string, unknown> }>(
  '../locales/*.json',
);

let pending: SupportedLocale | null = null;

export async function setLocale(locale: SupportedLocale): Promise<void> {
  pending = locale;

  if (!i18n.global.availableLocales.includes(locale)) {
    const load = loaders[`../locales/${locale}.json`];
    if (!load) throw new Error(`Unknown locale: ${locale}`);
    const messages = await load();
    if (pending !== locale) return;                 // a newer switch won — drop this one
    i18n.global.setLocaleMessage(locale, messages.default);
  }

  i18n.global.locale.value = locale;
  document.querySelector('html')!.setAttribute('lang', locale);
  api.defaults.headers['Accept-Language'] = locale;
  await nextTick();
}
```

- `import.meta.glob` makes the set of locales **explicit and statically analysable**
  — one chunk per locale, and an unknown locale fails loudly instead of at fetch time
- Use `mergeLocaleMessage()` instead of `setLocaleMessage()` when a feature loads its
  own namespace on top of an already-loaded locale

---

# Lazy loading — wiring it to the router

```ts
// src/router/index.ts
router.beforeEach(async (to) => {
  const locale = (to.params.locale as SupportedLocale) ?? detectLocale();

  if (!SUPPORTED.includes(locale)) {
    return { name: 'home', params: { locale: 'fr' } };   // 404 on an unknown locale
  }

  await setLocale(locale);       // the guard awaits the chunk — chapter 5
});
```

```ts
{ path: '/:locale(fr|en|de)?/invoices', name: 'invoices', component: InvoicesView }
```

- A **locale in the URL** is the only way a translated page is shareable,
  bookmarkable and indexable. `localStorage` alone is not
- The guard **blocks navigation** until the catalogue is there — no flash of raw
  keys. Chapter 5's rule applies: keep it fast, it is on the critical path
- `detectLocale()` reads, in order: the URL, a cookie, `navigator.languages`, the
  default. Never `navigator.language` alone

<br />

> Persist the choice in a **cookie**, not `localStorage`, the day you add SSR — the
> server needs to read it to render the right HTML.

---

# Fallbacks and missing keys

```ts
createI18n({
  legacy: false,
  locale: 'fr-CA',
  fallbackLocale: { 'fr-CA': ['fr'], 'de-AT': ['de'], default: ['en'] },
  missingWarn: true,                    // dev: warn on a missing key
  fallbackWarn: false,                  // but not on an *expected* fallback
  missing: (locale, key) => {
    if (import.meta.env.PROD) reportMissingKey(locale, key);   // chapter 8bis
    return key;
  },
});
```

- `fallbackLocale` takes a string, an array, or a **map** — regional variants
  falling back to their base language is the common case
- A missing key renders **the key itself**: `cart.title` in the middle of the page.
  Ugly on purpose, and easy to spot in a screenshot
- Wire `missing` to your reporter (chapter 8bis) and you learn which keys the
  translators never received — the alternative is a user telling you

---

# Bundle — there are two builds of vue-i18n

| Build | Contains | Raw | Gzip |
|---|---|---|---|
| `vue-i18n.esm-browser.prod.js` | runtime **+ message compiler** | 64.9 KB | **18.5 KB** |
| `vue-i18n.runtime.esm-browser.prod.js` | runtime only | 46.9 KB | **13.6 KB** |

<br />

- The **message compiler** turns `"Bonjour {name}"` into a render-like function. The
  full build ships it so it can compile **at runtime**, on first use of each message
- The runtime-only build cannot compile anything: every message must already be a
  **function**, compiled at build time
- ~5 KB gzipped, plus the compile work on the main thread on first paint — and it is
  the same 5 KB whether you have 2 locales or 40

> Measured on vue-i18n 11.4.8, `gzip -9`. Re-measure on your version before quoting
> a number to anyone.

---

# Bundle — `@intlify/unplugin-vue-i18n`

```ts
// vite.config.ts
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import VueI18n from '@intlify/unplugin-vue-i18n/vite';

export default defineConfig({
  plugins: [
    vue(),
    VueI18n({
      include: [fileURLToPath(new URL('./src/locales/**', import.meta.url))],
      compositionOnly: true,        // default — tree-shakes the Legacy API
      runtimeOnly: true,            // default — aliases to the runtime-only build
      dropMessageCompiler: true,    // ⚠️ not the default. Read the next slide first
      strictMessage: true,          // fail the build on HTML in a message
      escapeHtml: true,
    }),
  ],
});
```

- It is an **unplugin** — chapter 5bis, same family as `unplugin-vue-router` and
  `unplugin-auto-import`, and it works in Vite, webpack, Rollup and esbuild
- It **pre-compiles** every JSON/YAML file matched by `include` into message
  functions, and enables the `<i18n>` SFC block
- `strictMessage` is worth turning on for its own sake: it makes the "no HTML in
  messages" rule a **build error** instead of a code-review comment

---

# Bundle — the one rule for `dropMessageCompiler`

> Enable it **only if every message in the app is pre-compiled by the plugin.**

```ts
// This still works with dropMessageCompiler: true
const messages = await import('../locales/de.json');   // matched by `include` -> compiled
i18n.global.setLocaleMessage('de', messages.default);

// This CRASHES at runtime with dropMessageCompiler: true
const res = await fetch('/api/translations/de').then((r) => r.json());
i18n.global.setLocaleMessage('de', res);               // raw strings, no compiler
```

- Messages fetched **from an API**, or built at runtime, arrive as **strings**.
  There is no compiler left to turn them into functions
- Same for anything outside `include`, and for `t()` on a message you assembled
  in JS
- If you need runtime messages, compile them server-side with
  `@intlify/message-compiler`, or leave the compiler in and accept the 5 KB

---

# Bundle — feature flags and locale pruning

```ts
// vite.config.ts — what the plugin sets for you, spelled out
define: {
  __VUE_I18N_FULL_INSTALL__: false,     // no built-in components/directive
  __VUE_I18N_LEGACY_API__: false,       // no Legacy API
  __INTLIFY_PROD_DEVTOOLS__: false,     // no devtools hook in prod
  __INTLIFY_DROP_MESSAGE_COMPILER__: true,
},
```

```ts
VueI18n({
  onlyLocales: ['fr', 'en'],            // drop the other catalogues entirely
  treeShaking: {                        // v11.2+ — remove unused KEYS
    safelist: ['errors.*', 'validation.**'],
    dynamicKeyStrategy: 'keep-all',
  },
});
```

- `__VUE_I18N_FULL_INSTALL__: false` removes `<i18n-t>`, `<i18n-n>`, `<i18n-d>` and
  `v-t` — check you use none of them first
- `treeShaking` scans your sources for `t()`, `$t()`, `d()`, `n()`, `v-t`… and drops
  unreferenced keys. **`t(someVariable)` defeats it**, hence `keep-all` by default
  and the `safelist` for keys you build dynamically

> Dynamic keys and tree-shaking are the same trade-off as chapter 9's `manualChunks`:
> the bundler can only remove what it can prove is unused.

---

# Testing a translated component

```ts
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

function mountWith(component: Component, locale = 'fr') {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } });
  return mount(component, { global: { plugins: [i18n] } });
}
```

```ts
it('pluralizes the empty cart in French', () => {
  const wrapper = mountWith(CartSummary);
  expect(wrapper.text()).toContain('aucun article');   // not "0 articles"
});
```

- Mount with the **real catalogue**, not `{ $t: (k) => k }`. A stub asserts your
  keys, the real thing asserts your **sentences** — and catches the missing key
- Build **one `i18n` per test** (chapter 3bis: a factory, not a module singleton) —
  a shared instance leaks the locale from one test into the next
- The valuable tests are the ones a lookup cannot pass: **plural boundaries**
  (`0`, `1`, `2`), and one `n()` / `d()` assertion per locale

> `Intl` output depends on the ICU data of the runtime. Assert on
> `n(1234.5, 'currency')` computed in the test rather than a hard-coded
> `"1 234,50 €"` — the non-breaking space in there is not the one on your keyboard.

---

# The traps, on one slide

| Symptom | Cause |
|---|---|
| `Must be called at the top of a setup function` | `useI18n()` called outside `setup()` — after an `await`, or from a plain module |
| Changing the locale does nothing | `i18n.global.locale = 'en'` instead of `.value` |
| `0 articles` in French | the default plural rule, two forms |
| Wrong form in Russian | no `pluralRules` entry for `ru` |
| `cart.title` rendered as text | missing key — check `missing` and the fallback |
| Key not found inside a component | `<i18n-t>` scope is `parent`, needs `scope="global"` |
| Works in dev, blank strings in prod | `dropMessageCompiler` + runtime-fetched messages |
| `d()` throws `INVALID_ISO_DATE_ARGUMENT` | a non-ISO date string — only `YYYY-MM-DD…` is accepted |
| Wrong locale on the first paint | the router guard does not `await setLocale()` |
| `<html lang>` never changes | nobody set it — a11y and CSS `:lang()` both suffer |

---

# Quiz — Question 1 / 5

**Your catalogue has `"item": "article | articles"` and the locale is `fr`. What
does `t('item', 0)` render, and why?**

- **A.** `article` — vue-i18n uses `Intl.PluralRules`, and French maps 0 to `one`
- **B.** `articles` — the default rule is `choice === 1 ? 0 : 1`, hard-coded English
- **C.** It throws: two forms cannot express a zero case
- **D.** It depends on `fallbackLocale`

<v-click>

> ✅ **B** — The default rule is seven lines of English grammar with no notion of
> locale. French needs the singular for 0. Fix it with a `pluralRules` entry, or
> write a three-form message — *aucun article* reads better than *0 article* anyway.

</v-click>

---

# Quiz — Question 2 / 5

**You ship `dropMessageCompiler: true`. Everything is green in CI. In production,
one locale renders empty strings. Which locale?**

- **A.** The one with the most keys — the compiler timed out
- **B.** The fallback locale, which the plugin never pre-compiles
- **C.** The one loaded from your translation SaaS at runtime, as raw JSON over HTTP
- **D.** None: `dropMessageCompiler` cannot cause this

<v-click>

> ✅ **C** — The plugin only pre-compiles files matched by `include`, at build time.
> Anything arriving as a **string** at runtime needs a compiler that is no longer in
> the bundle. Either pre-compile server-side with `@intlify/message-compiler`, or
> keep the compiler and pay the ~5 KB gzipped.

</v-click>

---

# Quiz — Question 3 / 5

**A user clicks `de`, then `es` half a second later. The `de` chunk resolves last.
What do they see, and what is the fix?**

- **A.** Spanish — vue-i18n cancels the previous load
- **B.** German, because `setLocaleMessage('de')` resolved last and set the locale
- **C.** Spanish, then German for one frame
- **D.** A crash: two concurrent `setLocaleMessage` calls conflict

<v-click>

> ✅ **B** — `await import()` gives no cancellation. Two in-flight switches complete
> in network order, and the last writer wins. Keep the requested locale in a
> module-scoped `pending` variable and bail out after the await when it no longer
> matches — the same guard you write for a `watch` that fetches (chapter 3).

</v-click>

---

# Quiz — Question 4 / 5

**Why is `<p v-html="$t('cgu')" />` with a `<a>` inside the message a bad idea, even
when your translations live in the repo?**

- **A.** `v-html` does not work inside `<p>`
- **B.** vue-i18n escapes the HTML, so it renders as text
- **C.** XSS the day a message comes from an API, the link cannot be a
  `<RouterLink>`, and the translator has to maintain markup
- **D.** It doubles the bundle: `v-html` pulls in the full build

<v-click>

> ✅ **C** — Three separate problems, and the first one is a security bug waiting for
> a process change you do not control. `<i18n-t>` turns each placeholder into a named
> slot: the markup stays in the component, the word order stays in the translation.
> Turn on `strictMessage` and the build refuses HTML in messages outright.

</v-click>

---

# Quiz — Question 5 / 5

**Your app supports 12 locales. What actually lands in the initial bundle?**

- **A.** All 12 catalogues — messages are static imports
- **B.** vue-i18n's runtime + the reference locale, if the others are behind
  `import.meta.glob` and loaded on demand
- **C.** Only the runtime: vue-i18n fetches catalogues by itself
- **D.** The runtime + the compiler, always

<v-click>

> ✅ **B** — Splitting catalogues is **your** job: `import.meta.glob` (or a dynamic
> `import()` with the variable in the last path segment) gives Rollup one chunk per
> locale. `onlyLocales` prunes the ones you never ship, `treeShaking` prunes the keys
> nobody references. **D** is the default you get by doing nothing — the plugin's
> `runtimeOnly` is what removes the compiler.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 8ter - Internationalizing the invoices app — 45 min

Continue in `tp/05_router`, on the invoices application:

1. Install `vue-i18n`, create the plugin with `legacy: false`, and extract the
   hard-coded French strings of `InvoicesView` into `src/locales/fr.json` with
   namespaced keys
2. Add `en.json`, type the catalogue with `MessageSchema` + `declare module`, and
   check that removing a key from `en.json` **fails `npm run typecheck`**
3. Format the invoice amounts with `n()` and the dates with `d()`. Add a `compact`
   number format and use it in the list
4. Write the empty-state message with **three plural forms** and verify it for
   `0`, `1` and `12` in both locales — the French zero is the interesting one
5. Add a `ru` catalogue for that one key with its **four CLDR forms**, register
   `cldrRule('ru')` in `pluralRules`, and check `1`, `2`, `5` and `21`. Remove the
   rule and show which of the four the default gets wrong
6. Replace the "J'accepte les conditions" sentence with `<i18n-t>` and a real
   `<RouterLink>` inside it
7. Move the catalogues behind `import.meta.glob`, write `setLocale()` with the
   `pending` guard and the `<html lang>` update, and add `/:locale(fr|en)?` to the
   routes with a `beforeEach` that awaits it
8. Build, open the network tab, and confirm **one chunk per locale** — only the
   active one is downloaded
9. Add `@intlify/unplugin-vue-i18n` with `strictMessage` and `dropMessageCompiler`,
   rebuild, and **compare the two bundle sizes** (`npx vite-bundle-visualizer`)
10. *(Bonus)* Write two tests: one asserting the plural boundary at `0` in French,
    one mounting with a fresh `i18n` per test and switching locale

**Done when** switching the locale changes the URL, the `<html lang>`, the plurals
and the number formats — and the locale you are not using is not in the bundle.

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
