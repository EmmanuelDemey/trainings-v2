---
layout: cover
---

# Performance and Sizing

Optimization and capacity planning for Elasticsearch

---

# Learning Objectives

By the end of this section, you will be able to:

- Size Elasticsearch infrastructure according to needs (CPU, memory, disk, nodes)
- Optimize system configuration for maximum performance
- Design a network topology adapted to latency and throughput requirements
- Apply optimization techniques for indexing and search

---

# Infrastructure Sizing

[Sizing an Elasticsearch cluster](https://www.elastic.co/guide/en/elasticsearch/reference/current/size-your-shards.html) depends on several critical factors.

**Factors to consider**:
- **Data volume**: Total size of indexes to store
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
- **Maximum heap**: 32 GB maximum (compressed oops limit)
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

**Why limit heap to 32 GB?** Beyond this, the JVM loses "compressed oops", increasing memory footprint by ~30-50%.

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
Data nodes = (Total number of shards) / 20 shards per node
```
(Maximum recommended: 20 shards/GB heap)

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
By shards: 100 shards / 20 = 5 nodes
Final recommendation: 5 data nodes
```

**Dedicated master nodes**: Recommended for clusters >10 nodes (3 masters minimum)

---

# System Configuration: Heap Size

[JVM heap sizing](https://www.elastic.co/guide/en/elasticsearch/reference/current/advanced-configuration.html#set-jvm-heap-size) is the most critical optimization.

**Configuration in jvm.options**:
```
# Always identical Xms = Xmx
-Xms16g
-Xmx16g
```

**Imperative rules**:
1. **-Xms = -Xmx** (avoids dynamic resizing)
2. **Maximum 32 GB** (compressed oops limit)
3. **50% of total RAM** (the rest for OS cache)
4. **Minimum 4 GB** for production

---

# System Configuration: Heap Size

**Verifying configuration**:
```bash
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
```bash
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

# System Configuration: Thread Pools

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

# System Configuration: Thread Pools

**Adjustment example** (rarely necessary):
```yaml
# elasticsearch.yml
thread_pool:
  write:
    size: 16
    queue_size: 1000
```

**Thread pools monitoring**:
```bash
GET /_cat/thread_pool?v&h=node_name,name,active,queue,rejected
```

**Warning**: Increasing thread pools doesn't always improve performance. Often a symptom of CPU/memory under-sizing.

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
- **Dedicated coordinating nodes** (routing only)
- **Hot-warm-cold architecture** for cost/performance optimization
  - **Hot**: Active data (fast SSD)
  - **Warm**: Older data (HDD)
  - **Cold**: Archives (economical storage)
- **3+ dedicated masters** for stability

---

# Network Topology: Latency and Throughput

Network performance is critical for a distributed cluster.

**Network requirements**:
- **Intra-cluster latency**: <1ms (ideally <0.5ms)
- **Intra-cluster throughput**: >=10 Gbps (ideally 40 Gbps)
- **Client-cluster latency**: <10ms for smooth user experience
- **Client-cluster throughput**: Depending on load (1-10 Gbps)

**Network configuration in elasticsearch.yml**:
```yaml
network.host: 0.0.0.0                    # Listen on all interfaces
http.port: 9200                          # REST API port
transport.port: 9300                     # Inter-node communication port

# Performance tuning
transport.tcp.compress: true             # Transport compression (lower bandwidth)
http.max_content_length: 100mb           # Max HTTP request size
```

---

# Network Topology: Dedicated Master Nodes

[Master nodes](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery.html) manage cluster state and must be stable.

**When to use dedicated masters?**
- Clusters >10 nodes
- Very high indexing/search loads
- Need for maximum stability

**Master-only node configuration**:
```yaml
# elasticsearch.yml
node.roles: [ master ]

# Minimal resources
# CPU: 2-4 cores
# RAM: 8 GB (4 GB heap)
# Disk: 50 GB
```

---

# Network Topology: Dedicated Master Nodes

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
- Configuration: `node.roles: [ data_hot ]`

**Warm tier** (medium-age data, 7-90 days):
- Medium performance nodes (SATA SSD, 32 GB RAM, 8 cores)
- Occasional search, no indexing
- Configuration: `node.roles: [ data_warm ]`

---

# Hot-Warm-Cold Architecture

**Cold tier** (old data, >90 days):
- Low performance nodes (HDD, 16 GB RAM, 4 cores)
- Rare search, minimum cost
- Configuration: `node.roles: [ data_cold ]`

**Automatic migration**: Index Lifecycle Management (ILM) handles hot->warm->cold transitions.

---

# Indexing Optimization

[Indexing optimization](https://www.elastic.co/guide/en/elasticsearch/reference/current/tune-for-indexing-speed.html) increases ingestion throughput.

**Optimization techniques**:

**1. Increase refresh interval**:
```json
PUT /my-index/_settings
{
  "index.refresh_interval": "30s"  // Default: 1s
}
```
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
```bash
# Optimal batch size: 5-15 MB or 1000-5000 docs
POST /_bulk
{ "index": { "_index": "my-index" }}
{ "field": "value" }
...
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
```bash
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

# Summary

## Key Points

- **Sizing** must consider volume, throughput, latency, and HA (CPU, RAM, disk, nodes)
- **System configuration** is critical: heap size (50% RAM, max 32 GB), swap disabled, file descriptors (65536)
- **Network topology** impacts performance and stability (dedicated masters, hot-warm-cold, latency <1ms)
- **Indexing optimization** involves refresh interval, bulk API, temporarily disabled replicas
- **Search optimization** uses filter context, shard sizing, force merge, routing, caching

## Important Formulas

- **Data nodes**: `(Total volume / 30 TB) + 1`
- **JVM Heap**: `min(RAM / 2, 32 GB)` and `-Xms = -Xmx`
- **Disk capacity**: `Volume x (1 + replicas) x 1.15 x 1.2`
- **Master quorum**: `(number_masters / 2) + 1`


