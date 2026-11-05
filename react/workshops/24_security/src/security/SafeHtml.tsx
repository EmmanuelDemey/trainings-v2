/**
 * Renders HTML that came from users.
 */
export function SafeHtml({ html, className }: { html: string; className?: string }) {
  // TODO 6.2: this renders the HTML AS IS — `<img onerror>` included. Sanitise
  //   it first with `DOMPurify.sanitize(html)` (`import DOMPurify from 'dompurify'`),
  //   memoised on `html`.
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
