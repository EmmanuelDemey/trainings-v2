---
layout: cover
---

# 8 - Search

---

# Learning objectives

By the end of this sequence (**~50 min**), you will be able to:

- **Write** a search with the Lucene syntax, then with the Query DSL
- **Search** full text with `match`, `match_phrase`, `multi_match`
- **Search** exact values with `term`, `terms`, `range`, and tolerate typos
- **Combine** criteria with `bool`: `must`, `should`, `filter`, `must_not`
- **Tell** query context (score) from filter context (yes / no)

---

# The dataset

The examples of chapters 8 to 11 query a `movies` index:

```json
{
  "title": "Escape from New York",
  "description": "An adventure in a New York turned into a prison",
  "year": 1981,
  "duration": 99,
  "released": "1981-07-10",
  "genre": "action",
  "rating": 7.1,
  "views": 400,
  "likes": 120,
  "location": { "lat": 40.71, "lon": -74.01 }
}
```

`title`: `text` + `title.keyword` · `description`: `text` · `genre`: `keyword` ·
`year`, `duration`, `views`, `likes`: `integer` · `rating`: `float` ·
`released`: `date` · `location`: `geo_point`

---

# The `_search` endpoint

One index, several, or a pattern — aliases work too:

```json
POST /movies/_search
POST /movies,albums/_search
POST /mov*/_search
```

- Without a body: `match_all`, the first **10** documents
- `GET` with a body works in Dev Tools; `POST` is safer for HTTP clients and proxies
- `_search` on no index (`POST /_search`) searches **every** index: avoid it

---

# The shape of a search

```json
POST /movies/_search
{
  "query": { "match": { "title": "york" } },
  "from": 0,
  "size": 2,
  "_source": ["title", "year"]
}
```

| Key | Role |
|---|---|
| `query` | Which documents match, and how well (`_score`) |
| `from` / `size` | Pagination: skip `from` hits, return `size` (default 10) |
| `_source` | The fields to return: a list, `false`, or `includes` / `excludes` |

---

# Reading the response

```json
{
  "took": 3,
  "timed_out": false,
  "_shards": { "total": 1, "successful": 1, "skipped": 0, "failed": 0 },
  "hits": {
    "total": { "value": 3, "relation": "eq" },
    "max_score": 0.75,
    "hits": [
      { "_index": "movies", "_id": "2", "_score": 0.75,
        "_source": { "title": "New York, New York", "year": 1977 } }
    ]
  }
}
```

- `hits.total`: the matching documents — counted exactly up to **10,000**, then `"relation": "gte"`
- `"track_total_hits": true` counts them all, at a cost
- `hits.hits`: the page, sorted by descending `_score`

---

# The Lucene syntax

The whole query in the URL, with the `q` parameter:

```json
GET /movies/_search?q=titanic
GET /movies/_search?q=title:titanic
GET /movies/_search?q=title:york+AND+year:[1970+TO+1990]
GET /movies/_search?q=york&sort=year:desc&size=5&from=0
```

- `+` stands for a space in the URL
- Operators `AND`, `OR`, `NOT`, ranges `[a TO b]`, wildcards `tit*`
- Handy for a quick check, and what Kibana's search bar speaks (KQL is close)

> Hard to read, to escape and to maintain: in an application, use the **Query DSL**.

---

# The Query DSL

A JSON tree of queries, in the body:

```json
POST /movies/_search
{
  "query": {
    "match_all": {}
  }
}
```

Two families of leaf queries:

- **Full text** (`match`, `match_phrase`, `multi_match`…): the query text is **analyzed**
- **Term level** (`term`, `range`, `fuzzy`…): the value is used **as is**

And compound queries that combine them: `bool`, `constant_score`, `function_score`…

---

# Full text: how it works

1. The query text goes through the **analyzer of the field** (chapter 6)
2. Each resulting term is looked up in the **inverted index**
3. The matching documents get a **score** (BM25, chapter 9)

<br />

`"title": "New YORK"` with the `standard` analyzer → `new`, `york`

> The same analyzer at index time and at search time: that is what makes
> `"NEW york"` find `"New York, New York"`.

---

# Full text: `match`

```json
POST /movies/_search
{
  "query": {
    "match": { "title": "new york" }
  },
  "_source": ["title"]
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 3, "relation": "eq" },
    "hits": [ { "_id": "2" }, { "_id": "3" }, { "_id": "6" } ]
  }
}
```

- One term is enough: `new` **or** `york`
- The more terms a document holds, the higher its score

---

# `match`: every term, or some of them

```json
POST /movies/_search
{
  "query": {
    "match": {
      "description": { "query": "space ship adventure", "operator": "and" }
    }
  }
}
```

| Option | Effect |
|---|---|
| `"operator": "or"` (default) | One term is enough |
| `"operator": "and"` | Every term is required |
| `"minimum_should_match": 2` or `"75%"` | At least that many terms |
| `"fuzziness": "AUTO"` | Tolerates typos on each term |

---

# Full text: `match_phrase`

The terms, **in order**, side by side:

```json
POST /movies/_search
{
  "query": {
    "match_phrase": { "description": "space battles" }
  }
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 1, "relation": "eq" }, "hits": [ { "_id": "4" } ] } }
```

- `"slop": 2`: allows terms to be up to 2 positions apart
- `match_phrase_prefix`: the last term is a prefix — "search as you type"

---

# Full text: `multi_match`

The same text in several fields:

```json
POST /movies/_search
{
  "query": {
    "multi_match": {
      "query": "new york adventure",
      "fields": ["title^2", "description"]
    }
  }
}
```

- `title^2`: a match in the title weighs twice as much
- `"type": "best_fields"` (default): the score of the best field
- `"type": "most_fields"`: adds up the fields · `cross_fields`: the fields as one big field
- `"type": "phrase"`: a `match_phrase` on each field

---

# Full text: `query_string`

The Lucene syntax, in the body:

```json
POST /movies/_search
{
  "query": {
    "query_string": {
      "query": "(new york) AND NOT gangs",
      "default_field": "title"
    }
  }
}
```

- Powerful for **expert** users and internal tools
- A syntax error makes the request fail
- `simple_query_string`: a tolerant syntax (`+`, `|`, `-`, `"…"`), never fails — safer for a search box

---

# Exact values: `term`

The value is **not analyzed**: it must be exactly the indexed term.

```json
POST /movies/_search
{
  "query": {
    "term": { "genre": "science fiction" }
  }
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 2, "relation": "eq" } } }
```

- On a `keyword`: the whole value, case included — `"Science Fiction"` finds nothing
- On a `text`: the trap — `{ "term": { "title": "Titanic" } }` finds nothing, the index holds `titanic`

> `term` for `keyword`, numbers, dates, booleans. `match` for `text`.

---

# Exact values: `terms`, `exists`, `ids`

```json
POST /movies/_search
{
  "query": {
    "terms": { "genre": ["drama", "thriller"] }
  }
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 2, "relation": "eq" }, "hits": [ { "_id": "1" }, { "_id": "7" } ] } }
```

- `terms`: one value among a list (an `IN` in SQL)
- `exists`: the field has a value — `{ "exists": { "field": "rating" } }`
- `ids`: by `_id` — `{ "ids": { "values": ["1", "4"] } }`

---

# Ranges of numbers: `range`

```json
POST /movies/_search
{
  "query": {
    "range": {
      "duration": { "gte": 100, "lte": 130 }
    }
  },
  "_source": ["title", "duration"]
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 3, "relation": "eq" } } }
```

- `gt`, `gte`, `lt`, `lte`: any combination, one bound is enough
- Works on numbers, dates, `keyword` (lexicographic order), IP addresses

---

# Ranges of dates: date math

```json
POST /movies/_search
{
  "query": {
    "range": {
      "released": { "gte": "1977-01-01", "lt": "1980-01-01" }
    }
  }
}

POST /movies/_search
{
  "query": {
    "range": {
      "released": { "gte": "now-30y/y", "lt": "now/d" }
    }
  }
}
```

- `now-1d`, `now-1M`, `now+1h`: relative dates
- `/d`, `/M`, `/y`: rounded to the day, the month, the year — cacheable
- `"format": "dd/MM/yyyy"`, `"time_zone": "Europe/Paris"` when needed

---

# Typos: `fuzzy`

Finds terms within an **edit distance** (Levenshtein: insert, delete, replace, swap):

```json
POST /movies/_search
{
  "query": {
    "fuzzy": { "title": { "value": "tiatnic" } }
  }
}
```

**Expected result**:

```json
{ "hits": { "hits": [ { "_id": "1" } ] } }
```

- `"fuzziness": "AUTO"` (default): 0 edit up to 2 chars, 1 up to 5, 2 beyond
- A term-level query: the value is not analyzed — lowercase it yourself
- In practice, prefer `match` with `"fuzziness": "AUTO"`

---

# Patterns: `wildcard`, `prefix`, `regexp`

```json
POST /movies/_search
{
  "query": {
    "wildcard": { "title": { "value": "tita*c" } }
  }
}
```

- `*`: any characters, `?`: one character
- `prefix`: `{ "prefix": { "title": "gang" } }`
- `regexp`: a regular expression on the terms

> A pattern that **starts** with `*` scans every term of the index: slow.
> For "contains" searches, look at the `wildcard` field type or n-grams (chapter 6).

---

# Combining: `bool`

| Clause | Must match | Counts in the score |
|---|---|---|
| `must` | ✅ | ✅ |
| `filter` | ✅ | ❌ — and **cached** |
| `should` | ❌ (bonus) when `must` or `filter` is present | ✅ |
| `must_not` | ❌ must not | ❌ |

<br />

- Each clause takes one query or a list
- A `bool` can hold other `bool`s: `(A AND B) OR C`
- Without `must` nor `filter`, at least one `should` must match

---

# `bool`: an example

```json
POST /movies/_search
{
  "query": {
    "bool": {
      "must":     [ { "match": { "description": "adventure" } } ],
      "filter":   [ { "range": { "year": { "gte": 1970, "lt": 1990 } } } ],
      "should":   [ { "term": { "genre": "science fiction" } } ],
      "must_not": [ { "range": { "duration": { "lt": 100 } } } ]
    }
  },
  "_source": ["title"]
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 1, "relation": "eq" }, "hits": [ { "_id": "4" } ] } }
```

"Escape from New York" matches `must` and `filter`, but lasts 99 minutes.

---

# `bool`: `minimum_should_match`

At least N `should` clauses must match:

```json
POST /movies/_search
{
  "query": {
    "bool": {
      "filter": [ { "term": { "year": 1977 } } ],
      "should": [
        { "match": { "description": "space" } },
        { "match": { "description": "love" } },
        { "match": { "title": "york" } }
      ],
      "minimum_should_match": 2
    }
  }
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 1, "relation": "eq" }, "hits": [ { "_id": "2" } ] } }
```

> With a `filter` and no `minimum_should_match`, the `should` clauses only
> **boost** the score: every 1977 movie would come back.

---

# Query or filter?

- **Query context** — *"how well does this document match?"* → a `_score`
- **Filter context** — *"does it match, yes or no?"* → no score, **cached**

<br />

Rule of thumb:

- What the user **types** → `must` / `should` (full text)
- What they **tick** (genre, year, dates, status) → `filter`

<br />

> A filter is faster: no score to compute, and the result of a frequent filter
> is kept in the node query cache.

---

# Filter only: `constant_score`

When nothing should be scored, every hit gets the same score:

```json
POST /movies/_search
{
  "query": {
    "constant_score": {
      "filter": { "term": { "genre": "science fiction" } },
      "boost": 1.0
    }
  }
}
```

- Same result as a `bool` with a lone `filter` (score 0)
- Useful inside a `should` to give a **fixed** bonus

---

# Quiz

**`{ "term": { "title": "Titanic" } }` returns nothing, though the movie exists. Why?**

- A) `term` only works on numbers
- B) `title` is a `text`: the index holds `titanic`, and `term` does not analyze `Titanic`
- C) The index must be refreshed
- D) `term` needs a `bool` around it

<v-click>

**Answer: B** — use `match` on `title`, or `term` on `title.keyword` with the exact value.

</v-click>

---

# Quiz

**Why put the "year between 1970 and 1990" criterion in `filter` rather than in `must`?**

- A) `must` does not accept `range`
- B) No score computation, and the result can be cached
- C) `filter` sorts the results by year
- D) `must` ignores numeric fields

<v-click>

**Answer: B** — the criterion is binary: it has no reason to weigh in the score.

</v-click>
