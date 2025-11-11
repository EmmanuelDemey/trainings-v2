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

