---
layout: cover
---

# 32 - Nested objects and parent/child

---

# Learning objectives

By the end of this sequence (**~45 min**), you will be able to:

- **Query** an array of objects with the `nested` query, and **show** the matching objects with `inner_hits`
- **Aggregate** and **sort** on nested objects: `nested`, `reverse_nested`
- **Model** a parent/child relation with the `join` field, and **query** it: `has_child`, `has_parent`, `parent_id`
- **Choose** between denormalising, `nested`, `join`, and a join at query time

> Chapter 5 showed **why**: an array of `object` is flattened, its pairs are lost.

---

# Relations in Elasticsearch

Elasticsearch is not a relational database: **no join** in the Query DSL. Four ways to model a relation:

| Approach | How | Read | Write |
|---|---|---|---|
| **Denormalise** | Copy the data into each document | Fastest | Update every copy |
| **`nested`** | Objects of an array, indexed as hidden documents | Fast | Reindex the whole document |
| **`join`** | Parents and children, separate documents of one index | Slower | One child alone |
| **Query-time join** | ES\|QL `LOOKUP JOIN`, `ENRICH`, the application | Depends | Independent |

> Default to **denormalising**. Reach for the others when it does not fit.

---

# The dataset: films and their actors

```json
GET /films/_mapping
```

**Expected result**:

```json
{
  "films": {
    "mappings": {
      "properties": {
        "actors": {
          "type": "nested",
          "properties": {
            "firstName": { "type": "keyword" },
            "lastName": { "type": "keyword" },
            "age": { "type": "integer" }
          }
        }
      }
    }
  }
}
```

- *Heat* (1995): Al Pacino, Robert De Niro · *The Irishman* (2019): De Niro, Pacino, Joe Pesci · *Casino* (1995): De Niro, Pesci
- `age`: the actor's age in the film

---

# Nested fields are not at the root

```json
POST /films/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "actors.firstName": "Al" } },
        { "term": { "actors.lastName": "Pacino" } }
      ]
    }
  }
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 0 } } }
```

- No hit: each actor is a **separate hidden document**, the root document has no `actors.*` field
- A `nested` field is only reached through the **`nested`** query, aggregation or sort

---

# The `nested` query

*Films where Al Pacino plays at 70 or older* — both conditions on **the same** actor:

```json
POST /films/_search
{
  "query": {
    "nested": {
      "path": "actors",
      "query": {
        "bool": {
          "must": [
            { "term": { "actors.lastName": "Pacino" } },
            { "range": { "actors.age": { "gte": 70 } } }
          ]
        }
      },
      "score_mode": "avg"
    }
  }
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 1 }, "hits": [ { "_id": "2" } ] } }
```

- `path`: the nested field · `score_mode`: how the scores of the matching objects add up (`avg`, `max`, `min`, `sum`, `none`)
- With `object`, the pairs are lost: `Al` + `De Niro` would match *Heat* — Al Pacino's first name, De Niro's last name

---

# `inner_hits`: which object matched?

```json
POST /films/_search
{
  "_source": ["title"],
  "query": {
    "nested": {
      "path": "actors",
      "query": { "range": { "actors.age": { "gte": 70 } } },
      "inner_hits": { "_source": ["actors.lastName", "actors.age"], "size": 5 }
    }
  }
}
```

**Expected result** (excerpt):

```json
{
  "hits": {
    "hits": [
      { "_id": "2",
        "inner_hits": { "actors": { "hits": { "total": { "value": 3 } } } } }
    ]
  }
}
```

- The document comes back whole; `inner_hits` lists the objects that matched, with their `_nested.offset`
- Also works with `has_child` and `has_parent`

---

# `nested` and `reverse_nested` aggregations

*Per actor, the years of their films*:

```json
POST /films/_search
{
  "size": 0,
  "aggs": {
    "actors": {
      "nested": { "path": "actors" },
      "aggs": {
        "by_actor": {
          "terms": { "field": "actors.lastName" },
          "aggs": {
            "films": {
              "reverse_nested": {},
              "aggs": { "years": { "terms": { "field": "year" } } }
            }
          }
        }
      }
    }
  }
}
```

- `nested`: steps **into** the objects — `doc_count` counts actors (7), not films
- `reverse_nested`: steps **back** to the root document, to aggregate on `year`

---

# The result

```json
POST /films/_search?filter_path=aggregations.actors.by_actor.buckets.key,aggregations.actors.by_actor.buckets.doc_count
{
  "size": 0,
  "aggs": {
    "actors": {
      "nested": { "path": "actors" },
      "aggs": { "by_actor": { "terms": { "field": "actors.lastName" } } }
    }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "actors": {
      "by_actor": {
        "buckets": [
          { "key": "De Niro", "doc_count": 3 },
          { "key": "Pacino", "doc_count": 2 },
          { "key": "Pesci", "doc_count": 2 }
        ]
      }
    }
  }
}
```

---

# Sorting on a nested field

*Films sorted by the age of De Niro in them, oldest first*:

```json
POST /films/_search
{
  "_source": ["title"],
  "sort": [
    {
      "actors.age": {
        "order": "desc",
        "mode": "max",
        "nested": {
          "path": "actors",
          "filter": { "term": { "actors.lastName": "De Niro" } }
        }
      }
    }
  ]
}
```

**Expected result** (excerpt):

```json
{ "hits": { "hits": [ { "_id": "2", "sort": [ 76 ] } ] } }
```

- `mode`: which value of the array (`min`, `max`, `avg`, `sum`) · `nested.filter`: which objects count

---

# The cost of `nested`

```json
GET /_cat/indices/films?h=index,docs.count&format=json
```

**Expected result**:

```json
[ { "index": "films", "docs.count": "10" } ]
```

- 3 films, **10** Lucene documents: 3 roots + 7 actors (`GET /films/_count` still says 3)
- Changing one actor **reindexes the whole film**, and all its actors
- Limits, per index: `index.mapping.nested_fields.limit` (**100** `nested` fields), `index.mapping.nested_objects.limit` (**10 000** objects per document)

> Thousands of objects per document, or objects updated alone: think `join`, or another model.

---

# The `join` field: parents and children

A forum: questions and their answers, **separate** documents in **one** index:

```json
PUT /forum
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "text": { "type": "text" },
      "author": { "type": "keyword" },
      "votes": { "type": "integer" },
      "post_relation": {
        "type": "join",
        "relations": { "question": "answer" }
      }
    }
  }
}
```

- `relations`: parent → child(ren): `"question": ["answer", "comment"]`, and on several levels (avoid)
- **One** `join` field per index

---

# Indexing parents and children

```json
POST /forum/_bulk?refresh=true
{"index":{"_id":"q1"}}
{"title":"How do I size my shards?","author":"alice","post_relation":"question"}
{"index":{"_id":"q2"}}
{"title":"Why is my cluster yellow?","author":"bob","post_relation":"question"}
{"index":{"_id":"a1","routing":"q1"}}
{"text":"Aim for 10 to 50 GB per shard","author":"carol","votes":12,"post_relation":{"name":"answer","parent":"q1"}}
{"index":{"_id":"a2","routing":"q1"}}
{"text":"Check the shard size with _cat/shards","author":"dave","votes":3,"post_relation":{"name":"answer","parent":"q1"}}
{"index":{"_id":"a3","routing":"q2"}}
{"text":"A replica cannot be allocated on a single node","author":"carol","votes":8,"post_relation":{"name":"answer","parent":"q2"}}
```

- A child names its `parent`, and is **routed** to the parent's shard: `routing` is **mandatory**
- Parent and children must live on the same shard — that is what makes the join possible

---

# Routing is mandatory

<!-- ci: expect-error -->
```json
PUT /forum/_doc/a4
{ "text": "Restart the node", "post_relation": { "name": "answer", "parent": "q2" } }
```

Elasticsearch answers `400`: `[routing] is missing for join field [post_relation]`.

- Same for `GET`, `_update`, `DELETE` of a child: pass `?routing=<parent id>`
- Usually the parent's `_id`; any value works, as long as the whole family shares it

---

# `has_child`: parents by their children

*The questions with at least 2 answers*:

```json
POST /forum/_search
{
  "query": {
    "has_child": {
      "type": "answer",
      "query": { "match_all": {} },
      "min_children": 2
    }
  }
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 1 }, "hits": [ { "_id": "q1" } ] } }
```

- `min_children`, `max_children`: how many children must match
- `score_mode`: `none` (default), `avg`, `max`, `min`, `sum` — the parent's score from its children's

---

# `has_parent` and `parent_id`

*The answers to a question about « yellow »*:

```json
POST /forum/_search
{
  "query": {
    "has_parent": {
      "parent_type": "question",
      "query": { "match": { "title": "yellow" } }
    }
  }
}
```

**Expected result**:

```json
{ "hits": { "hits": [ { "_id": "a3" } ] } }
```

*All the answers of question `q1`*:

```json
POST /forum/_search
{ "query": { "parent_id": { "type": "answer", "id": "q1" } } }
```

**Expected result**:

```json
{ "hits": { "total": { "value": 2 } } }
```

---

# The `children` aggregation

*Who answers the questions of whom?*

```json
POST /forum/_search
{
  "size": 0,
  "query": { "term": { "post_relation": "question" } },
  "aggs": {
    "askers": {
      "terms": { "field": "author" },
      "aggs": {
        "answers": {
          "children": { "type": "answer" },
          "aggs": { "responders": { "terms": { "field": "author" } } }
        }
      }
    }
  }
}
```

- `children`: from parent buckets to their children · `parent`: the other way round
- The `join` field is queryable as a keyword: `term` on `post_relation` filters by relation

---

# The cost of `join`

- **Slower** searches: the join is resolved at query time, with global ordinals of the `join` field
  (built at refresh, or `eager_global_ordinals`)
- **Same shard** for a whole family: one huge family makes a hot shard
- Not a relational model: no join across indices, one level at a time, no SQL

<br />

> Elastic's advice: use `join` only when the children **change much more often** than the parents,
> or when one parent has **very many** children (more than `nested` allows).

---

# Joining at query time instead

When the related data is **another index**, don't force it into one document:

<!-- ci: skip -->
```json
POST /_query?format=txt
{
  "query": """
    FROM orders
    | LOOKUP JOIN customers ON customer_id
    | STATS revenue = SUM(amount) BY customer_country
  """
}
```

- **ES\|QL `LOOKUP JOIN`** (chapter 12): a left join on a `lookup` index — for analysis, reporting
- **`ENRICH`** (chapter 31): the same, through a policy — also at ingest time
- **The application**: two searches, the second with a `terms` filter on the IDs of the first
- **`terms` lookup**: `{ "terms": { "user_id": { "index": "groups", "id": "admins", "path": "members" } } }`

---

# Which model?

| Need | Model |
|---|---|
| A few related values, rarely changed (category name, author name) | **Denormalise** |
| An array of objects whose fields are queried **together** (a film's actors, an order's lines) | **`nested`** |
| An array of objects, each field queried alone | `object` (default) |
| Many children, updated **alone and often** (answers, comments, prices per shop) | **`join`** |
| Key/value pairs with unknown keys | `flattened` |
| Analysis across two datasets | ES\|QL `LOOKUP JOIN` |

---

# Quiz

**A product has 50 000 reviews, added all day long. How do you model them?**

- A) A `nested` field `reviews` in the product document
- B) An array of `object` in the product document
- C) A `join` field: products as parents, reviews as children
- D) A `flattened` field

<v-click>

**Answer: C** — `nested` stops at 10 000 objects per document, and each new review would reindex the product and all its reviews. With `join`, a review is indexed alone, routed to its product's shard. (Or two indices, joined by the application.)

</v-click>

---

# Quiz

**Why does a child need a `routing`?**

- A) To find its parent across clusters
- B) So that parent and children land on the same shard, where the join is resolved
- C) To speed up the indexing
- D) It does not: the routing is optional

<v-click>

**Answer: B** — `has_child`, `has_parent` and `children` work shard by shard: a child on another shard than its parent would never meet it.

</v-click>
