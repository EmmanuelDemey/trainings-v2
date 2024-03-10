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

# Mapping

* Mapping can be defined when creating the index.

```
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

---

# Mapping

* We can also modify a mapping.
* Be careful, depending on the modifications made, this will require reindexing.

```
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

```
GET /movies/_mapping
```

* Its deletion will occur when deleting the index.

```
DELETE /movies
```

---

# Supported Types

* text, keyword, boolean, and date
* object, nested, arrays, range
* geo-point, geo-shape
* ip
* ...

---

# The Index Property

* This property indicates whether a property should be indexed.
* If so, we can use it in our searches.
* Often, not all properties are useful for search.
* So, it is recommended to optimize your mapping well.

---

# The Index Property

```
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

```
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

# The Fields Property

* It is possible to index a property in different ways.
    * to manage internationalization
    * to be able to do aggregations
    * to perform full-text queries, filters, auto-complete... on the same property
    * ...

---

# The Fields Property

* To do this, we will define `fields`.

```
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

```
POST movies/_search
{
    "query": {
        "match":{
            "directors": "Charlie"
        }
    }
}
```

```
POST movies/_search
{
    "query": {
        "match":{
            "directors.keyword": "Charlie Chaplin"
        }
    }
}
```

---

# Object versus Nested

* It is possible to define properties of type `Object`.

```
PUT movies
{
  "mappings": {
    "properties": {
      "directors": {
        "properties": {
            "firstName" : { ... },
            "lastName" : { ... }
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

```
POST /movies/_doc
{
    "directors": [
        {"firstName": "Charlie", "lastName": "Chaplin"},
        {"firstName": "Buster", "lastName": "Keaton"},
    ]
}
```

---

# Object versus Nested

* Elasticsearch translates this structure into a new representation.

```
{
    "directors.firstName": ["Charlie", "Buster"],
    "directors.lastName": ["Chaplin", "Keaton"],
}
```

---

# Object versus Nested

* We thus lose the relationships between properties.
* This could impact the executed searches.
* For example, the following search would return the previous movie.

```
POST movies/_search
{
    "query" {
        "bool":{
            "must": [
                { "match": {"directors.firstName": "Charlie" }},
                { "match": {"directors.lastName": "Keaton" }}
            ]
        }
    }
}
```

---

# Object versus Nested

* To avoid losing these relationships, we can use the `nested` type.

```
PUT movies
{
  "mappings": {
    "properties": {
      "directors": {
        "type": "nested",
        "properties": {
            "firstName" : { ... },
            "lastName" : { ... }
        }
      }
    }
  }
}
```

---

# Dynamic Templates

* There is an API for defining dynamic templates.
* We do not recommend it because only you know the structure of your data.

```
PUT movies
{
  "mappings": {
    "dynamic_templates": [
      {
        "strings": {
          "match_mapping_type": "string",
          "mapping": {
            "type": "text",
            "fields": {
              "keyword": {
                "type":  "keyword",
                "ignore_above": 256
              }
            }
          }
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

```
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
  },
  "composed_of": ["component_template1"],
}
```

# Component Templates

* Index Templates can inherit components from one or more Component Templates.
* This allows for flexible and modular index configuration.
* Use Component Templates for common settings, mappings, or aliases to avoid duplication.
* Define Index Templates with specific index patterns and compose them using relevant Component Templates.
* Utilize versioning and priority settings to manage template overrides effectively.

---

# Component Templates

```http
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

```http
PUT _index_template/template_1
{
  "index_patterns": ["te*", "bar*"],
  "template": {
    
  },
  "composed_of": ["component_template1"],
}
```

---
layout: cover
---
# Practical Section

