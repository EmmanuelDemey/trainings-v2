<script setup lang="ts">
/**
 * `src/pages/index.vue` → `/`, named `/`.
 *
 * Not one import left: `ref` and `computed` come from the `vue` preset,
 * `useUsers` from `dirs: ['src/composables']`, `<UiButton>` from
 * `directoryAsNamespace`, and `<RouterLink>` from the router itself. Every one
 * of them is a **real** generated import, so the bundle still tree-shakes.
 */
const { count } = useUsers();
const clicks = ref(0);
const label = computed(() => `Clicked ${clicks.value} time(s)`);
</script>

<template>
  <section>
    <h2>Home</h2>
    <p><strong data-testid="user-count">{{ count }}</strong> users in the directory</p>
    <div class="row">
      <UiButton @click="clicks++">{{ label }}</UiButton>
      <RouterLink to="/users">Browse users</RouterLink>
    </div>
  </section>
</template>
