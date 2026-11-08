---
layout: cover
---

# 19 - Data retention and ILM

---

# Learning objectives

By the end of this sequence (**~45 min**, workshop included), you will be able to:

- **Choose** what happens to old data: delete, close, shrink, move to cheaper hardware
- **Shrink** an index to fewer primary shards
- **Write** an ILM policy with rollover and phases
- **Place** the data on the hot, warm, cold and frozen tiers, with searchable snapshots
- **Diagnose** an index stuck in an ILM step

---

# The life of time-based data

```text
 written & searched ──► read-only ──► rarely searched ──► archived ──► deleted
       hot                warm            cold              frozen
```

What can happen to an old index:

- **deleted** — entirely, or partly with `_delete_by_query`
- **closed** — kept on disk, unsearchable
- **shrunk** (`_shrink`), **force merged** — fewer shards, fewer segments
- **moved** to cheaper hardware, with fewer replicas
- **snapshotted**, and searched from the snapshot

---

# Delete an index

```json
DELETE /movies-2023
```

- **Instant** and cheap: the files are removed, nothing is rewritten
- **Irreversible**: only a snapshot brings it back
- That is why time-based data goes in **one index per period**: retention becomes a `DELETE`

> `action.destructive_requires_name: true` (default) forbids `DELETE /*` and `DELETE /_all`.

---

# Delete some documents

```json
POST /movies/_delete_by_query
{
  "query": { "match": { "title": "titanic" } }
}
```

- A search, then a delete of each hit: **expensive** on a large index
- Documents are only **marked** deleted: the disk space comes back at the next merges
- `?conflicts=proceed`, `?wait_for_completion=false` (a task) for large volumes

> Deleting a month with `_delete_by_query` in a single big index: the anti-pattern ILM avoids.

---

# Close and open an index

```json
POST /my_index/_close
```

```json
POST /my_index/_open
```

- A **closed** index uses no heap or CPU, but keeps its disk space
- It cannot be searched nor written — and is **not** snapshotted by default
- Still useful for a few **static** settings (e.g. changing an analyzer)

> To archive, prefer the **cold** and **frozen** tiers: the data stays searchable, for a fraction of the cost.

---

# Shrink: fewer primary shards

Prerequisites:

- the index is **read-only** (`index.blocks.write`)
- a copy of **every** shard on the **same** node
- the target shard count is a **factor** of the source (4 → 2 or 1)

```json
PUT /my_index/_settings
{
  "settings": { "index.blocks.write": true }
}
```

> In a multi-node cluster, gather the shards first: `"index.routing.allocation.require._name": "node-1"`.

---

# Shrink: the request

```json
POST /my_index/_shrink/my_index_shrunk
{
  "settings": {
    "index.number_of_shards": 2,
    "index.number_of_replicas": 1,
    "index.codec": "best_compression"
  },
  "aliases": { "my_search_indices": {} }
}
```

- A **new** index, built with hard links: fast, little extra disk
- `index.codec: best_compression`: smaller on disk, slightly slower to read
- The write block is copied: remove it if the target must be written

```json
PUT /my_index_shrunk/_settings
{ "settings": { "index.blocks.write": false } }
```

---

# Index Lifecycle Management

Automate the lifecycle with a **policy**, made of **phases**:

| Phase | Hardware | Access | Typical actions |
|---|---|---|---|
| **hot** | Fast SSD, lots of CPU | Read / write | `rollover`, `set_priority` |
| **warm** | Bigger, slower disks | Read-only | `shrink`, `forcemerge`, `allocate` |
| **cold** | Cheap storage | Rare reads | `searchable_snapshot`, fewer replicas |
| **frozen** | Object storage + local cache | Very rare | `searchable_snapshot` (partial) |
| **delete** | — | — | `delete` |

- Each phase starts after its `min_age`
- Curator, the old external tool, is deprecated: use ILM

---

# An ILM policy

```json
PUT /_ilm/policy/my_policy
{
  "policy": {
    "_meta": { "description": "nginx logs" },
    "phases": {
      "hot": {
        "actions": {
          "rollover": { "max_primary_shard_size": "50gb", "max_age": "1d" }
        }
      },
      "warm": {
        "min_age": "10d",
        "actions": {
          "readonly": {},
          "forcemerge": { "max_num_segments": 1 }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": { "delete": {} }
      }
    }
  }
}
```

---

# Rollover: the key action

- In the **hot** phase: a **new** backing index as soon as **one** condition is met
  - `max_primary_shard_size` (aim for 10–50 GB), `max_age`, `max_docs`
- `min_age` of the next phases counts from the **rollover**, not from the creation
- Without rollover, the index grows forever, and retention is impossible

```text
 logs-000001 (hot, write) ──rollover──► logs-000002 (hot, write)
      │                                       │
      └─ 10d ─► warm ─ 30d ─► delete          └─ …
```

---

# Attach the policy: the template

```json
PUT /_index_template/timeseries_template
{
  "index_patterns": ["timeseries-*"],
  "data_stream": {},
  "priority": 200,
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "index.lifecycle.name": "my_policy"
    }
  }
}
```

- Every new backing index **inherits** the policy
- A data stream (chapter 20) gives the rollover target for free
- Changing the policy applies to the managed indices at their **next** phase

---

# Data tiers

Each node declares its tier in `node.roles`: `data_hot`, `data_warm`, `data_cold`, `data_frozen`.

| Tier | Hardware | Data |
|---|---|---|
| **hot** | Fast SSD | Written and searched often |
| **warm** | Bigger, slower disks | Read-only, still searched |
| **cold** | Searchable snapshot, **fully** mounted | Rarely searched, no replica (the snapshot is the copy) |
| **frozen** | Searchable snapshot, **partially** mounted (local cache) | Months / years, slow searches |

- ILM **migrates** the indices between tiers automatically (`_tier_preference`)
- On a one-node cluster, that node holds every tier: the phases change, the node does not

---

# Searchable snapshots

<!-- ci: skip -->
```json
"frozen": {
  "min_age": "90d",
  "actions": {
    "searchable_snapshot": { "snapshot_repository": "my_repository" }
  }
}
```

- The index lives **in the repository** (S3, GCS…): the cluster keeps only a cache
- **cold**: a full local copy, no replica needed — about **half** the disk of warm
- **frozen**: a few % of the data on disk — searches of seconds, for years of data
- Needs an **Enterprise** license (or the trial) and a snapshot repository

---

# Follow ILM

```json
GET /_ilm/status
```

```json
GET /*/_ilm/explain?only_managed=true
```

```json
GET /*/_ilm/explain?only_errors=true
```

- `explain`: the phase, action and **step** of each index, and the error if any
- ILM checks its policies every **10 min** (`indices.lifecycle.poll_interval`)

---

# An index stuck in ILM

Fix the cause (no repository, not enough nodes for the replicas, wrong alias…), then retry the step of the **backing index**:

<!-- ci: skip -->
```json
POST /.ds-logs-parkki-default-2026.01.15-000003/_ilm/retry
```

| Error | Usual cause |
|---|---|
| `rollover_alias` missing | Index created outside the template, not a data stream |
| Waiting on `allocate` / `migrate` | No node of the target tier |
| `searchable_snapshot` fails | Repository missing, or no license |

---

# Quiz

**A policy has `warm.min_age: 10d` and a rollover at `max_age: 1d`. When does an index enter the warm phase?**

- A) 10 days after its creation
- B) 10 days after its rollover
- C) 11 days after the policy is created

<v-click>

**Answer: B** — once an index has rolled over, `min_age` counts from the rollover: about 11 days after creation here.

</v-click>

---
layout: cover
---

# Workshop 15

## ILM and data retention
