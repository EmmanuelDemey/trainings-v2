# Workshop 21 — Building a hybrid semantic search application: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Part A: Two ways to search

### Step 1

```json
GET /products/_mapping/field/description_semantic?include_defaults=true
```

**Expected result**:

```json
{
  "products": {
    "mappings": {
      "description_semantic": {
        "mapping": {
          "description_semantic": {
            "type": "semantic_text",
            "inference_id": ".multilingual-e5-small-elasticsearch",
            "model_settings": { "task_type": "text_embedding", "dimensions": 384, "similarity": "cosine" },
            "index_options": { "dense_vector": { "element_type": "bfloat16" } }
          }
        }
      }
    }
  }
}
```

- `model_settings` is filled by the **first** document: 384 dimensions, cosine;
- the vectors are stored as `bfloat16` (half the size of `float`), and quantized
  in the index (`bbq_hnsw` from 384 dimensions);
- the embedding is computed **at index time** (the bulk calls the endpoint for
  each chunk), and the query text is embedded **at search time** by the same
  endpoint.

### Step 2

```json
POST /products/_search
{
  "query": {
    "multi_match": {
      "query": "footwear for mountain trails",
      "fields": ["name^2", "description"]
    }
  },
  "_source": false
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "5" }, { "_id": "1" } ]
  }
}
```

- the shoes match `trail` (« trails » is stemmed by the English analyzer) in their
  name, boosted;
- the down jacket matches `mountain` — a word, not a meaning;
- the boots say « boots », « hikes », « rough terrain »: no word in common.

### Step 3

```json
POST /products/_search
{
  "query": { "match": { "description_semantic": "footwear for mountain trails" } },
  "size": 2,
  "_source": false
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [ { "_id": "6" }, { "_id": "5" } ]
  }
}
```

`total` is **10**: a semantic search scores every document, even the tent. Its
total says nothing to the customer — show a page of hits, not « 10 results ».

## Part B: One hybrid query

### Step 4

```json
POST /products/_search
{
  "retriever": {
    "rrf": {
      "retrievers": [
        { "standard": { "query": { "multi_match": { "query": "footwear for mountain trails", "fields": ["name^2", "description"] } } } },
        { "standard": { "query": { "match": { "description_semantic": "footwear for mountain trails" } } } }
      ],
      "rank_window_size": 10
    }
  },
  "size": 3,
  "_source": false
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [ { "_id": "5" }, { "_id": "1" }, { "_id": "6" } ]
  }
}
```

The shoes are ranked well by **both** searches: RRF rewards that. The jacket is
first… of one list (the lexical one, 2nd): RRF only sees ranks, not meaning — it
beats the boots, which only the semantic search found. Step 7 fixes it.

### Step 5

```json
POST /products/_search
{
  "retriever": {
    "rrf": {
      "retrievers": [
        { "standard": { "query": { "multi_match": { "query": "footwear for mountain trails", "fields": ["name^2", "description"] } } } },
        { "standard": { "query": { "match": { "description_semantic": "footwear for mountain trails" } } } }
      ],
      "rank_window_size": 10,
      "filter": { "range": { "price": { "lte": 150 } } }
    }
  },
  "size": 3,
  "_source": false,
  "aggs": { "categories": { "terms": { "field": "category" } } }
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [ { "_id": "5" } ]
  },
  "aggregations": {
    "categories": {
      "buckets": [ { "key": "jackets", "doc_count": 3 } ]
    }
  }
}
```

- the filter applies to **each** retriever: the jacket (189 €) and the boots
  (169 €) are gone from both lists;
- the aggregation counts every document matched by **any** retriever, and the
  semantic one matches all of them (below the filter): the facets of a semantic
  search are broad. In an application, compute them on the lexical query, or set
  a `min_score` / `k` on the semantic side.

### Step 6

```json
POST /products/_search
{
  "retriever": {
    "rrf": {
      "retrievers": [
        { "standard": { "query": { "multi_match": { "query": "footwear for mountain trails", "fields": ["name^2", "description"] } } } },
        { "standard": { "query": { "match": { "description_semantic": "footwear for mountain trails" } } } }
      ],
      "rank_window_size": 10
    }
  },
  "size": 2,
  "_source": false,
  "highlight": {
    "fields": {
      "name": {},
      "description_semantic": { "type": "semantic", "number_of_fragments": 1 }
    }
  }
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [
      {
        "_id": "5",
        "highlight": {
          "name": [ "<em>Trail</em> running shoes" ],
          "description_semantic": [ "Grippy outsole and a breathable mesh upper for fast runs on rocky paths." ]
        }
      }
    ]
  }
}
```

The semantic highlighter has no word to put in `<em>`: it returns the best
**chunk** — the whole description here, as it is short.

### Step 7

```json
POST /products/_search
{
  "retriever": {
    "text_similarity_reranker": {
      "retriever": {
        "rrf": {
          "retrievers": [
            { "standard": { "query": { "multi_match": { "query": "footwear for mountain trails", "fields": ["name^2", "description"] } } } },
            { "standard": { "query": { "match": { "description_semantic": "footwear for mountain trails" } } } }
          ],
          "rank_window_size": 10
        }
      },
      "field": "description",
      "inference_id": ".rerank-v1-elasticsearch",
      "inference_text": "footwear for mountain trails",
      "rank_window_size": 10
    }
  },
  "size": 3,
  "_source": false
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [ { "_id": "6" }, { "_id": "5" }, { "_id": "7" } ]
  }
}
```

The jacket drops out of the top 3. A cross-encoder reads the question **and** the
description together, word against word: much more accurate than two vectors
computed separately, and much slower — one model call per hit, so only on the
top of a cheaper search.

## Part C: The application's API

### Step 8

```json
PUT /_scripts/product-search
{
  "script": {
    "lang": "mustache",
    "source": {
      "retriever": {
        "rrf": {
          "retrievers": [
            { "standard": { "query": { "multi_match": { "query": "{{q}}", "fields": ["name^2", "description"] } } } },
            { "standard": { "query": { "match": { "description_semantic": "{{q}}" } } } }
          ],
          "rank_window_size": 20,
          "filter": { "range": { "price": { "lte": "{{max_price}}{{^max_price}}100000{{/max_price}}" } } }
        }
      },
      "size": "{{size}}{{^size}}5{{/size}}",
      "_source": ["name", "price"]
    }
  }
}

POST /_render/template
{
  "id": "product-search",
  "params": { "q": "footwear for mountain trails", "max_price": 150 }
}
```

**Expected result**:

```json
{
  "template_output": {
    "retriever": {
      "rrf": {
        "filter": { "range": { "price": { "lte": "150" } } }
      }
    },
    "size": "5"
  }
}
```

The placeholders stay inside JSON strings: Elasticsearch converts `"150"` and
`"5"` itself, and the template stays valid JSON when a parameter is missing.

### Step 9

```json
POST /_aliases
{
  "actions": [ { "add": { "index": "products", "alias": "shop-search" } } ]
}

POST /shop-search/_search/template
{
  "id": "product-search",
  "params": { "q": "keep my coffee hot", "size": 1 }
}
```

**Expected result**:

```json
{
  "hits": {
    "hits": [ { "_id": "8", "_source": { "name": "Insulated water bottle" } } ]
  }
}
```

The front end only knows `shop-search` and three parameters. Behind them you can:
change the template (weights, reranker, fields) with a `PUT /_scripts`; change
the mapping or the model by reindexing into `products-v2` and switching the alias
atomically (chapter 7).

## Part D (optional): From hits to an answer

### Step 10

```json
POST /_query?format=json
{
  "query": """
    FROM shop-search METADATA _score
    | WHERE MATCH(description_semantic, ?q) AND in_stock
    | SORT _score DESC
    | LIMIT 3
    | EVAL line = CONCAT(name, ": ", description)
    | STATS products = MV_CONCAT(VALUES(line), " | ")
    | EVAL prompt = CONCAT("Recommend one product from this list: ", products)
    | KEEP prompt
  """,
  "params": [ { "q": "footwear for mountain trails" } ]
}
```

**Expected result**:

```json
{
  "columns": [ { "name": "prompt", "type": "keyword" } ]
}
```

### Step 11

<!-- ci: skip -->
```json
PUT /_inference/completion/shop-llm
{
  "service": "openai",
  "service_settings": { "api_key": "<your key>", "model_id": "gpt-4o-mini" }
}

POST /_query?format=txt
{
  "query": """
    FROM shop-search METADATA _score
    | WHERE MATCH(description_semantic, ?q) AND in_stock
    | SORT _score DESC
    | LIMIT 3
    | EVAL line = CONCAT(name, ": ", description)
    | STATS products = MV_CONCAT(VALUES(line), " | ")
    | EVAL prompt = CONCAT("A customer asks: ", ?q, ". Recommend one product from this list, in one sentence: ", products)
    | COMPLETION answer = prompt WITH { "inference_id": "shop-llm" }
    | KEEP answer
  """,
  "params": [ { "q": "footwear for mountain trails" } ]
}
```

`COMPLETION` calls the LLM **once per row**: after the `STATS`, there is one row,
so one call. Before it, there would be three — three answers, three bills.
