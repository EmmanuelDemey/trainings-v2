# Fixture — alerting: the logs the watch searches, and the index the alerts are archived in

```json
PUT /app-logs
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "service": { "properties": { "name": { "type": "keyword" } } },
      "message": { "type": "text" }
    }
  }
}

POST /app-logs/_doc?refresh=true
{ "@timestamp": "2026-10-28T10:30:00Z", "level": "ERROR", "service": { "name": "checkout" }, "message": "payment timeout" }

PUT /alert-history
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "rule": { "type": "keyword" },
      "alert": { "type": "keyword" },
      "value": { "type": "long" }
    }
  }
}
```
