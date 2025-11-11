## Lab 1.3: Agrégations de Données

**Topic**: Concepts Généraux - Agrégations
**Durée Estimée**: 20-25 minutes
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
      "count": 4,
      "min": 0,
      "max": 2100,
      "avg": 1060,
      "sum": 4240
    },
    "avg_views": {
      "value": 1060
    },
    "max_views": {
      "value": 2100
    }
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
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "Jean Dupont",
          "doc_count": 2
        },
        {
          "key": "Marie Martin",
          "doc_count": 1
        },
        {
          "key": "Test User",
          "doc_count": 1
        }
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

