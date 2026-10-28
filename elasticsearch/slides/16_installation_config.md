---
layout: cover
---

# Installation and Configuration

Elasticsearch deployment and configuration for production

---

# Learning Objectives

At the end of this section, you will be able to:

- Install and initialize Elasticsearch nodes with basic configuration
- Configure and form a multi-node cluster with discovery mechanisms
- Manage configuration files (elasticsearch.yml, jvm.options, log4j2.properties)
- Use verification APIs to diagnose cluster status

---

# Elasticsearch Installation

[Elasticsearch can be installed](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html) in several ways depending on the target environment.

**Main installation methods**:
- **Package managers**: APT (Debian/Ubuntu), YUM (RHEL/CentOS), Homebrew (macOS)
- **Archives**: TAR.GZ (Linux/macOS), ZIP (Windows)
- **Docker**: Official image `docker.elastic.co/elasticsearch/elasticsearch`
- **Cloud**: Elastic Cloud (managed SaaS)

**Advantages by method**:
- Package managers: System integration (systemd), automatic updates
- Archives: Full control, environments without root privileges
- Docker: Isolation, reproducibility, orchestration (Kubernetes)
- Cloud: Zero infrastructure maintenance, automatic scaling

**Prerequisites**: none for Java: every package bundles its own JDK (since 7.0), the one to use. `ES_JAVA_HOME` only to force another JVM.

---

# Running with Docker

A single-node cluster for development:

```shell
docker run -p 9200:9200 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:9.5.5
```

**Other options**: Elastic Cloud, Elastic Cloud Enterprise, Helm chart / ECK for Kubernetes, GCP / AWS / Clever Cloud marketplaces

---

# Elasticsearch Directory Structure

After installation, understanding the file structure is essential for administration.

**Main directories**:

| Directory | Content | Description |
|-----------|---------|-------------|
| `/usr/share/elasticsearch/` | Binaries & libs | Elasticsearch installation |
| `/etc/elasticsearch/` | Configuration | elasticsearch.yml, jvm.options, log4j2.properties |
| `/var/lib/elasticsearch/` | Data | Indices (`path.data`) |
| `path.repo` (e.g. `/mnt/backups`) | Snapshots | Shared file system repository, to declare: no default |
| `/var/log/elasticsearch/` | Logs | Application logs |

---

# Elasticsearch Directory Structure (detail)

**Customization**: Paths configurable via `path.data`, `path.logs` in elasticsearch.yml

**Important subdirectories**:
- **bin/**: Executables (elasticsearch, elasticsearch-plugin)
- **lib/**: Java libraries
- **modules/**: Elasticsearch modules (x-pack, etc.)
- **certs/**: TLS certificates (ES 8.x+)

---

# Basic Configuration: elasticsearch.yml

The [elasticsearch.yml](https://www.elastic.co/guide/en/elasticsearch/reference/current/settings.html) file contains the main node configuration.

**Essential parameters**:
```yaml
cluster.name: production-cluster
node.name: node-1

# Node roles (ES 7.9+)
node.roles: [ master, data, ingest ]

# Network
network.host: 0.0.0.0
http.port: 9200
transport.port: 9300

# Paths
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch

# Security (ES 8.x+ enabled by default): written by the auto-configuration on first start
xpack.security.enabled: true
xpack.security.transport.ssl:
  enabled: true
  verification_mode: certificate
  keystore.path: certs/transport.p12
  truststore.path: certs/transport.p12
```

* `transport.ssl.enabled: true` alone, without keystore and truststore, prevents the node from starting.

**Important**: Restart required after modifying elasticsearch.yml

---

# Starting an Elasticsearch Node

**With systemd (package installation)**:
```bash
# Start the service
sudo systemctl start elasticsearch

# Check status
sudo systemctl status elasticsearch

# Enable at startup
sudo systemctl enable elasticsearch

# View logs in real-time
sudo journalctl -u elasticsearch -f
```

**With archive (manual startup)**:
```bash
# Start in foreground (for debugging)
./bin/elasticsearch

# Start in background (daemon)
./bin/elasticsearch -d -p pid

# Clean shutdown
kill -SIGTERM $(cat pid)
```

**First ES 8.x startup**: Note the auto-generated credentials and enrollment token in the logs!

---

# Verifying the Node

From Kibana Dev Tools: `GET /` — or from a terminal: `curl -u elastic https://localhost:9200/` (security is on by default since 8.0)

```json
{
  "name": "node-1",
  "cluster_name": "elasticsearch",
  "version": {
    "number": "9.5.5",
    "lucene_version": "10.5.1"
  },
  "tagline": "You Know, for Search"
}
```

---

# Cluster Setup: Discovery Mechanisms

Elasticsearch uses [automatic discovery](https://www.elastic.co/guide/en/elasticsearch/reference/current/discovery-hosts-providers.html) to form a cluster from individual nodes.

**Discovery mechanisms**:

1. **discovery.seed_hosts** (ES 7.x+):
```yaml
discovery.seed_hosts:
  - 192.168.1.10:9300
  - 192.168.1.11:9300
  - 192.168.1.12:9300
```
List of nodes to contact to join the cluster.

2. **cluster.initial_master_nodes** (first initialization):
```yaml
cluster.initial_master_nodes:
  - node-1
  - node-2
  - node-3
```

**Critical** : Required at first startup, prevents "split-brain". 

---

# Cluster Formation with Enrollment Tokens

Elasticsearch 8.x introduces [enrollment tokens](https://www.elastic.co/guide/en/elasticsearch/reference/current/configuring-stack-security.html) to secure node addition.

**Cluster formation workflow**:

1. **Start the first node (master)**:
```bash
./bin/elasticsearch
# Note the enrollment token in the startup logs
```

2. **Generate an enrollment token (if expired)**:
```bash
./bin/elasticsearch-create-enrollment-token -s node
```

3. **Join the cluster from a new node**:
```bash
./bin/elasticsearch --enrollment-token <TOKEN>
```

**Advantages**:
- ✅ Auto-configured TLS between nodes
- ✅ No manual certificate configuration
- ✅ Security by default (zero-config security)

---

# Node Roles

Each node can have one or more [roles](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-node.html) defining its responsibilities.

**Main roles**:
```yaml
node.roles: [ master, data, ingest, ml, transform ]
```

| Role | Responsibility | Use case |
|------|----------------|----------|
| **master** | Cluster management (index creation, shard allocation) | Dedicated master-only nodes for clusters >10 nodes |
| **data** | Data storage and search | Data-only nodes for intensive storage |
| **ingest** | Document preprocessing (pipelines) | Transformation before indexing |
| **ml** | Machine Learning jobs | Anomaly detection, forecasting |
| **transform** | Data transformations | Continuous aggregations |

**Recommended architectures**:
- **Small cluster (<10 nodes)**: All roles on all nodes
- **Large cluster**: Separate master-only / data-only / coordinating-only

---

# JVM Configuration: jvm.options.d/

Never edit `jvm.options` itself: add your [JVM options](https://www.elastic.co/guide/en/elasticsearch/reference/current/advanced-configuration.html#set-jvm-options) in a file of `jvm.options.d/`, which upgrades leave alone.

**`/etc/elasticsearch/jvm.options.d/heap.options`**:
```
# Heap size (ALWAYS identical for Xms and Xmx)
-Xms4g
-Xmx4g
```

* Without it, Elasticsearch sizes the heap itself from the node's roles and RAM (since 7.11): set it only when you need to.
* G1GC is already the default garbage collector: no need to set it.

---

# JVM Configuration: Monitoring and Dumps

**GC Logging and diagnostics**:

```
# GC logging for monitoring
-Xlog:gc*,gc+age=trace,safepoint:file=/var/log/elasticsearch/gc.log

# Memory dumps on OutOfMemoryError
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/lib/elasticsearch
```

**Heap sizing rules**:
- ✅ Maximum 50% of physical RAM (the rest for OS cache)
- ✅ Stay below ~31GB (beyond, the JVM loses compressed oops)
- ✅ -Xms = -Xmx (avoids dynamic resizing)

---

# Log Configuration: log4j2.properties

Elasticsearch uses [Log4j2](https://www.elastic.co/guide/en/elasticsearch/reference/current/logging.html) for logging.

**Log levels, in `log4j2.properties`**:
```properties
logger.action.name = org.elasticsearch.action
logger.action.level = info
```

**Slow log thresholds are index settings**, not log4j ones:
```json
PUT /my-index
{
  "settings": {
    "index.search.slowlog.threshold.query.warn": "10s",
    "index.search.slowlog.threshold.query.info": "5s",
    "index.indexing.slowlog.threshold.index.warn": "10s"
  }
}
```

---

# Log Configuration: log4j2.properties

**Dynamic adjustment** (without restart):
```json
PUT /_cluster/settings
{
  "persistent": {
    "logger.org.elasticsearch.discovery": "DEBUG"
  }
}
```

**Log types** (JSON, ECS format since 8.0): `<cluster>_server.json` (general), `<cluster>_deprecation.json`, `<cluster>_index_search_slowlog.json`, `<cluster>_index_indexing_slowlog.json`, `gc.log`

---

# Environment Variables

Elasticsearch supports configuration via [environment variables](https://www.elastic.co/guide/en/elasticsearch/reference/current/settings.html#_environment_variable_substitution) in elasticsearch.yml.

**Syntax**:
```yaml
node.name: ${HOSTNAME}
network.host: ${ES_NETWORK_HOST}
cluster.name: ${ES_CLUSTER_NAME:my-cluster}  # Default value: my-cluster
```

**Important system variables**:
```bash
# JVM Heap (alternative to jvm.options)
export ES_JAVA_OPTS="-Xms4g -Xmx4g"

# Configuration path
export ES_PATH_CONF=/etc/elasticsearch

# Read by ${ES_CLUSTER_NAME} in elasticsearch.yml
export ES_CLUSTER_NAME=production
```

* The packages run Elasticsearch as the `elasticsearch` user (systemd): no variable for it, and it refuses to run as `root`.

**Use cases**: Containerized deployments (Docker, Kubernetes), CI/CD, multi-environments

---

# Verification APIs: _cat APIs

The [_cat APIs](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat.html) provide readable information about cluster status.

**Essential commands**:
```json
# Cluster health (global status)
GET /_cat/health?v

# Node list
GET /_cat/nodes?v

# Index list
GET /_cat/indices?v

# Shard list and allocation
GET /_cat/shards?v

# Current master
GET /_cat/master?v
```

**Useful parameters**:
- `?v`: Headers (column names)
- `?h=column1,column2`: Column selection
- `?s=column:asc`: Sort by column
- `?format=json`: JSON output instead of text

---

# Cluster Health API

The [_cluster/health](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-health.html) API returns detailed cluster status.

**Request**:
```json
GET /_cluster/health
```

**Response**:
```json
{
  "cluster_name": "production-cluster",
  "status": "green",
  "timed_out": false,
  "number_of_nodes": 3,
  "number_of_data_nodes": 3,
  "active_primary_shards": 10,
  "active_shards": 20,
  "relocating_shards": 0,
  "initializing_shards": 0,
  "unassigned_shards": 0
}
```

---

# Cluster Health API

**Status interpretation**:
- 🟢 **green**: All shards (primaries + replicas) are allocated
- 🟡 **yellow**: All primaries allocated, some replicas missing
- 🔴 **red**: At least one primary shard missing (potential data loss)

---

# Nodes Info and Stats API

**_nodes API** returns node information and statistics.

**Static information** (_nodes):
```json
GET /_nodes
GET /_nodes/node-1,node-2  # Specific nodes
GET /_nodes/_master        # Current master node
```

Returns: version, roles, OS, JVM, installed plugins

**Dynamic statistics** (_nodes/stats):
```json
GET /_nodes/stats
GET /_nodes/stats/jvm,os,process
```

Returns:
- **JVM**: Heap usage, GC stats, thread count
- **OS**: CPU, memory, swap usage
- **Process**: File descriptors, CPU time
- **Indices**: Indexing/search rates, doc count
- **HTTP**: HTTP requests in progress

---

# Cat Indices API

The [_cat/indices](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-indices.html) API lists all indices with their metrics.

**Request**:
```json
GET /_cat/indices?v&s=store.size:desc&h=index,health,status,pri,rep,docs.count,store.size
```

**Typical result**:
```
index          health status pri rep docs.count store.size
logs-2023.11   green  open     5   1   15000000      2.5gb
products       green  open     1   1     100000       50mb
users          yellow open     1   1      50000       10mb
```

**Useful columns**:
- **health**: green/yellow/red
- **pri**: Number of primary shards
- **rep**: Number of replicas
- **docs.count**: Number of documents
- **store.size**: Total size (primaries + replicas)

**Use case**: Monitoring index growth, identifying large indices

---

# Summary

## Key Points

- Elasticsearch **installation** supports multiple methods (packages, archives, Docker, cloud)
- The **directory structure** separates binaries (/usr/share), config (/etc), data (/var/lib), logs (/var/log)
- The **elasticsearch.yml** file contains the main configuration (cluster.name, node.roles, network, security)
- **Discovery mechanisms** enable automatic cluster formation (discovery.seed_hosts, enrollment tokens)
- **Node roles** define responsibilities (master, data, ingest, ml, transform)
- **Verification APIs** (_cat, _cluster/health, _nodes) allow cluster status diagnosis

---

# Summary

## Important Concepts

- **cluster.initial_master_nodes**: Required at first startup, remove afterwards
- **Enrollment tokens** (ES 8.x+): Automatic security for adding nodes
- **Heap sizing**: Maximum 50% RAM, stay below ~31GB, -Xms = -Xmx
- **Cluster health**: green (perfect), yellow (missing replicas), red (missing primaries)


---
layout: cover
---

# Hands-on

## Workshop 10 - Inspecting the cluster with the _cat APIs
