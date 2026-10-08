<script setup lang="ts">
/**
 * The shared table. Empty on purpose — nothing imports it yet.
 *
 * TODO 3: make this the ONE table of the app. It owns iteration, sorting and the
 *   empty state; it knows nothing about invoices or payments.
 *
 *   - `columns: Column[]` where `Column = { key: string; label: string; sortable?: boolean }`
 *   - `rows: T[]` — generic, so no domain type ever reaches this file
 *   - a `#row` slot receiving `{ row }`, so the CALLER decides what a row looks like
 *   - a `#toolbar` slot above the table, and an `#empty` slot for the empty state
 *   - clicking a sortable header sorts by that column, ascending then descending
 *
 *   Use `generic="T extends { id: number }"` on `<script setup>` so `#row` is
 *   typed at every call site.
 *
 * TODO 4: then delete `components/InvoiceTable.vue` and `components/PaymentTable.vue`
 *   and have both views call this one. That is **true** duplication — same
 *   markup, same reason to change.
 */
import type { Column } from './dataTable';

defineProps<{ columns: Column[] }>();
</script>

<template>
  <table data-testid="data-table">
    <thead>
      <tr>
        <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
      </tr>
    </thead>
  </table>
</template>
