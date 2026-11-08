---
layout: cover
---

# 9 - Relevance

---

# Learning objectives

By the end of this sequence (**~30 min**), you will be able to:

- **Explain** how BM25 computes the `_score` of a document
- **Read** a score with the `_explain` API
- **Influence** the score with `boost`
- **Blend** text relevance with business values: `function_score`, `script_score`

---

# The score: BM25

Full text results are sorted by **relevance**, the `_score`. For each term, BM25 weighs:

- **TF** — the term frequency in the field: the more often, the better, **with saturation**
- **IDF** — how rare the term is in the index: a rare term weighs more
- **Field length** — a term in a short title weighs more than in a long text

The score of a query: the sum of the scores of its terms (and of its clauses).

> BM25 (*Best Matching 25*) is an evolution of TF/IDF: the 10th occurrence of
> a term adds much less than the 1st.

---

# BM25: the formula

```text
score(t, d) = IDF(t) × tf × (k1 + 1) / (tf + k1 × (1 − b + b × |d| / avgdl))
```

| Parameter | Default | Role |
|---|---|---|
| `k1` | 1.2 | Saturation of the term frequency: higher, TF keeps weighing longer |
| `b` | 0.75 | Length normalization: `0` disables it, `1` applies it fully |
| `|d|` / `avgdl` | | Length of the field / average length in the index |

- Tunable per field with a custom `similarity` in the mapping — rarely needed
- Statistics are computed **per shard**: with few documents and several
  shards, scores can be surprising (`?search_type=dfs_query_then_fetch` for tests)

---

# Reading a score: `_explain`

Why does this document get this score?

```json
POST /movies/_explain/2
{
  "query": { "match": { "title": "new york" } }
}
```

**Expected result**:

```json
{
  "_id": "2",
  "matched": true,
  "explanation": { "description": "sum of:" }
}
```

- A tree: the sum of the terms, each one `idf × tf`, with every value
- For all the hits: `"explain": true` in the `_search` body
- "New York, New York": `new` and `york` twice, in a short title → first

---

# Boosting a field

Give more weight to a field with `^`:

```json
POST /movies/_search
{
  "query": {
    "multi_match": {
      "query": "space adventure",
      "fields": ["title^3", "description"]
    }
  },
  "_source": ["title"]
}
```

- A match in `title` weighs **3 times** as much as in `description`
- Also in `query_string`: `"fields": ["title^3", "description"]`
- A boost is a multiplier, not a rank: test with real queries

---

# Boosting a clause

Every query accepts a `boost`:

```json
POST /movies/_search
{
  "query": {
    "bool": {
      "should": [
        { "match": { "description": { "query": "space", "boost": 2 } } },
        { "match": { "description": "adventure" } }
      ]
    }
  },
  "_source": ["title"]
}
```

**Expected result**:

```json
{ "hits": { "hits": [ { "_id": "4" }, { "_id": "5" }, { "_id": "3" } ] } }
```

- `boost` between 0 and 1: lowers the weight of a clause
- A negative boost is not allowed: to push results down, use the `boosting` query

---

# Pushing down: `boosting`

Keep the documents, but lower those that match a `negative` query:

```json
POST /movies/_search
{
  "query": {
    "boosting": {
      "positive": { "match": { "title": "york" } },
      "negative": { "term": { "genre": "musical" } },
      "negative_boost": 0.2
    }
  },
  "_source": ["title"]
}
```

- "New York, New York" is still there, but its score is multiplied by 0.2
- Unlike `must_not`, nothing is excluded

---

# Business relevance

Text relevance is not everything. A search engine often ranks with:

- **Popularity**: views, likes, sales
- **Quality**: rating, reviews
- **Freshness**: a recent document first
- **Proximity**: the closest one first

<br />

Two queries blend those values into the `_score`:

- `function_score`: ready-made functions, combined
- `script_score`: a Painless script, total freedom

---

# `function_score`: a numeric field

```json
POST /movies/_search
{
  "query": {
    "function_score": {
      "query": { "match": { "title": "new york" } },
      "field_value_factor": {
        "field": "rating",
        "modifier": "log1p",
        "missing": 1
      },
      "boost_mode": "multiply"
    }
  },
  "_source": ["title", "rating"]
}
```

- `field_value_factor`: `factor × modifier(field)` — `log1p`, `sqrt`, `ln2p`… soften large values
- `missing`: the value for a document without the field
- `boost_mode`: how to combine with the text score — `multiply`, `sum`, `replace`, `max`…

---

# `function_score`: decay functions

The further from an origin, the lower the score — `gauss`, `exp`, `linear`:

```json
POST /movies/_search
{
  "query": {
    "function_score": {
      "query": { "match": { "description": "adventure" } },
      "functions": [
        { "gauss": { "released": { "origin": "1980-01-01", "scale": "1825d", "decay": 0.5 } } }
      ],
      "boost_mode": "multiply"
    }
  },
  "_source": ["title", "released"]
}
```

- `origin`, `scale`, `decay`: at `scale` from `origin`, the factor is `decay`
- On dates (freshness: `"origin": "now"`), numbers, `geo_point` (`"scale": "2km"`)

---

# `function_score`: several functions

```json
POST /movies/_search
{
  "query": {
    "function_score": {
      "query": { "match_all": {} },
      "functions": [
        { "filter": { "term": { "genre": "science fiction" } }, "weight": 2 },
        { "field_value_factor": { "field": "likes", "modifier": "log1p" } }
      ],
      "score_mode": "sum",
      "boost_mode": "replace"
    }
  },
  "_source": ["title"]
}
```

- `filter` + `weight`: a fixed bonus for the documents that match the filter
- `score_mode`: how to combine the functions — `multiply` (default), `sum`, `avg`, `max`…
- `random_score`: a random order, stable with a `seed`

---

# `script_score`

Compute the score yourself, with Painless:

```json
POST /movies/_search
{
  "query": {
    "script_score": {
      "query": { "match": { "description": "space" } },
      "script": {
        "source": "_score * Math.log(2 + doc['views'].value)"
      }
    }
  },
  "_source": ["title", "views"]
}
```

- `_score`: the text score · `doc['field'].value`: the doc values of a field
- `params`: pass values instead of hard-coding them — the script is compiled once
- Also the query of vector search: `cosineSimilarity(…)` (chapter 13)

> The script runs on **every** matching document: keep the query selective
> and the script simple.

---

# Best practices

- **Measure** before tuning: a set of real queries and the results expected for them
- **Read** `_explain` when a result surprises you
- **Filter** first: `filter` narrows the documents to score
- **Pre-compute** at index time what can be (a popularity, a quality) rather than in a script
- **Prefer** `function_score` to `script_score` when it is enough
- **Document** the scoring rules: they are business rules
- `rank_eval` API: measures the quality of a set of queries (precision, recall…)

---

# Quiz

**Two movies match `"adventure"` once. Why can the one with the shorter description come first?**

- A) It was indexed first
- B) BM25 normalizes by field length: a term weighs more in a short field
- C) Its `_id` is smaller
- D) The default sort is by length

<v-click>

**Answer: B** — the `b` parameter of BM25: the same term counts more in a short text.

</v-click>
