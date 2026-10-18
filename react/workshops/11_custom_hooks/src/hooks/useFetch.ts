export interface FetchState<T> {
  /** The last successful response body; kept while the next URL loads. */
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * GETs `url` as JSON, and again every time it changes. `null` means "nothing
 * to fetch yet": no request, not loading.
 */
export function useFetch<T>(url: string | null): FetchState<T> {
  // TODO 1.1: move the three states and the effect of PeopleSearch here,
  //           with `url` as the effect's dependency. A `null` URL sends nothing.
  // TODO 1.2: abort the request in flight in the effect cleanup, and ignore
  //           the rejection of a request you aborted.
  void url;
  return { data: undefined, loading: false, error: null };
}
