---
layout: cover
---

# 4 - Indexation et mapping

---

# Objectifs pédagogiques

À la fin de cette séquence (**~45 min**, TP compris), vous saurez :

- **Créer**, configurer et supprimer un index
- **Indexer**, lire, modifier et supprimer des documents, un par un ou en `_bulk`
- **Choisir** le type de chaque champ : `text` ou `keyword`, nombres, dates, `geo_point`
- **Repérer** les pièges du mapping dynamique
- **Découpler** les applications des index avec un **alias**

---

# Créer un index

```json
PUT /books
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
```

- `number_of_shards` : **figé** à la création (sauf `_split` / `_shrink`)
- `number_of_replicas`, `refresh_interval` : **dynamiques**

```json
PUT /books/_settings
{ "index": { "number_of_replicas": 0, "refresh_interval": "5s" } }
```

```json
GET /books/_settings
DELETE /books
```

---

# Indexer un document

```json
PUT /books/_doc/1
{ "title": "Le Petit Prince", "author": "Saint-Exupéry", "year": 1943 }

POST /books/_doc
{ "title": "L'Étranger", "author": "Camus", "year": 1942 }
```

- `PUT /index/_doc/<id>` : **crée ou remplace** le document de cet `_id`
- `POST /index/_doc` : OpenSearch **génère** l'`_id`
- `PUT /index/_create/<id>` : échoue (**409**) si l'`_id` existe déjà

**Résultat attendu** (le `POST`) :

```json
{ "_index": "books", "result": "created" }
```

---

# Lire, modifier, supprimer

```json
GET /books/_doc/1

POST /books/_update/1
{ "doc": { "year": 1946 } }

GET /books/_doc/1
```

**Résultat attendu** :

```json
{ "_id": "1", "_version": 2, "found": true, "_source": { "title": "Le Petit Prince", "year": 1946 } }
```

```json
DELETE /books/_doc/1
```

- Un document est **immuable** dans Lucene : une mise à jour **réécrit** le document entier, et `_version` s'incrémente
- `_update` évite seulement de renvoyer tout le document

---

# `_bulk` : indexer en masse

Une ligne d'**action**, puis une ligne de **document** — format **NDJSON** :

```json
POST /books/_bulk?refresh=true
{ "index": { "_id": "2" } }
{ "title": "Germinal", "author": "Zola", "year": 1885 }
{ "index": { "_id": "3" } }
{ "title": "Les Misérables", "author": "Hugo", "year": 1862 }
{ "delete": { "_id": "2" } }
```

**Résultat attendu** :

```json
{ "errors": false }
```

- Actions : `index`, `create`, `update`, `delete`
- Un échec **n'annule pas** les autres : lire `errors`, puis `items[]`
- Taille de lot : **5 à 15 Mo**, à mesurer

---

# Le mapping dynamique

Sans mapping, OpenSearch **devine** le type au premier document :

```json
PUT /guess/_doc/1
{ "title": "Germinal", "year": 1885, "price": 9.5, "published": "1885-03-01", "zip": "75001" }

GET /guess/_mapping
```

| Champ | Deviné | Le problème |
|---|---|---|
| `title` | `text` + sous-champ `keyword` | Deux index pour un champ : souvent inutile |
| `year` | `long` | 8 octets pour une année |
| `price` | `float` | OK |
| `published` | `date` | OK — parce que le format est ISO |
| `zip` | `text` + `keyword` | Un code postal ne se cherche pas en plein texte |

> En production : un **mapping explicite**, et `"dynamic": "strict"` pour refuser l'inconnu.

---

# `text` ou `keyword` ?

| | `text` | `keyword` |
|---|---|---|
| Indexé | **Analysé** : découpé en termes, minuscules… | **Tel quel**, une seule valeur exacte |
| Pour | Recherche **plein texte** : `match` | **Filtre** exact, **tri**, **agrégation** : `term` |
| Exemple | Description, titre, message de log | Statut, ville, tag, e-mail, ID |

Les deux à la fois, avec un **multi-field** :

```json
"name": {
  "type": "text",
  "fields": { "keyword": { "type": "keyword" } }
}
```

→ `match` sur `name`, tri et agrégation sur `name.keyword`.

---

# Les types de données

| Famille | Types |
|---|---|
| Texte | `text`, `keyword`, `match_only_text`, `wildcard` |
| Nombres | `integer`, `long`, `float`, `double`, `scaled_float`, `unsigned_long` |
| Dates | `date` (avec `format`), `date_nanos` |
| Autres | `boolean`, `ip`, `binary`, `range` |
| Objets | `object` (par défaut), `nested`, `flat_object` |
| Géo | `geo_point`, `geo_shape` |
| Spécialisés | `completion`, `percolator`, `knn_vector`, `join` |

<br />

> Un **tableau** n'est pas un type : tout champ accepte une ou plusieurs valeurs.

---

# Un mapping explicite

```json
PUT /products
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "name":     { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "category": { "type": "keyword" },
      "price":    { "type": "scaled_float", "scaling_factor": 100 },
      "stock":    { "type": "integer" },
      "created":  { "type": "date", "format": "yyyy-MM-dd||epoch_millis" },
      "tags":     { "type": "keyword" }
    }
  }
}
```

- On peut **ajouter** un champ à chaud (`PUT /products/_mapping`)
- On ne peut **pas changer** le type d'un champ existant : nouvel index + **`_reindex`**

---

# Changer un mapping : `_reindex` et alias

```json
PUT /products_v2
{ "mappings": { "properties": { "category": { "type": "keyword" } } } }

POST /_reindex
{ "source": { "index": "products" }, "dest": { "index": "products_v2" } }

POST /_aliases
{
  "actions": [
    { "add": { "index": "products_v2", "alias": "products_current" } }
  ]
}
```

- Les applications lisent et écrivent sur l'**alias**, jamais sur l'index
- La bascule `remove` + `add`, dans **un seul** appel `_aliases`, est **atomique**

---

# Index templates

Le mapping et les settings **appliqués automatiquement** aux nouveaux index d'un motif :

```json
PUT /_index_template/logs
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "level":      { "type": "keyword" },
        "message":    { "type": "text" }
      }
    }
  }
}

PUT /logs-2026.10.27/_doc/1
{ "@timestamp": "2026-10-27T10:00:00Z", "level": "INFO", "message": "démarrage" }

GET /logs-2026.10.27/_mapping
```

---

# Quiz

**On veut trier des restaurants par ville. Quel type pour `city` ?**

<v-clicks>

- A) `text`
- B) `keyword` ✅
- C) `object`
- D) `geo_point`

**Réponse : B** — on trie et on agrège sur une valeur **exacte**, non analysée.

</v-clicks>

---

# En pratique

## TP 2 - Indexation et mapping
