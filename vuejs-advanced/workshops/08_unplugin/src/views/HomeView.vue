<script setup lang="ts">
// TODO 2.2: once auto-import is wired (step 2), the `vue` and composable
//   imports below are derivable — and `RouterLink` is already global, registered
//   by `app.use(router)`. Delete them, one by one, and watch the app keep working.
// TODO 3.2: once auto-components are wired (step 3), so is the `Button` import.
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import Button from '../components/ui/Button.vue';
import { useUsers } from '../composables/useUsers';

const { count } = useUsers();
const clicks = ref(0);
const label = computed(() => `Clicked ${clicks.value} time(s)`);
</script>

<template>
  <section>
    <h2>Home</h2>
    <p><strong data-testid="user-count">{{ count }}</strong> users in the directory</p>
    <div class="row">
      <Button @click="clicks++">{{ label }}</Button>
      <RouterLink to="/users">Browse users</RouterLink>
    </div>
  </section>
</template>
