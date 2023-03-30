---
layout: cover
---
# Indexation

---

# Création d'un index

* Un document est indexé dans un `index`
* Pour des raison de rétrocompatibilité, un type `_doc` lui est associé
* Lors de l'indexation d'un premier document, Elasticsearch va déduire la structure du document
* Il ne faudra pas laisser cette structure par défaut
* Récupération de cette configuration générée afin de pouvoir ensuite la modifier

---

# Indexation d'un document

* Un document est défini au format JSON

```
POST /movies/_doc
{
    "title": "Titanic"
}
```

---

# Indexation d'un document

* Voici la réponse à la requête précédente

```
{
  "_index" : "movies",
  "_type" : "_doc",
  "_id" : "mQ6jknEBOjsOKzV3MVdi",
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 0,
  "_primary_term" : 1
}
```

---

# Indexation d'un document

* Lors de l'indexation, un `_id` sera généré par Elasticsearch (configurable)
* Aprés une indexation, le document est recherchable au bout d'une seconde (`refresh_interval`)
* Il est recommandé d'augmenter ou désactiver cette propriété lors d'une indexation en masse

---

# Indexation d'un document

* Il est possible d'utiliser le verbe `POST` et de fournir l'identifiant du document

```
POST /movies/_doc/monIdentifiant
{
    "title": "Titanic"
}
```

---

# Récupération d'un document

* Nous pouvons récupérer un document via une requete `GET`

```
GET /movies/_doc/mQ6jknEBOjsOKzV3MVdi
```

```
{
  "_index" : "movies",
  "_type" : "_doc",
  "_id" : "mQ6jknEBOjsOKzV3MVdi",
  "_version" : 1,
  "_seq_no" : 0,
  "_primary_term" : 1,
  "found" : true,
  "_source" : {
    "title" : "Titanic"
  }
}
```

# Mise à jour d'un document

* Nous pouvons mettre à jour un document via une requête `PUT`

```
PUT /movies/_doc/mQ6jknEBOjsOKzV3MVdi
{
    ...
}
```

```
{
  "_index" : "movies",
  "_type" : "_doc",
  "_id" : "mQ6jknEBOjsOKzV3MVdi",
  "_version" : 2,
  "result" : "updated",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 1,
  "_primary_term" : 1
}
```

---

# Mise à jour d'un document

* Attention, cette mise à jour est totale et le document précédent sera complètement écrasé
* Il est possible d'effectuer des mises à jour partielles en utilisant l'API `_update`

```
POST movies/_update/mQ6jknEBOjsOKzV3MVdi
{
  "doc": {
    "year": 1998
  }
}
```

---

# Suppression d'un document

* Nous pouvons supprimer un document via une requête `DELETE`

```
DELETE /movies/_doc/mQ6jknEBOjsOKzV3MVdi
```

```
{
  "_index" : "movies",
  "_type" : "_doc",
  "_id" : "mQ6jknEBOjsOKzV3MVdi",
  "_version" : 3,
  "result" : "deleted",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 2,
  "_primary_term" : 1
}
```

---

# Récupération de tous les documents indexés

* Utilisation du endpoint `_search`
* Affichage par défaut des 10 premiers documents
* Nous pouvons définir une requête simple via le *query parameter* `q`
* Définition du tri et de la pagination via des *query parameter* `sort`, `size` et `from`
* Possibilité de définir des requêtes plus complexes

---

# Première recherche

```
POST /movies/_search?q=titanic
```

```
{
  "took" : 1536,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 0.14874382,
    "hits" : [
      {
        "_index" : "movies",
        "_type" : "_doc",
        "_id" : "mQ6jknEBOjsOKzV3MVdi",
        "_score" : 0.14874382,
        "_source" : {
          "title" : "Titanic"
        }
      }
    ]
  }
}
```

---

# Première recherche

```
POST /movies/_search?q=title:titanic

POST /movies/_search?q=title:titanic&size=5

POST /movies/_search?q=title:titanic&size=5&from=10

POST /movies/_search?q=title:titanic&sort:title
```

---

# Gestion des indexes

* Nous pouvons créer des indexes manuellement

```
PUT /movies
{
    "settings" : {
        ...
    },
    "mappings" : {
        ...
    },
    "aliases": {
        ...
    }
}
```

* Les *mappings* et *aliases* seront présentés prochainement.

---

# Gestion des indexes

* Dans la partie *settings*, nous allons définir les **shards** de notre index.
* Deux types de shards existent :
    * **primary shards** et **replica shards**
* Les **primary shards** sont d'abord utilisés à l'indexation
* Les ** primary** et **replicas** sont utilisés de la même façon lors de la recherche
* Un shard correspond à une instance Lucene

---

# Gestion des indexes

```
PUT /movies
{
    "settings" : {
        "number_of_shards" : 3,
        "number_of_replicas" : 2
    }
}
```

---

# Gestion des indexes

* Nous pouvons modifier certains *settings* d'un index à posteriori

```
PUT /movies/_settings
{
    "index" : {
        "number_of_replicas" : 2
    }
}
```

---

# Gestion des indexes

* Une configuration globale peut être définie dans le fichier `elasticsearch.yml`.

```
index.number_of_shards: 1
index.number_of_replicas: 1
```

---

# Statut d'un cluster

* Elasticsearch sera en charge de créer les shards et de les positionner au bon endroit
* Un shard replica ne peut absolument pas être sur le même noeud qu'un shard primaire
* Si c'est le cas, le status du cluster sera en `yellow`
* Le cluster peut avoir le status `green`, `yellow` ou `red`.

```
GET /_cluster/health
```

--- 

# Statut d'un cluster

```
{
  "cluster_name" : "testcluster",
  "status" : "yellow",
  "timed_out" : false,
  "number_of_nodes" : 1,
  "number_of_data_nodes" : 1,
  "active_primary_shards" : 1,
  "active_shards" : 1,
  "relocating_shards" : 0,
  "initializing_shards" : 0,
  "unassigned_shards" : 1,
  "delayed_unassigned_shards": 0,
  "number_of_pending_tasks" : 0,
  "number_of_in_flight_fetch": 0,
  "task_max_waiting_in_queue_millis": 0,
  "active_shards_percent_as_number": 50.0
}
```

---

# Statut d'un cluster

![](/images/cluster_yellow.png)

---

# Statut d'un cluster

![](/images/cluster_green.png)

---

# Gestion des indexes

* Nous pouvons supprimer un index

```
DELETE /movies
```

* Nous pouvons supprimer plusieurs indexes

```
DELETE /movies,albums
```

---

# Gestion des indexes

* Nous pouvons égalament supprimer tous les indexes :(

```
DELETE _all
```

* Il est recommandé de désactiver cette potentielle faille dans le fichier `elasticsearch.yml`.

```
action.disable_delete_all_indices: true
```

---

# Open et Close API

* Un index peut etre ouvert ou fermé
* Le fait de fermer un index peut améliorer les performances de votre cluster
* Les données seront toujours indexées mais pas recherchables

```
POST /twitter/_open
POST /twitter/_close
```

---

# Open et Close API

* Il est recommandé de désactiver la possibilité de clore tous les indexes

```
action.disable_close_all_indices: true
```

---

# Bulk API

* L'API `bulk` permet de faire plusieurs requêtes d'indexation, de modification ou de suppression en une seule requête HTTP
* API à utiliser lors d'indexation en masse
* Chaque ligne du `body` correspond à une instruction

```
POST _bulk
{ "index" : { "_index" : "movies", "_id" : "1" } }
{ "name" : "Star Wars" }
{ "delete" : { "_index" : "movies", "_id" : "2" } }
{ "update" : {"_id" : "1", "_index" : "movies"} }
{ "doc" : {"year" : 1970} }
```

---

# Bulk API

* Il est recommandé d'augmenter ou désactiver le *refresh_interval* lors de l'indexation en masse.

```
PUT movies/_settings
{
    "refresh_interval": "-1"
}
```

```
PUT movies/_settings
{
    "refresh_interval": "30s"
}
```

---

# Les alias

* Les aliases sont un moyen de définir un synonyme pour un index
* Cet alias peut pointer sur un index complet, plusieurs indexes ou sur une partie des données
* Il est recommandé d'utiliser des alias. Lorsque des applications consommeront les données, les opérations de maintenance sur les indexes seront transparentes (reindexation, nouveau format etc.)

---

# Les alias

* Nous pouvons ajouter les alias lors de la création d'un index
* Ces alias pourront être utilisés de la même façon qu'un index dans les requêtes de recherche

```
PUT /movies
{
    "aliases" : {
        "all" : {},
        "horreur" : {
            "filter" : {
                "term" : {"type" : "horreur" }
            }
        }
    }
}
```

---

# Les alias

* Nous pouvons également ajouter à posteriori un alias

```
POST /_aliases
{
    "actions" : [
        { "add" : { "index" : "movies-v1", "alias" : "movies" } }
    ]
}
```

---

# Les alias

* Nous pouvons supprimer un alias

```
POST /_aliases
{
    "actions" : [
        { "remove" : { "index" : "movies-v1", "alias" : "movies" } }
    ]
}
```

---

# Les alias

* Nous pouvons faire plusieurs actions en une seule requête

```
POST /_aliases
{
    "actions" : [
        { "remove" : { "index" : "movies-v2", "alias" : "movies" } },
        { "add" : { "index" : "movies-v1", "alias" : "movies" } }
    ]
}
```
