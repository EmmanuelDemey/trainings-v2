/**
 * The URL, if it is safe in an `href`; `undefined` otherwise. React escapes
 * text, not URLs: `<a href="javascript:…">` runs the script on click.
 */
export function safeUrl(url: string): string | undefined {
  // TODO 6.1: parse it with `new URL(url, window.location.origin)` (in a
  //   try/catch), and keep it only if its `protocol` is in an ALLOW list:
  //   'http:', 'https:', 'mailto:'. Never a deny list of "javascript:": the
  //   parser normalises `JaVaScRiPt:` and `\tjava\nscript:`, a regex does not.
  return url;
}
