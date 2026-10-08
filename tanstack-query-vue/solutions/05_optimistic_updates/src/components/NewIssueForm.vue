<script setup lang="ts">
import { ref } from 'vue';
import { useCreateIssue } from '@/queries/issues';

const title = ref('');

// `variables`: what the last `mutate()` received — here, the title being
// created. Shown while `isPending`, it IS the optimistic row: no cache write,
// so nothing to roll back. On failure it just disappears, and the error shows.
const { mutate: create, isPending, variables, error } = useCreateIssue();

function submit(): void {
  create(
    { title: title.value },
    {
      onSuccess: () => {
        title.value = '';
      },
    },
  );
}
</script>

<template>
  <ul v-if="isPending && variables" class="issues">
    <li class="pending" data-testid="pending-issue">
      <span>{{ variables.title }}</span>
      <span>saving…</span>
    </li>
  </ul>
  <form class="form" @submit.prevent="submit">
    <input v-model="title" data-testid="new-title" placeholder="Title of the new issue" aria-label="Title" />
    <button type="submit" data-testid="create-submit" :disabled="isPending">Create</button>
  </form>
  <p v-if="error" class="error" data-testid="create-error">{{ error.message }}</p>
</template>
