---
layout: cover
---

# 13 - Vector and semantic search

---

# Learning objectives

By the end of this sequence (**~60 min**, workshop included), you will be able to:

- **Explain** what an embedding is, and what BM25 cannot find
- **Map** a `dense_vector` field, and **run** a `knn` search, with a filter
- **Combine** lexical and vector search with the `rrf` and `linear` retrievers
- **Let** Elasticsearch compute the embeddings with `semantic_text`
- **Rerank** the best hits with a cross-encoder

---

# Why vectors?

- BM25, the default scoring, matches **words**:
  - « sleeping cat » does not find « the feline is napping »
  - a query in English does not find a document in French
- An **embedding model** turns a text (or an image…) into a **vector**: texts with close meanings get close vectors
- **Vector search**: find the k nearest vectors of the query's vector
- Elasticsearch stores the vectors, indexes them (an **HNSW** graph), and can run the model itself

---

# `dense_vector`

```json
PUT /movies-vectors
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "plot_vector": { "type": "dense_vector", "dims": 384, "similarity": "cosine" }
    }
  }
}
```

- `dims`: given by the model — 384 for E5-small, 768, 1024…
- `similarity`: `cosine`, `dot_product`, `l2_norm`, `max_inner_product`

---

# Quantization, by default

```json
GET /movies-vectors/_mapping
```

**Expected result**:

```json
{
  "movies-vectors": {
    "mappings": {
      "properties": {
        "plot_vector": { "index_options": { "type": "bbq_hnsw" } }
      }
    }
  }
}
```

- The vectors are **quantized** to save memory:
  - `bbq_hnsw` (Better Binary Quantization, ~32× smaller) from 384 dimensions
  - `int8_hnsw` (4× smaller) below

---

# kNN search

```json
POST /recipes/_search
{
  "knn": {
    "field": "embedding",
    "query_vector": [0.85, 0.15, 0.05],
    "k": 2,
    "num_candidates": 10
  },
  "_source": ["title"]
}
```

- `k`: the number of nearest neighbours to return
- `num_candidates`: explored per shard — higher is more accurate, and slower
- **Approximate** (HNSW): fast, but it may miss a neighbour

---

# kNN with a filter

```json
POST /recipes/_search
{
  "knn": {
    "field": "embedding",
    "query_vector": [0.85, 0.15, 0.05],
    "k": 3,
    "num_candidates": 10,
    "filter": { "term": { "category": "plat" } }
  },
  "_source": ["title"]
}
```

- The filter applies **during** the graph traversal: still `k` hits, all matching it
- In ES|QL: `FROM recipes METADATA _score | WHERE KNN(embedding, [0.85, 0.15, 0.05]) | SORT _score DESC`

---

# Hybrid search: the problem

- Lexical **and** semantic: each one finds what the other misses
- But their scores are not comparable:
  - BM25 is unbounded, and depends on the index statistics
  - a cosine similarity lies between 0 and 1
- Adding them means nothing: they must be **fused**
- **Retrievers** compose searches: `standard`, `knn`, `rrf`, `linear`, `text_similarity_reranker`, `rule`…

---

# Reciprocal Rank Fusion

```json
POST /recipes/_search
{
  "retriever": {
    "rrf": {
      "retrievers": [
        { "standard": { "query": { "match": { "title": "pommes" } } } },
        { "knn": { "field": "embedding", "query_vector": [0.85, 0.15, 0.05], "k": 3, "num_candidates": 10 } }
      ],
      "rank_window_size": 10
    }
  },
  "_source": ["title"]
}
```

- RRF only uses the **ranks**: `score = Σ 1 / (rank_constant + rank)`
- No tuning needed: a good default

---

# Linear retriever

```json
POST /recipes/_search
{
  "retriever": {
    "linear": {
      "retrievers": [
        { "retriever": { "standard": { "query": { "match": { "title": "pommes" } } } },
          "weight": 1, "normalizer": "minmax" },
        { "retriever": { "knn": { "field": "embedding", "query_vector": [0.85, 0.15, 0.05], "k": 3, "num_candidates": 10 } },
          "weight": 2, "normalizer": "minmax" }
      ]
    }
  },
  "_source": ["title"]
}
```

- A weighted sum of **normalized** scores — when one source should count more

---

# `semantic_text`: let Elasticsearch embed

```json
PUT /articles
{
  "mappings": {
    "properties": {
      "content": { "type": "semantic_text", "inference_id": ".multilingual-e5-small-elasticsearch" }
    }
  }
}
```

- Calls an **inference endpoint** at index time **and** at query time
- Long texts are split into **chunks**, each one embedded
- The vectors are not in `_source`: they live in the hidden `_inference_fields`

---

# Inference endpoints

```json
GET /_inference
```

- Built-in (trial license or above):
  - `.elser-2-elasticsearch`: sparse vectors, English
  - `.multilingual-e5-small-elasticsearch`: dense vectors, multilingual
  - `.rerank-v1-elasticsearch`: reranking
- Or an external service: OpenAI, Cohere, Mistral, Amazon Bedrock, Google Vertex AI…
  (`PUT _inference/text_embedding/my-endpoint`)
- The built-in models run on **ML nodes**, deployed at first use

---

# Index plain text

<!-- ci: retry -->
```json
POST /articles/_doc/1?refresh=true
{ "content": "Le chat dort sur le canapé du salon." }
```

```json
POST /articles/_doc/2?refresh=true
{ "content": "La bourse a fortement chuté ce matin." }
```

- The first document deploys the model on an ML node: a minute or so the first time

> A timeout on the first indexing is normal: send it again once the model is deployed.

---

# Semantic query

```json
POST /articles/_search
{
  "query": { "match": { "content": "sleeping pet" } },
  "size": 1
}
```

**Expected result**:

```json
{ "hits": { "hits": [ { "_id": "1" } ] } }
```

- A `match` on a `semantic_text` field is a **semantic** query: no vector to compute on the client side
- English question, French document: the model is multilingual

---

# Reranking

<!-- ci: retry -->
```json
POST /recipes/_search
{
  "retriever": {
    "text_similarity_reranker": {
      "retriever": { "standard": { "query": { "match": { "title": "pommes" } } } },
      "field": "title",
      "inference_id": ".rerank-v1-elasticsearch",
      "inference_text": "un dessert aux fruits",
      "rank_window_size": 10
    }
  },
  "_source": ["title"]
}
```

- A **cross-encoder** reads the query and each of the top hits together
- More accurate than the first search — too slow for the whole index

---

# Vectors in production

- **Memory**: HNSW is fast when the vectors fit in the page cache
  - `float`: 4 bytes × dims per vector — 1 M × 384 dims ≈ 1.5 GB
  - `int8`: ÷ 4, `bbq`: ÷ 32 (+ rescoring on the original vectors)
- **Indexing** costs more: graph construction, and inference with `semantic_text`
- **ML nodes** for the built-in models, `adaptive_allocations` to scale them
- Measure the relevance on **your** queries before choosing: lexical, semantic, hybrid, reranked

---

# Quiz

**Why not add a BM25 score and a kNN similarity to rank a hybrid search?**

- A) Elasticsearch forbids it
- B) The two scores live on different scales: BM25 is unbounded, a similarity lies between 0 and 1
- C) kNN has no score
- D) It is too slow

<v-click>

**Answer: B** — fuse them by rank (`rrf`), or normalize them first (`linear` with `minmax`).

</v-click>

---
layout: cover
---

# Workshop 8

## Vector, hybrid and semantic search
