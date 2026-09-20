<script setup lang="ts">
/**
 * The file **beside** the folder: `users.vue` next to `users/`. It becomes the
 * parent record of everything in `users/`, and its `<RouterView />` is where
 * the children render. Delete this file and the URLs stay exactly the same —
 * only the layout goes.
 */
</script>

<template>
  <section>
    <h2 data-testid="users-layout">Users</h2>
    <RouterView />
  </section>
</template>
