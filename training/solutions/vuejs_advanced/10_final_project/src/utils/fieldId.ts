/**
 * A DOM id derived from a field name, so the error summary can link to the
 * input that caused each error.
 *
 *   fieldId('dueDate')  ->  'field-dueDate'
 */
export function fieldId(name: string): string {
  return `field-${name.replace(/[^a-zA-Z0-9]+/g, '-').replace(/-+$/, '')}`;
}
