---
layout: cover
---

# 30 - Index modes

---

# Learning objectives

By the end of this sequence (**~45 min**), you will be able to:

- **Explain** what an index mode changes: `_source`, sort, codec, what is indexed
- **Choose** between `standard`, `logsdb`, `time_series` and `lookup`
- **Try** the **Columnar mode** of 9.5 (`columnar`, `logsdb_columnar` — **technical preview**)
- **Know** its limits: no partial updates, no optimistic concurrency, strings as `keyword`

> Chapter 20 introduced LogsDB and TSDS on data streams: here, the modes side by side.

---

# One setting, many defaults

```json
PUT /events-standard
{
  "settings": { "index.mode": "standard", "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "host": { "properties": { "name": { "type": "keyword" } } },
      "message": { "type": "text" },
      "status": { "type": "integer" },
      "bytes": { "type": "long" }
    }
  }
}
```

- `index.mode` is **static**: chosen at creation (on an index, or in the template of a data stream)
- It does not add features: it changes the **defaults** of storage — and forbids what they cannot do

---

# The same mapping, four modes

```json
PUT /events-logsdb
{
  "settings": { "index.mode": "logsdb", "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": { "properties": { "@timestamp": { "type": "date" }, "host": { "properties": { "name": { "type": "keyword" } } }, "message": { "type": "text" }, "status": { "type": "integer" }, "bytes": { "type": "long" } } }
}

PUT /events-columnar
{
  "settings": { "index.mode": "columnar", "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": { "properties": { "@timestamp": { "type": "date" }, "host": { "properties": { "name": { "type": "keyword" } } }, "message": { "type": "text" }, "status": { "type": "integer" }, "bytes": { "type": "long" } } }
}

PUT /events-logsdb_columnar
{
  "settings": { "index.mode": "logsdb_columnar", "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": { "properties": { "@timestamp": { "type": "date" }, "host": { "properties": { "name": { "type": "keyword" } } }, "message": { "type": "text" }, "status": { "type": "integer" }, "bytes": { "type": "long" } } }
}
```

---

# Some events

```json
POST /_bulk?refresh=true
{"index":{"_index":"events-standard","_id":"1"}}
{"@timestamp":"2026-11-18T10:00:00Z","host":{"name":"web-1"},"message":"GET /home 200","status":200,"bytes":1200}
{"index":{"_index":"events-logsdb","_id":"1"}}
{"@timestamp":"2026-11-18T10:00:00Z","host":{"name":"web-1"},"message":"GET /home 200","status":200,"bytes":1200}
{"index":{"_index":"events-columnar","_id":"1"}}
{"@timestamp":"2026-11-18T10:00:00Z","host":{"name":"web-1"},"message":"GET /home 200","status":200,"bytes":1200}
{"index":{"_index":"events-logsdb_columnar","_id":"1"}}
{"@timestamp":"2026-11-18T10:00:00Z","host":{"name":"web-1"},"message":"GET /home 200","status":200,"bytes":1200}
{"index":{"_index":"events-columnar","_id":"2"}}
{"@timestamp":"2026-11-18T10:05:00Z","host":{"name":"web-2"},"message":"POST /cart 500 timeout","status":500,"bytes":300}
```

**Expected result**:

```json
{ "errors": false }
```

---

# What each mode chose

```json
GET /events-*/_settings?include_defaults=true&filter_path=*.settings.index.mode,*.defaults.index.mapping.source.mode,*.defaults.index.codec,*.defaults.index.sort.field
```

**Expected result**:

```json
{
  "events-standard": { "defaults": { "index": { "mapping": { "source": { "mode": "STORED" } }, "codec": "default" } } },
  "events-logsdb": { "defaults": { "index": { "mapping": { "source": { "mode": "SYNTHETIC" } }, "codec": "best_compression", "sort": { "field": ["@timestamp"] } } } },
  "events-columnar": { "defaults": { "index": { "mapping": { "source": { "mode": "SYNTHETIC" } }, "codec": "best_compression" } } },
  "events-logsdb_columnar": { "defaults": { "index": { "mapping": { "source": { "mode": "SYNTHETIC" } }, "codec": "best_compression", "sort": { "field": ["@timestamp"] } } } }
}
```

- **Synthetic `_source`** (chapter 5): rebuilt from the doc values, not stored
- **Index sort** on `@timestamp`: close values side by side, compressed better, time ranges skipped faster

---

# The modes at a glance

| Mode | For | `_source` | What changes |
|---|---|---|---|
| `standard` | Business documents, full-text search | Stored | Nothing: the reference |
| `logsdb` | Logs, events | Synthetic | Index sort, `best_compression`, `host.name`… (chapter 20) |
| `time_series` | Metrics (TSDS) | Synthetic | Dimensions + metrics, `_id` computed, downsampling |
| `lookup` | Reference data of `LOOKUP JOIN` | Stored | One shard, on every node (chapter 12) |
| `columnar` (**9.5, preview**) | Analytics: wide tables, aggregations, ES\|QL | Synthetic | Column store, no sequence numbers |
| `logsdb_columnar` (**9.5, preview**) | Logs read mostly by ES\|QL | Synthetic | LogsDB defaults + the column store |

---

# Columnar mode: the idea

**New in 9.5, technical preview** (GA announced for 9.6).

- Each field is stored **once**, in a **column** (doc values) — no stored copy of the document, no redundant structures
- Elastic: no inverted index on string fields **by default**; **Columnar Logs** (`logsdb_columnar`) keeps one on `message`, for full-text search
- The same queries: Query DSL, ES|QL, aggregations, Kibana — no API, dashboard or integration to change
- **Opt-in, per index**: existing indices are untouched, an upgrade reindexes nothing

> A search engine **and** an analytics column store, in the same cluster — chosen index by index.

---

# Columnar mode: what still works

```json
POST /events-columnar/_search
{ "query": { "match": { "message": "timeout" } } }
```

**Expected result**:

```json
{ "hits": { "total": { "value": 1 } } }
```

```json
POST /_query?format=txt
{ "query": "FROM events-columnar | STATS hits = COUNT(*), bytes = SUM(bytes) BY host.name | SORT host.name" }
```

```text
     hits      |     bytes     |   host.name
---------------+---------------+---------------
1              |1200           |web-1
1              |300            |web-2
```

- A field **explicitly** mapped as `text` stays searchable with `match`
- Aggregations, sort, ES|QL: read the columns — what this mode is built for

---

# Columnar mode: dynamic strings

```json
POST /events-columnar/_doc?refresh=true
{ "@timestamp": "2026-11-18T10:10:00Z", "user_agent": "Mozilla/5.0", "status": 200 }

GET /events-columnar/_mapping/field/user_agent
```

**Expected result**:

```json
{
  "events-columnar": {
    "mappings": {
      "user_agent": { "mapping": { "user_agent": { "type": "keyword" } } }
    }
  }
}
```

- In `standard`: `text` **+** a `.keyword` sub-field; in `columnar`: a **`keyword`** only
- Need full text on a field? Map it as `text` **explicitly** (or use `logsdb_columnar` for `message`)

---

# Columnar mode: no sequence numbers

A columnar index keeps **no sequence numbers**: every write answers `"_seq_no": -2`.

<!-- ci: expect-error -->
```json
POST /events-columnar/_update/1
{ "doc": { "status": 201 } }
```

`update_not_supported_exception`: *Updates are not supported on indices with sequence numbers disabled*

<!-- ci: expect-error -->
```json
PUT /events-columnar/_doc/1?if_seq_no=0&if_primary_term=1
{ "message": "GET /home 200" }
```

`o_c_c_not_supported_exception`: no optimistic concurrency control (chapter 4)

---

# Columnar mode: what writes are left

```json
PUT /events-columnar/_doc/1?refresh=true
{ "@timestamp": "2026-11-18T10:00:00Z", "host": { "name": "web-1" }, "message": "GET /home 304", "status": 304, "bytes": 0 }

DELETE /events-columnar/_doc/2
```

**Expected result**:

```json
{ "result": "deleted" }
```

- **Indexing**, **replacing** a whole document by its `_id`, **deleting**: yes
- `_update`, `if_seq_no`/`if_primary_term`: no — a column store is not made to change records one by one
- Data that is **appended**, then read in bulk: logs, events, facts. Not a shopping cart.

---

# Storage: an order of magnitude

The same 50 000 web log lines, force-merged, in each mode:

<!-- ci: no-compare -->
```json
GET /_cat/indices/events-*?v&h=index,docs.count,store.size&s=index
```

```text
index                  docs.count store.size
events-columnar             50001      746kb
events-logsdb               50001      786kb
events-logsdb_columnar      50001      677kb
events-standard             50001      2.5mb
```

- Measured on a 9.5 test node: **÷ 3.5** against `standard` — the gain grows with repetitive, wide data
- Measure on **your** data before choosing: a sample, `_forcemerge`, then `_cat/indices`

---

# On a data stream

```json
PUT /_index_template/analytics-template
{
  "index_patterns": ["analytics-*"],
  "data_stream": {},
  "priority": 200,
  "template": {
    "settings": { "index.mode": "logsdb_columnar" }
  }
}

POST /analytics-web/_doc
{ "@timestamp": "2026-11-18T10:00:00Z", "message": "GET /home 200", "status": 200 }
```

**Expected result**:

```json
{ "result": "created" }
```

- As for LogsDB: the mode is read when a **backing index** is created — a rollover switches an existing data stream

---

# Which mode?

| Data | Read by | Mode |
|---|---|---|
| Products, articles, users | Full-text search, relevance, updates | `standard` |
| Logs, events | Discover, full text on `message`, ES\|QL | `logsdb` |
| Metrics | Dashboards, `TS`, downsampling | `time_series` |
| Reference data | `LOOKUP JOIN` | `lookup` |
| Wide events, facts, very large volumes | Aggregations, ES\|QL, rarely full text | `columnar` (preview) |
| Huge log volumes, mostly analytics | ES\|QL + full text on `message` | `logsdb_columnar` (preview) |

<br />

> Technical preview: test it, measure it — keep it out of the critical path until GA.

---

# Quiz

**A team stores shopping carts in a `columnar` index: each click on « add to cart » calls `_update`. What happens?**

- A) It works, but more slowly
- B) Every `_update` fails: the index keeps no sequence numbers
- C) The documents are duplicated
- D) The index switches back to `standard`

<v-click>

**Answer: B** — `update_not_supported_exception`. Carts change all the time: `standard` is the right mode; columnar is for data that is appended, then aggregated.

</v-click>
