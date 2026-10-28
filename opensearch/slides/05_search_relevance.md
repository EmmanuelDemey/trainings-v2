---
layout: cover
---

# 5 - Recherche et pertinence

---

# Objectifs pédagogiques

À la fin de cette séquence (**~45 min**, TP compris), vous saurez :

- **Écrire** une recherche avec le Query DSL : plein texte et valeurs exactes
- **Combiner** des critères avec `bool` : `must`, `should`, `filter`, `must_not`
- **Distinguer** contexte de requête (score) et contexte de filtre (oui / non)
- **Lire** un score, et l'**influencer** avec `boost` et `function_score`

---

# Le jeu de données

Les exemples des chapitres 5 à 8 interrogent l'index `restaurants` :

```json
{
  "name": "Pizzeria Napoli",
  "description": "Pizzas cuites au feu de bois et pâtes fraîches maison.",
  "cuisine": "italienne",
  "city": "Paris",
  "location": { "lat": 48.8566, "lon": 2.3522 },
  "rating": 4.2,
  "price": 18,
  "opened": "2018-06-01"
}
```

`name` : `text` + `keyword` · `description` : `text`, analyseur `french` ·
`cuisine`, `city` : `keyword` · `location` : `geo_point`

---

# La forme d'une recherche

```json
GET /restaurants/_search
{
  "query": { "match": { "description": "pâtes" } },
  "size": 5,
  "_source": ["name", "city"]
}
```

**Résultat attendu** :

```json
{
  "hits": {
    "total": { "value": 2, "relation": "eq" },
    "hits": [
      { "_id": "2", "_source": { "name": "Pizzeria Napoli", "city": "Paris" } },
      { "_id": "4", "_source": { "name": "La Trattoria", "city": "Lyon" } }
    ]
  }
}
```

- `hits.total` : le nombre de documents qui correspondent
- `hits.hits` : les `size` premiers, triés par `_score` décroissant

---

# Plein texte : `match`

Le texte de la requête est **analysé** comme le champ, puis cherché terme à terme :

```json
GET /restaurants/_search
{
  "query": {
    "match": { "description": { "query": "pâtes fraîches", "operator": "and" } }
  }
}
```

| Variante | Effet |
|---|---|
| `match` | Un terme suffit (`or`) ; `operator: and` les exige tous |
| `match_phrase` | Les termes, **dans l'ordre**, côte à côte |
| `multi_match` | Plusieurs champs : `"fields": ["name^3", "description"]` |
| `fuzziness: "AUTO"` | Tolère les fautes de frappe |

---

# Valeurs exactes : `term`, `terms`, `range`

```json
GET /restaurants/_search
{
  "query": { "term": { "city": "Lyon" } }
}

GET /restaurants/_search
{
  "query": { "range": { "price": { "gte": 20, "lte": 40 } } }
}
```

- `term` sur un `keyword` : **pas d'analyse**, la casse compte : `"lyon"` ne trouve rien
- `term` sur un `text` : piège classique — le champ est indexé en minuscules
- `terms` : une valeur parmi une liste ; `exists`, `prefix`, `wildcard`, `ids`

---

# Combiner : `bool`

```json
GET /restaurants/_search
{
  "query": {
    "bool": {
      "must":     [ { "match": { "description": "poisson" } } ],
      "filter":   [ { "term": { "city": "Paris" } },
                    { "range": { "price": { "lte": 50 } } } ],
      "should":   [ { "range": { "rating": { "gte": 4.5 } } } ],
      "must_not": [ { "term": { "cuisine": "américaine" } } ]
    }
  }
}
```

| Clause | Doit correspondre | Compte dans le score |
|---|---|---|
| `must` | ✅ | ✅ |
| `filter` | ✅ | ❌ — et mis en **cache** |
| `should` | ❌ (bonus) si `must` ou `filter` présent | ✅ |
| `must_not` | ❌ ne doit pas | ❌ |

---

# Requête ou filtre ?

- **Contexte de requête** — *« à quel point ce document correspond-il ? »* → un `_score`
- **Contexte de filtre** — *« correspond-il, oui ou non ? »* → pas de score, **cache**

<br />

Règle pratique :

- Ce que l'utilisateur **tape** → `must` / `should` (plein texte)
- Ce qu'il **coche** (ville, prix, dates, statut) → `filter`

---

# Le score : BM25

Le `_score` d'un document pour un terme dépend de :

- **TF** — la fréquence du terme dans le champ : plus il revient, mieux c'est (avec saturation)
- **IDF** — la rareté du terme dans l'index : un terme rare pèse plus
- **Longueur du champ** — un terme dans un titre court pèse plus que dans un long texte

```json
GET /restaurants/_explain/2
{ "query": { "match": { "description": "pâtes" } } }
```

> Les statistiques sont calculées **par shard** : sur peu de documents et plusieurs
> shards, les scores peuvent surprendre.

---

# Influencer le score : `boost`

Donner plus de poids à un champ, ou à une clause :

```json
GET /restaurants/_search
{
  "query": {
    "multi_match": {
      "query": "pizza",
      "fields": ["name^3", "description"]
    }
  }
}

GET /restaurants/_search
{
  "query": {
    "bool": {
      "should": [
        { "match": { "description": { "query": "poisson", "boost": 2 } } },
        { "match": { "description": "fruits de mer" } }
      ]
    }
  }
}
```

---

# Influencer le score : `function_score`

Mêler la pertinence textuelle à une **valeur métier** — ici, la note :

```json
GET /restaurants/_search
{
  "query": {
    "function_score": {
      "query": { "match": { "description": "cuisine" } },
      "field_value_factor": { "field": "rating", "modifier": "log1p" },
      "boost_mode": "multiply"
    }
  }
}
```

- `field_value_factor` : un champ numérique (note, popularité, stock)
- `gauss`, `exp`, `linear` : **décroissance** avec la distance ou l'âge
- `boost_mode` : `multiply`, `sum`, `replace`…

---

# Quiz

**Pourquoi mettre le critère « ville = Paris » dans `filter` plutôt que dans `must` ?**

<v-clicks>

- A) `must` ne fonctionne pas avec `term`
- B) Pas de calcul de score, et le résultat est mis en cache ✅
- C) `filter` trie les résultats
- D) `must` ignore les `keyword`

**Réponse : B** — le critère est binaire : il n'a pas à peser dans le score.

</v-clicks>

---

# En pratique

## TP 3 - Recherche et pertinence
