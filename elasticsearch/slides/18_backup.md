---
layout: cover
---

# 18 - Snapshots and upgrades

---

# Learning objectives

By the end of this sequence (**~45 min**, workshop included), you will be able to:

- **Register** a snapshot repository, and **take** a snapshot
- **Automate** the snapshots and their retention with SLM
- **Restore** indices, under another name if needed
- **Plan** a rolling upgrade from 8.19 to 9.x, node by node

---

# Why snapshots?

- **Regular backups**: replicas protect against a lost node, not against a `DELETE`
- **Recover** deleted or corrupted data
- **Move** data between two clusters
- **Searchable snapshots**: search data kept only in the repository (chapter 19)

<br />

A snapshot holds:

- whole indices and data streams — or some of them
- the **cluster state**, if asked: settings, templates, pipelines, ILM policies…

> Snapshots are **incremental**: only the segments not already in the repository are copied.

---

# The three steps

```text
 1. register a repository ──► 2. take a snapshot ──► 3. restore it
    (fs, S3, GCS, Azure…)       (manual, or SLM)       (all or part)
```

| Repository type | Where |
|---|---|
| `fs` | A shared file system, mounted on **every** node |
| `url` | Read-only, over HTTP |
| `s3`, `gcs`, `azure` | Object storage — built in since 8.0 |
| `hdfs` | Hadoop, through a plugin |

---

# Allow the location: `path.repo`

An `fs` repository must sit under a path declared on **every** node:

```yaml
path:
  repo:
    - /usr/share/elasticsearch/backups
```

- With Docker: `-e path.repo=/usr/share/elasticsearch/backups`
- A static setting: changing it means **restarting** the nodes
- Not needed for `s3`, `gcs`, `azure`: credentials go into the keystore

---

# Register a repository

```json
PUT /_snapshot/backups_1
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/backups/backups_1"
  }
}
```

```json
POST /_snapshot/backups_1/_verify
```

- `_verify`: every node checks it can **write** to the location
- One repository should be written by **one** cluster only — others register it `readonly: true`

---

# Take a snapshot

```json
PUT /_snapshot/backups_1/snapshot_1?wait_for_completion=true
{
  "indices": "index_1,index_2",
  "ignore_unavailable": true,
  "include_global_state": false,
  "metadata": { "taken_by": "training" }
}
```

**Expected result**:

```json
{ "snapshot": { "snapshot": "snapshot_1", "state": "SUCCESS" } }
```

- Without `wait_for_completion`, the request returns at once: follow it with `GET /_snapshot/backups_1/snapshot_1/_status`

---

# List the snapshots

```json
GET /_snapshot/backups_1/_all
```

```json
GET /_cat/snapshots/backups_1?v&h=id,status,indices,duration
```

- `state`: `IN_PROGRESS`, `SUCCESS`, `PARTIAL`, `FAILED`
- `PARTIAL`: some shards could not be saved — usually a `red` index

---

# Restore a snapshot

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

- An existing **open** index cannot be overwritten: close or delete it, or **rename**
- Restoring under another name lets you compare with the live data first
- `index_settings` / `ignore_index_settings`: change settings on the way (e.g. `number_of_replicas`)

---

# Automate: Snapshot Lifecycle Management

```json
PUT /_slm/policy/nightly-snapshots
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

- `schedule`: a cron expression (here, every night at 01:30 UTC)
- `{now/d}`: date math in the name — each snapshot gets a unique one

---

# Run and follow an SLM policy

```json
POST /_slm/policy/nightly-snapshots/_execute
```

```json
GET /_slm/policy/nightly-snapshots
```

- `last_success`, `last_failure`, `next_execution`: the health of the backups
- `retention`: old snapshots are deleted, keeping between `min_count` and `max_count`
- Alert on `last_failure` (chapter 24): a backup nobody checks is not a backup

> A snapshot you never restored is a hope. **Rehearse** the restore on a test cluster.

---
layout: cover
---

# Rolling upgrade: from 8 to 9

<!-- ci: skip-start -->

---

# Upgrade paths

- A major version is never skipped: **8.x → 8.19 → 9.x**
- The rolling upgrade to 9 starts from the **last 8.19 patch** (same rule before: 7.x → 7.17 → 8.x)
- An index is readable by the **next** major only: an index **created in 7.x** must be reindexed, deleted or made read-only in 8.19
- **No downgrade**: only a snapshot taken before brings the old version back

```text
7.17 ──► 8.19 ──► 9.x
         │
         └ Upgrade Assistant: what blocks the next major
```

---

# The Upgrade Assistant

**Kibana 8.19 → Stack Management → Upgrade Assistant**:

- **critical** issues block the upgrade, **warnings** do not
- reindexes the 7.x indices, or marks them read-only, in one click
- turns on the **deprecation logs**: find the clients still calling deprecated APIs

The same information, through the API:

```json
GET /_migration/deprecations
```

---

# Reading the deprecations

```json
{
  "cluster_settings": [
    { "level": "warning", "message": "Setting [xpack.monitoring.collection.enabled] is deprecated…" }
  ],
  "index_settings": {
    "logs-2021": [
      { "level": "critical", "message": "Old index with a compatibility version < 8.0" }
    ]
  }
}
```

- Read **this** list for your cluster, rather than a changelog by heart
- Clients: use the 9.x client — an 8.x client keeps working through **REST compatibility**:

```text
Accept: application/vnd.elasticsearch+json;compatible-with=8
```

---

# Before the upgrade

1. Upgrade to the last **8.19**, clear every **critical** issue
2. Take a **snapshot** of everything — the only way back:

```json
PUT /_snapshot/my_backup/before-9
{ "indices": "*", "include_global_state": true }
```

3. **Rehearse** on a test cluster restored from that snapshot
4. Stack order: **Elasticsearch**, then **Kibana**, then Logstash, Beats, Elastic Agent
5. Node order: data nodes tier by tier (frozen, cold, warm, hot), other non-master nodes, **master-eligible last**

---

# Rolling upgrade: take a node out

**1.** Keep the replicas where they are — allocate the primaries only:

```json
PUT /_cluster/settings
{ "persistent": { "cluster.routing.allocation.enable": "primaries" } }
```

**2.** Flush, so that the shards recover faster: `POST /_flush`

**3.** Pause the machine learning jobs, if any: `POST /_ml/set_upgrade_mode?enabled=true`

**4.** Stop the node, install 9.x (or change the Docker image), upgrade its plugins, migrate its `elasticsearch.yml`

---

# Rolling upgrade: put it back

**5.** Start the node, check it joined in its new version: `GET /_cat/nodes?v&h=name,version,node.role,master`

**6.** Allocate again, and wait for `green`:

```json
PUT /_cluster/settings
{ "persistent": { "cluster.routing.allocation.enable": null } }

GET /_cluster/health?wait_for_status=green&timeout=10m
```

**7.** Next node: back to step 1. Once every node is in 9: `POST /_ml/set_upgrade_mode?enabled=false`

---

# During the upgrade: a mixed cluster

- 8.19 and 9.x nodes work together while the upgrade lasts — keep it **short**
- A shard is only copied to a node of the **same or a newer** version
  - a primary on a 9.x node gets no replica on an 8.19 node
  - with few upgraded nodes, the cluster may stay `yellow` — expected
- The new features of 9 are available once **every** node is upgraded
- A node in 9 cannot rejoin an 8.19 cluster: no rollback node by node

---

# After the upgrade

- Every node in the new version, the cluster `green`
- Upgrade Kibana, then the agents and Beats
- Smoke tests: index, search, a dashboard
- Read the **deprecation logs** again: what 9 still accepts, 10 will refuse

| Problem | Where to look |
|---|---|
| A node does not start | Its log: a setting removed in 9, an index created in 7.x |
| Shards stay `UNASSIGNED` | `GET /_cluster/allocation/explain` — often a replica waiting for a 9.x node |
| A client fails | REST compatibility headers, or upgrade the client |

<!-- ci: skip-end -->

---

# Quiz

**The cluster has 1 replica per index. Why take snapshots as well?**

- A) Replicas are not copied to other nodes
- B) A `DELETE /index` deletes the replicas too
- C) Snapshots make searches faster

<v-click>

**Answer: B** — replicas protect against the loss of a node, not against a mistake: every copy follows the primary, deletions included.

</v-click>

---
layout: cover
---

# Workshop 14

## Snapshots and restore
