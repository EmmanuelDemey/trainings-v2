<script setup lang="ts">
import { ref } from 'vue';
import { useCreateIssue } from '@/queries/issues';

const title = ref('');
const { mutate, isPending, error } = useCreateIssue();

function submit(): void {
  mutate(title.value, { onSuccess: () => (title.value = '') });
}
</script>

<template>
  <form class="row" @submit.prevent="submit">
    <input v-model="title" data-testid="new-title" placeholder="A new issue" aria-label="Issue title" />
    <button type="submit" data-testid="create" :disabled="isPending">
      {{ isPending ? 'Creating…' : 'Create' }}
    </button>
    <p v-if="error" class="error">{{ error.message }}</p>
  </form>
</template>
