# Retention — the indices to delete, close, open and shrink (my_index: 4 shards, shrunk to 2), and the data stream whose lifecycle is set

```bash
PUT /movies-2023

POST /movies/_doc
{ "title": "Titanic" }

PUT /my_index
{ "settings": { "number_of_shards": 4, "number_of_replicas": 0 } }
```

```bash
POST /logs-app-default/_doc
{ "@timestamp": "2026-01-01T00:00:00Z", "message": "started" }
```
