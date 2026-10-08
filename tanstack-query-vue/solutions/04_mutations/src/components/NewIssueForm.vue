<script setup lang="ts">
import { ref } from 'vue';
import { useCreateIssue } from '@/queries/issues';

const title = ref('');

const { mutate: create, isPending, error } = useCreateIssue();

function submit(): void {
  create(
    { title: title.value },
    {
      // The callbacks of `mutate()` run AFTER those of `useMutation`, and only
      // if this component is still mounted: the place for what concerns THIS
      // screen. The input is cleared once the server accepted the issue — a
      // refused write keeps what the user typed.
      onSuccess: () => {
        title.value = '';
      },
    },
  );
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <input v-model="title" data-testid="new-title" placeholder="Title of the new issue" aria-label="Title" />
    <!-- `isPending` from the mutation: no double submit, no flag to reset. -->
    <button type="submit" data-testid="create-submit" :disabled="isPending">
      {{ isPending ? 'Creating…' : 'Create' }}
    </button>
  </form>
  <!-- `error` is reset as soon as the next `mutate()` starts. -->
  <p v-if="error" class="error" data-testid="create-error">{{ error.message }}</p>
</template>
