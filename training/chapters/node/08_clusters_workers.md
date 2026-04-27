---
layout: cover
---

# 8 - Clusters et Worker Threads

---

# Le problème du single-thread

- Node.js n'utilise **qu'un coeur** par défaut
- Sur une machine 8 coeurs, **87,5%** de la CPU dort
- Deux solutions natives :
  - **Cluster** : N process Node enfants partageant un port
  - **Worker Threads** : N threads dans le même process

---

# Cluster - principe

- Le module `node:cluster` (et le plus moderne `node:child_process`) lance des **process enfants**
- Le master fait du **load balancing** (round-robin sous Linux)
- Chaque worker est un process Node **complet** : pas de mémoire partagée

```javascript
const cluster = require('node:cluster');
const os = require('node:os');

if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) cluster.fork();
  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} died, restarting`);
    cluster.fork();
  });
} else {
  require('./server');
}
```

---

# Cluster - en pratique

- Préférer **PM2** ou un orchestrateur (Kubernetes, Docker Swarm) plutôt que `cluster` à la main
- PM2 expose `pm2 start app.js -i max` qui fait du clustering géré

```bash
pm2 start server.js -i max
pm2 reload server.js  # zero-downtime
```

- En conteneur, on lance **un process par container** et on scale via le runtime

---

# Worker Threads

- Threads JS isolés dans **le même process**
- Communication via **postMessage** (sérialisation structurée)
- Possibilité de partager de la mémoire via **`SharedArrayBuffer`**
- Idéal pour les calculs **CPU-bound** sans overhead de process

```javascript
// main.js
const { Worker } = require('node:worker_threads');

const worker = new Worker('./hash.js', { workerData: { rounds: 12 } });

worker.on('message', (hash) => console.log('hash:', hash));
worker.postMessage({ password: 'secret' });
```

---

# Worker Threads - implémentation

```javascript
// hash.js
const { parentPort, workerData } = require('node:worker_threads');
const bcrypt = require('bcryptjs');

parentPort.on('message', async ({ password }) => {
  const hash = await bcrypt.hash(password, workerData.rounds);
  parentPort.postMessage(hash);
});
```

- On peut aussi utiliser `new Worker(__filename)` pour partager le fichier
- Voir `piscina` pour un **pool de workers** clé en main

---

# Cluster vs Worker Threads

| Critère | Cluster | Worker Threads |
|---------|---------|----------------|
| Isolation | Forte (process) | Moyenne (thread) |
| Overhead démarrage | Élevé | Faible |
| Partage mémoire | Non | `SharedArrayBuffer` |
| IPC | `process.send` (JSON) | `postMessage` (structured clone) |
| Cas typique | Serveur HTTP scaling | Calcul CPU-bound |
| Crash | N'affecte qu'un worker | Peut tuer le process |

---

# Child Process

- API plus bas niveau pour lancer un **process arbitraire** (Node ou pas)
- Variantes : `spawn`, `exec`, `execFile`, `fork`

```javascript
const { spawn } = require('node:child_process');

const ls = spawn('ls', ['-la', '/tmp']);
ls.stdout.on('data', (chunk) => console.log(chunk.toString()));
ls.on('close', (code) => console.log('exit', code));
```

```javascript
// fork = spawn('node', [...]) avec canal IPC
const child = fork('./worker.js');
child.send({ task: 'compute', value: 42 });
child.on('message', console.log);
```

---

# SharedArrayBuffer & Atomics

- Mémoire **partagée** entre threads
- `Atomics` pour les opérations atomiques (lecture, écriture, lock)

```javascript
const sab = new SharedArrayBuffer(1024);
const view = new Int32Array(sab);

// dans deux workers
Atomics.add(view, 0, 1);
Atomics.notify(view, 0, 1);
Atomics.wait(view, 0, 0);
```

- À utiliser avec **précaution** : risques de race conditions, deadlocks

---

# Single-thread distribué

- Au-delà de la machine : **plusieurs instances** sur plusieurs serveurs
- Coordination via :
  - **Redis** (locks, pub/sub, queues)
  - **Brokers** (Kafka, RabbitMQ, NATS)
  - **Zookeeper / etcd** pour la coordination
- Penser **stateless** : pas d'état en mémoire dans une instance, tout dans un store partagé

---

# Bonnes pratiques

- Sur 1 machine, on combine **clustering** (1 process / coeur) et **Worker Threads** pour les tâches lourdes
- Sur N machines, on délègue le clustering au runtime (Kubernetes)
- Toujours **tester la résilience** : kill -9 d'un worker, redémarrage correct ?
- Mesurer : un cluster mal calibré peut **dégrader** les perfs (overhead IPC, contention disque/réseau)

---
layout: cover
---

# Travaux Pratiques

## Atelier 8 - Workers
- Mettre en place un cluster avec PM2
- Décharger un calcul bcrypt sur un Worker Thread
- Comparer les perfs avec/sans Worker via `autocannon`
