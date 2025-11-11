---
layout: cover
---

# Bonnes Pratiques de Production

Architecture, haute disponibilité, et gestion opérationnelle

---

# Objectifs d'Apprentissage

À la fin de ce module, vous serez capable de :

- **Concevoir** une architecture de cluster Elasticsearch pour la production
- **Configurer** la haute disponibilité avec réplication et rack awareness
- **Planifier** la disaster recovery avec RPO/RTO appropriés
- **Appliquer** les checklists opérationnelles pour déploiements et incidents

---

# Pourquoi les Bonnes Pratiques sont Essentielles

Un cluster mal configuré en production peut entraîner des **pertes de données** et des **interruptions de service**.

**Risques sans bonnes pratiques** :
1. 💥 **Split-brain** : Cluster se divise en deux parties indépendantes (corruption de données)
2. 📉 **Performance dégradée** : Nœuds surchargés, recherches lentes, indexations bloquées
3. 🔥 **Perte de données** : Pas de répliques, pas de snapshots, défaillance matérielle
4. ⏱️ **Recovery lent** : Pas de plan de disaster recovery, RTO/RPO non respectés
5. 🤷 **Incidents non résolus** : Pas de runbooks, équipes ops perdues

**Objectif** : Construire un cluster **résilient**, **performant**, et **maintenable**.

---
layout: section
---

# Partie 1: Patterns d'Architecture de Cluster

Séparation des rôles et dimensionnement

---

# Rôles de Nœuds Elasticsearch

Elasticsearch permet de spécialiser les nœuds avec des **rôles** pour optimiser performance et stabilité.

| Rôle | Description | Ressources | Charge de travail |
|------|-------------|------------|-------------------|
| **master** | Gestion du cluster (état, shards, indices) | CPU moyen, RAM faible | Faible (métadonnées) |
| **data** | Stockage et recherche de données | CPU élevé, RAM élevée, Disque rapide | Très élevée |
| **data_hot** | Données actives (écritures fréquentes) | CPU très élevé, SSD rapide | Indexation intensive |
| **data_warm** | Données anciennes (lectures occasionnelles) | CPU moyen, HDD acceptable | Recherches modérées |
| **data_cold** | Données archivées (lectures rares) | CPU faible, HDD lent | Minimal |
| **ingest** | Transformation de données (pipelines) | CPU élevé, RAM modérée | Traitement de données |
| **ml** | Machine Learning (détection d'anomalies) | CPU très élevé, RAM très élevée | ML tasks |
| **coordinating** | Routage de requêtes (pas de données) | CPU moyen, RAM modérée | Agrégations distribuées |

**Configuration** : Dans `elasticsearch.yml`, définir `node.roles: [master, data]`

---

# Pattern 1 : Cluster de Production Basique (3-5 Nœuds)

**Architecture simple** pour petites à moyennes charges.

```
┌─────────────────────────────────────────┐
│  3 Nœuds Master-eligible + Data         │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ M+D  │  │ M+D  │  │ M+D  │          │
│  │ Node1│  │ Node2│  │ Node3│          │
│  └──────┘  └──────┘  └──────┘          │
└─────────────────────────────────────────┘
```

**Configuration par nœud** :
```yaml
# elasticsearch.yml (sur chaque nœud)
node.roles: [master, data, ingest]
cluster.initial_master_nodes: ["node1", "node2", "node3"]
discovery.seed_hosts: ["node1:9300", "node2:9300", "node3:9300"]
```

**Avantages** :
- ✅ Simple à configurer et maintenir
- ✅ Haute disponibilité avec quorum de 3 masters

**Inconvénients** :
- ❌ Pas de séparation des responsabilités (master et data partagent ressources)
- ❌ Scalabilité limitée (scaling vertical uniquement)

---

# Pattern 2 : Dedicated Master Nodes (Production Recommandé)

**Séparer les rôles** pour éviter que les tâches de gestion impactent les performances de recherche.

```
┌─────────────────────────────────────────────────────────┐
│  3 Dedicated Master Nodes (légers)                       │
│  ┌────────┐  ┌────────┐  ┌────────┐                     │
│  │ Master │  │ Master │  │ Master │                     │
│  │  Only  │  │  Only  │  │  Only  │                     │
│  └────────┘  └────────┘  └────────┘                     │
│                                                           │
│  6+ Data Nodes (lourds en CPU/RAM/Disque)               │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │Data │ │Data │ │Data │ │Data │ │Data │ │Data │      │
│  │ 1   │ │  2  │ │  3  │ │  4  │ │  5  │ │  6  │      │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘      │
└─────────────────────────────────────────────────────────┘
```

**Configuration Master Node** :
```yaml
# elasticsearch.yml (master nodes)
node.name: master-1
node.roles: [master]
cluster.initial_master_nodes: ["master-1", "master-2", "master-3"]
discovery.seed_hosts: ["master-1:9300", "master-2:9300", "master-3:9300"]
```

**Configuration Data Node** :
```yaml
# elasticsearch.yml (data nodes)
node.name: data-1
node.roles: [data, ingest]
discovery.seed_hosts: ["master-1:9300", "master-2:9300", "master-3:9300"]
```

**Avantages** :
- ✅ Masters dédiés = stabilité du cluster
- ✅ Data nodes peuvent être ajoutés horizontalement
- ✅ Isolation des pannes (data node down ≠ perte de quorum master)

---

# Pattern 3 : Hot-Warm-Cold Architecture (ILM)

**Séparation des données** par âge et fréquence d'accès pour optimiser coûts et performances.

```
┌──────────────────────────────────────────────────────────────┐
│  HOT Tier (SSD rapides, indexation intensive)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Hot Data │  │ Hot Data │  │ Hot Data │                   │
│  │  Node 1  │  │  Node 2  │  │  Node 3  │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│  Données actives : logs dernières 24h                        │
│                                                               │
│  WARM Tier (HDD, lectures modérées)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │Warm Data │  │Warm Data │  │Warm Data │                   │
│  │  Node 1  │  │  Node 2  │  │  Node 3  │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│  Données anciennes : logs 1-30 jours                         │
│                                                               │
│  COLD Tier (Stockage économique, lectures rares)             │
│  ┌──────────┐  ┌──────────┐                                 │
│  │Cold Data │  │Cold Data │                                 │
│  │  Node 1  │  │  Node 2  │                                 │
│  └──────────┘  └──────────┘                                 │
│  Archives : logs > 30 jours                                  │
└──────────────────────────────────────────────────────────────┘
```

**Configuration** :
```yaml
# Hot node
node.roles: [data_hot, data_content]
node.attr.data: hot

# Warm node
node.roles: [data_warm, data_content]
node.attr.data: warm

# Cold node
node.roles: [data_cold]
node.attr.data: cold
```

**ILM Policy** pour migration automatique :
```json
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "50GB",
            "max_age": "1d"
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": { "number_of_shards": 1 },
          "forcemerge": { "max_num_segments": 1 }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "searchable_snapshot": {
            "snapshot_repository": "my_backup"
          }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

---

# Pattern 4 : Coordinating Nodes (Large Clusters)

**Nœuds de coordination** dédiés pour répartir la charge des agrégations complexes.

```
┌────────────────────────────────────────────────────────┐
│  Load Balancer                                          │
│  └────────────────────────────────────────────────────┘│
│        │         │         │         │                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │Coordinat│ │Coordinat│ │Coordinat│                  │
│  │  ing 1  │ │  ing 2  │ │  ing 3  │                  │
│  └─────────┘ └─────────┘ └─────────┘                  │
│        │         │         │                            │
│        └─────────┴─────────┘                            │
│                  │                                       │
│         Data Nodes (20+)                                │
└────────────────────────────────────────────────────────┘
```

**Configuration Coordinating Node** :
```yaml
node.roles: []  # Vide = coordinating only
```

**Use Case** : Clusters avec >50 nœuds data où les agrégations consomment beaucoup de mémoire.

---

# Dimensionnement : Règles de Thumb

**Combien de nœuds et quelle taille ?**

| Ressource | Recommandation | Justification |
|-----------|----------------|---------------|
| **Heap JVM** | 50% de RAM, max 31 GB | Au-delà de 32GB, perte de compressed oops |
| **RAM totale** | 2x Heap (reste pour OS cache) | OS cache accélère les lectures disque |
| **CPU** | 8+ cores pour data nodes | Recherches et indexations parallèles |
| **Disque** | SSD pour hot, HDD pour warm/cold | Latence critique pour indexation |
| **Shards** | 20-50 GB par shard | Trop petits = overhead, trop gros = recovery lent |
| **Shards par nœud** | < 3000 shards | Au-delà, dégradation performance master |

**Exemple de dimensionnement** :
- 500 GB de données actives
- Shards de 30 GB → 17 shards primaires
- Réplication factor 1 → 17 répliques
- Total : 34 shards
- Recommandation : 4-6 data nodes

---
layout: section
---

# Partie 2: Configuration de Haute Disponibilité

Réplication, rack awareness, et cross-cluster replication

---

# Haute Disponibilité : Principes

**Haute disponibilité** = Le cluster continue de fonctionner malgré des pannes.

**Composants de HA** :
1. **Quorum de masters** : 3+ master-eligible nodes (éviter split-brain)
2. **Répliques de shards** : 1+ répliques par shard primaire
3. **Rack Awareness** : Distribuer répliques sur différentes zones de disponibilité
4. **Load Balancing** : Distribuer requêtes sur plusieurs nœuds
5. **Monitoring et Alerting** : Détecter pannes rapidement

**Formule de quorum** : `(nombre_masters / 2) + 1`
- 3 masters → quorum = 2 (tolérance : 1 panne)
- 5 masters → quorum = 3 (tolérance : 2 pannes)

---

# Configuration des Répliques

**Répliques** = Copies des shards primaires pour tolérer pannes et répartir charge de lecture.

**Configurer le nombre de répliques** :

```bash
# Au niveau index
PUT /my-index
{
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 2
  }
}

# Modifier un index existant
PUT /my-index/_settings
{
  "number_of_replicas": 2
}
```

**Stratégie de réplication** :

| Environnement | Répliques | Justification |
|---------------|-----------|---------------|
| **Dev/Test** | 0 | Performance max, pas de HA requis |
| **Staging** | 1 | Balance entre HA et coût |
| **Production** | 1-2 | HA standard (2 = tolérance 2 pannes) |
| **Critique** | 2+ | Mission-critical (finance, santé) |

**Note** : `number_of_replicas = 2` signifie **3 copies totales** (1 primaire + 2 répliques)

---

# Rack Awareness (Shard Allocation Awareness)

**Problème** : Si tous les shards primaires et répliques sont sur le même rack/zone → panne du rack = perte de données.

**Solution** : **Rack Awareness** distribue répliques sur différentes zones de disponibilité.

```
┌─────────────────────────────────────────────────────────┐
│  Zone A (Datacenter 1)    Zone B (Datacenter 2)         │
│  ┌────────────┐            ┌────────────┐               │
│  │ Primary 0  │            │ Replica 0  │               │
│  │ Replica 1  │            │ Primary 1  │               │
│  └────────────┘            └────────────┘               │
│                                                          │
│  Si Zone A down → Zone B a toutes les données           │
└─────────────────────────────────────────────────────────┘
```

**Configuration** :

1. **Déclarer l'attribut d'awareness** dans `elasticsearch.yml` :

```yaml
# Node dans Zone A
node.attr.zone: zone_a
cluster.routing.allocation.awareness.attributes: zone

# Node dans Zone B
node.attr.zone: zone_b
cluster.routing.allocation.awareness.attributes: zone
```

2. **Forcer la distribution** (optionnel mais recommandé) :

```yaml
cluster.routing.allocation.awareness.force.zone.values: zone_a,zone_b
```

Cela force Elasticsearch à **ne jamais allouer** primaire et réplique sur la même zone.

---

# Shard Allocation Filtering

**Contrôler** où les shards sont alloués selon des attributs personnalisés.

**Use Cases** :
- Migrer indices vers nouveaux nœuds
- Réserver certains nœuds pour indices critiques
- Évacuer un nœud avant maintenance

**Attributs personnalisés** :

```yaml
# elasticsearch.yml
node.attr.type: hot
node.attr.environment: production
```

**Filtrer allocation par index** :

```bash
# Allouer uniquement sur nœuds "hot"
PUT /logs-2024-01/_settings
{
  "index.routing.allocation.require.type": "hot"
}

# Exclure certains nœuds
PUT /logs-2024-01/_settings
{
  "index.routing.allocation.exclude._name": "node-3,node-4"
}

# Inclure uniquement certains nœuds
PUT /logs-2024-01/_settings
{
  "index.routing.allocation.include.environment": "production"
}
```

**Filtrer au niveau cluster** :

```bash
PUT /_cluster/settings
{
  "transient": {
    "cluster.routing.allocation.exclude._ip": "192.168.1.50"
  }
}
```

---

# Cross-Cluster Replication (CCR)

**CCR** réplique des indices d'un cluster (leader) vers un autre cluster (follower) pour disaster recovery ou géo-distribution.

```
┌─────────────────────────────────────────────────────┐
│  Cluster Primary (Paris)       Cluster DR (Londres) │
│  ┌──────────────┐              ┌──────────────┐     │
│  │ Leader Index │  ─────────>  │Follower Index│     │
│  │  orders      │   Réplication│  orders      │     │
│  └──────────────┘              └──────────────┘     │
│                                                      │
│  Si Paris down → Basculer vers Londres              │
└─────────────────────────────────────────────────────┘
```

**Configuration CCR** :

1. **Configurer le remote cluster** (sur follower) :

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.remote.leader_cluster.seeds": [
      "paris-node1:9300",
      "paris-node2:9300"
    ]
  }
}
```

2. **Créer un follower index** :

```bash
PUT /orders/_ccr/follow
{
  "remote_cluster": "leader_cluster",
  "leader_index": "orders"
}
```

3. **Surveiller la réplication** :

```bash
GET /orders/_ccr/stats
```

**Use Cases** :
- **Disaster Recovery** : Cluster de secours dans une autre région
- **Géo-distribution** : Données répliquées près des utilisateurs
- **Reporting** : Cluster de reporting séparé du cluster de production

---
layout: section
---

# Partie 3: Planification de Disaster Recovery

RPO, RTO, et stratégies de sauvegarde

---

# RPO et RTO : Définitions

**RPO (Recovery Point Objective)** : Perte de données maximale acceptable

- RPO = 1 heure → Snapshots toutes les heures
- RPO = 5 minutes → Réplication synchrone (CCR)

**RTO (Recovery Time Objective)** : Temps maximum pour restaurer le service

- RTO = 4 heures → Restauration manuelle acceptable
- RTO = 15 minutes → Cluster de standby requis

```
┌────────────────────────────────────────────────────┐
│  Timeline d'incident                                │
│                                                     │
│  [Incident] ←─ RPO ─→ [Last Backup]                │
│      │                                              │
│      ↓                                              │
│  [Recovery Starts] ←─ RTO ─→ [Service Restored]    │
└────────────────────────────────────────────────────┘
```

**Exemples par criticité** :

| Type de données | RPO | RTO | Stratégie |
|-----------------|-----|-----|-----------|
| Logs applicatifs | 24h | 8h | Snapshots quotidiens |
| Données transactionnelles | 1h | 2h | Snapshots horaires + répliques |
| Données financières | 5 min | 15 min | CCR + répliques multiples |
| Données critiques santé | 0 (sync) | 5 min | CCR synchrone + standby cluster |

---

# Stratégies de Sauvegarde

**3-2-1 Rule** : 3 copies, 2 supports différents, 1 copie off-site

**Stratégie 1 : Snapshots réguliers** :
- **RPO** : Dépend de la fréquence (1h, 6h, 24h)
- **RTO** : Temps de restauration (15 min - 2h selon taille)

```bash
# SLM policy pour snapshots horaires
PUT /_slm/policy/hourly-snapshots
{
  "schedule": "0 * * * *",
  "name": "<hourly-{now/h}>",
  "repository": "s3_backup",
  "config": {
    "indices": "*"
  },
  "retention": {
    "expire_after": "7d",
    "min_count": 24
  }
}
```

**Stratégie 2 : CCR pour DR** :
- **RPO** : Quasi-temps réel (< 1 minute)
- **RTO** : Basculement manuel (5-15 minutes)

**Stratégie 3 : Hybrid (Snapshots + CCR)** :
- **CCR** pour recovery rapide
- **Snapshots** pour protection contre corruption logique et conformité

---

# Tester le Disaster Recovery

**Règle d'or** : Un plan DR non testé = pas de plan DR

**Tests réguliers** :

1. **Test de restauration de snapshot** (mensuel) :
   - Restaurer snapshot dans cluster de test
   - Vérifier intégrité des données
   - Mesurer le temps de restauration (RTO réel)

2. **Test de basculement CCR** (trimestriel) :
   - Promouvoir follower index en leader
   - Rediriger applications vers cluster DR
   - Mesurer le temps de basculement

3. **Simulation de panne complète** (annuel) :
   - Arrêter le cluster primaire
   - Activer cluster DR
   - Valider que les applications fonctionnent

**Documenter les résultats** :
- RPO/RTO atteints vs objectifs
- Points de blocage rencontrés
- Actions correctives

---

# Checklist de Disaster Recovery

**Avant incident** :
- ✅ Snapshots automatisés (SLM) configurés et testés
- ✅ CCR configuré si RPO < 1h requis
- ✅ Runbook de disaster recovery documenté et accessible
- ✅ Équipe formée aux procédures de DR
- ✅ Contacts d'escalation définis
- ✅ Accès aux credentials de secours disponibles

**Pendant incident** :
1. Évaluer l'ampleur (quels indices/nœuds affectés ?)
2. Décider : Restauration locale ou basculement DR ?
3. Exécuter le runbook approprié
4. Communiquer status aux stakeholders
5. Logger toutes les actions

**Après incident** :
1. Post-mortem : Cause root, timeline, impact
2. Vérifier intégrité des données restaurées
3. Mettre à jour le runbook si nécessaire
4. Planifier actions préventives

---
layout: section
---

# Partie 4: Checklists Opérationnelles

Pre-deployment, monitoring, et incident response

---

# Pre-Deployment Checklist

**Avant de déployer en production** :

**Infrastructure** :
- ✅ Sizing approprié (CPU, RAM, disque selon charges attendues)
- ✅ Dedicated master nodes (3+ pour quorum)
- ✅ Rack awareness configuré (multi-AZ)
- ✅ Network optimisé (latence < 10ms entre nœuds)
- ✅ Firewall configuré (port 9200, 9300)

**Configuration Elasticsearch** :
- ✅ Heap size = 50% RAM, max 31 GB
- ✅ Swap désactivé (`bootstrap.memory_lock: true`)
- ✅ File descriptors ≥ 65535
- ✅ Virtual memory `vm.max_map_count` ≥ 262144
- ✅ Cluster name unique et meaningful

**Sécurité** :
- ✅ Sécurité activée (`xpack.security.enabled: true`)
- ✅ TLS/SSL configuré (transport et HTTP)
- ✅ Utilisateurs et rôles créés selon principe du moindre privilège
- ✅ Audit logging activé
- ✅ Passwords complexes pour utilisateurs intégrés

**Haute Disponibilité** :
- ✅ Répliques configurées (1-2 selon criticité)
- ✅ SLM policies pour snapshots automatiques
- ✅ Repository de snapshots testé
- ✅ CCR configuré si RPO < 1h

**Monitoring** :
- ✅ Stack Monitoring activé
- ✅ Alertes configurées (cluster health, disk, heap)
- ✅ Dashboards Kibana créés pour métriques clés
- ✅ Intégration avec système de monitoring externe (Prometheus, Datadog)

---

# Monitoring Checklist

**Métriques à surveiller en continu** :

**Santé du Cluster** :
- ✅ Cluster status (GREEN / YELLOW / RED)
- ✅ Nombre de nœuds actifs
- ✅ Shards non assignés
- ✅ Tasks en attente (pending tasks)

**Performance** :
- ✅ Indexing rate (docs/sec)
- ✅ Search rate (queries/sec)
- ✅ Search latency (p95, p99)
- ✅ Indexing latency

**Ressources** :
- ✅ Heap usage (alerte si > 85%)
- ✅ GC frequency et duration (alerte si GC > 5s)
- ✅ Disk usage (alerte si > 85%)
- ✅ CPU usage
- ✅ Network I/O

**Disponibilité** :
- ✅ Uptime des nœuds
- ✅ Rejected requests (thread pools)
- ✅ Circuit breakers trips

**Seuils d'alerte recommandés** :

| Métrique | Warning | Critical |
|----------|---------|----------|
| Heap usage | > 75% | > 85% |
| Disk usage | > 75% | > 85% |
| GC duration | > 1s | > 5s |
| Cluster status | YELLOW | RED |
| Pending tasks | > 10 | > 50 |

---

# Incident Response Runbook

**Workflow général** :

```
[Alerte] → [Triage] → [Diagnostic] → [Mitigation] → [Resolution] → [Post-Mortem]
```

**Incident 1 : Cluster status RED** :

**Symptôme** : `GET /_cluster/health` retourne `"status": "red"`

**Triage** :
```bash
# Identifier les indices RED
GET /_cat/indices?v&health=red

# Identifier shards non assignés
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason
```

**Diagnostic** :
```bash
# Pourquoi les shards ne sont pas assignés ?
GET /_cluster/allocation/explain
{
  "index": "problematic-index",
  "shard": 0,
  "primary": true
}
```

**Causes courantes** :
- Nœud(s) down → Attendre recovery ou forcer allocation
- Disk watermark exceeded → Libérer espace ou ajouter nœuds
- Shard corruption → Restaurer depuis snapshot

**Mitigation** :
```bash
# Si disk full : Augmenter watermark temporairement
PUT /_cluster/settings
{
  "transient": {
    "cluster.routing.allocation.disk.watermark.low": "95%",
    "cluster.routing.allocation.disk.watermark.high": "97%"
  }
}

# Si corruption : Forcer allocation d'un replica comme primaire
POST /_cluster/reroute
{
  "commands": [{
    "allocate_replica": {
      "index": "my-index",
      "shard": 0,
      "node": "node-2"
    }
  }]
}
```

---

# Incident 2 : Performance Dégradée

**Symptôme** : Recherches lentes (p95 > 1s), indexation lente

**Diagnostic** :

```bash
# 1. Vérifier les slow logs
GET /slow-index/_settings?include_defaults=false

# 2. Identifier les hot threads
GET /_nodes/hot_threads

# 3. Vérifier les tasks en cours
GET /_cat/tasks?v&detailed

# 4. Analyser les thread pools
GET /_cat/thread_pool?v&h=name,active,rejected,queue
```

**Causes courantes** :
- **Requêtes lourdes** : Filtres inefficaces, wildcards
- **Heap pressure** : GC thrashing, circuit breakers
- **Disk I/O** : Merges intensifs, snapshots en cours
- **Shard allocation** : Déséquilibre des shards

**Mitigation** :

```bash
# Augmenter les thread pools temporairement
PUT /_cluster/settings
{
  "transient": {
    "thread_pool.write.queue_size": 1000
  }
}

# Désactiver réplication temporairement (si indexation massive)
PUT /_cluster/settings
{
  "transient": {
    "cluster.routing.allocation.enable": "primaries"
  }
}

# Après indexation, réactiver
PUT /_cluster/settings
{
  "transient": {
    "cluster.routing.allocation.enable": "all"
  }
}
```

---

# Incident 3 : Split-Brain Detection

**Symptôme** : Deux clusters indépendants se forment (duplication de données, conflits)

**Prévention** :
```yaml
# elasticsearch.yml
discovery.zen.minimum_master_nodes: 2  # Pour 3 masters (quorum)
```

**Diagnostic** :
```bash
# Vérifier les masters élus
GET /_cat/master?v

# Comparer cluster state sur différents nœuds
GET /_cluster/state/master_node
```

**Résolution** :
1. **Arrêter l'écriture** sur les deux clusters
2. **Identifier le cluster authoritative** (le plus récent/complet)
3. **Arrêter le cluster non-authoritative**
4. **Fusionner les données** si nécessaire via restauration
5. **Reconfigurer discovery.seed_hosts** pour éviter récurrence

---

# Post-Incident Actions

**Post-Mortem Template** :

```markdown
# Incident Post-Mortem: [Titre]

**Date**: 2024-01-15
**Durée**: 2h 30min
**Impact**: Recherches indisponibles pour 10% utilisateurs

## Timeline
- 10:00 : Alerte Cluster RED
- 10:05 : Équipe Ops notifiée
- 10:15 : Diagnostic identifie disk full
- 10:45 : Ajout de nœuds data, réallocation shards
- 12:30 : Cluster GREEN, service restauré

## Root Cause
Croissance de données imprévue (3x normal) suite à bug applicatif

## Impact
- 2000 requêtes échouées
- 0 perte de données (répliques OK)

## Actions Correctives
1. Implémenter alerte sur croissance anormale de données
2. Automatiser ajout de nœuds (scaling horizontal)
3. Fixer le bug applicatif
4. Augmenter disk watermark thresholds

## Lessons Learned
- Besoin de capacity planning plus proactif
- Runbook disk full à mettre à jour
```

---

# Résumé : Bonnes Pratiques de Production

| Domaine | Best Practice | Bénéfice |
|---------|---------------|----------|
| **Architecture** | Dedicated master nodes (3+) | Stabilité du cluster |
| **Architecture** | Hot-Warm-Cold tiers | Optimisation coûts |
| **Sizing** | Heap ≤ 31 GB, 50% RAM | Performance optimale |
| **HA** | Répliques + Rack Awareness | Tolérance aux pannes |
| **HA** | CCR pour DR (RPO < 1h) | Recovery rapide |
| **Backup** | SLM automatisé + tests mensuels | Protection données |
| **Monitoring** | Alertes sur heap, disk, status | Détection précoce |
| **Sécurité** | TLS + RBAC + Audit logging | Conformité et protection |
| **Opérations** | Runbooks documentés et testés | Résolution rapide incidents |

**Principe fondamental** : **Concevoir pour la panne** (Design for Failure)

---

# Points Clés à Retenir

**Architecture** :
- Séparer les rôles (dedicated masters, data tiers)
- Dimensionner selon charges réelles (load testing)
- Hot-Warm-Cold pour optimiser coûts

**Haute Disponibilité** :
- Quorum de masters (3+), répliques (1-2)
- Rack awareness pour distribution géographique
- CCR pour disaster recovery multi-région

**Disaster Recovery** :
- Définir RPO/RTO selon criticité métier
- Snapshots automatisés (SLM) + tests réguliers
- Runbooks de DR documentés et pratiqués

**Opérations** :
- Checklists pre-deployment rigoureuses
- Monitoring proactif avec alertes
- Incident response runbooks pour scénarios courants
- Post-mortems après chaque incident

---

# Ressources et Documentation

**Documentation officielle Elasticsearch** :
- [Cluster design](https://www.elastic.co/guide/en/elasticsearch/reference/current/scalability.html)
- [High availability](https://www.elastic.co/guide/en/elasticsearch/reference/current/high-availability.html)
- [Shard allocation awareness](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-cluster.html#shard-allocation-awareness)

**Guides de production** :
- [Production deployment](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup.html)
- [Disaster recovery](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html)
- [Monitoring best practices](https://www.elastic.co/guide/en/elasticsearch/reference/current/monitor-elasticsearch-cluster.html)

**Blogs et whitepapers** :
- [Elasticsearch Best Practices](https://www.elastic.co/blog/found-elasticsearch-in-production)
- [Sizing Elasticsearch](https://www.elastic.co/elasticon/conf/2016/sf/quantitative-cluster-sizing)
