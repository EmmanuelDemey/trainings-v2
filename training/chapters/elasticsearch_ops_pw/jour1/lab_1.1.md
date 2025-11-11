## Lab 1.1: Création et Interrogation d'Index

**Topic**: Concepts Généraux - Indexation et Recherche
**Prérequis**: Cluster Elasticsearch 8.x démarré et accessible

### Objectif

Créer votre premier index Elasticsearch, y insérer des documents, et exécuter des recherches basiques pour comprendre le fonctionnement de l'index inversé.

### Contexte

Vous travaillez pour une boutique en ligne qui souhaite indexer son catalogue produits dans Elasticsearch. Vous allez créer un index `products`, y ajouter quelques produits, puis rechercher des articles spécifiques.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Vérifiez que votre cluster est accessible: `GET /`
2. Vérifiez le statut du cluster: `GET /_cluster/health`
3. Le statut doit être `green` ou `yellow` (acceptable en dev avec 1 nœud)

#### Étapes

**Étape 1**: Créer l'index `products`

Créez un index simple sans mapping explicite (mapping dynamique):

```bash
PUT /products
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
```

**Résultat attendu**:
```json
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "index": "products"
}
```

**Étape 2**: Indexer des documents produits

Insérez 5 produits dans l'index:

```bash
POST /products/_doc/1
{
  "name": "Smartphone Galaxy S23",
  "category": "electronics",
  "price": 899.99,
  "stock": 150,
  "description": "Smartphone haut de gamme avec caméra 200MP"
}

POST /products/_doc/2
{
  "name": "Laptop Dell XPS 15",
  "category": "electronics",
  "price": 1499.99,
  "stock": 45,
  "description": "Ordinateur portable professionnel avec écran OLED"
}

POST /products/_doc/3
{
  "name": "Chaise de Bureau Ergonomique",
  "category": "furniture",
  "price": 299.99,
  "stock": 80,
  "description": "Chaise ergonomique avec support lombaire ajustable"
}

POST /products/_doc/4
{
  "name": "Clavier Mécanique RGB",
  "category": "electronics",
  "price": 129.99,
  "stock": 200,
  "description": "Clavier gaming avec switches Cherry MX"
}

POST /products/_doc/5
{
  "name": "Bureau Assis-Debout",
  "category": "furniture",
  "price": 599.99,
  "stock": 25,
  "description": "Bureau électrique avec hauteur réglable"
}
```

**Étape 3**: Recherche simple (match query)

Recherchez tous les produits contenant le mot "bureau":

```bash
GET /products/_search
{
  "query": {
    "match": {
      "description": "bureau"
    }
  }
}
```

**Résultat attendu**: Devrait retourner le produit 3.

**Étape 4**: Recherche avec filtrage (bool query)

Recherchez les produits électroniques dont le prix est inférieur à 1000€:

```bash
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "category.keyword": "electronics" }}
      ],
      "filter": [
        { "range": { "price": { "lt": 1000 }}}
      ]
    }
  }
}
```

**Résultat attendu**: Devrait retourner les produits 1 et 4 (Smartphone, Clavier).

#### Critères de Succès

- ✅ Index `products` créé avec 5 documents
- ✅ Recherche "bureau" retourne 2 résultats
- ✅ Filtre prix <1000€ + category=electronics retourne 2 résultats
- ✅ `_count` retourne exactement 5 documents

#### Dépannage

**Problème**: "index_not_found_exception"
→ Vérifiez le nom de l'index (sensible à la casse)

**Problème**: Aucun résultat pour la recherche "bureau"
→ Vérifiez que les documents sont bien indexés avec `GET /products/_search`
→ Attendez 1 seconde (refresh interval par défaut) et réessayez

**Problème**: Filtre sur `category` ne fonctionne pas
→ Utilisez `category.keyword` au lieu de `category` pour une correspondance exacte

---
