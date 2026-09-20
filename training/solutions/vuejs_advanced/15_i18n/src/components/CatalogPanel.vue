<script setup lang="ts">
/**
 * Three numbers, three named formats, zero `Intl` options at the call site.
 * When finance asks for four decimals, there is one place to change.
 */
import { useI18n } from 'vue-i18n';

const { t, n } = useI18n();

const products = [
  { id: 'p1', name: 'Escabeau', price: 1234.5, discountRate: 0.15, views: 12800 },
  { id: 'p2', name: 'Perceuse', price: 89.9, discountRate: 0.05, views: 3400 },
  { id: 'p3', name: 'Ponceuse', price: 249, discountRate: 0.2, views: 940 },
];
</script>

<template>
  <section>
    <h2>{{ t('app.title') }}</h2>
    <p class="muted" data-testid="currency-note">{{ t('legal.currencyNote') }}</p>

    <table>
      <tbody>
        <tr v-for="product in products" :key="product.id" data-testid="product-row">
          <td>{{ product.name }}</td>
          <td data-testid="product-price">{{ n(product.price, 'currency') }}</td>
          <td class="muted" data-testid="product-discount">{{ n(product.discountRate, 'percent') }}</td>
          <td class="muted" data-testid="product-views">{{ n(product.views, 'compact') }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
