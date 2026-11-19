# The `orders-*` monthly indices the examples of chapter 29 query

```json
PUT /orders-2026.09
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "customer": { "type": "keyword" },
      "amount": { "type": "double" },
      "status": { "type": "keyword" }
    }
  }
}

PUT /orders-2026.10
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "customer": { "type": "keyword" },
      "amount": { "type": "double" },
      "status": { "type": "keyword" }
    }
  }
}

PUT /orders-2026.11
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "customer": { "type": "keyword" },
      "amount": { "type": "double" },
      "status": { "type": "keyword" }
    }
  }
}

POST /_bulk?refresh=true
{"index":{"_index":"orders-2026.09"}}
{"@timestamp":"2026-09-12T10:00:00Z","customer":"alice","amount":40,"status":"paid"}
{"index":{"_index":"orders-2026.10"}}
{"@timestamp":"2026-10-03T10:00:00Z","customer":"bob","amount":120,"status":"paid"}
{"index":{"_index":"orders-2026.10"}}
{"@timestamp":"2026-10-20T10:00:00Z","customer":"alice","amount":15,"status":"refunded"}
{"index":{"_index":"orders-2026.11"}}
{"@timestamp":"2026-11-02T10:00:00Z","customer":"carol","amount":80,"status":"paid"}
```
