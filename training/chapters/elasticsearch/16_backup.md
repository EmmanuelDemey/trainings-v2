---
layout: cover
---

# API Snapshot et Restore

---

# API Snapshot et Restore

* APIs permettant de définir des backup de nos données, afin de : 
    * faire des backups régulier
    * retrouver des données supprimées
    * transférer des données entre deux clusters
    * utiliser les Searchable Snapshot

---

# API Snapshot et Restore

* Nous pouvons faire un backup 
    * d'un index entier ou d'une partie
    * de l'état du cluster (Cluster settings, template, Ingest, ...)

---

# API Snapshot et Restore

* Première chose à faire est de créer un `repository` 
* Possibilité d'utiliser différents types
    * Shared fiel system, Read-only URL
    * Azure, S3, Google Cloud Storage
    * Via des plugins: Hadoop Distributed File System

---

# API Snapshot et Restore

* L'action se compose de trois étapes :
    * Création d'un repository
    * Création du Snapshot
    * Restore du Snapshot

---

# Création d'un repository

Configurer le repository dans `elasticsearch.yml`

```
path:
  repo:
    - /mount/backups_1
    - /mount/backups_2
```

---

# Création d'un repository

```
PUT /_snapshot/backups_1
{
    "type": "fs",
    "settings": {
        "location": "/mount/backups_1"
    }
}
```

---

# Création du Snapshot

* Un snapshot peut être créé
    * automatiquement grâce à règle `Snapshot Lifecycle Managment`
    * manuellemment via l'utilisation d'une API

---

# Création automatique du Snapshot

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

---

# Création automatique du Snapshot

```
POST _slm/policy/nightly-snapshots/_execute
```

---

# Création manuelle du Snapshot

```
PUT /_snapshot/my_fs_backup/snapshot_1?wait_for_completion=true
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

# Restore du Snapshot

```
POST /_snapshot/my_fs_backup/snapshot_1/_restore
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

# Démo dans Kibana

---
