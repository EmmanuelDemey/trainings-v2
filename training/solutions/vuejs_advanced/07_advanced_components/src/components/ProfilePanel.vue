<script setup lang="ts">
/**
 * STEP 2 — Suspense
 *
 * `UserProfile` awaits in its `setup`. `<Suspense>` gives the whole subtree ONE
 * loading state instead of one spinner per component — but it does NOT handle
 * the rejection path, which is what `onErrorCaptured` is for below.
 */
import { onErrorCaptured, ref } from 'vue';
import UserProfile from './UserProfile.vue';
import ProfileSkeleton from './ProfileSkeleton.vue';

const userId = ref(1);
const error = ref<Error | null>(null);
const loading = ref(false);

/**
 * A rejected async `setup()` does not show the `#fallback`: the fallback covers
 * "not resolved yet", and a rejected promise is not "not yet", it is "never".
 * The subtree simply never renders, and without this hook the panel stays
 * silently blank while the error bubbles to the app root.
 *
 * Returning `false` stops the propagation — this boundary has handled it.
 */
onErrorCaptured((caught: unknown) => {
  error.value = caught instanceof Error ? caught : new Error(String(caught));
  loading.value = false;
  return false;
});

function nextUser(): void {
  error.value = null;
  userId.value += 1;
}
</script>

<template>
  <section>
    <h2>2 — Suspense</h2>
    <p class="muted">One fallback for the whole subtree, instead of one spinner per component.</p>

    <div class="row">
      <button type="button" data-testid="next-user" :disabled="loading" @click="nextUser">
        Load another user (#{{ userId }})
      </button>
    </div>

    <p v-if="error" class="error" data-testid="profile-error" role="alert">
      {{ error.message }}
    </p>

    <!--
      `:key="userId"` re-creates the component on every id change, so the
      fallback shows again. Without it, Vue patches the existing instance: the
      PREVIOUS user stays on screen until the new one resolves. Both behaviours
      are defensible — stale-while-loading avoids a layout jump — but only one
      of them is what you meant, so choose it explicitly.

      `@pending` / `@resolve` fire on the boundary itself, which is how the
      button knows a load is in flight without the child telling it.
    -->
    <Suspense @pending="loading = true" @resolve="loading = false">
      <UserProfile :key="userId" :id="userId" />

      <template #fallback>
        <ProfileSkeleton />
      </template>
    </Suspense>
  </section>
</template>
