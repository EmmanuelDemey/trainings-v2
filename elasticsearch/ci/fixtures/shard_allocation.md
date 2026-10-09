# Shard allocation — the indices the examples change the settings of (my-index has a replica: wait_for_active_shards 2 needs 2 copies)

```bash
PUT /logs-recent
{ "settings": { "number_of_replicas": 0 } }

PUT /my-index
{ "settings": { "number_of_replicas": 1 } }

POST /my-index/_doc
{ "message": "a document to merge" }
```
