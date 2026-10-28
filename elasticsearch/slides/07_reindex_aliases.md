---
layout: cover
---

# Reindex and Aliases

---

# Mapping Modification

* If the mapping changes, a complete reindexing of the data is necessary.
* Good practice: the application queries an **alias**, switched to the new index once reindexed (see below).
* Reindexing can be done via a batch system or using the _reindex_ API.
---
# Mapping Modification

<img src="/images/reindex1.png" class="h-96 mx-auto object-contain" />
---
# Mapping Modification

<img src="/images/reindex2.png" class="h-96 mx-auto object-contain" />
---
# Mapping Modification

<img src="/images/reindex3.png" class="h-96 mx-auto object-contain" />
---
# Reindex API

* We can reindex a complete index

```json
POST _reindex
{
  "source": {
    "index": "movies_v1"
  },
  "dest": {
    "index": "movies_v2"
  }
}
```
---
# Reindex API

* Or just a portion by defining a search query

```json
POST _reindex
{
  "source": {
    "index": "movies_v1",
    "query": {
      "term": {
        "year": 2010
      }
    }
  },
  "dest": {
    "index": "movies_v2"
  }
}
```
---
# Reindex API

* We're not limited to indices within the same cluster
* We can reindex data from a remote cluster (listed in `reindex.remote.whitelist`)

<!-- ci: skip -->
```json
POST _reindex
{
  "source": {
    "remote": {
      "host": "http://otherhost:9200"
    },
    "index": "movies_v1",
    "query": {
      "term": {
        "year": 2010
      }
    }
  },
  "dest": {
    "index": "movies_v2"
  }
}
```

---

# Aliases

- Aliases are alternative names for indices.
- They allow for more flexible index management such as switching between indices without affecting the frontend applications.
- Examples of use cases: zero downtime reindexing, A/B testing, etc.
- Example request to create an alias named "logs_current" for an index "logs_2024_02":
    
```json
POST /_aliases
{
    "actions": [
    { "add": { "index": "logs_2024_02", "alias": "logs_current" } }
    ]
}
```

```json
{
    "acknowledged": true
}
```

--- 

# Querying with Aliases

- Example query on the "logs_current" alias:
    
```json
GET /logs_current/_search
{
    "query": { "match_all": {} }
}
```

---

# Modifying Aliases

- We can easily switch an alias from one index to another, facilitating seamless migrations or updates.
- Example request to switch "logs_current" from "logs_2024_02" to "logs_2024_03":

```json
POST /_aliases
{
    "actions": [
    { "remove": { "index": "logs_2024_02", "alias": "logs_current" } },
    { "add": { "index": "logs_2024_03", "alias": "logs_current" } }
    ]
}
```

---

# Alias Filters

- We can use filters with aliases to pre-filter data.
- Example of creating an alias with a filter for logs of a specific level:
    
```json
POST /_aliases
{
    "actions": [
    {
        "add": {
        "index": "logs_2024_02",
        "alias": "logs_error",
        "filter": { "term": { "level": "error" } }
        }
    }
    ]
}
```

---
layout: cover
---

# Presentation of the Documentation

---
layout: cover
---

# Hands-on

## Workshop 3 - Mapping, analyzers, aliases and templates
