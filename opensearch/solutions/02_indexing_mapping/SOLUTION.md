# TP 2 — Indexation et mapping : solution

Pour le formateur. Non publié : les participants trouvent ces requêtes eux-mêmes.
La CI les rejoue juste après le README du TP, et vérifie chaque « Résultat attendu ».

## Étape 1

```json
PUT /books_guess/_doc/1
{ "title": "Le Petit Prince", "author": "Antoine de Saint-Exupéry", "isbn": "9782070612758", "price": 7.5, "published": "1943-04-06", "pages": 96, "tags": ["conte", "jeunesse"] }

GET /books_guess/_mapping
```

**Résultat attendu** :

```json
{
  "books_guess": {
    "mappings": {
      "properties": {
        "isbn": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
        "pages": { "type": "long" },
        "price": { "type": "float" },
        "published": { "type": "date" }
      }
    }
  }
}
```

`isbn` est indexé deux fois — analysé en `text`, et tel quel en `keyword` — alors
qu'on ne le cherche qu'exactement. `pages` en `long` : 8 octets pour un nombre de
pages. `tags`, `title`, `author` : `text` + `keyword` aussi, à trancher.

## Étape 2

<!-- ci: expect-error -->
```json
PUT /books_guess/_doc/2
{ "title": "Les Misérables", "price": "épuisé" }
```

## Étape 3

```json
PUT /books_v1
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "title":     { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "author":    { "type": "text" },
      "isbn":      { "type": "keyword" },
      "price":     { "type": "float" },
      "published": { "type": "date" },
      "pages":     { "type": "integer" },
      "tags":      { "type": "keyword" }
    }
  }
}
```

**Résultat attendu** :

```json
{ "acknowledged": true, "index": "books_v1" }
```

## Étape 4

```json
POST /books_v1/_bulk?refresh=true
{ "index": { "_id": "1" } }
{ "title": "Le Petit Prince", "author": "Antoine de Saint-Exupéry", "isbn": "9782070612758", "price": 7.5, "published": "1943-04-06", "pages": 96, "tags": ["conte", "jeunesse"] }
{ "index": { "_id": "2" } }
{ "title": "L'Étranger", "author": "Albert Camus", "isbn": "9782070360024", "price": 6.9, "published": "1942-05-19", "pages": 184, "tags": ["roman", "absurde"] }
{ "index": { "_id": "3" } }
{ "title": "Germinal", "author": "Émile Zola", "isbn": "9782253004226", "price": 8.2, "published": "1885-03-01", "pages": 592, "tags": ["roman", "naturalisme"] }

GET /books_v1/_count
```

**Résultat attendu** :

```json
{ "count": 3 }
```

Avec un champ inconnu, `strict_dynamic_mapping_exception` :

<!-- ci: expect-error -->
```json
PUT /books_v1/_doc/4
{ "title": "Nana", "editor": "Charpentier" }
```

## Étape 5

```json
PUT /books_v2
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "title":     { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "author":    { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "isbn":      { "type": "keyword" },
      "price":     { "type": "float" },
      "published": { "type": "date" },
      "pages":     { "type": "integer" },
      "tags":      { "type": "keyword" }
    }
  }
}

POST /_reindex?refresh=true
{ "source": { "index": "books_v1" }, "dest": { "index": "books_v2" } }

POST /_aliases
{ "actions": [ { "add": { "index": "books_v2", "alias": "books" } } ] }

GET /books/_search
{ "query": { "match": { "author": "camus" } } }
```

**Résultat attendu** :

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [ { "_index": "books_v2", "_id": "2" } ]
  }
}
```

Bascule sans trou : `remove` de l'ancien et `add` du nouveau **dans le même**
appel `_aliases` — les actions sont appliquées atomiquement.
