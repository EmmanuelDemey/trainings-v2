---
layout: cover
---

# Mapping

---

# Mapping

* Mapping is Elasticsearch's representation of your data.
* When indexing the first document, Elasticsearch generates a mapping.
* Often, this mapping is not optimal and requires optimization.
* In this mapping, we can:
    * Define the types of document properties.
    * Specify if these properties should be ignored and/or indexed.
    * If indexed, in what way should they be indexed?

---

# Dynamic Mapping

Elasticsearch automatically detects field types:
```json
POST /auto-index/_doc/1
{ "name": "Test", "count": 42 }
```
Result: `name` → `text+keyword`, `count` → `long`

**Advantages**: Quick for prototyping

**Disadvantages**: May guess type incorrectly (dates as strings, etc.)

---

# Explicit Mapping

* Mapping can be defined when creating the index.

```json
PUT /movies
{
  "mappings": {
    "properties": {
      "title":    { "type": "text" },
      "year":  { "type": "integer"  },
      "directors":   { "type": "text"  }
    }
  }
}
```

**Best practice**: Always define mapping explicitly in production!

---

# Mapping

* We can also modify a mapping.
* Be careful, depending on the modifications made, this will require reindexing.

```json
PUT /movies/_mapping
{
  "properties": {
    "dialogues": {
      "type": "text"
    }
  }
}
```

---

# Mapping

* We can retrieve a mapping.

```json
GET /movies/_mapping
```

* Its deletion will occur when deleting the index.

```json
DELETE /movies
```

---

# Main Field Types

| Type | Usage | Example |
|------|-------|---------|
| **text** | Full-text search (analyzed) | Articles, descriptions |
| **keyword** | Exact filtering, aggregations | Statuses, tags, IDs |
| **date** | Dates and timestamps | `"2025-11-10"`, `1699632000000` |
| **long/integer** | Integer numbers | Ages, counters |
| **float/double** | Decimal numbers | Prices, coordinates |
| **boolean** | True/false | Flags, states |
| **geo_point**, **geo_shape** | Geographic coordinates and shapes | `{"lat": 48.8566, "lon": 2.3522}` |
| **object**, **nested** | JSON objects | Addresses, metadata |
| **ip**, **range**, ... | | |

* No `array` type: any field can hold several values.

Complete documentation: [Field types](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html)

---

# The Index Property

* This property indicates whether a property should be indexed.
* If so, we can use it in our searches.
* Often, not all properties are useful for search.
* So, it is recommended to optimize your mapping well.

---

# The Index Property

```json
PUT movies
{
  "mappings": {
    "properties": {
      "dialogues": {
        "type": "text",
        "index": false
      }
    }
  }
}
```

---

# Storing the Original Document

* By default, the indexed document is retrievable via the `_source` property.
* For performance and disk space usage reasons, you can disable this object.

```json
DELETE movies

PUT movies
{
  "mappings": {
    "_source": {
      "enabled": false
    }
  }
}
```

* Be careful, disabling the source makes certain operations impossible (simple get, update, update_by_query, reindex).

---

# Synthetic `_source`

* Rather than dropping `_source`, let Elasticsearch **rebuild** it from the doc values: less disk, and get, update and reindex keep working.
* The rebuilt document may differ: fields sorted, arrays sorted and deduplicated for some types.
* Default of the `logsdb` index mode (`logs-*` data streams in 9.x); otherwise an Enterprise license feature.

```json
DELETE movies

PUT movies
{
  "settings": {
    "index.mapping.source.mode": "synthetic"
  }
}
```

---

# The Fields Property

* It is possible to index a property in different ways.
    * to manage internationalization
    * to be able to do aggregations
    * to perform full-text queries, filters, auto-complete... on the same property
    * ...

---

# The Fields Property

* To do this, we will define `fields` (a mapping change: the index is recreated).

```json
DELETE movies

PUT movies
{
  "mappings": {
    "properties": {
      "directors": {
        "type": "text",
        "fields": {
          "keyword": {
            "type":  "keyword"
          }
        }
      }
    }
  }
}
```

---

# The Fields Property

* We can thus search on the `directors` property and `directors.keyword` property.

```json
POST movies/_search?q=directors:Charlie
```

```json
POST movies/_search?q=directors.keyword:"Charlie Chaplin"
```

---

# Important Mapping Parameters

```json
{
  "properties": {
    "description": {
      "type": "text",
      "analyzer": "french",
      "fields": { "keyword": { "type": "keyword" } }
    },
    "status": {
      "type": "keyword", "ignore_above": 256
    },
    "metadata": {
      "type": "object", "enabled": false
    }
  }
}
```

**Key parameters**:
- `analyzer`: Defines how text is analyzed (see the next chapter)
- `fields`: Multi-fields (same data, multiple types)
- `ignore_above`: Ignores strings that are too long
- `enabled`: Enables/disables field indexing

---

# Object versus Nested

* It is possible to define properties of type `object`.

```json
DELETE movies

PUT movies
{
  "mappings": {
    "properties": {
      "directors": {
        "properties": {
            "firstName" : { "type": "keyword" },
            "lastName" : { "type": "keyword" }
        }
      }
    }
  }
}
```

---

# Object versus Nested

* A problem arises when we have an array of objects.
* Let's imagine that our movie was directed by multiple directors.

```json
POST /movies/_doc
{
    "directors": [
        {"firstName": "Charlie", "lastName": "Chaplin"},
        {"firstName": "Buster", "lastName": "Keaton"}
    ]
}
```

---

# Object versus Nested

* Elasticsearch translates this structure into a new representation.

```json
{
    "directors.firstName": ["Charlie", "Buster"],
    "directors.lastName": ["Chaplin", "Keaton"]
}
```

---

# Object versus Nested

* We thus lose the relationships between properties.
* This could impact the executed searches.
* For example, the following search would return the previous movie.

```json
POST movies/_search?q=directors.firstName:Charlie AND directors.lastName:Keaton
```

---

# Object versus Nested

* To avoid losing these relationships, we can use the `nested` type.

```json
DELETE movies

PUT movies
{
  "mappings": {
    "properties": {
      "directors": {
        "type": "nested",
        "properties": {
            "firstName" : { "type": "keyword" },
            "lastName" : { "type": "keyword" }
        }
      }
    }
  }
}
```

---

# Dynamic Templates

* Dynamic templates map the **new** fields by their name or detected type.
* While useful for prototyping, it's recommended to define explicit mappings in production.
* Only you know the exact structure and requirements of your data.
* Use dynamic templates cautiously and validate the generated mappings.

```json
DELETE movies

PUT movies
{
  "mappings": {
    "dynamic_templates": [
      {
        "ids_as_keywords": {
          "match_mapping_type": "string",
          "match": "*_id",
          "mapping": { "type": "keyword" }
        }
      },
      {
        "counts_as_integers": {
          "match_mapping_type": "long",
          "match": "nb_*",
          "mapping": { "type": "integer" }
        }
      }
    ]
  }
}
```

--- 

# Index and Component Templates

* We can define `index` and `component` templates
* This centralizes the configuration of an index
* And can be reused when a new index is created
* Using templates is a recommended practice

---

# Index Templates

```json
PUT _index_template/template_1
{
  "index_patterns": ["te*", "bar*"],
  "template": {
    "settings": {
      "number_of_shards": 1
    },
    "mappings": {
      "_source": {
        "enabled": true
      },
      "properties": {
        "host_name": {
          "type": "keyword"
        }
      }
    },
    "aliases": {
      "mydata": { }
    }
  }
}
```

---

# Component Templates

* Index Templates can inherit components from one or more Component Templates.
* This allows for flexible and modular index configuration.
* Use Component Templates for common settings, mappings, or aliases to avoid duplication.
* Define Index Templates with specific index patterns and compose them using relevant Component Templates.
* Utilize versioning and priority settings to manage template overrides effectively.

---

# Component Templates

```json
PUT _component_template/component_template1
{
  "template": {
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date"
        }
      }
    }
  }
}
```

```json
PUT _index_template/template_1
{
  "index_patterns": ["te*", "bar*"],
  "template": {
    "settings": { "number_of_shards": 1 }
  },
  "composed_of": ["component_template1"]
}
```
