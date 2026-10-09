# The `recipes` index, with 3-dimension vectors, the vector search examples query

```bash
PUT /recipes
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "category": { "type": "keyword" },
      "embedding": { "type": "dense_vector", "dims": 3, "similarity": "cosine" }
    }
  }
}

POST /recipes/_bulk
{"index":{"_id":"1"}}
{"title":"Tarte aux pommes","category":"dessert","embedding":[0.9,0.1,0.0]}
{"index":{"_id":"2"}}
{"title":"Crumble aux poires","category":"dessert","embedding":[0.8,0.2,0.1]}
{"index":{"_id":"3"}}
{"title":"Soupe de potiron","category":"entrée","embedding":[0.1,0.9,0.2]}
{"index":{"_id":"4"}}
{"title":"Gratin de pommes de terre","category":"plat","embedding":[0.2,0.3,0.9]}
```
