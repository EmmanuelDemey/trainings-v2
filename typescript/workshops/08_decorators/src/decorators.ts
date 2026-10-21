// Five decorators, written with the standard (TC39) API: the one TypeScript
// uses by default, without `experimentalDecorators`. Each one is used by
// src/cart.ts and driven by tests/decorators.spec.ts.
//
// Every decorator below compiles and does nothing yet: a decorator that
// returns nothing leaves its target as it is.

type Method<This, Args extends unknown[], Return> = (this: This, ...args: Args) => Return;

/**
 * TODO 1: method decorator factory — every call is reported to `sink` as
 * `add(1, 2) → 3`: the method name, the arguments, the result.
 */
export function logged(sink: (line: string) => void) {
  return function <This, Args extends unknown[], Return>(
    target: Method<This, Args, Return>,
    context: ClassMethodDecoratorContext<This, Method<This, Args, Return>>,
  ): Method<This, Args, Return> {
    return target;
  };
}

/**
 * TODO 2: method decorator — the result is cached per instance and per
 * arguments (compared with `JSON.stringify`). Two instances never share a cache.
 */
export function memoize<This extends object, Args extends unknown[], Return>(
  target: Method<This, Args, Return>,
  _context: ClassMethodDecoratorContext<This, Method<This, Args, Return>>,
): Method<This, Args, Return> {
  return target;
}

/**
 * TODO 3: auto-accessor decorator factory — `@min(0) accessor stock = 3`. Below
 * `minimum`, at initialisation or on any later assignment, it throws a
 * `RangeError` naming the field: `stock must be >= 0, got -1`.
 */
export function min(minimum: number) {
  return function <This>(
    target: ClassAccessorDecoratorTarget<This, number>,
    context: ClassAccessorDecoratorContext<This, number>,
  ): ClassAccessorDecoratorResult<This, number> {
    return {};
  };
}

/** TODO 4: class decorator — instances get a `toString()` that returns their JSON. */
export function jsonString<Class extends abstract new (...args: any[]) => object>(
  target: Class,
  _context: ClassDecoratorContext<Class>,
) {}

/**
 * TODO 5: method decorator factory — registers the method as a CLI command, in
 * the metadata of its class: `context.metadata`. Nothing is called at run time:
 * `commandsOf` reads the registry back.
 */
export function command(name: string) {
  return function (_target: unknown, context: ClassMethodDecoratorContext) {};
}

/** TODO 5: the commands of a class — `{ add: 'addItem', … }`, `{}` when it has none. */
export function commandsOf(target: object): Record<string, string | symbol> {
  return {};
}
