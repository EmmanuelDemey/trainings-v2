# TP 4 — Analyse de texte : solution

Pour le formateur. Non publié : les participants trouvent ces requêtes eux-mêmes.
La CI les rejoue juste après le README du TP, et vérifie chaque « Résultat attendu ».

## Étape 1

```json
POST /_analyze
{ "analyzer": "standard", "text": "L'Hamburger végétarien et ses frites maison" }
```

**Résultat attendu** :

```json
{
  "tokens": [
    { "token": "l'hamburger" }, { "token": "végétarien" }, { "token": "et" },
    { "token": "ses" }, { "token": "frites" }, { "token": "maison" }
  ]
}
```

Non : le terme indexé est `l'hamburger`, élision comprise.

## Étape 2

```json
POST /_analyze
{ "analyzer": "french", "text": "L'Hamburger végétarien et ses frites maison" }
```

**Résultat attendu** :

```json
{
  "tokens": [ { "token": "hamburg" }, { "token": "vegetarien" }, { "token": "frit" }, { "token": "maison" } ]
}
```

L'élision et les mots vides (`et`, `ses`) ont disparu, les mots sont réduits à leur
racine. « burger » ne trouve toujours rien : `burger` ≠ `hamburg`. Il faut des
synonymes.

## Étape 3

```json
POST /_analyze
{
  "char_filter": ["html_strip"],
  "tokenizer": "standard",
  "filter": ["lowercase", "asciifolding"],
  "text": "<p>Crème brûlée</p>"
}
```

**Résultat attendu** :

```json
{ "tokens": [ { "token": "creme" }, { "token": "brulee" } ] }
```

## Étape 4

```json
PUT /dishes
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "analysis": {
      "filter": {
        "fr_elision":  { "type": "elision", "articles_case": true, "articles": ["l", "d", "c", "j", "qu", "s"] },
        "fr_stop":     { "type": "stop", "stopwords": "_french_" },
        "fr_synonyms": { "type": "synonym", "synonyms": ["burger, hamburger", "frites, pommes frites"] }
      },
      "analyzer": {
        "dish_fr": {
          "type": "custom",
          "char_filter": ["html_strip"],
          "tokenizer": "standard",
          "filter": ["fr_elision", "lowercase", "fr_stop", "fr_synonyms", "asciifolding"]
        }
      }
    }
  },
  "mappings": { "properties": { "dish": { "type": "text", "analyzer": "dish_fr" } } }
}

POST /dishes/_analyze
{ "analyzer": "dish_fr", "text": "<b>L'Hamburger</b> végétarien et ses frites" }
```

**Résultat attendu** :

```json
{
  "tokens": [
    { "token": "hamburger" }, { "token": "burger", "type": "SYNONYM" },
    { "token": "vegetarien" }, { "token": "frites" }, { "token": "pommes", "type": "SYNONYM" }
  ]
}
```

## Étape 5

```json
POST /dishes/_bulk?refresh=true
{ "index": { "_id": "1" } }
{ "dish": "<p>L'Hamburger végétarien et ses frites</p>" }
{ "index": { "_id": "2" } }
{ "dish": "<p>Crème brûlée à la vanille</p>" }
{ "index": { "_id": "3" } }
{ "dish": "<p>Burger de bœuf, pommes frites</p>" }

GET /dishes/_search
{ "query": { "match": { "dish": "burger" } }, "_source": false }
```

**Résultat attendu** :

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "1" }, { "_id": "3" } ]
  }
}
```

```json
GET /dishes/_search
{ "query": { "match": { "dish": "creme brulee" } }, "_source": false }
```

**Résultat attendu** :

```json
{ "hits": { "total": { "value": 1 }, "hits": [ { "_id": "2" } ] } }
```

Un synonyme accentué `crème, flan` fonctionne : quand `synonym` s'exécute, le
texte a encore ses accents (`asciifolding` vient après). Le piège est l'inverse :
un synonyme écrit **sans** accent (`creme, flan`) ne correspond jamais. Règle :
écrire les synonymes tels que le texte est **à cet endroit** de la chaîne.
