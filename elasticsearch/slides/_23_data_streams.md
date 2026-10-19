---
layout: cover
---

# Modern Data Streams

---

# Data streams, the default for time series

* One name to write and read, hidden backing indices (`.ds-<name>-<date>-<generation>`), rollover built in
* Append-only: `create` only, an `@timestamp` on every document
* Naming convention `<type>-<dataset>-<namespace>`: `logs-nginx.access-production`, `metrics-system.cpu-default`
* Built-in templates: `logs-*-*`, `metrics-*-*`, `traces-*-*` (priority 100) — used by Elastic Agent
    * Never shadow them with a `logs-*` template of your own: use `logs-myapp-*`, or a higher-priority template that `composed_of` the built-in components

```
GET /_index_template/logs
```

---

# Data stream lifecycle (DSL)

* A simpler alternative to ILM: **a retention**, and Elasticsearch handles rollover and deletion
* Declared in the template, or on an existing data stream

```
PUT /_index_template/logs-shop-template
{
  "index_patterns": ["logs-shop-*"],
  "data_stream": {},
  "priority": 200,
  "template": {
    "lifecycle": { "data_retention": "7d" }
  }
}
```

```
POST /logs-shop-default/_doc
{ "@timestamp": "2026-10-08T10:00:00Z", "message": "GET /home 200" }
```

```
PUT /_data_stream/logs-shop-default/_lifecycle
{ "data_retention": "30d" }
```

```
GET /_data_stream/logs-shop-default/_lifecycle
```

* ILM is still the tool for **tiers** (hot/warm/cold/frozen), searchable snapshots, shrink

---

# LogsDB index mode

* An index mode for logs: **~65% less storage** than a standard index
    * documents **sorted** by `host.name`, then `@timestamp`: similar values side by side compress better
    * **synthetic `_source`**: the source is not stored, it is rebuilt from the doc values
    * ZSTD compression, `ignore_malformed` and `ignore_above` on by default
* **On by default** for `logs-*-*` data streams since 9.0 (`cluster.logsdb.enabled`)

```
PUT /_index_template/logs-shop-template
{
  "index_patterns": ["logs-shop-*"],
  "data_stream": {},
  "priority": 200,
  "template": {
    "settings": { "index.mode": "logsdb" },
    "lifecycle": { "data_retention": "7d" }
  }
}
```

---

# Synthetic _source: what changes

```
POST /logs-shop-default/_doc?refresh=true
{ "@timestamp": "2026-10-08T10:01:00Z", "host.name": "web-1", "message": "GET /cart", "http.status": "oops" }
```

```
POST /logs-shop-default/_search
{ "query": { "term": { "host.name": "web-1" } } }
```

```json
"_ignored": ["http.status"],
"_source": {
  "@timestamp": "2026-10-08T10:01:00.000Z",
  "host": { "name": "web-1" },
  "http": { "status": "oops" },
  "message": "GET /cart"
}
```

* The `_source` you get back is **equivalent**, not identical: dotted names become objects, arrays may be sorted, keys reordered
* A malformed value is kept, but not indexed (`_ignored`)

---

# Failure store

* A document that cannot be indexed (mapping error, failing ingest pipeline, missing `@timestamp`) is **not lost**: it goes to the data stream's **failure store**
* On by default for `logs-*-*`; for your own templates:

```
PUT /_index_template/logs-shop-template
{
  "index_patterns": ["logs-shop-*"],
  "data_stream": {},
  "priority": 200,
  "template": {
    "settings": { "index.mode": "logsdb" },
    "lifecycle": { "data_retention": "7d" },
    "data_stream_options": { "failure_store": { "enabled": true } }
  }
}
```

* The template only applies to data streams created **after** it: switch an existing one on with its options

```
PUT /_data_stream/logs-shop-default/_options
{ "failure_store": { "enabled": true } }
```

```
POST /logs-shop-default/_doc
{ "host.name": "web-2", "message": "no timestamp" }
```

* The response says `"failure_store": "used"` — the client gets a success

---

# Reading the failures

* The `::failures` selector reads the failure store: the original document, the error, the pipeline

```
POST /logs-shop-default::failures/_refresh
```

```
POST /logs-shop-default::failures/_search
{ "_source": ["error.type", "error.message", "document.source"] }
```

```
POST /_query?format=txt
{ "query": "FROM logs-shop-default::failures | STATS failures = COUNT(*) BY error.type" }
```

* Fix the mapping or the pipeline, then reindex the failed documents back into the data stream

---

# Time series data streams (TSDS)

* An index mode for **metrics**: each document is a point of a time series
    * **dimensions** (`time_series_dimension`): what identifies the series (`host.name`, `pod`…)
    * **metrics** (`time_series_metric`): `gauge`, `counter`
* Sorted by series then time, synthetic `_source`: **up to 70% less storage**
* Only accepts points within its time bounds (`index.look_back_time`, 2 h by default)

```
PUT /_index_template/metrics-shop-template
{
  "index_patterns": ["metrics-shop-*"],
  "data_stream": {},
  "priority": 200,
  "template": {
    "settings": { "index.mode": "time_series", "index.routing_path": ["host.name"] },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "host.name": { "type": "keyword", "time_series_dimension": true },
        "cpu.pct": { "type": "double", "time_series_metric": "gauge" },
        "requests": { "type": "long", "time_series_metric": "counter" }
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

---

# Downsampling, and the TS command

* **Downsampling** replaces the raw points of an old backing index with one summary (min, max, sum, count, last) per series and interval
* Declared in the lifecycle (DSL) above, or as an ILM action
* ES|QL reads time series with the `TS` source command

```
PUT /_data_stream/metrics-shop-default
```

```
POST /_query?format=txt
{ "query": "TS metrics-shop-default | STATS max_cpu = MAX(cpu.pct) BY host.name" }
```

---

# Which one?

| Data | Index mode | Lifecycle |
|------|-----------|-----------|
| Logs, events | `logsdb` | DSL (a retention) or ILM (tiers) |
| Metrics | `time_series` | DSL + downsampling |
| Business documents (products, users…) | `standard` | None: an index + an alias |
| Reference data for `LOOKUP JOIN` | `lookup` | None |
