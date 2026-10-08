import { defineComponent } from 'vue';
import type { QueryClient } from '@tanstack/vue-query';
import { renderWithClient } from './renderWithClient';

/**
 * Runs a composable the only place it can run: in the `setup()` of a
 * component. `useCreateIssue()` calls `useQueryClient()`, which `inject`s the
 * client — outside a component, there is nothing to inject from.
 *
 * The host component renders nothing: it exists to give the composable an
 * instance, the plugin, and a scope that ends when it unmounts.
 */
export function withSetup<T>(composable: () => T): { result: T; queryClient: QueryClient; unmount: () => void } {
  let result: T | undefined;
  const Host = defineComponent({
    setup() {
      result = composable();
      return () => null;
    },
  });
  const { queryClient, unmount } = renderWithClient(Host);
  // `setup()` ran synchronously during the render.
  return { result: result as T, queryClient, unmount };
}
