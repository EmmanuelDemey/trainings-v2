# Retention and ILM — a daily index to close, a 4-shard index to shrink, the Parkki data stream

```bash
PUT /logs-2025.01.01

PUT /logs-old
{ "settings": { "number_of_shards": 4, "number_of_replicas": 0 } }

PUT /_data_stream/logs-parkki-default
```
