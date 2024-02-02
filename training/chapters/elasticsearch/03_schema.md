---
layout: cover
---

# Le Mapping

---

# Le Mapping

* Le Mapping est la représentation qu'a Elasticsearch de vos données
* Lors de l'indexation du premier document, Elasticsearch génère un mapping
* Souvent, ce mapping n'est pas optimal et nécessite d'être optimisé.
* Dans ce mapping, nous allons pouvoir :
    * Définir les types des propriétés des documents
    * Est-ce que ces propriétés doivent être ignorées et/ou indexées ?
    * Si elles sont indexées, de quelle façon?

--- 

# Le Mapping

* Un mapping peut se définir à la création de l'index

```
PUT /movies
{
  "mappings": {
    "properties": {
      "title":    { "type": "text" },
      "year":  { "type": "number"  },
      "directors":   { "type": "text"  }
    }
  }
}
```

---

# Le Mapping

* Nous pouvons également modifier un mapping.
* Attention en fonction des modification apportées, cela nécessitera une reindexation

```
PUT /movies/_mapping
{
  "properties": {
    "dialogues": {
      "type": "text"
    }
  }
}
```

---

# Le Mapping

* Nous pouvons récupérer un mapping

```
GET /movies/_mapping
```

* Sa suppression se fera lors de la suppression de l'index

```
DELETE /movies
```

---

# Les types supportés

* text, keyword, boolean et date
* object, nested, arrays, range
* geo-point, geo-shape
* ip
* ...

---

# La propriété index

* Cette propriété permet d'indiquer si une propriété doit être indexée
* Si c'est le cas, nous pourrons l'utiliser dans nos recherches
* Souvent, toutes les propriétés ne sont pas utiles à la recherche
* Il est donc recommandé de bien optimiser votre mapping

---

# La propriété index

```
PUT movies
{
  "mappings": {
    "properties": {
      "dialogues": {
        "type": "text",
        "index": false
      }
    }
  }
}
```

---

# Stockage du document d'origine

* Par défaut, le document indexé est récupérable via la propriété `_source`
* Pour des raisons de performance et d'espace disque utilisé, vous pouvez désactiver cet objet

```
PUT movies
{
  "mappings": {
    "_source": {
      "enabled": false
    }
  }
}
```

* Attention, désactiver la source rend impossible certaines opérations (simple get, update, update_by_query, reindex)

---

# La propriété fields

* Il est possible d'indexer une propriété de différentes façons
    * pour gérer l'internationalisation
    * pour pouvoir faire des agrégations
    * pour réaliser des requêtes full-text, des filtres, de l'auto-complete... sur la même propriété
    * ...

---

# La propriété fields

* Pour cela nous allons définir des `fields`

```
PUT movies
{
  "mappings": {
    "properties": {
      "directors": {
        "type": "text",
        "fields": {
          "keyword": {
            "type":  "keyword"
          }
        }
      }
    }
  }
}
```

---

# La propriété fields

* Nous pourrons ainsi faire des recherches sur la propriété `directors` et `directors.keyword`

```
POST movies/_search
{
    "query": {
        "match":{
            "directors": "Charlie"
        }
    }
}
```

```
POST movies/_search
{
    "query": {
        "match":{
            "directors.keyword": "Charlie Chaplin"
        }
    }
}
```

---

# Object versus Nested

* Il est possible de définir des propriétes de type `Object`

```
PUT movies
{
  "mappings": {
    "properties": {
      "directors": {
        "properties": {
            "firstName" : { ... },
            "lastName" : { ... }
        }
      }
    }
  }
}
```

---

# Object versus Nested

* Un problème survient quand nous avons un tableau d'objets.
* Imaginons que notre film a été tourné par plusieurs réalisateurs

```
POST /movies/_doc
{
    "directors": [
        {"firstName": "Charlie", "lastName": "Chaplin"},
        {"firstName": "Buster", "lastName": "Keaton"},
    ]
}
```

---

# Object versus Nested

* Elasticsearch traduit cette structure dans une nouvelle représentation

```
{
    "directors.firstName": ["Charlie", "Buster"],
    "directors.lastName": ["Chaplin", "Keaton"],
}
```

---

# Object versus Nested

* Nous perdons ainsi les relations entre les propriétés
* Ce qui pourrait avoir un impact sur les recherches exécutées
* Par exemple, la recherche suivante retournerait le film précédent

```
POST movies/_search
{
    "query" {
        "bool":{
            "must": [
                { "match": {"directors.firstName": "Charlie" }},
                { "match": {"directors.lastName": "Keaton" }}
            ]
        }
    }
}
```

---

# Object versus Nested

* Pour éviter de perdre ces relations, nous pouvons utiliser le type `nested`.

```
PUT movies
{
  "mappings": {
    "properties": {
      "directors": {
        "type": "nested",
        "properties": {
            "firstName" : { ... },
            "lastName" : { ... }
        }
      }
    }
  }
}
```

---

# Dynamic Templates

* Il existe une API permettant de définir des templates dynamiques
* Nous ne la recommandons pas car seul vous connaissez la structure de vos données

```
PUT movies
{
  "mappings": {
    "dynamic_templates": [
      {
        "strings": {
          "match_mapping_type": "string",
          "mapping": {
            "type": "text",
            "fields": {
              "keyword": {
                "type":  "keyword",
                "ignore_above": 256
              }
            }
          }
        }
      }
    ]
  }
}
```

---
layout: cover
---
# Partie Pratique
