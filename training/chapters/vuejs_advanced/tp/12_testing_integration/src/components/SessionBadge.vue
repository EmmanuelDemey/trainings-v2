<script setup lang="ts">
import { useSessionStore } from '@/stores/session';

const session = useSessionStore();
</script>

<template>
  <span v-if="session.isAuthenticated" class="muted" data-testid="agent-name">
    {{ session.agentName }}
    <button type="button" data-testid="sign-out" @click="session.signOut()">Sign out</button>
  </span>
  <span v-else class="muted" data-testid="anonymous">Not signed in</span>
</template>
