---
layout: cover
---

# 6 - Text analysis

---

# Learning objectives

At the end of this sequence (**~30 min**, workshop included), you will be able to:

- **Break down** an analyzer: char filters, tokenizer, token filters
- **Test** an analyzer with the `_analyze` API
- **Choose** a language analyzer
- **Build** a custom analyzer: accents, synonyms, stop words

---

# Why analyze?

The user types **"fresh pasta"**, the document holds **"Homemade Fresh Pastas"**.

For them to meet, both go through the **same** chain:

```text
"Homemade Fresh Pastas"
   │ char filters     → cleans the raw text (HTML, characters)
   │ tokenizer        → splits: [Homemade] [Fresh] [Pastas]
   │ token filters    → transforms: lowercase, accents, stems, synonyms
   ▼
[homemad] [fresh] [pasta]   ← the terms of the inverted index
```

- At **index time**: on the `text` field
- At **search time**: on the text of the `match` query
- A `keyword` is **not** analyzed (a `normalizer` at most)

---

# The `_analyze` API

```json
POST /_analyze
{
  "analyzer": "standard",
  "text": "The Fresh Pastas, it's HOMEMADE!"
}
```

**Expected result**:

```json
{
  "tokens": [
    { "token": "the" }, { "token": "fresh" }, { "token": "pastas" },
    { "token": "it's" }, { "token": "homemade" }
  ]
}
```

- `standard`: splits on words (Unicode), lowercases — that's all
- Keeps the **accents**, the **plurals** and the stop words (`the`)

---

# The built-in analyzers

| Analyzer | Effect |
|---|---|
| `standard` | Words + lowercase — the default |
| `simple` | Splits on anything that is not a letter, lowercase |
| `whitespace` | Splits on whitespace, nothing else |
| `keyword` | One single term: the whole text |
| `english`, `french`… | Language: possessives / elisions, stop words, **stemming** |

```json
POST /_analyze
{ "analyzer": "english", "text": "The Fresh Pastas, it's HOMEMADE!" }
```

**Expected result**:

```json
{ "tokens": [ { "token": "fresh" }, { "token": "pasta" }, { "token": "homemad" } ] }
```

---

# The building blocks

| Block | Examples |
|---|---|
| **Char filters** | `html_strip`, `mapping` (`& → and`), `pattern_replace` |
| **Tokenizer** | `standard`, `whitespace`, `keyword`, `pattern`, `ngram`, `edge_ngram`, `path_hierarchy` |
| **Token filters** | `lowercase`, `asciifolding` (accents), `stop`, `elision`, `stemmer`, `synonym`, `edge_ngram`, `unique` |

Combine them on the fly to test:

```json
POST /_analyze
{
  "char_filter": ["html_strip"],
  "tokenizer": "standard",
  "filter": ["lowercase", "asciifolding"],
  "text": "<p>Crème <b>brûlée</b></p>"
}
```

**Expected result**:

```json
{ "tokens": [ { "token": "creme" }, { "token": "brulee" } ] }
```

---

# A custom analyzer

```json
PUT /menu
{
  "settings": {
    "analysis": {
      "filter": {
        "en_possessive": { "type": "stemmer", "language": "possessive_english" },
        "en_stop":       { "type": "stop", "stopwords": "_english_" },
        "en_synonyms":   { "type": "synonym", "synonyms": ["fries, french fries", "burger, hamburger"] }
      },
      "analyzer": {
        "menu_en": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "en_possessive", "en_stop", "en_synonyms", "asciifolding"]
        }
      }
    }
  },
  "mappings": { "properties": { "dish": { "type": "text", "analyzer": "menu_en" } } }
}

POST /menu/_analyze
{ "analyzer": "menu_en", "text": "The Chef's Hamburger with fries" }
```

---

# Analysis at index time, at search time

- `analyzer`: used at **both** moments, by default
- `search_analyzer`: another analyzer for the **query** only

Typical case — **prefix autocompletion**:

```json
"title": {
  "type": "text",
  "analyzer": "autocomplete",
  "search_analyzer": "standard"
}
```

- `autocomplete` = `standard` tokenizer + `edge_ngram` filter (2 → 10): `pizza` → `pi`, `piz`, `pizz`, `pizza`
- At search time, `piz` stays `piz`: it finds the indexed prefix

<br />

> Change the analyzer of an existing field? **Impossible**: new index + `_reindex`.

---

# Quiz

**A `text` field with the `standard` analyzer holds "Crème brûlée". Does the `match` query "creme brulee" find it?**

<v-clicks>

- A) Yes, `standard` removes the accents
- B) No, it needs the `asciifolding` filter ✅
- C) Yes, `match` ignores the accents
- D) No, it needs a `keyword`

**Answer: B** — `standard` only lowercases: `crème` ≠ `creme`.

</v-clicks>

---

# In practice

## Workshop 4 - Text analysis
