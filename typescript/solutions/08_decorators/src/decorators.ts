// Five decorators, written with the standard (TC39) API: the one TypeScript
// uses by default, without `experimentalDecorators`. Each one is used by
// src/cart.ts and driven by tests/decorators.spec.ts.

type Method<This, Args extends unknown[], Return> = (this: This, ...args: Args) => Return;

/**
 * Method decorator factory: every call is reported to `sink` as
 * `add(1, 2) → 3` — the method name, the arguments, the result.
 */
export function logged(sink: (line: string) => void) {
  return function <This, Args extends unknown[], Return>(
    target: Method<This, Args, Return>,
    context: ClassMethodDecoratorContext<This, Method<This, Args, Return>>,
  ): Method<This, Args, Return> {
    return function (this: This, ...args: Args): Return {
      const result = target.call(this, ...args);
      sink(`${String(context.name)}(${args.map((arg) => JSON.stringify(arg)).join(', ')}) → ${JSON.stringify(result)}`);
      return result;
    };
  };
}

/**
 * Method decorator: the result is cached per instance and per arguments
 * (compared with `JSON.stringify`). Two instances never share a cache.
 */
export function memoize<This extends object, Args extends unknown[], Return>(
  target: Method<This, Args, Return>,
  _context: ClassMethodDecoratorContext<This, Method<This, Args, Return>>,
): Method<This, Args, Return> {
  const caches = new WeakMap<This, Map<string, Return>>();
  return function (this: This, ...args: Args): Return {
    let cache = caches.get(this);
    if (!cache) {
      cache = new Map();
      caches.set(this, cache);
    }
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, target.call(this, ...args));
    return cache.get(key) as Return;
  };
}

/**
 * Auto-accessor decorator factory: `@min(0) accessor stock = 3`. Below `minimum`
 * — at initialisation or on any later assignment — it throws a `RangeError`
 * naming the field: `stock must be >= 0, got -1`.
 */
export function min(minimum: number) {
  return function <This>(
    target: ClassAccessorDecoratorTarget<This, number>,
    context: ClassAccessorDecoratorContext<This, number>,
  ): ClassAccessorDecoratorResult<This, number> {
    const check = (value: number) => {
      if (value < minimum) throw new RangeError(`${String(context.name)} must be >= ${minimum}, got ${value}`);
      return value;
    };
    return {
      init: check,
      set(value) {
        target.set.call(this, check(value));
      },
    };
  };
}

/** Class decorator: instances get a `toString()` that returns their JSON. */
export function jsonString<Class extends abstract new (...args: any[]) => object>(
  target: Class,
  _context: ClassDecoratorContext<Class>,
) {
  target.prototype.toString = function (this: object) {
    return JSON.stringify(this);
  };
}

/**
 * Method decorator factory: registers the method as a CLI command, in the
 * metadata of its class — `context.metadata`. Nothing is called at run time:
 * `commandsOf` reads the registry back.
 */
export function command(name: string) {
  return function (_target: unknown, context: ClassMethodDecoratorContext) {
    const commands = (context.metadata.commands ??= {}) as Record<string, string | symbol>;
    commands[name] = context.name;
  };
}

/** The commands of a class: `{ add: 'addItem', … }`, `{}` when it has none. */
export function commandsOf(target: object): Record<string, string | symbol> {
  const metadata = (target as { [Symbol.metadata]?: DecoratorMetadata | null })[Symbol.metadata];
  return { ...((metadata?.commands as Record<string, string | symbol> | undefined) ?? {}) };
}
