---
layout: cover
---

# 14 - Ingest pipelines

---

# Learning objectives

By the end of this sequence (**~45 min**, workshop included), you will be able to:

- **Explain** where an ingest pipeline runs, and when to use one
- **Chain** processors: `grok`, `date`, `set`, `rename`, `remove`, `convert`
- **Test** a pipeline with `_simulate`, without indexing anything
- **Handle** errors with `if` and `on_failure`
- **Attach** a pipeline to a request, an index, a template or a `_reindex`

---

# Transform before indexing

```text
 application ──► ingest node ──► [ grok → date → set → remove ] ──► primary shard
                                       ingest pipeline
```

- A sequence of **processors** that modify the document **before** it is indexed
- To extract fields from a log line, normalize, enrich, clean up
- Run by the nodes with the `ingest` role — all of them, by default. To keep a node out:

```yaml
node.roles: [ master, data ]   # no "ingest"
```

---

# Where to transform?

| Where | When |
|---|---|
| **Ingest pipeline** | Simple transformations, as close to the cluster as possible |
| **Elastic Agent** integrations | Ready-made pipelines for known sources (nginx, system…) |
| **Logstash** | Large volumes, multiple sources and outputs, buffering |
| **The application** | Business logic |

- An integration installs its own pipelines: look at them before writing yours

---

# Create a pipeline

```json
PUT /_ingest/pipeline/restaurants-clean
{
  "description": "Normalizes the restaurants before indexing",
  "processors": [
    { "trim":      { "field": "name" } },
    { "uppercase": { "field": "city_code" } },
    { "convert":   { "field": "price", "type": "integer" } },
    { "set":       { "field": "indexed_at", "value": "{{_ingest.timestamp}}" } },
    { "remove":    { "field": "internal_note", "ignore_missing": true } }
  ]
}
```

- The processors run **in order**
- `{{…}}`: a Mustache template — another field, or `_ingest` metadata

---

# Test it: `_simulate`

```json
POST /_ingest/pipeline/restaurants-clean/_simulate
{
  "docs": [
    { "_source": { "name": "  Chez Paul ", "city_code": "lyo", "price": "27", "internal_note": "to review" } }
  ]
}
```

**Expected result**:

```json
{
  "docs": [
    { "doc": { "_source": { "name": "Chez Paul", "city_code": "LYO", "price": 27 } } }
  ]
}
```

- `?verbose=true`: the state of the document **after each** processor
- Nothing is indexed: test with realistic samples, and their variations

---

# Useful processors

| Processor | Effect |
|---|---|
| `set`, `remove`, `rename`, `copy` | Write, remove, rename a field |
| `convert`, `lowercase`, `uppercase`, `trim` | Cast, normalize |
| `grok`, `dissect` | Extract fields from a text (named regexes / delimiters) |
| `date` | Parse a date in a given format → `@timestamp` |
| `split`, `join`, `csv`, `json`, `kv` | Split or parse structured text |
| `geoip`, `user_agent` | Enrich an IP address, a browser |
| `enrich` | Add fields from another index (an enrich policy) |
| `script` | Painless, when nothing else will do |
| `pipeline` | Call another pipeline |
| `drop`, `fail` | Drop the document, or reject it |

---

# Parse a log line: `grok` and `date`

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      { "grok": { "field": "message", "patterns": ["%{IP:client_ip} %{WORD:method} %{URIPATHPARAM:path} %{NUMBER:status:int}"] } },
      { "date": { "field": "ts", "formats": ["dd/MM/yyyy HH:mm:ss"], "target_field": "@timestamp" } },
      { "remove": { "field": ["ts", "message"] } }
    ]
  },
  "docs": [ { "_source": { "message": "203.0.113.5 GET /menu 200", "ts": "27/10/2026 12:30:00" } } ]
}
```

**Expected result**:

```json
{
  "docs": [
    { "doc": { "_source": { "client_ip": "203.0.113.5", "method": "GET", "path": "/menu", "status": 200, "@timestamp": "2026-10-27T12:30:00.000Z" } } }
  ]
}
```

---

# Conditions and errors

```json
PUT /_ingest/pipeline/price-range
{
  "processors": [
    { "set": { "field": "range", "value": "budget", "if": "ctx.price != null && ctx.price < 20" } },
    { "set": { "field": "range", "value": "premium", "if": "ctx.price != null && ctx.price >= 50" } },
    { "convert": { "field": "rating", "type": "float", "ignore_missing": true } }
  ],
  "on_failure": [
    { "set": { "field": "ingest_error", "value": "{{ _ingest.on_failure_message }}" } }
  ]
}
```

- Every processor accepts an `if` (Painless) and its own `on_failure`
- Without `on_failure`, an error **rejects** the document
- With it, the document is indexed **flagged**: you can find it, and fix it

---

# Attach it to a request, or an index

```json
PUT /prices/_doc/1?pipeline=price-range
{ "name": "Chez Paul", "price": 15 }

PUT /prices/_settings
{ "index.default_pipeline": "price-range" }

PUT /prices/_doc/2
{ "name": "L'Étoile du Nord", "price": 125, "rating": "4.9" }

GET /prices/_doc/2
```

**Expected result**:

```json
{ "_source": { "range": "premium", "rating": 4.9 } }
```

- `index.final_pipeline`: runs **afterwards**, always — even when the request names another pipeline

---

# Attach it to a template, or a `_reindex`

```json
PUT /_index_template/my_template
{
  "index_patterns": ["my-app-*"],
  "template": {
    "settings": { "index.default_pipeline": "my_ingest_pipeline" }
  }
}

POST /_reindex
{
  "source": { "index": "existing-index" },
  "dest": { "index": "new-index", "pipeline": "my_ingest_pipeline" }
}
```

- Template: every new `my-app-*` index gets the pipeline
- `_reindex`: fix the documents already indexed, with the new pipeline

---

# Best practices

- Start simple, add processors one at a time — `_simulate` after each one
- Prefer `dissect` to `grok` when the format is fixed: faster, simpler
- Always an `on_failure`: a flagged document is better than a lost one
- Watch the pipelines: `GET /_nodes/stats/ingest` — count, time, failures per processor
- Version the pipelines with the code (`version`, `_meta`)

---

# Quiz

**A processor of a pipeline with no `on_failure` fails on a document. What happens?**

- A) The document is indexed without the field
- B) The processor is skipped, the next ones run
- C) The document is rejected: the indexing request returns an error
- D) The pipeline is disabled

<v-click>

**Answer: C** — add an `on_failure` (or `ignore_failure` on the processor) to index the document flagged instead.

</v-click>

---
layout: cover
---

# Workshop 9

## Ingest pipelines
