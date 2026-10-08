<script setup lang="ts" generic="T extends { id: number }">
/**
 * The one table. It owns iteration, sorting and the empty state, and it knows
 * nothing about invoices or payments: `T` is generic, the columns are strings,
 * and what a row **looks** like is the caller's business.
 *
 * That is the whole point of the `#row` slot: a new variant is a new caller,
 * not a new prop — and not a third copy of this file.
 */
import { computed, ref } from 'vue';
import type { Column } from './dataTable';

const props = defineProps<{ rows: T[]; columns: Column[] }>();

const sortKey = ref<string | null>(null);
const descending = ref(false);

function valueOf(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

function compare(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

const sorted = computed(() => {
  const key = sortKey.value;
  if (key === null) return props.rows;

  const rows = [...props.rows].sort((a, b) => compare(valueOf(a, key), valueOf(b, key)));
  return descending.value ? rows.reverse() : rows;
});

function sortBy(column: Column): void {
  if (!column.sortable) return;
  if (sortKey.value === column.key) descending.value = !descending.value;
  else {
    sortKey.value = column.key;
    descending.value = false;
  }
}
</script>

<template>
  <div v-if="$slots.toolbar" class="row"><slot name="toolbar" /></div>

  <slot v-if="sorted.length === 0" name="empty">
    <p class="muted">Nothing to show</p>
  </slot>

  <table v-else data-testid="data-table">
    <thead>
      <tr>
        <th
          v-for="column in columns"
          :key="column.key"
          :data-testid="column.sortable ? `sort-${column.key}` : undefined"
          @click="sortBy(column)"
        >
          {{ column.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in sorted" :key="row.id" data-testid="row">
        <slot name="row" :row="row" />
      </tr>
    </tbody>
  </table>
</template>
