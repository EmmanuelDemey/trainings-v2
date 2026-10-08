<script setup lang="ts">
import PaymentTable from '../components/PaymentTable.vue';
import { usePaymentsStore } from '@/features/payments';

const payments = usePaymentsStore();
</script>

<template>
  <section>
    <h2>Payments</h2>
    <PaymentTable :payments="payments.payments" />
  </section>
</template>
