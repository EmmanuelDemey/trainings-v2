---
layout: cover
---

# 4 - Documents

---

# Learning objectives

By the end of this sequence (**~1h15**, workshops included), you will be able to:

- **Create**, configure and delete an index
- **Index**, read, replace, update and delete a document
- **Index** in batches with `_bulk`, and read its errors
- **Control** when a document becomes searchable: `refresh`
- **Run** a first search with `_search?q=`

---

# Creating an index

```json
PUT /movies
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
```

- Optional: the first document indexed **creates** the index with the defaults
- In real life, settings, **mappings** (chapter 5) and **aliases** (chapter 7) are set at creation
- Default: 1 primary, 1 replica

---

# Static and dynamic settings

| Static — fixed at creation | Dynamic — changed at any time |
|---|---|
| `number_of_shards` | `number_of_replicas` |
| `codec` | `refresh_interval` |
| `routing_partition_size` | `max_result_window` |

```json
PUT /movies/_settings
{ "index": { "number_of_replicas": 0, "refresh_interval": "5s" } }

GET /movies/_settings
```

> Change the number of shards: `_split`, `_shrink`, or a new index + `_reindex`.

---

# The settings that matter

| Setting | Default | Advice |
|---|---|---|
| `number_of_shards` | 1 | Aim for **10 to 50 GB** per shard |
| `number_of_replicas` | 1 | 1 (or 2) in production, 0 on a one-node dev cluster |
| `refresh_interval` | `1s` | `30s` for logs, `-1` during a big load |
| `max_result_window` | 10 000 | Keep it: page deeper with `search_after` (chapter 10) |
| `codec` | `default` | `best_compression` for cold data |

---

# Indexing a document

```json
POST /movies/_doc
{ "title": "Titanic" }
```

**Expected result**:

```json
{ "_index": "movies", "result": "created", "_version": 1 }
```

- `POST /index/_doc`: Elasticsearch **generates** the `_id` (20 characters)
- `_shards.total`: how many copies had to be written, primary + replicas
- `_seq_no` / `_primary_term`: the position of the operation in the shard

---

# Choosing the `_id`

```json
PUT /movies/_doc/1
{ "title": "Inception", "year": 2010 }
```

| Request | When the `_id` exists |
|---|---|
| `POST /movies/_doc` | — a new `_id` every time |
| `PUT /movies/_doc/<id>` | **Replaces** the document |
| `PUT /movies/_create/<id>` | Fails with **409** |

<br />

> Use the business key as `_id` (SKU, user ID…): re-indexing the same source does not
> create **duplicates**.

---

# Reading a document

```json
GET /movies/_doc/1
```

**Expected result**:

```json
{ "_id": "1", "_version": 1, "found": true, "_source": { "title": "Inception", "year": 2010 } }
```

- **Real time**: a `GET` by `_id` sees the document at once, even before the refresh
- `GET /movies/_source/1`: only the document
- `HEAD /movies/_doc/1`: exists or not (200 / 404)

---

# Replacing a document

```json
PUT /movies/_doc/1
{ "title": "Inception", "year": 2010, "director": "Christopher Nolan" }
```

**Expected result**:

```json
{ "_id": "1", "_version": 2, "result": "updated" }
```

- The previous document is **entirely** overwritten: a field you do not send is lost
- `_version` is incremented on each change

---

# Refusing to overwrite: `_create`

<!-- ci: expect-error -->
```json
PUT /movies/_create/1
{ "title": "Another movie" }
```

```text
version_conflict_engine_exception: [1]: version conflict, document already exists
```

- Also available as `PUT /movies/_doc/1?op_type=create`
- The **409** tells "already there": useful for idempotent imports

---

# Partial update: `_update`

```json
POST /movies/_update/1
{ "doc": { "year": 2011 } }
```

**Expected result**:

```json
{ "_id": "1", "_version": 3, "result": "updated" }
```

- Only the fields of `doc` change, the others are kept
- Behind the scenes, the **whole** document is rewritten: segments are immutable
- `"doc_as_upsert": true` creates the document when it is missing

---

# Concurrent writes

Two clients read version N, both write: the second **silently** overwrites the first.

<!-- ci: expect-error -->
```json
PUT /movies/_doc/1?if_seq_no=0&if_primary_term=1
{ "title": "Inception", "year": 2010 }
```

- `if_seq_no` + `if_primary_term`: write **only if** the document has not changed since your read
- Otherwise: **409** — read again, apply your change, retry
- Read both values in the response of `GET /movies/_doc/1`

---

# Deleting a document

```json
DELETE /movies/_doc/1
```

**Expected result**:

```json
{ "_id": "1", "result": "deleted" }
```

- The document is only **marked** as deleted; the space is reclaimed by the next **merge**
- Many documents at once: `_delete_by_query` (chapter 19)

---

# `_bulk`: indexing in batches

One **action** line, then one **document** line — the **NDJSON** format:

```json
POST /movies/_bulk
{ "index": { "_id": "2" } }
{ "title": "The Godfather", "year": 1972 }
{ "index": { "_id": "3" } }
{ "title": "Jaws", "year": 1975 }
{ "create": { "_id": "4" } }
{ "title": "Alien", "year": 1979 }
{ "update": { "_id": "3" } }
{ "doc": { "director": "Steven Spielberg" } }
{ "delete": { "_id": "2" } }
```

**Expected result**:

```json
{ "errors": false }
```

---

# `_bulk`: reading the response

```json
{
  "errors": true,
  "items": [
    { "index":  { "_id": "2", "status": 201 } },
    { "create": { "_id": "4", "status": 409, "error": { "type": "version_conflict_engine_exception" } } }
  ]
}
```

- One failure **does not cancel** the others: no transaction
- Always check `errors`, then the `status` of each item in `items[]`
- The index can be in the URL (`/movies/_bulk`) or on each action line (`"_index"`)

---

# `_bulk`: good practices

- **Size**: **5 to 15 MB** per request — measure on your data
- **Parallelism**: several clients, but watch the rejections:

```json
GET /_cat/thread_pool/write?v&h=node_name,active,queue,rejected
```

- **429** `es_rejected_execution_exception`: slow down and **retry** with a back-off
- The official clients have **bulk helpers** that do batching and retries (chapter 16)

---

# Refresh: when is a document searchable?

- Every `refresh_interval` (**1s**) the buffer becomes a searchable segment
- A shard that received **no search** for 30s stops refreshing until the next search

```json
POST /movies/_refresh

GET /movies/_count
```

| On a write | Effect |
|---|---|
| `?refresh=true` | Forces a refresh right away — costly, tests only |
| `?refresh=wait_for` | Answers once the next refresh has happened |

---

# Refresh during a big load

```json
PUT /movies/_settings
{ "index": { "refresh_interval": "-1", "number_of_replicas": 0 } }
```

… load with `_bulk` …

```json
PUT /movies/_settings
{ "index": { "refresh_interval": "1s", "number_of_replicas": 1 } }
```

- No refresh: fewer, bigger segments, faster indexing
- No replica: each document is written **once**; the replica is copied at the end

> On a one-node cluster, `number_of_replicas: 1` turns the cluster `yellow`.

---

# A first search

```json
GET /movies/_search?q=titanic
```

**Expected result**:

```json
{ "hits": { "total": { "value": 1, "relation": "eq" } } }
```

- `hits.total`: how many documents match
- `hits.hits[]`: the **10 first**, best `_score` first, with their `_source`
- `took`: time in ms — `timed_out`, `_shards`: was the answer complete?

---

# Search with URL parameters

```json
GET /movies/_search?q=title:jaws
GET /movies/_search?q=year:>1974&size=5&from=0
GET /movies/_search?q=*&sort=year:desc
```

| Parameter | Effect |
|---|---|
| `q` | A query in **Lucene syntax**: `field:value`, `AND`, `OR`, ranges |
| `size` / `from` | Pagination: 10 by default |
| `sort` | `field:asc` or `field:desc` |

<br />

> Handy to explore; applications send a JSON **Query DSL** body (chapter 8).

---

# Deleting an index

```json
DELETE /movies,albums
```

- Deletes the documents, the mapping and the settings: **no undo** — only a snapshot brings it back
- Wildcards and `_all` are **refused** by default:

<!-- ci: expect-error -->
```json
DELETE /_all
```

- `action.destructive_requires_name` (default `true`): keep it

---

# Quiz

**You index a document, then search for it at once with `_search`. It is not found. Why?**

- A) The index is `yellow`
- B) No refresh has happened yet since the write
- C) `_search` needs the `_id`
- D) The translog was not flushed

<v-click>

**Answer: B** — a document becomes searchable at the next refresh (1s by default). A `GET` by `_id` would have found it.

</v-click>

---
layout: cover
---

# Workshop 2

## Getting started: indexing and basic search

---
layout: cover
---

# Workshop 3

## Documents and bulk
