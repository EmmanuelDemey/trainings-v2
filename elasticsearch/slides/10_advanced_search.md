---
layout: cover
---

# 10 - Advanced search

---

# Learning objectives

By the end of this sequence (**~75 min**, workshop included), you will be able to:

- **Sort** results on fields, scripts and distance
- **Paginate**, deep pagination included, with `search_after` and a point in time
- **Search** around a geographic point, or inside an area
- **Highlight** the matched terms
- **Reverse** the search with **percolation**
- **Query** several clusters with cross-cluster search

---

# Sorting on a field

By default, by descending `_score`. Any `keyword`, number or date otherwise:

```json
POST /movies/_search
{
  "query": { "match_all": {} },
  "sort": [
    { "year": "desc" },
    { "title.keyword": "asc" }
  ],
  "_source": ["title", "year"]
}
```

**Expected result**:

```json
{ "hits": { "hits": [ { "_id": "6", "sort": [2002, "Gangs of New York"] } ] } }
```

- The second criterion breaks the ties of the first
- Each hit carries its `sort` values — the key of `search_after`

---

# Sorting: the pitfalls

- **Not on a `text`**: no doc values — sort on its `keyword` sub-field (`title.keyword`)
- An explicit `sort` **skips** the `_score` computation: add `"track_scores": true` to get it
- `"_score"` can be a sort criterion like any other: `[{ "_score": "desc" }, { "year": "desc" }]`
- A field with several values: `"mode": "min"`, `"max"`, `"avg"`…
- Documents without the field: `"missing": "_last"` (default) or `"_first"`

---

# Sorting with a script

Sort on a computed value:

```json
POST /movies/_search
{
  "query": { "match_all": {} },
  "sort": {
    "_script": {
      "type": "number",
      "script": { "source": "doc['views'].value * 0.5 + doc['likes'].value" },
      "order": "desc"
    }
  },
  "_source": ["title"]
}
```

> The script runs on every matching document, at every search: when the value
> is stable, compute it at index time (an ingest pipeline, chapter 14) and sort on a field.

---

# Pagination: `from` and `size`

```json
POST /movies/_search
{
  "query": { "match_all": {} },
  "sort": [ { "year": "asc" } ],
  "from": 2,
  "size": 2,
  "_source": ["title", "year"]
}
```

- Page N: `"from": (N - 1) × size`
- Each shard returns its `from + size` best hits, the coordinating node sorts them all: the deeper, the costlier
- `from + size` ≤ **10,000** (`index.max_result_window`): beyond, an error

> Raising `max_result_window` hides the problem. A UI does not need page 2,000:
> for deep traversals, use `search_after`.

---

# Deep pagination: the methods

| Method | Use | Limit |
|---|---|---|
| `from` + `size` | Pages of a UI | `from + size` ≤ 10,000 |
| `search_after` | "Next page", infinite scroll | No jump to page N |
| **PIT** + `search_after` | **Consistent** traversal while the index changes, exports | A resource to close |
| `scroll` | Legacy exports | No longer recommended for deep pagination |

---

# `search_after`

The next page starts after the `sort` values of the last hit:

```json
POST /movies/_search
{
  "size": 2,
  "query": { "match_all": {} },
  "sort": [ { "year": "asc" }, { "title.keyword": "asc" } ],
  "search_after": [1977, "Star Wars"],
  "_source": ["title", "year"]
}
```

**Expected result**:

```json
{ "hits": { "hits": [ { "_id": "5", "sort": [1979, "Alien"] }, { "_id": "3" } ] } }
```

- The sort must be **unique**: add a tiebreaker field
- Without a PIT, a document indexed meanwhile can shift the pages

---

# Point in time (PIT)

A frozen view of the index, kept alive between two pages:

```json
POST /movies/_pit?keep_alive=1m
```

Each page: the PIT id, no index in the path, and the `sort` of the last hit:

<!-- ci: skip -->
```json
POST /_search
{
  "size": 100,
  "pit": { "id": "46ToAwMDaWR5BXV1aWQy...", "keep_alive": "1m" },
  "sort": [ { "year": "desc" } ],
  "search_after": [1997, 4294967298]
}
```

- With a PIT, an implicit `_shard_doc` tiebreaker is added to the sort
- Close it when done: `DELETE /_pit` with `{ "id": "…" }`

---

# Geographic data

A `geo_point` field (a location) or `geo_shape` (lines, polygons):

```json
PUT /places
{
  "mappings": {
    "properties": { "location": { "type": "geo_point" } }
  }
}
```

A `geo_point` accepts several notations:

- An object: `{ "lat": 40.71, "lon": -74.01 }`
- A string: `"40.71,-74.01"` (lat, lon)
- An array: `[-74.01, 40.71]` (**lon, lat** — the GeoJSON order!)
- A WKT point: `"POINT (-74.01 40.71)"`

> Not detected by the dynamic mapping: declare it explicitly.

---

# `geo_distance`

The documents within a distance of a point:

```json
POST /movies/_search
{
  "query": {
    "bool": {
      "filter": {
        "geo_distance": {
          "distance": "50km",
          "location": { "lat": 40.73, "lon": -73.99 }
        }
      }
    }
  },
  "_source": ["title"]
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 3, "relation": "eq" } } }
```

- A yes / no criterion: in a `filter`
- Units: `m`, `km`, `mi`…

---

# `geo_bounding_box`

The documents inside a rectangle — the map on the screen:

```json
POST /movies/_search
{
  "query": {
    "bool": {
      "filter": {
        "geo_bounding_box": {
          "location": {
            "top_left":     { "lat": 42, "lon": -75 },
            "bottom_right": { "lat": 40, "lon": -73 }
          }
        }
      }
    }
  },
  "_source": ["title"]
}
```

- `geo_shape` query: inside, outside or crossing any shape (polygon, line…)
- Aggregations `geo_distance`, `geotile_grid`: the maps of Kibana (chapter 11)

---

# Sorting by distance

The closest first:

```json
POST /restaurants/_search
{
  "query": { "match_all": {} },
  "sort": [
    {
      "_geo_distance": {
        "location": { "lat": 40.715, "lon": -73.984 },
        "order": "asc",
        "unit": "km"
      }
    }
  ],
  "_source": ["name"]
}
```

**Expected result**:

```json
{ "hits": { "hits": [ { "_id": "1", "_source": { "name": "Katz's Delicatessen" } } ] } }
```

- The `sort` value of each hit is its distance, in `unit`
- To blend distance and relevance: a `gauss` decay function on the location (chapter 9)

---

# Highlighting

Show **why** a document matches — the matched terms wrapped in `<em>`:

```json
POST /movies/_search
{
  "query": { "match": { "description": "adventure" } },
  "highlight": {
    "fields": { "description": {} }
  },
  "_source": ["title"]
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [
      { "_id": "3", "highlight": { "description": ["An <em>adventure</em> in a New York turned into a prison"] } }
    ]
  }
}
```

- Highlights according to the **analysis**: `adventures` also highlights `adventure`
- Several fields at once; `"*"` for all of them

---

# Highlighting: the options

```json
POST /movies/_search
{
  "query": { "multi_match": { "query": "space ship", "fields": ["title", "description"] } },
  "highlight": {
    "pre_tags": ["<mark>"],
    "post_tags": ["</mark>"],
    "fields": {
      "description": { "fragment_size": 50, "number_of_fragments": 2 }
    }
  },
  "_source": ["title"]
}
```

- `pre_tags` / `post_tags`: the wrapping tags (default `<em>` / `</em>`)
- `fragment_size` (default 100), `number_of_fragments` (default 5) — `0` returns the whole field
- Highlight only the fields you display: it has a cost

---

# Highlighter types

| Type | How | Use |
|---|---|---|
| **`unified`** | Default, sentence-aware, BM25 on the fragments | General purpose |
| `plain` | Re-analyzes the text in memory | Small fields |
| `fvh` | Fast vector highlighter, reads term vectors | Large texts |

```json
POST /movies/_search
{
  "query": { "match": { "description": "adventure" } },
  "highlight": { "fields": { "description": { "type": "fvh" } } },
  "_source": ["title"]
}
```

> `fvh` needs `"term_vector": "with_positions_offsets"` in the mapping of the
> field: a bigger index, faster highlighting on long texts.

---

# Percolation

Search **in reverse**: index **queries**, then submit a **document** to them.

- Classic search: stored documents, an incoming query
- Percolation: stored queries, an incoming document → which queries match it?

<br />

Use cases:

- **Alerts**: "notify me when a new listing matches my search"
- **Classification**: tag incoming documents with the rules they match
- **Routing**: send a document to the team whose rules it matches

---

# Percolation: the index

A `percolator` field holds the queries; the other fields describe the documents to percolate:

```json
PUT /alerts
{
  "mappings": {
    "properties": {
      "query":   { "type": "percolator" },
      "level":   { "type": "keyword" },
      "message": { "type": "text" }
    }
  }
}
```

> The fields the stored queries use must be in the mapping, with the types of
> the documents that will be percolated.

---

# Percolation: storing queries

Each stored query is a document:

```json
PUT /alerts/_doc/error-alert
{
  "query": { "term": { "level": "ERROR" } }
}

PUT /alerts/_doc/critical-memory?refresh=true
{
  "query": {
    "bool": {
      "must":   [ { "match": { "message": "out of memory" } } ],
      "filter": [ { "term": { "level": "CRITICAL" } } ]
    }
  }
}
```

---

# Percolation: matching a document

```json
POST /alerts/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": { "level": "ERROR", "message": "Connection timeout in payment service" }
    }
  }
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 1, "relation": "eq" }, "hits": [ { "_id": "error-alert" } ] } }
```

- `"documents": [ … ]`: several documents in one request — `_percolator_document_slot` tells which one matched
- `"index"` + `"id"`: percolate a document already indexed

> Percolation costs more than a search: keep the stored queries simple, and
> filter them (by owner, by category) in a `bool` around `percolate`.

---

# Cross-cluster search (CCS)

Search **several clusters** in one request, as if they were one:

- **Isolation**: one cluster per team, per region, per product — searched together
- **Scale**: no cluster has to hold everything
- **No copy**: the data stays where it is (copying is the job of **CCR**, chapter 22)

<br />

A remote index is named `<cluster alias>:<index>`:

<!-- ci: skip -->
```json
GET /movies,europe:movies,asia:mov*/_search
{
  "query": { "match": { "title": "york" } }
}
```

---

# CCS: declaring a remote cluster

<!-- ci: skip -->
```json
PUT /_cluster/settings
{
  "persistent": {
    "cluster.remote.europe.seeds": ["es-eu-1:9443", "es-eu-2:9443"]
  }
}
```

- `GET /_remote/info`: the remote clusters and their connection state
- **API key model** (recommended): the remote cluster opens a dedicated port
  (9443, `remote_cluster_server.enabled: true`), the local one connects with a
  cross-cluster API key (`POST /_security/cross_cluster/api_key`)
- `skip_unavailable: true` (default): an unreachable cluster does not fail the search

> Every search waits for the slowest cluster: watch the latency between them,
> and keep the remote clusters on compatible versions.

---

# Quiz

**A user wants page 2,000 of a search, 10 results per page. What happens with `from` / `size`?**

- A) It works, it's just slow
- B) Error: `from + size` exceeds `max_result_window` (10,000)
- C) Elasticsearch returns the last page
- D) Elasticsearch switches to `scroll`

<v-click>

**Answer: B** — beyond that, `search_after` with a PIT. And a UI does not offer page 2,000 anyway.

</v-click>

---

# Quiz

**What does a percolator index store?**

- A) The documents most often returned
- B) Queries, matched against the documents submitted to it
- C) The results of the last searches, as a cache
- D) The vectors of the documents

<v-click>

**Answer: B** — the search is reversed: the queries are stored, the document comes in.

</v-click>

---
layout: cover
---

# Workshop 5

## Search: Lucene, Query DSL and geo
