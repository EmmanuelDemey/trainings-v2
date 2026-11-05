---
layout: cover
---

# Conclusion

---

# What we covered

| Chapter | Key takeaway |
|---|---|
| **1 - OpenSearch** | Apache 2.0 fork of Elasticsearch 7.10, governed by the Linux Foundation |
| **2 - Architecture** | Inverted index, primary shards and replicas, `green` / `yellow` / `red` |
| **3 - Installation** | Docker, `opensearch.yml`, heap ≤ 50% of the RAM, REST API and `_cat` |
| **4 - Mapping** | Explicit mapping, `text` vs `keyword`, `_bulk`, `_reindex` + alias |
| **5 - Search** | `match` vs `term`, `bool`: `filter` without scoring, BM25, `boost` |
| **6 - Analysis** | Char filters → tokenizer → token filters, `_analyze` |
| **7 - Aggregations** | Metrics, buckets, sub-aggregations, pipeline |
| **8 - Advanced search** | `search_after`, highlight, suggesters, geo, percolation |
| **9 - Ingest** | Processors, `_simulate`, `on_failure`, `default_pipeline` |
| **10 - Dashboards** | Index pattern, Discover, visualizations, dashboards |

---

# Going further

What the day did not cover, and the two-day program goes into:

- **Security** — TLS, users, roles, document- and field-level security
- **Index State Management** (ISM) — rollover, hot / warm transitions, deletion of old indices
- **Snapshots** — backup and restore
- **Alerting** and **Anomaly Detection**
- **SQL and PPL** — Query Workbench
- **Vector search** — k-NN, hybrid search, neural search
- **Operations** — shard sizing, monitoring, slow logs

<br />

📚 Documentation: **https://docs.opensearch.org** · Forum: **https://forum.opensearch.org**

---

# Final quiz — Question 1

**An `email` field is used for an exact filter and for an aggregation. Which type?**

<v-clicks>

- A) `text`
- B) `keyword` ✅
- C) `text` with the `email` analyzer
- D) `object`

**Answer: B** — an exact value, not analyzed, with doc values.

</v-clicks>

---

# Final quiz — Question 2

**The single-node cluster is `yellow`. Why?**

<v-clicks>

- A) A primary shard is lost
- B) An index has replicas that cannot be allocated ✅
- C) The JVM heap is full
- D) The security plugin is disabled

**Answer: B** — a replica is never placed on the node of its primary.

</v-clicks>

---

# Final quiz — Question 3

**You want to extract the IP address and the HTTP status from a raw log line before indexing it. With what?**

<v-clicks>

- A) A custom analyzer
- B) An ingest pipeline with a `grok` processor ✅
- C) A `terms` aggregation
- D) An index template

**Answer: B** — an analyzer splits text for search; it does not create fields.

</v-clicks>

---

# Final quiz — Question 4

**A visualization shows no data, although the index holds some. First thing to check?**

<v-clicks>

- A) The mapping
- B) The selected time range ✅
- C) The number of shards
- D) The security plugin

**Answer: B** — the index pattern has a time field: the time range filters everything.

</v-clicks>

---
src: ./shared/retro.md
---
