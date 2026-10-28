# Workshop 12 — Transforms: from events to entities

> Turn an index of orders into an index of customers with a pivot transform: preview it, create it, run it, read its stats — then search the result as any index.

**Topic**: Transforms — pivot

## Context

The marketing team of an online shop wants a list of its customers: how many orders each one placed, how much they spent, their average basket, the date of their last order — and to sort, filter and page through that list. An aggregation on `orders` gives the numbers, but computes them again at every request, and an aggregation cannot be paginated nor searched. You build a **customer index** instead, with a transform.

Each step states **what** to get, not **how**: look for the API in the documentation, try it, read the response, adjust. The expected result lets you check your own answer. Hints are folded — open them only once you are stuck.

## Setup

This workshop stands on its own. Create the orders index and load its data:

```json
DELETE /orders

PUT /orders
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "order_id": { "type": "keyword" },
      "customer_id": { "type": "keyword" },
      "@timestamp": { "type": "date" },
      "country": { "type": "keyword" },
      "category": { "type": "keyword" },
      "total": { "type": "double" }
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

Order `o-10` has a `total` of `0`: a game offered by the support team, not a sale.

## Exercises

Reference: [Transforming data](https://www.elastic.co/docs/explore-analyze/transforms) and the [transform APIs](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-transform).

### Step 1: Preview a pivot

Without creating anything, get **one document per customer** from `orders`, with:

- `orders`: the number of orders;
- `total_spent`: the sum of `total`.

<details>
<summary>Hint</summary>

The transform API has an endpoint that runs a configuration and returns its first documents, without saving it. A `pivot` takes a `group_by` — the same sources as a `composite` aggregation — and `aggregations`.

</details>

**Expected result** (some of the documents):

```json
{
  "preview": [
    { "customer_id": "c-001", "orders": 3, "total_spent": 270.0 },
    { "customer_id": "c-002", "orders": 3, "total_spent": 400.0 },
    { "customer_id": "c-005", "orders": 1, "total_spent": 450.0 }
  ]
}
```

**Questions**:
- How many documents does the preview return? How many orders are there in the source?
- Look at `generated_dest_index` in the response: which type did each field get?

### Step 2: Leave the gifts out, enrich the pivot

Same preview, but:

- only the orders with a `total` **greater than 0**;
- add `last_order`, the date of the last order;
- add `categories`, the number of **distinct** categories bought;
- add `avg_basket`, computed **from** `total_spent` and `orders` — not with an `avg`.

<details>
<summary>Hint</summary>

The `source` of a transform takes a `query`, as a search does. For `avg_basket`, look at the pipeline aggregation that runs a script on the values of other aggregations of the same bucket.

</details>

**Expected result** (some of the documents):

```json
{
  "preview": [
    { "customer_id": "c-001", "orders": 3, "total_spent": 270.0, "avg_basket": 90.0, "categories": 3, "last_order": "2026-10-03T14:10:00.000Z" },
    { "customer_id": "c-002", "orders": 2, "total_spent": 400.0, "avg_basket": 200.0, "categories": 2, "last_order": "2026-10-02T17:00:00.000Z" }
  ]
}
```

**Question**: `avg_basket` could have been an `avg` of `total`. When would the two differ?

### Step 3: Create and start the transform

Save the pivot of step 2 as a transform `customers`, writing to the index `customers`. Then start it.

<details>
<summary>Hint</summary>

The configuration is the one of the preview, plus a `dest`. Creating a transform and starting it are two different calls.

</details>

Check that the index `customers` holds **5** documents:

<!-- ci: skip -->
```json
GET /customers/_count
```

**Expected result**:

```json
{ "count": 5 }
```

**Question**: after the creation, before the start, does the index `customers` exist?

### Step 4: Read the stats

Get the state of the transform `customers` and its counters.

<details>
<summary>Hint</summary>

Every transform has a `_stats` endpoint.

</details>

**Expected result** (part of it):

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

**Questions**:
- Why `stopped`, when nobody stopped it?
- Why 9 documents processed, and not 10?

### Step 5: Search the entities

The index `customers` is an index like any other. Get the **two** customers who spent the most, best first, keeping only `customer_id` and `total_spent` in `_source`.

<details>
<summary>Hint</summary>

A plain `_search`: `sort`, `size`, and source filtering.

</details>

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

**Try**: count the customers with an average basket of 100 or more. Could you do that with one aggregation on `orders`?

### Step 6: A second pivot, over time

Create and start a transform `daily-revenue`, writing to `daily-revenue`: one document per **country and day**, with `revenue` (the sum of `total`) and `orders` (the number of orders), all orders included. Then get the revenue of France on October 1st.

<details>
<summary>Hint</summary>

A `group_by` takes several sources: each combination of their values is a group. One of them buckets dates by day.

</details>

**Expected result** (the search on `daily-revenue`):

```json
{
  "hits": {
    "hits": [
      { "_source": { "country": "FR", "day": "2026-10-01T00:00:00.000Z", "revenue": 210.0, "orders": 2 } }
    ]
  }
}
```

**Question**: how many documents are there in `daily-revenue`? And how many groups would the same aggregation return on a year of orders, for 30 countries?

## Going further

- Open **Stack Management → Transforms** in Kibana: find your two transforms, their preview, their messages. Create a third one with the wizard.
- Build a Lens chart of the revenue per day and per country, on `daily-revenue`.
- Delete the transform `customers` **and** its index in one call.

## Success criteria

- A pivot previewed before it is created
- A `source.query`, a `cardinality`, a `bucket_script` in a pivot
- A transform created, started, and its stats read
- An entity-centric index searched, sorted and filtered
- A pivot grouped by several fields, one of them a date

## Troubleshooting

**Problem**: `Cannot delete transform [customers] as the task is running. Stop the task first`
→ Stop it first, or add `force=true`.

**Problem**: `Transform with id [customers] already exists`
→ A transform cannot be overwritten: delete it, then create it again — the `pivot` cannot be updated.

**Problem**: the destination index holds documents of a previous try
→ The transform reused the existing index. Delete the transform with `delete_dest_index=true`, or delete the index, before starting again.
