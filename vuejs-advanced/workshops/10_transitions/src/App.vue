<script setup lang="ts">
/**
 * TODO 3: closing the drawer wipes `selected` in the same tick, so the panel
 *   goes blank before it has moved a pixel. Split the two:
 *
 *   - keep `v-if` on `isOpen` alone, and let the close button only flip that
 *   - wrap the panel in `<Transition name="slide" @after-leave="forget">`
 *   - `forget()` is where `selected` goes back to `null` — and where the
 *     "animations completed" counter below is incremented
 *
 *   That is the general shape: the DOM leaves first, the data goes last.
 */
import { ref } from 'vue';
import TabsPanel from './components/TabsPanel.vue';
import ReleaseList from './components/ReleaseList.vue';
import DetailPanel from './components/DetailPanel.vue';
import { loadReleases, type Release } from './api/fakeApi';

const releases = ref<Release[]>(loadReleases());

const selected = ref<Release | null>(null);
const isOpen = ref(false);
const leaveCount = ref(0);

function select(release: Release): void {
  selected.value = release;
  isOpen.value = true;
}

function close(): void {
  isOpen.value = false;
  selected.value = null;
}
</script>

<template>
  <h1>Changelog board</h1>

  <TabsPanel :releases="releases" />

  <ReleaseList v-model="releases" @select="select" />

  <DetailPanel v-if="isOpen && selected" :release="selected" @close="close()" />

  <p class="muted">
    Leave animations completed: <strong data-testid="leave-count">{{ leaveCount }}</strong>
  </p>
</template>
