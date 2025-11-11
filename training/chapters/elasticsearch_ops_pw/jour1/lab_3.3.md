## Lab 3.3: Analyse des Thread Pools et Rejections

**Topic**: Performance et Dimensionnement - Optimisation des Ressources
**Prérequis**: Cluster Elasticsearch avec quelques données

### Objectif

Analyser les statistiques des thread pools pour identifier les rejections (requêtes rejetées) et comprendre leurs implications sur la performance du cluster.

### Contexte

Votre cluster subit des pics de charge et certaines requêtes échouent avec des erreurs "EsRejectedExecutionException". Vous devez diagnostiquer quel thread pool est saturé et proposer des solutions.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Assurez-vous que le cluster traite quelques requêtes (indexation ou recherche)
2. Si nécessaire, générez de la charge:

```bash
# Script simple de charge (indexation)
for i in {1..1000}; do
  curl -X POST "localhost:9200/load-test/_doc" -H 'Content-Type: application/json' -d'
  {
    "timestamp": "'$(date -Iseconds)'",
    "value": '$RANDOM'
  }
  ' &
done
```

#### Étapes

**Étape 1**: Lister tous les thread pools

```bash
GET /_cat/thread_pool?v
```

**Résultat attendu**:
```
node_name name            active queue rejected
node-1    analyze              0     0        0
node-1    fetch_shard_started  0     0        0
node-1    fetch_shard_store    0     0        0
node-1    flush                0     0        0
node-1    force_merge          0     0        0
node-1    generic              0     0        0
node-1    get                  0     0        0
node-1    management           1     0        0
node-1    refresh              0     0        0
node-1    search               2    10        5
node-1    search_throttled     0     0        0
node-1    snapshot             0     0        0
node-1    warmer               0     0        0
node-1    write                3     5        0
```

**Colonnes clés**:
- `active`: Nombre de threads actuellement en cours d'exécution
- `queue`: Nombre de tâches en attente dans la queue
- `rejected`: Nombre de tâches rejetées (cumul depuis le démarrage)

**Étape 2**: Filtrer les thread pools importants

Affichez uniquement les thread pools critiques:

```bash
GET /_cat/thread_pool/write,search,get?v&h=node_name,name,active,queue,rejected,completed
```

**Résultat**:
```
node_name name   active queue rejected completed
node-1    write       3     5        0   1234567
node-1    search      2    10        5    987654
node-1    get         0     0        0     12345
```

**Étape 3**: Analyser les rejections en détail

```bash
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.write,nodes.*.thread_pool.search
```

**Résultat (extrait)**:
```json
{
  "nodes": {
    "abc123": {
      "thread_pool": {
        "write": {
          "threads": 16,
          "queue": 5,
          "active": 3,
          "rejected": 0,
          "largest": 16,
          "completed": 1234567
        },
        "search": {
          "threads": 25,
          "queue": 10,
          "active": 2,
          "rejected": 5,
          "largest": 25,
          "completed": 987654
        }
      }
    }
  }
}
```

**Analyse**:
- **write**: 0 rejections → ✅ Indexation OK
- **search**: 5 rejections → ⚠️ Recherche saturée (queue pleine)

**Étape 4**: Calculer le taux de rejection

```
Taux de rejection = rejected / (completed + rejected) × 100%

Pour le thread pool search:
= 5 / (987654 + 5) × 100%
= 0.0005%
```

**Interprétation**:
- <0.1%: Acceptable (pics occasionnels)
- 0.1-1%: Attention (surcharge régulière)
- >1%: Critique (cluster sous-dimensionné)

**Étape 5**: Identifier la cause des rejections

**Questions à poser**:

1. **Le thread pool est-il à sa capacité max ?**
```bash
GET /_cat/thread_pool/search?v&h=node_name,active,threads
```
Si `active` ≈ `threads` → Pool saturé

2. **La queue est-elle pleine ?**
```bash
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.search.queue,nodes.*.thread_pool.search.queue_size
```
Si `queue` ≈ `queue_size` (1000 par défaut) → Queue saturée

3. **Quelle est la charge du cluster ?**
```bash
GET /_nodes/stats/os?filter_path=nodes.*.os.cpu.percent
```
Si CPU >80% → Surcharge globale

**Étape 6**: Simuler une saturation (pour comprendre)

Générez une charge importante:

```bash
# 100 requêtes de recherche en parallèle
for i in {1..100}; do
  curl -X GET "localhost:9200/_search?pretty" -H 'Content-Type: application/json' -d'
  {
    "query": {
      "match_all": {}
    },
    "size": 1000
  }
  ' &
done

# Immédiatement après, vérifiez les rejections
GET /_cat/thread_pool/search?v&h=node_name,active,queue,rejected
```

**Observation**: Vous devriez voir `rejected` augmenter si le cluster est saturé.

#### Validation

**Commandes de vérification**:

1. Comparer rejections avant/après charge:
```bash
# Snapshot initial
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.*.rejected > before.json

# Générer charge...

# Snapshot final
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.*.rejected > after.json

# Comparer avec diff ou manuellement
```

2. Identifier les nœuds avec le plus de rejections:
```bash
GET /_cat/thread_pool/write,search?v&h=node_name,name,rejected&s=rejected:desc
```

3. Calculer le ratio rejected/completed pour tous les pools:
```bash
GET /_nodes/stats/thread_pool
# Analyser manuellement ou avec un script
```

#### Critères de Succès

- ✅ Capable de lister les thread pools avec `_cat/thread_pool`
- ✅ Identifier les thread pools avec rejections (search, write)
- ✅ Calculer le taux de rejection (rejected / completed)
- ✅ Comprendre la cause (pool saturé, queue pleine, CPU élevé)
- ✅ Proposer des solutions adaptées

#### Solutions aux Rejections

**Si thread pool WRITE saturé**:
- ✅ Augmenter le refresh_interval (réduire charge d'indexation)
- ✅ Utiliser Bulk API avec batches appropriés (5-15 MB)
- ✅ Ajouter des nœuds data (scale horizontal)
- ❌ NE PAS augmenter thread pool size (masque le problème)

**Si thread pool SEARCH saturé**:
- ✅ Optimiser les requêtes (utiliser filter context)
- ✅ Réduire le nombre de shards (moins de overhead)
- ✅ Ajouter des nœuds data ou coordinating-only
- ✅ Implémenter un rate limiting côté application
- ❌ NE PAS augmenter queue_size (augmente seulement la latence)

**Si rejections occasionnelles (<0.1%)**:
- ✅ Acceptable, pics normaux
- ✅ Implémenter retry logic côté client (avec backoff exponentiel)

#### Dépannage

**Problème**: Aucune rejection visible mais requêtes échouent
→ Vérifiez les logs Elasticsearch: `tail -f /var/log/elasticsearch/elasticsearch.log`
→ Recherchez "EsRejectedExecutionException"
→ Les rejections sont cumulatives depuis le démarrage, un redémarrage les remet à zéro

**Problème**: Rejections même avec CPU/RAM disponibles
→ Bottleneck peut être ailleurs (disque I/O, réseau)
→ Vérifiez disk I/O: `iostat -x 1` (Linux)
→ Vérifiez latence réseau entre nœuds

**Problème**: Rejections sur un seul nœud du cluster
→ Répartition déséquilibrée des shards
→ Utilisez `_cluster/reroute` pour équilibrer
→ Vérifiez que tous les nœuds ont la même capacité

---

