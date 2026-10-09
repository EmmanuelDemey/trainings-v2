# Fixture of the chapter « Schema »: movies_v1, behind the alias movies, to reindex

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
