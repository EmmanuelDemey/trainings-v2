---
layout: cover
---

# 11 - Advanced modules

---

# Tour

- Node.js exposes a very rich standard API
- This section goes through the **key modules** for advanced cases:
  - Async Hooks & AsyncLocalStorage
  - Process events
  - File System
  - Buffer
  - Performance Hooks
  - Crypto, TLS, Web Crypto
  - Web Streams API

---

# Asynchronous Context Tracking

- Track context across an **asynchronous call chain**
- Use cases: request id, locale, user, tracing span
- Recommended API: **`AsyncLocalStorage`** (`node:async_hooks`)

```javascript
const { AsyncLocalStorage } = require('node:async_hooks');

const ctx = new AsyncLocalStorage();

function handle(req, res) {
  ctx.run({ requestId: req.id }, async () => {
    await businessLogic();
  });
}

// anywhere in the async chain
const { requestId } = ctx.getStore();
```

---

# Async Hooks - low level

- Lower-level API to observe **every** async resource (init, before, after, destroy)
- Performance cost: only use for **debug/instrumentation**

```javascript
const { createHook } = require('node:async_hooks');

const hook = createHook({
  init(asyncId, type, triggerAsyncId) { /* ... */ },
  before(asyncId) { /* ... */ },
  after(asyncId) { /* ... */ },
  destroy(asyncId) { /* ... */ },
});

hook.enable();
```

- Prefer `AsyncLocalStorage` day to day

---

# Child Process

- The `node:child_process` module: spawn system processes
- Variants:
  - **`spawn`**: process with stdio as streams
  - **`exec`**: process with buffered output (don't exceed ~1 MB)
  - **`execFile`**: `exec` variant without a shell
  - **`fork`**: spawn a **Node** sub-process with an IPC channel

```javascript
const { fork } = require('node:child_process');

const child = fork('./worker.js');
child.send({ task: 'compute' });
child.on('message', (msg) => console.log('result', msg));
```

---

# Clusters

- Covered in detail in chapter 8
- The `node:cluster` module: N child Node processes on the same port
- In production, delegate to **PM2** or an orchestrator (Kubernetes)

```javascript
const cluster = require('node:cluster');
const os = require('node:os');

if (cluster.isPrimary) {
  os.cpus().forEach(() => cluster.fork());
} else {
  require('./server');
}
```

---

# Debugger

- The `node:inspector` module: programmatic API of the DevTools protocol
- Useful to open/close a debug session **dynamically**

```javascript
const inspector = require('node:inspector');

if (process.env.DEBUG === '1') {
  inspector.open(9229, '0.0.0.0', true); // wait for client
}

inspector.close(); // detach the debugger
```

---

# Errors

- Node ships standardized **error classes** with a `code`

```javascript
try {
  fs.readFileSync('/missing');
} catch (err) {
  console.log(err.code); // 'ENOENT'
  console.log(err.errno); // -2
  console.log(err.syscall); // 'open'
}
```

- Node errors carry a stable `code` (`ECONNREFUSED`, `ETIMEDOUT`, `EADDRINUSE`...)
- Match on `code` rather than `message` (i18n or wording changes)

---

# Events - link with RxJS

- `EventEmitter`: primitive push (chapter 3)
- **RxJS** brings event composition: `Observable`, operators, schedulers

```javascript
import { fromEvent, debounceTime, scan } from 'rxjs';

fromEvent(server, 'request')
  .pipe(
    scan((acc) => acc + 1, 0),
    debounceTime(1000),
  )
  .subscribe((count) => console.log('reqs/sec:', count));
```

- Very useful for **real-time** events (websockets, event streams)

---

# Worker Threads

- Covered in chapter 8
- The `node:worker_threads` module: JS threads in the same process

```javascript
const { Worker, isMainThread, parentPort } = require('node:worker_threads');

if (isMainThread) {
  const w = new Worker(__filename);
  w.postMessage('ping');
  w.on('message', console.log);
} else {
  parentPort.on('message', (msg) => parentPort.postMessage(`pong:${msg}`));
}
```

---

# Web Streams API

- W3C standard, available in Node 18+
- 3 types: `ReadableStream`, `WritableStream`, `TransformStream`
- Useful to share code with the **browser** or **Workers/Edge Functions**

```javascript
const stream = new ReadableStream({
  start(c) { c.enqueue('a'); c.enqueue('b'); c.close(); },
});

const reader = stream.getReader();
const { value } = await reader.read();
```

- Conversion: `Readable.toWeb(nodeStream)` / `Readable.fromWeb(webStream)`

---

# Process Events

- The `process` is itself an EventEmitter

| Event | Use case |
|-------|----------|
| `exit` | Synchronous cleanup before termination |
| `beforeExit` | Last chance to schedule async work |
| `uncaughtException` | Unhandled crash → log then exit |
| `unhandledRejection` | Promise rejected without `.catch` |
| `SIGINT` / `SIGTERM` | Graceful shutdown |
| `warning` | Node warning (DEP, MaxListenersExceeded...) |

```javascript
process.on('SIGTERM', async () => {
  await server.close();
  await db.disconnect();
  process.exit(0);
});
```

---

# File System

- The `node:fs` module: three API flavors
  - **Sync**: `fs.readFileSync`
  - **Callback**: `fs.readFile`
  - **Promise**: `fs.promises.readFile`

```javascript
const fs = require('node:fs/promises');

const content = await fs.readFile('./config.json', 'utf-8');
await fs.writeFile('./out.txt', content);
await fs.rename('./out.txt', './out.bak');

for await (const dirent of await fs.opendir('./src')) {
  console.log(dirent.name);
}
```

---

# File System - watch and streams

- `fs.watch` / `fs.watchFile`: watch for changes
- `fs.createReadStream` / `fs.createWriteStream`: streams for large files
- **`chokidar`**: more reliable cross-platform alternative

```javascript
const chokidar = require('chokidar');

chokidar.watch('./src/**/*.ts').on('change', (path) => {
  console.log('changed', path);
});
```

---

# Buffer

- Represents a raw **binary memory region**
- Subclass of `Uint8Array` (so similar API)
- Allocation: `Buffer.alloc(n)` (zeroed), `Buffer.allocUnsafe(n)` (fast but uninitialized)

```javascript
const buf = Buffer.from('hello', 'utf-8');

console.log(buf.length); // 5
console.log(buf.toString('hex')); // '68656c6c6f'
console.log(buf[0]); // 104

const merged = Buffer.concat([buf, Buffer.from(' world')]);
```

- Used everywhere: streams, `fs`, `crypto`, `net`...

---

# Stream

- Covered in detail in chapters 5 and 9
- Four types: `Readable`, `Writable`, `Duplex`, `Transform`
- Always use `pipeline` to propagate errors and handle back-pressure

```javascript
const { pipeline } = require('node:stream/promises');

await pipeline(
  fs.createReadStream('./in.csv'),
  parseCsv(),
  filterValid(),
  fs.createWriteStream('./out.json'),
);
```

---

# Performance Measurement APIs

- The `node:perf_hooks` module (covered in chapter 7)

```javascript
const { performance, PerformanceObserver, monitorEventLoopDelay } = require('node:perf_hooks');

performance.mark('a');
await heavy();
performance.mark('b');
performance.measure('heavy', 'a', 'b');

const obs = new PerformanceObserver((list) => {
  list.getEntries().forEach((e) => console.log(e.name, e.duration));
});
obs.observe({ entryTypes: ['measure', 'gc', 'function'] });
```

- `monitorEventLoopDelay` to measure event loop latency

---

# Crypto

- Hash, HMAC, symmetric/asymmetric encryption, signatures, KDF

```javascript
const crypto = require('node:crypto');

// Hash
const hash = crypto.createHash('sha256').update('hello').digest('hex');

// AES-256-GCM encryption
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const enc = Buffer.concat([cipher.update('secret'), cipher.final()]);
const tag = cipher.getAuthTag();

// Secure random generation
const id = crypto.randomUUID();
const token = crypto.randomBytes(32).toString('base64url');
```

---

# Crypto - KDF / password hashing

- **Never** store a password in clear or hashed with SHA-256
- Use a slow KDF: `scrypt`, `argon2`, `bcrypt`

```javascript
const { scrypt, randomBytes } = require('node:crypto');
const { promisify } = require('node:util');

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64);
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}
```

---

# TLS (SSL)

- The `node:tls` module: encrypted sockets
- The `node:https` module: HTTP server with TLS

```javascript
const https = require('node:https');
const fs = require('node:fs');

https.createServer({
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  minVersion: 'TLSv1.2',
}, (req, res) => {
  res.end('secure');
}).listen(443);
```

- In production, often delegate to a **reverse proxy** (NGINX, Traefik, ALB) that terminates TLS

---

# Web Crypto API

- W3C standard, available via `globalThis.crypto`
- Asynchronous (returns Promises)
- Portable browser ↔ Node ↔ Workers

```javascript
const data = new TextEncoder().encode('hello');
const hash = await crypto.subtle.digest('SHA-256', data);
const hex = Buffer.from(hash).toString('hex');

const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt'],
);
```

---

# Choosing between `crypto` and Web Crypto

| Criterion | `node:crypto` | `crypto.subtle` |
|-----------|---------------|-----------------|
| API | Sync & async | Promise-based |
| Web portable | No | Yes |
| Algorithms | Very rich (legacy included) | Modern only |
| Performance | Excellent | Excellent |

- **Greenfield**: Web Crypto by default
- **Legacy / specific needs**: `node:crypto`
