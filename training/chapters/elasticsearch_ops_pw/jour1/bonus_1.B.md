## 🌟 Bonus 1.B: Mappings Nested et Parent-Child

**Niveau**: Avancé
**Durée Estimée**: 20-25 minutes
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

