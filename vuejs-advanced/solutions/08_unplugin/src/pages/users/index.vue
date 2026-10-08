<script setup lang="ts">
/** `users/index.vue` → `/users`, as a child of the layout. Lowercase, always. */
const { users } = useUsers();
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">
      <RouterLink :to="`/users/${user.id}`"><UserCard :user="user" /></RouterLink>
    </li>
  </ul>
  <RouterLink to="/users/create"><UiButton variant="ghost">New user</UiButton></RouterLink>
</template>
