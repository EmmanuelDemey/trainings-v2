<script setup lang="ts">
import { ref } from 'vue';

const invoices = ref([
  { id: 1, customer: 'Acme', total: 1240.5 },
  { id: 2, customer: 'Globex', total: 89.9 },
  { id: 3, customer: 'Initech', total: 4300 },
]);
</script>

<template>
  <section>
    <h2>Invoices</h2>
    <ul>
      <li v-for="invoice in invoices" :key="invoice.id">
        {{ invoice.customer }} — {{ invoice.total.toFixed(2) }} €
      </li>
    </ul>
  </section>
</template>
