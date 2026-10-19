---
layout: cover
---

# Quiz - Day 2
## Advanced Features, Architecture and Production

---

# Quiz Day 2 — Question 9

**What is the purpose of custom routing in Elasticsearch?**

<v-clicks>

- A) To direct documents to a specific shard in order to optimize searches ✅
- B) To encrypt data in transit
- C) To configure cluster network rules
- D) To define the replication order

**Answer: A** — Routing allows storing and searching documents on a specific shard, avoiding fan-out across all shards. This is very useful in multi-tenant architectures.

</v-clicks>

---

# Quiz Day 2 — Question 10

**What is percolation in Elasticsearch?**

<v-clicks>

- A) A data compression mechanism
- B) Running stored queries against a document to detect matches ✅
- C) Transferring data between nodes
- D) An advanced type of aggregation

**Answer: B** — Percolation reverses the classic paradigm: instead of searching for documents with a query, it checks which stored queries match a given document. Ideal for real-time alerting.

</v-clicks>

---

# Quiz Day 2 — Question 11

**Which aggregation counts the number of distinct values of a field?**

<v-clicks>

- A) `cardinality` ✅
- B) `value_count`
- C) `terms`
- D) `stats`

**Answer: A** — The `cardinality` aggregation uses the HyperLogLog++ algorithm to estimate the number of unique values of a field, with a small margin of error.

</v-clicks>

---

# Quiz Day 2 — Question 12

**What is the main advantage of index aliases in Elasticsearch?**

<v-clicks>

- A) They speed up queries by 10x
- B) They automatically double the number of replicas
- C) They decouple the application from physical indices and enable zero-downtime reindexing ✅
- D) They compress stored data

**Answer: C** — Aliases provide a level of indirection: the application points to an alias, allowing you to switch between indices (reindexing, migration) transparently and without downtime.

</v-clicks>

---

# Quiz Day 2 — Question 13

**In an ingest pipeline, which processor is used to parse unstructured log lines?**

<v-clicks>

- A) `set`
- B) `lowercase`
- C) `split`
- D) `grok` ✅

**Answer: D** — The `grok` processor uses patterns (named regular expressions) to extract structured fields from unstructured text, such as Apache or Nginx log lines.

</v-clicks>

---

# Quiz Day 2 — Question 14

**In Index Lifecycle Management (ILM), what are the lifecycle phases of an index, in order?**

<v-clicks>

- A) Create → Active → Archive → Delete
- B) Hot → Warm → Cold → Frozen → Delete ✅
- C) Primary → Replica → Snapshot → Delete
- D) Index → Search → Aggregate → Purge

**Answer: B** — ILM automatically manages the index lifecycle through these phases, optimizing costs by moving data to cheaper hardware over time.

</v-clicks>

---

# Quiz Day 2 — Question 15

**What is the recommended size for a shard in production?**

<v-clicks>

- A) 1-5 GB
- B) 100-200 GB
- C) 20-50 GB ✅
- D) Size does not matter

**Answer: C** — Elastic recommends shards between 20 and 50 GB. Shards that are too small create excessive management overhead, while shards that are too large slow down recovery and rebalancing.

</v-clicks>
