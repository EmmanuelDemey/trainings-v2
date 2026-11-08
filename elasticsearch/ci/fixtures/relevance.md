# Fixture of the chapter « Relevance »: the movies of the examples

```bash
PUT /movies
{
  "mappings": {
    "properties": {
      "title": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "description": { "type": "text" },
      "year": { "type": "integer" },
      "duration": { "type": "integer" },
      "released": { "type": "date" },
      "genre": { "type": "keyword" },
      "rating": { "type": "float" },
      "views": { "type": "integer" },
      "likes": { "type": "integer" },
      "location": { "type": "geo_point" }
    }
  }
}

POST /movies/_bulk
{ "index": { "_id": "1" } }
{ "title": "Titanic", "description": "A ship sinks in the Atlantic Ocean during its maiden voyage", "year": 1997, "duration": 195, "released": "1997-12-19", "genre": "drama", "rating": 7.9, "views": 1000, "likes": 300, "location": { "lat": 41.73, "lon": -49.95 } }
{ "index": { "_id": "2" } }
{ "title": "New York, New York", "description": "A saxophonist and a singer fall in love in the Big Apple", "year": 1977, "duration": 155, "released": "1977-06-21", "genre": "musical", "rating": 6.6, "views": 200, "likes": 50, "location": { "lat": 40.76, "lon": -73.98 } }
{ "index": { "_id": "3" } }
{ "title": "Escape from New York", "description": "An adventure in a New York turned into a prison", "year": 1981, "duration": 99, "released": "1981-07-10", "genre": "action", "rating": 7.1, "views": 400, "likes": 120, "location": { "lat": 40.71, "lon": -74.01 } }
{ "index": { "_id": "4" } }
{ "title": "Star Wars", "description": "An adventure in a galaxy far away, among space battles", "year": 1977, "duration": 121, "released": "1977-05-25", "genre": "science fiction", "rating": 8.6, "views": 2000, "likes": 900, "location": { "lat": 33.99, "lon": 7.83 } }
{ "index": { "_id": "5" } }
{ "title": "Alien", "description": "The crew of a space ship meets a deadly creature", "year": 1979, "duration": 117, "released": "1979-05-25", "genre": "science fiction", "rating": 8.5, "views": 900, "likes": 400, "location": { "lat": 51.69, "lon": -0.42 } }
{ "index": { "_id": "6" } }
{ "title": "Gangs of New York", "description": "Gang wars in the streets of New York in 1862", "year": 2002, "duration": 167, "released": "2002-12-20", "genre": "history", "rating": 7.5, "views": 300, "likes": 80, "location": { "lat": 40.71, "lon": -74.00 } }
{ "index": { "_id": "7" } }
{ "title": "Jaws", "description": "A great white shark attacks the beaches of Amity Island", "year": 1975, "duration": 124, "released": "1975-06-20", "genre": "thriller", "rating": 8.1, "views": 700, "likes": 250, "location": { "lat": 41.39, "lon": -70.51 } }
```
