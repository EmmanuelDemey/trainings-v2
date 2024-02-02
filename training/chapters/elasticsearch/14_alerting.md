---
layout: cover
---

# Alerting

---

# Alerting

* Elasticsearch propose deux solutions pour mettre en place un système d'alerting
    * Watcher (Elasticsearch)
    * Alerting (Kibana)

---

# Watcher

* API permettant de créer et gérer des "écoutes"
* Un `watch` est composé des propriétés
    * `trigger`
    * `input`
    * `condition`
    * `actions`
    * `threshold`

---

# Watcher

```
PUT _watcher/watch/log_error_watch
{
  "trigger" : {
  },
  "input" : {
  },
  "condition": {
  }
  "actions": {
  }
}
```

---

# Trigger

```
{
    "trigger" : {
        "schedule" : {
          "interval" : "5m"
        }
    }
}
```

---

# Input

* Peut etre de type `simple`, `search`, `http` ou `chain`

```
{
  "input" : {
    "search" : {
      "request" : {
        "indices" : "log-events",
        "body" : {
          "size" : 0,
          "query" : { "match" : { "status" : "error" } }
        }
      }
    }
  },
}
```

---

# Condition

* Peut etre de type `always`, `never`, `compare`, `array_compare` ou `script`

```
{
  "condition" : {
    "compare" : { "ctx.payload.hits.total" : { "gt" : 5 }}
  }
}
```

---

# Actions

* Peut etre de type `email`, `webhook`, `index`, `logging`, `slack`, `pagerduty` ou `jira`

```
{
  "actions" : {
    "my_webhook" : {
      "webhook" : {
        "method" : "POST",
        "host" : "mylisteninghost",
        "port" : 9200,
        "path" : "/{{watch_id}}",
        "body" : "Encountered {{ctx.payload.hits.total}} errors"
      }
    }
  }
}
```

---

# Gestion des watcher

* Pour lister les wachers

```
POST /_watcher/_query/watches
{
  "size" : 100
}
```

* Pour supprimer un watcher, nous pouvons exécuter la requete suivante

```
DELETE _watcher/watch/log_error_watch
```

---

# Historique

* L'ensemble de ces exécutions seront enregistrées dans un index `.watcher-history*`

```
POST .watcher-history*/_search?pretty
{
  "sort" : [
    { "result.execution_time" : "desc" }
  ]
}
```

---

# Exemple Concret

```
PUT _watcher/watch/cluster_health_watch
{
  "trigger" : {
    "schedule" : { "interval" : "10s" }
  },
  "input" : {
    "http" : {
      "request" : {
       "host" : "localhost",
       "port" : 9200,
       "path" : "/_cluster/health"
      }
    }
  },
  "condition" : {
    "compare" : {
      "ctx.payload.status" : { "eq" : "red" }
    }
  },
  "actions" : {
    "send_email" : {
      "email" : {
        "to" : "username@example.org",
        "subject" : "Cluster Status Warning",
        "body" : "Cluster status is RED"
      }
    }
  }
}
```

---
layout: cover
---

# Demo de Alerting sur Kibana

---
layout: cover
---
# Partie Pratique
