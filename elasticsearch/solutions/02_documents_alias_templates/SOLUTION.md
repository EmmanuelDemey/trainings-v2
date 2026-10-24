# Workshop 2 — Documents, bulk, aliases and templates: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Part A: The life of a document

### Step 1

```json
PUT /books-2025
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}
```

### Step 2

```json
PUT /books-2025/_doc/1
{
  "title": "The Little Prince",
  "author": "Antoine de Saint-Exupéry",
  "year": 1943,
  "stock": 3
}
```

**Expected result**:

```json
{
  "_index": "books-2025",
  "_id": "1",
  "_version": 1,
  "result": "created"
}
```

### Step 3

```json
POST /books-2025/_doc
{
  "title": "The Stranger",
  "author": "Albert Camus",
  "year": 1942,
  "stock": 5
}
```

**Expected result**:

```json
{
  "_index": "books-2025",
  "result": "created"
}
```

A business ID (an ISBN…) when the document has one: indexing it again overwrites
it instead of creating a duplicate, and it can be read back without a search. A
generated ID for what has no natural key (logs, events): indexing is a bit
faster, as Elasticsearch need not check whether the ID already exists.

### Step 4

```json
GET /books-2025/_doc/1
```

**Expected result**:

```json
{
  "_id": "1",
  "found": true,
  "_source": { "title": "The Little Prince", "stock": 3 }
}
```

### Step 5

```json
POST /books-2025/_update/1
{
  "doc": { "stock": 2 }
}
```

**Expected result**:

```json
{
  "_version": 2,
  "result": "updated"
}
```

```json
GET /books-2025/_doc/1
```

**Expected result**:

```json
{
  "_version": 2,
  "_source": { "title": "The Little Prince", "stock": 2 }
}
```

### Step 6

```json
POST /books-2025/_update/1
{
  "script": {
    "source": "ctx._source.stock -= params.sold",
    "params": { "sold": 1 }
  }
}
```

```json
GET /books-2025/_doc/1?_source=stock
```

**Expected result**:

```json
{
  "_source": { "stock": 1 }
}
```

The value goes in `params`, not in the source: a script is compiled once and
cached, whatever the parameters.

### Step 7

```json
PUT /books-2025/_doc/1
{
  "title": "The Little Prince"
}
```

```json
GET /books-2025/_doc/1
```

**Expected result**:

```json
{
  "_version": 4,
  "_source": { "title": "The Little Prince" }
}
```

`author`, `year` and `stock` are gone: an index request replaces the whole
`_source`. Only `_update` merges.

### Step 8

```json
DELETE /books-2025/_doc/1
```

**Expected result**:

```json
{
  "result": "deleted"
}
```

<!-- ci: expect-error -->
```json
GET /books-2025/_doc/1
```

A `404`, with `"found": false`.

## Part B: Bulk indexing

### Step 9

```json
POST /books-2025/_bulk?refresh=true
{"index":{"_id":"9782070612758"}}
{"title":"The Little Prince","author":"Antoine de Saint-Exupéry","year":1943,"stock":3}
{"index":{"_id":"9782070360024"}}
{"title":"The Stranger","author":"Albert Camus","year":1942,"stock":5}
{"index":{"_id":"9782070368228"}}
{"title":"The Plague","author":"Albert Camus","year":1947,"stock":2}
{"create":{"_id":"9782253006329"}}
{"title":"Germinal","author":"Émile Zola","year":1885,"stock":4}
{"update":{"_id":"9782070360024"}}
{"doc":{"stock":6}}
```

**Expected result**:

```json
{
  "errors": false,
  "items": [
    { "index": { "_id": "9782070612758", "status": 201 } },
    { "index": { "_id": "9782070360024", "status": 201 } },
    { "index": { "_id": "9782070368228", "status": 201 } },
    { "create": { "_id": "9782253006329", "status": 201 } },
    { "update": { "_id": "9782070360024", "status": 200 } }
  ]
}
```

### Step 10

```json
POST /books-2025/_bulk?refresh=true
{"create":{"_id":"9782253006329"}}
{"title":"Germinal","author":"Émile Zola","year":1885,"stock":4}
{"index":{"_id":"9782253004226"}}
{"title":"Madame Bovary","author":"Gustave Flaubert","year":1857,"stock":1}
```

**Expected result**:

```json
{
  "errors": true,
  "items": [
    { "create": { "status": 409 } },
    { "index": { "status": 201 } }
  ]
}
```

The HTTP status of the whole request is `200`: a client must read `errors`,
then walk the `items` to find the failed ones — in the order of the actions — and
decide for each: retry it (`429`, too many requests), or report it (`409`,
`400`…).

### Step 11

Given in the README; replayed here, once the index exists:

```json
GET /books-2025/_search
{
  "query": { "match_all": {} }
}
```

**Expected result**:

```json
{
  "hits": { "total": { "value": 6 } }
}
```

The book with a generated ID from step 3, and the five of the catalog.

## Part C: Aliases

### Step 12

```json
POST /_aliases
{
  "actions": [
    { "add": { "index": "books-2025", "alias": "books" } }
  ]
}
```

```json
GET /books/_count
```

**Expected result**:

```json
{
  "count": 6
}
```

### Step 13

```json
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "books-2025",
        "alias": "books-camus",
        "filter": { "match": { "author": "Camus" } }
      }
    }
  ]
}
```

```json
GET /books-camus/_count
```

**Expected result**:

```json
{
  "count": 3
}
```

## Part D: Index templates

### Step 14

```json
PUT /_index_template/books
{
  "index_patterns": ["books-*"],
  "template": {
    "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
    "mappings": {
      "properties": {
        "title":  { "type": "text", "analyzer": "english" },
        "author": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
        "year":   { "type": "integer" },
        "stock":  { "type": "integer" }
      }
    },
    "aliases": { "books-next": {} }
  }
}
```

### Step 15

```json
POST /_index_template/_simulate_index/books-2026
```

**Expected result**:

```json
{
  "template": {
    "mappings": {
      "properties": {
        "title": { "type": "text", "analyzer": "english" }
      }
    },
    "aliases": { "books-next": {} }
  }
}
```

`books-camus` would not match: the template pattern is `books-*`, but templates
apply to indices, not aliases — and `books-camus` is an alias.

### Step 16

```json
POST /books-2026/_bulk?refresh=true
{"index":{"_id":"9782070612758"}}
{"title":"The Little Prince","author":"Antoine de Saint-Exupéry","year":1943,"stock":10}
{"index":{"_id":"9782070360024"}}
{"title":"The Stranger","author":"Albert Camus","year":1942,"stock":8}
```

```json
GET /books-2026/_mapping
```

**Expected result**:

```json
{
  "books-2026": {
    "mappings": {
      "properties": {
        "title": { "type": "text", "analyzer": "english" },
        "year": { "type": "integer" }
      }
    }
  }
}
```

`books-2025` keeps its dynamic mapping (`year` is a `long`, `title` uses the
standard analyzer): it existed before the template, which only applies when an
index is created.

### Step 17

```json
POST /_aliases
{
  "actions": [
    { "remove": { "index": "books-2025", "alias": "books" } },
    { "add":    { "index": "books-2026", "alias": "books" } }
  ]
}
```

```json
GET /books/_count
```

**Expected result**:

```json
{
  "count": 2
}
```

```json
GET /_alias/books
```

**Expected result**:

```json
{
  "books-2026": { "aliases": { "books": {} } }
}
```

Two separate calls would leave a moment where `books` points at nothing (remove
first) or at both indices (add first, so every book counted twice).
