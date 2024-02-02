---
layout: cover
---

# Dimensionnement

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

---

# Gestion des indexes

* Dans la partie *settings*, nous allons définir les **shards** de notre index.
* Deux types de shards existent :
    * **primary shards** et **replica shards**
* Les **primary shards** sont d'abord utilisés à l'indexation
* Les **primary** et **replicas** sont utilisés de la même façon lors de la recherche
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
* Un shard replica ne peut absolument pas être sur le même noeud que son shard primaire
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

# Topologie

* Un noeud Elasticsearch peut avoir plusieurs rôles
    * `master`
    * `data`
    * `data_content`
    * `data_hot`
    * `data_warm`
    * `data_cold`
    * `data_frozen`
    * `ingest`
    * `remote_cluster_client`
    * `transform`

---

# Topologie

* Si un noeud n'a aucun role, il devient un `Coordinating only node`
* Il aura comme tâches de
    * Router les requêtes
    * Réaliser la phase de consolidation des recherches
    * Distribuer les requêtes `bulk`

---

# Topologie

* La définition des rôles d'un noeud se fait via le paramètre `node.roles`

```
node.roles: [ master ]
```

---

# Disk-based shard allocation

* Nous pouvons définir des règles basées sur l'espace disque utilisé pour déterminer l'emplacement
 des shards.
* Nous les nommons des `watermark`

```
cluster.routing.allocation.disk.watermark.low: 85%
cluster.routing.allocation.disk.watermark.high: 90%
cluster.info.update.interval: 30s
```

---

# Disk-based shard allocation

* Nous pouvons modifier ces valeurs via l'API `_cluster/settings`

```
PUT _cluster/settings
{
    "persistent": {
        "cluster.routing.allocation.disk.watermark.low": "100gb",
        "cluster.routing.allocation.disk.watermark.high": "50gb",
        "cluster.info.update.interval": "1m"
    }
}
```

---

# Shard allocation awareness

* Nous pouvons définir des contraintes `custom à nos noeuds
* Dans le but de définir dès règles d'allocation des primary shard et réplicas.
* Par exemple, nous ne voulons pas pas que les shards se situent
    * sur le même rack
    * dans la même région
    * sur le même povider Cloud
    * ....

---

# Shard allocation awareness

* Pour cela, nous utilisons les `attributes`

```
node.attr.rack_id: rack_one
cluster.routing.allocation.awareness.attributes: rack_id
```

---

# Cluster-level shard allocation filtering

* Enfin nous pouvons ajouter des contraintes supplémentaires via l'API `_cluster/settings`
* En utilisant l'une des propriétés `_name`, `_ip`, `_host`, ...

```
PUT _cluster/settings
{
  "persistent" : {
    "cluster.routing.allocation.exclude._ip" : "10.0.0.1"
  }
}
```

---

# Dimensionnement recommandé

* Elastic conseille de respecter les règles suivantes pour dimensionner son cluster
    * Un shard doit contenir entre 10GB et 50GB
    * Un noeud pouvant être `master` doit avoir 1GB heap par 3000 index
    * Un noeud data doit avoir 1KB heap par champ et par index

---
layout: cover
---
# Partie Pratique