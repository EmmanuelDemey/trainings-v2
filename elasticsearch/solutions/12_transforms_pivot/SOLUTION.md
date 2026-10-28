# Workshop 12 — Transforms: from events to entities: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Step 1

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
      "total_spent": { "sum": { "field": "total" } }
    }
  }
}
```

**Expected result**:

```json
{
  "preview": [
    { "customer_id": "c-001", "orders": 3, "total_spent": 270.0 },
    { "customer_id": "c-002", "orders": 3, "total_spent": 400.0 },
    { "customer_id": "c-005", "orders": 1, "total_spent": 450.0 }
  ],
  "generated_dest_index": {
    "mappings": {
      "properties": {
        "customer_id": { "type": "keyword" },
        "orders": { "type": "long" },
        "total_spent": { "type": "double" }
      }
    }
  }
}
```

5 documents, one per customer, from 10 orders. The mapping is deduced from the
aggregations: `keyword` for a `terms` group, `long` for a `value_count`, the
field's own type for a `sum`.

## Step 2

```json
POST /_transform/_preview
{
  "source": {
    "index": "orders",
    "query": { "range": { "total": { "gt": 0 } } }
  },
  "pivot": {
    "group_by": {
      "customer_id": { "terms": { "field": "customer_id" } }
    },
    "aggregations": {
      "orders": { "value_count": { "field": "order_id" } },
      "total_spent": { "sum": { "field": "total" } },
      "last_order": { "max": { "field": "@timestamp" } },
      "categories": { "cardinality": { "field": "category" } },
      "avg_basket": {
        "bucket_script": {
          "buckets_path": { "spent": "total_spent", "count": "orders" },
          "script": "params.spent / params.count"
        }
      }
    }
  }
}
```

**Expected result**:

```json
{
  "preview": [
    { "customer_id": "c-001", "orders": 3, "total_spent": 270.0, "avg_basket": 90.0, "categories": 3, "last_order": "2026-10-03T14:10:00.000Z" },
    { "customer_id": "c-002", "orders": 2, "total_spent": 400.0, "avg_basket": 200.0, "categories": 2, "last_order": "2026-10-02T17:00:00.000Z" }
  ]
}
```

Here `avg` of `total` gives the same numbers. They differ as soon as an order
holds several lines, or when `orders` counts something else than the documents
summed (distinct `order_id` with a `cardinality`, say).

## Step 3

```json
PUT /_transform/customers
{
  "source": {
    "index": "orders",
    "query": { "range": { "total": { "gt": 0 } } }
  },
  "dest": { "index": "customers" },
  "pivot": {
    "group_by": {
      "customer_id": { "terms": { "field": "customer_id" } }
    },
    "aggregations": {
      "orders": { "value_count": { "field": "order_id" } },
      "total_spent": { "sum": { "field": "total" } },
      "last_order": { "max": { "field": "@timestamp" } },
      "categories": { "cardinality": { "field": "category" } },
      "avg_basket": {
        "bucket_script": {
          "buckets_path": { "spent": "total_spent", "count": "orders" },
          "script": "params.spent / params.count"
        }
      }
    }
  }
}

POST /_transform/customers/_start
```

<!-- ci: retry -->
```json
GET /customers/_count
```

**Expected result**:

```json
{ "count": 5 }
```

The index does not exist before `_start`: `PUT` only saves the configuration.

## Step 4

<!-- ci: retry -->
```json
GET /_transform/customers/_stats
```

**Expected result**:

```json
{
  "transforms": [
    {
      "id": "customers",
      "state": "stopped",
      "stats": { "documents_processed": 9, "documents_indexed": 5 },
      "checkpointing": { "last": { "checkpoint": 1 } }
    }
  ]
}
```

Without `sync`, the transform is a batch one: it processes the source once —
checkpoint 1 — then stops by itself. 9 processed: the `source.query` leaves the
gift `o-10` out.

## Step 5

```json
GET /customers/_search
{
  "size": 2,
  "sort": [ { "total_spent": "desc" } ],
  "_source": [ "customer_id", "total_spent" ]
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [
      { "_source": { "customer_id": "c-005", "total_spent": 450.0 } },
      { "_source": { "customer_id": "c-002", "total_spent": 400.0 } }
    ]
  }
}
```

The « try »:

```json
GET /customers/_count
{
  "query": { "range": { "avg_basket": { "gte": 100 } } }
}
```

**Expected result**:

```json
{ "count": 2 }
```

On `orders`, it takes a `terms` aggregation, an `avg` and a `bucket_selector`,
then counting the buckets on the client side — and no pagination.

## Step 6

```json
PUT /_transform/daily-revenue
{
  "source": { "index": "orders" },
  "dest": { "index": "daily-revenue" },
  "pivot": {
    "group_by": {
      "country": { "terms": { "field": "country" } },
      "day": { "date_histogram": { "field": "@timestamp", "calendar_interval": "1d" } }
    },
    "aggregations": {
      "revenue": { "sum": { "field": "total" } },
      "orders": { "value_count": { "field": "order_id" } }
    }
  }
}

POST /_transform/daily-revenue/_start
```

<!-- ci: retry -->
```json
GET /daily-revenue/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "country": "FR" } },
        { "term": { "day": "2026-10-01" } }
      ]
    }
  }
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [
      { "_source": { "country": "FR", "day": "2026-10-01T00:00:00.000Z", "revenue": 210.0, "orders": 2 } }
    ]
  }
}
```

9 documents: one per country and day that has orders. On a year and 30
countries, up to 30 × 365 = 10,950 groups — beyond the 10,000 buckets an
aggregation returns by default, a few documents for a transform.

## Going further

<!-- ci: retry -->
```json
POST /_transform/customers/_stop?wait_for_completion=true

DELETE /_transform/customers?delete_dest_index=true
```
