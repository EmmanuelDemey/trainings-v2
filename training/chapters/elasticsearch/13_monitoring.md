---
layout: cover
---

# Monitoring 

---

# Cluster Health APIs

* API permettant de récupérer l'état de santé de son Cluster

```
GET /_cluster/health/
```

---

# Cluster Health APIs

```
{
  "cluster_name" : "xxx",
  "status" : "red",
  "timed_out" : false,
  "number_of_nodes" : "x",
  "number_of_data_nodes" : "x",
  "active_primary_shards" : 116,
  "active_shards" : 229,
  "relocating_shards" : 0,
  "initializing_shards" : 0,
  "unassigned_shards" : 1,
  "delayed_unassigned_shards" : 0,
  "number_of_pending_tasks" : 0,
  "number_of_inflight_fetch" : 0,
  "task_max_waiting_in_queue_millis" : 0,
  "active_shards_percent_as_number" : 98.70689655172413
}
```

---

# CAT APIs

* Ensemble d'API permettant de récupérer des informations de votre cluster
    * sur les noeuds
    * sur les indices
    * sur les shards
    * sur les templates
    * ...

---

# CAT APIs

```
GET _cat
GET _cat/indices
GET _cat/shards
GET _cat/snapshots
GET _cat/templates
GET _cat/nodes
...
```

---

# CAT API

* Activer le mode `verbose` avec le paramètre `v`
* Certaines APIs acceptent d'autres paramètres.

```
GET /_cat/indices?v
GET /_cat/indices?v&health=red
```

---

# CAT API

* Voici le résultat de l'appel `GET /_cat/shards`

```
filebeat-7.10.0-2022.01.07-000014 0   P   UNASSIGNED
filebeat-7.9.3-2022.01.07-000015  1   P   UNASSIGNED
filebeat-7.9.3-2022.01.07-000015  2   r   UNASSIGNED
```

---

# Cluster Allocation Explain API

* API permettant de comprendre pourquoi un shard n'a pas été assigné

```
GET _cluster/allocation/explain
{
  "index": "filebeat-7.9.3-2022.01.07-000015",
  "shard": 1,
  "primary": true
}
```

---

# Cluster Allocation Explain API

* Voici le résultat de la requete précédente

```
{
  "index": "filebeat-7.9.3-2022.01.07-000015",
  "shard": 1,
  "primary": true,
  "current_state": "unassigned",
  "unassigned_info": {
    "reason": "CLUSTER_RECOVERED",
    "at": "2022-04-12T13:06:36.125Z",
    "last_allocation_status": "no_valid_shard_copy"
  },
  "can_allocate": "no_valid_shard_copy",
  "allocate_explanation": "cannot allocate because a previous copy of the primary shard existed but can no longer be found on the nodes in the cluster",
  "node_allocation_decisions": [
    {
      "node_id": "xxxx",
      "node_name": "instance-0000000005",
      (... skip ...)
      "node_decision": "no",
      "store": {
        "found": false
      }
    }
  ]
}
```

---

# Field Data Cache

* Le `Field Data Cache` est utilisé pour stocker des informations utilisées notamment pour les aggrégation
* Un cache sur-utilisé peut éventuellement indiqué l'utilisation de field data sur des champs analysés (`type=text`)
* Nous pouvons monitorer cela via
    * la `cat fielddata API`
    * la `nodes stats API`

---

# Field Data Cache

* Via la `cat fielddata API`

```
GET /_cat/fielddata?v=true
```

```
id                     host      ip        node    field   size
Nqk-6inXQq-OxUfOUI8jNQ 127.0.0.1 127.0.0.1 Nqk-6in body    544b
Nqk-6inXQq-OxUfOUI8jNQ 127.0.0.1 127.0.0.1 Nqk-6in mind    360b
Nqk-6inXQq-OxUfOUI8jNQ 127.0.0.1 127.0.0.1 Nqk-6in soul    480b
```

---

# Field Data Cache

* Via la `nodes stats API`

```
GET /_nodes/stats/indices/fielddata?fields=field1,field2

GET /_nodes/stats/indices/fielddata?level=indices&fields=field1,field2

GET /_nodes/stats/indices/fielddata?level=shards&fields=field1,field2

GET /_nodes/stats/indices/fielddata?fields=field*```
```

---

# Autres APIs

```
GET /_nodes/stats

GET /_nodes/<node_id>/stats

GET /_nodes/stats/<metric>

GET /_nodes/<node_id>/stats/<metric>

GET /_nodes/stats/<metric>/<index_metric>

GET /_nodes/<node_id>/stats/<metric>/<index_metric>

GET /_cluster/stats

GET /_cluster/stats/nodes/<node_filter>
```

---

# Node Info API

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

# slowlog

* Mécanisme permettant de logger les requêtes dépassant un certain temps d'exécution
* Ces informations seront disponibles dans un fichier de log spécifique
* On peut configurer un threshold pour les requêtes de
    * recherche (query)
    * récupération (fetch)
    * index (index)

---

# slowlog

```
index.search.slowlog.threshold.query.warn: 10s
index.search.slowlog.threshold.query.info: 5s
index.search.slowlog.threshold.query.debug: 2s
index.search.slowlog.threshold.query.trace: 500ms

index.search.slowlog.threshold.fetch.warn: 1s
...

index.indexing.slowlog.threshold.index.warn: 10s
...
```

---

# slowlog

* Nous pouvons également modifier ces paramètres à la volée

```
PUT /my-index-000001/_settings
{
  "index.search.slowlog.threshold.query.warn": "10s",
  "index.search.slowlog.threshold.query.info": "5s",
  "index.search.slowlog.threshold.query.debug": "2s",
  "index.search.slowlog.threshold.query.trace": "500ms",
  "index.search.slowlog.threshold.fetch.warn": "1s",
  "index.search.slowlog.threshold.fetch.info": "800ms",
  "index.search.slowlog.threshold.fetch.debug": "500ms",
  "index.search.slowlog.threshold.fetch.trace": "200ms"
}
```

---

# slowlog

```
[instance-0000000000] [movies/C2OBwoduS9SA_1EZ9ds4ow]
  took[746.5micros], took_millis[0], type[_doc], id[2], routing[],
  source[{"title":"Titanic"}]

[instance-0000000001] [movies/C2OBwoduS9SA_1EZ9ds4ow]
  took[2.7ms], took_millis[2], type[_doc], id[2], routing[],
  source[{"title":"Fight Club"}]
```

---

# Monitoring

* La solution préconisé pour monitorer un cluster Elastic, est d'utiliser
    * Metricbeat
    * Filebeat
    * Heartbeat
    * ...
* Il est recommandé d'envoyer ces métrics dans un second cluster

---

# Architecture

* Agents écrits en Go
* Collecteurs de données
* Respectent la même philosophie de configuration
* Configuration via un fichier YAML
* Extensibles

---

# Architecture

* Configuration via un fichier de configuration yaml

```
./bin/*beat setup -e
./bin/*beat -e
```

```
output.elasticsearch:
hosts: ["10.45.3.2:9220", "10.45.3.1:9230"]
```

---

# Heartbeat

* Agent permettant de s'assurer de la disponibilité d'un service

```
heartbeat.monitors:
- type: tcp
schedule: '*/5 * * * * * *'
hosts: ["myhost:12345"]
id: my-tcp-service
- type: http
schedule: '@every 5s'
urls: ["http://example.net"]
service_name: apm-service-name
id: my-http-service
name: My HTTP Service
```

```
./heartbeat setup -e
./heartbeat -e
```

---

# Filebeat

* Agent permettant d'indexer des lignes de logs
* Possibilité d'activer des modules permettant de supporter des logs de produits open-source

```
filebeat modules enable system nginx mysql
```

```
./filebeat setup -e
./filebeat -e
```

---

# Metricbeat

* Agent permettant d'indexer des métriques d'un serveur ou d'un système
* Possibilité d'activer des modules permettant de supporter des logs de produits open-source

```
metricbeat modules enable apache mysql
```

```
./metricbeat setup -e
./metricbeat -e
```

---

# Packetbeat

* Agent permettant d'indexer des paquets réseau transitant dans un système d'informations
* Possibilité d'activer des modules permettant de supporter des trames standardisées.

```
./packetbeat setup -e
./packetbeat -e
```

```
packetbeat.protocols:

- type: dhcpv4
ports: [67, 68]

- type: dns
ports: [53]

- type: http
ports: [80, 8080, 8081, 5000, 8002]
```

---

# Metricbeat avec Elasticsearch

* Il faut tout d'abord activer le monitoring sur le cluster

```
PUT _cluster/settings
{
  "persistent": {
    "xpack.monitoring.elasticsearch.collection.enabled": true
  }
}
```

---

# Metricbeat avec Elasticsearch

```
metricbeat modules enable elasticsearch-xpack
```

---

# Metricbeat avec Elasticsearch

* Configurer le noeud que nous souhaitons monitorer

```
#modules.d/elasticsearch-xpack.yml

- module: elasticsearch
  xpack.enabled: true
  period: 10s
  hosts: ["http://localhost:9200"]
```

---

# Metricbeat avec Elasticsearch

* Configurer le cluster de monitoring

```
#metricbeat.yml
output.elasticsearch:
  hosts: ["http://es-mon-1:9200", "http://es-mon-2:9200"]

  #protocol: "https"
  #username: "elastic"
  #password: "changeme"
```

---

# Gestion des droits

* Pour collecter, nous devons avoir le droit `remote_monitoring_collector`
* Pour envoyer, nous devons avoir le droit `remote_monitoring_agent`
* Nous pouvons utiliser l'utilisateur prédéfini `remote_monitoring_user`

---

# Filebeat avec Elasticsearch

* La configuration pour Filebeat est similaire
    * Installer et configurer Filebeat

```
#filebeat.yml
output.elasticsearch:
  # Array of hosts to connect to.
  hosts: ["http://es-mon-1:9200", "http://es-mon-2:9200"]

setup.kibana:
  host: "localhost:5601"
  #username: "my_kibana_user"
  #password: "YOUR_PASSWORD"
```

---

# Filebeat avec Elasticsearch

* Activer le module Elasticsearch
* Ajuster la configuration dans `modules.d/elasticsearch.yml`

---
