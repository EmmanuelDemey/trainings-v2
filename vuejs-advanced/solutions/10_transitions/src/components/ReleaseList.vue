<script setup lang="ts">
/**
 * `<TransitionGroup>` renders no element of its own unless you ask for one, so
 * `tag="ul"` is what keeps the markup valid. It takes no `mode` — its children
 * enter and leave independently — and it adds one class the single
 * `<Transition>` does not: `list-move`, applied to every child whose position
 * changed. That one is FLIP: Vue measures the position before and after, applies
 * the inverse transform, then removes it and lets CSS play the difference.
 *
 * The `:key` is not decoration here. Vue patches by key, so keying by index
 * would tell it "the row in position 2 is still the row in position 2": it would
 * reuse the DOM node for a different release, and the note typed into that node
 * would stay behind while the release moved away.
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

    <TransitionGroup name="list" tag="ul">
      <li v-for="release in visible" :key="release.id" data-testid="release-row">
        <span data-testid="release-title">{{ release.title }}</span>
        <span class="muted"> — {{ release.votes }} votes</span>
        <input data-testid="note" placeholder="note…" :aria-label="`Note on ${release.title}`" />
        <button type="button" data-testid="open" @click="$emit('select', release)">Open</button>
        <button type="button" data-testid="remove" @click="remove(release.id)">Remove</button>
      </li>
    </TransitionGroup>
  </section>
</template>
