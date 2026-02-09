---
layout: cover
---

# Design Patterns for Big Data

---

# Design Patterns for Big Data

* Elasticsearch can handle massive data volumes, but requires thoughtful architecture.
* Key challenges:
    * **Ingestion throughput**: Handling millions of documents per day
    * **Storage optimization**: Managing costs across hot/warm/cold tiers
    * **Query performance**: Maintaining fast search at scale
    * **Cluster stability**: Preventing shard/node overload

---

# Pattern 1: Time-Based Indices

* Create a new index per time period (day, week, month).
* This is the most common pattern for logs and metrics.

```
logs-2025-01-01
logs-2025-01-02
logs-2025-01-03
...
```

* **Advantages**:
    * Easy data retention (delete old indices)
    * Targeted searches (query only relevant time ranges)
    * Efficient ILM (rollover, shrink, force merge per index)

* **Template**:

```json
PUT /_index_template/logs
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1
    }
  }
}
```

---

# Pattern 2: Multi-Shard Routing

* Distribute data across shards using custom routing.
* Avoids querying all shards when only a subset is needed.

```
+--------------------------------------------+
|  Index: logs (10 shards)                   |
|                                            |
|  Shard 0: tenant_A data                   |
|  Shard 1: tenant_B data                   |
|  Shard 2: tenant_A data                   |
|  ...                                       |
|                                            |
|  Query with routing=tenant_A               |
|  → Only shards 0, 2 are queried           |
+--------------------------------------------+
```

* Combine with **routing_partition_size** to avoid hot spots.

---

# Pattern 3: Index Aliases for Abstraction

* Use aliases to create a stable API for clients.
* Physical indices can change (reindex, rollover) without impacting applications.

```json
POST /_aliases
{
  "actions": [
    { "add": { "index": "products-v2", "alias": "products" } },
    { "remove": { "index": "products-v1", "alias": "products" } }
  ]
}
```

* Applications always use `products`, never the versioned index name.

---

# Pattern 4: Denormalization

* Elasticsearch does not support JOINs efficiently.
* **Denormalize** your data to avoid expensive parent-child or nested queries.

**Instead of**:
```
Index: orders     → { "product_id": 123 }
Index: products   → { "_id": 123, "name": "Widget" }
```

**Prefer**:
```json
POST /orders/_doc
{
  "product_id": 123,
  "product_name": "Widget",
  "product_category": "Hardware",
  "order_date": "2025-01-15",
  "quantity": 5
}
```

* Trade-off: More storage, but much faster queries.

---

# Pattern 5: Shard Sizing Strategy

* Shard sizing directly impacts performance and stability.

| Shard Size | Impact |
|------------|--------|
| **< 1 GB** | Too many shards, overhead on master node |
| **1 - 10 GB** | Acceptable for small indices |
| **10 - 50 GB** | Optimal range for most use cases |
| **> 50 GB** | Slow recovery, slow relocations |

* **Rule of thumb**: Target **20-40 GB per shard**.
* **Formula**: `number_of_shards = expected_data_size / target_shard_size`

---

# Pattern 6: Bulk Ingestion Pipeline

* For high-throughput ingestion, optimize the pipeline:

```
+-------------------------------------------------------+
|  Application → Buffer/Queue → Bulk API → Elasticsearch |
|                (Kafka, etc.)   (5-15MB)                |
+-------------------------------------------------------+
```

**Optimizations**:
1. **Disable refresh** during bulk: `"refresh_interval": "-1"`
2. **Reduce replicas** during bulk: `"number_of_replicas": 0`
3. **Use bulk requests** of 5-15 MB
4. **Parallelize** bulk requests across nodes
5. **Re-enable** refresh and replicas after bulk completes

```json
PUT /big-index/_settings
{ "refresh_interval": "-1", "number_of_replicas": 0 }

// ... bulk indexing ...

PUT /big-index/_settings
{ "refresh_interval": "30s", "number_of_replicas": 1 }
```

---

# Pattern 7: Rollover for Continuous Data

* Use **rollover** to automatically create new indices when conditions are met.

```json
PUT /logs-000001
{
  "aliases": {
    "logs-write": { "is_write_index": true },
    "logs-read": {}
  }
}
```

```json
POST /logs-write/_rollover
{
  "conditions": {
    "max_size": "50GB",
    "max_age": "7d",
    "max_docs": 10000000
  }
}
```

* After rollover: `logs-000002` is created and becomes the write index.

---

# Architecture for Big Data

```
+------------------------------------------------------------+
|                    Load Balancer                            |
|                         |                                  |
|            +------------+------------+                     |
|            |                         |                     |
|   Coordinating Nodes          Coordinating Nodes           |
|            |                         |                     |
|   +--------+--------+      +--------+--------+            |
|   |        |        |      |        |        |            |
|   Hot     Hot     Hot     Warm    Warm    Cold            |
|   Nodes   Nodes   Nodes  Nodes   Nodes   Nodes           |
|   (SSD)   (SSD)   (SSD)  (HDD)   (HDD)   (S3)           |
|                                                            |
|   3 Dedicated Master Nodes (lightweight)                   |
+------------------------------------------------------------+
```

---

# Summary: Choosing the Right Pattern

| Scenario | Recommended Pattern |
|----------|-------------------|
| Logs / time-series data | Time-based indices + data streams |
| Multi-tenant SaaS | Routing + filtered aliases |
| E-commerce catalog | Denormalization + aliases for versioning |
| Large bulk imports | Bulk pipeline with optimized settings |
| Growing continuous data | Rollover + ILM |
| Cross-region search | Cross Cluster Search (CCS) |

---
layout: cover
---
# Practical Section
