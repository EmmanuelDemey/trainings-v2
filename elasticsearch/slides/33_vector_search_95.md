---
layout: cover
---

# 33 - Vector search in depth: what's new in 9.5

---

# Learning objectives

By the end of this sequence (**~60 min**), you will be able to:

- **Compare** lexical, sparse and dense retrieval, and **choose** between them
- **Map** and **query** a `sparse_vector` field, with or without ELSER
- **Tune** HNSW (`m`, `ef_construction`, `num_candidates`) and **pick** a quantization: `int8`, `int4`, `bbq`
- **Use** DiskBBQ (`bbq_disk`) and its **auto-calibration** (new in 9.5)
- **Create** an index in the **VectorDB** index mode (new in 9.5)
- **Index** images and PDFs with the **`semantic`** field (new in 9.5, preview)

> Chapter 13 introduced `dense_vector`, kNN, `semantic_text` and the retrievers: this one goes further.

---

# Three ways to retrieve

| | Lexical (BM25) | Sparse (learned) | Dense |
|---|---|---|---|
| Representation | The words of the text | Weighted **terms**, expanded by a model | A vector of floats, 384 to 4096 dims |
| Field | `text` | `sparse_vector` | `dense_vector` |
| Index | Inverted index | Inverted index | HNSW graph, or DiskBBQ clusters |
| Synonyms, paraphrases | No (unless configured) | Yes | Yes |
| Multilingual | Per analyzer | ELSER: English only | Depends on the model (E5: yes) |
| Explainable | `_explain` | The expanded terms | No |
| Out of the box | Yes | ELSER (trial license) | E5, Jina, or an external model |

- **Sparse** keeps the inverted index — and its explainability — while understanding meaning
- **Dense** handles languages, images, and long-tail paraphrases
- Mixing them in a **hybrid** search (chapter 13) usually beats each one alone

---

# Embeddings: what a model gives

<!-- ci: skip -->
```json
POST /_inference/sparse_embedding/.elser-2-elasticsearch
{ "input": "The cat is sleeping" }
```

```text
{ "cat": 2.50, "sleeping": 2.31, "sleep": 2.24, "cats": 1.84, "asleep": 1.29, "kitty": 1.13, "pet": 0.66, … }
```

<!-- ci: retry -->
```json
POST /_inference/text_embedding/.multilingual-e5-small-elasticsearch
{ "input": "The cat is sleeping" }
```

```text
{ "text_embedding": [ { "embedding": [ 0.0788, 0.0053, -0.0203, -0.1018, … 384 floats ] } ] }
```

- **Sparse**: a few dozen terms the text is *about* — `kitty` and `asleep` were never written
- **Dense**: a point in a 384-dimension space; close meanings, close points
- The built-in models are deployed on an **ML node** at first use (a minute, the first time)

---

# `sparse_vector`: the field

```json
PUT /articles-sparse
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "tokens": { "type": "sparse_vector" }
    }
  }
}
```

```json
POST /articles-sparse/_bulk?refresh=true
{"index":{"_id":"1"}}
{"title":"The cat is sleeping on the sofa","tokens":{"cat":2.1,"sleep":1.8,"sofa":1.4,"pet":0.7}}
{"index":{"_id":"2"}}
{"title":"Stock markets fell this morning","tokens":{"stock":2.2,"market":1.9,"finance":1.1}}
```

- A map **term → weight**: stored in the inverted index, one posting per term
- Filled by a model (ELSER, SPLADE…), by an ingest pipeline, or by `semantic_text`

---

# `sparse_vector`: the query

```json
POST /articles-sparse/_search
{
  "query": {
    "sparse_vector": {
      "field": "tokens",
      "query_vector": { "pet": 1.0, "sleep": 0.5 }
    }
  },
  "_source": ["title"]
}
```

**Expected result**:

```json
{ "hits": { "total": { "value": 1 }, "hits": [ { "_id": "1" } ] } }
```

- Score: the **dot product** of the two term maps — only shared terms count
- With a model: `"inference_id": ".elser-2-elasticsearch", "query": "napping pet"` instead of `query_vector`
- **Pruning** (on by default): drops the very frequent, low-weight tokens of the query — faster, same relevance

---

# ELSER with `semantic_text`

<!-- ci: skip -->
```json
PUT /articles-elser
{
  "mappings": {
    "properties": {
      "content": { "type": "semantic_text", "inference_id": ".elser-2-elasticsearch" }
    }
  }
}

POST /articles-elser/_doc/1?refresh=true
{ "content": "The cat is sleeping on the sofa in the living room." }

POST /articles-elser/_search
{
  "query": { "match": { "content": "napping pet" } },
  "highlight": { "fields": { "content": { "type": "semantic", "number_of_fragments": 1 } } }
}
```

- `semantic_text` + an ELSER endpoint = a **sparse** semantic field: chunks, inference, query, all automatic
- The **`semantic` highlighter** returns the best-matching **chunks** — what a RAG prompt needs (chapter 34)
- ELSER needs ~1 GB of ML memory: in production, a dedicated ML node, or the **Elastic Inference Service**

---

# HNSW: how kNN finds the neighbours

- **HNSW** (Hierarchical Navigable Small World): a graph of the vectors, in layers
  - the top layers: few nodes, long jumps; the bottom one: every vector, short links
  - a search descends greedily, then explores the neighbourhood of the best candidates
- Built **per segment**, at indexing time — merges rebuild it: indexing vectors is CPU-hungry
- Fast only if the graph and the vectors are **in memory** (the file system cache)

| Parameter | Where | Effect |
|---|---|---|
| `m` (16) | Mapping | Links per node: higher = better recall, more memory |
| `ef_construction` (100) | Mapping | Candidates while building: higher = better graph, slower indexing |
| `num_candidates` | Query | Candidates per shard: higher = better recall, slower search |
| `k` | Query | Hits returned |

> Start with the defaults, measure the **recall** on your queries, then raise `num_candidates` first.

---

# Quantization: the family

| `index_options.type` | Bytes / dimension | Memory vs `float` | Note |
|---|---|---|---|
| `hnsw` | 4 | 1× | Exact floats in the graph |
| `int8_hnsw` | 1 | ÷ 4 | Default below 384 dims |
| `int4_hnsw` | ½ | ÷ 8 | |
| `bbq_hnsw` | ⅛ (1 bit) | ÷ 32 | Default from 384 dims; ≥ 64 dims |
| `*_flat` | | | No graph: brute force — small indices, or a strict filter |
| `bbq_disk` | 1 bit (configurable) | Little **RAM** | **DiskBBQ**: clusters on disk, no graph |

- Quantized vectors are **approximations**: `rescore_vector.oversample` re-ranks the top `k × oversample` on the original floats
- The original floats stay on disk: you can change `index_options` later (a new mapping, applied to new segments)

---

# Rescoring and oversampling

```json
PUT /vectors-int4
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "embedding": {
        "type": "dense_vector", "dims": 4, "similarity": "cosine",
        "index_options": { "type": "int4_hnsw" }
      }
    }
  }
}
```

```json
POST /vectors-int4/_bulk?refresh=true
{"index":{"_id":"1"}}
{"title":"Apple pie","embedding":[0.9,0.1,0.0,0.1]}
{"index":{"_id":"2"}}
{"title":"Pumpkin soup","embedding":[0.1,0.9,0.2,0.0]}
```

```json
POST /vectors-int4/_search
{
  "knn": {
    "field": "embedding", "query_vector": [0.85, 0.15, 0.05, 0.1],
    "k": 1, "num_candidates": 10,
    "rescore_vector": { "oversample": 2 }
  },
  "_source": ["title"]
}
```

**Expected result**:

```json
{ "hits": { "hits": [ { "_id": "1", "_source": { "title": "Apple pie" } } ] } }
```

---

# DiskBBQ: `bbq_disk`

- HNSW wants the vectors **in RAM**: at a billion vectors, that is a lot of RAM
- **DiskBBQ** clusters the vectors (IVF-like), keeps a 1-bit (BBQ) copy, and reads **only the clusters close to the query** from disk
- A few % of the vectors visited per query; good latency even when most of the index is **not** in the page cache
- Cheaper to build and merge than an HNSW graph

| | HNSW (`bbq_hnsw`) | DiskBBQ (`bbq_disk`) |
|---|---|---|
| RAM | The whole quantized index | A fraction |
| Latency | Lowest | Low, more stable when memory is short |
| Indexing / merges | Expensive (graph) | Cheaper |
| Best for | Hot, latency-critical search | Large collections, cost-sensitive |

---

# DiskBBQ: the mapping

```json
PUT /vectors-disk
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "embedding": {
        "type": "dense_vector", "dims": 4, "similarity": "cosine",
        "index_options": { "type": "bbq_disk" }
      }
    }
  }
}
```

```json
GET /vectors-disk/_mapping
```

**Expected result**:

```json
{
  "vectors-disk": { "mappings": { "properties": { "embedding": {
    "index_options": { "type": "bbq_disk", "cluster_size": 384, "bits": 1, "rescore_vector": { "oversample": 3.0 } }
  } } } }
}
```

- `cluster_size`: vectors per cluster; `bits`: the precision of the quantized copy
- Query: the usual `knn`, plus `visit_percentage` to trade recall for speed

---

# New in 9.5: DiskBBQ auto-calibration

```json
PUT /vectors-auto
{
  "mappings": {
    "properties": {
      "embedding": {
        "type": "dense_vector", "dims": 4, "similarity": "cosine",
        "index_options": { "type": "bbq_disk", "auto_calibrate": true }
      }
    }
  }
}
```

```json
POST /vectors-auto/_bulk?refresh=true
{"index":{"_id":"1"}}
{"embedding":[1.0,0.0,0.0,0.0]}
{"index":{"_id":"2"}}
{"embedding":[0.0,1.0,0.0,0.0]}
```

```json
POST /vectors-auto/_search
{
  "knn": { "field": "embedding", "query_vector": [0.9, 0.1, 0.0, 0.0], "k": 1, "num_candidates": 10, "visit_percentage": 5 },
  "_source": false
}
```

**Expected result**:

```json
{ "hits": { "hits": [ { "_id": "1" } ] } }
```

- At **merge** time, Elasticsearch analyses the vectors of the segment and picks the **quantization depth**, the **preconditioning** and the **oversampling** — no more guessing `bits`
- Small segments (under ~10 000 vectors) keep the configured `bits`

---

# New in 9.5: the VectorDB index mode

```json
PUT /products-vectordb
{
  "settings": { "index.mode": "vectordb_document" },
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "embedding": { "type": "dense_vector", "dims": 768, "similarity": "cosine" }
    }
  }
}
```

```json
GET /products-vectordb/_mapping/field/embedding
```

**Expected result**:

```json
{
  "products-vectordb": { "mappings": { "embedding": { "mapping": { "embedding": {
    "element_type": "bfloat16",
    "index_options": { "type": "bbq_hnsw", "rescore_vector": { "oversample": 3.0 } }
  } } } } }
}
```

- **One setting** for an index whose job is vector retrieval: Elasticsearch picks the defaults
  - vectors stored as **`bfloat16`** (half the disk of `float`), quantized, with rescoring
  - merges tuned for vectors (no auto-throttle, parallel intra-merge), vector files **preloaded** in the page cache

---

# VectorDB mode: what it sets

```json
GET /products-vectordb/_settings?filter_path=**.mode,**.merge,**.store
```

**Expected result**:

```json
{
  "products-vectordb": {
    "settings": {
      "index": {
        "mode": "vectordb_document",
        "merge": { "scheduler": { "auto_throttle": "false" }, "intra_merge_parallelism_enabled": "true" },
        "store": { "preload": ["vex", "veq", "veb", "cenivf"] }
      }
    }
  }
}
```

- `store.preload`: the HNSW graph (`vex`), the quantized vectors (`veq`, `veb`) and the DiskBBQ centroids (`cenivf`) are loaded at startup
- Still a normal index: `text` fields, filters, aggregations and hybrid retrievers work as before
- Pick it for a **vector-first** index (RAG chunks, recommendations, image search); keep `standard` for a mixed workload

---

# New in 9.5: the `semantic` field (multimodal)

<!-- ci: skip -->
```json
PUT /catalog
{
  "mappings": {
    "properties": {
      "description": { "type": "semantic_text", "inference_id": ".multilingual-e5-small-elasticsearch" },
      "picture": { "type": "semantic", "inference_id": ".jina-embeddings-v5-omni-small" }
    }
  }
}
```

<!-- ci: skip -->
```json
PUT /catalog/_doc/1
{
  "description": "Red leather handbag with a gold buckle",
  "picture": { "type": "image", "value": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ…" }
}
```

| | `semantic_text` | `semantic` (preview, 9.5) |
|---|---|---|
| Inputs | Text | Text, **image**, audio, video, **PDF** — what the endpoint supports |
| Vectors | Dense or sparse | Dense |
| Endpoint task type | `text_embedding`, `sparse_embedding` | **`embedding`** |
| Default endpoint | Yes | No: `inference_id` is required |
| Chunking | Text is chunked | Text is chunked; a non-text value = one embedding |

---

# Searching a `semantic` field

By text (« find the pictures that look like… »):

<!-- ci: skip -->
```json
POST /catalog/_search
{ "query": { "match": { "picture": "a red bag with a golden clasp" } } }
```

By image (« find products that look like this photo »):

<!-- ci: skip -->
```json
POST /catalog/_search
{
  "query": {
    "knn": {
      "field": "picture",
      "query_vector_builder": {
        "embedding": { "input": { "type": "image", "value": "data:image/jpeg;base64,/9j/4AAQ…" } }
      }
    }
  }
}
```

- One vector space for text **and** images: the model (Jina v5 Omni, via the Elastic Inference Service, or your own endpoint) does the magic
- A `semantic_text` endpoint (`text_embedding`) is refused: *Wrong [task_type], expected embedding, got text_embedding*
- **Technical preview**: not for production yet

---

# Vectors and ES|QL

```json
POST /_query?format=txt
{
  "query": """
    FROM vectors-auto METADATA _id, _score
    | WHERE KNN(embedding, [0.9, 0.1, 0.0, 0.0])
    | SORT _score DESC
    | KEEP _id, _score
  """
}
```

```text
      _id      |      _score
---------------+------------------
1              |0.9969418644905090
2              |0.5552157759666443
```

- `KNN()`, `MATCH()` on a `semantic_text` field, `RERANK`, `FORK` / `FUSE` (hybrid in ES|QL): see chapters 31 and 34

---

# Choosing, in practice

| Situation | Choice |
|---|---|
| Small index, filters that keep few documents | `*_flat` (brute force) |
| Latency-critical, the vectors fit in RAM | `bbq_hnsw` (default from 384 dims) |
| Hundreds of millions of vectors, RAM is the cost | `bbq_disk` + `auto_calibrate` |
| A vector-first index, no tuning wanted | `index.mode: vectordb_document` |
| English text, explainability, no GPU | ELSER (`sparse_vector` / `semantic_text`) |
| Multilingual text | E5, Jina v5 (`semantic_text`) |
| Images, PDFs | `semantic` + a multimodal `embedding` endpoint |

- Always **measure**: recall@k against an exact (`*_flat`) search, latency at your query rate, memory per node

---

# Quiz

**Your 500 M-vector index no longer fits in the page cache: kNN latency explodes. What is the 9.5 answer with the least tuning?**

- A) Raise `num_candidates`
- B) Switch to `hnsw` (no quantization)
- C) Map the field with `bbq_disk` and `auto_calibrate: true`, then reindex
- D) Add replicas

<v-click>

**Answer: C** — DiskBBQ reads only the clusters close to the query, and auto-calibration picks the quantization per segment. Replicas spread the load, but each copy still needs the RAM.

</v-click>
