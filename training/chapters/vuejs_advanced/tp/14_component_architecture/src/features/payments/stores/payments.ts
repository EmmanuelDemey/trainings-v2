import { ref } from 'vue';
import { defineStore } from 'pinia';
import { loadPayments } from '../api';
import type { Payment } from '../types';

export const usePaymentsStore = defineStore('payments', () => {
  const payments = ref<Payment[]>(loadPayments());

  return { payments };
});
