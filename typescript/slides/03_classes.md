---
layout: cover
---

# 3 - Classes & interfaces

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Write** a class with typed fields, a constructor, methods and accessors
- **Choose** between `private` and `#private`, `protected` and `public`
- **Share** behaviour with inheritance and `abstract` classes
- **Check** a class against a contract with `implements`
- **Avoid** the syntax Node.js cannot strip: parameter properties and `enum`

---

# A class

```ts
class Todo {
  readonly id: number;
  title: string;
  done = false;                          // initialised: type inferred

  constructor(id: number, title: string) {
    this.id = id;
    this.title = title;
  }

  toggle(): void {
    this.done = !this.done;
  }
}

const todo = new Todo(1, 'Buy milk');
todo.id = 2;   // ✘ Cannot assign to 'id' because it is a read-only property
```

- A class is **two things**: a value (the constructor) and a type (its instances)
- `strictPropertyInitialization`: a field neither initialised nor assigned in
  the constructor is an error

---

# Visibility

```ts
class Account {
  public owner: string;          // the default — rarely written
  protected balance = 0;         // this class and its subclasses
  private pin: string;           // this class only — for the checker
  #history: number[] = [];       // this class only — for JavaScript too

  constructor(owner: string, pin: string) {
    this.owner = owner;
    this.pin = pin;
  }
}

const account = new Account('Manu', '1234');
account.pin;                   // ✘ Property 'pin' is private
(account as any).pin;          // '1234' — private is erased at compile time
Object.keys(account);          // ['owner', 'balance', 'pin'] — no #history
```

> `#private` is **JavaScript**: enforced at run time, invisible to `Object.keys`
> and `JSON.stringify`. Prefer it for real encapsulation.

---

# Inheritance

```ts
class Animal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  speak(sound = '…'): string {
    return `${this.name} says ${sound}`;
  }
}

class Dog extends Animal {
  constructor(name: string) {
    super(name);                 // before any `this`
  }
  override speak(): string {     // `noImplicitOverride`: say it on purpose
    return super.speak('woof');
  }
}
```

- Built on JavaScript's **prototypes**: `class` is the syntax, not a new model
- `override` catches the method renamed in the parent class, and no longer overriding anything

---

# Abstract classes

```ts
abstract class TodoStore {
  protected abstract load(): Promise<Todo[]>;      // no body: subclasses must write it
  protected abstract save(todos: Todo[]): Promise<void>;

  async add(title: string): Promise<void> {        // written once, for every store
    const todos = await this.load();
    await this.save([...todos, { id: todos.length + 1, title, done: false }]);
  }
}

class MemoryStore extends TodoStore {
  #todos: Todo[] = [];
  protected async load() { return [...this.#todos]; }
  protected async save(todos: Todo[]) { this.#todos = todos; }
}

new TodoStore();   // ✘ Cannot create an instance of an abstract class
```

> The **template method** pattern: the algorithm in the parent, the variable steps in the children.

---

# `implements`

```ts
interface TodoList {
  add(title: string): Promise<Todo>;
  list(): Promise<Todo[]>;
}

class FileTodoList implements TodoList {
  async add(title: string): Promise<Todo> { … }
  // ✘ Class 'FileTodoList' incorrectly implements interface 'TodoList'.
  //   Property 'list' is missing
}
```

- `implements` **checks** the class against the interface — it adds nothing to it
- Types are **structural**: any object with `add` and `list` **is** a `TodoList`,
  `implements` or not
- Code against the interface, swap the implementation: memory in tests, a file
  or a database in production

---

# Static members and accessors

```ts
class Temperature {
  static readonly ABSOLUTE_ZERO = -273.15;
  static #instances = 0;

  #celsius: number;

  constructor(celsius: number) {
    this.#celsius = celsius;
    Temperature.#instances++;
  }

  static get instances(): number { return Temperature.#instances; }

  get fahrenheit(): number { return this.#celsius * 1.8 + 32; }
  set fahrenheit(value: number) { this.#celsius = (value - 32) / 1.8; }
}

new Temperature(20).fahrenheit;   // 68 — read like a field
Temperature.instances;            // 1
```

---

# Erasable syntax only

Node.js runs `.ts` files by **stripping** the types — it never generates code.
Two TypeScript features **do** generate code:

```ts
class User {
  constructor(private name: string) {}   // ✘ parameter property: emits this.name = name
}

enum Status { Idle, Loading }             // ✘ emits an object at run time
```

`"erasableSyntaxOnly": true` refuses them. Write instead:

```ts
class User {
  #name: string;
  constructor(name: string) { this.#name = name; }
}

const Status = { Idle: 'idle', Loading: 'loading' } as const;
type Status = (typeof Status)[keyof typeof Status];    // 'idle' | 'loading'
```

> Same for `namespace` with values. The rest of TypeScript is **just types**.

---

# Quiz — Question 1 / 3

**A field is declared `private secret: string`. Which line gives its value at
run time?**

- **A.** None: the field does not exist at run time
- **B.** `JSON.stringify(instance)`
- **C.** Only a method of the class
- **D.** It throws a `TypeError`

<v-click>

> ✅ **B** — `private` is checked by the compiler, then **erased**: the field is
> a plain property. `#secret` would be invisible to `JSON.stringify`,
> `Object.keys` — and to any code outside the class.

</v-click>

---

# Quiz — Question 2 / 3

**`class Cat implements Pet` compiles. What does `implements` give `Cat`?**

- **A.** The methods of `Pet`, with their implementation
- **B.** Nothing: it checks `Cat` against `Pet`, that's all
- **C.** The ability to be passed where a `Pet` is expected
- **D.** The types of the parameters of its methods

<v-click>

> ✅ **B** — **C** is true without `implements` too: types are **structural**, any
> object with the right shape is a `Pet`. `implements` only moves the error to
> the class, where it is easy to read. Even parameter types are **not** inferred from it.

</v-click>

---

# Quiz — Question 3 / 3

**With `erasableSyntaxOnly`, which line compiles?**

- **A.** `enum Role { Admin, User }`
- **B.** `constructor(private readonly repo: Repo) {}`
- **C.** `const Role = { Admin: 'admin', User: 'user' } as const;`
- **D.** `namespace Utils { export const pi = 3.14; }`

<v-click>

> ✅ **C** — **A**, **B** and **D** all generate JavaScript that is not in the
> source. Node.js only **removes** the types: it cannot run them. An `as const`
> object is plain JavaScript, with a type derived from it.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 3 - Classes & interfaces
