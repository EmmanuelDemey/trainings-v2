
# Index Aliases

* An **alias** is a secondary name for one or more indices.
* Aliases allow you to decouple your application from physical index names.

---

# Creating an Alias

```json
POST /_aliases
{
  "actions": [
    { "add": { "index": "movies", "alias": "films" } }
  ]
}
```

* You can now query `films` instead of `movies`:

```json
POST /films/_search
{
  "query": { "match_all": {} }
}
```

---

# Querying with Aliases

* Aliases support all standard search operations.

```json
POST /films/_search
{
  "query": {
    "match": { "title": "Titanic" }
  }
}
```

* An alias pointing to multiple indices searches all of them:

```json
POST /_aliases
{
  "actions": [
    { "add": { "index": "movies-2024", "alias": "all-movies" } },
    { "add": { "index": "movies-2025", "alias": "all-movies" } }
  ]
}
```

---

# Modifying Aliases

* **Add and remove** atomically (zero downtime swap):

```json
POST /_aliases
{
  "actions": [
    { "remove": { "index": "movies-v1", "alias": "movies" } },
    { "add": { "index": "movies-v2", "alias": "movies" } }
  ]
}
```

* This is the standard pattern for **zero-downtime reindexing**.

---

# Filtered Aliases

* Aliases can include a filter to restrict visible documents.

```json
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "movies",
        "alias": "french-movies",
        "filter": {
          "term": { "language": "fr" }
        }
      }
    }
  ]
}
```

* Searching `french-movies` only returns French-language movies.

---

# Listing Aliases

* View all aliases:

```json
GET /_aliases
```

* View aliases for a specific index:

```json
GET /movies/_alias
```

---
