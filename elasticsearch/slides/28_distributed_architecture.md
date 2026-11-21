---
layout: cover
---

# 28 - Distributed architecture in depth

---

# Learning objectives

By the end of this sequence (**~45 min**), you will be able to:

- **Explain** how nodes form a cluster and elect a master: seed hosts, voting configuration, quorum
- **Recognise** the node roles of a node, and what each one does
- **Route** documents to a shard, with the default formula or a custom `routing`
- **Follow** a write from the coordinating node to the primary and its replicas
- **Read** what happens when a node fails: promotion, delayed allocation, recovery

<br />

> Chapter 2 gave the vocabulary, chapter 22 the production topologies: this chapter
> opens the mechanics between the two.

---

# Cluster formation: discovery

A node that starts looks for the others, then joins the elected master.

```yaml
# elasticsearch.yml of every node
cluster.name: shop-prod
discovery.seed_hosts: ["node-1:9300", "node-2:9300", "node-3:9300"]

# ONLY the very first start of a brand-new cluster, then remove it
cluster.initial_master_nodes: ["node-1", "node-2", "node-3"]
```

- `discovery.seed_hosts`: where to find **master-eligible** nodes — a few addresses are enough
- `cluster.initial_master_nodes`: the **bootstrap** — the nodes that vote the first time
- Left in place, `initial_master_nodes` can **bootstrap a second cluster** on a restart: remove it
- A single node for development: `discovery.type: single-node`

---

# Master election and the voting configuration

- The **elected master** is the only node that changes the **cluster state** (indices, mappings, shard locations)
- A decision needs a **quorum**: a majority of the **voting configuration**
- Elasticsearch keeps that configuration **odd** by itself: 3 master-eligible nodes → 3 voters, quorum 2

```json
GET /_cluster/state?filter_path=metadata.cluster_coordination
```

**Expected result** (excerpt):

```json
{
  "metadata": {
    "cluster_coordination": {
      "voting_config_exclusions": []
    }
  }
}
```

- `last_committed_config`: the IDs of the voting nodes — one, on the lab node
- `term`: incremented by each election

---

# Removing a master-eligible node

Taking out a master-eligible node for good? Exclude it from the votes **first**:

<!-- ci: skip -->
```json
POST /_cluster/voting_config_exclusions?node_names=node-3

GET /_cluster/state?filter_path=metadata.cluster_coordination.voting_config_exclusions

DELETE /_cluster/voting_config_exclusions
```

- Without it, stopping **half** of the master-eligible nodes at once loses the quorum: no master, no writes
- `DELETE` clears the exclusions once the node is gone
- No split brain since 7.0: a minority can **never** elect a master

---

# Node roles

| Role | What it does |
|---|---|
| `master` | Eligible to be elected master — manages the cluster state |
| `data`, `data_content`, `data_hot`, `data_warm`, `data_cold`, `data_frozen` | Holds shards, by tier |
| `ingest` | Runs ingest pipelines (chapter 14) |
| `ml` | Runs machine learning jobs and inference models |
| `transform` | Runs transforms (chapter 15) |
| `remote_cluster_client` | Talks to remote clusters: CCS, CCR |
| *(none)* `node.roles: []` | Coordinating only: routes requests, merges results |

```json
GET /_cat/nodes?v&h=name,node.role,master
```

- `node.role` is abbreviated: `cdfhilmrstw` — every role, the default of a node
- `master`: `*` marks the elected master

---

# Shard routing: the formula

Each document goes to **one** primary shard:

```text
routing_value = _routing  (by default: the _id)
shard_num     = hash(routing_value) % number_of_routing_shards / routing_factor
             ≈ hash(_routing) % number_of_primary_shards
```

- **Deterministic**: any node can find a document from its `_id`, without a lookup table
- That is why `number_of_shards` is **fixed** at creation: change it, and every document moves
- To change it: `_split`, `_shrink` (chapter 19) or `_reindex`

---

# Custom routing

Keep all the documents of a customer **on the same shard**:

```json
PUT /orders
{
  "settings": { "number_of_shards": 3, "number_of_replicas": 0 },
  "mappings": { "_routing": { "required": true } }
}

PUT /orders/_doc/1?routing=customer-42&refresh=true
{ "customer": "customer-42", "total": 30 }
```

**Expected result**:

```json
{ "result": "created", "_shards": { "total": 1, "successful": 1 } }
```

- `_routing.required`: an index request **without** `routing` is refused
- The routing value is stored in the `_routing` metadata field

---

# Custom routing: reading and searching

```json
GET /orders/_doc/1?routing=customer-42
```

**Expected result**:

```json
{ "_id": "1", "_routing": "customer-42", "found": true }
```

```json
GET /orders/_search?routing=customer-42
```

**Expected result** (excerpt):

```json
{ "_shards": { "total": 1, "successful": 1 }, "hits": { "total": { "value": 1 } } }
```

- A search with `routing` reads **one shard** instead of three: less work, less latency
- Without `routing`, `GET /orders/_doc/1` fails: Elasticsearch cannot compute the shard

---

# Which shard? `_search_shards`

```json
GET /orders/_search_shards?routing=customer-42&filter_path=shards.shard
```

- Gives the shard(s) a request **would** read, without running it
- Useful to check a routing strategy, or a `preference`

<br />

The risk of custom routing: a **hot spot**. One huge customer = one huge shard.

---

# Spreading a key: `routing_partition_size`

A big tenant over **several** shards, still not all of them:

```json
PUT /tenants
{
  "settings": {
    "number_of_shards": 6,
    "number_of_replicas": 0,
    "index.routing_partition_size": 2
  },
  "mappings": { "_routing": { "required": true } }
}

GET /tenants/_search_shards?routing=acme&filter_path=shards.shard
```

→ **two** shard groups in `shards`, not one, nor six

- Each routing value maps to **2** shards out of 6: the `_id` picks one of them
- A search with `routing=acme` reads 2 shards
- Must be set at creation, `1 < routing_partition_size < number_of_shards`

---

# Which copy? `preference`

A search reads **one copy** of each shard — primary or replica. `preference` chooses which:

```json
GET /orders/_search?preference=user-1234&size=0
```

- A **custom string** (a user or session ID): the same user always hits the same copies
  - stable scores and pagination, warmer caches
- `_local`: the copies of the node that coordinates, when there are some
- `_only_local`, `_prefer_nodes:<ids>`, `_shards:0,1`
- By default: **adaptive replica selection** — the copy whose node answers fastest

---

# The write path

```text
client ──▶ coordinating node ──▶ primary shard ──▶ replica shards
                                     │  (in parallel)  │
                                     ◀───── ack ───────┘
client ◀── response (_shards: total / successful / failed)
```

1. The coordinating node computes the shard from the routing
2. The **primary** validates, indexes, writes to its translog
3. It forwards the operation to the **in-sync** replicas, in parallel
4. It answers once **every** in-sync copy has acknowledged

- A failing replica is **removed** from the in-sync set by the master: the write succeeds
- `_shards.total` counts the configured copies, `successful` the ones that wrote

---

# `wait_for_active_shards`

Check, **before** writing, that enough copies are active:

```json
PUT /with-replica
{ "settings": { "number_of_shards": 1, "number_of_replicas": 1 } }
```

<!-- ci: expect-error -->
```json
PUT /with-replica/_doc/1?wait_for_active_shards=2&timeout=1s
{ "status": "paid" }
```

- On one node the replica is never assigned: `unavailable_shards_exception` after 1 s
- Default `1`: only the primary needs to be active; `all`: every copy
- A **pre-flight** check, not a guarantee: the write itself always goes to every in-sync copy

---

# Data tiers

Each data node belongs to tiers; each index says which tier it prefers:

```json
GET /orders/_settings?filter_path=**._tier_preference
```

**Expected result**:

```json
{
  "orders": {
    "settings": { "index": { "routing": { "allocation": { "include": { "_tier_preference": "data_content" } } } } }
  }
}
```

- A regular index: `data_content`; a data stream's backing index: `data_hot`
- ILM's `migrate` action rewrites it: `data_warm,data_hot`, then `data_cold,data_warm,data_hot`…
- The list is an order of **preference**: the first tier that exists wins
- Hot-warm-cold architectures: chapter 22

---

# When a node fails

```text
 node-1 [P0][R1]     node-2 [P1][R2]     node-3 [P2][R0]
                         ✗ node-2 leaves
 1. P1 is lost: the master promotes R1 (node-1) to primary   → yellow, writes go on
 2. R2 is lost too: P2 has no replica for now
 3. Wait index.unassigned.node_left.delayed_timeout (1 min)
 4. Rebuild a replica of shards 1 and 2 on node-1 / node-3    → green
```

- A primary lost with **no** replica: the shard is **red** — its data is unavailable
- The **delay** avoids copying gigabytes when a node only restarts
- A returning node with an up-to-date copy recovers from its own disk + the missing operations

---

# Delayed allocation

```json
GET /with-replica/_settings?include_defaults=true&filter_path=**.delayed_timeout
```

**Expected result**:

```json
{
  "with-replica": {
    "defaults": { "index": { "unassigned": { "node_left": { "delayed_timeout": "1m" } } } }
  }
}
```

Planned maintenance of a node? Lengthen it for the time of the operation:

```json
PUT /_all/_settings
{ "settings": { "index.unassigned.node_left.delayed_timeout": "10m" } }
```

- For a full rolling restart, prefer `cluster.routing.allocation.enable: primaries` (chapter 18)

---

# Following recovery

```json
GET /_cat/recovery/orders?v&h=index,shard,type,stage
```

| `type` | When |
|---|---|
| `empty_store` | A new primary |
| `existing_store` | A primary reopened from its local disk (restart) |
| `peer` | A replica copied from its primary |
| `snapshot` | A restore |

- `stage`: `init` → `index` (files) → `translog` (operations) → `finalize` → `done`
- `GET /_cat/recovery?v&active_only=true`: the recoveries running now
- Throttled by `indices.recovery.max_bytes_per_sec` (40 MB/s by default on most nodes)

---

# Why is a shard unassigned?

```json
GET /_cluster/health?level=indices&filter_path=status,indices.*.status
```

```json
POST /_cluster/allocation/explain
{ "index": "with-replica", "shard": 0, "primary": false }
```

**Expected result** (excerpt):

```json
{
  "current_state": "unassigned",
  "can_allocate": "no",
  "node_allocation_decisions": [ { "deciders": [ { "decider": "same_shard", "decision": "NO" } ] } ]
}
```

- `same_shard`: a replica never lives on the node of its primary — a second node is needed
- Other deciders you will meet: `disk_threshold`, `filter`, `awareness`, `max_retry` (chapter 23)

---

# Quiz

**A 3-node cluster, an index with 3 primaries and 1 replica. One node is stopped for 30 seconds, then comes back. What happens?**

- A) The cluster goes red: a third of the data is lost
- B) Replicas are promoted, the cluster is yellow, and the missing replicas are rebuilt from scratch at once
- C) Replicas are promoted, the cluster is yellow; the node comes back before the 1-minute delay and recovers its copies from its own disk
- D) Nothing: Elasticsearch waits for the node without promoting anything

<v-click>

**Answer: C** — the promotion is immediate (the writes go on), the reallocation of the replicas waits
`delayed_timeout` (1 min), so a short restart does not copy whole shards over the network.

</v-click>
