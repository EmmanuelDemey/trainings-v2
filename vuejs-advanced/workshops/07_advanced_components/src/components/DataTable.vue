<script setup lang="ts" generic="T extends { id: number }">
/**
 * STEP 3 — Scoped slots
 *
 * A headless table: it owns the iteration, the sorting and the empty state.
 * The PARENT owns the markup of every cell, through a scoped slot.
 */
import { computed, ref } from 'vue';
import type { Column } from './table';

const props = defineProps<{
  rows: T[];
  columns: Column<T>[];
}>();

// TODO 3.1: declare the slots with `defineSlots` so the parent gets
//   autocompletion and type errors:
//
//   defineSlots<{
//     cell(props: { row: T; column: Column<T>; value: unknown }): unknown;
//     empty?(): unknown;
//   }>();

// Stored as a plain string: `ref<keyof T>` degrades to `any` under a generic
// component, which silently disables type checking on the indexing below.
const sortKey = ref<string | null>(null);
const sortAsc = ref(true);

const sortedRows = computed<T[]>(() => {
  const key = sortKey.value as (keyof T & string) | null;
  if (key === null) return props.rows;

  return [...props.rows].sort((a, b) => {
    const result = String(a[key]).localeCompare(String(b[key]), undefined, { numeric: true });
    return sortAsc.value ? result : -result;
  });
});

function toggleSort(column: Column<T>): void {
  if (!column.sortable) return;
  if (sortKey.value === column.key) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortKey.value = column.key;
    sortAsc.value = true;
  }
}
</script>

<template>
  <table data-testid="data-table">
    <thead>
      <tr>
        <th
          v-for="column in columns"
          :key="column.key"
          :style="{ cursor: column.sortable ? 'pointer' : 'default' }"
          @click="toggleSort(column)"
        >
          {{ column.label }}
          <span v-if="sortKey === column.key">{{ sortAsc ? '▲' : '▼' }}</span>
        </th>
      </tr>
    </thead>

    <tbody>
      <!--
        TODO 3.2: render an `empty` slot (with a sensible fallback) when
          `sortedRows` is empty. Use `$slots.empty` to decide whether to render
          the wrapping row at all.
      -->
      <tr v-for="row in sortedRows" :key="row.id">
        <td v-for="column in columns" :key="column.key">
          <!--
            TODO 3.3: replace this raw output by a `cell` scoped slot exposing
              `row`, `column` and `value`, keeping the raw value as fallback
              content. The parent can then render a badge for the status, a
              formatted amount for the total, a link for the customer...
          -->
          {{ row[column.key] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
