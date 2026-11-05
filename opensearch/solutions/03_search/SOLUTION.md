# Workshop 3 — Search and relevance: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the workshop README, and checks each « Expected result ».

## Step 1

```json
GET /restaurants/_search
{
  "query": { "match": { "description": "fish" } },
  "_source": false
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "3" }, { "_id": "5" } ]
  }
}
```

`description` uses the `english` analyzer: "fishes" and "fish" share the same
stem.

## Step 2

```json
GET /restaurants/_search
{
  "query": { "match_phrase": { "description": "fresh pasta" } },
  "_source": false
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "4" }, { "_id": "2" } ]
  }
}
```

## Step 3

Finds nothing: the index holds `sushi` and `zen`, not `Sushi Zen`.

```json
GET /restaurants/_search
{ "query": { "term": { "name": "Sushi Zen" } } }
```

**Expected result**:

```json
{ "hits": { "total": { "value": 0 } } }
```

```json
GET /restaurants/_search
{
  "query": { "term": { "name.keyword": "Sushi Zen" } },
  "_source": false
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [ { "_id": "3" } ]
  }
}
```

## Step 4

```json
GET /restaurants/_search
{
  "query": {
    "bool": {
      "must": [ { "match": { "description": "cuisine" } } ],
      "filter": [
        { "terms": { "city": ["Paris", "Lyon"] } },
        { "range": { "price": { "lte": 40 } } }
      ]
    }
  },
  "_source": ["name"]
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [
      { "_id": "1", "_source": { "name": "Le Bouchon Lyonnais" } },
      { "_id": "7", "_source": { "name": "Chez Mamie" } }
    ]
  }
}
```

Run it without the `filter`: restaurants 1 and 7 keep the very same scores —
the filters only remove documents, they never score.

## Step 5

```json
GET /restaurants/_search
{
  "query": {
    "multi_match": { "query": "tart", "fields": ["name^3", "description"] }
  },
  "_source": ["name"]
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 2 } } }
```

## Step 6

```json
GET /restaurants/_search
{
  "query": {
    "function_score": {
      "query": { "match": { "description": "cuisine" } },
      "field_value_factor": { "field": "rating" },
      "boost_mode": "multiply"
    }
  },
  "_source": ["name"]
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 3 },
    "hits": [
      { "_id": "12", "_source": { "name": "L'Étoile du Nord" } }
    ]
  }
}
```

Without `function_score`, L'Étoile du Nord comes first too (shortest description);
its 4.9 rating widens the gap.
