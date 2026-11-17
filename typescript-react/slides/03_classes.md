---
layout: cover
---

# 3 - Classes & interfaces

---
src: ../../typescript-common/slides/03_classes/learning-objectives.md
---

---

# A class

```tsx
class CartLine {
  readonly sku: string;
  label: string;
  quantity = 1;                          // initialised: type inferred

  constructor(sku: string, label: string) {
    this.sku = sku;
    this.label = label;
  }

  increment(): void {
    this.quantity++;
  }
}

const line = new CartLine('TS-7', 'TypeScript book');            // the value
const CartRow = ({ line }: { line: CartLine }) => <li>{line.label}</li>;   // the type
line.sku = 'TS-8';   // ✘ Cannot assign to 'sku' because it is a read-only property
```

- A class is **two things**: a value (the constructor) and a type (its instances)
- `strictPropertyInitialization`: a field neither initialised nor assigned in
  the constructor is an error

---

# Visibility

```tsx
class AuthService {
  public user: User | null = null;  // the default — rarely written
  protected baseUrl = '/api';       // this class and its subclasses
  private apiKey: string;           // this class only — for the checker
  #token: string | null = null;     // this class only — for JavaScript too

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
}

const auth = new AuthService('sk-123');
auth.apiKey;                 // ✘ Property 'apiKey' is private
(auth as any).apiKey;        // 'sk-123' — private is erased at compile time
Object.keys(auth);           // ['user', 'baseUrl', 'apiKey'] — no #token
```

> `#private` is **JavaScript**: enforced at run time, invisible to `Object.keys`
> and `JSON.stringify`. Prefer it for real encapsulation.

---

# Inheritance

```tsx
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);                               // before any `this`
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }
  override componentDidCatch(error: Error, info: ErrorInfo) {   // `noImplicitOverride`:
    reportError(error, info.componentStack);                    // say it on purpose
  }
  override render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}
```

- Built on JavaScript's **prototypes**: `class` is the syntax, not a new model
- `override` catches the method renamed in the parent class, and no longer overriding anything

<!--
The error boundary is the one class component React still needs: no hook
catches a render error. `override componentDidCath(…)` (typo) is refused:
"This member cannot have an 'override' modifier because it is not declared in
the base class 'Component<Props, State, any>'. Did you mean 'componentDidCatch'?"
Without `override`, under `noImplicitOverride`, `render` is refused too: "This
member must have an 'override' modifier because it overrides a member in the
base class".
-->

---

# Abstract classes

```tsx
abstract class TodoStore {
  protected abstract load(): Todo[];              // no body: subclasses must write it
  protected abstract save(todos: Todo[]): void;

  add(title: string): void {                      // written once, for every store
    const todos = this.load();
    this.save([...todos, { id: todos.length + 1, title, done: false }]);
  }
}

class LocalStorageStore extends TodoStore {
  protected load(): Todo[] { return JSON.parse(localStorage.getItem('todos') ?? '[]'); }
  protected save(todos: Todo[]) { localStorage.setItem('todos', JSON.stringify(todos)); }
}

<button onClick={() => store.add('Buy milk')}>Add</button>
new TodoStore();   // ✘ Cannot create an instance of an abstract class
```

> The **template method** pattern: the algorithm in the parent, the variable steps in the children.

---

# `implements`

```tsx
interface CartStore {
  subscribe(listener: () => void): () => void;
  getSnapshot(): CartLine[];
}

class LocalStorageCart implements CartStore {
  subscribe = (listener: () => void) => { … };
  // ✘ Class 'LocalStorageCart' incorrectly implements interface 'CartStore'.
  //   Property 'getSnapshot' is missing
}

const useCart = (store: CartStore) => useSyncExternalStore(store.subscribe, store.getSnapshot);
```

- `implements` **checks** the class against the interface — it adds nothing to it
- Types are **structural**: any object with `subscribe` and `getSnapshot` **is** a
  `CartStore`, `implements` or not
- Code against the interface, swap the implementation: memory in tests,
  `localStorage` or a server in production

---

# Static members and accessors

```tsx
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

const Thermometer = ({ temperature }: { temperature: Temperature }) =>
  <p>{temperature.fahrenheit} °F</p>;        // 68 °F for 20 — read like a field
Temperature.instances;                       // 1
```

> Coming next — `accessor discount = 0` declares a getter/setter pair in one
> line: the **auto-accessor**, made for decorators (chapter 8). `tsc` accepts
> it; Node.js 24 does not run it yet.

---

# Erasable syntax only

Node.js runs `.ts` files by **stripping** the types — it never generates code.
Two TypeScript features **do** generate code:

```tsx
class AuthService {
  constructor(private http: HttpClient) {}   // ✘ parameter property: emits this.http = http
}

enum Status { Idle, Loading }                 // ✘ emits an object at run time
```

`"erasableSyntaxOnly": true` refuses them. Write instead:

```tsx
class AuthService {
  #http: HttpClient;
  constructor(http: HttpClient) { this.#http = http; }
}

const Status = { Idle: 'idle', Loading: 'loading' } as const;
type Status = (typeof Status)[keyof typeof Status];    // 'idle' | 'loading'
const [status, setStatus] = useState<Status>(Status.Idle);
```

> Also refused: `const enum`, a `namespace` with values, `import x = require()`
> and the `<T>value` cast (write `value as T` — in a `.tsx` it is the only one).
> Still fine: `declare enum`, type-only namespaces. Everything else is **just types**.

---
src: ../../typescript-common/slides/03_classes/quiz.md
---

---
layout: cover
---

# Hands-on

## Workshop 3 - Classes & interfaces
