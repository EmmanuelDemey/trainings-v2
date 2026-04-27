---
layout: cover
---

# 1 - Taming the async paradigm

---

# Why async?

- Node.js is **single-threaded** by default
- Blocking the main thread = blocking every other request
- All **I/O** operations (file, network, DB) are **non-blocking**

```javascript
// Blocking - to avoid
const data = fs.readFileSync('./big.json');

// Non-blocking - preferred
fs.readFile('./big.json', (err, data) => { ... });

// Promise / async-await
const data = await fs.promises.readFile('./big.json');
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

```javascript
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

```javascript
const fs = require('node:fs');

fs.readFile('./config.json', 'utf-8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
```

- Recent modules ship a `promise` flavor available via `require('node:fs/promises')` or `require('node:fs').promises`

---

# Promises

- A **Promise** represents an upcoming asynchronous computation
- Three states: `pending`, `fulfilled`, `rejected`
- Handlers are attached via `.then()`, `.catch()`, `.finally()`

```javascript
fetch('https://api.example.com/users')
  .then(response => response.json())
  .then(users => console.log(users))
  .catch(err => console.error(err))
  .finally(() => console.log('done'));
```

---

# Promises - creation

```javascript
const wait = (ms) => new Promise((resolve, reject) => {
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

```javascript
const [user, orders] = await Promise.all([
  fetchUser(id),
  fetchOrders(id),
]);
```

---

# async / await

- Syntactic sugar over Promises
- An `async` function **always** returns a Promise
- `await` can be used **only** inside an `async` function (or top-level in an ESM module)

```javascript
const loadUser = async (id) => {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Not found');
    return await response.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
```

---

# async / await - parallelism

- `await` is sequential by default

```javascript
// Sequential - slow
const user = await fetchUser(id);
const orders = await fetchOrders(id);
```

- To parallelize, kick off the promises first then `await` them together

```javascript
// Parallel - fast
const userPromise = fetchUser(id);
const ordersPromise = fetchOrders(id);
const user = await userPromise;
const orders = await ordersPromise;

// Or more simply
const [user, orders] = await Promise.all([fetchUser(id), fetchOrders(id)]);
```

---

# Callback ➜ Promise conversion

- **`util.promisify`** turns a callback-style function into one that returns a Promise

```javascript
const { promisify } = require('node:util');
const fs = require('node:fs');

const readFile = promisify(fs.readFile);

const data = await readFile('./data.json', 'utf-8');
```

- Conversely, `util.callbackify` adapts a promise-returning function to a callback signature

---

# Top-level await

- Available in ESM modules (`type: module` in `package.json` or `.mjs` files)
- Avoids wrapping the code in an async IIFE

```javascript
// app.mjs
import { connect } from './db.js';

const db = await connect();
console.log('connected');
```

- Caveat: it delays module loading; use sparingly

---

# The future with ES-Next

- **Promise.withResolvers()** (ES2024) - create a Promise with direct access to `resolve`/`reject`

```javascript
const { promise, resolve, reject } = Promise.withResolvers();

emitter.once('data', resolve);
emitter.once('error', reject);

const data = await promise;
```

- Async **iterator helpers** (ES2025) - `.map`, `.filter`, `.take`, `.toArray` on `AsyncIterator`
- **Explicit Resource Management** (`using`, `await using`)

---

# Async iterators

- Consume an asynchronous flow with `for await ... of`

```javascript
const fs = require('node:fs');

const stream = fs.createReadStream('./log.txt', { encoding: 'utf-8' });

for await (const chunk of stream) {
  console.log('chunk:', chunk.length);
}
```

- Manual implementation via `Symbol.asyncIterator`

---

# AbortController

- Web standard adopted by Node.js to **cancel** asynchronous operations

```javascript
const controller = new AbortController();
const { signal } = controller;

setTimeout(() => controller.abort(), 5000);

try {
  const res = await fetch('https://slow.example.com', { signal });
  const body = await res.text();
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('Request aborted');
  }
}
```

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
