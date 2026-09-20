/**
 * Copy #4 of "the debounce". Every app in the company has one; this one forgets
 * to cancel the pending timer, so six keystrokes are six requests — the
 * behaviour a debounce exists to prevent.
 *
 * TODO 9: delete this file and call `useDebounced` from `@/packages/acme`
 *   instead. Then look at what you lose by deleting it: nothing.
 */
import { ref, watch, type Ref } from 'vue';

export function useSearchDebounce(initial: string): { value: Ref<string>; debounced: Ref<string> } {
  const value = ref(initial);
  const debounced = ref(initial);

  watch(value, (next) => {
    setTimeout(() => {
      debounced.value = next;
    }, 300);
  });

  return { value, debounced };
}
