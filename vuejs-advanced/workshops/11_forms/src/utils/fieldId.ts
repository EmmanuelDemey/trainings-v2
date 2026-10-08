/**
 * A DOM id derived from a form path, so the error summary can link to the input
 * that caused each error.
 *
 *   fieldId('attendees[0].name')  ->  'field-attendees-0-name'
 *
 * (Vue 3.5's `useId()` gives you a unique id for free, but nothing outside the
 * component can guess it — which is exactly what the summary needs to do.)
 */
export function fieldId(path: string): string {
  return `field-${path.replace(/[^a-zA-Z0-9]+/g, '-').replace(/-+$/, '')}`;
}
