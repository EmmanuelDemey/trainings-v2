/**
 * The absolute or root-relative URL of an API endpoint.
 *
 * The base comes from `VITE_API_BASE_URL` (see .env). It is read at CALL time,
 * not once at import time: a spec can then change it with `vi.stubEnv()`.
 * Vite inlines `import.meta.env.*` in the production bundle anyway.
 */
export function apiUrl(path: string): string {
  // `/api/` + `/people` must not become `/api//people`.
  const base = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  return `${base}${path}`;
}
