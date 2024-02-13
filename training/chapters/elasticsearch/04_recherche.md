---
layout: cover
---

# Search

---

# Search

* Once the data is indexed, we can execute searches.
* We will use the `_search` endpoint.
* We can search on one or more indexes/aliases.

```
POST /movies/_search
POST /movies,albums/_search
POST /movies-*/_search
```

---

# Lucene Syntax

* A first solution is to use the Lucene syntax.
* The entire query is defined in the URL.
* Only to be used for very simple queries.
* These queries are hard to maintain and do not allow the full use of Elasticsearch DSL.

```
GET /movies/_search?q=titanic
GET /movies/_search?q=title:titanic
GET /movies/_search?q=title:titanic AND (year:[1990 TO 2000])
```

---

# Lucene Syntax

* This syntax also allows defining:
    * sorting
    * pagination

```
GET /movies/_search?q=titanic&sort=year:desc&size:100&from=101
```

---

# Elasticsearch DSL

* For more complex searches, it's recommended to use the Elasticsearch DSL.

```
POST /movies/_search
{
  "query": {
    "match_all": {
      ...
    }
  }
}
```

---

# Full Text Searches

* Full text searches allow manipulation of analyzed texts.
* The searched string itself will be analyzed based on the configuration.
* We can use the `POST` verb (recommended) or `GET` (not compliant with HTTP1.1 specification).

---

# Full Text Searches

* Full text searches return results sorted by relevance (`score`).
* Preserving a good score calculation is essential.
* The default algorithm used is `BM25`, based on `TF/IDF`.
    * tfidf(t,d,D) = tf(t,d) × idf(t,D)
    * tf = how many times the searched term `t` appears in document `d`
    * idf = how many times the term appears in all documents `D`
    * normalized by the property's size
    * optionally boosted
* `_explain` API

---

# Query String

* For example, the `query_string` search type allows reusing the Lucene syntax.

```
POST /movies/_search
{
    "query": {
        "query_string" : {
            "query" : "(new york city) OR (big apple)",
            "default_field" : "title"
        }
    }
}
```

---

# Match

* `match` search type

```
POST /movies/_search
{
    "query": {
        "match" : {
            "title" : {
                "query" : "New York"
            }
        }
    }
}
```

---

# Match Phrase

* `match_phrase` search type

```
POST /movies/_search
{
    "query": {
        "match_phrase" : {
            "title" : "New York"
        }
    }
}
```

---

# Multi Match

* `multi_match` search type

```
POST /movies/_search
{
    "query": {
      "multi_match" : {
        "query":    "New York",
        "fields": [ "title", "description" ]
      }
    }
}
```

---

# Exact Matches

* Exact matches allow manipulation of non-analyzed properties.
* The search will not be analyzed at all. Beware of pitfalls.

```
POST /movies/_search
{
    "query": {
        "term": {
            "title": {
                "value": "New york"
            }
        }
    }
}
```

---

# Range

* Range Query

```
POST /movies/_search
{
    "query": {
        "range" : {
            "duration" : {
                "gte" : 100,
                "lte" : 200
            }
        }
    }
}
```

---

# Range

* Range Query

```
POST /movies/_search
{
    "query": {
        "range" : {
            "timestamp" : {
                "gte": "2020-01-01T00:00:00",
            }
        }
    }
}
```

---

# Range

* Range Query

```
POST /movies/_search
{
    "query": {
        "range" : {
            "timestamp" : {
                "gte" : "now-1d/d",
                "lt" :  "now/d"
            }
        }
    }
}
```

---

# Fuzzy

* Fuzzy Query

```
POST /movies/_search
{
    "query": {
        "fuzzy": {
            "title": {
                "value": "tiatnic"
            }
        }
    }
}
```

---

# Wildcard

* Wildcard Query

```
POST /movies/_search
{
    "query": {
        "wildcard": {
            "title": {
                "value": "Tita*c"
            }
        }
    }
}
```

---

# Filters

* A search will always impact the score calculation.
* If the score is not useful, it's better to use filters.
* More performant than searches, no score calculation and results are cached.

---

# Filters

* Main use case, when the answer is yes or no.

```
POST /movies/_search
{
    "query": {
        "constant_score" : {
            "filter" : {
                "term" : { "title" : "Titanic"}
            }
        }
    }
}
```

---

# Geographical Searches

* In order to execute geographic search queries, it is necessary to have a property of type:
    * `geo_point`
    * `geo_shape`

```
PUT /movies
{
    "mappings": {
        "properties": {
            "location": {
                "type": "geo_point"
            }
        }
    }
}
```

---

# geo_distance box Query

* Returns documents where the `geo_point` property is within a given distance.

```
POST /movies/_search
{
    "query": {
        "geo_distance" : {
            "distance" : "200km",
            "location" : {
                "lat" : 40,
                "lon" : -70
            }
        }
    }
}
```

---

# Boolean Searches

* If you want to write a complex query, you can use the `bool` query.
* Allows defining `must`, `must_not`, `should`, and `filter` searches.

---

# Boolean Searches

```
POST /movies/_search
{
  "query": {
    "bool" : {
      "must" : {
        "term" : { "title" : "Titanic" },
      },
      "must_not" : {
        "range" : {
          "duration" : { "gte" : 100, "lte" : 200 }
        }
      },
      "should" : [
        { "term" : { "category" : "history" } },
        { "term" : { "category" : "drama" } }


      ],
      "filter": {
        "term" : { "type" : "movie" }
      },
      "minimum_should_match" : 1
    }
  }
}
```

---

# Sorting

* By default, Elasticsearch returns documents sorted by `_score`.
* We can modify this sorting using the `sort` property.
* We can define multiple sorts and the direction: `asc` or `desc`.

---

# Sorting

```
POST /movies/_search
{
  "query": {
    ...
  },
  "sort": {
    { "timestamp":   { "order": "desc" }},
    { "_score": { "order": "desc" }}
  }
}
```

---

# Pagination

* We can manage pagination manually using the `from` and `size` parameters.
* Not very efficient, it's recommended to use the Scroll API for large volumes.
* The Scroll API returns a cursor.

```
POST /movies?scroll=1m
{
    "size": 100,
    "query": {
        "match" : {
            "title" : "Titanic"
        }
    }
}
```

---

# Pagination

```
{
    "_scroll_id" : "DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAD4WYm9laVYtZndUQlNsdDcwakFMNjU1QQ==",
    "hits" {
      ...
    }
}
```

---

# Pagination

```
POST /_search/scroll
{
    "scroll" : "1m",
    "scroll_id" : "DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAD4WYm9laVYtZndUQlNsdDcwakFMNjU1QQ=="
}
```

---

# Pagination

* Point in time API
* Use of **search_after** with a PIT
* Approach now recommended by Elastic
* Preserves the index state while traversing different pages.

---

# Score

* It's possible to modify the calculated score.
* We will use the `Painless` language.

```
GET /movies/_search
{
    "query": {
        "function_score": {
            "query": {
                "match": { "title" : "Titanic" }
            },
            "script_score" : {
                "script" : {
                  "source": "1.0 / doc['notes'].value"
                }
            }
        }
    }
}
```

---

# Cross Cluster Search

* It's possible to search across multiple clusters.
* To do this, it is necessary to:
    * configure remote clusters in your local cluster
    * indicate which cluster you want to query when sending a request.

---

# Cross Cluster Search

```
PUT _cluster/settings
{
  "persistent": {
    "cluster": {
      "remote": {
        "cluster_one": {
          "seeds": [
            "127.0.0.1:9300"
          ]
        }
      }
    }
  }
}
```

---

# Cross Cluster Search

```
POST /cluster_one:movie/_search
{
  "query": {
    "match": {
      "title": "Titanic"
    }
  }
}
```

---
layout: cover
---
# Practical Part