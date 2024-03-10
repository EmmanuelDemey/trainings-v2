
# Introduction to Elasticsearch Analyzers

- Definition: Analyzers process text data into tokens, enhancing search capabilities.
- Components: Comprised of Char Filters, Tokenizer, and Token Filters.
- Importance: Essential for improving search accuracy and performance.

![](/images/analyzer.png)

---

# Char Filters Explained

- Role: Preprocess text by modifying characters before tokenization.

  1. **HTML Strip**: Removes HTML tags from text.
    - `"char_filter": ["html_strip"]`
  2. **Mapping Char Filter**: Replaces specified characters.
    - Custom mappings example: Replace `&` with `and`.
    - `"char_filter": { "type": "mapping", "mappings": ["&=>and"]}`

---

# Tokenizers in Detail

- Function: Splits text into individual tokens or words.
  1. **Standard Tokenizer**: Splits text on word boundaries.
  2. **Whitespace Tokenizer**: Splits text by whitespace.
      - `"tokenizer": "whitespace"`
  3. **Custom Tokenizer**: Tailored splitting logic.
      - Example: A tokenizer that splits text at commas.

---

# Token Filters 
- Purpose: Modify, remove, or add tokens after tokenization.
  1. **Lowercase Filter**: Converts all tokens to lowercase.
      - `"filter": ["lowercase"]`
  2. **Stopword Filter**: Removes common "stop" words.
      - `"filter": ["stop"]`
  3. **Synonym Filter**: Maps tokens to specified synonyms.
      - Define synonyms: `"filter": { "type": "synonym", "synonyms": ["quick,fast"] }`

---

# Analyzers in Action: Standard Analyzer

```json
POST /_analyze
{
  "analyzer": "standard",
  "text": "Quick Brown Foxes!"
}
```
```json
{
  "tokens": [
    {"token": "quick"},
    {"token": "brown"},
    {"token": "foxes"}
  ]
}
```

---

# Analyzer Creation

- Crafting a custom analyzer for specific needs.

```json
PUT /my_custom_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "type": "custom",
          "char_filter": ["html_strip"],
          "tokenizer": "whitespace",
          "filter": ["lowercase", "asciifolding", "stop"]
        }
      }
    }
  }
}
```

---

# Advanced Custom Analyzer Example

- Demonstrating a complex analyzer setup for nuanced text processing.
 
```json
PUT /advanced_custom_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "advanced_custom_analyzer": {
          "type": "custom",
          "char_filter": ["html_strip", { "type": "mapping", "mappings": ["&=>and"] }],
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "stop", { "type": "synonym", "synonyms": ["quick,fast"] }]
        }
      }
    }
  }
}
```

---

# Testing Analyzers with the _analyze API

- The `_analyze` API's role in refining Elasticsearch analyzers.
- Example Test: Analyzing custom token filters.
- **Example Request**:
  ```json
  POST /_analyze
  {
    "analyzer": "my_custom_analyzer",
    "text": "The <b>Quick</b> Brown Foxes & Hares."
  }
  ```

---

# Configue Analyzer for a field

```
PUT movies
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "my_custom_analyzer"
      }
    }
  }
}
```
---

# Mapping Modification

* If the mapping changes, a complete reindexing of the data is necessary.
* Good practice: use an alias to avoid changing the application code.
* Reindexing can be done via a batch system or using the _reindex_ API.

---

# Mapping Modification

![](/images/reindex1.png)

---

# Mapping Modification

![](/images/reindex2.png)

---

# Mapping Modification

![](/images/reindex3.png)

---

# Alias Configuration

```
POST /_aliases
{
    "actions": [
        {
            "remove": {
                "alias": "movies",
                "index": "movies_v1"
            }
        },
        {
            "add": {
                "alias": "movies",
                "index": "movies_v2"
            }
        }
    ]
}
```

---

# Reindex API

* We can reindex a complete index

```
POST _reindex
{
  "source": {
    "index": "movies_v1"
  },
  "dest": {
    "index": "movies_v2"
  }
}
```

---

# Reindex API

* Or just a portion by defining a search query

```
POST _reindex
{
  "source": {
    "index": "movies_v1",
    "query": {
      "term": {
        "year": 2010
      }
    }
  },
  "dest": {
    "index": "movies_v2"
  }
}
```

---

# Reindex API

* We're not limited to indexes within the same cluster
* We can reindex data from a remote cluster

```
POST _reindex
{
  "source": {
    "remote": {
      "host": "http://otherhost:9200"
    },
    "index": "movies_v1",
    "query": {
      "term": {
        "year": 2010
      }
    }
  },
  "dest": {
    "index": "movies_v2"
  }
}
```

---
layout: cover
---
# Presentation of the Documentation
