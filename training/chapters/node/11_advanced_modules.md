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
- Node 24: backed by **`AsyncContextFrame`** by default (faster, better for APM), plus `new AsyncLocalStorage({ name, defaultValue })`

```ts
import { AsyncLocalStorage } from 'node:async_hooks';
import type { IncomingMessage, ServerResponse } from 'node:http';

interface Store { requestId: string }

const ctx = new AsyncLocalStorage<Store>({ name: 'http' });

function handle(req: IncomingMessage & { id: string }, res: ServerResponse): void {
  ctx.run({ requestId: req.id }, async () => {
    await businessLogic();
  });
}

// anywhere in the async chain
const { requestId } = ctx.getStore()!;
```

---

# Async Hooks - low level

- Lower-level API to observe **every** async resource (init, before, after, destroy)
- Performance cost: only use for **debug/instrumentation**

```ts
import { createHook } from 'node:async_hooks';

const hook = createHook({
  init(asyncId: number, type: string, triggerAsyncId: number) { /* ... */ },
  before(asyncId: number) { /* ... */ },
  after(asyncId: number) { /* ... */ },
  destroy(asyncId: number) { /* ... */ },
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

```ts
import { fork } from 'node:child_process';

const child = fork('./worker.ts');
child.send({ task: 'compute' });
child.on('message', (msg: unknown) => console.log('result', msg));
```

---

# Clusters

- Covered in detail in chapter 8
- The `node:cluster` module: N child Node processes on the same port
- In production, delegate to **PM2** or an orchestrator (Kubernetes)

```ts
import cluster from 'node:cluster';
import os from 'node:os';

if (cluster.isPrimary) {
  os.cpus().forEach(() => cluster.fork());
} else {
  await import('./server.ts');
}
```

---

# Debugger

- The `node:inspector` module: programmatic API of the DevTools protocol
- Useful to open/close a debug session **dynamically**

```ts
import inspector from 'node:inspector';

if (process.env.DEBUG === '1') {
  inspector.open(9229, '0.0.0.0', true); // wait for client
}

inspector.close(); // detach the debugger
```

---

# Errors

- Node ships standardized **error classes** with a `code`

```ts
try {
  fs.readFileSync('/missing');
} catch (err) {
  const e = err as NodeJS.ErrnoException;
  console.log(e.code); // 'ENOENT'
  console.log(e.errno); // -2
  console.log(e.syscall); // 'open'
}
```

- Node errors carry a stable `code` (`ECONNREFUSED`, `ETIMEDOUT`, `EADDRINUSE`...)
- Match on `code` rather than `message` (i18n or wording changes)

---

# Events - link with RxJS

- `EventEmitter`: primitive push (chapter 3)
- **RxJS** brings event composition: `Observable`, operators, schedulers

```ts
import { fromEvent, debounceTime, scan } from 'rxjs';

fromEvent(server, 'request')
  .pipe(
    scan((acc: number) => acc + 1, 0),
    debounceTime(1000),
  )
  .subscribe((count: number) => console.log('reqs/sec:', count));
```

- Very useful for **real-time** events (websockets, event streams)
- Node 24: **`WebSocket`** is now a stable global client (powered by Undici 7) — no extra dependency

```ts
const ws = new WebSocket('wss://example.com/feed');
ws.addEventListener('message', (e: MessageEvent) => console.log(e.data));
```

- Node 24: legacy `url.parse()` is deprecated → use the WHATWG `new URL()`

---

# Worker Threads

- Covered in chapter 8
- The `node:worker_threads` module: JS threads in the same process

```ts
import { Worker, isMainThread, parentPort } from 'node:worker_threads';

if (isMainThread) {
  const w = new Worker(import.meta.filename);
  w.postMessage('ping');
  w.on('message', console.log);
} else {
  parentPort!.on('message', (msg: string) => parentPort!.postMessage(`pong:${msg}`));
}
```

---

# Web Streams API

- W3C standard, available in Node 18+
- 3 types: `ReadableStream`, `WritableStream`, `TransformStream`
- Useful to share code with the **browser** or **Workers/Edge Functions**

```ts
const stream = new ReadableStream<string>({
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

```ts
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

```ts
import fs from 'node:fs/promises';

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

```ts
import chokidar from 'chokidar';

chokidar.watch('./src/**/*.ts').on('change', (path: string) => {
  console.log('changed', path);
});
```

- Node 24: experimental **`node:sqlite`** ships a built-in SQLite engine

```ts
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('app.db');
db.exec('CREATE TABLE IF NOT EXISTS users(id INTEGER, name TEXT)');
```

---

# Buffer

- Represents a raw **binary memory region**
- Subclass of `Uint8Array` (so similar API)
- Allocation: `Buffer.alloc(n)` (zeroed), `Buffer.allocUnsafe(n)` (fast but uninitialized)

```ts
const buf: Buffer = Buffer.from('hello', 'utf-8');

console.log(buf.length); // 5
console.log(buf.toString('hex')); // '68656c6c6f'
console.log(buf[0]); // 104

const merged: Buffer = Buffer.concat([buf, Buffer.from(' world')]);
```

- Used everywhere: streams, `fs`, `crypto`, `net`...
- Node 24: `Float16Array` typed array (V8 13.6) for half-precision floats
- Deprecated/removed in Node 24: `SlowBuffer` → use `Buffer.alloc()`

---

# Stream

- Covered in detail in chapters 5 and 9
- Four types: `Readable`, `Writable`, `Duplex`, `Transform`
- Always use `pipeline` to propagate errors and handle back-pressure

```ts
import { pipeline } from 'node:stream/promises';

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

```ts
import { performance, PerformanceObserver, monitorEventLoopDelay } from 'node:perf_hooks';
import type { PerformanceObserverEntryList } from 'node:perf_hooks';

performance.mark('a');
await heavy();
performance.mark('b');
performance.measure('heavy', 'a', 'b');

const obs = new PerformanceObserver((list: PerformanceObserverEntryList) => {
  list.getEntries().forEach((e) => console.log(e.name, e.duration));
});
obs.observe({ entryTypes: ['measure', 'gc', 'function'] });
```

- `monitorEventLoopDelay` to measure event loop latency

---

# Crypto

- Hash, HMAC, symmetric/asymmetric encryption, signatures, KDF

```ts
import crypto from 'node:crypto';

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

```ts
import { scrypt, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}
```

---

# TLS (SSL)

- The `node:tls` module: encrypted sockets
- The `node:https` module: HTTP server with TLS

```ts
import https from 'node:https';
import fs from 'node:fs';

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

```ts
const data = new TextEncoder().encode('hello');
const hash = await crypto.subtle.digest('SHA-256', data);
const hex = Buffer.from(hash).toString('hex');

const key: CryptoKey = await crypto.subtle.generateKey(
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

---

# Hands-on

## Workshop 11 - Advanced modules
- Trace a request end-to-end with `AsyncLocalStorage` (propagate a request id into the logs)
- Hash and verify a password with `crypto.scrypt` (+ random salt)
- Watch a file with `fs.watch` and stream its new content on change
