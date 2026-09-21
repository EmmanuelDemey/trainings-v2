<script setup lang="ts">
// TODO 3: once auto-import and auto-components are wired, every import in this
//   file is derivable. Delete them, one by one, and watch the app keep working.
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
