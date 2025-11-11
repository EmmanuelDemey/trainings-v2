---
layout: cover
---

# Présentation Générale

Fondamentaux des moteurs de recherche et concepts Elasticsearch

---

# Objectifs d'Apprentissage

À la fin de cette section, vous serez capable de:

- Expliquer le fonctionnement d'un moteur de recherche et ses cas d'usage
- Comprendre les mécanismes d'indexation et la structure de l'index inversé
- Configurer des mappings pour différents types de données
- Utiliser les agrégations pour analyser vos données

---

# Qu'est-ce qu'un Moteur de Recherche ?

Un moteur de recherche est un système conçu pour effectuer des recherches rapides et pertinentes sur de grands volumes de données.

**Caractéristiques principales**:
- Indexation préalable des documents pour des recherches ultra-rapides
- Analyse du texte pour comprendre la sémantique
- Scoring de pertinence pour classer les résultats
- Capacité à gérer des données structurées et non-structurées

**Cas d'usage courants**:
- Recherche full-text dans des applications
- Analyse de logs et métriques
- E-commerce (recherche de produits)
- Recherche d'entreprise (intranet, documentation)

---

# Elasticsearch: Un Moteur de Recherche Distribué

Elasticsearch est un moteur de recherche [open-source basé sur Lucene](https://www.elastic.co/guide/en/elasticsearch/reference/current/elasticsearch-intro.html), optimisé pour la scalabilité et la rapidité.

**Avantages d'Elasticsearch**:
- **Distribué**: Scalabilité horizontale via sharding
- **RESTful**: API HTTP simple et universelle
- **JSON natif**: Format de données standard
- **Temps réel**: Recherche quasi-instantanée après indexation
- **Analyse avancée**: Agrégations puissantes pour l'analytique

**Écosystème Elastic Stack**:
- **Elasticsearch**: Moteur de recherche et d'analyse
- **Kibana**: Interface de visualisation
- **Beats**: Collecteurs de données légers
- **Logstash**: Pipeline de traitement de données

---

# Recherche vs Requêtes de Base de Données

| Aspect | Base de Données Relationnelle | Moteur de Recherche |
|--------|------------------------------|---------------------|
| **Requêtes** | SQL exact (= , >, <) | Recherche floue, full-text |
| **Performance** | JOIN coûteux sur gros volumes | Recherche très rapide sur texte |
| **Pertinence** | Pas de notion de score | Scoring de pertinence |
| **Structure** | Schéma strict (tables, colonnes) | Schéma flexible (JSON) |
| **Cas d'usage** | Transactions, relations | Recherche, analyse, logs |

---

# Quand utiliser Elasticsearch ?

- Recherche full-text avec typos, synonymes
- Analyse de logs et métriques
- Filtrage complexe + agrégations
- Recherche géospatiale

---

# L'Index Inversé: Cœur d'Elasticsearch

Un [index inversé](https://www.elastic.co/guide/en/elasticsearch/reference/current/documents-indices.html) est une structure de données qui mappe les termes aux documents qui les contiennent.

**Exemple avec 3 documents**:
- Doc 1: "Elasticsearch est rapide"
- Doc 2: "Kibana visualise Elasticsearch"
- Doc 3: "Logstash envoie vers Elasticsearch"

**Index inversé résultant**:
```
elasticsearch → [1, 2, 3]
rapide       → [1]
kibana       → [2]
visualise    → [2]
logstash     → [3]
envoie       → [3]
```

Chercher "elasticsearch" retourne instantanément docs 1, 2, 3 !

---

# Processus d'Indexation

## 1. Analyse du Texte

Transformation du texte brut en termes indexables via des [analyzers](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis.html):

```json
"Elasticsearch est RAPIDE !" 
  → Tokenization → ["Elasticsearch", "est", "RAPIDE"]
  → Lowercase    → ["elasticsearch", "est", "rapide"]
  → Stop words   → ["elasticsearch", "rapide"]
```

## 2. Création de l'Index Inversé

Chaque terme analysé est ajouté à l'index inversé avec:
- **Position** dans le document
- **Fréquence** du terme (TF - Term Frequency)
- **Métadonnées** pour le scoring

---

# Cycle de Vie d'un Document

**Étapes clés**:
1. **Réception**: Document JSON via API REST
2. **Analysis**: Tokenization et normalisation du texte
3. **Indexation**: Ajout à l'index inversé
4. **Écriture en mémoire**: Buffer en RAM
5. **Refresh**: Disponible pour recherche (défaut: 1s)
6. **Flush**: Persiste sur disque (fsync)

**Paramètre important**: `index.refresh_interval` (défaut: `1s`)

[Documentation sur l'indexation](https://www.elastic.co/guide/en/elasticsearch/reference/current/near-real-time.html)

---

# API d'Indexation de Documents

**Indexer un document unique**:
```bash
POST /my-index/_doc/1
{
  "title": "Introduction à Elasticsearch",
  "author": "Emmanuel DEMEY",
  "date": "2025-11-10",
  "views": 1250
}
```

**Résultat attendu**:
```json
{
  "_index": "my-index",
  "_id": "1",
  "_version": 1,
  "result": "created"
}
```

Plus d'infos: [Index API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html)

---

# Bulk API pour Indexation Massive

L'[API Bulk](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html) permet d'indexer plusieurs documents en une seule requête:

```bash
POST /_bulk
{ "index": { "_index": "my-index", "_id": "1" }}
{ "title": "Doc 1", "content": "..." }
{ "index": { "_index": "my-index", "_id": "2" }}
{ "title": "Doc 2", "content": "..." }
```

**Avantages**:
- ✅ Réduction de la latence réseau (une requête au lieu de N)
- ✅ Meilleure utilisation des ressources
- ✅ Throughput d'indexation beaucoup plus élevé

**Bonne pratique**: Batches de 5-15 MB ou 1000-5000 documents.

---

# Mapping: Le Schéma Elasticsearch

Le [mapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html) définit la structure des documents et le type de chaque champ.

**Exemple de mapping**:
```json
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "author": { "type": "keyword" },
      "date": { "type": "date" },
      "views": { "type": "integer" },
      "location": { "type": "geo_point" }
    }
  }
}
```

**Pourquoi le mapping est important ?**
- Détermine comment les données sont indexées et recherchables
- Optimise le stockage et les performances
- Permet des fonctionnalités avancées (geo-search, range queries)

---

# Types de Champs Principaux

| Type | Usage | Exemple |
|------|-------|---------|
| **text** | Recherche full-text (analysé) | Articles, descriptions |
| **keyword** | Filtrage exact, agrégations | Statuts, tags, IDs |
| **date** | Dates et timestamps | `"2025-11-10"`, `1699632000000` |
| **long/integer** | Nombres entiers | Âges, compteurs |
| **float/double** | Nombres décimaux | Prix, coordonnées |
| **boolean** | Vrai/faux | Flags, états |
| **geo_point** | Coordonnées géographiques | `{"lat": 48.8566, "lon": 2.3522}` |
| **object** | Objet JSON imbriqué | Adresses, métadonnées |

Documentation complète: [Field types](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html)

---

# Mapping Dynamique vs Explicite

## Mapping Dynamique

Elasticsearch détecte automatiquement le type des champs:
```json
POST /auto-index/_doc/1
{ "name": "Test", "count": 42 }
```
Résultat: `name` → `text+keyword`, `count` → `long`

**Avantages**: Rapide pour prototyper
**Inconvénients**: Peut mal deviner le type (dates en string, etc.)

--- 

# Mapping Dynamique vs Explicite

## Mapping Explicite

Définir manuellement les types pour contrôler l'indexation:
```json
PUT /my-index
{
  "mappings": {
    "properties": {
      "name": { "type": "keyword" },
      "count": { "type": "integer" }
    }
  }
}
```

**Bonne pratique**: Toujours définir le mapping explicitement en production !

---

# Paramètres de Mapping Importants

```json
{
  "properties": {
    "description": {
      "type": "text",
      "analyzer": "french",
      "fields": { "keyword": { "type": "keyword" } }
    },
    "status": {
      "type": "keyword", "ignore_above": 256
    },
    "metadata": {
      "type": "object", "enabled": false
    }
  }
}
```

**Paramètres clés**:
- `analyzer`: Définit comment le texte est analysé
- `fields`: Multi-fields (même donnée, plusieurs types)
- `ignore_above`: Ignore les strings trop longues
- `enabled`: Active/désactive l'indexation d'un champ

---

# Agrégations: Analyser vos Données

Les [agrégations](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html) permettent d'extraire des statistiques et d'analyser les données indexées.

**3 types principaux**:
1. **Metrics**: Calculs statistiques (avg, sum, max, min)
2. **Bucket**: Regroupements de documents (terms, histogram, date_histogram)
3. **Pipeline**: Agrégations sur d'autres agrégations

**Analogie SQL**:
```sql
SELECT category, COUNT(*), AVG(price)
FROM products
GROUP BY category
```
≈ Agrégation `terms` sur `category` avec metrics `count` et `avg`

---

# Agrégations Metrics

Calculs statistiques sur des valeurs numériques:

```bash
GET /products/_search
{
  "size": 0,
  "aggs": {
    "avg_price": {
      "avg": { "field": "price" }
    },
    "max_price": {
      "max": { "field": "price" }
    },
    "stats_price": {
      "stats": { "field": "price" }
    }
  }
}
```

---

# Agrégations Metrics

**Résultat**:
```json
{
  "aggregations": {
    "avg_price": { "value": 49.99 },
    "max_price": { "value": 199.99 },
    "stats_price": {
      "count": 1000,
      "min": 9.99,
      "max": 199.99,
      "avg": 49.99,
      "sum": 49990.0
    }
  }
}
```

---

# Agrégations Bucket: Terms

Regrouper documents par valeur de champ (comme `GROUP BY`):

```bash
GET /logs/_search
{
  "size": 0,
  "aggs": {
    "status_counts": {
      "terms": {
        "field": "status.keyword",
        "size": 10
      }
    }
  }
}
```

---

# Agrégations Bucket: Terms


**Résultat**:
```json
{
  "aggregations": {
    "status_counts": {
      "buckets": [
        { "key": "success", "doc_count": 8500 },
        { "key": "error", "doc_count": 1200 },
        { "key": "warning", "doc_count": 300 }
      ]
    }
  }
}
```

**Cas d'usage**: Top N, distribution de valeurs

---

# Agrégations Bucket: Histogram

Répartition de valeurs numériques par intervalles:

```bash
GET /products/_search
{
  "size": 0,
  "aggs": {
    "price_ranges": {
      "histogram": {
        "field": "price",
        "interval": 50
      }
    }
  }
}
```

---

# Agrégations Bucket: Histogram

**Résultat**:
```json
{
  "aggregations": {
    "price_ranges": {
      "buckets": [
        { "key": 0.0, "doc_count": 120 },
        { "key": 50.0, "doc_count": 450 },
        { "key": 100.0, "doc_count": 300 },
        { "key": 150.0, "doc_count": 130 }
      ]
    }
  }
}
```

**Cas d'usage**: Histogrammes de prix, distributions de temps de réponse

---

# Agrégations Imbriquées

Combiner plusieurs agrégations pour des analyses complexes:

```bash
GET /sales/_search
{
  "size": 0,
  "aggs": {
    "by_category": {
      "terms": { "field": "category.keyword" },
      "aggs": {
        "avg_price": { "avg": { "field": "price" } },
        "total_revenue": { "sum": { "field": "revenue" } }
      }
    }
  }
}
```

**Résultat**: Pour chaque catégorie, prix moyen ET revenu total.

**Puissance**: Permet des analyses multi-dimensionnelles similaires à OLAP.

---

# Pipeline Aggregations

Agrégations qui opèrent sur les résultats d'autres agrégations:

```bash
GET /sales/_search
{
  "size": 0,
  "aggs": {
    "sales_per_month": {
      "date_histogram": {
        "field": "date",
        "calendar_interval": "month"
      },
      "aggs": {
        "total_sales": { "sum": { "field": "amount" } }
      }
    },
    "avg_monthly_sales": {
      "avg_bucket": {
        "buckets_path": "sales_per_month>total_sales"
      }
    }
  }
}
```

**Cas d'usage**: Dérivées, moyennes mobiles, détection d'anomalies

Plus d'infos: [Pipeline aggregations](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline.html)

---

# Résumé

## Points Clés

- Un moteur de recherche utilise un **index inversé** pour des recherches ultra-rapides
- L'**indexation** transforme les documents JSON via analysis et les rend recherchables
- Le **mapping** définit la structure et le type des champs (text, keyword, date, etc.)
- Les **agrégations** permettent d'analyser les données (metrics, buckets, pipelines)

## Concepts Importants

- **Index inversé**: Terme → Liste de documents
- **Mapping dynamique vs explicite**: Automatique vs contrôlé
- **Multi-fields**: Un champ, plusieurs types (ex: text + keyword)
- **Agrégations imbriquées**: Analyses multi-dimensionnelles

---

# Exercices Pratiques

Passez maintenant au **cahier d'exercices** pour mettre en pratique ces concepts.

**Labs à réaliser**:
- Lab 1: Interactions Initiales avec les APIs

**Ces exercices couvrent**:
- Indexation de documents avec l'API REST
- Création de mappings personnalisés
- Requêtes de recherche simples
- Agrégations de base pour analyser les données
