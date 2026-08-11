import { computed, type ComputedRef, type Ref } from 'vue';
import { useLocalStorage } from './useLocalStorage';

export interface UseFavoritesReturn {
  ids: Ref<number[]>;
  count: ComputedRef<number>;
  isFavorite: (id: number) => boolean;
  toggle: (id: number) => void;
  clear: () => void;
}

/**
 * STEP 3 — Compose composables.
 *
 * `useFavorites` is built ON TOP of `useLocalStorage`. Two different components
 * call it, and they must SHARE the same list — clicking a heart in the gallery
 * has to update the counter in the header immediately.
 *
 * TODO 3.1: implement `isFavorite`, `toggle` and `clear` on top of `ids`.
 *
 * TODO 3.2: right now the state is created inside the function, so each caller
 *   gets its OWN list — the two panels will disagree. Move the state to module
 *   scope so it becomes a singleton.
 *   Then answer, in a comment: what does that break for SSR, and for tests?
 *
 * TODO 3.3: build a `Set` index in a `computed` and use it in `isFavorite`.
 *   With 60 products the difference is invisible — explain when it stops being.
 */
export function useFavorites(): UseFavoritesReturn {
  const ids = useLocalStorage<number[]>('tp3:favorites', []);

  const count = computed(() => ids.value.length);

  function isFavorite(id: number): boolean {
    // TODO 3.1
    void id;
    return false;
  }

  function toggle(id: number): void {
    // TODO 3.1 — remember to MUTATE or REASSIGN consistently with the `deep`
    // watcher in useLocalStorage.
    void id;
  }

  function clear(): void {
    // TODO 3.1
  }

  return { ids, count, isFavorite, toggle, clear };
}
