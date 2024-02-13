---
layout: cover
---

# Operating

---

# Topology

* Master Node
* Data Node
* Ingest Pipelines
* Coordinator Node
* Machine Learning Node
* Transform Node
* Remote-eligible Node

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

* It is possible to log queries exceeding a certain time
* This configuration can be applied
    * via the command line
    * via the elasticsearch.yml file
    * via the log4j2.properties file
    * via the API
* The last solution has the advantage of being able to be activated on the fly

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

# API to monitor your cluster

* Several APIs are available to retrieve statistics from the Elasticsearch cluster
    * Cat API
    * Node info API
    * Cluster Stats API

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
          "description": "The ICU Analysis plugin integrates Lucene ICU module into elasticsearch, adding ICU related analysis components.",
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
         "term_vectors_memory_in_bytes":

 0,
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
          "description": "The ICU Analysis plugin integrates Lucene ICU module into elasticsearch, adding ICU related analysis components.",
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

# Best Sizing Practices

* A shard should contain between 20 and 40 GB
* The number of shards per node should be less than 20 per GB of configured memory
* How many nodes should I have?
    * Total data nodes = Total storage (GB) / Memory per data node / Memory:Data ratio
    * Total storage = Raw data * number of shards * (1 + 0.15 disk Watermark threshold + 0.1 Margin of error)
    * Memory:Data ratio = performance ratio for your data (hot zone 1:30, warm zone 1:160 etc.)

---

# Thread Pools

* Thread pools have default configurations that are suitable for the majority of use cases
* The search thread pool is configured by default to ((# of allocated processors * 3) / 2) + 1 = 13 and a queue_size of 1000.
* Possibility to overload these configurations

```
GET /_cat/thread_pool
```

---

# Thread Pools

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

# ILM policy (X-Pack)

* Manages the lifecycle of indices
* Several phases (Hot, warm, cold, frozen, delete)
* Several actions (rollover, read-only, shrink, force merge ...)
* Several rollover criteria (max_age, max_docs, max_primary_shard_size)
* Available via API or via Kibana

---

# Shrink

* It is not possible to change the number of primary shards of an index
* Shrinks an index into a new index with fewer primary shards.

```
POST /my-index/_shrink/my-shrunk-index
```

---

# Transform API (X-Pack)

* Automatically indexes the result of a "query" on existing data.
* It is then possible to search in already aggregated/processed data.
* Several

 types of transform (pivot, latest)
    * Every five minutes, save the maximum number of ...
    * Every five minutes, save the last document authored by ...

---
layout: cover
---

# Monitoring Demo via Kibana

---
layout: cover
---
# Practical Part