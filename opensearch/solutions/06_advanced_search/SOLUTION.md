# TP 6 — Recherche avancée : solution

Pour le formateur. Non publié : les participants trouvent ces requêtes eux-mêmes.
La CI les rejoue juste après le README du TP, et vérifie chaque « Résultat attendu ».

## Étape 1

```json
GET /restaurants/_search
{
  "size": 4,
  "sort": [ { "price": "asc" }, { "name.keyword": "asc" } ],
  "_source": ["name", "price"]
}
```

Le dernier hit porte `"sort": [18, "Pizzeria Napoli"]`.

```json
GET /restaurants/_search
{
  "size": 4,
  "sort": [ { "price": "asc" }, { "name.keyword": "asc" } ],
  "search_after": [18, "Pizzeria Napoli"],
  "_source": ["name", "price"]
}
```

**Résultat attendu** :

```json
{
  "hits": {
    "hits": [
      { "_id": "10", "sort": [20, "Taj Mahal"] },
      { "_id": "4", "sort": [22, "La Trattoria"] },
      { "_id": "9", "sort": [25, "La Cantine Provençale"] },
      { "_id": "7", "sort": [28, "Chez Mamie"] }
    ]
  }
}
```

Sans second critère, deux restaurants au même prix n'ont pas d'ordre garanti :
`search_after` en sauterait ou en répéterait un. Le second critère doit être unique.

## Étape 2

```json
GET /restaurants/_search
{
  "query": { "match": { "description": "grillés" } },
  "highlight": {
    "pre_tags": ["<em>"],
    "post_tags": ["</em>"],
    "fields": { "description": {} }
  },
  "_source": false
}
```

**Résultat attendu** :

```json
{
  "hits": {
    "hits": [
      { "_id": "8", "highlight": { "description": ["Ramen au bouillon tonkotsu et gyozas <em>grillés</em>."] } },
      { "_id": "5", "highlight": { "description": ["Bouillabaisse, poissons <em>grillés</em> et plateau de fruits de mer face au port."] } }
    ]
  }
}
```

## Étape 3

```json
PUT /restaurant_names
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": { "properties": { "suggest": { "type": "completion" } } }
}

POST /restaurant_names/_bulk?refresh=true
{ "index": { "_id": "1" } }
{ "suggest": "Le Bouchon Lyonnais" }
{ "index": { "_id": "5" } }
{ "suggest": "Le Vieux Port" }
{ "index": { "_id": "4" } }
{ "suggest": "La Trattoria" }

GET /restaurant_names/_search
{
  "suggest": {
    "noms": { "prefix": "le", "completion": { "field": "suggest" } }
  }
}
```

**Résultat attendu** :

```json
{
  "suggest": {
    "noms": [
      { "text": "le", "options": [ { "text": "Le Bouchon Lyonnais" }, { "text": "Le Vieux Port" } ] }
    ]
  }
}
```

## Étape 4

```json
GET /restaurants/_search
{
  "query": {
    "bool": {
      "filter": {
        "geo_distance": { "distance": "5km", "location": { "lat": 48.8584, "lon": 2.2945 } }
      }
    }
  },
  "sort": [
    { "_geo_distance": { "location": { "lat": 48.8584, "lon": 2.2945 }, "order": "asc", "unit": "km" } }
  ],
  "_source": ["name"]
}
```

**Résultat attendu** :

```json
{
  "hits": {
    "total": { "value": 4 },
    "hits": [
      { "_id": "3", "_source": { "name": "Sushi Zen" } },
      { "_id": "6", "_source": { "name": "Burger Factory" } },
      { "_id": "2", "_source": { "name": "Pizzeria Napoli" } },
      { "_id": "7", "_source": { "name": "Chez Mamie" } }
    ]
  }
}
```

La distance est la valeur `sort` de chaque hit, en km.

## Étape 5

```json
PUT /alerts
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "query":   { "type": "percolator" },
      "cuisine": { "type": "keyword" },
      "city":    { "type": "keyword" },
      "price":   { "type": "integer" }
    }
  }
}

PUT /alerts/_doc/japonais-lyon
{ "query": { "bool": { "filter": [ { "term": { "cuisine": "japonaise" } }, { "term": { "city": "Lyon" } } ] } } }

PUT /alerts/_doc/petit-budget?refresh=true
{ "query": { "range": { "price": { "lt": 20 } } } }

GET /alerts/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": { "name": "Udon Lyon", "cuisine": "japonaise", "city": "Lyon", "price": 15 }
    }
  }
}
```

**Résultat attendu** :

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "japonais-lyon" }, { "_id": "petit-budget" } ]
  }
}
```
