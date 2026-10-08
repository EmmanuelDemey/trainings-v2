<script setup lang="ts">
/**
 * Throws during **render** when the data is bad — the most common real-world
 * case, and the one that blanks a page when nothing catches it.
 */
import { computed } from 'vue';

const props = defineProps<{ rows: { label: string; amount: number }[] | null }>();

const total = computed(() =>
  // `rows` is null when the API answered with an empty body. Reading `.reduce`
  // on it is exactly the kind of line that reaches production.
  props.rows!.reduce((sum, row) => sum + row.amount, 0),
);
</script>

<template>
  <div data-testid="totals">Total: {{ total }} €</div>
</template>
