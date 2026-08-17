import { ref, watch, type Ref } from 'vue';

export interface UseDebouncedSearchReturn {
  query: Ref<string>;
  results: Ref<string[]>;
  searching: Ref<boolean>;
}

/**
 * Debounces the query before calling `search`. Step 5 tests it with fake timers:
 * three keystrokes must produce exactly ONE call.
 */
export function useDebouncedSearch(
  search: (query: string) => Promise<string[]>,
  delayMs = 300,
): UseDebouncedSearchReturn {
  const query = ref('');
  const results = ref<string[]>([]);
  const searching = ref(false);

  let timer: ReturnType<typeof setTimeout> | undefined;

  watch(query, (value) => {
    clearTimeout(timer);

    if (value === '') {
      results.value = [];
      searching.value = false;
      return;
    }

    searching.value = true;
    timer = setTimeout(async () => {
      results.value = await search(value);
      searching.value = false;
    }, delayMs);
  });

  return { query, results, searching };
}
