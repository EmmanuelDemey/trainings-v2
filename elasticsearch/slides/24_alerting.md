---
layout: cover
---

# 24 - Alerting

---

# Learning objectives

By the end of this sequence (**~45 min**, workshop included), you will be able to:

- **Choose** between Kibana alerting and Watcher
- **Create** a rule that runs a query on a schedule, and its actions
- **Share** connectors between rules: server log, index, webhook, Slack, email
- **Tame** the noise: action frequency, snooze, maintenance windows
- **Read** the history of a rule and of its alerts

---

# Two alerting engines

| | **Kibana alerting** | **Watcher** |
|---|---|---|
| Runs in | Kibana (Task Manager) | Elasticsearch |
| Defined with | The UI, or the Kibana API | The `_watcher` API, in JSON |
| Building blocks | Rule + connectors | Trigger, input, condition, actions |
| History | Rule runs, alerts as data | `.watcher-history-*` |
| License | Basic for the common rules | Platinum (or trial) |

> Start with **Kibana alerting**: it is where Elastic invests (Stack Monitoring, Observability, Security rules all run on it). Watcher remains for existing watches.

---

# Kibana alerting: the pieces

```text
 rule ──── every 1 min ────► check: a query, a threshold, a metric…
   │
   ├── alert: one per thing that matches (a host, a node, a group)
   │
   └── action ──► connector ──► Slack, email, webhook, index, server log…
```

- **Rule**: what to check, and how often
- **Alert**: an instance of the rule that is active — it has a status (`active`, `recovered`, `flapping`)
- **Connector**: where to send, with its credentials — **shared** by every rule
- **Action**: a connector + a message template + when to send

---

# Rule types

| Type | Fires when |
|---|---|
| **Elasticsearch query** | A query (DSL, KQL or ES\|QL) returns hits over a threshold |
| **Index threshold** | An aggregation (count, avg, max…) crosses a value, optionally per group |
| **Stack Monitoring** | CPU, disk, JVM, missing nodes, shard size, license… (created by default) |
| **Observability** | Log threshold, metric threshold, uptime, APM latency, SLO burn rate |
| **Security** | Detection rules (SIEM) |

- Created from **Stack Management › Rules**, or from the app they belong to

---

# A rule: the condition

An **Elasticsearch query** rule on `app-logs`:

- **Query**: `level: ERROR`
- **Time field**: `@timestamp`, **window**: the last 5 minutes
- **Threshold**: number of matches `> 10`
- **Check every**: 1 minute

<br />

> Window ≥ check interval, or documents fall between two runs. Add a little margin for the ingestion delay.

---

# A rule: the action

- Connector: **Slack** `#ops-alerts`
- Run when: **Query matched** (the action group), or **Recovered**
- Message, a **Mustache** template:

```text
{{rule.name}}: {{context.value}} errors in the last 5 minutes
{{context.conditions}}
{{#context.hits}}
- {{_source.service.name}}: {{_source.message}}
{{/context.hits}}
```

- **Add variable** lists what the rule type exposes: `rule.*`, `context.*`, `alert.*`, `date`

---

# The same rule, through the API

<!-- ci: skip -->
```json
POST kbn:/api/alerting/rule
{
  "name": "app-errors",
  "rule_type_id": ".es-query",
  "consumer": "stackAlerts",
  "schedule": { "interval": "1m" },
  "tags": ["app", "errors"],
  "params": {
    "searchType": "esQuery",
    "index": ["app-logs"],
    "timeField": "@timestamp",
    "esQuery": "{\"query\":{\"term\":{\"level\":\"ERROR\"}}}",
    "size": 10,
    "threshold": [10],
    "thresholdComparator": ">",
    "timeWindowSize": 5,
    "timeWindowUnit": "m"
  }
}
```

- `kbn:/` sends it to **Kibana** from Dev Tools — rules are Kibana objects, versioned with your code

---

# Connectors

| Connector | For | License |
|---|---|---|
| **Server log** | The Kibana log — tests | Basic |
| **Index** | A document per alert in an index — history | Basic |
| **Webhook** | Any HTTP service | Gold |
| **Slack**, **Teams**, **Email** | People | Gold |
| **PagerDuty**, **Opsgenie**, **ServiceNow**, **Jira** | On-call, tickets | Gold / Platinum |

- **Stack Management › Connectors**: create once, **test**, reuse in every rule
- Credentials stay in the connector (encrypted): rules never hold a secret
- Preconfigured connectors can live in `kibana.yml` — deployed with the infrastructure

---

# A connector, through the API

<!-- ci: skip -->
```json
POST kbn:/api/actions/connector
{
  "name": "alert-history-index",
  "connector_type_id": ".index",
  "config": {
    "index": "alert-history",
    "refresh": true,
    "executionTimeField": "@timestamp"
  }
}
```

- `.server-log`, `.index`, `.webhook`, `.slack`, `.email`…: the `connector_type_id`
- Its `id` is then used in the `actions` of a rule

---

# Index the alerts: a history you can query

The **Index** connector writes the document the action builds:

```json
{
  "@timestamp": "{{date}}",
  "rule": "{{rule.name}}",
  "alert": "{{alert.id}}",
  "value": "{{context.value}}"
}
```

```json
GET /alert-history/_search
{
  "sort": [ { "@timestamp": "desc" } ]
}
```

- Then a dashboard of the alerts: which rule fires most, at what time, for which node

---

# Action frequency

| Run the action | Sends |
|---|---|
| **On status change** | When an alert starts, changes group or recovers |
| **On check intervals** | At each run while active — every minute |
| **On custom interval** | At most once every N minutes per alert (throttle) |
| **Summary of alerts** | One message for all the alerts of the rule, per run or per interval |

> **Alert fatigue** kills on-call: page on status change, send summaries for the rest.

---

# Snooze, mute, maintenance windows

- **Snooze** a rule: no action for a while — or on a schedule
- **Mute** one alert (one host) and keep the others
- **Maintenance window** (Stack Management): no notification for the rules of a category during an upgrade
- **Flapping**: an alert that keeps switching active / recovered is marked as flapping, its notifications are held back
- **Disable** a rule: it no longer runs at all

---

# The history

- **Rules › a rule › History**: each run, its duration, its status, the number of alerts — and the errors
- **Alerts** tab: the active and recovered alerts, their start, duration, status
- The alerts are documents, in the `.alerts-*` indices: they can be searched, and they feed the Observability and Security alert views
- The runs are in the Kibana **event log** (`.kibana-event-log-*`)

<br />

> A rule that *fails* does not fire: watch the rules whose last run is an error, not only the alerts.

---

# Alerting on the cluster itself

- **Stack Monitoring** creates its rules when it is first opened: CPU, disk, JVM heap, missing nodes, thread pool rejections, shard size, license expiry
- They only fire if the monitoring data arrives — on a **separate monitoring cluster**
- Give them a connector: by default they only show in Kibana

| Rule | Default threshold |
|---|---|
| CPU usage | > 85 % for 5 min |
| Disk usage | > 80 % |
| Memory usage (JVM) | > 85 % |
| Missing monitoring data | 15 min |

---

# Watcher: a watch

```json
PUT /_watcher/watch/app_errors
{
  "trigger": { "schedule": { "interval": "5m" } },
  "input": {
    "search": {
      "request": {
        "indices": ["app-logs"],
        "body": {
          "query": {
            "bool": {
              "filter": [
                { "term": { "level": "ERROR" } },
                { "range": { "@timestamp": { "gte": "now-5m" } } }
              ]
            }
          }
        }
      }
    }
  },
  "condition": { "compare": { "ctx.payload.hits.total": { "gt": 10 } } },
  "actions": {
    "log": { "logging": { "text": "{{ctx.payload.hits.total}} errors in 5 minutes" } }
  }
}
```

---

# Watcher: the building blocks

| Block | Choices |
|---|---|
| `trigger` | `schedule`: `interval`, `cron`, `hourly`, `daily`, `weekly`… |
| `input` | `search`, `http`, `simple`, `chain` |
| `condition` | `always`, `never`, `compare`, `array_compare`, `script` |
| `actions` | `logging`, `index`, `webhook`, `email`, `slack`, `pagerduty`, `jira` |
| optional | `transform`, `throttle_period`, `metadata` |

- `email`, `slack`… need an account in `elasticsearch.yml` and the keystore (`xpack.notification.slack.account.<name>.secure_url`)
- `ctx.payload` is the result of the input, `ctx.metadata` the watch's own values

---

# Watcher: test and manage

```json
POST /_watcher/watch/app_errors/_execute
{
  "ignore_condition": true,
  "record_execution": false
}
```

```json
POST /_watcher/_query/watches
{ "size": 100 }
```

```json
GET /.watcher-history-*/_search
{
  "sort": [ { "result.execution_time": "desc" } ]
}
```

- `_execute`: run it **now**, condition forced, without waiting for the trigger
- `PUT /_watcher/watch/<id>/_deactivate`, `_activate`, `_ack` (stop repeating the actions until the condition resets)

---

# Watcher: clean up

```json
DELETE /_watcher/watch/app_errors
```

- Migrating to Kibana: one **Elasticsearch query** or **index threshold** rule per watch, its actions on shared connectors
- Keep Watcher for what Kibana rules cannot do: a `chain` of inputs, an `http` input on an external API, a scripted transform

---

# Quiz

**A rule checks every minute the errors of the last minute, and misses some. Why?**

- A) The threshold is too low
- B) Documents arrive with a delay: the window must be larger than the interval
- C) Kibana alerting only runs every 5 minutes

<v-click>

**Answer: B** — a document indexed after its `@timestamp` window was checked is never seen. Use a window wider than the interval, e.g. 5 minutes checked every minute.

</v-click>

---

# Quiz

**An overloaded node pages the on-call every minute. What to change?**

- A) Delete the rule
- B) Run the action on status change, or on a custom interval
- C) Raise the check interval to 1 hour

<v-click>

**Answer: B** — the alert stays active, but the action is sent when it starts and recovers, or at most once per interval. A 1-hour check would also delay the first page.

</v-click>

---
layout: cover
---

# Workshop 20

## Alerting
