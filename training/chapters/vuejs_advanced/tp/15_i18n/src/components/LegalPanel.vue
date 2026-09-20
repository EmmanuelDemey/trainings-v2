<script setup lang="ts">
/**
 * The message syntax, on one screen: named, list, linked, modifier, escaped.
 *
 * TODO 9: replace `naiveT` here too. Then fix the two broken messages in
 *   `src/locales/fr.json`:
 *
 *   - `"accept": "J'accepte les @:tos."` — a linked key runs until a **space**,
 *     so this looks up `tos.` (dot included) and renders the raw key. Wrap it:
 *     `@:{'legal.tos'}`. The English and German catalogues already do.
 *   - `"currencyNote": "Les prix sont exprimés en {devise}"` — `{` and `}` are
 *     syntax. To print them, escape them: `{'{'}devise{'}'}`.
 */
import { naiveT } from '../i18n/naive';
</script>

<template>
  <section>
    <h2>Legal</h2>
    <p data-testid="greeting">{{ naiveT('app.greeting') }}</p>
    <p data-testid="opening">{{ naiveT('app.openingRange') }}</p>
    <p data-testid="accept">{{ naiveT('legal.accept') }}</p>
    <p data-testid="shout">{{ naiveT('legal.shout') }}</p>
  </section>
</template>
