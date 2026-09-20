<script setup lang="ts">
/**
 * Rows come and go and get reordered — and nothing moves. Worse, the note you
 * type into a row stays at its **position** when the list is sorted, because of
 * the `:key` below.
 *
 * TODO 5: turn the `<ul>` into a `<TransitionGroup name="list" tag="ul">`.
 *   It renders no wrapper of its own unless you ask for one with `tag`, it has
 *   no `mode`, and it applies the six classes to **each child** — plus
 *   `list-move` to every child whose position changed.
 *
 * TODO 6: `:key="index"` is the bug the spec hunts. Vue patches by key, so an
 *   index key tells it "the row at position 2 is still the row at position 2" —
 *   it reuses the DOM node for a different release, and any state living in that
 *   node (the note field below, an open menu, a focused input) stays behind.
 *   Key by `release.id`.
 */
import { computed, ref } from 'vue';
import { draftRelease, type Release } from '../api/fakeApi';

const releases = defineModel<Release[]>({ required: true });
defineEmits<{ select: [release: Release] }>();

const sortByVotes = ref(false);
const draftTitle = ref('');

const visible = computed(() =>
  sortByVotes.value
    ? [...releases.value].sort((a, b) => b.votes - a.votes)
    : releases.value,
);

function add(): void {
  const title = draftTitle.value.trim();
  if (title === '') return;
  releases.value = [draftRelease(title), ...releases.value];
  draftTitle.value = '';
}

function remove(id: string): void {
  releases.value = releases.value.filter((release) => release.id !== id);
}
</script>

<template>
  <section>
    <h2>Releases</h2>

    <div class="row">
      <input v-model="draftTitle" data-testid="draft" placeholder="A new idea…" aria-label="New idea" />
      <button type="button" data-testid="add" @click="add()">Add</button>
      <button type="button" data-testid="sort" @click="sortByVotes = !sortByVotes">
        {{ sortByVotes ? 'Back to board order' : 'Sort by votes' }}
      </button>
    </div>

    <ul>
      <li v-for="(release, index) in visible" :key="index" data-testid="release-row">
        <span data-testid="release-title">{{ release.title }}</span>
        <span class="muted"> — {{ release.votes }} votes</span>
        <input data-testid="note" placeholder="note…" :aria-label="`Note on ${release.title}`" />
        <button type="button" data-testid="open" @click="$emit('select', release)">Open</button>
        <button type="button" data-testid="remove" @click="remove(release.id)">Remove</button>
      </li>
    </ul>
  </section>
</template>
