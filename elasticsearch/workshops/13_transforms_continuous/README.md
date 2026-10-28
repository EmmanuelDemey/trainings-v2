# Workshop 13 — Continuous transforms and latest

> Keep an entity-centric index up to date as new events arrive, with a continuous transform — then keep the last state of each entity with a `latest` transform.

**Topic**: Transforms — continuous, `latest`, checkpoints

## Context

The customer index of workshop 12 is a snapshot: the next order is not in it. The marketing team wants it **live** — a new order should show up in the customer's totals within seconds — and a second index holding, for each customer, their **last order** as is, to show it in the customer service tool.

Each step states **what** to get, not **how**: look for the setting or the API in the documentation, try it, read the response, adjust. The expected result lets you check your own answer. Hints are folded — open them only once you are stuck.

## Setup

This workshop stands on its own. A continuous transform needs to know **when** each order was indexed: an ingest pipeline adds that time to every document, in `event.ingested`. Create it, then the orders index that uses it by default, and load the data:

```json
PUT /_ingest/pipeline/ingest-time
{
  "processors": [
    { "set": { "field": "event.ingested", "value": "{{{_ingest.timestamp}}}" } }
  ]
}

DELETE /orders

PUT /orders
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "default_pipeline": "ingest-time"
  },
  "mappings": {
    "properties": {
      "order_id": { "type": "keyword" },
      "customer_id": { "type": "keyword" },
      "@timestamp": { "type": "date" },
      "country": { "type": "keyword" },
      "category": { "type": "keyword" },
      "total": { "type": "double" },
      "event": { "properties": { "ingested": { "type": "date" } } }
    }
  }
}

POST /orders/_bulk?refresh=true
{"index":{}}
{"order_id":"o-01","customer_id":"c-001","@timestamp":"2026-10-01T09:12:00Z","country":"FR","category":"books","total":120.0}
{"index":{}}
{"order_id":"o-02","customer_id":"c-002","@timestamp":"2026-10-01T10:30:00Z","country":"DE","category":"electronics","total":300.0}
{"index":{}}
{"order_id":"o-03","customer_id":"c-001","@timestamp":"2026-10-01T15:45:00Z","country":"FR","category":"games","total":90.0}
{"index":{}}
{"order_id":"o-04","customer_id":"c-003","@timestamp":"2026-10-02T08:05:00Z","country":"FR","category":"books","total":45.0}
{"index":{}}
{"order_id":"o-05","customer_id":"c-004","@timestamp":"2026-10-02T11:20:00Z","country":"ES","category":"games","total":70.0}
{"index":{}}
{"order_id":"o-06","customer_id":"c-002","@timestamp":"2026-10-02T17:00:00Z","country":"DE","category":"books","total":100.0}
{"index":{}}
{"order_id":"o-07","customer_id":"c-004","@timestamp":"2026-10-03T09:40:00Z","country":"ES","category":"books","total":30.0}
{"index":{}}
{"order_id":"o-08","customer_id":"c-001","@timestamp":"2026-10-03T14:10:00Z","country":"FR","category":"electronics","total":60.0}
{"index":{}}
{"order_id":"o-09","customer_id":"c-005","@timestamp":"2026-10-03T16:30:00Z","country":"IT","category":"electronics","total":450.0}
{"index":{}}
{"order_id":"o-10","customer_id":"c-002","@timestamp":"2026-10-03T18:00:00Z","country":"DE","category":"games","total":0.0}
```

## Exercises

Reference: [Transforming data](https://www.elastic.co/docs/explore-analyze/transforms) and the [transform APIs](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-transform).

### Step 1: A continuous transform

Create and start a transform `customers-live`, writing to `customers-live`: one document per customer, with `orders` (the number of orders) and `total_spent` (the sum of `total`). Unlike workshop 12, it must **keep running** and pick up new orders:

- it looks for changes **every second**;
- it finds the new orders through `event.ingested`, and lets them **1 second** to become searchable.

<details>
<summary>Hint</summary>

Two settings at the root of the transform configuration: one sets how often it checks, the other — `sync` — which date field tells what is new, and with which delay. In a real cluster, keep the defaults (1 minute, 60 seconds): every check is a search on the source.

</details>

Check that `customers-live` holds **5** customers:

<!-- ci: skip -->
```json
GET /customers-live/_count
```

**Expected result**:

```json
{ "count": 5 }
```

### Step 2: New orders

Two orders arrive — one from a known customer, one from a new customer:

<!-- ci: skip -->
```json
POST /orders/_bulk?refresh=true
{"index":{}}
{"order_id":"o-11","customer_id":"c-003","@timestamp":"2026-10-04T09:00:00Z","country":"FR","category":"games","total":80.0}
{"index":{}}
{"order_id":"o-12","customer_id":"c-006","@timestamp":"2026-10-04T10:00:00Z","country":"BE","category":"books","total":200.0}
```

Without touching the transform, wait a few seconds, then get the document of `c-003` in `customers-live`.

<details>
<summary>Hint</summary>

A plain search, with a `term` query on `customer_id`. Nothing to do on the transform side: that is the point.

</details>

**Expected result**:

```json
{
  "hits": {
    "hits": [
      { "_source": { "customer_id": "c-003", "orders": 2, "total_spent": 125.0 } }
    ]
  }
}
```

**Question**: how many customers are there now in `customers-live`?

### Step 3: Checkpoints

Read the stats of `customers-live`.

**Expected result** (part of it):

```json
{
  "transforms": [
    { "id": "customers-live", "state": "started", "health": { "status": "green" } }
  ]
}
```

**Questions**:
- Which checkpoint is it at? Read the stats again in a minute, with no new order: does it move?
- Compare `documents_processed` with the number of orders: at each checkpoint, does the transform read **all** the orders again?

### Step 4: A late order

An order of **September** reaches the cluster only now — a shop that synchronised its till late:

<!-- ci: skip -->
```json
POST /orders/_doc?refresh=true
{"order_id":"o-13","customer_id":"c-006","@timestamp":"2026-09-01T12:00:00Z","country":"BE","category":"games","total":50.0}
```

Check that `c-006` now has **2** orders, for `250.0`.

**Expected result**:

```json
{
  "hits": {
    "hits": [
      { "_source": { "customer_id": "c-006", "orders": 2, "total_spent": 250.0 } }
    ]
  }
}
```

**Question**: what would have happened with `sync` on `@timestamp`?

### Step 5: The last order of each customer

Create the index `last-orders`, with the same mapping as `orders`. Then create and start a transform `last-order`, writing to it: for each customer, their **most recent** order (by `@timestamp`), copied as is. Get the last order of `c-001`, then of `c-006`.

<details>
<summary>Hint</summary>

Not a `pivot`: the other kind of transform keeps, for each value of a key, the document with the highest value of a sort field. Why create the destination index first? Try without, and look at its mapping.

</details>

**Expected result** (`c-001`):

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [
      { "_source": { "customer_id": "c-001", "order_id": "o-08", "total": 60.0 } }
    ]
  }
}
```

**Question**: which is the last order of `c-006` — the last one indexed, `o-13`, or another one? Why?

### Step 6: Stop it

Slow `customers-live` down to one check **per minute**, without recreating it. Then stop it, waiting for the current checkpoint to end, and check its state.

<details>
<summary>Hint</summary>

A transform has an `_update` endpoint — for most of its settings, not for its `pivot`. `_stop` takes a parameter to wait.

</details>

**Expected result** (the stats):

```json
{
  "transforms": [
    { "id": "customers-live", "state": "stopped" }
  ]
}
```

## Going further

- Restart `customers-live`, index an order, and call `_schedule_now`: what does it change?
- Add a `retention_policy` to a transform of daily revenue, to keep only the last 30 days in its destination.
- Find, in **Stack Management → Transforms**, the messages of `customers-live`: one per checkpoint?
- Make `last-order` continuous too.

## Success criteria

- A continuous transform: `frequency`, `sync.time.field`, `delay`
- New documents picked up without touching the transform
- A late event picked up thanks to an ingest timestamp
- A `latest` transform, on a destination index created with its mapping
- A transform updated and stopped

## Troubleshooting

**Problem**: the new orders never show up in `customers-live`
→ Check the transform is `started`, and that the orders have an `event.ingested`: indexed without the pipeline, they have none and the transform never sees them.

**Problem**: `Cannot update transform [...]: pivot cannot be updated`
→ Only some settings are updatable. To change the pivot: stop, delete, create again — or a new transform behind an alias.

**Problem**: `customer_id` is a `text` field in `last-orders`
→ The index was created by the transform, with a dynamic mapping. Delete the transform with `delete_dest_index=true`, create the index with your mapping, then the transform again.
