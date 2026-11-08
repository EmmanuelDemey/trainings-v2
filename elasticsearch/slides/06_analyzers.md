---
layout: cover
---

# 6 - Analyzers

---

# Learning objectives

By the end of this sequence (**~40 min**), you will be able to:

- **Describe** the three steps of an analyzer: character filters, tokenizer, token filters
- **Test** any analysis with the `_analyze` API
- **Pick** a built-in analyzer: `standard`, `keyword`, a language analyzer…
- **Build** a custom analyzer and **apply** it to a field
- **Use** a different analyzer at search time, for autocomplete

---

# Text analysis

When a `text` field is indexed, its value is turned into **terms** (tokens):

![](/images/analyzer.png)

- **Character filters** — transform the raw text (strip HTML, replace characters)
- **Tokenizer** — split the text into tokens (exactly **one**)
- **Token filters** — transform, add or remove tokens (lowercase, stop words, synonyms…)

---

# The analysis pipeline

```text
"<p>The Quick Brown FOX!</p>"
        ↓
  [Character filters]  →  "The Quick Brown FOX!"              (html_strip)
        ↓
     [Tokenizer]       →  ["The", "Quick", "Brown", "FOX"]    (standard)
        ↓
   [Token filters]     →  ["quick", "brown", "fox"]           (lowercase, then stop)
```

<br />

> The **query** of a `match` goes through the same analyzer: the terms searched are
> the terms indexed.

---

# The `_analyze` API

```json
GET /_analyze
{
  "analyzer": "standard",
  "text": "The Quick Brown FOX!"
}
```

**Expected result**:

```json
{ "tokens": [ { "token": "the" }, { "token": "quick" }, { "token": "brown" }, { "token": "fox" } ] }
```

- Each token comes with its `position` and offsets
- The first tool to reach for when a search "does not find"

---

# `_analyze` on a field

The analyzer the mapping sets for that field:

```json
GET /movies/_analyze
{
  "field": "title",
  "text": "The Dark Knight Rises"
}
```

**Expected result**:

```json
{ "tokens": [ { "token": "dark" }, { "token": "knight" }, { "token": "rise" } ] }
```

→ `title` uses the `english` analyzer: stop word removed, `Rises` stemmed.

---

# `_analyze` with components

Assemble a pipeline on the fly, before putting it in a mapping:

```json
GET /_analyze
{
  "char_filter": ["html_strip"],
  "tokenizer": "standard",
  "filter": ["lowercase", "asciifolding"],
  "text": "<p>Café <b>Résumé</b></p>"
}
```

**Expected result**:

```json
{ "tokens": [ { "token": "cafe" }, { "token": "resume" } ] }
```

---

# Built-in analyzers

| Analyzer | `"The Quick Brown FOX!"` gives |
|---|---|
| `standard` (default) | `the`, `quick`, `brown`, `fox` |
| `simple` | `the`, `quick`, `brown`, `fox` — splits on non-letters |
| `whitespace` | `The`, `Quick`, `Brown`, `FOX!` — no lowercase |
| `keyword` | `The Quick Brown FOX!` — one single token |
| `stop` | `quick`, `brown`, `fox` |
| `english`, `french`… | Stop words + **stemming** |

```json
GET /_analyze
{ "analyzer": "whitespace", "text": "The Quick Brown FOX!" }
```

---

# Language analyzers

<!-- ci: no-compare -->
```json
GET /_analyze
{
  "analyzer": "french",
  "text": "Les petits chats mangeaient"
}
```

**Expected result**:

```json
{ "tokens": [ { "token": "petit" }, { "token": "chat" }, { "token": "mang" } ] }
```

- **Stop words** removed: `les`
- **Stemming**: `petits` → `petit`, `mangeaient` → `mang` — a root, not a word
- `mangeait` and `mange` find the same document

---

# Tokenizers

| Tokenizer | Splits |
|---|---|
| `standard` | On word boundaries (Unicode rules) — the default |
| `whitespace` | On spaces only |
| `letter` | On anything that is not a letter |
| `keyword` | Not at all: the whole value is one token |
| `pattern` | On a regular expression |
| `ngram` / `edge_ngram` | Into sub-strings: `fox` → `f`, `fo`, `fox` |
| `path_hierarchy` | `/a/b/c` → `/a`, `/a/b`, `/a/b/c` |

---

# Token and character filters

| Token filter | Effect |
|---|---|
| `lowercase` | `FOX` → `fox` |
| `asciifolding` | `é` → `e` |
| `stop` | Removes stop words |
| `stemmer` | Reduces to the root: `running` → `run` |
| `synonym`, `synonym_graph` | Adds synonyms: `quick` ↔ `fast` |
| `edge_ngram` | Prefixes, for autocomplete |

<br />

Character filters: `html_strip`, `mapping` (`& => and`), `pattern_replace`.

---

# A custom analyzer

Defined in the **settings of the index** that uses it, then referenced in the mapping:

```json
PUT /articles
{
  "settings": {
    "analysis": {
      "filter": {
        "french_stop": { "type": "stop", "stopwords": "_french_" }
      },
      "analyzer": {
        "my_french": {
          "type": "custom",
          "char_filter": ["html_strip"],
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "french_stop"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "description": { "type": "text", "analyzer": "my_french" }
    }
  }
}
```

---

# Testing the custom analyzer

```json
GET /articles/_analyze
{
  "analyzer": "my_french",
  "text": "<p>Le café de la Gare</p>"
}
```

**Expected result**:

```json
{ "tokens": [ { "token": "cafe" }, { "token": "gare" } ] }
```

- Configured filters are **named** in `filter` / `char_filter`, then referenced by the analyzer
- The analyzer of an **existing** field cannot change: new index + `_reindex`

---

# Synonyms and mappings

```json
PUT /shop
{
  "settings": {
    "analysis": {
      "char_filter": {
        "ampersand": { "type": "mapping", "mappings": ["& => and"] }
      },
      "filter": {
        "shop_synonyms": { "type": "synonym_graph", "synonyms": ["tv, television", "laptop, notebook"] }
      },
      "analyzer": {
        "shop_search": {
          "char_filter": ["ampersand"],
          "tokenizer": "standard",
          "filter": ["lowercase", "shop_synonyms"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name": { "type": "text", "analyzer": "standard", "search_analyzer": "shop_search" }
    }
  }
}
```

> Synonyms at **search** time: change the list without reindexing (synonyms API, `updateable: true`).

---

# Search analyzer: autocomplete

Index the **prefixes**, but search the word as typed:

```json
PUT /movies_autocomplete
{
  "settings": {
    "analysis": {
      "filter": {
        "prefixes": { "type": "edge_ngram", "min_gram": 2, "max_gram": 10 }
      },
      "analyzer": {
        "autocomplete_index":  { "tokenizer": "standard", "filter": ["lowercase", "prefixes"] },
        "autocomplete_search": { "tokenizer": "standard", "filter": ["lowercase"] }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": { "type": "text", "analyzer": "autocomplete_index", "search_analyzer": "autocomplete_search" }
    }
  }
}
```

→ `Titanic` is indexed as `ti`, `tit`, `tita`… and the query `tit` finds it.

---

# Multi-field strategy

One value, several analyses — pick the right one per query:

```json
PUT /products
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "english",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": { "type": "search_as_you_type" }
        }
      }
    }
  }
}
```

- `name`: full text, stemmed — `name.keyword`: sort, aggregations — `name.suggest`: autocomplete

---

# Which analyzer?

| Analyzer | For |
|---|---|
| `keyword` type (no analysis) | IDs, codes, emails, statuses — sort and aggregations |
| `standard` | General text, mixed languages |
| Language (`english`, `french`…) | Text in **one** language: stemming and stop words |
| Custom | Domain vocabulary, HTML, synonyms, autocomplete |

<br />

- Every filter runs on **every** value indexed: a long chain slows indexing down
- `ngram` / `edge_ngram` **multiply** the terms: a bigger index — measure with `GET /_cat/indices?v`
- Test with **real** data samples, side by side, with `_analyze`

---

# Quiz

**A `title` field uses the `standard` analyzer. Which query does NOT find "Running Shoes"?**

- A) `running`
- B) `SHOES`
- C) `run`
- D) `running shoes`

<v-click>

**Answer: C** — `standard` lowercases but does not stem: the term indexed is `running`, not `run`. A language analyzer (`english`) would find it.

</v-click>
