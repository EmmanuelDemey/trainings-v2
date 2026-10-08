<script setup lang="ts">
/**
 * STEP 2 — Suspense
 *
 * `UserProfile` awaits in its `setup`. Without a `<Suspense>` boundary, Vue warns
 * and renders nothing. Your job is to give the whole subtree ONE loading state,
 * and to handle the rejection path — which `Suspense` does NOT do for you.
 */
import { ref } from 'vue';
import UserProfile from './UserProfile.vue';
import ProfileSkeleton from './ProfileSkeleton.vue';

const userId = ref(1);
const error = ref<Error | null>(null);

// TODO 2.3: catch the rejection of the top-level `await` with `onErrorCaptured`.
//   A rejected async setup does NOT trigger the fallback — the subtree simply
//   never renders. Import `onErrorCaptured` from 'vue', store the error in
//   `error` and return `false` to stop the propagation.
//   Test it: flip `failureSwitch.profile` to `true` in `src/api/fakeApi.ts`.

// TODO 2.4 (bonus): use the `@pending` / `@resolve` events of `<Suspense>` to
//   disable the "Load another user" button while a profile is loading.
</script>

<template>
  <section>
    <h2>2 — Suspense</h2>
    <p class="muted">One fallback for the whole subtree, instead of one spinner per component.</p>

    <div class="row">
      <button type="button" data-testid="next-user" @click="userId += 1">
        Load another user (#{{ userId }})
      </button>
    </div>

    <p v-if="error" class="error" data-testid="profile-error" role="alert">
      {{ error.message }}
    </p>

    <!--
      TODO 2.1: wrap `UserProfile` in a `<Suspense>` with `ProfileSkeleton` as the
        `#fallback` slot.
      TODO 2.2: give the profile a `:key="userId"` so changing the id re-creates
        the component and shows the fallback again. Without the key, the old
        profile stays on screen while the new one loads — decide which behaviour
        you actually want and be able to explain the difference.
    -->
    <UserProfile v-else :id="userId" />
  </section>
</template>
