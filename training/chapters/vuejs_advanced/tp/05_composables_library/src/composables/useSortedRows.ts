/**
 * This one is NOT a library candidate: it knows what a `Vehicle` is, and the
 * next app will sort something else. It stays here — fixed, not promoted.
 *
 * TODO 11: it returns a `reactive()`, so `const { sorted } = useSortedRows(...)`
 *   hands the caller a plain array and the panel stops updating. Return an
 *   **object of refs** instead, so destructuring keeps working, and mark
 *   `Readonly` what the caller has no business writing.
 */
import { computed, reactive } from 'vue';
import type { Vehicle } from '../api/fakeApi';

export type SortKey = 'plate' | 'batteryPercent';

export function useSortedRows(rows: () => Vehicle[]) {
  const sortKey = computed(() => currentKey.value);
  const currentKey = reactive({ value: 'plate' as SortKey });

  const sorted = computed(() =>
    [...rows()].sort((a, b) =>
      currentKey.value === 'plate'
        ? a.plate.localeCompare(b.plate)
        : a.batteryPercent - b.batteryPercent,
    ),
  );

  function sortBy(key: SortKey): void {
    currentKey.value = key;
  }

  return reactive({ sortKey, sorted, sortBy });
}
