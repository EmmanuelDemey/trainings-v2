# Workshop 4 — Search: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Part A — Step 1

```json
GET /restaurants/_search?q=pizza
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [{ "_id": "3" }, { "_id": "6" }]
  }
}
```

Without a field, `q` searches every field.

## Part A — Step 2

```json
GET /restaurants/_search?q=cuisine:french AND city:Paris
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [{ "_id": "4" }]
  }
}
```

`AND` must be uppercase: lowercase, it is a search term.

## Part A — Step 3

```json
GET /restaurants/_search?q=price:[* TO 20]
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [{ "_id": "6" }, { "_id": "8" }]
  }
}
```

Behind a user-facing search box, a syntax error is an error 400 (`q=price:[* TO` fails with a `search_phase_execution_exception`), and the user can reach any field, or write costly queries (leading wildcards). Expose `simple_query_string`, which never fails, or a `match`.

## Part B — Step 1

```json
GET /restaurants/_search
{
  "query": {
    "match": { "description": "pizza" }
  }
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [{ "_id": "3" }, { "_id": "6" }]
  }
}
```

The `english` analyzer stems « pizzas » to `pizza`: `GET /restaurants/_analyze` with `"field": "description", "text": "pizzas"` shows it.

## Part B — Step 2

```json
GET /restaurants/_search
{
  "query": {
    "match": {
      "description": { "query": "ramen broth", "operator": "and" }
    }
  }
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [{ "_id": "8" }]
  }
}
```

Without `operator`, Sakura (ramen, no broth) comes back too.

## Part B — Step 3

```json
GET /restaurants/_search
{
  "query": {
    "match_phrase": { "description": "fresh produce" }
  }
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [{ "_id": "7" }]
  }
}
```

A `match` would also find Le Vieux Port (« fresh fish »).

## Part B — Step 4

```json
GET /restaurants/_search
{
  "query": {
    "multi_match": {
      "query": "port",
      "fields": ["name^3", "description"]
    }
  }
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [{ "_id": "5" }]
  }
}
```

## Part B — Step 5

```json
GET /restaurants/_search
{
  "query": {
    "match": {
      "description": { "query": "sushsi", "fuzziness": "AUTO" }
    }
  }
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [{ "_id": "2" }]
  }
}
```

`AUTO` allows 2 edits for a 6-letter term: a transposition is one.

## Part C — Step 1

```json
GET /restaurants/_search
{
  "query": {
    "term": { "cuisine": "japanese" }
  }
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [{ "_id": "2" }, { "_id": "8" }]
  }
}
```

`{"term": {"description": "Pizzas"}}` finds nothing: `term` does not analyse its value, and the index holds `pizza`, lowercased and stemmed, not `Pizzas`.

## Part C — Step 2

```json
GET /restaurants/_search
{
  "query": {
    "terms": { "city": ["Lyon", "Marseille"] }
  }
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 3 },
    "hits": [{ "_id": "1" }, { "_id": "5" }, { "_id": "6" }]
  }
}
```

## Part C — Step 3

```json
GET /restaurants/_search
{
  "query": {
    "range": { "opened": { "gte": "2018-01-01" } }
  }
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 3 },
    "hits": [{ "_id": "2" }, { "_id": "6" }, { "_id": "8" }]
  }
}
```

## Part D — Step 1

```json
GET /restaurants/_search
{
  "query": {
    "geo_distance": {
      "distance": "2km",
      "location": { "lat": 48.8719, "lon": 2.3316 }
    }
  }
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [{ "_id": "2" }, { "_id": "8" }]
  }
}
```

## Part D — Step 2

```json
GET /restaurants/_search
{
  "query": { "term": { "city": "Paris" } },
  "sort": [
    {
      "_geo_distance": {
        "location": { "lat": 48.8719, "lon": 2.3316 },
        "order": "asc",
        "unit": "km"
      }
    }
  ]
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [
      { "_id": "2" },
      { "_id": "8" },
      { "_id": "3" },
      { "_id": "4" }
    ]
  }
}
```

Each hit's `sort` value is its distance, in km.

## Part D — Step 3

```json
GET /restaurants/_search
{
  "query": {
    "geo_bounding_box": {
      "location": {
        "top_left":     { "lat": 46.5, "lon": 3.5 },
        "bottom_right": { "lat": 43.0, "lon": 7.5 }
      }
    }
  }
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 3 },
    "hits": [{ "_id": "1" }, { "_id": "5" }, { "_id": "6" }]
  }
}
```

## Part E — Step 1

```json
GET /restaurants/_search
{
  "query": {
    "bool": {
      "must":     [ { "match": { "description": "cooking" } } ],
      "filter":   [
        { "terms": { "city": ["Paris", "Lyon"] } },
        { "range": { "price": { "lte": 40 } } }
      ],
      "should":   [ { "range": { "rating": { "gte": 4.5 } } } ],
      "must_not": [ { "term": { "cuisine": "italian" } } ]
    }
  }
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [{ "_id": "4" }, { "_id": "1" }]
  }
}
```

Chez Paul and Le Bouchon Lyonnais. With a `must`, the `should` only adds to the score: removing it keeps the same two hits, maybe in another order. City and price are yes/no conditions: in `filter` they do not score, and Elasticsearch can cache them.

## Part E — Step 2

```json
GET /restaurants/_search
{
  "query": { "match_all": {} },
  "sort": [ { "rating": "desc" } ],
  "from": 0,
  "size": 3,
  "_source": ["name", "rating"]
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [
      { "_id": "4", "_source": { "name": "Chez Paul", "rating": 4.7 } },
      { "_id": "1", "_source": { "name": "Le Bouchon Lyonnais", "rating": 4.5 } },
      { "_id": "5", "_source": { "name": "Le Vieux Port", "rating": 4.4 } }
    ]
  }
}
```

The next page: `"from": 3`.

## Part F — Step 1

```json
PUT /_cluster/settings
{
  "persistent": {
    "cluster.remote.guide.seeds": ["127.0.0.1:9300"]
  }
}
```

<!-- ci: retry -->
```json
GET /_remote/info
```

**Expected result**:

```json
{
  "guide": {
    "connected": true,
    "mode": "sniff"
  }
}
```

## Part F — Step 2

```json
GET /guide:restaurants/_search
{
  "query": { "term": { "city": "Lille" } }
}
```

**Expected result**:

```json
{
  "_clusters": { "total": 1, "successful": 1 },
  "hits": {
    "hits": [{ "_index": "guide:restaurants", "_id": "7" }]
  }
}
```

## Part F — Step 3

```json
GET /restaurants,guide:restaurants/_search
{
  "query": { "term": { "city": "Lille" } }
}
```

**Expected result**:

```json
{
  "_clusters": { "total": 2, "successful": 2 },
  "hits": { "total": { "value": 2 } }
}
```

When the remote cluster does not answer: with `cluster.remote.guide.skip_unavailable: true`
(the default since 8.15) the search succeeds with the local hits, and `_clusters` reports
it `skipped`; with `false` the whole search fails.

## Part F — Step 4

```json
PUT /_cluster/settings
{
  "persistent": {
    "cluster.remote.guide.seeds": null
  }
}
```
