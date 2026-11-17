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
  **MobX**

```ts
@jsonString
class Cart {
  @min(0) accessor discount = 0;

  @logged(console.log)
  add(sku: string, price: number) { /* … */ }
}
```

- Five kinds: **class**, **method**, **getter / setter**, **field**, **auto-accessor**
- **No parameter decorators** in the standard: those only exist in the legacy flavour

---
src: ../../typescript-common/slides/08_decorators/two-flavours-of-decorators.md
---

---

# Decorators are not erasable

```ts
class Cart {
  @logged(console.log) add() {}
}
```

- A type annotation can be **stripped**; a decorator must be **compiled** into code
  that calls it
- `node cart.ts` (type stripping) **refuses** it: `SyntaxError`
- No JavaScript engine runs standard decorators natively yet

<br />

- **`tsc`** compiles them — and so do **esbuild**, **tsx**, **swc**, Babel
- Vite's default transform (**oxc**) only lowers the **legacy** ones today
- `erasableSyntaxOnly` in `tsconfig.json` forbids them, along with `enum` and
  `namespace`

---

# A method decorator

```ts
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

class Calculator {
  @logged
  add(x: number, y: number) { return x + y; }
}

new Calculator().add(1, 2);   // → add(1, 2)   ← add = 3
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

```ts
function bound<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  context.addInitializer(function (this: This) {
    (this as any)[context.name] = target.bind(this);
  });
}

class Button {
  label = 'OK';
  @bound click() { return this.label; }
}

const { click } = new Button();
click();   // 'OK' — not a TypeError on `this`
```

- On a member: runs **in the constructor**, before the field initialisers
- On a class: runs **once**, after the class is defined

---

# Decorator factories

```ts
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

class Calculator {
  @logged((line) => audit.push(line))
  add(x: number, y: number) { return x + y; }
}
```

- `@logged(…)` **calls** the factory, which **returns** the decorator
- Factories are **evaluated** top to bottom; decorators are **applied** bottom to top

---

# A class decorator

```ts
function jsonString<Class extends abstract new (...args: any[]) => object>(
  target: Class,
  context: ClassDecoratorContext<Class>,
) {
  target.prototype.toString = function () {
    return JSON.stringify(this);
  };
}

@jsonString
class Point {
  x = 1;
  y = 2;
}

`${new Point()}`;   // '{"x":1,"y":2}'
```

- It may also **return a subclass**: `return class extends target { … }`
- TypeScript does **not** change the type of the class: a member added by a
  decorator is invisible to the checker

---

# Fields and auto-accessors

```ts
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

class Cart {
  @min(0) accessor discount = 0;
}
```

- A **field** decorator only sees the **initial value** — it returns an `init` function
- An **`accessor`** field is a getter/setter over a private slot: its decorator
  can intercept **every** read and write

---

# Getters and setters

```ts
function immutable<This, Value extends object>(
  target: (this: This, value: Value) => void,
  context: ClassSetterDecoratorContext<This, Value>,
) {
  return function (this: This, value: Value) {
    target.call(this, Object.freeze({ ...value }));
  };
}

class Shape {
  #point = { x: 0, y: 0 };

  @immutable
  set point(value: { x: number; y: number }) { this.#point = value; }
  get point() { return this.#point; }
}

const shape = new Shape();
const point = { x: 1, y: 1 };
shape.point = point;
shape.point === point;   // false — a frozen copy
```

---

# Metadata — `context.metadata`

```ts
function command(name: string) {
  return function (_target: unknown, context: ClassMethodDecoratorContext) {
    const commands = (context.metadata.commands ??= {}) as Record<string, string | symbol>;
    commands[name] = context.name;
  };
}

class Git {
  @command('st') status() {}
  @command('co') checkout() {}
}

Git[Symbol.metadata]?.commands;   // { st: 'status', co: 'checkout' }
```

- **One object per class**, shared by all its decorators, then attached as
  `Class[Symbol.metadata]`
- A subclass's metadata **inherits** from its parent's (prototype chain)
- Node.js 24 has no `Symbol.metadata` yet: polyfill it **before** any decorated class

```ts
(Symbol as { metadata?: symbol }).metadata ??= Symbol('Symbol.metadata');
```

---

# Legacy decorators — `experimentalDecorators`

```ts
// tsconfig.json: "experimentalDecorators": true, "emitDecoratorMetadata": true
import 'reflect-metadata';

function logger(target: object, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: unknown[]) {
    console.log('params:', ...args);
    return original.apply(this, args);
  };
}

@Injectable()
class UserService {
  constructor(@Inject(HTTP) private http: HttpClient) {}   // parameter decorator

  @logger
  find(id: string) { /* … */ }
}
```

- `(target, key, descriptor)`: the **prototype**, not the method; a descriptor to mutate
- **Parameter decorators** and `emitDecoratorMetadata` (the constructor's
  parameter types, at run time) are what dependency injection relies on
- Still what **Angular** and **NestJS** require — do not mix the two in a project

---

# Quiz — Question 1 / 3

**Two decorators are stacked on one method. In which order are they applied?**

```ts
class Cart {
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
