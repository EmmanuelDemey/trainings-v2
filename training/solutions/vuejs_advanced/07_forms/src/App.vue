<script setup lang="ts">
import { ref } from 'vue';
import HandRolledForm from '@/components/HandRolledForm.vue';
import VeeForm from '@/components/VeeForm.vue';
import { apiStats } from '@/api/fakeApi';

type Tab = 'hand-rolled' | 'vee-validate';
const tab = ref<Tab>('hand-rolled');
</script>

<template>
  <main>
    <header>
      <h1>TP 7 — Forms &amp; validation</h1>
      <p class="lead">
        The same registration form, twice: written by hand on top of a Zod schema,
        then with VeeValidate. Same schema, same rules — compare what you had to
        write.
      </p>
    </header>

    <nav class="tabs" role="tablist">
      <button
        role="tab"
        :aria-selected="tab === 'hand-rolled'"
        :class="{ active: tab === 'hand-rolled' }"
        @click="tab = 'hand-rolled'"
      >
        1. useZodForm (hand-rolled)
      </button>
      <button
        role="tab"
        :aria-selected="tab === 'vee-validate'"
        :class="{ active: tab === 'vee-validate' }"
        @click="tab = 'vee-validate'"
      >
        2. VeeValidate + toTypedSchema
      </button>
    </nav>

    <section class="panel">
      <HandRolledForm v-if="tab === 'hand-rolled'" />
      <VeeForm v-else />
    </section>

    <aside class="stats">
      <strong>Fake API</strong> — availability checks: {{ apiStats.isEmailAvailable }} ·
      registrations: {{ apiStats.register }}
      <p>
        Taken emails: <code>ada@lovelace.dev</code>, <code>grace@hopper.dev</code>,
        <code>alan@turing.dev</code>. An attendee named <code>Bob</code> is rejected by
        the server, and the <code>pro</code> plan requires a company.
      </p>
    </aside>
  </main>
</template>
