# Workshop 16 — Alerting: solution

For the trainer. Not published: the learners find these themselves.
The CI replays the requests right after the setup of the workshop README.

## Part A

### Step 1

**Stack Management** → **Alerts and Insights** → **Rules** → **Create rule** →
**Elasticsearch query**. Name `cluster-health-monitor`, tags `cluster`, `health`,
`ops`. Index `cluster_health_logs`, time field `@timestamp`, query:

```text
{
  "query": {
    "bool": {
      "filter": [
        { "range": { "@timestamp": { "gte": "now-5m" } } },
        { "terms": { "status": ["yellow", "red"] } }
      ]
    }
  }
}
```

Both conditions are yes/no: `filter`, no scoring. **Check every** `1 minute`,
**Notify** every time the alert is active (on check intervals).

### Step 2

**Add action** → **Server log**:

```text
Alert: cluster {{#context.hits}}{{_source.cluster_name}}{{/context.hits}} is {{#context.hits}}{{_source.status}}{{/context.hits}}!

- Nodes: {{#context.hits}}{{_source.number_of_nodes}}{{/context.hits}}
- Unassigned shards: {{#context.hits}}{{_source.unassigned_shards}}{{/context.hits}}
- Date: {{context.date}}

Check the cluster with GET _cluster/health
```

`context.hits` holds the matching documents; **Add variable** also offers
`context.date`, `context.value` (their count) and `context.conditions`.

### Step 3

Index the document with the current date (`date -u +%Y-%m-%dT%H:%M:%SZ`):

<!-- ci: skip -->
```json
POST /cluster_health_logs/_doc?refresh=true
{
  "@timestamp": "<now>",
  "status": "yellow",
  "cluster_name": "es-ops-training",
  "number_of_nodes": 3,
  "unassigned_shards": 5
}
```

The 2024 document is outside `now-5m`. History: the rule → tab **History**.

## Part B

### Step 2

**Stack Management** → **Connectors** → **Create connector**:

- **Webhook**: name `ops-webhook-notifier`, method `POST`, the URL of
  webhook.site, headers `Content-Type: application/json` and
  `X-Alert-Source: elasticsearch-ops`; the **Test** tab sends a sample.
- **Index**: name `alert-history-index`, index `alert-history`, **Refresh** on,
  time field `@timestamp`.

A connector holds a destination and its secrets once; many rules use it, and
changing its URL changes it for all of them.

### Step 4

Rule `heap-usage-critical`, **Elasticsearch query**, index `heap-monitoring`,
time field `@timestamp`:

```text
{
  "query": {
    "bool": {
      "filter": [
        { "range": { "@timestamp": { "gte": "now-5m" } } },
        { "range": { "heap_used_percent": { "gte": 85 } } }
      ]
    }
  }
}
```

Action `ops-webhook-notifier`, body:

```text
{
  "alert_id": "{{alert.id}}",
  "alert_name": "{{rule.name}}",
  "alert_type": "heap_usage",
  "severity": "critical",
  "timestamp": "{{context.date}}",
  "context": { "condition": "Heap usage exceeded 85%" }
}
```

Action `alert-history-index`, document:

```text
{
  "@timestamp": "{{context.date}}",
  "rule": "{{rule.name}}",
  "hits": {{context.value}}
}
```

### Step 5

The document, with the current date, then:

<!-- ci: skip -->
```json
POST /alert-history/_search
{
  "query": { "range": { "@timestamp": { "gte": "now-1h" } } },
  "sort": [{ "@timestamp": "desc" }]
}
```

Against alert fatigue: notify **on status changes** only, or throttle each
action (once per X minutes); and group the rule by `node_id`, so that each node
is an alert of its own.
