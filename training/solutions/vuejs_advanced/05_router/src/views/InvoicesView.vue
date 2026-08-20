<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { fetchInvoices, type Invoice } from '@/api/fakeApi';

/** Named so `<KeepAlive :include="['InvoicesView']">` can target it. */
defineOptions({ name: 'InvoicesView' });

const invoices = ref<Invoice[]>([]);
const filter = ref('');
const loading = ref(true);

const visible = computed(() =>
  invoices.value.filter((i) => i.customer.toLowerCase().includes(filter.value.toLowerCase())),
);

onMounted(async () => {
  invoices.value = await fetchInvoices();
  loading.value = false;
});
</script>

<template>
  <section>
    <h2>Invoices</h2>

    <input v-model="filter" data-testid="filter" placeholder="Filter by customer" />

    <p v-if="loading" class="muted">Loading…</p>

    <table v-else>
      <tbody>
        <tr v-for="invoice in visible" :key="invoice.id">
          <td>
            <RouterLink
              :to="{ name: 'invoice', params: { id: invoice.id } }"
              :data-testid="`invoice-${invoice.id}`"
            >
              #{{ invoice.id }} — {{ invoice.customer }}
            </RouterLink>
          </td>
          <td>{{ invoice.total.toFixed(2) }} €</td>
          <td class="muted">{{ invoice.status }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Filler, so the page is tall enough to make scrollBehavior observable. -->
    <div style="height: 900px" />
    <p id="bottom" class="muted">
      Bottom of the list. Navigate away and come back with the browser's Back
      button: with a correct <code>scrollBehavior</code>, you land here again.
    </p>
  </section>
</template>
