# TP 7 — Ingest pipelines : solution

Pour le formateur. Non publié : les participants trouvent ces requêtes eux-mêmes.
La CI les rejoue juste après le README du TP, et vérifie chaque « Résultat attendu ».

## Étape 1

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      { "csv": { "field": "message", "target_fields": ["restaurant_id", "author", "stars", "date", "comment"] } }
    ]
  },
  "docs": [
    { "_source": { "message": "3,Camille,5,12/10/2026,\"Poisson parfait, service rapide\"" } }
  ]
}
```

**Résultat attendu** :

```json
{
  "docs": [
    {
      "doc": {
        "_source": {
          "restaurant_id": "3",
          "author": "Camille",
          "stars": "5",
          "date": "12/10/2026",
          "comment": "Poisson parfait, service rapide"
        }
      }
    }
  ]
}
```

Le mapping convertit `"5"` à l'indexation, mais **après** le pipeline : dans le
pipeline, `ctx.stars >= 4` comparerait une chaîne à un nombre et échouerait.

## Étape 2

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      { "csv": { "field": "message", "target_fields": ["restaurant_id", "author", "stars", "date", "comment"] } },
      { "convert": { "field": "stars", "type": "integer" } },
      { "date": { "field": "date", "formats": ["dd/MM/yyyy"], "timezone": "Europe/Paris", "target_field": "@timestamp" } },
      { "remove": { "field": ["message", "date"] } }
    ]
  },
  "docs": [
    { "_source": { "message": "3,Camille,5,12/10/2026,\"Poisson parfait, service rapide\"" } }
  ]
}
```

**Résultat attendu** :

```json
{
  "docs": [
    { "doc": { "_source": { "stars": 5, "@timestamp": "2026-10-12T00:00:00.000+02:00" } } }
  ]
}
```

## Étape 3

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      { "csv": { "field": "message", "target_fields": ["restaurant_id", "author", "stars", "date", "comment"] } },
      { "convert": { "field": "stars", "type": "integer" } },
      { "date": { "field": "date", "formats": ["dd/MM/yyyy"], "timezone": "Europe/Paris", "target_field": "@timestamp" } },
      { "remove": { "field": ["message", "date"] } },
      { "set": { "field": "sentiment", "value": "positive", "if": "ctx.stars >= 4" } },
      { "set": { "field": "sentiment", "value": "negative", "if": "ctx.stars <= 2" } }
    ]
  },
  "docs": [
    { "_source": { "message": "3,Camille,5,12/10/2026,\"Poisson parfait, service rapide\"" } },
    { "_source": { "message": "6,Hugo,2,13/10/2026,Frites froides" } }
  ]
}
```

**Résultat attendu** :

```json
{
  "docs": [
    { "doc": { "_source": { "stars": 5, "sentiment": "positive" } } },
    { "doc": { "_source": { "stars": 2, "sentiment": "negative" } } }
  ]
}
```

## Étape 4

```json
PUT /_ingest/pipeline/reviews
{
  "description": "Structure les avis CSV",
  "processors": [
    { "csv": { "field": "message", "target_fields": ["restaurant_id", "author", "stars", "date", "comment"] } },
    { "convert": { "field": "stars", "type": "integer" } },
    { "date": { "field": "date", "formats": ["dd/MM/yyyy"], "timezone": "Europe/Paris", "target_field": "@timestamp" } },
    { "remove": { "field": ["message", "date"] } },
    { "set": { "field": "sentiment", "value": "positive", "if": "ctx.stars >= 4" } },
    { "set": { "field": "sentiment", "value": "negative", "if": "ctx.stars <= 2" } }
  ],
  "on_failure": [
    { "set": { "field": "error", "value": "{{ _ingest.on_failure_message }}" } }
  ]
}
```

**Résultat attendu** :

```json
{ "acknowledged": true }
```

## Étape 5

```json
PUT /reviews/_settings
{ "index.default_pipeline": "reviews" }

POST /reviews/_bulk?refresh=true
{ "index": { "_id": "1" } }
{ "message": "3,Camille,5,12/10/2026,\"Poisson parfait, service rapide\"" }
{ "index": { "_id": "2" } }
{ "message": "6,Hugo,2,13/10/2026,Frites froides" }
{ "index": { "_id": "3" } }
{ "message": "12,Inès,4,14/10/2026,Menu dégustation mémorable" }
{ "index": { "_id": "4" } }
{ "message": "ligne cassée" }

GET /reviews/_doc/1
```

**Résultat attendu** :

```json
{
  "_id": "1",
  "_source": {
    "restaurant_id": "3",
    "author": "Camille",
    "stars": 5,
    "sentiment": "positive",
    "@timestamp": "2026-10-12T00:00:00.000+02:00"
  }
}
```

```json
GET /reviews/_count
{ "query": { "term": { "sentiment": "positive" } } }
```

**Résultat attendu** :

```json
{ "count": 2 }
```

```json
GET /reviews/_count
{ "query": { "exists": { "field": "error" } } }
```

**Résultat attendu** :

```json
{ "count": 1 }
```
