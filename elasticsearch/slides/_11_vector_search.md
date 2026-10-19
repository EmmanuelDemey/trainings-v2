---
layout: cover
---

# Vector & Semantic Search

---

# Why vectors?

* BM25 (the default scoring) matches **words**:
    * "sleeping cat" does not find "the feline is napping"
    * a query in English does not find a document in French
* An **embedding model** turns a text (or an image…) into a **vector**: texts with close meanings get close vectors
* **Vector search**: find the k nearest vectors of the query's vector
* Elasticsearch stores the vectors, indexes them (HNSW graph), and can run the model itself

---

# dense_vector

```
PUT /movies-vectors
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "plot_vector": {
        "type": "dense_vector",
        "dims": 384,
        "similarity": "cosine"
      }
    }
  }
}
```

* `dims`: given by the model (384 for E5-small, 768, 1024…)
* `similarity`: `cosine`, `dot_product`, `l2_norm`, `max_inner_product`
* Vectors are **quantized** by default to save memory:
    * `bbq_hnsw` (Better Binary Quantization, ~32× smaller) from 384 dimensions
    * `int8_hnsw` (4× smaller) below

```
GET /movies-vectors/_mapping
```

---

# kNN search

```
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

* `k`: the number of nearest neighbours to return
* `num_candidates`: explored per shard — higher is more accurate, and slower
* **Approximate** (HNSW): fast, but may miss a neighbour

---

# kNN with a filter

* The filter is applied **during** the graph traversal: still `k` results

```
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

* In ES|QL: `FROM recipes METADATA _score | WHERE KNN(embedding, [0.85, 0.15, 0.05]) | SORT _score DESC`

---

# semantic_text: let Elasticsearch embed

* A field type that calls an **inference endpoint** at index time **and** at query time
* Long texts are split into **chunks**, each embedded

```
PUT /articles
{
  "mappings": {
    "properties": {
      "content": {
        "type": "semantic_text",
        "inference_id": ".multilingual-e5-small-elasticsearch"
      }
    }
  }
}
```

* Built-in endpoints (`GET _inference`): `.elser-2-elasticsearch` (sparse, English), `.multilingual-e5-small-elasticsearch` (dense, multilingual), `.rerank-v1-elasticsearch`
* Or an external service: OpenAI, Cohere, Mistral, Amazon Bedrock, Google Vertex AI… (`PUT _inference/text_embedding/my-endpoint`)

```
GET /_inference
```

---

# Semantic query

<!-- ci: retry -->
```
POST /articles/_doc/1?refresh=true
{ "content": "Le chat dort sur le canapé du salon." }
```

```
POST /articles/_doc/2?refresh=true
{ "content": "La bourse a fortement chuté ce matin." }
```

```
POST /articles/_search
{
  "query": {
    "match": { "content": "sleeping pet" }
  }
}
```

* A `match` on a `semantic_text` field is a semantic query — no vector to compute on the client side
* The first document indexed deploys the model on an ML node (a minute or so the first time)

---

# Hybrid search: retrievers

* Lexical **and** semantic: each one finds what the other misses
* But a BM25 score and a cosine similarity are not comparable: they cannot be added
* **Retrievers** compose searches: `standard`, `knn`, `rrf`, `linear`, `text_similarity_reranker`, `rule`…

```
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

* **RRF** (Reciprocal Rank Fusion) only uses the **ranks**: `score = Σ 1 / (rank_constant + rank)`

---

# Linear retriever

* A weighted sum of **normalized** scores — when one source should count more

```
POST /recipes/_search
{
  "retriever": {
    "linear": {
      "retrievers": [
        {
          "retriever": { "standard": { "query": { "match": { "title": "pommes" } } } },
          "weight": 1,
          "normalizer": "minmax"
        },
        {
          "retriever": { "knn": { "field": "embedding", "query_vector": [0.85, 0.15, 0.05], "k": 3, "num_candidates": 10 } },
          "weight": 2,
          "normalizer": "minmax"
        }
      ]
    }
  },
  "_source": ["title"]
}
```

---

# Reranking

* A **cross-encoder** model rereads the top results, with the query: more accurate, too slow for the whole index

<!-- ci: retry -->
```
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

---

# Vectors in production

* **Memory**: HNSW is fast when the vectors fit in the page cache
    * `float`: 4 bytes × dims per vector — 1 M × 384 dims ≈ 1.5 GB
    * `int8`: ÷ 4, `bbq`: ÷ 32 (+ rescoring on the original vectors)
* **Indexing** is more expensive (graph construction, and inference with `semantic_text`)
* **ML nodes** for the built-in models, with `adaptive_allocations` to scale them
* Measure the relevance on **your** queries before choosing: lexical, semantic, hybrid, reranked
