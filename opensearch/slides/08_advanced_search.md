---
layout: cover
---

# 8 - Fonctions de recherche avancées

---

# Objectifs pédagogiques

À la fin de cette séquence (**~40 min**, TP compris), vous saurez :

- **Trier** et **paginer** des résultats, y compris en profondeur
- **Surligner** les termes trouvés
- **Suggérer** des complétions et des corrections
- **Chercher** autour d'un point géographique
- **Inverser** la recherche avec la **percolation**

---

# Trier

```json
GET /restaurants/_search
{
  "query": { "term": { "city": "Paris" } },
  "sort": [
    { "rating": "desc" },
    { "name.keyword": "asc" }
  ],
  "_source": ["name", "rating"]
}
```

**Résultat attendu** :

```json
{ "hits": { "hits": [ { "_id": "12", "sort": [4.9, "L'Étoile du Nord"] } ] } }
```

- Trier sur un `keyword`, un nombre, une date — **pas** sur un `text`
- Un `sort` explicite **désactive** le calcul du `_score` (sauf `"track_scores": true`)

---

# Paginer

| Méthode | Usage | Limite |
|---|---|---|
| `from` + `size` | Pages d'une interface : `from: 20, size: 10` | `from + size` ≤ **10 000** (`index.max_result_window`) |
| `search_after` | Pagination profonde, « page suivante » | Pas de saut à la page N |
| **Point in Time** + `search_after` | Parcours **cohérent** pendant que l'index change | Ressource à fermer |
| `scroll` | Export complet, historique | Préférer PIT |

```json
GET /restaurants/_search
{
  "size": 3,
  "sort": [ { "price": "asc" }, { "name.keyword": "asc" } ],
  "search_after": [18, "Pizzeria Napoli"],
  "_source": ["name", "price"]
}
```

---

# Surlignage

Montrer **pourquoi** un document correspond :

```json
GET /restaurants/_search
{
  "query": { "match": { "description": "pâtes" } },
  "highlight": {
    "pre_tags": ["<mark>"], "post_tags": ["</mark>"],
    "fields": { "description": {} }
  },
  "_source": ["name"]
}
```

**Résultat attendu** :

```json
{
  "hits": {
    "hits": [
      { "_id": "4", "highlight": { "description": ["<mark>Pâtes</mark> fraîches, risotto aux champignons et tiramisu."] } }
    ]
  }
}
```

- Fragmente les longs textes : `fragment_size`, `number_of_fragments`
- Surligne selon l'**analyse** : `pâtes` trouve aussi `Pâtes`

---

# Suggestions : corriger

Le **term suggester** propose des termes proches de ceux de l'index :

```json
GET /restaurants/_search
{
  "size": 0,
  "suggest": {
    "correction": {
      "text": "trattorai",
      "term": { "field": "name" }
    }
  }
}
```

**Résultat attendu** :

```json
{ "suggest": { "correction": [ { "text": "trattorai", "options": [ { "text": "trattoria" } ] } ] } }
```

- `phrase` : corrige une phrase entière
- Alternative simple : `match` avec `"fuzziness": "AUTO"`

---

# Suggestions : compléter

Le **completion suggester** : un type de champ dédié, en mémoire, très rapide :

```json
PUT /cities
{ "mappings": { "properties": { "suggest": { "type": "completion" } } } }

POST /cities/_bulk?refresh=true
{ "index": { "_id": "1" } }
{ "suggest": { "input": ["Paris"], "weight": 10 } }
{ "index": { "_id": "2" } }
{ "suggest": { "input": ["Pau"], "weight": 3 } }
{ "index": { "_id": "3" } }
{ "suggest": { "input": ["Lyon"], "weight": 8 } }

GET /cities/_search
{ "suggest": { "villes": { "prefix": "pa", "completion": { "field": "suggest" } } } }
```

**Résultat attendu** :

```json
{ "suggest": { "villes": [ { "options": [ { "text": "Paris" }, { "text": "Pau" } ] } ] } }
```

---

# Requêtes géographiques

Un champ `geo_point` : `{ "lat": 48.85, "lon": 2.35 }`, `"48.85,2.35"`, ou `[2.35, 48.85]` (lon, lat !)

```json
GET /restaurants/_search
{
  "query": {
    "bool": {
      "filter": {
        "geo_distance": { "distance": "2km", "location": { "lat": 48.8584, "lon": 2.2945 } }
      }
    }
  },
  "sort": [
    { "_geo_distance": { "location": { "lat": 48.8584, "lon": 2.2945 }, "order": "asc", "unit": "km" } }
  ],
  "_source": ["name"]
}
```

- `geo_bounding_box`, `geo_polygon`, `geo_shape` : rectangle, polygone, formes
- Agrégations : `geo_distance`, `geohash_grid`, `geotile_grid` → **cartes** dans Dashboards

---

# La percolation

La recherche **à l'envers** : on indexe des **requêtes**, et on leur soumet un **document**.

```json
PUT /alerts
{
  "mappings": {
    "properties": {
      "query":       { "type": "percolator" },
      "description": { "type": "text", "analyzer": "french" },
      "price":       { "type": "integer" }
    }
  }
}

PUT /alerts/_doc/japonais-pas-cher?refresh=true
{ "query": { "bool": { "must": { "match": { "description": "sushi" } }, "filter": { "range": { "price": { "lte": 30 } } } } } }

GET /alerts/_search
{
  "query": {
    "percolate": { "field": "query", "document": { "description": "Sushis à volonté", "price": 25 } }
  }
}
```

**Résultat attendu** :

```json
{ "hits": { "hits": [ { "_id": "japonais-pas-cher" } ] } }
```

→ Alertes « nouvelle annonce qui me correspond », classification, routage.

---

# Quiz

**Un utilisateur veut la page 2 000 d'une recherche, 10 résultats par page. Que se passe-t-il avec `from` / `size` ?**

<v-clicks>

- A) Ça marche, c'est juste lent
- B) Erreur : `from + size` dépasse `max_result_window` (10 000) ✅
- C) OpenSearch renvoie la dernière page
- D) OpenSearch bascule en `scroll`

**Réponse : B** — au-delà, `search_after` (+ PIT). Et une interface ne propose pas la page 2 000.

</v-clicks>

---

# En pratique

## TP 6 - Recherche avancée
