---
layout: cover
---

# Recherche

---

# Recherche

* Une fois les données indexées, nous pouvons exécuter des recherches
* Nous allons utiliser le endpoint `_search`
* Nous pouvons faire des recherches sur un ou plusieurs indexes/alias

```
POST /movies/_search
POST /movies,albums/_search
POST /movies-*/_search
```

---

# La syntaxe Lucene

* Une première solution est d'utiliser la syntaxe Lucene
* L'ensemble de la requête est définie dans l'URL
* A utiliser seulement pour des requêtes très simples
* Ces requêtes sont difficilement maintenables et ne permettent pas d'utiliser l'intégralité du DSL d'Elasticsearch

```
GET /movies/_search?q=titanic
GET /movies/_search?q=title:titanic
GET /movies/_search?q=title:titanic AND (year:[1990 TO 2000])
```

---

# La syntaxe Lucene

* Cette syntaxe propose également de définir :
    * le tri
    * la pagination

```
GET /movies/_search?q=titanic&sort=year:desc&size:100&from=101
```

---

# La DSL Elasticsearch

* Pour des recherches plus complexes, nous vous conseillons d'utiliser la DSL d'Elasticsearch

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

# Les recherches full text

* Les recherches `full text` ("à la Google") permettent de manipuler les textes analysés
* La chaîne de caractères recherchée sera elle-même analysée en fonction de la configuration
* Nous pouvons utiliser le verbe `POST` (recommandé) ou `GET` (non-respect de la spécification HTTP1.1).

---

# Les recherches full text

* Les recherches `full text` retournent les résultats triés par pertinence (`score`)
* Préserver un bon calcul du score est primordial
* L'algorithme utilisé par défaut est le `BM25`, basé sur `TF/IDF`
    * tfidf(t,d,D) = tf(t,d) × idf(t,D)
    * tf = combien de fois apparait le terme `t` recherché dans le document `d`
    * idf = combien de fois apparait le terme dans tous les documents `D`
    * normalisé par la taille de la propriété
    * éventuellement boosté
* api `_explain`

---

# Query String

* Par exemple, la recherche de type `query_string` permet de réutiliser la syntaxe Lucene

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

* Recherche de type `match`

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

* Recherche de type `match_phrase`

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

* Recherche de type `multi_match`

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

# Les recherches exactes

* Les recherches exactes permettent de manipuler les proriétés non analysées
* La recherche ne sera pas du tout analysée. Attention aux pièges

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

# Les filtres

* Une recherche impactera toujours le calcul du score.
* Si le score n'est pas utile, il est préférable d'utiliser des filtres
* Plus performant que les recherches, pas de calcul du score et les résultats sont mis en cache.

---

# Les filtres

* Cas d'utilisation principal, quand la réponse est oui ou non

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

# Les recherches géographiques

* Afin de pouvoir exécuter des requêtes de recherche géographique, il est nécessaire d'avoir une propriété de type
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

* Permet de retourner les documents dont la propriété `geo_point` est à une distance donnée

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

# Les recherches booléennes

* Si vous souhaitez écrire une requéte complexe, nous pouvons utiliser la requête `bool`
* Permet de définir des recherches `must`, `must_not`, `should` et `filter`

---

# Les recherches booléennes

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

# Le tri

* Par défaut, Elasticsearch retourne les documents triés en fonction du `_score`.
* Nous pouvons modifier ce tri grâce à la propriété `sort`.
* Nous pouvons définir plusieurs tris, ainsi que le sens : `asc` ou `desc`

---

# Le tri

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

* Nous pouvons gérer la pagination à la main via les paramètre `from` et `size`.
* Peu performant, il est recommandé d'utiliser la Scroll API pour les gros volumes.
* La scroll API renvoie un curseur

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
* Utilisation de **search_after** avec un PIT
* Approche dorénavant recommandée par Elastic
* Permet de préserver l'état de l'index lors du parcours des différentes pages

---

# Score

* Il est possible de modifier le score calculé
* Nous allons utiliser le langage `Painless`

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

# Le Cross Cluster Search

* Il est possible de faire une recherche sur plusieurs clusters
* Pour cela, il est nécessaire de :
    * configurer des remote clusters dans votre cluster local
    * indiquer quel cluster vous souhaitez requêter lors de l'envoi d'une requête.

---

# Le Cross Cluster Search

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

# Le Cross Cluster Search

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