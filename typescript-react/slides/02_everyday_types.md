---
layout: cover
---

# 2 - Everyday types

---
src: ../../typescript-common/slides/02_everyday_types/learning-objectives.md
---

---

# Declaring variables

```tsx
function Profile() {
  var firstName = 'Manu';    // function-scoped, hoisted: forget it
  let lastName = 'Demey';    // block-scoped, reassignable
  const age = 42;            // block-scoped, never reassigned
}
```

- The same keywords as JavaScript: TypeScript adds **types**, not new ways to
  declare
- `const` means **not reassigned**, not **immutable**:

```tsx
const [user, setUser] = useState({ firstName: 'Manu' });
user.firstName = 'Emmanuel';         // ✔ compiles — the object is mutable (React never sees it)
user = { firstName: 'Emmanuel' };    // ✘ Cannot assign to 'user' because it is a constant.
```

---

# Primitives — and inference

```tsx
const [title, setTitle] = useState<string>('TypeScript');
const [count, setCount] = useState<number>(42);         // integers and floats alike
const [done, setDone] = useState<boolean>(false);
const [size, setSize] = useState<bigint>(9007199254740993n);
const key: symbol = Symbol('id');
const nothing: null = null;
const missing: undefined = undefined;
```

Most of the time, **write none of them**: TypeScript **infers** from the value.

```tsx
const [title, setTitle] = useState('TypeScript');   // string
const count = 42;           // 42 — a const never changes: its type is the literal
setTitle(42);   // ✘ Argument of type 'number' is not assignable to parameter of type 'SetStateAction<string>'.
```

> Annotate **function signatures** — props included — and **exported** values; let inference do the rest.

---

# Arrays and tuples

```tsx
interface TagListProps {
  tags: string[];
  ids: Array<number>;              // the same thing
  selected: readonly string[];     // no push, no splice
}
selected.push('c');   // ✘ Property 'push' does not exist on type 'readonly string[]'.
```

A **tuple** is an array of a known length, a type per position:

```tsx
type Point = [x: number, y: number];             // labels: documentation only
const [position, setPosition] = useState<Point>([0, 0]);
const [x, y] = position;

type Field = [value: string, setValue: (value: string) => void, error?: string];
```

- `useState` returns a tuple: `[value, setValue]`
- `Object.entries(o)` gives `[string, T][]`

---

# Object types

```tsx
interface Product {
  readonly id: string;     // set once, never reassigned
  name: string;
  price: number;
  discount?: number;       // optional: number | undefined
}

function ProductCard({ product }: { product: Product }) {
  product.id = 'beer';     // ✘ Cannot assign to 'id' because it is a read-only property.
  return <p>{product.name} {product.discount?.toFixed(2)}</p>;   // optional chaining: undefined if absent
}
```

- **Excess property check**: a literal with an unknown key is an error

```tsx
<ProductCard product={{ id: 'tea', name: 'Tea', price: 499, prise: 1 }} />
// ✘ Object literal may only specify known properties, but 'prise' does not exist in type 'Product'.
```

---

# `interface` or `type`?

```tsx
interface ButtonProps { label: string; }
interface IconButtonProps extends ButtonProps { icon: ReactNode; }

type ButtonProps = { label: string };
type IconButtonProps = ButtonProps & { icon: ReactNode };

type Size = 'sm' | 'md' | 'lg';                   // only `type` can name a union…
type Field = [string, (value: string) => void];   // …a tuple, a primitive, a mapped type
```

| | `interface` | `type` |
|---|---|---|
| Object shapes | ✔ | ✔ |
| Unions, tuples, primitives | ✘ | ✔ |
| `extends` / `implements` | ✔ | `&`, and `implements` on an object type |
| Declared twice → **merged** | ✔ (augmenting a library) | ✘ Duplicate identifier |

> A convention, not a rule: `interface` for object shapes, `type` for the rest.

---

# Functions

```tsx
function Counter({ initial }: { initial: number }): ReactNode {
  return <output>{initial}</output>;
}

function useCounter(initial = 0, step = 1) { /* … */ }
//                  ^ default value: optional, type inferred

function handleChange(event: ChangeEvent<HTMLInputElement>, field?: 'email' | 'name') {}
//                                                         ^ optional: … | undefined
function classNames(...names: (string | false)[]): string {   // rest: always an array
  return names.filter(Boolean).join(' ');
}

type ChangeHandler<T> = (value: T) => void;                    // a function type
```

- Parameters are **never** inferred (they are `any`, refused by `strict`)
- Return types are inferred — annotate them on exported functions: the contract
  is then written down, and a wrong `return` is reported **where** it is

---

# Overloads

One function, several **signatures** — when the return type depends on the arguments:

```tsx
function useProduct(id: string): Product | undefined;
function useProduct(ids: readonly string[]): Product[];
function useProduct(query: string | readonly string[]): Product | Product[] | undefined {
  const catalog = use(CatalogContext);
  return typeof query === 'string'
    ? catalog.find((p) => p.id === query)
    : catalog.filter((p) => query.includes(p.id));
}

useProduct('tea');           // Product | undefined
useProduct(['tea', 'milk']); // Product[]
useProduct(42);              // ✘ No overload matches this call.
```

- The **implementation signature** is not visible to callers
- A union parameter is simpler when the return type does **not** change

---

# `any`, `unknown`, `never`

```tsx
const saved: any = JSON.parse(localStorage.getItem('prefs') ?? '{}');
saved.theme.toUpperCase();   // ✔ compiles — the checker is off. 💥 at run time

const prefs: unknown = JSON.parse(localStorage.getItem('prefs') ?? '{}');
prefs.theme;                 // ✘ 'prefs' is of type 'unknown'.
if (typeof prefs === 'object' && prefs !== null && 'theme' in prefs) prefs.theme;   // ✔ once checked

function fail(message: string): never {   // never returns
  throw new Error(message);
}
const auth = use(AuthContext) ?? fail('useAuth() outside <AuthProvider>');   // Auth
```

| | Accepts | Lets you |
|---|---|---|
| `any` | everything | do anything — **contagious**, switches the checker off |
| `unknown` | everything | do nothing until you **narrow** it |
| `never` | nothing | — the empty type: an impossible case |

> Input you do not control — `JSON.parse`, `localStorage`, `fetch`, `catch (e)` — is `unknown`.

---

# `as const`

```tsx
const VARIANTS = ['primary', 'danger', 'ghost'];             // string[]
const VARIANTS = ['primary', 'danger', 'ghost'] as const;    // readonly ['primary', 'danger', 'ghost']

type Variant = (typeof VARIANTS)[number];   // 'primary' | 'danger' | 'ghost'
<select>{VARIANTS.map((v) => <option key={v}>{v}</option>)}</select>   // the same list, at run time

const theme = { radius: 4, mode: 'dark' } as const;
//    { readonly radius: 4; readonly mode: 'dark' }
theme.radius = 8;   // ✘ read-only
```

- Every value becomes its **literal** type, every property and array `readonly`
- **One** list — the runtime values — and the type is derived from it: they
  cannot drift apart

---

# `satisfies`

```tsx
const STYLES: Record<string, CSSProperties> = { primary: { color: 'white' }, danger: { color: 'red' } };
STYLES.link;             // CSSProperties — wrong, and silent: the annotation widened the type

const STYLES = {
  primary: { color: 'white' }, danger: { color: 'red' }, ghost: {},
} satisfies Record<Variant, CSSProperties>;
STYLES.link;             // ✘ Property 'link' does not exist
// remove ghost          // ✘ Property 'ghost' is missing
```

- An **annotation** replaces the type of the value with the declared one
- **`satisfies`** checks the value against the type, and **keeps** its own,
  more precise type
- Together: `as const satisfies …` — literal **and** checked

---

# `using` — explicit resource management

```tsx
function startLoading(setLoading: (loading: boolean) => void): Disposable {
  setLoading(true);
  return {
    [Symbol.dispose]() {
      setLoading(false);
    },
  };
}

async function handleSave() {
  using _loading = startLoading(setLoading);
  await saveDraft();
}   // ← Symbol.dispose is called here, even if saveDraft threw

await using upload = await startUpload(file);   // Symbol.asyncDispose, awaited
```

- The `try` / `finally` you would have written, by the language
- ES2026, run natively by Node.js 24 — and by Vitest: `using spy = vi.spyOn(…)`

---

# `await using` and `DisposableStack`

```tsx
async function handleImport(file: File) {
  await using upload = await startUpload(file);   // Symbol.asyncDispose
  await using lock = await lockTab('import');     // disposed first: reverse order
  for await (const chunk of file.stream()) await upload.send(chunk);
}                                                 // lock released, then upload — even on a throw

useEffect(() => {
  using stack = new DisposableStack();
  for (const url of urls) stack.use(openSocket(url));
  const owned = stack.move();                     // success: hand them over, nothing closed
  return () => owned.dispose();                   // the effect's cleanup closes them
}, [urls]);                                       // a throw halfway: the opened ones are closed
```

- `await using` **awaits** `Symbol.asyncDispose` at the end of the scope
- **`DisposableStack`** / `AsyncDisposableStack`: a dynamic number of resources,
  `defer(() => …)` for a plain callback
- Disposal runs in **reverse** order of declaration

---

# New built-ins, typed — `lib: ["es2025"]` and `esnext`

```tsx
const firstBigOrders = Iterator.from(orders)    // iterator helpers: lazy
  .filter((o) => o.total > 100)
  .map((o) => o.id)
  .take(3)
  .toArray();                                   // string[]

const both = admins.intersection(editors);      // Set methods: union, difference…
const byStatus = Object.groupBy(orders, (o) => o.status);   // Partial<Record<Status, Order[]>>
const { promise, resolve } = Promise.withResolvers<boolean>();   // a confirm dialog's answer

const cache = useRef(new Map<string, Order[]>());
cache.current.getOrInsertComputed(customerId, () => []).push(order);   // esnext: upsert
```

- The types follow `lib`, not `target`: `lib` says **what exists at run time**
- `Iterator` and `Set` methods moved into **`es2025`** with TypeScript 6;
  `Temporal` and `Map.getOrInsert` are still `esnext`

---
src: ../../typescript-common/slides/02_everyday_types/quiz.md
---

---
layout: cover
---

# Hands-on

## Workshop 2 - Everyday types
