---
layout: cover
---

# Operating

---

# Topologie

* Master Node
* Data Node
* Ingest Pipelines
* Coordinator Node
* Machine Learning Node
* Transform Node
* Remote-elligible Node

---

# Internals

![](/images/internals1.png)

---

# Internals

![](/images/internals2.png)

---

# Internals

![](/images/internals3.png)

---

# Internals

![](/images/internals4.png)

---

# Internals

![](/images/internals5.png)

---

# Internals

![](/images/internals6.png)

---

# Internals

![](/images/internals7.png)

---

# Slow Queries

* Il est possible de logger les requêtes dépassant un certain temps
* Cette configuration peut s'appliquer
    * via la ligne de commande
    * via le fichier elasticsearch.yml
    * via la fichier log4j2.properties
    * via l'API
* La dernière solution a l'avantage de pouvoir être activé à chaud

---

# Slow Queries

```
PUT movies/_settings
{
    "index.search.slowlog.threshold.query.warn": "500ms",
    "index.search.slowlog.threshold.query.info": "250ms",
    "index.search.slowlog.threshold.fetch.warn": "200ms",
    "index.search.slowlog.threshold.fetch.info": "100ms",
    "index.indexing.slowlog.threshold.index.warn": "1s",
    "index.indexing.slowlog.threshold.index.info": "500ms",
    "index.search.slowlog.level": "info"
}
```

```
[instance-0000000000] [movies/C2OBwoduS9SA_1EZ9ds4ow]
  took[746.5micros], took_millis[0], type[_doc], id[2], routing[],
  source[{"title":"Titanic"}]

[instance-0000000001] [movies/C2OBwoduS9SA_1EZ9ds4ow]
  took[2.7ms], took_millis[2], type[_doc], id[2], routing[],
  source[{"title":"Fight Club"}]
```

---

# API pour monitorer votre cluster

* Plusieurs APIs sont disponibles pour récupérer des statistiques du cluster elasticsearch
    * la cat API
    * la Node info API
    * la Cluster Stats API

---

# CAT API

```
GET /_cat/indices/twi*?v&s=index
```

```
health status index    uuid                   pri rep docs.count docs.deleted store.size pri.store.size
yellow open   twitter  u8FNjxh8Rfy_awN11oDKYQ   1   1       1200            0     88.1kb         88.1kb
green  open   twitter2 nYFWZEO7TUiOjLQXBaYJpA   1   0          0            0       260b           260b
```

---

# Node info API

```
GET /_nodes/process

GET /_nodes/_all/process

GET /_nodes/nodeId1,nodeId2/jvm,process

GET /_nodes/nodeId1,nodeId2/info/jvm,process

GET /_nodes/nodeId1,nodeId2/_all
```

---

# Node info API

```
{
  "_nodes": ...
  "cluster_name": "elasticsearch",
  "nodes": {
    "USpTGYaBSIKbgSUJR2Z9lg": {
      "name": "node-0",
      "transport_address": "192.168.17:9300",
      "host": "node-0.elastic.co",
      "ip": "192.168.17",
      "version": "{version}",
      "build_flavor": "{build_flavor}",
      "build_type": "{build_type}",
      "build_hash": "587409e",
      "roles": [
        "master",
        "data",
        "ingest"
      ],
      "attributes": {},
      "plugins": [
        {
          "name": "analysis-icu",
          "version": "{version}",
          "description": "The ICU Analysis plugin integrates Lucene ICU module into elasticsearch, adding ICU relates analysis components.",
          "classname": "org.elasticsearch.plugin.analysis.icu.AnalysisICUPlugin",
          "has_native_controller": false
        }
      ],
      "modules": [
        {
          "name": "lang-painless",
          "version": "{version}",
          "description": "An easy, safe and fast scripting language for Elasticsearch",
          "classname": "org.elasticsearch.painless.PainlessPlugin",
          "has_native_controller": false
        }
      ]
    }
  }
}
```

---

# Cluster Stats API

```
GET /_cluster/stats?human&pretty
```

```
{
   "_nodes" : {
      "total" : 1,
      "successful" : 1,
      "failed" : 0
   },
   "cluster_uuid": "YjAvIhsCQ9CbjWZb2qJw3Q",
   "cluster_name": "elasticsearch",
   "timestamp": 1459427693515,
   "status": "green",
   "indices": {
      "count": 1,
      "shards": {
         "total": 5,
         "primaries": 5,
         "replication": 0,
         "index": {
            "shards": {
               "min": 5,
               "max": 5,
               "avg": 5
            },
            "primaries": {
               "min": 5,
               "max": 5,
               "avg": 5
            },
            "replication": {
               "min": 0,
               "max": 0,
               "avg": 0
            }
         }
      },
      "docs": {
         "count": 10,
         "deleted": 0
      },
      "store": {
         "size": "16.2kb",
         "size_in_bytes": 16684
      },
      "fielddata": {
         "memory_size": "0b",
         "memory_size_in_bytes": 0,
         "evictions": 0
      },
      "query_cache": {
         "memory_size": "0b",
         "memory_size_in_bytes": 0,
         "total_count": 0,
         "hit_count": 0,
         "miss_count": 0,
         "cache_size": 0,
         "cache_count": 0,
         "evictions": 0
      },
      "completion": {
         "size": "0b",
         "size_in_bytes": 0
      },
      "segments": {
         "count": 4,
         "memory": "8.6kb",
         "memory_in_bytes": 8898,
         "terms_memory": "6.3kb",
         "terms_memory_in_bytes": 6522,
         "stored_fields_memory": "1.2kb",
         "stored_fields_memory_in_bytes": 1248,
         "term_vectors_memory": "0b",
         "term_vectors_memory_in_bytes": 0,
         "norms_memory": "384b",
         "norms_memory_in_bytes": 384,
         "points_memory" : "0b",
         "points_memory_in_bytes" : 0,
         "doc_values_memory": "744b",
         "doc_values_memory_in_bytes": 744,
         "index_writer_memory": "0b",
         "index_writer_memory_in_bytes": 0,
         "version_map_memory": "0b",
         "version_map_memory_in_bytes": 0,
         "fixed_bit_set": "0b",
         "fixed_bit_set_memory_in_bytes": 0,
         "max_unsafe_auto_id_timestamp" : -9223372036854775808,
         "file_sizes": {}
      },
      "mappings": {
        "field_types": []
      },
      "analysis": {
        "char_filter_types": [],
        "tokenizer_types": [],
        "filter_types": [],
        "analyzer_types": [],
        "built_in_char_filters": [],
        "built_in_tokenizers": [],
        "built_in_filters": [],
        "built_in_analyzers": []
      }
   },
   "nodes": {
      "count": {
         "total": 1,
         "data": 1,
         "coordinating_only": 0,
         "master": 1,
         "ingest": 1,
         "voting_only": 0
      },
      "versions": [
         "7.10.1"
      ],
      "os": {
         "available_processors": 8,
         "allocated_processors": 8,
         "names": [
            {
               "name": "Mac OS X",
               "count": 1
            }
         ],
         "pretty_names": [
            {
               "pretty_name": "Mac OS X",
               "count": 1
            }
         ],
         "mem" : {
            "total" : "16gb",
            "total_in_bytes" : 17179869184,
            "free" : "78.1mb",
            "free_in_bytes" : 81960960,
            "used" : "15.9gb",
            "used_in_bytes" : 17097908224,
            "free_percent" : 0,
            "used_percent" : 100
         }
      },
      "process": {
         "cpu": {
            "percent": 9
         },
         "open_file_descriptors": {
            "min": 268,
            "max": 268,
            "avg": 268
         }
      },
      "jvm": {
         "max_uptime": "13.7s",
         "max_uptime_in_millis": 13737,
         "versions": [
            {
               "version": "12",
               "vm_name": "OpenJDK 64-Bit Server VM",
               "vm_version": "12+33",
               "vm_vendor": "Oracle Corporation",
               "bundled_jdk": true,
               "using_bundled_jdk": true,
               "count": 1
            }
         ],
         "mem": {
            "heap_used": "57.5mb",
            "heap_used_in_bytes": 60312664,
            "heap_max": "989.8mb",
            "heap_max_in_bytes": 1037959168
         },
         "threads": 90
      },
      "fs": {
         "total": "200.6gb",
         "total_in_bytes": 215429193728,
         "free": "32.6gb",
         "free_in_bytes": 35064553472,
         "available": "32.4gb",
         "available_in_bytes": 34802409472
      },
      "plugins": [
        {
          "name": "analysis-icu",
          "version": "7.8.0",
          "description": "The ICU Analysis plugin integrates Lucene ICU module into elasticsearch, adding ICU relates analysis components.",
          "classname": "org.elasticsearch.plugin.analysis.icu.AnalysisICUPlugin",
          "has_native_controller": false
        },
        ...
      ],
      "ingest": {
        "number_of_pipelines" : 1,
        "processor_stats": {
          ...
        }
      }
   }
}
```

---

# Debug unassigned shards

```
POST /_cluster/allocation/explain
{
  "index": "person-v6",
  "shard": 0,
  "primary": false
}
```

---

# Bonnes pratiques Sizing

* Un shard doit contenir entre 20 et 40 Go
* Le nombre de partitions par noeud inférieur a 20 par Go de mémoire configurée
* Combien de nodes dois-je avoir ?
    * Total data nodes = Total storage (GB) / Memory per data node / Memory:Data ratio
    * Total storage = Raw data * nb shards * (1 + 0.15 disk Watermark threshold + 0.1 Margin of error)
    * Memory:Data ratio = ratio de performance pour vos données (hot zone 1:30, warm zone 1:160 etc.)

---

# Pool de threads

* Les pools de thread ont des configurations par défaut qui sont adaptées dans la majorité des cas d'utilisation
* Le pool de thread de search est configuré par défaut à ((# of allocated processors * 3) / 2) + 1 = 13 et une queue_size de 1000.
* Possibilité de surcharger ses configurations

```
GET /_cat/thread_pool
```

---

# Pool de threads

```
GET /_cat/thread_pool?v&h=id,name,queue,rejected,completed
id                     name                                   queue rejected  completed
...
WR-MucALTGC98E2HPCCydQ flush                                      0        0      22896
WR-MucALTGC98E2HPCCydQ force_merge                                0        0          0
WR-MucALTGC98E2HPCCydQ generic                                    0        0    2599788
WR-MucALTGC98E2HPCCydQ get                                        0        0   94132418
...
WR-MucALTGC98E2HPCCydQ refresh                                    0        0   25964589
...
WR-MucALTGC98E2HPCCydQ search                                     0        0 1847870477
...
WR-MucALTGC98E2HPCCydQ write                                      0        0    2125067
...
```

---

# API Snapshot et Restore

* APIs permettant de définir des backup de nos données
* Nous pouvons faire un backup d'un index entier ou d'une partie.
* Possibilité d'utiliser différents types de `repository`
    * fs ou url
    * provider cloud via l'ajout de plugins

---

# API Snapshot et Restore

* L'action se compose de trois étapes :
    * Création d'un repository
    * Création du Snapshot
    * Restore du Snapshot

---

# Création d'un repository

Configurer le repository dans `elasticsearch.yml`

```
path.repo: ["/mount/backups"]
```

---

# Création d'un repository

```
PUT /_snapshot/my_fs_backup
{
    "type": "fs",
    "settings": {
        "location": "/mount/backups/my_fs_backup_location"
    }
}
```

---

# Création du Snapshot

```
PUT /_snapshot/my_fs_backup/snapshot_1?wait_for_completion=true
{
  "indices": "index_1,index_2",
  "ignore_unavailable": true,
  "include_global_state": false,
  "metadata": {
    "taken_by": "Emmanuel DEMEY"
  }
}
```

---

# Restore du Snapshot

```
POST /_snapshot/my_fs_backup/snapshot_1/_restore
{
  "indices": "index_1,index_2",
  "ignore_unavailable": true,
  "include_global_state": false,
  "rename_pattern": "index_(.+)",
  "rename_replacement": "restored_index_$1",
  "include_aliases": false
}
```

---

# ILM policy (X-Pack)

* Permet de gérer le cycle de vie des index
* Plusieurs phases (Hot, warm, cold, frozen, delete)
* Plusieurs actions (rollover, read-only, shrink, force merge ...)
* Plusieurs critères de rollover (max_age, max_docs, max_primary_shard_size)
* Disponible via API ou via Kibana

---

# Shrink

* Il n'est pas possible de changer le nombre de shards primaires d'un index
* Permet de rétrécir un index dans un nouvel index avec moins de shards primaires.

```
POST /my-index/_shrink/my-shrunk-index
```

---

# Transform API (X-Pack)

* Permet d'indexer automatiquement le résultat d'une "requête" sur des données existantes.
* Il est alors possible de rechercher dans des données déja agrégées/traitées.
* Plusieurs types de transform (pivot, latest)
    * Toutes les cinq minutes, enregistrer le nombre maximum de ...
    * Toutes les cinq minutes, enregistrer le dernier document ayant pour auteur ...

---
layout: cover
---

# Démo Monitoring via Kibana

---
layout: cover
---
# Partie Pratique