<script setup lang="ts">
import { computed, ref } from 'vue';

const customer = ref('');
const total = ref('');

/** A form is "dirty" as soon as the user typed something. */
const isDirty = computed(() => customer.value !== '' || total.value !== '');

// TODO 6.3: block navigation away from a dirty form with `onBeforeRouteLeave`.
//   - import it from 'vue-router'
//   - return `false` when the user cancels the confirm dialog
//   - do NOT block when the form was just submitted (add a `saved` flag)
//
//   Test all three exits: a nav link, the browser's Back button, and a
//   successful submit. Which one does the guard NOT cover, and why?

function onSubmit(): void {
  customer.value = '';
  total.value = '';
}
</script>

<template>
  <section>
    <h2>New invoice</h2>

    <form @submit.prevent="onSubmit">
      <div class="row" style="margin-bottom: 0.75rem">
        <label>Customer <input v-model="customer" data-testid="customer" /></label>
      </div>
      <div class="row" style="margin-bottom: 0.75rem">
        <label>Total <input v-model="total" data-testid="total" type="number" step="0.01" /></label>
      </div>
      <button type="submit" data-testid="save">Save</button>
    </form>

    <p class="muted" data-testid="dirty-state">
      Form state: {{ isDirty ? 'unsaved changes' : 'clean' }}
    </p>
  </section>
</template>
