/**
 * This one is NOT a library candidate: it knows what a `Vehicle` is, and the
 * next app will sort something else. It stays here — fixed, not promoted.
 *
 * The fix is convention 2: an **object of refs**, never a `reactive()`.
 * `const { sorted } = useSortedRows(...)` now hands the caller a ref, which the
 * template unwraps and which keeps tracking. The old `reactive()` handed out a
 * plain array, and the panel stopped updating on the first destructuring.
 */
import { computed, ref, type Ref } from 'vue';
import type { Vehicle } from '../api/fakeApi';

export type SortKey = 'plate' | 'batteryPercent';

export interface UseSortedRowsReturn {
  sortKey: Readonly<Ref<SortKey>>;
  sorted: Readonly<Ref<Vehicle[]>>;
  sortBy(key: SortKey): void;
}

export function useSortedRows(rows: () => Vehicle[]): UseSortedRowsReturn {
  const sortKey = ref<SortKey>('plate');

  const sorted = computed(() =>
    [...rows()].sort((a, b) =>
      sortKey.value === 'plate'
        ? a.plate.localeCompare(b.plate)
        : a.batteryPercent - b.batteryPercent,
    ),
  );

  function sortBy(key: SortKey): void {
    sortKey.value = key;
  }

  return { sortKey, sorted, sortBy };
}
