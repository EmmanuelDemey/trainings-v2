<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

const customer = ref('');
const total = ref('');

/** A form is "dirty" as soon as the user typed something. */
const isDirty = computed(() => customer.value !== '' || total.value !== '');

/** Set by a successful submit, so saving does not trigger the "unsaved" prompt. */
const saved = ref(false);

// …and cleared as soon as the user types again, otherwise one save disarms the
// guard for the rest of the page's life.
watch([customer, total], () => {
  saved.value = false;
});

/**
 * Blocks an in-app navigation away from a dirty form.
 *
 * The exit it does NOT cover: closing the tab, hitting reload, or typing
 * another URL in the address bar. Those never reach the router — the page is
 * being torn down by the browser, not navigated by Vue. The only hook there is
 * `beforeunload`, and the browser ignores your message and shows its own
 * generic dialog:
 *
 *   useEventListener(window, 'beforeunload', (e) => { if (isDirty.value) e.preventDefault(); });
 *
 * The browser's Back button DOES go through this guard — vue-router intercepts
 * `popstate`. Worth trying, because the history entry has already moved by then
 * and the router has to push it back.
 */
onBeforeRouteLeave(() => {
  if (!isDirty.value || saved.value) return true;

  // `confirm` blocks the thread and cannot be styled — a real app renders its
  // own dialog and returns a promise here, which the guard awaits.
  return window.confirm('You have unsaved changes. Leave this page anyway?');
});

function onSubmit(): void {
  saved.value = true;
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
