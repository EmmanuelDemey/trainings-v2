---
layout: cover
---

# 2 - Architecture

---

# Learning objectives

By the end of this sequence (**~30 min**), you will be able to:

- **Use** the vocabulary of the training: cluster, node, index, document, shard, replica
- **Explain** how an inverted index answers a full-text search
- **Follow** a document from the HTTP request to the disk: buffer, translog, refresh, flush
- **Read** the status of a cluster: `green`, `yellow`, `red`

---

# Glossary: the logical view

| Term | Definition |
|---|---|
| **Document** | A JSON object, the unit you index and get back |
| **Index** | A collection of documents with the same structure (≈ a table) |
| **Mapping** | The schema of an index: the type of each field |
| **`_id`** | The identifier of a document within its index |

<br />

> Mapping types are gone since 8.0: an index holds **one** kind of document, and `_doc`
> in `/movies/_doc/1` is only the name of the endpoint.

---

# Glossary: the physical view

| Term | Definition |
|---|---|
| **Cluster** | A group of nodes that share the same `cluster.name` |
| **Node** | One Elasticsearch process (one JVM) |
| **Shard** | A horizontal slice of an index — a complete **Lucene index** |
| **Primary shard** | The shard that receives the writes first |
| **Replica shard** | A copy of a primary: high availability and read throughput |

---

# Nodes and ports

![](/images/cluster.png)

- **9200** — the **HTTP** REST API: clients, Kibana, a load balancer in front
- **9300** — the **transport** protocol: node to node (cluster state, replication, search)
- Any node can receive a request and **coordinate** it

---

# The inverted index

The structure that maps each **term** to the documents that contain it:

| Doc | Text |
|---|---|
| 1 | Elasticsearch is fast |
| 2 | Kibana visualizes Elasticsearch |
| 3 | Logstash sends to Elasticsearch |

```text
elasticsearch → [1, 2, 3]
fast          → [1]
kibana        → [2]
logstash      → [3]
sends         → [3]
visualizes    → [2]
```

→ Searching `elasticsearch` reads **one entry**, not three documents.

---

# Text analysis

Before entering the inverted index, a `text` value is **analyzed** into terms:

```text
"Elasticsearch is FAST!"
  → tokenizer   → ["Elasticsearch", "is", "FAST"]
  → lowercase   → ["elasticsearch", "is", "fast"]
  → stop words  → ["elasticsearch", "fast"]      (english analyzer)
```

- For each term, Lucene stores the **documents**, the **positions** and the **frequency**
- The query text goes through the **same** analysis: `FAST` finds `fast`
- Analyzers in detail: chapter 6

---

# The life of a document

1. **Reception** — a JSON document arrives on the REST API
2. **Routing** — `hash(_id) % number_of_shards` picks the primary shard
3. **Analysis** — the `text` fields become terms
4. **Buffer + translog** — kept in RAM, and appended to the **translog**, fsynced before the request is acknowledged: the write is **durable**
5. **Refresh** (every `1s`) — the buffer becomes a new **segment**: the document is **searchable**
6. **Flush** — Lucene commit of the segments to disk, the translog is trimmed

> Between 4 and 5, a `GET` by `_id` finds the document, a search does not yet: **near real time**.

---

# Glossary: storage

| Term | Definition |
|---|---|
| **Segment** | An immutable Lucene file: a piece of a shard |
| **Translog** | The log of the operations not yet committed, replayed after a crash |
| **Refresh** | Opens a new segment to search (`index.refresh_interval`, `1s`) |
| **Flush** | Lucene commit to disk, translog trimmed |
| **Merge** | Combines small segments into bigger ones, purges deleted documents |

<br />

> A segment is **never modified**: an update writes a new document and marks the old one
> as deleted.

---

# Shards and replicas

```json
PUT /movies
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}
```

- **3 primaries** × (1 + **1 replica**) = 6 shards to place
- A replica is **never** on the same node as its primary
- `number_of_shards` is **fixed** at creation; `number_of_replicas` changes at any time
- Searches hit **one copy** of each shard, primary or replica

---

# Cluster status

```json
GET /_cluster/health
```

| Status | Meaning |
|---|---|
| 🟢 **green** | All the shards, primaries and replicas, are allocated |
| 🟡 **yellow** | All the primaries are allocated, some replicas are not |
| 🔴 **red** | At least one primary is not allocated: part of the data is unavailable |

---

# One node: `yellow`

![](/images/cluster_yellow.png)

- One node: the replicas have **nowhere** to go — they stay `unassigned`
- In development, `"number_of_replicas": 0` brings the cluster back to `green`

---

# Two nodes: `green`

![](/images/cluster_green.png)

- The second node receives the replicas: every shard has two copies
- If a node dies, its replicas are **promoted** to primaries: no data lost

---

# Quiz

**An index has 2 primary shards and 1 replica, on a one-node cluster. What is the status?**

- A) `green`
- B) `yellow`
- C) `red`
- D) The index cannot be created

<v-click>

**Answer: B** — the 2 primaries are allocated, but a replica cannot sit on the node of its primary: the 2 replicas stay unassigned.

</v-click>
