## 🌟 Bonus Challenge 8.A: Architecture Complète de Production

**Niveau**: Avancé  
**Objectif**: Concevoir et implémenter une architecture de cluster Elasticsearch complète intégrant tous les best practices de production : dedicated masters, hot-warm-cold tiers, rack awareness, monitoring, et disaster recovery.

**Contexte**: Vous êtes architecte infrastructure pour une plateforme de logs qui ingère 500 GB/jour avec rétention de 90 jours. Vous devez concevoir un cluster production-ready avec haute disponibilité, performances optimales, et coûts maîtrisés.

### Exigences du Projet

**Exigences fonctionnelles** :
- Ingestion : 500 GB/jour (~6 MB/s)
- Rétention : 90 jours
- RPO : 1 heure
- RTO : 30 minutes
- Disponibilité : 99.9% (< 8h downtime/an)

**Exigences techniques** :
- Multi-zone (2 zones minimum)
- Hot-Warm-Cold architecture
- Dedicated master nodes
- Snapshots automatisés
- Monitoring et alerting

### Étape 1: Dimensionnement

**Calcul de stockage** :
- 500 GB/jour × 90 jours = 45 TB total
- Hot tier (7 jours) : 3.5 TB
- Warm tier (30 jours) : 15 TB
- Cold tier (53 jours) : 26.5 TB

**Calcul de shards** :
- Taille cible par shard : 30 GB
- Hot : 3500 GB / 30 GB = ~117 shards
- Avec rotation quotidienne : 7 indices × 17 shards = 119 primaires

**Dimensionnement nœuds** :

| Tier | Nœuds | RAM | CPU | Disque | Total Disque |
|------|-------|-----|-----|--------|--------------|
| Master | 3 | 8 GB | 4 cores | 100 GB | 300 GB |
| Hot | 6 | 32 GB | 16 cores | 1 TB SSD | 6 TB |
| Warm | 4 | 16 GB | 8 cores | 5 TB HDD | 20 TB |
| Cold | 3 | 8 GB | 4 cores | 12 TB HDD | 36 TB |

**Total** : 16 nœuds

### Étape 2: Architecture Diagram (Textuel)

```
┌────────────────────────────────────────────────────────────────┐
│  ZONE A                           ZONE B                        │
│                                                                  │
│  ┌─────────────┐                  ┌─────────────┐              │
│  │  Master-A1  │                  │  Master-B1  │              │
│  └─────────────┘                  └─────────────┘              │
│         Master-A2 (zone_a)               (zone_b)              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  HOT TIER (SSD, 7 jours)                                 │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         │  │
│  │  │ Hot-A1 │  │ Hot-A2 │  │ Hot-B1 │  │ Hot-B2 │  ...    │  │
│  │  └────────┘  └────────┘  └────────┘  └────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  WARM TIER (HDD, 30 jours)                               │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │  │
│  │  │ Warm-A1 │  │ Warm-A2 │  │ Warm-B1 │  │ Warm-B2 │    │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  COLD TIER (Searchable Snapshots, 53 jours)             │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │  │
│  │  │ Cold-A1 │  │ Cold-B1 │  │ Cold-B2 │                 │  │
│  │  └─────────┘  └─────────┘  └─────────┘                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MONITORING                                               │  │
│  │  Kibana (Stack Monitoring) + Prometheus + Grafana        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Étape 3: Configuration ILM Policy

Créez une politique ILM complète pour gérer le cycle de vie :

```json
PUT _ilm/policy/logs-lifecycle
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_primary_shard_size": "30GB",
            "max_age": "1d"
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "set_priority": {
            "priority": 50
          },
          "migrate": {
            "enabled": true
          },
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          },
          "readonly": {}
        }
      },
      "cold": {
        "min_age": "37d",
        "actions": {
          "set_priority": {
            "priority": 0
          },
          "migrate": {
            "enabled": true
          },
          "searchable_snapshot": {
            "snapshot_repository": "s3_backup",
            "force_merge_index": true
          }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {
            "delete_searchable_snapshot": true
          }
        }
      }
    }
  }
}
```

### Étape 4: Configuration Index Template

```json
PUT _index_template/logs-template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs-lifecycle",
      "index.lifecycle.rollover_alias": "logs-write"
    },
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date"
        },
        "message": {
          "type": "text"
        },
        "level": {
          "type": "keyword"
        },
        "service": {
          "type": "keyword"
        },
        "host": {
          "type": "keyword"
        }
      }
    }
  },
  "priority": 500
}
```

### Étape 5: Configuration SLM (Snapshot Lifecycle Management)

```json
PUT _slm/policy/daily-snapshots
{
  "schedule": "0 30 2 * * ?",
  "name": "<logs-{now/d}>",
  "repository": "s3_backup",
  "config": {
    "indices": ["logs-*"],
    "ignore_unavailable": true,
    "include_global_state": false
  },
  "retention": {
    "expire_after": "7d",
    "min_count": 7,
    "max_count": 30
  }
}
```

### Étape 6: Monitoring et Alerting Setup

**Alertes critiques à configurer** :

1. **Cluster Health RED** :
```json
PUT _watcher/watch/cluster-health-red
{
  "trigger": {
    "schedule": {
      "interval": "1m"
    }
  },
  "input": {
    "http": {
      "request": {
        "url": "http://localhost:9200/_cluster/health"
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.status": {
        "eq": "red"
      }
    }
  },
  "actions": {
    "notify_ops": {
      "webhook": {
        "url": "https://alerts.example.com/elasticsearch",
        "method": "post",
        "body": "Cluster is RED! Immediate action required."
      }
    }
  }
}
```

2. **Heap > 85%** (déjà créé dans Lab 5.2)

3. **Disk > 85%** :
```json
PUT _watcher/watch/disk-usage-high
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": [".monitoring-es-*"],
        "body": {
          "query": {
            "bool": {
              "must": [
                {
                  "range": {
                    "@timestamp": {
                      "gte": "now-10m"
                    }
                  }
                },
                {
                  "range": {
                    "node_stats.fs.total.available_in_bytes": {
                      "lt": "{{ ctx.metadata.threshold_bytes }}"
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  },
  "metadata": {
    "threshold_bytes": 107374182400
  }
}
```

### Étape 7: Disaster Recovery Plan

**Documentation du DR Plan** :

```markdown
# Disaster Recovery Runbook

## RPO: 1 heure
## RTO: 30 minutes

### Scenario 1: Perte d'une Zone Complète

**Detection**:
- Cluster status: YELLOW
- 50% des nœuds down
- Shards unassigned avec raison NODE_LEFT

**Actions**:
1. Vérifier que les primaires sont tous actifs (Zone B)
2. Ne PAS forcer allocation immédiatement (attendre 10 minutes)
3. Si Zone A ne revient pas : Augmenter répliques temporairement
4. Communiquer aux stakeholders : Service dégradé mais opérationnel

**Recovery**:
1. Une fois Zone A revenue : Laisser auto-recovery
2. Monitorer la réallocation des shards
3. Vérifier cluster GREEN après recovery

### Scenario 2: Corruption de Données

**Detection**:
- Requêtes retournent données incorrectes
- Shards en état UNASSIGNED avec raison ALLOCATION_FAILED

**Actions**:
1. Identifier l'index corrompu
2. Restaurer depuis dernier snapshot (max 1h de perte)
3. Restaurer avec rename : `restored_<index-name>`
4. Valider les données
5. Basculer alias vers index restauré
6. Supprimer index corrompu

**Commandes**:
```bash
# 1. Lister snapshots
GET /_snapshot/s3_backup/_all

# 2. Restaurer
POST /_snapshot/s3_backup/logs-2024-01-15/_restore
{
  "indices": "logs-2024-01-15",
  "rename_pattern": "(.+)",
  "rename_replacement": "restored_$1"
}

# 3. Basculer alias
POST /_aliases
{
  "actions": [
    {"remove": {"index": "logs-2024-01-15", "alias": "logs-current"}},
    {"add": {"index": "restored_logs-2024-01-15", "alias": "logs-current"}}
  ]
}
```
```

### Étape 8: Validation de l'Architecture

**Checklist de validation** :

- ✅ **Sizing** : Calculé selon charges réelles (500 GB/jour)
- ✅ **HA** : Multi-zone, répliques, quorum masters
- ✅ **Performance** : Hot tier SSD, shards < 50 GB
- ✅ **Coûts** : Warm/Cold HDD pour archives
- ✅ **Lifecycle** : ILM automatisé (hot→warm→cold→delete)
- ✅ **Backups** : SLM quotidien, rétention 7 jours
- ✅ **Monitoring** : Alertes critiques (health, heap, disk)
- ✅ **DR** : Runbook documenté, RPO/RTO testés
- ✅ **Security** : RBAC, TLS, audit logging
- ✅ **Documentation** : Architecture diagrams, runbooks

### Points Clés à Retenir

✅ **Dimensionnement** basé sur charges réelles et croissance  
✅ **Hot-Warm-Cold** optimise coûts (SSD uniquement pour données actives)  
✅ **ILM automatise** le cycle de vie (rollover, migration, suppression)  
✅ **Multi-zone** avec rack awareness garantit HA  
✅ **SLM** automatise les snapshots pour DR  
✅ **Monitoring proactif** détecte problèmes avant impact utilisateur  
✅ **Runbooks documentés** accélèrent résolution incidents  
✅ **Tests réguliers** (DR, load testing) valident l'architecture  
✅ **Architecture évolutive** : Ajouter nœuds horizontalement selon besoins  
✅ **Trade-offs** : Performance vs Coûts vs Complexité

**Félicitations !** Vous avez conçu une architecture Elasticsearch production-ready ! 🎉

---

