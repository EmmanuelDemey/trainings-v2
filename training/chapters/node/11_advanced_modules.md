---
layout: cover
---

# 11 - Modules avancés

---

# Tour d'horizon

- Node.js expose une API standard très riche
- Cette section parcourt les **modules clés** pour des cas avancés :
  - Async Hooks & AsyncLocalStorage
  - Process events
  - File System
  - Buffer
  - Performance Hooks
  - Crypto, TLS, Web Crypto
  - Web Streams API

---

# Asynchronous Context Tracking

- Suivre le contexte d'une **chaîne d'appels asynchrones**
- Cas d'usage : request id, locale, user, span de tracing
- API recommandée : **`AsyncLocalStorage`** (`node:async_hooks`)

```javascript
const { AsyncLocalStorage } = require('node:async_hooks');

const ctx = new AsyncLocalStorage();

function handle(req, res) {
  ctx.run({ requestId: req.id }, async () => {
    await businessLogic();
  });
}

// n'importe où dans la chaîne async
const { requestId } = ctx.getStore();
```

---

# Async Hooks - bas niveau

- API plus bas niveau pour observer **chaque** ressource async (création, before, after, destroy)
- Coût en performance : à n'utiliser qu'à des fins de **debug/instrumentation**

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

- À privilégier `AsyncLocalStorage` au quotidien

---

# Child Process

- Module `node:child_process` : lancer des process système
- Variantes :
  - **`spawn`** : process avec stdio en streams
  - **`exec`** : process avec output bufferisé (ne pas dépasser ~1 Mo)
  - **`execFile`** : variante de `exec` sans shell
  - **`fork`** : sous-process **Node** avec canal IPC

```javascript
const { fork } = require('node:child_process');

const child = fork('./worker.js');
child.send({ task: 'compute' });
child.on('message', (msg) => console.log('result', msg));
```

---

# Clusters

- Vu en détail au chapitre 8
- Module `node:cluster` : N process Node enfants sur un même port
- En production, déléguer à **PM2** ou à un orchestrateur (Kubernetes)

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

- Module `node:inspector` : API programmatique du protocole DevTools
- Utile pour ouvrir/fermer une session de debug **dynamiquement**

```javascript
const inspector = require('node:inspector');

if (process.env.DEBUG === '1') {
  inspector.open(9229, '0.0.0.0', true); // wait for client
}

inspector.close(); // détache le debugger
```

---

# Errors

- Node fournit des **classes d'erreur** standardisées avec `code`

```javascript
try {
  fs.readFileSync('/missing');
} catch (err) {
  console.log(err.code); // 'ENOENT'
  console.log(err.errno); // -2
  console.log(err.syscall); // 'open'
}
```

- Les erreurs Node ont un `code` stable (`ECONNREFUSED`, `ETIMEDOUT`, `EADDRINUSE`...)
- Tester sur `code` plutôt que `message` (i18n ou évolution du wording)

---

# Events - lien avec RxJS

- `EventEmitter` : push primitif (chapitre 3)
- **RxJS** apporte la composition d'événements : `Observable`, opérateurs, schedulers

```javascript
import { fromEvent, debounceTime, scan } from 'rxjs';

fromEvent(server, 'request')
  .pipe(
    scan((acc) => acc + 1, 0),
    debounceTime(1000),
  )
  .subscribe((count) => console.log('reqs/sec:', count));
```

- Très utile pour les événements **temps réel** (websockets, streams d'événements)

---

# Worker Threads

- Vu au chapitre 8
- Module `node:worker_threads` : threads JS dans le même process

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

- Standard W3C, dispo dans Node 18+
- 3 types : `ReadableStream`, `WritableStream`, `TransformStream`
- Utiles pour partager du code avec le **navigateur** ou les **Workers/Edge Functions**

```javascript
const stream = new ReadableStream({
  start(c) { c.enqueue('a'); c.enqueue('b'); c.close(); },
});

const reader = stream.getReader();
const { value } = await reader.read();
```

- Conversion : `Readable.toWeb(nodeStream)` / `Readable.fromWeb(webStream)`

---

# Process Events

- Le `process` est lui-même un EventEmitter

| Événement | Cas d'usage |
|-----------|-------------|
| `exit` | Cleanup synchrone avant terminaison |
| `beforeExit` | Dernière chance de programmer du travail async |
| `uncaughtException` | Crash non géré → logger puis quitter |
| `unhandledRejection` | Promise rejetée sans `.catch` |
| `SIGINT` / `SIGTERM` | Graceful shutdown |
| `warning` | Warning Node (DEP, MaxListenersExceeded...) |

```javascript
process.on('SIGTERM', async () => {
  await server.close();
  await db.disconnect();
  process.exit(0);
});
```

---

# File System

- Module `node:fs` : trois saveurs d'API
  - **Sync** : `fs.readFileSync`
  - **Callback** : `fs.readFile`
  - **Promise** : `fs.promises.readFile`

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

# File System - watch et streams

- `fs.watch` / `fs.watchFile` : surveiller des changements
- `fs.createReadStream` / `fs.createWriteStream` : streams pour gros fichiers
- **`chokidar`** : alternative cross-platform plus fiable

```javascript
const chokidar = require('chokidar');

chokidar.watch('./src/**/*.ts').on('change', (path) => {
  console.log('changed', path);
});
```

---

# Buffer

- Représente une **zone mémoire binaire** brute
- Sous-classe de `Uint8Array` (donc API similaire)
- Allocation : `Buffer.alloc(n)` (zéro), `Buffer.allocUnsafe(n)` (rapide mais non initialisé)

```javascript
const buf = Buffer.from('hello', 'utf-8');

console.log(buf.length); // 5
console.log(buf.toString('hex')); // '68656c6c6f'
console.log(buf[0]); // 104

const merged = Buffer.concat([buf, Buffer.from(' world')]);
```

- Utilisé partout : streams, `fs`, `crypto`, `net`...

---

# Stream

- Vu en détail aux chapitres 5 et 9
- Quatre types : `Readable`, `Writable`, `Duplex`, `Transform`
- Toujours utiliser `pipeline` pour propager les erreurs et gérer le back-pressure

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

- Module `node:perf_hooks` (vu au chapitre 7)

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

- `monitorEventLoopDelay` pour mesurer la latence event loop

---

# Crypto

- Hash, HMAC, chiffrement symétrique/asymétrique, signatures, KDF

```javascript
const crypto = require('node:crypto');

// Hash
const hash = crypto.createHash('sha256').update('hello').digest('hex');

// Chiffrement AES-256-GCM
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const enc = Buffer.concat([cipher.update('secret'), cipher.final()]);
const tag = cipher.getAuthTag();

// Génération aléatoire sécurisée
const id = crypto.randomUUID();
const token = crypto.randomBytes(32).toString('base64url');
```

---

# Crypto - KDF / hash de mot de passe

- **Jamais** stocker un mot de passe en clair ou hashé en SHA-256
- Utiliser un KDF lent : `scrypt`, `argon2`, `bcrypt`

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

- Module `node:tls` : sockets chiffrés
- Module `node:https` : serveur HTTP avec TLS

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

- En production, déléguer souvent au **reverse proxy** (NGINX, Traefik, ALB) qui termine le TLS

---

# Web Crypto API

- Standard W3C, dispo via `globalThis.crypto`
- Asynchrone (retourne des Promises)
- Portable navigateur ↔ Node ↔ Workers

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

# Choix entre `crypto` et Web Crypto

| Critère | `node:crypto` | `crypto.subtle` |
|---------|---------------|-----------------|
| API | Synchrone & async | Promise-based |
| Portable web | Non | Oui |
| Algorithmes | Très riche (legacy inclus) | Modernes uniquement |
| Performance | Excellent | Excellent |

- **Greenfield** : Web Crypto par défaut
- **Legacy / besoins spécifiques** : `node:crypto`
