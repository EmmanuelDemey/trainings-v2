const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

/**
 * The URL, if it is safe in an `href`; `undefined` otherwise. React escapes
 * text, not URLs: `<a href="javascript:…">` runs the script on click. An allow
 * list of protocols, never a deny list: `JaVaScRiPt:`, `\tjavascript:`, `data:`…
 */
export function safeUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url, window.location.origin);
    return SAFE_PROTOCOLS.has(parsed.protocol) ? parsed.href : undefined;
  } catch {
    return undefined;
  }
}
