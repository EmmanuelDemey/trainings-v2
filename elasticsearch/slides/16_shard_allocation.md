---
layout: cover
---

# Shard Allocation and Low-Level Replication

---

# Shard Allocation

* **Shard allocation** is the process of assigning shards to nodes in the cluster.
* Elasticsearch automatically manages shard placement, but you can control it.
* The **allocator** decides:
    * Where to place new shards
    * When to relocate shards (rebalancing)
    * How to handle node failures

---

# Allocation Awareness

* By default, Elasticsearch distributes shards evenly across nodes.
* **Allocation awareness** adds topology constraints.
* Primary and replica shards are spread across different zones.

```yaml
# elasticsearch.yml
node.attr.zone: zone_a
cluster.routing.allocation.awareness.attributes: zone
```

* Force allocation across zones:

```yaml
cluster.routing.allocation.awareness.force.zone.values: zone_a,zone_b
```

---

# Disk-Based Allocation

* Elasticsearch prevents shard allocation on nodes running low on disk.
* Three thresholds (watermarks):

| Watermark | Default | Effect |
|-----------|---------|--------|
| **Low** | 85% | No new shards allocated on this node |
| **High** | 90% | Shards relocated away from this node |
| **Flood stage** | 95% | Index set to read-only |

```json
PUT /_cluster/settings
{
  "transient": {
    "cluster.routing.allocation.disk.watermark.low": "85%",
    "cluster.routing.allocation.disk.watermark.high": "90%",
    "cluster.routing.allocation.disk.watermark.flood_stage": "95%"
  }
}
```

---

# Shard Allocation Filtering

* Control shard placement using node attributes.

```yaml
# elasticsearch.yml
node.attr.type: hot
```

* Restrict an index to specific nodes:

```json
PUT /logs-recent/_settings
{
  "index.routing.allocation.require.type": "hot"
}
```

* **Operators**:
    * `require`: Shard must be on a matching node
    * `include`: Shard can be on a matching node
    * `exclude`: Shard must not be on a matching node

---

# Allocation Filtering: Built-in Attributes

* Elasticsearch provides built-in attributes for filtering:

| Attribute | Description |
|-----------|-------------|
| `_name` | Node name |
| `_host_ip` | Node host IP |
| `_publish_ip` | Node publish IP |
| `_ip` | Either host or publish IP |
| `_host` | Hostname |
| `_id` | Node ID |
| `_tier` | Node data tier (hot, warm, cold) |

```json
PUT /my-index/_settings
{
  "index.routing.allocation.exclude._name": "node-maintenance"
}
```

---

# Rebalancing

* Elasticsearch continuously rebalances shards to maintain even distribution.
* Rebalancing is triggered when:
    * A new node joins the cluster
    * A node leaves the cluster
    * Shard sizes become uneven

* You can control rebalancing:

```json
PUT /_cluster/settings
{
  "transient": {
    "cluster.routing.rebalance.enable": "all"
  }
}
```

| Value | Effect |
|-------|--------|
| `all` | All shard types rebalanced (default) |
| `primaries` | Only primary shards rebalanced |
| `replicas` | Only replica shards rebalanced |
| `none` | No rebalancing |

---

# Low-Level Replication

* When a document is indexed:
    1. Request arrives at the **coordinating node**
    2. Coordinating node routes to the correct **primary shard** (using routing formula)
    3. Primary shard indexes the document
    4. Primary shard forwards the operation to all **replica shards**
    5. Once all replicas acknowledge, the client gets a response

```
+------------------------------------------------------------+
|  Client                                                    |
|    |                                                       |
|    v                                                       |
|  Coordinating Node                                         |
|    |                                                       |
|    v (routing: hash(_id) % num_shards)                     |
|  Primary Shard (Node A)                                    |
|    |             |                                         |
|    v             v                                         |
|  Replica 1     Replica 2                                   |
|  (Node B)      (Node C)                                    |
|                                                            |
|  All ACK → Response to client                              |
+------------------------------------------------------------+
```

---

# Write Consistency

* Elasticsearch uses a **quorum-based** write model.
* A write succeeds when the majority of shard copies acknowledge.
* The `wait_for_active_shards` parameter controls this:

```json
PUT /my-index/_settings
{
  "index.write.wait_for_active_shards": "2"
}
```

| Value | Meaning |
|-------|---------|
| `1` | Only primary must be active |
| `2` | Primary + 1 replica |
| `all` | All copies must be active |
| Default | `1` (primary only) |

---

# Segment and Merge

* Each shard is a **Lucene index** composed of **segments**.
* A segment is an immutable inverted index on disk.
* New documents create new segments.
* **Merge** combines small segments into larger ones.

```
+------------------------------------------+
|  Shard = Lucene Index                    |
|                                          |
|  Segment 1 (100 docs)                   |
|  Segment 2 (50 docs)   → Merge →        |
|  Segment 3 (30 docs)     Segment A      |
|                           (180 docs)     |
+------------------------------------------+
```

* **Force merge** reduces the number of segments:

```json
POST /my-index/_forcemerge?max_num_segments=1
```

* Only use force merge on **read-only** indices (warm/cold).

---

# Translog (Write-Ahead Log)

* Elasticsearch uses a **transaction log** (translog) for durability.
* Every write operation is recorded in the translog before being applied.
* On crash recovery, the translog replays uncommitted operations.

```
+---------------------------------------------+
|  Write Operation                            |
|    |                                        |
|    v                                        |
|  Translog (append on disk, fsync)           |
|    |                                        |
|    v                                        |
|  In-memory buffer                           |
|    |                                        |
|    v (refresh every 1s)                     |
|  New segment (searchable)                   |
|    |                                        |
|    v (flush)                                |
|  Commit point + clear translog              |
+---------------------------------------------+
```

---

# Diagnosing Shard Allocation Issues

* Use the **Cluster Allocation Explain** API to understand why a shard is unassigned.

```json
GET /_cluster/allocation/explain
{
  "index": "my-index",
  "shard": 0,
  "primary": true
}
```

* Common reasons for unassigned shards:
    * **No matching node** (allocation filtering)
    * **Disk watermark exceeded**
    * **Awareness constraint** (not enough zones)
    * **Too many retries** (allocation decider gave up)

---

# Best Practices

* **Use allocation awareness** in multi-zone deployments.
* **Monitor disk watermarks** to prevent flood stage (read-only).
* **Force merge** only on read-only indices.
* **Avoid too many small shards**: Target 20-50 GB per shard.
* **Use `_cluster/allocation/explain`** to debug unassigned shards.
* **Disable rebalancing** during maintenance operations, then re-enable.

---
layout: cover
---
# Practical Section
