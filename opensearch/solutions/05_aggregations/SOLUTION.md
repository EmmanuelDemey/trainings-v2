# TP 5 — Agrégations : solution

Pour le formateur. Non publié : les participants trouvent ces requêtes eux-mêmes.
La CI les rejoue juste après le README du TP, et vérifie chaque « Résultat attendu ».

## Étape 1

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": { "notes": { "stats": { "field": "rating" } } }
}
```

**Résultat attendu** :

```json
{ "aggregations": { "notes": { "count": 12 } } }
```

`rating` est un `float` (simple précision) : 4.2 n'y est pas représentable
exactement, l'agrégation calcule en `double` sur ces valeurs approchées.

## Étape 2

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": { "cuisines": { "cardinality": { "field": "cuisine" } } }
}
```

**Résultat attendu** :

```json
{ "aggregations": { "cuisines": { "value": 8 } } }
```

## Étape 3

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "par_ville": {
      "terms": { "field": "city" },
      "aggs": { "prix_moyen": { "avg": { "field": "price" } } }
    }
  }
}
```

**Résultat attendu** :

```json
{
  "aggregations": {
    "par_ville": {
      "buckets": [
        { "key": "Paris", "doc_count": 5, "prix_moyen": { "value": 45.2 } },
        { "key": "Lyon", "doc_count": 4, "prix_moyen": { "value": 21.75 } },
        { "key": "Marseille", "doc_count": 3, "prix_moyen": { "value": 31.666666666666668 } }
      ]
    }
  }
}
```

La moyenne de Paris est tirée par L'Étoile du Nord (125 €) : la médiane
(`percentiles`, 50) est bien plus basse.

```json
GET /restaurants/_search
{
  "size": 0,
  "query": { "term": { "city": "Paris" } },
  "aggs": { "prix": { "percentiles": { "field": "price", "percents": [50] } } }
}
```

## Étape 4

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "par_cuisine": {
      "terms": { "field": "cuisine", "order": { "note_moyenne": "desc" } },
      "aggs": { "note_moyenne": { "avg": { "field": "rating" } } }
    }
  }
}
```

**Résultat attendu** :

```json
{
  "aggregations": {
    "par_cuisine": {
      "buckets": [
        { "key": "gastronomique" },
        { "key": "fruits de mer" }
      ]
    }
  }
}
```

## Étape 5

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "gammes": {
      "range": {
        "field": "price",
        "ranges": [
          { "key": "petit budget", "to": 20 },
          { "key": "moyen", "from": 20, "to": 50 },
          { "key": "haut de gamme", "from": 50 }
        ]
      }
    }
  }
}
```

**Résultat attendu** :

```json
{
  "aggregations": {
    "gammes": {
      "buckets": [
        { "key": "petit budget", "doc_count": 4 },
        { "key": "moyen", "doc_count": 6 },
        { "key": "haut de gamme", "doc_count": 2 }
      ]
    }
  }
}
```

## Étape 6

```json
GET /restaurants/_search
{
  "size": 0,
  "query": { "term": { "city": "Paris" } },
  "aggs": {
    "ouvertures": {
      "date_histogram": { "field": "opened", "calendar_interval": "year", "format": "yyyy", "min_doc_count": 1 }
    }
  }
}
```

**Résultat attendu** :

```json
{
  "aggregations": {
    "ouvertures": {
      "buckets": [
        { "key_as_string": "2011", "doc_count": 1 },
        { "key_as_string": "2014", "doc_count": 1 },
        { "key_as_string": "2018", "doc_count": 1 },
        { "key_as_string": "2020", "doc_count": 1 },
        { "key_as_string": "2021", "doc_count": 1 }
      ]
    }
  }
}
```

## Étape 7

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "par_ville": {
      "terms": { "field": "city" },
      "aggs": { "prix_moyen": { "avg": { "field": "price" } } }
    },
    "ville_la_plus_chere": {
      "max_bucket": { "buckets_path": "par_ville>prix_moyen" }
    }
  }
}
```

**Résultat attendu** :

```json
{ "aggregations": { "ville_la_plus_chere": { "keys": ["Paris"], "value": 45.2 } } }
```
