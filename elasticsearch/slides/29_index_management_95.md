---
layout: cover
---

# 29 - Index management: what's new in 9.5

---

# Learning objectives

By the end of this sequence (**~45 min**), you will be able to:

- **Query** several indices at once: lists, wildcards, exclusions, the `_index` field
- **Control** what happens with a missing or closed index: `ignore_unavailable`, `allow_no_indices`, `expand_wildcards`
- **Follow**, **throttle** and **cancel** a reindex with the reindex management APIs (**new in 9.5**)
- **Send** the old backing indices of a data stream to the **frozen tier** with the data stream lifecycle (**new in 9.5**)

> Builds on chapter 7 (`_reindex`, aliases) and chapter 20 (data streams, lifecycle).

---

# Multi-index queries: the syntax

One index per month: `orders-2026.09`, `orders-2026.10`, `orders-2026.11`.

```json
GET /orders-2026.10,orders-2026.11/_count
```

**Expected result**:

```json
{ "count": 3 }
```

```json
GET /orders-*,-orders-2026.09/_count
```

**Expected result**:

```json
{ "count": 3 }
```

- A **comma list**, **wildcards** (`orders-*`), and **exclusions** (`-orders-2026.09`, after the pattern it removes from)
- Works for `_search`, `_count`, `_field_caps`, ES|QL `FROM`, `_cat`, most index APIs
- Each shard of each index is searched: the scores, the aggregations, the sort are **global**

---

# Which index did it come from? `_index`

```json
POST /orders-*/_search
{
  "size": 0,
  "query": { "terms": { "_index": ["orders-2026.10", "orders-2026.11"] } },
  "aggs": { "per_index": { "terms": { "field": "_index" } } }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "per_index": {
      "buckets": [
        { "key": "orders-2026.10", "doc_count": 2 },
        { "key": "orders-2026.11", "doc_count": 1 }
      ]
    }
  }
}
```

- `_index` is a **metadata field**: query it, aggregate on it, sort on it
- Every hit carries its `_index`, whatever the pattern

---

# … and in ES|QL

```json
POST /_query?format=txt
{
  "query": """
    FROM orders-* METADATA _index
    | STATS total = SUM(amount) BY _index
    | SORT _index
  """
}
```

```text
     total     |    _index
---------------+---------------
40.0           |orders-2026.09
135.0          |orders-2026.10
80.0           |orders-2026.11
```

- `METADATA _index` (and `_id`, `_score`…) turns a metadata field into a column

---

# A missing index

<!-- ci: expect-error -->
```json
GET /orders-2026.10,orders-2025.01/_count
```

`index_not_found_exception`: a **named** index must exist…

```json
GET /orders-2026.10,orders-2025.01/_count?ignore_unavailable=true
```

**Expected result**:

```json
{ "count": 2 }
```

… unless `ignore_unavailable=true`: the missing (or closed) index is skipped.

---

# A pattern that matches nothing

```json
GET /archive-*/_count
```

**Expected result**:

```json
{ "count": 0 }
```

<!-- ci: expect-error -->
```json
GET /archive-*/_count?allow_no_indices=false
```

- `allow_no_indices` (default `true`): a wildcard that matches nothing is **not** an error
- `false`: fail instead — a typo in a pattern then shows at once

---

# Closed and hidden indices: `expand_wildcards`

```json
POST /orders-2026.09/_close

GET /orders-*/_count
```

**Expected result**:

```json
{ "count": 3 }
```

- A wildcard expands to **open** indices only (`expand_wildcards=open`, the default)
- `closed`, `hidden` (the `.ds-…` backing indices, the system indices…), `all`, `none`
- `GET /_cat/indices/orders-*?v&expand_wildcards=all`: see them all

```json
POST /orders-2026.09/_open
```

> Many indices for one application? Give them an **alias** (chapter 7): the pattern stays on the server side.

---

# Reindex: following a long copy

Until 9.4, a reindex was followed through the **generic** task APIs (`_tasks`). **New in 9.5**: APIs of its own.

```json
POST /_reindex?wait_for_completion=false&requests_per_second=1
{
  "source": { "index": "orders-*", "size": 1 },
  "dest":   { "index": "orders-all" }
}
```

<!-- ci: no-compare -->
```json
GET /_reindex?human
```

**Expected result**:

```json
{
  "reindex": [
    { "id": "t3-I4UULQEWWceZ9Eg9cmg:288", "start_time": "2026-11-18T21:24:05.652Z",
      "running_time": "52.6ms", "cancelled": false }
  ]
}
```

- `GET /_reindex`: the reindexes **running** now — and only them, no other task

---

# Reindex management: one reindex

<!-- ci: skip -->
```json
GET /_reindex/<task_id>?human
```

```json
{
  "completed": false,
  "id": "t3-I4UULQEWWceZ9Eg9cmg:288",
  "description": "reindex from [orders-*] to [orders-all]",
  "status": { "total": 4, "created": 1, "batches": 1, "requests_per_second": 1.0, "throttled": "0s" }
}
```

- `status`: the progress — `total`, `created`, `updated`, `version_conflicts`, `batches`…
- Once `completed: true`: the final `response` (with its `failures`), or the `error`
- The **ID is stable**: in 9.5, a reindex moves to another node on a **graceful shutdown** (rolling restart, upgrade) and **resumes** where it was, instead of failing — it reads the source with a **point in time**, no longer a scroll

---

# Reindex management: throttle and cancel

<!-- ci: skip -->
```json
POST /_reindex/<task_id>/_rethrottle?requests_per_second=500

POST /_reindex/<task_id>/_rethrottle?requests_per_second=-1

POST /_reindex/<task_id>/_cancel
```

- `_rethrottle`: slow a copy down during the day, `-1` to remove the limit — applied at once
- `_cancel` (**new in 9.5**): returns the final state, `cancelled: true`; with `wait_for_completion=false`, just `acknowledged`
- An unknown or finished ID: `404 resource_not_found_exception`

| Privilege (cluster) | Allows |
|---|---|
| `monitor_reindex` | `GET /_reindex`, `GET /_reindex/<id>` |
| `manage_reindex` | + `_rethrottle`, `_cancel` |

---

# Reindex: a role for the operators

```json
PUT /_security/role/reindex-operator
{
  "cluster": ["manage_reindex"]
}
```

**Expected result**:

```json
{ "role": { "created": true } }
```

- No more `manage` (or `cluster:admin/tasks/*`) to look after reindexes: least privilege
- `_tasks` still works — but it mixes every kind of task, and a reindex relocated to another node gets a new task there

---

# Data stream lifecycle: the frozen tier

Chapter 20: the data stream lifecycle only knew a **retention**. **New in 9.5**: it can also move the old backing indices to the **frozen tier**.

```json
PUT /_index_template/logs-archive-template
{
  "index_patterns": ["logs-archive-*"],
  "data_stream": {},
  "priority": 200,
  "template": {
    "lifecycle": { "data_retention": "365d", "frozen_after": "30d" }
  }
}

POST /logs-archive-default/_doc
{ "@timestamp": "2026-10-08T10:00:00Z", "message": "GET /home 200" }
```

- `frozen_after`: the age (since the **creation** of the backing index) when it becomes a **searchable snapshot**
- `data_retention` still applies: after 365 days, the frozen index is deleted

---

# Frozen tier: check the lifecycle

```json
GET /_data_stream/logs-archive-default/_lifecycle
```

**Expected result**:

```json
{
  "data_streams": [
    {
      "name": "logs-archive-default",
      "lifecycle": { "enabled": true, "data_retention": "365d", "frozen_after": "30d" }
    }
  ]
}
```

```json
PUT /_data_stream/logs-archive-default/_lifecycle
{ "data_retention": "365d", "frozen_after": "7d" }
```

- As with the retention: on a template, or on an existing data stream, at once for every backing index
- Changing `frozen_after` does **not** stop a conversion already started

---

# Frozen tier: the prerequisites

```json
PUT /_snapshot/frozen-repo
{ "type": "fs", "settings": { "location": "frozen-repo" } }

PUT /_cluster/settings
{ "persistent": { "repositories.default_repository": "frozen-repo" } }
```

- A **default snapshot repository**: without it, the data stays where it is (`found-snapshots` on Elastic Cloud Hosted)
- An **Enterprise** license (or a trial): `frozen_after` is accepted on any license, but nothing moves without it
- **Frozen nodes** (`data_frozen` role, with a shared cache) to mount the snapshots
- Not for the **failure store**; accepted but **ignored** on Serverless

---

# Frozen tier: what DLM does

For each backing index older than `frozen_after`, the data stream lifecycle runs, in order:

1. **Clone**: read-only, then a copy with no replica
2. **Force merge**: one segment per shard — faster queries, a smaller snapshot
3. **Snapshot**: into the default repository
4. **Mount**: a **partially mounted** searchable snapshot, on the frozen nodes
5. **Swap and delete**: the mounted index replaces the original in the data stream

<br />

- Each step is **idempotent**: on a failure, DLM starts again from the last one that worked
- Checked every `dlm.frozen.transition.poll_interval` (5 min, static setting)

---

# Frozen tier: follow it

<!-- ci: no-compare -->
```json
GET /logs-archive-default/_lifecycle/explain
```

**Expected result**:

```json
{
  "indices": {
    ".ds-logs-archive-default-2026.11.18-000001": {
      "managed_by_lifecycle": true,
      "lifecycle": { "data_retention": "365d", "frozen_after": "7d" }
    }
  }
}
```

- Per backing index: its age (`time_since_index_creation`), the lifecycle, and the **`error`** if a step fails
- The errors also feed the `data_stream_lifecycle` indicator of `GET /_health_report` (chapter 23)
- A missing repository? Register it again, the conversion resumes on its own

---

# Data stream lifecycle or ILM, in 9.5?

| | ILM | Data stream lifecycle |
|---|---|---|
| Scope | Any index, data stream | Data streams only |
| Retention | `delete` phase | `data_retention` |
| Frozen tier | `searchable_snapshot` action | `frozen_after` (**9.5**) |
| Warm, cold tiers | Yes | No |
| Shrink, custom rollover… | Yes | No |
| Downsampling | Yes | Yes |

<br />

- **Hot → frozen → delete**: the data stream lifecycle is now enough
- **Warm and cold**, or fine-grained actions: still ILM (chapter 19)

---

# Quiz

**A reindex runs on a node you restart for an upgrade. In 9.5, what happens?**

- A) The reindex fails: start it again from the beginning
- B) It moves to another node and resumes, with the same ID
- C) The restart waits for the end of the reindex
- D) It starts again from the beginning on another node

<v-click>

**Answer: B** — on a graceful shutdown, the reindex is relocated and resumes from where it was (it reads through a point in time); `GET /_reindex/<id>` keeps working with the same ID.

</v-click>
