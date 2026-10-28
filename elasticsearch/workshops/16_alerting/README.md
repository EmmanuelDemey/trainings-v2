# Workshop 16 — Alerting

> Create monitoring alerts with Kibana Rules, and wire them to advanced actions (webhook, index).

**Topic**: Operations — Alerting

## Context

An alert is only useful if it triggers the right action. In this workshop you create monitoring rules, send them to a webhook, and keep a history of the alerts.

Each step states **what** to build, not **how**: find the screen in Kibana or the API in the documentation, try it, check the result, adjust. Hints are folded — open them only once you are stuck.

## Setup

This workshop stands on its own. Create the simulation index:

```json
PUT /cluster_health_logs
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "status": { "type": "keyword" },
      "cluster_name": { "type": "keyword" },
      "number_of_nodes": { "type": "integer" },
      "unassigned_shards": { "type": "integer" }
    }
  }
}

POST /cluster_health_logs/_doc
{
  "@timestamp": "2024-01-15T10:00:00Z",
  "status": "yellow",
  "cluster_name": "es-ops-training",
  "number_of_nodes": 3,
  "unassigned_shards": 2
}
```

## Part A: A simple alert with Kibana Rules

Reference: [Alerting](https://www.elastic.co/docs/explore-analyze/alerts-cases/alerts).

### Step 1: The rule

In Kibana, create a rule named `cluster-health-monitor`, tagged `cluster`, `health`, `ops`, that fires when `cluster_health_logs` holds a document of the **last 5 minutes** whose `status` is `yellow` or `red`. It checks **every minute**, and notifies **every time** the alert is active.

<details>
<summary>Hint</summary>

The rules live under **Stack Management**. Look for the rule type that runs a query on an index. Its query is written in Query DSL: one condition on time, one on the status — which of the two should score?

</details>

### Step 2: The action

Give the rule a **Server log** action whose message names the cluster, its status, its number of nodes and of unassigned shards, the date, and tells what to check.

<details>
<summary>Hint</summary>

The message is a Mustache template. The **Add variable** button of the action lists what the rule type exposes: look at what it offers about the documents that matched.

</details>

### Step 3: Make it fire

Index a new health document dated **now**, `yellow`, with 5 unassigned shards. Wait 1–2 minutes, and find the run in the history of the rule.

**Question**: the setup document is dated 2024. Why did it not fire the rule?

## Part B: Advanced actions — webhook and index

### Step 1: Something to receive webhooks

Open <https://webhook.site> and note the unique URL it gives you. Or, locally:

```bash
while true; do echo -e "HTTP/1.1 200 OK\n\n" | nc -l 8888; done
```

### Step 2: Two connectors

Create two connectors:

- `ops-webhook-notifier`: a **webhook**, `POST` to your URL, with the headers `Content-Type: application/json` and `X-Alert-Source: elasticsearch-ops`. Test it.
- `alert-history-index`: it **indexes** each alert into `alert-history`, refreshed, with `@timestamp` as time field.

<details>
<summary>Hint</summary>

Connectors live next to the rules, in **Stack Management**. Reference: [Connectors](https://www.elastic.co/docs/reference/kibana/connectors-kibana).

</details>

**Question**: why are connectors separate from the rules?

### Step 3: The heap data

Create the simulation index of the heap usage:

```json
PUT /heap-monitoring
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "node_id": { "type": "keyword" },
      "node_name": { "type": "keyword" },
      "heap_used_percent": { "type": "float" }
    }
  }
}

POST /heap-monitoring/_bulk
{"index":{}}
{"@timestamp":"2024-01-15T10:00:00Z","node_id":"node-1","node_name":"es-ops-node-1","heap_used_percent":87.5}
{"index":{}}
{"@timestamp":"2024-01-15T10:01:00Z","node_id":"node-1","node_name":"es-ops-node-1","heap_used_percent":89.2}
{"index":{}}
{"@timestamp":"2024-01-15T10:02:00Z","node_id":"node-2","node_name":"es-ops-node-2","heap_used_percent":91.8}
{"index":{}}
{"@timestamp":"2024-01-15T10:00:00Z","node_id":"node-3","node_name":"es-ops-node-3","heap_used_percent":75.3}
```

### Step 4: A rule with two actions

Create the rule `heap-usage-critical`: it fires when `heap-monitoring` holds, in the last 5 minutes, a heap usage of **85% or more**. It sends a JSON payload to `ops-webhook-notifier` — the alert id and name, `alert_type: heap_usage`, `severity: critical`, the date, and the condition — and archives the alert through `alert-history-index`.

### Step 5: Make it fire, read the history

Index a heap usage of 92.5% for `node-1`, dated **now**. Check what webhook.site received, then find the archived alert in `alert-history`, the newest first.

**Question**: what would you change so that the same overloaded node does not page someone every minute?

## Key points

- **Kibana Rules** create alerts without writing JSON
- **Connectors** are shared between rules
- **Webhooks** reach any external service
- **Indexing the alerts** builds a history you can analyse
- **Throttling** avoids repeated alerts (alert fatigue)

## Success criteria

- A rule that fires, and its history read
- A webhook received, an alert archived in `alert-history`

## Troubleshooting

**Problem**: the rule never fires
→ Look at the dates: the query only looks at the last 5 minutes.
