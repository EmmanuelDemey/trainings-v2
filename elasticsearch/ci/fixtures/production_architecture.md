# Production architecture — the indices the tuning and allocation examples act on

```bash
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

PUT /app-logs-2024.01
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}
```
