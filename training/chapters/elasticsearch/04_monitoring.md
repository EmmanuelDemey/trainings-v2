---
layout: cover
---

# Stratégie de Monitoring

Surveillance et observabilité d'Elasticsearch en production

---

# Objectifs d'Apprentissage

À la fin de cette section, vous serez capable de:

- Utiliser les APIs de monitoring natives pour collecter des métriques cluster
- Identifier et surveiller les métriques critiques pour la santé du cluster
- Configurer et exploiter les interfaces de monitoring Kibana (Stack Monitoring)
- Analyser les logs Elasticsearch pour diagnostiquer les problèmes opérationnels

---

# Pourquoi Monitorer Elasticsearch ?

Le monitoring proactif est essentiel pour maintenir un cluster Elasticsearch en bonne santé.

**Objectifs du monitoring**:
- 🎯 **Détection précoce**: Identifier les problèmes avant impact utilisateur
- 📊 **Planification capacité**: Anticiper les besoins en ressources
- 🔍 **Troubleshooting**: Diagnostiquer rapidement les incidents
- 📈 **Optimisation**: Identifier les goulots d'étranglement de performance
- ✅ **SLA compliance**: Vérifier le respect des objectifs de disponibilité

**Niveaux de monitoring**:
1. **Infrastructure**: CPU, RAM, disque, réseau (OS-level)
2. **Cluster**: Santé, nœuds, shards, indices (Elasticsearch APIs)
3. **Application**: Latence requêtes, taux d'erreur, throughput
4. **Business**: Métriques métier (volume documents, utilisateurs actifs)

---

# APIs de Monitoring Natives

Elasticsearch fournit plusieurs [APIs de monitoring](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster.html) pour observer l'état du cluster.

**APIs essentielles**:

| API | Usage | Fréquence recommandée |
|-----|-------|-----------------------|
| `_cluster/health` | Santé globale du cluster | 30s - 1min |
| `_cluster/stats` | Statistiques agrégées du cluster | 1 - 5min |
| `_nodes/stats` | Métriques détaillées par nœud | 30s - 1min |
| `_cat/indices` | État et taille des indices | 1 - 5min |
| `_cat/shards` | Allocation et état des shards | 1 - 5min |
| `_nodes/hot_threads` | CPU threads actifs (debug) | À la demande |
| `_cat/pending_tasks` | Tâches master en attente | 30s - 1min |

**Principe général**: Queries légères et fréquentes pour détection rapide, queries lourdes moins fréquentes.

---

# API Cluster Stats

L'API [_cluster/stats](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-stats.html) fournit des statistiques agrégées pour tout le cluster.

**Requête**:
```bash
GET /_cluster/stats
```

**Métriques clés retournées**:
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

**Cas d'usage**: Vue d'ensemble du cluster pour dashboards, calcul de ratios (heap usage rate, storage growth rate).

---

# API Nodes Stats

L'API [_nodes/stats](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-nodes-stats.html) retourne des métriques détaillées par nœud.

**Requête avec filtres**:
```bash
GET /_nodes/stats/jvm,os,process,indices,fs,thread_pool,breaker
```

**Sections importantes**:
- **jvm**: `mem.heap_used_percent`, `gc.collectors.*.collection_time_in_millis`
- **os**: `cpu.percent`, `mem.used_percent`, `swap.used_in_bytes`
- **process**: `cpu.percent`, `open_file_descriptors`
- **indices**: `indexing.index_total`, `search.query_total`, `search.query_time_in_millis`
- **fs**: `total.available_in_bytes`, `io_stats.total.operations`
- **thread_pool**: `*.rejected` (rejections critiques)
- **breaker**: Circuit breakers déclenchés

**Monitoring key**: `indices.indexing.index_time_in_millis / indices.indexing.index_total` = latence moyenne d'indexation

---

# API Cat Indices et Shards

Les [_cat APIs](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat.html) offrent des vues concises pour opérations quotidiennes.

**Cat Indices** (état des indices):
```bash
GET /_cat/indices?v&h=index,health,status,pri,rep,docs.count,store.size&s=store.size:desc
```

Résultat:
```
index          health status pri rep docs.count store.size
logs-2023.11   green  open     5   1   15000000      2.5gb
products       yellow open     1   1     100000       50mb
```

**Cat Shards** (localisation et état):
```bash
GET /_cat/shards?v&h=index,shard,prirep,state,node,store&s=store:desc
```

Résultat:
```
index     shard prirep state   node    store
logs-2023 0     p      STARTED node-1  512mb
logs-2023 0     r      STARTED node-2  512mb
```

**Cas d'usage**: Identification rapide de shards unassigned, indices volumineux, distribution déséquilibrée.

---

# API Hot Threads (Troubleshooting)

L'API [_nodes/hot_threads](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-nodes-hot-threads.html) identifie les threads consommant le plus de CPU.

**Requête**:
```bash
GET /_nodes/hot_threads
GET /_nodes/node-1/hot_threads?threads=5&interval=500ms&type=cpu
```

**Paramètres**:
- `threads`: Nombre de threads à afficher (défaut: 3)
- `interval`: Période d'échantillonnage (défaut: 500ms)
- `type`: `cpu` (défaut), `wait`, `block`

**Résultat** (extrait):
```
::: {node-1}{abc123}
   Hot threads at 2023-11-10T10:30:00.000Z, interval=500ms, busiestThreads=5:
   
   99.8% (499ms out of 500ms) cpu usage by thread 'elasticsearch[node-1][search][T#5]'
     org.elasticsearch.search.SearchService.executeQueryPhase()
     org.elasticsearch.search.query.QueryPhase.execute()
```

**Usage**: Diagnostic de pics CPU, identification de requêtes coûteuses en temps réel.

---

# Métriques Critiques: Cluster Health

La [santé du cluster](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-health.html) est la métrique la plus importante à surveiller.

**Status colors**:
- 🟢 **GREEN**: Tous les shards (primaires + replicas) alloués ✅
- 🟡 **YELLOW**: Tous primaires alloués, certains replicas manquants ⚠️
- 🔴 **RED**: Au moins un shard primaire manquant ❌ PERTE DE DONNÉES

**Requête détaillée**:
```bash
GET /_cluster/health?level=indices
```

**Alertes à configurer**:
```yaml
# Seuils d'alerte recommandés
cluster.status:
  CRITICAL: status == "red"         # Alerte immédiate
  WARNING: status == "yellow"       # Enquête sous 15min
  
unassigned_shards:
  CRITICAL: > 10                    # Action immédiate
  WARNING: > 0                      # Enquête
  
active_shards_percent:
  CRITICAL: < 90%                   # Problème d'allocation grave
  WARNING: < 98%                    # Surveillance accrue
```

---

# Métriques Critiques: CPU et Mémoire

Le monitoring de **CPU** et **mémoire** est critique pour la stabilité.

**CPU monitoring**:
```bash
GET /_nodes/stats/os,process?filter_path=nodes.*.os.cpu,nodes.*.process.cpu
```

**Seuils CPU**:
- ✅ **<60%**: Sain
- ⚠️ **60-80%**: Surveiller, planifier scaling
- ❌ **>80%**: Critique, risque de dégradation latence
- 🚨 **>95%**: Cluster surchargé, action immédiate

**Heap memory monitoring**:
```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem
```

**Seuils Heap**:
- ✅ **<75%**: Sain
- ⚠️ **75-85%**: Surveiller GC frequency
- ❌ **>85%**: Risque de OutOfMemoryError
- 🚨 **>95%**: GC thrashing probable, circuit breakers activés

**Garbage Collection**:
```
gc_collection_time / gc_collection_count = moyenne durée GC
Si moyenne >100ms → problème heap ou GC tuning nécessaire
```

---

# Métriques Critiques: Disque et I/O

Le [monitoring disque](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-cluster.html#disk-based-shard-allocation) prévient les pannes dues au remplissage.

**Disk space monitoring**:
```bash
GET /_nodes/stats/fs?filter_path=nodes.*.fs.total
```

**Seuils disque** (disk-based shard allocation):
- ✅ **<85%**: Sain
- ⚠️ **85-90%**: Watermark LOW - aucune allocation de nouveaux shards sur ce nœud
- ❌ **90-95%**: Watermark HIGH - relocate shards depuis ce nœud
- 🚨 **>95%**: Watermark FLOOD - indices en read-only !

**Configuration watermarks**:
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

**I/O stats**: `fs.io_stats.total.operations`, `fs.io_stats.total.read_time` (latence I/O)

---

# Métriques Critiques: Indexation et Recherche

Les métriques d'**indexing** et **search** mesurent la performance applicative.

**Indexing metrics**:
```bash
GET /_nodes/stats/indices?filter_path=nodes.*.indices.indexing
```

Métriques clés:
- `indexing.index_total`: Nombre total de documents indexés
- `indexing.index_time_in_millis`: Temps total d'indexation
- `indexing.index_failed`: Documents échoués (❌ doit être proche de 0)

**Calcul latence moyenne**:
```
avg_indexing_latency = index_time_in_millis / index_total
```

**Search metrics**:
```bash
GET /_nodes/stats/indices?filter_path=nodes.*.indices.search
```

Métriques clés:
- `search.query_total`: Nombre de requêtes
- `search.query_time_in_millis`: Temps total de recherche
- `search.fetch_total`, `search.fetch_time_in_millis`: Phase fetch

**Calcul latence moyenne**:
```
avg_search_latency = query_time_in_millis / query_total
```

---

# Métriques Critiques: Thread Pool Rejections

Les [thread pool rejections](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-threadpool.html) indiquent une surcharge du cluster.

**Monitoring rejections**:
```bash
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.*.rejected
```

**Thread pools à surveiller**:
- **write**: Rejections d'indexation → Cluster surchargé en écriture
- **search**: Rejections de recherche → Cluster surchargé en lecture
- **get**: Rejections de GET par ID (rare)

**Seuils d'alerte**:
```yaml
thread_pool.*.rejected:
  WARNING: delta > 10/min        # Surcharge ponctuelle
  CRITICAL: delta > 100/min      # Surcharge sévère
```

**Actions correctives**:
- Court terme: Throttle client-side, augmenter queue_size (temporaire)
- Moyen terme: Optimiser requêtes, ajouter nœuds
- Long terme: Revoir architecture, sharding strategy

---

# Kibana Stack Monitoring: Vue d'Ensemble

[Kibana Stack Monitoring](https://www.elastic.co/guide/en/kibana/current/xpack-monitoring.html) fournit une interface graphique pour surveiller Elasticsearch.

**Activation**:
```yaml
# elasticsearch.yml
xpack.monitoring.collection.enabled: true
```

**Pages principales**:
1. **Overview**: Santé globale, nœuds actifs, utilisation ressources
2. **Nodes**: Détail par nœud (CPU, memory, disk, JVM)
3. **Indices**: Liste indices avec métriques (size, docs, search rate)
4. **Advanced**: Logs, thread pools, CCR, Watcher

**Avantages vs APIs brutes**:
- ✅ Visualisation graphique avec historique (time-series)
- ✅ Alertes intégrées (Elasticsearch Watcher)
- ✅ Corrélation entre métriques (CPU spike + search latency)
- ✅ Drill-down par nœud/index/shard

**Limite**: Overhead de monitoring (~5-10% resources). Pour clusters critiques, envisager monitoring externe (Prometheus, Datadog).

---

# Kibana Stack Monitoring: Cluster Overview

La page **Cluster Overview** affiche les métriques agrégées en temps réel.

**Widgets principaux**:

**1. Cluster Health**
- Status color (green/yellow/red)
- Nombre de nœuds actifs
- Shards (total, primaries, replicas, unassigned)

**2. Search & Indexing Rate**
- Graphique time-series des requêtes/sec
- Latence moyenne (p50, p95, p99)
- Taux d'erreur

**3. Resource Usage**
- CPU usage (moyenne cluster)
- JVM Heap (average across nodes)
- Disk usage (total et par nœud)

**4. Alerts**
- Liste des alertes actives (disk watermark, heap high, etc.)

**Configuration refresh**: Par défaut 10s, ajustable dans Settings.

---

# Kibana Stack Monitoring: Nodes View

La page **Nodes** permet de surveiller chaque nœud individuellement.

**Métriques par nœud**:

| Métrique | Description | Seuil d'alerte |
|----------|-------------|----------------|
| **CPU Usage** | % CPU utilisé | >80% |
| **JVM Memory** | % heap utilisé | >85% |
| **Disk Free Space** | Espace disque restant | <15% (85% full) |
| **Load Average** | Charge système (1m, 5m, 15m) | >cores × 1.5 |
| **Shards** | Nombre de shards sur ce nœud | >20/GB heap |

**Graphiques disponibles**:
- CPU usage over time
- JVM heap usage over time
- GC duration and frequency
- Indexing and search latency
- Disk I/O throughput

**Drill-down**: Cliquer sur un nœud pour voir logs, hot threads, stack traces.

---

# Kibana Stack Monitoring: Indices View

La page **Indices** surveille la santé et performance de chaque index.

**Métriques par index**:
- **Health**: green/yellow/red
- **Status**: open/close
- **Document Count**: Nombre de documents
- **Size**: Taille totale (primaires + replicas)
- **Search Rate**: Recherches/sec
- **Indexing Rate**: Documents/sec

**Graphiques time-series**:
- Document count evolution
- Indexing rate (docs/s)
- Search rate (queries/s)
- Search latency (ms)

**Use cases**:
- Identifier les indices à forte croissance (planification capacité)
- Détecter les indices non utilisés (candidats à suppression/archivage)
- Surveiller les index en yellow/red (problèmes d'allocation)

---

# Analyse des Logs: Emplacements

Elasticsearch génère plusieurs types de [logs](https://www.elastic.co/guide/en/elasticsearch/reference/current/logging.html) pour diagnostiquer les problèmes.

**Fichiers de logs par défaut**:
```
/var/log/elasticsearch/
├── <cluster_name>.log              # Log principal
├── <cluster_name>_deprecation.log  # Avertissements de dépréciation
├── <cluster_name>_index_search_slowlog.log
├── <cluster_name>_index_indexing_slowlog.log
└── gc.log                          # Garbage Collection logs
```

**Niveaux de log**:
- **ERROR**: Erreurs nécessitant une action
- **WARN**: Avertissements à surveiller
- **INFO**: Événements normaux (startup, config changes)
- **DEBUG**: Détails pour troubleshooting (activer temporairement)
- **TRACE**: Détails très verbeux (dev uniquement)

**Configuration dans log4j2.properties**:
```properties
logger.action.name = org.elasticsearch.action
logger.action.level = info
```

---

# Analyse des Logs: Configuration Log4j2

La configuration [Log4j2](https://www.elastic.co/guide/en/elasticsearch/reference/current/logging.html#configuring-logging-levels) contrôle le niveau de détail des logs.

**Fichier log4j2.properties**:
```properties
# Niveau global
rootLogger.level = info

# Logger pour un package spécifique
logger.discovery.name = org.elasticsearch.discovery
logger.discovery.level = debug

# Appender pour rotation des logs
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

# Analyse des Logs: Configuration Log4j2

**Modification dynamique** (sans redémarrage):
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

# Analyse des Logs: Slow Logs

Les [slow logs](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-slowlog.html) enregistrent les requêtes dépassant des seuils de latence.

**Configuration par index**:
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

# Analyse des Logs: Slow Logs

**Format du slow log**:
```
[2023-11-10T10:30:15,123][WARN ][i.s.s.query] [node-1] [my-index][0] 
took[5.2s], took_millis[5234], types[], stats[], search_type[QUERY_THEN_FETCH], 
total_shards[5], source[{"query":{"match":{"field":"value"}}}]
```

**Analyse**: Identifier patterns (requêtes similaires, même index), optimiser ou ajouter ressources.

---

# Analyse des Logs: Messages d'Erreur Courants

Savoir interpréter les erreurs courantes accélère le troubleshooting.

**Erreurs fréquentes**:

**1. CircuitBreakerException**
```
\[parent\] Data too large, data for [<http_request>] would be [x], which is larger than the limit of [y]
```
→ Heap saturé, requête trop gourmande. Actions: Réduire taille requête, augmenter heap, ajouter nœuds.

**2. EsRejectedExecutionException**
```
rejected execution of org.elasticsearch.transport.TransportService$7@abc on EsThreadPoolExecutor[search, queue capacity = 1000]
```
→ Thread pool saturé. Actions: Throttle client-side, optimiser requêtes, scale cluster.

**3. SearchPhaseExecutionException**
```
Shard failures: [failed shard on node [xyz]: query shard failed]
```
→ Échec de recherche sur un shard. Actions: Vérifier logs du nœud concerné, état du shard.

**4. ClusterBlockException**
```
index [my-index] blocked by: [FORBIDDEN/12/index read-only / allow delete (api)];
```
→ Index en read-only (souvent disk watermark flood). Actions: Libérer espace disque, augmenter watermark.

---

# Résumé

## Points Clés

- Les **APIs natives** (_cluster/health, _nodes/stats, _cat APIs) sont essentielles pour le monitoring temps réel
- Les **métriques critiques** incluent: cluster health, CPU/memory/disk, indexing/search rates, thread pool rejections
- **Kibana Stack Monitoring** offre une interface graphique complète avec historique et alertes intégrées
- L'**analyse des logs** (main log, slow logs, GC logs) permet de diagnostiquer les problèmes opérationnels
- Les **seuils d'alerte** doivent être configurés pour détection précoce: heap >85%, disk >85%, CPU >80%

---

# Résumé

## APIs de Référence Rapide

| API | Métrique clé | Fréquence |
|-----|--------------|-----------|
| `_cluster/health` | status (green/yellow/red) | 30s |
| `_nodes/stats/jvm` | heap_used_percent | 1min |
| `_nodes/stats/os` | cpu.percent | 1min |
| `_cat/indices` | health, store.size | 5min |
| `_nodes/hot_threads` | CPU threads actifs | À la demande |

---

# Exercices Pratiques

Passez maintenant au **cahier d'exercices** pour mettre en pratique ces concepts.

**Labs à réaliser**:
- Lab 4.1: Utilisation des APIs de monitoring natives
- Lab 4.2: Configuration des seuils d'alerte critiques
- Lab 4.3: Exploration de Kibana Stack Monitoring

**Ces exercices couvrent**:
- Requêtes sur APIs _cluster/health, _nodes/stats, _cat
- Configuration de slow logs et watermarks
- Navigation dans Kibana Stack Monitoring
- Interprétation de logs et diagnostic de problèmes simulés
