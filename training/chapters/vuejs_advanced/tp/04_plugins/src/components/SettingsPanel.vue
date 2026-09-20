<script setup lang="ts">
/**
 * The other way to reach the plugin.
 *
 * TODO 8: once `$toast` is declared (TODO 7a), add a button here that calls it
 *   **straight from the template** — no import, no composable:
 *
 *     <button type="button" data-testid="global-toast" @click="$toast('Settings saved', 'success')">
 *
 *   Then answer, in the Definition of Done: why is this the exception and not
 *   the default?
 */
</script>

<template>
  <section>
    <h2>Settings</h2>
    <p class="muted">
      This panel never imports the plugin. It is the case a global property is
      for — and the case you should be able to argue against.
    </p>
  </section>
</template>
