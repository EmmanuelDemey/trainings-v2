---
layout: cover
---

# 8 - Advanced search features

---

# Learning objectives

By the end of this sequence (**~40 min**, workshop included), you will be able to:

- **Sort** and **paginate** results, deep pagination included
- **Highlight** the matched terms
- **Suggest** completions and corrections
- **Search** around a geographic point
- **Reverse** the search with **percolation**

---

# Sorting

```json
GET /restaurants/_search
{
  "query": { "term": { "city": "Paris" } },
  "sort": [
    { "rating": "desc" },
    { "name.keyword": "asc" }
  ],
  "_source": ["name", "rating"]
}
```

**Expected result**:

```json
{ "hits": { "hits": [ { "_id": "12", "sort": [4.9, "L'Étoile du Nord"] } ] } }
```

- Sort on a `keyword`, a number, a date — **not** on a `text`
- An explicit `sort` **disables** the `_score` computation (unless `"track_scores": true`)

---

# Paginating

| Method | Use | Limit |
|---|---|---|
| `from` + `size` | Pages of a UI: `from: 20, size: 10` | `from + size` ≤ **10,000** (`index.max_result_window`) |
| `search_after` | Deep pagination, "next page" | No jump to page N |
| **Point in Time** + `search_after` | **Consistent** traversal while the index changes | A resource to close |
| `scroll` | Full export, legacy | Prefer PIT |

```json
GET /restaurants/_search
{
  "size": 3,
  "sort": [ { "price": "asc" }, { "name.keyword": "asc" } ],
  "search_after": [18, "Pizzeria Napoli"],
  "_source": ["name", "price"]
}
```

---

# Highlighting

Show **why** a document matches:

```json
GET /restaurants/_search
{
  "query": { "match": { "description": "pasta" } },
  "highlight": {
    "pre_tags": ["<mark>"], "post_tags": ["</mark>"],
    "fields": { "description": {} }
  },
  "_source": ["name"]
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [
      { "_id": "4", "highlight": { "description": ["Fresh <mark>pasta</mark>, mushroom risotto and tiramisu."] } }
    ]
  }
}
```

- Splits long texts into fragments: `fragment_size`, `number_of_fragments`
- Highlights according to the **analysis**: `pastas` also finds `pasta`

---

# Suggestions: correcting

The **term suggester** offers terms close to those of the index:

```json
GET /restaurants/_search
{
  "size": 0,
  "suggest": {
    "correction": {
      "text": "trattorai",
      "term": { "field": "name" }
    }
  }
}
```

**Expected result**:

```json
{ "suggest": { "correction": [ { "text": "trattorai", "options": [ { "text": "trattoria" } ] } ] } }
```

- `phrase`: corrects a whole sentence
- A simple alternative: `match` with `"fuzziness": "AUTO"`

---

# Suggestions: completing

The **completion suggester**: a dedicated field type, in memory, very fast:

```json
PUT /cities
{ "mappings": { "properties": { "suggest": { "type": "completion" } } } }

POST /cities/_bulk?refresh=true
{ "index": { "_id": "1" } }
{ "suggest": { "input": ["Paris"], "weight": 10 } }
{ "index": { "_id": "2" } }
{ "suggest": { "input": ["Pau"], "weight": 3 } }
{ "index": { "_id": "3" } }
{ "suggest": { "input": ["Lyon"], "weight": 8 } }

GET /cities/_search
{ "suggest": { "cities": { "prefix": "pa", "completion": { "field": "suggest" } } } }
```

**Expected result**:

```json
{ "suggest": { "cities": [ { "options": [ { "text": "Paris" }, { "text": "Pau" } ] } ] } }
```

---

# Geographic queries

A `geo_point` field: `{ "lat": 48.85, "lon": 2.35 }`, `"48.85,2.35"`, or `[2.35, 48.85]` (lon, lat!)

```json
GET /restaurants/_search
{
  "query": {
    "bool": {
      "filter": {
        "geo_distance": { "distance": "2km", "location": { "lat": 48.8584, "lon": 2.2945 } }
      }
    }
  },
  "sort": [
    { "_geo_distance": { "location": { "lat": 48.8584, "lon": 2.2945 }, "order": "asc", "unit": "km" } }
  ],
  "_source": ["name"]
}
```

- `geo_bounding_box`, `geo_polygon`, `geo_shape`: rectangle, polygon, shapes
- Aggregations: `geo_distance`, `geohash_grid`, `geotile_grid` → **maps** in Dashboards

---

# Percolation

Search **in reverse**: we index **queries**, and submit a **document** to them.

```json
PUT /alerts
{
  "mappings": {
    "properties": {
      "query":       { "type": "percolator" },
      "description": { "type": "text", "analyzer": "english" },
      "price":       { "type": "integer" }
    }
  }
}

PUT /alerts/_doc/cheap-japanese?refresh=true
{ "query": { "bool": { "must": { "match": { "description": "sushi" } }, "filter": { "range": { "price": { "lte": 30 } } } } } }

GET /alerts/_search
{
  "query": {
    "percolate": { "field": "query", "document": { "description": "All-you-can-eat sushi", "price": 25 } }
  }
}
```

**Expected result**:

```json
{ "hits": { "hits": [ { "_id": "cheap-japanese" } ] } }
```

→ "A new listing matches me" alerts, classification, routing.

---

# Quiz

**A user wants page 2,000 of a search, 10 results per page. What happens with `from` / `size`?**

<v-clicks>

- A) It works, it's just slow
- B) Error: `from + size` exceeds `max_result_window` (10,000) ✅
- C) OpenSearch returns the last page
- D) OpenSearch switches to `scroll`

**Answer: B** — beyond that, `search_after` (+ PIT). And a UI does not offer page 2,000 anyway.

</v-clicks>

---

# In practice

## Workshop 6 - Advanced search
