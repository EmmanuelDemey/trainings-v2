# Workshop 21 — Building a hybrid semantic search application

> Build the search of an outdoor shop, end to end: a lexical and a semantic field side by side, a hybrid query with filters and facets, highlighting, reranking, then a search template behind an alias — the API your application calls. Optionally, turn the hits into an answer with an LLM.

**Duration**: 60 min · **Chapter**: 33 — Vector search in depth, and 34 — RAG and Agent Builder

## Context

An outdoor shop wants a search box that understands its customers: « footwear for mountain trails » must find the hiking boots, though neither « footwear » nor « mountain » is in their description. The front-end team does not want to write Query DSL: it wants **one** endpoint that takes the customer's words, a maximum price and a page size.

Each step states **what** to find, not **how**: look for the query in the documentation, try it, read the response. The expected result lets you check your answer. Hints are folded — open them only once you are stuck.

## Setup

This workshop stands on its own. It needs a **trial license or above** (machine learning models): Stack Management → License Management → Start trial, or `-e xpack.license.self_generated.type=trial` with Docker.

**Prerequisites**: the node must have the `ml` role (the default) and Internet access to download the models (~100 MB for E5, ~300 MB for the reranker, the first time).

The catalogue: `description` is analysed as English text **and** copied into a `semantic_text` field, embedded by the multilingual E5 model.

```json
DELETE /products

PUT /products
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "name": { "type": "text", "analyzer": "english" },
      "description": { "type": "text", "analyzer": "english", "copy_to": "description_semantic" },
      "description_semantic": { "type": "semantic_text", "inference_id": ".multilingual-e5-small-elasticsearch" },
      "category": { "type": "keyword" },
      "brand": { "type": "keyword" },
      "price": { "type": "float" },
      "in_stock": { "type": "boolean" }
    }
  }
}
```

The **first** bulk downloads and deploys the model: it may take a minute or two. If it fails on a timeout, send it again.

<!-- ci: retry -->
```json
POST /products/_bulk?refresh=true
{"index":{"_id":"1"}}
{"name":"Alpine down jacket","description":"Lightweight goose down insulation that keeps you warm on cold mountain treks. Packs into its own pocket.","category":"jackets","brand":"Summit","price":189.0,"in_stock":true}
{"index":{"_id":"2"}}
{"name":"Fleece pullover","description":"Soft fleece layer for chilly evenings at the campsite. Breathable and quick to dry.","category":"jackets","brand":"Trailhead","price":59.0,"in_stock":true}
{"index":{"_id":"3"}}
{"name":"Rain shell jacket","description":"Waterproof and windproof shell with sealed seams, for hiking in the rain.","category":"jackets","brand":"Summit","price":129.0,"in_stock":false}
{"index":{"_id":"4"}}
{"name":"Insulated winter parka","description":"Heavy synthetic insulation and a fur-lined hood: built for freezing city winters.","category":"jackets","brand":"Urbano","price":139.0,"in_stock":true}
{"index":{"_id":"5"}}
{"name":"Trail running shoes","description":"Grippy outsole and a breathable mesh upper for fast runs on rocky paths.","category":"shoes","brand":"Trailhead","price":119.0,"in_stock":true}
{"index":{"_id":"6"}}
{"name":"Leather hiking boots","description":"Sturdy waterproof boots with ankle support for long hikes on rough terrain.","category":"shoes","brand":"Summit","price":169.0,"in_stock":true}
{"index":{"_id":"7"}}
{"name":"Merino wool socks","description":"Thick merino socks that keep your feet warm and dry, even after a long day of walking.","category":"accessories","brand":"Trailhead","price":19.0,"in_stock":true}
{"index":{"_id":"8"}}
{"name":"Insulated water bottle","description":"Double-walled steel bottle: keeps drinks hot for 12 hours and cold for 24.","category":"accessories","brand":"Urbano","price":29.0,"in_stock":true}
{"index":{"_id":"9"}}
{"name":"Two-person tent","description":"Freestanding tent for two, quick to pitch, stable in strong wind.","category":"camping","brand":"Summit","price":249.0,"in_stock":true}
{"index":{"_id":"10"}}
{"name":"Sleeping bag -10°C","description":"Mummy-shaped sleeping bag rated to minus ten degrees, for winter camping.","category":"camping","brand":"Trailhead","price":99.0,"in_stock":true}
```

## Part A: Two ways to search

Reference: [Semantic search with `semantic_text`](https://www.elastic.co/docs/solutions/search/semantic-search/semantic-search-semantic-text).

### Step 1: Where are the vectors?

Look at the mapping of `description_semantic`: which inference endpoint embeds it, how many dimensions do its vectors have, and how are they stored (`model_settings`, `index_options`)?

:::hint
The field mapping API returns one field: `GET /<index>/_mapping/field/<field>`. Ask for `include_defaults` to see what `semantic_text` sets for you.
:::

**Expected result** (excerpt):

```json
{
  "products": {
    "mappings": {
      "description_semantic": {
        "mapping": {
          "description_semantic": {
            "type": "semantic_text",
            "inference_id": ".multilingual-e5-small-elasticsearch"
          }
        }
      }
    }
  }
}
```

**Question**: you never sent a vector. When is the embedding computed? And for the query?

### Step 2: The lexical baseline

Search « footwear for mountain trails » in `name` (twice as important) and `description`, and return only the ids.

:::hint
One query, several fields, a boost with `^`.
:::

**Expected result** (excerpt):

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "5" }, { "_id": "1" } ]
  }
}
```

**Questions**: why does the down jacket come back? Why are the hiking boots missing?

### Step 3: The semantic search

The same words, on `description_semantic` this time. Keep the 2 best hits.

**Expected result** (excerpt):

```json
{
  "hits": {
    "hits": [ { "_id": "6" }, { "_id": "5" } ]
  }
}
```

**Question**: how many hits does the semantic search return in total? Why can't you show its `total` to the customer as « N results »?

## Part B: One hybrid query

Reference: [Retrievers](https://www.elastic.co/docs/solutions/search/retrievers-overview).

### Step 4: Fuse the two searches

Combine the lexical search of step 2 and the semantic search of step 3 with **Reciprocal Rank Fusion**, over a window of 10, and keep the 3 best hits.

:::hint
The `rrf` retriever takes a list of `retrievers`; a `standard` retriever wraps a `query`.
:::

**Expected result** (excerpt):

```json
{
  "hits": {
    "hits": [ { "_id": "5" }, { "_id": "1" }, { "_id": "6" } ]
  }
}
```

**Question**: the trail shoes are first: why? Is the jacket a good second hit?

### Step 5: Filters and facets

The customer ticks « 150 € max ». Apply the price filter to **both** searches of step 4, and add a facet: the number of products per `category`.

:::hint
A filter can sit on the `rrf` retriever itself: it is passed down to every retriever it combines. Aggregations go next to the `retriever`, as with a `query`.
:::

**Expected result** (excerpt):

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

**Question**: the facet counts jackets for a search about footwear. Which documents does an aggregation count, with a semantic retriever in the mix?

### Step 6: Show why it matched

Take the hybrid search of step 4, keep 2 hits, and highlight `name` (lexical) **and** the passage of `description_semantic` that matched (semantic).

:::hint
Each field of `highlight.fields` has its own `type`. The highlighter of a `semantic_text` field returns its best **chunks**.
:::

**Expected result** (excerpt):

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

### Step 7: Rerank

Have the 10 best hits of the hybrid search of step 4 read again by the reranking endpoint, against « footwear for mountain trails », on the `description` field. Keep 3 hits. The first call deploys the model: send it again if it fails on a timeout.

:::hint
The `text_similarity_reranker` retriever wraps another retriever — here, the `rrf` one.
:::

**Expected result** (excerpt):

```json
{
  "hits": {
    "hits": [ { "_id": "6" }, { "_id": "5" }, { "_id": "7" } ]
  }
}
```

**Question**: where is the jacket now? What does a cross-encoder see that RRF does not? Why not rerank the whole index?

## Part C: The application's API

Reference: [Search templates](https://www.elastic.co/docs/solutions/search/search-templates).

### Step 8: A search template

Store the hybrid search of step 5 as a **search template** named `product-search`, with three parameters: `q` (the customer's words), `max_price` (default `100000`) and `size` (default `5`). Return only `name` and `price`. Check what it renders for « footwear for mountain trails » and 150 €.

:::hint
A template is stored with `PUT /_scripts/<id>`, in `mustache`. `{{max_price}}{{^max_price}}100000{{/max_price}}` gives a default. `POST /_render/template` shows the search it produces, without running it.
:::

**Expected result** (excerpt of the render):

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

### Step 9: Behind an alias

Create the alias `shop-search` on `products`, and run the template through it for « keep my coffee hot », 1 hit.

:::hint
`POST /_aliases`, then `POST /<alias>/_search/template` with the `id` and the `params`.
:::

**Expected result** (excerpt):

```json
{
  "hits": {
    "hits": [ { "_id": "8", "_source": { "name": "Insulated water bottle" } } ]
  }
}
```

**Question**: the front end now calls `POST /shop-search/_search/template` with three parameters. What can you change tomorrow (mapping, model, weights, reranking) without touching the front end — and how (chapter 7)?

## Part D (optional): From hits to an answer

Reference: [ES|QL `COMPLETION`](https://www.elastic.co/docs/reference/query-languages/esql/commands/completion).

### Step 10: Build the context in ES|QL

With ES|QL, on `shop-search`: the 3 in-stock products whose `description_semantic` best matches the parameter `?q` = « footwear for mountain trails », then **one** row whose `prompt` column says: « Recommend one product from this list: » followed by the names and descriptions.

:::hint
`FROM … METADATA _score`, `WHERE MATCH(…, ?q) AND in_stock`, `SORT _score DESC`, `LIMIT 3`, then `EVAL` a line per product and `STATS … = MV_CONCAT(VALUES(…), …)`. The parameters go in `params`, next to `query`.
:::

**Expected result** (excerpt, `format=json`):

```json
{
  "columns": [ { "name": "prompt", "type": "keyword" } ]
}
```

### Step 11: Ask an LLM

If you have a key for an LLM provider (OpenAI, Anthropic, Mistral…), create a `completion` inference endpoint, and add a `COMPLETION` command to step 10 to get the recommendation. On Elastic Cloud, use an Elastic Inference Service endpoint instead.

**Question**: why must `COMPLETION` come **after** the `STATS`?

## Success criteria

- A `semantic_text` field filled through `copy_to`, next to a lexical one
- The difference between lexical and semantic hits explained on a real query
- A hybrid `rrf` search, filtered, with facets and highlighting
- Its best hits reranked with `text_similarity_reranker`
- The whole search behind a search template and an alias: the application's API
- (Optional) An ES|QL query that builds a RAG prompt, and an LLM answer

## Troubleshooting

**Problem**: `model_deployment_timeout_exception` or `Timed out after [30s] waiting for trained model deployment`
→ The model is being downloaded or deployed: wait a minute and send the request again. Follow it with `GET /_ml/trained_models/_stats`.

**Problem**: `Could not start deployment because no ML nodes with sufficient capacity were found`
→ The ML node is out of memory: stop a model you no longer need (`POST /_ml/trained_models/<model_id>/deployment/_stop`), or give the node more memory.

**Problem**: `current license is non-compliant for [inference]`
→ The built-in models need a trial license or above (see the setup).

**Problem**: the template renders, but the search fails with `failed to parse`
→ A `{{…}}` placeholder outside quotes makes invalid JSON when the parameter is missing: keep it inside a string, as in the hint of step 8.
