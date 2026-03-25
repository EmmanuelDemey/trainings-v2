# Travaux Pratiques - Formation Elasticsearch Operations

## Table des Matières

1. [TP 1 - Prise en main: Indexation et Recherche de Base](#tp-1---prise-en-main-indexation-et-recherche-de-base)
2. [TP 2 - Mapping et Analyzers](#tp-2---mapping-et-analyzers)
3. [TP 3 - Agrégations](#tp-3---agrégations)
4. [TP 4 - Installation et Configuration du Cluster](#tp-4---installation-et-configuration-du-cluster)
5. [TP 5 - Inspection du Cluster avec les _cat APIs](#tp-5---inspection-du-cluster-avec-les-_cat-apis)
6. [TP 6 - Dimensionnement et Performance](#tp-6---dimensionnement-et-performance)
7. [TP 7 - ILM et Rétention des Données](#tp-7---ilm-et-rétention-des-données)
8. [TP 8 - Monitoring](#tp-8---monitoring)
9. [TP 9 - Sécurité: Snapshots et Restauration](#tp-9---sécurité-snapshots-et-restauration)
10. [TP 10 - Alertes et Notifications](#tp-10---alertes-et-notifications)
11. [TP 11 - Architecture Avancée et Production](#tp-11---architecture-avancée-et-production)

---

## TP 1 - Prise en main: Indexation et Recherche de Base

**Topic**: Concepts Généraux - Indexation et Recherche

### Objectif

Créer votre premier index Elasticsearch, y insérer des documents, et exécuter des recherches basiques pour comprendre le fonctionnement de l'index inversé.

### Contexte

Vous travaillez pour une boutique en ligne qui souhaite indexer son catalogue produits dans Elasticsearch. Vous allez créer un index `products`, y ajouter quelques produits, puis rechercher des articles spécifiques.

### Setup

**Avant de commencer**:
1. Vérifiez que votre cluster est accessible: `GET /`
2. Vérifiez le statut du cluster: `GET /_cluster/health`
3. Le statut doit être `green` ou `yellow` (acceptable en dev avec 1 nœud)
4. Si l'index `products` existe déjà, supprimez-le: `DELETE /products`

### Exercice

#### Étape 1: Créer l'index `products`

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

#### Étape 2: Indexer des documents produits

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

#### Étape 3: Recherche simple (match query)

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

#### Étape 4: Recherche avec filtrage (bool query)

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

### Critères de Succès

- Index `products` créé avec 5 documents
- Recherche "bureau" retourne 2 résultats
- Filtre prix <1000€ + category=electronics retourne 2 résultats
- `_count` retourne exactement 5 documents

### Dépannage

**Problème**: "index_not_found_exception"
→ Vérifiez le nom de l'index (sensible à la casse)

**Problème**: Aucun résultat pour la recherche "bureau"
→ Vérifiez que les documents sont bien indexés avec `GET /products/_search`
→ Attendez 1 seconde (refresh interval par défaut) et réessayez

**Problème**: Filtre sur `category` ne fonctionne pas
→ Utilisez `category.keyword` au lieu de `category` pour une correspondance exacte

---

## TP 2 - Mapping et Analyzers

**Topic**: Concepts Généraux - Mappings

### Objectif

Créer un index avec un mapping explicite pour contrôler précisément comment les données sont indexées et recherchables.

### Contexte

L'équipe marketing souhaite indexer des articles de blog avec des exigences spécifiques: recherche full-text sur le contenu, filtrage exact sur les tags, et recherche géographique sur la localisation de l'auteur.

### Setup

**Avant de commencer**:
1. Si l'index `blog_posts` existe déjà, supprimez-le: `DELETE /blog_posts`
2. Préparez le mapping en lisant la documentation: https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html

### Exercice

#### Étape 1: Créer l'index avec mapping explicite

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

#### Étape 2: Indexer des articles de blog

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

#### Étape 3: Tester les différents types de champs

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

#### Étape 4: Tenter d'ajouter un nouveau champ dynamique

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

### Critères de Succès

- Index créé avec mapping explicite (7 champs)
- Recherche full-text fonctionne avec analyzer French
- Filtrage exact sur `author` retourne les bons documents
- Recherche géographique dans un rayon de 50km fonctionne
- Mapping visualisé montre les types corrects pour chaque champ

### Dépannage

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

## TP 3 - Agrégations

**Topic**: Concepts Généraux - Agrégations

### Objectif

Utiliser les agrégations Elasticsearch pour extraire des statistiques et analyser les données sans récupérer tous les documents.

### Contexte

L'équipe analytics souhaite obtenir des statistiques sur les articles de blog: moyenne des vues, distribution par auteur, tendance temporelle des publications, et meilleurs articles par rating.

### Setup

Ce TP est autonome. Créez l'index `blog_posts` avec les données nécessaires avant de commencer les exercices:

```bash
DELETE /blog_posts

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
        "fields": { "keyword": { "type": "keyword" } }
      },
      "content": { "type": "text", "analyzer": "french_analyzer" },
      "author": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "published_date": { "type": "date", "format": "yyyy-MM-dd" },
      "views": { "type": "integer" },
      "rating": { "type": "float" },
      "author_location": { "type": "geo_point" }
    }
  }
}

POST /blog_posts/_doc/1
{
  "title": "Introduction à Elasticsearch",
  "content": "Elasticsearch est un moteur de recherche distribué basé sur Lucene",
  "author": "Jean Dupont",
  "tags": ["elasticsearch", "search", "tutorial"],
  "published_date": "2023-10-15",
  "views": 1250,
  "rating": 4.5,
  "author_location": { "lat": 48.8566, "lon": 2.3522 }
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
  "author_location": { "lat": 45.764, "lon": 4.8357 }
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
  "author_location": { "lat": 48.8566, "lon": 2.3522 }
}

POST /blog_posts/_doc/4
{
  "title": "Nouveau champ non mappé",
  "content": "Test de mapping dynamique",
  "author": "Test User",
  "tags": ["test"],
  "published_date": "2023-11-11",
  "views": 0,
  "rating": 3.0,
  "author_location": { "lat": 48.0, "lon": 2.0 }
}
```

### Exercice

#### Étape 1: Agrégation Metrics - Statistiques sur les vues

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
      "count": 4,
      "min": 0,
      "max": 2100,
      "avg": 1060,
      "sum": 4240
    },
    "avg_views": { "value": 1060 },
    "max_views": { "value": 2100 }
  }
}
```

#### Étape 2: Agrégation Bucket - Distribution par auteur (Terms)

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
        { "key": "Marie Martin", "doc_count": 1 },
        { "key": "Test User", "doc_count": 1 }
      ]
    }
  }
}
```

#### Étape 3: Agrégation Bucket - Histogramme temporel (Date Histogram)

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

#### Étape 4: Agrégations Imbriquées - Stats par auteur

Combinez une agrégation bucket (par auteur) avec des agrégations metrics:

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

#### Étape 5: Pipeline Aggregation - Moyenne des moyennes

Calculez la moyenne des vues moyennes par auteur:

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

### Critères de Succès

- Stats aggregation retourne min, max, avg, sum des vues
- Terms aggregation par auteur retourne les bons comptes
- Date histogram groupe les articles par mois
- Agrégations imbriquées retournent stats par auteur
- Pipeline aggregation calcule la moyenne des moyennes

### Dépannage

**Problème**: "fielddata is disabled on text fields"
→ Utilisez le sous-champ `.keyword` pour agréger: `"field": "title.keyword"`

**Problème**: Résultats d'agrégation vides
→ Vérifiez que des documents existent: `GET /blog_posts/_count`

**Problème**: Pipeline aggregation retourne null
→ Vérifiez que `buckets_path` pointe vers la bonne agrégation parent>child

---

## TP 4 - Installation et Configuration du Cluster

**Topic**: Installation et Configuration - Formation de Cluster et Rôles de Nœuds

### Objectif

Démarrer un second nœud Elasticsearch, le joindre au cluster existant, puis configurer des rôles de nœuds spécifiques (master-only, data-only) pour optimiser l'architecture.

### Contexte

Votre cluster à nœud unique doit évoluer pour supporter plus de charge et assurer la haute disponibilité. Vous allez ajouter un second nœud, puis séparer les responsabilités par rôles de nœuds.

### Setup

**Avant de commencer**:
1. Vérifiez que le premier nœud est en cours d'exécution: `GET /`
2. Notez le `cluster_name`: `GET /_cluster/health`
3. Préparez un second terminal pour le nouveau nœud

### Partie A: Formation d'un Cluster Multi-Nœuds

#### Étape 1: Générer un enrollment token

Depuis le premier nœud, générez un token d'enrollment:

```bash
cd /path/to/elasticsearch
bin/elasticsearch-create-enrollment-token -s node
```

**Résultat attendu**: Un token long (JWT) sera affiché:
```
eyJ2ZXIiOiI4LjAuMCIsImFkciI6WyIxOTIuMTY4LjEuMTA6OTIwMCJdLCJmZ3IiOiJhYmMxMjMuLi4iLCJrZXkiOiJ4eXo3ODkuLi4ifQ==
```

**Note**: Ce token expire après 30 minutes.

#### Étape 2: Préparer le répertoire du second nœud

```bash
# Option 1: Copier l'installation Elasticsearch
cp -r elasticsearch-8.x elasticsearch-node2

# Option 2: Utiliser la même installation avec des répertoires data séparés
# (configuration via elasticsearch.yml)
```

#### Étape 3: Démarrer le second nœud avec l'enrollment token

```bash
cd elasticsearch-node2
bin/elasticsearch --enrollment-token <VOTRE_TOKEN>
```

**Résultat attendu**: Le nœud démarre et affiche:
```
[INFO ][o.e.n.Node] [node-2] started
[INFO ][o.e.c.s.ClusterApplierService] [node-2] detected_master {node-1}{...}
```

#### Étape 4: Vérifier la formation du cluster

```bash
GET /_cat/nodes?v
```

**Résultat attendu**:
```
ip           heap.percent ram.percent cpu load_1m node.role master name
192.168.1.10 45           60          2   0.50    cdfhilmrstw *      node-1
192.168.1.11 30           55          1   0.40    cdfhilmrstw -      node-2
```

#### Étape 5: Vérifier le statut du cluster

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

#### Validation

1. Lister tous les nœuds avec leurs rôles:
```bash
GET /_cat/nodes?v&h=name,ip,node.role,master,heap.percent,ram.percent
```

2. Vérifier l'allocation des shards entre les nœuds:
```bash
GET /_cat/shards?v
```

3. Tester la résilience (optionnel):
```bash
PUT /test-resilience
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}
GET /_cat/shards/test-resilience?v
```

### Partie B: Configuration des Rôles de Nœuds

#### Étape 1: Configurer un nœud data-only

Éditez `elasticsearch.yml` du second nœud:

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

#### Étape 2: Redémarrer le nœud avec la nouvelle configuration

```bash
bin/elasticsearch
```

#### Étape 3: Vérifier les rôles des nœuds

```bash
GET /_cat/nodes?v&h=name,node.role,master
```

**Résultat attendu**:
```
name         node.role   master
node-1       cdfhilmrstw *
data-node-1  di          -
```

**Légende des rôles**: `d` = data, `i` = ingest, `m` = master, `h` = hot_data, `w` = warm_data, `c` = cold_data

#### Étape 4: Configurer un nœud master-only (simulation)

Si vous avez un troisième environnement:

```yaml
# config/elasticsearch.yml (node-3)

cluster.name: elasticsearch
node.name: master-node-1

node.roles: [ master ]

network.host: 0.0.0.0
http.port: 9202
transport.port: 9302

discovery.seed_hosts: ["localhost:9300", "localhost:9301"]
cluster.initial_master_nodes: ["node-1", "master-node-1"]
```

#### Étape 5: Vérifier l'allocation des shards

```bash
GET /_cat/shards?v&h=index,shard,prirep,state,node
```

#### Validation

```bash
GET /_nodes?filter_path=nodes.*.name,nodes.*.roles
GET /_cat/allocation?v&h=node,shards,disk.used
GET /_cat/master?v
```

### Critères de Succès

- Enrollment token généré avec succès
- Second nœud démarré et rejoint le cluster avec statut green
- `GET /_cat/nodes` affiche 2 nœuds
- Nœud data-only configuré avec `node.roles: [data, ingest]`
- Shards ne sont PAS alloués sur les nœuds master-only

### Dépannage

**Problème**: "Enrollment token has expired"
→ Régénérez un token avec `elasticsearch-create-enrollment-token -s node`

**Problème**: Le second nœud ne rejoint pas le cluster
→ Vérifiez la connectivité réseau (port 9300 pour transport)
→ Vérifiez les logs: `tail -f logs/elasticsearch.log`

**Problème**: Cluster reste en statut `yellow`
→ Normal avec 1 seul nœud et des replicas configurés
→ Vérifiez: `GET /_cat/shards?h=index,shard,prirep,state,unassigned.reason`

**Problème**: Nœud refuse de démarrer après changement de rôles
→ Vérifiez la syntaxe YAML (indentation, pas de tabs)
→ `cluster.initial_master_nodes` doit être retiré après la première initialisation

---

## TP 5 - Inspection du Cluster avec les _cat APIs

**Topic**: Installation et Configuration - APIs de Vérification

### Objectif

Maîtriser les _cat APIs pour inspecter rapidement l'état du cluster, des indices, des shards, et de l'allocation de ressources.

### Contexte

En tant qu'administrateur, vous devez diagnostiquer régulièrement l'état du cluster. Les _cat APIs fournissent une vue concise et lisible pour identifier rapidement les problèmes.

### Setup

**Avant de commencer**, créez des index de test avec des données:

```bash
PUT /logs-2023.11
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}

POST /logs-2023.11/_bulk
{"index":{}}
{"message":"Log entry 1","timestamp":"2023-11-10T10:00:00"}
{"index":{}}
{"message":"Log entry 2","timestamp":"2023-11-10T10:01:00"}
{"index":{}}
{"message":"Log entry 3","timestamp":"2023-11-10T10:02:00"}
```

### Exercice

#### Étape 1: Lister tous les indices avec _cat/indices

```bash
GET /_cat/indices?v
```

**Colonnes clés**:
- `health`: green/yellow/red
- `pri`: Nombre de shards primaires
- `rep`: Nombre de replicas
- `docs.count`: Nombre de documents
- `store.size`: Taille totale (primaires + replicas)

#### Étape 2: Filtrer et trier les indices

```bash
GET /_cat/indices?v&s=store.size:desc&h=index,health,docs.count,store.size
```

**Personnalisation**:
- `s=colonne:desc`: Tri par colonne (desc ou asc)
- `h=col1,col2`: Sélection des colonnes à afficher
- `v`: Affiche les headers (verbose)

#### Étape 3: Inspecter l'allocation des shards avec _cat/shards

```bash
GET /_cat/shards?v
```

**Colonnes clés**:
- `prirep`: `p` (primary) ou `r` (replica)
- `state`: STARTED, RELOCATING, INITIALIZING, UNASSIGNED
- `node`: Nœud hébergeant le shard

#### Étape 4: Identifier les shards problématiques

```bash
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason
```

**Raisons d'unassignment courantes**:
- `INDEX_CREATED`: Nouveau shard, allocation en cours
- `NODE_LEFT`: Nœud déconnecté, réallocation nécessaire
- `REPLICA_ADDED`: Replica ajouté, recherche de nœud disponible
- `ALLOCATION_FAILED`: Échec d'allocation (disque plein, règles d'allocation)

#### Étape 5: Vérifier l'utilisation disque avec _cat/allocation

```bash
GET /_cat/allocation?v
```

**Alerte**: Si `disk.used` >85%, le watermark LOW est atteint (plus de nouveaux shards).

#### Étape 6: Surveiller les pending tasks

```bash
GET /_cat/pending_tasks?v
```

**Interprétation**: Des pending tasks avec `timeInQueue` >10s indiquent un master surchargé.

#### Validation

1. Comparer _cat/indices et _cat/shards pour un index:
```bash
GET /_cat/indices/logs-2023.11?v
GET /_cat/shards/logs-2023.11?v
```
**Vérification**: `pri × (1 + rep)` = nombre total de shards dans _cat/shards.

2. Exporter les résultats en JSON:
```bash
GET /_cat/nodes?format=json
GET /_cat/indices?format=json&pretty
```

3. Utiliser help pour découvrir toutes les colonnes:
```bash
GET /_cat/indices?help
GET /_cat/nodes?help
```

### Critères de Succès

- _cat/indices liste tous les indices avec santé et taille
- _cat/shards montre l'allocation des shards entre nœuds
- _cat/allocation affiche l'utilisation disque par nœud
- Capable de filtrer et trier les résultats avec `?h=` et `?s=`
- Capable d'identifier les shards UNASSIGNED et leur raison

### Dépannage

**Problème**: "No handler found for uri [/_cat/...]"
→ Vérifiez l'orthographe de l'API: `/_cat/indices` (pas `/_cat/index`)

**Problème**: Trop de colonnes, sortie illisible
→ Utilisez `?h=col1,col2,col3` pour sélectionner uniquement les colonnes nécessaires
→ Exemple: `GET /_cat/nodes?v&h=name,heap.percent,ram.percent,cpu,load_1m`

---

## TP 6 - Dimensionnement et Performance

**Topic**: Performance et Dimensionnement - Planification de Capacité, Configuration JVM, Thread Pools

### Objectif

Apprendre à calculer le nombre optimal de shards, configurer correctement le heap JVM, et analyser les thread pools pour diagnostiquer les problèmes de performance.

### Contexte

Vous êtes chargé de dimensionner un cluster Elasticsearch pour un système de logs applicatifs, puis de valider la configuration mémoire et d'analyser les rejections de requêtes.

### Partie A: Dimensionnement de Cluster - Calcul du Nombre de Shards

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

#### Étape 1: Calculer le volume total après 30 jours

```
Volume initial:     500 GB
Croissance (30j):   50 GB/jour × 30 = 1,500 GB
Volume total:       500 + 1,500 = 2,000 GB

Avec 1 replica (×2):
Volume avec replicas: 2,000 GB × 2 = 4,000 GB
```

#### Étape 2: Déterminer la taille cible d'un shard

**Règles de sizing**:
- Taille optimale: 10-50 GB par shard
- Maximum recommandé: 50 GB
- Minimum recommandé: 1 GB

**Choix**: 30 GB par shard

#### Étape 3: Calculer le nombre de shards primaires

```
Nombre de shards primaires = 2,000 GB / 30 GB = 66.67 ≈ 67 shards primaires
```

#### Étape 4: Vérifier la contrainte de shards par nœud

**Règle**: Maximum 20 shards par GB de heap JVM

```
Heap par nœud:       31 GB
Max shards/nœud:     31 GB × 20 = 620 shards
Shards totaux:       67 primaires + 67 replicas = 134 shards
Shards par nœud:     134 / 5 nœuds = 26.8 ≈ 27 shards/nœud
```

**Validation**: 27 << 620 max - OK

#### Étape 5: Stratégie d'indexation - Index par jour (Time-Based Indices)

```bash
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
- Suppression facile des vieux logs (DELETE index entier)
- Réduction de la taille de l'index (recherches plus rapides)
- Gestion ILM simplifiée

#### Validation

| Métrique | Valeur | Statut |
|----------|--------|--------|
| Volume total (avec replicas) | 4,000 GB | OK |
| Shards primaires par jour | 2 | OK |
| Shards totaux (30 jours) | 120 (60p + 60r) | OK |
| Shards par nœud | 24 | OK (< 620 max) |
| Utilisation disque | 40% | OK (< 85%) |

### Partie B: Configuration du Heap JVM

#### Setup

```bash
# Vérifiez la RAM totale du serveur
free -h

# Localisez le fichier jvm.options
# Installation par package: /etc/elasticsearch/jvm.options
# Installation par archive: config/jvm.options

# Arrêtez Elasticsearch
sudo systemctl stop elasticsearch
```

#### Étape 1: Calculer le heap optimal

**Règles de sizing**:
1. **50% de la RAM**: Le heap doit être au maximum 50% de la RAM physique
2. **Maximum 32 GB**: Ne jamais dépasser 32 GB (limite compressed oops)
3. **Xms = Xmx**: Les deux valeurs doivent être identiques

**Pour un serveur avec 64 GB de RAM**:
```
RAM totale:     64 GB
50% de la RAM:  32 GB
Heap configuré: 31 GB (laisse 1 GB de marge pour la JVM)
OS cache:       33 GB (le reste)
```

#### Étape 2: Modifier jvm.options

```bash
sudo vi /etc/elasticsearch/jvm.options
```

```
-Xms31g
-Xmx31g
```

**Important**: Utilisez `g` pour gigabytes, les deux valeurs DOIVENT être identiques.

#### Étape 3: Vérifier les autres paramètres JVM critiques

```
-XX:+UseG1GC
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/lib/elasticsearch
```

#### Étape 4: Redémarrer et vérifier

```bash
sudo systemctl start elasticsearch

# Vérifier la configuration heap via l'API
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_max_in_bytes

# Vérifier compressed oops (doit être true si heap < 32 GB)
GET /_nodes?filter_path=nodes.*.jvm.using_compressed_ordinary_object_pointers

# Monitorer l'utilisation du heap
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_used_percent
```

**Interprétation**:
- <75%: Sain
- 75-85%: Surveiller
- >85%: Critique (risque OutOfMemoryError)

### Partie C: Analyse des Thread Pools et Rejections

#### Setup

Générez de la charge si nécessaire:

```bash
for i in {1..1000}; do
  curl -X POST "localhost:9200/load-test/_doc" -H 'Content-Type: application/json' -d'
  {
    "timestamp": "'$(date -Iseconds)'",
    "value": '$RANDOM'
  }
  ' &
done
```

#### Étape 1: Lister tous les thread pools

```bash
GET /_cat/thread_pool?v
```

**Colonnes clés**:
- `active`: Nombre de threads en cours d'exécution
- `queue`: Nombre de tâches en attente
- `rejected`: Nombre de tâches rejetées (cumul depuis démarrage)

#### Étape 2: Filtrer les thread pools importants

```bash
GET /_cat/thread_pool/write,search,get?v&h=node_name,name,active,queue,rejected,completed
```

#### Étape 3: Analyser les rejections en détail

```bash
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.write,nodes.*.thread_pool.search
```

#### Étape 4: Calculer le taux de rejection

```
Taux de rejection = rejected / (completed + rejected) × 100%
```

**Interprétation**:
- <0.1%: Acceptable (pics occasionnels)
- 0.1-1%: Attention (surcharge régulière)
- >1%: Critique (cluster sous-dimensionné)

#### Étape 5: Identifier la cause des rejections

```bash
# Le thread pool est-il à sa capacité max ?
GET /_cat/thread_pool/search?v&h=node_name,active,threads

# La queue est-elle pleine ?
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.search.queue,nodes.*.thread_pool.search.queue_size

# Charge CPU du cluster
GET /_nodes/stats/os?filter_path=nodes.*.os.cpu.percent
```

#### Solutions aux Rejections

**Si thread pool WRITE saturé**:
- Augmenter le refresh_interval
- Utiliser Bulk API avec batches appropriés (5-15 MB)
- Ajouter des nœuds data (scale horizontal)

**Si thread pool SEARCH saturé**:
- Optimiser les requêtes (utiliser filter context)
- Réduire le nombre de shards
- Ajouter des nœuds data ou coordinating-only

### Critères de Succès

- Volume total calculé correctement (4 TB avec replicas)
- Heap configuré à 31 GB avec Xms = Xmx
- Compressed oops activé (true)
- Capable de lister les thread pools et identifier les rejections
- Calculer le taux de rejection et proposer des solutions

### Dépannage

**Problème**: Elasticsearch ne démarre pas après modification du heap
→ Vérifiez les logs: `sudo journalctl -u elasticsearch -f`
→ Erreur courante: Syntaxe invalide dans jvm.options

**Problème**: Compressed oops = false
→ Heap configuré > 32 GB, réduisez à 31 GB maximum

**Problème**: Rejections même avec CPU/RAM disponibles
→ Bottleneck peut être ailleurs (disque I/O, réseau)
→ Vérifiez disk I/O: `iostat -x 1` (Linux)

---

## TP 7 - ILM et Rétention des Données

**Niveau**: Avancé
**Topic**: Performance et Dimensionnement - Index Lifecycle Management

### Objectif

Concevoir une architecture hot-warm-cold pour optimiser coût/performance, et configurer des policies Index Lifecycle Management (ILM) pour automatiser les transitions.

### Contexte

Votre cluster stocke des logs avec des patterns d'accès variables: les logs récents (<7 jours) sont consultés fréquemment (hot), les logs moyens (7-30 jours) occasionnellement (warm), et les vieux logs (>30 jours) rarement (cold).

### Setup

**Avant de commencer**, vérifiez que votre cluster est accessible:

```bash
GET /_cluster/health
```

### Partie 1: Configurer les node attributes pour les tiers

Définissez un attribut `data_tier` sur chaque nœud dans `elasticsearch.yml`:

```yaml
# Nœuds HOT (haute performance)
node.name: hot-node-1
node.roles: [ data_hot ]

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

### Partie 2: Créer une policy ILM

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
- **cold** (30-90j): Convert to searchable snapshot
- **delete** (>90j): Suppression automatique

### Partie 3: Créer un index template avec ILM

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

### Partie 4: Créer le premier index et l'alias

```bash
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

### Partie 5: Tester le rollover

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

### Partie 6: Simuler les transitions de phase

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
        "min_age": "1m",
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

### Tableau de comparaison Hot-Warm-Cold

| Tier | Hardware | Cas d'usage | Coût | Performance |
|------|----------|-------------|------|-------------|
| **Hot** | SSD NVMe, 64GB RAM, 16 cores | Logs <7j, indexation + recherche intensive | Élevé | Très haute |
| **Warm** | SSD SATA, 32GB RAM, 8 cores | Logs 7-30j, recherche occasionnelle | Moyen | Moyenne |
| **Cold** | HDD ou S3, 16GB RAM, 4 cores | Logs >30j, archivage, recherche rare | Bas | Basse |

### Questions à répondre

1. **Quand utiliser shrink dans la phase warm ?**
   - Quand les données ne changent plus (read-only)
   - Pour réduire le nombre de shards et améliorer les recherches
   - PAS sur des index actifs (write)

2. **Qu'est-ce qu'un searchable snapshot ?**
   - Index stocké dans un object store (S3, GCS, Azure Blob)
   - Données chargées à la demande
   - Coût de stockage très réduit (~90% moins cher)

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

### Critères de Succès

- Comprendre l'architecture hot-warm-cold
- Savoir créer une ILM policy multi-phases
- Maîtriser les actions: rollover, shrink, forcemerge, searchable_snapshot

---

## TP 8 - Monitoring

**Topic**: Monitoring - APIs de Surveillance, Métriques Critiques, Slow Query Logs

### Objectif

Maîtriser les APIs de monitoring pour diagnostiquer l'état du cluster, surveiller les métriques des nœuds, et configurer les slow query logs pour identifier les requêtes problématiques.

### Contexte

L'équipe reçoit une alerte indiquant que le cluster est passé en statut `yellow` et des utilisateurs se plaignent de lenteur. Vous devez diagnostiquer les causes et mettre en place un monitoring efficace.

### Setup

Ce TP est autonome. Créez l'index de test avant de commencer:

```bash
PUT /health-test
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}
```

### Partie A: Utilisation de l'API Cluster Health

#### Étape 1: Consulter le cluster health basique

```bash
GET /_cluster/health
```

**Résultat attendu (cluster à 1 nœud)**:
```json
{
  "cluster_name": "elasticsearch",
  "status": "yellow",
  "number_of_nodes": 1,
  "number_of_data_nodes": 1,
  "active_primary_shards": 2,
  "active_shards": 2,
  "unassigned_shards": 2,
  "active_shards_percent_as_number": 50.0
}
```

**Interprétation**:
- `status: "yellow"`: Au moins un replica shard non alloué
- `unassigned_shards: 2`: Replicas ne peuvent pas être alloués sur 1 nœud

#### Étape 2: Obtenir des détails par index

```bash
GET /_cluster/health?level=indices
```

#### Étape 3: Identifier les shards non alloués

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

#### Étape 4: Comprendre les couleurs de statut

| Statut | Signification | Impact | Action |
|--------|---------------|--------|--------|
| **GREEN** | Tous les shards (primaires + replicas) alloués | Aucun | Normal |
| **YELLOW** | Tous primaires alloués, certains replicas manquants | Fonctionnel, mais pas de HA | Surveillance, non urgent |
| **RED** | Au moins un primaire manquant | PERTE DE DONNÉES | Action immédiate |

#### Étape 5: Diagnostiquer pourquoi un shard est unassigned

```bash
GET /_cluster/allocation/explain
{
  "index": "health-test",
  "shard": 0,
  "primary": false
}
```

#### Étape 6: Utiliser les paramètres de l'API

```bash
# Attendre le statut green (timeout 30s)
GET /_cluster/health?wait_for_status=green&timeout=30s

# Filtrer un index spécifique
GET /_cluster/health/health-test

# Identifier tous les shards unassigned du cluster
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason
```

### Partie B: Monitoring des Statistiques de Nœuds

#### Étape 1: Obtenir les statistiques JVM (heap usage)

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.name,nodes.*.jvm.mem
```

**Interprétation**:
- <75%: Sain
- 75-85%: Surveiller
- >85%: Critique (risque OutOfMemoryError)

#### Étape 2: Vérifier les Garbage Collection stats

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.name,nodes.*.jvm.gc
```

**Alertes**:
- GC young > 50 ms: Heap sous pression
- GC old > 1000 ms: Heap critiquement plein

#### Étape 3: Monitorer l'utilisation CPU et RAM

```bash
GET /_nodes/stats/os?filter_path=nodes.*.name,nodes.*.os.cpu,nodes.*.os.mem
```

**Thresholds**:
- CPU: <60% OK, 60-80% attention, >80% critique
- RAM: >20% free OK, 10-20% free attention, <10% free critique

#### Étape 4: Vérifier l'utilisation disque

```bash
GET /_nodes/stats/fs?filter_path=nodes.*.name,nodes.*.fs.total,nodes.*.fs.io_stats
```

**Thresholds disque (watermarks)**:
- <85%: Sain
- 85-90%: LOW watermark (pas de nouveaux shards)
- 90-95%: HIGH watermark (relocate shards)
- >95%: FLOOD (indices en read-only)

#### Étape 5: Surveiller les métriques d'indexation et recherche

```bash
GET /_nodes/stats/indices?filter_path=nodes.*.name,nodes.*.indices.indexing,nodes.*.indices.search
```

#### Étape 6: Tableau de bord synthétique

```bash
GET /_nodes/stats?filter_path=nodes.*.name,nodes.*.jvm.mem.heap_used_percent,nodes.*.os.cpu.percent,nodes.*.fs.total.available_in_bytes,nodes.*.indices.search.query_time_in_millis
```

### Partie C: Configuration et Analyse des Slow Query Logs

#### Setup de cette partie

Créez un index de test avec des données:

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

POST /slowlog-test/_bulk
{"index":{}}
{"title":"Article 1","content":"Long content here with many words to search","category":"tech","views":100}
{"index":{}}
{"title":"Article 2","content":"Another long content for searching purposes","category":"science","views":200}
```

#### Étape 1: Configurer les seuils de slow query log

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

#### Étape 2: Localiser les fichiers de slow logs

```
/var/log/elasticsearch/<cluster_name>_index_search_slowlog.log
/var/log/elasticsearch/<cluster_name>_index_indexing_slowlog.log
```

#### Étape 3: Exécuter une requête lente

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

Ou une agrégation complexe:

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
        }
      }
    }
  }
}
```

#### Étape 4: Analyser les slow logs

```bash
tail -f /var/log/elasticsearch/elasticsearch_index_search_slowlog.log
```

**Format d'une entrée slow log**:
```
[2023-11-10T10:30:15,123][INFO ][i.s.s.query] [node-1] [slowlog-test][0]
took[312ms], took_millis[312], total_hits[100 hits],
source[{"query":{"wildcard":{"content":"*long*content*"}},"size":100}]
```

#### Étape 5: Optimiser la requête identifiée

**Avant** (wildcard lent) - ~300ms:
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

**Après** (match query rapide) - ~10ms:
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

#### Étape 6: Vérifier la configuration et désactiver les slow logs

```bash
# Vérifier la configuration
GET /slowlog-test/_settings?include_defaults&filter_path=*.index.search.slowlog*

# Désactiver
PUT /slowlog-test/_settings
{
  "index.search.slowlog.threshold.query.warn": "-1",
  "index.search.slowlog.threshold.query.info": "-1",
  "index.search.slowlog.threshold.query.debug": "-1",
  "index.search.slowlog.threshold.query.trace": "-1"
}
```

### Critères de Succès

- Comprendre les 3 statuts (green/yellow/red) et leur signification
- Extraire heap usage avec `_nodes/stats/jvm`
- Interpréter les métriques CPU/RAM/disk
- Configurer les seuils slowlog avec `PUT /index/_settings`
- Identifier le type de requête lente et proposer une optimisation

### Dépannage

**Problème**: Cluster reste yellow même avec 2 nœuds
→ Vérifiez les règles d'allocation: `GET /_cluster/settings`
→ Vérifiez l'espace disque: watermark flood peut bloquer l'allocation

**Problème**: Heap usage constamment >85%
→ Cluster sous-dimensionné, ajoutez des nœuds
→ Ou augmentez le heap (si RAM disponible et <32 GB)

**Problème**: Aucun slow log généré même avec requêtes lentes
→ Vérifiez que la requête dépasse effectivement le seuil (mesurez avec `?profile=true`)
→ Vérifiez les permissions du fichier de log

---

## TP 9 - Sécurité: Snapshots et Restauration

**Objectif**: Maîtriser la configuration de repositories de snapshots, la création de sauvegardes, et la restauration d'indices pour assurer la protection des données.

**Contexte**: Les snapshots sont essentiels pour protéger vos données contre les suppressions accidentelles, les corruptions, et les pannes matérielles. Dans ce lab, vous allez configurer un repository filesystem, créer plusieurs snapshots, et pratiquer différents scénarios de restauration.

### Setup

Ce TP est autonome. Commencez par configurer le chemin du repository et le créer.

### Étape 1: Configurer le Chemin du Repository

Ajoutez la configuration `path.repo` dans `elasticsearch.yml`:

```yaml
path.repo: ["/usr/share/elasticsearch/backups"]
```

**Pour Docker**, créez le répertoire et montez le volume:

```bash
mkdir -p ~/elasticsearch-backups

docker run -d \
  --name elasticsearch-node-1 \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "path.repo=/usr/share/elasticsearch/backups" \
  -v ~/elasticsearch-backups:/usr/share/elasticsearch/backups \
  docker.elastic.co/elasticsearch/elasticsearch:8.12.0
```

**Pour installation locale**:

```bash
sudo mkdir -p /mnt/elasticsearch/backups
sudo chown elasticsearch:elasticsearch /mnt/elasticsearch/backups
sudo chmod 775 /mnt/elasticsearch/backups
```

Redémarrez Elasticsearch pour appliquer la configuration.

### Étape 2: Créer un Repository de Snapshots

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

**Tester la connectivité du repository**:

```bash
POST /_snapshot/my_backup/_verify
```

### Étape 3: Créer des Données de Test

```bash
# Index 1: Produits
PUT /products
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
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
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
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
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

POST /users/_bulk
{"index":{"_id":"1"}}
{"username":"alice","email":"alice@example.com","role":"admin"}
{"index":{"_id":"2"}}
{"username":"bob","email":"bob@example.com","role":"user"}
{"index":{"_id":"3"}}
{"username":"charlie","email":"charlie@example.com","role":"user"}
```

Vérifiez les indices créés:

```bash
GET /_cat/indices?v&h=index,docs.count,store.size
```

### Étape 4: Créer un Snapshot Complet

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

**Surveiller la progression**:

```bash
GET /_snapshot/my_backup/snapshot_full_2024_01_15/_status
```

**Attendre que l'état devienne SUCCESS**:

```bash
GET /_snapshot/my_backup/snapshot_full_2024_01_15
```

### Étape 5: Créer un Snapshot Partiel

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

### Étape 6: Lister Tous les Snapshots

```bash
GET /_snapshot/my_backup/_all
```

### Étape 7: Scénario de Restauration 1 - Suppression Accidentelle

1. Supprimer accidentellement l'index "orders":

```bash
DELETE /orders
```

2. Vérifier que l'index n'existe plus:

```bash
GET /_cat/indices?v&h=index
```

3. Restaurer uniquement l'index "orders":

```bash
POST /_snapshot/my_backup/snapshot_full_2024_01_15/_restore
{
  "indices": "orders",
  "ignore_unavailable": true,
  "include_global_state": false
}
```

4. Surveiller la restauration:

```bash
GET /_cat/recovery?v&h=index,stage,type,files_percent&s=index
```

5. Vérifier que les données sont restaurées:

```bash
GET /orders/_search
{
  "query": { "match_all": {} }
}
```

### Étape 8: Scénario de Restauration 2 - Restauration avec Renommage

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

Comparer les données:

```bash
GET /products/_count
GET /restored_products/_count
```

### Étape 9: Scénario de Restauration 3 - Restauration Complète

1. Supprimer tous les indices (ATTENTION: uniquement en environnement de test):

```bash
DELETE /products,orders,users,restored_products
```

2. Restaurer tous les indices:

```bash
POST /_snapshot/my_backup/snapshot_full_2024_01_15/_restore
{
  "indices": "*",
  "include_global_state": true,
  "ignore_unavailable": true
}
```

3. Vérifier la restauration complète:

```bash
GET /_cat/indices?v&h=index,docs.count,store.size
```

### Validation Finale

```bash
GET /_snapshot/_all
GET /_snapshot/my_backup/_all
GET /_cat/indices?v
GET /products/_count
GET /orders/_count
GET /users/_count
```

**Résultats attendus**:
- Repository `my_backup` existe et est accessible
- Au moins 2 snapshots présents et en état `SUCCESS`
- 3 indices présents: `products`, `orders`, `users`
- Counts: products=5, orders=3, users=3

### Points Clés à Retenir

- Le chemin du repository doit être déclaré dans `path.repo` dans `elasticsearch.yml`
- Les snapshots sont **incrémentaux**: seuls les nouveaux segments sont copiés
- Utilisez `include_global_state: true` pour sauvegarder templates et policies
- La restauration nécessite que les indices n'existent pas (ou soient fermés)
- `rename_pattern` et `rename_replacement` permettent de restaurer avec un nouveau nom
- Utilisez `_verify` pour tester la connectivité du repository

---

## TP 10 - Alertes et Notifications

**Objectif**: Créer des alertes de surveillance avec Kibana Rules, configurer des actions avancées (webhook, index), et implémenter la gestion des utilisateurs avec RBAC et Document-Level Security.

**Contexte**: Les alertes ne sont utiles que si elles déclenchent les bonnes actions. Dans ce TP, vous allez créer des règles de surveillance, configurer des webhooks, archiver l'historique des alertes, et implémenter le contrôle d'accès basé sur les rôles.

### Setup

Ce TP est autonome. Créez les indices de simulation avant de commencer:

```bash
PUT /cluster_health_logs
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "status": { "type": "keyword" },
      "cluster_name": { "type": "keyword" },
      "number_of_nodes": { "type": "integer" },
      "unassigned_shards": { "type": "integer" }
    }
  }
}

POST /cluster_health_logs/_doc
{
  "@timestamp": "2024-01-15T10:00:00Z",
  "status": "yellow",
  "cluster_name": "es-ops-training",
  "number_of_nodes": 3,
  "unassigned_shards": 2
}
```

### Partie A: Création d'une Alerte Simple avec Kibana Rules

#### Étape 1: Accéder à l'Interface de Gestion des Règles

1. Ouvrez Kibana dans votre navigateur
2. Dans le menu latéral, cliquez sur **Stack Management**
3. Sous la section **Alerts and Insights**, cliquez sur **Rules**

#### Étape 2: Créer une Nouvelle Règle

1. Cliquez sur **Create rule**
2. Sélectionnez le type: **Elasticsearch query**
3. Nom: `cluster-health-monitor`
4. Tags: `cluster`, `health`, `ops`

#### Étape 3: Configurer la Requête de Surveillance

- **Index**: `cluster_health_logs`
- **Time field**: `@timestamp`
- **Query**:

```json
{
  "query": {
    "bool": {
      "must": [
        { "range": { "@timestamp": { "gte": "now-5m" } } }
      ],
      "filter": [
        { "terms": { "status": ["yellow", "red"] } }
      ]
    }
  }
}
```

#### Étape 4: Configurer la Fréquence

- **Check every**: `1 minute`
- **Notify**: `Every time alert is active`

#### Étape 5: Définir les Actions

1. **Add action** → **Server log**
2. Message:

```
Alerte: Le cluster {{context.cluster.name}} est en état {{context.status}}!

Détails:
- Statut: {{context.status}}
- Nœuds: {{context.number_of_nodes}}
- Shards non assignés: {{context.unassigned_shards}}
- Date: {{context.date}}

Action requise: Vérifier l'état du cluster avec GET _cluster/health
```

#### Étape 6: Tester le Déclenchement

```bash
POST /cluster_health_logs/_doc
{
  "@timestamp": "2024-01-15T10:05:00Z",
  "status": "yellow",
  "cluster_name": "es-ops-training",
  "number_of_nodes": 3,
  "unassigned_shards": 5
}

POST /cluster_health_logs/_refresh
```

Attendez 1-2 minutes, puis vérifiez dans **Stack Management** → **Rules** → votre règle → onglet **History**.

### Partie B: Configuration d'Actions Avancées (Webhook et Index)

#### Étape 1: Créer un Service de Test pour Recevoir les Webhooks

1. Ouvrez https://webhook.site et notez l'URL unique générée

**Alternative locale**:
```bash
while true; do echo -e "HTTP/1.1 200 OK\n\n" | nc -l 8888; done
```

#### Étape 2: Créer le Connecteur Webhook dans Kibana

1. **Stack Management** → **Connectors** → **Create connector** → **Webhook**
2. Configuration:
   - **Connector name**: `ops-webhook-notifier`
   - **URL**: URL de webhook.site
   - **Method**: `POST`
   - **Headers**: `{"Content-Type": "application/json", "X-Alert-Source": "elasticsearch-ops"}`
3. Testez et sauvegardez

#### Étape 3: Créer un Connecteur Index Action

1. **Create connector** → **Index**
2. Configuration:
   - **Connector name**: `alert-history-index`
   - **Index**: `alert-history`
   - **Refresh**: `true`
   - **Time field**: `@timestamp`
3. Sauvegardez

#### Étape 4: Créer un Index de Simulation

```bash
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

#### Étape 5: Créer une Alerte avec Actions Multiples

1. Créez une règle `heap-usage-critical` de type **Elasticsearch query**
2. Index: `heap-monitoring`, Time field: `@timestamp`
3. Query pour détecter heap > 85%:

```json
{
  "query": {
    "bool": {
      "must": [
        { "range": { "@timestamp": { "gte": "now-5m" } } },
        { "range": { "heap_used_percent": { "gte": 85 } } }
      ]
    }
  }
}
```

4. Configurez l'action Webhook avec payload:

```json
{
  "alert_id": "{{alertId}}",
  "alert_name": "{{alertName}}",
  "alert_type": "heap_usage",
  "severity": "critical",
  "timestamp": "{{date}}",
  "context": {
    "condition": "Heap usage exceeded 85%"
  }
}
```

5. Configurez l'action Index pour archiver les alertes

#### Étape 6: Déclencher et Vérifier

```bash
POST /heap-monitoring/_doc
{
  "@timestamp": "2024-01-15T10:10:00Z",
  "node_id": "node-1",
  "node_name": "es-ops-node-1",
  "heap_used_percent": 92.5
}

POST /heap-monitoring/_refresh
```

Vérifiez les alertes indexées:

```bash
GET alert-history/_search
{
  "query": { "range": { "@timestamp": { "gte": "now-1h" } } },
  "sort": [{ "@timestamp": "desc" }]
}
```

### Partie C: Création d'Utilisateurs et de Rôles (RBAC)

#### Étape 1: Vérifier l'Utilisateur Actuel et Créer les Indices

```bash
GET /_security/_authenticate

PUT /logs-2024-01
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

POST /logs-2024-01/_bulk
{"index":{"_id":"1"}}
{"timestamp":"2024-01-15T10:00:00Z","level":"INFO","message":"Application started","service":"api"}
{"index":{"_id":"2"}}
{"timestamp":"2024-01-15T10:05:00Z","level":"WARN","message":"High memory usage","service":"api"}
{"index":{"_id":"3"}}
{"timestamp":"2024-01-15T10:10:00Z","level":"ERROR","message":"Database connection failed","service":"database"}
```

#### Étape 2: Créer les Rôles

```bash
# Rôle lecture seule sur logs
POST /_security/role/logs_readonly
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-*", "filebeat-*", "logstash-*"],
      "privileges": ["read", "view_index_metadata"]
    }
  ],
  "metadata": {
    "description": "Read-only access to logs indices"
  }
}

# Rôle développeur
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
  "metadata": {
    "description": "Developer with full access to dev/test indices"
  }
}
```

#### Étape 3: Créer des Utilisateurs

```bash
POST /_security/user/alice_reader
{
  "password": "ReadOnlyPass123!",
  "roles": ["logs_readonly"],
  "full_name": "Alice Reader",
  "email": "alice@example.com"
}

POST /_security/user/charlie_dev
{
  "password": "DevPass789!",
  "roles": ["developer"],
  "full_name": "Charlie Developer",
  "email": "charlie@example.com"
}
```

#### Étape 4: Tester les Permissions

```bash
# Lecture autorisée pour alice_reader
curl -u alice_reader:ReadOnlyPass123! "https://localhost:9200/logs-2024-01/_search?pretty"
# Résultat attendu: Succès (200 OK)

# Écriture NON autorisée pour alice_reader
curl -u alice_reader:ReadOnlyPass123! -X POST "https://localhost:9200/logs-2024-01/_doc" \
  -H 'Content-Type: application/json' \
  -d '{"timestamp":"2024-01-15T11:00:00Z","level":"INFO","message":"Test"}'
# Résultat attendu: Erreur 403 Forbidden
```

#### Étape 5: Implémenter Document-Level Security (DLS)

Créez des données multi-tenant:

```bash
PUT /orders
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
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
```

Créez un rôle avec DLS pour la sales team:

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

POST /_security/user/sarah_sales
{
  "password": "SalesPass123!",
  "roles": ["sales_team"],
  "full_name": "Sarah Sales",
  "email": "sarah@example.com"
}
```

Testez le filtrage DLS:

```bash
# sarah_sales ne voit que les commandes "sales" (3 sur 5)
curl -u sarah_sales:SalesPass123! "https://localhost:9200/orders/_count?pretty"
# Résultat attendu: {"count": 3}

# Même avec l'ID d'un document marketing, il est inaccessible
curl -u sarah_sales:SalesPass123! "https://localhost:9200/orders/_doc/3?pretty"
# Résultat attendu: 404 Not Found
```

Créez un rôle EMEA Manager (DLS par région):

```bash
POST /_security/role/emea_manager
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["orders"],
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

### Validation

```bash
# 1. Vérifier les rôles créés
GET /_security/role/logs_readonly,developer,sales_team,emea_manager

# 2. Vérifier les utilisateurs
GET /_security/user

# 3. Compter les alertes indexées
GET alert-history/_count
```

### Points Clés à Retenir

- **Kibana Rules** offrent une interface graphique pour créer des alertes sans JSON
- Les **connecteurs** sont réutilisables entre plusieurs règles
- Les **webhooks** permettent d'intégrer avec n'importe quel service externe
- L'**indexation des alertes** crée une base de données d'historique analysable
- Le **throttling** évite les alertes répétées (alert fatigue)
- **DLS filtre les documents** visibles selon une query Elasticsearch
- La query DLS est **transparente** pour l'utilisateur (documents invisibles comme s'ils n'existaient pas)
- Même avec `GET /_doc/{id}`, un document filtré retourne **404 Not Found**

---

## TP 11 - Architecture Avancée et Production

**Niveau**: Avancé
**Objectif**: Maîtriser les configurations avancées: shard allocation awareness, Snapshot Lifecycle Management, Field-Level Security, et architecture complète de production.

### Setup

Ce TP est autonome. Vérifiez que votre cluster est accessible et que les fonctionnalités de sécurité et snapshots sont disponibles.

### Partie A: Shard Allocation Awareness

#### Objectif

Configurer la "shard allocation awareness" pour répartir intelligemment les shards en fonction de zones de disponibilité et forcer la relocation de shards.

#### Étape 1: Définir des attributs personnalisés

Éditez `elasticsearch.yml` de chaque nœud:

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

Vérification:
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

#### Étape 2: Activer la shard allocation awareness

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": "zone"
  }
}
```

**Effet**: Elasticsearch évitera de placer un replica sur le même `zone` que son primaire.

#### Étape 3: Forcer l'allocation avec forced awareness

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": "zone",
    "cluster.routing.allocation.awareness.force.zone.values": "az1,az2,az3"
  }
}
```

**Différence**:
- `awareness`: Préférence, Elasticsearch réallouera ailleurs si nécessaire
- `forced awareness`: Strict, Elasticsearch refuse de réallouer si la zone cible n'est pas disponible

#### Étape 4: Créer un index et vérifier la distribution

```bash
PUT /zone-aware-index
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}

GET /_cat/shards/zone-aware-index?v&h=index,shard,prirep,state,node
```

**Observation**: Pour chaque shard primaire, son replica est sur un nœud avec un `zone` différent.

#### Étape 5: Forcer la relocation d'un shard

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

**Suivi de la relocation**:
```bash
GET /_cat/recovery/zone-aware-index?v&h=index,shard,stage,source_node,target_node
```

#### Étape 6: Exclure un nœud de l'allocation (maintenance)

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

### Partie B: Snapshot Lifecycle Management (SLM)

#### Objectif

Automatiser la création et le nettoyage de snapshots avec des politiques SLM, incluant la rétention automatique et la planification flexible.

#### Setup de cette partie

Vérifiez qu'un repository existe:

```bash
GET /_snapshot/my_backup
```

Si le repository n'existe pas:

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

Créez des indices de test:

```bash
PUT /orders-2024-01
PUT /orders-2024-02
PUT /payments-2024-01
PUT /analytics-2024-q1
PUT /logs-2024-01-15

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

#### Étape 1: Politique SLM pour Indices Transactionnels (Critiques)

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

**Explication**:
- `schedule: "0 0 2 * * ?"`: Expression cron pour 2h00 tous les jours
- `name: "<critical-{now/d}>"`: Template générant `critical-2024-01-15`
- `expire_after: "90d"`: Supprimer les snapshots de plus de 90 jours
- `min_count: 30`: Toujours garder au moins 30 snapshots
- `max_count: 120`: Ne jamais dépasser 120 snapshots

#### Étape 2: Politique SLM pour Indices Analytiques (Hebdomadaire)

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

#### Étape 3: Politique SLM pour Logs (Quotidien, Courte Rétention)

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

#### Étape 4: Lister les Politiques et Exécuter Manuellement

```bash
# Lister toutes les politiques
GET /_slm/policy

# Exécuter manuellement pour test
POST /_slm/policy/daily-critical-backup/_execute
POST /_slm/policy/weekly-analytics-backup/_execute
POST /_slm/policy/daily-logs-backup/_execute

# Vérifier les snapshots créés
GET /_snapshot/my_backup/_all
```

#### Étape 5: Consulter les Statistiques

```bash
GET /_slm/policy/daily-critical-backup
GET /_slm/stats
```

#### Étape 6: Tester la Rétention et Gérer SLM

```bash
# Forcer l'exécution de la rétention
POST /_slm/_execute_retention

# Désactiver SLM (pour maintenance)
POST /_slm/stop

# Vérifier le statut
GET /_slm/status

# Réactiver
POST /_slm/start

# Supprimer une politique (ne supprime pas les snapshots existants)
DELETE /_slm/policy/weekly-analytics-backup
```

### Partie C: Field-Level Security (FLS) pour Masquer des Champs Sensibles

#### Objectif

Implémenter la sécurité au niveau des champs pour cacher des données sensibles selon les rôles.

#### Étape 1: Créer un Index d'Employés Enrichi

```bash
PUT /employees_full
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
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

POST /employees_full/_bulk
{"index":{"_id":"1"}}
{"employee_id":"EMP-001","name":"Alice Johnson","department":"sales","position":"Sales Manager","hire_date":"2020-01-15","email_corporate":"alice.johnson@company.com","email_personal":"alice.j@gmail.com","phone_work":"+33-1-23-45-67-89","phone_personal":"+33-6-12-34-56-78","address":{"street":"10 Rue de Rivoli","city":"Paris","country":"France","postal_code":"75001"},"ssn":"123-45-6789","salary":75000,"performance_review":{"rating":"excellent","comments":"Top performer","reviewer":"Director Sales"},"disciplinary_notes":null}
{"index":{"_id":"2"}}
{"employee_id":"EMP-002","name":"Bob Smith","department":"hr","position":"HR Specialist","hire_date":"2021-03-20","email_corporate":"bob.smith@company.com","email_personal":"bob.smith@yahoo.com","phone_work":"+33-1-98-76-54-32","phone_personal":"+33-6-98-76-54-32","address":{"street":"25 Avenue des Champs","city":"Lyon","country":"France","postal_code":"69001"},"ssn":"987-65-4321","salary":60000,"performance_review":{"rating":"good","comments":"Solid contributor","reviewer":"HR Director"},"disciplinary_notes":"Late arrival incident - 2023-05-10"}
{"index":{"_id":"3"}}
{"employee_id":"EMP-003","name":"Charlie Brown","department":"engineering","position":"Senior Engineer","hire_date":"2019-05-10","email_corporate":"charlie.brown@company.com","email_personal":"cbrown@outlook.com","phone_work":"+33-1-11-22-33-44","phone_personal":"+33-6-11-22-33-44","address":{"street":"5 Boulevard Saint-Germain","city":"Paris","country":"France","postal_code":"75005"},"ssn":"555-12-3456","salary":95000,"performance_review":{"rating":"excellent","comments":"Technical leader","reviewer":"CTO"},"disciplinary_notes":null}
```

#### Étape 2: Créer un Rôle "Public" avec FLS Restrictif

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
  ]
}
```

**Champs accordés**: ID, nom, département, poste, date d'embauche, email pro, téléphone pro
**Champs cachés**: SSN, salaire, adresse, emails/téléphones persos, évaluations, notes disciplinaires

#### Étape 3: Créer un Rôle "HR Team" avec FLS Modéré

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
  ]
}
```

**Utilisation de wildcards**:
- `email_*`: Accorde `email_corporate` ET `email_personal`
- `address.*`: Accorde tous les sous-champs de `address`
- `except`: Exclut explicitement `ssn` et `disciplinary_notes`

#### Étape 4: Créer un Rôle "HR Manager" avec Accès Complet

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
  ]
}
```

#### Étape 5: Créer des Utilisateurs et Tester

```bash
POST /_security/user/intern_view
{
  "password": "InternPass123!",
  "roles": ["employee_public_view"],
  "full_name": "Intern Viewer"
}

POST /_security/user/jane_hr
{
  "password": "HRPass456!",
  "roles": ["hr_team_view"],
  "full_name": "Jane HR Specialist"
}

POST /_security/user/susan_hrmanager
{
  "password": "ManagerPass789!",
  "roles": ["hr_manager_full"],
  "full_name": "Susan HR Manager"
}
```

**Tester vue publique (intern) - 7 champs seulement**:
```bash
curl -u intern_view:InternPass123! "https://localhost:9200/employees_full/_search?pretty"
```

**Tester vue HR team - tout sauf ssn et disciplinary_notes**:
```bash
curl -u jane_hr:HRPass456! "https://localhost:9200/employees_full/_doc/1?pretty"
```

**Tester vue HR manager - tous les champs**:
```bash
curl -u susan_hrmanager:ManagerPass789! "https://localhost:9200/employees_full/_doc/2?pretty"
```

**Les agrégations respectent également FLS**:
```bash
# intern_view n'a pas accès à salary → agrégation vide/erreur
curl -u intern_view:InternPass123! -X GET "https://localhost:9200/employees_full/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{"size":0,"aggs":{"avg_salary":{"avg":{"field":"salary"}}}}'

# jane_hr a accès à salary → résultat correct
curl -u jane_hr:HRPass456! -X GET "https://localhost:9200/employees_full/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{"size":0,"aggs":{"avg_salary":{"avg":{"field":"salary"}}}}'
```

#### Étape 6: Combiner DLS + FLS

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
  ]
}

POST /_security/user/sales_viewer
{
  "password": "SalesView123!",
  "roles": ["sales_dept_restricted"]
}
```

Test DLS + FLS combinés:
```bash
curl -u sales_viewer:SalesView123! "https://localhost:9200/employees_full/_search?pretty"
```
**Résultat attendu**: 1 seul document (EMP-001, seul employé "sales"), avec champs limités.

### Partie D: Architecture Complète de Production

#### Dimensionnement pour 500 GB/jour, rétention 90 jours

**Calcul de stockage**:
- 500 GB/jour × 90 jours = 45 TB total
- Hot tier (7 jours): 3.5 TB
- Warm tier (30 jours): 15 TB
- Cold tier (53 jours): 26.5 TB

**Dimensionnement nœuds**:

| Tier | Nœuds | RAM | CPU | Disque | Total Disque |
|------|-------|-----|-----|--------|--------------|
| Master | 3 | 8 GB | 4 cores | 100 GB | 300 GB |
| Hot | 6 | 32 GB | 16 cores | 1 TB SSD | 6 TB |
| Warm | 4 | 16 GB | 8 cores | 5 TB HDD | 20 TB |
| Cold | 3 | 8 GB | 4 cores | 12 TB HDD | 36 TB |

**Total**: 16 nœuds

#### Architecture multi-zone (schéma textuel)

```
ZONE A                           ZONE B
  Master-A1                        Master-B1
  Master-A2                        Master-B2

HOT TIER (SSD, 7 jours)
  Hot-A1  Hot-A2    Hot-B1  Hot-B2  Hot-B3  Hot-A3

WARM TIER (HDD, 30 jours)
  Warm-A1  Warm-A2    Warm-B1  Warm-B2

COLD TIER (Searchable Snapshots, 53 jours)
  Cold-A1    Cold-B1  Cold-B2
```

#### Configuration ILM Policy de Production

```bash
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
          "set_priority": { "priority": 100 }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "set_priority": { "priority": 50 },
          "migrate": { "enabled": true },
          "shrink": { "number_of_shards": 1 },
          "forcemerge": { "max_num_segments": 1 },
          "readonly": {}
        }
      },
      "cold": {
        "min_age": "37d",
        "actions": {
          "set_priority": { "priority": 0 },
          "migrate": { "enabled": true },
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

#### Configuration Index Template de Production

```bash
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
        "@timestamp": { "type": "date" },
        "message": { "type": "text" },
        "level": { "type": "keyword" },
        "service": { "type": "keyword" },
        "host": { "type": "keyword" }
      }
    }
  },
  "priority": 500
}
```

#### Configuration SLM de Production

```bash
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

#### Checklist de Validation Architecture Production

- **Sizing**: Calculé selon charges réelles (500 GB/jour)
- **HA**: Multi-zone, répliques, quorum masters (3 dédiés)
- **Performance**: Hot tier SSD, shards < 50 GB
- **Coûts**: Warm/Cold HDD pour archives, Cold via Searchable Snapshots S3
- **Lifecycle**: ILM automatisé (hot→warm→cold→delete en 90 jours)
- **Backups**: SLM quotidien, rétention 7 jours (données protégées par ILM)
- **Security**: RBAC, TLS, DLS/FLS si requis, audit logging
- **Monitoring**: Alertes critiques (health, heap, disk, thread pool rejections)
- **Documentation**: Architecture diagrams, runbooks DR

### Points Clés à Retenir

- **Allocation awareness** garantit la résilience aux pannes de zone
- `awareness` est une préférence, `forced awareness` est strict
- **SLM automatise** la création et le nettoyage de snapshots
- Les expressions cron définissent une planification flexible
- **FLS cache complètement les champs** (comme s'ils n'existaient pas)
- `grant` liste les champs autorisés, `except` liste les champs exclus
- **DLS + FLS combinés** offrent une protection multicouche
- Les agrégations sur champs cachés par FLS retournent vide ou erreur
- Même avec `GET /_doc/{id}`, les champs cachés sont absents du `_source`
- **Architecture hot-warm-cold** optimise les coûts avec SSD uniquement pour données actives
- Dimensionnement basé sur charges réelles et croissance prévisible
- **Tests réguliers** (DR, load testing) valident l'architecture en production
