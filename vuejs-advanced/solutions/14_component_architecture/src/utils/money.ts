/**
 * A pure computation, repeated in three files. It needs no reactivity and no
 * markup, so it is a plain function — not a component, not a composable.
 */
export function euros(cents: number): string {
  return `${(cents / 100).toFixed(2)} €`;
}
