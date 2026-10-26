# Workshop 8 — ES|QL: solution

For the trainer. Not published: the learners find these queries themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Step 1

```json
POST /_query?format=json
{
  "query": """
    FROM web-logs
    | SORT response_ms DESC
    | KEEP @timestamp, url, status, response_ms
    | LIMIT 3
  """
}
```

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

Without `KEEP`, every column comes back, in alphabetical order. Without `LIMIT`,
ES|QL adds an implicit `LIMIT 1000`; an explicit one goes up to 10,000.

## Step 2

```json
POST /_query?format=json
{
  "query": """
    FROM web-logs
    | WHERE status >= 500
    | STATS errors = COUNT(*)
  """
}
```

**Expected result**:

```json
{
  "columns": [{ "name": "errors", "type": "long" }],
  "values": [[3]]
}
```

## Step 3

```json
POST /_query?format=json
{
  "query": """
    FROM web-logs
    | EVAL family = CASE(status >= 500, "server error",
                         status >= 400, "client error",
                         "ok"),
           kb = ROUND(bytes / 1024.0, 2)
    | KEEP url, status, family, kb
  """
}
```

**Expected result**:

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

`bytes / 1024` is an integer division between two whole numbers: `/home` gives
`1`. `1024.0` makes it a `double`.

## Step 4

```json
POST /_query?format=json
{
  "query": """
    FROM web-logs
    | WHERE status >= 400
    | STATS errors = COUNT(*), avg_ms = AVG(response_ms) BY url
    | SORT errors DESC
  """
}
```

**Expected result**:

```json
{
  "values": [
    [3, 2500.0, "/cart"],
    [1, 12.0, "/old"]
  ]
}
```

The aggregates come first, in the order of the query, then the keys of the `BY`.

## Step 5

```json
POST /_query?format=json
{
  "query": """
    FROM web-logs
    | STATS requests = COUNT(*) BY slot = BUCKET(@timestamp, 30 minutes)
    | SORT slot
  """
}
```

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

With `1 hour`: two rows, 4 requests each. `DATE_TRUNC(30 minutes, @timestamp)`
gives the same slots.

## Step 6

A lookup index: one shard, replicated on every node. `index.mode` cannot be set
afterwards.

```json
DELETE /countries

PUT /countries
{
  "settings": { "index.mode": "lookup" },
  "mappings": {
    "properties": {
      "country_code": { "type": "keyword" },
      "country_name": { "type": "keyword" }
    }
  }
}

POST /countries/_bulk?refresh=true
{"index":{}}
{"country_code":"FR","country_name":"France"}
{"index":{}}
{"country_code":"DE","country_name":"Germany"}
{"index":{}}
{"country_code":"ES","country_name":"Spain"}
```

```json
POST /_query?format=json
{
  "query": """
    FROM web-logs
    | WHERE status >= 500
    | LOOKUP JOIN countries ON country_code
    | STATS errors = COUNT(*) BY country_name
    | SORT country_name
  """
}
```

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

`ENRICH` needs an enrich policy, executed to build a hidden enrich index:
adding a country means indexing it, then executing the policy again.
`LOOKUP JOIN` reads the lookup index as it is: index the country, done.

## Step 7

```json
POST /_query?format=json
{
  "query": """
    FROM web-logs METADATA _score
    | WHERE MATCH(message, "payment timeout")
    | STATS failures = COUNT(*)
  """
}
```

**Expected result**:

```json
{
  "values": [[2]]
}
```

`failed` finds the 3 failures. `LIKE` matches the raw value, not the analysed
terms: it is case sensitive (`*Payment*` finds nothing), gives no relevance score,
and a leading wildcard is costly on a large index.

## Step 8

```json
POST /_query?format=json
{
  "query": """
    FROM web-logs
    | WHERE url == ?page AND response_ms > ?slow_ms
    | STATS slow = COUNT(*)
  """,
  "params": [{ "page": "/cart" }, { "slow_ms": 2000 }]
}
```

**Expected result**:

```json
{
  "values": [[2]]
}
```

A value concatenated into the query can change it (`/cart" OR true OR url == "`):
an ES|QL injection. A parameter is only ever a value.

## Going further

`INLINE STATS` keeps every row and adds the aggregate to each one:

```text
FROM web-logs | INLINE STATS max_ms = MAX(response_ms) BY url | KEEP url, response_ms, max_ms
```
