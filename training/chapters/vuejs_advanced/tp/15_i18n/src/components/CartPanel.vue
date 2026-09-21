<script setup lang="ts">
/**
 * `t('cart.items', count)` picks the form. The number you pass is injected into
 * the message as both `count` and `n`, so `"{count} items"` fills itself in:
 *
 *   // createMessageContext, vue-i18n 11.4
 *   if (isNumber(options.pluralIndex)) {
 *     _named.count ||= options.pluralIndex;
 *     _named.n     ||= options.pluralIndex;
 *   }
 */
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const count = ref(0);
</script>

<template>
  <section>
    <h2>{{ t('cart.empty') }}</h2>
    <div class="row">
      <button type="button" data-testid="remove-item" @click="count = Math.max(0, count - 1)">-</button>
      <strong data-testid="cart-count">{{ count }}</strong>
      <button type="button" data-testid="add-item" @click="count += 1">+</button>
      <span data-testid="cart-items">{{ count }} {{ t('cart.items', count) }}</span>
    </div>
  </section>
</template>
