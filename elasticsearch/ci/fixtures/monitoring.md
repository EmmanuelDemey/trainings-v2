# Fixture — monitoring: the indices whose slow logs and shard allocation the examples inspect

```bash
PUT /my-index
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

PUT /my-index-000001
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

PUT /filebeat-7.9.3-2022.01.07-000015
{
  "settings": { "number_of_shards": 3, "number_of_replicas": 1 }
}
```
