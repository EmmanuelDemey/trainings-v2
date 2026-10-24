# Workshop 14 — Modern data streams: LogsDB, lifecycle, failure store and TSDS

> Store logs and metrics the way Elastic Agent does: data streams in LogsDB and time series mode, a retention managed by the data stream lifecycle, and a failure store so that rejected documents are no longer lost.

**Level**: Advanced
**Topic**: Retention and storage — Data streams

## Context

An e-commerce application sends its logs and its metrics to Elasticsearch. The team wants a smaller storage bill, logs kept 7 days without maintaining an ILM policy, and no more malformed documents lost silently.

Each step states **what** to build, not **how**: look for the setting or the API in the documentation, try it, read the response, adjust. The expected result lets you check your own answer. Hints are folded — open them only once you are stuck.

Reference: [Data streams](https://www.elastic.co/docs/manage-data/data-store/data-streams).

## Setup

This workshop stands on its own. Check that the cluster answers:

```json
GET /_cluster/health
```

## Part A: A logs data stream in LogsDB mode

### Step 1: The built-in template

Elasticsearch already ships a template for the logs of Elastic Agent. Find it, and its index patterns and priority.

<details>
<summary>Hint</summary>

It is an index template named after the type of data it holds.

</details>

**Expected result** (an excerpt):

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

**Question**: the naming convention is `<type>-<dataset>-<namespace>`. What would happen to every source of logs if you created a template on `logs-*` with a higher priority?

### Step 2: Your template

Create the template `logs-shop-template` for `logs-shop-*`, taking precedence over the built-in one: a data stream in **LogsDB** mode, 0 replicas, with `@timestamp` (date), `host.name` (keyword), `message` (a text **without positions nor scoring**) and `http.status` (integer); a **retention of 7 days** managed by the data stream lifecycle; and a **failure store** enabled.

<details>
<summary>Hint</summary>

Look at the [`index.mode` setting](https://www.elastic.co/docs/manage-data/data-store/data-streams/logs-data-stream), at the [`match_only_text`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/text#match-only-text-field-type) type, at [`lifecycle`](https://www.elastic.co/docs/manage-data/lifecycle/data-stream) in a template, and at the [failure store](https://www.elastic.co/docs/manage-data/data-store/data-streams/failure-store) under `data_stream_options`.

</details>

**Expected result**:

```json
{ "acknowledged": true }
```

**Question**: what does LogsDB change to how the documents are stored?

### Step 3: Index logs

Index these three logs into `logs-shop-production` — the data stream is created by the first one:

```text
{"@timestamp":"2026-10-08T10:00:00Z","host.name":"web-1","message":"GET /home 200","http.status":200}
{"@timestamp":"2026-10-08T10:01:00Z","host.name":"web-2","message":"POST /cart 500","http.status":500}
{"@timestamp":"2026-10-08T10:02:00Z","host.name":"web-1","message":"GET /product/42 200","http.status":200}
```

Then look at the data stream.

<details>
<summary>Hint</summary>

A data stream only takes **creations**: in a `_bulk`, the action is `create`, not `index`.

</details>

**Expected result** (an excerpt of the data stream):

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

### Step 4: The synthetic _source

Index into `logs-shop-production` a log of `web-3` at `2026-10-08T10:03:00Z`, message `GET /status`, whose `http.status` is `"oops"`. Then find it by its `host.name`, with this search:

<!-- ci: skip -->
```json
POST /logs-shop-production/_search
{
  "query": { "term": { "host.name": "web-3" } }
}
```

**Expected result** (an excerpt):

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

**Questions**:
- Why did `host.name` become an object `host: { name }`?
- Why was the document accepted, with `"oops"` in an `integer` field?

## Part B: The data stream lifecycle

### Step 5: Read and change the retention

Read the lifecycle of `logs-shop-production`. The security team asks for **30 days**: change the retention of this data stream, **without** touching the template. Then ask the lifecycle to explain the state of its backing indices.

<details>
<summary>Hint</summary>

The data stream has a `_lifecycle` endpoint; its backing indices have a `_lifecycle/explain` one.

</details>

**Expected result** (the change):

```json
{ "acknowledged": true }
```

**Questions**:
- What can ILM do that the lifecycle cannot?
- What retention will the next `logs-shop-*` data streams get?

## Part C: The failure store

### Step 6: A rejected document

Index into `logs-shop-production` a log of `web-2` with the message `log without a timestamp` — and **no** `@timestamp`.

**Expected result** (an excerpt):

```json
{
  "result": "created",
  "failure_store": "used"
}
```

**Question**: without a failure store, what would have happened to that document?

### Step 7: Read the failures

Search the failure store of `logs-shop-production`, keeping only `error.type`, `error.message` and `document.source`. Then count the failures per `error.type` in ES|QL.

<details>
<summary>Hint</summary>

A **selector** after the name of the data stream gives the failure store, as if it were an index. Refresh it first.

</details>

**Expected result** (an excerpt of the search):

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

**Expected result** (ES|QL):

```json
{
  "values": [[1, "document_parsing_exception"]]
}
```

## Part D: A time series data stream (TSDS) for the metrics

Reference: [Time series data streams](https://www.elastic.co/docs/manage-data/data-store/data-streams/time-series-data-stream-tsds).

### Step 8: Timestamp at ingest

A TSDS only takes points close to « now » (by default, from 2 hours before to 30 minutes after). Elastic Agent timestamps its metrics; here, create the ingest pipeline `metrics-shop-timestamp` that sets `@timestamp` to the time of reception — **unless** the document has one already.

<details>
<summary>Hint</summary>

The [`set` processor](https://www.elastic.co/docs/reference/enrich-processor/set-processor), and the ingest metadata `_ingest.timestamp`.

</details>

**Expected result**:

```json
{ "acknowledged": true }
```

### Step 9: The time series template

Create the template `metrics-shop-template`, priority 200, for `metrics-shop-*`: a data stream in **time series** mode that goes through `metrics-shop-timestamp` by default, 0 replicas. The series are identified by `host.name`; `cpu.pct` is a value that goes up and down, `http.requests` a counter that only grows. Keep the data 90 days, **downsampled** to one point per hour after 1 day, and one per day after 7 days.

<details>
<summary>Hint</summary>

Look at `time_series_dimension` and `time_series_metric` in the mapping, at `index.default_pipeline`, and at `downsampling` in the `lifecycle`.

</details>

**Expected result**:

```json
{ "acknowledged": true }
```

### Step 10: Send metrics

Send these two points to `metrics-shop-production`, with no timestamp:

```text
{"host.name":"web-1","cpu.pct":0.42,"http.requests":1000}
{"host.name":"web-2","cpu.pct":0.87,"http.requests":2500}
```

Then look at the data stream.

**Expected result** (an excerpt):

```json
{
  "data_streams": [
    { "name": "metrics-shop-production", "index_mode": "time_series" }
  ]
}
```

**Question**: what does `time_series.temporal_ranges` tell you?

### Step 11: Query the series

In ES|QL, compute the **maximum CPU per host**, sorted by host, reading `metrics-shop-production` as a time series.

<details>
<summary>Hint</summary>

ES|QL has a source command of its own for time series data streams.

</details>

**Expected result**:

```json
{
  "values": [
    [0.42, "web-1"],
    [0.87, "web-2"]
  ]
}
```

**Try**: index a point for `web-1` with a `@timestamp` of 3 days ago. What happens? What does the response say about the failure store?

## Success criteria

- A data stream named after `<type>-<dataset>-<namespace>`, without hiding the built-in templates
- LogsDB enabled, and the synthetic `_source` understood
- A retention managed with the data stream lifecycle
- A failure store enabled, and its failures read
- A TSDS with dimensions, metrics and downsampling, queried in ES|QL

## Troubleshooting

**Problem**: the data stream does not have the expected settings (mode, retention…)
→ Another template may have won. `POST /_index_template/_simulate_index/logs-shop-production` shows which one applies, and the merged result.

**Problem**: `the document timestamp [...] is outside of ranges of currently writable indices`
→ The point is too old (or too far in the future) for the TSDS: on purpose, a TSDS only takes recent data.

**Problem**: the failure store stays empty
→ It only applies to the data streams created after it was enabled in the template. For an existing one, look at the `_options` endpoint of the data stream.
