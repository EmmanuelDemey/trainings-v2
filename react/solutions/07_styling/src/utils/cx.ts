type ClassValue = string | false | null | undefined;

/**
 * Joins the truthy class names: `cx('a', isOn && 'b', undefined)` → `'a b'`
 * or `'a'`. The few lines `clsx` / `classnames` would bring as a dependency.
 */
export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
