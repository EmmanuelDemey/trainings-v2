import DOMPurify from 'dompurify';
import { useMemo } from 'react';

/**
 * Renders HTML that came from users. `dangerouslySetInnerHTML` alone would run
 * whatever it contains (`<img onerror>`, `<script>`, `<a href="javascript:">`):
 * DOMPurify keeps the formatting and drops everything executable.
 */
export function SafeHtml({ html, className }: { html: string; className?: string }) {
  const clean = useMemo(() => DOMPurify.sanitize(html), [html]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
