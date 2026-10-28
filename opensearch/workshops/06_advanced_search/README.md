# TP 6 — Recherche avancée

> Les fonctions qui font une vraie page de résultats : tri et pagination, surlignage, autocomplétion, « autour de moi », et des alertes qui préviennent quand un nouveau restaurant correspond.

**Durée** : 35 min · **Chapitre** : 8 — Fonctions de recherche avancées

## Contexte

L'application mobile du guide a besoin de quatre écrans : une liste triée et paginée, des résultats où le mot cherché est mis en valeur, un champ de recherche qui complète la saisie, et une carte « autour de moi ». Et les utilisateurs veulent être **alertés** quand un restaurant qui leur correspond ouvre.

## Mise en place

Ce TP est autonome. Créez l'index `restaurants` et ses douze documents :

```json
DELETE /restaurants
DELETE /restaurant_names
DELETE /alerts

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

Référence : [Search features](https://docs.opensearch.org/latest/search-plugins/searching-data/).

## Exercices

### Étape 1 : Trier et paginer

Les restaurants du **moins cher au plus cher**, à prix égal par nom, **4 par page**. N'affichez que le nom et le prix. Puis demandez la **page suivante** sans utiliser `from`.

<details>
<summary>Indice</summary>

`sort` sur `price` puis `name.keyword`. Chaque hit porte un tableau `sort` : passez celui du **dernier** hit à `search_after`.

</details>

**Résultat attendu** (la page 2) :

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

**Question** : pourquoi un second critère de tri (`name.keyword`) est-il indispensable avec `search_after` ?

### Étape 2 : Surligner

Cherchez « grillés » dans la description, et entourez les termes trouvés de `<em>` … `</em>`. Pas de `_source`.

<details>
<summary>Indice</summary>

Un bloc `highlight` avec `pre_tags`, `post_tags` et `fields`.

</details>

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

### Étape 3 : Autocomplétion

Créez un index `restaurant_names` (1 shard, 0 réplica) avec un champ `suggest` de type `completion`. Indexez trois noms : « Le Bouchon Lyonnais », « Le Vieux Port », « La Trattoria », avec les `_id` `1`, `5` et `4`. Puis demandez les complétions de « le ».

<details>
<summary>Indice</summary>

Le mapping `{ "suggest": { "type": "completion" } }`, des documents `{ "suggest": "Le Vieux Port" }`, puis un bloc `suggest` avec `prefix` et `completion.field`.

</details>

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

**Essayez** : ajoutez `"fuzzy": { "fuzziness": 1 }` et tapez « la v ».

### Étape 4 : Autour de moi

Vous êtes à la tour Eiffel (lat `48.8584`, lon `2.2945`). Trouvez les restaurants à moins de **5 km**, du plus proche au plus loin, avec la distance en km. N'affichez que le nom.

<details>
<summary>Indice</summary>

Un `geo_distance` dans un `filter`, et un tri `_geo_distance` avec `unit`.

</details>

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

**Question** : où lire la distance de chaque restaurant dans la réponse ?

### Étape 5 : Les alertes, par percolation

Un utilisateur veut être prévenu de l'ouverture d'un restaurant **japonais** à **Lyon**, un autre d'un restaurant à **moins de 20 €**. Créez un index `alerts` (1 shard, 0 réplica) qui stocke ces deux requêtes, avec les `_id` `japonais-lyon` et `petit-budget`. Puis soumettez-lui le nouveau restaurant :

```text
{ "name": "Udon Lyon", "cuisine": "japonaise", "city": "Lyon", "price": 15 }
```

<details>
<summary>Indice</summary>

Le mapping déclare un champ `query` de type `percolator`, **et** les champs que les requêtes interrogent (`cuisine`, `city`, `price`). Puis une recherche `percolate` avec `document`.

</details>

**Résultat attendu** :

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "japonais-lyon" }, { "_id": "petit-budget" } ]
  }
}
```

**Essayez** : soumettez un restaurant japonais à Paris, à 30 €.

## Critères de réussite

- Une pagination stable avec `sort` et `search_after`
- Les termes trouvés sont surlignés
- L'autocomplétion repose sur un champ `completion`
- Une recherche géographique filtre et trie par distance
- Des requêtes stockées sont rejouées sur un document entrant

## Pour aller plus loin

- Ouvrez un **Point in Time** (`POST /restaurants/_search/point_in_time?keep_alive=1m`) et paginez avec : indexez un nouveau restaurant entre deux pages — apparaît-il ?
- Un `term` suggester sur `name` : quelle correction propose-t-il pour « trattorai » ?
- Une agrégation `geo_distance` : combien de restaurants à 0–5, 5–100, 100+ km de la tour Eiffel ?

## Dépannage

**Problème** : `search_after` renvoie la même page
→ Le tableau passé doit être celui du **dernier** hit de la page précédente, avec le **même** `sort`.

**Problème** : `field [suggest] is not a completion suggest field`
→ L'index a été créé sans le mapping : supprimez-le et recréez-le.

**Problème** : `percolate` ne trouve rien
→ Les champs interrogés par les requêtes stockées doivent être **dans le mapping** de l'index `alerts`, avec les mêmes types.
