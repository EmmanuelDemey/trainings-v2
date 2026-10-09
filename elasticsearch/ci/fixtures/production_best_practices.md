# Fixture — production best practices: the indices and the repository the examples use

```bash
PUT /app-logs-2024.01
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

PUT /problematic-index
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

PUT /slow-index
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

PUT /_snapshot/s3_backup
{
  "type": "fs",
  "settings": { "location": "/usr/share/elasticsearch/backups/s3_backup" }
}
```
