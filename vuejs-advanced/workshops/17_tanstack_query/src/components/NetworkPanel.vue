<script setup lang="ts">
import { computed } from 'vue';
import { apiLog, failureSwitch } from '@/api/fakeApi';

const counts = computed(() => {
  const byRequest = new Map<string, number>();
  for (const request of apiLog) byRequest.set(request, (byRequest.get(request) ?? 0) + 1);
  return [...byRequest];
});

function clear(): void {
  apiLog.splice(0, apiLog.length);
}
</script>

<template>
  <section>
    <h2>Network</h2>

    <div class="row">
      <label>
        <input v-model="failureSwitch.status" type="checkbox" data-testid="failure-switch" />
        The server refuses status changes
      </label>
      <button type="button" @click="clear">Clear the log</button>
    </div>

    <p v-if="counts.length === 0" class="muted">No request yet.</p>
    <table v-else>
      <thead>
        <tr><th>Request</th><th>Sent</th></tr>
      </thead>
      <tbody>
        <tr v-for="[request, count] in counts" :key="request">
          <td><code>{{ request }}</code></td>
          <td :class="{ error: count > 1 && request.startsWith('GET') }">{{ count }}×</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
