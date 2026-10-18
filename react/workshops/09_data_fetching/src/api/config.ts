/**
 * The absolute or root-relative URL of an API endpoint.
 */
export function apiUrl(path: string): string {
  // TODO 1.2: read the base from `import.meta.env.VITE_API_BASE_URL` (see .env),
  // inside this function — the spec changes it with `vi.stubEnv()`.
  // TODO 1.3: strip a trailing `/` from the base.
  return `/api${path}`;
}
