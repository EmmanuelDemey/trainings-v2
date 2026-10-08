<script setup lang="ts">
/**
 * Nothing to fix here. It is the component you will *drive* from the panel:
 * step 4 asks you to set this value from the Devtools instead of typing in it.
 */
const model = defineModel<string>({ required: true });
</script>

<template>
  <section>
    <h2>Filter</h2>
    <div class="row">
      <input
        v-model="model"
        type="search"
        data-testid="filter"
        placeholder="subject or requester…"
        aria-label="Filter the tickets"
      />
      <span class="muted">Try <code>billing</code>, then something that matches nothing.</span>
    </div>
  </section>
</template>
