---
layout: cover
---

# Production Best Practices

Architecture, high availability, and operational management

---

# Learning Objectives

By the end of this module, you will be able to:

- **Design** an Elasticsearch cluster architecture for production
- **Configure** high availability with replication and rack awareness
- **Plan** disaster recovery with appropriate RPO/RTO
- **Apply** operational checklists for deployments and incidents

---

# Why Best Practices are Essential

A poorly configured production cluster can lead to **data loss** and **service interruptions**.

**Risks without best practices**:
1. **Split-brain**: Cluster divides into two independent parts (data corruption)
2. **Degraded performance**: Overloaded nodes, slow searches, blocked indexing
3. **Data loss**: No replicas, no snapshots, hardware failure
4. **Slow recovery**: No disaster recovery plan, RTO/RPO not met
5. **Unresolved incidents**: No runbooks, lost ops teams

**Objective**: Build a **resilient**, **performant**, and **maintainable** cluster.

---
layout: section
---

# Part 1: Cluster Architecture Patterns

Role separation and sizing

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

# Pattern 1: Basic Production Cluster (3-5 Nodes)

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
cluster.initial_master_nodes: ["node1", "node2", "node3"]
discovery.seed_hosts: ["node1:9300", "node2:9300", "node3:9300"]
```

**Advantages**:
- Simple to configure and maintain
- High availability with 3-master quorum

**Disadvantages**:
- No separation of responsibilities (master and data share resources)
- Limited scalability (vertical scaling only)

---

# Pattern 2: Dedicated Master Nodes (Recommended for Production)

**Separate roles** to prevent management tasks from impacting search performance.

**Architecture**:
- **3 Dedicated Master Nodes** (lightweight): Cluster management
- **6+ Data Nodes** (heavy): Storage and search

**Advantages**:
- Dedicated masters = cluster stability
- Data nodes added horizontally
- Failure isolation (data down != quorum loss)

---

# Pattern 2: Dedicated Masters Configuration

**Master Node Configuration**:
```yaml
# elasticsearch.yml (master nodes)
node.name: master-1
node.roles: [master]
cluster.initial_master_nodes: ["master-1", "master-2", "master-3"]
discovery.seed_hosts: ["master-1:9300", "master-2:9300", "master-3:9300"]
```

**Data Node Configuration**:
```yaml
# elasticsearch.yml (data nodes)
node.name: data-1
node.roles: [data, ingest]
discovery.seed_hosts: ["master-1:9300", "master-2:9300", "master-3:9300"]
```

---

# Pattern 3: Hot-Warm-Cold Architecture (ILM)

**Data separation** by age and access frequency.

**Architecture**:
- **HOT Tier**: Fast SSDs, intensive indexing (last 24h)
- **WARM Tier**: HDD, moderate reads (1-30 days)
- **COLD Tier**: Economical storage, rare reads (>30 days)

**Configuration**:
```yaml
# Hot node
node.roles: [data_hot, data_content]

# Warm node
node.roles: [data_warm, data_content]

# Cold node
node.roles: [data_cold]
```

---

# Pattern 3: ILM Policy Hot-Warm-Cold

**ILM Policy** for automatic migration:

```json
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": { "max_size": "50GB", "max_age": "1d" }
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

# Pattern 3: ILM Policy (continued)

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

# Pattern 4: Coordinating Nodes (Large Clusters)

**Dedicated coordinating nodes** to distribute the load of complex aggregations.

**Architecture**:
- **Load Balancer**: Distributes requests
- **3+ Coordinating Nodes**: Routing only (no data)
- **20+ Data Nodes**: Storage and query execution

**Coordinating Node Configuration**:
```yaml
node.roles: []  # Empty = coordinating only
```

**Use Case**: Clusters >50 nodes where aggregations consume a lot of memory

---

# Sizing: Rules of Thumb

**How many nodes and what size?**

| Resource | Recommendation | Justification |
|----------|----------------|---------------|
| **JVM Heap** | 50% of RAM, max 31 GB | Beyond 32GB, loss of compressed oops |
| **Total RAM** | 2x Heap (rest for OS cache) | OS cache accelerates disk reads |
| **CPU** | 8+ cores for data nodes | Parallel searches and indexing |
| **Disk** | SSD for hot, HDD for warm/cold | Critical latency for indexing |
| **Shards** | 20-50 GB per shard | Too small = overhead, too large = slow recovery |
| **Shards per node** | < 3000 shards | Beyond this, master performance degradation |

**Sizing example**:
- 500 GB active data
- 30 GB shards -> 17 primary shards
- Replication factor 1 -> 17 replicas
- Total: 34 shards
- Recommendation: 4-6 data nodes

---
layout: section
---

# Part 2: High Availability Configuration

Replication, rack awareness, and cross-cluster replication

---

# High Availability: Principles

**High availability** = The cluster continues to function despite failures.

**HA Components**:
1. **Master quorum**: 3+ master-eligible nodes (avoid split-brain)
2. **Shard replicas**: 1+ replicas per primary shard
3. **Rack Awareness**: Distribute replicas across different availability zones
4. **Load Balancing**: Distribute requests across multiple nodes
5. **Monitoring and Alerting**: Detect failures quickly

**Quorum formula**: `(number_masters / 2) + 1`
- 3 masters -> quorum = 2 (tolerance: 1 failure)
- 5 masters -> quorum = 3 (tolerance: 2 failures)

---

# Replica Configuration

**Replicas** = Copies of primary shards to tolerate failures and distribute read load.

**Configure replica count**:

```bash
# At index level
PUT /my-index
{
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 2
  }
}

# Modify an existing index
PUT /my-index/_settings
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

This forces Elasticsearch to **never allocate** primary and replica on the same zone.

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

```bash
# Allocate only on "hot" nodes
PUT /logs-2024-01/_settings
{
  "index.routing.allocation.require.type": "hot"
}

# Exclude certain nodes
PUT /logs-2024-01/_settings
{
  "index.routing.allocation.exclude._name": "node-3,node-4"
}

# Include only certain nodes
PUT /logs-2024-01/_settings
{
  "index.routing.allocation.include.environment": "production"
}
```

**Filter at cluster level**:

```bash
PUT /_cluster/settings
{
  "transient": {
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

**CCR Configuration**:

1. **Configure the remote cluster** (on follower):

```bash
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

```bash
PUT /orders/_ccr/follow
{
  "remote_cluster": "leader_cluster",
  "leader_index": "orders"
}
```

3. **Monitor replication**:

```bash
GET /orders/_ccr/stats
```

**Use Cases**:
- **Disaster Recovery**: Standby cluster in another region
- **Geo-distribution**: Data replicated near users
- **Reporting**: Separate reporting cluster from production cluster

---
layout: section
---

# Part 3: Disaster Recovery Planning

RPO, RTO, and backup strategies

---

# RPO and RTO: Definitions

**RPO (Recovery Point Objective)**: Maximum acceptable data loss

- RPO = 1 hour -> Snapshots every hour
- RPO = 5 minutes -> Synchronous replication (CCR)

**RTO (Recovery Time Objective)**: Maximum time to restore service

- RTO = 4 hours -> Manual restoration acceptable
- RTO = 15 minutes -> Standby cluster required

```
+----------------------------------------------------+
|  Incident Timeline                                 |
|                                                    |
|  [Incident] <-- RPO --> [Last Backup]              |
|      |                                             |
|      v                                             |
|  [Recovery Starts] <-- RTO --> [Service Restored]  |
+----------------------------------------------------+
```

**Examples by criticality**:

| Data Type | RPO | RTO | Strategy |
|-----------|-----|-----|----------|
| Application logs | 24h | 8h | Daily snapshots |
| Transactional data | 1h | 2h | Hourly snapshots + replicas |
| Financial data | 5 min | 15 min | CCR + multiple replicas |
| Critical health data | 0 (sync) | 5 min | Synchronous CCR + standby cluster |

---

# Backup Strategies

**3-2-1 Rule**: 3 copies, 2 different media, 1 copy off-site

**Strategy 1: Regular snapshots**:
- **RPO**: Depends on frequency (1h, 6h, 24h)
- **RTO**: Restoration time (15 min - 2h depending on size)

```bash
# SLM policy for hourly snapshots
PUT /_slm/policy/hourly-snapshots
{
  "schedule": "0 * * * *",
  "name": "<hourly-{now/h}>",
  "repository": "s3_backup",
  "config": {
    "indices": "*"
  },
  "retention": {
    "expire_after": "7d",
    "min_count": 24
  }
}
```

**Strategy 2: CCR for DR**:
- **RPO**: Near real-time (< 1 minute)
- **RTO**: Manual failover (5-15 minutes)

**Strategy 3: Hybrid (Snapshots + CCR)**:
- **CCR** for fast recovery
- **Snapshots** for protection against logical corruption and compliance

---

# Testing Disaster Recovery

**Golden rule**: An untested DR plan = no DR plan

**Regular tests**:

1. **Snapshot restoration test** (monthly):
   - Restore snapshot in test cluster
   - Verify data integrity
   - Measure restoration time (actual RTO)

2. **CCR failover test** (quarterly):
   - Promote follower index to leader
   - Redirect applications to DR cluster
   - Measure failover time

3. **Complete failure simulation** (annual):
   - Stop primary cluster
   - Activate DR cluster
   - Validate that applications work

**Document results**:
- Achieved RPO/RTO vs objectives
- Blockers encountered
- Corrective actions

---

# Disaster Recovery Checklist

**Before incident**:
- Automated snapshots (SLM) configured and tested
- CCR configured if RPO < 1h required
- Disaster recovery runbook documented and accessible
- Team trained on DR procedures
- Escalation contacts defined
- Access to emergency credentials available

**During incident**:
1. Assess scope (which indices/nodes affected?)
2. Decide: Local restoration or DR failover?
3. Execute appropriate runbook
4. Communicate status to stakeholders
5. Log all actions

**After incident**:
1. Post-mortem: Root cause, timeline, impact
2. Verify integrity of restored data
3. Update runbook if necessary
4. Plan preventive actions

---
layout: section
---

# Part 4: Operational Checklists

Pre-deployment, monitoring, and incident response

---

# Pre-Deployment Checklist

**Before deploying to production**:

**Infrastructure**:
- Appropriate sizing (CPU, RAM, disk based on expected loads)
- Dedicated master nodes (3+ for quorum)
- Rack awareness configured (multi-AZ)
- Optimized network (latency < 10ms between nodes)
- Firewall configured (port 9200, 9300)

**Elasticsearch Configuration**:
- Heap size = 50% RAM, max 31 GB
- Swap disabled (`bootstrap.memory_lock: true`)
- File descriptors >= 65535
- Virtual memory `vm.max_map_count` >= 262144
- Unique and meaningful cluster name

**Security**:
- Security enabled (`xpack.security.enabled: true`)
- TLS/SSL configured (transport and HTTP)
- Users and roles created according to least privilege principle
- Audit logging enabled
- Complex passwords for built-in users

**High Availability**:
- Replicas configured (1-2 based on criticality)
- SLM policies for automatic snapshots
- Snapshot repository tested
- CCR configured if RPO < 1h

**Monitoring**:
- Stack Monitoring enabled
- Alerts configured (cluster health, disk, heap)
- Kibana dashboards created for key metrics
- Integration with external monitoring system (Prometheus, Datadog)

---

# Monitoring Checklist

**Metrics to monitor continuously**:

**Cluster Health**:
- Cluster status (GREEN / YELLOW / RED)
- Number of active nodes
- Unassigned shards
- Pending tasks

**Performance**:
- Indexing rate (docs/sec)
- Search rate (queries/sec)
- Search latency (p95, p99)
- Indexing latency

**Resources**:
- Heap usage (alert if > 85%)
- GC frequency and duration (alert if GC > 5s)
- Disk usage (alert if > 85%)
- CPU usage
- Network I/O

**Availability**:
- Node uptime
- Rejected requests (thread pools)
- Circuit breakers trips

**Recommended alert thresholds**:

| Metric | Warning | Critical |
|--------|---------|----------|
| Heap usage | > 75% | > 85% |
| Disk usage | > 75% | > 85% |
| GC duration | > 1s | > 5s |
| Cluster status | YELLOW | RED |
| Pending tasks | > 10 | > 50 |

---

# Incident Response Runbook

**General workflow**:
```
[Alert] -> [Triage] -> [Diagnosis] -> [Mitigation] -> [Resolution] -> [Post-Mortem]
```

**Incident 1: Cluster status RED**

**Symptom**: `GET /_cluster/health` returns `"status": "red"`

**Triage**:
```bash
GET /_cat/indices?v&health=red
GET /_cat/shards?v&h=index,shard,state,unassigned.reason
```

---

# Incident 1: Cluster RED (diagnosis)

**Diagnosis**:
```bash
GET /_cluster/allocation/explain
{
  "index": "problematic-index",
  "shard": 0,
  "primary": true
}
```

**Common causes**:
- Node(s) down -> Wait for recovery
- Disk full -> Free up space
- Corruption -> Restore from snapshot

---

# Incident 1: Cluster RED (mitigation)

**Disk full mitigation**:
```bash
PUT /_cluster/settings
{
  "transient": {
    "cluster.routing.allocation.disk.watermark.low": "95%"
  }
}
```

**Corruption mitigation**:
```bash
POST /_cluster/reroute
{
  "commands": [{
    "allocate_replica": {
      "index": "my-index", "shard": 0, "node": "node-2"
    }
  }]
}
```

---

# Incident 2: Degraded Performance

**Symptom**: Slow searches (p95 > 1s), slow indexing

**Diagnosis**:
```bash
GET /slow-index/_settings
GET /_nodes/hot_threads
GET /_cat/tasks?v&detailed
GET /_cat/thread_pool?v&h=name,active,rejected
```

**Common causes**:
- Heavy queries (wildcards)
- Heap pressure (GC thrashing)
- Disk I/O (merges)
- Unbalanced shard allocation

---

# Incident 2: Degraded Performance (mitigation)

**Thread pools mitigation**:
```bash
PUT /_cluster/settings
{
  "transient": {
    "thread_pool.write.queue_size": 1000
  }
}
```

**Temporarily disable replication**:
```bash
PUT /_cluster/settings
{
  "transient": {
    "cluster.routing.allocation.enable": "primaries"
  }
}

# After indexing, re-enable
# ... "enable": "all"
```

---

# Incident 3: Split-Brain Detection

**Symptom**: Two independent clusters form (data duplication, conflicts)

**Prevention**:
```yaml
# elasticsearch.yml
discovery.zen.minimum_master_nodes: 2  # For 3 masters (quorum)
```

**Diagnosis**:
```bash
# Check elected masters
GET /_cat/master?v

# Compare cluster state on different nodes
GET /_cluster/state/master_node
```

**Resolution**:
1. **Stop writing** on both clusters
2. **Identify the authoritative cluster** (most recent/complete)
3. **Stop the non-authoritative cluster**
4. **Merge data** if necessary via restoration
5. **Reconfigure discovery.seed_hosts** to avoid recurrence

---

# Post-Incident Actions

**Post-Mortem Template**:

```markdown
# Incident Post-Mortem: [Title]

**Date**: 2024-01-15
**Duration**: 2h 30min
**Impact**: Searches unavailable for 10% of users

## Timeline
- 10:00: Cluster RED alert
- 10:05: Ops team notified
- 10:15: Diagnosis identifies disk full
- 10:45: Adding data nodes, shard reallocation
- 12:30: Cluster GREEN, service restored

## Root Cause
Unexpected data growth (3x normal) due to application bug

## Impact
- 2000 failed requests
- 0 data loss (replicas OK)

## Corrective Actions
1. Implement alert on abnormal data growth
2. Automate node addition (horizontal scaling)
3. Fix the application bug
4. Increase disk watermark thresholds

## Lessons Learned
- Need for more proactive capacity planning
- Disk full runbook needs updating
```

---

# Summary: Production Best Practices

| Domain | Best Practice | Benefit |
|--------|---------------|---------|
| **Architecture** | Dedicated master nodes (3+) | Cluster stability |
| **Architecture** | Hot-Warm-Cold tiers | Cost optimization |
| **Sizing** | Heap <= 31 GB, 50% RAM | Optimal performance |
| **HA** | Replicas + Rack Awareness | Fault tolerance |
| **HA** | CCR for DR (RPO < 1h) | Fast recovery |
| **Backup** | Automated SLM + monthly tests | Data protection |
| **Monitoring** | Alerts on heap, disk, status | Early detection |
| **Security** | TLS + RBAC + Audit logging | Compliance and protection |
| **Operations** | Documented and tested runbooks | Fast incident resolution |

**Fundamental principle**: **Design for Failure**

---

# Key Takeaways

**Architecture**:
- Separate roles (dedicated masters, data tiers)
- Size according to actual loads (load testing)
- Hot-Warm-Cold to optimize costs

**High Availability**:
- Master quorum (3+), replicas (1-2)
- Rack awareness for geographic distribution
- CCR for multi-region disaster recovery

**Disaster Recovery**:
- Define RPO/RTO according to business criticality
- Automated snapshots (SLM) + regular tests
- Documented and practiced DR runbooks

**Operations**:
- Rigorous pre-deployment checklists
- Proactive monitoring with alerts
- Incident response runbooks for common scenarios
- Post-mortems after each incident

---

# Resources and Documentation

**Official Elasticsearch Documentation**:
- [Cluster design](https://www.elastic.co/guide/en/elasticsearch/reference/current/scalability.html)
- [High availability](https://www.elastic.co/guide/en/elasticsearch/reference/current/high-availability.html)
- [Shard allocation awareness](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-cluster.html#shard-allocation-awareness)

**Production Guides**:
- [Production deployment](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup.html)
- [Disaster recovery](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html)
- [Monitoring best practices](https://www.elastic.co/guide/en/elasticsearch/reference/current/monitor-elasticsearch-cluster.html)

**Blogs and whitepapers**:
- [Elasticsearch Best Practices](https://www.elastic.co/blog/found-elasticsearch-in-production)
- [Sizing Elasticsearch](https://www.elastic.co/elasticon/conf/2016/sf/quantitative-cluster-sizing)
