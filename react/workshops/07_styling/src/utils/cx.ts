type ClassValue = string | false | null | undefined;

/**
 * Joins the truthy class names: `cx('a', isOn && 'b', undefined)` → `'a b'`
 * or `'a'`. The few lines `clsx` / `classnames` would bring as a dependency.
 */
export function cx(...classes: ClassValue[]): string {
  // TODO 1.1: keep the truthy values only, joined with a space.
  return '';
}
