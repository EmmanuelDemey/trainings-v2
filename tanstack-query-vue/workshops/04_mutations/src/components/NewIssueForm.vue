<script setup lang="ts">
import { ref } from 'vue';
import { createIssue } from '@/api/fakeApi';

const title = ref('');

// TODO (step 1) — `useCreateIssue()` instead of calling the API by hand. Today
// the issue IS created on the server, and nothing on screen knows: the list
// does not show it, the counter in the header keeps lying.
// TODO (step 2) — `mutate(variables, { onSuccess })`: clear the input there,
// and only there. Show `error.message` in `create-error`.
// TODO (step 3) — disable `create-submit` while `isPending`.
async function submit(): Promise<void> {
  const input = { title: title.value };
  // Cleared BEFORE the server answered: a refused write loses what was typed.
  title.value = '';
  try {
    await createIssue(input);
  } catch {
    // Swallowed: nobody tells the user.
  }
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <input v-model="title" data-testid="new-title" placeholder="Title of the new issue" aria-label="Title" />
    <button type="submit" data-testid="create-submit">Create</button>
  </form>
  <!-- TODO (step 2) — <p class="error" data-testid="create-error">…</p> -->
</template>
