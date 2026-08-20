import { computed, effectScope, type ComputedRef, type Ref } from 'vue';
import { useLocalStorage } from './useLocalStorage';

export interface UseFavoritesReturn {
  ids: Ref<number[]>;
  count: ComputedRef<number>;
  isFavorite: (id: number) => boolean;
  toggle: (id: number) => void;
  clear: () => void;
}

/**
 * STEP 3 — Compose composables, and share the state.
 *
 * The state lives at MODULE scope, so every caller gets the same list: clicking
 * a heart in the catalog updates the counter in the other panel immediately.
 * Created inside the function, each caller would get its own array and the two
 * panels would quietly disagree.
 *
 * What that costs you:
 *
 *  - **SSR**: module scope on a Node server is shared by every REQUEST. One
 *    user's favourites leak into another user's page — a real data-leak bug,
 *    not a theoretical one. Under SSR this belongs in a per-request container:
 *    a Pinia store (chapter 6), or `provide`/`inject` from the app instance.
 *  - **Tests**: the state survives from one test to the next, so specs pass or
 *    fail depending on their order. You need an explicit reset in `beforeEach`
 *    (`clear()` plus `localStorage.clear()`) — and remembering that reset is a
 *    tax you pay on every new spec file.
 *
 * `effectScope` is what makes the module-level state disposable: the `watch`
 * inside `useLocalStorage` has no component to attach to here, and without a
 * scope Vue warns about an effect created outside an active one.
 */
const scope = effectScope(true);

const ids = scope.run(() => useLocalStorage<number[]>('tp3:favorites', []))!;

/**
 * The `Set` index.
 *
 * `Array.includes` is O(n) per lookup, and `isFavorite` is called once per row
 * per render: rendering 60 products is 60 × 60 comparisons — invisible. At
 * 2 000 favourites × 2 000 rows it is four million, per keystroke in a filter.
 * The `computed` rebuilds the Set only when `ids` changes, so lookups are O(1)
 * and the rebuild is amortised over every render in between.
 */
const favoriteSet = computed(() => new Set(ids.value));

const count = computed(() => ids.value.length);

export function useFavorites(): UseFavoritesReturn {
  function isFavorite(id: number): boolean {
    return favoriteSet.value.has(id);
  }

  function toggle(id: number): void {
    // REASSIGN rather than splice/push: it keeps `ids` a new array each time,
    // which is what makes `favoriteSet` recompute. With `deep: true` in
    // useLocalStorage a mutation would persist correctly too — but the computed
    // above would not, so pick one style and hold it.
    ids.value = isFavorite(id) ? ids.value.filter((current) => current !== id) : [...ids.value, id];
  }

  function clear(): void {
    ids.value = [];
  }

  return { ids, count, isFavorite, toggle, clear };
}
