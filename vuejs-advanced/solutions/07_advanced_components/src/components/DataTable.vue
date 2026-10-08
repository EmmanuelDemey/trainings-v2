<script setup lang="ts" generic="T extends { id: number }">
/**
 * STEP 3 — Scoped slots
 *
 * A headless table: it owns the iteration, the sorting and the empty state.
 * The PARENT owns the markup of every cell, through a scoped slot.
 *
 * Read the template below and note what is NOT there: no currency, no status
 * badge, no `Invoice`. That is the test of a headless component — it can be
 * dropped into another domain without a diff.
 */
import { computed, ref } from 'vue';
import type { Column } from './table';

const props = defineProps<{
  rows: T[];
  columns: Column<T>[];
}>();

/**
 * `defineSlots` is what carries the generic `T` across the slot boundary: the
 * parent's `<template #cell="{ row }">` gets `row: Invoice`, not `any`. Without
 * it the slot props are untyped and `row.nope` compiles happily.
 */
defineSlots<{
  cell(props: { row: T; column: Column<T>; value: unknown }): unknown;
  empty?(): unknown;
}>();

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
        `$slots.empty` guards the whole row: a parent that provides no `empty`
        slot gets the default message rather than an empty <tr> with a stray
        colspan. The slot is declared optional in `defineSlots`, so this check
        is not paranoia — it is the contract.
      -->
      <tr v-if="sortedRows.length === 0" data-testid="empty-row">
        <td :colspan="columns.length">
          <slot v-if="$slots.empty" name="empty" />
          <span v-else class="muted">No data</span>
        </td>
      </tr>

      <tr v-for="row in sortedRows" :key="row.id">
        <td v-for="column in columns" :key="column.key">
          <!--
            The scoped slot exposes everything the parent could need, and keeps
            the raw value as FALLBACK content: a parent that only wants to
            customise one column does not have to re-implement the other four.
          -->
          <slot name="cell" :row="row" :column="column" :value="row[column.key]">
            {{ row[column.key] }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>
