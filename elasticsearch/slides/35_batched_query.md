---
layout: cover
---

# 35 - Search execution: the batched query phase

---

# Learning objectives

By the end of this sequence (**~30 min**), you will be able to:

- **Describe** how a search runs across shards: coordinating node, `can_match`, query, fetch
- **Explain** what the **batched query phase** (**new in 9.5**) changes, and for which workloads
- **Check** and **switch** it with `search.batched_query_phase`
- **Tune** the related parameters: `max_concurrent_shard_requests`, `pre_filter_shard_size`, `batched_reduce_size`

> Chapter 21 sized the shards; here, what a search costs **per shard**.

---

# A search, step by step

The node that receives the request is the **coordinating node**:

1. **`can_match`** (pre-filter): skip the shards that cannot match — a date range outside the index, for instance
2. **Query**: each shard runs the query and returns its **top hits** (IDs + scores) and its **partial aggregations**
3. **Reduce**: the coordinating node merges them into the global top `size` and the final aggregations
4. **Fetch**: it asks only the shards holding the winners for their `_source`, highlights…

<br />

- 1 index × 30 shards, or 30 daily indices × 1 shard: **30 shard queries** for a single search
- Thousands of shards (logs, many tenants): the coordination costs more than the search itself

---

# Before 9.5: one request per shard

- The coordinating node sends **one transport request per shard**, at most 5 at a time per node (`max_concurrent_shard_requests`)
- It receives **every** shard result, and reduces them all itself
- Network round-trips grow with the **number of shards**; the coordinator's memory too — a `terms` aggregation with a large `shard_size`, over hundreds of shards…

<br />

> The coordinating node was the bottleneck: CPU, heap, the `request` circuit breaker (chapter 21).

---

# 9.5: the batched query phase

**New in 9.5** (and on Serverless): the query phase is sent **per data node**, not per shard.

- **One request per data node**, carrying all its shards
- The data node runs them, then **reduces locally**: its own top hits, its own merged aggregations
- The coordinating node receives **one partial result per node**, and does the final merge
- Round-trips: from a factor of the **shards** to a factor of the **data nodes**

<br />

- Elastic's benchmarks: searches **twice as fast** on thousands of shards (`match_all`, `size: 0`), far less memory on the coordinator for big `terms` aggregations
- The more real work each shard does, the smaller the gain: it removes **coordination** costs

---

# Is it on?

```json
GET /_cluster/settings?include_defaults=true&filter_path=**.batched_query_phase
```

**Expected result**:

```json
{ "defaults": { "search": { "batched_query_phase": "true" } } }
```

- **On by default** in 9.5: nothing to do to benefit from it
- A dynamic cluster setting: switch it off to compare, or to work around an issue

```json
PUT /_cluster/settings
{ "persistent": { "search.batched_query_phase": false } }

PUT /_cluster/settings
{ "persistent": { "search.batched_query_phase": null } }
```

---

# The parameters around it

```json
PUT /many-shards
{ "settings": { "number_of_shards": 6, "number_of_replicas": 0 } }

POST /many-shards/_bulk?refresh=true
{"index":{}}
{"n":1}
{"index":{}}
{"n":2}
{"index":{}}
{"n":3}

POST /many-shards/_search?max_concurrent_shard_requests=5&pre_filter_shard_size=1&batched_reduce_size=512
{ "size": 0, "aggs": { "total": { "sum": { "field": "n" } } } }
```

**Expected result**:

```json
{ "_shards": { "total": 6, "successful": 6, "failed": 0 }, "aggregations": { "total": { "value": 6.0 } } }
```

---

# The parameters around it: what they do

| Parameter | Default | Role |
|---|---|---|
| `max_concurrent_shard_requests` | 5 | Shard requests in flight **per node** — protects the cluster from one huge search |
| `pre_filter_shard_size` | Unset | Forces the `can_match` round from this many shards; unset, it runs above 128 shards, on read-only indices, or when the primary sort is on an indexed field |
| `batched_reduce_size` | 512 | How many shard results the coordinator buffers before a **partial reduce** |
| `search.batched_query_phase` | `true` | Batches the query phase per data node (9.5) |

<br />

- `num_reduce_phases` in the response: how many reductions the **coordinator** ran (the ones of the data nodes are not counted)
- `_shards.skipped`: the shards `can_match` avoided — a sign that your time ranges help

---

# Observe it

<!-- ci: no-compare -->
```json
GET /_nodes/stats/indices/search?filter_path=nodes.*.indices.search.query_total,nodes.*.indices.search.query_time_in_millis,nodes.*.indices.search.fetch_total
```

**Expected result**:

```json
{ "nodes": { "t3-I4UULQEWWceZ9Eg9cmg": { "indices": { "search": { "query_total": 18, "query_time_in_millis": 200, "fetch_total": 12 } } } } }
```

- `query_total` counts **shard** queries: one search on 6 shards adds 6
- Compare a search with `search.batched_query_phase` on and off: `took`, the coordinator's heap and `request` breaker (`GET /_nodes/stats/breaker`)
- `"profile": true` (chapter 21): the time spent on each shard, to tell coordination from real work

---

# What it changes for your design

- **Many small shards** hurt less — but they still cost heap, file handles and cluster state: the sizing rules of chapter 21 stay
- Searches over **many indices** (`logs-*`, hundreds of daily indices, tenants) gain the most
- Big `terms` aggregations: the coordinator's memory drops — fewer `circuit_breaking_exception`
- Time-bounded queries: keep a **range on `@timestamp`**, so `can_match` skips the shards before the query phase

<br />

> Free with the upgrade to 9.5: measure your slowest dashboards before and after.

---

# Quiz

**A search over 600 shards spread across 3 data nodes. With the batched query phase, how many query-phase transport requests does the coordinating node send?**

- A) 600
- B) 3
- C) 1
- D) 5

<v-click>

**Answer: B** — one per data node; each data node runs its 200 shards and reduces their results before answering.

</v-click>
