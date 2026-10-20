---
layout: cover
---

# Analyzers

---

# Text Analysis

* When a `text` field is indexed, Elasticsearch analyzes its content.
* The analysis process transforms the text into tokens (terms).
* This process is essential for full-text search.
* An **Analyzer** is composed of three parts:
    * **Character Filters**: Transform the text before tokenization
    * **Tokenizer**: Splits the text into tokens
    * **Token Filters**: Transform, add, or remove tokens

---

# Analysis Pipeline

```
"The Quick Brown FOX!"
        ↓
  [Character Filters]  →  "the quick brown fox"
        ↓
     [Tokenizer]       →  ["the", "quick", "brown", "fox"]
        ↓
   [Token Filters]     →  ["quick", "brown", "fox"]  (stopwords removed)
```

---

# Built-in Analyzers

* Elasticsearch provides several built-in analyzers:
    * `standard`: Default analyzer, grammar-based tokenization, lowercase
    * `simple`: Divides on non-letter characters, lowercase
    * `whitespace`: Divides on whitespace only
    * `keyword`: No-op analyzer, keeps the entire input as a single token
    * `language` analyzers: `english`, `french`, `german`, etc.

---

# Built-in Analyzers Examples

## Standard Analyzer
```json
GET /_analyze
{
  "analyzer": "standard",
  "text": "The Quick Brown FOX!"
}
```
**Result**: `["the", "quick", "brown", "fox"]`

## Simple Analyzer
```json
GET /_analyze
{
  "analyzer": "simple",
  "text": "The Quick Brown FOX!"
}
```
**Result**: `["the", "quick", "brown", "fox"]`

## Whitespace Analyzer
```json
GET /_analyze
{
  "analyzer": "whitespace",
  "text": "The Quick Brown FOX!"
}
```
**Result**: `["The", "Quick", "Brown", "FOX!"]`

## Keyword Analyzer
```json
GET /_analyze
{
  "analyzer": "keyword",
  "text": "The Quick Brown FOX!"
}
```
**Result**: `["The Quick Brown FOX!"]`

## French Analyzer
```json
GET /_analyze
{
  "analyzer": "french",
  "text": "Le petit chat mange"
}
```
**Result**: `["petit", "chat", "mang"]` (stemmed + stopwords removed)

---

# The _analyze API

* The `_analyze` API allows you to test how text is analyzed.
* Very useful for debugging and understanding analyzers.

```json
GET /_analyze
{
  "analyzer": "standard",
  "text": "The Quick Brown FOX!"
}
```

* Response: `["the", "quick", "brown", "fox"]`

---

# The _analyze API

* You can test with a specific index's analyzer.

```json
GET /movies/_analyze
{
  "field": "title",
  "text": "The Dark Knight Rises"
}
```

* This uses the analyzer configured for the `title` field.

---

# The _analyze API

* You can also test individual components.

```json
GET /_analyze
{
  "tokenizer": "standard",
  "filter": ["lowercase", "asciifolding"],
  "text": "Cafe resume"
}
```

* Response: `["cafe", "resume"]`

---

# Tokenizers

* `standard`: Grammar-based tokenization
* `whitespace`: Splits on whitespace
* `letter`: Splits on non-letters
* `keyword`: No tokenization, single token
* `pattern`: Uses a regex pattern
* `ngram` / `edge_ngram`: Creates n-grams for autocomplete

---

# Token Filters

* `lowercase`: Converts to lowercase
* `uppercase`: Converts to uppercase
* `stop`: Removes stop words
* `stemmer`: Reduces words to their root form
* `synonym`: Adds synonyms
* `asciifolding`: Converts special characters (e → e)
* `ngram` / `edge_ngram`: Creates n-grams from tokens

---

# Character Filters

* `html_strip`: Removes HTML tags
* `mapping`: Replaces characters based on a mapping
* `pattern_replace`: Uses regex to replace characters

```json
GET /_analyze
{
  "char_filter": ["html_strip"],
  "tokenizer": "standard",
  "text": "<p>Hello <b>World</b></p>"
}
```

* Response: `["hello", "world"]`

---

# Custom Analyzer

* You can define custom analyzers in index settings.

```json
PUT /articles
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "char_filter": ["html_strip"],
          "filter": ["lowercase", "asciifolding", "french_stop"]
        }
      },
      "filter": {
        "french_stop": {
          "type": "stop",
          "stopwords": "_french_"
        }
      }
    }
  }
}
```

---

# Using Custom Analyzer

* Apply your custom analyzer to a field in the mapping of the **same index**.

```json
PUT /articles/_mapping
{
  "properties": {
    "description": {
      "type": "text",
      "analyzer": "my_custom_analyzer"
    }
  }
}
```

---

# Search Analyzer

* You can use different analyzers for indexing and searching.
* Useful for autocomplete with `edge_ngram`.

```json
PUT /movies_autocomplete
{
  "settings": {
    "analysis": {
      "filter": {
        "prefixes": { "type": "edge_ngram", "min_gram": 2, "max_gram": 10 }
      },
      "analyzer": {
        "autocomplete_index": { "tokenizer": "standard", "filter": ["lowercase", "prefixes"] },
        "autocomplete_search": { "tokenizer": "standard", "filter": ["lowercase"] }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "autocomplete_index",
        "search_analyzer": "autocomplete_search"
      }
    }
  }
}
```

---

# Performance Impact

* **Indexing time**: complex analyzers slow down indexing
* **Query performance**: simpler analyzers mean faster searches
* **Disk usage**: more tokens mean a larger index
* **Memory usage**: custom analyzers consume heap

| Analyzer | Indexing Speed | Query Speed | Disk Usage |
|----------|----------------|-------------|------------|
| `keyword` | Fastest | Fastest | Minimal |
| `standard` | Fast | Fast | Moderate |
| `french` | Medium | Medium | High |
| Custom with n-grams | Slow | Fast | Very High |

---

# Performance Impact: Optimization Tips

* Use the `keyword` analyzer for exact matches (IDs, emails)
* Choose simpler analyzers for high-throughput scenarios
* Test with real data before production deployment
* Monitor indexing performance with `_nodes/stats`

---

# Best Practices: When to Use Which Analyzer

| Analyzer | Use it for |
|----------|------------|
| `keyword` | Exact matches (product codes, IDs, emails), sorting, aggregations |
| `standard` | General full-text search, multi-language content |
| language (`french`, ...) | Content in one language: stemming and stopwords |
| custom | Domain terminology, special characters, autocomplete |

---

# Best Practices: Multi-field Strategy

Index the same field several ways and pick the right one per query:

```json
PUT /products
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": { "type": "search_as_you_type" }
        }
      }
    }
  }
}
```

* `name` for full-text search, `name.keyword` for sorting and aggregations, `name.suggest` for autocomplete

---

# Best Practices: Testing Strategy

1. Always test with the `_analyze` API first
2. Use real data samples from your domain
3. Compare different analyzers side by side
4. Measure relevance and performance

---

# Practical Section

