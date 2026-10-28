---
layout: cover
---

# Production Architecture

Sizing, cluster architecture, high availability and performance

---

# Learning Objectives

By the end of this section, you will be able to:

- Size Elasticsearch infrastructure (CPU, memory, disk, nodes) and configure the system (heap, swap, file descriptors)
- Design a cluster architecture: node roles, dedicated masters, data tiers
- Configure high availability with replicas, allocation awareness and cross-cluster replication
- Apply optimization techniques for indexing and search

---
layout: section
---

# Part 1: Sizing

CPU, memory, disk, nodes and system configuration

---

# Infrastructure Sizing

[Sizing an Elasticsearch cluster](https://www.elastic.co/guide/en/elasticsearch/reference/current/size-your-shards.html) depends on several critical factors.

**Factors to consider**:
- **Data volume**: Total size of indices to store
- **Ingestion rate**: Documents/second to index
- **Query rate**: Searches/second expected
- **Target latency**: Acceptable response time (p95, p99)
- **Retention**: Data retention duration
- **High availability**: Replication and fault tolerance

**General starting rule**:
```
Number of data nodes = (Total volume / 30 TB) + 1
```
30 TB is a reasonable limit per data node for operational management.

---

# CPU Sizing

CPU directly impacts search and indexing performance.

**CPU Guidelines**:
- **Minimum recommended**: 4 cores per node
- **Optimal**: 8-16 cores per data node
- **Master-only nodes**: 2-4 cores are sufficient
- **Ingest nodes (complex pipelines)**: 8+ cores

---

# CPU Sizing

**Use cases by CPU intensity**:
| Workload | Recommended CPU | Example |
|----------|-----------------|---------|
| Search intensive | 16+ cores, high frequency | Full-text search, complex aggregations |
| Indexing intensive | 8-16 cores | Log ingestion, IoT data |
| Mixed balanced | 12-16 cores | E-commerce, APM monitoring |
| Read only | 4-8 cores | Archives, static dashboards |

**CPU monitoring metrics**: `node_stats.os.cpu.percent`, `node_stats.process.cpu.percent`

---

# Memory (RAM) Sizing

RAM is the most critical factor for Elasticsearch performance.

**RAM Allocation**:
```
Total RAM = JVM Heap + OS Cache
```

**RAM sizing rules**:
- **50/50 split**: 50% JVM heap, 50% OS cache (filesystem cache)
- **Maximum heap**: below ~31 GB (compressed oops limit)
- **Minimum per data node**: 8 GB total RAM (4 GB heap + 4 GB OS cache)
- **Optimal per data node**: 64 GB total RAM (31 GB heap + 33 GB OS cache)

---

# Memory (RAM) Sizing

**Configuration examples**:
| Total RAM | JVM Heap | OS Cache | Usage |
|-----------|----------|----------|-------|
| 8 GB      | 4 GB     | 4 GB     | Dev/test |
| 32 GB     | 16 GB    | 16 GB    | Small scale production |
| 64 GB     | 31 GB    | 33 GB    | Standard production (recommended) |
| 128 GB    | 31 GB    | 97 GB    | High performance production |

**Why stay below ~31 GB of heap?** Beyond this, the JVM loses "compressed oops", increasing memory footprint by ~30-50%.

---

# Disk Sizing

Storage must be sized for both data volume AND I/O performance.

**Disk capacity formula**:
```
Required capacity = Raw volume x (1 + replicas) x 1.15 x 1.2
```

**Multiplication factors**:
- **(1 + replicas)**: Number of copies (e.g., 1 replica = x2)
- **1.15**: Elasticsearch overhead (~15%)
- **1.20**: Growth margin (20%)

---

# Disk Sizing: Types and Performance

**Example**: 1 TB raw data, 1 replica
```
1 TB x 2 (replica) x 1.15 x 1.2 = 2.76 TB minimum
```

**Recommended disk types**:
- NVMe SSD: Maximum performance (heavy indexing)
- SATA SSD: Good performance/cost compromise
- HDD: Cold/archive data only
- Network storage (NFS, SMB): Avoid (high latency)

**I/O monitoring**: `node_stats.fs.io_stats.total.operations`

---

# Node Count Sizing

Cluster size depends on volume, performance, and HA requirements.

**Estimating data node count**:

**Method 1: By volume**
```
Data nodes = (Total volume with replicas) / 30 TB
```

**Method 2: By shards**
```
Data nodes = (Total number of shards) / shards per node you accept
```
(Since 8.3 the old "20 shards per GB of heap" rule no longer applies: count instead ~1 GB of heap per 3 000 fields of mapping across a node's indices, and stay under `cluster.max_shards_per_node`, 1 000 by default)

---

# Node Count Sizing

**Complete calculation example**:
- Raw volume: 5 TB
- Replicas: 1
- Total volume: 10 TB
- Primary shards: 50 (average size 100 GB/shard)
- Total shards: 100 (with replicas)

```
By volume: 10 TB / 30 TB = 1 node minimum -> 3 nodes (HA)
By shards: 100 shards of 100 GB: shard count is not the limit here
Final recommendation: 3 data nodes, more if the disk or the search load asks for it
```

**Dedicated master nodes**: Recommended for clusters >10 nodes (3 masters minimum)

---

# System Configuration: Heap Size

[JVM heap sizing](https://www.elastic.co/guide/en/elasticsearch/reference/current/advanced-configuration.html#set-jvm-heap-size) is the most critical optimization.

**Configuration in `jvm.options.d/heap.options`**:
```
# Always identical Xms = Xmx
-Xms16g
-Xmx16g
```

**Imperative rules**:
1. **-Xms = -Xmx** (avoids dynamic resizing)
2. **Below ~31 GB** (compressed oops limit)
3. **50% of total RAM** (the rest for OS cache)
4. **Minimum 4 GB** for production

---

# System Configuration: Heap Size

**Verifying configuration**:
```json
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_max_in_bytes
```

**Symptoms of poorly sized heap**:
- Heap too small: `OutOfMemoryError`, frequent GC
- Heap too large: Long GC pauses (>1s), degraded latency
- Xms != Xmx: Pauses for resizing, instability

---

# System Configuration: Swap Disabled

[Swap must be disabled](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup-configuration-memory.html) to avoid catastrophic performance degradation.

**Why disable swap?**
When the JVM is swapped to disk, performance collapses (latency x 1000).

**Method 1: Complete swap disable** (recommended)
```bash
sudo swapoff -a

# Permanent: comment out swap lines in /etc/fstab
sudo vi /etc/fstab
# Comment: # /dev/mapper/swap_1 none swap sw 0 0
```

**Method 2: Limit swappiness** (alternative)
```bash
# Reduce swap tendency (0 = only in emergency)
sudo sysctl vm.swappiness=1

# Permanent
echo "vm.swappiness=1" | sudo tee -a /etc/sysctl.conf
```

---

# System Configuration: Swap Disabled

**Method 3: mlockall in Elasticsearch** (alternative)
```yaml
# elasticsearch.yml
bootstrap.memory_lock: true
```

**Verification**:
```json
GET /_nodes?filter_path=nodes.*.process.mlockall
```

---

# System Configuration: File Descriptors

Elasticsearch requires a [high number of file descriptors](https://www.elastic.co/guide/en/elasticsearch/reference/current/file-descriptors.html) to manage connections and index files.

**Minimum required**: 65536 file descriptors per Elasticsearch process

**Configuration for elasticsearch user**:
```bash
# /etc/security/limits.conf
elasticsearch  -  nofile  65536
elasticsearch  -  nproc   4096
```

**Verification**:
```bash
# Before starting Elasticsearch
ulimit -n
# Should display: 65536
```

```json
# After starting
GET /_nodes/stats/process?filter_path=nodes.*.process.max_file_descriptors
```

---

# System Configuration: File Descriptors

**Symptoms of too low limit**:
- "Too many open files" errors
- Inability to open new segments
- HTTP/transport connection failures

---
layout: section
---

# Part 2: Cluster Architecture

Node roles, topology, dedicated masters and data tiers

---

# Elasticsearch Node Roles

Elasticsearch allows specializing nodes with **roles** to optimize performance and stability.

| Role | Description | Resources | Workload |
|------|-------------|-----------|----------|
| **master** | Cluster management (state, shards, indices) | Medium CPU, low RAM | Low (metadata) |
| **data** | Data storage and search | High CPU, high RAM, fast disk | Very high |
| **data_hot** | Active data (frequent writes) | Very high CPU, fast SSD | Intensive indexing |
| **data_warm** | Older data (occasional reads) | Medium CPU, HDD acceptable | Moderate searches |
| **data_cold** | Archived data (rare reads) | Low CPU, slow HDD | Minimal |
| **ingest** | Data transformation (pipelines) | High CPU, moderate RAM | Data processing |
| **ml** | Machine Learning (anomaly detection) | Very high CPU, very high RAM | ML tasks |
| **coordinating** | Request routing (no data) | Medium CPU, moderate RAM | Distributed aggregations |

**Configuration**: In `elasticsearch.yml`, define `node.roles: [master, data]`

---

# Network Topology: Cluster Architecture

[Network topology](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-network.html) strongly impacts latency and availability.

**Small cluster (1-10 nodes)**:
- All nodes with **master + data + ingest** roles
- Maximum simplicity, easy to maintain
- Clients connect directly to nodes

**Medium cluster (10-50 nodes)**:
- **3 dedicated master nodes** (cluster management)
- **10-20 data nodes** (storage and search)
- **2-3 coordinating nodes** (request routing)
- Separation of responsibilities for stability

---

# Network Topology: Large Cluster

**Large cluster (50+ nodes)**:
- **Load Balancer** distributes client requests
- **Dedicated coordinating nodes** (routing only): `node.roles: []`
- **Hot-warm-cold architecture** for cost/performance optimization
  - **Hot**: Active data (fast SSD)
  - **Warm**: Older data (HDD)
  - **Cold**: Archives (economical storage)
- **3+ dedicated masters** for stability

---

# Basic Production Cluster (3-5 Nodes)

**Simple architecture** for small to medium workloads.

```
+---------------------------------------------+
|  3 Master-eligible + Data Nodes             |
|  +--------+  +--------+  +--------+         |
|  |  M+D   |  |  M+D   |  |  M+D   |         |
|  | Node1  |  | Node2  |  | Node3  |         |
|  +--------+  +--------+  +--------+         |
+---------------------------------------------+
```

**Configuration per node**:
```yaml
# elasticsearch.yml (on each node)
node.roles: [master, data, ingest]
cluster.initial_master_nodes: ["node1", "node2", "node3"]   # first start only, then remove it
discovery.seed_hosts: ["node1:9300", "node2:9300", "node3:9300"]
```

**Advantages**:
- Simple to configure and maintain
- High availability with 3-master quorum

**Disadvantages**:
- No separation of responsibilities (master and data share resources)
- Limited scalability (vertical scaling only)

---

# Dedicated Master Nodes

[Master nodes](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery.html) manage cluster state and must be stable.

**When to use dedicated masters?**
- Clusters >10 nodes
- Very high indexing/search loads
- Need for maximum stability

**Advantages**:
- Dedicated masters = cluster stability
- Data nodes added horizontally
- Failure isolation (data down != quorum loss)

---

# Dedicated Master Nodes: Configuration

**Master Node Configuration**:
```yaml
# elasticsearch.yml (master nodes)
node.name: master-1
node.roles: [master]
cluster.initial_master_nodes: ["master-1", "master-2", "master-3"]   # first start only, then remove it
discovery.seed_hosts: ["master-1:9300", "master-2:9300", "master-3:9300"]
```

**Data Node Configuration**:
```yaml
# elasticsearch.yml (data nodes)
node.name: data-1
node.roles: [data, ingest]
discovery.seed_hosts: ["master-1:9300", "master-2:9300", "master-3:9300"]
```

**Master node resources**: 2-4 cores, 8 GB RAM (4 GB heap), 50 GB disk

---

# Dedicated Master Nodes: Quorum

**Number of masters**:
- **3 masters**: Standard (tolerates 1 failure)
- **5 masters**: Large scale (tolerates 2 failures)
- **Always odd**: Avoids split-brain

**Quorum**:
```
Quorum = (number_masters / 2) + 1
3 masters -> quorum = 2
5 masters -> quorum = 3
```

---

# Hot-Warm-Cold Architecture

[Hot-warm-cold architecture](https://www.elastic.co/guide/en/elasticsearch/reference/current/data-tiers.html) optimizes cost and performance based on data age.

**Data tiers**:

**Hot tier** (recent data, <7 days):
- High performance nodes (NVMe SSD, 64 GB RAM, 16 cores)
- Intensive indexing and search
- Configuration: `node.roles: [ data_hot, data_content ]`

**Warm tier** (medium-age data, 7-90 days):
- Medium performance nodes (SATA SSD, 32 GB RAM, 8 cores)
- Occasional search, no indexing
- Configuration: `node.roles: [ data_warm, data_content ]`

---

# Hot-Warm-Cold Architecture

**Cold tier** (old data, >90 days):
- Low performance nodes (HDD, 16 GB RAM, 4 cores)
- Rare search, minimum cost
- Configuration: `node.roles: [ data_cold ]`

**Automatic migration**: Index Lifecycle Management (ILM) handles hot->warm->cold transitions.

---

# Hot-Warm-Cold Architecture: ILM Policy

**ILM Policy** for automatic migration:

```json
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": { "max_primary_shard_size": "50gb", "max_age": "1d" }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": { "number_of_shards": 1 },
          "forcemerge": { "max_num_segments": 1 }
        }
      }
    }
  }
}
```

---

# Hot-Warm-Cold Architecture: ILM Policy (continued)

**Cold and Delete Phases**:

```json
"cold": {
  "min_age": "30d",
  "actions": {
    "searchable_snapshot": {
      "snapshot_repository": "my_backup"
    }
  }
},
"delete": {
  "min_age": "90d",
  "actions": { "delete": {} }
}
```

---
layout: section
---

# Part 3: High Availability

Replication, allocation awareness, and cross-cluster replication

---

# High Availability: Principles

**High availability** = The cluster continues to function despite failures.

**HA Components**:
1. **Master quorum**: 3+ master-eligible nodes (avoid split-brain)
2. **Shard replicas**: 1+ replicas per primary shard
3. **Rack Awareness**: Distribute replicas across different availability zones
4. **Load Balancing**: Distribute requests across multiple nodes
5. **Monitoring and Alerting**: Detect failures quickly

---

# Replica Configuration

**Replicas** = Copies of primary shards to tolerate failures and distribute read load.

**Configure replica count**:

```json
# At index level
PUT /orders
{
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 2
  }
}

# Modify an existing index
PUT /orders/_settings
{
  "number_of_replicas": 2
}
```

**Replication strategy**:

| Environment | Replicas | Justification |
|-------------|----------|---------------|
| **Dev/Test** | 0 | Max performance, no HA required |
| **Staging** | 1 | Balance between HA and cost |
| **Production** | 1-2 | Standard HA (2 = tolerates 2 failures) |
| **Critical** | 2+ | Mission-critical (finance, healthcare) |

**Note**: `number_of_replicas = 2` means **3 total copies** (1 primary + 2 replicas)

---

# Rack Awareness (Shard Allocation Awareness)

**Problem**: If all primary and replica shards are on the same rack/zone -> rack failure = data loss.

**Solution**: **Rack Awareness** distributes replicas across different availability zones.

```
+-----------------------------------------------------------+
|  Zone A (Datacenter 1)    Zone B (Datacenter 2)           |
|  +--------------+          +--------------+               |
|  | Primary 0    |          | Replica 0    |               |
|  | Replica 1    |          | Primary 1    |               |
|  +--------------+          +--------------+               |
|                                                           |
|  If Zone A down -> Zone B has all the data                |
+-----------------------------------------------------------+
```

**Configuration**:

1. **Declare the awareness attribute** in `elasticsearch.yml`:

```yaml
# Node in Zone A
node.attr.zone: zone_a
cluster.routing.allocation.awareness.attributes: zone

# Node in Zone B
node.attr.zone: zone_b
cluster.routing.allocation.awareness.attributes: zone
```

2. **Force distribution** (optional but recommended):

```yaml
cluster.routing.allocation.awareness.force.zone.values: zone_a,zone_b
```

* Awareness alone already spreads the copies of a shard (primary and replicas) over the zones.
* **Forced** awareness adds one thing: if a zone goes down, its replicas are **not** recreated in the surviving zone, which would otherwise have to hold twice the shards and could fill up. They stay unassigned until the zone comes back.

---

# Shard Allocation Filtering

**Control** where shards are allocated according to custom attributes.

**Use Cases**:
- Migrate indices to new nodes
- Reserve certain nodes for critical indices
- Evacuate a node before maintenance

**Custom attributes**:

```yaml
# elasticsearch.yml
node.attr.type: hot
node.attr.environment: production
```

**Filter allocation by index**:

```json
# Allocate only on "hot" nodes
PUT /app-logs-2024.01/_settings
{
  "index.routing.allocation.require.type": "hot"
}

# Exclude certain nodes
PUT /app-logs-2024.01/_settings
{
  "index.routing.allocation.exclude._name": "node-3,node-4"
}

# Include only certain nodes
PUT /app-logs-2024.01/_settings
{
  "index.routing.allocation.include.environment": "production"
}
```

**Filter at cluster level**:

```json
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.exclude._ip": "192.168.1.50"
  }
}
```

---

# Cross-Cluster Replication (CCR)

**CCR** replicates indices from one cluster (leader) to another cluster (follower) for disaster recovery or geo-distribution.

```
+-----------------------------------------------------+
|  Primary Cluster (Paris)       DR Cluster (London)  |
|  +--------------+              +--------------+     |
|  | Leader Index |  ----------> |Follower Index|     |
|  |  orders      |   Replication|  orders      |     |
|  +--------------+              +--------------+     |
|                                                     |
|  If Paris down -> Switch to London                  |
+-----------------------------------------------------+
```

**Use Cases**:
- **Disaster Recovery**: Standby cluster in another region
- **Geo-distribution**: Data replicated near users
- **Reporting**: Separate reporting cluster from production cluster

---

# Cross-Cluster Replication: Configuration

1. **Configure the remote cluster** (on follower):

```json
PUT /_cluster/settings
{
  "persistent": {
    "cluster.remote.leader_cluster.seeds": [
      "paris-node1:9300",
      "paris-node2:9300"
    ]
  }
}
```

2. **Create a follower index**:

<!-- ci: skip -->
```json
PUT /orders/_ccr/follow
{
  "remote_cluster": "leader_cluster",
  "leader_index": "orders"
}
```

---
layout: section
---

# Part 4: Performance Tuning

Indexing, search, caches, profiling and thread pools

---

# Indexing Optimization

[Indexing optimization](https://www.elastic.co/guide/en/elasticsearch/reference/current/tune-for-indexing-speed.html) increases ingestion throughput.

**Optimization techniques**:

**1. Increase refresh interval**:
```json
PUT /my-index/_settings
{
  "index.refresh_interval": "30s"
}
```
Default: `1s`.
Less refresh = more throughput (tradeoff: visibility latency)

**2. Disable replicas during initial bulk**:
```json
PUT /my-index/_settings
{
  "index.number_of_replicas": 0
}
// After bulk: restore replicas
```

---

# Indexing Optimization

**3. Use Bulk API with optimal batches**:
```json
# Optimal batch size: 5-15 MB or 1000-5000 docs
POST /_bulk
{ "index": { "_index": "my-index" }}
{ "field": "value" }
{ "index": { "_index": "my-index" }}
{ "field": "another value" }
```

**4. Adjust write thread pool**:
Generally unnecessary, sign of CPU/RAM under-sizing.

---

# Search Optimization

[Search optimization](https://www.elastic.co/guide/en/elasticsearch/reference/current/tune-for-search-speed.html) reduces query latency.

**Optimization techniques**:

**1. Use filter context (cached)**:
```json
GET /products/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "category": "electronics" }},
        { "range": { "price": { "lte": 1000 }}}
      ]
    }
  }
}
```
Filters are cached, no expensive scoring.

---

# Search Optimization

**2. Optimize shard count**:
```
Optimal shard size: 10-50 GB
Too many small shards -> search overhead
```

**3. Force merge for read-only segments**:
```json
POST /old-index/_forcemerge?max_num_segments=1
```
Reduces segment count, accelerates searches.

---

# Caching Strategies

Elasticsearch uses several [caches](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-indices.html) to improve performance.

**Main caches**:

**1. Node Query Cache** (filter results cache):
```yaml
# elasticsearch.yml
indices.queries.cache.size: 10%  # % of heap
```
Stores filter context results.

**2. Shard Request Cache** (aggregation results cache):
```yaml
indices.requests.cache.size: 1%  # % of heap
```
Caches results for `size: 0` (aggregations only).

**3. Filesystem Cache** (OS-level):
Automatically managed by the OS (50% non-heap RAM). The most important!

---

# Caching Strategies

**Cache invalidation**:
```json
POST /my-index/_cache/clear
POST /_cache/clear?query=true&request=true&fielddata=true
```

---

# Query Tuning and Profiling

[Query profiling](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-profile.html) identifies bottlenecks.

**Enable profiling**:
```json
GET /products/_search
{
  "profile": true,
  "query": {
    "bool": {
      "must": [
        { "match": { "description": "smartphone" }},
        { "range": { "price": { "gte": 500 }}}
      ]
    }
  }
}
```

---

# Query Tuning and Profiling

**Profile result**:
```json
{
  "profile": {
    "shards": [{
      "searches": [{
        "query": [{
          "type": "BooleanQuery",
          "time_in_nanos": 1234567,
          "breakdown": {
            "score": 123456,
            "build_scorer": 234567,
            "match": 876543
          }
        }]
      }]
    }]
  }
}
```

**Analysis**: Identify expensive clauses (high time_in_nanos), optimize or rewrite.

---

# Thread Pools

Elasticsearch uses several [thread pools](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-threadpool.html) for different operations.

**Main thread pools**:
| Pool | Usage | Default Size | When to Adjust |
|------|-------|--------------|----------------|
| **search** | Search queries | `(cores x 3/2) + 1` | Intensive search |
| **write** | Document indexing | `cores` | Intensive indexing |
| **get** | GET requests by ID | `cores` | Frequent lookups |
| **analyze** | _analyze requests | `1` | Rarely adjusted |
| **refresh** | Index refresh | `(cores / 2)` | Rarely adjusted |

---

# Thread Pools

**Adjustment example** (rarely necessary):
```yaml
# elasticsearch.yml
thread_pool:
  write:
    size: 16
    queue_size: 1000
```

**Thread pools monitoring**:
```json
GET /_cat/thread_pool?v&h=node_name,name,active,queue,rejected
```

**Warning**: Increasing thread pools doesn't always improve performance. Often a symptom of CPU/memory under-sizing.

---

# Summary

- **Sizing** follows volume, throughput, latency and HA: CPU, RAM, disk, node count
- **System**: heap 50% of RAM, below ~31 GB, set in `jvm.options.d/`; swap disabled; 65536 file descriptors
- **Architecture**: separate roles — 3 dedicated masters, hot-warm-cold data tiers driven by ILM
- **High availability**: replicas (1-2), allocation awareness across zones, CCR to another region
- **Performance**: refresh interval and bulk for indexing; filter context, shard size and force merge for search

**Formulas**: data nodes `(volume / 30 TB) + 1` · heap `min(RAM / 2, ~31 GB)` · disk `volume x (1 + replicas) x 1.15 x 1.2` · master quorum `(masters / 2) + 1`

---
layout: cover
---

# Hands-on

## Workshop 15 - Sizing and performance

---
layout: cover
---

# Hands-on

## Workshop 16 - Alerting

---
layout: cover
---

# Hands-on

## Workshop 18 - Advanced architecture and production
