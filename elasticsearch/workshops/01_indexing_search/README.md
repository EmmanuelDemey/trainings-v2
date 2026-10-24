# Workshop 1 — Getting started: indexing and basic search

> Create your first Elasticsearch index, put documents in it, and run basic searches to see how the inverted index works.

**Topic**: General concepts — Indexing and search

## Context

You work for an online shop that wants its product catalog in Elasticsearch. You create a `products` index, add a few products to it, then search for specific items.

Each step states **what** to do, not **how**: find the API in the documentation, try it, read the response, adjust. The expected result lets you check your own answer. Hints are folded — open them only once you are stuck.

## Setup

Before starting, in Kibana **Dev Tools**:

1. Check that your cluster answers: `GET /`
2. Check its status: `GET /_cluster/health` — `green`, or `yellow` (fine in dev with one node)
3. If a `products` index is already there, delete it: `DELETE /products`

## Exercises

Reference: [Elasticsearch REST APIs](https://www.elastic.co/docs/api/doc/elasticsearch/).

### Step 1: Create the `products` index

Create an index named `products`, with **one primary shard and no replica**, and no explicit mapping: let Elasticsearch infer it from the documents.

<details>
<summary>Hint</summary>

Look at the [create index API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-indices-create). The number of shards and replicas are index **settings**.

</details>

**Expected result**:

```json
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "index": "products"
}
```

**Question**: why no replica, on a one-node cluster? What would the cluster status be with one?

### Step 2: Index the products

Index these five products, each with the ID shown before it (`1` to `5`):

```text
1  { "name": "Galaxy S23 Smartphone", "category": "electronics", "price": 899.99,  "stock": 150, "description": "High-end smartphone with a 200MP camera" }
2  { "name": "Dell XPS 15 Laptop",    "category": "electronics", "price": 1499.99, "stock": 45,  "description": "Professional laptop with an OLED screen" }
3  { "name": "Ergonomic Office Chair","category": "furniture",   "price": 299.99,  "stock": 80,  "description": "Ergonomic chair with adjustable lumbar support" }
4  { "name": "RGB Mechanical Keyboard","category": "electronics","price": 129.99,  "stock": 200, "description": "Gaming keyboard with Cherry MX switches" }
5  { "name": "Standing Desk",         "category": "furniture",   "price": 599.99,  "stock": 25,  "description": "Electric desk with adjustable height" }
```

Then count the documents of the index.

<details>
<summary>Hint</summary>

The [index API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-index) takes the ID in the path. Five requests are fine; `_bulk` does it in one. Counting has an API of its own: `_count`.

</details>

**Expected result** (the count):

```json
{ "count": 5 }
```

**Try**: look at the mapping Elasticsearch inferred for the index. Which type did it give `category`? And `price`?

### Step 3: Full-text search

Find the products whose **description** mentions the word `adjustable`. The search API comes later in the training: the query is given. Read it, run it, compare with the expected result.

<!-- ci: skip -->
```json
GET /products/_search
{
  "query": {
    "match": { "description": "adjustable" }
  }
}
```

`match` is the standard full-text query: the text you search is analysed the same way as the field.

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [{ "_id": "3" }, { "_id": "5" }]
  }
}
```

**Try**: search `Adjustable` with a capital letter, then `adjust`. Which one still finds them, and why?

### Step 4: Search with a filter

Find the **electronics** products that cost **less than 1000**:

<!-- ci: skip -->
```json
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "category.keyword": "electronics" } }
      ],
      "filter": [
        { "range": { "price": { "lt": 1000 } } }
      ]
    }
  }
}
```

A `bool` query combines conditions. `term` looks for an exact value, `range` for a bound.

**Question**: why `category.keyword` and not `category`? Look at the mapping of step 2.

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [{ "_id": "1" }, { "_id": "4" }]
  }
}
```

**Question**: does it change anything to put the price condition under `must` or under `filter`? Compare the `_score` of the hits.

## Success criteria

- A `products` index with 5 documents
- The search for `adjustable` returns 2 products
- Electronics under 1000 returns 2 products

## Troubleshooting

**Problem**: `index_not_found_exception`
→ Check the name of the index — it is case sensitive.

**Problem**: a search finds nothing right after indexing
→ A document becomes searchable after a refresh (every second by default). Wait a moment and try again.

**Problem**: the `term` on `category` finds nothing
→ Look at the mapping: the dynamic mapping made `category` a `text` field, analysed. Which sub-field keeps the value as is?
