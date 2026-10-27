# Workshop 1 — Getting started: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Step 1

```json
PUT /products
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
```

**Expected result**:

```json
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "index": "products"
}
```

A replica is never allocated on the node that holds its primary: on one node it
stays unassigned, and the cluster is `yellow`.

## Step 2

```json
POST /products/_doc/1
{ "name": "Galaxy S23 Smartphone", "category": "electronics", "price": 899.99, "stock": 150, "description": "High-end smartphone with a 200MP camera" }

POST /products/_doc/2
{ "name": "Dell XPS 15 Laptop", "category": "electronics", "price": 1499.99, "stock": 45, "description": "Professional laptop with an OLED screen" }

POST /products/_doc/3
{ "name": "Ergonomic Office Chair", "category": "furniture", "price": 299.99, "stock": 80, "description": "Ergonomic chair with adjustable lumbar support" }

POST /products/_doc/4
{ "name": "RGB Mechanical Keyboard", "category": "electronics", "price": 129.99, "stock": 200, "description": "Gaming keyboard with Cherry MX switches" }

POST /products/_doc/5
{ "name": "Standing Desk", "category": "furniture", "price": 599.99, "stock": 25, "description": "Electric desk with adjustable height" }
```

```json
GET /products/_count
```

**Expected result**:

```json
{ "count": 5 }
```

`GET /products/_mapping`: `category` is `text` with a `keyword` sub-field,
`price` is `float`, `stock` is `long`.

## Step 3

Given in the README; replayed here, once the index exists:

```json
POST /products/_search
{
  "query": {
    "match": { "description": "adjustable" }
  }
}
```

`Adjustable` finds them too: the standard analyzer lowercases both the field and
the query. `adjust` finds nothing: the standard analyzer does not stem — an
`english` analyzer would.

## Step 4

Given in the README:

```json
POST /products/_search
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

`category` is a `text` field, analysed; its `keyword` sub-field, created by the
dynamic mapping, holds the value as is — what `term` compares to.

Same hits either way. Under `filter`, a condition does not score (and can be
cached); under `must`, the `range` adds a constant to every `_score`. A yes/no
condition belongs in `filter`.
