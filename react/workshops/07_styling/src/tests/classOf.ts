import { expect } from 'vitest';

/**
 * The scoped class name of `name` in a CSS Module — failing with a readable
 * message when the stylesheet does not define it (instead of letting
 * `toHaveClass(undefined)` say something confusing).
 */
export function classOf(styles: Readonly<Record<string, string>>, name: string): string {
  const className = styles[name];
  expect(className, `the module should define a .${name} class`).toBeTypeOf('string');
  return className;
}
