---
layout: cover
---

# Data Retention

---

# Retention

- Several possible stages for your data
  - Available "normally"
  - `closed`
  - shrunk (`_shrink`)
  - rolled over (`_rollover`)
  - snapshotted
  - Deleted
  - On a less heavy configuration
  - On less performing hardware

---

# Deletion

- Complete deletion

```json
DELETE /movies-2023
```

---

# Partial Deletion

```json
POST /movies/_delete_by_query
{
  "query": {
    "match": {
      "title": "titanic"
    }
  }
}
```

---


# Open and Close APIs

- Elasticsearch provides a rich set of RESTful APIs for managing your indices, data, and configurations.
- Two important actions you can perform on your indices are "Opening" and "Closing" them.
- **Open API** is used to open a closed index, making it available for search and indexing operations.
- **Close API** is used to close an index, which prevents it from being searched or indexed but still allows for management operations.

---

# Closing an Index in Elasticsearch

- Closing an index temporarily disables indexing and search operations on that index.
- Useful for reducing resource consumption for indices that are not currently in use.
- Syntax: `POST /<index>/_close`

```json
POST /my_index/_close
```

```json
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "indices": {
    "my_index": {
      "closed": true
    }
  }
}
```

---

# Opening an Index in Elasticsearch

- Opening a closed index makes it available again for search and indexing operations.
- Syntax: `POST /<index>/_open`

```json
POST /my_index/_open
```

```json
{
  "acknowledged": true
}
```

---

# Considerations When Opening and Closing Indices

- **Data Integrity:** Closing and opening indices do not affect the data stored within the index.
- **Performance:** Closing indices can free up resources, improving the cluster's overall performance.
- **Limitations:** Not all operations are allowed on closed indices, e.g., you cannot index documents into a closed index.

- A closed index cannot be searched at all, and is not snapshotted by default: closing is no longer the way to archive.
- For historical data rarely searched, prefer the **cold** and **frozen** tiers (searchable snapshots, below): the data stays searchable at a fraction of the cost.
- Keep `_close` for a few operations that require it (changing some static settings, such as analyzers).

---

# Introduction to Elasticsearch Shrink API

- The Shrink API allows you to reduce the number of primary shards of an existing index.
- Useful for optimizing storage and improving performance for indices with fewer documents.
- Prerequisites: Index must be read-only, a copy of every shard on the same node, and the number of primary shards in the target index must be a factor of the number in the source index.

---

# Preparing an Index for Shrinking

- Before using the Shrink API, ensure the index is read-only by updating its settings.
- Syntax: `PUT /<index>/_settings`

```json
PUT /my_index/_settings
{
  "settings": {
    "index.blocks.write": true
  }
}
```

```json
{
  "acknowledged": true
}
```

- After making the index read-only, you can proceed with the shrink operation.

---

# Using the Shrink API

- To shrink an index, use the Shrink API and specify the target index name and settings.
- Syntax: `POST /<source_index>/_shrink/<target_index>`

```json
POST /my_index/_shrink/my_index_shrunk
{
  "settings": {
    "index.number_of_replicas": 1,
    "index.number_of_shards": 2,
    "index.codec": "best_compression"
  },
  "aliases": {
    "my_search_indices": {}
  }
}
```

* `index.number_of_shards`: the target number of primary shards; `index.codec`: optional, for better compression

```json
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "index": "my_index_shrunk"
}
```

---

# Post-Shrink Operations

- Once the index is shrunk, you may want to make it writable again by updating its settings.
- Syntax: `PUT /<shrunk_index>/_settings`

```json
PUT /my_index_shrunk/_settings
{
  "settings": {
    "index.blocks.write": false
  }
}
```

```json
{
  "acknowledged": true
}
```

---

# Data Streams

- Mechanism allowing dynamically generating multiple indices
- Useful for `time series` data
- Only the latest index will be available for writing
- All indices will be accessible for reading

---

# Data Streams

![](/images/data-streams-diagram.svg)

---

# Data Streams

![](/images/data-streams-search-request.svg)

---

# Data Streams

![](/images/data-streams-index-request.svg)

---

# ILM

- Management of this lifecycle can be done
  - manually
  - via the Index Lifecycle Management API (ILM)
  - via the **data stream lifecycle**: a simple retention (`"lifecycle": { "data_retention": "30d" }`), managed by Elasticsearch itself
- Curator, the old external scripting tool, is deprecated

---

# ILM

```json
PUT _ilm/policy/my_policy
{
  "policy": {
    "_meta": {
      "description": "used for nginx log"
    },
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_primary_shard_size": "50gb",
            "max_age": "1d"
          }
        }
      },
      "warm": {
        "min_age": "10d",
        "actions": {
          "allocate" : {
            "number_of_replicas" : 2
          }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

---

# ILM

- `rollover`, in the hot phase: a new backing index as soon as one condition is met (size of the largest primary shard, age, number of documents)
- `min_age` of the next phases is counted from the rollover
- Without rollover, the indices of a data stream would grow forever

---

# Data Tiers and Searchable Snapshots

| Tier | Hardware | Data |
|------|----------|------|
| **hot** | Fast SSD | Written and searched often |
| **warm** | Bigger, slower disks | Read-only, still searched |
| **cold** | Searchable snapshot, fully mounted | Rarely searched, no replica (the snapshot is the copy) |
| **frozen** | Searchable snapshot, partially mounted (local cache only) | Kept for months / years, slow searches |

<!-- ci: skip -->
```json
"frozen": {
  "min_age": "90d",
  "actions": {
    "searchable_snapshot": { "snapshot_repository": "my_repository" }
  }
}
```

* Searchable snapshots need an Enterprise license (or the trial) and a snapshot repository.

---

# ILM or Data Stream Lifecycle?

| | ILM | Data stream lifecycle |
|---|---|---|
| Scope | Any index, data stream | Data streams only |
| Configuration | Policy with phases | `"lifecycle": { "data_retention": "30d" }` in the template or on the data stream |
| Rollover | Conditions you choose | Automatic, managed by Elasticsearch |
| Tiers (warm, cold, frozen) | Yes | No |
| Shrink, force merge, searchable snapshot | Yes | Force merge and downsampling only |

* Data stream lifecycle: logs or metrics that only need a retention. ILM: as soon as the data moves between tiers.

```json
PUT /_data_stream/logs-app-default/_lifecycle
{
  "data_retention": "30d"
}
```

---

# ILM

- We can associate an ILM with a template

```json
PUT _index_template/timeseries_template
{
  "index_patterns": ["timeseries-*"],
  "data_stream": { },
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "index.lifecycle.name": "my_policy"
    }
  }
}
```

---
layout: cover
---

# ILM Management from Kibana


---
layout: cover
---

# Hands-on

## Workshop 9 - ILM and data retention
