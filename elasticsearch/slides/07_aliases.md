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