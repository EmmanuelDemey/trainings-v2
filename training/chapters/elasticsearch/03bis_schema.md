---
layout: cover
---
# Les Analyzers

---

# Les Analyzers

* À chaque propriété de type `text`, la valeur sera analysée par Elasticsearch.
* Cette phase `analyze` est composée de trois étapes :
    * Les Char Filters
    * Le Tokenizer
    * Les Token Filters
* Suite à la phase d'analyse, le résultat est placé dans un index inversé

---

# Les Analyzers

![](/images/analyzer.png)

---

# Les Char Filters

* Les *Char Filters* permettent de modifier le texte d'origine en supprimant, modifiant ou ajoutant des caractères.
* Nous pouvons configurer plusieurs `Char Filters` pour un analyzer
* Chaque implémentation est configurable

---

# Les Char Filters

* Seuls trois *Char Filters* sont disponibles :
  
* `HTML Strip`

```
<p>I&apos;m so <b>happy</b>!</p
-> \nI'm so happy!\n
```

* `Mapping`

```
My license plate is ٢٥٠١٥
-> My license plate is 25015
```

* `Pattern Replace`

```
My credit card is 123-456-789
-> My credit card is 123_456_789
```
---

# Les Tokenizers

* Un tokenizer permet de définir comment le texte doit etre découpé.
* Nous avons un token en entrée, et 0+ en sortie
* Nous ne pouvons configurer qu'un seul Tokenizer pour un analyzer
* Chaque implémentation est configurable
* De nombreux tokenizers sont disponibles nativement

---

# Les Tokenizers

* Whitespace tokenizer

```
The 2 QUICK Brown-Foxes jumped over the lazy dog's bone.

-> [ The, 2, QUICK, Brown-Foxes, jumped, over, the, lazy, dog's, bone. ]
```

* Letter tokenizer

```
The 2 QUICK Brown-Foxes jumped over the lazy dog's bone.

-> [ The, QUICK, Brown, Foxes, jumped, over, the, lazy, dog, s, bone ]
```

* Path Hierarchy tokenizer

```
/one/two/three

-> [ /one, /one/two, /one/two/three ]
```

* N-gram tokenizer

```
Quick

-> [ Q, Qu, u, ui, i, ic, c, ck, k]
```

---

# Les Token Filters

* Un token filter permet de modifier, supprimer ou ajouter des tokens à la liste précédemment créée
* Utilisé pour supprimer les mots communs, gérer les synonymes, les conjugaisons, les accents, la casse ...
* Nous pouvons configurer plusieurs Token Filters pour un analyzer
* Chaque implémentation est configurable
* De nombreux token filters sont disponibles nativement

---

# Les Token Filters

* Stop token filter

```
a quick fox jumps over the lazy dog

-> [ quick, fox, jumps, over, lazy, dog ]
```

* Ascii folding token filter

```
açaí à la carte

-> [ acai, a, la, carte ]
```

* Stemmer token filter

```
développeuse

-> developeu
```

* Synonym token filter

```
a quick fox jumps over the lazy dog

-> [ quick, fox, jumps, over, lazy, dog, hound ]
```

---

# Les Analyzers custom

* A partir de ces éléments, nous pouvons créer nos propres Analyzer
* Et ensuite les associer à certains champs de nos documents
* Un analyzer peut être défini pour l'indexation et pour la recherche
* Par défaut, celui de l'indexation est également utilisé pour la recherche

---

# Les Analyzers custom

```
PUT movies
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "char_filter": [
            "html_strip"
          ],
          "filter": [
            "lowercase",
            "asciifolding"
          ]
        }
      }
    }
  }
}
```

---

# Les Analyzers custom

```
PUT movies
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "my_custom_analyzer"
      }
    }
  }
}
```

---

# Les Analyzers built-in

* Vous pouvez également utiliser les analyzer built-in
    * `Keyword`,
    * `Standard`
    * `Language`
    * ...

```
PUT movies
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "french"
      }
    }
  }
}
```

---

# Les Analyzers

![](/images/analyzer_example.png)

---

# Les Analyzers

![](/images/analyzer3.png)

---

# Modification du Mapping

* Si le mapping change, une réindexation complète des données est nécessaire.
* Bonne pratique : utiliser un alias afin d'éviter de changer le code applicatif
* Reindexation via un système de batch ou via la _reindex_ API

---

# Modification du Mapping

![](/images/reindex1.png)

---

# Modification du Mapping

![](/images/reindex2.png)

---

# Modification du Mapping

![](/images/reindex3.png)

---

# Configuration de l'alias

```
POST /_aliases
{
    "actions": [
        {
            "remove": {
                "alias": "movies",
                "index": "movies_v1"
            }
        },
        {
            "add": {
                "alias": "movies",
                "index": "movies_v2"
            }
        }
    ]
}
```

---

# Reindex API

* Nous pouvons reindexer un index complet

```
POST _reindex
{
  "source": {
    "index": "movies_v1"
  },
  "dest": {
    "index": "movies_v2"
  }
}
```

---

# Reindex API

* Mais également une partie en définissant une requête de recherche

```
POST _reindex
{
  "source": {
    "index": "movies_v1",
    "query": {
      "term": {
        "year": 2010
      }
    }
  },
  "dest": {
    "index": "movies_v2"
  }
}
```

---

# Reindex API

* Nous ne sommes pas limité qu'aux index d'un même cluster
* Nous pouvons reindexer les données d'un cluster distant

```
POST _reindex
{
  "source": {
    "remote": {
      "host": "http://otherhost:9200"
    },
    "index": "movies_v1",
    "query": {
      "term": {
        "year": 2010
      }
    }
  },
  "dest": {
    "index": "movies_v2"
  }
}
```

---

# Tester vos mapping

* Elasticsearch met à disposition un endpoint permettant de tester vos mapping

```
POST _analyze
{
  "analyzer": "whitespace",
  "text":     "The quick brown fox."
}
```

---

# Tester vos mapping

```
{
  "tokens": [
    {
      "token": "The",
      "start_offset": 0,
      "end_offset": 3,
      "type": "word",
      "position": 0
    },
    {
      "token": "quick",
      "start_offset": 4,
      "end_offset": 9,
      "type": "word",
      "position": 1
    },
    {
      "token": "brown",
      "start_offset": 10,
      "end_offset": 15,
      "type": "word",
      "position": 2
    },
    {
      "token": "fox.",
      "start_offset": 16,
      "end_offset": 20,
      "type": "word",
      "position": 3
    }
  ]
}
```
---

# Tester vos mappings

```
POST _analyze
{
  "tokenizer": "standard",
  "filter":  [ "lowercase", "asciifolding" ],
  "text":      "Is this déja vu?"
}
```
---

# Tester vos mappings

```
POST my_index/_analyze
{
  "field": "my_text",
  "text":  "Is this déjà vu?"
}
```

---

# Les Templates

* Nous pouvons définir des templates `index` et `componant`
* Permet de centraliser la configuration d'un index
* Et de la réutiliser lorsqu'un nouvel index est créé
* La mise en place de templates est une pratique recommandée

---

# Les Component Templates

```
PUT _component_template/component_template1
{
  "template": {
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date"
        }
      }
    }
  }
}
```

---

# Les Index Templates

```
PUT _index_template/template_1
{
  "index_patterns": ["te*", "bar*"],
  "template": {
    "settings": {
      "number_of_shards": 1
    },
    "mappings": {
      "_source": {
        "enabled": true
      },
      "properties": {
        "host_name": {
          "type": "keyword"
        }
      }
    },
    "aliases": {
      "mydata": { }
    }
  },
  "priority": 500,
  "composed_of": ["component_template1"],
  "_meta": {
    "description": "my custom"
  }
}
```

---
layout: cover
---
# Présentation de la documentation
