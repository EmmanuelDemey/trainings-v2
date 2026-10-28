# TP 3 — Recherche et pertinence : solution

Pour le formateur. Non publié : les participants trouvent ces requêtes eux-mêmes.
La CI les rejoue juste après le README du TP, et vérifie chaque « Résultat attendu ».

## Étape 1

```json
GET /restaurants/_search
{
  "query": { "match": { "description": "poisson frais" } },
  "_source": false
}
```

**Résultat attendu** :

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "3" }, { "_id": "5" } ]
  }
}
```

`description` utilise l'analyseur `french` : « poissons » et « poisson » ont la même
racine.

## Étape 2

```json
GET /restaurants/_search
{
  "query": { "match_phrase": { "description": "pâtes fraîches" } },
  "_source": false
}
```

**Résultat attendu** :

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "4" }, { "_id": "2" } ]
  }
}
```

## Étape 3

Ne trouve rien : l'index contient `sushi` et `zen`, pas `Sushi Zen`.

```json
GET /restaurants/_search
{ "query": { "term": { "name": "Sushi Zen" } } }
```

**Résultat attendu** :

```json
{ "hits": { "total": { "value": 0 } } }
```

```json
GET /restaurants/_search
{
  "query": { "term": { "name.keyword": "Sushi Zen" } },
  "_source": false
}
```

**Résultat attendu** :

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [ { "_id": "3" } ]
  }
}
```

## Étape 4

```json
GET /restaurants/_search
{
  "query": {
    "bool": {
      "must": [ { "match": { "description": "cuisine" } } ],
      "filter": [
        { "terms": { "city": ["Paris", "Lyon"] } },
        { "range": { "price": { "lte": 40 } } }
      ]
    }
  },
  "_source": ["name"]
}
```

**Résultat attendu** :

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [
      { "_id": "1", "_source": { "name": "Le Bouchon Lyonnais" } },
      { "_id": "7", "_source": { "name": "Chez Mamie" } }
    ]
  }
}
```

Même score : « cuisine » apparaît une fois dans chaque description, de longueurs
voisines ; les filtres ne comptent pas.

## Étape 5

```json
GET /restaurants/_search
{
  "query": {
    "multi_match": { "query": "tarte", "fields": ["name^3", "description"] }
  },
  "_source": ["name"]
}
```

**Résultat attendu** :

```json
{ "hits": { "total": { "value": 2 } } }
```

## Étape 6

```json
GET /restaurants/_search
{
  "query": {
    "function_score": {
      "query": { "match": { "description": "cuisine" } },
      "field_value_factor": { "field": "rating" },
      "boost_mode": "multiply"
    }
  },
  "_source": ["name"]
}
```

**Résultat attendu** :

```json
{
  "hits": {
    "total": { "value": 3 },
    "hits": [
      { "_id": "12", "_source": { "name": "L'Étoile du Nord" } }
    ]
  }
}
```

Sans `function_score`, L'Étoile du Nord arrive aussi premier (description la plus
courte) ; l'écart se creuse avec la note 4.9.
