<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { Invoice, InvoiceStatus } from '@/api/fakeApi';

const STATUSES: InvoiceStatus[] = ['draft', 'sent', 'paid', 'late'];

defineProps<{ invoices: Invoice[] }>();

const emit = defineEmits<{ 'update-status': [id: number, status: InvoiceStatus] }>();

function onChange(id: number, event: Event): void {
  emit('update-status', id, (event.target as HTMLSelectElement).value as InvoiceStatus);
}
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Reference</th>
        <th>Customer</th>
        <th>Due</th>
        <th>Amount</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(invoice, index) in invoices" :key="index" :data-testid="`row-${invoice.id}`">
        <td>
          <RouterLink :to="{ name: 'invoice', params: { id: invoice.id } }">
            {{ invoice.number }}
          </RouterLink>
        </td>
        <td>{{ invoice.customer }}</td>
        <td>{{ invoice.dueDate }}</td>
        <td>{{ invoice.amount.toFixed(2) }} €</td>
        <td>
          <select :value="invoice.status" @change="onChange(invoice.id, $event)">
            <option v-for="status in STATUSES" :key="status" :value="status">{{ status }}</option>
          </select>
        </td>
      </tr>
      <tr v-if="invoices.length === 0">
        <td colspan="5" class="muted">No invoice matches this filter.</td>
      </tr>
    </tbody>
  </table>
</template>
