# Workshop 13 — Vector, hybrid and semantic search

> Index vectors, find the nearest neighbours, combine lexical and vector search with retrievers, then let Elasticsearch compute the embeddings itself with `semantic_text`.

**Level**: Advanced
**Topic**: Search — Vector search

## Context

A recipe site wants a search for « fruit dessert » to find the apple pie, even though none of these words is in its title. You first handle vectors « by hand » (3 dimensions, so you can read them), then use a real embedding model run by Elasticsearch.

Each step states **what** to find, not **how**: look for the query in the documentation, try it, read the response. The expected result lets you check your answer. Hints are folded — open them only once you are stuck.

## Setup

This workshop stands on its own. Part C needs a **trial license or above** (machine learning models): Stack Management → License Management → Start trial, or `-e xpack.license.self_generated.type=trial` with Docker.

**Prerequisites**: the node must have the `ml` role (the default) and Internet access to download the models (~100 MB for E5, the first time).

Each recipe has a 3-dimension vector. Pretend these dimensions mean « sweet », « savoury/soup » and « hot dish » (a real model produces hundreds of dimensions, with no readable meaning):

```json
DELETE /recipes

PUT /recipes
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "title": { "type": "text", "analyzer": "english" },
      "category": { "type": "keyword" },
      "embedding": { "type": "dense_vector", "dims": 3, "similarity": "cosine" }
    }
  }
}

POST /recipes/_bulk?refresh=true
{"index":{"_id":"1"}}
{"title":"Apple pie","category":"dessert","embedding":[0.9,0.1,0.0]}
{"index":{"_id":"2"}}
{"title":"Pear crumble","category":"dessert","embedding":[0.8,0.2,0.1]}
{"index":{"_id":"3"}}
{"title":"Pumpkin soup","category":"starter","embedding":[0.1,0.9,0.2]}
{"index":{"_id":"4"}}
{"title":"Pork chops with apple sauce","category":"main","embedding":[0.2,0.3,0.9]}
{"index":{"_id":"5"}}
{"title":"Stewed apples","category":"dessert","embedding":[0.95,0.05,0.0]}
```

## Part A: Vectors and kNN

Reference: [kNN search](https://www.elastic.co/docs/solutions/search/vector/knn).

### Step 1: The mapping

Look at the mapping of `recipes`: which `index_options` did Elasticsearch choose for `embedding`, though you set none?

**Expected result** (excerpt):

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

**Question**: what does this quantization save? Would it be the same with 1024 dimensions? Look at the [`dense_vector` field type](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/dense-vector).

### Step 2: The nearest neighbours

Find the **2** recipes closest to the « very sweet » vector `[0.9, 0.1, 0.05]`, exploring 10 candidates, and return only their `title`.

<details>
<summary>Hint</summary>

A `knn` section sits at the top level of the search body, next to (or instead of) `query`. It takes the field, the query vector, `k` and `num_candidates`.

</details>

**Expected result** (excerpt):

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

**Questions**:

- what is `num_candidates` for?
- why is this search called **approximate**?

### Step 3: Filtered kNN

Same vector, but find the single closest recipe among the `main` dishes.

<details>
<summary>Hint</summary>

`knn` takes a `filter`. Is it applied before, during, or after walking the graph?

</details>

**Expected result** (excerpt):

```json
{
  "hits": {
    "hits": [ { "_id": "4" } ]
  }
}
```

## Part B: Hybrid search with retrievers

Reference: [Retrievers](https://www.elastic.co/docs/solutions/search/retrievers-overview).

### Step 4: The problem

Search the titles for « apple », lexically.

**Expected result** (excerpt):

```json
{
  "hits": {
    "total": { "value": 3 }
  }
}
```

**Question**: which one is no dessert? Why can't you simply add its BM25 score to the cosine similarity of step 2?

### Step 5: Reciprocal Rank Fusion

Combine the lexical search « apple » and the kNN search of step 2 (with `k` 3) by their **ranks**, over a window of 10, and keep the 2 first hits.

<details>
<summary>Hint</summary>

The `rrf` retriever takes a list of `retrievers`: a `standard` one wraps a `query`, a `knn` one takes the same keys as the `knn` section.

</details>

**Expected result** (excerpt): the pie and the stewed apples, found by both searches, come before the pork chops.

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

**Question**: what is the formula of the RRF score? What is `rank_constant` for?

### Step 6: Linear combination

Same two searches, but now normalise their scores with `minmax` and make the vector similarity count **twice** as much as the lexical score.

<details>
<summary>Hint</summary>

Look at the `linear` retriever: each of its retrievers has a `weight` and a `normalizer`.

</details>

## Part C: Let Elasticsearch compute the embeddings

Reference: [Semantic search with `semantic_text`](https://www.elastic.co/docs/solutions/search/semantic-search/semantic-search-semantic-text).

### Step 7: The inference endpoints

List the inference endpoints of your cluster. Find the one that computes **dense embeddings, multilingual**, and the one that **reranks**.

<details>
<summary>Hint</summary>

The inference API lists its endpoints with a `GET` on its root. The built-in ones start with a dot.

</details>

### Step 8: A semantic_text field

Create the index `articles` (1 shard, no replica) whose field `content` is a `semantic_text` computed by the multilingual endpoint of step 7. Then index these three documents, with ids `1`, `2` and `3`:

- « The cat is sleeping on the living-room sofa. »
- « The stock market fell sharply this morning after the results were announced. »
- « Preheat the oven, roll out the pastry and lay the apples in a rosette. »

The **first** indexing downloads and deploys the model: it may take a minute or two. If it fails on a timeout, send it again.

**Question**: you index plain text. Where are the vectors? Look at the mapping, and at the hits with `"fields": ["_inference_fields"]`.

### Step 9: A semantic search

Search `articles` for « drowsy feline », and keep the best hit only.

<details>
<summary>Hint</summary>

A `semantic_text` field is searched with the queries you already know.

</details>

**Expected result** (excerpt):

```json
{
  "hits": {
    "hits": [ { "_id": "1" } ]
  }
}
```

**Try**: ask in French (`"félin endormi"`) — the model is multilingual.

### Step 10: Reranking

Take the lexical search « apple » of step 4, and have its 10 best hits read again by the reranking endpoint against the question « a fruit dessert ». The first call deploys the model: send it again if it fails on a timeout.

<details>
<summary>Hint</summary>

Look at the `text_similarity_reranker` retriever: it wraps another retriever, and names the field to read, the inference endpoint and the text to compare with.

</details>

**Question**: where are the pork chops now?

## Success criteria

- A `dense_vector` field mapped, its default quantization understood
- A `knn` search, with and without a filter
- Lexical and vector search combined with the `rrf` and `linear` retrievers
- A `semantic_text` field indexed and searched
- Results reranked with `text_similarity_reranker`

## Troubleshooting

**Problem**: `model_deployment_timeout_exception` or `Timed out after [30s] waiting for trained model deployment`
→ The model is being downloaded or deployed: wait a minute and send the request again. Follow it with `GET /_ml/trained_models/_stats`.

**Problem**: `current license is non-compliant for [inference]`
→ The built-in models need a trial license or above (see the setup).

**Problem**: `failed to download model`
→ The node has no Internet access: the models can be installed offline (see « Deploy ELSER/E5 in air-gapped environments » in the documentation).
