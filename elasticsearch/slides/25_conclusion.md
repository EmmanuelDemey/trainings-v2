---
layout: cover
---

# 25 - Conclusion

---

# What we covered

| Day | Key takeaways |
|---|---|
| **1 - Fundamentals** | Inverted index, shards and replicas, `green` / `yellow` / `red`, REST API and `_cat`, `_bulk`, explicit mapping, `text` vs `keyword`, analyzers, `_reindex` + alias, templates |
| **2 - Search and data** | `match` vs `term`, `bool` and filter context, BM25 and `function_score`, `search_after` + PIT, aggregations, ES\|QL, kNN and hybrid search, ingest pipelines, transforms |
| **3 - Operating** | Official clients and Testcontainers, TLS, roles, DLS / FLS, API keys, snapshots and SLM, ILM and data tiers, data streams, sizing, node roles and awareness, monitoring, alerting |

---

# Going further

- **Observability** — Elastic Agent, Fleet, APM, synthetic monitoring
- **Security** — Elastic Security, SIEM rules, endpoint
- **Search applications** — semantic reranking, inference endpoints, ELSER
- **Kubernetes** — ECK, the Elastic Cloud on Kubernetes operator
- **Certification** — Elastic Certified Engineer

<br />

The **appendix** keeps the operations reference: disaster recovery, checklists, runbooks.

📚 Documentation: **https://www.elastic.co/docs** · Forum: **https://discuss.elastic.co** · Blog: **https://www.elastic.co/blog**

---

# Final quiz — Question 1

**What is the main data structure Elasticsearch uses to search fast?**

- A) A B+ tree
- B) An inverted index
- C) A hash table
- D) A directed graph

<v-click>

**Answer: B** — the inverted index maps each term to the documents that hold it.

</v-click>

---

# Final quiz — Question 2

**What does a `yellow` cluster status mean?**

- A) The cluster is fully operational
- B) Every primary shard is assigned, some replicas are not
- C) The cluster is down
- D) Indexing is disabled

<v-click>

**Answer: B** — normal on a single node: a replica never lives on the node of its primary.

</v-click>

---

# Final quiz — Question 3

**`text` or `keyword`: which one for sorting and aggregating?**

- A) `text`, it is analyzed
- B) `keyword`, an exact value with doc values
- C) Either, they behave the same
- D) Neither, use `long`

<v-click>

**Answer: B** — you sort and aggregate on an exact, non-analyzed value.

</v-click>

---

# Final quiz — Question 4

**In a `bool` query, which clause filters without touching the score?**

- A) `must`
- B) `should`
- C) `filter`
- D) `must_not` only

<v-click>

**Answer: C** — `filter` is yes / no, no score — and cached.

</v-click>

---

# Final quiz — Question 5

**What is the main advantage of an index alias?**

- A) It compresses the index
- B) It doubles the replicas
- C) Applications keep one name while the index behind it changes
- D) It speeds up aggregations

<v-click>

**Answer: C** — reindex into a new index, swap the alias atomically: no downtime.

</v-click>

---

# Final quiz — Question 6

**Which processor parses an unstructured log line in an ingest pipeline?**

- A) `set`
- B) `rename`
- C) `date`
- D) `grok`

<v-click>

**Answer: D** — `grok` matches named patterns and extracts fields.

</v-click>

---

# Final quiz — Question 7

**In ILM, what is the order of the phases?**

- A) cold → warm → hot → delete
- B) hot → warm → cold → frozen → delete
- C) hot → delete → warm
- D) warm → hot → cold

<v-click>

**Answer: B** — data moves to cheaper hardware as it ages, then is deleted.

</v-click>

---

# Final quiz — Question 8

**What size should a shard have in production, as a rule of thumb?**

- A) Under 1 GB
- B) Around 1 TB
- C) Between 10 and 50 GB
- D) Any size, it does not matter

<v-click>

**Answer: C** — too small wastes overhead, too big slows recovery and rebalancing.

</v-click>

---
src: ./shared/retro.md
---
