---
layout: cover
---

# Alerting Systems

Proactive surveillance and automatic notifications with Elasticsearch Alerting

---

# Learning Objectives

By the end of this section, you will be able to:

- Understand Elasticsearch alerting mechanisms (Watcher and Kibana Rules)
- Create alerts based on cluster conditions, metrics, or queries
- Configure alert actions (email, webhook, Slack, index)
- Use Kibana monitoring dashboards to manage active alerts

---

# Why Alerting is Critical

Proactive alerting allows detecting and responding to problems before they impact users.

**Common alerting scenarios**:
- Cluster goes to RED status (data loss)
- Cluster goes to YELLOW status (HA loss)
- Disk usage >85% (LOW watermark)
- JVM Heap >85% (OutOfMemoryError risk)
- Error rate >5% (service degradation)
- p95 latency >1s (user experience)
- Thread pool rejections >100/min (overload)

---

# Why Alerting is Critical

**Benefits**:
- Early incident detection
- Reduced MTTR (Mean Time To Recovery)
- Major outage prevention
- SLA compliance

---

# Elasticsearch Alerting: Two Solutions

Elasticsearch offers two complementary alerting systems.

## 1. Watcher (Elasticsearch Alerting API)

**Characteristics**:
- Based on Elasticsearch queries (JSON DSL)
- Scheduled execution
- Very flexible and powerful
- Configuration via REST API

**Use case**: Complex alerts based on aggregations, data transformations, advanced business logic.

---

# Elasticsearch Alerting: Two Solutions

## 2. Kibana Rules & Connectors

**Characteristics**:
- Graphical interface in Kibana
- Predefined rule types (Elasticsearch query, index threshold, etc.)
- Integration with Kibana Stack Monitoring
- Simpler to configure

**Use case**: Standard alerts on Elasticsearch metrics, logs, APM.

**Recommendation**: Use Kibana Rules for simple cases, Watcher for complex cases.

---

# Anatomy of a Watcher Alert

A [Watcher alert](https://www.elastic.co/guide/en/elasticsearch/reference/current/xpack-alerting.html) consists of 5 main elements.

```
Watch = Trigger + Input + Condition + Transform + Actions
```

**1. Trigger** (when to execute):
```json
"trigger": {
  "schedule": {
    "interval": "1m"  // Every minute
  }
}
```

**2. Input** (collect data):
```json
"input": {
  "search": {
    "request": {
      "indices": ["logs-*"],
      "body": {
        "query": { "range": { "@timestamp": { "gte": "now-5m" }}}
      }
    }
  }
}
```

---

# Anatomy of a Watcher Alert

**3. Condition** (evaluate if alert):
```json
"condition": {
  "compare": {
    "ctx.payload.hits.total": {
      "gte": 100  // If >=100 errors
    }
  }
}
```

**4. Transform** (optional, transform data):
```json
"transform": {
  "script": "return ['error_count': ctx.payload.hits.total]"
}
```

---

# Anatomy of a Watcher Alert

**5. Actions** (notify):
```json
"actions": {
  "send_email": {
    "email": {
      "to": "ops@company.com",
      "subject": "Errors detected: {{ctx.payload.hits.total}}"
    }
  }
}
```

---

# Trigger: Execution Scheduling

The [trigger](https://www.elastic.co/guide/en/elasticsearch/reference/current/trigger.html) defines when the watch is executed.

**Schedule types**:

**1. Interval** (periodic):
```json
"trigger": {
  "schedule": {
    "interval": "30s"  // 30s, 5m, 1h, 1d
  }
}
```

**2. Cron** (specific times):
```json
"trigger": {
  "schedule": {
    "cron": "0 0 12 * * ?"  // Every day at noon
  }
}
```

---

# Trigger: Execution Scheduling

**3. Hourly** (every hour):
```json
"trigger": {
  "schedule": {
    "hourly": {
      "minute": [0, 30]  // At xx:00 and xx:30
    }
  }
}
```

**4. Daily** (every day):
```json
"trigger": {
  "schedule": {
    "daily": {
      "at": ["08:00", "20:00"]  // At 8am and 8pm
    }
  }
}
```

---

# Input: Data Collection

The [input](https://www.elastic.co/guide/en/elasticsearch/reference/current/input.html) retrieves data to analyze for the alert.

**Main input types**:

**1. Search Input** (Elasticsearch query):
```json
"input": {
  "search": {
    "request": {
      "indices": ["logs-*"],
      "body": {
        "query": {
          "bool": {
            "must": [
              { "range": { "@timestamp": { "gte": "now-5m" }}},
              { "term": { "level": "error" }}
            ]
          }
        },
        "aggs": {
          "error_count": {
            "value_count": { "field": "message.keyword" }
          }
        }
      }
    }
  }
}
```

---

# Input: Data Collection

**2. HTTP Input** (external API):
```json
"input": {
  "http": {
    "request": {
      "url": "https://api.example.com/metrics",
      "method": "GET",
      "headers": {
        "Authorization": "Bearer {{ctx.metadata.token}}"
      }
    }
  }
}
```

---

# Input: Data Collection

**3. Chain Input** (combine multiple inputs):
```json
"input": {
  "chain": {
    "inputs": [
      { "first": { "search": {...}}},
      { "second": { "http": {...}}}
    ]
  }
}
```

---

# Condition: Alert Evaluation

The [condition](https://www.elastic.co/guide/en/elasticsearch/reference/current/condition.html) determines if actions should be triggered.

**Condition types**:

**1. Compare** (simple comparison):
```json
"condition": {
  "compare": {
    "ctx.payload.hits.total": {
      "gte": 100
    }
  }
}
```

---

# Condition: Alert Evaluation

**2. Array Compare** (all/at least one element):
```json
"condition": {
  "array_compare": {
    "ctx.payload.aggregations.nodes.buckets": {
      "path": "heap_percent",
      "gte": {
        "value": 85
      }
    }
  }
}
```

---

# Condition: Alert Evaluation

**3. Script** (custom logic):
```json
"condition": {
  "script": {
    "source": "return ctx.payload.hits.total > 100 && ctx.payload.aggregations.error_count.value > 50"
  }
}
```

**4. Always** (always trigger):
```json
"condition": {
  "always": {}
}
```

**5. Never** (temporarily disable):
```json
"condition": {
  "never": {}
}
```

---

# Condition: Alert Evaluation

**Context variables**:
- `ctx.trigger.scheduled_time`: Scheduled execution time
- `ctx.execution_time`: Actual execution time
- `ctx.payload`: Input data
- `ctx.metadata`: Watch metadata

---

# Actions: Notifications and Responses

[Actions](https://www.elastic.co/guide/en/elasticsearch/reference/current/actions.html) define the response when an alert triggers.

**Action types**:

**1. Email** (email notification):
```json
"actions": {
  "send_email": {
    "email": {
      "to": ["ops@company.com", "oncall@company.com"],
      "subject": "ALERT: Cluster {{ctx.metadata.cluster}} - Heap >85%",
      "body": {
        "text": "Heap usage: {{ctx.payload.aggregations.avg_heap.value}}%\nNodes affected: {{ctx.payload.hits.total}}"
      }
    }
  }
}
```

---

# Actions: Notifications and Responses

**2. Webhook** (HTTP POST to external API):
```json
"actions": {
  "notify_slack": {
    "webhook": {
      "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
      "method": "POST",
      "body": "{\"text\":\"Heap alert: {{ctx.payload.aggregations.avg_heap.value}}%\"}"
    }
  }
}
```

**3. Index** (index the alert in Elasticsearch):
```json
"actions": {
  "log_alert": {
    "index": {
      "index": "alerts-history",
      "doc_id": "{{ctx.watch_id}}-{{ctx.execution_time}}"
    }
  }
}
```

---

# Actions: Notifications and Responses

**4. Logging** (write to Elasticsearch logs):
```json
"actions": {
  "log_action": {
    "logging": {
      "level": "error",
      "text": "Heap alert triggered: {{ctx.payload.aggregations.avg_heap.value}}%"
    }
  }
}
```

**Throttling**: Avoid alert storms:
```json
"throttle_period": "15m"  // Max 1 alert every 15min
```

---

# Complete Example: Heap >85% Alert

**Complete watch** to monitor JVM heap - **Part 1: Configuration**

```json
PUT _watcher/watch/heap_usage_alert
{
  "metadata": {
    "cluster": "production",
    "threshold": 85
  },
  "trigger": {
    "schedule": { "interval": "1m" }
  },
  "input": {
    "search": {
      "request": {
        "indices": [".monitoring-es-*"],
        "body": {
          "query": {
            "bool": {
              "must": [
                { "range": { "@timestamp": { "gte": "now-2m" }}},
                { "range": { "node_stats.jvm.mem.heap_used_percent": { "gte": 85 }}}
              ]
            }
          }
        }
      }
    }
  }
}
```

---

# Complete Example: Heap >85% Alert (continued)

**Part 2: Aggregations and Condition**

```json
"aggs": {
  "nodes_high_heap": {
    "terms": { "field": "node_stats.node_id", "size": 10 },
    "aggs": {
      "avg_heap": {
        "avg": { "field": "node_stats.jvm.mem.heap_used_percent" }
      }
    }
  }
},
"condition": {
  "compare": { "ctx.payload.hits.total": { "gt": 0 } }
}
```

---

# Complete Example: Heap >85% Alert (continued)

**Part 3: Actions**

```json
"actions": {
  "notify_ops": {
    "email": {
      "to": "ops@company.com",
      "subject": "[CRITICAL] Heap >85%",
      "body": {
        "text": "Heap alert at {{ctx.execution_time}}"
      }
    },
    "throttle_period": "15m"
  },
  "log_to_index": {
    "index": {
      "index": "watcher-alerts",
      "doc_id": "{{ctx.watch_id}}-{{ctx.execution_time}}"
    }
  }
}
```

**Test**: `POST _watcher/watch/heap_usage_alert/_execute`

---

# Kibana Rules: Simplified Alerting

[Kibana Rules](https://www.elastic.co/guide/en/kibana/current/alerting-getting-started.html) offer a graphical interface for creating alerts.

**Access**: Kibana -> Stack Management -> Rules and Connectors

**Available rule types**:

| Rule Type | Usage | Example |
|-----------|-------|---------|
| **Elasticsearch query** | Alert based on ES query | Error count >100 |
| **Index threshold** | Threshold on aggregation | Average heap >85% |
| **ES query** | ES query with condition | Missing documents |
| **Metrics threshold** | Thresholds on APM/infra metrics | CPU >80% |

---

# Kibana Rules: Simplified Alerting

**Creation workflow**:
1. **Define rule**: Name, type, query/condition
2. **Add connector**: Slack, email, PagerDuty, webhook
3. **Configure action**: Message template, variables
4. **Set schedule**: Evaluation interval (1m, 5m, etc.)
5. **Save and enable**: Activate the rule

**Advantages vs Watcher**:
- Graphical interface (no JSON)
- Native integration with Kibana visualizations
- Centralized connector management (reusable)
- Less flexible than Watcher for complex logic

---

# Connectors: External Integrations

[Connectors](https://www.elastic.co/guide/en/kibana/current/action-types.html) allow sending notifications to external systems.

**Popular connectors**:

**1. Slack**:
```
- Type: Webhook
- URL: https://hooks.slack.com/services/YOUR/WEBHOOK
- Message: Uses Slack Markdown
```

**2. Email (SMTP)**:
```
- Host: smtp.gmail.com
- Port: 587
- Username/Password: SMTP Credentials
- From: alerts@company.com
```

**3. PagerDuty**:
```
- Integration Key: PagerDuty API key
- Severity: critical, error, warning, info
```

**4. Webhook (generic)**:
```
- URL: External API
- Method: POST, PUT, etc.
- Headers: Authorization, Content-Type
- Body: JSON payload
```

**5. Index** (Elasticsearch):
```
- Index: alerts-history-*
- Document: JSON with alert details
```

**Configuration**: Stack Management -> Rules and Connectors -> Connectors -> Create connector

**Best practice**: Create one connector per notification type (1 for Slack prod, 1 for Slack dev, etc.)

---

# Kibana Stack Monitoring Alerts

Kibana offers [predefined alerts for Stack Monitoring](https://www.elastic.co/guide/en/kibana/current/kibana-alerts.html).

**Available alerts** (ready to use):

| Alert | Condition | Criticality |
|-------|-----------|-------------|
| **Cluster health** | Status = yellow or red | Critical |
| **Node disk usage** | Disk >80% | Warning |
| **CPU usage** | CPU >95% for 5min | Warning |
| **Memory usage (JVM)** | Heap >85% for 5min | Critical |
| **Missing monitoring data** | No data >15min | Warning |
| **License expiration** | License expires <30d | Warning |
| **Large shard size** | Shard >50GB | Info |

**Activation**:
1. Stack Management -> Rules and Connectors
2. Click "Create rule"
3. Select "Elasticsearch health" or other rule type
4. Configure thresholds and connector
5. Save and enable

**Alert history**: Kibana -> Stack Monitoring -> Alerts

**Visualization**:
- Active alerts (currently firing)
- Recovered alerts
- Error alerts (execution error)

---

# Alert Lifecycle Management

**Alert states**:
1. **Active** (firing): Condition met, actions triggered
2. **OK** (recovered): Condition returned to normal
3. **Pending**: Being evaluated
4. **Error**: Execution error (invalid query, unavailable connector)

**Alert history**:
```bash
GET .watcher-history-*/_search
{
  "query": {
    "match": {
      "watch_id": "heap_usage_alert"
    }
  },
  "sort": [{ "@timestamp": "desc" }],
  "size": 100
}
```

**Temporarily disable**:
```bash
PUT _watcher/watch/heap_usage_alert/_deactivate
# Reactivate:
PUT _watcher/watch/heap_usage_alert/_activate
```

---

# Alert Lifecycle Management

**Delete a watch**:
```bash
DELETE _watcher/watch/heap_usage_alert
```

**Watch monitoring**:
```bash
GET _watcher/stats
{
  "watcher_state": "started",
  "watch_count": 10,
  "execution_thread_pool": {
    "queue_size": 0,
    "max_size": 1000
  }
}
```

---

# Alerting Best Practices

**1. Avoid Alert Fatigue**:
- Too many alerts -> team ignores them
- Alert only on critical metrics
- Use throttling (15-30min minimum)

**2. Make Actionable**:
- "Cluster unhealthy" (too vague)
- "Heap >85% on node-1, consider scaling"

**3. Provide Context**:
- Links to Kibana dashboards
- Diagnostic commands
- History (trend)

---

# Alerting Best Practices (continued)

**4. Progressive Escalation**:
```
Warning (>75%)   -> Log + Slack
Critical (>85%)  -> Email + PagerDuty
Emergency (>95%) -> PagerDuty + Call
```

**5. Testing**:
- Test with `_execute` before activation
- Validate connectors
- Verify message templates

**6. Documentation**:
- Playbook for each alert
- Expected frequency documented

---

# Summary

## Key Points

- **Alerting systems** (Watcher and Kibana Rules) enable proactive cluster surveillance
- A **Watcher watch** consists of: trigger, input, condition, transform, actions
- **Kibana Rules** offer a graphical interface for simple alerts
- **Connectors** (Slack, email, PagerDuty, webhook) enable external notifications
- **Stack Monitoring alerts** provide predefined alerts for Elasticsearch
- **Best practices**: avoid alert fatigue, make alerts actionable, document playbooks

## Formulas and Examples

**Trigger cron**: `"0 0 12 * * ?"` = Every day at noon
**Threshold condition**: `"ctx.payload.hits.total": {"gte": 100}` = If >=100 results
**Throttling**: `"throttle_period": "15m"` = Max 1 alert/15min
**Context variable**: `{{ctx.payload.aggregations.avg_heap.value}}` = Aggregation value

---

# Practical Exercises

Now proceed to the **exercise workbook** to practice these concepts.

**Labs to complete**:
- Lab 5.1: Creating a simple alert (cluster health)
- Lab 5.2: Configuring alert actions (webhook, index)
- Bonus 5.A: Advanced Watcher alert with complex aggregations

Estimated time: **45-60 minutes**

**These exercises cover**:
- Creating Kibana Rules with graphical interface
- Configuring connectors (Slack, webhook)
- Creating Watcher with JSON
- Testing and validating alerts
