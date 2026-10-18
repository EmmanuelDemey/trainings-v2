import type { ReactNode } from 'react';

interface FilterContextValue {
  filter: string;
  setFilter: (filter: string) => void;
}

// TODO 1.1: create the context — `createContext<FilterContextValue | null>(null)`.

export function FilterProvider({ children }: { children: ReactNode }) {
  // TODO 1.2: own the `filter` state here, and provide `{ filter, setFilter }`
  //           (memoised with `useMemo`) with `<FilterContext value={…}>`.
  return <>{children}</>;
}

export function useFilter(): FilterContextValue {
  // TODO 1.3: read the context; throw
  //           'useFilter must be used inside a <FilterProvider>' when it is null.
  throw new Error('TODO 1.3: useFilter is not written yet');
}
