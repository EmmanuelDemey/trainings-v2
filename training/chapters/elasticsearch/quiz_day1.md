---
layout: cover
---

# Quiz - Day 1
## Fundamentals, Mapping and Search

---

# Quiz Day 1 — Question 1

**What is the main data structure used by Elasticsearch to perform fast searches?**

<v-clicks>

- A) A B+ tree
- B) A hash table
- C) An inverted index ✅
- D) A directed graph

**Answer: C** — The inverted index maps each term to the list of documents that contain it, enabling ultra-fast full-text searches.

</v-clicks>

---

# Quiz Day 1 — Question 2

**What is the default port used by the Elasticsearch REST API?**

<v-clicks>

- A) 5601
- B) 9300
- C) 8080
- D) 9200 ✅

**Answer: D** — Port 9200 is the default port for the HTTP REST API. Port 5601 is used by Kibana, and 9300 is used for inter-node transport communication.

</v-clicks>

---

# Quiz Day 1 — Question 3

**What does a "yellow" cluster health status mean in Elasticsearch?**

<v-clicks>

- A) The cluster is fully operational
- B) All primary shards are assigned, but some replicas are not ✅
- C) The cluster is down
- D) Indexing is disabled

**Answer: B** — A yellow cluster means primary shards are working, but some replica shards are unassigned (common in single-node clusters).

</v-clicks>

---

# Quiz Day 1 — Question 4

**Which API should you use to index a large volume of documents?**

<v-clicks>

- A) The `_search` API
- B) The `_doc` API, one document at a time
- C) The `_bulk` API ✅
- D) The `_reindex` API

**Answer: C** — The `_bulk` API allows sending multiple operations (index, update, delete) in a single HTTP request, significantly reducing network overhead.

</v-clicks>

---

# Quiz Day 1 — Question 5

**What is the difference between `text` and `keyword` field types in a mapping?**

<v-clicks>

- A) `text` is for numbers, `keyword` is for strings
- B) `text` is analyzed (tokenized) for full-text search, `keyword` is stored as-is for exact matching ✅
- C) `keyword` is more performant than `text` in all cases
- D) There is no difference

**Answer: B** — A `text` field goes through an analyzer (tokenization, filters) for full-text search. A `keyword` field is indexed without transformation for exact filters, sorting, and aggregations.

</v-clicks>

---

# Quiz Day 1 — Question 6

**What is the role of an analyzer in Elasticsearch?**

<v-clicks>

- A) Optimize the cluster's network performance
- B) Transform text into tokens during indexing and search ✅
- C) Manage shard replication
- D) Compress data on disk

**Answer: B** — An analyzer consists of a tokenizer and filters (lowercase, stemming, stop words, etc.) that transform raw text into indexable tokens.

</v-clicks>

---

# Quiz Day 1 — Question 7

**In a `bool` query, which clause filters documents without affecting the relevance score?**

<v-clicks>

- A) `must`
- B) `should`
- C) `must_not`
- D) `filter` ✅

**Answer: D** — The `filter` clause applies a binary (yes/no) filter without computing a score. It is also cached for better performance.

</v-clicks>

---

# Quiz Day 1 — Question 8

**Which scoring algorithm is used by default in Elasticsearch?**

<v-clicks>

- A) TF/IDF
- B) PageRank
- C) BM25 ✅
- D) Cosine Similarity

**Answer: C** — BM25 (Best Matching 25) has been the default algorithm since Elasticsearch 5.x. It is an evolution of TF/IDF that better handles saturation of frequent terms.

</v-clicks>
