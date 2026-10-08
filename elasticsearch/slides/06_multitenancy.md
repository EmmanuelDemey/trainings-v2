---
layout: cover
---

# Multi-tenant Architecture

Aliases, multi-index, cross-index queries, and data streams

---

# Multi-tenant Architecture

* Elasticsearch natively supports **multi-tenant** architectures.
* Several patterns exist to isolate and organize data per tenant:
    * **Single index** with routing and filtered aliases
    * **Index per tenant** with alias aggregation
    * **Data streams** for time-series data
* The choice depends on the number of tenants, data volume, and isolation requirements.

---

# Multiple Indices

* Elasticsearch allows querying multiple indices simultaneously.
* This is useful for cross-tenant or cross-application searches.

```json
POST /logs-app-a,logs-app-b/_search
{
  "query": { "match_all": {} }
}
```

* Wildcard patterns are also supported:

```json
POST /logs-*/_search
{
  "query": {
    "range": {
      "timestamp": { "gte": "now-1d" }
    }
  }
}
```

---

# Index Aliases

* An **alias** is a virtual name that points to one or more indices.
* Aliases allow transparent index switching without changing client code.

```json
POST /_aliases
{
  "actions": [
    { "add": { "index": "logs-2025-01", "alias": "logs-current" } }
  ]
}
```

* Search via the alias:

```json
POST /logs-current/_search
{
  "query": { "match_all": {} }
}
```

---

# Alias Operations

* **Add** an alias to an index:

```json
POST /_aliases
{
  "actions": [
    { "add": { "index": "logs-2025-02", "alias": "logs-current" } }
  ]
}
```

* **Remove** an alias:

```json
POST /_aliases
{
  "actions": [
    { "remove": { "index": "logs-2025-01", "alias": "logs-current" } }
  ]
}
```

* **Atomic swap** (zero downtime):

```json
POST /_aliases
{
  "actions": [
    { "remove": { "index": "logs-2025-01", "alias": "logs-current" } },
    { "add": { "index": "logs-2025-02", "alias": "logs-current" } }
  ]
}
```

---

# Filtered Aliases

* Aliases can include a **filter** to restrict the visible documents.
* This is the foundation of multi-tenancy with a single index.

```json
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "logs",
        "alias": "logs-tenant-a",
        "filter": {
          "term": { "tenant": "A" }
        }
      }
    },
    {
      "add": {
        "index": "logs",
        "alias": "logs-tenant-b",
        "filter": {
          "term": { "tenant": "B" }
        }
      }
    }
  ]
}
```

* Searching `logs-tenant-a` only returns documents from tenant A.

---

# Multi-Index Aliases

* An alias can point to **multiple indices**.
* This is useful for grouping time-based indices.

```json
POST /_aliases
{
  "actions": [
    { "add": { "index": "logs-2025-01", "alias": "logs-all" } },
    { "add": { "index": "logs-2025-02", "alias": "logs-all" } },
    { "add": { "index": "logs-2025-03", "alias": "logs-all" } }
  ]
}
```

* Searching `logs-all` queries all three indices.

---

# Write Index

* When an alias points to multiple indices, you must specify a **write index** for indexing operations.

```json
POST /_aliases
{
  "actions": [
    { "add": { "index": "logs-2025-01", "alias": "logs", "is_write_index": false } },
    { "add": { "index": "logs-2025-02", "alias": "logs", "is_write_index": true } }
  ]
}
```

* Indexing via `POST /logs/_doc` writes to `logs-2025-02`.
* Searching via `POST /logs/_search` queries both indices.

---

# Cross-Index Queries

* Beyond multi-index search, Elasticsearch supports:
    * **Index patterns**: `logs-*`, `metrics-2025-*`
    * **Exclude patterns**: `logs-*,-logs-debug-*`
    * **All indices**: `_all` or `*`

```json
POST /logs-*,-logs-debug-*/_search
{
  "query": {
    "match": { "level": "ERROR" }
  }
}
```

* **Performance tip**: Be specific with patterns to avoid querying too many shards.

---

# Data Streams

* **Data streams** are designed for time-series data (logs, metrics, events).
* They automatically manage backing indices with rollover.
* Documents must have a `@timestamp` field.

```json
PUT /_index_template/logs-template
{
  "index_patterns": ["logs-*"],
  "data_stream": {},
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "message": { "type": "text" }
      }
    }
  }
}
```

---

# Data Streams: Usage

* **Index documents** (append-only):

```json
POST /logs-app/_doc
{
  "@timestamp": "2025-01-15T10:00:00",
  "message": "Application started",
  "level": "INFO"
}
```

* **Search** (transparently queries all backing indices):

```json
POST /logs-app/_search
{
  "query": {
    "range": {
      "@timestamp": { "gte": "now-1d" }
    }
  }
}
```

* **Rollover** is managed automatically by ILM.

---

# Multi-tenancy Patterns Comparison

| Pattern | Isolation | Scalability | Complexity | Use Case |
|---------|-----------|-------------|------------|----------|
| **Single index + filtered aliases** | Low | High | Low | Few tenants, similar data |
| **Index per tenant** | High | Medium | Medium | Strong isolation required |
| **Index per tenant + alias grouping** | High | High | Medium | Many tenants, cross-tenant queries |
| **Data streams** | Medium | Very high | Low | Time-series / logs |

---

# Best Practices

* **Use aliases** to decouple application code from physical index names.
* **Atomic swaps** enable zero-downtime reindexing.
* **Filtered aliases** provide lightweight multi-tenancy without index proliferation.
* **Data streams** are the recommended approach for time-series data.
* **Monitor shard count**: Too many indices = too many shards = master node overhead.
* **Use index templates** to standardize settings across tenant indices.

---
layout: cover
---
# Practical Section
