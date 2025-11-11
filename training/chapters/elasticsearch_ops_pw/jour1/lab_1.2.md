## Lab 1.2: Définition de Mappings Explicites

**Topic**: Concepts Généraux - Mappings
**Durée Estimée**: 20-25 minutes
**Prérequis**: Lab 1.1 complété

### Objectif

Créer un index avec un mapping explicite pour contrôler précisément comment les données sont indexées et recherchables.

### Contexte

L'équipe marketing souhaite indexer des articles de blog avec des exigences spécifiques: recherche full-text sur le contenu, filtrage exact sur les tags, et recherche géographique sur la localisation de l'auteur.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Si l'index `blog_posts` existe déjà, supprimez-le: `DELETE /blog_posts`
2. Préparez le mapping en lisant la documentation: https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html

#### Étapes

**Étape 1**: Créer l'index avec mapping explicite

```bash
PUT /blog_posts
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "analysis": {
      "analyzer": {
        "french_analyzer": {
          "type": "french"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "french_analyzer",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "content": {
        "type": "text",
        "analyzer": "french_analyzer"
      },
      "author": {
        "type": "keyword"
      },
      "tags": {
        "type": "keyword"
      },
      "published_date": {
        "type": "date",
        "format": "yyyy-MM-dd"
      },
      "views": {
        "type": "integer"
      },
      "rating": {
        "type": "float"
      },
      "author_location": {
        "type": "geo_point"
      },
      "metadata": {
        "type": "object",
        "enabled": false
      }
    }
  }
}
```

**Résultat attendu**: `"acknowledged": true`

**Étape 2**: Indexer des articles de blog

```bash
POST /blog_posts/_doc/1
{
  "title": "Introduction à Elasticsearch",
  "content": "Elasticsearch est un moteur de recherche distribué basé sur Lucene",
  "author": "Jean Dupont",
  "tags": ["elasticsearch", "search", "tutorial"],
  "published_date": "2023-10-15",
  "views": 1250,
  "rating": 4.5,
  "author_location": {
    "lat": 48.8566,
    "lon": 2.3522
  }
}

POST /blog_posts/_doc/2
{
  "title": "Optimisation des Performances Elasticsearch",
  "content": "Découvrez les meilleures pratiques pour optimiser votre cluster",
  "author": "Marie Martin",
  "tags": ["elasticsearch", "performance", "optimization"],
  "published_date": "2023-11-01",
  "views": 890,
  "rating": 4.8,
  "author_location": {
    "lat": 45.764,
    "lon": 4.8357
  }
}

POST /blog_posts/_doc/3
{
  "title": "Sécurité dans Elasticsearch 8.x",
  "content": "La sécurité est activée par défaut dans Elasticsearch 8",
  "author": "Jean Dupont",
  "tags": ["elasticsearch", "security", "tutorial"],
  "published_date": "2023-11-10",
  "views": 2100,
  "rating": 4.9,
  "author_location": {
    "lat": 48.8566,
    "lon": 2.3522
  }
}
```

**Étape 3**: Tester les différents types de champs

**Test 1 - Recherche full-text** (type `text`):
```bash
GET /blog_posts/_search
{
  "query": {
    "match": {
      "content": "optimiser performances"
    }
  }
}
```
**Résultat attendu**: Document 2 retourné (analyseur French appliqué).

**Test 2 - Filtrage exact** (type `keyword`):
```bash
GET /blog_posts/_search
{
  "query": {
    "term": {
      "author": "Jean Dupont"
    }
  }
}
```
**Résultat attendu**: Documents 1 et 3 retournés.

**Test 3 - Recherche par date** (type `date`):
```bash
GET /blog_posts/_search
{
  "query": {
    "range": {
      "published_date": {
        "gte": "2023-11-01"
      }
    }
  }
}
```
**Résultat attendu**: Documents 1 et 3 retournés.

**Test 4 - Recherche géographique** (type `geo_point`):
```bash
GET /blog_posts/_search
{
  "query": {
    "geo_distance": {
      "distance": "50km",
      "author_location": {
        "lat": 48.8566,
        "lon": 2.3522
      }
    }
  }
}
```
**Résultat attendu**: Documents 1 et 3 retournés (auteurs à Paris).

**Étape 4**: Tenter d'ajouter un nouveau champ dynamique

```bash
POST /blog_posts/_doc/4
{
  "title": "Nouveau champ non mappé",
  "content": "Test de mapping dynamique",
  "author": "Test User",
  "tags": ["test"],
  "published_date": "2023-11-11",
  "views": 0,
  "rating": 3.0,
  "author_location": { "lat": 48.0, "lon": 2.0 },
  "new_field": "Cette valeur sera indexée dynamiquement"
}
```

Vérifiez le mapping après insertion:
```bash
GET /blog_posts/_mapping
```
**Observation**: `new_field` a été ajouté automatiquement au mapping (mapping dynamique activé par défaut).

#### Critères de Succès

- ✅ Index créé avec mapping explicite (7 champs)
- ✅ Recherche full-text fonctionne avec analyzer French
- ✅ Filtrage exact sur `author` retourne les bons documents
- ✅ Recherche géographique dans un rayon de 50km fonctionne
- ✅ Mapping visualisé montre les types corrects pour chaque champ

#### Dépannage

**Problème**: "mapper_parsing_exception" lors de la création
→ Vérifiez la syntaxe JSON du mapping
→ Assurez-vous que tous les types de champs sont valides

**Problème**: Recherche full-text ne retourne pas de résultats
→ Vérifiez que l'analyzer "french_analyzer" est bien défini dans les settings
→ Testez avec `_analyze` API

**Problème**: Recherche géographique échoue
→ Vérifiez le format des coordonnées: `{ "lat": X, "lon": Y }`
→ Assurez-vous que le type `geo_point` est bien défini

---
