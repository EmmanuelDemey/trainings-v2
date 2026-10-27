---
layout: cover
---

# Snapshot and Restore API

---

# Snapshot and Restore API

* APIs allowing us to define backups of our data, in order to:
    * perform regular backups
    * recover deleted data
    * transfer data between two clusters
    * use Searchable Snapshots

---

# Snapshot and Restore API

* We can create a backup of:
    * an entire index or a portion
    * the cluster state (Cluster settings, template, Ingest, ...)

---

# Snapshot and Restore API

* First thing to do is to create a `repository`
* Possibility to use different types
    * Shared file system, Read-only URL
    * Azure, S3, Google Cloud Storage
    * Via plugins: Hadoop Distributed File System

---

# Snapshot and Restore API

* The action consists of three steps:
    * Creating a repository
    * Creating the Snapshot
    * Restoring the Snapshot

---

# Creating a repository

Declare the allowed locations in `elasticsearch.yml` (`-e path.repo=…` with Docker), on a file system shared by every node

```
path:
  repo:
    - /usr/share/elasticsearch/backups
```

---

# Creating a repository

```json
PUT /_snapshot/backups_1
{
    "type": "fs",
    "settings": {
        "location": "/usr/share/elasticsearch/backups/backups_1"
    }
}
```

---

# Creating the Snapshot

* A snapshot can be created
    * automatically through a `Snapshot Lifecycle Management` rule
    * manually using an API

---

# Automatic Snapshot Creation

```json
PUT _slm/policy/nightly-snapshots
{
  "schedule": "0 30 1 * * ?",       
  "name": "<nightly-snap-{now/d}>", 
  "repository": "backups_1",    
  "config": {
    "indices": "*",                 
    "include_global_state": true    
  },
  "retention": {                    
    "expire_after": "30d",
    "min_count": 5,
    "max_count": 50
  }
}
```

```json
POST _slm/policy/nightly-snapshots/_execute
```

---

# Manual Snapshot Creation

```json
PUT /_snapshot/backups_1/snapshot_1?wait_for_completion=true
{
  "indices": "index_1,index_2",
  "ignore_unavailable": true,
  "include_global_state": false,
  "metadata": {
    "taken_by": "Emmanuel DEMEY"
  }
}
```

---

# Restoring the Snapshot

```json
POST /_snapshot/backups_1/snapshot_1/_restore
{
  "indices": "index_1,index_2",
  "ignore_unavailable": true,
  "include_global_state": false,
  "rename_pattern": "index_(.+)",
  "rename_replacement": "restored_index_$1",
  "include_aliases": false
}
```

---
layout: cover
---

# Demo in Kibana

---
layout: cover
---

# Rolling upgrade: from 7 to 8

<!-- ci: skip-start -->

---

# Upgrade paths

* A major version is never skipped: **7.x → 7.17 → 8.x**
  * the rolling upgrade to 8 starts from the **last 7.17 patch**
  * the same rule applies after: **8.x → 8.19 → 9.x**
* An index can only be read by the **next** major version
  * Elasticsearch 8 refuses an index **created in 6.x**: reindex it, or delete it, in 7.17
  * Elasticsearch 9 refuses an index created in 7.x, unless it is reindexed or marked read-only
* **No downgrade**: an upgraded node cannot go back — only a snapshot taken before brings the old version back

```text
6.8 ──► 7.17 ──► 8.19 ──► 9.x
         │        │
         └ Upgrade Assistant: what blocks the next major
```

---

# The Upgrade Assistant (Kibana 7.17)

* **Stack Management → Upgrade Assistant**: what must be fixed before upgrading to 8
  * **critical** issues block the upgrade, **warnings** do not
  * reindexes the 6.x indices in one click
  * turns on the **deprecation logs**, to find the clients still calling deprecated APIs
* The same information, through the API:

```json
GET /_migration/deprecations
```

```json
{
  "cluster_settings": [
    { "level": "critical", "message": "Setting [node.data] is deprecated…" }
  ],
  "index_settings": {
    "logs-2019": [
      { "level": "critical", "message": "Index created before 7.0" }
    ]
  }
}
```

---

# What changes in 8

* **Security on by default** for a new cluster: TLS, the `elastic` password, enrollment tokens
  * for an upgraded cluster: set `xpack.security.enabled` explicitly in 7.17 — the Upgrade Assistant flags it
* **Mapping types are gone**: no more `/my-index/my-type/1`, only `/my-index/_doc/1`
* **Removed settings**: `node.master`, `node.data`… → `node.roles`; `discovery.zen.*` → `discovery.seed_hosts`
* **Clients**: the Java High Level REST Client gives way to the **Java API Client**
* **REST compatibility**: a 7.x client keeps working, by asking for the 7 behaviour

```text
Accept: application/vnd.elasticsearch+json;compatible-with=7
Content-Type: application/vnd.elasticsearch+json;compatible-with=7
```

---

# Before the upgrade

1. Upgrade to the last **7.17**, and clear every **critical** issue of the Upgrade Assistant
2. Take a **snapshot** of everything — the only way back

```json
PUT /_snapshot/my_backup/before-8
{
  "indices": "*",
  "include_global_state": true
}
```

3. **Rehearse** on a test cluster, restored from that snapshot
4. Upgrade the stack **in order**: Elasticsearch, then Kibana, then Logstash, Beats and Elastic Agent
5. Upgrade the nodes **in order**: data nodes tier by tier (frozen, cold, warm, hot), the other non-master nodes, then the **master-eligible nodes last**

---

# Rolling upgrade (1/2): take a node out

**1.** Keep the replicas where they are: allocate the primaries only

```json
PUT /_cluster/settings
{
  "persistent": { "cluster.routing.allocation.enable": "primaries" }
}
```

**2.** Flush, so that the shards recover faster — the synced flush no longer exists in 8

```json
POST /_flush
```

**3.** Pause the machine learning jobs, if any

```json
POST /_ml/set_upgrade_mode?enabled=true
```

**4.** Stop the node, install the 8.x package (or change the Docker image), upgrade its plugins, migrate its `elasticsearch.yml`

---

# Rolling upgrade (2/2): put it back

**5.** Start the node, and check it joined in its new version

```json
GET /_cat/nodes?v&h=name,version,node.role,master
```

**6.** Allocate again, and wait for `green`

```json
PUT /_cluster/settings
{
  "persistent": { "cluster.routing.allocation.enable": null }
}

GET /_cluster/health?wait_for_status=green&timeout=10m
```

**7.** Next node: back to step 1. Once every node is in 8:

```json
POST /_ml/set_upgrade_mode?enabled=false
```

---

# During the upgrade: a mixed cluster

* 7.17 and 8.x nodes work together for as long as the upgrade takes — keep it **short**
* A shard is only copied to a node of the **same or a newer** version
  * a primary on an 8.x node gets no replica on a 7.17 node
  * with few upgraded nodes, the cluster may stay `yellow` — expected
* The new features of 8 are only available once **every** node is upgraded
* A node in 8 cannot rejoin a 7.17 cluster: there is **no rollback** node by node

---

# After the upgrade

* Every node in the new version, the cluster `green`:

```json
GET /_cat/nodes?v&h=name,version
GET /_cluster/health
```

* Upgrade Kibana, then the agents and Beats
* Smoke tests: index, search, a dashboard
* Read the **deprecation logs** again: what 8 still accepts, 9 will refuse

| Problem | Where to look |
|---|---|
| A node does not start | its log: a setting removed in 8 (`node.master`, `discovery.zen.*`…) |
| Shards stay `UNASSIGNED` | `GET /_cluster/allocation/explain` — often a replica waiting for a node in 8 |
| A client fails | the REST compatibility headers, or the new Java API Client |

<!-- ci: skip-end -->


---
layout: cover
---

# Hands-on

## Workshop 9 - Snapshots and restore

<div style="opacity:.7; font-size:.85em">📁 <code>workshops/09_snapshots/</code> — steps in its <code>README.md</code></div>

- Register and verify a repository
- A full snapshot, then a partial one
- Restore after a delete, under another name, then everything
