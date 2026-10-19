# TP 3 — Documents, Bulk, Alias et Templates

> Gérer le cycle de vie des documents (création, mise à jour, suppression), indexer en masse avec l'API `_bulk`, découpler l'application de ses index avec des alias, et appliquer automatiquement mapping et settings avec des index templates.

**Topic**: Indexation - Documents, Bulk, Alias et Templates

## Contexte

Une bibliothèque en ligne stocke son catalogue dans Elasticsearch. Chaque année, le catalogue est réindexé dans un nouvel index (`books-2025`, `books-2026`…), sans que l'application qui l'interroge ne s'en aperçoive. Vous allez manipuler les documents, charger le catalogue en masse, puis mettre en place l'alias et le template qui rendent cette bascule transparente.

## Setup

Ce TP est autonome. Si un essai précédent a laissé des index `books-*` ou le template `books`, supprimez-les:

<!-- ci: skip -->
```bash
DELETE /books-*
DELETE /_index_template/books
```

## Partie A: Le cycle de vie d'un document

### Étape 1: Créer l'index

```bash
PUT /books-2025
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}
```

### Étape 2: Indexer un document avec un identifiant choisi

```bash
PUT /books-2025/_doc/1
{
  "title": "Le Petit Prince",
  "author": "Antoine de Saint-Exupéry",
  "year": 1943,
  "stock": 3
}
```

**Résultat attendu**:
```json
{
  "_index": "books-2025",
  "_id": "1",
  "_version": 1,
  "result": "created"
}
```

### Étape 3: Indexer un document sans identifiant

Avec `POST`, Elasticsearch génère l'identifiant:

```bash
POST /books-2025/_doc
{
  "title": "L'Étranger",
  "author": "Albert Camus",
  "year": 1942,
  "stock": 5
}
```

**Résultat attendu**:
```json
{
  "_index": "books-2025",
  "result": "created"
}
```

**Question**: Notez le `_id` renvoyé. Quand préférer un identifiant métier (ISBN…) à un identifiant généré ?

### Étape 4: Récupérer un document

```bash
GET /books-2025/_doc/1
```

**Résultat attendu**:
```json
{
  "_id": "1",
  "found": true,
  "_source": { "title": "Le Petit Prince", "stock": 3 }
}
```

### Étape 5: Mise à jour partielle

L'API `_update` ne modifie que les champs envoyés:

```bash
POST /books-2025/_update/1
{
  "doc": { "stock": 2 }
}
```

**Résultat attendu**:
```json
{
  "_version": 2,
  "result": "updated"
}
```

Vérifiez que le titre est toujours là:

```bash
GET /books-2025/_doc/1
```

**Résultat attendu**:
```json
{
  "_version": 2,
  "_source": { "title": "Le Petit Prince", "stock": 2 }
}
```

### Étape 6: Mise à jour par script

Décrémentez le stock d'un exemplaire, sans le lire d'abord:

```bash
POST /books-2025/_update/1
{
  "script": {
    "source": "ctx._source.stock -= params.sold",
    "params": { "sold": 1 }
  }
}
```

```bash
GET /books-2025/_doc/1?_source=stock
```

**Résultat attendu**:
```json
{
  "_source": { "stock": 1 }
}
```

### Étape 7: Remplacement complet

Un `PUT` sur un identifiant existant **remplace** tout le document:

```bash
PUT /books-2025/_doc/1
{
  "title": "Le Petit Prince"
}
```

```bash
GET /books-2025/_doc/1
```

**Résultat attendu**:
```json
{
  "_version": 4,
  "_source": { "title": "Le Petit Prince" }
}
```

**Question**: Où sont passés `author`, `year` et `stock` ?

### Étape 8: Supprimer un document

```bash
DELETE /books-2025/_doc/1
```

**Résultat attendu**:
```json
{
  "result": "deleted"
}
```

<!-- ci: expect-error -->
```bash
GET /books-2025/_doc/1
```

**Résultat attendu**: un `404` avec `"found": false`.

## Partie B: Indexation en masse avec `_bulk`

### Étape 1: Charger le catalogue

Une requête `_bulk` enchaîne, sur des lignes NDJSON, une **action** puis (sauf pour `delete`) son **document**:

```bash
POST /books-2025/_bulk?refresh=true
{"index":{"_id":"9782070612758"}}
{"title":"Le Petit Prince","author":"Antoine de Saint-Exupéry","year":1943,"stock":3}
{"index":{"_id":"9782070360024"}}
{"title":"L'Étranger","author":"Albert Camus","year":1942,"stock":5}
{"index":{"_id":"9782070368228"}}
{"title":"La Peste","author":"Albert Camus","year":1947,"stock":2}
{"create":{"_id":"9782253006329"}}
{"title":"Germinal","author":"Émile Zola","year":1885,"stock":4}
{"update":{"_id":"9782070360024"}}
{"doc":{"stock":6}}
```

**Résultat attendu**:
```json
{
  "errors": false,
  "items": [
    { "index": { "_id": "9782070612758", "status": 201 } },
    { "index": { "_id": "9782070360024", "status": 201 } },
    { "index": { "_id": "9782070368228", "status": 201 } },
    { "create": { "_id": "9782253006329", "status": 201 } },
    { "update": { "_id": "9782070360024", "status": 200 } }
  ]
}
```

### Étape 2: Une erreur ne fait pas échouer le lot

Rejouez une création sur un identifiant existant, avec un document valide derrière:

```bash
POST /books-2025/_bulk?refresh=true
{"create":{"_id":"9782253006329"}}
{"title":"Germinal","author":"Émile Zola","year":1885,"stock":4}
{"index":{"_id":"9782253004226"}}
{"title":"Madame Bovary","author":"Gustave Flaubert","year":1857,"stock":1}
```

**Résultat attendu**:
```json
{
  "errors": true,
  "items": [
    { "create": { "status": 409 } },
    { "index": { "status": 201 } }
  ]
}
```

**Question**: Que doit faire un programme qui envoie des `_bulk` quand `errors` vaut `true` ?

### Étape 3: Récupérer tous les documents

```bash
GET /books-2025/_search
{
  "query": { "match_all": {} }
}
```

**Résultat attendu**:
```json
{
  "hits": { "total": { "value": 6 } }
}
```

Six documents: le livre indexé avec un identifiant généré en partie A, et les cinq du catalogue.

## Partie C: Alias

### Étape 1: Créer l'alias de lecture

L'application interroge `books`, jamais `books-2025`:

```bash
POST /_aliases
{
  "actions": [
    { "add": { "index": "books-2025", "alias": "books" } }
  ]
}
```

```bash
GET /books/_count
```

**Résultat attendu**:
```json
{
  "count": 6
}
```

### Étape 2: Un alias filtré

Un alias peut porter un filtre — ici, les seuls livres de Camus:

```bash
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "books-2025",
        "alias": "books-camus",
        "filter": { "match": { "author": "Camus" } }
      }
    }
  ]
}
```

```bash
GET /books-camus/_count
```

**Résultat attendu**:
```json
{
  "count": 3
}
```

## Partie D: Index templates

### Étape 1: Créer le template

Tous les futurs index `books-*` auront le même mapping et les mêmes settings — et rejoindront l'alias `books-next`:

```bash
PUT /_index_template/books
{
  "index_patterns": ["books-*"],
  "template": {
    "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
    "mappings": {
      "properties": {
        "title":  { "type": "text", "analyzer": "french" },
        "author": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
        "year":   { "type": "integer" },
        "stock":  { "type": "integer" }
      }
    },
    "aliases": { "books-next": {} }
  }
}
```

### Étape 2: Simuler l'index qui serait créé

```bash
POST /_index_template/_simulate_index/books-2026
```

**Résultat attendu**:
```json
{
  "template": {
    "mappings": {
      "properties": {
        "title": { "type": "text", "analyzer": "french" }
      }
    },
    "aliases": { "books-next": {} }
  }
}
```

### Étape 3: Créer l'index de l'année suivante

Il suffit d'y écrire: l'index est créé, avec le template.

```bash
POST /books-2026/_bulk?refresh=true
{"index":{"_id":"9782070612758"}}
{"title":"Le Petit Prince","author":"Antoine de Saint-Exupéry","year":1943,"stock":10}
{"index":{"_id":"9782070360024"}}
{"title":"L'Étranger","author":"Albert Camus","year":1942,"stock":8}
```

```bash
GET /books-2026/_mapping
```

**Résultat attendu**:
```json
{
  "books-2026": {
    "mappings": {
      "properties": {
        "title": { "type": "text", "analyzer": "french" },
        "year": { "type": "integer" }
      }
    }
  }
}
```

### Étape 4: Basculer l'alias sans interruption

Les actions d'un même appel `_aliases` sont **atomiques**: aucune requête ne voit `books` vide, ni pointant sur deux index.

```bash
POST /_aliases
{
  "actions": [
    { "remove": { "index": "books-2025", "alias": "books" } },
    { "add":    { "index": "books-2026", "alias": "books" } }
  ]
}
```

```bash
GET /books/_count
```

**Résultat attendu**:
```json
{
  "count": 2
}
```

```bash
GET /_alias/books
```

**Résultat attendu**:
```json
{
  "books-2026": { "aliases": { "books": {} } }
}
```

## Critères de Succès

- Vous savez créer, lire, mettre à jour (partiellement, par script, totalement) et supprimer un document
- Un `_bulk` de 5 actions passe sans erreur, et vous savez lire ses `items` quand `errors` vaut `true`
- L'alias `books` pointe sur `books-2026`, l'alias filtré `books-camus` compte 3 livres
- Le template `books` s'applique à tout nouvel index `books-*`

## Dépannage

**Problème**: `version_conflict_engine_exception` sur un `create`
→ Normal: `create` refuse un identifiant qui existe déjà. Utilisez `index` pour écraser.

**Problème**: `_bulk` répond `The bulk request must be terminated by a newline`
→ Le corps doit finir par un retour à la ligne, et chaque document tenir sur **une seule** ligne.

**Problème**: Le mapping de `books-2026` n'est pas celui du template
→ L'index existait avant le template: un template ne s'applique qu'à la **création** d'un index. Supprimez-le et recommencez l'étape 3.
