---
layout: cover
---

# 5 - Search and relevance

---

# Learning objectives

By the end of this sequence (**~45 min**, workshop included), you will be able to:

- **Write** a search with the Query DSL: full text and exact values
- **Combine** criteria with `bool`: `must`, `should`, `filter`, `must_not`
- **Tell** query context (score) from filter context (yes / no)
- **Read** a score, and **influence** it with `boost` and `function_score`

---

# The dataset

The examples of chapters 5 to 8 query the `restaurants` index:

```json
{
  "name": "Pizzeria Napoli",
  "description": "Wood-fired pizzas and homemade fresh pasta.",
  "cuisine": "italian",
  "city": "Paris",
  "location": { "lat": 48.8566, "lon": 2.3522 },
  "rating": 4.2,
  "price": 18,
  "opened": "2018-06-01"
}
```

`name`: `text` + `keyword` · `description`: `text`, `english` analyzer ·
`cuisine`, `city`: `keyword` · `location`: `geo_point`

---

# The shape of a search

```json
GET /restaurants/_search
{
  "query": { "match": { "description": "pasta" } },
  "size": 5,
  "_source": ["name", "city"]
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2, "relation": "eq" },
    "hits": [
      { "_id": "4", "_source": { "name": "La Trattoria", "city": "Lyon" } },
      { "_id": "2", "_source": { "name": "Pizzeria Napoli", "city": "Paris" } }
    ]
  }
}
```

- `hits.total`: the number of matching documents
- `hits.hits`: the first `size` ones, sorted by descending `_score`

---

# Full text: `match`

The query text is **analyzed** like the field, then searched term by term:

```json
GET /restaurants/_search
{
  "query": {
    "match": { "description": { "query": "fresh pasta", "operator": "and" } }
  }
}
```

| Variant | Effect |
|---|---|
| `match` | One term is enough (`or`); `operator: and` requires them all |
| `match_phrase` | The terms, **in order**, side by side |
| `multi_match` | Several fields: `"fields": ["name^3", "description"]` |
| `fuzziness: "AUTO"` | Tolerates typos |

---

# Exact values: `term`, `terms`, `range`

```json
GET /restaurants/_search
{
  "query": { "term": { "city": "Lyon" } }
}

GET /restaurants/_search
{
  "query": { "range": { "price": { "gte": 20, "lte": 40 } } }
}
```

- `term` on a `keyword`: **no analysis**, case matters: `"lyon"` finds nothing
- `term` on a `text`: the classic trap — the field is indexed lowercased
- `terms`: one value among a list; `exists`, `prefix`, `wildcard`, `ids`

---

# Combining: `bool`

```json
GET /restaurants/_search
{
  "query": {
    "bool": {
      "must":     [ { "match": { "description": "fish" } } ],
      "filter":   [ { "term": { "city": "Paris" } },
                    { "range": { "price": { "lte": 50 } } } ],
      "should":   [ { "range": { "rating": { "gte": 4.5 } } } ],
      "must_not": [ { "term": { "cuisine": "american" } } ]
    }
  }
}
```

| Clause | Must match | Counts in the score |
|---|---|---|
| `must` | ✅ | ✅ |
| `filter` | ✅ | ❌ — and **cached** |
| `should` | ❌ (bonus) when `must` or `filter` is present | ✅ |
| `must_not` | ❌ must not | ❌ |

---

# Query or filter?

- **Query context** — *"how well does this document match?"* → a `_score`
- **Filter context** — *"does it match, yes or no?"* → no score, **cache**

<br />

Rule of thumb:

- What the user **types** → `must` / `should` (full text)
- What they **tick** (city, price, dates, status) → `filter`

---

# The score: BM25

The `_score` of a document for a term depends on:

- **TF** — the term frequency in the field: the more often, the better (with saturation)
- **IDF** — how rare the term is in the index: a rare term weighs more
- **Field length** — a term in a short title weighs more than in a long text

```json
GET /restaurants/_explain/2
{ "query": { "match": { "description": "pasta" } } }
```

> Statistics are computed **per shard**: with few documents and several
> shards, scores can be surprising.

---

# Influencing the score: `boost`

Give more weight to a field, or to a clause:

```json
GET /restaurants/_search
{
  "query": {
    "multi_match": {
      "query": "pizza",
      "fields": ["name^3", "description"]
    }
  }
}

GET /restaurants/_search
{
  "query": {
    "bool": {
      "should": [
        { "match": { "description": { "query": "fish", "boost": 2 } } },
        { "match": { "description": "seafood" } }
      ]
    }
  }
}
```

---

# Influencing the score: `function_score`

Blend text relevance with a **business value** — here, the rating:

```json
GET /restaurants/_search
{
  "query": {
    "function_score": {
      "query": { "match": { "description": "cuisine" } },
      "field_value_factor": { "field": "rating", "modifier": "log1p" },
      "boost_mode": "multiply"
    }
  }
}
```

- `field_value_factor`: a numeric field (rating, popularity, stock)
- `gauss`, `exp`, `linear`: **decay** with distance or age
- `boost_mode`: `multiply`, `sum`, `replace`…

---

# Quiz

**Why put the "city = Paris" criterion in `filter` rather than in `must`?**

<v-clicks>

- A) `must` does not work with `term`
- B) No score computation, and the result is cached ✅
- C) `filter` sorts the results
- D) `must` ignores `keyword` fields

**Answer: B** — the criterion is binary: it has no reason to weigh in the score.

</v-clicks>

---

# Hands-on

## Workshop 3 - Search and relevance
