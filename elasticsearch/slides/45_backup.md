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

Configure the repository in `elasticsearch.yml`

```
path:
  repo:
    - /mount/backups_1
    - /mount/backups_2
```

---

# Creating a repository

```
PUT /_snapshot/backups_1
{
    "type": "fs",
    "settings": {
        "location": "/mount/backups_1/sub_folder"
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

```
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

```
POST _slm/policy/nightly-snapshots/_execute
```

---

# Manual Snapshot Creation

```
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

```
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
# Practical Part