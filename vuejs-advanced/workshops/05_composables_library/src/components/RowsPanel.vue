<script setup lang="ts">
/**
 * Consumer #3. It destructures, like every consumer does. A composable that
 * breaks when you destructure it is a composable people copy instead of reuse.
 */
import { useSortedRows } from '../composables/useSortedRows';
import { searchVehicles } from '../api/fakeApi';

const vehicles = searchVehicles('');
const { sorted, sortBy } = useSortedRows(() => vehicles);
</script>

<template>
  <section>
    <h2>Fleet</h2>
    <div class="row">
      <button type="button" data-testid="sort-plate" @click="sortBy('plate')">Sort by plate</button>
      <button type="button" data-testid="sort-battery" @click="sortBy('batteryPercent')">
        Sort by battery
      </button>
    </div>
    <table>
      <thead>
        <tr><th>Plate</th><th>Driver</th><th>Battery</th></tr>
      </thead>
      <tbody>
        <tr v-for="vehicle in sorted" :key="vehicle.id" data-testid="fleet-row">
          <td>{{ vehicle.plate }}</td>
          <td class="muted">{{ vehicle.driver }}</td>
          <td>{{ vehicle.batteryPercent }} %</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
