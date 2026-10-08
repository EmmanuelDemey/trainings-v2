<script setup lang="ts">
import IssueList from './components/IssueList.vue';
import NewIssueForm from './components/NewIssueForm.vue';
import OpenCounter from './components/OpenCounter.vue';

// TODO (step 4) — `useIsMutating()`: how many mutations are in flight,
// anywhere in the app. Show `saving` in the header while it is above 0.
</script>

<template>
  <header class="row spread">
    <h1>Issue tracker</h1>
    <div class="row">
      <!-- TODO (step 4) — <span class="saving" data-testid="saving">Saving…</span> -->
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
