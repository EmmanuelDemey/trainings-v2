<script setup lang="ts">
import { ref } from 'vue';
import { useCreateIssue } from '@/queries/issues';

const title = ref('');

// TODO (step 3) — also take `variables`, and show it as `pending-issue` (the
// title, greyed out) while `isPending`. Today, nothing shows up until the POST
// AND the refetch are back.
const { mutate: create, isPending, error } = useCreateIssue();

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
  <!-- TODO (step 3) —
  <ul class="issues">
    <li class="pending" data-testid="pending-issue">…the title being created…</li>
  </ul> -->
  <form class="form" @submit.prevent="submit">
    <input v-model="title" data-testid="new-title" placeholder="Title of the new issue" aria-label="Title" />
    <button type="submit" data-testid="create-submit" :disabled="isPending">Create</button>
  </form>
  <p v-if="error" class="error" data-testid="create-error">{{ error.message }}</p>
</template>
