---
layout: cover
---

# 7 - Gestion de la performance

---

# Objectifs

- Identifier les **bottlenecks** dans une application Node.js
- Écrire du JavaScript **performant pour V8**
- Maîtriser la **mémoire** et détecter les **fuites**
- Décharger les **calculs lourds** (worker threads, clusters)
- **Profiler** et **analyser** les performances

---

# JavaScript performant pour V8

- V8 compile le JS en plusieurs étapes : Ignition (interpréteur) → SparkPlug → Maglev → TurboFan
- Quelques règles pour rester sur le **chemin rapide** :
  - Garder une **forme d'objet stable** (les Hidden Classes sont créées à partir des propriétés ajoutées)
  - Initialiser **toutes** les propriétés dans le constructeur
  - Éviter de **changer le type** d'une propriété en cours de vie
  - Utiliser des **tableaux denses** plutôt que des objets pour les listes ordonnées
  - Préférer les **fonctions monomorphiques** (mêmes types d'arguments)

---

# Hidden classes - exemple

```javascript
// ✗ Mauvais : changement de forme
const a = {};
a.x = 1;
a.y = 2;

const b = {};
b.y = 2;
b.x = 1; // forme différente de a !

// ✓ Bon : même forme
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
```

---

# Inlining et déoptimisation

- V8 **inline** les fonctions courtes appelées dans une boucle chaude
- Éviter :
  - Les fonctions trop **longues** (>600 caractères)
  - Les blocs `try/catch` autour du hot path (avant Node 18 surtout)
  - L'usage de `arguments` hors fonction fléchée

```javascript
// Mauvais
function sum() {
  let total = 0;
  for (const n of arguments) total += n;
  return total;
}

// Bon
function sum(...nums) {
  let total = 0;
  for (const n of nums) total += n;
  return total;
}
```

---

# Gestion de la mémoire

- V8 utilise un **GC générationnel** :
  - **New Space** : objets jeunes, GC fréquent (Scavenger)
  - **Old Space** : objets promus, GC moins fréquent (Mark-Sweep-Compact)
- Limite par défaut : **~4 Go** sur 64 bits → ajustable

```bash
node --max-old-space-size=8192 server.js
```

- Le GC bloque l'event loop : limiter les **allocations dans le hot path**

---

# Fuites mémoire - causes fréquentes

- **Closures** qui capturent un grand objet
- **Listeners** non désabonnés sur un EventEmitter
- **Caches** sans politique d'éviction (LRU manquante)
- Variables **globales** qui grandissent
- Timers (`setInterval`) jamais arrêtés

```javascript
// Fuite typique
const cache = {};
app.get('/users/:id', (req, res) => {
  if (!cache[req.params.id]) {
    cache[req.params.id] = fetchUser(req.params.id);
  }
  // cache grandit indéfiniment
});
```

---

# Détection de fuites

- Surveiller `process.memoryUsage()` dans le temps

```javascript
setInterval(() => {
  const m = process.memoryUsage();
  console.log({
    rss: Math.round(m.rss / 1e6),
    heap: Math.round(m.heapUsed / 1e6),
  });
}, 5000);
```

- Snapshots heap via Chrome DevTools : `node --inspect server.js` puis "Memory" → "Heap snapshot" (méthode des **3 snapshots**)
- Outils : `clinic heap`, `heapdump`, `memlab` (Meta)

---

# Calculs lourds - stratégies

| Stratégie | Cas d'usage |
|-----------|-------------|
| **Découpage `setImmediate`** | Calcul itératif sur grosse collection |
| **Worker Threads** | Calcul CPU-bound dans le même process |
| **Cluster** | Multiplier les process sur les coeurs |
| **Service externe** | Calcul long, isolé, scalable indépendamment |
| **Native addon** | Vraiment besoin de perf C++ |

---

# Découpage avec setImmediate

```javascript
function processChunk(items, i = 0) {
  const end = Math.min(i + 1000, items.length);
  for (; i < end; i++) heavyWork(items[i]);

  if (i < items.length) {
    setImmediate(() => processChunk(items, i));
  }
}
```

- Permet à l'event loop de **respirer** entre les chunks
- Trop de `setImmediate` = overhead, à doser

---

# Profilage CPU

- **`--prof`** intégré à Node

```bash
node --prof server.js
# génère isolate-XXXX-v8.log
node --prof-process isolate-XXXX-v8.log > report.txt
```

- **`--cpu-prof`** : profile au format compatible Chrome DevTools

```bash
node --cpu-prof --cpu-prof-dir=./profiles server.js
```

- Charger le fichier dans **Chrome DevTools → Performance**

---

# Outils externes

- **clinic.js** (NearForm) : `doctor`, `flame`, `bubbleprof`, `heap`

```bash
clinic doctor -- node server.js
clinic flame -- node server.js
```

- **0x** : flamegraphs prêts à l'emploi
- **autocannon** : benchmarking HTTP

```bash
autocannon -c 100 -d 30 http://localhost:3000/api/users
```

- APM : Datadog, NewRelic, Dynatrace, Sentry, Elastic APM

---

# Performance Measurement APIs

- Module `node:perf_hooks`

```javascript
const { performance, PerformanceObserver } = require('node:perf_hooks');

const obs = new PerformanceObserver((items) => {
  for (const entry of items.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});
obs.observe({ entryTypes: ['measure'] });

performance.mark('start');
await heavyOperation();
performance.mark('end');
performance.measure('heavy', 'start', 'end');
```

- Compatible Web Performance API → portable navigateur ↔ Node

---

# Bottlenecks - diagnostic

1. **Mesurer** avant d'optimiser (`autocannon`, métriques APM)
2. **Identifier** la phase coupable (CPU, mémoire, I/O, GC, lock DB)
3. **Profiler** la zone chaude
4. **Optimiser** une chose à la fois
5. **Re-mesurer**

> *Premature optimization is the root of all evil* - Donald Knuth

---
layout: cover
---

# Travaux Pratiques

## Atelier 7 - Performance
- Profiler une route lente avec `clinic doctor`
- Détecter une fuite mémoire (3 snapshots)
- Découper un calcul lourd avec `setImmediate`
