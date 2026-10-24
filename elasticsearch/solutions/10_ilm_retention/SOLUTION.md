# Workshop 10 — ILM and data retention: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Step 1

`elasticsearch.yml` of each node:

```yaml
# HOT node
node.name: hot-node-1
node.roles: [ data_hot, data_content ]

# WARM node
node.name: warm-node-1
node.roles: [ data_warm ]

# COLD node
node.name: cold-node-1
node.roles: [ data_cold ]
```

Restart the nodes, then:

<!-- ci: skip -->
```json
GET /_cat/nodes?v&h=name,node.role
```

```text
name         node.role
hot-node-1   hs
warm-node-1  w
cold-node-1  c
```

`h` data_hot, `s` data_content, `w` data_warm, `c` data_cold (`?help` on
`_cat/nodes` gives the whole list).

## Step 2

```json
PUT /_ilm/policy/logs-policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_primary_shard_size": "50gb",
            "max_age": "1d"
          },
          "set_priority": { "priority": 100 }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": { "number_of_shards": 1 },
          "forcemerge": { "max_num_segments": 1 },
          "set_priority": { "priority": 50 }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "searchable_snapshot": { "snapshot_repository": "my-repository" },
          "set_priority": { "priority": 0 }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

**Expected result**:

```json
{ "acknowledged": true }
```

No `allocate` action needed: ILM runs a **`migrate`** action by itself in the
warm and cold phases, which moves the shards to the `data_warm` then `data_cold`
tier. It does not show in `GET /_ilm/policy`, but in `GET <index>/_ilm/explain`
once the index reaches that phase.

`max_primary_shard_size` keeps the size of each shard under control (10–50 GB),
whatever the number of shards; `max_size` is the size of all the primaries of
the index together.

## Step 3

```json
PUT /_index_template/app-logs-template
{
  "index_patterns": ["app-logs*"],
  "data_stream": {},
  "priority": 500,
  "template": {
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs-policy"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "message": { "type": "text" }
      }
    }
  }
}
```

**Expected result**:

```json
{ "acknowledged": true }
```

Elasticsearch ships a template `logs` on `logs-*-*`, priority 100, used by
Elastic Agent: a template of your own on `logs-*` competes with it. Hence the
name `app-logs`, and an explicit priority.

## Step 4

```json
PUT /_data_stream/app-logs

GET /_data_stream/app-logs
```

**Expected result**:

```json
{
  "data_streams": [
    {
      "name": "app-logs",
      "generation": 1,
      "template": "app-logs-template",
      "ilm_policy": "logs-policy"
    }
  ]
}
```

The old way is refused:

<!-- ci: expect-error -->
```json
PUT /app-logs-000001
{
  "aliases": {
    "app-logs-alias": { "is_write_index": true }
  }
}
```

`cannot create index with name [app-logs-000001], because it matches with template
[app-logs-template] that creates data streams only, use create data stream api instead`

## Step 5

```json
POST /app-logs/_doc
{
  "@timestamp": "2026-10-08T10:00:00Z",
  "message": "Test log entry"
}

POST /app-logs/_rollover
```

**Expected result**:

```json
{
  "acknowledged": true,
  "rolled_over": true
}
```

Two backing indices now; only the newest one gets the writes.

```json
GET /_data_stream/app-logs

GET /_cat/indices/.ds-app-logs-*?v&h=index,health,status,docs.count,store.size
```

## Step 6

```json
PUT /_cluster/settings
{
  "persistent": {
    "indices.lifecycle.poll_interval": "10s"
  }
}
```

**Expected result**:

```json
{ "acknowledged": true }
```

## Step 7

```json
PUT /_ilm/policy/logs-policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": { "max_docs": 100 }
        }
      },
      "warm": {
        "min_age": "1m",
        "actions": {
          "forcemerge": { "max_num_segments": 1 }
        }
      }
    }
  }
}
```

After 1–2 minutes:

```json
GET /app-logs/_ilm/explain
```

The first backing index, already rolled over, moves to `warm`; the second one,
the write index, stays in `hot` until it rolls over itself — `min_age` counts
from the rollover.

## Step 8

```json
PUT /_cluster/settings
{
  "persistent": {
    "indices.lifecycle.poll_interval": null
  }
}
```

## Part 6

1. Shrink once an index gets no more writes (after its rollover): fewer shards
   to search, less overhead per shard. Never on the write index. It needs a
   copy of every shard on one node, and a target count that divides the source
   count.
2. An index whose data lives in the snapshot repository (S3, GCS, Azure Blob…):
   the cold tier keeps one copy, fetched on demand, with no replica — the
   repository is its resilience. Far less disk than a regular index.
3. With the ILM move API, on a backing index named after `GET /_data_stream/app-logs`:

<!-- ci: skip -->
```json
POST /_ilm/move/.ds-app-logs-2026.10.08-000001
{
  "current_step": {
    "phase": "hot",
    "action": "complete",
    "name": "complete"
  },
  "next_step": {
    "phase": "warm"
  }
}
```
