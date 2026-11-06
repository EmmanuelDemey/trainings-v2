---
layout: cover
---

# 4 - Indexing and mapping

---

# Learning objectives

By the end of this sequence (**~45 min**, workshop included), you will be able to:

- **Create**, configure and delete an index
- **Index**, read, update and delete documents, one by one or with `_bulk`
- **Choose** the type of each field: `text` or `keyword`, numbers, dates, `geo_point`
- **Spot** the pitfalls of dynamic mapping
- **Decouple** applications from indices with an **alias**

---

# Creating an index

```json
PUT /books
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
```

- `number_of_shards`: **fixed** at creation (except with `_split` / `_shrink`)
- `number_of_replicas`, `refresh_interval`: **dynamic**

```json
PUT /books/_settings
{ "index": { "number_of_replicas": 0, "refresh_interval": "5s" } }
```

```json
GET /books/_settings
DELETE /books
```

---

# Indexing a document

```json
PUT /books/_doc/1
{ "title": "The Little Prince", "author": "Saint-Exupéry", "year": 1943 }

POST /books/_doc
{ "title": "The Stranger", "author": "Camus", "year": 1942 }
```

- `PUT /index/_doc/<id>`: **creates or replaces** the document with this `_id`
- `POST /index/_doc`: OpenSearch **generates** the `_id`
- `PUT /index/_create/<id>`: fails (**409**) if the `_id` already exists

**Expected result** (the `POST`):

```json
{ "_index": "books", "result": "created" }
```

---

# Read, update, delete

```json
GET /books/_doc/1

POST /books/_update/1
{ "doc": { "year": 1946 } }

GET /books/_doc/1
```

**Expected result**:

```json
{ "_id": "1", "_version": 2, "found": true, "_source": { "title": "The Little Prince", "year": 1946 } }
```

```json
DELETE /books/_doc/1
```

- A document is **immutable** in Lucene: an update **rewrites** the whole document, and `_version` is incremented
- `_update` only saves you from sending the whole document again

---

# `_bulk`: indexing in batches

One **action** line, then one **document** line — the **NDJSON** format:

```json
POST /books/_bulk?refresh=true
{ "index": { "_id": "2" } }
{ "title": "Germinal", "author": "Zola", "year": 1885 }
{ "index": { "_id": "3" } }
{ "title": "Les Misérables", "author": "Hugo", "year": 1862 }
{ "delete": { "_id": "2" } }
```

**Expected result**:

```json
{ "errors": false }
```

- Actions: `index`, `create`, `update`, `delete`
- One failure **does not cancel** the others: read `errors`, then `items[]`
- Batch size: **5 to 15 MB**, to be measured

---

# Dynamic mapping

Without a mapping, OpenSearch **guesses** the type from the first document:

```json
PUT /guess/_doc/1
{ "title": "Germinal", "year": 1885, "price": 9.5, "published": "1885-03-01", "zip": "75001" }

GET /guess/_mapping
```

| Field | Guessed | The problem |
|---|---|---|
| `title` | `text` + `keyword` sub-field | Two indexes for one field: often useless |
| `year` | `long` | 8 bytes for a year |
| `price` | `float` | OK |
| `published` | `date` | OK — because the format is ISO |
| `zip` | `text` + `keyword` | A zip code is never searched as full text |

> In production: an **explicit mapping**, and `"dynamic": "strict"` to reject unknown fields.

---

# `text` or `keyword`?

| | `text` | `keyword` |
|---|---|---|
| Indexed | **Analyzed**: split into terms, lowercased… | **As is**, a single exact value |
| For | **Full-text** search: `match` | Exact **filter**, **sort**, **aggregation**: `term` |
| Example | Description, title, log message | Status, city, tag, email, ID |

Both at once, with a **multi-field**:

```json
"name": {
  "type": "text",
  "fields": { "keyword": { "type": "keyword" } }
}
```

→ `match` on `name`, sort and aggregate on `name.keyword`.

---

# Data types

| Family | Types |
|---|---|
| Text | `text`, `keyword`, `match_only_text`, `wildcard` |
| Numbers | `integer`, `long`, `float`, `double`, `scaled_float`, `unsigned_long` |
| Dates | `date` (with `format`), `date_nanos` |
| Others | `boolean`, `ip`, `binary`, `range` |
| Objects | `object` (default), `nested`, `flat_object` |
| Geo | `geo_point`, `geo_shape` |
| Specialized | `completion`, `percolator`, `knn_vector`, `join` |

<br />

> An **array** is not a type: every field accepts one or more values.

---

# An explicit mapping

```json
PUT /products
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "name":     { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "category": { "type": "keyword" },
      "price":    { "type": "scaled_float", "scaling_factor": 100 },
      "stock":    { "type": "integer" },
      "created":  { "type": "date", "format": "yyyy-MM-dd||epoch_millis" },
      "tags":     { "type": "keyword" }
    }
  }
}
```

- You can **add** a field on the fly (`PUT /products/_mapping`)
- You **cannot change** the type of an existing field: new index + **`_reindex`**

---

# Changing a mapping: `_reindex` and aliases

```json
PUT /products_v2
{ "mappings": { "properties": { "category": { "type": "keyword" } } } }

POST /_reindex
{ "source": { "index": "products" }, "dest": { "index": "products_v2" } }

POST /_aliases
{
  "actions": [
    { "add": { "index": "products_v2", "alias": "products_current" } }
  ]
}
```

- Applications read and write through the **alias**, never the index
- Switching with `remove` + `add`, in **a single** `_aliases` call, is **atomic**

---

# Index templates

Mapping and settings **applied automatically** to the new indices matching a pattern:

```json
PUT /_index_template/logs
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "level":      { "type": "keyword" },
        "message":    { "type": "text" }
      }
    }
  }
}

PUT /logs-2026.10.27/_doc/1
{ "@timestamp": "2026-10-27T10:00:00Z", "level": "INFO", "message": "starting" }

GET /logs-2026.10.27/_mapping
```

---

# Quiz

**We want to sort restaurants by city. Which type for `city`?**

<v-clicks>

- A) `text`
- B) `keyword` ✅
- C) `object`
- D) `geo_point`

**Answer: B** — you sort and aggregate on an **exact**, non-analyzed value.

</v-clicks>

---
layout: cover
---

# Workshop 2

## Indexing and mapping
