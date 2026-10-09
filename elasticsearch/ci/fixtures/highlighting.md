# Highlighting — the movies and articles of the examples (`description` stores term vectors for the fvh highlighter)

```bash
PUT /movies
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "description": { "type": "text", "term_vector": "with_positions_offsets" }
    }
  }
}

POST /movies/_bulk
{ "index": {} }
{ "title": "Titanic", "description": "A romance and a tragic adventure on the ocean" }
{ "index": {} }
{ "title": "Star Wars", "description": "An adventure in a galaxy far away, among space battles" }
{ "index": {} }
{ "title": "Escape from New York", "description": "An adventure in New York" }

POST /articles/_doc
{ "content": "Elasticsearch highlights the terms that matched the query" }
```
