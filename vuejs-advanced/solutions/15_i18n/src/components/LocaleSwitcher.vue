<script setup lang="ts">
/**
 * `locale` is a **ref**. Assigning `i18n.global.locale = 'en'` instead of
 * `.value` is the single most common vue-i18n bug: nothing throws, nothing
 * re-renders, and you go looking in the catalogue.
 */
import { useI18n } from 'vue-i18n';
import { setLocale } from '../i18n/setLocale';
import { LOCALE_LABELS, SUPPORTED, type SupportedLocale } from '../i18n/supported';

const { locale } = useI18n();

function pick(next: SupportedLocale): void {
  void setLocale(next);
}
</script>

<template>
  <div class="row">
    <button
      v-for="supported in SUPPORTED"
      :key="supported"
      type="button"
      :data-testid="`locale-${supported}`"
      :aria-pressed="locale === supported"
      @click="pick(supported)"
    >
      {{ LOCALE_LABELS[supported] }}
    </button>
  </div>
</template>
