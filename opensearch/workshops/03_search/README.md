# TP 3 — Recherche et pertinence

> Chercher en plein texte et sur des valeurs exactes, combiner les critères d'une recherche à facettes, puis faire remonter les meilleurs restaurants.

**Durée** : 30 min · **Chapitre** : 5 — Recherche et pertinence

## Contexte

Un guide de restaurants en ligne. L'utilisateur tape des mots (« poisson frais »), coche des filtres (ville, budget), et s'attend à voir les **bons** restaurants en premier. Vous écrivez les requêtes derrière chaque interaction.

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

Référence : [Query DSL](https://docs.opensearch.org/latest/query-dsl/).

## Exercices

### Étape 1 : Plein texte

Trouvez les restaurants dont la **description** parle de « poisson frais ». N'affichez pas le `_source`.

<details>
<summary>Indice</summary>

Une requête `match`. `"_source": false` allège la réponse.

</details>

**Résultat attendu** :

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "3" }, { "_id": "5" } ]
  }
}
```

**Question** : le restaurant 5 parle de « poisson**s** grillés ». Pourquoi est-il trouvé ? (Relisez le mapping de `description`.)

### Étape 2 : Une expression exacte

Trouvez les restaurants qui proposent des « pâtes fraîches » — les deux mots, **côte à côte et dans cet ordre**.

<details>
<summary>Indice</summary>

`match_phrase`.

</details>

**Résultat attendu** :

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "4" }, { "_id": "2" } ]
  }
}
```

### Étape 3 : Le piège du `term`

Cherchez le restaurant nommé exactement « Sushi Zen » avec une requête `term` sur le champ `name`. Puis corrigez la requête pour qu'elle le trouve.

<details>
<summary>Indice</summary>

`name` est un `text` : il est indexé en minuscules, mot à mot. Son sous-champ, lui, garde la valeur telle quelle.

</details>

**Résultat attendu** (la requête corrigée) :

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [ { "_id": "3" } ]
  }
}
```

### Étape 4 : Une recherche à facettes

L'utilisateur tape « cuisine », coche les villes **Paris** et **Lyon**, et un budget de **40 € maximum**. Écrivez la requête : seul le texte tapé doit compter dans le score. N'affichez que le nom.

<details>
<summary>Indice</summary>

Une `bool` : le texte dans `must`, les cases cochées dans `filter` (`terms`, `range`).

</details>

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

**Question** : les deux ont le même score. Pourquoi ?

### Étape 5 : Le nom compte plus

Cherchez « tarte » à la fois dans le nom et la description, un mot trouvé dans le **nom** valant **trois fois** plus.

<details>
<summary>Indice</summary>

`multi_match`, et la notation `champ^3`.

</details>

**Résultat attendu** :

```json
{ "hits": { "total": { "value": 2 } } }
```

### Étape 6 : Les mieux notés d'abord

Cherchez « cuisine » dans la description, en **multipliant** le score par la note (`rating`) du restaurant.

<details>
<summary>Indice</summary>

`function_score` avec `field_value_factor` et `"boost_mode": "multiply"`.

</details>

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

**Question** : sans `function_score`, lequel arrive en tête ? Comparez avec `_explain`.

## Critères de réussite

- `match` pour le texte tapé, `term` / `range` pour les valeurs exactes
- Les critères binaires sont dans `filter`, hors du score
- Vous savez renforcer un champ (`^3`) et injecter une valeur métier dans le score

## Pour aller plus loin

- Cherchez « sushy » avec `"fuzziness": "AUTO"`.
- Remplacez `field_value_factor` par une décroissance `gauss` sur `location` : les restaurants proches de la tour Eiffel (48.8584, 2.2945) remontent.
- Ajoutez `"explain": true` à une recherche et repérez `idf`, `tf` et la longueur du champ.

## Dépannage

**Problème** : `term` ne trouve rien
→ Un `term` sur un champ `text` compare à des termes analysés (en minuscules, découpés). Utilisez le sous-champ `.keyword`, ou `match`.

**Problème** : `failed to create query` sur un `range`
→ Vérifiez le champ : `price` est un `integer`, `rating` un `float`, `opened` une `date`.
