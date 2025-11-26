# Cahier d'Exercices Pratiques - Elasticsearch Ops

Formation sur 3 jours - Exercices pratiques et ateliers

---

# Jour 1 - Fondamentaux et Architecture

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

**Résultat attendu**: Devrait retourner les produits 3 et 5 (Chaise de Bureau, Bureau Assis-Debout).

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

#### Validation

**Commandes de vérification**:

1. Compter le nombre total de documents:
```bash
GET /products/_count
```
**Résultat attendu**: `"count": 5`

2. Vérifier le mapping détecté automatiquement:
```bash
GET /products/_mapping
```
**Observations**: `name` et `description` devraient être de type `text`, `price` de type `float`, `category` de type `text` avec sous-champ `keyword`.

3. Rechercher tous les documents:
```bash
GET /products/_search
{
  "query": { "match_all": {} }
}
```
**Résultat attendu**: 5 hits retournés.

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

## Lab 1.2: Définition de Mappings Explicites

**Topic**: Concepts Généraux - Mappings
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
**Résultat attendu**: Documents 2 et 3 retournés.

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

#### Validation

**Commandes de vérification**:

1. Vérifier le mapping complet:
```bash
GET /blog_posts/_mapping
```
**Critères**: Tous les champs définis doivent être présents avec les bons types.

2. Vérifier l'analyzeur French:
```bash
GET /blog_posts/_analyze
{
  "analyzer": "french_analyzer",
  "text": "Les performances sont optimisées"
}
```
**Résultat attendu**: Les tokens générés doivent être sans accents et stemmed (ex: "perform", "optimis").

3. Compter les documents par tag:
```bash
GET /blog_posts/_search
{
  "size": 0,
  "aggs": {
    "tags_count": {
      "terms": { "field": "tags" }
    }
  }
}
```
**Résultat attendu**: Tag "elasticsearch" avec 3 documents.

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

## Lab 1.3: Agrégations de Données

**Topic**: Concepts Généraux - Agrégations
**Prérequis**: Lab 1.2 complété (index `blog_posts` existe)

### Objectif

Utiliser les agrégations Elasticsearch pour extraire des statistiques et analyser les données sans récupérer tous les documents.

### Contexte

L'équipe analytics souhaite obtenir des statistiques sur les articles de blog: moyenne des vues, distribution par auteur, tendance temporelle des publications, et meilleurs articles par rating.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Vérifiez que l'index `blog_posts` contient au moins 3-4 documents
2. Ajoutez quelques documents supplémentaires si nécessaire pour enrichir les stats

#### Étapes

**Étape 1**: Agrégation Metrics - Statistiques sur les vues

Calculez les statistiques (min, max, avg, sum) sur le champ `views`:

```bash
GET /blog_posts/_search
{
  "size": 0,
  "aggs": {
    "views_stats": {
      "stats": {
        "field": "views"
      }
    },
    "avg_views": {
      "avg": {
        "field": "views"
      }
    },
    "max_views": {
      "max": {
        "field": "views"
      }
    }
  }
}
```

**Résultat attendu**:
```json
{
  "aggregations": {
    "views_stats": {
      "count": 3,
      "min": 890.0,
      "max": 2100.0,
      "avg": 1413.33,
      "sum": 4240.0
    },
    "avg_views": { "value": 1413.33 },
    "max_views": { "value": 2100.0 }
  }
}
```

**Étape 2**: Agrégation Bucket - Distribution par auteur (Terms)

Groupez les articles par auteur et comptez combien chaque auteur a écrit:

```bash
GET /blog_posts/_search
{
  "size": 0,
  "aggs": {
    "articles_par_auteur": {
      "terms": {
        "field": "author",
        "size": 10
      }
    }
  }
}
```

**Résultat attendu**:
```json
{
  "aggregations": {
    "articles_par_auteur": {
      "buckets": [
        { "key": "Jean Dupont", "doc_count": 2 },
        { "key": "Marie Martin", "doc_count": 1 }
      ]
    }
  }
}
```

**Étape 3**: Agrégation Bucket - Histogramme temporel (Date Histogram)

Groupez les articles par mois de publication:

```bash
GET /blog_posts/_search
{
  "size": 0,
  "aggs": {
    "articles_par_mois": {
      "date_histogram": {
        "field": "published_date",
        "calendar_interval": "month",
        "format": "yyyy-MM"
      }
    }
  }
}
```

**Résultat attendu**: Buckets par mois (2023-10, 2023-11) avec doc_count.

**Étape 4**: Agrégations Imbriquées - Stats par auteur

Combinez une agrégation bucket (par auteur) avec des agrégations metrics (moyenne des vues et ratings):

```bash
GET /blog_posts/_search
{
  "size": 0,
  "aggs": {
    "stats_par_auteur": {
      "terms": {
        "field": "author",
        "size": 10
      },
      "aggs": {
        "avg_views": {
          "avg": { "field": "views" }
        },
        "avg_rating": {
          "avg": { "field": "rating" }
        },
        "total_views": {
          "sum": { "field": "views" }
        }
      }
    }
  }
}
```

**Résultat attendu**: Pour chaque auteur, moyenne des vues, moyenne du rating, et total des vues.

**Étape 5**: Pipeline Aggregation - Moyenne des moyennes

Calculez la moyenne des vues moyennes par auteur (agrégation sur agrégation):

```bash
GET /blog_posts/_search
{
  "size": 0,
  "aggs": {
    "stats_par_auteur": {
      "terms": {
        "field": "author"
      },
      "aggs": {
        "avg_views": {
          "avg": { "field": "views" }
        }
      }
    },
    "avg_of_avg_views": {
      "avg_bucket": {
        "buckets_path": "stats_par_auteur>avg_views"
      }
    }
  }
}
```

**Résultat attendu**: Valeur unique représentant la moyenne des moyennes.

#### Validation

**Commandes de vérification**:

1. Vérifier la distribution des tags:
```bash
GET /blog_posts/_search
{
  "size": 0,
  "aggs": {
    "tags_distribution": {
      "terms": {
        "field": "tags",
        "size": 20
      }
    }
  }
}
```
**Résultat attendu**: Tag "elasticsearch" doit être le plus fréquent.

2. Top 3 articles par nombre de vues:
```bash
GET /blog_posts/_search
{
  "size": 0,
  "aggs": {
    "top_articles": {
      "top_hits": {
        "size": 3,
        "_source": ["title", "views"],
        "sort": [{ "views": "desc" }]
      }
    }
  }
}
```

3. Filtrer puis agréger (articles avec rating >4.5):
```bash
GET /blog_posts/_search
{
  "size": 0,
  "query": {
    "range": {
      "rating": { "gte": 4.5 }
    }
  },
  "aggs": {
    "avg_views_good_rating": {
      "avg": { "field": "views" }
    }
  }
}
```

#### Critères de Succès

- ✅ Stats aggregation retourne min, max, avg, sum des vues
- ✅ Terms aggregation par auteur retourne les bons comptes
- ✅ Date histogram groupe les articles par mois
- ✅ Agrégations imbriquées retournent stats par auteur
- ✅ Pipeline aggregation calcule la moyenne des moyennes

#### Dépannage

**Problème**: "fielddata is disabled on text fields"
→ Utilisez le sous-champ `.keyword` pour agréger: `"field": "title.keyword"`

**Problème**: Résultats d'agrégation vides
→ Vérifiez que des documents existent: `GET /blog_posts/_count`
→ Vérifiez le nom du champ: `GET /blog_posts/_mapping`

**Problème**: Pipeline aggregation retourne null
→ Vérifiez que `buckets_path` pointe vers la bonne agrégation parent>child

---

## 🌟 Bonus 1.A: Optimisation du Scoring de Recherche

**Niveau**: Avancé
**Prérequis**: Lab 1.1 et 1.2 complétés

### Objectif

Personnaliser le scoring de pertinence en utilisant des requêtes pondérées et `function_score` pour prioriser certains documents.

### Contexte

L'équipe marketing veut que les articles récents avec un bon rating apparaissent plus haut dans les résultats de recherche, même s'ils matchent moins bien le terme recherché.

### Challenge

**Partie 1**: Requête avec poids personnalisés (Boosting)

Créez une requête qui recherche "elasticsearch" mais donne plus de poids aux articles dont le titre contient le terme:

```bash
GET /blog_posts/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "content": {
              "query": "elasticsearch",
              "boost": 1.0
            }
          }
        },
        {
          "match": {
            "title": {
              "query": "elasticsearch",
              "boost": 3.0
            }
          }
        }
      ]
    }
  }
}
```

**Observation**: Comparez les scores avec et sans boost.

**Partie 2**: Function Score - Boost basé sur le rating

Utilisez `function_score` pour multiplier le score par le rating de l'article:

```bash
GET /blog_posts/_search
{
  "query": {
    "function_score": {
      "query": {
        "match": { "content": "elasticsearch" }
      },
      "functions": [
        {
          "field_value_factor": {
            "field": "rating",
            "factor": 1.2,
            "modifier": "sqrt",
            "missing": 1
          }
        }
      ],
      "boost_mode": "multiply",
      "score_mode": "sum"
    }
  }
}
```

**Partie 3**: Decay Function - Favoriser les articles récents

Utilisez une fonction de décroissance temporelle pour favoriser les publications récentes:

```bash
GET /blog_posts/_search
{
  "query": {
    "function_score": {
      "query": {
        "match_all": {}
      },
      "functions": [
        {
          "gauss": {
            "published_date": {
              "origin": "2023-11-11",
              "scale": "30d",
              "decay": 0.5
            }
          }
        }
      ]
    }
  }
}
```

**Explication**: Les articles publiés il y a 30 jours auront un score réduit de 50%.

### Validation

Créez une requête combinée qui:
1. Recherche le terme "elasticsearch"
2. Boost les titres (×3)
3. Multiplie le score par le rating
4. Favorise les articles récents

```bash
GET /blog_posts/_search
{
  "query": {
    "function_score": {
      "query": {
        "bool": {
          "should": [
            { "match": { "content": { "query": "elasticsearch", "boost": 1.0 }}},
            { "match": { "title": { "query": "elasticsearch", "boost": 3.0 }}}
          ]
        }
      },
      "functions": [
        {
          "field_value_factor": {
            "field": "rating",
            "factor": 1.2
          }
        },
        {
          "gauss": {
            "published_date": {
              "origin": "2023-11-11",
              "scale": "30d",
              "decay": 0.5
            }
          }
        }
      ],
      "score_mode": "multiply",
      "boost_mode": "multiply"
    }
  }
}
```

**Critère de succès**: L'article le plus récent avec le meilleur rating devrait apparaître en premier.

---

## 🌟 Bonus 1.B: Mappings Nested et Parent-Child

**Niveau**: Avancé
**Prérequis**: Lab 1.2 complété

### Objectif

Maîtriser les mappings complexes pour gérer des relations entre objets (nested) et entre documents (parent-child).

### Contexte

Vous devez modéliser un système de blog avec commentaires. Deux approches possibles: nested objects (commentaires embarqués dans l'article) ou parent-child (commentaires comme documents séparés).

### Challenge

**Partie 1**: Mapping Nested Objects

Créez un index avec des commentaires nested:

```bash
PUT /blog_with_comments
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "content": { "type": "text" },
      "author": { "type": "keyword" },
      "comments": {
        "type": "nested",
        "properties": {
          "user": { "type": "keyword" },
          "message": { "type": "text" },
          "date": { "type": "date" },
          "rating": { "type": "integer" }
        }
      }
    }
  }
}
```

Indexez un article avec commentaires:

```bash
POST /blog_with_comments/_doc/1
{
  "title": "Elasticsearch Nested Objects",
  "content": "Les objets nested permettent de préserver les relations",
  "author": "Jean Dupont",
  "comments": [
    {
      "user": "Alice",
      "message": "Excellent article!",
      "date": "2023-11-10",
      "rating": 5
    },
    {
      "user": "Bob",
      "message": "Très utile",
      "date": "2023-11-11",
      "rating": 4
    }
  ]
}
```

Recherchez des articles avec des commentaires spécifiques (nested query):

```bash
GET /blog_with_comments/_search
{
  "query": {
    "nested": {
      "path": "comments",
      "query": {
        "bool": {
          "must": [
            { "match": { "comments.message": "excellent" }},
            { "range": { "comments.rating": { "gte": 4 }}}
          ]
        }
      }
    }
  }
}
```

**Partie 2**: Nested Aggregations

Agrégez sur les commentaires nested (moyenne des ratings):

```bash
GET /blog_with_comments/_search
{
  "size": 0,
  "aggs": {
    "comments_agg": {
      "nested": {
        "path": "comments"
      },
      "aggs": {
        "avg_comment_rating": {
          "avg": { "field": "comments.rating" }
        },
        "top_commenters": {
          "terms": { "field": "comments.user" }
        }
      }
    }
  }
}
```

**Partie 3**: Comparaison avec Array d'Objects Standards

Créez le même index SANS nested (type object standard):

```bash
PUT /blog_flat_comments
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "comments": {
        "properties": {
          "user": { "type": "keyword" },
          "message": { "type": "text" },
          "rating": { "type": "integer" }
        }
      }
    }
  }
}
```

Indexez les mêmes données et essayez la même requête (sans `nested`):

```bash
GET /blog_flat_comments/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "comments.message": "excellent" }},
        { "range": { "comments.rating": { "gte": 4 }}}
      ]
    }
  }
}
```

**Observation**: Sans `nested`, Elasticsearch peut matcher "excellent" d'un commentaire et rating ≥4 d'un AUTRE commentaire (cross-matching). Avec `nested`, la relation est préservée.

### Validation

**Question 1**: Quand utiliser `nested` vs `object` standard?
- **nested**: Quand il est important de préserver les relations entre champs d'un objet
- **object**: Quand les champs sont indépendants ou quand on agrège sur tous les objets ensemble

**Question 2**: Quelle est la limitation principale de `nested`?
- Limite par défaut de 50 nested objects par document (configurable avec `index.mapping.nested_objects.limit`)
- Overhead de performance pour indexation et recherche

**Critère de succès**: 
- Comprendre la différence entre nested et object standard
- Savoir écrire une nested query et une nested aggregation

---

## Lab 2.1: Formation d'un Cluster Multi-Nœuds

**Topic**: Installation et Configuration - Formation de Cluster
**Prérequis**: Un nœud Elasticsearch 8.x déjà démarré

### Objectif

Démarrer un second nœud Elasticsearch et le joindre au cluster existant en utilisant les enrollment tokens pour former un cluster multi-nœuds sécurisé.

### Contexte

Votre cluster à nœud unique doit évoluer pour supporter plus de charge et assurer la haute disponibilité. Vous allez ajouter un second nœud en utilisant les mécanismes de sécurité automatique d'Elasticsearch 8.x.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Vérifiez que le premier nœud est en cours d'exécution: `GET /`
2. Notez le `cluster_name` du nœud actuel: `GET /_cluster/health`
3. Préparez un second terminal pour le nouveau nœud

#### Étapes

**Étape 1**: Générer un enrollment token

Depuis le premier nœud, générez un token d'enrollment pour permettre à un nouveau nœud de rejoindre le cluster:

```bash
cd /path/to/elasticsearch
bin/elasticsearch-create-enrollment-token -s node
```

**Résultat attendu**: Un token long (JWT) sera affiché:
```
eyJ2ZXIiOiI4LjAuMCIsImFkciI6WyIxOTIuMTY4LjEuMTA6OTIwMCJdLCJmZ3IiOiJhYmMxMjMuLi4iLCJrZXkiOiJ4eXo3ODkuLi4ifQ==
```

**Note**: Ce token expire après 30 minutes. Si expiré, régénérez-en un nouveau.

**Étape 2**: Préparer le répertoire du second nœud

Créez un nouveau répertoire pour le second nœud (pour simulation locale):

```bash
# Option 1: Copier l'installation Elasticsearch
cp -r elasticsearch-8.x elasticsearch-node2

# Option 2: Utiliser la même installation avec des répertoires data séparés
# (configuration via elasticsearch.yml)
```

**Étape 3**: Démarrer le second nœud avec l'enrollment token

Démarrez le nouveau nœud en passant le token:

```bash
cd elasticsearch-node2
bin/elasticsearch --enrollment-token <VOTRE_TOKEN>
```

**Résultat attendu**: Le nœud démarre et affiche des logs indiquant:
```
[INFO ][o.e.n.Node] [node-2] started
[INFO ][o.e.c.s.ClusterApplierService] [node-2] detected_master {node-1}{...}
```

**Étape 4**: Vérifier la formation du cluster

Vérifiez que les deux nœuds sont visibles dans le cluster:

```bash
GET /_cat/nodes?v
```

**Résultat attendu**:
```
ip           heap.percent ram.percent cpu load_1m node.role master name
192.168.1.10 45           60          2   0.50    cdfhilmrstw *      node-1
192.168.1.11 30           55          1   0.40    cdfhilmrstw -      node-2
```

L'astérisque (*) indique le nœud master élu.

**Étape 5**: Vérifier le statut du cluster

Vérifiez que le cluster est passé en statut `green`:

```bash
GET /_cluster/health
```

**Résultat attendu**:
```json
{
  "cluster_name": "elasticsearch",
  "status": "green",
  "number_of_nodes": 2,
  "number_of_data_nodes": 2,
  "active_primary_shards": 5,
  "active_shards": 10,
  "unassigned_shards": 0
}
```

**Pourquoi `green` ?** Avec 2 nœuds, les replicas des shards peuvent maintenant être alloués sur le second nœud (réplication fonctionnelle).

#### Validation

**Commandes de vérification**:

1. Lister tous les nœuds avec leurs rôles:
```bash
GET /_cat/nodes?v&h=name,ip,node.role,master,heap.percent,ram.percent
```

2. Vérifier l'allocation des shards entre les nœuds:
```bash
GET /_cat/shards?v
```
**Observation**: Les shards primaires et replicas doivent être répartis entre les 2 nœuds.

3. Vérifier les détails du cluster:
```bash
GET /_cluster/stats?human&pretty
```
**Résultat attendu**: `"number_of_nodes": 2`

4. Tester la résilience (optionnel):
```bash
# Créer un index avec 1 replica
PUT /test-resilience
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}

# Vérifier l'allocation
GET /_cat/shards/test-resilience?v
```
**Observation**: Chaque shard primaire a un replica sur l'autre nœud.

#### Critères de Succès

- ✅ Enrollment token généré avec succès
- ✅ Second nœud démarré et rejoint le cluster
- ✅ `GET /_cat/nodes` affiche 2 nœuds
- ✅ Cluster status = `green`
- ✅ Shards répliqués sur les deux nœuds

#### Dépannage

**Problème**: "Enrollment token has expired"
→ Le token expire après 30 minutes. Régénérez-en un nouveau avec `elasticsearch-create-enrollment-token -s node`

**Problème**: Le second nœud démarre mais ne rejoint pas le cluster
→ Vérifiez la connectivité réseau entre les nœuds (port 9300 pour transport)
→ Vérifiez les logs du second nœud: `tail -f logs/elasticsearch.log`
→ Assurez-vous que `cluster.name` est identique sur les deux nœuds

**Problème**: Cluster reste en statut `yellow`
→ Normal si vous n'avez qu'un seul nœud et des replicas configurés
→ Avec 2 nœuds, vérifiez qu'aucun shard n'est unassigned: `GET /_cat/shards?h=index,shard,prirep,state,unassigned.reason`

**Problème**: "security_exception" lors de requêtes API
→ Elasticsearch 8.x active la sécurité par défaut. Utilisez les credentials générés au premier démarrage
→ Ou désactivez temporairement: `xpack.security.enabled: false` (NON recommandé en production)

---

## Lab 2.2: Configuration des Rôles de Nœuds

**Topic**: Installation et Configuration - Rôles de Nœuds
**Prérequis**: Lab 2.1 complété (cluster à 2 nœuds)

### Objectif

Configurer un nœud avec des rôles spécifiques (master-only, data-only) en modifiant `elasticsearch.yml` pour optimiser l'architecture du cluster.

### Contexte

Votre cluster grandit et vous souhaitez séparer les responsabilités: nœuds master dédiés pour la gestion du cluster, et nœuds data dédiés pour le stockage. Cette séparation améliore la stabilité et les performances.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Arrêtez le second nœud (celui démarré dans Lab 2.1)
2. Localisez le fichier `config/elasticsearch.yml` du second nœud
3. Faites une sauvegarde: `cp elasticsearch.yml elasticsearch.yml.backup`

#### Étapes

**Étape 1**: Configurer un nœud data-only

Éditez `elasticsearch.yml` du second nœud pour en faire un nœud data-only:

```yaml
# config/elasticsearch.yml (node-2)

cluster.name: elasticsearch
node.name: data-node-1

# Définir les rôles (data uniquement, pas master)
node.roles: [ data, ingest ]

# Configuration réseau (ajustez selon votre environnement)
network.host: 0.0.0.0
http.port: 9201
transport.port: 9301

# Découverte
discovery.seed_hosts: ["localhost:9300"]
```

**Explication des rôles**:
- `data`: Stockage et recherche de données
- `ingest`: Preprocessing de documents (pipelines)
- Absence de `master`: Ce nœud ne participera PAS à l'élection du master

**Étape 2**: Redémarrer le nœud avec la nouvelle configuration

```bash
bin/elasticsearch
```

**Résultat attendu**: Le nœud démarre et rejoint le cluster avec ses nouveaux rôles.

**Étape 3**: Vérifier les rôles des nœuds

```bash
GET /_cat/nodes?v&h=name,node.role,master
```

**Résultat attendu**:
```
name         node.role   master
node-1       cdfhilmrstw *
data-node-1  di          -
```

**Légende des rôles**:
- `c` = cold_data
- `d` = data
- `f` = frozen_data
- `h` = hot_data
- `i` = ingest
- `l` = ml (machine learning)
- `m` = master
- `r` = remote_cluster_client
- `s` = content_data
- `t` = transform
- `w` = warm_data

**Étape 4**: Créer un nœud master-only (simulation)

Si vous avez un troisième environnement, configurez un nœud master-only:

```yaml
# config/elasticsearch.yml (node-3)

cluster.name: elasticsearch
node.name: master-node-1

# Master uniquement
node.roles: [ master ]

network.host: 0.0.0.0
http.port: 9202
transport.port: 9302

discovery.seed_hosts: ["localhost:9300", "localhost:9301"]
cluster.initial_master_nodes: ["node-1", "master-node-1"]
```

**Ressources recommandées**:
- Master-only: 2-4 cores, 8 GB RAM, 50 GB disque
- Data-only: 8-16 cores, 64 GB RAM, 1+ TB disque SSD

**Étape 5**: Vérifier l'allocation des shards

Vérifiez que les shards ne sont alloués QUE sur les nœuds data:

```bash
GET /_cat/shards?v&h=index,shard,prirep,state,node
```

**Résultat attendu**: Tous les shards doivent être sur `data-node-1` ou `node-1` (si node-1 a le rôle `data`).

#### Validation

**Commandes de vérification**:

1. Détails complets des rôles:
```bash
GET /_nodes?filter_path=nodes.*.name,nodes.*.roles
```

**Résultat attendu**:
```json
{
  "nodes": {
    "abc123": {
      "name": "node-1",
      "roles": ["master", "data", "ingest", ...]
    },
    "def456": {
      "name": "data-node-1",
      "roles": ["data", "ingest"]
    }
  }
}
```

2. Vérifier que le nœud master-only ne stocke PAS de données:
```bash
GET /_cat/allocation?v&h=node,shards,disk.used
```

**Observation**: Un nœud master-only doit avoir `shards: 0`.

3. Tester l'élection du master:
```bash
GET /_cat/master?v
```
**Résultat attendu**: Seuls les nœuds avec rôle `master` peuvent être élus.

#### Critères de Succès

- ✅ Nœud data-only configuré avec `node.roles: [data, ingest]`
- ✅ `_cat/nodes` affiche les rôles corrects pour chaque nœud
- ✅ Shards ne sont PAS alloués sur les nœuds master-only
- ✅ Cluster fonctionne normalement après changement de rôles

#### Dépannage

**Problème**: Nœud refuse de démarrer après changement de rôles
→ Vérifiez la syntaxe YAML (indentation, pas de tabs)
→ Consultez les logs: `tail -f logs/elasticsearch.log`
→ Erreur commune: `cluster.initial_master_nodes` doit être retiré après la première initialisation

**Problème**: Shards restent sur le nœud master-only
→ Les shards existants ne migrent pas automatiquement. Forcez la réallocation:
```bash
POST /_cluster/reroute
```

**Problème**: "master_not_discovered_exception"
→ Au moins un nœud avec rôle `master` doit être actif
→ Vérifiez `discovery.seed_hosts` pour que les nœuds se trouvent

---

## Lab 2.3: Inspection du Cluster avec les _cat APIs

**Topic**: Installation et Configuration - APIs de Vérification
**Prérequis**: Lab 2.1 complété (cluster à 2+ nœuds)

### Objectif

Maîtriser les _cat APIs pour inspecter rapidement l'état du cluster, des indices, des shards, et de l'allocation de ressources.

### Contexte

En tant qu'administrateur, vous devez diagnostiquer régulièrement l'état du cluster. Les _cat APIs fournissent une vue concise et lisible pour identifier rapidement les problèmes.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Assurez-vous que votre cluster a au moins 2 nœuds actifs
2. Créez quelques index de test avec des données:

```bash
# Créer un index avec 2 shards, 1 replica
PUT /logs-2023.11
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}

# Indexer quelques documents
POST /logs-2023.11/_bulk
{"index":{}}
{"message":"Log entry 1","timestamp":"2023-11-10T10:00:00"}
{"index":{}}
{"message":"Log entry 2","timestamp":"2023-11-10T10:01:00"}
{"index":{}}
{"message":"Log entry 3","timestamp":"2023-11-10T10:02:00"}
```

#### Étapes

**Étape 1**: Lister tous les indices avec _cat/indices

```bash
GET /_cat/indices?v
```

**Résultat attendu**:
```
health status index        pri rep docs.count store.size
green  open   logs-2023.11   2   1          3       15kb
green  open   products       1   0          5       10kb
```

**Colonnes clés**:
- `health`: green/yellow/red
- `pri`: Nombre de shards primaires
- `rep`: Nombre de replicas
- `docs.count`: Nombre de documents
- `store.size`: Taille totale (primaires + replicas)

**Étape 2**: Filtrer et trier les indices

Afficher uniquement les indices avec plus de 10 GB, triés par taille:

```bash
GET /_cat/indices?v&s=store.size:desc&h=index,health,docs.count,store.size
```

**Personnalisation**:
- `s=colonne:desc`: Tri par colonne (desc ou asc)
- `h=col1,col2`: Sélection des colonnes à afficher
- `v`: Affiche les headers (verbose)

**Étape 3**: Inspecter l'allocation des shards avec _cat/shards

```bash
GET /_cat/shards?v
```

**Résultat attendu**:
```
index        shard prirep state   node
logs-2023.11 0     p      STARTED node-1
logs-2023.11 0     r      STARTED data-node-1
logs-2023.11 1     p      STARTED data-node-1
logs-2023.11 1     r      STARTED node-1
```

**Colonnes clés**:
- `prirep`: `p` (primary) ou `r` (replica)
- `state`: STARTED, RELOCATING, INITIALIZING, UNASSIGNED
- `node`: Nœud hébergeant le shard

**Étape 4**: Identifier les shards problématiques

Filtrer uniquement les shards UNASSIGNED:

```bash
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason | grep UNASSIGNED
```

**Raisons d'unassignment courantes**:
- `INDEX_CREATED`: Nouveau shard, allocation en cours
- `NODE_LEFT`: Nœud déconnecté, réallocation nécessaire
- `REPLICA_ADDED`: Replica ajouté, recherche de nœud disponible
- `ALLOCATION_FAILED`: Échec d'allocation (disque plein, règles d'allocation)

**Étape 5**: Vérifier l'utilisation disque avec _cat/allocation

```bash
GET /_cat/allocation?v
```

**Résultat attendu**:
```
shards disk.indices disk.used disk.avail disk.total node
     4         15kb      2gb       48gb       50gb node-1
     4         15kb      1.5gb     48.5gb     50gb data-node-1
```

**Métriques clés**:
- `shards`: Nombre de shards sur ce nœud
- `disk.used`: Espace disque utilisé
- `disk.avail`: Espace disque disponible
- `disk.total`: Capacité disque totale

**Alerte**: Si `disk.used` >85%, le watermark LOW est atteint (plus de nouveaux shards).

**Étape 6**: Surveiller les pending tasks avec _cat/pending_tasks

```bash
GET /_cat/pending_tasks?v
```

**Résultat attendu** (si aucune tâche en attente):
```
insertOrder timeInQueue priority source
```

**Si des tâches sont en attente**:
```
insertOrder timeInQueue priority source
       1234        10s     URGENT  shard-started
```

**Interprétation**: Des pending tasks avec `timeInQueue` >10s indiquent un master surchargé.

#### Validation

**Commandes de vérification**:

1. Comparer _cat/indices et _cat/shards pour un index:
```bash
GET /_cat/indices/logs-2023.11?v
GET /_cat/shards/logs-2023.11?v
```
**Vérification**: `pri × (1 + rep)` = nombre total de shards dans _cat/shards.

2. Exporter les résultats en JSON (pour scripts):
```bash
GET /_cat/nodes?format=json
GET /_cat/indices?format=json&pretty
```

3. Utiliser help pour découvrir toutes les colonnes disponibles:
```bash
GET /_cat/indices?help
GET /_cat/nodes?help
```

**Exemple de sortie**:
```
health                | h                              | current health status
status                | s                              | open/close status
index                 | i,idx                          | index name
...
```

#### Critères de Succès

- ✅ _cat/indices liste tous les indices avec santé et taille
- ✅ _cat/shards montre l'allocation des shards entre nœuds
- ✅ _cat/allocation affiche l'utilisation disque par nœud
- ✅ Capable de filtrer et trier les résultats avec `?h=` et `?s=`
- ✅ Capable d'identifier les shards UNASSIGNED et leur raison

#### Dépannage

**Problème**: "No handler found for uri [/_cat/...]"
→ Vérifiez l'orthographe de l'API (sensible à la casse)
→ Exemple correct: `/_cat/indices` (pas `/_cat/index`)

**Problème**: Colonnes désalignées dans la sortie
→ Utilisez `?v` pour afficher les headers
→ Utilisez `?format=json` pour une sortie structurée

**Problème**: Trop de colonnes, sortie illisible
→ Utilisez `?h=col1,col2,col3` pour sélectionner uniquement les colonnes nécessaires
→ Exemple: `GET /_cat/nodes?v&h=name,heap.percent,ram.percent,cpu,load_1m`

---

## 🌟 Bonus 2.A: Shard Allocation Awareness

**Niveau**: Avancé
**Prérequis**: Lab 2.1 et 2.2 complétés

### Objectif

Configurer la "shard allocation awareness" pour répartir intelligemment les shards en fonction d'attributs personnalisés (zone de disponibilité, rack serveur) et forcer la relocation de shards.

### Contexte

Votre cluster Elasticsearch est déployé sur plusieurs zones de disponibilité (AZ1, AZ2, AZ3). Vous souhaitez garantir que les replicas ne sont JAMAIS sur la même zone que leur primaire (résilience aux pannes de zone).

### Challenge

**Partie 1**: Définir des attributs personnalisés

Éditez `elasticsearch.yml` de chaque nœud pour définir un attribut `zone`:

```yaml
# Nœud 1 (AZ1)
node.name: node-az1
node.attr.zone: az1

# Nœud 2 (AZ2)
node.name: node-az2
node.attr.zone: az2

# Nœud 3 (AZ3 - optionnel)
node.name: node-az3
node.attr.zone: az3
```

Redémarrez les nœuds pour appliquer la configuration.

**Vérification**:
```bash
GET /_cat/nodeattrs?v&h=node,attr,value
```

**Résultat attendu**:
```
node      attr  value
node-az1  zone  az1
node-az2  zone  az2
node-az3  zone  az3
```

**Partie 2**: Activer la shard allocation awareness

Configurez le cluster pour être "aware" de l'attribut `zone`:

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": "zone"
  }
}
```

**Effet**: Elasticsearch évitera de placer un replica sur le même `zone` que son primaire.

**Partie 3**: Forcer l'allocation avec forced awareness

Pour garantir qu'au moins un shard est dans chaque zone:

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": "zone",
    "cluster.routing.allocation.awareness.force.zone.values": "az1,az2,az3"
  }
}
```

**Effet**: Si une zone devient indisponible, Elasticsearch NE réallouera PAS les replicas manquants sur les autres zones (attend le retour de la zone).

**Partie 4**: Créer un index et vérifier la distribution

```bash
PUT /zone-aware-index
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}

# Vérifier l'allocation
GET /_cat/shards/zone-aware-index?v&h=index,shard,prirep,state,node
```

**Observation**: Pour chaque shard primaire, son replica est sur un nœud avec un `zone` différent.

**Partie 5**: Forcer la relocation d'un shard

Identifiez un shard à déplacer:

```bash
GET /_cat/shards/zone-aware-index?v&h=index,shard,prirep,node
```

Forcez la relocation d'un shard primaire du nœud A vers le nœud B:

```bash
POST /_cluster/reroute
{
  "commands": [
    {
      "move": {
        "index": "zone-aware-index",
        "shard": 0,
        "from_node": "node-az1",
        "to_node": "node-az2"
      }
    }
  ]
}
```

**Résultat attendu**: Le shard 0 commence à se déplacer (état RELOCATING), puis atteint STARTED sur node-az2.

**Suivi de la relocation**:
```bash
GET /_cat/recovery/zone-aware-index?v&h=index,shard,stage,source_node,target_node
```

**Partie 6**: Exclure un nœud de l'allocation

Simulez la mise en maintenance d'un nœud en excluant tous les shards:

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.exclude._name": "node-az1"
  }
}
```

**Effet**: Tous les shards quittent `node-az1` et sont réalloués sur les autres nœuds.

**Retour à la normale**:
```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.exclude._name": null
  }
}
```

### Validation

**Questions à répondre**:

1. **Quelle est la différence entre `awareness` et `forced awareness` ?**
   - `awareness`: Préférence, Elasticsearch essaie de respecter les zones mais réallouera ailleurs si nécessaire
   - `forced awareness`: Strict, Elasticsearch refuse de réallouer si la zone cible n'est pas disponible

2. **Quand utiliser `cluster.routing.allocation.exclude` ?**
   - Mise en maintenance d'un nœud (vidage des shards avant arrêt)
   - Retrait progressif d'un nœud du cluster
   - Isolation d'un nœud problématique

3. **Comment annuler une relocation manuelle ?**
   - Utilisez `cancel` dans `_cluster/reroute`:
   ```bash
   POST /_cluster/reroute
   {
     "commands": [
       {
         "cancel": {
           "index": "zone-aware-index",
           "shard": 0,
           "node": "node-az2"
         }
       }
     ]
   }
   ```

**Critère de succès**: 
- Comprendre les stratégies d'allocation awareness
- Savoir forcer la relocation de shards manuellement
- Maîtriser l'exclusion de nœuds pour maintenance

---


---

# Jour 2 - Performance, Optimisation et Production

## Lab 3.1: Dimensionnement de Cluster - Calcul du Nombre de Shards

**Topic**: Performance et Dimensionnement - Planification de Capacité
**Prérequis**: Compréhension des concepts de shards et replicas

### Objectif

Apprendre à calculer le nombre optimal de shards pour un cas d'usage donné en prenant en compte le volume de données, la croissance, et les contraintes de performance.

### Contexte

Vous êtes chargé de dimensionner un cluster Elasticsearch pour un système de logs applicatifs. L'équipe vous fournit les exigences suivantes et vous devez déterminer la configuration optimale.

### Exercice de Base

#### Scénario

**Cas d'usage**: Logs d'application e-commerce

**Exigences**:
- Volume initial: 500 GB de logs
- Croissance: 50 GB/jour (nouveaux logs)
- Rétention: 30 jours
- Replicas: 1 (haute disponibilité)
- Taux d'indexation: 10,000 documents/seconde (pics)
- Taux de recherche: 100 requêtes/seconde
- Latence cible: p95 < 200ms pour les recherches

**Infrastructure disponible**:
- Nœuds data: 5 nœuds
- CPU par nœud: 16 cores
- RAM par nœud: 64 GB (31 GB heap, 33 GB OS cache)
- Disque par nœud: 2 TB SSD

#### Setup (Si Lab 2.x non fait)

Ce lab est un exercice de calcul et de conception (papier/crayon ou tableur). Il ne nécessite pas de cluster actif, mais comprendre l'architecture d'un cluster (Lab 2.1/2.2) aide grandement.

#### Étapes

**Étape 1**: Calculer le volume total après 30 jours

```
Volume initial:     500 GB
Croissance (30j):   50 GB/jour × 30 = 1,500 GB
Volume total:       500 + 1,500 = 2,000 GB
```

Avec 1 replica (×2):
```
Volume avec replicas: 2,000 GB × 2 = 4,000 GB
```

**Étape 2**: Déterminer la taille cible d'un shard

**Règles de sizing**:
- ✅ Taille optimale: 10-50 GB par shard
- ⚠️ Maximum recommandé: 50 GB (au-delà, performance dégradée)
- ⚠️ Minimum recommandé: 1 GB (trop de petits shards = overhead)

**Choix**: 30 GB par shard (milieu de la plage optimale)

**Étape 3**: Calculer le nombre de shards primaires nécessaires

```
Nombre de shards primaires = Volume total (sans replicas) / Taille cible par shard
                            = 2,000 GB / 30 GB
                            = 66.67
                            ≈ 67 shards primaires
```

**Étape 4**: Vérifier la contrainte de shards par nœud

**Règle**: Maximum 20 shards par GB de heap JVM

```
Heap par nœud:       31 GB
Max shards/nœud:     31 GB × 20 = 620 shards
Shards totaux:       67 primaires + 67 replicas = 134 shards
Shards par nœud:     134 / 5 nœuds = 26.8 ≈ 27 shards/nœud
```

**Validation**: 27 shards/nœud << 620 max → ✅ OK

**Étape 5**: Stratégie d'indexation - Index par jour (Time-Based Indices)

Au lieu d'un seul gros index, utilisez des index quotidiens:

```
Pattern: logs-YYYY.MM.DD
Exemple: logs-2023.11.10

Volume par jour:     50 GB
Taille par shard:    30 GB
Shards par index:    50 / 30 = 1.67 ≈ 2 shards primaires par index
```

**Configuration recommandée**:
```bash
# Template pour tous les index logs-*
PUT /_index_template/logs-template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "refresh_interval": "5s"
    }
  }
}
```

**Avantages**:
- ✅ Suppression facile des vieux logs (DELETE index entier)
- ✅ Réduction de la taille de l'index (recherches plus rapides)
- ✅ Gestion ILM simplifiée (Index Lifecycle Management)

**Étape 6**: Valider avec les contraintes de performance

**Indexation**:
```
Taux cible:          10,000 docs/sec
Nombre de nœuds:     5
Load par nœud:       2,000 docs/sec
```
Avec 16 cores/nœud, chaque core gère ~125 docs/sec → ✅ Faisable

**Recherche**:
```
Taux cible:          100 requêtes/sec
Shards actifs/jour:  2 primaires + 2 replicas = 4 shards
```
Latence dépend de la complexité des requêtes, mais avec SSD et cache OS: ✅ p95 < 200ms atteignable

#### Validation

**Formule de vérification finale**:

```
Volume total (30j avec replicas) = 4,000 GB
Capacité cluster (5 × 2TB)       = 10,000 GB (10 TB)
Utilisation disque               = 4,000 / 10,000 = 40%
```

**Marge de sécurité**: 60% disponible → ✅ Excellent (recommandé >20%)

**Vérification des watermarks**:
```
Disk usage:          40%
Watermark LOW:       85% (pas encore atteint)
Watermark HIGH:      90% (safe)
Watermark FLOOD:     95% (safe)
```

**Tableau récapitulatif**:

| Métrique | Valeur | Validation |
|----------|--------|------------|
| Volume total (avec replicas) | 4,000 GB | ✅ |
| Shards primaires par jour | 2 | ✅ |
| Shards totaux (30 jours) | 120 (60p + 60r) | ✅ |
| Shards par nœud | 24 | ✅ (< 620 max) |
| Utilisation disque | 40% | ✅ (< 85%) |
| Indexation par nœud | 2,000 docs/sec | ✅ |
| Latence recherche (estimée) | < 200ms (p95) | ✅ |

#### Critères de Succès

- ✅ Volume total calculé correctement (4 TB avec replicas)
- ✅ Taille de shard dans la plage optimale (30 GB)
- ✅ Nombre de shards par nœud < 620 (règle 20/GB heap)
- ✅ Utilisation disque < 85% (watermark safe)
- ✅ Stratégie time-based indices adoptée (logs-YYYY.MM.DD)

#### Dépannage

**Problème**: Trop de shards (>1000 dans le cluster)
→ Augmentez la taille cible par shard (40-50 GB au lieu de 30 GB)
→ Réduisez la rétention (20 jours au lieu de 30)
→ Utilisez ILM pour forcer-merger les vieux index (réduire les segments)

**Problème**: Disque plein trop rapidement
→ Activez la compression: `"index.codec": "best_compression"`
→ Réduisez le nombre de replicas sur les index anciens (0 replica après 7 jours)
→ Archivez dans S3 avec searchable snapshots (Elasticsearch 7.10+)

**Problème**: Latence de recherche >200ms
→ Réduisez le nombre de shards (moins de shards à interroger)
→ Utilisez des filtres cachés (bool query avec filter context)
→ Ajoutez du routing pour limiter les shards scannés

---

## Lab 3.2: Configuration du Heap JVM

**Topic**: Performance et Dimensionnement - Configuration Système
**Prérequis**: Accès au serveur Elasticsearch, droits root/sudo

### Objectif

Configurer correctement le heap JVM d'Elasticsearch en respectant les règles de sizing (50% RAM, max 32GB, Xms=Xmx) et vérifier l'application de la configuration.

### Contexte

Votre serveur Elasticsearch dispose de 64 GB de RAM. Vous devez configurer le heap JVM de manière optimale pour équilibrer la mémoire entre le heap (JVM) et le cache OS (filesystem cache).

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Vérifiez la RAM totale du serveur:
```bash
free -h
# ou
cat /proc/meminfo | grep MemTotal
```

2. Localisez le fichier `jvm.options`:
```bash
# Installation par package (Debian/Ubuntu)
/etc/elasticsearch/jvm.options

# Installation par archive
config/jvm.options
```

3. Arrêtez Elasticsearch:
```bash
sudo systemctl stop elasticsearch
# ou
bin/elasticsearch stop
```

#### Étapes

**Étape 1**: Calculer le heap optimal

**Règles de sizing**:
1. ✅ **50% de la RAM**: Le heap doit être au maximum 50% de la RAM physique
2. ✅ **Maximum 32 GB**: Ne jamais dépasser 32 GB (limite compressed oops)
3. ✅ **Xms = Xmx**: Les deux valeurs doivent être identiques (évite resizing)

**Pour un serveur avec 64 GB de RAM**:
```
RAM totale:          64 GB
50% de la RAM:       32 GB
Maximum recommandé:  32 GB

Heap configuré:      31 GB (laisse 1 GB de marge pour la JVM elle-même)
OS cache:            33 GB (le reste)
```

**Étape 2**: Modifier jvm.options

Éditez le fichier `jvm.options`:

```bash
sudo vi /etc/elasticsearch/jvm.options
```

Modifiez les lignes `-Xms` et `-Xmx`:

```
################################################################
## IMPORTANT: JVM heap size
################################################################

# Xms represents the initial size of total heap space
# Xmx represents the maximum size of total heap space

-Xms31g
-Xmx31g
```

**Important**: 
- Utilisez `g` pour gigabytes (pas `GB`)
- Les deux valeurs DOIVENT être identiques
- Commentez les anciennes valeurs au lieu de les supprimer (backup)

**Étape 3**: Vérifier les autres paramètres JVM critiques

Dans le même fichier, vérifiez que ces paramètres sont présents:

```
# Utiliser G1GC (garbage collector recommandé)
-XX:+UseG1GC

# Heap dump en cas d'OutOfMemoryError
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/lib/elasticsearch

# GC logging
-Xlog:gc*,gc+age=trace,safepoint:file=/var/log/elasticsearch/gc.log:utctime,pid,tags:filecount=32,filesize=64m
```

**Étape 4**: Redémarrer Elasticsearch

```bash
sudo systemctl start elasticsearch
# ou
bin/elasticsearch -d
```

**Vérifiez les logs de démarrage**:
```bash
sudo tail -f /var/log/elasticsearch/elasticsearch.log
```

Cherchez cette ligne:
```
[INFO ][o.e.e.NodeEnvironment] heap size [31gb], compressed ordinary object pointers [true]
```

**Étape 5**: Vérifier la configuration heap via l'API

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_max_in_bytes
```

**Résultat attendu**:
```json
{
  "nodes": {
    "abc123": {
      "jvm": {
        "mem": {
          "heap_max_in_bytes": 33285996544
        }
      }
    }
  }
}
```

**Conversion**:
```
33,285,996,544 bytes / (1024^3) = 31 GB ✅
```

**Étape 6**: Monitorer l'utilisation du heap

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_used_percent
```

**Résultat**:
```json
{
  "nodes": {
    "abc123": {
      "jvm": {
        "mem": {
          "heap_used_percent": 45
        }
      }
    }
  }
}
```

**Interprétation**:
- ✅ <75%: Sain, pas de problème
- ⚠️ 75-85%: Surveiller, GC plus fréquents
- ❌ >85%: Critique, risque d'OutOfMemoryError

#### Validation

**Commandes de vérification**:

1. Vérifier heap min et max:
```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_max_in_bytes,nodes.*.jvm.mem.heap_committed_in_bytes
```
**Critère**: `heap_committed_in_bytes` doit être égal à `heap_max_in_bytes` (Xms=Xmx)

2. Vérifier compressed oops (< 32 GB):
```bash
GET /_nodes?filter_path=nodes.*.jvm.using_compressed_ordinary_object_pointers
```
**Résultat attendu**: `"using_compressed_ordinary_object_pointers": true`

3. Vérifier GC stats:
```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.gc
```
**Observation**: 
- `collection_time_in_millis` doit croître lentement
- `collection_count` / uptime doit être faible (<10 GC/minute)

4. Tester sous charge (optionnel):
```bash
# Indexer 10,000 documents
for i in {1..10000}; do
  curl -X POST "localhost:9200/test/_doc" -H 'Content-Type: application/json' -d'
  {
    "field": "value",
    "number": '$i'
  }
  '
done

# Vérifier heap après indexation
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_used_percent
```

#### Critères de Succès

- ✅ Heap configuré à 31 GB (50% de 64 GB RAM, <32 GB)
- ✅ Xms = Xmx (vérifié avec heap_committed = heap_max)
- ✅ Compressed oops activé (true)
- ✅ Elasticsearch démarre sans erreur
- ✅ Heap usage < 75% en fonctionnement normal

#### Dépannage

**Problème**: Elasticsearch ne démarre pas après modification
→ Vérifiez les logs: `sudo journalctl -u elasticsearch -f`
→ Erreur courante: Syntaxe invalide dans jvm.options (pas d'espace, pas de quotes)
→ Rollback: Restaurez les anciennes valeurs et redémarrez

**Problème**: "Could not reserve enough space for object heap"
→ Le heap demandé dépasse la RAM disponible
→ Réduisez Xms/Xmx (essayez 16g au lieu de 31g)
→ Vérifiez la RAM réellement disponible: `free -h`

**Problème**: Compressed oops = false
→ Heap configuré > 32 GB
→ Réduisez à 31 GB maximum

**Problème**: Heap usage constamment >85%
→ Cluster sous-dimensionné, ajoutez des nœuds
→ Ou augmentez le heap (si RAM disponible et <32 GB)
→ Ou optimisez les requêtes et l'indexation

---

## Lab 3.3: Analyse des Thread Pools et Rejections

**Topic**: Performance et Dimensionnement - Optimisation des Ressources
**Prérequis**: Cluster Elasticsearch avec quelques données

### Objectif

Analyser les statistiques des thread pools pour identifier les rejections (requêtes rejetées) et comprendre leurs implications sur la performance du cluster.

### Contexte

Votre cluster subit des pics de charge et certaines requêtes échouent avec des erreurs "EsRejectedExecutionException". Vous devez diagnostiquer quel thread pool est saturé et proposer des solutions.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Assurez-vous que le cluster traite quelques requêtes (indexation ou recherche)
2. Si nécessaire, générez de la charge:

```bash
# Script simple de charge (indexation)
for i in {1..1000}; do
  curl -X POST "localhost:9200/load-test/_doc" -H 'Content-Type: application/json' -d'
  {
    "timestamp": "'$(date -Iseconds)'",
    "value": '$RANDOM'
  }
  ' &
done
```

#### Étapes

**Étape 1**: Lister tous les thread pools

```bash
GET /_cat/thread_pool?v
```

**Résultat attendu**:
```
node_name name            active queue rejected
node-1    analyze              0     0        0
node-1    fetch_shard_started  0     0        0
node-1    fetch_shard_store    0     0        0
node-1    flush                0     0        0
node-1    force_merge          0     0        0
node-1    generic              0     0        0
node-1    get                  0     0        0
node-1    management           1     0        0
node-1    refresh              0     0        0
node-1    search               2    10        5
node-1    search_throttled     0     0        0
node-1    snapshot             0     0        0
node-1    warmer               0     0        0
node-1    write                3     5        0
```

**Colonnes clés**:
- `active`: Nombre de threads actuellement en cours d'exécution
- `queue`: Nombre de tâches en attente dans la queue
- `rejected`: Nombre de tâches rejetées (cumul depuis le démarrage)

**Étape 2**: Filtrer les thread pools importants

Affichez uniquement les thread pools critiques:

```bash
GET /_cat/thread_pool/write,search,get?v&h=node_name,name,active,queue,rejected,completed
```

**Résultat**:
```
node_name name   active queue rejected completed
node-1    write       3     5        0   1234567
node-1    search      2    10        5    987654
node-1    get         0     0        0     12345
```

**Étape 3**: Analyser les rejections en détail

```bash
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.write,nodes.*.thread_pool.search
```

**Résultat (extrait)**:
```json
{
  "nodes": {
    "abc123": {
      "thread_pool": {
        "write": {
          "threads": 16,
          "queue": 5,
          "active": 3,
          "rejected": 0,
          "largest": 16,
          "completed": 1234567
        },
        "search": {
          "threads": 25,
          "queue": 10,
          "active": 2,
          "rejected": 5,
          "largest": 25,
          "completed": 987654
        }
      }
    }
  }
}
```

**Analyse**:
- **write**: 0 rejections → ✅ Indexation OK
- **search**: 5 rejections → ⚠️ Recherche saturée (queue pleine)

**Étape 4**: Calculer le taux de rejection

```
Taux de rejection = rejected / (completed + rejected) × 100%

Pour le thread pool search:
= 5 / (987654 + 5) × 100%
= 0.0005%
```

**Interprétation**:
- <0.1%: Acceptable (pics occasionnels)
- 0.1-1%: Attention (surcharge régulière)
- >1%: Critique (cluster sous-dimensionné)

**Étape 5**: Identifier la cause des rejections

**Questions à poser**:

1. **Le thread pool est-il à sa capacité max ?**
```bash
GET /_cat/thread_pool/search?v&h=node_name,active,threads
```
Si `active` ≈ `threads` → Pool saturé

2. **La queue est-elle pleine ?**
```bash
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.search.queue,nodes.*.thread_pool.search.queue_size
```
Si `queue` ≈ `queue_size` (1000 par défaut) → Queue saturée

3. **Quelle est la charge du cluster ?**
```bash
GET /_nodes/stats/os?filter_path=nodes.*.os.cpu.percent
```
Si CPU >80% → Surcharge globale

**Étape 6**: Simuler une saturation (pour comprendre)

Générez une charge importante:

```bash
# 100 requêtes de recherche en parallèle
for i in {1..100}; do
  curl -X GET "localhost:9200/_search?pretty" -H 'Content-Type: application/json' -d'
  {
    "query": {
      "match_all": {}
    },
    "size": 1000
  }
  ' &
done

# Immédiatement après, vérifiez les rejections
GET /_cat/thread_pool/search?v&h=node_name,active,queue,rejected
```

**Observation**: Vous devriez voir `rejected` augmenter si le cluster est saturé.

#### Validation

**Commandes de vérification**:

1. Comparer rejections avant/après charge:
```bash
# Snapshot initial
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.*.rejected > before.json

# Générer charge...

# Snapshot final
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.*.rejected > after.json

# Comparer avec diff ou manuellement
```

2. Identifier les nœuds avec le plus de rejections:
```bash
GET /_cat/thread_pool/write,search?v&h=node_name,name,rejected&s=rejected:desc
```

3. Calculer le ratio rejected/completed pour tous les pools:
```bash
GET /_nodes/stats/thread_pool
# Analyser manuellement ou avec un script
```

#### Critères de Succès

- ✅ Capable de lister les thread pools avec `_cat/thread_pool`
- ✅ Identifier les thread pools avec rejections (search, write)
- ✅ Calculer le taux de rejection (rejected / completed)
- ✅ Comprendre la cause (pool saturé, queue pleine, CPU élevé)
- ✅ Proposer des solutions adaptées

#### Solutions aux Rejections

**Si thread pool WRITE saturé**:
- ✅ Augmenter le refresh_interval (réduire charge d'indexation)
- ✅ Utiliser Bulk API avec batches appropriés (5-15 MB)
- ✅ Ajouter des nœuds data (scale horizontal)
- ❌ NE PAS augmenter thread pool size (masque le problème)

**Si thread pool SEARCH saturé**:
- ✅ Optimiser les requêtes (utiliser filter context)
- ✅ Réduire le nombre de shards (moins de overhead)
- ✅ Ajouter des nœuds data ou coordinating-only
- ✅ Implémenter un rate limiting côté application
- ❌ NE PAS augmenter queue_size (augmente seulement la latence)

**Si rejections occasionnelles (<0.1%)**:
- ✅ Acceptable, pics normaux
- ✅ Implémenter retry logic côté client (avec backoff exponentiel)

#### Dépannage

**Problème**: Aucune rejection visible mais requêtes échouent
→ Vérifiez les logs Elasticsearch: `tail -f /var/log/elasticsearch/elasticsearch.log`
→ Recherchez "EsRejectedExecutionException"
→ Les rejections sont cumulatives depuis le démarrage, un redémarrage les remet à zéro

**Problème**: Rejections même avec CPU/RAM disponibles
→ Bottleneck peut être ailleurs (disque I/O, réseau)
→ Vérifiez disk I/O: `iostat -x 1` (Linux)
→ Vérifiez latence réseau entre nœuds

**Problème**: Rejections sur un seul nœud du cluster
→ Répartition déséquilibrée des shards
→ Utilisez `_cluster/reroute` pour équilibrer
→ Vérifiez que tous les nœuds ont la même capacité

---

## 🌟 Bonus 3.A: Architecture Hot-Warm-Cold avec ILM

**Niveau**: Avancé
**Prérequis**: Labs 2.2 et 3.1 complétés

### Objectif

Concevoir une architecture hot-warm-cold pour optimiser coût/performance, et configurer des policies Index Lifecycle Management (ILM) pour automatiser les transitions.

### Contexte

Votre cluster stocke des logs avec des patterns d'accès variables: les logs récents (<7 jours) sont consultés fréquemment (hot), les logs moyens (7-30 jours) occasionnellement (warm), et les vieux logs (>30 jours) rarement (cold). Vous voulez optimiser les coûts en utilisant du matériel différent par tier.

### Challenge

**Partie 1**: Configurer les node attributes pour les tiers

Définissez un attribut `data_tier` sur chaque nœud:

```yaml
# Nœuds HOT (haute performance)
node.name: hot-node-1
node.roles: [ data_hot ]
# Pas besoin de node.attr.data_tier avec data_hot role

# Nœuds WARM (performance moyenne)
node.name: warm-node-1
node.roles: [ data_warm ]

# Nœuds COLD (basse performance, stockage économique)
node.name: cold-node-1
node.roles: [ data_cold ]
```

Redémarrez les nœuds et vérifiez:

```bash
GET /_cat/nodes?v&h=name,node.role
```

**Résultat attendu**:
```
name         node.role
hot-node-1   h
warm-node-1  w
cold-node-1  c
```

**Partie 2**: Créer une policy ILM

Définissez une policy qui transition hot→warm→cold→delete:

```bash
PUT /_ilm/policy/logs-policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "50GB",
            "max_age": "1d",
            "max_docs": 10000000
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          },
          "set_priority": {
            "priority": 50
          },
          "allocate": {
            "require": {
              "data": "warm"
            }
          }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "searchable_snapshot": {
            "snapshot_repository": "my-repository"
          },
          "set_priority": {
            "priority": 0
          }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

**Explication des phases**:
- **hot** (0-7j): Rollover automatique quand 50GB ou 1 jour atteint
- **warm** (7-30j): Shrink à 1 shard, force merge, déplace vers nœuds warm
- **cold** (30-90j): Convert to searchable snapshot (S3/GCS)
- **delete** (>90j): Suppression automatique

**Partie 3**: Créer un index template avec ILM

```bash
PUT /_index_template/logs-template
{
  "index_patterns": ["logs-*"],
  "data_stream": {},
  "template": {
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs-policy",
      "index.lifecycle.rollover_alias": "logs"
    }
  }
}
```

**Partie 4**: Créer le premier index et l'alias

```bash
# Créer l'index initial
PUT /logs-000001
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1,
    "index.lifecycle.name": "logs-policy",
    "index.lifecycle.rollover_alias": "logs"
  },
  "aliases": {
    "logs": {
      "is_write_index": true
    }
  }
}
```

**Partie 5**: Tester le rollover

Indexez des données via l'alias:

```bash
POST /logs/_doc
{
  "timestamp": "2023-11-10T10:00:00",
  "message": "Test log entry"
}
```

Forcez un rollover manuel (pour test):

```bash
POST /logs/_rollover
{
  "conditions": {
    "max_age": "1d",
    "max_docs": 1000,
    "max_size": "5GB"
  }
}
```

Vérifiez les index créés:

```bash
GET /_cat/indices/logs-*?v&h=index,health,status,docs.count,store.size
```

**Résultat attendu**:
```
index        health status docs.count store.size
logs-000001  green  open          999       1mb
logs-000002  green  open            1      5kb
```

**Partie 6**: Simuler les transitions de phase

Modifiez temporairement les délais pour voir les transitions:

```bash
PUT /_ilm/policy/logs-policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_docs": 100
          }
        }
      },
      "warm": {
        "min_age": "1m",  # 1 minute au lieu de 7 jours
        "actions": {
          "forcemerge": {
            "max_num_segments": 1
          }
        }
      }
    }
  }
}
```

Attendez 1-2 minutes et vérifiez:

```bash
GET /logs-*/_ilm/explain
```

**Résultat**:
```json
{
  "indices": {
    "logs-000001": {
      "index": "logs-000001",
      "managed": true,
      "policy": "logs-policy",
      "phase": "warm",
      "action": "forcemerge",
      "step": "forcemerge"
    }
  }
}
```

### Validation

**Tableau de comparaison Hot-Warm-Cold**:

| Tier | Hardware | Cas d'usage | Coût | Performance |
|------|----------|-------------|------|-------------|
| **Hot** | SSD NVMe, 64GB RAM, 16 cores | Logs <7j, indexation + recherche intensive | €€€ | Très haute |
| **Warm** | SSD SATA, 32GB RAM, 8 cores | Logs 7-30j, recherche occasionnelle | €€ | Moyenne |
| **Cold** | HDD ou S3, 16GB RAM, 4 cores | Logs >30j, archivage, recherche rare | € | Basse |

**Questions à répondre**:

1. **Quand utiliser shrink dans la phase warm ?**
   - ✅ Quand les données ne changent plus (read-only)
   - ✅ Pour réduire le nombre de shards et améliorer les recherches
   - ❌ PAS sur des index actifs (write)

2. **Qu'est-ce qu'un searchable snapshot ?**
   - Index stocké dans un object store (S3, GCS, Azure Blob)
   - Données chargées à la demande (on-demand)
   - Coût de stockage très réduit (~90% moins cher que EBS)

3. **Comment forcer une transition immédiate ?**
```bash
POST /logs-000001/_ilm/move_to_step
{
  "current_step": {
    "phase": "hot",
    "action": "complete",
    "name": "complete"
  },
  "next_step": {
    "phase": "warm",
    "action": "allocate",
    "name": "allocate"
  }
}
```

**Critère de succès**: 
- Comprendre l'architecture hot-warm-cold
- Savoir créer une ILM policy multi-phases
- Maîtriser les actions: rollover, shrink, forcemerge, searchable_snapshot

---

## 🌟 Bonus 3.B: Troubleshooting Slow Indexing Performance

**Niveau**: Avancé
**Prérequis**: Lab 3.2 complété, compréhension du Bulk API

### Objectif

Diagnostiquer et résoudre les problèmes de performance d'indexation en utilisant les techniques d'optimisation: Bulk API, refresh_interval tuning, et disable replicas temporairement.

### Contexte

Votre pipeline d'indexation est lent (~1,000 docs/sec au lieu des 10,000 attendus). Vous devez identifier les goulots d'étranglement et appliquer les optimisations appropriées.

### Challenge

**Partie 1**: Benchmark de l'indexation initiale

Créez un index de test:

```bash
PUT /indexing-perf-test
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1,
    "refresh_interval": "1s"
  }
}
```

Indexez 10,000 documents UN PAR UN (méthode lente):

```bash
time for i in {1..10000}; do
  curl -X POST "localhost:9200/indexing-perf-test/_doc" \
    -H 'Content-Type: application/json' \
    -d'{"field":"value","number":'$i'}' \
    -s -o /dev/null
done
```

**Temps mesuré** (exemple): `real 5m30s` → **30 docs/sec** ❌

**Partie 2**: Optimisation 1 - Utiliser Bulk API

Supprimez l'index et recréez-le:

```bash
DELETE /indexing-perf-test
PUT /indexing-perf-test
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1,
    "refresh_interval": "1s"
  }
}
```

Indexez avec Bulk API (batches de 1000 docs):

```bash
# Générer le fichier bulk
for i in {1..10000}; do
  echo '{"index":{}}'
  echo '{"field":"value","number":'$i'}'
done > bulk-data.json

# Indexer avec Bulk
time curl -X POST "localhost:9200/indexing-perf-test/_bulk" \
  -H 'Content-Type: application/x-ndjson' \
  --data-binary @bulk-data.json \
  -s -o /dev/null
```

**Temps mesuré** (exemple): `real 0m15s` → **666 docs/sec** ✅ (×22 plus rapide)

**Partie 3**: Optimisation 2 - Augmenter refresh_interval

```bash
PUT /indexing-perf-test/_settings
{
  "index.refresh_interval": "30s"
}
```

Réindexez avec le même Bulk:

```bash
time curl -X POST "localhost:9200/indexing-perf-test/_bulk" \
  -H 'Content-Type: application/x-ndjson' \
  --data-binary @bulk-data.json \
  -s -o /dev/null
```

**Temps mesuré** (exemple): `real 0m8s` → **1,250 docs/sec** ✅ (×2 amélioration)

**Explication**: Refresh toutes les 30s au lieu de 1s = moins de segments créés = moins d'overhead.

**Partie 4**: Optimisation 3 - Désactiver les replicas pendant l'indexation

```bash
PUT /indexing-perf-test/_settings
{
  "number_of_replicas": 0
}
```

Réindexez:

```bash
time curl -X POST "localhost:9200/indexing-perf-test/_bulk" \
  -H 'Content-Type: application/x-ndjson' \
  --data-binary @bulk-data.json \
  -s -o /dev/null
```

**Temps mesuré** (exemple): `real 0m4s` → **2,500 docs/sec** ✅ (×2 amélioration)

**Important**: Rétablir les replicas après indexation:

```bash
PUT /indexing-perf-test/_settings
{
  "number_of_replicas": 1
}
```

**Partie 5**: Optimisation 4 - Ajuster la taille des batches Bulk

Testez différentes tailles:

```bash
# Batch de 100 docs
split -l 200 bulk-data.json bulk-100-

# Batch de 5000 docs
split -l 10000 bulk-data.json bulk-5000-

# Mesurer la performance pour chaque
```

**Règle générale**: 5-15 MB par batch ou 1000-5000 documents.

**Partie 6**: Identifier d'autres goulots d'étranglement

Vérifiez les métriques d'indexation:

```bash
GET /_nodes/stats/indices?filter_path=nodes.*.indices.indexing
```

**Analyse**:
- `indexing.index_time_in_millis`: Temps total passé à indexer
- `indexing.index_failed`: Documents échoués (doit être 0)
- `indexing.throttle_time_in_millis`: Temps passé en throttling (merge)

Si `throttle_time` est élevé:

```bash
# Augmenter le threshold pour les merges
PUT /_cluster/settings
{
  "persistent": {
    "indices.store.throttle.max_bytes_per_sec": "200mb"
  }
}
```

### Validation

**Tableau récapitulatif des optimisations**:

| Technique | Amélioration | Quand l'utiliser |
|-----------|--------------|------------------|
| Bulk API | ×20-50 | Toujours pour indexation massive |
| refresh_interval: 30s | ×2-3 | Indexation initiale, réindexation |
| replicas: 0 temporaire | ×2 | Indexation initiale uniquement |
| Batch size optimal | ×1.5-2 | Ajuster selon network/heap |
| Disable _source | ×1.2-1.5 | Si _source non nécessaire (rare) |

**Score final de performance**:

```
Baseline (1 par 1):           30 docs/sec
Avec toutes optimisations: 2,500 docs/sec
Amélioration totale:          ×83
```

**Critère de succès**: 
- Comprendre l'impact de chaque optimisation
- Savoir quand appliquer chaque technique
- Mesurer et comparer les performances avant/après

---

## Lab 6.1: Création et Restauration de Snapshots

**Objectif**: Maîtriser la configuration de repositories de snapshots, la création de sauvegardes, et la restauration d'indices pour assurer la protection des données.

**Contexte**: Les snapshots sont essentiels pour protéger vos données contre les suppressions accidentelles, les corruptions, et les pannes matérielles. Dans ce lab, vous allez configurer un repository filesystem, créer plusieurs snapshots, et pratiquer différents scénarios de restauration.

### Étape 1: Configurer le Chemin du Repository

Avant de créer un repository, vous devez déclarer le chemin autorisé dans `elasticsearch.yml`.

**Sur un cluster Docker/local** :

1. Localiser le fichier de configuration :

```bash
# Docker
docker exec -it elasticsearch-node-1 cat /usr/share/elasticsearch/config/elasticsearch.yml

# Installation locale
cat /etc/elasticsearch/elasticsearch.yml
```

2. Ajouter la configuration `path.repo` :

```yaml
# Configuration pour snapshots
path.repo: ["/usr/share/elasticsearch/backups"]
```

3. **Pour Docker**, créer le répertoire et monter le volume :

```bash
# Créer le répertoire sur l'hôte
mkdir -p ~/elasticsearch-backups

# Redémarrer le conteneur avec le volume
docker run -d \
  --name elasticsearch-node-1 \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "path.repo=/usr/share/elasticsearch/backups" \
  -v ~/elasticsearch-backups:/usr/share/elasticsearch/backups \
  docker.elastic.co/elasticsearch/elasticsearch:8.12.0
```

4. **Pour installation locale**, créer le répertoire et définir les permissions :

```bash
sudo mkdir -p /mnt/elasticsearch/backups
sudo chown elasticsearch:elasticsearch /mnt/elasticsearch/backups
sudo chmod 775 /mnt/elasticsearch/backups
```

5. Redémarrer Elasticsearch pour appliquer la configuration :

```bash
# Docker
docker restart elasticsearch-node-1

# systemd
sudo systemctl restart elasticsearch
```

### Étape 2: Créer un Repository de Snapshots

Une fois le chemin configuré, créez le repository via l'API :

```bash
PUT /_snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/backups",
    "compress": true,
    "chunk_size": "128mb",
    "max_restore_bytes_per_sec": "40mb",
    "max_snapshot_bytes_per_sec": "40mb"
  }
}
```

**Résultat attendu** :
```json
{
  "acknowledged": true
}
```

**Vérifier le repository** :

```bash
GET /_snapshot/my_backup
```

**Résultat attendu** :
```json
{
  "my_backup": {
    "type": "fs",
    "settings": {
      "location": "/usr/share/elasticsearch/backups",
      "compress": "true",
      "chunk_size": "128mb",
      "max_restore_bytes_per_sec": "40mb",
      "max_snapshot_bytes_per_sec": "40mb"
    }
  }
}
```

**Tester la connectivité du repository** :

```bash
POST /_snapshot/my_backup/_verify
```

**Résultat attendu** :
```json
{
  "nodes": {
    "abc123xyz": {
      "name": "elasticsearch-node-1"
    }
  }
}
```

### Étape 3: Créer des Données de Test

Créons plusieurs indices avec des données pour tester les snapshots :

```bash
# Index 1: Produits
PUT /products
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}

POST /products/_bulk
{"index":{"_id":"1"}}
{"name":"Laptop","price":999,"category":"electronics"}
{"index":{"_id":"2"}}
{"name":"Mouse","price":25,"category":"electronics"}
{"index":{"_id":"3"}}
{"name":"Desk Chair","price":199,"category":"furniture"}
{"index":{"_id":"4"}}
{"name":"Monitor","price":299,"category":"electronics"}
{"index":{"_id":"5"}}
{"name":"Keyboard","price":79,"category":"electronics"}

# Index 2: Commandes
PUT /orders
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}

POST /orders/_bulk
{"index":{"_id":"1"}}
{"order_id":"ORD-001","customer":"Alice","total":999,"date":"2024-01-15"}
{"index":{"_id":"2"}}
{"order_id":"ORD-002","customer":"Bob","total":324,"date":"2024-01-16"}
{"index":{"_id":"3"}}
{"order_id":"ORD-003","customer":"Charlie","total":199,"date":"2024-01-17"}

# Index 3: Utilisateurs
PUT /users
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}

POST /users/_bulk
{"index":{"_id":"1"}}
{"username":"alice","email":"alice@example.com","role":"admin"}
{"index":{"_id":"2"}}
{"username":"bob","email":"bob@example.com","role":"user"}
{"index":{"_id":"3"}}
{"username":"charlie","email":"charlie@example.com","role":"user"}
```

**Vérifier les indices créés** :

```bash
GET /_cat/indices?v&h=index,docs.count,store.size
```

**Résultat attendu** :
```
index    docs.count store.size
products 5          4.2kb
orders   3          3.1kb
users    3          2.8kb
```

### Étape 4: Créer un Snapshot Complet

Créons un premier snapshot incluant tous les indices :

```bash
PUT /_snapshot/my_backup/snapshot_full_2024_01_15
{
  "indices": "*",
  "ignore_unavailable": true,
  "include_global_state": true,
  "metadata": {
    "taken_by": "ops-team",
    "taken_because": "lab-exercise-full-backup",
    "environment": "development"
  }
}
```

**Résultat attendu** :
```json
{
  "accepted": true
}
```

**Surveiller la progression du snapshot** :

```bash
GET /_snapshot/my_backup/snapshot_full_2024_01_15/_status
```

**Résultat pendant la création** :
```json
{
  "snapshots": [{
    "snapshot": "snapshot_full_2024_01_15",
    "repository": "my_backup",
    "state": "IN_PROGRESS",
    "shards_stats": {
      "initializing": 0,
      "started": 2,
      "finalizing": 0,
      "done": 1,
      "failed": 0,
      "total": 3
    }
  }]
}
```

**Attendre que l'état devienne SUCCESS** :

```bash
GET /_snapshot/my_backup/snapshot_full_2024_01_15
```

**Résultat attendu** :
```json
{
  "snapshots": [{
    "snapshot": "snapshot_full_2024_01_15",
    "uuid": "abc-123-xyz",
    "state": "SUCCESS",
    "indices": ["products", "orders", "users"],
    "include_global_state": true,
    "shards": {
      "total": 3,
      "failed": 0,
      "successful": 3
    },
    "start_time": "2024-01-15T10:00:00.000Z",
    "end_time": "2024-01-15T10:00:05.432Z",
    "duration_in_millis": 5432
  }]
}
```

### Étape 5: Créer un Snapshot Partiel

Créons un snapshot incluant uniquement les indices "products" et "orders" :

```bash
PUT /_snapshot/my_backup/snapshot_products_orders
{
  "indices": "products,orders",
  "ignore_unavailable": false,
  "include_global_state": false,
  "partial": false,
  "metadata": {
    "taken_by": "ops-team",
    "taken_because": "lab-exercise-partial-backup"
  }
}
```

**Vérifier que le snapshot est terminé** :

```bash
GET /_snapshot/my_backup/snapshot_products_orders
```

**Résultat attendu** :
```json
{
  "snapshots": [{
    "snapshot": "snapshot_products_orders",
    "state": "SUCCESS",
    "indices": ["products", "orders"],
    "include_global_state": false,
    "shards": {
      "total": 2,
      "successful": 2
    }
  }]
}
```

### Étape 6: Lister Tous les Snapshots

```bash
GET /_snapshot/my_backup/_all
```

**Résultat attendu** :
```json
{
  "snapshots": [
    {
      "snapshot": "snapshot_full_2024_01_15",
      "state": "SUCCESS",
      "indices": ["products", "orders", "users"]
    },
    {
      "snapshot": "snapshot_products_orders",
      "state": "SUCCESS",
      "indices": ["products", "orders"]
    }
  ]
}
```

### Étape 7: Scénario de Restauration 1 - Suppression Accidentelle

Simulons une suppression accidentelle et restaurons depuis le snapshot :

1. **Supprimer accidentellement l'index "orders"** :

```bash
DELETE /orders
```

2. **Vérifier que l'index n'existe plus** :

```bash
GET /_cat/indices?v&h=index
```

3. **Restaurer uniquement l'index "orders" depuis le snapshot** :

```bash
POST /_snapshot/my_backup/snapshot_full_2024_01_15/_restore
{
  "indices": "orders",
  "ignore_unavailable": true,
  "include_global_state": false
}
```

**Résultat attendu** :
```json
{
  "accepted": true
}
```

4. **Surveiller la restauration** :

```bash
GET /_cat/recovery?v&h=index,stage,type,files_percent&s=index
```

**Résultat pendant la restauration** :
```
index  stage     type     files_percent
orders translog  snapshot 100.0%
```

5. **Vérifier que les données sont restaurées** :

```bash
GET /orders/_search
{
  "query": {
    "match_all": {}
  }
}
```

**Résultat attendu** :
```json
{
  "hits": {
    "total": { "value": 3 },
    "hits": [
      {
        "_source": {
          "order_id": "ORD-001",
          "customer": "Alice",
          "total": 999
        }
      },
      ...
    ]
  }
}
```

### Étape 8: Scénario de Restauration 2 - Restauration avec Renommage

Restaurons un index sous un nouveau nom pour comparer des versions ou tester :

```bash
POST /_snapshot/my_backup/snapshot_full_2024_01_15/_restore
{
  "indices": "products",
  "rename_pattern": "(.+)",
  "rename_replacement": "restored_$1",
  "include_aliases": false,
  "index_settings": {
    "index.number_of_replicas": 0
  }
}
```

**Vérifier que le nouvel index existe** :

```bash
GET /_cat/indices?v&h=index,docs.count
```

**Résultat attendu** :
```
index             docs.count
products          5
orders            3
users             3
restored_products 5
```

**Comparer les données** :

```bash
# Original
GET /products/_count

# Restauré
GET /restored_products/_count
```

Les deux devraient retourner `{"count": 5}`.

### Étape 9: Scénario de Restauration 3 - Restauration Complète

Simulons une corruption complète du cluster et restaurons tout :

1. **Supprimer tous les indices (ATTENTION : uniquement en environnement de test !)** :

```bash
DELETE /products,orders,users,restored_products
```

2. **Vérifier qu'il n'y a plus d'indices** :

```bash
GET /_cat/indices
```

3. **Restaurer tous les indices depuis le snapshot** :

```bash
POST /_snapshot/my_backup/snapshot_full_2024_01_15/_restore
{
  "indices": "*",
  "include_global_state": true,
  "ignore_unavailable": true
}
```

4. **Vérifier la restauration complète** :

```bash
GET /_cat/indices?v&h=index,docs.count,store.size
```

**Résultat attendu** :
```
index    docs.count store.size
products 5          4.2kb
orders   3          3.1kb
users    3          2.8kb
```

### Validation Finale

Vérifiez que vous avez réussi le lab :

```bash
# 1. Lister les repositories
GET /_snapshot/_all

# 2. Lister tous les snapshots
GET /_snapshot/my_backup/_all

# 3. Vérifier que tous les indices sont présents
GET /_cat/indices?v

# 4. Compter les documents
GET /products/_count
GET /orders/_count
GET /users/_count
```

**Résultats attendus** :
- Repository `my_backup` existe et est accessible
- Au moins 2 snapshots présents et en état `SUCCESS`
- 3 indices présents : `products`, `orders`, `users`
- Counts : products=5, orders=3, users=3

### Points Clés à Retenir

✅ Le chemin du repository doit être déclaré dans `path.repo` dans `elasticsearch.yml`  
✅ Les snapshots sont **incrémentaux** : seuls les nouveaux segments sont copiés  
✅ Utilisez `include_global_state: true` pour sauvegarder templates et policies  
✅ La restauration nécessite que les indices n'existent pas (ou soient fermés)  
✅ `rename_pattern` et `rename_replacement` permettent de restaurer avec un nouveau nom  
✅ Les snapshots sont **repository-scoped** : supprimer le repository supprime tous ses snapshots  
✅ Utilisez `_verify` pour tester la connectivité du repository  
✅ Les métadonnées personnalisées (`metadata`) aident à documenter les snapshots

---

## Lab 6.2: Procédure de Rolling Restart

**Objectif**: Maîtriser la procédure de redémarrage de nœuds Elasticsearch sans interruption de service, en respectant les bonnes pratiques pour éviter les déplacements inutiles de shards.

**Contexte**: Le rolling restart est une opération de maintenance courante (changements de configuration, updates système, maintenance matérielle). Une mauvaise exécution peut entraîner des déplacements massifs de shards, impactant les performances et la disponibilité. Dans ce lab, vous allez pratiquer la procédure standard de rolling restart.

### Prérequis : Cluster Multi-Nœuds

Ce lab nécessite un cluster avec **au moins 2 nœuds** pour démontrer le rolling restart sans perte de service.

**Option A : Cluster Docker avec 3 nœuds**

Créez un fichier `docker-compose.yml` :

```yaml
version: '3.8'
services:
  es01:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es01
    environment:
      - node.name=es01
      - cluster.name=es-cluster-lab
      - discovery.seed_hosts=es02,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    ports:
      - "9200:9200"
    networks:
      - elastic

  es02:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es02
    environment:
      - node.name=es02
      - cluster.name=es-cluster-lab
      - discovery.seed_hosts=es01,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    networks:
      - elastic

  es03:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es03
    environment:
      - node.name=es03
      - cluster.name=es-cluster-lab
      - discovery.seed_hosts=es01,es02
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    networks:
      - elastic

networks:
  elastic:
    driver: bridge
```

Démarrer le cluster :

```bash
docker-compose up -d
```

**Option B : Cluster existant** avec au moins 2 nœuds

### Étape 1: Vérifier l'État Initial du Cluster

```bash
# Vérifier que tous les nœuds sont présents
GET /_cat/nodes?v&h=name,ip,heap.percent,ram.percent,cpu,load_1m,node.role,master

# Vérifier la santé du cluster
GET /_cluster/health
```

**Résultat attendu** :
```json
{
  "cluster_name": "es-cluster-lab",
  "status": "green",
  "timed_out": false,
  "number_of_nodes": 3,
  "number_of_data_nodes": 3,
  "active_primary_shards": 0,
  "active_shards": 0,
  "relocating_shards": 0,
  "initializing_shards": 0,
  "unassigned_shards": 0
}
```

### Étape 2: Créer des Indices de Test avec Répliques

Pour démontrer le rolling restart, créons des indices avec répliques :

```bash
PUT /test-restart-1
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}

PUT /test-restart-2
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2
  }
}

# Indexer des données
POST /test-restart-1/_bulk
{"index":{"_id":"1"}}
{"message":"Document 1","timestamp":"2024-01-15T10:00:00Z"}
{"index":{"_id":"2"}}
{"message":"Document 2","timestamp":"2024-01-15T10:01:00Z"}
{"index":{"_id":"3"}}
{"message":"Document 3","timestamp":"2024-01-15T10:02:00Z"}

POST /test-restart-2/_bulk
{"index":{"_id":"1"}}
{"data":"Test data 1","value":100}
{"index":{"_id":"2"}}
{"data":"Test data 2","value":200}
{"index":{"_id":"3"}}
{"data":"Test data 3","value":300}
```

**Vérifier la répartition des shards** :

```bash
GET /_cat/shards/test-restart-*?v&h=index,shard,prirep,state,node&s=index,shard
```

**Résultat attendu** (exemple) :
```
index           shard prirep state   node
test-restart-1  0     p      STARTED es01
test-restart-1  0     r      STARTED es02
test-restart-1  1     p      STARTED es02
test-restart-1  1     r      STARTED es03
test-restart-2  0     p      STARTED es01
test-restart-2  0     r      STARTED es02
test-restart-2  0     r      STARTED es03
...
```

Vous devriez voir des shards primaires (p) et répliques (r) répartis sur différents nœuds.

### Étape 3: Désactiver l'Allocation des Shards

**C'est l'étape CRITIQUE pour éviter les déplacements de shards inutiles** :

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "primaries"
  }
}
```

**Résultat attendu** :
```json
{
  "acknowledged": true,
  "persistent": {
    "cluster": {
      "routing": {
        "allocation": {
          "enable": "primaries"
        }
      }
    }
  },
  "transient": {}
}
```

**Vérifier le setting** :

```bash
GET /_cluster/settings?include_defaults=false
```

### Étape 4: Effectuer un Synced Flush (Optionnel mais Recommandé)

Ceci accélère la récupération des shards après le redémarrage :

```bash
POST /_flush/synced
```

**Note** : Cette API est dépréciée en Elasticsearch 8.x mais peut encore être utilisée. En 8.x+, un flush standard est suffisant :

```bash
POST /_flush
```

### Étape 5: Arrêter le Premier Nœud (Nœud Data)

**Docker** :

```bash
docker stop es03
```

**systemd** :

```bash
sudo systemctl stop elasticsearch
```

**Vérifier que le nœud est bien arrêté** :

```bash
GET /_cat/nodes?v
```

Vous ne devriez plus voir `es03` dans la liste.

**Vérifier l'état du cluster** :

```bash
GET /_cluster/health
```

**Résultat attendu** :
```json
{
  "cluster_name": "es-cluster-lab",
  "status": "yellow",
  "number_of_nodes": 2,
  "unassigned_shards": 5
}
```

Le statut est **YELLOW** car certaines répliques sont temporairement non assignées (le nœud es03 est arrêté), mais les primaires sont toujours actifs.

**Vérifier les shards** :

```bash
GET /_cat/shards/test-restart-*?v&h=index,shard,prirep,state,unassigned.reason,node&s=state
```

Vous devriez voir des shards `UNASSIGNED` avec `unassigned.reason=NODE_LEFT`.

### Étape 6: Redémarrer le Nœud

**Docker** :

```bash
docker start es03
```

**systemd** :

```bash
sudo systemctl start elasticsearch
```

**Surveiller le retour du nœud dans le cluster** :

```bash
# Répéter cette commande toutes les 5-10 secondes
GET /_cat/nodes?v&h=name,uptime,heap.percent,node.role
```

Quand `es03` réapparaît avec un `uptime` faible (quelques secondes), le nœud a rejoint le cluster.

**Vérifier la santé du cluster** :

```bash
GET /_cluster/health?wait_for_status=yellow&timeout=2m
```

Ceci bloque jusqu'à ce que le cluster atteigne au moins le statut YELLOW (toutes les primaires actives).

### Étape 7: Vérifier la Récupération des Shards

```bash
GET /_cat/recovery?v&h=index,shard,stage,type,source_node,target_node,files_percent&s=index
```

**Résultat pendant la récupération** :
```
index           shard stage     type   source_node target_node files_percent
test-restart-1  0     translog  peer   es01        es03        100.0%
test-restart-2  0     done      peer   es01        es03        100.0%
```

Les shards sont en cours de récupération (`stage: translog` ou `done`).

### Étape 8: Attendre que le Cluster Revienne à GREEN

```bash
GET /_cluster/health?wait_for_status=green&timeout=5m
```

**Résultat attendu** :
```json
{
  "status": "green",
  "number_of_nodes": 3,
  "active_shards": 15,
  "relocating_shards": 0,
  "unassigned_shards": 0
}
```

### Étape 9: Répéter pour les Autres Nœuds

Répétez les étapes 5-8 pour chaque nœud restant :

1. Arrêter `es02`
2. Attendre que le cluster soit YELLOW
3. Redémarrer `es02`
4. Attendre que le cluster soit GREEN
5. Arrêter `es01`
6. Attendre que le cluster soit YELLOW
7. Redémarrer `es01`
8. Attendre que le cluster soit GREEN

**Conseil** : Pour les nœuds master, arrêtez-les en dernier pour minimiser les élections master pendant le restart.

### Étape 10: Réactiver l'Allocation Complète des Shards

Une fois tous les nœuds redémarrés :

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "all"
  }
}
```

**Résultat attendu** :
```json
{
  "acknowledged": true,
  "persistent": {
    "cluster": {
      "routing": {
        "allocation": {
          "enable": "all"
        }
      }
    }
  }
}
```

### Étape 11: Vérification Finale

```bash
# 1. Vérifier que tous les nœuds sont présents
GET /_cat/nodes?v&h=name,uptime,heap.percent,node.role,master

# 2. Vérifier la santé du cluster
GET /_cluster/health

# 3. Vérifier que les données sont toujours présentes
GET /test-restart-1/_count
GET /test-restart-2/_count

# 4. Vérifier la répartition des shards
GET /_cat/shards/test-restart-*?v&h=index,shard,prirep,state,node
```

**Résultats attendus** :
- 3 nœuds présents
- Cluster status `green`
- Count test-restart-1 : 3 documents
- Count test-restart-2 : 3 documents
- Tous les shards en état `STARTED`

### Validation

Vérifiez que vous avez réussi le lab :

```bash
# Vérifier les settings de cluster
GET /_cluster/settings?include_defaults=false
```

Le setting `cluster.routing.allocation.enable` doit être `"all"`.

```bash
# Vérifier qu'aucun shard n'est en cours de relocation
GET /_cat/shards?v&h=index,shard,state,relocating_node&s=state
```

Aucun shard ne devrait avoir de valeur dans `relocating_node`.

### Points Clés à Retenir

✅ **Toujours désactiver l'allocation** avant un rolling restart avec `"enable": "primaries"`  
✅ **Redémarrer un nœud à la fois** et attendre que le cluster revienne à GREEN  
✅ **Utiliser SIGTERM** pour un shutdown gracieux (jamais SIGKILL)  
✅ **Surveiller la récupération** avec `GET /_cat/recovery`  
✅ **Réactiver l'allocation** après avoir redémarré tous les nœuds  
✅ **Ordre recommandé** : data nodes → coordinating nodes → master nodes  
✅ **wait_for_status avec timeout** permet d'attendre que le cluster soit stable  
✅ Le cluster passe temporairement en **YELLOW** pendant le restart (normal)

---

## 🌟 Bonus Challenge 6.A: Configuration de Snapshot Lifecycle Management (SLM)

**Niveau**: Avancé  
**Objectif**: Automatiser la création et le nettoyage de snapshots avec des politiques SLM, incluant la rétention automatique et la planification flexible.

**Contexte**: Créer manuellement des snapshots quotidiens est fastidieux et sujet aux oublis. Snapshot Lifecycle Management (SLM) permet d'automatiser ce processus avec des politiques déclaratives incluant la planification, la rétention, et les alertes en cas d'échec.

### Scénario

Vous gérez un cluster Elasticsearch avec plusieurs types d'indices :
- **Indices transactionnels** (`orders-*`, `payments-*`) : Critiques, nécessitent des sauvegardes fréquentes
- **Indices analytiques** (`analytics-*`) : Moins critiques, sauvegardes hebdomadaires suffisantes
- **Indices de logs** (`logs-*`) : Volumineux, sauvegardes quotidiennes avec courte rétention

Vous allez créer **3 politiques SLM** avec différentes stratégies de rétention et planification.

### Étape 1: Prérequis - Repository Configuré

Vérifiez que vous avez un repository configuré (depuis Lab 6.1) :

```bash
GET /_snapshot/my_backup
```

Si le repository n'existe pas, créez-le :

```bash
PUT /_snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/backups",
    "compress": true
  }
}
```

### Étape 2: Créer des Indices de Test

Créons des indices représentant différents cas d'usage :

```bash
# Indices transactionnels (critiques)
PUT /orders-2024-01
PUT /orders-2024-02
PUT /payments-2024-01

# Indices analytiques
PUT /analytics-2024-q1
PUT /analytics-2024-q2

# Indices de logs (volumineux)
PUT /logs-2024-01-15
PUT /logs-2024-01-16
PUT /logs-2024-01-17

# Indexer quelques données
POST /orders-2024-01/_bulk
{"index":{"_id":"1"}}
{"order_id":"ORD-001","amount":100}
{"index":{"_id":"2"}}
{"order_id":"ORD-002","amount":200}

POST /analytics-2024-q1/_doc
{"metric":"revenue","value":50000,"period":"Q1"}

POST /logs-2024-01-15/_bulk
{"index":{}}
{"timestamp":"2024-01-15T10:00:00Z","level":"INFO","message":"Application started"}
{"index":{}}
{"timestamp":"2024-01-15T10:05:00Z","level":"WARN","message":"High memory usage"}
```

### Étape 3: Politique SLM pour Indices Transactionnels (Critiques)

**Exigences** :
- Snapshots **quotidiens** à 2h du matin
- Inclure uniquement `orders-*` et `payments-*`
- Rétention : **90 jours**
- Garder au minimum **30 snapshots**
- Limite maximale : **120 snapshots**

```bash
PUT /_slm/policy/daily-critical-backup
{
  "schedule": "0 0 2 * * ?",
  "name": "<critical-{now/d}>",
  "repository": "my_backup",
  "config": {
    "indices": ["orders-*", "payments-*"],
    "ignore_unavailable": false,
    "include_global_state": false,
    "partial": false,
    "metadata": {
      "policy": "daily-critical-backup",
      "criticality": "high",
      "team": "finance"
    }
  },
  "retention": {
    "expire_after": "90d",
    "min_count": 30,
    "max_count": 120
  }
}
```

**Explication des paramètres** :
- `schedule: "0 0 2 * * ?"` : Expression cron pour 2h00 tous les jours
  - Format : `<second> <minute> <hour> <day_of_month> <month> <day_of_week>`
  - `?` signifie "n'importe quel" pour day_of_month ou day_of_week
- `name: "<critical-{now/d}>"` : Template générant `critical-2024-01-15`
- `expire_after: "90d"` : Supprimer les snapshots de plus de 90 jours
- `min_count: 30` : Toujours garder au moins 30 snapshots, même si expirés
- `max_count: 120` : Ne jamais dépasser 120 snapshots (suppression du plus ancien)

### Étape 4: Politique SLM pour Indices Analytiques (Hebdomadaire)

**Exigences** :
- Snapshots **hebdomadaires** le dimanche à 3h du matin
- Inclure uniquement `analytics-*`
- Rétention : **180 jours** (6 mois)
- Garder au minimum **10 snapshots**
- Limite maximale : **52 snapshots** (1 an de semaines)

```bash
PUT /_slm/policy/weekly-analytics-backup
{
  "schedule": "0 0 3 ? * SUN",
  "name": "<analytics-{now/w}>",
  "repository": "my_backup",
  "config": {
    "indices": ["analytics-*"],
    "ignore_unavailable": true,
    "include_global_state": false,
    "partial": false,
    "metadata": {
      "policy": "weekly-analytics-backup",
      "criticality": "medium",
      "team": "data-science"
    }
  },
  "retention": {
    "expire_after": "180d",
    "min_count": 10,
    "max_count": 52
  }
}
```

**Explication** :
- `schedule: "0 0 3 ? * SUN"` : Tous les dimanches à 3h00
- `name: "<analytics-{now/w}>"` : Template générant `analytics-2024-w03` (semaine 3)

### Étape 5: Politique SLM pour Indices de Logs (Quotidien, Courte Rétention)

**Exigences** :
- Snapshots **quotidiens** à 1h du matin
- Inclure uniquement `logs-*`
- Rétention : **14 jours** seulement (logs ont courte valeur)
- Garder au minimum **7 snapshots** (1 semaine)
- Limite maximale : **30 snapshots**

```bash
PUT /_slm/policy/daily-logs-backup
{
  "schedule": "0 0 1 * * ?",
  "name": "<logs-{now/d}>",
  "repository": "my_backup",
  "config": {
    "indices": ["logs-*"],
    "ignore_unavailable": true,
    "include_global_state": false,
    "partial": true,
    "metadata": {
      "policy": "daily-logs-backup",
      "criticality": "low",
      "team": "ops"
    }
  },
  "retention": {
    "expire_after": "14d",
    "min_count": 7,
    "max_count": 30
  }
}
```

**Explication** :
- `partial: true` : Permet au snapshot de réussir même si certains shards primaires échouent
- `ignore_unavailable: true` : Ignore les indices logs-* qui n'existent pas encore

### Étape 6: Lister Toutes les Politiques SLM

```bash
GET /_slm/policy
```

**Résultat attendu** :
```json
{
  "daily-critical-backup": {
    "version": 1,
    "modified_date": "2024-01-15T10:00:00.000Z",
    "policy": {
      "schedule": "0 0 2 * * ?",
      "name": "<critical-{now/d}>",
      ...
    },
    "next_execution_millis": 1705287600000,
    "stats": {
      "policy": "daily-critical-backup",
      "snapshots_taken": 0,
      "snapshots_failed": 0,
      "snapshots_deleted": 0,
      "snapshot_deletion_failures": 0
    }
  },
  "weekly-analytics-backup": { ... },
  "daily-logs-backup": { ... }
}
```

### Étape 7: Exécuter Manuellement les Politiques (Pour Tests)

Plutôt que d'attendre la planification, exécutons les politiques manuellement :

```bash
# Exécuter la politique critical
POST /_slm/policy/daily-critical-backup/_execute

# Exécuter la politique analytics
POST /_slm/policy/weekly-analytics-backup/_execute

# Exécuter la politique logs
POST /_slm/policy/daily-logs-backup/_execute
```

**Résultat attendu pour chaque** :
```json
{
  "snapshot_name": "critical-2024-01-15"
}
```

### Étape 8: Vérifier les Snapshots Créés

```bash
GET /_snapshot/my_backup/_all
```

**Résultat attendu** :
```json
{
  "snapshots": [
    {
      "snapshot": "critical-2024-01-15",
      "state": "SUCCESS",
      "indices": ["orders-2024-01", "orders-2024-02", "payments-2024-01"]
    },
    {
      "snapshot": "analytics-2024-w03",
      "state": "SUCCESS",
      "indices": ["analytics-2024-q1", "analytics-2024-q2"]
    },
    {
      "snapshot": "logs-2024-01-15",
      "state": "SUCCESS",
      "indices": ["logs-2024-01-15", "logs-2024-01-16", "logs-2024-01-17"]
    }
  ]
}
```

### Étape 9: Consulter les Statistiques des Politiques

```bash
GET /_slm/policy/daily-critical-backup
```

**Résultat attendu** :
```json
{
  "daily-critical-backup": {
    "policy": { ... },
    "version": 1,
    "modified_date_millis": 1705305600000,
    "last_success": {
      "snapshot_name": "critical-2024-01-15",
      "time_string": "2024-01-15T10:05:00.000Z",
      "time": 1705305900000
    },
    "last_failure": null,
    "next_execution": "2024-01-16T02:00:00.000Z",
    "next_execution_millis": 1705374000000,
    "stats": {
      "policy": "daily-critical-backup",
      "snapshots_taken": 1,
      "snapshots_failed": 0,
      "snapshots_deleted": 0,
      "snapshot_deletion_failures": 0
    }
  }
}
```

### Étape 10: Tester la Rétention Automatique

Pour tester la rétention, simulons des snapshots anciens :

1. **Créer manuellement des snapshots avec dates anciennes** (simulant des anciens backups) :

```bash
# Snapshot de 100 jours (devrait être supprimé par daily-critical-backup)
PUT /_snapshot/my_backup/critical-2023-10-07
{
  "indices": "orders-2024-01",
  "metadata": {
    "simulated_old_snapshot": true
  }
}

# Snapshot de 20 jours (devrait être conservé)
PUT /_snapshot/my_backup/critical-2023-12-26
{
  "indices": "orders-2024-01"
}
```

2. **Forcer l'exécution de la rétention** :

```bash
POST /_slm/_execute_retention
```

**Résultat attendu** :
```json
{
  "acknowledged": true
}
```

3. **Vérifier que le snapshot ancien a été supprimé** :

```bash
GET /_snapshot/my_backup/_all
```

Le snapshot `critical-2023-10-07` (100 jours) devrait avoir été supprimé automatiquement.

### Étape 11: Surveillance et Alertes SLM

**Vérifier l'historique global de SLM** :

```bash
GET /_slm/stats
```

**Résultat attendu** :
```json
{
  "retention_runs": 1,
  "retention_failed": 0,
  "retention_timed_out": 0,
  "retention_deletion_time": "15ms",
  "retention_deletion_time_millis": 15,
  "total_snapshots_taken": 3,
  "total_snapshots_failed": 0,
  "total_snapshots_deleted": 1,
  "total_snapshot_deletion_failures": 0,
  "policy_stats": [
    {
      "policy": "daily-critical-backup",
      "snapshots_taken": 1,
      "snapshots_failed": 0
    },
    ...
  ]
}
```

**Consulter le statut d'une politique spécifique** :

```bash
GET /_slm/policy/daily-critical-backup/_status
```

### Étape 12: Modifier une Politique SLM

Imaginons que nous voulons changer la fréquence de `daily-logs-backup` à toutes les 6 heures :

```bash
PUT /_slm/policy/daily-logs-backup
{
  "schedule": "0 0 */6 * * ?",
  "name": "<logs-{now/d}>",
  "repository": "my_backup",
  "config": {
    "indices": ["logs-*"],
    "ignore_unavailable": true,
    "include_global_state": false
  },
  "retention": {
    "expire_after": "14d",
    "min_count": 7,
    "max_count": 30
  }
}
```

**Vérifier la modification** :

```bash
GET /_slm/policy/daily-logs-backup
```

Le `version` devrait avoir incrémenté, et le `schedule` être `"0 0 */6 * * ?"`.

### Étape 13: Désactiver/Activer une Politique SLM

**Désactiver temporairement une politique** (ex: maintenance) :

```bash
POST /_slm/stop
```

Ceci arrête **toutes** les politiques SLM.

**Vérifier le statut** :

```bash
GET /_slm/status
```

**Résultat attendu** :
```json
{
  "operation_mode": "STOPPED"
}
```

**Réactiver SLM** :

```bash
POST /_slm/start
```

**Vérifier** :

```bash
GET /_slm/status
```

**Résultat attendu** :
```json
{
  "operation_mode": "RUNNING"
}
```

### Étape 14: Supprimer une Politique SLM

```bash
DELETE /_slm/policy/weekly-analytics-backup
```

**Résultat attendu** :
```json
{
  "acknowledged": true
}
```

**Note** : Supprimer une politique SLM **ne supprime pas** les snapshots déjà créés. Ils restent dans le repository.

### Validation Finale

Vérifiez que vous avez réussi le bonus challenge :

```bash
# 1. Lister toutes les politiques SLM actives
GET /_slm/policy

# 2. Vérifier les statistiques globales
GET /_slm/stats

# 3. Vérifier les snapshots créés
GET /_snapshot/my_backup/_all

# 4. Vérifier le statut SLM
GET /_slm/status
```

**Résultats attendus** :
- Au moins 2 politiques SLM configurées et actives
- `operation_mode: "RUNNING"`
- Au moins 2 snapshots créés par les politiques
- Statistiques montrant `total_snapshots_taken > 0` et `total_snapshots_failed = 0`

### Défis Supplémentaires

**Défi 1** : Créer une politique SLM mensuelle pour les archives

```bash
PUT /_slm/policy/monthly-archive
{
  "schedule": "0 0 4 1 * ?",
  "name": "<archive-{now/M}>",
  "repository": "my_backup",
  "config": {
    "indices": "*",
    "include_global_state": true
  },
  "retention": {
    "expire_after": "365d",
    "min_count": 12,
    "max_count": 24
  }
}
```

**Défi 2** : Créer une alerte Kibana pour surveiller les échecs SLM

1. Aller dans **Stack Management** → **Rules**
2. Créer une règle **Elasticsearch query**
3. Query pour détecter les échecs :

```json
{
  "query": {
    "bool": {
      "must": [
        { "term": { "event.action": "snapshot-failed" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  }
}
```

### Points Clés à Retenir

✅ **SLM automatise** la création et le nettoyage de snapshots selon des politiques déclaratives  
✅ Les **expressions cron** définissent la planification (quotidien, hebdomadaire, mensuel)  
✅ La **rétention** combine `expire_after`, `min_count`, et `max_count` pour contrôler le nettoyage  
✅ Les **templates de noms** (`{now/d}`, `{now/w}`) génèrent des noms uniques avec dates  
✅ `POST /_slm/_execute_retention` force l'exécution de la rétention  
✅ `POST /_slm/policy/<name>/_execute` exécute manuellement une politique (utile pour tests)  
✅ `POST /_slm/stop` et `POST /_slm/start` contrôlent globalement toutes les politiques  
✅ Supprimer une politique **ne supprime pas** les snapshots déjà créés  
✅ Les **métadonnées personnalisées** aident à documenter et organiser les snapshots  
✅ Utilisez différentes politiques SLM pour différents types de données (criticité, fréquence)

**Félicitations !** Vous maîtrisez maintenant les opérations de maintenance avancées d'Elasticsearch ! 🎉


---


## Lab 8.1: Configuration de Dedicated Master Nodes

**Objectif**: Mettre en place une architecture de cluster avec séparation des rôles master et data pour améliorer la stabilité et les performances en production.

**Contexte**: Dans un cluster de production, il est recommandé de séparer les nœuds master (gestion du cluster) des nœuds data (stockage et recherche) pour éviter que les tâches de gestion impactent les performances des requêtes. Dans ce lab, vous allez créer un cluster avec 3 dedicated master nodes et 3 data nodes.

### Prérequis : Docker et Docker Compose

Ce lab utilise Docker Compose pour simuler un cluster multi-nœuds.

### Étape 1: Créer la Configuration Docker Compose

Créez un fichier `docker-compose-prod.yml` :

```yaml
version: '3.8'

services:
  # === DEDICATED MASTER NODES ===
  master-1:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-master-1
    environment:
      - node.name=master-1
      - cluster.name=es-prod-cluster
      - node.roles=master
      - discovery.seed_hosts=master-2,master-3
      - cluster.initial_master_nodes=master-1,master-2,master-3
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - master1-data:/usr/share/elasticsearch/data
    networks:
      - elastic-prod

  master-2:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-master-2
    environment:
      - node.name=master-2
      - cluster.name=es-prod-cluster
      - node.roles=master
      - discovery.seed_hosts=master-1,master-3
      - cluster.initial_master_nodes=master-1,master-2,master-3
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - master2-data:/usr/share/elasticsearch/data
    networks:
      - elastic-prod

  master-3:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-master-3
    environment:
      - node.name=master-3
      - cluster.name=es-prod-cluster
      - node.roles=master
      - discovery.seed_hosts=master-1,master-2
      - cluster.initial_master_nodes=master-1,master-2,master-3
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - master3-data:/usr/share/elasticsearch/data
    networks:
      - elastic-prod

  # === DATA NODES ===
  data-1:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-data-1
    environment:
      - node.name=data-1
      - cluster.name=es-prod-cluster
      - node.roles=data,ingest
      - discovery.seed_hosts=master-1,master-2,master-3
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data1-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    networks:
      - elastic-prod
    depends_on:
      - master-1
      - master-2
      - master-3

  data-2:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-data-2
    environment:
      - node.name=data-2
      - cluster.name=es-prod-cluster
      - node.roles=data,ingest
      - discovery.seed_hosts=master-1,master-2,master-3
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data2-data:/usr/share/elasticsearch/data
    networks:
      - elastic-prod
    depends_on:
      - master-1
      - master-2
      - master-3

  data-3:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-data-3
    environment:
      - node.name=data-3
      - cluster.name=es-prod-cluster
      - node.roles=data,ingest
      - discovery.seed_hosts=master-1,master-2,master-3
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data3-data:/usr/share/elasticsearch/data
    networks:
      - elastic-prod
    depends_on:
      - master-1
      - master-2
      - master-3

volumes:
  master1-data:
  master2-data:
  master3-data:
  data1-data:
  data2-data:
  data3-data:

networks:
  elastic-prod:
    driver: bridge
```

### Étape 2: Démarrer le Cluster

```bash
docker-compose -f docker-compose-prod.yml up -d
```

**Attendre 30-60 secondes** que tous les nœuds démarrent et forment le cluster.

### Étape 3: Vérifier la Formation du Cluster

```bash
# Vérifier que tous les nœuds sont présents
curl "http://localhost:9200/_cat/nodes?v&h=name,node.role,master,heap.percent,ram.percent"
```

**Résultat attendu** :
```
name     node.role master heap.percent ram.percent
master-1 m         *      15           25
master-2 m         -      12           20
master-3 m         -      10           18
data-1   di        -      25           35
data-2   di        -      30           40
data-3   di        -      28           38
```

**Analyse** :
- ✅ 3 nœuds avec rôle `m` (master-only)
- ✅ 3 nœuds avec rôle `di` (data + ingest)
- ✅ Un seul master élu (marqué `*`)

### Étape 4: Vérifier le Quorum de Masters

```bash
curl "http://localhost:9200/_cluster/health?pretty"
```

**Résultat attendu** :
```json
{
  "cluster_name": "es-prod-cluster",
  "status": "green",
  "number_of_nodes": 6,
  "number_of_data_nodes": 3,
  "active_primary_shards": 0,
  "active_shards": 0
}
```

**Points clés** :
- `number_of_nodes: 6` (3 masters + 3 data)
- `number_of_data_nodes: 3` (seulement les data nodes)

### Étape 5: Tester la Résilience des Masters

Simulons la panne d'un master node :

```bash
# Arrêter master-3
docker stop es-master-3
```

**Vérifier que le cluster reste opérationnel** :

```bash
curl "http://localhost:9200/_cluster/health?pretty"
```

**Résultat attendu** :
```json
{
  "status": "green",
  "number_of_nodes": 5,
  "number_of_data_nodes": 3
}
```

**Analyse** : Le cluster reste GREEN car :
- Quorum = 2 (sur 3 masters)
- 2 masters actifs (master-1, master-2) > quorum
- Tous les data nodes opérationnels

**Redémarrer master-3** :

```bash
docker start es-master-3
```

### Étape 6: Créer des Indices de Test

Créons des indices avec répliques :

```bash
curl -X PUT "http://localhost:9200/test-prod-1" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2
  }
}'

curl -X PUT "http://localhost:9200/test-prod-2" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}'
```

**Indexer des données** :

```bash
for i in {1..100}; do
  curl -X POST "http://localhost:9200/test-prod-1/_doc" -H 'Content-Type: application/json' -d"
  {
    \"id\": $i,
    \"message\": \"Test document $i\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }"
done
```

### Étape 7: Vérifier la Répartition des Shards

```bash
curl "http://localhost:9200/_cat/shards/test-prod-*?v&h=index,shard,prirep,state,node&s=index,shard"
```

**Résultat attendu** :
```
index        shard prirep state   node
test-prod-1  0     p      STARTED data-1
test-prod-1  0     r      STARTED data-2
test-prod-1  0     r      STARTED data-3
test-prod-1  1     p      STARTED data-2
test-prod-1  1     r      STARTED data-1
test-prod-1  1     r      STARTED data-3
...
```

**Analyse** :
- ✅ Les shards sont **uniquement** sur les data nodes (data-1, data-2, data-3)
- ✅ **Aucun shard** sur les master nodes
- ✅ Répliques distribuées sur différents data nodes

### Étape 8: Tester la Panne d'un Data Node

```bash
# Arrêter data-2
docker stop es-data-2
```

**Vérifier la santé du cluster** :

```bash
curl "http://localhost:9200/_cluster/health?pretty"
```

**Résultat attendu** :
```json
{
  "status": "yellow",
  "number_of_nodes": 5,
  "number_of_data_nodes": 2,
  "relocating_shards": 0,
  "initializing_shards": 0,
  "unassigned_shards": 3
}
```

**Analyse** :
- Cluster passe en YELLOW (certaines répliques non assignées)
- Mais **toujours fonctionnel** (tous les primaires actifs)
- Masters non affectés (quorum intact)

**Redémarrer data-2** :

```bash
docker start es-data-2
```

Le cluster retournera automatiquement à GREEN après récupération des shards.

### Étape 9: Mesurer les Ressources des Masters vs Data Nodes

```bash
curl "http://localhost:9200/_cat/nodes?v&h=name,node.role,heap.current,heap.percent,heap.max,ram.current,ram.percent"
```

**Observation** :
- Masters : Heap faible (< 20%), peu de RAM
- Data nodes : Heap plus élevé (30-50%), plus de RAM

**Pourquoi ?** Les masters gèrent uniquement les métadonnées (état du cluster), les data nodes gèrent les données et les requêtes.

### Validation Finale

```bash
# 1. Vérifier l'architecture
curl "http://localhost:9200/_cat/nodes?v"

# 2. Vérifier le master élu
curl "http://localhost:9200/_cat/master?v"

# 3. Vérifier les settings de découverte
curl "http://localhost:9200/_nodes/master-1/settings?pretty&filter_path=nodes.*.settings.cluster,nodes.*.settings.discovery"

# 4. Compter les shards
curl "http://localhost:9200/_cat/shards?v&h=index,shard,prirep,node" | grep -c data
```

**Résultats attendus** :
- 6 nœuds (3 masters, 3 data)
- Un seul master élu
- `cluster.initial_master_nodes` configuré avec 3 masters
- Tous les shards sur data nodes uniquement

### Points Clés à Retenir

✅ **Dedicated master nodes** séparent gestion (masters) et traitement (data)  
✅ **Quorum de 3 masters** tolère 1 panne (quorum = 2)  
✅ **node.roles** définit les responsabilités de chaque nœud  
✅ Masters : `node.roles: [master]`, Data : `node.roles: [data, ingest]`  
✅ **cluster.initial_master_nodes** liste les masters pour l'initialisation  
✅ **discovery.seed_hosts** permet aux nœuds de se découvrir  
✅ Panne d'un master **n'affecte pas** les opérations data  
✅ Data nodes peuvent être ajoutés/retirés sans toucher aux masters  
✅ Architecture recommandée pour **production** (stabilité et scalabilité)

---

## Lab 8.2: Implémentation de Shard Allocation Awareness

**Objectif**: Configurer la rack awareness (shard allocation awareness) pour distribuer les shards primaires et répliques sur différentes zones de disponibilité, garantissant ainsi la haute disponibilité en cas de panne d'une zone entière.

**Contexte**: Par défaut, Elasticsearch alloue les shards sans considération géographique. Si tous vos nœuds sont dans le même datacenter/rack et qu'il tombe en panne, vous perdez toutes vos données. La rack awareness force Elasticsearch à distribuer les répliques sur différentes zones.

### Scénario

Vous gérez un cluster avec nœuds répartis sur **2 zones de disponibilité** (Zone A et Zone B). Vous voulez garantir que chaque shard primaire a au moins une réplique dans une zone différente.

### Étape 1: Arrêter le Cluster Précédent

```bash
docker-compose -f docker-compose-prod.yml down -v
```

### Étape 2: Créer la Configuration avec Awareness

Créez `docker-compose-awareness.yml` :

```yaml
version: '3.8'

services:
  # === ZONE A ===
  master-a:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-master-a
    environment:
      - node.name=master-a
      - cluster.name=es-aware-cluster
      - node.roles=master
      - node.attr.zone=zone_a
      - cluster.routing.allocation.awareness.attributes=zone
      - cluster.routing.allocation.awareness.force.zone.values=zone_a,zone_b
      - discovery.seed_hosts=master-b,data-a1,data-b1
      - cluster.initial_master_nodes=master-a,master-b
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    networks:
      - elastic-aware

  data-a1:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-data-a1
    environment:
      - node.name=data-a1
      - cluster.name=es-aware-cluster
      - node.roles=data,ingest
      - node.attr.zone=zone_a
      - cluster.routing.allocation.awareness.attributes=zone
      - cluster.routing.allocation.awareness.force.zone.values=zone_a,zone_b
      - discovery.seed_hosts=master-a,master-b
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    networks:
      - elastic-aware

  data-a2:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-data-a2
    environment:
      - node.name=data-a2
      - cluster.name=es-aware-cluster
      - node.roles=data,ingest
      - node.attr.zone=zone_a
      - cluster.routing.allocation.awareness.attributes=zone
      - cluster.routing.allocation.awareness.force.zone.values=zone_a,zone_b
      - discovery.seed_hosts=master-a,master-b
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - xpack.security.enabled=false
    networks:
      - elastic-aware

  # === ZONE B ===
  master-b:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-master-b
    environment:
      - node.name=master-b
      - cluster.name=es-aware-cluster
      - node.roles=master
      - node.attr.zone=zone_b
      - cluster.routing.allocation.awareness.attributes=zone
      - cluster.routing.allocation.awareness.force.zone.values=zone_a,zone_b
      - discovery.seed_hosts=master-a,data-a1,data-b1
      - cluster.initial_master_nodes=master-a,master-b
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    networks:
      - elastic-aware

  data-b1:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-data-b1
    environment:
      - node.name=data-b1
      - cluster.name=es-aware-cluster
      - node.roles=data,ingest
      - node.attr.zone=zone_b
      - cluster.routing.allocation.awareness.attributes=zone
      - cluster.routing.allocation.awareness.force.zone.values=zone_a,zone_b
      - discovery.seed_hosts=master-a,master-b
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - xpack.security.enabled=false
    networks:
      - elastic-aware

  data-b2:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-data-b2
    environment:
      - node.name=data-b2
      - cluster.name=es-aware-cluster
      - node.roles=data,ingest
      - node.attr.zone=zone_b
      - cluster.routing.allocation.awareness.attributes=zone
      - cluster.routing.allocation.awareness.force.zone.values=zone_a,zone_b
      - discovery.seed_hosts=master-a,master-b
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - xpack.security.enabled=false
    networks:
      - elastic-aware

networks:
  elastic-aware:
    driver: bridge
```

**Paramètres clés** :
- `node.attr.zone` : Déclare la zone du nœud (zone_a ou zone_b)
- `cluster.routing.allocation.awareness.attributes` : Elasticsearch doit être aware de l'attribut "zone"
- `cluster.routing.allocation.awareness.force.zone.values` : Force la distribution sur les 2 zones

### Étape 3: Démarrer le Cluster

```bash
docker-compose -f docker-compose-awareness.yml up -d
```

### Étape 4: Vérifier les Attributs de Zone

```bash
curl "http://localhost:9200/_cat/nodeattrs?v&h=node,attr,value&s=node"
```

**Résultat attendu** :
```
node     attr value
data-a1  zone zone_a
data-a2  zone zone_a
data-b1  zone zone_b
data-b2  zone zone_b
master-a zone zone_a
master-b zone zone_b
```

### Étape 5: Créer un Index avec Répliques

```bash
curl -X PUT "http://localhost:9200/ha-test" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 4,
    "number_of_replicas": 1
  }
}'

# Indexer des données
for i in {1..50}; do
  curl -X POST "http://localhost:9200/ha-test/_doc" -H 'Content-Type: application/json' -d"
  {
    \"id\": $i,
    \"zone_test\": true,
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }"
done
```

### Étape 6: Vérifier la Distribution des Shards

```bash
curl "http://localhost:9200/_cat/shards/ha-test?v&h=index,shard,prirep,state,node&s=shard"
```

**Résultat attendu (exemple)** :
```
index   shard prirep state   node
ha-test 0     p      STARTED data-a1
ha-test 0     r      STARTED data-b1
ha-test 1     p      STARTED data-b2
ha-test 1     r      STARTED data-a2
ha-test 2     p      STARTED data-a2
ha-test 2     r      STARTED data-b2
ha-test 3     p      STARTED data-b1
ha-test 3     r      STARTED data-a1
```

**Analyse** :
- ✅ Chaque shard primaire (p) a sa réplique (r) sur une **zone différente**
- ✅ Shard 0 : primaire sur zone_a, réplique sur zone_b
- ✅ Shard 1 : primaire sur zone_b, réplique sur zone_a
- ✅ **JAMAIS** primaire et réplique sur la même zone

### Étape 7: Visualiser la Distribution par Zone

```bash
curl "http://localhost:9200/_cat/shards/ha-test?v&h=index,shard,prirep,node" | awk '
BEGIN {print "Zone A (primaires) | Zone A (répliques) | Zone B (primaires) | Zone B (répliques)"}
/data-a/ && /p/ {za_p++}
/data-a/ && /r/ {za_r++}
/data-b/ && /p/ {zb_p++}
/data-b/ && /r/ {zb_r++}
END {print za_p " | " za_r " | " zb_p " | " zb_r}
'
```

**Résultat attendu** : Distribution équilibrée, par exemple `2 | 2 | 2 | 2`

### Étape 8: Tester la Résilience (Panne d'une Zone Complète)

Simulons la panne de **toute la Zone A** :

```bash
docker stop es-master-a es-data-a1 es-data-a2
```

**Vérifier la santé du cluster** :

```bash
curl "http://localhost:9200/_cluster/health?pretty"
```

**Résultat attendu** :
```json
{
  "status": "yellow",
  "number_of_nodes": 3,
  "number_of_data_nodes": 2,
  "active_primary_shards": 4,
  "active_shards": 4,
  "relocating_shards": 0,
  "initializing_shards": 0,
  "unassigned_shards": 4,
  "unassigned_reason": "NODE_LEFT"
}
```

**Analyse** :
- ✅ Cluster status YELLOW (pas RED !)
- ✅ **Tous les primaires actifs** (4/4)
- ✅ Données toujours accessibles (Zone B a tous les primaires ou répliques)
- ❌ 4 répliques non assignées (étaient sur Zone A)

**Tester l'accès aux données** :

```bash
curl "http://localhost:9200/ha-test/_count"
```

**Résultat attendu** : `{"count": 50}` - **Toutes les données accessibles** !

### Étape 9: Restaurer la Zone A

```bash
docker start es-master-a es-data-a1 es-data-a2
```

Le cluster retournera automatiquement à GREEN après réallocation des répliques.

### Étape 10: Tester Sans Awareness (Comparaison)

Pour comparer, créons un index **sans** forcer la distribution :

```bash
# Temporairement désactiver force awareness
curl -X PUT "http://localhost:9200/_cluster/settings" -H 'Content-Type: application/json' -d'
{
  "transient": {
    "cluster.routing.allocation.awareness.force.zone.values": null
  }
}'

# Créer index sans garantie de distribution
curl -X PUT "http://localhost:9200/no-awareness-test" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}'
```

**Vérifier la distribution** :

```bash
curl "http://localhost:9200/_cat/shards/no-awareness-test?v&h=shard,prirep,node"
```

**Possibilité** : Primaire et réplique sur **la même zone** (risque de perte de données si la zone tombe).

### Validation Finale

```bash
# 1. Vérifier les attributs de zone
curl "http://localhost:9200/_cat/nodeattrs?v&h=node,attr,value" | grep zone

# 2. Vérifier les settings awareness
curl "http://localhost:9200/_cluster/settings?include_defaults=true&filter_path=*.cluster.routing.allocation.awareness.*"

# 3. Statistiques de shards par zone
curl "http://localhost:9200/_cat/shards/ha-test?v&h=node,prirep" | awk '
/data-a/ {zone_a++}
/data-b/ {zone_b++}
END {print "Zone A shards: " zone_a "\nZone B shards: " zone_b}'

# 4. Tester la perte d'une zone complète
docker stop es-data-a1 es-data-a2
curl "http://localhost:9200/ha-test/_count"
# Devrait retourner le count complet même avec Zone A down
```

### Points Clés à Retenir

✅ **Rack awareness** distribue primaires et répliques sur différentes zones  
✅ `node.attr.zone` déclare la zone de chaque nœud  
✅ `cluster.routing.allocation.awareness.attributes` active l'awareness  
✅ `force.zone.values` **garantit** qu'aucune réplique ne sera sur la même zone que le primaire  
✅ **Tolérance aux pannes** : Perte d'une zone entière = YELLOW mais données accessibles  
✅ **Sans awareness** : Risque que primaire et réplique soient sur même zone (perte de données)  
✅ Use cases : Multi-datacenter, multi-AZ cloud (AWS Availability Zones, Azure Zones)  
✅ Attributs personnalisés possibles : `rack`, `datacenter`, `region`  
✅ Combiner avec répliques multiples (2+) pour tolérer perte de plusieurs zones  
✅ Essentiel pour **haute disponibilité** en production

---

## 🌟 Bonus Challenge 8.A: Architecture Complète de Production

**Niveau**: Avancé  
**Objectif**: Concevoir et implémenter une architecture de cluster Elasticsearch complète intégrant tous les best practices de production : dedicated masters, hot-warm-cold tiers, rack awareness, monitoring, et disaster recovery.

**Contexte**: Vous êtes architecte infrastructure pour une plateforme de logs qui ingère 500 GB/jour avec rétention de 90 jours. Vous devez concevoir un cluster production-ready avec haute disponibilité, performances optimales, et coûts maîtrisés.

### Exigences du Projet

**Exigences fonctionnelles** :
- Ingestion : 500 GB/jour (~6 MB/s)
- Rétention : 90 jours
- RPO : 1 heure
- RTO : 30 minutes
- Disponibilité : 99.9% (< 8h downtime/an)

**Exigences techniques** :
- Multi-zone (2 zones minimum)
- Hot-Warm-Cold architecture
- Dedicated master nodes
- Snapshots automatisés
- Monitoring et alerting

### Étape 1: Dimensionnement

**Calcul de stockage** :
- 500 GB/jour × 90 jours = 45 TB total
- Hot tier (7 jours) : 3.5 TB
- Warm tier (30 jours) : 15 TB
- Cold tier (53 jours) : 26.5 TB

**Calcul de shards** :
- Taille cible par shard : 30 GB
- Hot : 3500 GB / 30 GB = ~117 shards
- Avec rotation quotidienne : 7 indices × 17 shards = 119 primaires

**Dimensionnement nœuds** :

| Tier | Nœuds | RAM | CPU | Disque | Total Disque |
|------|-------|-----|-----|--------|--------------|
| Master | 3 | 8 GB | 4 cores | 100 GB | 300 GB |
| Hot | 6 | 32 GB | 16 cores | 1 TB SSD | 6 TB |
| Warm | 4 | 16 GB | 8 cores | 5 TB HDD | 20 TB |
| Cold | 3 | 8 GB | 4 cores | 12 TB HDD | 36 TB |

**Total** : 16 nœuds

### Étape 2: Architecture Diagram (Textuel)

```
┌────────────────────────────────────────────────────────────────┐
│  ZONE A                           ZONE B                        │
│                                                                  │
│  ┌─────────────┐                  ┌─────────────┐              │
│  │  Master-A1  │                  │  Master-B1  │              │
│  └─────────────┘                  └─────────────┘              │
│         Master-A2 (zone_a)               (zone_b)              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  HOT TIER (SSD, 7 jours)                                 │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         │  │
│  │  │ Hot-A1 │  │ Hot-A2 │  │ Hot-B1 │  │ Hot-B2 │  ...    │  │
│  │  └────────┘  └────────┘  └────────┘  └────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  WARM TIER (HDD, 30 jours)                               │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │  │
│  │  │ Warm-A1 │  │ Warm-A2 │  │ Warm-B1 │  │ Warm-B2 │    │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  COLD TIER (Searchable Snapshots, 53 jours)             │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │  │
│  │  │ Cold-A1 │  │ Cold-B1 │  │ Cold-B2 │                 │  │
│  │  └─────────┘  └─────────┘  └─────────┘                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MONITORING                                               │  │
│  │  Kibana (Stack Monitoring) + Prometheus + Grafana        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Étape 3: Configuration ILM Policy

Créez une politique ILM complète pour gérer le cycle de vie :

```json
PUT _ilm/policy/logs-lifecycle
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_primary_shard_size": "30GB",
            "max_age": "1d"
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "set_priority": {
            "priority": 50
          },
          "migrate": {
            "enabled": true
          },
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          },
          "readonly": {}
        }
      },
      "cold": {
        "min_age": "37d",
        "actions": {
          "set_priority": {
            "priority": 0
          },
          "migrate": {
            "enabled": true
          },
          "searchable_snapshot": {
            "snapshot_repository": "s3_backup",
            "force_merge_index": true
          }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {
            "delete_searchable_snapshot": true
          }
        }
      }
    }
  }
}
```

### Étape 4: Configuration Index Template

```json
PUT _index_template/logs-template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs-lifecycle",
      "index.lifecycle.rollover_alias": "logs-write"
    },
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date"
        },
        "message": {
          "type": "text"
        },
        "level": {
          "type": "keyword"
        },
        "service": {
          "type": "keyword"
        },
        "host": {
          "type": "keyword"
        }
      }
    }
  },
  "priority": 500
}
```

### Étape 5: Configuration SLM (Snapshot Lifecycle Management)

```json
PUT _slm/policy/daily-snapshots
{
  "schedule": "0 30 2 * * ?",
  "name": "<logs-{now/d}>",
  "repository": "s3_backup",
  "config": {
    "indices": ["logs-*"],
    "ignore_unavailable": true,
    "include_global_state": false
  },
  "retention": {
    "expire_after": "7d",
    "min_count": 7,
    "max_count": 30
  }
}
```

### Étape 6: Monitoring et Alerting Setup

**Alertes critiques à configurer** :

1. **Cluster Health RED** :
```json
PUT _watcher/watch/cluster-health-red
{
  "trigger": {
    "schedule": {
      "interval": "1m"
    }
  },
  "input": {
    "http": {
      "request": {
        "url": "http://localhost:9200/_cluster/health"
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.status": {
        "eq": "red"
      }
    }
  },
  "actions": {
    "notify_ops": {
      "webhook": {
        "url": "https://alerts.example.com/elasticsearch",
        "method": "post",
        "body": "Cluster is RED! Immediate action required."
      }
    }
  }
}
```

2. **Heap > 85%** (déjà créé dans Lab 5.2)

3. **Disk > 85%** :
```json
PUT _watcher/watch/disk-usage-high
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": [".monitoring-es-*"],
        "body": {
          "query": {
            "bool": {
              "must": [
                {
                  "range": {
                    "@timestamp": {
                      "gte": "now-10m"
                    }
                  }
                },
                {
                  "range": {
                    "node_stats.fs.total.available_in_bytes": {
                      "lt": "{{ ctx.metadata.threshold_bytes }}"
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  },
  "metadata": {
    "threshold_bytes": 107374182400
  }
}
```

### Étape 7: Disaster Recovery Plan

**Documentation du DR Plan** :

```markdown
# Disaster Recovery Runbook

## RPO: 1 heure
## RTO: 30 minutes

### Scenario 1: Perte d'une Zone Complète

**Detection**:
- Cluster status: YELLOW
- 50% des nœuds down
- Shards unassigned avec raison NODE_LEFT

**Actions**:
1. Vérifier que les primaires sont tous actifs (Zone B)
2. Ne PAS forcer allocation immédiatement (attendre 10 minutes)
3. Si Zone A ne revient pas : Augmenter répliques temporairement
4. Communiquer aux stakeholders : Service dégradé mais opérationnel

**Recovery**:
1. Une fois Zone A revenue : Laisser auto-recovery
2. Monitorer la réallocation des shards
3. Vérifier cluster GREEN après recovery

### Scenario 2: Corruption de Données

**Detection**:
- Requêtes retournent données incorrectes
- Shards en état UNASSIGNED avec raison ALLOCATION_FAILED

**Actions**:
1. Identifier l'index corrompu
2. Restaurer depuis dernier snapshot (max 1h de perte)
3. Restaurer avec rename : `restored_<index-name>`
4. Valider les données
5. Basculer alias vers index restauré
6. Supprimer index corrompu

**Commandes**:
```bash
# 1. Lister snapshots
GET /_snapshot/s3_backup/_all

# 2. Restaurer
POST /_snapshot/s3_backup/logs-2024-01-15/_restore
{
  "indices": "logs-2024-01-15",
  "rename_pattern": "(.+)",
  "rename_replacement": "restored_$1"
}

# 3. Basculer alias
POST /_aliases
{
  "actions": [
    {"remove": {"index": "logs-2024-01-15", "alias": "logs-current"}},
    {"add": {"index": "restored_logs-2024-01-15", "alias": "logs-current"}}
  ]
}
```
```

### Étape 8: Validation de l'Architecture

**Checklist de validation** :

- ✅ **Sizing** : Calculé selon charges réelles (500 GB/jour)
- ✅ **HA** : Multi-zone, répliques, quorum masters
- ✅ **Performance** : Hot tier SSD, shards < 50 GB
- ✅ **Coûts** : Warm/Cold HDD pour archives
- ✅ **Lifecycle** : ILM automatisé (hot→warm→cold→delete)
- ✅ **Backups** : SLM quotidien, rétention 7 jours
- ✅ **Monitoring** : Alertes critiques (health, heap, disk)
- ✅ **DR** : Runbook documenté, RPO/RTO testés
- ✅ **Security** : RBAC, TLS, audit logging
- ✅ **Documentation** : Architecture diagrams, runbooks

### Points Clés à Retenir

✅ **Dimensionnement** basé sur charges réelles et croissance  
✅ **Hot-Warm-Cold** optimise coûts (SSD uniquement pour données actives)  
✅ **ILM automatise** le cycle de vie (rollover, migration, suppression)  
✅ **Multi-zone** avec rack awareness garantit HA  
✅ **SLM** automatise les snapshots pour DR  
✅ **Monitoring proactif** détecte problèmes avant impact utilisateur  
✅ **Runbooks documentés** accélèrent résolution incidents  
✅ **Tests réguliers** (DR, load testing) valident l'architecture  
✅ **Architecture évolutive** : Ajouter nœuds horizontalement selon besoins  
✅ **Trade-offs** : Performance vs Coûts vs Complexité

**Félicitations !** Vous avez conçu une architecture Elasticsearch production-ready ! 🎉

---

## 🌟 Bonus Challenge 8.B: Création d'un Runbook de Réponse aux Incidents

**Niveau**: Avancé  
**Objectif**: Créer un runbook détaillé et actionnable pour les incidents de production les plus courants, avec diagnostics, mitigations, et procédures de résolution étape par étape.

**Contexte**: Les incidents de production doivent être résolus rapidement. Un runbook bien documenté permet à l'équipe ops (même juniors) de diagnostiquer et résoudre les problèmes sans escalation systématique.

### Format du Runbook

Chaque incident doit inclure :
1. **Symptômes** : Comment détecter l'incident
2. **Diagnostic** : Commandes pour identifier la cause root
3. **Sévérité** : P0 (critique), P1 (majeur), P2 (mineur)
4. **Mitigation** : Actions immédiates pour réduire l'impact
5. **Résolution** : Solution définitive
6. **Post-Mortem** : Template de documentation

### Incident 1: Cluster Status RED - Shards Non Assignés

**Sévérité** : P0 (CRITIQUE)

**Symptômes** :
- Dashboard monitoring affiche status RED
- Alertes : "Cluster health RED"
- Utilisateurs rapportent données manquantes

**Diagnostic Étape par Étape** :

```bash
# Étape 1 : Vérifier la santé globale
GET /_cluster/health?pretty

# Résultat attendu :
# {
#   "status": "red",
#   "unassigned_shards": 5,
#   ...
# }

# Étape 2 : Identifier les indices RED
GET /_cat/indices?v&health=red&s=index

# Étape 3 : Identifier les shards non assignés
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason,node | grep UNASSIGNED

# Étape 4 : Comprendre POURQUOI non assignés
GET /_cluster/allocation/explain
{
  "index": "problematic-index",
  "shard": 0,
  "primary": true
}
```

**Causes Courantes et Solutions** :

**Cause 1 : Nœud(s) down** :
```bash
# Diagnostic
GET /_cat/nodes?v

# Solution : Attendre recovery auto (5 min)
# Ou redémarrer nœud manuellement
```

**Cause 2 : Disk watermark exceeded** :
```bash
# Diagnostic
GET /_cat/allocation?v&h=node,disk.avail,disk.used,disk.percent

# Solution immédiate : Augmenter watermark temporairement
PUT /_cluster/settings
{
  "transient": {
    "cluster.routing.allocation.disk.watermark.low": "95%",
    "cluster.routing.allocation.disk.watermark.high": "97%",
    "cluster.routing.allocation.disk.watermark.flood_stage": "99%"
  }
}

# Solution définitive : Ajouter disque ou supprimer données anciennes
DELETE /old-index-2023-*
```

**Cause 3 : Shard corruption** :
```bash
# Diagnostic
GET /_cluster/allocation/explain

# Si décision = "NO" et raison = "ALLOCATION_FAILED"

# Solution : Restaurer depuis snapshot
POST /_snapshot/my_backup/latest/_restore
{
  "indices": "corrupted-index"
}
```

**Mitigation (Urgence)** :

Si l'index RED est non-critique :
```bash
# Supprimer temporairement pour restaurer cluster GREEN
DELETE /non-critical-index
```

Si l'index RED est critique :
```bash
# Forcer allocation d'un replica comme primaire (DANGER)
POST /_cluster/reroute
{
  "commands": [{
    "allocate_replica": {
      "index": "critical-index",
      "shard": 0,
      "node": "node-with-replica"
    }
  }]
}
```

**Post-Incident** :
- Documenter cause root
- Si disk full : Planifier augmentation capacité
- Si corruption : Vérifier intégrité hardware

---

### Incident 2: Performance Dégradée - Searches Lentes

**Sévérité** : P1 (MAJEUR)

**Symptômes** :
- P95 search latency > 5s (normal < 1s)
- Utilisateurs rapportent lenteur application
- Dashboards Kibana chargent lentement

**Diagnostic** :

```bash
# Étape 1 : Identifier les slow queries
GET /slow-index/_settings?include_defaults=false&filter_path=*.index.search.slowlog

# Si pas activé, activer temporairement :
PUT /*/_settings
{
  "index.search.slowlog.threshold.query.warn": "1s",
  "index.search.slowlog.threshold.query.info": "500ms"
}

# Étape 2 : Analyser les hot threads
GET /_nodes/hot_threads?threads=10

# Étape 3 : Vérifier heap usage
GET /_cat/nodes?v&h=name,heap.percent,heap.current,heap.max,ram.percent

# Étape 4 : Identifier les tasks lentes
GET /_cat/tasks?v&detailed&s=running_time:desc

# Étape 5 : Analyser thread pools
GET /_cat/thread_pool?v&h=name,active,rejected,queue,completed&s=rejected:desc
```

**Causes Courantes et Solutions** :

**Cause 1 : Requêtes inefficaces (wildcards, regex)** :
```bash
# Identifier dans slow logs :
# "query": { "wildcard": { "field": "*pattern*" } }

# Solution : Optimiser requête côté application
# Remplacer wildcard par prefix ou term query
```

**Cause 2 : Heap pressure (GC thrashing)** :
```bash
# Diagnostic
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.gc

# Si Old GC > 5s fréquent → Augmenter heap ou réduire charge

# Mitigation immédiate : Clear fielddata cache
POST /_cache/clear?fielddata=true
```

**Cause 3 : Shard count trop élevé** :
```bash
# Diagnostic
GET /_cat/shards?v | wc -l

# Si > 10,000 shards total → Problème

# Solution : Shrink indices anciens
POST /old-index/_shrink/old-index-shrunk
{
  "settings": {
    "index.number_of_shards": 1
  }
}
```

**Mitigation** :
```bash
# Réduire search thread pool temporairement (limit concurrent searches)
PUT /_cluster/settings
{
  "transient": {
    "thread_pool.search.size": 10
  }
}

# Ou augmenter queue size
PUT /_cluster/settings
{
  "transient": {
    "thread_pool.search.queue_size": 2000
  }
}
```

---

### Incident 3: Indexation Bloquée - Rejections

**Sévérité** : P1 (MAJEUR)

**Symptômes** :
- Erreurs 429 (Too Many Requests)
- Métriques : `bulk.rejected` > 0
- Données ne sont plus indexées

**Diagnostic** :

```bash
# Étape 1 : Vérifier les rejections
GET /_cat/thread_pool?v&h=name,active,rejected,queue&s=rejected:desc

# Étape 2 : Vérifier la queue write
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.write

# Étape 3 : Identifier la cause de lenteur
GET /_cat/pending_tasks?v

# Étape 4 : Vérifier si merges en cours
GET /_cat/nodes?v&h=name,merges.current,merges.current_docs

# Étape 5 : Disk I/O saturation ?
GET /_nodes/stats/fs?filter_path=nodes.*.fs.io_stats
```

**Solutions** :

**Cause : Write queue saturée** :
```bash
# Augmenter temporairement
PUT /_cluster/settings
{
  "transient": {
    "thread_pool.write.queue_size": 2000
  }
}

# Réduire la charge (côté application)
# Ou ajouter des data nodes
```

**Cause : Merges trop agressifs** :
```bash
# Throttle merges
PUT /*/_settings
{
  "index.merge.scheduler.max_thread_count": 1
}
```

---

### Incident 4: Split-Brain Détecté

**Sévérité** : P0 (CRITIQUE)

**Symptômes** :
- Deux clusters indépendants se forment
- Certains nœuds ne voient pas le master
- Données dupliquées/conflictuelles

**Diagnostic** :

```bash
# Étape 1 : Vérifier master élu
GET /_cat/master?v

# Exécuter sur TOUS les nœuds
# Si différents masters → Split-brain confirmé

# Étape 2 : Vérifier cluster state
GET /_cluster/state/master_node,nodes

# Étape 3 : Identifier la partition réseau
# Consulter logs réseau, firewalls
```

**Résolution** :

**URGENT : Arrêter l'écriture immédiatement** :
```bash
# Sur TOUS les clusters
PUT /_cluster/settings
{
  "persistent": {
    "cluster.blocks.read_only": true
  }
}
```

**Choisir le cluster authoritative** :
1. Cluster avec le plus de nœuds
2. Cluster avec données les plus récentes

**Fusionner** :
```bash
# 1. Arrêter cluster non-authoritative
# 2. Supprimer data directory
# 3. Reconfigurer discovery.seed_hosts
# 4. Redémarrer nœuds
```

**Prévention** :
```yaml
# elasticsearch.yml
discovery.zen.minimum_master_nodes: 2  # Pour 3 masters
```

---

### Template de Post-Mortem

```markdown
# Post-Mortem: [Titre Incident]

**Date**: YYYY-MM-DD
**Durée Totale**: Xh XXmin
**Impact**: [Description impact utilisateurs]
**Sévérité**: P0 / P1 / P2

## Timeline

| Heure | Événement |
|-------|-----------|
| 10:00 | Alerte déclenchée : Cluster RED |
| 10:05 | Équipe ops notifiée (PagerDuty) |
| 10:15 | Diagnostic identifie disk full sur node-3 |
| 10:30 | Mitigation : Augmentation watermark, suppression logs anciens |
| 11:00 | Cluster retourne à GREEN |
| 11:30 | Validation complète, monitoring normalisé |

## Root Cause

[Description détaillée de la cause racine]

Exemple : Croissance anormale de données (3x normal) suite à bug applicatif générant logs en boucle.

## Impact

- **Utilisateurs affectés** : 15% (région EMEA uniquement)
- **Requêtes échouées** : ~2,000
- **Perte de données** : Aucune (répliques OK)
- **Downtime** : 1h30 (cluster RED)

## Ce Qui a Bien Fonctionné

- ✅ Alerte déclenchée rapidement (< 5 min)
- ✅ Runbook suivi correctement
- ✅ Répliques ont permis de maintenir disponibilité partielle
- ✅ Communication stakeholders régulière

## Ce Qui Doit Être Amélioré

- ❌ Alerte disk usage n'a pas été déclenchée assez tôt
- ❌ Runbook disk full incomplet (manquait procédure suppression logs)
- ❌ Pas de capacity planning proactif

## Actions Correctives

| Action | Responsable | Deadline | Statut |
|--------|-------------|----------|--------|
| Implémenter alerte croissance anormale données | Ops Team | 2024-01-20 | TODO |
| Automatiser suppression logs anciens (ILM) | Platform Team | 2024-01-25 | TODO |
| Fixer bug applicatif | Dev Team | 2024-01-18 | DONE |
| Mettre à jour runbook disk full | Ops Lead | 2024-01-17 | DONE |
| Augmenter disk watermark thresholds | Ops Team | 2024-01-16 | DONE |

## Lessons Learned

1. **Capacity planning** doit être plus proactif (alertes sur tendances)
2. **Runbooks** doivent être testés régulièrement (drill exercises)
3. **Automation** (ILM) réduit risques humains

## Liens

- [Incident Ticket](https://jira.company.com/INC-12345)
- [Chat Logs](https://slack.com/archives/ops/threads/...)
- [Monitoring Dashboard](https://grafana.company.com/d/elasticsearch)
```

### Points Clés à Retenir

✅ **Runbooks documentés** accélèrent résolution (pas de recherche pendant incident)  
✅ **Diagnostics étape par étape** guident même équipes juniors  
✅ **Mitigation vs Résolution** : Mitigation réduit impact, résolution élimine cause  
✅ **Post-Mortems** transforment incidents en apprentissages  
✅ **Actions correctives** préviennent récurrences  
✅ **Tests réguliers** (game days, chaos engineering) valident runbooks  
✅ **Sévérités claires** (P0, P1, P2) priorisent réponses  
✅ **Communication** stakeholders transparente réduit escalations  
✅ **Automation** (alertes, auto-remediation) réduit MTTR  
✅ **Culture blameless** encourage partage et amélioration continue

**Félicitations !** Vous maîtrisez maintenant toutes les bonnes pratiques pour gérer un cluster Elasticsearch en production ! 🎉🎉🎉


---

# Jour 3 - Monitoring, Sécurité et APM

## Lab 4.1: Utilisation de l'API Cluster Health

**Topic**: Monitoring - APIs de Surveillance
**Prérequis**: Cluster Elasticsearch avec au moins 1 nœud actif

### Objectif

Maîtriser l'API `_cluster/health` pour diagnostiquer l'état du cluster, interpréter les statuts (green/yellow/red), et identifier les shards non alloués.

### Contexte

Vous recevez une alerte indiquant que le cluster est passé en statut `yellow`. Vous devez diagnostiquer la cause et comprendre l'impact sur le service.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Vérifiez que votre cluster est accessible: `GET /`
2. Créez un index de test avec replicas:

```bash
PUT /health-test
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}
```

#### Étapes

**Étape 1**: Consulter le cluster health basique

```bash
GET /_cluster/health
```

**Résultat attendu**:
```json
{
  "cluster_name": "elasticsearch",
  "status": "yellow",
  "timed_out": false,
  "number_of_nodes": 1,
  "number_of_data_nodes": 1,
  "active_primary_shards": 2,
  "active_shards": 2,
  "relocating_shards": 0,
  "initializing_shards": 0,
  "unassigned_shards": 2,
  "delayed_unassigned_shards": 0,
  "number_of_pending_tasks": 0,
  "number_of_in_flight_fetch": 0,
  "task_max_waiting_in_queue_millis": 0,
  "active_shards_percent_as_number": 50.0
}
```

**Interprétation**:
- 🟡 **status: "yellow"**: Au moins un replica shard non alloué
- ✅ **active_primary_shards: 2**: Tous les primaires sont actifs (pas de perte de données)
- ⚠️ **unassigned_shards: 2**: 2 replicas ne peuvent pas être alloués (cluster à 1 nœud)
- ⚠️ **active_shards_percent: 50%**: Seulement la moitié des shards sont actifs

**Étape 2**: Obtenir des détails par index

```bash
GET /_cluster/health?level=indices
```

**Résultat attendu**:
```json
{
  "cluster_name": "elasticsearch",
  "status": "yellow",
  "indices": {
    "health-test": {
      "status": "yellow",
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "active_primary_shards": 2,
      "active_shards": 2,
      "relocating_shards": 0,
      "initializing_shards": 0,
      "unassigned_shards": 2
    }
  }
}
```

**Observation**: L'index `health-test` est responsable du statut yellow.

**Étape 3**: Identifier les shards non alloués

```bash
GET /_cat/shards/health-test?v&h=index,shard,prirep,state,unassigned.reason
```

**Résultat attendu**:
```
index       shard prirep state      unassigned.reason
health-test 0     p      STARTED    
health-test 0     r      UNASSIGNED NODE_LEFT
health-test 1     p      STARTED    
health-test 1     r      UNASSIGNED NODE_LEFT
```

**Explication**:
- Les 2 shards primaires (p) sont STARTED ✅
- Les 2 shards replicas (r) sont UNASSIGNED avec raison "NODE_LEFT"
- **Cause**: Pas assez de nœuds pour allouer les replicas (besoin de 2 nœuds minimum)

**Étape 4**: Comprendre les couleurs de statut

| Statut | Signification | Impact | Action |
|--------|---------------|--------|--------|
| 🟢 **GREEN** | Tous les shards (primaires + replicas) alloués | Aucun | Normal |
| 🟡 **YELLOW** | Tous primaires alloués, certains replicas manquants | Fonctionnel, mais pas de HA | Surveillance, non urgent |
| 🔴 **RED** | Au moins un primaire manquant | **PERTE DE DONNÉES** | Action immédiate |

**Étape 5**: Simuler un cluster RED (optionnel, avec précaution)

**Attention**: Cette manipulation peut entraîner une perte de données temporaire.

```bash
# Créer un index
PUT /red-test
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 0
  }
}

# Indexer des documents
POST /red-test/_doc/1
{"message": "Test document"}

# Fermer l'index (simule un shard primaire indisponible)
POST /red-test/_close

# Vérifier le cluster health
GET /_cluster/health
```

**Résultat attendu**: `"status": "red"` (au moins un shard primaire fermé)

**Reopen pour restaurer**:
```bash
POST /red-test/_open
GET /_cluster/health
```

**Étape 6**: Utiliser les paramètres de l'API

**Attendre le statut green** (timeout 30s):
```bash
GET /_cluster/health?wait_for_status=green&timeout=30s
```

**Attendre qu'aucun shard ne soit relocating**:
```bash
GET /_cluster/health?wait_for_no_relocating_shards=true&timeout=30s
```

**Filtrer un index spécifique**:
```bash
GET /_cluster/health/health-test
```

#### Validation

**Commandes de vérification**:

1. Résumé cluster avec métriques clés:
```bash
GET /_cluster/health?filter_path=status,number_of_nodes,active_shards,unassigned_shards
```

2. Santé de tous les index:
```bash
GET /_cluster/health?level=indices&filter_path=indices.*.status
```

3. Identifier tous les shards unassigned du cluster:
```bash
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason | grep UNASSIGNED
```

4. Expliquer pourquoi un shard est unassigned:
```bash
GET /_cluster/allocation/explain
{
  "index": "health-test",
  "shard": 0,
  "primary": false
}
```

**Résultat exemple**:
```json
{
  "index": "health-test",
  "shard": 0,
  "primary": false,
  "current_state": "unassigned",
  "unassigned_info": {
    "reason": "INDEX_CREATED",
    "at": "2023-11-10T10:00:00.000Z",
    "details": "not enough data nodes to allocate shard, allocation would violate shard allocation rules"
  },
  "can_allocate": "no",
  "allocate_explanation": "cannot allocate because allocation is not permitted to any of the nodes"
}
```

#### Critères de Succès

- ✅ Comprendre les 3 statuts (green/yellow/red) et leur signification
- ✅ Identifier les shards unassigned avec `_cat/shards`
- ✅ Utiliser `_cluster/allocation/explain` pour diagnostiquer
- ✅ Interpréter `active_shards_percent` (100% = green, <100% = yellow/red)
- ✅ Savoir quand un statut yellow est acceptable (dev/test avec 1 nœud)

#### Dépannage

**Problème**: Cluster reste yellow même avec 2 nœuds
→ Vérifiez les règles d'allocation: `GET /_cluster/settings`
→ Vérifiez que les nœuds ont le rôle `data`: `GET /_cat/nodes?v&h=name,node.role`
→ Vérifiez l'espace disque: watermark flood peut bloquer l'allocation

**Problème**: Cluster passe en red après suppression d'un index
→ Normal temporairement, les shards doivent être réalloués
→ Attendez quelques secondes et revérifiez: `GET /_cluster/health`
→ Si reste red, vérifiez les logs: `tail -f /var/log/elasticsearch/elasticsearch.log`

**Problème**: `active_shards_percent` bloqué à un pourcentage
→ Des shards sont INITIALIZING (en cours de copie)
→ Vérifiez avec: `GET /_cat/recovery?v`
→ Attendez la fin de la récupération

---

## Lab 4.2: Monitoring des Statistiques de Nœuds

**Topic**: Monitoring - Métriques Critiques
**Prérequis**: Cluster Elasticsearch actif

### Objectif

Utiliser l'API `_nodes/stats` pour extraire les métriques critiques (heap JVM, CPU, disk I/O) et surveiller la santé des nœuds individuellement.

### Contexte

L'équipe infrastructure demande un rapport sur l'utilisation des ressources du cluster. Vous devez extraire les métriques clés pour identifier les nœuds surchargés.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Identifiez les nœuds du cluster: `GET /_cat/nodes?v`
2. Notez les noms des nœuds pour les requêtes filtrant

#### Étapes

**Étape 1**: Obtenir les statistiques JVM (heap usage)

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.name,nodes.*.jvm.mem
```

**Résultat attendu**:
```json
{
  "nodes": {
    "abc123": {
      "name": "node-1",
      "jvm": {
        "mem": {
          "heap_used_in_bytes": 5368709120,
          "heap_used_percent": 25,
          "heap_committed_in_bytes": 21474836480,
          "heap_max_in_bytes": 21474836480,
          "non_heap_used_in_bytes": 157286400,
          "non_heap_committed_in_bytes": 164626432
        }
      }
    }
  }
}
```

**Analyse**:
```
Heap used:         5,368,709,120 bytes = 5 GB
Heap max:         21,474,836,480 bytes = 20 GB
Heap used %:      25%
```

**Interprétation**:
- ✅ <75%: Sain
- ⚠️ 75-85%: Surveiller
- ❌ >85%: Critique (risque OutOfMemoryError)

**Étape 2**: Vérifier les Garbage Collection stats

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.name,nodes.*.jvm.gc
```

**Résultat attendu**:
```json
{
  "nodes": {
    "abc123": {
      "name": "node-1",
      "jvm": {
        "gc": {
          "collectors": {
            "young": {
              "collection_count": 1234,
              "collection_time_in_millis": 12340
            },
            "old": {
              "collection_count": 5,
              "collection_time_in_millis": 500
            }
          }
        }
      }
    }
  }
}
```

**Calculs**:
```
Durée moyenne GC young: 12,340 ms / 1,234 = 10 ms par GC
Durée moyenne GC old:   500 ms / 5 = 100 ms par GC
```

**Alertes**:
- ⚠️ GC young > 50 ms: Heap sous pression
- ❌ GC old > 1000 ms: Heap critiquement plein
- ❌ GC fréquents (>10/minute): Heap trop petit

**Étape 3**: Monitorer l'utilisation CPU et RAM (OS level)

```bash
GET /_nodes/stats/os?filter_path=nodes.*.name,nodes.*.os.cpu,nodes.*.os.mem
```

**Résultat attendu**:
```json
{
  "nodes": {
    "abc123": {
      "name": "node-1",
      "os": {
        "cpu": {
          "percent": 45,
          "load_average": {
            "1m": 2.5,
            "5m": 2.0,
            "15m": 1.8
          }
        },
        "mem": {
          "total_in_bytes": 68719476736,
          "free_in_bytes": 20000000000,
          "used_in_bytes": 48719476736,
          "free_percent": 29,
          "used_percent": 71
        }
      }
    }
  }
}
```

**Analyse**:
```
CPU usage:        45% (moyenne récente)
Load average 1m:  2.5 (sur un serveur 16 cores → 2.5/16 = 15.6% load)
RAM usage:        71% (incluant OS cache)
RAM free:         29%
```

**Thresholds**:
- CPU: <60% ✅, 60-80% ⚠️, >80% ❌
- Load avg: <cores ✅, cores-2×cores ⚠️, >2×cores ❌
- RAM: >20% free ✅, 10-20% free ⚠️, <10% free ❌

**Étape 4**: Vérifier l'utilisation disque et I/O

```bash
GET /_nodes/stats/fs?filter_path=nodes.*.name,nodes.*.fs.total,nodes.*.fs.io_stats
```

**Résultat attendu**:
```json
{
  "nodes": {
    "abc123": {
      "name": "node-1",
      "fs": {
        "total": {
          "total_in_bytes": 2000000000000,
          "free_in_bytes": 1200000000000,
          "available_in_bytes": 1200000000000
        },
        "io_stats": {
          "total": {
            "operations": 123456789,
            "read_operations": 98765432,
            "write_operations": 24691357,
            "read_kilobytes": 5000000,
            "write_kilobytes": 3000000
          }
        }
      }
    }
  }
}
```

**Calculs**:
```
Disque total:     2,000 GB (2 TB)
Disque utilisé:   800 GB (40%)
Disque libre:     1,200 GB (60%)

I/O read:         5,000,000 KB = 4.88 GB
I/O write:        3,000,000 KB = 2.93 GB
```

**Thresholds disque** (watermarks):
- <85%: ✅ Sain
- 85-90%: ⚠️ LOW watermark (pas de nouveaux shards)
- 90-95%: ⚠️ HIGH watermark (relocate shards)
- >95%: ❌ FLOOD (indices en read-only)

**Étape 5**: Surveiller les métriques d'indexation et recherche

```bash
GET /_nodes/stats/indices?filter_path=nodes.*.name,nodes.*.indices.indexing,nodes.*.indices.search
```

**Résultat attendu**:
```json
{
  "nodes": {
    "abc123": {
      "name": "node-1",
      "indices": {
        "indexing": {
          "index_total": 10000000,
          "index_time_in_millis": 5000000,
          "index_current": 5,
          "index_failed": 10
        },
        "search": {
          "query_total": 500000,
          "query_time_in_millis": 2000000,
          "query_current": 2,
          "fetch_total": 450000,
          "fetch_time_in_millis": 500000
        }
      }
    }
  }
}
```

**Calculs de performance**:
```
Indexing:
  - Latence moyenne: 5,000,000 ms / 10,000,000 docs = 0.5 ms/doc
  - Taux d'échec: 10 / 10,000,000 = 0.0001% ✅

Search:
  - Latence query: 2,000,000 ms / 500,000 = 4 ms/query
  - Latence fetch: 500,000 ms / 450,000 = 1.1 ms/fetch
  - Total: ~5.1 ms par recherche ✅
```

**Étape 6**: Créer un tableau de bord synthétique

Combinez toutes les métriques dans une seule requête:

```bash
GET /_nodes/stats?filter_path=nodes.*.name,nodes.*.jvm.mem.heap_used_percent,nodes.*.os.cpu.percent,nodes.*.fs.total.available_in_bytes,nodes.*.indices.search.query_time_in_millis
```

**Créez un tableau manuel**:

| Node | Heap | CPU | Disk Free | Search Latency |
|------|------|-----|-----------|----------------|
| node-1 | 25% ✅ | 45% ✅ | 60% ✅ | 4 ms ✅ |
| node-2 | 78% ⚠️ | 82% ❌ | 12% ⚠️ | 15 ms ⚠️ |

**Observations**: node-2 nécessite une attention (CPU et heap élevés).

#### Validation

**Commandes de vérification**:

1. Résumé rapide de tous les nœuds:
```bash
GET /_cat/nodes?v&h=name,heap.percent,ram.percent,cpu,load_1m,disk.used_percent
```

**Résultat**:
```
name   heap.percent ram.percent cpu load_1m disk.used_percent
node-1 25           71          45  2.5     40
```

2. Comparer les performances entre nœuds:
```bash
GET /_nodes/stats/indices?filter_path=nodes.*.name,nodes.*.indices.indexing.index_time_in_millis,nodes.*.indices.search.query_time_in_millis
```

3. Identifier le nœud le plus chargé:
```bash
GET /_cat/nodes?v&h=name,cpu,load_1m&s=cpu:desc
```

#### Critères de Succès

- ✅ Extraire heap usage avec `_nodes/stats/jvm`
- ✅ Interpréter les métriques CPU/RAM/disk
- ✅ Calculer les latences moyennes (indexing, search)
- ✅ Identifier les nœuds surchargés (CPU >80%, heap >85%)
- ✅ Comprendre les watermarks disque (85%, 90%, 95%)

#### Dépannage

**Problème**: Heap usage constamment >85%
→ Cluster sous-dimensionné, ajouter des nœuds
→ Ou augmenter le heap (si <32 GB et RAM disponible)
→ Vérifier les requêtes: certaines peuvent consommer trop de mémoire

**Problème**: CPU élevé mais load average faible
→ CPU utilisé par des tâches courtes (bursts)
→ Normal si indexation/recherche intensive par pics
→ Surveiller les thread pool rejections

**Problème**: Disque plein mais cluster n'utilise pas toute la capacité
→ Vérifier les watermarks: `GET /_cluster/settings?include_defaults&filter_path=*.cluster.routing.allocation.disk.watermark*`
→ Augmenter les watermarks si nécessaire (avec prudence)

---

## Lab 4.3: Configuration et Analyse des Slow Query Logs

**Topic**: Monitoring - Analyse des Logs
**Prérequis**: Cluster Elasticsearch, accès aux fichiers de logs

### Objectif

Configurer les slow query logs pour capturer les requêtes lentes, exécuter une requête intentionnellement lente, et analyser les logs pour identifier les optimisations possibles.

### Contexte

Les utilisateurs se plaignent de lenteur sur certaines recherches. Vous devez activer les slow logs pour identifier les requêtes problématiques et leur temps d'exécution.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Créez un index de test avec des données:

```bash
PUT /slowlog-test
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "content": { "type": "text" },
      "category": { "type": "keyword" },
      "views": { "type": "integer" }
    }
  }
}

# Indexer des documents (1000 pour avoir du volume)
POST /slowlog-test/_bulk
{"index":{}}
{"title":"Article 1","content":"Long content here...","category":"tech","views":100}
{"index":{}}
{"title":"Article 2","content":"Another long content...","category":"science","views":200}
... (répéter jusqu'à 1000 docs)
```

#### Étapes

**Étape 1**: Configurer les seuils de slow query log

```bash
PUT /slowlog-test/_settings
{
  "index.search.slowlog.threshold.query.warn": "500ms",
  "index.search.slowlog.threshold.query.info": "250ms",
  "index.search.slowlog.threshold.query.debug": "100ms",
  "index.search.slowlog.threshold.query.trace": "50ms",
  "index.search.slowlog.level": "info"
}
```

**Explication des niveaux**:
- **WARN** (500ms): Requêtes très lentes
- **INFO** (250ms): Requêtes lentes
- **DEBUG** (100ms): Requêtes moyennement lentes
- **TRACE** (50ms): Toutes les requêtes un peu lentes

**Note**: Seuls les logs du niveau configuré et au-dessus sont écrits (`level: info` → logs ≥250ms).

**Étape 2**: Configurer les slow indexing logs (optionnel)

```bash
PUT /slowlog-test/_settings
{
  "index.indexing.slowlog.threshold.index.warn": "1s",
  "index.indexing.slowlog.threshold.index.info": "500ms",
  "index.indexing.slowlog.threshold.index.debug": "250ms",
  "index.indexing.slowlog.threshold.index.trace": "100ms",
  "index.indexing.slowlog.level": "info"
}
```

**Étape 3**: Localiser les fichiers de slow logs

**Emplacement par défaut**:
```
/var/log/elasticsearch/<cluster_name>_index_search_slowlog.log
/var/log/elasticsearch/<cluster_name>_index_indexing_slowlog.log
```

**Vérifier les logs existent**:
```bash
ls -lh /var/log/elasticsearch/*slowlog.log
# ou si installation par archive:
ls -lh logs/*slowlog.log
```

**Étape 4**: Exécuter une requête lente

Créez une requête intentionnellement coûteuse (wildcard sur gros volume):

```bash
GET /slowlog-test/_search
{
  "query": {
    "wildcard": {
      "content": "*long*content*"
    }
  },
  "size": 100
}
```

**Note**: Les requêtes wildcard sont lentes car elles ne peuvent pas utiliser l'index inversé efficacement.

Ou utilisez une agrégation complexe:

```bash
GET /slowlog-test/_search
{
  "size": 0,
  "aggs": {
    "categories": {
      "terms": {
        "field": "category",
        "size": 100
      },
      "aggs": {
        "avg_views": {
          "avg": { "field": "views" }
        },
        "top_hits": {
          "top_hits": {
            "size": 10,
            "_source": ["title", "views"]
          }
        }
      }
    }
  }
}
```

**Étape 5**: Analyser les slow logs

Consultez le fichier de slow log:

```bash
tail -f /var/log/elasticsearch/elasticsearch_index_search_slowlog.log
```

**Format d'une entrée slow log**:
```
[2023-11-10T10:30:15,123][INFO ][i.s.s.query] [node-1] [slowlog-test][0] 
took[312ms], took_millis[312], total_hits[100 hits], 
types[], stats[], search_type[QUERY_THEN_FETCH], total_shards[1], 
source[{"query":{"wildcard":{"content":"*long*content*"}},"size":100}]
```

**Analyse**:
- **took**: 312 ms (au-dessus du seuil INFO de 250ms)
- **total_hits**: 100 résultats
- **source**: La requête complète (JSON)

**Étape 6**: Identifier les patterns de requêtes lentes

Recherchez dans les logs les requêtes fréquemment lentes:

```bash
# Compter les occurrences de wildcard
grep "wildcard" /var/log/elasticsearch/*_index_search_slowlog.log | wc -l

# Extraire les temps took
grep -oP 'took\[\K[0-9]+ms' /var/log/elasticsearch/*_index_search_slowlog.log | sort -n

# Identifier les index les plus impactés
grep "slowlog-test" /var/log/elasticsearch/*_index_search_slowlog.log | wc -l
```

**Étape 7**: Optimiser la requête identifiée

**Avant** (wildcard lent):
```bash
GET /slowlog-test/_search
{
  "query": {
    "wildcard": {
      "content": "*long*content*"
    }
  }
}
```
Temps: ~300ms

**Après** (match query rapide):
```bash
GET /slowlog-test/_search
{
  "query": {
    "match": {
      "content": "long content"
    }
  }
}
```
Temps: ~10ms ✅ (×30 plus rapide)

**Étape 8**: Désactiver les slow logs (si nécessaire)

```bash
PUT /slowlog-test/_settings
{
  "index.search.slowlog.threshold.query.warn": "-1",
  "index.search.slowlog.threshold.query.info": "-1",
  "index.search.slowlog.threshold.query.debug": "-1",
  "index.search.slowlog.threshold.query.trace": "-1"
}
```

**Note**: `-1` désactive le logging pour ce niveau.

#### Validation

**Commandes de vérification**:

1. Vérifier la configuration slow log d'un index:
```bash
GET /slowlog-test/_settings?include_defaults&filter_path=*.index.search.slowlog*,*.index.indexing.slowlog*
```

2. Forcer une requête lente et vérifier le log immédiatement:
```bash
# Exécuter une requête lente
GET /slowlog-test/_search?scroll=1m
{
  "size": 1000,
  "query": { "match_all": {} }
}

# Vérifier le slow log (dernières 10 lignes)
tail -10 /var/log/elasticsearch/elasticsearch_index_search_slowlog.log
```

3. Statistiques des slow logs (avec script):
```bash
# Extraire tous les temps took et calculer la moyenne
grep -oP 'took\[\K[0-9]+' /var/log/elasticsearch/*_index_search_slowlog.log | \
  awk '{ sum += $1; n++ } END { if (n > 0) print "Average: " sum/n " ms" }'
```

#### Critères de Succès

- ✅ Configurer les seuils slowlog avec `PUT /index/_settings`
- ✅ Localiser les fichiers de logs slowlog
- ✅ Exécuter une requête lente (>250ms)
- ✅ Lire et interpréter une entrée de slow log
- ✅ Identifier le type de requête lente (wildcard, agrégation complexe)
- ✅ Proposer une optimisation

#### Dépannage

**Problème**: Aucun slow log généré même avec requêtes lentes
→ Vérifiez le niveau de log: `index.search.slowlog.level` doit être au bon niveau
→ Vérifiez que la requête dépasse effectivement le seuil (mesurez avec `?profile=true`)
→ Vérifiez les permissions du fichier de log: `ls -l /var/log/elasticsearch/`

**Problème**: Fichier de slow log devient trop volumineux
→ Configurez la rotation des logs dans `log4j2.properties`:
```properties
appender.index_search_slowlog_rolling.type = RollingFile
appender.index_search_slowlog_rolling.filePattern = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}_index_search_slowlog-%d{yyyy-MM-dd}.log
appender.index_search_slowlog_rolling.policies.type = Policies
appender.index_search_slowlog_rolling.policies.time.type = TimeBasedTriggeringPolicy
appender.index_search_slowlog_rolling.policies.time.interval = 1
```

**Problème**: Trop de slow logs, bruit important
→ Augmentez les seuils: 500ms → 1s, 250ms → 500ms
→ Activez uniquement le niveau WARN (requêtes très lentes)

---

## 🌟 Bonus 4.A: Création de Dashboards Kibana pour Monitoring

**Niveau**: Avancé
**Prérequis**: Kibana installé et accessible, Stack Monitoring activé

### Objectif

Créer un dashboard Kibana personnalisé pour surveiller les KPIs clés du cluster (cluster health, heap usage, indexing rate, search latency) avec des visualisations en temps réel.

### Contexte

L'équipe DevOps souhaite un dashboard centralisé pour surveiller le cluster Elasticsearch sans avoir à exécuter manuellement des requêtes API. Vous allez créer un dashboard Kibana avec les métriques essentielles.

### Challenge

**Partie 1**: Activer Monitoring (si pas déjà fait)

Activez la collecte de métriques:

```bash
PUT /_cluster/settings
{
  "persistent": {
    "xpack.monitoring.collection.enabled": true
  }
}
```

Vérifiez dans Kibana: **Stack Monitoring** → **Overview** devrait afficher les métriques.

**Partie 2**: Créer des visualisations dans Kibana

1. **Cluster Health Gauge** (statut vert/jaune/rouge)
   - Type: **Gauge**
   - Index pattern: `.monitoring-es-*`
   - Metric: `cluster_stats.status` (field mapping)
   - Color ranges: Green (0-1), Yellow (1-2), Red (2-3)

2. **Heap Usage Line Chart** (évolution temporelle)
   - Type: **Line**
   - Index pattern: `.monitoring-es-*`
   - X-axis: `@timestamp` (Date Histogram, interval: 1 minute)
   - Y-axis: `node_stats.jvm.mem.heap_used_percent` (Average)
   - Threshold line: 85% (critical)

3. **Indexing Rate Area Chart**
   - Type: **Area**
   - Index pattern: `.monitoring-es-*`
   - X-axis: `@timestamp`
   - Y-axis: `node_stats.indices.indexing.index_total` (Derivative → docs/sec)

4. **Search Latency Bar Chart**
   - Type: **Vertical Bar**
   - Index pattern: `.monitoring-es-*`
   - X-axis: `node_stats.name` (Terms, size: 10)
   - Y-axis: `node_stats.indices.search.query_time_in_millis / node_stats.indices.search.query_total` (Scripted field)

5. **Disk Usage Metric**
   - Type: **Metric**
   - Index pattern: `.monitoring-es-*`
   - Metric: `(node_stats.fs.total.total_in_bytes - node_stats.fs.total.available_in_bytes) / node_stats.fs.total.total_in_bytes * 100` (Scripted)
   - Format: Percentage

**Partie 3**: Assembler le dashboard

1. Créez un nouveau dashboard: **Kibana → Dashboard → Create new dashboard**
2. Ajoutez toutes les visualisations créées
3. Organisez en grid:
   ```
   +-------------------+-------------------+
   | Cluster Health    | Heap Usage        |
   | (Gauge)           | (Line Chart)      |
   +-------------------+-------------------+
   | Indexing Rate     | Search Latency    |
   | (Area Chart)      | (Bar Chart)       |
   +-------------------+-------------------+
   | Disk Usage        | Thread Pool       |
   | (Metric)          | Rejections (Table)|
   +-------------------+-------------------+
   ```

**Partie 4**: Configurer les alertes (Watcher)

Créez une alerte pour heap >85%:

```bash
PUT _watcher/watch/heap_alert
{
  "trigger": {
    "schedule": {
      "interval": "1m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": [".monitoring-es-*"],
        "body": {
          "query": {
            "bool": {
              "must": [
                {
                  "range": {
                    "@timestamp": {
                      "gte": "now-2m"
                    }
                  }
                },
                {
                  "range": {
                    "node_stats.jvm.mem.heap_used_percent": {
                      "gte": 85
                    }
                  }
                }
              ]
            }
          },
          "aggs": {
            "nodes": {
              "terms": {
                "field": "node_stats.node_id"
              },
              "aggs": {
                "avg_heap": {
                  "avg": {
                    "field": "node_stats.jvm.mem.heap_used_percent"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.hits.total": {
        "gt": 0
      }
    }
  },
  "actions": {
    "log_action": {
      "logging": {
        "text": "Heap usage above 85% on nodes: {{ctx.payload.aggregations.nodes.buckets}}"
      }
    }
  }
}
```

**Partie 5**: Configurer le refresh automatique

Dans le dashboard Kibana:
- Cliquez sur l'horloge (en haut à droite)
- Sélectionnez "Auto refresh: 10 seconds"
- Time range: "Last 15 minutes"

### Validation

**Checklist dashboard complet**:

- [ ] Cluster health gauge (vert/jaune/rouge)
- [ ] Heap usage line chart avec threshold 85%
- [ ] Indexing rate area chart (docs/sec)
- [ ] Search latency bar chart par nœud
- [ ] Disk usage metric avec %
- [ ] Thread pool rejections table
- [ ] Auto-refresh configuré (10s)
- [ ] Time picker sur "Last 15 minutes"

**Questions à répondre**:

1. **Pourquoi utiliser `.monitoring-es-*` comme index pattern ?**
   - Elasticsearch stocke les métriques de monitoring dans ces index
   - Pattern avec wildcard pour inclure tous les index de monitoring (par jour)

2. **Comment calculer le taux (rate) à partir d'un compteur cumulatif ?**
   - Utiliser l'agrégation **Derivative** dans Kibana
   - Exemple: `indexing.index_total` (compteur) → Derivative → docs/sec (taux)

3. **Quelle est la différence entre Average et Sum pour les métriques ?**
   - **Average**: Moyenne sur tous les nœuds (ex: heap moyen du cluster)
   - **Sum**: Total cumulé (ex: nombre total de documents indexés)

**Critère de succès**: 
- Dashboard fonctionnel avec au moins 5 visualisations
- Métriques en temps réel (auto-refresh)
- Capable d'identifier un problème visuellement (heap spike, rejections)

---


---


## Lab 5.1: Création d'une Alerte Simple avec Kibana Rules

**Objectif**: Créer une alerte de surveillance de la santé du cluster avec Kibana Rules et tester son déclenchement.

**Contexte**: Les Kibana Rules offrent une interface graphique intuitive pour créer des alertes sans manipuler du JSON. Vous allez créer une règle qui surveille la santé du cluster et vous notifie lorsqu'il passe en statut YELLOW ou RED.

### Étape 1: Accéder à l'Interface de Gestion des Règles

1. Ouvrez Kibana dans votre navigateur
2. Dans le menu latéral, cliquez sur **Stack Management** (icône d'engrenage)
3. Sous la section **Alerts and Insights**, cliquez sur **Rules**

Vous devriez voir l'interface de gestion des règles avec la liste des règles existantes (si disponible).

### Étape 2: Créer une Nouvelle Règle

1. Cliquez sur le bouton **Create rule** en haut à droite
2. Sélectionnez le type de règle: **Elasticsearch query**
   - Ce type permet d'exécuter des requêtes Elasticsearch et de déclencher des alertes selon les résultats
3. Donnez un nom à votre règle: `cluster-health-monitor`
4. Ajoutez des tags pour organiser vos alertes: `cluster`, `health`, `ops`

### Étape 3: Configurer la Requête de Surveillance

Dans la section **Define your query**:

1. **Index**: Sélectionnez `.monitoring-es-*` ou créez un index temporaire pour les tests
2. **Time field**: `@timestamp` ou le champ de temps de votre index
3. **Query**: Configurez la requête pour surveiller la santé du cluster

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "range": {
            "@timestamp": {
              "gte": "now-5m"
            }
          }
        }
      ],
      "filter": [
        {
          "terms": {
            "cluster_state.status": ["yellow", "red"]
          }
        }
      ]
    }
  }
}
```

4. **Size**: Laissez à `100` documents
5. **Threshold**: Configurez le seuil de déclenchement
   - **WHEN**: `query matches`
   - **FOR THE LAST**: `5 minutes`
   - **GROUPED OVER**: `all documents`

### Étape 4: Alternative - Utiliser l'API Cluster Health

Si vous n'avez pas d'index de monitoring, créez une règle avec un type **ES query** simulé:

1. Créez un index de test pour simuler des états de santé:

```bash
# Créer un index de test
PUT /cluster_health_logs

# Indexer un document simulant un état YELLOW
POST /cluster_health_logs/_doc
{
  "@timestamp": "2024-01-15T10:00:00Z",
  "status": "yellow",
  "cluster_name": "es-ops-training",
  "number_of_nodes": 3,
  "unassigned_shards": 2
}
```

2. Configurez la règle pour interroger cet index:
   - **Index**: `cluster_health_logs`
   - **Time field**: `@timestamp`
   - **Query**: Rechercher les documents avec `status: yellow` ou `status: red`

### Étape 5: Configurer la Fréquence de Vérification

Dans la section **Check every**:

1. **Check every**: `1 minute`
   - La règle sera évaluée toutes les minutes
2. **Notify**: `Every time alert is active`
   - Alternative: `On status change` pour ne notifier que lors des changements d'état

### Étape 6: Définir les Actions (Actions Simplifiées pour Tests)

Pour ce premier lab, nous allons utiliser une action simple de journalisation:

1. Dans la section **Actions**, cliquez sur **Add action**
2. Sélectionnez **Server log** comme type de connecteur
   - Cette action journalise dans les logs Kibana, pratique pour les tests
3. Configurez le message:

```
Alerte: Le cluster {{context.cluster.name}} est en état {{context.status}}!

Détails:
- Statut: {{context.status}}
- Nœuds: {{context.number_of_nodes}}
- Shards non assignés: {{context.unassigned_shards}}
- Date: {{context.date}}

Action requise: Vérifier l'état du cluster avec GET _cluster/health
```

4. **Action group**: Sélectionnez `Alert` (déclenchée quand l'alerte est active)

### Étape 7: Sauvegarder et Activer la Règle

1. Cliquez sur **Save** en bas de page
2. La règle est automatiquement activée après sa création
3. Vérifiez que le statut est **Enabled** dans la liste des règles

### Étape 8: Tester le Déclenchement de l'Alerte

Maintenant testons que l'alerte se déclenche correctement:

#### Méthode 1: Simuler un État YELLOW (si environnement de test)

```bash
# Créer un index avec 2 répliques sur un cluster à 1 seul nœud
PUT /test-yellow-alert
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 2
  }
}

# Vérifier que le cluster passe en YELLOW
GET _cluster/health
```

**Résultat attendu**:
```json
{
  "cluster_name": "es-ops-training",
  "status": "yellow",
  "timed_out": false,
  "number_of_nodes": 1,
  "unassigned_shards": 2,
  ...
}
```

#### Méthode 2: Indexer un Document de Test

Si vous utilisez l'index de simulation:

```bash
# Indexer un nouveau document YELLOW
POST /cluster_health_logs/_doc
{
  "@timestamp": "{{NOW}}",
  "status": "yellow",
  "cluster_name": "es-ops-training",
  "number_of_nodes": 3,
  "unassigned_shards": 5
}

# Forcer le refresh
POST /cluster_health_logs/_refresh
```

### Étape 9: Vérifier que l'Alerte s'est Déclenchée

1. Retournez dans **Stack Management** → **Rules**
2. Cliquez sur votre règle `cluster-health-monitor`
3. Consultez l'onglet **Alert history** ou **History**
   - Vous devriez voir les déclenchements récents
4. Vérifiez les logs Kibana pour voir le message journalisé:

```bash
# Depuis votre terminal, consultez les logs Kibana
docker logs kibana | grep "cluster-health-monitor"
# OU si installation locale
tail -f /var/log/kibana/kibana.log | grep "cluster-health-monitor"
```

**Résultat attendu dans les logs**:
```
[ALERT] cluster-health-monitor: Le cluster es-ops-training est en état yellow!
```

### Étape 10: Tester la Désactivation et Modification

1. **Désactiver la règle**:
   - Dans la liste des règles, cliquez sur le switch pour désactiver `cluster-health-monitor`
   - Le statut passe à **Disabled**
   - Vérifiez qu'aucune nouvelle alerte n'est déclenchée

2. **Modifier la règle**:
   - Cliquez sur le nom de la règle
   - Cliquez sur **Edit rule** en haut à droite
   - Changez la fréquence de vérification à `5 minutes`
   - Sauvegardez

3. **Réactiver la règle**:
   - Réactivez le switch pour remettre la règle en état **Enabled**

### Validation

Vérifiez que vous avez réussi le lab:

```bash
# 1. Vérifier que la règle existe via l'API Kibana
curl -X GET "localhost:5601/api/alerting/rules" \
  -H "kbn-xsrf: true" \
  -u elastic:votre_password | jq '.data[] | select(.name=="cluster-health-monitor")'
```

**Résultat attendu**:
```json
{
  "id": "abc123...",
  "name": "cluster-health-monitor",
  "tags": ["cluster", "health", "ops"],
  "enabled": true,
  "schedule": {
    "interval": "1m"
  },
  ...
}
```

```bash
# 2. Vérifier les alertes actives
GET _kibana/api/alerting/rule/ABC123/_state
```

### Points Clés à Retenir

✅ **Kibana Rules** offrent une interface graphique pour créer des alertes sans JSON
✅ Le type **Elasticsearch query** permet d'interroger n'importe quel index
✅ La **fréquence de vérification** contrôle combien de fois la règle est évaluée
✅ Les **actions** définissent ce qui se passe quand l'alerte se déclenche
✅ L'action **Server log** est idéale pour les tests et le debugging
✅ Les règles peuvent être **activées/désactivées** sans les supprimer
✅ L'historique des alertes est accessible via l'interface Kibana

---

## Lab 5.2: Configuration d'Actions Avancées (Webhook et Index)

**Objectif**: Configurer des actions sophistiquées pour vos alertes - envoyer des webhooks vers des services externes et indexer les alertes pour analyse historique.

**Contexte**: Les alertes ne sont utiles que si elles déclenchent les bonnes actions. Dans ce lab, vous allez configurer deux types d'actions essentielles en production: les webhooks (pour intégrer avec des outils externes comme Slack, PagerDuty, ou vos propres services) et l'indexation (pour garder une trace de toutes les alertes).

### Partie A: Créer un Connecteur Webhook

Les connecteurs sont des configurations réutilisables qui définissent comment se connecter à des services externes.

#### Étape 1: Créer un Service de Test pour Recevoir les Webhooks

Nous allons utiliser **webhook.site** pour tester nos webhooks:

1. Ouvrez votre navigateur et allez sur https://webhook.site
2. Notez l'URL unique générée (format: `https://webhook.site/abc-def-123...`)
   - Cette URL affichera tous les webhooks reçus en temps réel
3. Gardez cet onglet ouvert pour voir les webhooks arriver

**Alternative locale avec Netcat**:
```bash
# Terminal 1: Démarrer un serveur HTTP simple
while true; do echo -e "HTTP/1.1 200 OK\n\n" | nc -l 8888; done

# Votre webhook URL locale: http://localhost:8888
```

#### Étape 2: Créer le Connecteur Webhook dans Kibana

1. Dans Kibana, allez dans **Stack Management** → **Connectors**
2. Cliquez sur **Create connector**
3. Sélectionnez **Webhook** dans la liste des types
4. Configurez le connecteur:

**Configuration**:
- **Connector name**: `ops-webhook-notifier`
- **URL**: Collez l'URL de webhook.site ou votre URL locale
- **Method**: `POST`
- **Headers**: Ajoutez les en-têtes suivants

```json
{
  "Content-Type": "application/json",
  "X-Alert-Source": "elasticsearch-ops"
}
```

5. Testez le connecteur:
   - Cliquez sur **Test** en bas
   - Vérifiez que webhook.site reçoit bien la requête

6. Cliquez sur **Save**

#### Étape 3: Créer un Connecteur Index Action

Ce connecteur permettra d'indexer les alertes dans Elasticsearch pour analyse historique.

1. Dans **Stack Management** → **Connectors**, cliquez sur **Create connector**
2. Sélectionnez **Index** dans la liste
3. Configurez:

**Configuration**:
- **Connector name**: `alert-history-index`
- **Index**: `alert-history`
- **Refresh**: `true` (pour que les documents soient immédiatement disponibles)
- **Time field**: `@timestamp` (sera ajouté automatiquement)

4. Cliquez sur **Save**

### Partie B: Créer une Alerte avec Actions Multiples

Maintenant créons une alerte qui utilise ces deux connecteurs.

#### Étape 4: Créer l'Alerte de Monitoring de Heap

1. Allez dans **Stack Management** → **Rules**
2. Cliquez sur **Create rule**
3. Configurez la règle:

**Informations de base**:
- **Name**: `heap-usage-critical`
- **Tags**: `performance`, `heap`, `critical`
- **Rule type**: **Elasticsearch query**

**Query definition**:
- **Index**: `.monitoring-es-*` ou créez un index de simulation
- **Time field**: `@timestamp`
- **Query**:

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "range": {
            "@timestamp": {
              "gte": "now-5m"
            }
          }
        },
        {
          "range": {
            "node_stats.jvm.mem.heap_used_percent": {
              "gte": 85
            }
          }
        }
      ]
    }
  },
  "aggs": {
    "max_heap": {
      "max": {
        "field": "node_stats.jvm.mem.heap_used_percent"
      }
    },
    "avg_heap": {
      "avg": {
        "field": "node_stats.jvm.mem.heap_used_percent"
      }
    }
  }
}
```

**Threshold**:
- **WHEN**: `query matches`
- **FOR THE LAST**: `5 minutes`
- **GROUPED OVER**: `top 5 'node_stats.node_id'` (pour identifier les nœuds problématiques)

**Schedule**:
- **Check every**: `1 minute`
- **Notify**: `On status change` (pour éviter le spam)

#### Étape 5: Créer un Index de Simulation pour Tests

Comme nous n'avons peut-être pas de données de monitoring réelles:

```bash
# Créer l'index de simulation
PUT /heap-monitoring
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "node_id": { "type": "keyword" },
      "node_name": { "type": "keyword" },
      "heap_used_percent": { "type": "float" }
    }
  }
}

# Indexer des données simulant un heap critique
POST /heap-monitoring/_bulk
{"index":{}}
{"@timestamp":"2024-01-15T10:00:00Z","node_id":"node-1","node_name":"es-ops-node-1","heap_used_percent":87.5}
{"index":{}}
{"@timestamp":"2024-01-15T10:01:00Z","node_id":"node-1","node_name":"es-ops-node-1","heap_used_percent":89.2}
{"index":{}}
{"@timestamp":"2024-01-15T10:02:00Z","node_id":"node-2","node_name":"es-ops-node-2","heap_used_percent":91.8}
{"index":{}}
{"@timestamp":"2024-01-15T10:00:00Z","node_id":"node-3","node_name":"es-ops-node-3","heap_used_percent":75.3}
```

Modifiez votre règle pour utiliser cet index:
- **Index**: `heap-monitoring`
- **Query**: Rechercher `heap_used_percent >= 85`

#### Étape 6: Configurer l'Action Webhook

Dans la section **Actions** de votre règle:

1. Cliquez sur **Add action**
2. Sélectionnez le connecteur `ops-webhook-notifier`
3. Configurez le payload JSON:

```json
{
  "alert_id": "{{alertId}}",
  "alert_name": "{{alertName}}",
  "alert_type": "heap_usage",
  "severity": "critical",
  "timestamp": "{{date}}",
  "context": {
    "cluster_name": "{{context.cluster.name}}",
    "condition": "Heap usage exceeded 85%",
    "details": {
      "max_heap_percent": "{{context.max_heap}}",
      "avg_heap_percent": "{{context.avg_heap}}",
      "affected_nodes": "{{context.groupBy}}"
    }
  },
  "actions_required": [
    "Check heap usage: GET _nodes/stats/jvm",
    "Review GC activity: GET _nodes/stats/jvm?filter_path=nodes.*.jvm.gc",
    "Consider increasing heap or clearing cache"
  ],
  "links": {
    "kibana_dashboard": "https://kibana.example.com/app/monitoring",
    "runbook": "https://docs.example.com/runbooks/elasticsearch-heap"
  }
}
```

4. **Action group**: `Alert` (quand l'alerte est active)
5. **Throttle**: `15 minutes` (éviter les alertes répétées)

#### Étape 7: Configurer l'Action Index

1. Dans la même règle, cliquez sur **Add action** à nouveau
2. Sélectionnez le connecteur `alert-history-index`
3. Configurez le document à indexer:

```json
{
  "@timestamp": "{{date}}",
  "alert": {
    "id": "{{alertId}}",
    "name": "{{alertName}}",
    "action_group": "{{context.group}}",
    "instance_id": "{{alertInstanceId}}"
  },
  "rule": {
    "id": "{{rule.id}}",
    "name": "{{rule.name}}",
    "type": "{{rule.type}}",
    "tags": {{#toJson}}rule.tags{{/toJson}}
  },
  "metrics": {
    "heap": {
      "max_percent": {{context.max_heap}},
      "avg_percent": {{context.avg_heap}},
      "threshold": 85
    }
  },
  "nodes": {
    "affected": "{{context.groupBy}}"
  },
  "status": "triggered",
  "severity": "critical",
  "message": "Heap usage critical: {{context.max_heap}}% detected on cluster {{context.cluster.name}}"
}
```

4. **Action group**: `Alert`
5. Pas de throttle nécessaire (nous voulons toutes les occurrences dans l'historique)

#### Étape 8: Sauvegarder et Activer

1. Cliquez sur **Save** pour créer la règle avec les deux actions
2. La règle est automatiquement activée

### Partie C: Déclencher et Vérifier les Actions

#### Étape 9: Déclencher l'Alerte

Indexez des données qui déclencheront l'alerte:

```bash
# Indexer des données avec heap > 85%
POST /heap-monitoring/_doc
{
  "@timestamp": "{{NOW}}",
  "node_id": "node-1",
  "node_name": "es-ops-node-1",
  "heap_used_percent": 92.5
}

# Forcer le refresh
POST /heap-monitoring/_refresh
```

Attendez 1-2 minutes (la fréquence de vérification de la règle).

#### Étape 10: Vérifier l'Action Webhook

1. Retournez sur webhook.site (ou votre serveur local)
2. Vous devriez voir une requête POST arriver avec le payload JSON
3. Vérifiez que les données sont correctes:
   - `alert_name`: "heap-usage-critical"
   - `severity`: "critical"
   - `context.details.max_heap_percent`: valeur > 85

**Exemple de requête reçue**:
```json
{
  "alert_id": "alert-123-abc",
  "alert_name": "heap-usage-critical",
  "severity": "critical",
  "timestamp": "2024-01-15T10:05:30.123Z",
  "context": {
    "condition": "Heap usage exceeded 85%",
    "details": {
      "max_heap_percent": "92.5",
      "avg_heap_percent": "88.7",
      "affected_nodes": "node-1"
    }
  }
}
```

#### Étape 11: Vérifier l'Action Index

Interrogez l'index d'historique des alertes:

```bash
# Vérifier que l'index a été créé
GET alert-history

# Rechercher les alertes récentes
GET alert-history/_search
{
  "query": {
    "range": {
      "@timestamp": {
        "gte": "now-1h"
      }
    }
  },
  "sort": [
    { "@timestamp": "desc" }
  ]
}
```

**Résultat attendu**:
```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [
      {
        "_source": {
          "@timestamp": "2024-01-15T10:05:30.123Z",
          "alert": {
            "id": "alert-123-abc",
            "name": "heap-usage-critical"
          },
          "metrics": {
            "heap": {
              "max_percent": 92.5,
              "avg_percent": 88.7,
              "threshold": 85
            }
          },
          "status": "triggered",
          "severity": "critical",
          "message": "Heap usage critical: 92.5% detected..."
        }
      }
    ]
  }
}
```

#### Étape 12: Créer des Visualisations de l'Historique d'Alertes

Créons un dashboard Kibana pour visualiser l'historique:

1. Allez dans **Kibana** → **Discover**
2. Créez un **Data View** pour `alert-history`
3. Allez dans **Dashboard** → **Create dashboard**
4. Ajoutez des visualisations:

**Visualisation 1: Timeline des Alertes**
```
Visualization type: Line chart
X-axis: @timestamp (Date histogram)
Y-axis: Count
Break down by: alert.name.keyword
```

**Visualisation 2: Répartition par Sévérité**
```
Visualization type: Pie chart
Slice by: severity.keyword
```

**Visualisation 3: Top Nœuds Problématiques**
```
Visualization type: Table
Rows: nodes.affected.keyword
Metrics: Count, Max heap_percent
```

### Validation

Vérifiez tous les éléments:

```bash
# 1. Vérifier les connecteurs
GET _kibana/api/actions/connectors

# 2. Vérifier la règle et ses actions
GET _kibana/api/alerting/rules

# 3. Compter les alertes dans l'index
GET alert-history/_count

# 4. Statistiques sur les alertes par sévérité
GET alert-history/_search
{
  "size": 0,
  "aggs": {
    "by_severity": {
      "terms": {
        "field": "severity.keyword"
      }
    },
    "by_alert_name": {
      "terms": {
        "field": "alert.name.keyword"
      }
    }
  }
}
```

### Points Clés à Retenir

✅ Les **connecteurs** sont réutilisables entre plusieurs règles
✅ Les **webhooks** permettent d'intégrer avec n'importe quel service externe
✅ L'**indexation des alertes** crée une base de données d'historique analysable
✅ Les **actions multiples** permettent de notifier ET d'archiver simultanément
✅ Le **throttling** évite les alertes répétées (alert fatigue)
✅ Les **payloads personnalisés** incluent contexte et actions recommandées
✅ Les **variables de contexte** (`{{context.*}}`) rendent les alertes dynamiques
✅ webhook.site est un outil pratique pour tester les webhooks
✅ L'historique d'alertes permet de créer des dashboards et des rapports

---

## 🌟 Bonus Challenge 5.A: Alerte Watcher Avancée avec Agrégations Complexes

**Niveau**: Avancé  
**Objectif**: Créer une alerte Watcher sophistiquée utilisant des agrégations complexes pour détecter des anomalies dans les patterns d'indexation.

**Contexte**: Watcher offre plus de flexibilité que Kibana Rules grâce à son modèle JSON programmable. Dans ce challenge, vous allez créer une alerte qui détecte des anomalies dans le taux d'indexation en comparant la moyenne actuelle avec la moyenne historique (détection de baisse soudaine qui pourrait indiquer un problème).

### Scénario

Votre cluster indexe normalement ~1000 documents/minute. Vous voulez être alerté si:
1. Le taux d'indexation chute en dessous de 50% de la moyenne historique
2. Cette condition persiste pendant au moins 3 minutes
3. Le problème affecte plusieurs index simultanément

### Étape 1: Créer des Données de Test

Créons un index simulant des métriques d'indexation:

```bash
# Créer l'index de métriques
PUT /indexing-metrics
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "index_name": { "type": "keyword" },
      "docs_indexed": { "type": "long" },
      "indexing_rate": { "type": "float" },
      "node_id": { "type": "keyword" }
    }
  }
}

# Générer des données historiques normales (baseline)
POST /indexing-metrics/_bulk
{"index":{}}
{"@timestamp":"2024-01-15T09:00:00Z","index_name":"products","docs_indexed":1000,"indexing_rate":950.5,"node_id":"node-1"}
{"index":{}}
{"@timestamp":"2024-01-15T09:01:00Z","index_name":"products","docs_indexed":980,"indexing_rate":975.2,"node_id":"node-1"}
{"index":{}}
{"@timestamp":"2024-01-15T09:02:00Z","index_name":"products","docs_indexed":1020,"indexing_rate":1010.8,"node_id":"node-1"}
{"index":{}}
{"@timestamp":"2024-01-15T09:03:00Z","index_name":"products","docs_indexed":995,"indexing_rate":990.1,"node_id":"node-1"}
{"index":{}}
{"@timestamp":"2024-01-15T09:00:00Z","index_name":"orders","docs_indexed":500,"indexing_rate":485.3,"node_id":"node-2"}
{"index":{}}
{"@timestamp":"2024-01-15T09:01:00Z","index_name":"orders","docs_indexed":510,"indexing_rate":505.7,"node_id":"node-2"}
{"index":{}}
{"@timestamp":"2024-01-15T09:02:00Z","index_name":"orders","docs_indexed":490,"indexing_rate":495.2,"node_id":"node-2"}
{"index":{}}
{"@timestamp":"2024-01-15T09:03:00Z","index_name":"orders","docs_indexed":505,"indexing_rate":500.8,"node_id":"node-2"}

# Générer des données récentes montrant une chute (anomalie)
{"index":{}}
{"@timestamp":"2024-01-15T10:00:00Z","index_name":"products","docs_indexed":450,"indexing_rate":445.2,"node_id":"node-1"}
{"index":{}}
{"@timestamp":"2024-01-15T10:01:00Z","index_name":"products","docs_indexed":420,"indexing_rate":415.8,"node_id":"node-1"}
{"index":{}}
{"@timestamp":"2024-01-15T10:02:00Z","index_name":"products","docs_indexed":430,"indexing_rate":425.5,"node_id":"node-1"}
{"index":{}}
{"@timestamp":"2024-01-15T10:00:00Z","index_name":"orders","docs_indexed":220,"indexing_rate":215.3,"node_id":"node-2"}
{"index":{}}
{"@timestamp":"2024-01-15T10:01:00Z","index_name":"orders","docs_indexed":210,"indexing_rate":205.7,"node_id":"node-2"}
{"index":{}}
{"@timestamp":"2024-01-15T10:02:00Z","index_name":"orders","docs_indexed":225,"indexing_rate":220.1,"node_id":"node-2"}

# Forcer le refresh
POST /indexing-metrics/_refresh
```

### Étape 2: Développer la Requête d'Agrégation

Testons d'abord notre logique de détection:

```bash
GET /indexing-metrics/_search
{
  "size": 0,
  "query": {
    "range": {
      "@timestamp": {
        "gte": "now-1h"
      }
    }
  },
  "aggs": {
    "by_index": {
      "terms": {
        "field": "index_name",
        "size": 20
      },
      "aggs": {
        "recent_rate": {
          "filter": {
            "range": {
              "@timestamp": {
                "gte": "now-5m"
              }
            }
          },
          "aggs": {
            "avg_recent": {
              "avg": {
                "field": "indexing_rate"
              }
            }
          }
        },
        "baseline_rate": {
          "filter": {
            "range": {
              "@timestamp": {
                "gte": "now-30m",
                "lt": "now-5m"
              }
            }
          },
          "aggs": {
            "avg_baseline": {
              "avg": {
                "field": "indexing_rate"
              }
            }
          }
        },
        "rate_comparison": {
          "bucket_script": {
            "buckets_path": {
              "recent": "recent_rate>avg_recent",
              "baseline": "baseline_rate>avg_baseline"
            },
            "script": "params.recent / params.baseline"
          }
        }
      }
    },
    "anomalous_indexes": {
      "filter": {
        "range": {
          "rate_comparison": {
            "lt": 0.5
          }
        }
      }
    }
  }
}
```

**Logique**:
- **recent_rate**: Moyenne des 5 dernières minutes
- **baseline_rate**: Moyenne des 25 minutes précédentes (de -30m à -5m)
- **rate_comparison**: Ratio recent/baseline (< 0.5 signifie chute de >50%)

### Étape 3: Créer la Watch Watcher

Maintenant créons la watch complète avec conditions et actions multiples:

```bash
PUT _watcher/watch/indexing-rate-anomaly
{
  "metadata": {
    "name": "Indexing Rate Anomaly Detection",
    "version": "1.0",
    "description": "Détecte les chutes soudaines du taux d'indexation (>50%) persistant sur plusieurs minutes",
    "team": "ops",
    "severity": "high"
  },
  "trigger": {
    "schedule": {
      "interval": "2m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["indexing-metrics"],
        "body": {
          "size": 0,
          "query": {
            "range": {
              "@timestamp": {
                "gte": "now-1h"
              }
            }
          },
          "aggs": {
            "by_index": {
              "terms": {
                "field": "index_name",
                "size": 50
              },
              "aggs": {
                "recent_rate": {
                  "filter": {
                    "range": {
                      "@timestamp": {
                        "gte": "now-5m"
                      }
                    }
                  },
                  "aggs": {
                    "avg_recent": {
                      "avg": {
                        "field": "indexing_rate"
                      }
                    },
                    "count_recent": {
                      "value_count": {
                        "field": "indexing_rate"
                      }
                    }
                  }
                },
                "baseline_rate": {
                  "filter": {
                    "range": {
                      "@timestamp": {
                        "gte": "now-35m",
                        "lt": "now-5m"
                      }
                    }
                  },
                  "aggs": {
                    "avg_baseline": {
                      "avg": {
                        "field": "indexing_rate"
                      }
                    },
                    "stddev_baseline": {
                      "extended_stats": {
                        "field": "indexing_rate"
                      }
                    }
                  }
                },
                "rate_drop_percent": {
                  "bucket_script": {
                    "buckets_path": {
                      "recent": "recent_rate>avg_recent",
                      "baseline": "baseline_rate>avg_baseline"
                    },
                    "script": "((params.baseline - params.recent) / params.baseline) * 100"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "condition": {
    "script": {
      "source": """
        def anomalies = [];
        def buckets = ctx.payload.aggregations.by_index.buckets;
        
        for (bucket in buckets) {
          def recent = bucket.recent_rate.avg_recent.value;
          def baseline = bucket.baseline_rate.avg_baseline.value;
          def count = bucket.recent_rate.count_recent.value;
          def drop_percent = bucket.rate_drop_percent.value;
          
          // Conditions:
          // 1. Au moins 3 points de données récentes (3 minutes)
          // 2. Chute >= 50%
          // 3. Baseline non nulle
          if (count >= 3 && drop_percent >= 50 && baseline > 0) {
            anomalies.add([
              'index': bucket.key,
              'recent_rate': Math.round(recent * 100) / 100,
              'baseline_rate': Math.round(baseline * 100) / 100,
              'drop_percent': Math.round(drop_percent * 100) / 100,
              'sample_count': count
            ]);
          }
        }
        
        // Déclencher si au moins 1 index anomalique
        ctx.payload.anomalies = anomalies;
        return anomalies.size() > 0;
      """,
      "lang": "painless"
    }
  },
  "transform": {
    "script": {
      "source": """
        def result = [
          'alert_triggered_at': ctx.execution_time,
          'affected_indexes': ctx.payload.anomalies,
          'total_affected': ctx.payload.anomalies.size(),
          'severity': ctx.payload.anomalies.size() >= 3 ? 'critical' : 'high',
          'investigation_links': [
            'cluster_stats': 'GET _cluster/stats',
            'node_stats': 'GET _nodes/stats/indices',
            'slow_logs': 'Check slow indexing logs'
          ]
        ];
        return result;
      """,
      "lang": "painless"
    }
  },
  "actions": {
    "log_to_elasticsearch": {
      "index": {
        "index": "watcher-alerts",
        "doc_id": "indexing-anomaly-{{ctx.watch_id}}-{{ctx.execution_time}}",
        "refresh": true
      }
    },
    "notify_ops_team": {
      "throttle_period": "15m",
      "webhook": {
        "scheme": "https",
        "host": "webhook.site",
        "port": 443,
        "path": "/votre-webhook-id",
        "method": "post",
        "headers": {
          "Content-Type": "application/json",
          "X-Alert-Type": "indexing-anomaly"
        },
        "body": """
{
  "alert": "Indexing Rate Anomaly Detected",
  "severity": "{{ctx.payload.severity}}",
  "triggered_at": "{{ctx.payload.alert_triggered_at}}",
  "summary": "{{ctx.payload.total_affected}} index(es) showing >50% drop in indexing rate",
  "affected_indexes": {{#toJson}}ctx.payload.affected_indexes{{/toJson}},
  "actions_required": [
    "Check cluster health: GET _cluster/health",
    "Check node disk space: GET _cat/nodes?v&h=name,disk.avail,disk.used_percent",
    "Review indexing queues: GET _cat/thread_pool/write?v",
    "Check for network issues or slow nodes"
  ],
  "investigation": {{#toJson}}ctx.payload.investigation_links{{/toJson}}
}
        """
      }
    },
    "send_detailed_email": {
      "throttle_period": "30m",
      "email": {
        "to": ["ops-team@example.com"],
        "subject": "[{{ctx.payload.severity}}] Indexing Rate Anomaly: {{ctx.payload.total_affected}} Index(es) Affected",
        "body": {
          "html": """
<html>
<body style="font-family: Arial, sans-serif;">
  <h2 style="color: #d32f2f;">⚠️ Indexing Rate Anomaly Detected</h2>
  
  <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px; border: 1px solid #ddd;"><strong>Severity</strong></td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{ctx.payload.severity}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><strong>Triggered At</strong></td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{ctx.payload.alert_triggered_at}}</td>
    </tr>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px; border: 1px solid #ddd;"><strong>Affected Indexes</strong></td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{ctx.payload.total_affected}}</td>
    </tr>
  </table>
  
  <h3>Affected Indexes Details:</h3>
  <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
    <thead>
      <tr style="background-color: #1976d2; color: white;">
        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Index</th>
        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Recent Rate</th>
        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Baseline Rate</th>
        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Drop %</th>
      </tr>
    </thead>
    <tbody>
      {{#ctx.payload.affected_indexes}}
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">{{index}}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">{{recent_rate}} docs/min</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">{{baseline_rate}} docs/min</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #d32f2f;"><strong>↓{{drop_percent}}%</strong></td>
      </tr>
      {{/ctx.payload.affected_indexes}}
    </tbody>
  </table>
  
  <h3>Recommended Actions:</h3>
  <ol>
    <li>Check cluster health: <code>GET _cluster/health</code></li>
    <li>Check node disk space: <code>GET _cat/nodes?v&h=name,disk.avail,disk.used_percent</code></li>
    <li>Review indexing queues: <code>GET _cat/thread_pool/write?v</code></li>
    <li>Check for network issues or slow nodes</li>
    <li>Review application logs for indexing errors</li>
  </ol>
  
  <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
    <em>This is an automated alert from Elasticsearch Watcher. Do not reply to this email.</em>
  </p>
</body>
</html>
          """
        }
      }
    }
  }
}
```

### Étape 4: Tester la Watch

#### Test 1: Exécution Manuelle

```bash
# Exécuter la watch manuellement pour voir le résultat
POST _watcher/watch/indexing-rate-anomaly/_execute
{
  "trigger_data": {
    "triggered_time": "2024-01-15T10:05:00Z"
  }
}
```

**Résultat attendu**:
```json
{
  "watch_record": {
    "watch_id": "indexing-rate-anomaly",
    "state": "executed",
    "trigger_event": {
      "type": "manual"
    },
    "result": {
      "condition": {
        "type": "script",
        "status": "success",
        "met": true
      },
      "actions": [
        {
          "id": "log_to_elasticsearch",
          "type": "index",
          "status": "success"
        },
        {
          "id": "notify_ops_team",
          "type": "webhook",
          "status": "success"
        }
      ]
    }
  }
}
```

#### Test 2: Vérifier l'Index d'Alertes

```bash
# Vérifier que l'alerte a été indexée
GET watcher-alerts/_search
{
  "query": {
    "match": {
      "watch_id": "indexing-rate-anomaly"
    }
  },
  "sort": [
    { "alert_triggered_at": "desc" }
  ]
}
```

#### Test 3: Vérifier le Webhook

Consultez webhook.site pour voir le payload JSON envoyé.

### Étape 5: Créer un Dashboard d'Analyse

Créons un dashboard pour visualiser les anomalies détectées:

```bash
# Créer un index pattern pour les alertes Watcher
# Dans Kibana: Stack Management → Data Views → Create data view
# Name: watcher-alerts
# Index pattern: watcher-alerts
# Time field: alert_triggered_at
```

Visualisations recommandées:

**Viz 1: Timeline des Anomalies**
```
Type: Line chart
X-axis: alert_triggered_at (Date histogram, interval: auto)
Y-axis: Count of alerts
Break down by: severity
```

**Viz 2: Indexes les Plus Affectés**
```
Type: Table
Rows: affected_indexes.index.keyword
Metrics: 
  - Count (nombre d'occurrences)
  - Avg affected_indexes.drop_percent
  - Latest alert_triggered_at
Sort by: Count (descending)
```

**Viz 3: Comparaison Rates**
```
Type: Bar chart (horizontal)
Y-axis: affected_indexes.index.keyword
X-axis: 
  - affected_indexes.recent_rate (série 1)
  - affected_indexes.baseline_rate (série 2)
```

### Étape 6: Amélioration - Ajouter une Action Slack

Si vous avez un workspace Slack, ajoutez une action Slack:

1. Dans Slack, créez une Incoming Webhook: https://api.slack.com/messaging/webhooks
2. Ajoutez cette action à votre watch:

```json
"notify_slack": {
  "throttle_period": "15m",
  "webhook": {
    "scheme": "https",
    "host": "hooks.slack.com",
    "port": 443,
    "path": "/services/YOUR/WEBHOOK/PATH",
    "method": "post",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": """
{
  "text": ":warning: *Indexing Rate Anomaly Detected*",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": ":rotating_light: Indexing Rate Anomaly Alert"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Severity:*\n{{ctx.payload.severity}}"
        },
        {
          "type": "mrkdwn",
          "text": "*Affected Indexes:*\n{{ctx.payload.total_affected}}"
        }
      ]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Details:*\n{{#ctx.payload.affected_indexes}}- `{{index}}`: ↓{{drop_percent}}% ({{recent_rate}} → {{baseline_rate}} docs/min)\n{{/ctx.payload.affected_indexes}}"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "View in Kibana"
          },
          "url": "https://your-kibana.com/app/watcher"
        }
      ]
    }
  ]
}
    """
  }
}
```

### Validation Finale

Vérifiez tous les composants:

```bash
# 1. État de la watch
GET _watcher/watch/indexing-rate-anomaly

# 2. Historique d'exécution
GET .watcher-history*/_search
{
  "query": {
    "match": {
      "watch_id": "indexing-rate-anomaly"
    }
  },
  "sort": [
    { "result.execution_time": "desc" }
  ],
  "size": 10
}

# 3. Statistiques sur les alertes déclenchées
GET watcher-alerts/_search
{
  "size": 0,
  "aggs": {
    "by_severity": {
      "terms": {
        "field": "severity.keyword"
      }
    },
    "total_affected_indexes": {
      "sum": {
        "field": "total_affected"
      }
    },
    "avg_drop_percent": {
      "nested": {
        "path": "affected_indexes"
      },
      "aggs": {
        "avg_drop": {
          "avg": {
            "field": "affected_indexes.drop_percent"
          }
        }
      }
    }
  }
}

# 4. Désactiver/Activer la watch
POST _watcher/watch/indexing-rate-anomaly/_deactivate
POST _watcher/watch/indexing-rate-anomaly/_activate

# 5. Supprimer la watch (si nécessaire)
DELETE _watcher/watch/indexing-rate-anomaly
```

### Défis Supplémentaires (Si Temps Disponible)

**Challenge 1**: Ajouter une détection de "surge" (augmentation soudaine du taux d'indexation > 200%)

**Challenge 2**: Implémenter une logique d'auto-résolution qui envoie une notification quand les taux reviennent à la normale

**Challenge 3**: Créer une seconde watch qui surveille le taux de réussite des actions (webhooks, emails) de la première watch

### Points Clés à Retenir

✅ **Watcher** offre une flexibilité maximale avec le scripting Painless
✅ Les **agrégations complexes** permettent des comparaisons baseline vs recent
✅ Le **bucket_script** calcule des métriques dérivées (ratios, pourcentages)
✅ Les **scripts Painless** dans conditions permettent une logique métier sophistiquée
✅ Les **transforms** reformatent les données avant les actions
✅ Les **actions multiples** (index + webhook + email) assurent la résilience
✅ Le **throttling** évite l'alert fatigue avec des périodes différentes par action
✅ Les **templates HTML** créent des emails riches et actionnables
✅ L'**indexation des alertes** permet l'analyse historique et les dashboards
✅ La **validation progressive** (test query → execute watch → monitor) assure la fiabilité

**Félicitations!** Vous maîtrisez maintenant les systèmes d'alertes avancés d'Elasticsearch! 🎉


---


## Lab 7.1: Création d'Utilisateurs et de Rôles

**Objectif**: Maîtriser la création et la gestion d'utilisateurs et de rôles avec différents niveaux de privilèges, en implémentant le principe du moindre privilège (least privilege).

**Contexte**: Le contrôle d'accès basé sur les rôles (RBAC) est fondamental pour sécuriser Elasticsearch. Dans ce lab, vous allez créer plusieurs rôles avec des privilèges variés, créer des utilisateurs, et tester les restrictions d'accès.

### Prérequis : Sécurité Activée

Vérifiez que la sécurité est activée sur votre cluster :

```bash
GET /_xpack
```

**Résultat attendu** :
```json
{
  "features": {
    "security": {
      "available": true,
      "enabled": true
    }
  }
}
```

Si la sécurité n'est pas activée (Elasticsearch 7.x), ajoutez dans `elasticsearch.yml` :

```yaml
xpack.security.enabled: true
```

Puis redémarrez Elasticsearch.

### Étape 1: Vérifier l'Utilisateur Actuel

Commencez par vérifier avec quel utilisateur vous êtes connecté :

```bash
GET /_security/_authenticate
```

**Résultat attendu** :
```json
{
  "username": "elastic",
  "roles": ["superuser"],
  "full_name": null,
  "email": null,
  "metadata": {
    "_reserved": true
  },
  "enabled": true,
  "authentication_realm": {
    "name": "reserved",
    "type": "reserved"
  }
}
```

Vous devriez être connecté avec l'utilisateur `elastic` (superuser).

### Étape 2: Créer un Rôle "Lecture Seule" (Read-Only)

Créons un rôle qui permet uniquement la lecture des indices de logs :

```bash
POST /_security/role/logs_readonly
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-*", "filebeat-*", "logstash-*"],
      "privileges": ["read", "view_index_metadata"]
    }
  ],
  "applications": [],
  "run_as": [],
  "metadata": {
    "version": 1,
    "description": "Read-only access to logs indices"
  }
}
```

**Résultat attendu** :
```json
{
  "role": {
    "created": true
  }
}
```

**Explication des privilèges** :
- `cluster: ["monitor"]` : Peut voir les stats du cluster (_cluster/health, _cat/*, etc.)
- `indices.privileges: ["read"]` : Peut rechercher et lire les documents
- `view_index_metadata` : Peut voir les mappings et settings

**Vérifier le rôle créé** :

```bash
GET /_security/role/logs_readonly
```

### Étape 3: Créer un Rôle "Analyste de Données"

Créons un rôle pour un analyste qui peut lire et créer des visualisations :

```bash
POST /_security/role/data_analyst
{
  "cluster": ["monitor", "manage_index_templates"],
  "indices": [
    {
      "names": ["products", "orders", "customers"],
      "privileges": ["read", "view_index_metadata"]
    },
    {
      "names": [".kibana*", ".kibana-*"],
      "privileges": ["read", "write", "manage"]
    }
  ],
  "applications": [
    {
      "application": "kibana-.kibana",
      "privileges": ["feature_discover.all", "feature_visualize.all", "feature_dashboard.read"],
      "resources": ["*"]
    }
  ],
  "metadata": {
    "description": "Data analyst with read access to business data and Kibana visualization capabilities"
  }
}
```

**Nouveaux privilèges** :
- `manage_index_templates` : Peut créer des index patterns dans Kibana
- Accès aux indices `.kibana*` pour sauvegarder les visualisations
- Privilèges Kibana : `discover.all`, `visualize.all`, `dashboard.read`

### Étape 4: Créer un Rôle "Développeur"

Créons un rôle pour un développeur avec accès complet à ses indices de test :

```bash
POST /_security/role/developer
{
  "cluster": ["monitor", "manage_index_templates", "manage_ilm", "manage_pipeline"],
  "indices": [
    {
      "names": ["dev-*", "test-*"],
      "privileges": ["all"]
    },
    {
      "names": ["products", "orders"],
      "privileges": ["read", "view_index_metadata"]
    }
  ],
  "applications": [
    {
      "application": "kibana-.kibana",
      "privileges": ["all"],
      "resources": ["space:dev"]
    }
  ],
  "metadata": {
    "description": "Developer with full access to dev/test indices"
  }
}
```

**Privilèges étendus** :
- `all` sur indices `dev-*` et `test-*` : Peut tout faire
- `manage_ilm` : Peut gérer les Index Lifecycle Management policies
- `manage_pipeline` : Peut gérer les ingest pipelines
- Accès complet Kibana dans le space "dev"

### Étape 5: Créer des Utilisateurs avec Ces Rôles

**Utilisateur 1 : Lecteur de logs** :

```bash
POST /_security/user/alice_reader
{
  "password": "ReadOnlyPass123!",
  "roles": ["logs_readonly"],
  "full_name": "Alice Reader",
  "email": "alice@example.com",
  "metadata": {
    "department": "Operations",
    "hire_date": "2024-01-15"
  }
}
```

**Utilisateur 2 : Analyste** :

```bash
POST /_security/user/bob_analyst
{
  "password": "AnalystPass456!",
  "roles": ["data_analyst", "kibana_user"],
  "full_name": "Bob Analyst",
  "email": "bob@example.com",
  "metadata": {
    "department": "Data Science",
    "hire_date": "2023-05-10"
  }
}
```

**Utilisateur 3 : Développeur** :

```bash
POST /_security/user/charlie_dev
{
  "password": "DevPass789!",
  "roles": ["developer"],
  "full_name": "Charlie Developer",
  "email": "charlie@example.com",
  "metadata": {
    "department": "Engineering",
    "hire_date": "2023-03-20"
  }
}
```

**Vérifier les utilisateurs créés** :

```bash
GET /_security/user
```

Vous devriez voir les trois utilisateurs listés avec leurs rôles.

### Étape 6: Créer des Indices de Test

Créons des indices pour tester les permissions :

```bash
# Index de logs
PUT /logs-2024-01
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}

POST /logs-2024-01/_bulk
{"index":{"_id":"1"}}
{"timestamp":"2024-01-15T10:00:00Z","level":"INFO","message":"Application started","service":"api"}
{"index":{"_id":"2"}}
{"timestamp":"2024-01-15T10:05:00Z","level":"WARN","message":"High memory usage","service":"api"}
{"index":{"_id":"3"}}
{"timestamp":"2024-01-15T10:10:00Z","level":"ERROR","message":"Database connection failed","service":"database"}

# Index products
PUT /products
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}

POST /products/_bulk
{"index":{"_id":"1"}}
{"name":"Laptop","price":999,"category":"electronics","stock":50}
{"index":{"_id":"2"}}
{"name":"Mouse","price":25,"category":"electronics","stock":200}
{"index":{"_id":"3"}}
{"name":"Desk","price":299,"category":"furniture","stock":20}

# Index de développement
PUT /dev-feature-x
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}

POST /dev-feature-x/_doc/1
{
  "feature": "feature-x",
  "status": "in-development",
  "tests_passing": false
}
```

### Étape 7: Tester les Permissions de alice_reader (Read-Only)

**Test 1 : Lecture autorisée sur logs** :

```bash
# Se connecter comme alice_reader
curl -u alice_reader:ReadOnlyPass123! "https://localhost:9200/logs-2024-01/_search?pretty"
```

**Résultat attendu** : Succès (200 OK) avec les 3 documents

**Test 2 : Lecture NON autorisée sur products** :

```bash
curl -u alice_reader:ReadOnlyPass123! "https://localhost:9200/products/_search?pretty"
```

**Résultat attendu** : Erreur 403 Forbidden
```json
{
  "error": {
    "type": "security_exception",
    "reason": "action [indices:data/read/search] is unauthorized for user [alice_reader]"
  },
  "status": 403
}
```

**Test 3 : Écriture NON autorisée sur logs** :

```bash
curl -u alice_reader:ReadOnlyPass123! -X POST "https://localhost:9200/logs-2024-01/_doc" \
  -H 'Content-Type: application/json' \
  -d '{"timestamp":"2024-01-15T11:00:00Z","level":"INFO","message":"Test"}'
```

**Résultat attendu** : Erreur 403 Forbidden (pas de privilège `write`)

**Test 4 : Cluster health autorisé** :

```bash
curl -u alice_reader:ReadOnlyPass123! "https://localhost:9200/_cluster/health?pretty"
```

**Résultat attendu** : Succès (privilège `monitor` permet cela)

### Étape 8: Tester les Permissions de bob_analyst (Analyste)

**Test 1 : Lecture autorisée sur products et orders** :

```bash
curl -u bob_analyst:AnalystPass456! "https://localhost:9200/products/_search?pretty"
```

**Résultat attendu** : Succès (200 OK)

**Test 2 : Écriture NON autorisée sur products** :

```bash
curl -u bob_analyst:AnalystPass456! -X POST "https://localhost:9200/products/_doc" \
  -H 'Content-Type: application/json' \
  -d '{"name":"New Product","price":100}'
```

**Résultat attendu** : Erreur 403 Forbidden (rôle `data_analyst` n'a que `read`)

**Test 3 : Lecture NON autorisée sur dev-* (indices de dev)** :

```bash
curl -u bob_analyst:AnalystPass456! "https://localhost:9200/dev-feature-x/_search?pretty"
```

**Résultat attendu** : Erreur 403 Forbidden

### Étape 9: Tester les Permissions de charlie_dev (Développeur)

**Test 1 : Accès complet aux indices dev-*** :

```bash
# Lecture
curl -u charlie_dev:DevPass789! "https://localhost:9200/dev-feature-x/_search?pretty"

# Écriture
curl -u charlie_dev:DevPass789! -X POST "https://localhost:9200/dev-feature-x/_doc" \
  -H 'Content-Type: application/json' \
  -d '{"feature":"feature-y","status":"planned"}'

# Suppression
curl -u charlie_dev:DevPass789! -X DELETE "https://localhost:9200/dev-feature-x"
```

**Résultat attendu** : Tous succès (privilège `all` sur `dev-*`)

**Test 2 : Création d'index de test** :

```bash
curl -u charlie_dev:DevPass789! -X PUT "https://localhost:9200/test-new-feature"
```

**Résultat attendu** : Succès (peut créer des indices `test-*`)

**Test 3 : Lecture autorisée mais écriture NON autorisée sur products** :

```bash
# Lecture : OK
curl -u charlie_dev:DevPass789! "https://localhost:9200/products/_search?pretty"

# Écriture : FORBIDDEN
curl -u charlie_dev:DevPass789! -X POST "https://localhost:9200/products/_doc" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Hacked"}'
```

**Résultat attendu** : 
- Lecture : Succès
- Écriture : Erreur 403 (pas de privilège `write` sur `products`)

### Étape 10: Modifier un Utilisateur

Imaginons que Bob devient "Senior Analyst" et a besoin d'accès en écriture :

**Créer un nouveau rôle** :

```bash
POST /_security/role/senior_analyst
{
  "cluster": ["monitor", "manage_index_templates", "manage_ilm"],
  "indices": [
    {
      "names": ["products", "orders", "customers"],
      "privileges": ["read", "write", "view_index_metadata"]
    },
    {
      "names": [".kibana*"],
      "privileges": ["all"]
    }
  ]
}
```

**Mettre à jour Bob avec le nouveau rôle** :

```bash
PUT /_security/user/bob_analyst
{
  "roles": ["senior_analyst", "kibana_admin"],
  "full_name": "Bob Senior Analyst",
  "email": "bob@example.com"
}
```

**Tester le nouvel accès** :

```bash
# Maintenant Bob peut écrire
curl -u bob_analyst:AnalystPass456! -X POST "https://localhost:9200/products/_doc" \
  -H 'Content-Type: application/json' \
  -d '{"name":"New Product","price":150,"category":"electronics"}'
```

**Résultat attendu** : Succès (201 Created)

### Étape 11: Désactiver Temporairement un Utilisateur

Désactivons Alice temporairement (ex: congé, investigation sécurité) :

```bash
PUT /_security/user/alice_reader/_disable
```

**Résultat attendu** :
```json
{
  "acknowledged": true
}
```

**Tester que Alice ne peut plus se connecter** :

```bash
curl -u alice_reader:ReadOnlyPass123! "https://localhost:9200/_cluster/health"
```

**Résultat attendu** : Erreur 401 Unauthorized

**Réactiver Alice** :

```bash
PUT /_security/user/alice_reader/_enable
```

### Étape 12: Changer le Mot de Passe

Changeons le mot de passe de Charlie :

```bash
POST /_security/user/charlie_dev/_password
{
  "password": "NewDevPassword2024!"
}
```

**Résultat attendu** :
```json
{
  "acknowledged": true
}
```

**Vérifier que l'ancien mot de passe ne fonctionne plus** :

```bash
# Ancien password : FAIL
curl -u charlie_dev:DevPass789! "https://localhost:9200/"

# Nouveau password : SUCCESS
curl -u charlie_dev:NewDevPassword2024! "https://localhost:9200/"
```

### Validation Finale

Vérifiez que vous avez réussi le lab :

```bash
# 1. Lister tous les rôles personnalisés
GET /_security/role/logs_readonly,data_analyst,developer,senior_analyst

# 2. Lister tous les utilisateurs
GET /_security/user

# 3. Vérifier les privilèges de chaque utilisateur via _authenticate
# (se connecter avec chaque utilisateur et exécuter GET /_security/_authenticate)

# 4. Tester les accès (matrice de tests)
```

**Matrice de tests attendus** :

| Utilisateur | Index logs-* | Index products | Index dev-* | Écriture logs-* | Écriture products |
|-------------|--------------|----------------|-------------|-----------------|-------------------|
| alice_reader | ✅ Read | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied |
| bob_analyst (après update) | ❌ Denied | ✅ Read/Write | ❌ Denied | ❌ Denied | ✅ Write |
| charlie_dev | ❌ Denied | ✅ Read | ✅ All | ❌ Denied | ❌ Denied |

### Points Clés à Retenir

✅ **Privilèges cluster** vs **privilèges index** : Bien comprendre la différence  
✅ **Principe du moindre privilège** : Donner uniquement les accès nécessaires  
✅ `read` permet `_search`, `_get` mais pas `_index`, `_update`, `_delete`  
✅ `write` permet `_index`, `_update`, `_delete` mais pas création d'index  
✅ `all` donne tous les privilèges sur les indices ciblés  
✅ Les patterns (`logs-*`, `dev-*`) permettent de couvrir plusieurs indices  
✅ Les utilisateurs peuvent avoir **plusieurs rôles** (cumul des privilèges)  
✅ `_disable` / `_enable` permettent de désactiver temporairement sans supprimer  
✅ Tester systématiquement les accès après création de rôles  
✅ Utiliser `_security/_authenticate` pour vérifier l'utilisateur actuel

---

## Lab 7.2: Implémentation de Document-Level Security (DLS)

**Objectif**: Mettre en œuvre la sécurité au niveau des documents pour filtrer les données visibles selon le rôle de l'utilisateur, en utilisant des requêtes Elasticsearch.

**Contexte**: La Document-Level Security (DLS) permet de limiter les documents visibles à un utilisateur selon une query Elasticsearch. C'est essentiel pour implémenter du multi-tenancy, séparer les données par département, région, ou niveau de confidentialité.

### Scénario

Vous gérez un cluster Elasticsearch pour une entreprise multi-régionale avec plusieurs départements :
- **Département Sales** : Accès uniquement aux commandes de vente
- **Département HR** : Accès uniquement aux employés
- **Managers régionaux** : Accès uniquement aux données de leur région

Vous allez implémenter des filtres DLS pour chaque cas d'usage.

### Étape 1: Créer les Indices de Test avec Données Multi-Tenant

**Index 1 : Commandes avec département** :

```bash
PUT /orders
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "order_id": { "type": "keyword" },
      "customer": { "type": "keyword" },
      "amount": { "type": "float" },
      "department": { "type": "keyword" },
      "region": { "type": "keyword" },
      "status": { "type": "keyword" },
      "created_at": { "type": "date" }
    }
  }
}

POST /orders/_bulk
{"index":{"_id":"1"}}
{"order_id":"ORD-001","customer":"Alice Corp","amount":5000,"department":"sales","region":"EMEA","status":"completed","created_at":"2024-01-15T10:00:00Z"}
{"index":{"_id":"2"}}
{"order_id":"ORD-002","customer":"Bob LLC","amount":3000,"department":"sales","region":"AMER","status":"pending","created_at":"2024-01-16T10:00:00Z"}
{"index":{"_id":"3"}}
{"order_id":"ORD-003","customer":"Charlie Inc","amount":7500,"department":"marketing","region":"EMEA","status":"completed","created_at":"2024-01-17T10:00:00Z"}
{"index":{"_id":"4"}}
{"order_id":"ORD-004","customer":"David Co","amount":2000,"department":"sales","region":"APAC","status":"completed","created_at":"2024-01-18T10:00:00Z"}
{"index":{"_id":"5"}}
{"order_id":"ORD-005","customer":"Eve Enterprises","amount":9000,"department":"marketing","region":"AMER","status":"pending","created_at":"2024-01-19T10:00:00Z"}

# Index 2 : Employés avec région et niveau de confidentialité
PUT /employees
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "employee_id": { "type": "keyword" },
      "name": { "type": "keyword" },
      "department": { "type": "keyword" },
      "region": { "type": "keyword" },
      "salary": { "type": "float" },
      "confidentiality": { "type": "keyword" },
      "hire_date": { "type": "date" }
    }
  }
}

POST /employees/_bulk
{"index":{"_id":"1"}}
{"employee_id":"EMP-001","name":"Alice Johnson","department":"sales","region":"EMEA","salary":60000,"confidentiality":"public","hire_date":"2020-01-15"}
{"index":{"_id":"2"}}
{"employee_id":"EMP-002","name":"Bob Smith","department":"hr","region":"EMEA","salary":55000,"confidentiality":"restricted","hire_date":"2021-03-20"}
{"index":{"_id":"3"}}
{"employee_id":"EMP-003","name":"Charlie Brown","department":"engineering","region":"AMER","salary":85000,"confidentiality":"public","hire_date":"2019-05-10"}
{"index":{"_id":"4"}}
{"employee_id":"EMP-004","name":"David Lee","department":"sales","region":"APAC","salary":65000,"confidentiality":"public","hire_date":"2022-07-01"}
{"index":{"_id":"5"}}
{"employee_id":"EMP-005","name":"Eve Martinez","department":"hr","region":"AMER","salary":75000,"confidentiality":"confidential","hire_date":"2018-11-15"}
```

### Étape 2: Créer un Rôle avec DLS pour le Département Sales

Ce rôle permet de voir **uniquement** les commandes du département "sales" :

```bash
POST /_security/role/sales_team
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["orders"],
      "privileges": ["read", "view_index_metadata"],
      "query": {
        "term": {
          "department": "sales"
        }
      }
    }
  ],
  "metadata": {
    "description": "Sales team - can only see sales department orders"
  }
}
```

**Explication** :
- `query.term.department: "sales"` : Filtre qui n'affiche que les documents où `department = "sales"`
- Les documents avec `department = "marketing"` sont **invisibles** pour ce rôle

### Étape 3: Créer un Rôle avec DLS pour Manager Régional EMEA

Ce rôle permet de voir **uniquement** les données de la région EMEA :

```bash
POST /_security/role/emea_manager
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["orders", "employees"],
      "privileges": ["read", "view_index_metadata"],
      "query": {
        "term": {
          "region": "EMEA"
        }
      }
    }
  ],
  "metadata": {
    "description": "EMEA regional manager - can only see EMEA region data"
  }
}
```

### Étape 4: Créer un Rôle avec DLS Complexe (Plusieurs Conditions)

Ce rôle permet de voir les commandes "sales" **ET** statut "completed" :

```bash
POST /_security/role/sales_completed
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["orders"],
      "privileges": ["read"],
      "query": {
        "bool": {
          "must": [
            { "term": { "department": "sales" } },
            { "term": { "status": "completed" } }
          ]
        }
      }
    }
  ],
  "metadata": {
    "description": "Sales team - only completed sales orders"
  }
}
```

**Query DLS** : Combine plusieurs conditions avec `bool.must`

### Étape 5: Créer un Rôle pour HR avec Filtrage par Confidentialité

Le département HR peut voir tous les employés **sauf** les "confidential" :

```bash
POST /_security/role/hr_team
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["employees"],
      "privileges": ["read", "write", "view_index_metadata"],
      "query": {
        "bool": {
          "must_not": [
            { "term": { "confidentiality": "confidential" } }
          ]
        }
      }
    }
  ],
  "metadata": {
    "description": "HR team - cannot see confidential employee records"
  }
}
```

**Query DLS** : Utilise `bool.must_not` pour exclure des documents

### Étape 6: Créer des Utilisateurs avec Rôles DLS

```bash
# Utilisateur sales team
POST /_security/user/sarah_sales
{
  "password": "SalesPass123!",
  "roles": ["sales_team"],
  "full_name": "Sarah Sales",
  "email": "sarah@example.com"
}

# Utilisateur EMEA manager
POST /_security/user/michael_emea
{
  "password": "EMEAPass456!",
  "roles": ["emea_manager"],
  "full_name": "Michael EMEA Manager",
  "email": "michael@example.com"
}

# Utilisateur sales completed
POST /_security/user/tom_audit
{
  "password": "AuditPass789!",
  "roles": ["sales_completed"],
  "full_name": "Tom Auditor",
  "email": "tom@example.com"
}

# Utilisateur HR
POST /_security/user/helen_hr
{
  "password": "HRPass321!",
  "roles": ["hr_team"],
  "full_name": "Helen HR",
  "email": "helen@example.com"
}
```

### Étape 7: Tester le Filtrage DLS pour Sales Team

**Connexion en tant que sarah_sales** :

```bash
curl -u sarah_sales:SalesPass123! "https://localhost:9200/orders/_search?pretty"
```

**Résultat attendu** :
```json
{
  "hits": {
    "total": { "value": 3 },
    "hits": [
      {
        "_source": {
          "order_id": "ORD-001",
          "department": "sales",
          "region": "EMEA",
          ...
        }
      },
      {
        "_source": {
          "order_id": "ORD-002",
          "department": "sales",
          "region": "AMER",
          ...
        }
      },
      {
        "_source": {
          "order_id": "ORD-004",
          "department": "sales",
          "region": "APAC",
          ...
        }
      }
    ]
  }
}
```

**Analyse** :
- ✅ Voit ORD-001, ORD-002, ORD-004 (department = "sales")
- ❌ Ne voit **PAS** ORD-003, ORD-005 (department = "marketing")

**Compter les documents visibles** :

```bash
curl -u sarah_sales:SalesPass123! "https://localhost:9200/orders/_count?pretty"
```

**Résultat attendu** : `{ "count": 3 }`

### Étape 8: Tester le Filtrage DLS pour EMEA Manager

**Connexion en tant que michael_emea** :

```bash
curl -u michael_emea:EMEAPass456! "https://localhost:9200/orders/_search?pretty"
```

**Résultat attendu** :
```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [
      {
        "_source": {
          "order_id": "ORD-001",
          "region": "EMEA",
          "department": "sales",
          ...
        }
      },
      {
        "_source": {
          "order_id": "ORD-003",
          "region": "EMEA",
          "department": "marketing",
          ...
        }
      }
    ]
  }
}
```

**Analyse** :
- ✅ Voit ORD-001, ORD-003 (region = "EMEA")
- ❌ Ne voit **PAS** ORD-002, ORD-004, ORD-005 (autres régions)

**Tester sur l'index employees** :

```bash
curl -u michael_emea:EMEAPass456! "https://localhost:9200/employees/_search?pretty"
```

**Résultat attendu** : Employés EMP-001 et EMP-002 uniquement (region = "EMEA")

### Étape 9: Tester le Filtrage DLS avec Conditions Multiples

**Connexion en tant que tom_audit** (sales + completed) :

```bash
curl -u tom_audit:AuditPass789! "https://localhost:9200/orders/_search?pretty"
```

**Résultat attendu** :
```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [
      {
        "_source": {
          "order_id": "ORD-001",
          "department": "sales",
          "status": "completed",
          ...
        }
      },
      {
        "_source": {
          "order_id": "ORD-004",
          "department": "sales",
          "status": "completed",
          ...
        }
      }
    ]
  }
}
```

**Analyse** :
- ✅ Voit ORD-001, ORD-004 (sales + completed)
- ❌ Ne voit **PAS** ORD-002 (sales mais pending)
- ❌ Ne voit **PAS** ORD-003, ORD-005 (marketing)

### Étape 10: Tester le Filtrage DLS avec Exclusion (HR Team)

**Connexion en tant que helen_hr** :

```bash
curl -u helen_hr:HRPass321! "https://localhost:9200/employees/_search?pretty"
```

**Résultat attendu** :
```json
{
  "hits": {
    "total": { "value": 4 },
    "hits": [
      { "_source": { "employee_id": "EMP-001", "confidentiality": "public" } },
      { "_source": { "employee_id": "EMP-002", "confidentiality": "restricted" } },
      { "_source": { "employee_id": "EMP-003", "confidentiality": "public" } },
      { "_source": { "employee_id": "EMP-004", "confidentiality": "public" } }
    ]
  }
}
```

**Analyse** :
- ✅ Voit EMP-001, 002, 003, 004 (public ou restricted)
- ❌ Ne voit **PAS** EMP-005 (confidentiality = "confidential")

### Étape 11: Vérifier l'Invisibilité Complète (Get par ID)

Même si on connaît l'ID d'un document filtré par DLS, il est inaccessible :

```bash
# Sarah (sales team) essaie d'accéder à ORD-003 (marketing)
curl -u sarah_sales:SalesPass123! "https://localhost:9200/orders/_doc/3?pretty"
```

**Résultat attendu** : Erreur 404 Not Found
```json
{
  "_index": "orders",
  "_id": "3",
  "found": false
}
```

Le document existe mais est **invisible** pour sarah_sales (comme s'il n'existait pas).

### Étape 12: Tester les Agrégations avec DLS

Les agrégations respectent également le filtrage DLS :

```bash
# Agréger par région (vue sarah_sales)
curl -u sarah_sales:SalesPass123! -X GET "https://localhost:9200/orders/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{
  "size": 0,
  "aggs": {
    "by_region": {
      "terms": {
        "field": "region"
      }
    }
  }
}'
```

**Résultat attendu** :
```json
{
  "aggregations": {
    "by_region": {
      "buckets": [
        { "key": "EMEA", "doc_count": 1 },
        { "key": "AMER", "doc_count": 1 },
        { "key": "APAC", "doc_count": 1 }
      ]
    }
  }
}
```

**Analyse** : Uniquement les régions des commandes "sales" (3 documents au total).

### Validation Finale

Vérifiez que vous avez réussi le lab :

```bash
# 1. Vérifier les rôles DLS créés
GET /_security/role/sales_team,emea_manager,sales_completed,hr_team

# 2. Pour chaque utilisateur, vérifier le count
curl -u sarah_sales:SalesPass123! "https://localhost:9200/orders/_count"
# Attendu: {"count": 3}

curl -u michael_emea:EMEAPass456! "https://localhost:9200/orders/_count"
# Attendu: {"count": 2}

curl -u tom_audit:AuditPass789! "https://localhost:9200/orders/_count"
# Attendu: {"count": 2}

curl -u helen_hr:HRPass321! "https://localhost:9200/employees/_count"
# Attendu: {"count": 4}

# 3. Comparer avec superuser (voit tout)
curl -u elastic:your_password "https://localhost:9200/orders/_count"
# Attendu: {"count": 5}
```

### Points Clés à Retenir

✅ **DLS filtre les documents** visibles selon une query Elasticsearch  
✅ La query DLS est **transparente** pour l'utilisateur (documents invisibles comme s'ils n'existaient pas)  
✅ Même avec `GET /_doc/{id}`, un document filtré retourne **404 Not Found**  
✅ Les **agrégations** et **statistiques** respectent le filtrage DLS  
✅ `term` query pour filtrage exact, `bool` pour conditions complexes  
✅ `must`, `must_not`, `should` permettent des filtres sophistiqués  
✅ DLS fonctionne avec **tous les patterns d'indices** (`orders-*`, etc.)  
✅ Combiner DLS avec Field-Level Security pour protection maximale  
✅ Tester systématiquement avec `_count` et `_search` après création de rôles DLS  
✅ DLS est idéal pour **multi-tenancy**, **séparation départementale**, **filtrage régional**

---

## 🌟 Bonus Challenge 7.A: Field-Level Security (FLS) pour Masquer des Champs Sensibles

**Niveau**: Avancé  
**Objectif**: Implémenter la sécurité au niveau des champs (Field-Level Security) pour cacher des données sensibles selon les rôles, en combinant avec DLS pour une protection multicouche.

**Contexte**: Certaines données dans vos indices sont sensibles (SSN, salaires, emails personnels, données médicales). La Field-Level Security permet de les masquer complètement pour certains rôles, même si l'utilisateur peut voir le document.

### Scénario

Vous gérez un cluster avec des données d'employés contenant :
- **Données publiques** : Nom, département, date d'embauche
- **Données sensibles** : SSN, salaire, adresse personnelle, numéro de téléphone
- **Données confidentielles** : Évaluations de performance, notes disciplinaires

Vous allez créer plusieurs niveaux d'accès :
1. **Public** : Peut voir uniquement les champs publics
2. **HR Team** : Peut voir public + certaines données sensibles (pas SSN)
3. **HR Manager** : Peut voir tout (public + sensible + confidentiel)

### Étape 1: Créer un Index d'Employés Enrichi

```bash
PUT /employees_full
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "employee_id": { "type": "keyword" },
      "name": { "type": "keyword" },
      "department": { "type": "keyword" },
      "position": { "type": "keyword" },
      "hire_date": { "type": "date" },
      "email_corporate": { "type": "keyword" },
      "email_personal": { "type": "keyword" },
      "phone_work": { "type": "keyword" },
      "phone_personal": { "type": "keyword" },
      "address": {
        "properties": {
          "street": { "type": "text" },
          "city": { "type": "keyword" },
          "country": { "type": "keyword" },
          "postal_code": { "type": "keyword" }
        }
      },
      "ssn": { "type": "keyword" },
      "salary": { "type": "float" },
      "performance_review": {
        "properties": {
          "rating": { "type": "keyword" },
          "comments": { "type": "text" },
          "reviewer": { "type": "keyword" }
        }
      },
      "disciplinary_notes": { "type": "text" }
    }
  }
}
```

### Étape 2: Indexer des Données de Test

```bash
POST /employees_full/_bulk
{"index":{"_id":"1"}}
{"employee_id":"EMP-001","name":"Alice Johnson","department":"sales","position":"Sales Manager","hire_date":"2020-01-15","email_corporate":"alice.johnson@company.com","email_personal":"alice.j@gmail.com","phone_work":"+33-1-23-45-67-89","phone_personal":"+33-6-12-34-56-78","address":{"street":"10 Rue de Rivoli","city":"Paris","country":"France","postal_code":"75001"},"ssn":"123-45-6789","salary":75000,"performance_review":{"rating":"excellent","comments":"Top performer","reviewer":"Director Sales"},"disciplinary_notes":null}
{"index":{"_id":"2"}}
{"employee_id":"EMP-002","name":"Bob Smith","department":"hr","position":"HR Specialist","hire_date":"2021-03-20","email_corporate":"bob.smith@company.com","email_personal":"bob.smith@yahoo.com","phone_work":"+33-1-98-76-54-32","phone_personal":"+33-6-98-76-54-32","address":{"street":"25 Avenue des Champs","city":"Lyon","country":"France","postal_code":"69001"},"ssn":"987-65-4321","salary":60000,"performance_review":{"rating":"good","comments":"Solid contributor","reviewer":"HR Director"},"disciplinary_notes":"Late arrival incident - 2023-05-10"}
{"index":{"_id":"3"}}
{"employee_id":"EMP-003","name":"Charlie Brown","department":"engineering","position":"Senior Engineer","hire_date":"2019-05-10","email_corporate":"charlie.brown@company.com","email_personal":"cbrown@outlook.com","phone_work":"+33-1-11-22-33-44","phone_personal":"+33-6-11-22-33-44","address":{"street":"5 Boulevard Saint-Germain","city":"Paris","country":"France","postal_code":"75005"},"ssn":"555-12-3456","salary":95000,"performance_review":{"rating":"excellent","comments":"Technical leader","reviewer":"CTO"},"disciplinary_notes":null}
```

### Étape 3: Créer un Rôle "Public" avec FLS Restrictif

Ce rôle ne peut voir que les champs publics :

```bash
POST /_security/role/employee_public_view
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["employees_full"],
      "privileges": ["read"],
      "field_security": {
        "grant": [
          "employee_id",
          "name",
          "department",
          "position",
          "hire_date",
          "email_corporate",
          "phone_work"
        ]
      }
    }
  ],
  "metadata": {
    "description": "Public view - only non-sensitive employee data"
  }
}
```

**Champs accordés** : ID, nom, département, poste, date d'embauche, email pro, téléphone pro  
**Champs cachés** : SSN, salaire, adresse, emails/téléphones persos, évaluations, notes disciplinaires

### Étape 4: Créer un Rôle "HR Team" avec FLS Modéré

Ce rôle peut voir plus de champs mais pas les plus sensibles (SSN, notes disciplinaires) :

```bash
POST /_security/role/hr_team_view
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["employees_full"],
      "privileges": ["read", "write"],
      "field_security": {
        "grant": [
          "employee_id",
          "name",
          "department",
          "position",
          "hire_date",
          "email_*",
          "phone_*",
          "address.*",
          "salary",
          "performance_review.*"
        ],
        "except": [
          "ssn",
          "disciplinary_notes"
        ]
      }
    }
  ],
  "metadata": {
    "description": "HR team - can see most fields except SSN and disciplinary notes"
  }
}
```

**Utilisation de wildcards** :
- `email_*` : Accorde `email_corporate` ET `email_personal`
- `phone_*` : Accorde `phone_work` ET `phone_personal`
- `address.*` : Accorde tous les sous-champs de `address`
- `performance_review.*` : Tous les sous-champs des évaluations

**Champs explicitement exclus** :
- `ssn` : Numéro de sécurité sociale
- `disciplinary_notes` : Notes disciplinaires

### Étape 5: Créer un Rôle "HR Manager" avec Accès Complet

Ce rôle peut voir TOUS les champs sans restriction :

```bash
POST /_security/role/hr_manager_full
{
  "cluster": ["monitor", "manage"],
  "indices": [
    {
      "names": ["employees_full"],
      "privileges": ["all"],
      "field_security": {
        "grant": ["*"]
      }
    }
  ],
  "metadata": {
    "description": "HR Manager - full access to all employee data"
  }
}
```

**Grant `["*"]`** : Accorde tous les champs sans exception

### Étape 6: Créer des Utilisateurs avec Ces Rôles

```bash
# Utilisateur public
POST /_security/user/intern_view
{
  "password": "InternPass123!",
  "roles": ["employee_public_view"],
  "full_name": "Intern Viewer"
}

# Utilisateur HR team
POST /_security/user/jane_hr
{
  "password": "HRPass456!",
  "roles": ["hr_team_view"],
  "full_name": "Jane HR Specialist"
}

# Utilisateur HR manager
POST /_security/user/susan_hrmanager
{
  "password": "ManagerPass789!",
  "roles": ["hr_manager_full"],
  "full_name": "Susan HR Manager"
}
```

### Étape 7: Tester FLS - Vue Publique (Intern)

```bash
curl -u intern_view:InternPass123! "https://localhost:9200/employees_full/_search?pretty"
```

**Résultat attendu** :
```json
{
  "hits": {
    "hits": [
      {
        "_source": {
          "employee_id": "EMP-001",
          "name": "Alice Johnson",
          "department": "sales",
          "position": "Sales Manager",
          "hire_date": "2020-01-15",
          "email_corporate": "alice.johnson@company.com",
          "phone_work": "+33-1-23-45-67-89"
        }
      },
      ...
    ]
  }
}
```

**Analyse** :
- ✅ Voit : `employee_id`, `name`, `department`, `position`, `hire_date`, `email_corporate`, `phone_work`
- ❌ Ne voit **PAS** : `email_personal`, `phone_personal`, `address`, `ssn`, `salary`, `performance_review`, `disciplinary_notes`

### Étape 8: Tester FLS - Vue HR Team

```bash
curl -u jane_hr:HRPass456! "https://localhost:9200/employees_full/_doc/1?pretty"
```

**Résultat attendu** :
```json
{
  "_source": {
    "employee_id": "EMP-001",
    "name": "Alice Johnson",
    "department": "sales",
    "position": "Sales Manager",
    "hire_date": "2020-01-15",
    "email_corporate": "alice.johnson@company.com",
    "email_personal": "alice.j@gmail.com",
    "phone_work": "+33-1-23-45-67-89",
    "phone_personal": "+33-6-12-34-56-78",
    "address": {
      "street": "10 Rue de Rivoli",
      "city": "Paris",
      "country": "France",
      "postal_code": "75001"
    },
    "salary": 75000,
    "performance_review": {
      "rating": "excellent",
      "comments": "Top performer",
      "reviewer": "Director Sales"
    }
  }
}
```

**Analyse** :
- ✅ Voit : Tous les champs publics + emails/téléphones persos + adresse + salaire + évaluations
- ❌ Ne voit **PAS** : `ssn`, `disciplinary_notes` (exclus explicitement)

### Étape 9: Tester FLS - Vue HR Manager (Full Access)

```bash
curl -u susan_hrmanager:ManagerPass789! "https://localhost:9200/employees_full/_doc/2?pretty"
```

**Résultat attendu** :
```json
{
  "_source": {
    "employee_id": "EMP-002",
    "name": "Bob Smith",
    "department": "hr",
    "position": "HR Specialist",
    "hire_date": "2021-03-20",
    "email_corporate": "bob.smith@company.com",
    "email_personal": "bob.smith@yahoo.com",
    "phone_work": "+33-1-98-76-54-32",
    "phone_personal": "+33-6-98-76-54-32",
    "address": {
      "street": "25 Avenue des Champs",
      "city": "Lyon",
      "country": "France",
      "postal_code": "69001"
    },
    "ssn": "987-65-4321",
    "salary": 60000,
    "performance_review": {
      "rating": "good",
      "comments": "Solid contributor",
      "reviewer": "HR Director"
    },
    "disciplinary_notes": "Late arrival incident - 2023-05-10"
  }
}
```

**Analyse** :
- ✅ Voit **TOUT** : Tous les champs y compris `ssn` et `disciplinary_notes`

### Étape 10: Combiner DLS + FLS

Créons un rôle qui combine filtrage de documents ET de champs :

```bash
POST /_security/role/sales_dept_restricted
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["employees_full"],
      "privileges": ["read"],
      "query": {
        "term": {
          "department": "sales"
        }
      },
      "field_security": {
        "grant": [
          "employee_id",
          "name",
          "department",
          "position",
          "email_corporate",
          "phone_work"
        ]
      }
    }
  ],
  "metadata": {
    "description": "Sales department view - only sales employees, limited fields"
  }
}
```

**Double protection** :
- **DLS** : Filtre les documents (`department = "sales"` uniquement)
- **FLS** : Filtre les champs (champs publics uniquement)

### Étape 11: Tester DLS + FLS Combinés

```bash
# Créer l'utilisateur
POST /_security/user/sales_viewer
{
  "password": "SalesView123!",
  "roles": ["sales_dept_restricted"]
}

# Tester la recherche
curl -u sales_viewer:SalesView123! "https://localhost:9200/employees_full/_search?pretty"
```

**Résultat attendu** :
```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [
      {
        "_source": {
          "employee_id": "EMP-001",
          "name": "Alice Johnson",
          "department": "sales",
          "position": "Sales Manager",
          "email_corporate": "alice.johnson@company.com",
          "phone_work": "+33-1-23-45-67-89"
        }
      }
    ]
  }
}
```

**Analyse** :
- ✅ Voit uniquement EMP-001 (seul employé "sales")
- ❌ Ne voit **PAS** EMP-002 (hr) ni EMP-003 (engineering) → DLS
- ✅ Champs limités aux publics → FLS

### Étape 12: Tester FLS avec Agrégations

Les agrégations respectent également FLS :

```bash
# Avec intern_view (pas accès à salary)
curl -u intern_view:InternPass123! -X GET "https://localhost:9200/employees_full/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{
  "size": 0,
  "aggs": {
    "avg_salary": {
      "avg": {
        "field": "salary"
      }
    }
  }
}'
```

**Résultat attendu** : Erreur ou résultat vide (le champ `salary` est invisible)

```bash
# Avec jane_hr (accès à salary)
curl -u jane_hr:HRPass456! -X GET "https://localhost:9200/employees_full/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{
  "size": 0,
  "aggs": {
    "avg_salary": {
      "avg": {
        "field": "salary"
      }
    }
  }
}'
```

**Résultat attendu** :
```json
{
  "aggregations": {
    "avg_salary": {
      "value": 76666.67
    }
  }
}
```

### Validation Finale

```bash
# 1. Vérifier les rôles FLS
GET /_security/role/employee_public_view,hr_team_view,hr_manager_full,sales_dept_restricted

# 2. Comparer les champs visibles pour chaque utilisateur
# intern_view : 7 champs
# jane_hr : ~13 champs (sauf ssn, disciplinary_notes)
# susan_hrmanager : TOUS les champs

# 3. Vérifier la combinaison DLS + FLS
curl -u sales_viewer:SalesView123! "https://localhost:9200/employees_full/_count"
# Attendu: {"count": 1} (seulement Alice de sales)
```

### Points Clés à Retenir

✅ **FLS cache complètement les champs** (comme s'ils n'existaient pas dans le document)  
✅ `grant` liste les champs **autorisés**, `except` liste les champs **exclus**  
✅ **Wildcards** (`email_*`, `address.*`) permettent des patterns flexibles  
✅ **Nested fields** utilisent la notation point (`performance_review.rating`)  
✅ **DLS + FLS combinés** offrent une protection multicouche  
✅ Les **agrégations** sur champs cachés échouent ou retournent vide  
✅ Même avec `GET /_doc/{id}`, les champs cachés sont **absents du _source**  
✅ FLS est **appliqué au niveau du shard** pour performance optimale  
✅ Utiliser `grant: ["*"]` pour accès complet à tous les champs  
✅ Tester systématiquement avec différents rôles pour valider les restrictions

**Félicitations !** Vous maîtrisez maintenant la sécurité avancée d'Elasticsearch avec RBAC, DLS, et FLS ! 🎉


---


