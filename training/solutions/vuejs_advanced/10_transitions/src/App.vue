<script setup lang="ts">
/**
 * The drawer teaches the order of operations: **the DOM leaves first, the data
 * goes last**.
 *
 * `v-if` hangs on `isOpen` alone, so closing only starts the leave transition —
 * `selected` is still there, and the panel keeps rendering its title all the way
 * out. `@after-leave` is the moment it is safe to forget: the element is gone,
 * nothing can read the data any more.
 *
 * Wipe `selected` in the click handler instead and the panel goes blank before
 * it has moved a pixel.
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

function forget(): void {
  selected.value = null;
  leaveCount.value += 1;
}
</script>

<template>
  <h1>Changelog board</h1>

  <TabsPanel :releases="releases" />

  <ReleaseList v-model="releases" @select="select" />

  <Transition name="slide" @after-leave="forget">
    <DetailPanel v-if="isOpen && selected" :release="selected" @close="isOpen = false" />
  </Transition>

  <p class="muted">
    Leave animations completed: <strong data-testid="leave-count">{{ leaveCount }}</strong>
  </p>
</template>
