<script setup lang="ts">
/**
 * This component uses a TOP-LEVEL await in `setup`, which makes it an async
 * component in the `Suspense` sense: any parent `<Suspense>` will show its
 * fallback until this promise resolves.
 */
import { fetchUser, type User } from '@/api/fakeApi';

const props = defineProps<{ id: number }>();

const user: User = await fetchUser(props.id);
</script>

<template>
  <div data-testid="user-profile">
    <p><strong>{{ user.name }}</strong> <span class="muted">({{ user.role }})</span></p>
    <p class="muted">{{ user.email }}</p>
  </div>
</template>
