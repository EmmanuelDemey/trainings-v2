# Fixture of the chapter « Reindex and Aliases »: movies_v1 behind the alias movies, to reindex, and two monthly logs indices

```bash
PUT /movies_v1
{
  "aliases": { "movies": {} }
}

POST /movies_v1/_bulk
{ "index": { "_id": "1" } }
{ "title": "Inception", "year": 2010 }
{ "index": { "_id": "2" } }
{ "title": "Titanic", "year": 1997 }
```

```bash
POST /_bulk
{ "index": { "_index": "logs_2024_02" } }
{ "timestamp": "2024-02-15T10:00:00Z", "level": "error", "message": "february" }
{ "index": { "_index": "logs_2024_03" } }
{ "timestamp": "2024-03-15T10:00:00Z", "level": "info", "message": "march" }
```
