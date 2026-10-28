---
layout: cover
---

# 7 - Agrégations

---

# Objectifs pédagogiques

À la fin de cette séquence (**~30 min**, TP compris), vous saurez :

- **Calculer** des métriques : moyenne, min, max, cardinalité, percentiles
- **Regrouper** des documents en buckets : `terms`, `range`, `date_histogram`
- **Imbriquer** des agrégations, et les **combiner** à une recherche
- **Situer** les agrégations pipeline

---

# La forme d'une agrégation

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "prix_moyen": { "avg": { "field": "price" } }
  }
}
```

**Résultat attendu** :

```json
{ "aggregations": { "prix_moyen": { "value": 34.0 } } }
```

- `size: 0` : on ne veut **que** l'agrégation, pas les documents
- Les agrégations portent sur les documents qui correspondent à la `query`
- Sur un champ `keyword`, numérique ou date — **pas** sur un `text`

---

# Les trois familles

| Famille | Produit | Exemples |
|---|---|---|
| **Metrics** | Une ou plusieurs **valeurs** | `avg`, `sum`, `min`, `max`, `stats`, `cardinality`, `percentiles`, `top_hits` |
| **Bucket** | Des **groupes** de documents | `terms`, `range`, `histogram`, `date_histogram`, `filters`, `geohash_grid` |
| **Pipeline** | Un calcul sur **d'autres agrégations** | `avg_bucket`, `max_bucket`, `derivative`, `cumulative_sum`, `bucket_sort` |

<br />

> Une agrégation bucket peut contenir des **sous-agrégations** : elles s'exécutent
> dans **chaque** bucket.

---

# Buckets : `terms`

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "par_ville": { "terms": { "field": "city", "size": 10 } }
  }
}
```

**Résultat attendu** :

```json
{
  "aggregations": {
    "par_ville": {
      "buckets": [
        { "key": "Paris", "doc_count": 5 },
        { "key": "Lyon", "doc_count": 4 },
        { "key": "Marseille", "doc_count": 3 }
      ]
    }
  }
}
```

- Triés par `doc_count` décroissant ; `size` : les N premiers
- Sur plusieurs shards, `terms` est **approché** : `shard_size` améliore la précision

---

# Sous-agrégations

La note moyenne et le prix max, **par ville** :

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "par_ville": {
      "terms": { "field": "city" },
      "aggs": {
        "note_moyenne": { "avg": { "field": "rating" } },
        "prix_max":     { "max": { "field": "price" } }
      }
    }
  }
}
```

- Trier les buckets selon une sous-agrégation : `"order": { "note_moyenne": "desc" }`
- Profondeur libre, mais chaque niveau **multiplie** le nombre de buckets

---

# Buckets : `range` et `date_histogram`

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "gammes": {
      "range": {
        "field": "price",
        "ranges": [ { "key": "petit budget", "to": 20 }, { "key": "moyen", "from": 20, "to": 50 }, { "key": "haut de gamme", "from": 50 } ]
      }
    },
    "ouvertures": {
      "date_histogram": { "field": "opened", "calendar_interval": "year", "format": "yyyy", "min_doc_count": 1 }
    }
  }
}
```

- `date_histogram` : la base de toute **courbe temporelle** dans Dashboards
- `calendar_interval` (`day`, `month`, `year`) ou `fixed_interval` (`30m`, `12h`)

---

# Agrégation + recherche

La `query` restreint les documents agrégés :

```json
GET /restaurants/_search
{
  "size": 0,
  "query": { "range": { "rating": { "gte": 4 } } },
  "aggs": {
    "cuisines": { "terms": { "field": "cuisine" } },
    "stats_prix": { "stats": { "field": "price" } }
  }
}
```

- `post_filter` : filtre les **hits** **sans** toucher aux agrégations — pour des
  facettes qui restent visibles après un clic
- `global` : une agrégation qui ignore la `query`

---

# Agrégations pipeline

Elles calculent sur le **résultat** d'autres agrégations, via `buckets_path` :

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
{ "aggregations": { "ville_la_plus_chere": { "keys": ["Paris"] } } }
```

---

# Quiz

**Pourquoi une agrégation `terms` sur `name` (type `text`) échoue-t-elle ?**

<v-clicks>

- A) `terms` ne fonctionne que sur des nombres
- B) Un `text` n'a pas de doc values : il faut agréger sur `name.keyword` ✅
- C) Il faut `size: 0`
- D) Il faut une `query`

**Réponse : B** — on agrège sur la valeur exacte, stockée en colonne (doc values).

</v-clicks>

---

# En pratique

## TP 5 - Agrégations
