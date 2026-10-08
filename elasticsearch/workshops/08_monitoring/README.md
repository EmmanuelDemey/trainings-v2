# TP 8 — Monitoring

> Maîtriser les APIs de monitoring pour diagnostiquer l'état du cluster, surveiller les métriques des nœuds, et configurer les slow query logs pour identifier les requêtes problématiques.

**Topic**: Monitoring - APIs de Surveillance, Métriques Critiques, Slow Query Logs

## Contexte

L'équipe reçoit une alerte indiquant que le cluster est passé en statut `yellow` et des utilisateurs se plaignent de lenteur. Vous devez diagnostiquer les causes et mettre en place un monitoring efficace.

## Setup

Ce TP est autonome. Créez l'index de test avant de commencer:

```bash
PUT /health-test
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}
```

## Partie A: Utilisation de l'API Cluster Health

### Étape 1: Consulter le cluster health basique

```bash
GET /_cluster/health
```

**Résultat attendu (cluster à 1 nœud)**:
```json
{
  "cluster_name": "elasticsearch",
  "status": "yellow",
  "number_of_nodes": 1,
  "number_of_data_nodes": 1,
  "active_primary_shards": 2,
  "active_shards": 2,
  "unassigned_shards": 2,
  "active_shards_percent_as_number": 50.0
}
```

**Interprétation**:
- `status: "yellow"`: Au moins un replica shard non alloué
- `unassigned_shards: 2`: Replicas ne peuvent pas être alloués sur 1 nœud

### Étape 2: Obtenir des détails par index

```bash
GET /_cluster/health?level=indices
```

### Étape 3: Identifier les shards non alloués

```bash
GET /_cat/shards/health-test?v&h=index,shard,prirep,state,unassigned.reason
```

**Résultat attendu**:
```
index       shard prirep state      unassigned.reason
health-test 0     p      STARTED
health-test 0     r      UNASSIGNED NODE_LEFT
health-test 1     p      STARTED
health-test 1     r      UNASSIGNED NODE_LEFT
```

### Étape 4: Comprendre les couleurs de statut

| Statut | Signification | Impact | Action |
|--------|---------------|--------|--------|
| **GREEN** | Tous les shards (primaires + replicas) alloués | Aucun | Normal |
| **YELLOW** | Tous primaires alloués, certains replicas manquants | Fonctionnel, mais pas de HA | Surveillance, non urgent |
| **RED** | Au moins un primaire manquant | PERTE DE DONNÉES | Action immédiate |

### Étape 5: Diagnostiquer pourquoi un shard est unassigned

```bash
GET /_cluster/allocation/explain
{
  "index": "health-test",
  "shard": 0,
  "primary": false
}
```

### Étape 6: Utiliser les paramètres de l'API

```bash
# Attendre le statut green (timeout 30s)
GET /_cluster/health?wait_for_status=green&timeout=30s

# Filtrer un index spécifique
GET /_cluster/health/health-test

# Identifier tous les shards unassigned du cluster
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason
```

## Partie B: Monitoring des Statistiques de Nœuds

### Étape 1: Obtenir les statistiques JVM (heap usage)

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.name,nodes.*.jvm.mem
```

**Interprétation**:
- <75%: Sain
- 75-85%: Surveiller
- >85%: Critique (risque OutOfMemoryError)

### Étape 2: Vérifier les Garbage Collection stats

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.name,nodes.*.jvm.gc
```

**Alertes**:
- GC young > 50 ms: Heap sous pression
- GC old > 1000 ms: Heap critiquement plein

### Étape 3: Monitorer l'utilisation CPU et RAM

```bash
GET /_nodes/stats/os?filter_path=nodes.*.name,nodes.*.os.cpu,nodes.*.os.mem
```

**Thresholds**:
- CPU: <60% OK, 60-80% attention, >80% critique
- RAM: >20% free OK, 10-20% free attention, <10% free critique

### Étape 4: Vérifier l'utilisation disque

```bash
GET /_nodes/stats/fs?filter_path=nodes.*.name,nodes.*.fs.total,nodes.*.fs.io_stats
```

**Thresholds disque (watermarks)**:
- <85%: Sain
- 85-90%: LOW watermark (pas de nouveaux shards)
- 90-95%: HIGH watermark (relocate shards)
- >95%: FLOOD (indices en read-only)

### Étape 5: Surveiller les métriques d'indexation et recherche

```bash
GET /_nodes/stats/indices?filter_path=nodes.*.name,nodes.*.indices.indexing,nodes.*.indices.search
```

### Étape 6: Tableau de bord synthétique

```bash
GET /_nodes/stats?filter_path=nodes.*.name,nodes.*.jvm.mem.heap_used_percent,nodes.*.os.cpu.percent,nodes.*.fs.total.available_in_bytes,nodes.*.indices.search.query_time_in_millis
```

## Partie C: Configuration et Analyse des Slow Query Logs

### Setup de cette partie

Créez un index de test avec des données:

```bash
PUT /slowlog-test
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "content": { "type": "text" },
      "category": { "type": "keyword" },
      "views": { "type": "integer" }
    }
  }
}

POST /slowlog-test/_bulk
{"index":{}}
{"title":"Article 1","content":"Long content here with many words to search","category":"tech","views":100}
{"index":{}}
{"title":"Article 2","content":"Another long content for searching purposes","category":"science","views":200}
```

### Étape 1: Configurer les seuils de slow query log

```bash
PUT /slowlog-test/_settings
{
  "index.search.slowlog.threshold.query.warn": "500ms",
  "index.search.slowlog.threshold.query.info": "250ms",
  "index.search.slowlog.threshold.query.debug": "100ms",
  "index.search.slowlog.threshold.query.trace": "50ms",
  "index.search.slowlog.level": "info"
}
```

**Explication des niveaux**:
- **WARN** (500ms): Requêtes très lentes
- **INFO** (250ms): Requêtes lentes
- **DEBUG** (100ms): Requêtes moyennement lentes
- **TRACE** (50ms): Toutes les requêtes un peu lentes

### Étape 2: Localiser les fichiers de slow logs

```
/var/log/elasticsearch/<cluster_name>_index_search_slowlog.log
/var/log/elasticsearch/<cluster_name>_index_indexing_slowlog.log
```

### Étape 3: Exécuter une requête lente

```bash
GET /slowlog-test/_search
{
  "query": {
    "wildcard": {
      "content": "*long*content*"
    }
  },
  "size": 100
}
```

Ou une agrégation complexe:

```bash
GET /slowlog-test/_search
{
  "size": 0,
  "aggs": {
    "categories": {
      "terms": {
        "field": "category",
        "size": 100
      },
      "aggs": {
        "avg_views": {
          "avg": { "field": "views" }
        }
      }
    }
  }
}
```

### Étape 4: Analyser les slow logs

```bash
tail -f /var/log/elasticsearch/elasticsearch_index_search_slowlog.log
```

**Format d'une entrée slow log**:
```
[2023-11-10T10:30:15,123][INFO ][i.s.s.query] [node-1] [slowlog-test][0]
took[312ms], took_millis[312], total_hits[100 hits],
source[{"query":{"wildcard":{"content":"*long*content*"}},"size":100}]
```

### Étape 5: Optimiser la requête identifiée

**Avant** (wildcard lent) - ~300ms:
```bash
GET /slowlog-test/_search
{
  "query": {
    "wildcard": {
      "content": "*long*content*"
    }
  }
}
```

**Après** (match query rapide) - ~10ms:
```bash
GET /slowlog-test/_search
{
  "query": {
    "match": {
      "content": "long content"
    }
  }
}
```

### Étape 6: Vérifier la configuration et désactiver les slow logs

```bash
# Vérifier la configuration
GET /slowlog-test/_settings?include_defaults&filter_path=*.index.search.slowlog*

# Désactiver
PUT /slowlog-test/_settings
{
  "index.search.slowlog.threshold.query.warn": "-1",
  "index.search.slowlog.threshold.query.info": "-1",
  "index.search.slowlog.threshold.query.debug": "-1",
  "index.search.slowlog.threshold.query.trace": "-1"
}
```

## Critères de Succès

- Comprendre les 3 statuts (green/yellow/red) et leur signification
- Extraire heap usage avec `_nodes/stats/jvm`
- Interpréter les métriques CPU/RAM/disk
- Configurer les seuils slowlog avec `PUT /index/_settings`
- Identifier le type de requête lente et proposer une optimisation

## Dépannage

**Problème**: Cluster reste yellow même avec 2 nœuds
→ Vérifiez les règles d'allocation: `GET /_cluster/settings`
→ Vérifiez l'espace disque: watermark flood peut bloquer l'allocation

**Problème**: Heap usage constamment >85%
→ Cluster sous-dimensionné, ajoutez des nœuds
→ Ou augmentez le heap (si RAM disponible et <32 GB)

**Problème**: Aucun slow log généré même avec requêtes lentes
→ Vérifiez que la requête dépasse effectivement le seuil (mesurez avec `?profile=true`)
→ Vérifiez les permissions du fichier de log
