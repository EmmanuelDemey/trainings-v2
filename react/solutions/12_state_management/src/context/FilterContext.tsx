import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface FilterContextValue {
  filter: string;
  setFilter: (filter: string) => void;
}

// `null` as the default: a consumer outside the provider is a bug we want to
// SEE, not a silent empty filter.
const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState('');
  // A new object on every render would re-render every consumer, even when the
  // filter did not change: memoise the value.
  const value = useMemo(() => ({ filter, setFilter }), [filter]);

  // React 19: the context itself is the provider — no more `.Provider`.
  return <FilterContext value={value}>{children}</FilterContext>;
}

export function useFilter(): FilterContextValue {
  const value = useContext(FilterContext);
  if (!value) {
    throw new Error('useFilter must be used inside a <FilterProvider>');
  }
  return value;
}
