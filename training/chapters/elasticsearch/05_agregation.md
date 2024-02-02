---
layout: cover
---

# Agrégations

---

# Agrégation

* Une agrégation est un moyen de faire une catégorisation de nos données.
* Elles peuvent se faire sur tous les champs ayant le paramètrage `fielddata` à `true`
* Ce paramètrage est a `true` par défaut pour tous les champs sauf ceux de type `text`
    * Il est possible de forcer la valeur de `fielddata` à `true` pour les champs `text` analysés. C'est une pratique dangereuse.
* Pour les champs de type `text`, vous devez avoir une seconde représentation de type `keyword`

---

# Agrégation

* Les agrégations s'appliquent sur le résultat d'une requête
* C'est un autre bloc objet dans le DSL

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

# Agrégation

* Le résultat des agrégations sera rajouté à la réponse

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

# Agrégation

* Il est possible de ne pas renvoyer les `hits` de la query en positionnant la `size` à `0`

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

# Agrégations de type Metric

* Type d'agrégation permettant de retourner une métrique
    * ex: calculer un prix moyen
* Impossible de créer des métriques imbriquées
* Plusieurs types disponibles : `max`, `min`, `sum`, `avg`, `stats`, ...

---

# AVG Agrégations

```
POST /notes/_search?size=0
{
    "aggs" : {
        "avg_grade" : { "avg" : { "field" : "grade" } }
    }
}
```

---

# AVG Agrégations

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

# Agrégations de type Bucket

* Type d'agrégation permettant de créer des `buckets`
* Chaque bucket pourra faire office d'une sous agrégation
* Plusieurs types disponibles : `Date`, `Filters`, `Terms`, `geo_distance`, ...

---

# Agrégations de type Date

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

# Agrégations de type Date

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

# Agrégations de type Filters

```
POST logs/_search
{
  "size": 0,
  "aggs" : {
    "messages" : {
        "filters" : {
            "errors" :   { "match" : { "body" : "error"   }},
            "warnings" : { "match" : { "body" : "warning" }}
        }
    }
  }
}
```

---

# Agrégations de type Filters

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

# Agrégations de type Terms

* Permet de regrouper les données en fonction d'une propriété

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

# Agrégations de type Terms

* Voici le résultat retourné

```
{
    ...
    "aggregations" : {
        "genres" : {
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets" : [
                {
                    "key" : "horreur",
                    "doc_count" : 6
                },
                {
                    "key" : "science fiction",
                    "doc_count" : 3
                },
                {
                    "key" : "comedie",
                    "doc_count" : 2
                }
            ]
        }
    }
}
```

---

# Agrégations de type geo_distance

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

# Agrégations de type geo_distance

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

# Agrégations de type Pipeline

* Agrégation qui fonctionne avec la sortie d'une agrégation précédente.
* Deux types d'agrégations
    * Parent
    * Sibling

---

# Agrégation Imbriqués

* Dès que nous utilisons des agrégations de type `bucket`, nous pouvons les imbriquer

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

# Agrégation de type Pipeline

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

# Agrégation de type Pipeline

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
# Présentation de la documentation

---
layout: cover
---
# Démo avec  Kibana

---
layout: cover
---
# Partie Pratique