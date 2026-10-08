# TP 3 — Agrégations

> Utiliser les agrégations Elasticsearch pour extraire des statistiques et analyser les données sans récupérer tous les documents.

**Topic**: Concepts Généraux - Agrégations

## Contexte

L'équipe analytics souhaite obtenir des statistiques sur les articles de blog: moyenne des vues, distribution par auteur, tendance temporelle des publications, et meilleurs articles par rating.

## Setup

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

## Exercice

### Étape 1: Agrégation Metrics - Statistiques sur les vues

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

### Étape 2: Agrégation Bucket - Distribution par auteur (Terms)

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

### Étape 3: Agrégation Bucket - Histogramme temporel (Date Histogram)

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

### Étape 4: Agrégations Imbriquées - Stats par auteur

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

### Étape 5: Pipeline Aggregation - Moyenne des moyennes

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

## Critères de Succès

- Stats aggregation retourne min, max, avg, sum des vues
- Terms aggregation par auteur retourne les bons comptes
- Date histogram groupe les articles par mois
- Agrégations imbriquées retournent stats par auteur
- Pipeline aggregation calcule la moyenne des moyennes

## Dépannage

**Problème**: "fielddata is disabled on text fields"
→ Utilisez le sous-champ `.keyword` pour agréger: `"field": "title.keyword"`

**Problème**: Résultats d'agrégation vides
→ Vérifiez que des documents existent: `GET /blog_posts/_count`

**Problème**: Pipeline aggregation retourne null
→ Vérifiez que `buckets_path` pointe vers la bonne agrégation parent>child
