import type { QueryClient } from '@tanstack/vue-query';

// TODO (step 5) — run `composable` in the `setup()` of a host component that
// renders nothing (`defineComponent({ setup() { result = composable(); return () => null; } })`),
// rendered with `renderWithClient`. Return what the composable returned, the
// client and `unmount`.
export function withSetup<T>(_composable: () => T): { result: T; queryClient: QueryClient; unmount: () => void } {
  throw new Error('TODO (step 5): withSetup');
}
