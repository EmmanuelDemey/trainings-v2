# Fixture of the chapter « Search »: movies, albums and restaurants, with every field the examples query

```bash
PUT /movies
{
  "mappings": {
    "properties": {
      "title": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "description": { "type": "text" },
      "year": { "type": "integer" },
      "duration": { "type": "integer" },
      "timestamp": { "type": "date" },
      "category": { "type": "keyword" },
      "type": { "type": "keyword" },
      "location": { "type": "geo_point" },
      "views": { "type": "integer" },
      "likes": { "type": "integer" },
      "popularity": { "type": "float" }
    }
  }
}

POST /movies/_bulk
{ "index": { "_id": "1" } }
{ "title": "Titanic", "description": "A ship sinks in the Atlantic", "year": 1997, "duration": 195, "timestamp": "2024-05-01T10:00:00Z", "category": "drama", "type": "movie", "location": { "lat": 41.7, "lon": -49.9 }, "views": 1000, "likes": 300, "popularity": 9.5 }
{ "index": { "_id": "2" } }
{ "title": "New York, New York", "description": "Big apple musical", "year": 1977, "duration": 155, "timestamp": "2024-05-02T10:00:00Z", "category": "history", "type": "movie", "location": { "lat": 40.7, "lon": -74.0 }, "views": 200, "likes": 50, "popularity": 6.1 }

POST /albums/_doc/1
{ "title": "Titanic soundtrack" }

PUT /restaurants
{
  "mappings": { "properties": { "location": { "type": "geo_point" } } }
}

POST /restaurants/_doc/1
{ "name": "Katz's", "location": { "lat": 40.722, "lon": -73.987 } }
```
