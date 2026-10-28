---
layout: cover
---

# Transforms

---

# Why transforms?

* An index of **events** answers « what happened? »: orders, logs, sessions…
* The business asks about **entities**: « who are my best customers? », « what is the revenue per country and per day? »
* An aggregation answers once, at query time — and is computed again at each query
* A **transform** runs the aggregation for you, and writes its result to an index of its own: an **entity-centric** index
    * one document per customer, per product, per day…
    * searched, sorted, paginated, aggregated again like any index
    * shown in Kibana without recomputing millions of events

```text
orders (events)                         customers (entities)
o-01  c-001  120.0                      c-001  3 orders  270.0
o-03  c-001   90.0        transform     c-002  2 orders  400.0
o-08  c-001   60.0      ────────────►   c-003  1 order    45.0
o-02  c-002  300.0                      c-004  2 orders  100.0
…
```

---

# Two kinds of transforms

| | `pivot` | `latest` |
|---|---|---|
| One document per | group (`group_by`) | unique key (`unique_key`) |
| Holds | the aggregations of the group | the most recent source document, as is |
| Use case | totals, averages, counts per entity | the last state of an entity: last order, last status |
| Built on | composite aggregation | `top_hits` on a sort field |

* Both run **batch** (once, then stop) or **continuous** (they follow new documents)
* Needs a node with the `transform` role — every node has it by default

---

# A pivot: `group_by` + `aggregations`

```json
POST /_transform/_preview
{
  "source": { "index": "orders" },
  "pivot": {
    "group_by": {
      "customer_id": { "terms": { "field": "customer_id" } }
    },
    "aggregations": {
      "orders": { "value_count": { "field": "order_id" } },
      "total_spent": { "sum": { "field": "total" } },
      "last_order": { "max": { "field": "@timestamp" } }
    }
  }
}
```

* `group_by`: `terms`, `histogram`, `date_histogram`, `geotile_grid` — several at once make one group per combination
* `aggregations`: metrics (`sum`, `avg`, `max`, `cardinality`, `percentiles`…), `top_metrics`, `terms`, `bucket_script`, `scripted_metric`…

---

# `_preview`: try before you create

* Runs the transform on the source, **writes nothing**, returns the first documents
* Shows the mapping the destination index would get: `generated_dest_index`

```json
{
  "preview": [
    { "customer_id": "c-001", "orders": 3, "total_spent": 270.0, "last_order": "2026-10-03T14:10:00.000Z" },
    { "customer_id": "c-002", "orders": 2, "total_spent": 400.0, "last_order": "2026-10-02T17:00:00.000Z" }
  ],
  "generated_dest_index": {
    "mappings": {
      "properties": {
        "customer_id": { "type": "keyword" },
        "orders": { "type": "long" },
        "total_spent": { "type": "double" },
        "last_order": { "type": "date" }
      }
    }
  }
}
```

---

# Create, start, check

```json
PUT /_transform/customers
{
  "source": { "index": "orders" },
  "dest": { "index": "customers" },
  "pivot": {
    "group_by": { "customer_id": { "terms": { "field": "customer_id" } } },
    "aggregations": { "total_spent": { "sum": { "field": "total" } } }
  }
}
```

<!-- ci: skip -->
```json
POST /_transform/customers/_start

GET /_transform/customers/_stats
```

* `PUT` only **saves** the transform: the destination index is created at `_start`
* `_stats`: `state` (`indexing`, `started`, `stopped`, `failed`), `documents_processed`, `documents_indexed`, `checkpointing`, `health`
* A batch transform processes the source once — **checkpoint 1** — then stops by itself

---

# The destination index

* Created at `_start`, with the **mapping deduced** from the aggregations — unless it already exists
* One document per group, its `_id` derived from the group keys: a new run **updates** it, never duplicates it
* Create it yourself when the deduced mapping is not the one you want: shards, a `text` field, a `scaled_float`…
* `dest.aliases`: an alias put on the destination at creation — the applications read the alias, the index can be rebuilt behind it

```json
PUT /_transform/customers-v2
{
  "source": { "index": "orders" },
  "dest": {
    "index": "customers-v2",
    "aliases": [ { "alias": "customers-current", "move_on_creation": true } ]
  },
  "pivot": {
    "group_by": { "customer_id": { "terms": { "field": "customer_id" } } },
    "aggregations": { "total_spent": { "sum": { "field": "total" } } }
  }
}
```

---

# Continuous transforms

```json
PUT /_transform/customers-live
{
  "source": { "index": "orders" },
  "dest": { "index": "customers-live" },
  "frequency": "1m",
  "sync": { "time": { "field": "event.ingested", "delay": "60s" } },
  "pivot": {
    "group_by": { "customer_id": { "terms": { "field": "customer_id" } } },
    "aggregations": { "total_spent": { "sum": { "field": "total" } } }
  }
}
```

* `sync.time.field`: how the transform finds what is new since its last **checkpoint**
* `frequency`: how often it checks for changes (1s to 1h, default 1m)
* `delay`: how late a document may become searchable — what arrives later than that is missed
* Only the **groups that changed** are computed again: a customer with no new order is left alone

---

# The sync field: ingest time, not event time

* At each checkpoint, a continuous transform reads only the documents whose **sync field** is later than the previous checkpoint
* With `sync` on `@timestamp`, the time of the **event**, a late document is missed:

```text
10:00  checkpoint 1: every order up to 10:00 is processed
10:05  a till sends, late, an order of 09:30         @timestamp = 09:30
10:06  checkpoint 2: reads the orders after 10:00    09:30 < 10:00 → never read
```

* Sync on the time the document was **indexed** instead: that order gets `event.ingested = 10:05`, and checkpoint 2 reads it

---

# Setting the ingest time

* An ingest pipeline writes the time of indexing into every document:

```json
PUT /_ingest/pipeline/ingest-time
{
  "processors": [
    { "set": { "field": "event.ingested", "value": "{{{_ingest.timestamp}}}" } }
  ]
}
```

* Then `index.default_pipeline: ingest-time` on the source index
* Elastic Agent and its integrations already set `event.ingested`

---

# `latest`: the last document per key

```json
POST /_transform/_preview
{
  "source": { "index": "orders" },
  "latest": {
    "unique_key": [ "customer_id" ],
    "sort": "@timestamp"
  }
}
```

* One document per `unique_key` value (one or several fields): the source document with the highest `sort`, copied as is
* Typical: the **last known state** of a host, an order, a device, a customer
* The deduced mapping is dynamic (`text` + `keyword`): create the destination index first, with your mapping

---

# Managing a transform

| API | Does |
|---|---|
| `GET /_transform/<id>` | the configuration |
| `GET /_transform/<id>/_stats` | state, counters, checkpoints, health |
| `POST /_transform/<id>/_stop` | stops it — `wait_for_completion=true` to wait for the current checkpoint |
| `POST /_transform/<id>/_update` | changes `frequency`, `sync`, `source.query`, `dest`… — not the `pivot` |
| `POST /_transform/<id>/_schedule_now` | runs the next check at once, without waiting for `frequency` |
| `POST /_transform/<id>/_reset` | deletes the destination, back to checkpoint 0 |
| `DELETE /_transform/<id>` | deletes it — stopped first; `delete_dest_index=true` deletes its index |

* Kibana: **Stack Management → Transforms** — a wizard, the preview, the stats, the messages
* `retention_policy`: deletes the destination documents older than `max_age` on a date field — a rolling window

---

# Transforms, aggregations, rollups, ES|QL?

| Need | Tool |
|---|---|
| An answer now, on fresh data | aggregation or ES\|QL `STATS` |
| The same heavy aggregation, queried all day | **pivot transform** |
| Search, sort, paginate the **result** of an aggregation | **pivot transform** |
| The current state of each entity | **latest transform** |
| Shrink old time series, metrics kept per interval | **downsampling** (TSDS) — rollups are deprecated |

* A transform is an **index**: the Query DSL, ES|QL, Lens, ML and alerting all read it
* It costs a search on the source at each checkpoint, and the disk of its destination
* Security: it runs with the roles of the user who created or last updated it

---
layout: cover
---

# Hands-on

## Workshop 12 - Transforms: from events to entities

---
layout: cover
---

# Hands-on

## Workshop 13 - Continuous transforms and latest
