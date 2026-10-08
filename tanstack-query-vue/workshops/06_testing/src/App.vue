<script setup lang="ts">
import { useIsMutating } from '@tanstack/vue-query';
import IssueList from './components/IssueList.vue';
import NewIssueForm from './components/NewIssueForm.vue';
import OpenCounter from './components/OpenCounter.vue';

// How many mutations are in flight, ANYWHERE in the app — a `Ref<number>`.
// The header holds no reference to the form or to the list: it reads the
// mutation cache. `useIsMutating({ mutationKey: issueMutationKeys.delete() })`
// would count the deletes only.
const saving = useIsMutating();
</script>

<template>
  <header class="row spread">
    <h1>Issue tracker</h1>
    <div class="row">
      <span v-if="saving > 0" class="saving" data-testid="saving">Saving…</span>
      <OpenCounter />
    </div>
  </header>
  <p class="muted">
    Create and delete issues — then tick <strong>The server refuses every
    write</strong> in the Network panel and try again.
  </p>

  <IssueList />
  <section>
    <h2>New issue</h2>
    <NewIssueForm />
  </section>
</template>
