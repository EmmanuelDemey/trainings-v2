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

# Introduction to Sorting in Elasticsearch

- **Overview of Sorting:**
  - Sorting arranges the search results based on specified criteria.
  - By default, Elasticsearch sorts by relevance score, but you can customize this.

- **Why Customize Sorting?**
  - To present the most relevant or useful information first according to specific needs.
  - Supports sorting by multiple fields, custom scripts, and geo-distance.

---

# Basic Sorting Syntax

- **Sorting by a Single Field:**
  - Sort search results by a specific field in ascending or descending order.
  - Example: Sorting by `date` field in descending order.

```json
GET /_search
{
    "sort": [
        { "date": { "order": "desc" } }
    ],
    "query": {
        "match_all": {}
    }
}
```

---

# Sorting by Multiple Fields

- **Multi-Field Sorting:**
  - Sort results by multiple criteria for fine-grained control.
  - Example: First sort by `status` (ascending), then by `date` (descending).

```json
GET /_search
{
    "sort": [
        { "status": { "order": "asc" } },
        { "date": { "order": "desc" } }
    ],
    "query": {
        "match_all": {}
    }
}
```

---

# Using Script-Based Sorting

- **Script-Based Sorting:**
  - Use scripts to sort by computed values or complex logic.
  - Example: Sorting by a script that calculates a score based on multiple fields.

```json
GET /_search
{
    "sort": {
        "_script": {
        "type": "number",
        "script": {
            "source": "doc['views'].value * 0.5 + doc['likes'].value"
        },
        "order": "desc"
        }
    },
    "query": {
        "match_all": {}
    }
}
```

---

# Sorting with Geo-Distance

- **Geo-Distance Sorting:**
  - Sort documents by distance from a geographic point, useful for location-based searches.
  - Example: Sorting restaurants by distance from a user's location.

```json
GET /restaurants/_search
{
    "sort": [
        {
        "_geo_distance": {
            "location": {
            "lat": 40.715,
            "lon": -73.984
            },
            "order": "asc",
            "unit": "km"
        }
        }
    ],
    "query": {
        "match_all": {}
    }
}
```

---

# Best Practices for Sorting

- **Performance Considerations:**
  - Sorting, especially script-based and geo-distance, can impact performance.
  - Use with caution on large datasets and consider caching strategies.

- **Field Data:**
  - Text fields need to be keyword type or have a keyword sub-field for sorting.
  - Ensure your mapping is set up correctly to support your sorting needs.

- **Testing and Validation:**
  - Validate sorting logic with a variety of queries to ensure it meets user expectations.
  - Use the explain API to understand how sort values are calculated.

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

# Introduction to Custom Scoring in Elasticsearch

- **Overview of Scoring:**
  - Elasticsearch uses a relevance score to rank search results.
  - The score indicates how well each document matches the query.

- **Why Customize Scoring?**
  - Tailor search results to specific business needs or user preferences.
  - Enhance search relevance by incorporating custom logic or external data.

---

# The Role of Query DSL in Custom Scoring

- **Query DSL (Domain Specific Language):**
  - Powerful and flexible language for defining searches.
  - Supports a wide range of queries for precise control over scoring.

- **Types of Queries for Custom Scoring:**
  - **Function Score Query:** Modify scores using mathematical functions.
  - **Script Score Query:** Use scripts to calculate scores based on complex logic.

---

# Function Score Query Example

- Boost the score of documents based on a numeric field (e.g., `popularity`).

```json
GET /_search
{
    "query": {
        "function_score": {
            "query": { "match": { "title": "elasticsearch" } },
            "functions": [
                {
                    "field_value_factor": {
                        "field": "popularity",
                        "factor": 1.2
                    }
                }
            ],
            "boost_mode": "multiply"
        }
    }
}
```

---

# Function Score Query Example


- **Response:**
```json
{
    "took": 30,
    "hits": {
        "total": 10,
        "max_score": 5.2,
        "hits": [
        {
            "_score": 5.2,
            "_source": {
            "title": "Elasticsearch Basics",
            "popularity": 10
            }
        }
        ]
    }
}
```


---

# Best Practices for Custom Scoring

- **Performance Considerations:**
  - Custom scoring can impact query performance. Use it judiciously.
  - Pre-compute values when possible to minimize runtime calculations.

- **Testing and Validation:**
  - Thoroughly test custom scoring rules to ensure they produce the desired results.
  - Use explain API to understand how scores are calculated.

- **Maintainability:**
  - Keep scoring scripts and functions as simple and readable as possible.
  - Document custom scoring logic for future reference.

---

# Introduction to Cross Cluster Search (CCS)

- **What is Cross Cluster Search?**
  - Allows searching across multiple Elasticsearch clusters.
  - Enables querying and aggregating data from various clusters as if they were in a single index.

- **Why use Cross Cluster Search?**
  - Scalability: Search over large datasets distributed across clusters.
  - Resilience: Mitigate risks of data loss and ensure high availability.
  - Flexibility: Combine data from different domains without data migration.


---

# Setting Up Cross Cluster Search

- **Configuring Remote Clusters:**
  - Use the Cluster Settings API to specify remote clusters.

```
PUT /_cluster/settings 
{ 
    "persistent": { 
        "cluster.remote.my_remote_cluster.seeds": ["host1:port", "host2:port"] 
    } 
}
```

- **Searching Across Clusters:**
  - Use the standard search API with cluster aliases.
    - Example: `GET /my_remote_cluster:index_name/_search { "query": { "match_all": {} } }`

---

# Considerations and Best Practices

- **Network Latency:**
  - Be aware of the network latency between clusters.
  - Optimize your infrastructure for minimal delay.

- **Security:**
  - Secure inter-cluster communication.
  - Implement necessary authentication and authorization mechanisms.

- **Resource Management:**
  - Monitor query performance and resource usage.
  - Ensure balanced load across clusters.


---
layout: cover
---
# Practical Part