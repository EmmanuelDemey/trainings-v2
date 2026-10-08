---
layout: cover
---

# Data Retention

---

# Retention

- Several possible stages for your data
  - Available "normally"
  - `closed`
  - `shrinked`
  - `rollover-ed`
  - `snapshop-ed`
  - Deleted
  - On a less heavy configuration
  - On less performing hardware

---

# Deletion

- Complete deletion

```
DELETE movies/
```

---

# Partial Deletion

```
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

```http
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

```http
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

- Best Practices & Use Cases
  - **Maintenance:** Close indices during maintenance to improve performance.
  - **Archiving:** Close indices that contain historical data not frequently accessed.
  - **Resource Management:** Close indices to free up resources like memory and reduce the load on the cluster.

---

Bien entendu, voici des slides détaillés sur la Shrink API d'Elasticsearch, avec des exemples de requêtes et leurs réponses HTTP.

---

# Introduction to Elasticsearch Shrink API

- The Shrink API allows you to reduce the number of primary shards of an existing index.
- Useful for optimizing storage and improving performance for indices with fewer documents.
- Prerequisites: Index must be read-only, and the number of primary shards in the target index must be a factor of the number in the source index.

# Preparing an Index for Shrinking

- Before using the Shrink API, ensure the index is read-only by updating its settings.
- Syntax: `PUT /<index>/_settings`

```http
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

```http
POST /my_index/_shrink/my_index_shrinked
{
  "settings": {
    "index.number_of_replicas": 1,
    "index.number_of_shards": 2,  // Target number of primary shards
    "index.codec": "best_compression"  // Optional, for better compression
  },
  "aliases": {
    "my_search_indices": {}
  }
}
```

```json
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "index": "my_index_shrinked"
}
```

---

# Post-Shrink Operations

- Once the index is shrunk, you may want to make it writable again by updating its settings.
- Syntax: `PUT /<shrinked_index>/_settings`

```http
PUT /my_index_shrinked/_settings
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

# DataStream

- Mechanism allowing dynamically generating multiple indexes
- Useful for `time series` data
- Only the latest index will be available for writing
- All indexes will be accessible for reading

---

# DataStream

![](/images/data-streams-diagram.svg)

---

# DataStream

![](/images/data-streams-search-request.svg)

---

# DataStream

![](/images/data-streams-index-request.svg)

---

# ILM

- Management of this lifecycle can be done
  - manually
  - via scripts (Curator?)
  - via the Index Lifecycle Management API

---

# ILM

```
PUT _ilm/policy/my_policy
{
  "policy": {
    "_meta": {
      "description": "used for nginx log"
    },
    "phases": {
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

- We can associate an ILM with a template

```
PUT _index_template/timeseries_template
{
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

## layout: cover

# ILM Management from Kibana

---

## layout: cover

# Practical Part
