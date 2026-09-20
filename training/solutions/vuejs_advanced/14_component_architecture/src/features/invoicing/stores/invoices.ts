import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { loadInvoices } from '../api';
import type { Invoice } from '../types';

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref<Invoice[]>(loadInvoices());
  const onlyLate = ref(false);

  const visible = computed(() =>
    onlyLate.value ? invoices.value.filter((invoice) => invoice.status === 'late') : invoices.value,
  );

  const total = computed(() => visible.value.reduce((sum, invoice) => sum + invoice.amountCents, 0));

  return { invoices, onlyLate, visible, total };
});
