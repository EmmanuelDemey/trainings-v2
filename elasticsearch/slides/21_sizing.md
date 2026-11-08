---
layout: cover
---

# 21 - Sizing and performance

---

# Learning objectives

By the end of this sequence (**~50 min**, workshop included), you will be able to:

- **Size** a cluster: data nodes, CPU, RAM, disk, shards
- **Configure** a node for production: roles, cluster formation, JVM heap, system limits
- **Tune** indexing (refresh, replicas, bulk) and search (filters, shard size, force merge)
- **Profile** a slow query, and **read** the caches and thread pools

---

# What drives the size

- **Data volume**: the total size of the indices, replicas included
- **Ingestion rate**: documents per second
- **Query rate**: searches per second
- **Target latency**: p95, p99
- **Retention**: how long the data stays — and on which tier
- **High availability**: replicas, zones

<br />

> There is no formula that replaces a **benchmark** with your data and your queries (Rally, or a replay of production traffic).

---

# CPU

| Workload | CPU | Example |
|---|---|---|
| Search intensive | 16+ cores, high frequency | Full text, complex aggregations |
| Indexing intensive | 8–16 cores | Logs, IoT |
| Mixed | 12–16 cores | E-commerce, APM |
| Read only | 4–8 cores | Archives, static dashboards |

<br />

- **Dedicated master**: 2–4 cores are enough
- **Ingest** with heavy pipelines: 8+ cores
- Watch `os.cpu.percent` and `process.cpu.percent` in `_nodes/stats`

---

# Memory: heap and file system cache

```text
 total RAM  =  JVM heap  +  OS file system cache (Lucene segments)
             ≤ 50 %, ≤ ~31 GB      the rest — the most important cache
```

| Total RAM | Heap | OS cache | Usage |
|---|---|---|---|
| 8 GB | 4 GB | 4 GB | Dev / test |
| 32 GB | 16 GB | 16 GB | Small production |
| 64 GB | 31 GB | 33 GB | Standard production |
| 128 GB | 31 GB | 97 GB | Search-heavy production |

> Above ~31 GB, the JVM loses **compressed oops**: a bigger heap holds *less*.

---

# Disk

```text
 capacity = raw volume × (1 + replicas) × 1.15 (overhead) × 1.2 (growth)
 1 TB raw, 1 replica  →  1 × 2 × 1.15 × 1.2  ≈  2.8 TB
```

| Disk | For |
|---|---|
| **NVMe SSD** | Hot tier, heavy indexing |
| **SATA SSD** | Good price / performance |
| **HDD** | Warm / cold only |
| **NFS, SMB** | Avoid: latency, locking |

- Keep below the **85 %** disk watermark: count that margin too (chapter 22)

---

# Shards and nodes

- **Shard size**: aim for **10–50 GB**, and fewer than ~200 M documents
- Too many small shards: overhead on the master and on every search
- Per node: stay under `cluster.max_shards_per_node` (1 000)
- Heap: count ~**1 GB per 3 000 mapped fields** across the node's indices — the old "20 shards per GB of heap" rule no longer applies since 8.3

```text
 5 TB raw, 1 replica → 10 TB · 100 GB/day → 2 primaries of 50 GB per day
 3 data nodes minimum for HA, more if the disk or the search load asks for it
```

---

# Node roles

```yaml
node.roles: [ master, data_hot, data_content, ingest ]
```

| Role | Responsibility |
|---|---|
| `master` | Cluster state: indices, mappings, shard allocation |
| `data`, `data_content`, `data_hot` / `warm` / `cold` / `frozen` | Store and search the data |
| `ingest` | Run the ingest pipelines |
| `ml`, `transform` | Machine learning jobs, transforms |
| `remote_cluster_client` | Cross-cluster search and replication |
| `[]` (none) | Coordinating only: routes requests, merges results |

- Without `node.roles`, a node has **every** role
- Small cluster: all roles everywhere. Large cluster: separate them (chapter 22)

---

# Cluster formation

```yaml
cluster.name: production
node.name: node-1
discovery.seed_hosts: ["10.0.0.10:9300", "10.0.0.11:9300", "10.0.0.12:9300"]
cluster.initial_master_nodes: ["node-1", "node-2", "node-3"]
```

- `discovery.seed_hosts`: who to contact to **find** the cluster (transport port **9300**)
- `cluster.initial_master_nodes`: the voters of the **very first** election — then **remove** it
- A node that keeps it after the bootstrap can start a **second** cluster by mistake

> Joining a secured 8.x+ cluster: `bin/elasticsearch-create-enrollment-token -s node` on a member, then `bin/elasticsearch --enrollment-token <token>` on the new node — TLS is configured for you.

---

# JVM: the heap

Never edit `jvm.options`: add a file in `jvm.options.d/`, which upgrades leave alone.

```text
# jvm.options.d/heap.options
-Xms16g
-Xmx16g
```

1. `-Xms` = `-Xmx`: no resizing pauses
2. **≤ 50 %** of the RAM, **≤ ~31 GB**
3. Without it, Elasticsearch sizes the heap itself from its roles and RAM — often fine
4. G1GC is the default collector: nothing to set

---

# JVM: check and diagnose

```json
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_max_in_bytes,nodes.*.jvm.mem.heap_used_percent
```

| Symptom | Cause |
|---|---|
| `OutOfMemoryError`, constant GC | Heap too small — or a query/aggregation too big |
| GC pauses > 1 s, latency spikes | Heap too large, or swapping |
| Circuit breaker errors (`429`) | A request would exceed the heap: the breaker refused it |

GC logs and heap dumps are on by default; their paths:

```text
-Xlog:gc*,gc+age=trace,safepoint:file=/var/log/elasticsearch/gc.log
-XX:HeapDumpPath=/var/lib/elasticsearch
```

---

# System: no swap

When the JVM is swapped out, latency is multiplied by **1 000**.

```bash
sudo swapoff -a              # and comment out the swap lines of /etc/fstab
sudo sysctl vm.swappiness=1  # or: swap only in an emergency
```

Or lock the heap in RAM:

```yaml
bootstrap.memory_lock: true
```

```json
GET /_nodes?filter_path=nodes.*.process.mlockall
```

> With Docker / Kubernetes: no swap on the host, and `memory_lock` needs `ulimit memlock=-1`.

---

# System: limits

```bash
# /etc/security/limits.conf (the systemd unit of the packages already sets them)
elasticsearch  -  nofile  65535
elasticsearch  -  nproc   4096
```

```bash
sysctl -w vm.max_map_count=262144     # Lucene memory-maps its files
```

```json
GET /_nodes/stats/process?filter_path=nodes.*.process.max_file_descriptors
```

- Too low: `Too many open files`, new segments cannot open, connections fail
- In production mode (`network.host` not local), the **bootstrap checks** refuse to start with wrong limits

---

# Logs

| File (JSON, ECS) | Content |
|---|---|
| `<cluster>_server.json` | The node's log |
| `<cluster>_deprecation.json` | Deprecated features in use |
| `<cluster>_index_search_slowlog.json` | Slow searches |
| `<cluster>_index_indexing_slowlog.json` | Slow indexing |
| `gc.log` | Garbage collection |

Change a log level **without restarting** — then put it back:

```json
PUT /_cluster/settings
{ "persistent": { "logger.org.elasticsearch.discovery": "DEBUG" } }
```

```json
PUT /_cluster/settings
{ "persistent": { "logger.org.elasticsearch.discovery": null } }
```

---

# Environment variables

`elasticsearch.yml` reads environment variables, with a default value:

```yaml
node.name: ${HOSTNAME}
network.host: ${ES_NETWORK_HOST}
cluster.name: ${ES_CLUSTER_NAME:my-cluster}
```

```bash
export ES_JAVA_OPTS="-Xms4g -Xmx4g"      # JVM options, overrides jvm.options.d
export ES_PATH_CONF=/etc/elasticsearch   # where the configuration lives
```

- Docker: any setting as an environment variable — `-e discovery.type=single-node`
- Elasticsearch refuses to run as **`root`**: the packages run it as `elasticsearch`

---

# Faster indexing: refresh and replicas

```json
PUT /my-index/_settings
{ "index.refresh_interval": "30s" }
```

- Default `1s`: fewer refreshes, fewer small segments, more throughput — new documents visible later
- An index not searched for 30 s skips its refreshes anyway (`search.idle.after`)

For a big initial load, no replicas — then put them back:

```json
PUT /my-index/_settings
{ "index.number_of_replicas": 0 }
```

```json
PUT /my-index/_settings
{ "index.number_of_replicas": 1, "index.refresh_interval": null }
```

---

# Faster indexing: bulk

```json
POST /_bulk
{ "index": { "_index": "my-index" } }
{ "field": "value" }
{ "index": { "_index": "my-index" } }
{ "field": "another value" }
```

- Batches of **5–15 MB**: measure, double until the throughput stops rising
- Several clients **in parallel**; on `429`, back off and retry
- Let Elasticsearch choose the `_id`: no lookup before the write
- Increasing the `write` thread pool is a symptom, not a fix: the node is under-sized

---

# Faster search: filter context

```json
GET /products/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "category": "electronics" } },
        { "range": { "price": { "lte": 1000 } } }
      ]
    }
  }
}
```

- No scoring, and **cached** per segment (node query cache)
- Everything that does not need to change the ranking goes in `filter`

---

# Faster search: shards and segments

- Shards of **10–50 GB**: too many small shards multiply the work of every search
- `keyword` for exact values, `date` / numeric for ranges — never a script in a query
- A **read-only** index: merge it down to one segment

```json
POST /old-index/_forcemerge?max_num_segments=1
```

> Never force merge an index still being written: the huge segment will not be merged back, and deletions pile up.

---

# The caches

| Cache | Holds | Size |
|---|---|---|
| **Node query cache** | Results of filters, per segment | `indices.queries.cache.size: 10%` of heap |
| **Shard request cache** | Results of `size: 0` requests (aggregations) | `indices.requests.cache.size: 1%` |
| **Field data** | `text` fields used in aggregations — avoid | Circuit breaker |
| **OS file system cache** | The Lucene files | The RAM left outside the heap — **the most important** |

```json
POST /my-index/_cache/clear
```

- Clear only to **measure** a cold query, never as a fix

---

# Profile a query

```json
GET /products/_search
{
  "profile": true,
  "query": {
    "bool": {
      "must": [
        { "match": { "description": "smartphone" } },
        { "range": { "price": { "gte": 500 } } }
      ]
    }
  }
}
```

- Per shard and per clause: `type`, `time_in_nanos`, and a `breakdown` (`build_scorer`, `match`, `score`…)
- Kibana **Search Profiler** (Dev Tools) shows the same as a tree
- Find the most expensive clause, then rewrite it — or move it to `filter`

---

# Thread pools

| Pool | For | Default size |
|---|---|---|
| `search` | Searches | `(cores × 3 / 2) + 1` |
| `write` | Index, bulk, update, delete | `cores` |
| `get` | Get by `_id` | `cores` |
| `management`, `refresh`, `snapshot` | Background work | Small |

```json
GET /_cat/thread_pool/search,write?v&h=node_name,name,active,queue,rejected
```

- `queue` growing, `rejected` > 0: the node cannot keep up — the client gets `429`
- Raising `size` or `queue_size` rarely helps: add CPU, nodes, or make requests cheaper

---

# The formulas

| What | Rule of thumb |
|---|---|
| Heap | `min(RAM / 2, ~31 GB)`, `Xms` = `Xmx` |
| Disk | `volume × (1 + replicas) × 1.15 × 1.2` |
| Shard size | 10–50 GB |
| Shards per node | < 1 000, ~1 GB heap per 3 000 mapped fields |
| Masters | 3 (or 5), odd |

---

# Quiz

**A node has 128 GB of RAM. What heap?**

- A) 64 GB: half of the RAM
- B) ~31 GB, the rest for the file system cache
- C) 120 GB: Elasticsearch is a Java application

<v-click>

**Answer: B** — above ~31 GB the JVM loses compressed oops, and the file system cache, outside the heap, is what makes Lucene fast.

</v-click>

---
layout: cover
---

# Workshop 17

## Sizing and performance
