---
layout: cover
---

# 5 - Mapping

---

# Learning objectives

By the end of this sequence (**~45 min**), you will be able to:

- **Spot** the pitfalls of dynamic mapping, and **lock** an index with `"dynamic": "strict"`
- **Choose** the type of each field: `text` or `keyword`, numbers, dates, `geo_point`
- **Tune** a field: `index`, `doc_values`, `ignore_above`, `enabled`, multi-fields
- **Choose** between `object` and `nested` for an array of objects
- **Map** the new fields by their name with dynamic templates

---

# What the mapping decides

The mapping is the **schema** of an index. For each field, it says:

- its **type** — and therefore which queries work on it
- whether it is **indexed** (searchable), and **how** — the analyzer
- whether it is kept for **sort and aggregations** — `doc_values`

<br />

> Most of a mapping is **fixed** once the field exists: getting it right at creation
> saves a reindex (chapter 7).

---

# Dynamic mapping

Without a mapping, Elasticsearch **guesses** the types from the first document:

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

---

# The first document wins

<!-- ci: expect-error -->
```json
PUT /guess/_doc/2
{ "title": "Nana", "year": "unknown" }
```

```text
document_parsing_exception: failed to parse field [year] of type [long]
```

- The type is set by the **first** value seen; the later ones must comply
- A date in another format (`03/01/1885`) is mapped as **text**: no range query, no histogram
- Every new field name **adds** to the mapping: a JSON with free keys makes a **mapping explosion** (limit: `index.mapping.total_fields.limit`, 1000)

---

# An explicit mapping

```json
PUT /movies
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "title":    { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "genre":    { "type": "keyword" },
      "year":     { "type": "short" },
      "rating":   { "type": "scaled_float", "scaling_factor": 10 },
      "released": { "type": "date", "format": "yyyy-MM-dd||epoch_millis" },
      "location": { "type": "geo_point" }
    }
  }
}
```

> In production: an **explicit mapping**, always.

---

# `dynamic`: what to do with an unknown field

<!-- ci: expect-error -->
```json
PUT /movies/_doc/1
{ "title": "Titanic", "budget": 200000000 }
```

```text
strict_dynamic_mapping_exception: mapping set to strict, dynamic introduction of [budget] within [_doc] is not allowed
```

| `dynamic` | Unknown field |
|---|---|
| `true` (default) | Added to the mapping |
| `runtime` | Added as a **runtime** field: queryable, not indexed |
| `false` | Kept in `_source`, **not** indexed |
| `strict` | Document **rejected** |

---

# Adding a field

```json
PUT /movies/_mapping
{
  "properties": {
    "dialogues": { "type": "text" }
  }
}

GET /movies/_mapping
```

- **Adding** a field: at any time, existing documents simply do not have it
- **Changing** the type of a field: impossible — new index + `_reindex` (chapter 7)
- The mapping is deleted with its index

---

# Field types

| Family | Types |
|---|---|
| Text | `text`, `keyword`, `match_only_text`, `wildcard`, `constant_keyword` |
| Numbers | `byte`, `short`, `integer`, `long`, `float`, `double`, `scaled_float`, `unsigned_long` |
| Dates | `date` (with `format`), `date_nanos` |
| Others | `boolean`, `ip`, `binary`, `*_range` |
| Objects | `object` (default), `nested`, `flattened` |
| Geo | `geo_point`, `geo_shape` |
| Specialized | `completion`, `search_as_you_type`, `dense_vector`, `semantic_text`, `percolator` |

<br />

> No `array` type: every field accepts one value or several.

---

# `text` or `keyword`?

| | `text` | `keyword` |
|---|---|---|
| Indexed | **Analyzed**: split into terms, lowercased… | **As is**, a single exact value |
| For | **Full-text** search: `match` | Exact **filter**, **sort**, **aggregation**: `term` |
| Example | Description, title, log message | Status, city, tag, email, ID |

<br />

- `"New York"` as `text` → `new`, `york`: found by `york`, **not** sortable
- `"New York"` as `keyword` → `New York`: found by `New York` only, sortable

---

# Multi-fields: both at once

```json
PUT /people
{
  "mappings": {
    "properties": {
      "directors": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }
      }
    }
  }
}
```

```json
GET /people/_search?q=directors:charlie
GET /people/_search?q=directors.keyword:"Charlie+Chaplin"
```

- `directors`: full text — `directors.keyword`: exact, sort, aggregations
- Also for other analyzers: `title.english`, `title.autocomplete`… (chapter 6)

---

# `index` and `doc_values`

```json
PUT /scripts
{
  "mappings": {
    "properties": {
      "dialogues":  { "type": "text", "index": false },
      "session_id": { "type": "keyword", "doc_values": false }
    }
  }
}
```

| Parameter | Structure | Needed for | `false` saves |
|---|---|---|---|
| `index` | Inverted index | **Searching** the field | Disk, indexing time |
| `doc_values` | Columnar storage | **Sorting**, **aggregating**, scripts | Disk |

> The field stays in `_source`: shown in the results, not searchable.

---

# Other useful parameters

```json
PUT /events
{
  "mappings": {
    "properties": {
      "status":   { "type": "keyword", "ignore_above": 256 },
      "metadata": { "type": "object", "enabled": false },
      "count":    { "type": "integer", "ignore_malformed": true },
      "first":    { "type": "text", "copy_to": "full_name" },
      "last":     { "type": "text", "copy_to": "full_name" },
      "full_name": { "type": "text" }
    }
  }
}
```

- `ignore_above`: longer strings are **not indexed** (kept in `_source`)
- `enabled: false`: the object is stored, **never parsed**
- `ignore_malformed`: a bad value is skipped instead of rejecting the document
- `copy_to`: one field to search several

---

# `_source`: the original document

- Every document is stored **as sent**, in `_source`: returned by `GET` and `_search`
- `_source` is needed by `_update`, `_update_by_query`, `_reindex`, highlighting

```json
PUT /no-source
{
  "mappings": {
    "_source": { "enabled": false }
  }
}
```

> Disabling it saves disk, but the index can **never** be reindexed or updated: almost
> never worth it.

---

# Synthetic `_source`

Rather than dropping `_source`, Elasticsearch **rebuilds** it from the doc values:

```json
PUT /synthetic
{
  "settings": {
    "index.mapping.source.mode": "synthetic"
  }
}
```

- Less disk, and `GET`, `_update`, `_reindex` keep working
- The rebuilt document may differ: keys sorted, arrays sorted and deduplicated
- Default of the **`logsdb`** index mode (`logs-*` data streams); otherwise a paid feature

---

# `object`: flattened arrays

```json
PUT /films
{
  "mappings": {
    "properties": {
      "directors": {
        "properties": {
          "firstName": { "type": "keyword" },
          "lastName":  { "type": "keyword" }
        }
      }
    }
  }
}

PUT /films/_doc/1
{ "directors": [ { "firstName": "Charlie", "lastName": "Chaplin" }, { "firstName": "Buster", "lastName": "Keaton" } ] }
```

Indexed as:

```text
directors.firstName: [ "Charlie", "Buster" ]
directors.lastName:  [ "Chaplin", "Keaton" ]
```

---

# `object`: the wrong match

The link between `firstName` and `lastName` is **lost**:

```json
GET /films/_search?q=directors.firstName:Charlie+AND+directors.lastName:Keaton
```

**Expected result**:

```json
{ "hits": { "total": { "value": 1 } } }
```

→ The film matches "Charlie Keaton", who does not exist.

---

# `nested`: one hidden document per object

```json
PUT /films_nested
{
  "mappings": {
    "properties": {
      "directors": {
        "type": "nested",
        "properties": {
          "firstName": { "type": "keyword" },
          "lastName":  { "type": "keyword" }
        }
      }
    }
  }
}
```

- Each object is indexed as a **separate** hidden Lucene document: the pairs are kept
- Queried with the **`nested`** query and aggregation
- Cost: more documents (limit: `index.mapping.nested_objects.limit`, 10 000 per document)

> Only when you query **several fields of the same object** together.

---

# Dynamic templates

Map the **new** fields by their name or detected type:

```json
PUT /metrics
{
  "mappings": {
    "dynamic_templates": [
      { "ids_as_keywords": {
          "match_mapping_type": "string", "match": "*_id",
          "mapping": { "type": "keyword" } } },
      { "counts_as_integers": {
          "match_mapping_type": "long", "match": "nb_*",
          "mapping": { "type": "integer" } } },
      { "strings_as_keywords": {
          "match_mapping_type": "string",
          "mapping": { "type": "keyword", "ignore_above": 256 } } }
    ]
  }
}
```

- Evaluated **in order**: the first match wins
- For semi-structured data (logs, labels) — validate the result with `GET /metrics/_mapping`

---

# Quiz

**We want to sort restaurants by city. Which type for `city`?**

- A) `text`
- B) `keyword`
- C) `object`
- D) `geo_point`

<v-click>

**Answer: B** — you sort and aggregate on an **exact**, non-analyzed value, stored in doc values.

</v-click>

---

# Quiz

**Each order holds an array of lines `{ product, quantity }`. We look for orders with 2 × "Keyboard". Which type for `lines`?**

- A) `object`
- B) `nested`
- C) `flattened`
- D) `keyword`

<v-click>

**Answer: B** — with `object`, "Keyboard" from one line and `2` from another would match.

</v-click>
