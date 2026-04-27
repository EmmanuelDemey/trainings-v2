---
layout: cover
---

# 2 - Architecture interne de Node.js

---

# Vue d'ensemble

- Node.js repose sur :
  - Le moteur JavaScript **V8** (Google) pour exécuter le code JS
  - **libuv** (C/C++) pour les I/O non bloquantes et l'event loop
  - Une bibliothèque standard exposée en JS (modules `fs`, `http`, `crypto`, etc.)
  - Des **bindings** entre JS et code C++

```
+----------------------------+
|     Votre code JS          |
+----------------------------+
| Modules core (fs, http...) |
+----------------------------+
|        Bindings C++         |
+--------------+-------------+
|     V8       |    libuv    |
+--------------+-------------+
```

---

# Single-thread

- Le code JavaScript s'exécute sur **un seul thread**
- Les opérations bloquantes (CPU, I/O sync) gèlent **toutes** les autres requêtes
- libuv délègue certaines opérations à un **pool de threads** (par défaut 4)
  - Filesystem (sauf opérations natives non bloquantes)
  - DNS (`dns.lookup`)
  - Crypto (`pbkdf2`, `randomBytes` async, etc.)
  - Compression (`zlib`)

```bash
UV_THREADPOOL_SIZE=8 node server.js
```

---

# L'Event Loop

- Boucle infinie orchestrant les phases d'exécution

```
   ┌───────────────────────────┐
┌─>│           timers          │  setTimeout / setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  I/O callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

---

# Microtasks vs macrotasks

- Entre chaque phase, Node exécute :
  - Toutes les **`process.nextTick`** en attente
  - Toutes les **microtasks** (promises résolues)

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
setImmediate(() => console.log('3'));
Promise.resolve().then(() => console.log('4'));
process.nextTick(() => console.log('5'));
console.log('6');

// Sortie : 1, 6, 5, 4, 2, 3
```

---

# setImmediate vs setTimeout(fn, 0)

- `setImmediate(cb)` : exécuté à la phase **check** (après `poll`)
- `setTimeout(cb, 0)` : programmé à la phase **timers**, déclenché dès que possible
- Quand on est à l'intérieur d'un callback I/O, **`setImmediate` est garanti d'être exécuté avant** le timer

```javascript
fs.readFile('./file', () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
// Sortie : immediate, timeout
```

---

# process.nextTick

- Programme une fonction à exécuter **avant** la prochaine itération de l'event loop
- Plus prioritaire que les microtasks (Promises)
- À utiliser avec prudence : un `nextTick` infini affame l'event loop

```javascript
function deferred() {
  process.nextTick(() => {
    // ... exécuté juste après la pile courante
  });
}
```

---

# Bottlenecks

- Tout calcul **CPU-bound** > quelques millisecondes bloque l'event loop
  - Hash bcrypt synchrone
  - JSON.parse/stringify sur des très gros payloads
  - Boucles complexes
- Les opérations Sync de l'API standard sont à proscrire dans le hot path
- Solutions :
  - Découper en chunks via `setImmediate`
  - **Worker Threads**
  - Externaliser sur un autre service

---

# Mesurer le délai de l'event loop

- Module `perf_hooks.monitorEventLoopDelay`

```javascript
const { monitorEventLoopDelay } = require('node:perf_hooks');

const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();

setInterval(() => {
  console.log('mean:', histogram.mean / 1e6, 'ms');
  console.log('p99:', histogram.percentile(99) / 1e6, 'ms');
  histogram.reset();
}, 1000);
```

- Outils externes : `clinic doctor`, `0x`, APM (Datadog, NewRelic, Dynatrace)

---

# Récapitulatif

- Node = V8 + libuv + bindings
- **1 seul thread** pour le JS, **N threads** pour certaines I/O
- L'event loop a **6 phases** entrecoupées de microtasks
- Les bottlenecks sont presque toujours du **CPU sur le main thread**
