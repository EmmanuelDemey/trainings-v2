/** `fetch` needs an absolute URL in Node: resolve against the page's origin. */
export function apiUrl(path: string): URL {
  return new URL(path, window.location.origin);
}
