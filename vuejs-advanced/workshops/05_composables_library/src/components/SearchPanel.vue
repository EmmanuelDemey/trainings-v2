<script setup lang="ts">
/**
 * Consumer #1. Six keystrokes should be **one** request.
 */
import { ref, watch } from 'vue';
import { useSearchDebounce } from '../composables/useSearchDebounce';
import { searchVehicles, type Vehicle } from '../api/fakeApi';

const { value: query, debounced } = useSearchDebounce('');
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
      </span>
    </div>
    <ul>
      <li v-for="vehicle in results" :key="vehicle.id">{{ vehicle.plate }} — {{ vehicle.driver }}</li>
    </ul>
  </section>
</template>
