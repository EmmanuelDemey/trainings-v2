<script setup lang="ts">
import { useInvoicesStore } from '../stores/invoices';

const invoices = useInvoicesStore();
</script>

<template>
  <label class="row">
    <input v-model="invoices.onlyLate" type="checkbox" data-testid="only-late" />
    Late invoices only
  </label>
</template>
