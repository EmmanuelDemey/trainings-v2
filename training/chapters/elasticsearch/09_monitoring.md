---
layout: cover
---

# Monitoring Strategy

Surveillance and observability of Elasticsearch in production

---

# Learning Objectives

By the end of this section, you will be able to:

- Use native monitoring APIs to collect cluster metrics
- Identify and monitor critical metrics for cluster health
- Configure and leverage Kibana monitoring interfaces (Stack Monitoring)
- Analyze Elasticsearch logs to diagnose operational problems

---

# Why Monitor Elasticsearch?

Proactive monitoring is essential for maintaining a healthy Elasticsearch cluster.

**Monitoring objectives**:
- **Early detection**: Identify problems before user impact
- **Capacity planning**: Anticipate resource needs
- **Troubleshooting**: Quickly diagnose incidents
- **Optimization**: Identify performance bottlenecks
- **SLA compliance**: Verify availability objectives are met

**Monitoring levels**:
1. **Infrastructure**: CPU, RAM, disk, network (OS-level)
2. **Cluster**: Health, nodes, shards, indices (Elasticsearch APIs)
3. **Application**: Request latency, error rate, throughput
4. **Business**: Business metrics (document volume, active users)

---

# Native Monitoring APIs

Elasticsearch provides several [monitoring APIs](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster.html) to observe cluster state.

**Essential APIs**:

| API | Usage | Recommended Frequency |
|-----|-------|-----------------------|
| `_cluster/health` | Overall cluster health | 30s - 1min |
| `_cluster/stats` | Aggregated cluster statistics | 1 - 5min |
| `_nodes/stats` | Detailed per-node metrics | 30s - 1min |
| `_cat/indices` | Index state and size | 1 - 5min |
| `_cat/shards` | Shard allocation and state | 1 - 5min |
| `_nodes/hot_threads` | Active CPU threads (debug) | On demand |
| `_cat/pending_tasks` | Pending master tasks | 30s - 1min |

**General principle**: Lightweight and frequent queries for rapid detection, heavy queries less frequently.

---

# Cluster Stats API

The [_cluster/stats](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-stats.html) API provides aggregated statistics for the entire cluster.

**Request**:
```bash
GET /_cluster/stats
```

**Key metrics returned**:
```json
{
  "cluster_name": "production",
  "nodes": {
    "count": { "total": 10, "data": 7, "master": 3 },
    "os": { "mem": { "total_in_bytes": 687194767360 }},
    "jvm": { "mem": { "heap_used_in_bytes": 123456789 }}
  },
  "indices": {
    "count": 150,
    "docs": { "count": 50000000 },
    "store": { "size_in_bytes": 1099511627776 },
    "shards": { "total": 450, "primaries": 225 }
  }
}
```

**Use case**: Cluster overview for dashboards, ratio calculations (heap usage rate, storage growth rate).

---

# Nodes Stats API

The [_nodes/stats](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-nodes-stats.html) API returns detailed metrics per node.

**Request with filters**:
```bash
GET /_nodes/stats/jvm,os,process,indices,fs,thread_pool,breaker
```

**Important sections**:
- **jvm**: `mem.heap_used_percent`, `gc.collectors.*.collection_time_in_millis`
- **os**: `cpu.percent`, `mem.used_percent`, `swap.used_in_bytes`
- **process**: `cpu.percent`, `open_file_descriptors`
- **indices**: `indexing.index_total`, `search.query_total`, `search.query_time_in_millis`
- **fs**: `total.available_in_bytes`, `io_stats.total.operations`
- **thread_pool**: `*.rejected` (critical rejections)
- **breaker**: Triggered circuit breakers

**Monitoring key**: `indices.indexing.index_time_in_millis / indices.indexing.index_total` = average indexing latency

---

# Cat Indices and Shards API

The [_cat APIs](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat.html) offer concise views for daily operations.

**Cat Indices** (index state):
```bash
GET /_cat/indices?v&h=index,health,status,pri,rep,docs.count,store.size&s=store.size:desc
```

Result:
```
index          health status pri rep docs.count store.size
logs-2023.11   green  open     5   1   15000000      2.5gb
products       yellow open     1   1     100000       50mb
```

**Cat Shards** (location and state):
```bash
GET /_cat/shards?v&h=index,shard,prirep,state,node,store&s=store:desc
```

Result:
```
index     shard prirep state   node    store
logs-2023 0     p      STARTED node-1  512mb
logs-2023 0     r      STARTED node-2  512mb
```

**Use case**: Rapid identification of unassigned shards, large indices, unbalanced distribution.

---

# Hot Threads API (Troubleshooting)

The [_nodes/hot_threads](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-nodes-hot-threads.html) API identifies threads consuming the most CPU.

**Request**:
```bash
GET /_nodes/hot_threads
GET /_nodes/node-1/hot_threads?threads=5&interval=500ms&type=cpu
```

**Parameters**:
- `threads`: Number of threads to display (default: 3)
- `interval`: Sampling period (default: 500ms)
- `type`: `cpu` (default), `wait`, `block`

**Result** (excerpt):
```
::: {node-1}{abc123}
   Hot threads at 2023-11-10T10:30:00.000Z, interval=500ms, busiestThreads=5:

   99.8% (499ms out of 500ms) cpu usage by thread 'elasticsearch\[node-1\]\[search\]\[T#5\]'
     org.elasticsearch.search.SearchService.executeQueryPhase()
     org.elasticsearch.search.query.QueryPhase.execute()
```

**Usage**: Diagnosing CPU spikes, identifying expensive queries in real-time.

---

# Critical Metrics: Cluster Health

[Cluster health](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-health.html) is the most important metric to monitor.

**Status colors**:
- GREEN: All shards (primaries + replicas) allocated
- YELLOW: All primaries allocated, some replicas missing
- RED: At least one primary shard missing - DATA LOSS

**Detailed request**:
```bash
GET /_cluster/health?level=indices
```

**Alerts to configure**:
```yaml
# Recommended alert thresholds
cluster.status:
  CRITICAL: status == "red"         # Immediate alert
  WARNING: status == "yellow"       # Investigate within 15min

unassigned_shards:
  CRITICAL: > 10                    # Immediate action
  WARNING: > 0                      # Investigate

active_shards_percent:
  CRITICAL: < 90%                   # Serious allocation problem
  WARNING: < 98%                    # Increased surveillance
```

---

# Critical Metrics: CPU and Memory

**CPU** and **memory** monitoring is critical for stability.

**CPU monitoring**:
```bash
GET /_nodes/stats/os,process?filter_path=nodes.*.os.cpu,nodes.*.process.cpu
```

**CPU thresholds**:
- **<60%**: Healthy
- **60-80%**: Monitor, plan scaling
- **>80%**: Critical, risk of latency degradation
- **>95%**: Overloaded cluster, immediate action

**Heap memory monitoring**:
```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem
```

**Heap thresholds**:
- **<75%**: Healthy
- **75-85%**: Monitor GC frequency
- **>85%**: Risk of OutOfMemoryError
- **>95%**: GC thrashing likely, circuit breakers activated

**Garbage Collection**:
```
gc_collection_time / gc_collection_count = average GC duration
If average >100ms -> heap or GC tuning issue
```

---

# Critical Metrics: Disk and I/O

[Disk monitoring](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-cluster.html#disk-based-shard-allocation) prevents failures due to disk filling.

**Disk space monitoring**:
```bash
GET /_nodes/stats/fs?filter_path=nodes.*.fs.total
```

**Disk thresholds** (disk-based shard allocation):
- **<85%**: Healthy
- **85-90%**: LOW Watermark - no new shard allocation on this node
- **90-95%**: HIGH Watermark - relocate shards from this node
- **>95%**: FLOOD Watermark - indices go read-only!

**Watermarks configuration**:
```json
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.disk.watermark.low": "85%",
    "cluster.routing.allocation.disk.watermark.high": "90%",
    "cluster.routing.allocation.disk.watermark.flood_stage": "95%"
  }
}
```

**I/O stats**: `fs.io_stats.total.operations`, `fs.io_stats.total.read_time` (I/O latency)

---

# Critical Metrics: Indexing and Search

**Indexing** and **search** metrics measure application performance.

**Indexing metrics**:
```bash
GET /_nodes/stats/indices?filter_path=nodes.*.indices.indexing
```

Key metrics:
- `indexing.index_total`: Total number of indexed documents
- `indexing.index_time_in_millis`: Total indexing time
- `indexing.index_failed`: Failed documents (should be close to 0)

**Average latency calculation**:
```
avg_indexing_latency = index_time_in_millis / index_total
```

**Search metrics**:
```bash
GET /_nodes/stats/indices?filter_path=nodes.*.indices.search
```

Key metrics:
- `search.query_total`: Number of queries
- `search.query_time_in_millis`: Total search time
- `search.fetch_total`, `search.fetch_time_in_millis`: Fetch phase

**Average latency calculation**:
```
avg_search_latency = query_time_in_millis / query_total
```

---

# Critical Metrics: Thread Pool Rejections

[Thread pool rejections](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-threadpool.html) indicate cluster overload.

**Rejections monitoring**:
```bash
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.*.rejected
```

**Thread pools to monitor**:
- **write**: Indexing rejections -> Cluster overloaded in writes
- **search**: Search rejections -> Cluster overloaded in reads
- **get**: GET by ID rejections (rare)

**Alert thresholds**:
```yaml
thread_pool.*.rejected:
  WARNING: delta > 10/min        # Temporary overload
  CRITICAL: delta > 100/min      # Severe overload
```

**Corrective actions**:
- Short term: Client-side throttle, increase queue_size (temporary)
- Medium term: Optimize queries, add nodes
- Long term: Review architecture, sharding strategy

---

# Kibana Stack Monitoring: Overview

[Kibana Stack Monitoring](https://www.elastic.co/guide/en/kibana/current/xpack-monitoring.html) provides a graphical interface for monitoring Elasticsearch.

**Activation**:
```yaml
# elasticsearch.yml
xpack.monitoring.collection.enabled: true
```

**Main pages**:
1. **Overview**: Global health, active nodes, resource usage
2. **Nodes**: Detail per node (CPU, memory, disk, JVM)
3. **Indices**: Index list with metrics (size, docs, search rate)
4. **Advanced**: Logs, thread pools, CCR, Watcher

**Advantages vs raw APIs**:
- Graphical visualization with history (time-series)
- Integrated alerts (Elasticsearch Watcher)
- Correlation between metrics (CPU spike + search latency)
- Drill-down by node/index/shard

**Limitation**: Monitoring overhead (~5-10% resources). For critical clusters, consider external monitoring (Prometheus, Datadog).

---

# Kibana Stack Monitoring: Cluster Overview

The **Cluster Overview** page displays aggregated metrics in real-time.

**Main widgets**:

**1. Cluster Health**
- Status color (green/yellow/red)
- Number of active nodes
- Shards (total, primaries, replicas, unassigned)

**2. Search & Indexing Rate**
- Time-series graph of requests/sec
- Average latency (p50, p95, p99)
- Error rate

**3. Resource Usage**
- CPU usage (cluster average)
- JVM Heap (average across nodes)
- Disk usage (total and per node)

**4. Alerts**
- List of active alerts (disk watermark, heap high, etc.)

**Refresh configuration**: Default 10s, adjustable in Settings.

---

# Kibana Stack Monitoring: Nodes View

The **Nodes** page allows monitoring each node individually.

**Metrics per node**:

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| **CPU Usage** | % CPU used | >80% |
| **JVM Memory** | % heap used | >85% |
| **Disk Free Space** | Remaining disk space | <15% (85% full) |
| **Load Average** | System load (1m, 5m, 15m) | >cores x 1.5 |
| **Shards** | Number of shards on this node | >20/GB heap |

**Available graphs**:
- CPU usage over time
- JVM heap usage over time
- GC duration and frequency
- Indexing and search latency
- Disk I/O throughput

**Drill-down**: Click on a node to see logs, hot threads, stack traces.

---

# Kibana Stack Monitoring: Indices View

The **Indices** page monitors the health and performance of each index.

**Metrics per index**:
- **Health**: green/yellow/red
- **Status**: open/close
- **Document Count**: Number of documents
- **Size**: Total size (primaries + replicas)
- **Search Rate**: Searches/sec
- **Indexing Rate**: Documents/sec

**Time-series graphs**:
- Document count evolution
- Indexing rate (docs/s)
- Search rate (queries/s)
- Search latency (ms)

**Use cases**:
- Identify high-growth indices (capacity planning)
- Detect unused indices (candidates for deletion/archiving)
- Monitor yellow/red indices (allocation problems)

---

# Log Analysis: Locations

Elasticsearch generates several types of [logs](https://www.elastic.co/guide/en/elasticsearch/reference/current/logging.html) to diagnose problems.

**Default log files**:
```
/var/log/elasticsearch/
|- <cluster_name>.log              # Main log
|- <cluster_name>_deprecation.log  # Deprecation warnings
|- <cluster_name>_index_search_slowlog.log
|- <cluster_name>_index_indexing_slowlog.log
|- gc.log                          # Garbage Collection logs
```

**Log levels**:
- **ERROR**: Errors requiring action
- **WARN**: Warnings to monitor
- **INFO**: Normal events (startup, config changes)
- **DEBUG**: Details for troubleshooting (enable temporarily)
- **TRACE**: Very verbose details (dev only)

**Configuration in log4j2.properties**:
```properties
logger.action.name = org.elasticsearch.action
logger.action.level = info
```

---

# Log Analysis: Log4j2 Configuration

The [Log4j2](https://www.elastic.co/guide/en/elasticsearch/reference/current/logging.html#configuring-logging-levels) configuration controls log detail level.

**log4j2.properties file**:
```properties
# Global level
rootLogger.level = info

# Logger for a specific package
logger.discovery.name = org.elasticsearch.discovery
logger.discovery.level = debug

# Appender for log rotation
appender.rolling.type = RollingFile
appender.rolling.fileName = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}.log
appender.rolling.filePattern = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}-%d{yyyy-MM-dd}-%i.log.gz
appender.rolling.policies.type = Policies
appender.rolling.policies.time.type = TimeBasedTriggeringPolicy
appender.rolling.policies.time.interval = 1
appender.rolling.policies.size.type = SizeBasedTriggeringPolicy
appender.rolling.policies.size.size = 256MB
```

---

# Log Analysis: Log4j2 Configuration

**Dynamic modification** (without restart):
```json
PUT /_cluster/settings
{
  "transient": {
    "logger.org.elasticsearch.discovery": "DEBUG",
    "logger.org.elasticsearch.index.search.slowlog": "TRACE"
  }
}
```

---

# Log Analysis: Slow Logs

[Slow logs](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-slowlog.html) record queries exceeding latency thresholds.

**Configuration per index**:
```json
PUT /my-index/_settings
{
  "index.search.slowlog.threshold.query.warn": "10s",
  "index.search.slowlog.threshold.query.info": "5s",
  "index.search.slowlog.threshold.query.debug": "2s",
  "index.search.slowlog.threshold.query.trace": "500ms",

  "index.indexing.slowlog.threshold.index.warn": "10s",
  "index.indexing.slowlog.threshold.index.info": "5s",
  "index.indexing.slowlog.threshold.index.debug": "2s",
  "index.indexing.slowlog.threshold.index.trace": "500ms"
}
```

---

# Log Analysis: Slow Logs

**Slow log format**:
```
\[2023-11-10T10:30:15,123\]\[WARN \]\[i.s.s.query\] \[node-1\] \[my-index\]\[0\]
took\[5.2s\], took_millis\[5234\], types\[\], stats\[\], search_type\[QUERY_THEN_FETCH\],
total_shards\[5\], source\[{"query":{"match":{"field":"value"}}}\]
```

**Analysis**: Identify patterns (similar queries, same index), optimize or add resources.

---

# Log Analysis: Common Error Messages

Knowing how to interpret common errors accelerates troubleshooting.

**Frequent errors**:

**1. CircuitBreakerException**
```
\[parent\] Data too large, data for [<http_request>] would be [x], which is larger than the limit of [y]
```
-> Heap saturated, query too demanding. Actions: Reduce query size, increase heap, add nodes.

**2. EsRejectedExecutionException**
```
rejected execution of org.elasticsearch.transport.TransportService$7@abc on EsThreadPoolExecutor\[search, queue capacity = 1000\]
```
-> Thread pool saturated. Actions: Client-side throttle, optimize queries, scale cluster.

**3. SearchPhaseExecutionException**
```
Shard failures: \[failed shard on node \[xyz\]: query shard failed\]
```
-> Search failure on a shard. Actions: Check logs of concerned node, shard state.

**4. ClusterBlockException**
```
index \[my-index\] blocked by: \[FORBIDDEN/12/index read-only / allow delete (api)\];
```
-> Index in read-only (often disk watermark flood). Actions: Free disk space, increase watermark.

---

# Summary

## Key Points

- **Native APIs** (_cluster/health, _nodes/stats, _cat APIs) are essential for real-time monitoring
- **Critical metrics** include: cluster health, CPU/memory/disk, indexing/search rates, thread pool rejections
- **Kibana Stack Monitoring** offers a complete graphical interface with history and integrated alerts
- **Log analysis** (main log, slow logs, GC logs) allows diagnosing operational problems
- **Alert thresholds** must be configured for early detection: heap >85%, disk >85%, CPU >80%

---

# Summary

## Quick Reference APIs

| API | Key Metric | Frequency |
|-----|------------|-----------|
| `_cluster/health` | status (green/yellow/red) | 30s |
| `_nodes/stats/jvm` | heap_used_percent | 1min |
| `_nodes/stats/os` | cpu.percent | 1min |
| `_cat/indices` | health, store.size | 5min |
| `_nodes/hot_threads` | Active CPU threads | On demand |

---

# Practical Exercises

Now proceed to the **exercise workbook** to practice these concepts.

**Labs to complete**:
- Lab 4.1: Using native monitoring APIs
- Lab 4.2: Configuring critical alert thresholds
- Lab 4.3: Exploring Kibana Stack Monitoring

**These exercises cover**:
- Queries on _cluster/health, _nodes/stats, _cat APIs
- Slow logs and watermarks configuration
- Navigation in Kibana Stack Monitoring
- Log interpretation and simulated problem diagnosis
