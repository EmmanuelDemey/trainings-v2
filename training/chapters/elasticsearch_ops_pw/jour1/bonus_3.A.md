## 🌟 Bonus 3.A: Architecture Hot-Warm-Cold avec ILM

**Niveau**: Avancé
**Prérequis**: Labs 2.2 et 3.1 complétés

### Objectif

Concevoir une architecture hot-warm-cold pour optimiser coût/performance, et configurer des policies Index Lifecycle Management (ILM) pour automatiser les transitions.

### Contexte

Votre cluster stocke des logs avec des patterns d'accès variables: les logs récents (<7 jours) sont consultés fréquemment (hot), les logs moyens (7-30 jours) occasionnellement (warm), et les vieux logs (>30 jours) rarement (cold). Vous voulez optimiser les coûts en utilisant du matériel différent par tier.

### Challenge

**Partie 1**: Configurer les node attributes pour les tiers

Définissez un attribut `data_tier` sur chaque nœud:

```yaml
# Nœuds HOT (haute performance)
node.name: hot-node-1
node.roles: [ data_hot ]
# Pas besoin de node.attr.data_tier avec data_hot role

# Nœuds WARM (performance moyenne)
node.name: warm-node-1
node.roles: [ data_warm ]

# Nœuds COLD (basse performance, stockage économique)
node.name: cold-node-1
node.roles: [ data_cold ]
```

Redémarrez les nœuds et vérifiez:

```bash
GET /_cat/nodes?v&h=name,node.role
```

**Résultat attendu**:
```
name         node.role
hot-node-1   h
warm-node-1  w
cold-node-1  c
```

**Partie 2**: Créer une policy ILM

Définissez une policy qui transition hot→warm→cold→delete:

```bash
PUT /_ilm/policy/logs-policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "50GB",
            "max_age": "1d",
            "max_docs": 10000000
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          },
          "set_priority": {
            "priority": 50
          },
          "allocate": {
            "require": {
              "data": "warm"
            }
          }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "searchable_snapshot": {
            "snapshot_repository": "my-repository"
          },
          "set_priority": {
            "priority": 0
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

**Explication des phases**:
- **hot** (0-7j): Rollover automatique quand 50GB ou 1 jour atteint
- **warm** (7-30j): Shrink à 1 shard, force merge, déplace vers nœuds warm
- **cold** (30-90j): Convert to searchable snapshot (S3/GCS)
- **delete** (>90j): Suppression automatique

**Partie 3**: Créer un index template avec ILM

```bash
PUT /_index_template/logs-template
{
  "index_patterns": ["logs-*"],
  "data_stream": {},
  "template": {
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs-policy",
      "index.lifecycle.rollover_alias": "logs"
    }
  }
}
```

**Partie 4**: Créer le premier index et l'alias

```bash
# Créer l'index initial
PUT /logs-000001
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1,
    "index.lifecycle.name": "logs-policy",
    "index.lifecycle.rollover_alias": "logs"
  },
  "aliases": {
    "logs": {
      "is_write_index": true
    }
  }
}
```

**Partie 5**: Tester le rollover

Indexez des données via l'alias:

```bash
POST /logs/_doc
{
  "timestamp": "2023-11-10T10:00:00",
  "message": "Test log entry"
}
```

Forcez un rollover manuel (pour test):

```bash
POST /logs/_rollover
{
  "conditions": {
    "max_age": "1d",
    "max_docs": 1000,
    "max_size": "5GB"
  }
}
```

Vérifiez les index créés:

```bash
GET /_cat/indices/logs-*?v&h=index,health,status,docs.count,store.size
```

**Résultat attendu**:
```
index        health status docs.count store.size
logs-000001  green  open          999       1mb
logs-000002  green  open            1      5kb
```

**Partie 6**: Simuler les transitions de phase

Modifiez temporairement les délais pour voir les transitions:

```bash
PUT /_ilm/policy/logs-policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_docs": 100
          }
        }
      },
      "warm": {
        "min_age": "1m",  # 1 minute au lieu de 7 jours
        "actions": {
          "forcemerge": {
            "max_num_segments": 1
          }
        }
      }
    }
  }
}
```

Attendez 1-2 minutes et vérifiez:

```bash
GET /logs-*/_ilm/explain
```

**Résultat**:
```json
{
  "indices": {
    "logs-000001": {
      "index": "logs-000001",
      "managed": true,
      "policy": "logs-policy",
      "phase": "warm",
      "action": "forcemerge",
      "step": "forcemerge"
    }
  }
}
```

### Validation

**Tableau de comparaison Hot-Warm-Cold**:

| Tier | Hardware | Cas d'usage | Coût | Performance |
|------|----------|-------------|------|-------------|
| **Hot** | SSD NVMe, 64GB RAM, 16 cores | Logs <7j, indexation + recherche intensive | €€€ | Très haute |
| **Warm** | SSD SATA, 32GB RAM, 8 cores | Logs 7-30j, recherche occasionnelle | €€ | Moyenne |
| **Cold** | HDD ou S3, 16GB RAM, 4 cores | Logs >30j, archivage, recherche rare | € | Basse |

**Questions à répondre**:

1. **Quand utiliser shrink dans la phase warm ?**
   - ✅ Quand les données ne changent plus (read-only)
   - ✅ Pour réduire le nombre de shards et améliorer les recherches
   - ❌ PAS sur des index actifs (write)

2. **Qu'est-ce qu'un searchable snapshot ?**
   - Index stocké dans un object store (S3, GCS, Azure Blob)
   - Données chargées à la demande (on-demand)
   - Coût de stockage très réduit (~90% moins cher que EBS)

3. **Comment forcer une transition immédiate ?**
```bash
POST /logs-000001/_ilm/move_to_step
{
  "current_step": {
    "phase": "hot",
    "action": "complete",
    "name": "complete"
  },
  "next_step": {
    "phase": "warm",
    "action": "allocate",
    "name": "allocate"
  }
}
```

**Critère de succès**: 
- Comprendre l'architecture hot-warm-cold
- Savoir créer une ILM policy multi-phases
- Maîtriser les actions: rollover, shrink, forcemerge, searchable_snapshot

---

