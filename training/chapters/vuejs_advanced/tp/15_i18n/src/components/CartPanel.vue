<script setup lang="ts">
/**
 * The plural. `t('cart.items', count)` picks the form; `count` and `n` are
 * injected into the message automatically from the number you pass.
 *
 * TODO 7: replace `naiveT` with the real thing, and render
 *   `{{ count }} {{ t('cart.items', count) }}` — then set the count to 0 in
 *   French and read what comes out.
 */
import { ref } from 'vue';
import { naiveT } from '../i18n/naive';

const count = ref(0);
</script>

<template>
  <section>
    <h2>{{ naiveT('cart.empty') }}</h2>
    <div class="row">
      <button type="button" data-testid="remove-item" @click="count = Math.max(0, count - 1)">-</button>
      <strong data-testid="cart-count">{{ count }}</strong>
      <button type="button" data-testid="add-item" @click="count += 1">+</button>
      <span data-testid="cart-items">{{ count }} {{ naiveT('cart.items') }}</span>
    </div>
  </section>
</template>
