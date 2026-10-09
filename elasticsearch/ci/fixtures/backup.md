# Fixture — backup: the two indices the manual snapshot saves and restores

```bash
PUT /index_1
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

PUT /index_2
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}
```
