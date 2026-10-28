# Workshop 13 — Continuous transforms and latest: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Step 1

```json
PUT /_transform/customers-live
{
  "source": { "index": "orders" },
  "dest": { "index": "customers-live" },
  "frequency": "1s",
  "sync": {
    "time": { "field": "event.ingested", "delay": "1s" }
  },
  "pivot": {
    "group_by": {
      "customer_id": { "terms": { "field": "customer_id" } }
    },
    "aggregations": {
      "orders": { "value_count": { "field": "order_id" } },
      "total_spent": { "sum": { "field": "total" } }
    }
  }
}

POST /_transform/customers-live/_start
```

<!-- ci: retry -->
```json
GET /customers-live/_count
```

**Expected result**:

```json
{ "count": 5 }
```

## Step 2

```json
POST /orders/_bulk?refresh=true
{"index":{}}
{"order_id":"o-11","customer_id":"c-003","@timestamp":"2026-10-04T09:00:00Z","country":"FR","category":"games","total":80.0}
{"index":{}}
{"order_id":"o-12","customer_id":"c-006","@timestamp":"2026-10-04T10:00:00Z","country":"BE","category":"books","total":200.0}
```

<!-- ci: retry -->
```json
GET /customers-live/_search
{
  "query": { "term": { "customer_id": "c-003" } }
}
```

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

<!-- ci: retry -->
```json
GET /customers-live/_count
```

**Expected result**:

```json
{ "count": 6 }
```

## Step 3

```json
GET /_transform/customers-live/_stats
```

**Expected result**:

```json
{
  "transforms": [
    { "id": "customers-live", "state": "started", "health": { "status": "green" } }
  ]
}
```

A continuous transform stays `started`. A checkpoint is created only when the
source changed since the last one: with no new order, the number does not move.
At each checkpoint, only the groups that changed are computed again —
`documents_processed` grows by the orders of these customers, not by the whole
index.

## Step 4

```json
POST /orders/_doc?refresh=true
{"order_id":"o-13","customer_id":"c-006","@timestamp":"2026-09-01T12:00:00Z","country":"BE","category":"games","total":50.0}
```

<!-- ci: retry -->
```json
GET /customers-live/_search
{
  "query": { "term": { "customer_id": "c-006" } }
}
```

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

With `sync` on `@timestamp`, the order of September is older than the last
checkpoint: the transform would never have seen it, and `c-006` would have kept
1 order. Sync on the time of indexing, not on the time of the event.

## Step 5

```json
PUT /last-orders
{
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

PUT /_transform/last-order
{
  "source": { "index": "orders" },
  "dest": { "index": "last-orders" },
  "latest": {
    "unique_key": [ "customer_id" ],
    "sort": "@timestamp"
  }
}

POST /_transform/last-order/_start
```

<!-- ci: retry -->
```json
GET /last-orders/_search
{
  "query": { "term": { "customer_id": "c-001" } }
}
```

**Expected result**:

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

<!-- ci: retry -->
```json
GET /last-orders/_search
{
  "query": { "term": { "customer_id": "c-006" } }
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [
      { "_source": { "customer_id": "c-006", "order_id": "o-12" } }
    ]
  }
}
```

`o-12`: `latest` keeps the highest value of its `sort` field, `@timestamp` — the
order of October 4th, not the one indexed last. Without the index created first,
the transform deduces a dynamic mapping: `customer_id` becomes `text` with a
`keyword` sub-field, and the `term` query above finds nothing.

## Step 6

```json
POST /_transform/customers-live/_update
{
  "frequency": "1m"
}

POST /_transform/customers-live/_stop?wait_for_completion=true
```

```json
GET /_transform/customers-live/_stats
```

**Expected result**:

```json
{
  "transforms": [
    { "id": "customers-live", "state": "stopped" }
  ]
}
```
