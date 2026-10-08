/**
 * Stands in for an HTTP client. What matters here is that it carries an
 * `Accept-Language` header — and that somebody has to keep it in step with the
 * locale, or the backend keeps answering in French.
 */
export const apiHeaders: Record<string, string> = {
  'Accept-Language': 'fr',
};
