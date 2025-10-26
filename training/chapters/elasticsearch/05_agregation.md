---
layout: cover
---

# Aggregations

---

# Aggregations

* An aggregation is a way to categorize our data.
* They can be performed on all fields with the `fielddata` parameter set to `true`.
* This parameter is `true` by default for all fields except those of type `text`.
    * It is possible to force the value of `fielddata` to `true` for analyzed `text` fields. This is a dangerous practice.
* For fields of type `text`, you must have a second representation of type `keyword`.

---

# Aggregations

* Aggregations are applied on the result of a query.
* It's another object block in the DSL.

```
POST person/_search
{
  "query": {
    ...
  },
  "aggs": {
    ...
  }
}
```

---

# Aggregations

* The result of aggregations will be added to the response.

```
POST person/_search
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {...},
  "hits" : {
    "total" : {
      "value" : 5,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [...]
  },
  "aggregations" : {
    ...
  }
}
```

---

# Aggregations

* It's possible not to return the `hits` of the query by setting `size` to `0`.

```
POST person/_search
{
  "size": 0,
  "aggs": {
    ...
  }
}
```

---

# Metric Aggregations

* Aggregation type that returns a metric.
    * e.g., calculating an average price.
* Impossible to create nested metrics.
* Several types available: `max`, `min`, `sum`, `avg`, `stats`, ...

---

# AVG Aggregations

```
POST /notes/_search?size=0
{
    "aggs" : {
        "avg_grade" : { "avg" : { "field" : "grade" } }
    }
}
```

---

# AVG Aggregations

```
{
    ...
    "aggregations": {
        "avg_grade": {
            "value": 75.0
        }
    }
}
```

---

# Bucket Aggregations

* Aggregation type that creates `buckets`.
* Each bucket can act as a sub-aggregation.
* Several types available: `Date`, `Filters`, `Terms`, `geo_distance`, ...

---

# Date Aggregations

```
POST /sales/_search?size=0
{
    "aggs" : {
        "sales_over_time" : {
            "date_histogram" : {
                "field" : "date",
                "calendar_interval" : "1M",
                "format" : "yyyy-MM-dd"
            }
        }
    }
}
```

---

# Date Aggregations

```
{
    ...
    "aggregations": {
        "sales_over_time": {
            "buckets": [
                {
                    "key_as_string": "2015-01-01",
                    "key": 1420070400000,
                    "doc_count": 3
                },
                {
                    "key_as_string": "2015-02-01",
                    "key": 1422748800000,
                    "doc_count": 2
                },
                {
                    "key_as_string": "2015-03-01",
                    "key": 1425168000000,
                    "doc_count": 2
                }
            ]
        }
    }
}
```
---

# Filters Aggregations

```
POST logs/_search
{
  "size": 0,
  "aggs" : {
    "messages" : {
        "filters" : {
            "filters": {
                "errors" :   { "match" : { "body" : "error"   }},
                "warnings" : { "match" : { "body" : "warning" }}
            }
        }
    }
  }
}
```

---

# Filters Aggregations

```
{
  "took": 9,
  "timed_out": false,
  "_shards": ...,
  "hits": ...,
  "aggregations": {
    "messages": {
      "buckets": {
        "errors": {
          "doc_count": 1
        },
        "warnings": {
          "doc_count": 2
        }
      }
    }
  }
}
```

---

# Terms Aggregations

* Groups data based on a property.

```
POST /movies/_search
{
    "aggs" : {
        "genres" : {
            "terms" : { "field" : "genre" }
        }
    }
}
```

---

# Terms Aggregations

* Here's the returned result.

```
{
    ...
    "aggregations" : {
        "genres" : {
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets" : [
                {
                    "key" : "horror",
                    "doc_count" : 6
                },
                {
                    "key" : "science fiction",
                    "doc_count" : 3
                },
                {
                    "key" : "comedy",
                    "doc_count" : 2
                }
            ]
        }
    }
}
```

---

# Geo_distance Aggregations

```
POST /museums/_search?size=0
{
    "aggs" : {
        "rings_around_amsterdam" : {
            "geo_distance" : {
                "field" : "location",
                "origin" : "52.3760, 4.894",
                "ranges" : [
                    { "to" : 100000 },
                    { "from" : 100000, "to" : 300000 },
                    { "from" : 300000 }
                ]
            }
        }
    }
}
```

---

# Geo_distance Aggregations

```
{
    ...
    "aggregations": {
        "rings_around_amsterdam" : {
            "buckets": [
                {
                    "key": "*-100000.0",
                    "from": 0.0,
                    "to": 100000.0,
                    "doc_count": 3
                },
                {
                    "key": "100000.0-300000.0",
                    "from": 100000.0,
                    "to": 300000.0,
                    "doc_count": 1
                },
                {
                    "key": "300000.0-*",
                    "from": 300000.0,
                    "doc_count": 2
                }
            ]
        }
    }
}
```

---

# Pipeline Aggregations

* Aggregation that works with the output of a previous aggregation.
* Two types of aggregations
    * Parent
    * Sibling

---

# Nested Aggregations

* As soon as we use `bucket` type aggregations, we can nest them.

```
POST /movies/_search
{
    "aggs" : {
        "genres" : {
            "terms" : { "field" : "genre" },
            "aggs": {
                "year" : {
                    "terms" : { "field" : "year" }
                }
            }
        }
    }
}
```

---

# Pipeline Aggregations

```
POST /sales/_search
{
    "size": 0,
    "aggs" : {
        "sales_per_month" : {
            "date_histogram" : {
                "field" : "date",
                "calendar_interval" : "month"
            },
            "aggs": {
                "sales": {
                    "sum": {
                        "field": "price"
                    }
                },
                "sales_deriv": {
                    "derivative": {
                        "buckets_path": "sales"
                    }
                }
            }
        }
    }
}
```

---

# Pipeline Aggregations

```
{
   "took": 11,
   "timed_out": false,
   "_shards": ...,
   "hits": ...,
   "aggregations": {
      "sales_per_month": {
         "buckets": [
            {
               "key_as_string": "2015/01/01 00:00:00",
               "key": 1420070400000,
               "doc_count": 3,
               "sales": {
                  "value": 550.0
               }
            },
            {
               "key_as_string": "2015/02/01 00:00:00",
               "key": 1422748800000,
               "doc_count": 2,
               "sales": {
                  "value": 60.0
               },
               "sales_deriv": {
                  "value": -490.0
               }
            },
            {
               "key_as_string": "2015/03/01 00:00:00",
               "key": 1425168000000,
               "doc_count": 2,
               "sales": {
                  "value": 375.0
               },
               "sales_deriv": {
                  "value": 315.0
               }
            }
         ]
      }
   }
}
```

---
layout: cover
---

# Documentation Presentation

---
layout: cover
---

# Demo with Kibana

---
layout: cover
---

# Practical Part