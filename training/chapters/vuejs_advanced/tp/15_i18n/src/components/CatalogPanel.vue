<script setup lang="ts">
/**
 * Numbers, three ways.
 *
 * TODO 8: replace `naiveEuros` with `n(price, 'currency')`, the discount with
 *   `n(rate, 'percent')` and the view count with `n(views, 'compact')`. The
 *   formats are **named once** in `createI18n` — no `Intl` options at a call
 *   site, and one place to change when finance asks for four decimals.
 */
import { naiveEuros, naiveT } from '../i18n/naive';

const products = [
  { id: 'p1', name: 'Escabeau', price: 1234.5, discountRate: 0.15, views: 12800 },
  { id: 'p2', name: 'Perceuse', price: 89.9, discountRate: 0.05, views: 3400 },
  { id: 'p3', name: 'Ponceuse', price: 249, discountRate: 0.2, views: 940 },
];
</script>

<template>
  <section>
    <h2>{{ naiveT('app.title') }}</h2>
    <p class="muted" data-testid="currency-note">{{ naiveT('legal.currencyNote') }}</p>

    <table>
      <tbody>
        <tr v-for="product in products" :key="product.id" data-testid="product-row">
          <td>{{ product.name }}</td>
          <td data-testid="product-price">{{ naiveEuros(product.price) }}</td>
          <td class="muted" data-testid="product-discount">{{ product.discountRate }}</td>
          <td class="muted" data-testid="product-views">{{ product.views }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
