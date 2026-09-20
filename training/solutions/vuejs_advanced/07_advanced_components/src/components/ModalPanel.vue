<script setup lang="ts">
/**
 * Consumer of `AppModal`. Nothing to change here: the panel deliberately keeps
 * its `overflow: hidden` and its `transform` — the constraints a real design
 * system puts on you — so the modal has to escape on its own.
 */
import { ref } from 'vue';
import AppModal from './AppModal.vue';

const open = ref(false);
const inline = ref(false);
const deleted = ref(0);
</script>

<template>
  <section class="clipping-context">
    <h2>5 — Teleport</h2>
    <p class="muted">
      This panel has <code>overflow: hidden</code> and a <code>transform</code>, like
      any animated card. A dialog rendered inside it is clipped and mis-centred,
      whatever its CSS says.
    </p>

    <div class="row">
      <button type="button" data-testid="open-modal" @click="open = true">
        Delete the invoice
      </button>
      <span class="muted" data-testid="modal-mode">
        Mode: {{ inline ? 'inline (teleport disabled)' : 'teleported' }}
      </span>
      <span class="muted" data-testid="deleted-count">Deleted: {{ deleted }}</span>
    </div>

    <AppModal
      v-model:open="open"
      v-model:inline="inline"
      title="Delete the invoice?"
      @confirm="deleted += 1"
    >
      <p>This action cannot be undone.</p>
    </AppModal>
  </section>
</template>
