# TP 5 — Recherche: Lucene, Query DSL, Géo et Cross Cluster Search

> Interroger un jeu de données de restaurants avec la syntaxe Lucene puis le Query DSL: recherches plein texte, exactes, géographiques et booléennes, tri et pagination, et enfin une recherche à travers plusieurs clusters.

**Topic**: Recherche - Lucene, Query DSL, Cross Cluster Search

## Contexte

Un guide gastronomique en ligne veut proposer à ses lecteurs une recherche riche: par mots-clés, par ville, par note, autour de leur position. Vous allez écrire les requêtes du moteur de recherche de ce guide.

## Setup

Ce TP est autonome. Créez l'index et chargez les données:

```bash
DELETE /restaurants
PUT /restaurants
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "name":        { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "description": { "type": "text", "analyzer": "french" },
      "city":        { "type": "keyword" },
      "cuisine":     { "type": "keyword" },
      "price":       { "type": "integer" },
      "rating":      { "type": "float" },
      "opened":      { "type": "date" },
      "location":    { "type": "geo_point" }
    }
  }
}

POST /restaurants/_bulk?refresh=true
{"index":{"_id":"1"}}
{"name":"Le Bouchon Lyonnais","description":"Cuisine lyonnaise traditionnelle, quenelles et saucisson brioché","city":"Lyon","cuisine":"française","price":35,"rating":4.5,"opened":"2012-03-01","location":{"lat":45.7640,"lon":4.8357}}
{"index":{"_id":"2"}}
{"name":"Sakura","description":"Sushis et ramen préparés par un chef japonais","city":"Paris","cuisine":"japonaise","price":28,"rating":4.2,"opened":"2018-06-15","location":{"lat":48.8686,"lon":2.3330}}
{"index":{"_id":"3"}}
{"name":"La Trattoria","description":"Pizzas cuites au feu de bois et pâtes fraîches maison","city":"Paris","cuisine":"italienne","price":22,"rating":3.9,"opened":"2015-09-10","location":{"lat":48.8530,"lon":2.3499}}
{"index":{"_id":"4"}}
{"name":"Chez Paul","description":"Bistrot parisien, cuisine française de saison","city":"Paris","cuisine":"française","price":40,"rating":4.7,"opened":"2005-01-20","location":{"lat":48.8530,"lon":2.3700}}
{"index":{"_id":"5"}}
{"name":"Le Vieux Port","description":"Poissons frais et bouillabaisse face à la mer","city":"Marseille","cuisine":"française","price":55,"rating":4.4,"opened":"2010-05-05","location":{"lat":43.2951,"lon":5.3740}}
{"index":{"_id":"6"}}
{"name":"Pizza Napoli","description":"Pizza napolitaine authentique, pâte levée 48 heures","city":"Lyon","cuisine":"italienne","price":18,"rating":4.1,"opened":"2020-11-02","location":{"lat":45.7578,"lon":4.8320}}
{"index":{"_id":"7"}}
{"name":"Le Comptoir du Marché","description":"Cuisine du marché, produits frais et locaux","city":"Lille","cuisine":"française","price":30,"rating":4.0,"opened":"2016-02-14","location":{"lat":50.6372,"lon":3.0633}}
{"index":{"_id":"8"}}
{"name":"Ramen Ya","description":"Ramen au bouillon de porc mijoté douze heures","city":"Paris","cuisine":"japonaise","price":16,"rating":4.3,"opened":"2021-04-01","location":{"lat":48.8662,"lon":2.3360}}
```

## Partie A: La syntaxe Lucene

La syntaxe Lucene tient dans le paramètre `q` de l'URL — pratique pour une recherche rapide, ou derrière la barre de recherche de Kibana.

### Étape 1: Un mot, dans tous les champs

```bash
GET /restaurants/_search?q=pizza
```

**Résultat attendu**:
```json
{
  "hits": { "total": { "value": 2 } }
}
```

### Étape 2: Un champ précis, des opérateurs

Les restaurants français de Paris:

```bash
GET /restaurants/_search?q=cuisine:française AND city:Paris
```

**Résultat attendu**:
```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [ { "_id": "4" } ]
  }
}
```

### Étape 3: Un intervalle

Les restaurants à 20 € ou moins:

```bash
GET /restaurants/_search?q=price:[* TO 20]
```

**Résultat attendu**:
```json
{
  "hits": { "total": { "value": 2 } }
}
```

**Question**: Pourquoi cette syntaxe est-elle déconseillée derrière un champ de recherche exposé aux utilisateurs ? (Essayez `q=price:[* TO`)

## Partie B: Le Query DSL — recherches plein texte

### Étape 1: `match`

`description` est analysé avec l'analyzer `french`: « pizzas » et « pizza » donnent le même terme.

```bash
GET /restaurants/_search
{
  "query": {
    "match": { "description": "pizza" }
  }
}
```

**Résultat attendu**:
```json
{
  "hits": { "total": { "value": 2 } }
}
```

### Étape 2: `match` avec `operator`

Par défaut, `match` est un **OU** entre les mots. Exigez-les tous:

```bash
GET /restaurants/_search
{
  "query": {
    "match": {
      "description": { "query": "ramen bouillon", "operator": "and" }
    }
  }
}
```

**Résultat attendu**:
```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [ { "_id": "8" } ]
  }
}
```

### Étape 3: `match_phrase`

Les mots dans cet ordre, côte à côte:

```bash
GET /restaurants/_search
{
  "query": {
    "match_phrase": { "description": "produits frais" }
  }
}
```

**Résultat attendu**:
```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [ { "_id": "7" } ]
  }
}
```

### Étape 4: `multi_match` et boost

Cherchez « port » dans le nom et la description, le nom comptant trois fois plus:

```bash
GET /restaurants/_search
{
  "query": {
    "multi_match": {
      "query": "port",
      "fields": ["name^3", "description"]
    }
  }
}
```

**Résultat attendu**:
```json
{
  "hits": {
    "hits": [ { "_id": "5" } ]
  }
}
```

### Étape 5: Tolérer les fautes de frappe

```bash
GET /restaurants/_search
{
  "query": {
    "match": {
      "description": { "query": "sushsi", "fuzziness": "AUTO" }
    }
  }
}
```

**Résultat attendu**:
```json
{
  "hits": {
    "hits": [ { "_id": "2" } ]
  }
}
```

## Partie C: Recherches exactes

### Étape 1: `term` sur un `keyword`

```bash
GET /restaurants/_search
{
  "query": {
    "term": { "cuisine": "japonaise" }
  }
}
```

**Résultat attendu**:
```json
{
  "hits": { "total": { "value": 2 } }
}
```

**Question**: Que renvoie `{"term": {"description": "Pizzas"}}` ? Pourquoi ?

### Étape 2: `terms`

```bash
GET /restaurants/_search
{
  "query": {
    "terms": { "city": ["Lyon", "Marseille"] }
  }
}
```

**Résultat attendu**:
```json
{
  "hits": { "total": { "value": 3 } }
}
```

### Étape 3: `range` sur une date

```bash
GET /restaurants/_search
{
  "query": {
    "range": { "opened": { "gte": "2018-01-01" } }
  }
}
```

**Résultat attendu**:
```json
{
  "hits": { "total": { "value": 3 } }
}
```

## Partie D: Recherches géographiques

### Étape 1: `geo_distance`

Les restaurants à moins de 2 km de l'Opéra Garnier (48.8719, 2.3316):

```bash
GET /restaurants/_search
{
  "query": {
    "geo_distance": {
      "distance": "2km",
      "location": { "lat": 48.8719, "lon": 2.3316 }
    }
  }
}
```

**Résultat attendu**:
```json
{
  "hits": { "total": { "value": 2 } }
}
```

### Étape 2: Trier par distance

```bash
GET /restaurants/_search
{
  "query": { "term": { "city": "Paris" } },
  "sort": [
    {
      "_geo_distance": {
        "location": { "lat": 48.8719, "lon": 2.3316 },
        "order": "asc",
        "unit": "km"
      }
    }
  ]
}
```

**Résultat attendu**:
```json
{
  "hits": {
    "hits": [
      { "_id": "2" },
      { "_id": "8" },
      { "_id": "3" },
      { "_id": "4" }
    ]
  }
}
```

### Étape 3: `geo_bounding_box`

Tous les restaurants dans un rectangle couvrant le sud-est de la France:

```bash
GET /restaurants/_search
{
  "query": {
    "geo_bounding_box": {
      "location": {
        "top_left":     { "lat": 46.5, "lon": 3.5 },
        "bottom_right": { "lat": 43.0, "lon": 7.5 }
      }
    }
  }
}
```

**Résultat attendu**:
```json
{
  "hits": { "total": { "value": 3 } }
}
```

## Partie E: Recherches booléennes

### Étape 1: Combiner `must`, `filter`, `should` et `must_not`

Le lecteur cherche « cuisine » à Paris ou Lyon, pas plus de 40 €, de préférence bien noté, mais pas d'italien:

```bash
GET /restaurants/_search
{
  "query": {
    "bool": {
      "must":     [ { "match": { "description": "cuisine" } } ],
      "filter":   [
        { "terms": { "city": ["Paris", "Lyon"] } },
        { "range": { "price": { "lte": 40 } } }
      ],
      "should":   [ { "range": { "rating": { "gte": 4.5 } } } ],
      "must_not": [ { "term": { "cuisine": "italienne" } } ]
    }
  }
}
```

**Résultat attendu**:
```json
{
  "hits": {
    "total": { "value": 2 }
  }
}
```

**Questions**:
- Quels sont les deux restaurants trouvés ? Retirez le `should`: l'ordre change-t-il ? Le nombre ?
- Pourquoi mettre les critères de ville et de prix dans `filter` plutôt que dans `must` ?

### Étape 2: Trier, paginer, choisir les champs

```bash
GET /restaurants/_search
{
  "query": { "match_all": {} },
  "sort": [ { "rating": "desc" } ],
  "from": 0,
  "size": 3,
  "_source": ["name", "rating"]
}
```

**Résultat attendu**:
```json
{
  "hits": {
    "hits": [
      { "_id": "4", "_source": { "name": "Chez Paul", "rating": 4.7 } },
      { "_id": "1", "_source": { "name": "Le Bouchon Lyonnais", "rating": 4.5 } },
      { "_id": "5", "_source": { "name": "Le Vieux Port", "rating": 4.4 } }
    ]
  }
}
```

## Partie F: Cross Cluster Search

Cross Cluster Search interroge, en une requête, des index répartis sur plusieurs clusters. Pour s'exercer avec un seul cluster, déclarez-le comme son **propre** cluster distant, sous l'alias `guide`.

### Étape 1: Déclarer le cluster distant

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.remote.guide.seeds": ["127.0.0.1:9300"]
  }
}
```

<!-- ci: retry -->
```bash
GET /_remote/info
```

**Résultat attendu**:
```json
{
  "guide": {
    "connected": true,
    "mode": "sniff"
  }
}
```

### Étape 2: Chercher sur le cluster distant

Préfixez le nom de l'index par l'alias du cluster:

```bash
GET /guide:restaurants/_search
{
  "query": { "term": { "city": "Lille" } }
}
```

**Résultat attendu**:
```json
{
  "_clusters": { "total": 1, "successful": 1 },
  "hits": {
    "hits": [ { "_index": "guide:restaurants", "_id": "7" } ]
  }
}
```

### Étape 3: Chercher sur le cluster local et le distant à la fois

```bash
GET /restaurants,guide:restaurants/_search
{
  "query": { "term": { "city": "Lille" } }
}
```

**Résultat attendu**:
```json
{
  "_clusters": { "total": 2, "successful": 2 },
  "hits": { "total": { "value": 2 } }
}
```

**Question**: Que se passe-t-il si le cluster distant ne répond plus ? Cherchez le paramètre `skip_unavailable`.

### Étape 4: Nettoyer

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.remote.guide.seeds": null
  }
}
```

## Critères de Succès

- Vous savez traduire une recherche Lucene (`q=`) en Query DSL
- Vous distinguez requêtes plein texte (`match`…) et exactes (`term`, `range`…)
- La recherche booléenne de la partie E renvoie Chez Paul et Le Bouchon Lyonnais
- `GET /restaurants,guide:restaurants/_search` interroge deux clusters

## Dépannage

**Problème**: `term` ne trouve rien sur un champ `text`
→ Le texte indexé a été analysé (minuscules, racines…). Utilisez `match`, ou le sous-champ `keyword`.

**Problème**: `_remote/info` montre `"connected": false`
→ Le port de transport n'est pas `9300`, ou n'écoute pas sur `127.0.0.1`: vérifiez `GET /_nodes/_local/transport?filter_path=**.publish_address`.

**Problème**: `geo_distance` ne renvoie rien
→ Le champ doit être mappé en `geo_point` **avant** l'indexation: un couple `lat`/`lon` mappé dynamiquement devient deux `float`.
