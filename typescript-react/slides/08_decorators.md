---
layout: cover
---

# 8 - Decorators

---
src: ../../typescript-common/slides/08_decorators/learning-objectives.md
---

---

# What is a decorator?

- A **function**, applied with `@` to a class or to one of its members
- It receives what it decorates, and may **replace** it
- Used everywhere in frameworks: **Angular**, **NestJS**, **TypeORM**, **Lit**,
  **MobX** — in React apps, on the **store** and **service** classes components use

```tsx
@jsonString
class CartStore extends Store {
  @min(0) accessor discount = 0;

  @logged(console.log)
  add(sku: string, price: number) { /* … */ }
}

<button onClick={() => cart.add('pen', 2)}>Add a pen</button>
```

- Five kinds: **class**, **method**, **getter / setter**, **field**, **auto-accessor**
- **No parameter decorators** in the standard: those only exist in the legacy flavour

---
src: ../../typescript-common/slides/08_decorators/two-flavours-of-decorators.md
---

---

# Decorators are not erasable

```tsx
class CartStore {
  @logged(console.log) add() {}
}
```

- A type annotation can be **stripped**; a decorator must be **compiled** into code
  that calls it
- `node cart.ts` (type stripping) **refuses** it: `SyntaxError`
- No JavaScript engine runs standard decorators natively yet

<br />

- **`tsc`** compiles them — and so do **esbuild**, **tsx**, **swc**, Babel
- Vite's default transform (**oxc**) — and so `@vitejs/plugin-react` — only lowers
  the **legacy** ones today
- `erasableSyntaxOnly` in `tsconfig.json` forbids them, along with `enum` and
  `namespace`

---

# A method decorator

```tsx
function logged<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  return function (this: This, ...args: Args): Return {
    console.log(`→ ${String(context.name)}(${args.join(', ')})`);
    const result = target.call(this, ...args);
    console.log(`← ${String(context.name)} = ${result}`);
    return result;
  };
}

class CounterStore {
  count = 0;
  @logged
  increment(by: number) { return (this.count += by); }
}

<button onClick={() => counter.increment(1)}>+1</button>   // → increment(1)   ← increment = 1
```

- It returns the **replacement** — or nothing, to keep the method as it is
- A `function`, not an arrow: the replacement needs **its own `this`**

---

# The `context` object

```ts
interface ClassMethodDecoratorContext<This, Value> {
  readonly kind: 'method';
  readonly name: string | symbol;
  readonly static: boolean;
  readonly private: boolean;
  readonly access: { has(object: This): boolean; get(object: This): Value };
  readonly metadata: DecoratorMetadata;
  addInitializer(initializer: (this: This) => void): void;
}
```

- One context type per kind: `ClassDecoratorContext`,
  `ClassMethodDecoratorContext`, `ClassGetterDecoratorContext`,
  `ClassSetterDecoratorContext`, `ClassFieldDecoratorContext`,
  `ClassAccessorDecoratorContext`
- Typing `context` **restricts** where the decorator may go: a method decorator
  on a field is a compile error

---

# `addInitializer` — run code per instance

```tsx
function bound<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  context.addInitializer(function (this: This) {
    (this as any)[context.name] = target.bind(this);
  });
}

class FormStore {
  status = 'saved';
  @bound save() { return this.status; }
}

const form = new FormStore();
<button onClick={form.save}>Save</button>   // 'saved' — not a TypeError on `this`
```

- On a member: runs **in the constructor**, before the field initialisers
- On a class: runs **once**, after the class is defined

---

# Decorator factories

```tsx
function logged(sink: (line: string) => void) {
  return function <This, Args extends unknown[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  ) {
    return function (this: This, ...args: Args): Return {
      const result = target.call(this, ...args);
      sink(`${String(context.name)}(${args.join(', ')}) → ${result}`);
      return result;
    };
  };
}

class CartStore {
  lines: string[] = [];
  @logged((line) => audit.push(line))
  add(sku: string) { return this.lines.push(sku); }
}
```

- `@logged(…)` **calls** the factory, which **returns** the decorator
- Factories are **evaluated** top to bottom; decorators are **applied** bottom to top

---

# A class decorator

```tsx
function jsonString<Class extends abstract new (...args: any[]) => object>(
  target: Class,
  context: ClassDecoratorContext<Class>,
) {
  target.prototype.toString = function () {
    return JSON.stringify(this);
  };
}

@jsonString
class FilterStore {
  query = 'ts';
  page = 1;
}

function DebugPanel({ store }: { store: object }) {
  return <pre>{`${store}`}</pre>;   // {"query":"ts","page":1}
}
```

- It may also **return a subclass**: `return class extends target { … }`
- TypeScript does **not** change the type of the class: a member added by a
  decorator is invisible to the checker

---

# Fields and auto-accessors

```tsx
function min(minimum: number) {
  return function <This>(
    target: ClassAccessorDecoratorTarget<This, number>,
    context: ClassAccessorDecoratorContext<This, number>,
  ): ClassAccessorDecoratorResult<This, number> {
    const check = (value: number) => {
      if (value < minimum) throw new RangeError(`${String(context.name)} must be >= ${minimum}`);
      return value;
    };
    return { init: check, set(value) { target.set.call(this, check(value)); } };
  };
}

class CartStore {
  @min(0) accessor discount = 0;
}

<input type="number" onChange={(e) => (cart.discount = e.target.valueAsNumber)} />
```

- A **field** decorator only sees the **initial value** — it returns an `init` function
- An **`accessor`** field is a getter/setter over a private slot: its decorator
  can intercept **every** read and write — how an `@observable` re-renders

---

# Getters and setters

```tsx
function immutable<This, Value extends object>(
  target: (this: This, value: Value) => void,
  context: ClassSetterDecoratorContext<This, Value>,
) {
  return function (this: This, value: Value) {
    target.call(this, Object.freeze({ ...value }));
  };
}

class SearchStore {
  #filters = { query: '', page: 1 };

  @immutable
  set filters(value: { query: string; page: number }) { this.#filters = value; }
  get filters() { return this.#filters; }
}

const search = new SearchStore();
const filters = { query: 'ts', page: 1 };
search.filters = filters;
search.filters === filters;   // false — a frozen copy
```

---

# Metadata — `context.metadata`

```tsx
function command(name: string) {
  return function (_target: unknown, context: ClassMethodDecoratorContext) {
    const commands = (context.metadata.commands ??= {}) as Record<string, string | symbol>;
    commands[name] = context.name;
  };
}

class EditorStore {
  @command('save') persist() {}
  @command('undo') revert() {}
}

EditorStore[Symbol.metadata]?.commands;   // { save: 'persist', undo: 'revert' }
```

- **One object per class**, shared by all its decorators, then attached as
  `Class[Symbol.metadata]` — what a `<CommandPalette of={EditorStore} />` reads
- A subclass's metadata **inherits** from its parent's (prototype chain)
- Node.js 24 has no `Symbol.metadata` yet: polyfill it **before** any decorated class

```ts
(Symbol as { metadata?: symbol }).metadata ??= Symbol('Symbol.metadata');
```

---

# Legacy decorators — `experimentalDecorators`

```tsx
// tsconfig.json: "experimentalDecorators": true, "emitDecoratorMetadata": true
import 'reflect-metadata';

function logger(target: object, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: unknown[]) {
    console.log('params:', ...args);
    return original.apply(this, args);
  };
}

@injectable()
class UserService {
  constructor(@inject(HTTP) private http: HttpClient) {}   // parameter decorator

  @logger
  find(id: string) { /* … */ }
}

const users = useInjection(UserService);   // InversifyJS, in a component
```

- `(target, key, descriptor)`: the **prototype**, not the method; a descriptor to mutate
- **Parameter decorators** and `emitDecoratorMetadata` (the constructor's
  parameter types, at run time) are what dependency injection relies on
- Still what **Angular** and **NestJS** require — do not mix the two in a project

---

# Quiz — Question 1 / 3

**Two decorators are stacked on one method. In which order are they applied?**

```tsx
class CartStore {
  @command('add')
  @logged(console.log)
  add() {}
}
```

- **A.** `@command` first, then `@logged`
- **B.** `@logged` first, then `@command` — the closest to the method first
- **C.** In parallel, both on the original method
- **D.** It depends on the `target` of `tsconfig.json`

<v-click>

> ✅ **B** — The expressions `command('add')` and `logged(console.log)` are
> **evaluated** top to bottom, but the decorators are **applied** bottom to top,
> like function composition: `command(logged(add))`.

</v-click>

---
src: ../../typescript-common/slides/08_decorators/quiz.md
---

---
layout: cover
---

# Hands-on

## Workshop 8 - Decorators
