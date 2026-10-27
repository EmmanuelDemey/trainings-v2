# Workshop 11 — ES|QL: exploring logs with pipes

> Query logs with ES|QL: filter, compute, aggregate, join a reference table and search full text — all in one request that reads from top to bottom.

**Topic**: ES|QL

## Context

The operations team of an online shop wants to investigate the errors of its website without writing Query DSL: how many errors, on which pages, from which countries, at what time. You answer these questions with ES|QL, from Kibana Dev Tools (and, if you like, from Discover in ES|QL mode).

Each step states **what** to find, not **how**: look for the command or function in the documentation, try it, read the response, adjust. The expected result lets you check your own answer. Hints are folded — open them only once you are stuck.

## Setup

This workshop stands on its own. Create the logs index and load its data:

```json
DELETE /web-logs

PUT /web-logs
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "url": { "type": "keyword" },
      "message": { "type": "text" },
      "status": { "type": "integer" },
      "bytes": { "type": "long" },
      "country_code": { "type": "keyword" },
      "response_ms": { "type": "integer" }
    }
  }
}

POST /web-logs/_bulk?refresh=true
{"index":{}}
{"@timestamp":"2026-10-01T10:00:00Z","url":"/home","message":"GET /home served","status":200,"bytes":1200,"country_code":"FR","response_ms":45}
{"index":{}}
{"@timestamp":"2026-10-01T10:05:00Z","url":"/cart","message":"POST /cart failed: payment timeout","status":500,"bytes":300,"country_code":"DE","response_ms":3000}
{"index":{}}
{"@timestamp":"2026-10-01T10:20:00Z","url":"/old","message":"GET /old not found","status":404,"bytes":0,"country_code":"FR","response_ms":12}
{"index":{}}
{"@timestamp":"2026-10-01T10:40:00Z","url":"/home","message":"GET /home served","status":200,"bytes":1500,"country_code":"ES","response_ms":60}
{"index":{}}
{"@timestamp":"2026-10-01T11:10:00Z","url":"/cart","message":"POST /cart failed: stock service unavailable","status":503,"bytes":250,"country_code":"FR","response_ms":1500}
{"index":{}}
{"@timestamp":"2026-10-01T11:30:00Z","url":"/product/42","message":"GET /product/42 served","status":200,"bytes":5400,"country_code":"DE","response_ms":80}
{"index":{}}
{"@timestamp":"2026-10-01T11:45:00Z","url":"/cart","message":"POST /cart failed: payment timeout","status":500,"bytes":310,"country_code":"ES","response_ms":3000}
{"index":{}}
{"@timestamp":"2026-10-01T11:50:00Z","url":"/home","message":"GET /home served","status":200,"bytes":1300,"country_code":"FR","response_ms":50}
```

## Exercises

Every query goes to `POST /_query?format=json`, its ES|QL in the `query` string. Kibana accepts `"""…"""` around a multi-line string. `format=txt` prints a table instead — handy to read, but the expected results below are JSON.

Reference: [ES|QL](https://www.elastic.co/docs/reference/query-languages/esql) — its commands and functions.

### Step 1: A first query

Show the **3 slowest** requests, with only the columns `@timestamp`, `url`, `status` and `response_ms`, slowest first.

<details>
<summary>Hint</summary>

A query starts with a **source command** (`FROM`), followed by **processing commands** separated by `|`. You need one to sort, one to choose the columns, one to cut the rows.

</details>

**Expected result**:

```json
{
  "columns": [
    { "name": "@timestamp", "type": "date" },
    { "name": "url", "type": "keyword" },
    { "name": "status", "type": "integer" },
    { "name": "response_ms", "type": "integer" }
  ],
  "values": [
    ["2026-10-01T10:05:00.000Z", "/cart", 500, 3000],
    ["2026-10-01T11:45:00.000Z", "/cart", 500, 3000],
    ["2026-10-01T11:10:00.000Z", "/cart", 503, 1500]
  ]
}
```

**Questions**:
- What happens without the command that chooses the columns? In which order do they come?
- And without the one that cuts the rows — how many rows can a query return at most?

### Step 2: Filter the errors

Count the server errors (`status` 500 or more), in a column named `errors`.

<details>
<summary>Hint</summary>

One command keeps the rows matching a condition, another computes aggregates — the ES|QL counterpart of a `COUNT(*)` in SQL.

</details>

**Expected result**:

```json
{
  "columns": [{ "name": "errors", "type": "long" }],
  "values": [[3]]
}
```

### Step 3: Compute columns

For every request, keep `url` and `status`, and add:

- `family`: `server error` for a status of 500 or more, `client error` for 400 or more, `ok` otherwise;
- `kb`: the size in kilobytes (`bytes` / 1024), rounded to 2 decimals.

<details>
<summary>Hint</summary>

The command that adds columns is `EVAL`. Look among the [conditional functions](https://www.elastic.co/docs/reference/query-languages/esql/functions-operators/conditional-functions-and-expressions) and the math ones. Beware of the integer division.

</details>

**Expected result** (some of the rows):

```json
{
  "columns": [
    { "name": "url", "type": "keyword" },
    { "name": "status", "type": "integer" },
    { "name": "family", "type": "keyword" },
    { "name": "kb", "type": "double" }
  ],
  "values": [
    ["/home", 200, "ok", 1.17],
    ["/cart", 500, "server error", 0.29],
    ["/old", 404, "client error", 0.0],
    ["/product/42", 200, "ok", 5.27]
  ]
}
```

**Try**: compute `kb` with `bytes / 1024`. What do you get for `/home`, and why?

### Step 4: Aggregate per page

For the errors (`status` 400 or more), compute per `url`: the number of errors `errors` and the average response time `avg_ms`. Most errors first.

<details>
<summary>Hint</summary>

The aggregation command takes a `BY` clause, like SQL's `GROUP BY`.

</details>

**Expected result**:

```json
{
  "values": [
    [3, 2500.0, "/cart"],
    [1, 12.0, "/old"]
  ]
}
```

**Question**: in which order do the columns come back? Compare with the order of your query.

### Step 5: Aggregate over time

Count the requests per **30-minute slot**, in a column `requests`, the slot in a column `slot`, in time order.

<details>
<summary>Hint</summary>

Look at the [grouping functions](https://www.elastic.co/docs/reference/query-languages/esql/functions-operators/grouping-functions): one of them rounds a date down to a fixed span, right inside the `BY`.

</details>

**Expected result**:

```json
{
  "values": [
    [3, "2026-10-01T10:00:00.000Z"],
    [1, "2026-10-01T10:30:00.000Z"],
    [1, "2026-10-01T11:00:00.000Z"],
    [3, "2026-10-01T11:30:00.000Z"]
  ]
}
```

**Try**: one-hour slots instead. How many rows now?

### Step 6: Join a reference table

The logs only hold a country code. Create an index `countries` with two `keyword` fields, `country_code` and `country_name`, holding:

```text
FR  France
DE  Germany
ES  Spain
```

Then count the server errors per `country_name`, sorted by name.

<details>
<summary>Hint</summary>

ES|QL joins with [`LOOKUP JOIN`](https://www.elastic.co/docs/reference/query-languages/esql/commands/lookup-join), and only on an index created in a special **index mode**: find which one in its documentation. That mode cannot be set on an existing index.

</details>

**Expected result**:

```json
{
  "values": [
    [1, "France"],
    [1, "Germany"],
    [1, "Spain"]
  ]
}
```

**Question**: what does `ENRICH` do differently? What would it take to add a country with each solution?

### Step 7: Full-text search

Count the requests whose `message` matches `payment timeout` as **full text** — through the inverted index, as a `match` query of the Query DSL would — in a column `failures`.

<details>
<summary>Hint</summary>

Look at the [search functions](https://www.elastic.co/docs/reference/query-languages/esql/functions-operators/search-functions). The relevance score is not a column by default: `FROM … METADATA _score` adds it.

</details>

**Expected result**:

```json
{
  "values": [[2]]
}
```

**Try**: search `failed` instead. And compare with `message LIKE "*payment*"`: what is the difference, beyond the result?

### Step 8: Parameters

Count, in a column `slow`, the requests to a given page slower than a given time — `/cart` and `2000` ms — **without writing these two values in the query string**: pass them as parameters.

<details>
<summary>Hint</summary>

The [`_query` API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-esql-query) takes a `params` array next to `query`; the query refers to a named parameter as `?name`.

</details>

**Expected result**:

```json
{
  "values": [[2]]
}
```

**Question**: why does it matter when the values come from a user?

## Going further

- Open **Discover**, switch to ES|QL mode and paste the query of step 5: Kibana draws the histogram.
- Create an alerting rule of type **ES|QL** (Stack Management → Rules) that fires when the query of step 2 returns more than 2 errors.
- Find what `INLINE STATS` does: add the slowest response time of each page to every row, without collapsing the rows.

## Success criteria

- An ES|QL query with `FROM`, `WHERE`, `EVAL`, `STATS … BY`, `SORT`, `KEEP`, `LIMIT`
- A `format=json` response read (`columns` + `values`)
- Requests counted over time
- A lookup index joined with `LOOKUP JOIN`
- A full-text search, and a query with parameters

## Troubleshooting

**Problem**: `Lookup Join requires a single lookup mode index; [countries] resolves to [countries] in [standard] mode`
→ The index was created without the right index mode. It cannot be changed afterwards: delete it and create it again.

**Problem**: `Unknown column [...]`
→ A column dropped by `KEEP`/`DROP`, or not produced by `STATS`, no longer exists for the next commands: the order of the commands matters.

**Problem**: the results stop at 1000 rows
→ That is the default limit: add an explicit `LIMIT` (10,000 at most).
