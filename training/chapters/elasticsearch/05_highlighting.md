---
layout: cover
---

# Highlighting

---

# Highlighting

* Highlighting allows displaying the matching parts of a query in the search results.
* Elasticsearch wraps the matched terms with HTML tags (by default `<em>`).
* This is essential for building user-facing search interfaces.

---

# Basic Highlighting

* Add a `highlight` section to your search query.

```json
POST /movies/_search
{
  "query": {
    "match": {
      "title": "Titanic"
    }
  },
  "highlight": {
    "fields": {
      "title": {}
    }
  }
}
```

---

# Highlighting Response

* The matching terms are wrapped with `<em>` tags.

```json
{
  "hits": {
    "hits": [
      {
        "_source": {
          "title": "Titanic"
        },
        "highlight": {
          "title": [
            "<em>Titanic</em>"
          ]
        }
      }
    ]
  }
}
```

---

# Custom Tags

* You can customize the wrapping tags using `pre_tags` and `post_tags`.

```json
POST /movies/_search
{
  "query": {
    "match": { "title": "Titanic" }
  },
  "highlight": {
    "pre_tags": ["<strong>"],
    "post_tags": ["</strong>"],
    "fields": {
      "title": {}
    }
  }
}
```

---

# Highlighting Multiple Fields

* You can highlight multiple fields simultaneously.

```json
POST /movies/_search
{
  "query": {
    "multi_match": {
      "query": "New York adventure",
      "fields": ["title", "description"]
    }
  },
  "highlight": {
    "fields": {
      "title": {},
      "description": {
        "fragment_size": 150,
        "number_of_fragments": 3
      }
    }
  }
}
```

---

# Highlighter Types

* Elasticsearch provides three highlighter types:

| Type | Description | Use Case |
|------|-------------|----------|
| **unified** | Default. Uses BM25 for relevance | General purpose (recommended) |
| **plain** | Standard Lucene highlighter | Simple highlighting |
| **fvh** | Fast Vector Highlighter | Large text fields with `term_vector` |

```json
POST /movies/_search
{
  "query": {
    "match": { "description": "adventure" }
  },
  "highlight": {
    "fields": {
      "description": {
        "type": "fvh"
      }
    }
  }
}
```

---

# Fragment Size and Count

* **fragment_size**: Maximum length of each highlighted fragment (default: 100).
* **number_of_fragments**: Maximum number of fragments returned (default: 5).
* Set `number_of_fragments` to 0 to return the entire field content highlighted.

```json
POST /articles/_search
{
  "query": {
    "match": { "content": "elasticsearch" }
  },
  "highlight": {
    "fields": {
      "content": {
        "fragment_size": 200,
        "number_of_fragments": 3
      }
    }
  }
}
```

---

# Highlighting with Bool Queries

* Highlighting works with complex queries, including `bool` queries.

```json
POST /movies/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "star" } }
      ],
      "should": [
        { "match": { "description": "galaxy space" } }
      ]
    }
  },
  "highlight": {
    "fields": {
      "title": {},
      "description": {}
    }
  }
}
```

---

# Best Practices

* **Use the `unified` highlighter** (default) for most use cases.
* **Enable `term_vector`** on large text fields if using the `fvh` highlighter.
* **Limit fragment count** to avoid returning too much data.
* **Highlight only the fields you display** to reduce overhead.
* Highlighting requires the field to be **stored or available in `_source`**.

---
layout: cover
---
# Practical Section
