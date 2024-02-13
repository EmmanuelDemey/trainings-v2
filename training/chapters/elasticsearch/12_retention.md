---
layout: cover
---

# Data Retention

---

# Retention

* Several possible stages for your data
    * Available "normally"
    * `closed`
    * `shrinked`
    * `rollover-ed`
    * `snapshop-ed`
    * Deleted
    * On a less heavy configuration
    * On less performing hardware

---

# Deletion

* Complete deletion

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

# Open and Close API

* An index can be open or closed
* Closing an index can improve your cluster's performance
* Data will still be indexed but not searchable

```
POST /twitter/_open
POST /twitter/_close
```

---

# Open and Close API

* It is recommended to disable the ability to close all indexes

```
action.disable_close_all_indices: true
```

---

# Shrink API

* Allows moving an index to a new index with a smaller configuration (fewer shards)
* The index being migrated must be read-only.

```
PUT /movies/_settings
{
  "settings": {
    "index.blocks.write": true
  }
}
```

---

# Shrink API

```
POST /movies/_shrink/shrinked-movies
{
  "settings": {
    "index.number_of_replicas": 1,
    "index.number_of_shards": 1
  }
}
```

---

# DataStream

* Mechanism allowing dynamically generating multiple indexes
* Useful for `time series` data
* Only the latest index will be available for writing
* All indexes will be accessible for reading

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

* Management of this lifecycle can be done
    * manually
    * via scripts (Curator?)
    * via the Index Lifecycle Management API

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

* We can associate an ILM with a template

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
layout: cover
---

# ILM Management from Kibana

---
layout: cover
---

# Practical Part

