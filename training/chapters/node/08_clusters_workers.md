---
layout: cover
---

# 8 - Clusters and Worker Threads

---

# The single-thread problem

- By default Node.js uses **only one core**
- On an 8-core machine, **87.5%** of the CPU sits idle
- Two native solutions:
  - **Cluster**: N child Node processes sharing a port
  - **Worker Threads**: N threads inside the same process

---

# Cluster - principle

- The `node:cluster` module (and the more modern `node:child_process`) spawns **child processes**
- The primary handles **load balancing** (round-robin on Linux)
- Each worker is a **full** Node process: no shared memory

```ts
import cluster from 'node:cluster';
import os from 'node:os';
import type { Worker } from 'node:cluster';

if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) cluster.fork();
  cluster.on('exit', (worker: Worker) => {
    console.log(`worker ${worker.process.pid} died, restarting`);
    cluster.fork();
  });
} else {
  await import('./server.ts');
}
```

---

# Cluster - in practice

- Prefer **PM2** or an orchestrator (Kubernetes, Docker Swarm) over hand-rolled `cluster`
- PM2 exposes `pm2 start app.js -i max` which manages the cluster for you

```bash
pm2 start server.js -i max
pm2 reload server.js  # zero-downtime
```

- In containers, run **one process per container** and scale through the runtime

---

# Worker Threads

- Isolated JS threads inside **the same process**
- Communication via **postMessage** (structured cloning)
- Memory sharing is possible via **`SharedArrayBuffer`**
- Ideal for **CPU-bound** computations without process overhead

```ts
// main.ts
import { Worker } from 'node:worker_threads';

interface HashData { rounds: number; }

const worker = new Worker('./hash.ts', {
  workerData: { rounds: 12 } satisfies HashData,
});

worker.on('message', (hash: string) => console.log('hash:', hash));
worker.postMessage({ password: 'secret' });
```

---

# Worker Threads - implementation

```ts
// hash.ts
import { parentPort, workerData } from 'node:worker_threads';
import bcrypt from 'bcryptjs';

const { rounds } = workerData as { rounds: number };

parentPort?.on('message', async ({ password }: { password: string }) => {
  const hash = await bcrypt.hash(password, rounds);
  parentPort?.postMessage(hash);
});
```

- You can also use `new Worker(__filename)` to share the file
- Check out `piscina` for a turnkey **worker pool**

---

# Cluster vs Worker Threads

| Criterion | Cluster | Worker Threads |
|-----------|---------|----------------|
| Isolation | Strong (process) | Medium (thread) |
| Startup overhead | High | Low |
| Memory sharing | No | `SharedArrayBuffer` |
| IPC | `process.send` (JSON) | `postMessage` (structured clone) |
| Typical use case | HTTP server scaling | CPU-bound compute |
| Crash | Affects only one worker | May kill the whole process |

---

# Child Process

- Lower-level API to spawn an **arbitrary process** (Node or otherwise)
- Variants: `spawn`, `exec`, `execFile`, `fork`

```ts
import { spawn } from 'node:child_process';

const ls = spawn('ls', ['-la', '/tmp']);
ls.stdout.on('data', (chunk: Buffer) => console.log(chunk.toString()));
ls.on('close', (code: number | null) => console.log('exit', code));
```

```ts
// fork = spawn('node', [...]) with an IPC channel
import { fork } from 'node:child_process';

interface Task { task: string; value: number; }

const child = fork('./worker.ts');
child.send({ task: 'compute', value: 42 } satisfies Task);
child.on('message', console.log);
```

---

# SharedArrayBuffer & Atomics

- **Shared** memory between threads
- `Atomics` for atomic operations (read, write, lock)

```ts
const sab = new SharedArrayBuffer(1024);
const view = new Int32Array(sab);

// in two workers
Atomics.add(view, 0, 1);
Atomics.notify(view, 0, 1);
Atomics.wait(view, 0, 0);
```

- Use with **caution**: race condition and deadlock risks

---

# Distributed single-thread

- Beyond a single machine: **multiple instances** across multiple servers
- Coordination via:
  - **Redis** (locks, pub/sub, queues)
  - **Brokers** (Kafka, RabbitMQ, NATS)
  - **Zookeeper / etcd** for coordination
- Think **stateless**: no in-memory state in an instance, everything in a shared store

---

# Best practices

- On a single machine, combine **clustering** (1 process / core) with **Worker Threads** for heavy tasks
- Across machines, delegate clustering to the runtime (Kubernetes)
- Always **test resilience**: kill -9 a worker, does it restart correctly?
- Measure: a poorly tuned cluster can **degrade** performance (IPC overhead, disk/network contention)

---
layout: cover
---

# Hands-on

## Workshop 8 - Workers
- Set up a cluster with PM2
- Offload a bcrypt computation to a Worker Thread
- Compare performance with/without Worker via `autocannon`
