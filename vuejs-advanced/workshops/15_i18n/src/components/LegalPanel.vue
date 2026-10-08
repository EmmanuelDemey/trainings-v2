<script setup lang="ts">
/**
 * The message syntax, on one screen: named, list, linked, modifier, escaped.
 *
 * Two of these are easy to break in a catalogue, and both failures look the
 * same on screen — the raw key, or a missing word:
 *
 *   "@:legal.tos."        a linked key runs until a SPACE: the dot was part of it
 *   "{devise}"            `{` and `}` are syntax; to print them, escape them
 */
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <section>
    <h2>Legal</h2>
    <p data-testid="greeting">{{ t('app.greeting', { name: 'Manu' }) }}</p>
    <p data-testid="opening">{{ t('app.openingRange', ['lundi', 'vendredi']) }}</p>
    <p data-testid="accept">{{ t('legal.accept') }}</p>
    <p data-testid="shout">{{ t('legal.shout') }}</p>
  </section>
</template>
