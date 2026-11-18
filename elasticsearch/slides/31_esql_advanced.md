---
layout: cover
---

# 31 - ES|QL: enrich, full text and what's new in 9.5

---

# Learning objectives

By the end of this sequence (**~45 min**), you will be able to:

- **Enrich** the rows of a query with an enrich policy and the `ENRICH` command
- **Choose** between `ENRICH` and `LOOKUP JOIN`
- **Search** full text in ES|QL: `MATCH` and its options, `MATCH_PHRASE`, `QSTR`, `KQL`, `:`
- **Rank** the rows by relevance with `METADATA _score`
- **Use** what's new in 9.5: `IP_LOCATION`, `flattened` fields, and know where `DEDUP` stands

> Builds on chapter 12: `FROM`, `WHERE`, `EVAL`, `STATS`, `LOOKUP JOIN` are not repeated here.

---

# The dataset

`web-logs`, a few requests of a web site, and `hosts`, the inventory of its servers:

| `host` | `datacenter` | `owner` |
|---|---|---|
| `web-1` | `paris` | `team-web` |
| `web-2` | `frankfurt` | `team-shop` |

- Each log line has a `host`, a `client_ip`, a `message` (`text`)
- and `labels`, a **`flattened`** field: `{ "env": "prod", "team": "shop" }`

---

# Enriching data: two ways

The rows of `web-logs` only know the **name** of the server. Which datacenter? Which team?

| | `ENRICH` | `LOOKUP JOIN` |
|---|---|---|
| Source | Any index, through an **enrich policy** | An index in `lookup` mode |
| Refresh of the data | **Re-execute** the policy | None: an ordinary index |
| Match | `match`, `geo_match`, `range` | Equality on one or more columns |
| Also in | Ingest pipelines (`enrich` processor) | ES\|QL only |
| Multiple matches | The first one | **One row per match** |
| Status | GA | GA since 9.1 |

> A small reference table that changes often: `LOOKUP JOIN`. A policy already used by ingest, or a `geo_match`/`range`: `ENRICH`.

---

# An enrich policy

```json
PUT /_enrich/policy/hosts-policy
{
  "match": {
    "indices": "hosts",
    "match_field": "host",
    "enrich_fields": ["datacenter", "owner"]
  }
}

POST /_enrich/policy/hosts-policy/_execute
```

**Expected result**:

```json
{ "status": { "phase": "COMPLETE" } }
```

- **`match`**: equality on a keyword · **`geo_match`**: a point in a shape · **`range`**: a value (number, date, IP) in a range
- `_execute` copies the source into a hidden `.enrich-*` index: **a snapshot**, re-execute it after a change
- A policy cannot be changed: delete it, then create it again

---

# The `ENRICH` command

```json
POST /_query?format=txt
{
  "query": """
    FROM web-logs
    | ENRICH hosts-policy ON host WITH dc = datacenter
    | STATS requests = COUNT(*) BY dc
    | SORT dc
  """
}
```

```text
   requests    |      dc
---------------+---------------
2              |frankfurt
2              |paris
```

- `ON host`: the column compared with the `match_field` (by default: the column of the same name)
- `WITH dc = datacenter`: which enrich fields to add, renamed or not — all of them without `WITH`
- Cross-cluster queries: `ENRICH _coordinator:hosts-policy` or `ENRICH _remote:hosts-policy` chooses where it runs

---

# `ENRICH` without `WITH`

```json
POST /_query?format=json
{
  "query": """
    FROM web-logs
    | WHERE status >= 500
    | ENRICH hosts-policy
    | KEEP url, host, datacenter, owner
    | LIMIT 1
  """
}
```

**Expected result**:

```json
{
  "values": [ [ "/cart", "web-2", "frankfurt", "team-shop" ] ]
}
```

- No `ON`: the policy's `match_field` (`host`) is used
- Every `enrich_fields` of the policy becomes a column

---

# Full-text search: the functions

| Function | Like the Query DSL | Example |
|---|---|---|
| `MATCH(field, "text")` | `match` | `MATCH(message, "payment timeout")` |
| `field : "text"` | `match` (short form) | `message : "timeout"` |
| `MATCH_PHRASE(field, "text")` | `match_phrase` | `MATCH_PHRASE(message, "cart failed")` |
| `QSTR("…")` | `query_string` (Lucene syntax) | `QSTR("message:timeout AND status:500")` |
| `KQL("…")` | Kibana Query Language | `KQL("message: timeout and host: web-2")` |

- All of them **GA since 9.1**, and read the **inverted index**: as fast as a `_search`
- Allowed in `WHERE`, right after `FROM` — before a `STATS` or an `EVAL` that changes the rows

---

# `MATCH` and its options

```json
POST /_query?format=txt
{
  "query": """
    FROM web-logs
    | WHERE MATCH(message, "payment timeout", { "operator": "AND" })
    | KEEP url, message
  """
}
```

```text
      url      |             message
---------------+----------------------------------
/cart          |POST /cart failed: payment timeout
```

- Options as a map, the third argument: `operator`, `minimum_should_match`, `fuzziness`, `boost`,
  `analyzer`, `lenient`, `auto_generate_synonyms_phrase_query`…
- A typo: `MATCH(message, "timout", { "fuzziness": "AUTO" })` still finds `timeout`

---

# `MATCH_PHRASE`, `QSTR`, `KQL`

```json
POST /_query?format=txt
{
  "query": """
    FROM web-logs
    | WHERE MATCH_PHRASE(message, "cart failed")
        AND KQL("host: web-2")
        AND QSTR("status:[500 TO 599]")
    | KEEP @timestamp, message
  """
}
```

- **`MATCH_PHRASE`**: the words, in this order
- **`KQL`**: the syntax of the Kibana search bar — paste a query from Discover
- **`QSTR`**: the Lucene syntax, wildcards and ranges included — powerful, but beware user input

---

# Relevance: `METADATA _score`

```json
POST /_query?format=txt
{
  "query": """
    FROM web-logs METADATA _score
    | WHERE MATCH(message, "timeout") OR MATCH(message, "payment")
    | SORT _score DESC
    | KEEP message, _score
  """
}
```

```text
             message              |      _score
----------------------------------+------------------
POST /cart failed: payment timeout|1.7210984230041504
POST /cart failed: timeout        |0.6931471228599548
```

- `OR` of two full-text conditions: the scores **add up**, as in a `bool` / `should`
- A non full-text condition (`AND status == 500`) filters, **without** changing the score
- Without `SORT _score DESC`, the rows come in no particular order

---

# Hybrid search in ES|QL: `FORK` and `FUSE`

```json
POST /_query?format=txt
{
  "query": """
    FROM web-logs METADATA _id, _index, _score
    | FORK ( WHERE MATCH(message, "timeout") | SORT _score DESC | LIMIT 5 )
           ( WHERE status >= 400 | SORT @timestamp DESC | LIMIT 5 )
    | FUSE
    | KEEP url, message, _score, _fork
  """
}
```

- **`FORK`**: several branches on the same data, each with its own ranking
- **`FUSE`**: merges them — Reciprocal Rank Fusion by default (`FUSE LINEAR` for a weighted sum)
- `FUSE` is GA in 9.5; the same idea as the `rrf` retriever of chapter 13

---

# New in 9.5: `IP_LOCATION`

Geolocation at **query time** — no `geoip` ingest pipeline, no re-indexing:

<!-- ci: retry -->
```json
POST /_query?format=json
{
  "query": """
    FROM web-logs
    | IP_LOCATION geo = client_ip
    | STATS requests = COUNT(*) BY geo.country_name
    | SORT geo.country_name
  """
}
```

**Expected result**:

```json
{
  "values": [ [ 1, "Sweden" ], [ 1, "United Kingdom" ], [ 2, "United States" ] ]
}
```

- Columns `geo.country_iso_code`, `geo.country_name`, `geo.region_name`, `geo.city_name`, `geo.location` (`geo_point`)…
- **Technical preview** in 9.5 · the first query **downloads** the GeoLite2 databases on every node

---

# `IP_LOCATION`: options

```json
POST /_query?format=txt
{
  "query": """
    ROW ip = "89.160.20.128"
    | IP_LOCATION g = ip WITH { "database_file": "GeoLite2-Country.mmdb" }
    | KEEP g.*
  """
}
```

- `database_file`: `GeoLite2-City.mmdb` (default), `GeoLite2-Country.mmdb`, `GeoLite2-ASN.mmdb`, a GeoIP2 or IPinfo database
- `properties`: only the columns you need — cheaper than resolving everything and dropping it with `KEEP`
- While the database is still downloading, the `keyword` columns hold `_ip_location_database_unavailable_<file>`: not an error, wait

> An offline cluster: download the databases yourself, and declare them with the IP geolocation database API.

---

# New in 9.5: `flattened` fields

A `flattened` field (any keys, all `keyword`) is now **readable** in ES|QL:

```json
POST /_query?format=txt
{
  "query": "FROM web-logs | KEEP url, labels | LIMIT 2"
}
```

```text
      url      |           labels
---------------+----------------------------
/home          |{"env":"prod","team":"web"}
/cart          |{"env":"prod","team":"shop"}
```

- The whole object comes back as **one JSON column**
- Its keys are **not** columns: `KEEP labels.env` → `Unknown column [labels.env]`

---

# `FIELD_EXTRACT`: one key of a `flattened` field

```json
POST /_query?format=txt
{
  "query": """
    FROM web-logs
    | WHERE FIELD_EXTRACT(labels, "env") == "prod"
    | STATS requests = COUNT(*) BY team = FIELD_EXTRACT(labels, "team")
    | SORT team
  """
}
```

```text
   requests    |     team
---------------+---------------
2              |shop
1              |web
```

- Usable in `WHERE`, `EVAL`, `STATS … BY`
- **Technical preview** in 9.5: the name and the behaviour may change

---

# `DEDUP`: not in 9.5 yet

`DEDUP` removes the rows that **duplicate** an earlier row, on every column in scope — the `SELECT DISTINCT` of ES|QL:

<!-- ci: skip -->
```json
POST /_query?format=txt
{
  "query": "FROM web-logs | KEEP url, status | DEDUP"
}
```

- **Elastic Cloud Serverless only** (preview); on a self-managed or Cloud Hosted **9.5**, it is « planned »: the parser rejects it
- Some 9.5 announcements list it: check the reference page of *your* version

---

# `DEDUP` in 9.5: `STATS … BY`

The same result, with what 9.5 already has:

```json
POST /_query?format=json
{
  "query": """
    FROM web-logs
    | STATS BY url, status
    | SORT url
  """
}
```

**Expected result**:

```json
{
  "values": [ [ "/cart", 500 ], [ "/home", 200 ], [ "/old", 404 ] ]
}
```

- `STATS BY` with no aggregate: one row per **distinct** combination
- Need a count too? `STATS hits = COUNT(*) BY url, status`

---

# More commands, briefly

| Command | Does | Status in 9.5 |
|---|---|---|
| `URI_PARTS p = url` | `p.scheme`, `p.domain`, `p.port`, `p.path`, `p.query`… | Preview (9.4) |
| `REGISTERED_DOMAIN r = host` | `r.registered_domain`, `r.top_level_domain`, `r.subdomain` | Preview |
| `USER_AGENT a = ua` | `a.name`, `a.version`, `a.os.name`, `a.device.name` | Preview (9.4) |
| `SAMPLE 0.1` | A random sample of the rows | Preview |
| `CHANGE_POINT value ON key` | Detects a spike, a dip, a trend change | Preview |
| `FORK` / `FUSE` | Several branches, merged | GA |
| `RERANK`, `COMPLETION` | Call an inference endpoint: rerank the rows, ask an LLM (chapter 34) | GA (9.4, 9.3) |

> Their parsing used to need an ingest pipeline: now at query time, on the data already indexed.

---

# Quiz

**You add a server to the `hosts` index. Your `ENRICH hosts-policy` query does not see it. Why?**

- A) `ENRICH` only reads lookup indices
- B) The enrich index is a copy: the policy must be executed again
- C) The `hosts` index needs a refresh
- D) `ENRICH` caches its results for an hour

<v-click>

**Answer: B** — `POST /_enrich/policy/hosts-policy/_execute` rebuilds the `.enrich-*` index. A `LOOKUP JOIN` on a `lookup` index would have seen it at once.

</v-click>

---

# Quiz

**Which query ranks the rows by relevance?**

- A) `FROM web-logs | WHERE MATCH(message, "timeout") | SORT _score DESC`
- B) `FROM web-logs METADATA _score | WHERE MATCH(message, "timeout") | SORT _score DESC`
- C) `FROM web-logs METADATA _score | WHERE message LIKE "*timeout*" | SORT _score DESC`
- D) `FROM web-logs | STATS MAX(_score) BY message`

<v-click>

**Answer: B** — `_score` must be asked for with `METADATA`, and only full-text functions (`MATCH`, `:`, `QSTR`, `KQL`…) score: `LIKE` does not.

</v-click>
