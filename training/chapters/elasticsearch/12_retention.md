---
layout: cover
---

# Retention 

---

# Rétention

* Plusieurs étapes possibles pour votre donnée
    * Disponible "normalement"
    * `closed`
    * `shrinked`
    * `rollover-ed`
    * `snapshop-ed`
    * Supprimée
    * sur une configuration moins lourde
    * sur un matériel moins performant

---

# Suppression

* Suppression totale

```
DELETE movies/
```

---

# Supression partielle

```
POST /movies/_delete_by_query
{
  "query": {
    "match": {
      "title": "titanic"
    }
  }
}
```

---

# Open et Close API

* Un index peut etre ouvert ou fermé
* Le fait de fermer un index peut améliorer les performances de votre cluster
* Les données seront toujours indexées mais pas recherchables

```
POST /twitter/_open
POST /twitter/_close
```

---

# Open et Close API

* Il est recommandé de désactiver la possibilité de clore tous les indexes

```
action.disable_close_all_indices: true
```

---

# Shrink API

* Permet de déplacer un index vers un nouvel index avec une configuration plus petite
(moins de shards)
* L'index, qui sera migré, doit être en lecture seule.

```
PUT /movies/_settings
{
  "settings": {
    "index.blocks.write": true
  }
}
```

---

# Shrink API

```
POST /movies/_shrink/shrinked-movies
{
  "settings": {
    "index.number_of_replicas": 1,
    "index.number_of_shards": 1
  }
}
```

---

# DataStream

* Mécanisme permettant de générer dynamiquement plusieurs indexes
* Utile pour les données `time series`
* Seul le dernier indexe sera disponible en écriture
* Tous les indexes seront accessibles en lecture

---

# DataStream

image::../images/data-streams-diagram.svg[]

---

# DataStream

image::../images/data-streams-search-request.svg[]

---

# DataStream

image::../images/data-streams-index-request.svg[]

---

# ILM

* La gestion de ce cycle de vie peut être réalisée
    * manuellement
    * via des scripts (Curator ?)
    * via l`Index Lifecycle Managment API

---

# ILM

```
PUT _ilm/policy/my_policy
{
  "policy": {
    "_meta": {
      "description": "used for nginx log"
    },
    "phases": {
      "warm": {
        "min_age": "10d",
        "actions": {
          "allocate" : {
            "number_of_replicas" : 2
          }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

---

# ILM

* Nous pouvons ainsi associer un ILM à un template

```
PUT _index_template/timeseries_template
{
  "data_stream": { },
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "index.lifecycle.name": "my_policy"
    }
  }
}
```

---

# Gestion des ILM depuis Kibana

---