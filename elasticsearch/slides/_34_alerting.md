---
layout: cover
---

# Alerting

---

# Alerting

* Elasticsearch offers two solutions to set up an alerting system
    * Watcher (Elasticsearch)
    * Alerting (Kibana)

---

# Watcher

* API allowing to create and manage "watches"
* A `watch` is composed of properties
    * `trigger`
    * `input`
    * `condition`
    * `actions`
    * optional: `transform`, `throttle_period`, `metadata`

---

# Watcher

```json
PUT _watcher/watch/log_error_watch
{
  "trigger": { "schedule": { "interval": "10m" } },
  "input": {
    "search": {
      "request": {
        "indices": ["logs-*"],
        "body": { "query": { "match": { "message": "error" } } }
      }
    }
  },
  "condition": { "compare": { "ctx.payload.hits.total": { "gt": 0 } } },
  "actions": {
    "log_error": { "logging": { "text": "{{ctx.payload.hits.total}} errors" } }
  }
}
```

---

# Trigger

```json
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

* Can be of type `simple`, `search`, `http`, or `chain`

```json
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

* Can be of type `always`, `never`, `compare`, `array_compare`, or `script`

```json
{
  "condition" : {
    "compare" : { "ctx.payload.hits.total" : { "gt" : 5 }}
  }
}
```

---

# Actions

* Can be of type `email`, `webhook`, `index`, `logging`, `slack`, `pagerduty`, or `jira`

```json
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

# Watcher Management

* To list the watchers

```json
POST /_watcher/_query/watches
{
  "size" : 100
}
```

* To delete a watcher, we can execute the following request

```json
DELETE _watcher/watch/log_error_watch
```

---

# History

* All of these executions will be recorded in an index `.watcher-history*`

```json
POST .watcher-history*/_search?pretty
{
  "sort" : [
    { "result.execution_time" : "desc" }
  ]
}
```

---

# Concrete Example

```json
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

# Kibana Alerting Demo

---
layout: cover
---
# Practical Part