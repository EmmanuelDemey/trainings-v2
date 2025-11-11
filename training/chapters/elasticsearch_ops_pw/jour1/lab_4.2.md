## Lab 4.2: Monitoring des Statistiques de Nœuds

**Topic**: Monitoring - Métriques Critiques
**Durée Estimée**: 20-25 minutes
**Prérequis**: Cluster Elasticsearch actif

### Objectif

Utiliser l'API `_nodes/stats` pour extraire les métriques critiques (heap JVM, CPU, disk I/O) et surveiller la santé des nœuds individuellement.

### Contexte

L'équipe infrastructure demande un rapport sur l'utilisation des ressources du cluster. Vous devez extraire les métriques clés pour identifier les nœuds surchargés.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Identifiez les nœuds du cluster: `GET /_cat/nodes?v`
2. Notez les noms des nœuds pour les requêtes filtrant

#### Étapes

**Étape 1**: Obtenir les statistiques JVM (heap usage)

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.name,nodes.*.jvm.mem
```

**Résultat attendu**:
```json
{
  "nodes": {
    "abc123": {
      "name": "node-1",
      "jvm": {
        "mem": {
          "heap_used_in_bytes": 5368709120,
          "heap_used_percent": 25,
          "heap_committed_in_bytes": 21474836480,
          "heap_max_in_bytes": 21474836480,
          "non_heap_used_in_bytes": 157286400,
          "non_heap_committed_in_bytes": 164626432
        }
      }
    }
  }
}
```

**Analyse**:
```
Heap used:         5,368,709,120 bytes = 5 GB
Heap max:         21,474,836,480 bytes = 20 GB
Heap used %:      25%
```

**Interprétation**:
- ✅ <75%: Sain
- ⚠️ 75-85%: Surveiller
- ❌ >85%: Critique (risque OutOfMemoryError)

**Étape 2**: Vérifier les Garbage Collection stats

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.name,nodes.*.jvm.gc
```

**Résultat attendu**:
```json
{
  "nodes": {
    "abc123": {
      "name": "node-1",
      "jvm": {
        "gc": {
          "collectors": {
            "young": {
              "collection_count": 1234,
              "collection_time_in_millis": 12340
            },
            "old": {
              "collection_count": 5,
              "collection_time_in_millis": 500
            }
          }
        }
      }
    }
  }
}
```

**Calculs**:
```
Durée moyenne GC young: 12,340 ms / 1,234 = 10 ms par GC
Durée moyenne GC old:   500 ms / 5 = 100 ms par GC
```

**Alertes**:
- ⚠️ GC young > 50 ms: Heap sous pression
- ❌ GC old > 1000 ms: Heap critiquement plein
- ❌ GC fréquents (>10/minute): Heap trop petit

**Étape 3**: Monitorer l'utilisation CPU et RAM (OS level)

```bash
GET /_nodes/stats/os?filter_path=nodes.*.name,nodes.*.os.cpu,nodes.*.os.mem
```

**Résultat attendu**:
```json
{
  "nodes": {
    "abc123": {
      "name": "node-1",
      "os": {
        "cpu": {
          "percent": 45,
          "load_average": {
            "1m": 2.5,
            "5m": 2.0,
            "15m": 1.8
          }
        },
        "mem": {
          "total_in_bytes": 68719476736,
          "free_in_bytes": 20000000000,
          "used_in_bytes": 48719476736,
          "free_percent": 29,
          "used_percent": 71
        }
      }
    }
  }
}
```

**Analyse**:
```
CPU usage:        45% (moyenne récente)
Load average 1m:  2.5 (sur un serveur 16 cores → 2.5/16 = 15.6% load)
RAM usage:        71% (incluant OS cache)
RAM free:         29%
```

**Thresholds**:
- CPU: <60% ✅, 60-80% ⚠️, >80% ❌
- Load avg: <cores ✅, cores-2×cores ⚠️, >2×cores ❌
- RAM: >20% free ✅, 10-20% free ⚠️, <10% free ❌

**Étape 4**: Vérifier l'utilisation disque et I/O

```bash
GET /_nodes/stats/fs?filter_path=nodes.*.name,nodes.*.fs.total,nodes.*.fs.io_stats
```

**Résultat attendu**:
```json
{
  "nodes": {
    "abc123": {
      "name": "node-1",
      "fs": {
        "total": {
          "total_in_bytes": 2000000000000,
          "free_in_bytes": 1200000000000,
          "available_in_bytes": 1200000000000
        },
        "io_stats": {
          "total": {
            "operations": 123456789,
            "read_operations": 98765432,
            "write_operations": 24691357,
            "read_kilobytes": 5000000,
            "write_kilobytes": 3000000
          }
        }
      }
    }
  }
}
```

**Calculs**:
```
Disque total:     2,000 GB (2 TB)
Disque utilisé:   800 GB (40%)
Disque libre:     1,200 GB (60%)

I/O read:         5,000,000 KB = 4.88 GB
I/O write:        3,000,000 KB = 2.93 GB
```

**Thresholds disque** (watermarks):
- <85%: ✅ Sain
- 85-90%: ⚠️ LOW watermark (pas de nouveaux shards)
- 90-95%: ⚠️ HIGH watermark (relocate shards)
- >95%: ❌ FLOOD (indices en read-only)

**Étape 5**: Surveiller les métriques d'indexation et recherche

```bash
GET /_nodes/stats/indices?filter_path=nodes.*.name,nodes.*.indices.indexing,nodes.*.indices.search
```

**Résultat attendu**:
```json
{
  "nodes": {
    "abc123": {
      "name": "node-1",
      "indices": {
        "indexing": {
          "index_total": 10000000,
          "index_time_in_millis": 5000000,
          "index_current": 5,
          "index_failed": 10
        },
        "search": {
          "query_total": 500000,
          "query_time_in_millis": 2000000,
          "query_current": 2,
          "fetch_total": 450000,
          "fetch_time_in_millis": 500000
        }
      }
    }
  }
}
```

**Calculs de performance**:
```
Indexing:
  - Latence moyenne: 5,000,000 ms / 10,000,000 docs = 0.5 ms/doc
  - Taux d'échec: 10 / 10,000,000 = 0.0001% ✅

Search:
  - Latence query: 2,000,000 ms / 500,000 = 4 ms/query
  - Latence fetch: 500,000 ms / 450,000 = 1.1 ms/fetch
  - Total: ~5.1 ms par recherche ✅
```

**Étape 6**: Créer un tableau de bord synthétique

Combinez toutes les métriques dans une seule requête:

```bash
GET /_nodes/stats?filter_path=nodes.*.name,nodes.*.jvm.mem.heap_used_percent,nodes.*.os.cpu.percent,nodes.*.fs.total.available_in_bytes,nodes.*.indices.search.query_time_in_millis
```

**Créez un tableau manuel**:

| Node | Heap | CPU | Disk Free | Search Latency |
|------|------|-----|-----------|----------------|
| node-1 | 25% ✅ | 45% ✅ | 60% ✅ | 4 ms ✅ |
| node-2 | 78% ⚠️ | 82% ❌ | 12% ⚠️ | 15 ms ⚠️ |

**Observations**: node-2 nécessite une attention (CPU et heap élevés).

#### Critères de Succès

- ✅ Extraire heap usage avec `_nodes/stats/jvm`
- ✅ Interpréter les métriques CPU/RAM/disk
- ✅ Calculer les latences moyennes (indexing, search)
- ✅ Identifier les nœuds surchargés (CPU >80%, heap >85%)
- ✅ Comprendre les watermarks disque (85%, 90%, 95%)

#### Dépannage

**Problème**: Heap usage constamment >85%
→ Cluster sous-dimensionné, ajouter des nœuds
→ Ou augmenter le heap (si <32 GB et RAM disponible)
→ Vérifier les requêtes: certaines peuvent consommer trop de mémoire

**Problème**: CPU élevé mais load average faible
→ CPU utilisé par des tâches courtes (bursts)
→ Normal si indexation/recherche intensive par pics
→ Surveiller les thread pool rejections

**Problème**: Disque plein mais cluster n'utilise pas toute la capacité
→ Vérifier les watermarks: `GET /_cluster/settings?include_defaults&filter_path=*.cluster.routing.allocation.disk.watermark*`
→ Augmenter les watermarks si nécessaire (avec prudence)

---

