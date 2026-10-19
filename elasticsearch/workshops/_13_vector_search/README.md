# TP 13 — Recherche Vectorielle, Hybride et Sémantique

> Indexer des vecteurs, chercher les plus proches voisins, combiner recherche lexicale et vectorielle avec les retrievers, puis laisser Elasticsearch calculer lui-même les embeddings avec `semantic_text`.

**Niveau**: Avancé
**Topic**: Recherche - Vector Search

## Contexte

Un site de recettes veut qu'une recherche « dessert aux fruits » trouve la tarte aux pommes, même si aucun de ces mots n'est dans son titre. Vous allez d'abord manipuler des vecteurs « à la main » (3 dimensions, pour pouvoir les lire), puis utiliser un vrai modèle d'embeddings exécuté par Elasticsearch.

## Setup

Ce TP est autonome. Il demande une **licence trial ou supérieure** pour la partie C (modèles de machine learning): Stack Management → License Management → Start trial, ou `-e xpack.license.self_generated.type=trial` avec Docker.

**Prérequis**: Le nœud doit avoir le rôle `ml` (c'est le cas par défaut) et un accès à Internet pour télécharger les modèles (~100 Mo pour E5, la première fois).

## Partie A: Vecteurs et kNN

### Étape 1: Créer l'index

Chaque recette a un vecteur de 3 dimensions. Imaginons que ces dimensions signifient « sucré », « salé/soupe » et « plat chaud » (un vrai modèle produit des centaines de dimensions, sans signification lisible):

```bash
DELETE /recipes

PUT /recipes
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "title": { "type": "text", "analyzer": "french" },
      "category": { "type": "keyword" },
      "embedding": { "type": "dense_vector", "dims": 3, "similarity": "cosine" }
    }
  }
}

POST /recipes/_bulk?refresh=true
{"index":{"_id":"1"}}
{"title":"Tarte aux pommes","category":"dessert","embedding":[0.9,0.1,0.0]}
{"index":{"_id":"2"}}
{"title":"Crumble aux poires","category":"dessert","embedding":[0.8,0.2,0.1]}
{"index":{"_id":"3"}}
{"title":"Soupe de potiron","category":"entrée","embedding":[0.1,0.9,0.2]}
{"index":{"_id":"4"}}
{"title":"Gratin de pommes de terre","category":"plat","embedding":[0.2,0.3,0.9]}
{"index":{"_id":"5"}}
{"title":"Compote de pommes","category":"dessert","embedding":[0.95,0.05,0.0]}
```

Regardez le mapping: Elasticsearch a choisi une **quantization** pour économiser la mémoire.

```bash
GET /recipes/_mapping
```

**Résultat attendu** (extrait):
```json
{
  "recipes": {
    "mappings": {
      "properties": {
        "embedding": {
          "type": "dense_vector",
          "dims": 3,
          "index_options": { "type": "int8_hnsw" }
        }
      }
    }
  }
}
```

`int8_hnsw` (4 fois moins de mémoire) sous 384 dimensions; `bbq_hnsw` (Better Binary Quantization, ~32 fois moins) à partir de 384.

### Étape 2: Les plus proches voisins

Cherchez les 2 recettes les plus proches d'un vecteur « très sucré »:

```bash
POST /recipes/_search
{
  "knn": {
    "field": "embedding",
    "query_vector": [0.9, 0.1, 0.05],
    "k": 2,
    "num_candidates": 10
  },
  "_source": ["title"]
}
```

**Résultat attendu** (extrait):
```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [
      { "_id": "1", "_source": { "title": "Tarte aux pommes" } },
      { "_id": "5", "_source": { "title": "Compote de pommes" } }
    ]
  }
}
```

**Questions**:
- À quoi sert `num_candidates` ? (Le nombre de candidats explorés par shard dans le graphe HNSW: plus il est grand, plus le résultat est exact, et lent.)
- Pourquoi dit-on que la recherche est **approximative** ?

### Étape 3: kNN filtré

Le filtre s'applique **pendant** le parcours du graphe: on obtient toujours `k` résultats qui le respectent.

```bash
POST /recipes/_search
{
  "knn": {
    "field": "embedding",
    "query_vector": [0.9, 0.1, 0.05],
    "k": 1,
    "num_candidates": 10,
    "filter": { "term": { "category": "plat" } }
  },
  "_source": ["title"]
}
```

**Résultat attendu** (extrait):
```json
{
  "hits": {
    "hits": [ { "_id": "4" } ]
  }
}
```

## Partie B: Recherche hybride avec les retrievers

### Étape 4: Le problème

Une recherche lexicale « pommes » trouve la tarte, la compote… et le gratin de pommes de terre:

```bash
POST /recipes/_search
{
  "query": { "match": { "title": "pommes" } },
  "_source": ["title"]
}
```

**Résultat attendu** (extrait):
```json
{
  "hits": {
    "total": { "value": 3 }
  }
}
```

Le score BM25 et la similarité cosinus ne sont pas sur la même échelle: on ne peut pas simplement les additionner.

### Étape 5: Reciprocal Rank Fusion

Le retriever `rrf` combine les **rangs** de plusieurs recherches (`score = Σ 1 / (rank_constant + rang)`): un document bien classé dans les deux listes passe devant.

```bash
POST /recipes/_search
{
  "retriever": {
    "rrf": {
      "retrievers": [
        { "standard": { "query": { "match": { "title": "pommes" } } } },
        { "knn": { "field": "embedding", "query_vector": [0.9, 0.1, 0.05], "k": 3, "num_candidates": 10 } }
      ],
      "rank_window_size": 10
    }
  },
  "size": 2,
  "_source": ["title"]
}
```

**Résultat attendu** (extrait): la tarte et la compote, présentes dans les deux listes, sont devant le gratin.
```json
{
  "hits": {
    "hits": [
      { "_id": "1" },
      { "_id": "5" }
    ]
  }
}
```

### Étape 6: Combinaison linéaire

Le retriever `linear` normalise les scores (`minmax`), puis en fait une somme pondérée: ici, la similarité vectorielle compte double.

```bash
POST /recipes/_search
{
  "retriever": {
    "linear": {
      "retrievers": [
        {
          "retriever": { "standard": { "query": { "match": { "title": "pommes" } } } },
          "weight": 1,
          "normalizer": "minmax"
        },
        {
          "retriever": { "knn": { "field": "embedding", "query_vector": [0.9, 0.1, 0.05], "k": 3, "num_candidates": 10 } },
          "weight": 2,
          "normalizer": "minmax"
        }
      ]
    }
  },
  "_source": ["title"]
}
```

## Partie C: Laisser Elasticsearch calculer les embeddings

### Étape 7: Les inference endpoints

Elasticsearch fournit des endpoints prêts à l'emploi, qui déploient leur modèle à la première utilisation:

```bash
GET /_inference
```

Repérez `.multilingual-e5-small-elasticsearch` (embeddings denses, multilingue) et `.rerank-v1-elasticsearch` (reranking).

### Étape 8: Un champ semantic_text

Un champ `semantic_text` appelle l'inference endpoint à l'indexation **et** à la recherche, et découpe les textes longs en morceaux (chunks):

```bash
DELETE /articles

PUT /articles
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "content": {
        "type": "semantic_text",
        "inference_id": ".multilingual-e5-small-elasticsearch"
      }
    }
  }
}
```

Indexez des documents. La **première** indexation télécharge et déploie le modèle: elle peut prendre une à deux minutes. Si elle échoue sur un timeout, renvoyez-la.

<!-- ci: retry -->
```bash
POST /articles/_doc/1?refresh=true
{ "content": "Le chat dort sur le canapé du salon." }
```

```bash
POST /articles/_bulk?refresh=true
{"index":{"_id":"2"}}
{"content":"La bourse a fortement chuté ce matin après l'annonce des résultats."}
{"index":{"_id":"3"}}
{"content":"Préchauffez le four, étalez la pâte et disposez les pommes en rosace."}
```

### Étape 9: Une recherche sémantique

Aucun mot de la question n'apparaît dans le document attendu:

```bash
POST /articles/_search
{
  "query": { "match": { "content": "félin endormi" } },
  "size": 1,
  "_source": ["content"]
}
```

**Résultat attendu** (extrait):
```json
{
  "hits": {
    "hits": [ { "_id": "1" } ]
  }
}
```

Essayez aussi en anglais (`"sleeping cat"`): le modèle est multilingue.

### Étape 10: Reranking

Un modèle de **reranking** (cross-encoder) relit les meilleurs résultats d'une première recherche avec la question: plus précis, mais trop lent pour tout l'index. Le premier appel déploie le modèle: renvoyez-le s'il échoue sur un timeout.

<!-- ci: retry -->
```bash
POST /recipes/_search
{
  "retriever": {
    "text_similarity_reranker": {
      "retriever": { "standard": { "query": { "match": { "title": "pommes" } } } },
      "field": "title",
      "inference_id": ".rerank-v1-elasticsearch",
      "inference_text": "un dessert aux fruits",
      "rank_window_size": 10
    }
  },
  "_source": ["title"]
}
```

**Question**: le gratin de pommes de terre est-il toujours dans le trio de tête ?

## Critères de Succès

- Mapper un champ `dense_vector` et comprendre la quantization par défaut
- Écrire une recherche `knn`, avec et sans filtre
- Combiner recherche lexicale et vectorielle avec les retrievers `rrf` et `linear`
- Indexer et rechercher un champ `semantic_text`
- Reclasser des résultats avec `text_similarity_reranker`

## Dépannage

**Problème**: `model_deployment_timeout_exception` ou `Timed out after [30s] waiting for trained model deployment`
→ Le modèle est en cours de téléchargement ou de déploiement: attendez une minute et renvoyez la requête. Suivez l'état avec `GET /_ml/trained_models/_stats`.

**Problème**: `current license is non-compliant for [inference]`
→ Les modèles intégrés demandent une licence trial ou supérieure (voir le Setup).

**Problème**: `failed to download model` 
→ Le nœud n'a pas accès à Internet: les modèles peuvent être installés hors ligne (voir la documentation « Deploy ELSER/E5 in air-gapped environments »).
