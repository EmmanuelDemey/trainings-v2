# The `orders` index the transform examples read

```json
PUT /orders
{
  "mappings": {
    "properties": {
      "order_id": { "type": "keyword" },
      "customer_id": { "type": "keyword" },
      "@timestamp": { "type": "date" },
      "country": { "type": "keyword" },
      "category": { "type": "keyword" },
      "total": { "type": "double" },
      "event": { "properties": { "ingested": { "type": "date" } } }
    }
  }
}

POST /orders/_bulk
{"index":{}}
{"order_id":"o-01","customer_id":"c-001","@timestamp":"2026-10-01T09:12:00Z","country":"FR","category":"books","total":120.0}
{"index":{}}
{"order_id":"o-02","customer_id":"c-002","@timestamp":"2026-10-01T10:30:00Z","country":"DE","category":"electronics","total":300.0}
{"index":{}}
{"order_id":"o-03","customer_id":"c-001","@timestamp":"2026-10-01T15:45:00Z","country":"FR","category":"games","total":90.0}
{"index":{}}
{"order_id":"o-04","customer_id":"c-003","@timestamp":"2026-10-02T08:05:00Z","country":"FR","category":"books","total":45.0}
{"index":{}}
{"order_id":"o-05","customer_id":"c-004","@timestamp":"2026-10-02T11:20:00Z","country":"ES","category":"games","total":70.0}
{"index":{}}
{"order_id":"o-06","customer_id":"c-002","@timestamp":"2026-10-02T17:00:00Z","country":"DE","category":"books","total":100.0}
{"index":{}}
{"order_id":"o-07","customer_id":"c-004","@timestamp":"2026-10-03T09:40:00Z","country":"ES","category":"books","total":30.0}
{"index":{}}
{"order_id":"o-08","customer_id":"c-001","@timestamp":"2026-10-03T14:10:00Z","country":"FR","category":"electronics","total":60.0}
```
