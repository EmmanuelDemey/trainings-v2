# Aggregations — the indices of the examples: person, notes, sales, logs, movies, museums

```bash
PUT /person
{
  "mappings": { "properties": { "name": { "type": "keyword" }, "city": { "type": "keyword" }, "age": { "type": "integer" } } }
}

POST /person/_bulk
{ "index": {} }
{ "name": "Alice", "city": "Lille", "age": 34 }
{ "index": {} }
{ "name": "Bob", "city": "Paris", "age": 41 }

POST /notes/_bulk
{ "index": {} }
{ "grade": 50 }
{ "index": {} }
{ "grade": 100 }

PUT /sales
{
  "mappings": { "properties": { "date": { "type": "date" }, "price": { "type": "double" } } }
}

POST /sales/_bulk
{ "index": {} }
{ "date": "2015-01-01", "price": 200 }
{ "index": {} }
{ "date": "2015-01-15", "price": 350 }
{ "index": {} }
{ "date": "2015-02-10", "price": 60 }
{ "index": {} }
{ "date": "2015-03-05", "price": 375 }

POST /logs/_bulk
{ "index": {} }
{ "body": "error: disk full" }
{ "index": {} }
{ "body": "warning: high heap" }

PUT /movies
{
  "mappings": { "properties": { "title": { "type": "text" }, "genre": { "type": "keyword" }, "year": { "type": "integer" } } }
}

POST /movies/_bulk
{ "index": {} }
{ "title": "Alien", "genre": "science fiction", "year": 1979 }
{ "index": {} }
{ "title": "The Shining", "genre": "horror", "year": 1980 }

PUT /museums
{
  "mappings": { "properties": { "name": { "type": "text" }, "location": { "type": "geo_point" } } }
}

POST /museums/_bulk
{ "index": {} }
{ "name": "Rijksmuseum", "location": "52.360, 4.885" }
{ "index": {} }
{ "name": "Louvre", "location": "48.861, 2.336" }
```
