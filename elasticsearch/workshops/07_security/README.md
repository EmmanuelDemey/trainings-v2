# Workshop 7 — Security: users, roles and Document-Level Security

> Find out who you are connected as, create roles and users, check what each one may do, and hide documents with Document-Level Security.

**Topic**: Security — Users, roles, DLS

## Context

A cluster shared by several teams must give each one the access it needs, and nothing more. In this workshop you set up role-based access control (RBAC), then filter, inside one index, the documents each team sees.

Each step states **what** to build, not **how**: find the API in the documentation, try it, check the result, adjust. Hints are folded — open them only once you are stuck.

## Setup

This workshop stands on its own. The name `logs-2024.01` (with a dot) is on purpose: Elasticsearch keeps `logs-*-*` for the data streams of Elastic Agent (built-in template `logs`), and would refuse a regular index like `logs-2024-01` there.

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

Reference: [User roles](https://www.elastic.co/docs/deploy-manage/users-roles/cluster-or-deployment-auth/user-roles).

## Exercises

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

- A **role** gathers cluster privileges and index privileges; a **user** gets one or more roles
- Roles only ever **add** access
- **DLS filters the documents** a user can see with a query, transparently

## Success criteria

- Two roles and two users, a read allowed and a write refused
- A DLS role that hides 2 orders out of 5

## Troubleshooting

**Problem**: `action [indices:data/write/index] is unauthorized for user [alice_reader]`
→ That is the expected 403 of step 4.

**Problem**: `curl: (60) SSL certificate problem`
→ Pass the CA of the cluster with `--cacert`, or `-k` on a test cluster only.
