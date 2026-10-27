# Workshop 3 — Mapping, analyzers, aliases and templates: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Step 1

```json
PUT /blog_posts
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "analysis": {
      "analyzer": {
        "english_analyzer": { "type": "english" }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "english_analyzer",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "content": { "type": "text", "analyzer": "english_analyzer" },
      "author": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "published_date": { "type": "date", "format": "yyyy-MM-dd" },
      "views": { "type": "integer" },
      "rating": { "type": "float" },
      "author_location": { "type": "geo_point" },
      "metadata": { "type": "object", "enabled": false }
    }
  }
}
```

**Expected result**:

```json
{
  "acknowledged": true,
  "index": "blog_posts"
}
```

`tags` is a plain `keyword`: any field holds an array of values, there is no
array type.

## Step 2

```json
POST /blog_posts/_bulk
{ "index": { "_id": "1" } }
{ "title": "Getting Started with Elasticsearch", "content": "Elasticsearch is a distributed search engine built on Lucene", "author": "Jean Dupont", "tags": ["elasticsearch", "search", "tutorial"], "published_date": "2023-10-15", "views": 1250, "rating": 4.5, "author_location": { "lat": 48.8566, "lon": 2.3522 }, "metadata": { "source": "import", "version": 2 } }
{ "index": { "_id": "2" } }
{ "title": "Tuning Elasticsearch Performance", "content": "Best practices to optimize your cluster", "author": "Marie Martin", "tags": ["elasticsearch", "performance", "optimization"], "published_date": "2023-11-01", "views": 890, "rating": 4.8, "author_location": { "lat": 45.764, "lon": 4.8357 } }
{ "index": { "_id": "3" } }
{ "title": "Security in Elasticsearch 8.x", "content": "Security is enabled by default since Elasticsearch 8", "author": "Jean Dupont", "tags": ["elasticsearch", "security", "tutorial"], "published_date": "2023-11-10", "views": 2100, "rating": 4.9, "author_location": { "lat": 48.8566, "lon": 2.3522 } }
```

**Expected result**:

```json
{ "errors": false }
```

## Step 3

The four searches are given in the README; replayed here, once the posts exist:

```json
POST /blog_posts/_search
{
  "query": {
    "match": { "content": "optimizing performance" }
  }
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 1 }, "hits": [{ "_id": "2" }] } }
```

```json
POST /blog_posts/_search
{
  "query": {
    "term": { "author": "Jean Dupont" }
  }
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 2 }, "hits": [{ "_id": "1" }, { "_id": "3" }] } }
```

```json
POST /blog_posts/_search
{
  "query": {
    "range": { "published_date": { "gte": "2023-11-01" } }
  }
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 2 }, "hits": [{ "_id": "2" }, { "_id": "3" }] } }
```

```json
POST /blog_posts/_search
{
  "query": {
    "geo_distance": {
      "distance": "50km",
      "author_location": { "lat": 48.8566, "lon": 2.3522 }
    }
  }
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 2 }, "hits": [{ "_id": "1" }, { "_id": "3" }] } }
```

Why search 1 finds post 2: the english analyzer stems, `optimizing` and
`optimize` both become `optim`. `match` is an OR between the terms, so one term
in common is enough — `perform` is in no content.

```json
GET /blog_posts/_analyze
{
  "analyzer": "english_analyzer",
  "text": "optimizing performance"
}
```

**Expected result**:

```json
{ "tokens": [{ "token": "optim" }, { "token": "perform" }] }
```

```json
GET /blog_posts/_analyze
{
  "analyzer": "standard",
  "text": "optimizing performance"
}
```

**Expected result**:

```json
{ "tokens": [{ "token": "optimizing" }, { "token": "performance" }] }
```

`term` with `jean dupont` finds nothing: a `keyword` is not analysed, the
indexed value is `Jean Dupont` as is, case included.

`metadata.source`: not found — `enabled: false` keeps the object in `_source`
but indexes nothing of it.

The search of the README returns no hit:

```json
POST /blog_posts/_search
{
  "query": { "match": { "metadata.source": "import" } }
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 0 } } }
```

```json
GET /blog_posts/_doc/1?_source=metadata
```

**Expected result**:

```json
{ "_source": { "metadata": { "source": "import", "version": 2 } } }
```

## Step 4

```json
POST /blog_posts/_doc/4
{
  "title": "An unmapped field",
  "content": "Testing dynamic mapping",
  "author": "Test User",
  "tags": ["test"],
  "published_date": "2023-11-11",
  "views": 0,
  "rating": 3.0,
  "author_location": { "lat": 48.0, "lon": 2.0 },
  "new_field": "This value is indexed dynamically"
}

GET /blog_posts/_mapping/field/new_field
```

**Expected result**:

```json
{
  "blog_posts": {
    "mappings": {
      "new_field": {
        "mapping": {
          "new_field": {
            "type": "text",
            "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } }
          }
        }
      }
    }
  }
}
```

Forbidding unknown fields: `dynamic: strict` on the mapping. The fifth post is
then rejected with a `strict_dynamic_mapping_exception`.

```json
PUT /blog_posts/_mapping
{
  "dynamic": "strict"
}
```

<!-- ci: expect-error -->
```json
POST /blog_posts/_doc/5
{
  "title": "Another post",
  "other_field": "rejected"
}
```

`dynamic: false` would accept the document and keep the field in `_source`,
without indexing it.

## Step 6

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

## Step 7

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

## Step 8

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

## Step 9

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

## Step 10

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

## Step 11

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
