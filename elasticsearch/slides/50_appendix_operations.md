---
layout: cover
---

# Appendix — Operations Reference

Disaster recovery, operational checklists and incident runbooks

---
layout: section
---

# Part A: Disaster Recovery Planning

RPO, RTO, and backup strategies

---

# RPO and RTO: Definitions

**RPO (Recovery Point Objective)**: Maximum acceptable data loss

- RPO = 1 hour -> Snapshots every hour
- RPO = 5 minutes -> Cross-cluster replication (CCR, asynchronous)

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
| Critical health data | ~seconds | 5 min | CCR (asynchronous) + standby cluster |

---

# Backup Strategies

**3-2-1 Rule**: 3 copies, 2 different media, 1 copy off-site

**Strategy 1: Regular snapshots**:
- **RPO**: Depends on frequency (1h, 6h, 24h)
- **RTO**: Restoration time (15 min - 2h depending on size)

```json
# SLM policy for hourly snapshots
PUT /_slm/policy/hourly-snapshots
{
  "schedule": "0 0 * * * ?",
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

# Part B: Operational Checklists

Pre-deployment, monitoring, and incident response

---

# Pre-Deployment Checklist

**Before deploying to production**:

**Infrastructure**:
- Appropriate sizing (CPU, RAM, disk based on expected loads)
- Dedicated master nodes (3+ for quorum)
- Rack awareness configured (multi-AZ)
- Low-latency network between nodes: one region (zones are fine), never a cluster stretched over distant data centers (use CCR)
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
```json
[Alert] -> [Triage] -> [Diagnosis] -> [Mitigation] -> [Resolution] -> [Post-Mortem]
```

**Incident 1: Cluster status RED**

**Symptom**: `GET /_cluster/health` returns `"status": "red"`

**Triage**:
```json
GET /_cat/indices?v&health=red
GET /_cat/shards?v&h=index,shard,state,unassigned.reason
```

---

# Incident 1: Cluster RED (diagnosis)

**Diagnosis**:
```json
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

**Disk full mitigation**: free space first (delete old indices, add nodes); to buy time, raise the disk watermarks temporarily (see *Monitoring: Disk and I/O*), then reset them to `null`

**Corruption mitigation** (last resort: accepts losing the writes the stale copy missed):
<!-- ci: skip -->
```json
POST /_cluster/reroute
{
  "commands": [{
    "allocate_stale_primary": {
      "index": "my-index", "shard": 0, "node": "node-2",
      "accept_data_loss": true
    }
  }]
}
```

---

# Incident 2: Degraded Performance

**Symptom**: Slow searches (p95 > 1s), slow indexing

**Diagnosis**:
```json
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

**Thread pools mitigation**: queue sizes are **static** node settings — `elasticsearch.yml`, then a rolling restart:
```yaml
# elasticsearch.yml — a bigger queue only hides overload: prefer throttling clients
thread_pool.write.queue_size: 10000
```

**Temporarily drop the replicas** of a heavily indexed index (no copy to write twice):
```json
PUT /slow-index/_settings
{
  "index": { "number_of_replicas": 0 }
}

# After indexing, restore them
# ... "number_of_replicas": 1
```

* `cluster.routing.allocation.enable: primaries` does not stop replication: it only prevents allocating **new** replica shards (used during a rolling restart).

---

# Incident 3: Split-Brain Detection

**Symptom**: Two independent clusters form (data duplication, conflicts)

**Prevention**: built in since 7.0 — a master needs a quorum of the voting configuration, managed by Elasticsearch (`discovery.zen.minimum_master_nodes` is gone)
```yaml
# elasticsearch.yml — only when bootstrapping a NEW cluster, then remove it
cluster.initial_master_nodes: ["master-1", "master-2", "master-3"]
```

* Split brain today = two clusters bootstrapped separately (`initial_master_nodes` left in place, wiped data path)

**Diagnosis**:
```json
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
