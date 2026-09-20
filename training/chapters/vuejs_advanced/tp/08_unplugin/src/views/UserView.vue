<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import UserCard from '../components/UserCard.vue';
import { findUser } from '../api/fakeApi';

const route = useRoute();
const user = computed(() => findUser(String(route.params.id)));
</script>

<template>
  <UserCard v-if="user" :user="user" />
  <p v-else class="error" data-testid="unknown-user">No such user.</p>
</template>
