<script setup lang="ts">
/**
 * The other way to reach the plugin: no import, no composable, straight from the
 * template. It reads well — and it is the exception, not the default. It needs a
 * module augmentation to be typed, it cannot be overridden for one subtree, and
 * it is never tree-shaken. Spend one, on the call you make all day.
 */
</script>

<template>
  <section>
    <h2>Settings</h2>
    <div class="row">
      <button
        type="button"
        data-testid="global-toast"
        @click="$toast('Settings saved', 'success')"
      >
        Save settings
      </button>
    </div>
    <p class="muted">
      This panel never imports the plugin. It is the case a global property is
      for — and the case you should be able to argue against.
    </p>
  </section>
</template>
