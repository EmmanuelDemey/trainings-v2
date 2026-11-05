# Workshop 5 — Aggregations: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the workshop README, and checks each « Expected result ».

## Step 1

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": { "ratings": { "stats": { "field": "rating" } } }
}
```

**Expected result**:

```json
{ "aggregations": { "ratings": { "count": 12 } } }
```

`rating` is a `float` (single precision): 4.2 cannot be represented exactly,
and the aggregation computes in `double` over these approximated values.

## Step 2

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": { "cuisines": { "cardinality": { "field": "cuisine" } } }
}
```

**Expected result**:

```json
{ "aggregations": { "cuisines": { "value": 8 } } }
```

## Step 3

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "by_city": {
      "terms": { "field": "city" },
      "aggs": { "avg_price": { "avg": { "field": "price" } } }
    }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "by_city": {
      "buckets": [
        { "key": "Paris", "doc_count": 5, "avg_price": { "value": 45.2 } },
        { "key": "Lyon", "doc_count": 4, "avg_price": { "value": 21.75 } },
        { "key": "Marseille", "doc_count": 3, "avg_price": { "value": 31.666666666666668 } }
      ]
    }
  }
}
```

The average of Paris is pulled up by L'Étoile du Nord (€125): the median
(`percentiles`, 50) is much lower.

```json
GET /restaurants/_search
{
  "size": 0,
  "query": { "term": { "city": "Paris" } },
  "aggs": { "price": { "percentiles": { "field": "price", "percents": [50] } } }
}
```

## Step 4

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "by_cuisine": {
      "terms": { "field": "cuisine", "order": { "avg_rating": "desc" } },
      "aggs": { "avg_rating": { "avg": { "field": "rating" } } }
    }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "by_cuisine": {
      "buckets": [
        { "key": "fine dining" },
        { "key": "seafood" }
      ]
    }
  }
}
```

## Step 5

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          { "key": "budget", "to": 20 },
          { "key": "mid-range", "from": 20, "to": 50 },
          { "key": "high-end", "from": 50 }
        ]
      }
    }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "price_ranges": {
      "buckets": [
        { "key": "budget", "doc_count": 4 },
        { "key": "mid-range", "doc_count": 6 },
        { "key": "high-end", "doc_count": 2 }
      ]
    }
  }
}
```

## Step 6

```json
GET /restaurants/_search
{
  "size": 0,
  "query": { "term": { "city": "Paris" } },
  "aggs": {
    "openings": {
      "date_histogram": { "field": "opened", "calendar_interval": "year", "format": "yyyy", "min_doc_count": 1 }
    }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "openings": {
      "buckets": [
        { "key_as_string": "2011", "doc_count": 1 },
        { "key_as_string": "2014", "doc_count": 1 },
        { "key_as_string": "2018", "doc_count": 1 },
        { "key_as_string": "2020", "doc_count": 1 },
        { "key_as_string": "2021", "doc_count": 1 }
      ]
    }
  }
}
```

## Step 7

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "by_city": {
      "terms": { "field": "city" },
      "aggs": { "avg_price": { "avg": { "field": "price" } } }
    },
    "most_expensive_city": {
      "max_bucket": { "buckets_path": "by_city>avg_price" }
    }
  }
}
```

**Expected result**:

```json
{ "aggregations": { "most_expensive_city": { "keys": ["Paris"], "value": 45.2 } } }
```
