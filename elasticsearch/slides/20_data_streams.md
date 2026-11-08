---
layout: cover
---

# 20 - Data streams

---

# Learning objectives

By the end of this sequence (**~45 min**, workshop included), you will be able to:

- **Explain** how a data stream writes and reads its backing indices
- **Manage** a retention with the data stream lifecycle, and **choose** it or ILM
- **Store** logs in LogsDB mode, and **read** a synthetic `_source`
- **Catch** rejected documents in the failure store
- **Model** metrics as a time series data stream, with downsampling

---

# One name, many indices

- A **data stream**: one name to write and read, over **hidden backing indices**
  - `.ds-<name>-<date>-<generation>`, created by **rollover**
- Only the **latest** backing index is written; **all** of them are searched
- **Append-only**: `create` only, an `@timestamp` on every document
- Made for time series: logs, events, metrics, traces

---

# Data streams: the structure

![](/images/data-streams-diagram.svg)

---

# Data streams: a search

![](/images/data-streams-search-request.svg)

- The search fans out to **every** backing index

---

# Data streams: an index request

![](/images/data-streams-index-request.svg)

- A new document always goes to the **write index** — the latest generation

---

# The naming convention

`<type>-<dataset>-<namespace>`: `logs-nginx.access-production`, `metrics-system.cpu-default`

- Built-in templates `logs-*-*`, `metrics-*-*`, `traces-*-*` (priority **100**), used by Elastic Agent

```json
GET /_index_template/logs
```

> Never shadow them with a `logs-*` template of your own: use `logs-myapp-*` with a priority **above 100**, or `composed_of` the built-in components.

---

# Data stream lifecycle: in the template

A simpler alternative to ILM: give **a retention**, Elasticsearch handles rollover and deletion.

```json
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

The first write **creates** the data stream:

```json
POST /logs-shop-default/_doc
{ "@timestamp": "2026-10-08T10:00:00Z", "message": "GET /home 200" }
```

---

# Data stream lifecycle: on a data stream

```json
PUT /_data_stream/logs-shop-default/_lifecycle
{ "data_retention": "30d" }
```

```json
GET /_data_stream/logs-shop-default/_lifecycle
```

```json
GET /_data_stream/logs-shop-default
```

- Applies at once, to **every** backing index of the data stream
- `GET /_data_stream/<name>`: the backing indices, the template, the lifecycle, the health

---

# ILM or data stream lifecycle?

| | ILM | Data stream lifecycle |
|---|---|---|
| Scope | Any index, data stream | Data streams only |
| Configuration | A policy with phases | `"lifecycle": { "data_retention": "30d" }` |
| Rollover | Conditions you choose | Automatic, managed by Elasticsearch |
| Tiers (warm, cold, frozen) | Yes | No |
| Actions | Shrink, force merge, searchable snapshot… | Force merge and downsampling only |

<br />

- **Lifecycle**: logs or metrics that only need a retention
- **ILM**: as soon as the data moves between tiers (chapter 19)

---

# LogsDB index mode

An index mode for logs: **~65 % less storage** than a standard index.

- documents **sorted** by `host.name`, then `@timestamp`: similar values side by side compress better
- **synthetic `_source`**: not stored, rebuilt from the doc values
- ZSTD compression, `ignore_malformed` and `ignore_above` on by default
- **On by default** for `logs-*-*` data streams since 9.0 (`cluster.logsdb.enabled`)

---

# Enable LogsDB

```json
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

A template change applies to the **next** backing index — roll over to use it now:

```json
POST /logs-shop-default/_rollover
```

---

# Synthetic `_source`: what changes

```json
POST /logs-shop-default/_doc?refresh=true
{ "@timestamp": "2026-10-08T10:01:00Z", "host.name": "web-1", "message": "GET /cart" }

POST /logs-shop-default/_search
{ "query": { "term": { "host.name": "web-1" } } }
```

```json
"_source": {
  "@timestamp": "2026-10-08T10:01:00.000Z",
  "host": { "name": "web-1" },
  "message": "GET /cart"
}
```

- **Equivalent**, not identical: dotted names become objects, arrays may be sorted, keys reordered
- A malformed value is kept, but not indexed: listed in `_ignored`

---

# Failure store

A document that cannot be indexed — mapping error, failing pipeline, missing `@timestamp` — is **not lost**: it goes to the **failure store**.

- On by default for `logs-*-*`; for your own templates:

```json
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

---

# Failure store: an existing data stream

A template applies to data streams created **after** it — switch an existing one on with its options:

```json
PUT /_data_stream/logs-shop-default/_options
{ "failure_store": { "enabled": true } }
```

```json
POST /logs-shop-default/_doc
{ "host.name": "web-2", "message": "no timestamp" }
```

- The response says `"failure_store": "used"`: the client gets a **success**
- Without the failure store, this document is **rejected**, and often lost by the shipper

---

# Read the failures

The `::failures` selector reads the failure store: the original document, the error, the pipeline.

```json
POST /logs-shop-default::failures/_refresh
```

```json
POST /logs-shop-default::failures/_search
{ "_source": ["error.type", "error.message", "document.source"] }
```

```json
POST /_query?format=txt
{ "query": "FROM logs-shop-default::failures | STATS failures = COUNT(*) BY error.type" }
```

- Fix the mapping or the pipeline, then **reindex** the failed documents into the data stream

---

# Time series data streams (TSDS)

An index mode for **metrics**: each document is a point of a time series.

- **dimensions** (`time_series_dimension`): what identifies the series — `host.name`, `pod`…
- **metrics** (`time_series_metric`): `gauge`, `counter`
- Sorted by series then time, synthetic `_source`: **up to 70 % less storage**
- Only accepts points within its time bounds (`index.look_back_time`, 2 h by default)

---

# A TSDS template

```json
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

# Downsampling and the `TS` command

- **Downsampling** replaces the raw points of an old backing index by one summary (min, max, sum, count, last) per series and interval
- Declared in the lifecycle (above), or as an ILM action

```json
PUT /_data_stream/metrics-shop-default
```

ES|QL reads time series with the `TS` source command:

```json
POST /_query?format=txt
{ "query": "TS metrics-shop-default | STATS max_cpu = MAX(cpu.pct) BY host.name" }
```

---

# Which one?

| Data | Index mode | Lifecycle |
|---|---|---|
| Logs, events | `logsdb` | Data stream lifecycle (a retention) or ILM (tiers) |
| Metrics | `time_series` | Data stream lifecycle + downsampling |
| Business documents (products, users…) | `standard` | None: an index + an alias |
| Reference data for `LOOKUP JOIN` | `lookup` | None |

---

# Quiz

**You change the `index.mode` of the template of an existing data stream. When is it used?**

- A) At once, for every backing index
- B) For the next backing index, after a rollover
- C) Never: the data stream must be recreated

<v-click>

**Answer: B** — a template is read when a backing index is created: roll over (or wait for the next rollover) to use the new settings.

</v-click>

---
layout: cover
---

# Workshop 16

## Modern data streams: LogsDB, lifecycle, failure store and TSDS
