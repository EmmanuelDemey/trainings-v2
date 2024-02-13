---
layout: cover
---

# Monitoring 

---

# Cluster Health APIs

* API allowing to retrieve the health state of your Cluster

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

* Set of APIs allowing to retrieve information about your cluster
    * on nodes
    * on indices
    * on shards
    * on templates
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

* Enable `verbose` mode with the `v` parameter
* Some APIs accept other parameters.

```
GET /_cat/indices?v
GET /_cat/indices?v&health=red
```

---

# CAT API

* Here is the result of the call `GET /_cat/shards`

```
filebeat-7.10.0-2022.01.07-000014 0   P   UNASSIGNED
filebeat-7.9.3-2022.01.07-000015  1   P   UNASSIGNED
filebeat-7.9.3-2022.01.07-000015  2   r   UNASSIGNED
```

---

# Cluster Allocation Explain API

* API allowing to understand why a shard has not been assigned

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

* Here is the result of the previous request

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

* The `Field Data Cache` is used to store information used notably for aggregations
* An overused cache may indicate field data usage on analyzed fields (`type=text`)
* We can monitor this via
    * the `cat fielddata API`
    * the `nodes stats API`

---

# Field Data Cache

* Via the `cat fielddata API`

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

* Via the `nodes stats API`

```
GET /_nodes/stats/indices/fielddata?fields=field1,field2

GET /_nodes/stats/indices/fielddata?level=indices&fields=field1,field2

GET /_nodes/stats/indices/fielddata?level=shards&fields=field1,field2

GET /_nodes/stats/indices/fielddata?fields=field*```
```

---

# Other APIs

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

* Mechanism allowing to log requests exceeding a certain execution time
* This information will be available in a specific log file
* We can configure a threshold for queries of
    * search (query)
    * fetch
    * index

---

# slowlog

```
index.search.slowlog.threshold.query.warn: 10s
index.search.slowlog.threshold.query.info: 5s
index.search.slowlog.threshold.query.debug: 2s
index.search.slowlog.threshold.query.trace: 500ms

index.search.slowlog.threshold.fetch.warn: 1s
...

index.index

ing.slowlog.threshold.index.warn: 10s
...
```

---

# slowlog

* We can also modify these parameters on the fly

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

* The recommended solution for monitoring an Elastic cluster is to use
    * Metricbeat
    * Filebeat
    * Heartbeat
    * ...
* It is recommended to send these metrics to a second cluster

---

# Architecture

* Agents written in Go
* Data collectors
* Respect the same configuration philosophy
* Configuration via a YAML file
* Extensible

---

# Architecture

* Configuration via a YAML configuration file

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

* Agent used to ensure the availability of a service

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

* Agent used to index log lines
* Possibility to activate modules to support logs from open-source products

```
filebeat modules enable system nginx mysql
```

```
./filebeat setup -e
./filebeat -e
```

---

# Metricbeat

* Agent used to index metrics from a server or system
* Possibility to activate modules to support logs from open-source products

```
metricbeat modules enable apache mysql
```

```
./metricbeat setup -e
./metricbeat -e
```

---

# Packetbeat

* Agent used to index network packets passing through an information system
* Possibility to activate modules to support standardized frames.

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

# Metricbeat with Elasticsearch

* First, we need to enable monitoring on the cluster

```
PUT _cluster/settings
{
  "persistent": {
    "xpack.monitoring.elasticsearch.collection.enabled": true
  }
}
```

---

# Metricbeat with Elasticsearch

```
metricbeat modules enable elasticsearch-xpack
```

---

# Metricbeat with Elasticsearch

* Configure the node we want to monitor

```
#modules.d/elasticsearch-xpack.yml

- module: elasticsearch
  xpack.enabled: true
  period: 10s
  hosts: ["http://localhost:9200"]
```

---

# Metricbeat with Elasticsearch

* Configure the monitoring cluster

```
#metricbeat.yml
output.elasticsearch:
  hosts: ["http://es-mon-1:9200", "http://es-mon-2:9200"]

  #protocol: "https"
  #username: "elastic"
  #password: "changeme"
```

---

# Permission Management

* To collect, we must have the `remote_monitoring_collector` right
* To send, we must have the `remote_monitoring_agent` right
* We can use the predefined user `remote_monitoring_user`

---

# Filebeat with Elasticsearch

* The configuration for Filebeat is similar
    * Install and configure Filebeat

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

* Enable the Elasticsearch module
* Adjust the configuration in `modules.d/elasticsearch.yml`