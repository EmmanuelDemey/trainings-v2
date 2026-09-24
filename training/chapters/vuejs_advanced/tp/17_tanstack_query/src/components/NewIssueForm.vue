<script setup lang="ts">
import { ref } from 'vue';
import { createIssue } from '@/api/fakeApi';

const emit = defineEmits<{ created: [] }>();

// TODO 3.2 — replace with `useCreateIssue()`: `mutate`, `isPending` and
// `error` come from the mutation, and the cache refreshes EVERY list — the
// header counter included — without anyone listening to an event.
const title = ref('');
const submitting = ref(false);
const submitError = ref<Error | null>(null);

async function submit(): Promise<void> {
  submitting.value = true;
  submitError.value = null;
  try {
    await createIssue(title.value);
    title.value = '';
    emit('created');
  } catch (e) {
    submitError.value = e as Error;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="row" @submit.prevent="submit">
    <input v-model="title" data-testid="new-title" placeholder="A new issue" aria-label="Issue title" />
    <button type="submit" data-testid="create" :disabled="submitting">
      {{ submitting ? 'Creating…' : 'Create' }}
    </button>
    <p v-if="submitError" class="error">{{ submitError.message }}</p>
  </form>
</template>
