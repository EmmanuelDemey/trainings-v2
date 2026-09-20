<script setup lang="ts">
/**
 * TODO 6: wire these buttons to `setLocale()`, and mark the active one. Today
 *   they do nothing, which is the honest state of an app with a hard-coded
 *   dictionary.
 */
import { LOCALE_LABELS, SUPPORTED, type SupportedLocale } from '../i18n/supported';

const current: SupportedLocale = 'fr';

function pick(locale: SupportedLocale): void {
  void locale;
}
</script>

<template>
  <div class="row">
    <button
      v-for="locale in SUPPORTED"
      :key="locale"
      type="button"
      :data-testid="`locale-${locale}`"
      :aria-pressed="current === locale"
      @click="pick(locale)"
    >
      {{ LOCALE_LABELS[locale] }}
    </button>
  </div>
</template>
