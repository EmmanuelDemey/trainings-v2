# Workshop 9 — Alerting and access control

> Create monitoring alerts with Kibana Rules, wire them to advanced actions (webhook, index), and manage users with RBAC and Document-Level Security.

**Topic**: Operations — Alerting, users and roles

## Context

An alert is only useful if it triggers the right action. In this workshop you create monitoring rules, send them to a webhook, keep a history of the alerts, and set up role-based access control.

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

## Part C: Users and roles (RBAC)

Reference: [User roles](https://www.elastic.co/docs/deploy-manage/users-roles/cluster-or-deployment-auth/user-roles).

### Setup of this part

The name `logs-2024.01` (with a dot) is on purpose: Elasticsearch keeps `logs-*-*` for the data streams of Elastic Agent (built-in template `logs`), and would refuse a regular index like `logs-2024-01` there.

```json
PUT /logs-2024.01
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

POST /logs-2024.01/_bulk?refresh=true
{"index":{"_id":"1"}}
{"timestamp":"2024-01-15T10:00:00Z","level":"INFO","message":"Application started","service":"api"}
{"index":{"_id":"2"}}
{"timestamp":"2024-01-15T10:05:00Z","level":"WARN","message":"High memory usage","service":"api"}
{"index":{"_id":"3"}}
{"timestamp":"2024-01-15T10:10:00Z","level":"ERROR","message":"Database connection failed","service":"database"}
```

### Step 1: Who are you?

Find, through the API, which user you are connected as, and its roles.

<details>
<summary>Hint</summary>

The security API has an endpoint that **authenticates** the caller.

</details>

### Step 2: Two roles

Create:

- `logs_readonly`: the `monitor` cluster privilege; `read` and `view_index_metadata` on `logs-*`, `filebeat-*` and `logstash-*`;
- `developer`: the cluster privileges `monitor`, `manage_index_templates`, `manage_ilm` and `manage_pipeline`; **every** privilege on `dev-*` and `test-*`; `read` and `view_index_metadata` on `products` and `orders`.

Give each a `description` in its metadata.

<details>
<summary>Hint</summary>

The [create role API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-security-put-role). A role holds a list of cluster privileges, and a list of index patterns with their privileges.

</details>

### Step 3: Two users

Create `alice_reader` (password `ReadOnlyPass123!`, role `logs_readonly`, full name `Alice Reader`) and `charlie_dev` (password `DevPass789!`, role `developer`, full name `Charlie Developer`).

<details>
<summary>Hint</summary>

The create user API, next to the role one.

</details>

### Step 4: Test the permissions

From a terminal (use `http://` if your cluster has no TLS):

```bash
# Read: allowed for alice_reader — expect 200
curl -u alice_reader:ReadOnlyPass123! "https://localhost:9200/logs-2024.01/_search?pretty"

# Write: refused for alice_reader — expect 403
curl -u alice_reader:ReadOnlyPass123! -X POST "https://localhost:9200/logs-2024.01/_doc" \
  -H 'Content-Type: application/json' \
  -d '{"timestamp":"2024-01-15T11:00:00Z","level":"INFO","message":"Test"}'
```

**Try**: can `charlie_dev` create the index `dev-sandbox`? And `prod-sandbox`?

### Step 5: Document-Level Security (DLS)

Create the multi-tenant orders:

```json
PUT /orders
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "order_id": { "type": "keyword" },
      "customer": { "type": "keyword" },
      "amount": { "type": "float" },
      "department": { "type": "keyword" },
      "region": { "type": "keyword" },
      "status": { "type": "keyword" },
      "created_at": { "type": "date" }
    }
  }
}

POST /orders/_bulk?refresh=true
{"index":{"_id":"1"}}
{"order_id":"ORD-001","customer":"Alice Corp","amount":5000,"department":"sales","region":"EMEA","status":"completed","created_at":"2024-01-15T10:00:00Z"}
{"index":{"_id":"2"}}
{"order_id":"ORD-002","customer":"Bob LLC","amount":3000,"department":"sales","region":"AMER","status":"pending","created_at":"2024-01-16T10:00:00Z"}
{"index":{"_id":"3"}}
{"order_id":"ORD-003","customer":"Charlie Inc","amount":7500,"department":"marketing","region":"EMEA","status":"completed","created_at":"2024-01-17T10:00:00Z"}
{"index":{"_id":"4"}}
{"order_id":"ORD-004","customer":"David Co","amount":2000,"department":"sales","region":"APAC","status":"completed","created_at":"2024-01-18T10:00:00Z"}
{"index":{"_id":"5"}}
{"order_id":"ORD-005","customer":"Eve Enterprises","amount":9000,"department":"marketing","region":"AMER","status":"pending","created_at":"2024-01-19T10:00:00Z"}
```

Create the role `sales_team`: `monitor`, and `read` and `view_index_metadata` on `orders` — but **only the orders of the `sales` department**. Then the user `sarah_sales` (password `SalesPass123!`, role `sales_team`, full name `Sarah Sales`).

<details>
<summary>Hint</summary>

Look at [document level security](https://www.elastic.co/docs/deploy-manage/users-roles/cluster-or-deployment-auth/controlling-access-at-document-field-level): an index privilege can carry a query.

</details>

Test it:

```bash
# sarah_sales only sees the sales orders — expect {"count": 3}
curl -u sarah_sales:SalesPass123! "https://localhost:9200/orders/_count?pretty"

# Even by its ID, a marketing order is out of reach — expect 404
curl -u sarah_sales:SalesPass123! "https://localhost:9200/orders/_doc/3?pretty"
```

**Question**: why a 404 rather than a 403 for document `3`?

### Step 6: A role per region

Create the role `emea_manager`: `monitor`, and read access to the orders of the **EMEA** region only.

**Try**: give `sarah_sales` both `sales_team` and `emea_manager`. Which orders does she see now — sales **and** EMEA, or sales **or** EMEA?

## Validation

List the four roles you created, then every user.

## Key points

- **Kibana Rules** create alerts without writing JSON
- **Connectors** are shared between rules
- **Webhooks** reach any external service
- **Indexing the alerts** builds a history you can analyse
- **Throttling** avoids repeated alerts (alert fatigue)
- **DLS filters the documents** a user can see with a query, transparently

## Success criteria

- A rule that fires, and its history read
- A webhook received, an alert archived in `alert-history`
- Two roles and two users, a read allowed and a write refused
- A DLS role that hides 2 orders out of 5

## Troubleshooting

**Problem**: the rule never fires
→ Look at the dates: the query only looks at the last 5 minutes.

**Problem**: `action [indices:data/write/index] is unauthorized for user [alice_reader]`
→ That is the expected 403 of step 4.

**Problem**: `curl: (60) SSL certificate problem`
→ Pass the CA of the cluster with `--cacert`, or `-k` on a test cluster only.
