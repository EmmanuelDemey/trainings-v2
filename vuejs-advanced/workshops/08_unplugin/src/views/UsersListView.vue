<script setup lang="ts">
import { RouterLink } from 'vue-router';
import UserCard from '../components/UserCard.vue';
import Button from '../components/ui/Button.vue';
import { useUsers } from '../composables/useUsers';

const { users } = useUsers();
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">
      <RouterLink :to="`/users/${user.id}`"><UserCard :user="user" /></RouterLink>
    </li>
  </ul>
  <RouterLink to="/users/create"><Button variant="ghost">New user</Button></RouterLink>
</template>
