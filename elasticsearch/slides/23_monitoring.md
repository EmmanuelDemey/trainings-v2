---
layout: cover
---

# 23 - Monitoring

---

# Learning objectives

By the end of this sequence (**~60 min**, workshop included), you will be able to:

- **Read** the health of a cluster, from its colour down to one shard
- **Explain** why a shard is unassigned, and fix it
- **Watch** the critical metrics of the nodes: heap, CPU, disk, rejections
- **Collect** the metrics into Kibana Stack Monitoring
- **Find** the slow requests with the slow logs, and **decode** the usual errors

---

# Why monitor?

- **Detect early**: before the users notice
- **Plan capacity**: disk, heap and shards grow with the data
- **Diagnose fast**: an incident is shorter when the baseline is known
- **Prove the SLA**: availability, latency

| Level | What | Where |
|---|---|---|
| Infrastructure | CPU, RAM, disk, network | The OS, `_nodes/stats` |
| Cluster | Health, nodes, shards | The cluster APIs |
| Application | Latency, error rate, throughput | Slow logs, APM |
| Business | Volume of documents, users | Your own dashboards |

---

# The monitoring APIs

| API | Shows | How often |
|---|---|---|
| `_cluster/health` | The status, the shard counters | 30 s – 1 min |
| `_health_report` | What is wrong, and what to do | 1 min |
| `_nodes/stats` | Per-node metrics | 30 s – 1 min |
| `_cluster/stats` | Totals for the whole cluster | 1 – 5 min |
| `_cat/indices`, `_cat/shards` | Indices, shards, where they live | 1 – 5 min |
| `_cat/pending_tasks` | The master's queue | 30 s – 1 min |
| `_nodes/hot_threads` | What burns the CPU | On demand |

> Light and frequent for detection, heavy and rare for analysis: monitoring must not load the cluster it watches.

---

# Cluster health

```json
GET /_cluster/health
```

| Status | Meaning | Action |
|---|---|---|
| **green** | Every shard, primary and replica, is allocated | None |
| **yellow** | Every primary is allocated, some replicas are not | Investigate: one more failure loses data |
| **red** | At least one **primary** is missing | Act now: part of the data cannot be read or written |

- Look at `unassigned_shards`, `active_shards_percent_as_number`, `number_of_nodes`
- The cluster takes the **worst** status of its indices

---

# Cluster health: per index

```json
GET /_cluster/health?level=indices&filter_path=status,indices.*.status
```

```json
GET /_cluster/health/my-index
```

- `level=indices` (or `shards`) finds **which** index makes the cluster yellow or red
- With an index in the path, the counters cover that index only — not the system indices

---

# The health report

```json
GET /_health_report
```

- One **indicator** per concern: `master_is_stable`, `shards_availability`, `disk`, `ilm`, `slm`, `shards_capacity`…
- Each has a status, a `symptom`, and when not green a **`diagnosis`**: cause, action, affected resources

```json
GET /_health_report/shards_availability
```

> Start an incident with `_health_report`: it says what `_cluster/health` only counts.

---

# Unassigned shards: find them

```json
GET /_cat/shards?v&h=index,shard,prirep,state,node,unassigned.reason&s=state
```

| `unassigned.reason` | Usually |
|---|---|
| `INDEX_CREATED` | A replica with no other node to go to |
| `NODE_LEFT` | A node is gone — allocation waits `index.unassigned.node_left.delayed_timeout` (1 min) |
| `ALLOCATION_FAILED` | Allocation failed 5 times in a row (`index.allocation.max_retries`) |
| `CLUSTER_RECOVERED` | Full cluster restart, recovery still in progress |

---

# Unassigned shards: ask why

```json
GET /_cluster/allocation/explain
{
  "index": "my-index",
  "shard": 0,
  "primary": false
}
```

- `can_allocate` and `allocate_explanation`: the verdict
- `node_allocation_decisions`: one entry per node, with the **decider** that said no
- Without a body: the first unassigned shard found — maybe not yours

---

# Unassigned shards: the usual causes

| Decider says | Cause | Fix |
|---|---|---|
| `same_shard` | A replica cannot sit next to its primary | Add a node, or `number_of_replicas: 0` on a single node |
| `disk_threshold` | Watermark reached (chapter 22) | Free space, add nodes |
| `filter` | `index.routing.allocation.*` excludes every node | Fix the filter |
| `awareness` | No node in the required zone | Restore the zone |
| `max_retry` | 5 failed attempts | Fix the cause, then retry below |

```json
POST /_cluster/reroute?retry_failed=true
```

---

# Cluster and node statistics

```json
GET /_cluster/stats?filter_path=nodes.count,indices.count,indices.docs.count,indices.store,indices.shards.total
```

```json
GET /_nodes/stats/jvm,os,process,indices,fs,thread_pool,breaker
```

| Section | Watch |
|---|---|
| `jvm` | `mem.heap_used_percent`, `gc.collectors.*.collection_time_in_millis` |
| `os`, `process` | `cpu.percent`, `open_file_descriptors` |
| `fs` | `total.available_in_bytes`, `io_stats` |
| `indices` | `indexing.*`, `search.*`, `merges`, `segments` |
| `thread_pool` | `*.rejected` |
| `breaker` | `*.tripped` |

---

# One line per node

```json
GET /_cat/nodes?v&h=name,node.role,heap.percent,ram.percent,cpu,load_1m,disk.used_percent&s=name
```

```json
GET /_cat/allocation?v
```

- The quick dashboard of an incident: which node is hot, which one is full
- `_cat/allocation`: shards and disk per node — spots an unbalanced cluster

---

# Heap and garbage collection

```json
GET /_nodes/stats/jvm?filter_path=nodes.*.name,nodes.*.jvm.mem.heap_used_percent,nodes.*.jvm.gc
```

| Heap used | Meaning |
|---|---|
| < 75 % | Healthy: the heap rises and falls with each collection |
| 75 – 85 % | Watch the GC frequency |
| > 85 %, never going down | Circuit breakers trip, `OutOfMemoryError` is close |

- Average GC = `collection_time_in_millis / collection_count` — long old-generation pauses mean a heap under pressure
- A sawtooth is normal: the **floor** after a GC is what matters

---

# CPU and disk

```json
GET /_nodes/stats/os,process,fs?filter_path=nodes.*.name,nodes.*.os.cpu,nodes.*.process.cpu,nodes.*.fs.total
```

| Metric | Healthy | Warning | Critical |
|---|---|---|---|
| CPU | < 60 % | 60 – 80 %: plan scaling | > 80 %: latency grows |
| Disk used | < 85 % | 85 %: low watermark | 95 %: flood stage, indices read-only |

- Disk is the most common cause of a sudden **red**: alert well before the low watermark
- CPU high? `_nodes/hot_threads`, next slides

---

# Indexing and search rates

```json
GET /_nodes/stats/indices/indexing,search?filter_path=nodes.*.name,nodes.*.indices.indexing,nodes.*.indices.search
```

```text
 average indexing latency = index_time_in_millis / index_total
 average search latency   = query_time_in_millis / query_total
```

- The counters only grow: compute **deltas** between two samples for a rate
- `indexing.index_failed` should stay close to 0
- `search.fetch_*`: a slow fetch phase means big documents or a large `size`

---

# Thread pool rejections

```json
GET /_cat/thread_pool/search,write?v&h=node_name,name,active,queue,rejected
```

- `write` rejections: too much indexing — the client gets `429 Too Many Requests`
- `search` rejections: too many or too expensive searches
- Alert on the **delta** of `rejected`, not its total

| Horizon | Action |
|---|---|
| Short | Clients back off and retry (the clients do it on `429`) |
| Medium | Cheaper queries, bigger bulks, fewer shards |
| Long | More nodes, revisit the sharding |

> Raising `queue_size` hides the overload: it fills the heap instead of the queue.

---

# Hot threads

```json
GET /_nodes/hot_threads?threads=5&interval=500ms&type=cpu
```

```text
::: {node-1}{abc123}
   Hot threads at 2026-10-28T10:30:00.000Z, interval=500ms, busiestThreads=5:

   99.8% (499ms out of 500ms) cpu usage by thread 'elasticsearch[node-1][search][T#5]'
     org.elasticsearch.search.query.QueryPhase.execute()
```

- `type`: `cpu` (default), `wait`, `block`
- The thread name tells the pool: `[search]`, `[write]`, `[merge]`…
- Plain text, sampled now: run it **during** the spike

---

# Pending tasks

```json
GET /_cat/pending_tasks?v
```

- The master applies cluster state changes one at a time: mappings, index creations, allocations
- A queue that does not empty: too many indices or fields, dynamic mappings exploding, a master too small
- Normally empty, or nearly

---

# Stack Monitoring: collecting

- Kibana **Stack Monitoring** shows the history of the APIs above, as charts
- The metrics are collected **from outside** the cluster:
  - **Elastic Agent** + the *Elasticsearch* integration, *Collect Stack Monitoring metrics* — recommended
  - or **Metricbeat** and its `elasticsearch-xpack` module
- They go to a **separate monitoring cluster** in production: a sick cluster cannot report on itself
- The legacy internal collection (`xpack.monitoring.collection.enabled`) is deprecated

> On Elastic Cloud, **AutoOps** does this analysis for you, with recommendations.

---

# Stack Monitoring: the views

| View | Shows |
|---|---|
| **Overview** | Status, nodes, shards, search and indexing rates, latency |
| **Nodes** | Per node: CPU, heap, disk, load, GC, shard count |
| **Indices** | Per index: size, documents, indexing and search rates |
| **Logs** | The server logs, when they are collected too |

- Drill down from the cluster to a node or an index
- Built-in **rules**: CPU, disk, JVM, missing nodes, license expiry… — chapter 24

---

# Slow logs: the thresholds

```json
PUT /my-index/_settings
{
  "index.search.slowlog.threshold.query.warn": "10s",
  "index.search.slowlog.threshold.query.info": "5s",
  "index.search.slowlog.threshold.fetch.warn": "1s",
  "index.indexing.slowlog.threshold.index.warn": "10s",
  "index.indexing.slowlog.threshold.index.info": "5s"
}
```

- Per index, dynamic, `-1` (off) by default
- Levels `warn`, `info`, `debug`, `trace`: one threshold each
- To find a culprit, set `0ms` for a few minutes — then set it back to `null`

---

# Slow logs: an entry

One JSON line (ECS) in `<cluster>_index_search_slowlog.json`:

```json
{
  "@timestamp": "2026-10-28T10:30:15.123Z",
  "log.level": "WARN",
  "log.logger": "index.search.slowlog.query",
  "elasticsearch.node.name": "node-1",
  "elasticsearch.slowlog.message": "[my-index][0]",
  "elasticsearch.slowlog.took_millis": 5234,
  "elasticsearch.slowlog.total_shards": 5,
  "elasticsearch.slowlog.source": "{\"query\":{\"wildcard\":{\"name\":\"*phone*\"}}}"
}
```

- Logged **per shard**: one slow shard can be a hot spot, all of them a bad query
- Then `profile: true` on that query (chapter 21)

---

# The usual errors

| Error | Means | Do |
|---|---|---|
| `CircuitBreakingException: [parent] Data too large` | The heap cannot hold the request | Smaller aggregations or `size`, more heap or nodes |
| `EsRejectedExecutionException` (`429`) | A thread pool queue is full | Back off, cheaper requests, scale |
| `SearchPhaseExecutionException`, shard failures | A shard failed the query | Read that node's log, check the shard |
| `ClusterBlockException: index read-only / allow delete` | Flood-stage watermark | Free disk space |
| `master_not_discovered_exception` | No elected master | Check the masters and the network |

> Read `<cluster>_server.json` of the node named in the error, not of a random one.

---

# What to alert on

| Signal | Warning | Critical |
|---|---|---|
| Cluster status | `yellow` for 15 min | `red` |
| Heap (floor after GC) | > 75 % | > 85 % |
| Disk used | > 80 % | > 90 % |
| CPU | > 80 % for 10 min | > 95 % |
| Thread pool rejections | Any, growing | > 100 / min |
| Nodes | One missing | Masters below quorum |

- Turn these into **rules** that page someone: next chapter

---

# Quiz

**The cluster is `yellow`. What do you know for sure?**

- A) Some data is lost
- B) Every primary is allocated, some replicas are not
- C) A node is down

<v-click>

**Answer: B** — yellow only says replicas are missing. A node may be down, or a single-node cluster may simply have nowhere to put its replicas: `_cluster/allocation/explain` tells which.

</v-click>

---

# Quiz

**Search latency grows and `rejected` rises on the `search` pool. First move?**

- A) Double `thread_pool.search.queue_size`
- B) Find the expensive requests (slow logs, hot threads) and make them cheaper
- C) Restart the busiest node

<v-click>

**Answer: B** — a bigger queue only stores the overload in the heap. Restarting moves the load to the other nodes and adds recoveries.

</v-click>

---
layout: cover
---

# Workshop 19

## Monitoring
