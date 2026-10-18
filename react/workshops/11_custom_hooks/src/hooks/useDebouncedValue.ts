/**
 * `value`, but only once it has stopped changing for `delay` ms. Typing
 * "skywalker" sends one request instead of nine.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  // TODO 2.1: keep the debounced value in a state; in an effect depending on
  //           `value` and `delay`, update it after `delay` ms with setTimeout —
  //           and clear the pending timer in the cleanup.
  void delay;
  return value;
}
