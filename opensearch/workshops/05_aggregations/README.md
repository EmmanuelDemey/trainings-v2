# TP 5 — Agrégations

> Répondre aux questions du rédacteur en chef du guide : combien, en moyenne, par ville, par cuisine, par année — sans jamais lire un document.

**Durée** : 30 min · **Chapitre** : 7 — Agrégations

## Contexte

Le guide prépare son édition annuelle. Le rédacteur en chef veut des chiffres : le prix moyen, la répartition par ville, la cuisine la mieux notée, les ouvertures par année. Chaque question est une agrégation.

## Mise en place

Ce TP est autonome. Créez l'index `restaurants` et ses douze documents :

```json
DELETE /restaurants

PUT /restaurants
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "name": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "description": { "type": "text", "analyzer": "french" },
      "cuisine": { "type": "keyword" },
      "city": { "type": "keyword" },
      "location": { "type": "geo_point" },
      "rating": { "type": "float" },
      "price": { "type": "integer" },
      "opened": { "type": "date" }
    }
  }
}

POST /restaurants/_bulk?refresh=true
{ "index": { "_id": "1" } }
{ "name": "Le Bouchon Lyonnais", "description": "Cuisine lyonnaise traditionnelle : quenelles, saucisson brioché et tarte aux pralines.", "cuisine": "française", "city": "Lyon", "location": { "lat": 45.7640, "lon": 4.8357 }, "rating": 4.5, "price": 35, "opened": "2012-03-15" }
{ "index": { "_id": "2" } }
{ "name": "Pizzeria Napoli", "description": "Pizzas cuites au feu de bois et pâtes fraîches maison.", "cuisine": "italienne", "city": "Paris", "location": { "lat": 48.8566, "lon": 2.3522 }, "rating": 4.2, "price": 18, "opened": "2018-06-01" }
{ "index": { "_id": "3" } }
{ "name": "Sushi Zen", "description": "Sushis et sashimis préparés devant vous, poisson frais du jour.", "cuisine": "japonaise", "city": "Paris", "location": { "lat": 48.8606, "lon": 2.3376 }, "rating": 4.7, "price": 40, "opened": "2020-09-10" }
{ "index": { "_id": "4" } }
{ "name": "La Trattoria", "description": "Pâtes fraîches, risotto aux champignons et tiramisu.", "cuisine": "italienne", "city": "Lyon", "location": { "lat": 45.7578, "lon": 4.8320 }, "rating": 3.9, "price": 22, "opened": "2016-11-20" }
{ "index": { "_id": "5" } }
{ "name": "Le Vieux Port", "description": "Bouillabaisse, poissons grillés et plateau de fruits de mer face au port.", "cuisine": "fruits de mer", "city": "Marseille", "location": { "lat": 43.2951, "lon": 5.3740 }, "rating": 4.4, "price": 50, "opened": "2010-05-05" }
{ "index": { "_id": "6" } }
{ "name": "Burger Factory", "description": "Burgers gourmands, frites maison et milkshakes.", "cuisine": "américaine", "city": "Paris", "location": { "lat": 48.8530, "lon": 2.3499 }, "rating": 3.6, "price": 15, "opened": "2021-02-14" }
{ "index": { "_id": "7" } }
{ "name": "Chez Mamie", "description": "Cuisine familiale : blanquette de veau, bœuf bourguignon et tarte tatin.", "cuisine": "française", "city": "Paris", "location": { "lat": 48.8867, "lon": 2.3431 }, "rating": 4.6, "price": 28, "opened": "2014-01-08" }
{ "index": { "_id": "8" } }
{ "name": "Ramen Ya", "description": "Ramen au bouillon tonkotsu et gyozas grillés.", "cuisine": "japonaise", "city": "Lyon", "location": { "lat": 45.7676, "lon": 4.8344 }, "rating": 4.1, "price": 16, "opened": "2022-04-22" }
{ "index": { "_id": "9" } }
{ "name": "La Cantine Provençale", "description": "Spécialités provençales : ratatouille, tapenade et aïoli.", "cuisine": "française", "city": "Marseille", "location": { "lat": 43.2965, "lon": 5.3698 }, "rating": 4.0, "price": 25, "opened": "2019-07-01" }
{ "index": { "_id": "10" } }
{ "name": "Taj Mahal", "description": "Curry, poulet tandoori et naans au fromage.", "cuisine": "indienne", "city": "Marseille", "location": { "lat": 43.2990, "lon": 5.3810 }, "rating": 3.8, "price": 20, "opened": "2017-10-12" }
{ "index": { "_id": "11" } }
{ "name": "Green Bowl", "description": "Bowls végétariens, salades de saison et jus pressés.", "cuisine": "végétarienne", "city": "Lyon", "location": { "lat": 45.7600, "lon": 4.8400 }, "rating": 4.3, "price": 14, "opened": "2023-03-30" }
{ "index": { "_id": "12" } }
{ "name": "L'Étoile du Nord", "description": "Menu dégustation, cuisine gastronomique de saison.", "cuisine": "gastronomique", "city": "Paris", "location": { "lat": 48.8800, "lon": 2.3550 }, "rating": 4.9, "price": 125, "opened": "2011-09-01" }
```

Référence : [Aggregations](https://docs.opensearch.org/latest/aggregations/).

## Exercices

### Étape 1 : Les statistiques des notes

En une seule agrégation, obtenez le nombre, le minimum, le maximum, la moyenne et la somme des notes (`rating`). Aucun document dans la réponse.

<details>
<summary>Indice</summary>

`"size": 0`, et l'agrégation `stats`.

</details>

**Résultat attendu** :

```json
{ "aggregations": { "notes": { "count": 12 } } }
```

**Question** : la moyenne vaut `4.2000…` avec de nombreuses décimales. Pourquoi pas `4.2` tout rond ? (Regardez le type de `rating`.)

### Étape 2 : Combien de cuisines ?

Comptez le nombre de **cuisines différentes**.

<details>
<summary>Indice</summary>

`cardinality`.

</details>

**Résultat attendu** :

```json
{ "aggregations": { "cuisines": { "value": 8 } } }
```

### Étape 3 : Par ville

Le nombre de restaurants par ville, et dans **chaque** ville, le prix moyen.

<details>
<summary>Indice</summary>

`terms` sur `city`, et une sous-agrégation `avg` sur `price`.

</details>

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

**Question** : le prix moyen de Paris dit-il que Paris est cher ? Ajoutez une agrégation `percentiles` pour en juger.

### Étape 4 : Les cuisines, de la mieux notée à la moins bien notée

Les cuisines, triées par **note moyenne décroissante**.

<details>
<summary>Indice</summary>

Le paramètre `order` d'un `terms` accepte le nom d'une sous-agrégation.

</details>

**Résultat attendu** (les premiers buckets) :

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

### Étape 5 : Les gammes de prix

Répartissez les restaurants en trois gammes : moins de 20 €, de 20 à 50 €, 50 € et plus. Nommez-les `petit budget`, `moyen`, `haut de gamme`.

<details>
<summary>Indice</summary>

`range`, avec un `key` par gamme. `to` est exclu, `from` inclus.

</details>

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

### Étape 6 : Les ouvertures par année, à Paris

Le nombre de restaurants **parisiens** ouverts chaque année, les années sans ouverture omises.

<details>
<summary>Indice</summary>

Une `query` pour Paris, et un `date_histogram` avec `calendar_interval`, `format` et `min_doc_count`.

</details>

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

### Étape 7 : La ville la plus chère

Reprenez l'étape 3, et ajoutez une agrégation **pipeline** qui donne la ville au prix moyen le plus élevé.

<details>
<summary>Indice</summary>

`max_bucket`, avec `"buckets_path": "par_ville>prix_moyen"` — au même niveau que `par_ville`.

</details>

**Résultat attendu** :

```json
{ "aggregations": { "ville_la_plus_chere": { "keys": ["Paris"], "value": 45.2 } } }
```

## Critères de réussite

- `size: 0` quand seules les agrégations comptent
- Metrics, buckets et sous-agrégations combinés dans une requête
- Une agrégation restreinte par une `query`
- Une agrégation pipeline lit d'autres agrégations par `buckets_path`

## Pour aller plus loin

- Le restaurant le mieux noté **de chaque ville** : une sous-agrégation `top_hits` (`size: 1`, triée par `rating`).
- Les restaurants à moins de 5 km, 5 à 50 km, plus de 50 km du centre de Lyon (45.7640, 4.8357) : `geo_distance`.
- Le cumul des ouvertures par année : `cumulative_sum` dans le `date_histogram`.

## Dépannage

**Problème** : `Text fields are not optimised for operations that require per-document field data`
→ Vous agrégez sur un `text`. Utilisez un `keyword` (`name.keyword`).

**Problème** : `buckets_path must reference either a number value or a single value numeric metric aggregation`
→ Le chemin pointe sur une agrégation multi-valeurs ou mal nommée : `agg_parent>agg_enfant`.
