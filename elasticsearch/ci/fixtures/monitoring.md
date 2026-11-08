# Fixture — monitoring: the index whose health, unassigned replica and slow logs the examples inspect

On a one-node cluster, its replica stays unassigned: what `_cluster/allocation/explain` explains.

```json
PUT /my-index
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 1 }
}
```
