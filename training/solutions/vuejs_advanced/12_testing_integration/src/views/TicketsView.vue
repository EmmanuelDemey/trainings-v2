<script setup lang="ts">
import { onMounted } from 'vue';
import TicketTable from '@/components/TicketTable.vue';
import { useTicketsStore } from '@/stores/tickets';

const tickets = useTicketsStore();

onMounted(() => {
  void tickets.load();
});
</script>

<template>
  <section>
    <h2>Queue <span class="muted" data-testid="open-count">({{ tickets.openCount }} open)</span></h2>

    <p v-if="tickets.loading" data-testid="loading">Loading…</p>
    <p v-else-if="tickets.error" class="error" data-testid="error">{{ tickets.error }}</p>
    <TicketTable v-else :tickets="tickets.tickets" @close="tickets.close($event)" />
  </section>
</template>
