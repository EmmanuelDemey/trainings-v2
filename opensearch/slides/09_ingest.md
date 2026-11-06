---
layout: cover
---

# 9 - Ingest pipelines

---

# Learning objectives

By the end of this sequence (**~30 min**, workshop included), you will be able to:

- **Explain** where an ingest pipeline runs, and when to use one
- **Chain** processors: `grok`, `date`, `set`, `rename`, `remove`, `convert`
- **Test** a pipeline with `_simulate`, without indexing anything
- **Handle** errors, and **attach** the pipeline to an index

---

# Transform before indexing

```text
 application ──► ingest node ──► [ grok → date → set → remove ] ──► primary shard
                                       ingest pipeline
```

- A sequence of **processors** that modify the document **before** indexing
- Run by the nodes with the `ingest` role — all of them, by default
- To: extract fields from a log line, normalize, enrich, clean up

| Where to transform? | When |
|---|---|
| **Ingest pipeline** | Simple transformations, as close to the cluster as possible |
| **Data Prepper**, Logstash, Fluent Bit | Large volumes, multiple sources, buffering, routing |
| **The application** | Business logic |

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

# Test: `_simulate`

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
- Without a stored pipeline: `POST /_ingest/pipeline/_simulate` with `"pipeline": { … }`

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

Every processor accepts an `if` (Painless) and an `on_failure`:

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

- Without `on_failure`, an error **rejects** the document
- With it, the document is indexed **flagged**: you can find it and fix it

---

# Attach the pipeline

On a single request:

```json
PUT /prices/_doc/1?pipeline=price-range
{ "name": "Chez Paul", "price": 15 }
```

Or by default, for **every** write to an index:

```json
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
layout: cover
---

# Workshop 7

## Ingest pipelines
