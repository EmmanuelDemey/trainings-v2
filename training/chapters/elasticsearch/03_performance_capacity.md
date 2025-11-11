---
layout: cover
---

# Performance et Dimensionnement

Optimisation et planification de capacité pour Elasticsearch

---

# Objectifs d'Apprentissage

À la fin de cette section, vous serez capable de:

- Dimensionner l'infrastructure Elasticsearch selon les besoins (CPU, mémoire, disque, nœuds)
- Optimiser la configuration système pour des performances maximales
- Concevoir une topologie réseau adaptée aux exigences de latence et débit
- Appliquer les techniques d'optimisation pour l'indexation et la recherche

---

# Dimensionnement de l'Infrastructure

Le [dimensionnement d'un cluster Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/size-your-shards.html) dépend de plusieurs facteurs critiques.

**Facteurs à considérer**:
- **Volume de données**: Taille totale des index à stocker
- **Taux d'ingestion**: Documents/seconde à indexer
- **Taux de requêtes**: Recherches/seconde attendues
- **Latence cible**: Temps de réponse acceptable (p95, p99)
- **Rétention**: Durée de conservation des données
- **Haute disponibilité**: Réplication et tolérance aux pannes

**Règle générale de départ**:
```
Nombre de nœuds data = (Volume total / 30 TB) + 1
```
30 TB est une limite raisonnable par nœud data pour la gestion opérationnelle.

---

# Dimensionnement CPU

Le CPU impacte directement les performances de recherche et d'indexation.

**Guidelines CPU**:
- **Minimum recommandé**: 4 cores par nœud
- **Optimal**: 8-16 cores par nœud data
- **Nœuds master-only**: 2-4 cores suffisent
- **Nœuds ingest (pipelines complexes)**: 8+ cores

---

# Dimensionnement CPU

**Cas d'usage par intensité CPU**:
| Charge de travail | CPU recommandé | Exemple |
|-------------------|----------------|---------|
| Recherche intensive | 16+ cores, haute fréquence | Full-text search, agrégations complexes |
| Indexation intensive | 8-16 cores | Ingestion logs, IoT data |
| Mixte équilibré | 12-16 cores | E-commerce, monitoring APM |
| Lecture seule | 4-8 cores | Archives, dashboards statiques |

**Métriques de monitoring CPU**: `node_stats.os.cpu.percent`, `node_stats.process.cpu.percent`

---

# Dimensionnement Mémoire (RAM)

La RAM est le facteur le plus critique pour les performances Elasticsearch.

**Allocation de la RAM**:
```
RAM totale = Heap JVM + OS Cache
```

**Règles de sizing RAM**:
- **50/50 split**: 50% heap JVM, 50% OS cache (filesystem cache)
- **Heap maximum**: 32 GB maximum (limite compressed oops)
- **Minimum par nœud data**: 8 GB RAM totale (4 GB heap + 4 GB OS cache)
- **Optimal par nœud data**: 64 GB RAM totale (31 GB heap + 33 GB OS cache)

---

# Dimensionnement Mémoire (RAM)


**Exemples de configurations**:
| RAM Totale | Heap JVM | OS Cache | Usage |
|------------|----------|----------|-------|
| 8 GB       | 4 GB     | 4 GB     | Dev/test |
| 32 GB      | 16 GB    | 16 GB    | Production petite échelle |
| 64 GB      | 31 GB    | 33 GB    | Production standard (recommandé) |
| 128 GB     | 31 GB    | 97 GB    | Production haute performance |

**Pourquoi limiter le heap à 32 GB ?** Au-delà, la JVM perd les "compressed oops", augmentant l'empreinte mémoire de ~30-50%.

---

# Dimensionnement Disque

Le stockage doit être dimensionné pour le volume de données ET les performances I/O.

**Capacité disque**:
```
Capacité requise = Volume données brutes × (1 + nombre replicas) × 1.15 × 1.2
                   ├─ Index size        ├─ Réplication         │      │
                   └─ ~15% overhead     └─ 20% marge croissance └─ OS overhead
```

**Exemple**: 1 TB données brutes, 1 replica
```
1 TB × 2 (replica) × 1.15 × 1.2 = 2.76 TB minimum
```

**Types de disque recommandés**:
- ✅ **SSD NVMe**: Performance maximale (indexation lourde, recherche intensive)
- ✅ **SSD SATA**: Bon compromis performance/coût
- ⚠️ **HDD**: Acceptable uniquement pour données froides/archives (avec node.attr.temperature: cold)
- ❌ **Network storage (NFS, SMB)**: Performance insuffisante, forte latence

**I/O monitoring**: `node_stats.fs.io_stats.total.operations`, `node_stats.fs.io_stats.total.read_time`

---

# Dimensionnement du Nombre de Nœuds

La taille du cluster dépend du volume, des performances et de la HA.

**Estimation du nombre de nœuds data**:

**Méthode 1: Par volume**
```
Nœuds data = (Volume total avec replicas) / 30 TB
```

**Méthode 2: Par shards**
```
Nœuds data = (Nombre total de shards) / 20 shards par nœud
```
(Maximum recommandé: 20 shards/GB heap)

---

# Dimensionnement du Nombre de Nœuds

**Exemple de calcul complet**:
- Volume brut: 5 TB
- Replicas: 1
- Volume total: 10 TB
- Shards primaires: 50 (taille moyenne 100 GB/shard)
- Shards totaux: 100 (avec replicas)

```
Par volume: 10 TB / 30 TB = 1 nœud minimum → 3 nœuds (HA)
Par shards: 100 shards / 20 = 5 nœuds
Recommandation finale: 5 nœuds data
```

**Nœuds master dédiés**: Recommandé pour clusters >10 nœuds (3 masters minimum)

---

# Configuration Système: Heap Size

Le [sizing du heap JVM](https://www.elastic.co/guide/en/elasticsearch/reference/current/advanced-configuration.html#set-jvm-heap-size) est l'optimisation la plus critique.

**Configuration dans jvm.options**:
```
# Toujours identique Xms = Xmx
-Xms16g
-Xmx16g
```

**Règles impératives**:
1. ✅ **-Xms = -Xmx** (évite le resizing dynamique)
2. ✅ **Maximum 32 GB** (limite compressed oops)
3. ✅ **50% de la RAM totale** (le reste pour OS cache)
4. ✅ **Minimum 4 GB** pour production

---

# Configuration Système: Heap Size

**Vérification de la configuration**:
```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_max_in_bytes
```

**Symptômes de heap mal dimensionné**:
- Heap trop petit: `OutOfMemoryError`, GC fréquents
- Heap trop grand: Pauses GC longues (>1s), latence dégradée
- Xms ≠ Xmx: Pauses pour resizing, instabilité

---

# Configuration Système: Swap Disabled

Le [swap doit être désactivé](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup-configuration-memory.html) pour éviter les dégradations de performance catastrophiques.

**Pourquoi désactiver le swap ?**
Lorsque la JVM est swappée sur disque, les performances s'effondrent (latence × 1000).

**Méthode 1: Désactivation complète du swap** (recommandé)
```bash
sudo swapoff -a

# Permanent: commenter les lignes swap dans /etc/fstab
sudo vi /etc/fstab
# Commenter: # /dev/mapper/swap_1 none swap sw 0 0
```

**Méthode 2: Limiter le swappiness** (alternative)
```bash
# Réduire la tendance au swap (0 = seulement en cas d'urgence)
sudo sysctl vm.swappiness=1

# Permanent
echo "vm.swappiness=1" | sudo tee -a /etc/sysctl.conf
```

---

# Configuration Système: Swap Disabled

**Méthode 3: mlockall dans Elasticsearch** (alternative)
```yaml
# elasticsearch.yml
bootstrap.memory_lock: true
```

**Vérification**:
```bash
GET /_nodes?filter_path=nodes.*.process.mlockall
```

---

# Configuration Système: File Descriptors

Elasticsearch nécessite un [nombre élevé de file descriptors](https://www.elastic.co/guide/en/elasticsearch/reference/current/file-descriptors.html) pour gérer les connexions et fichiers index.

**Minimum requis**: 65536 file descriptors par processus Elasticsearch

**Configuration pour utilisateur elasticsearch**:
```bash
# /etc/security/limits.conf
elasticsearch  -  nofile  65536
elasticsearch  -  nproc   4096
```

**Vérification**:
```bash
# Avant démarrage Elasticsearch
ulimit -n
# Doit afficher: 65536

# Après démarrage
GET /_nodes/stats/process?filter_path=nodes.*.process.max_file_descriptors
```

---

# Configuration Système: File Descriptors

**Symptômes de limite trop basse**:
- Erreurs "Too many open files"
- Impossibilité d'ouvrir de nouveaux segments
- Échecs de connexion HTTP/transport

---

# Configuration Système: Thread Pools

Elasticsearch utilise plusieurs [thread pools](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-threadpool.html) pour différentes opérations.

**Thread pools principaux**:
| Pool | Usage | Taille par défaut | Quand ajuster |
|------|-------|-------------------|---------------|
| **search** | Requêtes de recherche | `(cores × 3/2) + 1` | Recherche intensive |
| **write** | Indexation de documents | `cores` | Indexation intensive |
| **get** | Requêtes GET par ID | `cores` | Lookups fréquents |
| **analyze** | Requêtes _analyze | `1` | Rarement ajusté |
| **refresh** | Refresh des index | `(cores / 2)` | Rarement ajusté |

---

# Configuration Système: Thread Pools

**Exemple d'ajustement** (rarement nécessaire):
```yaml
# elasticsearch.yml
thread_pool:
  write:
    size: 16
    queue_size: 1000
```

**Monitoring thread pools**:
```bash
GET /_cat/thread_pool?v&h=node_name,name,active,queue,rejected
```

**Attention**: Augmenter les thread pools n'améliore pas toujours les performances. Symptôme souvent d'un problème de dimensionnement CPU/mémoire.

---

# Topologie Réseau: Architecture Cluster

La [topologie réseau](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-network.html) impacte fortement la latence et la disponibilité.

**Architectures recommandées**:

**Petit cluster (1-10 nœuds)**:
```
\[Client\] → \[Node 1\] \[Node 2\] \[Node 3\]
            (all roles: master + data + ingest)
```
Tous les nœuds partagent tous les rôles, simplicité maximale.


**Cluster moyen (10-50 nœuds)**:
```
\[Client\] → \[Coordinating\] \[Coordinating\]
                ↓              ↓
           \[Data 1-10\]    \[Data 11-20\]
                ↓              ↓
           \[Master 1\] \[Master 2\] \[Master 3\]
```
Séparation master/data/coordinating pour stabilité.

---

# Topologie Réseau: Architecture Cluster

**Grand cluster (50+ nœuds)**:
```
\[Client\] → \[Load Balancer\]
                ↓
        \[Coordinating 1-N\]
                ↓
        \[Data Hot\] \[Data Warm\] \[Data Cold\]
                ↓
        \[Master 1\] \[Master 2\] \[Master 3\]
```
Architecture hot-warm-cold pour optimisation coût/performance.

---

# Topologie Réseau: Latence et Débit

Les performances réseau sont critiques pour un cluster distribué.

**Exigences réseau**:
- **Latence intra-cluster**: <1ms (idéalement <0.5ms)
- **Débit intra-cluster**: ≥10 Gbps (idéalement 40 Gbps)
- **Latence client-cluster**: <10ms pour expérience utilisateur fluide
- **Débit client-cluster**: Selon charge (1-10 Gbps)

**Configuration réseau dans elasticsearch.yml**:
```yaml
network.host: 0.0.0.0                    # Écoute sur toutes les interfaces
http.port: 9200                          # Port API REST
transport.port: 9300                     # Port communication inter-nœuds

# Performance tuning
transport.tcp.compress: true             # Compression transport (↓ bande passante)
http.max_content_length: 100mb           # Taille max requête HTTP
```

---

# Topologie Réseau: Nœuds Master Dédiés

Les [nœuds master](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery.html) gèrent l'état du cluster et doivent être stables.

**Quand utiliser des masters dédiés ?**
- ✅ Clusters >10 nœuds
- ✅ Charges d'indexation/recherche très élevées
- ✅ Besoin de stabilité maximale

**Configuration master-only node**:
```yaml
# elasticsearch.yml
node.roles: [ master ]

# Ressources minimales
# CPU: 2-4 cores
# RAM: 8 GB (4 GB heap)
# Disque: 50 GB
```

---

# Topologie Réseau: Nœuds Master Dédiés

**Nombre de masters**:
- **3 masters**: Standard (tolère 1 panne)
- **5 masters**: Grande échelle (tolère 2 pannes)
- **Toujours impair**: Évite split-brain

**Quorum**:
```
Quorum = (nombre_masters / 2) + 1
3 masters → quorum = 2
5 masters → quorum = 3
```

---

# Architecture Hot-Warm-Cold

L'[architecture hot-warm-cold](https://www.elastic.co/guide/en/elasticsearch/reference/current/data-tiers.html) optimise coût et performance selon l'âge des données.

**Tiers de données**:

**Hot tier** (données récentes, <7 jours):
- Nœuds haute performance (SSD NVMe, 64 GB RAM, 16 cores)
- Indexation et recherche intensive
- Configuration: `node.roles: [ data_hot ]`

**Warm tier** (données moyennes, 7-90 jours):
- Nœuds performance moyenne (SSD SATA, 32 GB RAM, 8 cores)
- Recherche occasionnelle, pas d'indexation
- Configuration: `node.roles: [ data_warm ]`

---

# Architecture Hot-Warm-Cold

**Cold tier** (données anciennes, >90 jours):
- Nœuds basse performance (HDD, 16 GB RAM, 4 cores)
- Recherche rare, coût minimum
- Configuration: `node.roles: [ data_cold ]`

**Migration automatique**: Index Lifecycle Management (ILM) gère les transitions hot→warm→cold.

---

# Optimisation de l'Indexation

[L'optimisation de l'indexation](https://www.elastic.co/guide/en/elasticsearch/reference/current/tune-for-indexing-speed.html) augmente le débit d'ingestion.

**Techniques d'optimisation**:

**1. Augmenter le refresh interval**:
```json
PUT /my-index/_settings
{
  "index.refresh_interval": "30s"  // Par défaut: 1s
}
```
Moins de refresh = plus de débit (compromis: latence visibility)

**2. Désactiver les replicas pendant bulk initial**:
```json
PUT /my-index/_settings
{
  "index.number_of_replicas": 0
}
// Après bulk: remettre replicas
```

---

# Optimisation de l'Indexation

**3. Utiliser Bulk API avec batches optimaux**:
```bash
# Taille batch optimale: 5-15 MB ou 1000-5000 docs
POST /_bulk
{ "index": { "_index": "my-index" }}
{ "field": "value" }
...
```

**4. Ajuster thread pool write**:
Généralement inutile, signe de sous-dimensionnement CPU/RAM.

---

# Optimisation de la Recherche

[L'optimisation de la recherche](https://www.elastic.co/guide/en/elasticsearch/reference/current/tune-for-search-speed.html) réduit la latence des requêtes.

**Techniques d'optimisation**:

**1. Utiliser filter context (mis en cache)**:
```json
GET /products/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "category": "electronics" }},
        { "range": { "price": { "lte": 1000 }}}
      ]
    }
  }
}
```
Les filtres sont cachés, pas de scoring coûteux.

---

# Optimisation de la Recherche

**2. Optimiser le nombre de shards**:
```
Taille shard optimale: 10-50 GB
Trop de petits shards → overhead de recherche
```

**3. Forcer merge pour segments read-only**:
```json
POST /old-index/_forcemerge?max_num_segments=1
```
Réduit le nombre de segments, accélère les recherches.


---

# Stratégies de Caching

Elasticsearch utilise plusieurs [caches](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-indices.html) pour améliorer les performances.

**Caches principaux**:

**1. Node Query Cache** (cache de résultats de filtres):
```yaml
# elasticsearch.yml
indices.queries.cache.size: 10%  # % du heap
```
Stocke les résultats des filter contexts.

**2. Shard Request Cache** (cache de résultats d'agrégations):
```yaml
indices.requests.cache.size: 1%  # % du heap
```
Cache les résultats pour `size: 0` (agrégations seules).

**3. Filesystem Cache** (OS-level):
Géré automatiquement par l'OS (50% RAM non-heap). Le plus important !

---

# Stratégies de Caching

**Invalidation des caches**:
```bash
POST /my-index/_cache/clear
POST /_cache/clear?query=true&request=true&fielddata=true
```

---

# Query Tuning et Profiling

Le [profiling de requêtes](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-profile.html) identifie les goulots d'étranglement.

**Activer le profiling**:
```json
GET /products/_search
{
  "profile": true,
  "query": {
    "bool": {
      "must": [
        { "match": { "description": "smartphone" }},
        { "range": { "price": { "gte": 500 }}}
      ]
    }
  }
}
```

---

# Query Tuning et Profiling

**Résultat du profile**:
```json
{
  "profile": {
    "shards": [{
      "searches": [{
        "query": [{
          "type": "BooleanQuery",
          "time_in_nanos": 1234567,
          "breakdown": {
            "score": 123456,
            "build_scorer": 234567,
            "match": 876543
          }
        }]
      }]
    }]
  }
}
```

**Analyse**: Identifier les clauses coûteuses (time_in_nanos élevé), optimiser ou réécrire.

---

# Résumé

## Points Clés

- Le **dimensionnement** doit considérer volume, débit, latence et HA (CPU, RAM, disque, nœuds)
- La **configuration système** est critique: heap size (50% RAM, max 32 GB), swap disabled, file descriptors (65536)
- La **topologie réseau** impacte performance et stabilité (masters dédiés, hot-warm-cold, latence <1ms)
- L'**optimisation d'indexation** passe par refresh interval, bulk API, replicas temporairement désactivés
- L'**optimisation de recherche** utilise filter context, sizing shards, force merge, routing, caching

## Formules Importantes

- **Nœuds data**: `(Volume total / 30 TB) + 1`
- **Heap JVM**: `min(RAM / 2, 32 GB)` et `-Xms = -Xmx`
- **Capacité disque**: `Volume × (1 + replicas) × 1.15 × 1.2`
- **Quorum masters**: `(nombre_masters / 2) + 1`


