---
layout: cover
---

# 2 - Architecture and concepts

---

# Learning objectives

By the end of this section (**~30 min**), you will be able to:

- **Explain** why an inverted index answers in milliseconds
- **Describe** a cluster: nodes, roles, indices, primary shards and replicas
- **Follow** a search request from one node to another
- **Reason** about scalability and fault tolerance

---

# The inverted index

A relational database reads the rows to find a word. A search engine
**inverts** the relationship: for each **term**, the list of documents that contain it.

| Document | Text |
|---|---|
| 1 | Homemade fresh pasta |
| 2 | Pizza and pasta |
| 3 | Wood-fired pizza |

| Term | Documents |
|---|---|
| `pasta` | 1, 2 |
| `pizza` | 2, 3 |
| `fresh` | 1 |
| `wood` | 3 |

- Searching "pizza pasta": two lookups in the dictionary, a **union** of lists
- Built by **Apache Lucene** at indexing time — hence the importance of **analysis** (chapter 6)

---

# Document, index

- **Document** — a **JSON** object, the unit stored and returned. Identified by an `_id`
- **Index** — a collection of documents of the same kind (`restaurants`, `logs-2026.10.27`)
- **Mapping** — the schema of the index: the **type** of each field (chapter 4)

```json
{
  "_index": "restaurants",
  "_id": "2",
  "_source": {
    "name": "Pizzeria Napoli",
    "cuisine": "italian",
    "rating": 4.2
  }
}
```

<br />

> An index is **not** a table: no joins, no multi-document transactions.
> You **denormalize**.

---

# Shards and replicas

- An index is split into **primary shards**: each one is a complete Lucene index
- Each primary has **0 to n replicas**: copies on **other** nodes
- A document goes into **one** shard: `shard = hash(_id) % number_of_primaries`

```text
             Node 1           Node 2           Node 3
restaurants  [P0] [R1]        [P1] [R2]        [P2] [R0]
```

| | Fixed | Role |
|---|---|---|
| **Primaries** | When the index is created | Spread the **data** and the writes |
| **Replicas** | Can be changed live | **Resilience**, and **read** throughput |

> A replica is **never** on the same node as its primary.

---

# Nodes and roles

| Role | Does what |
|---|---|
| `cluster_manager` | Holds the **cluster state**: indices, mappings, shard placement. Only one elected, 3 eligible in production |
| `data` | Stores the shards, runs searches and aggregations |
| `ingest` | Runs the **ingest pipelines** (chapter 9) |
| `coordinating` | (no role) Receives the requests, dispatches them, merges the results |
| `search` | Node dedicated to search replicas (searchable snapshots, remote store) |

<br />

- By default, a node has **all** the roles — perfect for a lab
- OpenSearch says **cluster manager** where Elasticsearch says **master**

---

# A search, step by step

1. The client sends `GET /restaurants/_search` to **any** node: it becomes the **coordinator**
2. **Query** — the coordinator queries **one copy** (primary or replica) of **each** shard; each one returns its best `_id`s and scores
3. The coordinator **merges** and sorts
4. **Fetch** — it retrieves the `_source` of the selected documents, from the shards that hold them
5. It answers the client

<br />

> More shards = more **parallelism**, but also a higher **merge cost**.
> Rule of thumb: a shard of **10 to 50 GB**.

---

# Scalability and resilience

- **Add a node**: the cluster manager **moves** shards to it, without downtime
- **Lose a node**: its replicas elsewhere are **promoted** to primaries, new replicas are rebuilt

| Status | Meaning |
|---|---|
| 🟢 `green` | All primaries and replicas are allocated |
| 🟡 `yellow` | All primaries are there, at least one replica is not |
| 🔴 `red` | At least one primary is missing: some data is unavailable |

<br />

> On a single node, an index with `number_of_replicas: 1` is **yellow**: the replica
> has nowhere to go. That is expected in the lab.

---

# Near real time

- An indexed document first lands in a memory **buffer** and in the **translog** (durability)
- Every **second** (`refresh_interval`), a **refresh** creates a new Lucene segment: the document becomes **searchable**
- `GET /index/_doc/1` sees it **right away**, `_search` after the refresh

<br />

- Bulk indexing: `refresh_interval: -1` during the load, then set it back to `1s`
- In the workshops: `?refresh=true` on the write, to search right after

---

# Quiz

**An index has 3 primary shards and 1 replica. How many shards in total?**

<v-clicks>

- A) 3
- B) 4
- C) 6 ✅
- D) 9

**Answer: C** — 1 replica **per primary**: 3 primaries + 3 replicas.

</v-clicks>
