# Workshop 16 — Advanced architecture and production

> Master the advanced settings: shard allocation awareness, Snapshot Lifecycle Management, Field-Level Security, and a complete production architecture.

**Level**: Advanced

## Context

The cluster goes to production. It must survive the loss of an availability zone, back itself up without anyone thinking about it, show each team only the fields it may see, and hold 90 days of logs at a reasonable cost.

Each step states **what** to set up, not **how**: find the API in the documentation, try it, read the response. The expected result lets you check your answer. Hints are folded — open them only once you are stuck.

## Setup

This workshop stands on its own. Check that your cluster answers, and that security and snapshots are available (`path.repo` set).

## Part A: Shard allocation awareness

Spread the shards across availability zones, so that a primary and its replica never live in the same zone — then move shards by hand.

Reference: [Shard allocation awareness](https://www.elastic.co/docs/deploy-manage/distributed-architecture/shard-allocation-relocation-recovery/shard-allocation-awareness).

### Step 1: Tag the nodes with their zone

Edit `elasticsearch.yml` on each node:

```yaml
# Node 1 (AZ1)
node.name: node-az1
node.attr.zone: az1

# Node 2 (AZ2)
node.name: node-az2
node.attr.zone: az2

# Node 3 (AZ3 - optional)
node.name: node-az3
node.attr.zone: az3
```

Restart the nodes, then list the custom attributes of each node: its name, the attribute and its value.

<details>
<summary>Hint</summary>

There is a `_cat` API for node attributes. Its `h` parameter picks the columns.

</details>

**Expected result**:

```
node      attr  value
node-az1  zone  az1
node-az2  zone  az2
node-az3  zone  az3
```

Steps 2 to 6 need a cluster whose nodes carry the `zone` attribute. On a node without it, forced awareness prevents allocating any shard: the cluster turns red.

### Step 2: Turn awareness on

Make Elasticsearch take the `zone` attribute into account when it allocates shards, in a **persistent** cluster setting.

<details>
<summary>Hint</summary>

Look for `cluster.routing.allocation.awareness.*` in the cluster settings API.

</details>

### Step 3: Forced awareness

Now declare that the zones are `az1`, `az2` and `az3`, whether or not their nodes are up.

**Question**: what is the difference between awareness and forced awareness when a whole zone is down?

### Step 4: Check the distribution

Create `zone-aware-index` with 3 primary shards and 1 replica each, then list its shards with the node each one lives on.

**Question**: for each primary, in which zone is its replica?

### Step 5: Move a shard

Move shard `0` of `zone-aware-index` from `node-az1` to `node-az2`, then follow the relocation.

<details>
<summary>Hint</summary>

The cluster reroute API takes a list of commands; one of them is `move`. A `_cat` API shows the recoveries in progress.

</details>

### Step 6: Drain a node for maintenance

Get every shard off `node-az1`, by its name, without stopping it. Then let it take shards again.

<details>
<summary>Hint</summary>

Look at the [cluster-level shard allocation filtering](https://www.elastic.co/docs/reference/elasticsearch/configuration-reference/cluster-level-shard-allocation-routing-settings#cluster-shard-allocation-filtering) settings. A setting is reset to its default by setting it to `null`.

</details>

### Step 7: Turn awareness off before the next parts

The next parts need no zones. Remove the settings of part A, or a cluster without the `zone` attribute could no longer allocate new indices:

```json
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": null,
    "cluster.routing.allocation.awareness.force.zone.values": null
  }
}
```

## Part B: Snapshot Lifecycle Management (SLM)

Automate the creation and the cleanup of snapshots with SLM policies: scheduling and retention.

Reference: [Create a snapshot with SLM](https://www.elastic.co/docs/deploy-manage/tools/snapshot-and-restore/create-snapshots#automate-snapshots-slm).

### Setup of this part

Check that a repository exists (created in workshop 8):

<!-- ci: skip -->
```json
GET /_snapshot/my_backup
```

If it does not:

```json
PUT /_snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/backups",
    "compress": true
  }
}
```

Create test indices:

```json
PUT /orders-2024-01
PUT /orders-2024-02
PUT /payments-2024-01
PUT /analytics-2024-q1
PUT /logs-2024.01.15

POST /orders-2024-01/_bulk
{"index":{"_id":"1"}}
{"order_id":"ORD-001","amount":100}
{"index":{"_id":"2"}}
{"order_id":"ORD-002","amount":200}

POST /analytics-2024-q1/_doc
{"metric":"revenue","value":50000,"period":"Q1"}

POST /logs-2024.01.15/_bulk
{"index":{}}
{"timestamp":"2024-01-15T10:00:00Z","level":"INFO","message":"Application started"}
{"index":{}}
{"timestamp":"2024-01-15T10:05:00Z","level":"WARN","message":"High memory usage"}
```

### Step 1: A policy for the critical indices

Create the SLM policy `daily-critical-backup`, in `my_backup`:

- every day at **2:00 am**;
- snapshots named `critical-` followed by the date of the day;
- of the `orders-*` and `payments-*` indices only, without the global state, failing if one is missing;
- with the metadata `criticality: high` and `team: finance`;
- kept 90 days, but always at least 30, and never more than 120.

<details>
<summary>Hint</summary>

The `schedule` is a [cron expression](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/api-conventions#api-cron-expressions) with seconds first. The `name` accepts [date math](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/api-conventions#api-date-math-index-names): `<prefix-{now/d}>`. The retention has three keys.

</details>

**Expected result**:

```json
{ "acknowledged": true }
```

**Question**: can you add a metadata key `policy`? Try it.

### Step 2: A weekly policy for analytics

Create `weekly-analytics-backup`: every **Sunday at 3:00 am**, snapshots named `analytics-` followed by the week, of `analytics-*` (ignore what is missing), no global state, metadata `criticality: medium` and `team: data-science`, kept 180 days, at least 10, at most 52.

### Step 3: A daily policy for logs, short retention

Create `daily-logs-backup`: every day at **1:00 am**, snapshots named `logs-` followed by the date, of `logs-*` (ignore what is missing), no global state, **accepting partial snapshots**, metadata `criticality: low` and `team: ops`, kept 14 days, at least 7, at most 30.

### Step 4: Run them now

List every SLM policy, run the three policies right away instead of waiting for their schedule, and list the snapshots of `my_backup`.

<details>
<summary>Hint</summary>

The [SLM APIs](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-slm) can execute a policy on demand.

</details>

### Step 5: Statistics

Show the details of `daily-critical-backup` — when did it last succeed? — and the statistics of SLM as a whole.

**Expected result** (excerpt of the statistics):

```json
{
  "policy_stats": [
    { "policy": "daily-critical-backup" }
  ]
}
```

### Step 6: Retention and maintenance

1. Run the retention now, instead of waiting for its schedule.
2. Stop SLM (for a maintenance), check its status, then start it again.
3. Delete `weekly-analytics-backup`.

**Question**: what happens to the snapshots that policy created?

## Part C: Field-Level Security (FLS)

Hide sensitive fields depending on the role.

Reference: [Controlling access at the document and field level](https://www.elastic.co/docs/deploy-manage/users-roles/cluster-or-deployment-auth/controlling-access-at-document-field-level).

### Setup of this part

```json
PUT /employees_full
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "employee_id": { "type": "keyword" },
      "name": { "type": "keyword" },
      "department": { "type": "keyword" },
      "position": { "type": "keyword" },
      "hire_date": { "type": "date" },
      "email_corporate": { "type": "keyword" },
      "email_personal": { "type": "keyword" },
      "phone_work": { "type": "keyword" },
      "phone_personal": { "type": "keyword" },
      "address": {
        "properties": {
          "street": { "type": "text" },
          "city": { "type": "keyword" },
          "country": { "type": "keyword" },
          "postal_code": { "type": "keyword" }
        }
      },
      "ssn": { "type": "keyword" },
      "salary": { "type": "float" },
      "performance_review": {
        "properties": {
          "rating": { "type": "keyword" },
          "comments": { "type": "text" },
          "reviewer": { "type": "keyword" }
        }
      },
      "disciplinary_notes": { "type": "text" }
    }
  }
}

POST /employees_full/_bulk
{"index":{"_id":"1"}}
{"employee_id":"EMP-001","name":"Alice Johnson","department":"sales","position":"Sales Manager","hire_date":"2020-01-15","email_corporate":"alice.johnson@company.com","email_personal":"alice.j@gmail.com","phone_work":"+33-1-23-45-67-89","phone_personal":"+33-6-12-34-56-78","address":{"street":"10 Rue de Rivoli","city":"Paris","country":"France","postal_code":"75001"},"ssn":"123-45-6789","salary":75000,"performance_review":{"rating":"excellent","comments":"Top performer","reviewer":"Director Sales"},"disciplinary_notes":null}
{"index":{"_id":"2"}}
{"employee_id":"EMP-002","name":"Bob Smith","department":"hr","position":"HR Specialist","hire_date":"2021-03-20","email_corporate":"bob.smith@company.com","email_personal":"bob.smith@yahoo.com","phone_work":"+33-1-98-76-54-32","phone_personal":"+33-6-98-76-54-32","address":{"street":"25 Avenue des Champs","city":"Lyon","country":"France","postal_code":"69001"},"ssn":"987-65-4321","salary":60000,"performance_review":{"rating":"good","comments":"Solid contributor","reviewer":"HR Director"},"disciplinary_notes":"Late arrival incident - 2023-05-10"}
{"index":{"_id":"3"}}
{"employee_id":"EMP-003","name":"Charlie Brown","department":"engineering","position":"Senior Engineer","hire_date":"2019-05-10","email_corporate":"charlie.brown@company.com","email_personal":"cbrown@outlook.com","phone_work":"+33-1-11-22-33-44","phone_personal":"+33-6-11-22-33-44","address":{"street":"5 Boulevard Saint-Germain","city":"Paris","country":"France","postal_code":"75005"},"ssn":"555-12-3456","salary":95000,"performance_review":{"rating":"excellent","comments":"Technical leader","reviewer":"CTO"},"disciplinary_notes":null}
```

### Step 1: A « public » role

Create the role `employee_public_view`: the `monitor` cluster privilege, and `read` on `employees_full` showing **only** `employee_id`, `name`, `department`, `position`, `hire_date`, `email_corporate` and `phone_work`.

<details>
<summary>Hint</summary>

An index privilege takes a `field_security` object, with a `grant` list.

</details>

**Expected result**:

```json
{ "role": { "created": true } }
```

### Step 2: An « HR team » role

Create `hr_team_view`: `monitor`, then `read` and `write` on `employees_full`, every field **except** `ssn` and `disciplinary_notes`.

<details>
<summary>Hint</summary>

`field_security` also takes an `except` list. Wildcards work in both lists.

</details>

**Question**: what happens if `except` names a field that `grant` does not cover?

### Step 3: An « HR manager » role

Create `hr_manager_full`: `monitor` and `manage` on the cluster, `all` on `employees_full`, every field.

### Step 4: Users, and the test

Create three users, each with one of the roles:

| User | Password | Role | Full name |
|------|----------|------|-----------|
| `intern_view` | `InternPass123!` | `employee_public_view` | Intern Viewer |
| `jane_hr` | `HRPass456!` | `hr_team_view` | Jane HR Specialist |
| `susan_hrmanager` | `ManagerPass789!` | `hr_manager_full` | Susan HR Manager |

**Expected result** (for each):

```json
{ "created": true }
```

Then search as each of them. For the intern:

```bash
curl -u intern_view:InternPass123! "https://localhost:9200/employees_full/_search?pretty"
```

Do the same as `jane_hr` (get document `1`) and as `susan_hrmanager` (get document `2`).

**Questions**:

- which fields does each one see?
- compute the average `salary` as `intern_view`, then as `jane_hr`. What does each one get?
- does a `GET /employees_full/_doc/1` show the hidden fields?

### Step 5: Combine DLS and FLS

Create the role `sales_dept_restricted`: `monitor`, and `read` on `employees_full` restricted to the employees of the `sales` department, showing only `employee_id`, `name`, `department`, `position`, `email_corporate` and `phone_work`. Give it to a new user `sales_viewer` (password `SalesView123!`), and search as them.

<details>
<summary>Hint</summary>

Document-Level Security is a `query` next to `field_security`, in the same index privilege.

</details>

**Expected result**: 1 document only (EMP-001, the only « sales » employee), with the restricted fields.

## Part D: A complete production architecture

### Sizing for 500 GB/day, 90 days of retention

The logs are searched a lot during 7 days, sometimes during the next 30, and rarely after that until they are 90 days old.

Compute the storage of each tier, then fill the node sizing:

| Tier | Nodes | RAM | CPU | Disk | Total disk |
|------|-------|-----|-----|------|------------|
| Master | ? | ? | ? | ? | ? |
| Hot | ? | ? | ? | ? (which kind?) | ? |
| Warm | ? | ? | ? | ? | ? |
| Cold | ? | ? | ? | ? | ? |

**Question**: how do you spread these nodes over two availability zones?

### The production ILM policy

In production, `s3_backup` is an S3 repository (`"type": "s3"`, built in since 8.0). To try the requests of this part on your workshop cluster, create an `fs` repository with the same name:

```json
PUT /_snapshot/s3_backup
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/backups/s3_backup"
  }
}
```

Create the ILM policy `logs-lifecycle`:

- **hot**: rollover at 30 GB per primary shard or after 1 day, priority 100;
- **warm**, after 7 days: priority 50, moved to the warm nodes, shrunk to 1 shard, force-merged to 1 segment, read-only;
- **cold**, after 37 days: priority 0, moved to the cold nodes, turned into a searchable snapshot in `s3_backup`;
- **delete**, after 90 days, its searchable snapshot included.

<details>
<summary>Hint</summary>

Every action has its page under [Index lifecycle actions](https://www.elastic.co/docs/reference/elasticsearch/index-lifecycle-actions). `min_age` is counted from the rollover.

</details>

**Expected result**:

```json
{ "acknowledged": true }
```

### The production index template

Create the index template `logs-myapp-template`, priority 500: a **data stream** for `logs-myapp-*`, 3 shards and 1 replica, managed by `logs-lifecycle`, with `@timestamp` (date), `message` (text), and `level`, `service`, `host` (keyword).

**Question**: why `logs-myapp-*` and not `logs-*`? Look at `GET /_index_template/logs`.

### The production SLM policy

Create `daily-snapshots`: every day at 2:30 am, snapshots named `logs-` and the date, of `logs-*` (ignore what is missing), in `s3_backup`, no global state, kept 7 days, at least 7, at most 30.

**Question**: why is a 7-day retention enough here, when the data lives 90 days?

### Production checklist

- **Sizing**: computed from the real load (500 GB/day)
- **HA**: multi-zone, replicas, master quorum (3 dedicated)
- **Performance**: SSD hot tier, shards < 50 GB
- **Cost**: HDD warm/cold for archives, cold tier on searchable snapshots
- **Lifecycle**: automated ILM (hot → warm → cold → delete in 90 days)
- **Backups**: daily SLM
- **Security**: RBAC, TLS, DLS/FLS where needed, audit logging
- **Monitoring**: critical alerts (health, heap, disk, thread pool rejections)
- **Documentation**: architecture diagrams, DR runbooks

## Success criteria

- Replicas never share the zone of their primary, and a node can be drained
- Three SLM policies run, with their retention
- Each role sees only its fields, and `sales_viewer` only its documents
- The production ILM policy, template and SLM policy are created
