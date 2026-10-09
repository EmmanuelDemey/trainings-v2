# Fixture — operating & troubleshooting: the indices the examples tune, explain and shrink

```bash
PUT /movies
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

PUT /person-v6
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 1 }
}

PUT /my-index
{
  "settings": { "number_of_shards": 2, "number_of_replicas": 0 }
}
```
