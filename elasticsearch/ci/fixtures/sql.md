# Fixture — SQL: the `library` index the queries read

```bash
PUT /library
{
  "mappings": {
    "properties": {
      "author": { "type": "text" },
      "name": { "type": "text" },
      "page_count": { "type": "integer" },
      "release_date": { "type": "date" }
    }
  }
}

POST /library/_bulk
{ "index": {} }
{ "author": "Frank Herbert", "name": "Dune", "page_count": 604, "release_date": "1965-06-01" }
{ "index": {} }
{ "author": "Dan Simmons", "name": "Hyperion", "page_count": 482, "release_date": "1989-05-26" }
{ "index": {} }
{ "author": "James S.A. Corey", "name": "Leviathan Wakes", "page_count": 561, "release_date": "2011-06-02" }
```
