# Workshop 13 — Vector, hybrid and semantic search: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Part A: Vectors and kNN

### Step 1

```json
GET /recipes/_mapping
```

**Expected result**:

```json
{
  "recipes": {
    "mappings": {
      "properties": {
        "embedding": {
          "type": "dense_vector",
          "dims": 3,
          "index_options": { "type": "int8_hnsw" }
        }
      }
    }
  }
}
```

`int8_hnsw` stores each dimension on 1 byte instead of 4: 4 times less memory.
From 384 dimensions, the default is `bbq_hnsw` (Better Binary Quantization,
~32 times less).

### Step 2

```json
POST /recipes/_search
{
  "knn": {
    "field": "embedding",
    "query_vector": [0.9, 0.1, 0.05],
    "k": 2,
    "num_candidates": 10
  },
  "_source": ["title"]
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [
      { "_id": "1", "_source": { "title": "Apple pie" } },
      { "_id": "5", "_source": { "title": "Stewed apples" } }
    ]
  }
}
```

- `num_candidates`: how many candidates are explored per shard in the HNSW graph;
  the larger, the more exact — and the slower;
- approximate: HNSW walks a graph from neighbour to neighbour instead of
  comparing the query with every vector, so it may miss the true nearest one.

### Step 3

```json
POST /recipes/_search
{
  "knn": {
    "field": "embedding",
    "query_vector": [0.9, 0.1, 0.05],
    "k": 1,
    "num_candidates": 10,
    "filter": { "term": { "category": "main" } }
  },
  "_source": ["title"]
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [ { "_id": "4" } ]
  }
}
```

The filter applies **during** the walk of the graph: there are always `k` hits
that match it — unlike a `post_filter`, which could leave none.

## Part B: Hybrid search

### Step 4

```json
POST /recipes/_search
{
  "query": { "match": { "title": "apple" } },
  "_source": ["title"]
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 3 }
  }
}
```

The pork chops. BM25 is unbounded and depends on the index statistics, the
cosine similarity lies between 0 and 1: their sum means nothing.

### Step 5

```json
POST /recipes/_search
{
  "retriever": {
    "rrf": {
      "retrievers": [
        { "standard": { "query": { "match": { "title": "apple" } } } },
        { "knn": { "field": "embedding", "query_vector": [0.9, 0.1, 0.05], "k": 3, "num_candidates": 10 } }
      ],
      "rank_window_size": 10
    }
  },
  "size": 2,
  "_source": ["title"]
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [
      { "_id": "1" },
      { "_id": "5" }
    ]
  }
}
```

`score = Σ 1 / (rank_constant + rank)`, over each retriever where the document
appears. `rank_constant` (60 by default) dampens the weight of the first ranks.

### Step 6

```json
POST /recipes/_search
{
  "retriever": {
    "linear": {
      "retrievers": [
        {
          "retriever": { "standard": { "query": { "match": { "title": "apple" } } } },
          "weight": 1,
          "normalizer": "minmax"
        },
        {
          "retriever": { "knn": { "field": "embedding", "query_vector": [0.9, 0.1, 0.05], "k": 3, "num_candidates": 10 } },
          "weight": 2,
          "normalizer": "minmax"
        }
      ]
    }
  },
  "_source": ["title"]
}
```

## Part C: Embeddings computed by Elasticsearch

### Step 7

```json
GET /_inference
```

`.multilingual-e5-small-elasticsearch` (dense embeddings, multilingual) and
`.rerank-v1-elasticsearch` (reranking). They deploy their model on first use.

### Step 8

```json
DELETE /articles

PUT /articles
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
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

<!-- ci: retry -->
```json
POST /articles/_doc/1?refresh=true
{ "content": "The cat is sleeping on the living-room sofa." }
```

```json
POST /articles/_bulk?refresh=true
{"index":{"_id":"2"}}
{"content":"The stock market fell sharply this morning after the results were announced."}
{"index":{"_id":"3"}}
{"content":"Preheat the oven, roll out the pastry and lay the apples in a rosette."}
```

The vectors are not in `_source`: they live in a hidden `_inference_fields`,
one per chunk — a `semantic_text` splits long texts.

### Step 9

```json
POST /articles/_search
{
  "query": { "match": { "content": "drowsy feline" } },
  "size": 1,
  "_source": ["content"]
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [ { "_id": "1" } ]
  }
}
```

A `match` (or a `semantic` query) on a `semantic_text` field turns the question
into a vector with the same endpoint, then runs a kNN search.

### Step 10

<!-- ci: retry -->
```json
POST /recipes/_search
{
  "retriever": {
    "text_similarity_reranker": {
      "retriever": { "standard": { "query": { "match": { "title": "apple" } } } },
      "field": "title",
      "inference_id": ".rerank-v1-elasticsearch",
      "inference_text": "a fruit dessert",
      "rank_window_size": 10
    }
  },
  "_source": ["title"]
}
```

The pork chops fall to the last place: the cross-encoder reads the title with the
question, and understands it is no dessert.
