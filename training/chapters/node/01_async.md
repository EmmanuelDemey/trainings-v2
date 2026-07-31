---
layout: cover
---

# 1 - Taming the async paradigm

---

# Why async?

- Node.js is **single-threaded** by default
- Blocking the main thread = blocking every other request
- All **I/O** operations (file, network, DB) are **non-blocking**

```ts
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';

// Blocking - to avoid
const data: Buffer = fs.readFileSync('./big.json');

// Non-blocking - preferred
fs.readFile('./big.json', (err, data) => { ... });

// Promise / async-await
const data: Buffer = await readFile('./big.json');
```

---

# Benefits of async

- **Scalability**: a single thread can handle thousands of connections
- Smaller **memory footprint** (no thread per request like in Java/PHP)
- **Event-driven** model that fits HTTP servers, websockets, IoT, etc.
- Composability with **streams** and **EventEmitter**

---

# Pitfalls to avoid

- **Callback hell**

```ts
fs.readFile(file, (err, data) => {
  parse(data, (err, json) => {
    save(json, (err, id) => {
      notify(id, (err) => {
        // ...
      });
    });
  });
});
```

- Forgetting `return` or `await` (the promise is silently ignored)
- Exceptions thrown inside an async callback that crash the process
- **Counter-intuitive** ordering between `setTimeout`, `setImmediate`, `process.nextTick` and microtasks

---

# Callbacks - Node.js convention

- The first argument is **always the error** (the `errback` convention)
- The remaining arguments are the return values

```ts
import fs from 'node:fs';

fs.readFile('./config.json', 'utf-8', (err: NodeJS.ErrnoException | null, data: string) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
```

- Recent modules ship a `promise` flavor available via `import ... from 'node:fs/promises'`

---

# Promises

- A **Promise** represents an upcoming asynchronous computation
- Three states: `pending`, `fulfilled`, `rejected`
- Handlers are attached via `.then()`, `.catch()`, `.finally()`

```ts
interface User { id: number; name: string }

fetch('https://api.example.com/users')
  .then((response: Response) => response.json() as Promise<User[]>)
  .then((users: User[]) => console.log(users))
  .catch((err: unknown) => console.error(err))
  .finally(() => console.log('done'));
```

---

# Promises - creation

```ts
const wait = (ms: number): Promise<void> => new Promise((resolve, reject) => {
  if (ms < 0) {
    reject(new Error('Invalid delay'));
    return;
  }
  setTimeout(resolve, ms);
});

await wait(1000);
```

- `Promise.resolve(value)` / `Promise.reject(error)` build an already-resolved/rejected promise

---

# Promises - utilities

| Method | Behavior |
|--------|----------|
| `Promise.all([...])` | Resolves when all succeed, rejects on the first error |
| `Promise.allSettled([...])` | Waits for all (success or failure) and returns their status |
| `Promise.race([...])` | Resolves/rejects as soon as the first promise settles |
| `Promise.any([...])` | Resolves as soon as the first promise succeeds |

```ts
const [user, orders]: [User, Order[]] = await Promise.all([
  fetchUser(id),
  fetchOrders(id),
]);
```

---

# async / await

- Syntactic sugar over Promises
- An `async` function **always** returns a Promise
- `await` can be used **only** inside an `async` function (or top-level in an ESM module)

```ts
const loadUser = async (id: number): Promise<User> => {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Not found');
    return await response.json() as User;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
```

---

# async / await - parallelism

- `await` is sequential by default

```ts
// Sequential - slow
const user: User = await fetchUser(id);
const orders: Order[] = await fetchOrders(id);
```

- To parallelize, kick off the promises first then `await` them together

```ts
// Parallel - fast
const userPromise: Promise<User> = fetchUser(id);
const ordersPromise: Promise<Order[]> = fetchOrders(id);
const user = await userPromise;
const orders = await ordersPromise;

// Or more simply
const [user, orders] = await Promise.all([fetchUser(id), fetchOrders(id)]);
```

---

# Callback ➜ Promise conversion

- **`util.promisify`** turns a callback-style function into one that returns a Promise

```ts
import { promisify } from 'node:util';
import fs from 'node:fs';

const readFile = promisify(fs.readFile);

const data: Buffer = await readFile('./data.json');
```

- Conversely, `util.callbackify` adapts a promise-returning function to a callback signature

---

# Top-level await

- Available in ESM modules (`type: module` in `package.json` or `.mjs` files)
- Avoids wrapping the code in an async IIFE

```ts
// app.ts
import { connect } from './db.ts';
import type { Db } from './db.ts';

const db: Db = await connect();
console.log('connected');
```

- Caveat: it delays module loading; use sparingly

---

# The future with ES-Next

- **Promise.withResolvers()** (ES2024) - create a Promise with direct access to `resolve`/`reject`

```ts
const { promise, resolve, reject } = Promise.withResolvers<Buffer>();

emitter.once('data', resolve);
emitter.once('error', reject);

const data: Buffer = await promise;
```

- Async **iterator helpers** (ES2025) - `.map`, `.filter`, `.take`, `.toArray` on `AsyncIterator`
- **Explicit Resource Management** (`using`, `await using`)

---

# Async iterators

- Consume an asynchronous flow with `for await ... of`

```ts
import fs from 'node:fs';

const stream = fs.createReadStream('./log.txt', { encoding: 'utf-8' });

for await (const chunk of stream) {
  console.log('chunk:', chunk.length);
}
```

- Manual implementation via `Symbol.asyncIterator`

---

# AbortController

- Web standard adopted by Node.js to **cancel** asynchronous operations

```ts
const controller = new AbortController();
const { signal } = controller;

setTimeout(() => controller.abort(), 5000);

try {
  const res = await fetch('https://slow.example.com', { signal });
  const body: string = await res.text();
} catch (err) {
  if (err instanceof Error && err.name === 'AbortError') {
    console.log('Request aborted');
  }
}
```

---

# Explicit Resource Management

- Stable since **Node 24** (V8 13.6): `using` / `await using` auto-clean a resource at scope end
- A disposable implements `Symbol.dispose` (sync) or `Symbol.asyncDispose` (async)
- `await using` awaits the async cleanup - ideal for I/O resources

```ts
import { open } from 'node:fs/promises';

async function read(path: string): Promise<string> {
  // FileHandle implements Symbol.asyncDispose
  await using file = await open(path, 'r');
  const { buffer } = await file.read();
  return buffer.toString('utf-8');
} // file.close() called automatically here, even on throw
```

- No more `try/finally` to release file handles, DB connections or locks

---

# Sync vs async code

| Synchronous | Asynchronous |
|-------------|--------------|
| `fs.readFileSync` | `fs.readFile` / `fs.promises.readFile` |
| `crypto.pbkdf2Sync` | `crypto.pbkdf2` |
| `child_process.execSync` | `child_process.exec` |

- The `Sync` APIs should only be used **at startup** (loading config) or in CLI scripts
- Inside an HTTP server, they block every in-flight request

---
layout: cover
---

# Hands-on

## Workshop 1 - Async
- Rewrite a callback-based script using async/await
- Parallelize HTTP calls with `Promise.all`
- Set up a timeout with `AbortController`
