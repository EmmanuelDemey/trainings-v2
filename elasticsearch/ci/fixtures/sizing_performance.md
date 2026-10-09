# Sizing and performance — the indices the tuning examples act on

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
```
