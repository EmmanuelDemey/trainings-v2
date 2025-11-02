# Elasticsearch Operations Cheat Sheet

Ce document regroupe toutes les commandes essentielles pour monitorer et opérer un cluster Elasticsearch.

## Table des matières

- [Santé du Cluster](#santé-du-cluster)
- [APIs CAT](#apis-cat)
- [Gestion des Nodes](#gestion-des-nodes)
- [Gestion des Indices](#gestion-des-indices)
- [Gestion des Shards](#gestion-des-shards)
- [Monitoring des Performances](#monitoring-des-performances)
- [Cache et Mémoire](#cache-et-mémoire)
- [Slowlog](#slowlog)
- [Snapshots et Backup](#snapshots-et-backup)
- [Sécurité](#sécurité)
- [Tasks et Threads](#tasks-et-threads)

---

## Santé du Cluster

### Vérifier la santé globale du cluster
```bash
GET /_cluster/health
GET /_cluster/health?pretty
```

### Santé détaillée par index
```bash
GET /_cluster/health/<index_name>
GET /_cluster/health?level=indices
GET /_cluster/health?level=shards
```

### Vérifier l'état des shards
```bash
GET /_cluster/health?v&wait_for_status=yellow&timeout=50s
```

### Obtenir les paramètres du cluster
```bash
GET /_cluster/settings
GET /_cluster/settings?include_defaults=true
```

### Modifier les paramètres du cluster
```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "all"
  }
}
```

---

## APIs CAT

### Liste des APIs CAT disponibles
```bash
GET /_cat
```

### Indices
```bash
GET /_cat/indices?v
GET /_cat/indices?v&health=red
GET /_cat/indices?v&health=yellow
GET /_cat/indices?v&s=store.size:desc
GET /_cat/indices?v&s=docs.count:desc
GET /_cat/indices/<index_name>?v
```

### Shards
```bash
GET /_cat/shards?v
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason
GET /_cat/shards/<index_name>?v
```

### Nodes
```bash
GET /_cat/nodes?v
GET /_cat/nodes?v&h=name,heap.percent,ram.percent,cpu,load_1m,node.role
GET /_cat/nodes?v&s=heap.percent:desc
```

### Allocation
```bash
GET /_cat/allocation?v
GET /_cat/allocation?v&h=shards,disk.indices,disk.used,disk.avail,disk.percent
```

### Templates
```bash
GET /_cat/templates?v
GET /_cat/templates/<template_name>?v
```

### Snapshots
```bash
GET /_cat/snapshots/<repository>?v
GET /_cat/snapshots/<repository>?v&s=end_time:desc
```

### Thread Pools
```bash
GET /_cat/thread_pool?v
GET /_cat/thread_pool?v&h=node_name,name,active,queue,rejected
```

### Plugins
```bash
GET /_cat/plugins?v
```

### Fielddata
```bash
GET /_cat/fielddata?v
GET /_cat/fielddata/<field_name>?v
```

### Segments
```bash
GET /_cat/segments?v
GET /_cat/segments/<index_name>?v
```

### Recovery
```bash
GET /_cat/recovery?v
GET /_cat/recovery?v&active_only=true
```

### Pending Tasks
```bash
GET /_cat/pending_tasks?v
```

---

## Gestion des Nodes

### Informations sur les nodes
```bash
GET /_nodes
GET /_nodes/<node_id>
GET /_nodes/<node_id>/stats
GET /_nodes/stats
```

### Statistiques détaillées
```bash
GET /_nodes/stats/indices
GET /_nodes/stats/os
GET /_nodes/stats/process
GET /_nodes/stats/jvm
GET /_nodes/stats/thread_pool
GET /_nodes/stats/fs
GET /_nodes/stats/transport
GET /_nodes/stats/http
GET /_nodes/stats/breaker
```

### Informations système
```bash
GET /_nodes/<node_id>/info
GET /_nodes/process
GET /_nodes/os
GET /_nodes/jvm
GET /_nodes/thread_pool
GET /_nodes/plugins
```

### Hot threads
```bash
GET /_nodes/hot_threads
GET /_nodes/<node_id>/hot_threads
GET /_nodes/hot_threads?threads=10&interval=500ms
```

### Exclure un node du cluster
```bash
PUT /_cluster/settings
{
  "transient": {
    "cluster.routing.allocation.exclude._ip": "10.0.0.1"
  }
}
```

---

## Gestion des Indices

### Lister les indices
```bash
GET /_cat/indices?v
GET /_aliases
```

### Créer un index
```bash
PUT /<index_name>
PUT /<index_name>
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2
  }
}
```

### Obtenir les paramètres d'un index
```bash
GET /<index_name>/_settings
GET /_all/_settings
```

### Modifier les paramètres d'un index
```bash
PUT /<index_name>/_settings
{
  "index": {
    "number_of_replicas": 2
  }
}
```

### Obtenir le mapping d'un index
```bash
GET /<index_name>/_mapping
GET /_all/_mapping
```

### Fermer / Ouvrir un index
```bash
POST /<index_name>/_close
POST /<index_name>/_open
```

### Supprimer un index
```bash
DELETE /<index_name>
DELETE /<index_pattern>*
```

### Rafraîchir un index
```bash
POST /<index_name>/_refresh
POST /_refresh
```

### Flush un index
```bash
POST /<index_name>/_flush
POST /_flush
```

### Force merge
```bash
POST /<index_name>/_forcemerge
POST /<index_name>/_forcemerge?max_num_segments=1
```

### Analyser le stockage
```bash
GET /<index_name>/_disk_usage?run_expensive_tasks=true
```

### Statistiques d'index
```bash
GET /<index_name>/_stats
GET /<index_name>/_stats/docs,store
```

---

## Gestion des Shards

### Comprendre l'allocation des shards
```bash
GET /_cluster/allocation/explain
GET /_cluster/allocation/explain?include_disk_info=true
```

### Expliquer pourquoi un shard n'est pas assigné
```bash
GET /_cluster/allocation/explain
{
  "index": "<index_name>",
  "shard": 0,
  "primary": true
}
```

### Réallouer un shard manuellement
```bash
POST /_cluster/reroute
{
  "commands": [
    {
      "allocate_replica": {
        "index": "<index_name>",
        "shard": 0,
        "node": "<node_name>"
      }
    }
  ]
}
```

### Retry allocation
```bash
POST /_cluster/reroute?retry_failed=true
```

### Annuler l'allocation d'un shard
```bash
POST /_cluster/reroute
{
  "commands": [
    {
      "cancel": {
        "index": "<index_name>",
        "shard": 0,
        "node": "<node_name>"
      }
    }
  ]
}
```

---

## Monitoring des Performances

### Cluster stats
```bash
GET /_cluster/stats
GET /_cluster/stats/nodes/<node_filter>
GET /_cluster/stats?human&pretty
```

### Statistiques de recherche
```bash
GET /_stats/search
GET /<index_name>/_stats/search
```

### Statistiques d'indexation
```bash
GET /_stats/indexing
GET /<index_name>/_stats/indexing
```

### Task Management
```bash
GET /_tasks
GET /_tasks?detailed=true
GET /_tasks?actions=*search
GET /_tasks?nodes=<node_id>
```

### Annuler une tâche
```bash
POST /_tasks/<task_id>/_cancel
```

### Profiler une requête
```bash
GET /<index_name>/_search
{
  "profile": true,
  "query": {
    "match": { "field": "value" }
  }
}
```

### Valider une requête
```bash
GET /<index_name>/_validate/query?explain=true
{
  "query": {
    "match": { "field": "value" }
  }
}
```

---

## Cache et Mémoire

### Field Data Cache
```bash
GET /_cat/fielddata?v
GET /_nodes/stats/indices/fielddata
GET /_nodes/stats/indices/fielddata?fields=*
GET /_nodes/stats/indices/fielddata?level=indices
GET /_nodes/stats/indices/fielddata?level=shards
```

### Vider le field data cache
```bash
POST /<index_name>/_cache/clear?fielddata=true
POST /_cache/clear?fielddata=true
```

### Query Cache
```bash
GET /_nodes/stats/indices/query_cache
```

### Vider le query cache
```bash
POST /<index_name>/_cache/clear?query=true
POST /_cache/clear?query=true
```

### Request Cache
```bash
GET /_nodes/stats/indices/request_cache
```

### Vider le request cache
```bash
POST /<index_name>/_cache/clear?request=true
POST /_cache/clear?request=true
```

### Vider tous les caches
```bash
POST /<index_name>/_cache/clear
POST /_cache/clear
```

### Circuit Breakers
```bash
GET /_nodes/stats/breaker
```

---

## Slowlog

### Configurer le slowlog pour les recherches
```bash
PUT /<index_name>/_settings
{
  "index.search.slowlog.threshold.query.warn": "10s",
  "index.search.slowlog.threshold.query.info": "5s",
  "index.search.slowlog.threshold.query.debug": "2s",
  "index.search.slowlog.threshold.query.trace": "500ms"
}
```

### Configurer le slowlog pour les fetch
```bash
PUT /<index_name>/_settings
{
  "index.search.slowlog.threshold.fetch.warn": "1s",
  "index.search.slowlog.threshold.fetch.info": "800ms",
  "index.search.slowlog.threshold.fetch.debug": "500ms",
  "index.search.slowlog.threshold.fetch.trace": "200ms"
}
```

### Configurer le slowlog pour l'indexation
```bash
PUT /<index_name>/_settings
{
  "index.indexing.slowlog.threshold.index.warn": "10s",
  "index.indexing.slowlog.threshold.index.info": "5s",
  "index.indexing.slowlog.threshold.index.debug": "2s",
  "index.indexing.slowlog.threshold.index.trace": "500ms"
}
```

### Désactiver le slowlog
```bash
PUT /<index_name>/_settings
{
  "index.search.slowlog.threshold.query.warn": "-1",
  "index.search.slowlog.threshold.fetch.warn": "-1",
  "index.indexing.slowlog.threshold.index.warn": "-1"
}
```

---

## Snapshots et Backup

### Créer un repository
```bash
PUT /_snapshot/<repository_name>
{
  "type": "fs",
  "settings": {
    "location": "/mount/backups/<repository_name>"
  }
}
```

### Lister les repositories
```bash
GET /_snapshot
GET /_snapshot/<repository_name>
```

### Créer un snapshot
```bash
PUT /_snapshot/<repository_name>/<snapshot_name>
PUT /_snapshot/<repository_name>/<snapshot_name>?wait_for_completion=true
```

### Créer un snapshot d'indices spécifiques
```bash
PUT /_snapshot/<repository_name>/<snapshot_name>
{
  "indices": "index1,index2",
  "ignore_unavailable": true,
  "include_global_state": false
}
```

### Lister les snapshots
```bash
GET /_snapshot/<repository_name>/_all
GET /_snapshot/<repository_name>/<snapshot_name>
```

### Vérifier le statut d'un snapshot
```bash
GET /_snapshot/<repository_name>/<snapshot_name>/_status
GET /_snapshot/_status
```

### Restaurer un snapshot
```bash
POST /_snapshot/<repository_name>/<snapshot_name>/_restore
POST /_snapshot/<repository_name>/<snapshot_name>/_restore?wait_for_completion=true
```

### Restaurer des indices spécifiques
```bash
POST /_snapshot/<repository_name>/<snapshot_name>/_restore
{
  "indices": "index1,index2",
  "ignore_unavailable": true,
  "include_global_state": false,
  "rename_pattern": "index(.+)",
  "rename_replacement": "restored_index$1"
}
```

### Supprimer un snapshot
```bash
DELETE /_snapshot/<repository_name>/<snapshot_name>
```

### Supprimer un repository
```bash
DELETE /_snapshot/<repository_name>
```

---

## Sécurité

### Activer le monitoring X-Pack
```bash
PUT /_cluster/settings
{
  "persistent": {
    "xpack.monitoring.collection.enabled": true
  }
}
```

### Lister les utilisateurs
```bash
GET /_security/user
GET /_security/user/<username>
```

### Créer un utilisateur
```bash
POST /_security/user/<username>
{
  "password": "password",
  "roles": ["admin", "other_role"],
  "full_name": "Full Name",
  "email": "email@example.com"
}
```

### Modifier le mot de passe
```bash
POST /_security/user/<username>/_password
{
  "password": "new_password"
}
```

### Lister les rôles
```bash
GET /_security/role
GET /_security/role/<role_name>
```

### Créer un rôle
```bash
POST /_security/role/<role_name>
{
  "cluster": ["all"],
  "indices": [
    {
      "names": ["index*"],
      "privileges": ["read", "write"]
    }
  ]
}
```

### API Keys
```bash
POST /_security/api_key
{
  "name": "my-api-key",
  "expiration": "1d",
  "role_descriptors": {}
}
```

### Lister les API Keys
```bash
GET /_security/api_key
```

### Invalider une API Key
```bash
DELETE /_security/api_key
{
  "id": "<api_key_id>"
}
```

---

## Tasks et Threads

### Lister les tâches en cours
```bash
GET /_tasks
GET /_tasks?detailed=true&actions=*search*
GET /_tasks?group_by=parents
```

### Obtenir une tâche spécifique
```bash
GET /_tasks/<task_id>
```

### Annuler une tâche
```bash
POST /_tasks/<task_id>/_cancel
```

### Thread pool stats
```bash
GET /_nodes/stats/thread_pool
GET /_cat/thread_pool?v
GET /_cat/thread_pool?v&h=node_name,name,active,queue,rejected,completed
```

---

## Astuces et Best Practices

### Format de sortie
```bash
# Format JSON indenté
GET /_cluster/health?pretty

# Format lisible pour les humains
GET /_cluster/health?human

# Filtrer les champs
GET /_cluster/health?filter_path=status,number_of_nodes

# Combiner les options
GET /_cluster/health?pretty&human&filter_path=status
```

### Monitoring en continu
```bash
# Utiliser watch (Linux/Mac)
watch -n 5 'curl -s "localhost:9200/_cluster/health?pretty"'

# Utiliser les APIs CAT pour un affichage tabulaire
GET /_cat/indices?v&s=store.size:desc
```

### Vérifications de santé rapides
```bash
# Vérifier la santé globale
GET /_cluster/health

# Vérifier les shards non assignés
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason | grep UNASSIGNED

# Vérifier l'utilisation disque
GET /_cat/allocation?v

# Vérifier les rejections
GET /_cat/thread_pool?v&h=node_name,name,rejected | grep -v "0$"

# Vérifier les indices en rouge
GET /_cat/indices?v&health=red
```

### Maintenance préventive
```bash
# Vérifier les segments
GET /_cat/segments?v

# Forcer un merge pour réduire les segments
POST /<index_name>/_forcemerge?max_num_segments=1

# Vérifier l'espace disque
GET /_cat/allocation?v&h=node,disk.avail,disk.used,disk.percent

# Rotation des logs avec ILM
GET /_ilm/policy
```

---

## Liens utiles

- Documentation officielle: https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html
- APIs de monitoring: https://www.elastic.co/guide/en/elasticsearch/reference/current/monitor-elasticsearch-cluster.html
- APIs CAT: https://www.elastic.co/guide/en/elasticsearch/reference/current/cat.html
