import { ref } from 'vue';
import { defineStore } from 'pinia';
import { loadPayments } from '../api/fakeApi';
import type { Payment } from '../types';

/** TODO 2: and this one to `features/payments/stores/`. */
export const usePaymentsStore = defineStore('payments', () => {
  const payments = ref<Payment[]>(loadPayments());

  return { payments };
});
