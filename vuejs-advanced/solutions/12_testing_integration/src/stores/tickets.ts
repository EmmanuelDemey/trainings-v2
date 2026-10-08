import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { closeTicket, fetchTickets, type Ticket } from '@/api/client';

export const useTicketsStore = defineStore('tickets', () => {
  const tickets = ref<Ticket[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const openCount = computed(() => tickets.value.filter((t) => t.status === 'open').length);
  const isEmpty = computed(() => !loading.value && error.value === null && tickets.value.length === 0);

  async function load(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      tickets.value = await fetchTickets();
    } catch {
      error.value = 'The ticket list could not be loaded.';
      tickets.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function close(id: number): Promise<void> {
    const updated = await closeTicket(id);
    tickets.value = tickets.value.map((ticket) => (ticket.id === id ? updated : ticket));
  }

  return { tickets, loading, error, openCount, isEmpty, load, close };
});
