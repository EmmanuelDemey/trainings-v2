# The `films` (nested) and `forum` (join) indices the examples of the relationships chapter query

```bash
PUT /films
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "year": { "type": "integer" },
      "actors": {
        "type": "nested",
        "properties": {
          "firstName": { "type": "keyword" },
          "lastName": { "type": "keyword" },
          "role": { "type": "text" },
          "age": { "type": "integer" }
        }
      }
    }
  }
}

POST /films/_bulk?refresh=true
{"index":{"_id":"1"}}
{"title":"Heat","year":1995,"actors":[{"firstName":"Al","lastName":"Pacino","role":"Vincent Hanna, a detective","age":55},{"firstName":"Robert","lastName":"De Niro","role":"Neil McCauley, a thief","age":52}]}
{"index":{"_id":"2"}}
{"title":"The Irishman","year":2019,"actors":[{"firstName":"Robert","lastName":"De Niro","role":"Frank Sheeran, a hitman","age":76},{"firstName":"Al","lastName":"Pacino","role":"Jimmy Hoffa, a union leader","age":79},{"firstName":"Joe","lastName":"Pesci","role":"Russell Bufalino","age":76}]}
{"index":{"_id":"3"}}
{"title":"Casino","year":1995,"actors":[{"firstName":"Robert","lastName":"De Niro","role":"Sam Rothstein","age":52},{"firstName":"Joe","lastName":"Pesci","role":"Nicky Santoro","age":52}]}
```
