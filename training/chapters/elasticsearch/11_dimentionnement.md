---
layout: cover
---

# Scaling

---

# Index Management

* We can create indexes manually

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

# Index Management

* In the *settings* part, we define the **shards** of our index.
* Two types of shards exist:
    * **primary shards** and **replica shards**
* The **primary shards** are initially used for indexing
* Both **primary** and **replicas** are used equally for searching
* A shard corresponds to a Lucene instance

---

# Index Management

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

# Index Management

* We can modify certain *settings* of an index afterwards

```
PUT /movies/_settings
{
    "index" : {
        "number_of_replicas" : 2
    }
}
```

---

# Index Management

* A global configuration can be set in the `elasticsearch.yml` file.

```
index.number_of_shards: 1
index.number_of_replicas: 1
```

---

# Cluster Status

* Elasticsearch is responsible for creating shards and placing them in the right place
* A replica shard cannot be on the same node as its primary shard
* If it is the case, the cluster status will be `yellow`
* The cluster can have the status `green`, `yellow`, or `red`.

```
GET /_cluster/health
```

---

# Cluster Status

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

# Cluster Status

![](/images/cluster_yellow.png)

---

# Cluster Status

![](/images/cluster_green.png)

---

# Topology

* An Elasticsearch node can have multiple roles
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

# Topology

* If a node has no role, it becomes a `Coordinating only node`
* It will have tasks like
    * Routing queries
    * Performing search phase consolidation
    * Distributing `bulk` requests

---

# Topology

* Node roles are defined using the `node.roles` parameter

```
node.roles: [ master ]
```

---

# Disk-based shard allocation

* We can define rules based on disk space used to determine shard placement.
* We call them `watermarks`

```
cluster.routing.allocation.disk.watermark.low: 85%
cluster.routing.allocation.disk.watermark.high: 90%
cluster.info.update.interval: 30s
```

---

# Disk-based shard allocation

* We can modify these values via the `_cluster/settings` API

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

* We can define custom constraints on our nodes
* To define rules for allocating primary shards and replicas.
* For example, we don't want shards to be located
    * on the same rack
    * in the same region
    * on the same cloud provider
    * ....

---

# Shard allocation awareness

* For this, we use `attributes`

```
node.attr.rack_id: rack_one
cluster.routing.allocation.awareness.attributes: rack_id
```

---

# Cluster-level shard allocation filtering

* Finally, we can add additional constraints via the `_cluster/settings` API
* Using one of the properties `_name`, `_ip`, `_host`, ...

```
PUT _cluster/settings
{
  "persistent" : {
    "cluster.routing.allocation.exclude._ip" : "10.0.0.1"
  }
}
```

---

# Recommended Sizing

* Elastic advises following these rules to size your cluster
    * A shard should contain between 10GB and 50GB
    * A node that can be `master` should have 1GB heap per 3000 indices
    * A data node should have 1KB heap per field and per index

---
layout: cover
---
# Practical Part

The translation is complete! Let me know if there's anything else you need.