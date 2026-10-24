# Workshop 14 — Modern data streams: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result » — once the workshop is turned on (its folder loses its
leading `_`).

## Step 1

```json
GET /_index_template/logs
```

**Expected result**:

```json
{
  "index_templates": [
    {
      "name": "logs",
      "index_template": {
        "index_patterns": ["logs-*-*"],
        "priority": 100,
        "data_stream": {}
      }
    }
  ]
}
```

A template on `logs-*` with a higher priority would replace the built-in one
for every source of logs — Elastic Agent integrations included — and lose
their mappings and settings.

## Step 2

```json
PUT /_index_template/logs-shop-template
{
  "index_patterns": ["logs-shop-*"],
  "data_stream": {},
  "priority": 200,
  "template": {
    "settings": {
      "index.mode": "logsdb",
      "number_of_replicas": 0
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "host.name": { "type": "keyword" },
        "message": { "type": "match_only_text" },
        "http.status": { "type": "integer" }
      }
    },
    "lifecycle": { "data_retention": "7d" },
    "data_stream_options": {
      "failure_store": { "enabled": true }
    }
  }
}
```

**Expected result**:

```json
{ "acknowledged": true }
```

LogsDB sorts the documents by `host.name` then `@timestamp`, does not store the
`_source` (it is rebuilt — synthetic), and compresses with ZSTD: about 65% less
storage. It is the default for `logs-*-*` since 9.0.

## Step 3

```json
POST /logs-shop-production/_bulk?refresh=true
{"create":{}}
{"@timestamp":"2026-10-08T10:00:00Z","host.name":"web-1","message":"GET /home 200","http.status":200}
{"create":{}}
{"@timestamp":"2026-10-08T10:01:00Z","host.name":"web-2","message":"POST /cart 500","http.status":500}
{"create":{}}
{"@timestamp":"2026-10-08T10:02:00Z","host.name":"web-1","message":"GET /product/42 200","http.status":200}
```

```json
GET /_data_stream/logs-shop-production
```

**Expected result**:

```json
{
  "data_streams": [
    {
      "name": "logs-shop-production",
      "template": "logs-shop-template",
      "index_mode": "logsdb",
      "lifecycle": { "enabled": true, "data_retention": "7d" },
      "failure_store": { "enabled": true }
    }
  ]
}
```

## Step 4

```json
POST /logs-shop-production/_doc?refresh=true
{ "@timestamp": "2026-10-08T10:03:00Z", "host.name": "web-3", "message": "GET /status", "http.status": "oops" }
```

```json
POST /logs-shop-production/_search
{
  "query": { "term": { "host.name": "web-3" } }
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [
      {
        "_ignored": ["http.status"],
        "_source": {
          "host": { "name": "web-3" },
          "http": { "status": "oops" }
        }
      }
    ]
  }
}
```

The `_source` is rebuilt from the doc values: equivalent, not identical — dotted
names come back as objects. LogsDB turns `ignore_malformed` on: the value is
kept, not indexed, and listed in `_ignored`.

## Step 5

```json
GET /_data_stream/logs-shop-production/_lifecycle
```

```json
PUT /_data_stream/logs-shop-production/_lifecycle
{ "data_retention": "30d" }
```

**Expected result**:

```json
{ "acknowledged": true }
```

```json
GET /logs-shop-production/_lifecycle/explain
```

The lifecycle only knows a retention, and maybe a downsampling: no hot/warm/cold
tiers, no searchable snapshots. ILM remains the tool for a multi-tier
architecture. The next `logs-shop-*` data streams take the retention of the
template: 7 days.

## Step 6

```json
POST /logs-shop-production/_doc
{ "host.name": "web-2", "message": "log without a timestamp" }
```

**Expected result**:

```json
{
  "result": "created",
  "failure_store": "used"
}
```

Without a failure store, a `400` (`document_parsing_exception`) — that a
shipper often only logs — and the document is lost.

## Step 7

```json
POST /logs-shop-production::failures/_refresh
```

```json
POST /logs-shop-production::failures/_search
{
  "_source": ["error.type", "error.message", "document.source"]
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [
      {
        "_source": {
          "error": { "type": "document_parsing_exception" },
          "document": { "source": { "host.name": "web-2" } }
        }
      }
    ]
  }
}
```

```json
POST /_query?format=json
{
  "query": """
    FROM logs-shop-production::failures
    | STATS failures = COUNT(*) BY error.type
  """
}
```

**Expected result**:

```json
{
  "values": [[1, "document_parsing_exception"]]
}
```

## Step 8

```json
PUT /_ingest/pipeline/metrics-shop-timestamp
{
  "processors": [
    { "set": { "field": "@timestamp", "value": "{{{_ingest.timestamp}}}", "override": false } }
  ]
}
```

**Expected result**:

```json
{ "acknowledged": true }
```

## Step 9

```json
PUT /_index_template/metrics-shop-template
{
  "index_patterns": ["metrics-shop-*"],
  "data_stream": {},
  "priority": 200,
  "template": {
    "settings": {
      "index.mode": "time_series",
      "index.default_pipeline": "metrics-shop-timestamp",
      "number_of_replicas": 0
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "host.name": { "type": "keyword", "time_series_dimension": true },
        "cpu.pct": { "type": "double", "time_series_metric": "gauge" },
        "http.requests": { "type": "long", "time_series_metric": "counter" }
      }
    },
    "lifecycle": {
      "data_retention": "90d",
      "downsampling": [
        { "after": "1d", "fixed_interval": "1h" },
        { "after": "7d", "fixed_interval": "1d" }
      ]
    }
  }
}
```

**Expected result**:

```json
{ "acknowledged": true }
```

## Step 10

```json
POST /metrics-shop-production/_bulk?refresh=true
{"create":{}}
{"host.name":"web-1","cpu.pct":0.42,"http.requests":1000}
{"create":{}}
{"host.name":"web-2","cpu.pct":0.87,"http.requests":2500}
```

```json
GET /_data_stream/metrics-shop-production
```

**Expected result**:

```json
{
  "data_streams": [
    { "name": "metrics-shop-production", "index_mode": "time_series" }
  ]
}
```

`time_series.temporal_ranges`: the time range the current backing index
accepts.

## Step 11

```json
POST /_query?format=json
{
  "query": """
    TS metrics-shop-production
    | STATS max_cpu = MAX(cpu.pct) BY host.name
    | SORT host.name
  """
}
```

**Expected result**:

```json
{
  "values": [
    [0.42, "web-1"],
    [0.87, "web-2"]
  ]
}
```

A point 3 days old is out of the bounds of the TSDS: rejected with a
`timestamp_error`. The response says `"failure_store": "not_enabled"`: enable
the failure store in this template too to keep it.

For an existing data stream, the failure store is enabled with:

<!-- ci: skip -->
```json
PUT /_data_stream/logs-shop-production/_options
{ "failure_store": { "enabled": true } }
```
