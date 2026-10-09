# Fixture — troubleshooting: two daily log indices

```bash
PUT /parkki-logs-2025.01.14
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

PUT /parkki-logs-2025.01.15
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

POST /parkki-logs-2025.01.14/_doc
{ "@timestamp": "2025-01-14T10:00:00Z", "message": "started" }
```
