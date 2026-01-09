---
layout: cover
---

# Maintenance Operations

Backup management, restarts, and updates

---

# Learning Objectives

By the end of this module, you will be able to:

- **Configure and manage** snapshots (backups) and restorations
- **Plan and execute** node restarts without service interruption
- **Prepare and perform** Elasticsearch version upgrades
- **Use Kibana tools** to facilitate maintenance operations

---

# Why Maintenance is Critical

Maintenance operations ensure the **availability** and **durability** of your cluster:

**Common scenarios requiring maintenance**:
1. **Regular backup**: Protection against data loss (corruption, accidental deletion, disaster recovery)
2. **Planned restarts**: Configuration updates, hardware maintenance, system optimization
3. **Version upgrades**: New features, security fixes, performance improvements
4. **Hardware maintenance**: Disk replacement, memory addition, server migration
5. **Incident recovery**: Restoration following failure, data corruption, attack

**Key principle**: Any maintenance operation must minimize impact on service availability (**Rolling Operations**).

---
layout: section
---

# Part 1: Backup and Restore Procedures

Snapshots, repositories, and Snapshot Lifecycle Management

---

# Elasticsearch Snapshot Concepts

A **snapshot** is an incremental backup of the cluster or specific indices.

**Key characteristics**:
- **Incremental backup**: Only segments not previously backed up are copied
- **Optimized performance**: Snapshots do not significantly impact cluster performance
- **Flexible granularity**: Back up the entire cluster, specific indices, or data streams
- **Selective restoration**: Restore the complete cluster, individual indices, or even aliases
- **Version compatibility**: Snapshots created in version N can be restored in version N or N+1

**Documentation**: [Snapshot and Restore](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html)

---

# Snapshot Repository Types

A **repository** is the storage location for snapshots.

**Main types**:

| Type | Description | Use Case |
|------|-------------|----------|
| **fs** | Shared filesystem (NFS) | On-premise |
| **s3** | Amazon S3 | AWS / Cloud |
| **gcs** | Google Cloud Storage | GCP |
| **azure** | Azure Blob Storage | Azure |

---

# Repositories: Advanced Configuration

**Additional types**:
- **hdfs**: Hadoop HDFS (Hadoop ecosystem integration)
- **url**: Read-only HTTP/HTTPS (sharing between clusters)

**Common prerequisites**:
- All data/master nodes must access the repository
- Path declared in `path.repo` (elasticsearch.yml)

---

# Configuring a Filesystem Repository

**Step 1**: Configure `path.repo` in `elasticsearch.yml` on **all nodes**:

```yaml
path.repo: ["/mnt/elasticsearch/backups"]
```

**Step 2**: Restart nodes to apply the configuration

**Step 3**: Create the repository via API:

```bash
PUT /_snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/mnt/elasticsearch/backups",
    "compress": true,
    "chunk_size": "128mb",
    "max_restore_bytes_per_sec": "40mb",
    "max_snapshot_bytes_per_sec": "40mb"
  }
}
```

**Step 4**: Verify the repository:

```bash
GET /_snapshot/my_backup
```

---

# Creating Snapshots

**Complete cluster snapshot**:

```bash
PUT /_snapshot/my_backup/snapshot_1
{
  "indices": "*",
  "ignore_unavailable": true,
  "include_global_state": true,
  "metadata": {
    "taken_by": "ops-team",
    "taken_because": "daily-backup"
  }
}
```

**Snapshot of specific indices**:

```bash
PUT /_snapshot/my_backup/snapshot_products_2024_01_15
{
  "indices": "products-*,orders-2024-01-*",
  "ignore_unavailable": false,
  "include_global_state": false,
  "partial": false
}
```

**Important parameters**:
- `include_global_state: true`: Includes templates, ILM policies, ingest pipelines
- `partial: false`: Fails if a primary shard is not available
- `ignore_unavailable: true`: Ignores indices that don't exist

---

# Monitoring and Managing Snapshots

**List all snapshots from a repository**:

```bash
GET /_snapshot/my_backup/_all
```

**Get status of an in-progress snapshot**:

```bash
GET /_snapshot/my_backup/snapshot_1/_status
```

**Result**:
```json
{
  "snapshots": [{
    "snapshot": "snapshot_1",
    "repository": "my_backup",
    "state": "IN_PROGRESS",
    "shards_stats": {
      "initializing": 0,
      "started": 15,
      "finalizing": 0,
      "done": 85,
      "failed": 0,
      "total": 100
    },
    "stats": {
      "incremental": {
        "file_count": 1250,
        "size_in_bytes": 5368709120
      }
    }
  }]
}
```

---

# Restoring from a Snapshot

**Restore all indices**:

```bash
POST /_snapshot/my_backup/snapshot_1/_restore
{
  "indices": "*",
  "include_global_state": true,
  "ignore_unavailable": true
}
```

**Restore with renaming** (for testing or comparison):

```bash
POST /_snapshot/my_backup/snapshot_1/_restore
{
  "indices": "products",
  "rename_pattern": "(.+)",
  "rename_replacement": "restored_$1",
  "include_aliases": false
}
```

---

# Restoring from a Snapshot

**Partial restoration** (only certain indices):

```bash
POST /_snapshot/my_backup/snapshot_1/_restore
{
  "indices": "orders-2024-01-*",
  "ignore_unavailable": true,
  "include_global_state": false,
  "index_settings": {
    "index.number_of_replicas": 1
  }
}
```

**Note**: Restoration requires that target indices don't already exist (or are closed).

---

# Snapshot Lifecycle Management (SLM)

**SLM** automates snapshot creation and deletion according to defined policies.

**Create an SLM policy**:

```bash
PUT /_slm/policy/daily-snapshots
{
  "schedule": "0 30 1 * * ?",
  "name": "<daily-snap-{now/d}>",
  "repository": "my_backup",
  "config": {
    "indices": "*",
    "ignore_unavailable": true,
    "include_global_state": true
  },
  "retention": {
    "expire_after": "30d",
    "min_count": 5,
    "max_count": 50
  }
}
```

---

# Snapshot Lifecycle Management (SLM)

**Key parameters**:
- `schedule`: Cron expression (here: 1:30 AM every day)
- `name`: Name template with date (generates `daily-snap-2024-01-15`)
- `retention.expire_after`: Delete snapshots older than 30 days
- `retention.min_count`: Keep at least 5 snapshots even if expired
- `retention.max_count`: Never exceed 50 snapshots

---

# Managing SLM Policies

**Manually execute an SLM policy**:

```bash
POST /_slm/policy/daily-snapshots/_execute
```

**Check policy status**:

```bash
GET /_slm/policy/daily-snapshots
```

**Display execution history**:

```bash
GET /_slm/policy/daily-snapshots/_status
```

---

# Managing SLM Policies

**Result**:
```json
{
  "daily-snapshots": {
    "policy": { ... },
    "version": 1,
    "modified_date_millis": 1705305600000,
    "last_success": {
      "snapshot_name": "daily-snap-2024-01-15",
      "time": 1705306800000
    },
    "last_failure": null,
    "next_execution_millis": 1705393200000,
    "stats": {
      "snapshots_taken": 28,
      "snapshots_failed": 0,
      "snapshots_deleted": 3
    }
  }
}
```

---

# Deleting Snapshots

**Delete a specific snapshot**:

```bash
DELETE /_snapshot/my_backup/snapshot_1
```

**Warning**: Deleting a snapshot:
- Frees disk space for segments unique to that snapshot
- Does **not** affect segments shared with other snapshots (incremental snapshots)
- Can take time for large snapshots

**Delete a repository** (and all its snapshots):

```bash
DELETE /_snapshot/my_backup
```

**Best Practice**: Use SLM with `retention` to automate cleanup and avoid accumulation of obsolete snapshots.

---
layout: section
---

# Part 2: Node Restart Strategies

Rolling restarts and graceful shutdown

---

# Why a Rolling Restart?

A **rolling restart** allows restarting nodes one by one without service interruption.

**Common scenarios**:
- **Configuration change**: Modification of `elasticsearch.yml` or `jvm.options`
- **System update**: OS patches, security updates
- **Hardware maintenance**: Adding RAM, replacing disks
- **System optimization**: Kernel parameter changes, file descriptors

**Key principle**: Temporarily disable shard allocation to avoid unnecessary movements during restarts.

---

# Rolling Restart Procedure (1/2)

**Step 1**: Disable shard allocation

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "primaries"
  }
}
```

**Options**:
- `"all"`: Allocate all shards (primaries and replicas) - **normal value**
- `"primaries"`: Allocate only primary shards - **for rolling restart**
- `"new_primaries"`: Allocate only primaries of new indices
- `"none"`: Allocate no shards - **advanced use only**

**Step 2**: Stop index syncing (optional but recommended)

```bash
POST /_flush/synced
```

This accelerates shard recovery after restart.

---

# Rolling Restart Procedure (2/2)

**Step 3**: Stop a node

```bash
# Method 1: Graceful stop via systemd
sudo systemctl stop elasticsearch

# Method 2: Stop via script
sudo /usr/share/elasticsearch/bin/elasticsearch-service-mgmt.sh stop

# Method 3: Graceful kill (SIGTERM)
kill -SIGTERM <pid>
```

**Step 4**: Perform maintenance (config change, OS update, etc.)

**Step 5**: Restart the node

```bash
sudo systemctl start elasticsearch
```

**Step 6**: Verify the node has joined the cluster

```bash
GET /_cat/nodes?v&h=name,node.role,uptime,heap.percent,cpu,load_1m
```

Wait for the node to be **UP** with low uptime (indicating a recent restart).

---

# End of Rolling Restart Procedure

**Step 7**: Verify cluster health before moving to the next node

```bash
GET /_cluster/health?wait_for_status=yellow&timeout=5m
```

**Step 8**: Repeat steps 3-7 for each node

**Step 9**: Re-enable full shard allocation

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "all"
  }
}
```

**Step 10**: Verify final cluster status

```bash
GET /_cluster/health?wait_for_status=green&timeout=10m
```

**Tip**: Use `wait_for_status` and `timeout` to block until the cluster is stable.

---

# Graceful Shutdown: Avoiding Interruptions

A **graceful shutdown** properly stops Elasticsearch by completing in-progress operations.

**What happens during a graceful shutdown**:
1. Elasticsearch stops accepting new requests
2. In-progress requests are finalized (with timeout)
3. Primary shards are synchronized with their replicas
4. Translogs are flushed to disk
5. The process terminates properly

**System signals**:
- **SIGTERM**: Graceful shutdown (recommended)
- **SIGKILL**: Brutal stop (avoid, risk of corruption)

```bash
# Good: Graceful shutdown
kill -SIGTERM $(cat /var/run/elasticsearch/elasticsearch.pid)

# Bad: Brutal kill (use only if process is stuck)
kill -9 $(cat /var/run/elasticsearch/elasticsearch.pid)
```

---

# Verifying Shard State During Restart

**Monitor shard allocation**:

```bash
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason&s=state
```

**Shard states**:
- `STARTED`: Active and ready shard
- `INITIALIZING`: Shard being recovered
- `RELOCATING`: Shard being moved to another node
- `UNASSIGNED`: Unassigned shard (normal during node restart)

**Identify unassigned shards**:

```bash
GET /_cluster/allocation/explain
{
  "index": "my-index",
  "shard": 0,
  "primary": true
}
```

This provides a detailed explanation of why a shard is not assigned.

---
layout: section
---

# Part 3: Version Upgrade Planning

Rolling upgrades and compatibility

---

# Supported Upgrade Paths

Elasticsearch follows strict version compatibility rules.

**Upgrade rules**:
- **Minor upgrade**: 8.10 -> 8.11 -> 8.12 (always supported)
- **Rolling upgrade**: 8.x -> 8.y (one node at a time, no downtime)
- **Major upgrade**: 7.17 -> 8.x (last 7.x minor required)
- **Skip a major version**: 7.x -> 9.x (NOT supported)
- **Downgrade**: 8.5 -> 8.4 (NOT supported - restore from snapshot)

**Minimum version for upgrade to 8.x**:
- You must be on **Elasticsearch 7.17** minimum to migrate to 8.x
- Snapshots created in 7.x can be restored in 8.x

**Documentation**: [Upgrade Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup-upgrade.html)

---

# Upgrade Preparation

**Step 1**: Run the Upgrade Assistant (Kibana)

- Access **Stack Management** -> **Upgrade Assistant**
- Identify **breaking changes** and **deprecations**
- Resolve reported issues

**Step 2**: Check compatibility via API

```bash
GET /_migration/deprecations
```

Check levels: `warning`, `critical`

---

# Upgrade Preparation (example response)

**Example result**:
```json
{
  "cluster_settings": [{
    "level": "warning",
    "message": "Setting deprecated",
    "url": "https://www.elastic.co/guide/..."
  }],
  "index_settings": {
    "my-old-index": [{
      "level": "critical",
      "message": "Index uses deprecated mapping"
    }]
  }
}
```

---

# Upgrade Preparation (Continued)

**Step 3**: Create a complete snapshot

```bash
PUT /_snapshot/my_backup/pre_upgrade_snapshot
{
  "indices": "*",
  "include_global_state": true,
  "metadata": {
    "taken_before": "upgrade-to-8.12"
  }
}
```

**Step 4**: Test in a test environment
1. Restore snapshot in test cluster
2. Perform upgrade on test cluster
3. Validate functionality
4. Note issues

**Step 5**: Plan maintenance window
- **Rolling upgrades**: 1-2h
- **Full restart**: 15-30 min downtime

---

# Rolling Upgrade Procedure (1/2)

**Step 1**: Disable shard allocation

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "primaries"
  }
}
```

**Step 2**: Stop machine learning and monitoring tasks (if applicable)

```bash
POST _ml/set_upgrade_mode?enabled=true
```

**Step 3**: Stop a non-master node

```bash
sudo systemctl stop elasticsearch
```

**Recommended order**: data nodes -> ingest nodes -> coordinating nodes -> master nodes

---

# Rolling Upgrade Procedure (2/2)

**Step 4**: Upgrade Elasticsearch on the stopped node

```bash
# Debian/Ubuntu
sudo apt-get update
sudo apt-get install elasticsearch=8.12.0

# RHEL/CentOS
sudo yum update elasticsearch-8.12.0
```

**Step 5**: Update plugins (if installed)

```bash
sudo /usr/share/elasticsearch/bin/elasticsearch-plugin list
sudo /usr/share/elasticsearch/bin/elasticsearch-plugin remove <plugin-name>
sudo /usr/share/elasticsearch/bin/elasticsearch-plugin install <plugin-name>
```

**Step 6**: Start the updated node

```bash
sudo systemctl start elasticsearch
```

---

# End of Rolling Upgrade Procedure

**Step 7**: Verify the node has joined the cluster

```bash
GET /_cat/nodes?v&h=name,version,node.role,uptime
```

You should see the new version for the restarted node.

**Step 8**: Re-enable shard allocation

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "all"
  }
}
```

**Step 9**: Wait for cluster to be GREEN

```bash
GET /_cluster/health?wait_for_status=green&timeout=10m
```

**Step 10**: Repeat steps 3-9 for each remaining node

**Step 11**: Re-enable machine learning

```bash
POST _ml/set_upgrade_mode?enabled=false
```

---

# Post-Upgrade Verification

**Verify versions of all nodes**:

```bash
GET /_cat/nodes?v&h=name,version,build,jdk
```

**Verify indices and their versions**:

```bash
GET /_cat/indices?v&h=index,health,status,pri,rep,docs.count,store.size
```

**Run smoke tests**:
1. Index a test document
2. Search for the document
3. Run a simple aggregation
4. Verify Kibana dashboards

```bash
# Indexing test
POST /test-post-upgrade/_doc
{"timestamp": "2024-01-15T10:00:00Z", "message": "Post-upgrade test"}

# Search test
GET /test-post-upgrade/_search
```

---

# Handling Upgrade Problems

**Problem**: A node doesn't restart after upgrade

**Solutions**:
1. Check logs: `/var/log/elasticsearch/<cluster-name>.log`
2. Verify JVM compatibility (Elasticsearch 8.x requires Java 17+)
3. Verify memory parameters (`jvm.options`)
4. Verify permissions on data and log directories

**Problem**: Shards remain UNASSIGNED after upgrade

**Solutions**:
1. Check allocation: `GET /_cluster/allocation/explain`
2. Force allocation if necessary (last resort):

```bash
POST /_cluster/reroute
{
  "commands": [{
    "allocate_replica": {
      "index": "my-index",
      "shard": 0,
      "node": "node-1"
    }
  }]
}
```

---
layout: section
---

# Part 4: Kibana Management Tools

Graphical interfaces to facilitate maintenance

---

# Kibana Stack Management: Overview

**Stack Management** centralizes all Elasticsearch and Kibana administration tools.

**Access**: Kibana side menu -> Gear icon -> **Stack Management**

**Main sections for operations**:

| Section | Available Tools |
|---------|-----------------|
| **Data** | Index Management, Index Lifecycle Policies, Snapshot and Restore, Rollup Jobs, Transforms |
| **Ingest** | Ingest Pipelines, Logstash Pipelines |
| **Alerts and Insights** | Rules, Connectors, Cases |
| **Stack** | License Management, Upgrade Assistant |
| **Security** | Users, Roles, API Keys |

We will focus on **maintenance**-related tools: Index Management, Snapshot and Restore, and Upgrade Assistant.

---

# Index Management UI

**Access**: Stack Management -> Data -> **Index Management**

**Features**:

1. **Index overview**
   - Lists all indices with size, document count, health
   - Filtering and searching by index name
   - Sorting by different columns

2. **Actions on indices** (Actions button):
   - **Close / Open**: Close/open an index (frees memory without deleting)
   - **Force merge**: Optimize segments (recommended for unchanged indices)
   - **Freeze / Unfreeze**: Freeze an index (minimal memory footprint)
   - **Delete**: Permanently delete an index
   - **Edit settings**: Modify settings (replicas, refresh_interval, etc.)

3. **Template and component template management**
   - Create, modify, delete index templates
   - View templates applied to an index

---

# Index Management: Use Cases

**Use case 1**: Increase replica count for a critical index

1. Select the index in the list
2. Click **Manage** -> **Edit settings**
3. Modify `number_of_replicas`:

```json
{
  "index.number_of_replicas": 2
}
```

4. Click **Save**

**Use case 2**: Force merge after a major purge

1. Select the index
2. Click **Manage** -> **Force merge**
3. Configure:
   - **Max number of segments**: 1 (for maximum optimization)
   - Warning: Force merge is I/O intensive, perform during off-peak hours

**Use case 3**: Temporarily close inactive indices

1. Select indices to close
2. Click **Manage** -> **Close index**
3. Closed indices no longer use memory but remain on disk

---

# Snapshot and Restore UI

**Access**: Stack Management -> Data -> **Snapshot and Restore**

**"Repositories" tab**:
- View all configured repositories
- Add a new repository (fs, S3, GCS, Azure)
- Verify repository connectivity
- Delete a repository

**"Snapshots" tab**:
- List all snapshots from all repositories
- Create a new snapshot (with graphical index selector)
- View snapshot details (included indices, size, duration)
- Delete snapshots
- **Restore a snapshot** with graphical options

**"Policies" tab** (SLM):
- Create, modify, delete SLM policies
- View execution history
- Manually execute a policy

---

# Snapshot and Restore UI: Creating a Snapshot

**Graphical workflow**:

1. Go to **Snapshots** -> Click **Create a snapshot**

2. **Step 1: Repository**
   - Select the repository from the dropdown

3. **Step 2: Snapshot settings**
   - **Snapshot name**: Snapshot name (supports date variables)
   - **Indices**: Graphical selector with autocomplete
   - **Include global state**: Check to save templates, ILM policies, etc.
   - **Ignore unavailable indices**: Tolerate missing indices

4. **Step 3: Review**
   - Configuration summary
   - Click **Create snapshot**

5. **Monitoring**:
   - The snapshot list updates in real-time
   - Status: `IN_PROGRESS` -> `SUCCESS` or `FAILED`

---

# Snapshot and Restore UI: Restoring a Snapshot

**Graphical workflow**:

1. In the snapshot list, click on the snapshot name

2. Click **Restore**

3. **Step 1: Select indices**
   - Check indices to restore
   - Option: **Restore all indices**

4. **Step 2: Customize index settings** (optional)
   - Rename restored indices: `restored_*`
   - Modify settings (replicas, etc.)
   - Enable/disable alias restoration

5. **Step 3: Review and restore**
   - Verify configuration
   - Click **Restore snapshot**

6. **Monitoring**:
   - Track progress in **Index Management**
   - Restored indices appear with their new name

---

# Upgrade Assistant

**Access**: Stack Management -> Stack -> **Upgrade Assistant**

**Features**:

1. **Overview**:
   - Current cluster version
   - Target upgrade version
   - Number of critical issues, warnings, and info

2. **Deprecation issues**:
   - List of issues organized by category:
     - **Critical**: Must be resolved before upgrade
     - **Warning**: Recommended to resolve
     - **Info**: Information only

3. **Automated fixes**:
   - Some issues can be resolved automatically
   - Click **Fix** to apply the correction
   - Example: Automatic reindex to update obsolete mappings

4. **Reindex helper**:
   - Assistant for reindexing incompatible indices
   - Automatically generates reindexing configuration

---

# Upgrade Assistant: Resolving Deprecations

**Example of critical issue**:

```
Index 'logs-2023' uses deprecated mapping parameter
```

**Solution via Upgrade Assistant**:

1. Click on the issue to display details
2. Consult the linked documentation
3. Options:
   - **Option A**: Reindex without obsolete parameter
   - **Option B**: Delete if data not needed

---

# Upgrade Assistant: Reindex Helper

**Using the Reindex Helper**:
- Click **Reindex**
- Automatically generated configuration:

```json
{
  "source": { "index": "logs-2023" },
  "dest": { "index": "logs-2023-v2" }
}
```

**Actions**:
1. Launch reindexing
2. Monitor progress
3. Validate the new index
4. Delete the old one after validation

---

# Data Visualizer and Canvas for Monitoring

**Data Visualizer** (Machine Learning):

- Automatically analyze the data structure of an index
- Identify fields, types, cardinalities
- Detect anomalies in value distributions
- Useful for understanding an index before migration

**Canvas** (Kibana):

- Create custom presentation dashboards
- Integrate real-time data and static metrics
- Useful for creating maintenance reports for management

**Access**:
- Data Visualizer: Kibana Menu -> **Machine Learning** -> **Data Visualizer**
- Canvas: Kibana Menu -> **Canvas**

---

# Summary: Maintenance Operations

| Operation | Tools | Frequency | Impact |
|-----------|-------|-----------|--------|
| **Snapshots** | API `/_snapshot`, SLM, Kibana UI | Daily / Weekly | Minimal (asynchronous operation) |
| **Rolling Restart** | Scripts, systemctl | Monthly / Ad-hoc | None (if properly executed) |
| **Rolling Upgrade** | Package manager, Upgrade Assistant | Quarterly / Annual | Minimal (Rolling) |
| **Force Merge** | API `/_forcemerge`, Kibana Index Management | After bulk delete | High (I/O intensive) |
| **Reindex** | API `/_reindex`, Upgrade Assistant | Ad-hoc (deprecations) | High (CPU + I/O) |

**Key principles**:
1. **Always create a snapshot** before any major maintenance operation
2. **Test in test environment** before production
3. **Schedule during off-peak hours** to minimize impact
4. **Monitor metrics** during and after operations
5. **Document procedures** and results for future operations

---

# Key Takeaways

**Snapshots and Restoration**:
- Snapshots are **incremental** and optimized to minimize disk space
- **SLM** automates snapshot creation and cleanup
- Configure `path.repo` in `elasticsearch.yml` for filesystem repositories
- Use `include_global_state: true` to save templates and policies

**Rolling Restarts**:
- Temporarily disable shard allocation with `"primaries"` only
- Restart nodes **one by one** waiting for cluster to return to GREEN
- Use **SIGTERM** for graceful shutdown, never SIGKILL

**Upgrades**:
- Use **Upgrade Assistant** to identify and resolve deprecations
- Always create a **complete snapshot** before upgrade
- Respect **supported upgrade paths** (no major version skipping)
- Test upgrade in test environment before production

**Kibana Tools**:
- **Index Management** for managing settings, force merge, and open/close
- **Snapshot and Restore UI** for graphical snapshot interface
- **Upgrade Assistant** for preparing and validating updates

---

# Practical Exercises

Go to the practical workbook to complete the following labs:

**Lab 6.1**: Snapshot Creation and Restoration
Configure a repository, create snapshots, and restore indices

**Bonus Challenge 6.A**: Snapshot Lifecycle Management
Configure SLM policies with automatic retention

---

# Resources and Documentation

**Official Elasticsearch Documentation**:
- [Snapshot and Restore](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html)
- [Rolling Upgrades](https://www.elastic.co/guide/en/elasticsearch/reference/current/rolling-upgrades.html)
- [Cluster-level shard allocation](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-cluster.html)

**Practical Guides**:
- [Backup and Restore Best Practices](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore-apis.html)
- [Upgrade Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup-upgrade.html)

**Kibana Documentation**:
- [Index Management](https://www.elastic.co/guide/en/kibana/current/index-mgmt.html)
- [Snapshot and Restore UI](https://www.elastic.co/guide/en/kibana/current/snapshot-repositories.html)
