<script setup lang="ts">
/** `users/[id].vue` → `/users/:id`, named `/users/[id]`. */
import { findUser } from '@/api/fakeApi';

const route = useRoute('/users/[id]');
const user = computed(() => findUser(String(route.params.id)));
</script>

<template>
  <UserCard v-if="user" :user="user" />
  <p v-else class="error" data-testid="unknown-user">No such user.</p>
</template>
