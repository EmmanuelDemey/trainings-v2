# Workshop 3 — Mapping and analyzers

> Create an index with an explicit mapping, to control exactly how the data is indexed and how it can be searched.

**Topic**: General concepts — Mappings

## Context

The marketing team wants to index blog posts with specific needs: full-text search on the content, exact filtering on the tags and the author, and a geographic search on where the author lives.

Each step states **what** to do, not **how**: find the API in the documentation, try it, read the response, adjust. The expected result lets you check your own answer. Hints are folded — open them only once you are stuck.

## Setup

This workshop stands on its own. If a `blog_posts` index is already there, delete it:

```json
DELETE /blog_posts
```

Reference: [Field data types](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/field-data-types).

## Exercises

### Step 1: Create the index with an explicit mapping

Create the `blog_posts` index — one primary shard, no replica — with a custom analyzer named `english_analyzer`, of the built-in `english` type, and this mapping:

| Field | What it must allow |
|-------|--------------------|
| `title` | full-text search with `english_analyzer`, **and** an exact value in a sub-field `title.keyword` |
| `content` | full-text search with `english_analyzer` |
| `author` | exact filtering, sorting, aggregating |
| `tags` | exact filtering (a post has several) |
| `published_date` | date ranges, dates written `yyyy-MM-dd` |
| `views` | an integer |
| `rating` | a decimal number |
| `author_location` | geographic searches |
| `metadata` | an object kept in the document, but **not indexed at all** |

<details>
<summary>Hint</summary>

Analyzers are declared in the index **settings**, under `analysis.analyzer`, then referenced by name from a field. A field can be indexed in several ways with [multi-fields](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/multi-fields) (`fields`). For `metadata`, look at the [`enabled`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/enabled) parameter.

</details>

**Expected result**:

```json
{
  "acknowledged": true,
  "index": "blog_posts"
}
```

### Step 2: Index the blog posts

Index these three posts, with the IDs `1`, `2` and `3`:

```json
[
  {
    "title": "Getting Started with Elasticsearch",
    "content": "Elasticsearch is a distributed search engine built on Lucene",
    "author": "Jean Dupont",
    "tags": ["elasticsearch", "search", "tutorial"],
    "published_date": "2023-10-15",
    "views": 1250,
    "rating": 4.5,
    "author_location": { "lat": 48.8566, "lon": 2.3522 },
    "metadata": { "source": "import", "version": 2 }
  },
  {
    "title": "Tuning Elasticsearch Performance",
    "content": "Best practices to optimize your cluster",
    "author": "Marie Martin",
    "tags": ["elasticsearch", "performance", "optimization"],
    "published_date": "2023-11-01",
    "views": 890,
    "rating": 4.8,
    "author_location": { "lat": 45.764, "lon": 4.8357 }
  },
  {
    "title": "Security in Elasticsearch 8.x",
    "content": "Security is enabled by default since Elasticsearch 8",
    "author": "Jean Dupont",
    "tags": ["elasticsearch", "security", "tutorial"],
    "published_date": "2023-11-10",
    "views": 2100,
    "rating": 4.9,
    "author_location": { "lat": 48.8566, "lon": 2.3522 }
  }
]
```

<details>
<summary>Hint</summary>

One request per document with the [index API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-index), or all at once with [`_bulk`](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-bulk) — one action line, then one document line.

</details>

### Step 3: Put each field type to work

Four searches, one per type of field. The search API comes later in the training: the query is given. Read it, run it, compare with the expected result.

1. **Full text** — the posts whose `content` matches `optimizing performance`:

<!-- ci: skip -->
```json
GET /blog_posts/_search
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

2. **Exact value** — the posts whose `author` is exactly `Jean Dupont`:

<!-- ci: skip -->
```json
GET /blog_posts/_search
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

3. **Date** — the posts published on `2023-11-01` or later:

<!-- ci: skip -->
```json
GET /blog_posts/_search
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

4. **Geo** — the posts whose author lives within **50 km** of Paris:

<!-- ci: skip -->
```json
GET /blog_posts/_search
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

**Question**: the content of post 2 says `optimize`, not `optimizing`, and nothing about `performance`. Why does search 1 find it? Ask the [`_analyze` API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-indices-analyze) what `english_analyzer` does with `optimizing performance`, then what the `standard` analyzer does.

**Question**: what does the exact search on `author` return with `jean dupont`, in lower case? Why?

**Try**: search post 1 by its `metadata.source`. Is it found? Is `metadata` still in its `_source`?

<!-- ci: skip -->
```json
GET /blog_posts/_search
{
  "query": { "match": { "metadata.source": "import" } }
}
```

### Step 4: A field nobody mapped

Index this fourth post, ID `4` — it carries a `new_field` the mapping does not know:

```json
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
```

Then look at the mapping **of that field only**.

<details>
<summary>Hint</summary>

There is an API to [get the mapping of one field](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-indices-get-field-mapping), rather than the whole index.

</details>

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

**Try**: forbid the index to accept unknown fields from now on, then index a fifth post with an `other_field`. What happens?

## Success criteria

- An index created with an explicit mapping and a custom analyzer
- Full-text search goes through the `english` analysis
- Exact filtering on `author`, a date range, and a 50 km radius return the right posts
- You know what the dynamic mapping does with an unknown field, and how to forbid it

## Troubleshooting

**Problem**: `mapper_parsing_exception` when creating the index
→ Check the JSON, and that each `type` is a valid field type.

**Problem**: `analyzer [english_analyzer] has not been configured in mappings`
→ The analyzer must be declared in the `settings` of the same request.

**Problem**: the geo search fails, or finds nothing
→ The field must be a `geo_point` **before** the documents are indexed: a `lat`/`lon` pair mapped dynamically becomes two `float`s. Delete the index and start again.
