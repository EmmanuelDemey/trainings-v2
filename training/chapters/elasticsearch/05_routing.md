---
layout: cover
---

# Routing

---

# What is Routing?

* When a document is indexed, Elasticsearch determines which shard will store it.
* This is done via a **routing** formula:
    * `shard = hash(routing) % number_of_primary_shards`
* By default, the routing value is the document's `_id`.
* This ensures a uniform distribution of documents across shards.

---

# Why Custom Routing?

* Custom routing allows **co-locating related documents** on the same shard.
* Benefits:
    * **Faster searches**: Query only one shard instead of all
    * **Better performance**: Reduce fan-out on the cluster
    * **Data locality**: Documents that are queried together are stored together

* Common use cases:
    * Multi-tenant applications (route by tenant ID)
    * Time-series data (route by date)
    * User-specific data (route by user ID)

---

# Indexing with Custom Routing

* Specify the `routing` parameter when indexing a document.

```json
POST /logs/_doc?routing=tenant_A
{
  "tenant": "tenant_A",
  "message": "Application started",
  "timestamp": "2025-01-15T10:00:00"
}
```

```json
POST /logs/_doc?routing=tenant_B
{
  "tenant": "tenant_B",
  "message": "Error in payment module",
  "timestamp": "2025-01-15T10:05:00"
}
```

---

# Searching with Custom Routing

* Use the `routing` parameter in your search to target a specific shard.
* Only the shard(s) matching the routing value will be queried.

```json
POST /logs/_search?routing=tenant_A
{
  "query": {
    "match": {
      "message": "started"
    }
  }
}
```

* Without routing: All shards are queried (fan-out).
* With routing: Only 1 shard is queried (targeted search).

---

# Routing with Mapping

* You can **require** routing at mapping level to prevent indexing without it.

```json
PUT /logs
{
  "mappings": {
    "_routing": {
      "required": true
    },
    "properties": {
      "tenant": { "type": "keyword" },
      "message": { "type": "text" },
      "timestamp": { "type": "date" }
    }
  }
}
```

* Any indexing request without `?routing=...` will be rejected.

---

# Routing and Aliases

* Aliases can include a routing value, simplifying client-side code.

```json
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "logs",
        "alias": "logs-tenant-a",
        "routing": "tenant_A",
        "filter": {
          "term": { "tenant": "tenant_A" }
        }
      }
    }
  ]
}
```

* Searching `logs-tenant-a` automatically applies the routing and the filter.

```json
POST /logs-tenant-a/_search
{
  "query": { "match_all": {} }
}
```

---

# Routing Partition Size

* By default, a routing value maps to exactly **one shard**.
* With `routing_partition_size`, a routing value maps to a **subset of shards**.
* This avoids hot spots when some routing values have much more data than others.

```json
PUT /logs
{
  "settings": {
    "number_of_shards": 10,
    "routing_partition_size": 3
  }
}
```

* Formula becomes: `shard = (hash(routing) + hash(_id) % routing_partition_size) % number_of_shards`

---

# Best Practices

* **Use custom routing** for multi-tenant or user-scoped data.
* **Require routing in mapping** to prevent accidental unrouted indexing.
* **Combine with aliases** for transparent routing from the client side.
* **Monitor shard sizes** to detect uneven distribution (hot spots).
* **Consider `routing_partition_size`** when data distribution is uneven.
* **Always specify routing** for GET, UPDATE, and DELETE operations on routed documents.

---
layout: cover
---
# Practical Section
