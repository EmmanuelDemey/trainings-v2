/**
 * `@acme/composables` — the one place the answer lives.
 *
 * The rule the team agreed on: something is promoted here on its **third** real
 * usage, and each folder has a named owner. Anything VueUse already does well is
 * not our plumbing to reinvent.
 */
export { useDebounced } from './useDebounced';
export type { UseDebouncedOptions, UseDebouncedReturn } from './useDebounced';

export { usePolling } from './usePolling';
export type { UsePollingOptions, UsePollingReturn } from './usePolling';
