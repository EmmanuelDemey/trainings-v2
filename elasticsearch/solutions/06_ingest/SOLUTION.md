# Workshop 6 — Ingest pipelines: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Step 1

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      { "grok": { "field": "message", "patterns": ["%{IP:client.ip} %{WORD:http.method} %{URIPATHPARAM:url.path} %{NUMBER:http.status:int} %{NUMBER:duration_ms:int}"] } }
    ]
  },
  "docs": [
    { "_source": { "message": "203.0.113.50 GET /products/42 200 35", "timestamp": "01/10/2026 08:00:00" } }
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
          "client": { "ip": "203.0.113.50" },
          "http": { "method": "GET", "status": 200 },
          "url": { "path": "/products/42" },
          "duration_ms": 35
        }
      }
    }
  ]
}
```

With a mapping, `"200"` would be converted to an integer at index time anyway.
Without one, the dynamic mapping would make `http.status` a `text` with a
`keyword`: a `range` would compare strings, and `"500" < "60"`.

## Step 2

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      { "grok": { "field": "message", "patterns": ["%{IP:client.ip} %{WORD:http.method} %{URIPATHPARAM:url.path} %{NUMBER:http.status:int} %{NUMBER:duration_ms:int}"] } },
      { "date": { "field": "timestamp", "formats": ["dd/MM/yyyy HH:mm:ss"], "target_field": "@timestamp" } },
      { "remove": { "field": "timestamp" } }
    ]
  },
  "docs": [
    { "_source": { "message": "203.0.113.50 GET /products/42 200 35", "timestamp": "01/10/2026 08:00:00" } }
  ]
}
```

**Expected result**:

```json
{
  "docs": [
    { "doc": { "_source": { "@timestamp": "2026-10-01T08:00:00.000Z" } } }
  ]
}
```

No `timezone`: the date is read as UTC.

## Step 3

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      { "grok": { "field": "message", "patterns": ["%{IP:client.ip} %{WORD:http.method} %{URIPATHPARAM:url.path} %{NUMBER:http.status:int} %{NUMBER:duration_ms:int}"] } },
      { "date": { "field": "timestamp", "formats": ["dd/MM/yyyy HH:mm:ss"], "target_field": "@timestamp" } },
      { "remove": { "field": "timestamp" } },
      { "set": { "if": "ctx.http.status >= 400", "field": "event.outcome", "value": "failure" } },
      { "set": { "if": "ctx.http.status < 400", "field": "event.outcome", "value": "success" } }
    ]
  },
  "docs": [
    { "_source": { "message": "203.0.113.50 GET /products/42 200 35", "timestamp": "01/10/2026 08:00:00" } },
    { "_source": { "message": "198.51.100.23 POST /cart 500 812", "timestamp": "01/10/2026 08:00:05" } }
  ]
}
```

**Expected result**:

```json
{
  "docs": [
    { "doc": { "_source": { "http": { "status": 200 }, "event": { "outcome": "success" } } } },
    { "doc": { "_source": { "http": { "status": 500 }, "event": { "outcome": "failure" } } } }
  ]
}
```

## Step 4

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      { "grok": { "field": "message", "patterns": ["%{IP:client.ip} %{WORD:http.method} %{URIPATHPARAM:url.path} %{NUMBER:http.status:int} %{NUMBER:duration_ms:int}"] } },
      { "date": { "field": "timestamp", "formats": ["dd/MM/yyyy HH:mm:ss"], "target_field": "@timestamp" } },
      { "remove": { "field": "timestamp" } },
      { "set": { "if": "ctx.http.status >= 400", "field": "event.outcome", "value": "failure" } },
      { "set": { "if": "ctx.http.status < 400", "field": "event.outcome", "value": "success" } }
    ],
    "on_failure": [
      { "set": { "field": "event.kind", "value": "pipeline_error" } },
      { "set": { "field": "error.message", "value": "{{ _ingest.on_failure_message }}" } }
    ]
  },
  "docs": [
    { "_source": { "message": "not an access log line", "timestamp": "01/10/2026 08:00:12" } }
  ]
}
```

**Expected result**:

```json
{
  "docs": [
    { "doc": { "_source": { "message": "not an access log line", "event": { "kind": "pipeline_error" } } } }
  ]
}
```

No: the pipeline stops at the processor that failed, then runs its
`on_failure`. `timestamp` is still there, `@timestamp` is not.

## Step 5

```json
PUT /_ingest/pipeline/weblogs
{
  "description": "Parses the access logs of the web server",
  "processors": [
    { "grok": { "field": "message", "patterns": ["%{IP:client.ip} %{WORD:http.method} %{URIPATHPARAM:url.path} %{NUMBER:http.status:int} %{NUMBER:duration_ms:int}"] } },
    { "date": { "field": "timestamp", "formats": ["dd/MM/yyyy HH:mm:ss"], "target_field": "@timestamp" } },
    { "remove": { "field": "timestamp" } },
    { "set": { "if": "ctx.http.status >= 400", "field": "event.outcome", "value": "failure" } },
    { "set": { "if": "ctx.http.status < 400", "field": "event.outcome", "value": "success" } }
  ],
  "on_failure": [
    { "set": { "field": "event.kind", "value": "pipeline_error" } },
    { "set": { "field": "error.message", "value": "{{ _ingest.on_failure_message }}" } }
  ]
}

PUT /weblogs/_doc/1?pipeline=weblogs
{ "message": "203.0.113.50 GET /products/42 200 35", "timestamp": "01/10/2026 08:00:00" }

GET /weblogs/_doc/1
```

**Expected result**:

```json
{
  "_id": "1",
  "_source": {
    "@timestamp": "2026-10-01T08:00:00.000Z",
    "client": { "ip": "203.0.113.50" },
    "event": { "outcome": "success" }
  }
}
```

## Step 6

```json
PUT /weblogs/_settings
{
  "index.default_pipeline": "weblogs"
}

POST /weblogs/_bulk?refresh=true
{"index":{"_id":"2"}}
{"message":"198.51.100.23 POST /cart 500 812","timestamp":"01/10/2026 08:00:05"}
{"index":{"_id":"3"}}
{"message":"203.0.113.50 GET /admin 403 4","timestamp":"01/10/2026 08:00:09"}
{"index":{"_id":"4"}}
{"message":"not an access log line","timestamp":"01/10/2026 08:00:12"}

GET /weblogs/_count
{
  "query": { "term": { "event.outcome": "failure" } }
}
```

**Expected result**:

```json
{
  "count": 2
}
```

```json
GET /weblogs/_count
{
  "query": { "term": { "event.kind": "pipeline_error" } }
}
```

**Expected result**:

```json
{
  "count": 1
}
```

The node stats give, per pipeline and per processor, the documents processed,
the time spent and the failures — here, one failure on `grok`.
