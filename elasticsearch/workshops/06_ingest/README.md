# Workshop 6 — Ingest pipelines

> Parse raw access logs before they are indexed: extract their fields with `grok`, turn their date into a real one, classify them, and keep the lines that do not parse instead of losing them.

**Topic**: Indexing — Ingest pipelines

## Context

A web server sends its access logs as raw lines. Searched as they are, they are useless: no way to filter on a status, nor on a client IP. You write the ingest pipeline that turns each line into structured fields, test it without indexing anything, then plug it into the index.

Each step states **what** to do, not **how**: find the processor in the documentation, try it, read the response, adjust. The expected result lets you check your own answer. Hints are folded — open them only once you are stuck.

## Setup

This workshop stands on its own. Create the `weblogs` index, and delete the pipeline a previous attempt may have left:

```json
DELETE /weblogs
DELETE /_ingest/pipeline/weblogs

PUT /weblogs
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "message": { "type": "text" },
      "client": { "properties": { "ip": { "type": "ip" } } },
      "http": { "properties": { "method": { "type": "keyword" }, "status": { "type": "integer" } } },
      "url": { "properties": { "path": { "type": "keyword" } } },
      "duration_ms": { "type": "integer" },
      "event": { "properties": { "outcome": { "type": "keyword" }, "kind": { "type": "keyword" } } }
    }
  }
}
```

The four lines of the workshop — a `message` and a `timestamp` written `dd/MM/yyyy HH:mm:ss`:

```text
1  { "message": "203.0.113.50 GET /products/42 200 35",  "timestamp": "01/10/2026 08:00:00" }
2  { "message": "198.51.100.23 POST /cart 500 812",       "timestamp": "01/10/2026 08:00:05" }
3  { "message": "203.0.113.50 GET /admin 403 4",          "timestamp": "01/10/2026 08:00:09" }
4  { "message": "not an access log line",                 "timestamp": "01/10/2026 08:00:12" }
```

Reference: [Ingest pipelines](https://www.elastic.co/docs/manage-data/ingest/transform-enrich/ingest-pipelines).

## Exercises

### Step 1: Parse a line, without indexing it

Test, **without creating a pipeline**, a `grok` processor on line 1. It extracts `client.ip`, `http.method`, `url.path`, `http.status` and `duration_ms` — the last two as **integers**.

<details>
<summary>Hint</summary>

The [simulate API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-ingest-simulate) takes a `pipeline` and some `docs`. The [`grok` processor](https://www.elastic.co/docs/reference/enrich-processor/grok-processor) has patterns for an IP, a word, a URL path and a number; `%{NUMBER:field:int}` converts on the fly.

</details>

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

**Question**: `"200"` or `200`: what would change for a `range` query on `http.status` if the mapping did not say `integer`?

### Step 2: A real date

Add to the pipeline you simulate a processor that reads `timestamp` and writes `@timestamp`, then one that removes `timestamp`. Simulate it on line 1.

<details>
<summary>Hint</summary>

The [`date` processor](https://www.elastic.co/docs/reference/enrich-processor/date-processor) takes the formats it should try, in the Java syntax. Then the [`remove` processor](https://www.elastic.co/docs/reference/enrich-processor/remove-processor).

</details>

**Expected result**:

```json
{
  "docs": [
    { "doc": { "_source": { "@timestamp": "2026-10-01T08:00:00.000Z" } } }
  ]
}
```

### Step 3: Success or failure

Add a field `event.outcome`: `failure` when the status is **400 or more**, `success` otherwise. Simulate on lines 1 and 2.

<details>
<summary>Hint</summary>

Every processor accepts an `if`: a Painless condition on `ctx`, the document.

</details>

**Expected result**:

```json
{
  "docs": [
    { "doc": { "_source": { "http": { "status": 200 }, "event": { "outcome": "success" } } } },
    { "doc": { "_source": { "http": { "status": 500 }, "event": { "outcome": "failure" } } } }
  ]
}
```

### Step 4: A line that does not parse

Simulate on line 4. The pipeline fails, and in production the document would be **lost**. Make the pipeline keep it instead: when a processor fails, set `event.kind` to `pipeline_error`, and keep the reason in `error.message`.

<details>
<summary>Hint</summary>

A pipeline — or a processor — can have an `on_failure` list of processors. `{{ _ingest.on_failure_message }}` holds the reason.

</details>

**Expected result**:

```json
{
  "docs": [
    { "doc": { "_source": { "message": "not an access log line", "event": { "kind": "pipeline_error" } } } }
  ]
}
```

**Question**: once in `on_failure`, do the processors after `grok` still run?

### Step 5: Save it, and index through it

Save the pipeline under the name `weblogs`. Index line 1 in `weblogs` with the ID `1`, **naming the pipeline in the request**, then read the document back.

<details>
<summary>Hint</summary>

The [create pipeline API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-ingest-put-pipeline) takes the `processors` and `on_failure` you simulated. The index API has a `pipeline` parameter.

</details>

**Expected result** (the read):

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

### Step 6: The default pipeline of the index

The applications that write to `weblogs` should not have to name the pipeline. Make it the **default** pipeline of the index, then index lines 2, 3 and 4 — IDs `2`, `3`, `4` — in one request, without naming it. Count the failures, then the lines that did not parse.

<details>
<summary>Hint</summary>

`index.default_pipeline` is a dynamic index setting: it changes on a live index.

</details>

**Expected result** (the two counts):

```json
{
  "count": 2
}
```

```json
{
  "count": 1
}
```

**Try**: what does `GET /_nodes/stats/ingest?filter_path=nodes.*.ingest.pipelines.weblogs` tell you about the pipeline?

## Success criteria

- A pipeline tested with `_simulate` before being saved
- `grok`, `date`, `remove` and a conditional `set` turn a raw line into ECS-like fields
- A line that does not parse is kept, marked `pipeline_error`
- The index applies the pipeline by default

## Troubleshooting

**Problem**: `Provided Grok expressions do not match field value`
→ Expected on line 4. On another line, check the spaces of the pattern, one by one.

**Problem**: `unable to parse date`
→ The format must match the value exactly: `dd/MM/yyyy HH:mm:ss`, `MM` for the month, `mm` for the minutes.

**Problem**: `@timestamp` is not there after indexing
→ The document did not go through the pipeline: name it with `?pipeline=weblogs`, or set the default pipeline.
