# Fixture — sizing: the indices the indexing, search, cache and profiling examples act on

```json
PUT /my-index

PUT /old-index

PUT /products
{
  "mappings": {
    "properties": {
      "category": { "type": "keyword" },
      "price": { "type": "double" },
      "description": { "type": "text" }
    }
  }
}

POST /products/_doc
{ "category": "electronics", "price": 799, "description": "A smartphone" }
```
