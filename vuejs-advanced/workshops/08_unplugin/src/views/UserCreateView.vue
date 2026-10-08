<script setup lang="ts">
/**
 * This view exists, and no URL reaches it: the hand-written routes array forgot
 * it. That is the failure mode of ceremony — the file system and the array drift
 * apart, and nothing tells you.
 *
 * It must be reachable at `/users/create`, WITHOUT the users layout around it.
 */
import Button from '../components/ui/Button.vue';
</script>

<template>
  <section>
    <h2 data-testid="create-user">New user</h2>
    <Button>Save</Button>
  </section>
</template>
