---
layout: cover
---

# 7 - Reindex, aliases and templates

---

# Learning objectives

By the end of this sequence (**~1h15**, workshop included), you will be able to:

- **Migrate** an index to a new mapping with `_reindex`
- **Decouple** applications from indices with an **alias**, and **switch** it atomically
- **Restrict** what an alias shows with a **filter**, and **choose** its write index
- **Apply** settings and mappings automatically with **index** and **component templates**

---

# Changing a mapping

- The type or the analyzer of an existing field **cannot** change
- The way out: a **new index** with the new mapping, then copy the documents

<img src="/images/reindex1.png" class="h-80 mx-auto object-contain" />

---

# Reindexing: the copy

<img src="/images/reindex2.png" class="h-96 mx-auto object-contain" />

---

# Reindexing: the switch

<img src="/images/reindex3.png" class="h-96 mx-auto object-contain" />

> The application talks to an **alias**: it never knows the index changed.

---

# The `_reindex` API

```json
PUT /movies_v2
{
  "mappings": {
    "properties": {
      "title": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "year":  { "type": "short" }
    }
  }
}

POST /_reindex
{
  "source": { "index": "movies_v1" },
  "dest":   { "index": "movies_v2" }
}
```

**Expected result**:

```json
{ "total": 2, "created": 2, "failures": [] }
```

- Reads the `_source` of each document: no `_source`, no reindex

---

# Reindexing part of an index

```json
POST /_reindex
{
  "source": {
    "index": "movies_v1",
    "query": { "range": { "year": { "gte": 2000 } } }
  },
  "dest": { "index": "movies_recent" }
}
```

- `query`: only the matching documents
- `script`: transform each document on the way (rename a field…)
- `dest.pipeline`: run an ingest pipeline (chapter 14)

---

# Reindexing a big index

```json
POST /_reindex?wait_for_completion=false&slices=auto
{
  "source": { "index": "movies_v1" },
  "dest":   { "index": "movies_v3" }
}
```

- `wait_for_completion=false`: returns a **task** ID at once
- `slices=auto`: one slice per shard, in parallel
- Follow it with `GET /_tasks/<task_id>`, stop it with `POST /_tasks/<task_id>/_cancel`

> Speed it up: `refresh_interval: -1` and `number_of_replicas: 0` on the destination.

---

# Reindexing from another cluster

<!-- ci: skip -->
```json
POST /_reindex
{
  "source": {
    "remote": { "host": "https://old-cluster:9200", "username": "elastic", "password": "…" },
    "index": "movies_v1"
  },
  "dest": { "index": "movies_v2" }
}
```

- The remote host must be listed in `reindex.remote.whitelist` (`elasticsearch.yml`)
- Handy to **migrate** across major versions

---

# Aliases

An alias is a **second name** for one or more indices:

```json
POST /_aliases
{
  "actions": [
    { "add": { "index": "logs_2024_02", "alias": "logs_current" } }
  ]
}

GET /logs_current/_search
```

- Applications read and write through the **alias**, never the index
- Use cases: zero-downtime reindexing, A/B testing, grouping indices
- `GET /_alias/logs_current`: which indices it points to

---

# Switching an alias atomically

```json
POST /_aliases
{
  "actions": [
    { "remove": { "index": "movies_v1", "alias": "movies" } },
    { "add":    { "index": "movies_v2", "alias": "movies" } }
  ]
}
```

- **One** `_aliases` call = **atomic**: no instant without the alias
- Rollback: the same call, the other way round
- `{ "remove_index": { "index": "movies_v1" } }` in the same call deletes the old index

---

# An alias at creation

```json
PUT /movies_v4
{
  "aliases": { "movies_next": {} },
  "mappings": {
    "properties": { "title": { "type": "text" } }
  }
}
```

- Settings, mappings **and** aliases: the full creation request
- An alias and an index cannot have the **same name**

---

# Filtered aliases

An alias can show only **part** of an index:

```json
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "logs_2024_02",
        "alias": "logs_errors",
        "filter": { "term": { "level": "error" } }
      }
    }
  ]
}

GET /logs_errors/_search
```

- Every search through the alias gets the filter **added**
- One shared index, one alias per **tenant** (`"term": { "tenant": "A" }`): simple multi-tenancy
- A view, not a security barrier: restrict the **roles** to the alias (chapter 17)

---

# An alias on several indices

```json
POST /_aliases
{
  "actions": [
    { "add": { "index": "logs_2024_02", "alias": "logs", "is_write_index": false } },
    { "add": { "index": "logs_2024_03", "alias": "logs", "is_write_index": true } }
  ]
}

POST /logs/_doc
{ "timestamp": "2024-03-20T08:00:00Z", "level": "info", "message": "written in march" }
```

- A **search** on `logs` queries both indices
- A **write** on `logs` goes to the **write index**: `logs_2024_03`
- Without `is_write_index`, writing to a multi-index alias fails

---

# Index templates

Settings, mappings and aliases **applied automatically** to each new index whose name matches:

```json
PUT /_index_template/app-logs
{
  "index_patterns": ["app-logs-*"],
  "priority": 100,
  "template": {
    "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "level":      { "type": "keyword" },
        "message":    { "type": "text" }
      }
    },
    "aliases": { "app-logs": {} }
  }
}
```

---

# A template at work

```json
PUT /app-logs-2025.01/_doc/1
{ "@timestamp": "2025-01-15T10:00:00Z", "level": "INFO", "message": "starting" }

GET /app-logs-2025.01/_mapping
```

**Expected result**:

```json
{ "app-logs-2025.01": { "mappings": { "properties": { "level": { "type": "keyword" } } } } }
```

- Applied at **creation** only: changing a template does not touch existing indices
- Several matches: the highest `priority` wins — no merge between index templates
- `logs-*-*`, `metrics-*-*`, `traces-*-*` are taken by built-in templates (data streams, chapter 20)

---

# Component templates

Reusable **building blocks**, composed by index templates:

```json
PUT /_component_template/timestamp
{
  "template": {
    "mappings": { "properties": { "@timestamp": { "type": "date" } } }
  }
}

PUT /_component_template/small-index
{
  "template": {
    "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
  }
}
```

---

# Composing templates

```json
PUT /_index_template/audit
{
  "index_patterns": ["audit-*"],
  "priority": 100,
  "composed_of": ["timestamp", "small-index"],
  "template": {
    "mappings": { "properties": { "user": { "type": "keyword" } } }
  }
}

POST /_index_template/_simulate_index/audit-2025.01
```

- Merged **in order** of `composed_of`, then the index template's own `template` wins
- `_simulate_index`: the result for a given name, without creating anything
- Common settings in **one** place: change it once, every new index follows

---

# Quiz

**The `movies` alias points to `movies_v1`. You reindexed into `movies_v2`. How do you switch without downtime?**

- A) `DELETE /movies_v1`, then add the alias to `movies_v2`
- B) One `_aliases` call with `remove` on `movies_v1` and `add` on `movies_v2`
- C) Rename `movies_v2` to `movies`
- D) `PUT /movies_v2/_settings` with `"alias": "movies"`

<v-click>

**Answer: B** — the actions of one `_aliases` call are applied atomically. A leaves a gap; an index cannot be renamed.

</v-click>

---
layout: cover
---

# Workshop 4

## Mapping, analyzers, aliases and templates
