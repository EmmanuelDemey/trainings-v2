<script setup lang="ts">
/**
 * Consumer #1, migrated. Six keystrokes are one request — and the panel no
 * longer owns a single line of debouncing.
 */
import { ref, watch } from 'vue';
import { useDebounced } from '../packages/acme';
import { searchVehicles, type Vehicle } from '../api/fakeApi';

const query = ref('');
const { value: debounced, pending } = useDebounced(query);

const results = ref<Vehicle[]>(searchVehicles(''));

watch(debounced, (needle) => {
  results.value = searchVehicles(needle);
});
</script>

<template>
  <section>
    <h2>Search</h2>
    <div class="row">
      <input
        v-model="query"
        type="search"
        data-testid="search"
        placeholder="plate or driver…"
        aria-label="Search the fleet"
      />
      <span class="muted">
        <strong data-testid="result-count">{{ results.length }}</strong> vehicle(s)
        <span v-if="pending" data-testid="pending"> — typing…</span>
      </span>
    </div>
    <ul>
      <li v-for="vehicle in results" :key="vehicle.id">{{ vehicle.plate }} — {{ vehicle.driver }}</li>
    </ul>
  </section>
</template>
