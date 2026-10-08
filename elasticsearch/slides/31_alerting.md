---
layout: section
---

# Part 12: Alerting

---

# Watcher API (Elasticsearch)

Watch structure:

```json
PUT _watcher/watch/jvm_heap_alert
{
  "trigger": { ... },      // When to trigger
  "input": { ... },        // Data to collect
  "condition": { ... },    // Trigger condition
  "actions": { ... }       // Actions to execute
}
```

---

# Example: JVM Heap Alert

```json
PUT _watcher/watch/jvm_heap_alert
{
  "trigger": {
    "schedule": { "interval": "1m" }
  },
  "input": {
    "http": {
      "request": {
        "host": "localhost",
        "port": 9200,
        "path": "/_nodes/stats/jvm",
        "auth": { "basic": { "username": "elastic", "password": "xxx" } }
      }
    }
  },
  "condition": {
    "script": {
      "source": "return ctx.payload.nodes.values().stream().anyMatch(n -> n.jvm.mem.heap_used_percent > 85)"
    }
  },
  "actions": {
    "notify_slack": {
      "slack": {
        "message": {
          "to": ["#alerts"],
          "text": "JVM Heap > 85%!"
        }
      }
    }
  }
}
```

---

# Trigger Types

```json
// Regular interval
{ "schedule": { "interval": "5m" } }

// Cron expression
{ "schedule": { "cron": "0 0 * * * ?" } }

// Specific times
{ "schedule": {
    "daily": { "at": ["09:00", "17:00"] }
  }
}
```

---

# Input Types

```json
// Elasticsearch search
{
  "input": {
    "search": {
      "request": {
        "indices": ["logs-*"],
        "body": {
          "query": { "term": { "level": "ERROR" } },
          "aggs": { "error_count": { "value_count": { "field": "_id" } } }
        }
      }
    }
  }
}

// External HTTP
{
  "input": {
    "http": {
      "request": { "url": "https://api.example.com/status" }
    }
  }
}
```

---

# Action Types

```json
"actions": {
  // Email
  "send_email": {
    "email": {
      "to": ["ops@parkki.com"],
      "subject": "Elasticsearch Alert",
      "body": "Critical JVM Heap!"
    }
  },

  // Webhook
  "notify_pagerduty": {
    "webhook": {
      "url": "https://events.pagerduty.com/...",
      "body": "{ \"event\": \"trigger\", ... }"
    }
  },

  // Slack
  "notify_slack": {
    "slack": {
      "message": { "to": ["#alerts"], "text": "Alert!" }
    }
  }
}
```

---

# Kibana Alerting

Simpler than Watcher:

<v-clicks>

1. **Stack Management** > **Rules and Connectors**
2. **Create rule**
3. Choose the type (Elasticsearch query, threshold, etc.)
4. Configure the condition
5. Add actions (Slack, Email, Webhook)

**Advantages**:
- Graphical interface
- Centralized management
- Execution history

</v-clicks>

---

# Example: Application Errors Alert

```json
PUT _watcher/watch/app_errors_alert
{
  "trigger": { "schedule": { "interval": "1m" } },
  "input": {
    "search": {
      "request": {
        "indices": ["logs-parkki-*"],
        "body": {
          "query": {
            "bool": {
              "filter": [
                { "term": { "level": "ERROR" } },
                { "range": { "@timestamp": { "gte": "now-1m" } } }
              ]
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": { "ctx.payload.hits.total.value": { "gt": 100 } }
  },
  "actions": {
    "notify_slack": {
      "slack": {
        "message": {
          "to": ["#parkki-alerts"],
          "text": "More than 100 errors in the last minute!"
        }
      }
    }
  }
}
```
