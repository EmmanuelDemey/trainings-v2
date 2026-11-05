# Workshop 7 — Ingest pipelines: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the workshop README, and checks each « Expected result ».

## Step 1

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      { "csv": { "field": "message", "target_fields": ["restaurant_id", "author", "stars", "date", "comment"] } }
    ]
  },
  "docs": [
    { "_source": { "message": "3,Camille,5,12/10/2026,\"Perfect fish, quick service\"" } }
  ]
}
```

**Expected result**:

```json
{
  "docs": [
    {
      "doc": {
        "_source": {
          "restaurant_id": "3",
          "author": "Camille",
          "stars": "5",
          "date": "12/10/2026",
          "comment": "Perfect fish, quick service"
        }
      }
    }
  ]
}
```

The mapping converts `"5"` at indexing time, but **after** the pipeline: inside the
pipeline, `ctx.stars >= 4` would compare a string to a number and fail.

## Step 2

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      { "csv": { "field": "message", "target_fields": ["restaurant_id", "author", "stars", "date", "comment"] } },
      { "convert": { "field": "stars", "type": "integer" } },
      { "date": { "field": "date", "formats": ["dd/MM/yyyy"], "timezone": "Europe/Paris", "target_field": "@timestamp" } },
      { "remove": { "field": ["message", "date"] } }
    ]
  },
  "docs": [
    { "_source": { "message": "3,Camille,5,12/10/2026,\"Perfect fish, quick service\"" } }
  ]
}
```

**Expected result**:

```json
{
  "docs": [
    { "doc": { "_source": { "stars": 5, "@timestamp": "2026-10-12T00:00:00.000+02:00" } } }
  ]
}
```

## Step 3

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      { "csv": { "field": "message", "target_fields": ["restaurant_id", "author", "stars", "date", "comment"] } },
      { "convert": { "field": "stars", "type": "integer" } },
      { "date": { "field": "date", "formats": ["dd/MM/yyyy"], "timezone": "Europe/Paris", "target_field": "@timestamp" } },
      { "remove": { "field": ["message", "date"] } },
      { "set": { "field": "sentiment", "value": "positive", "if": "ctx.stars >= 4" } },
      { "set": { "field": "sentiment", "value": "negative", "if": "ctx.stars <= 2" } }
    ]
  },
  "docs": [
    { "_source": { "message": "3,Camille,5,12/10/2026,\"Perfect fish, quick service\"" } },
    { "_source": { "message": "6,Hugo,2,13/10/2026,Cold fries" } }
  ]
}
```

**Expected result**:

```json
{
  "docs": [
    { "doc": { "_source": { "stars": 5, "sentiment": "positive" } } },
    { "doc": { "_source": { "stars": 2, "sentiment": "negative" } } }
  ]
}
```

## Step 4

```json
PUT /_ingest/pipeline/reviews
{
  "description": "Structures the CSV reviews",
  "processors": [
    { "csv": { "field": "message", "target_fields": ["restaurant_id", "author", "stars", "date", "comment"] } },
    { "convert": { "field": "stars", "type": "integer" } },
    { "date": { "field": "date", "formats": ["dd/MM/yyyy"], "timezone": "Europe/Paris", "target_field": "@timestamp" } },
    { "remove": { "field": ["message", "date"] } },
    { "set": { "field": "sentiment", "value": "positive", "if": "ctx.stars >= 4" } },
    { "set": { "field": "sentiment", "value": "negative", "if": "ctx.stars <= 2" } }
  ],
  "on_failure": [
    { "set": { "field": "error", "value": "{{ _ingest.on_failure_message }}" } }
  ]
}
```

**Expected result**:

```json
{ "acknowledged": true }
```

## Step 5

```json
PUT /reviews/_settings
{ "index.default_pipeline": "reviews" }

POST /reviews/_bulk?refresh=true
{ "index": { "_id": "1" } }
{ "message": "3,Camille,5,12/10/2026,\"Perfect fish, quick service\"" }
{ "index": { "_id": "2" } }
{ "message": "6,Hugo,2,13/10/2026,Cold fries" }
{ "index": { "_id": "3" } }
{ "message": "12,Inès,4,14/10/2026,Memorable tasting menu" }
{ "index": { "_id": "4" } }
{ "message": "broken line" }

GET /reviews/_doc/1
```

**Expected result**:

```json
{
  "_id": "1",
  "_source": {
    "restaurant_id": "3",
    "author": "Camille",
    "stars": 5,
    "sentiment": "positive",
    "@timestamp": "2026-10-12T00:00:00.000+02:00"
  }
}
```

```json
GET /reviews/_count
{ "query": { "term": { "sentiment": "positive" } } }
```

**Expected result**:

```json
{ "count": 2 }
```

```json
GET /reviews/_count
{ "query": { "exists": { "field": "error" } } }
```

**Expected result**:

```json
{ "count": 1 }
```
