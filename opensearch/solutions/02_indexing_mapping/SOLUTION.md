# Workshop 2 — Indexing and mapping: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Step 1

```json
PUT /books_guess/_doc/1
{ "title": "The Little Prince", "author": "Antoine de Saint-Exupéry", "isbn": "9782070612758", "price": 7.5, "published": "1943-04-06", "pages": 96, "tags": ["tale", "children"] }

GET /books_guess/_mapping
```

**Expected result**:

```json
{
  "books_guess": {
    "mappings": {
      "properties": {
        "isbn": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
        "pages": { "type": "long" },
        "price": { "type": "float" },
        "published": { "type": "date" }
      }
    }
  }
}
```

`isbn` is indexed twice — analyzed as `text`, and as is as `keyword` — although
it is only ever searched exactly. `pages` as `long`: 8 bytes for a page count.
`tags`, `title`, `author`: `text` + `keyword` too, to be decided.

## Step 2

<!-- ci: expect-error -->
```json
PUT /books_guess/_doc/2
{ "title": "Les Misérables", "price": "out of print" }
```

## Step 3

```json
PUT /books_v1
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "title":     { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "author":    { "type": "text" },
      "isbn":      { "type": "keyword" },
      "price":     { "type": "float" },
      "published": { "type": "date" },
      "pages":     { "type": "integer" },
      "tags":      { "type": "keyword" }
    }
  }
}
```

**Expected result**:

```json
{ "acknowledged": true, "index": "books_v1" }
```

## Step 4

```json
POST /books_v1/_bulk?refresh=true
{ "index": { "_id": "1" } }
{ "title": "The Little Prince", "author": "Antoine de Saint-Exupéry", "isbn": "9782070612758", "price": 7.5, "published": "1943-04-06", "pages": 96, "tags": ["tale", "children"] }
{ "index": { "_id": "2" } }
{ "title": "The Stranger", "author": "Albert Camus", "isbn": "9782070360024", "price": 6.9, "published": "1942-05-19", "pages": 184, "tags": ["novel", "absurdism"] }
{ "index": { "_id": "3" } }
{ "title": "Germinal", "author": "Émile Zola", "isbn": "9782253004226", "price": 8.2, "published": "1885-03-01", "pages": 592, "tags": ["novel", "naturalism"] }

GET /books_v1/_count
```

**Expected result**:

```json
{ "count": 3 }
```

With an unknown field, `strict_dynamic_mapping_exception`:

<!-- ci: expect-error -->
```json
PUT /books_v1/_doc/4
{ "title": "Nana", "editor": "Charpentier" }
```

## Step 5

```json
PUT /books_v2
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "title":     { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "author":    { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "isbn":      { "type": "keyword" },
      "price":     { "type": "float" },
      "published": { "type": "date" },
      "pages":     { "type": "integer" },
      "tags":      { "type": "keyword" }
    }
  }
}

POST /_reindex?refresh=true
{ "source": { "index": "books_v1" }, "dest": { "index": "books_v2" } }

POST /_aliases
{ "actions": [ { "add": { "index": "books_v2", "alias": "books" } } ] }

GET /books/_search
{ "query": { "match": { "author": "camus" } } }
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [ { "_index": "books_v2", "_id": "2" } ]
  }
}
```

Switching with no gap: `remove` the old one and `add` the new one **in the same**
`_aliases` call — the actions are applied atomically.
