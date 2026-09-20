<script setup lang="ts">
import { actionLog } from '@/plugins/logger';
</script>

<template>
  <section>
    <h2>6 — Plugins: observability</h2>

    <p v-if="actionLog.length === 0" class="muted" data-testid="empty-log">
      Nothing logged yet — <code>loggerPlugin</code> fills this table on every
      action call. Load the catalog or add a product to the cart.
    </p>

    <table v-else>
      <thead>
        <tr><th>Store</th><th>Action</th><th>Duration</th><th>Result</th></tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in actionLog.slice(-12).reverse()" :key="index">
          <td class="muted">{{ entry.store }}</td>
          <td>{{ entry.name }}</td>
          <td>{{ entry.durationMs }} ms</td>
          <td :class="{ error: entry.failed }">{{ entry.failed ? 'failed' : 'ok' }}</td>
        </tr>
      </tbody>
    </table>

    <p class="muted">
      To see a failure, set <code>failureSwitch.products = true</code> in
      <code>src/api/fakeApi.ts</code> and reload the catalog.
    </p>
  </section>
</template>
