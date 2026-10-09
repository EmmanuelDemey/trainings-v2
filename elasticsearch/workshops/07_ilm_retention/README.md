# TP 7 — ILM et Rétention des Données

> Concevoir une architecture hot-warm-cold pour optimiser coût/performance, et configurer des policies Index Lifecycle Management (ILM) pour automatiser les transitions.

**Niveau**: Avancé
**Topic**: Performance et Dimensionnement - Index Lifecycle Management

## Contexte

Votre cluster stocke des logs avec des patterns d'accès variables: les logs récents (<7 jours) sont consultés fréquemment (hot), les logs moyens (7-30 jours) occasionnellement (warm), et les vieux logs (>30 jours) rarement (cold).

## Setup

**Avant de commencer**, vérifiez que votre cluster est accessible:

```bash
GET /_cluster/health
```

## Partie 1: Configurer les data tiers

Depuis Elasticsearch 7.10, les tiers ne sont plus des attributs maison (`node.attr.data: warm`) mais des **rôles de nœud**. Déclarez-les dans `elasticsearch.yml`:

```yaml
# Nœuds HOT (haute performance)
node.name: hot-node-1
node.roles: [ data_hot, data_content ]

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

**Résultat attendu** (cluster à 3 nœuds):
```
name         node.role
hot-node-1   hs
warm-node-1  w
cold-node-1  c
```

Sur un cluster à 1 nœud (Docker), ce nœud porte tous les rôles: tout le TP fonctionne, les données changent simplement de phase sans changer de nœud.

## Partie 2: Créer une policy ILM

La phase `cold` convertit les index en **searchable snapshots**: il faut un dépôt de snapshots. Le chemin doit être déclaré dans `path.repo` (`-e path.repo=/usr/share/elasticsearch/backups` avec Docker):

```bash
PUT /_snapshot/my-repository
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/backups/ilm"
  }
}
```

Définissez une policy qui fait passer les données de hot à warm, puis cold, puis delete:

```bash
PUT /_ilm/policy/logs-policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_primary_shard_size": "50gb",
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
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          },
          "set_priority": {
            "priority": 50
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
- **hot** (0-7j): Rollover automatique quand un shard primaire atteint 50 Go ou que l'index a 1 jour
- **warm** (7-30j): Shrink à 1 shard, force merge
- **cold** (30-90j): Conversion en searchable snapshot
- **delete** (>90j): Suppression automatique

Pas besoin d'action `allocate` pour changer de nœud: ILM ajoute de lui-même une action **`migrate`** dans les phases warm et cold, qui déplace les shards vers le tier correspondant (`data_warm`, puis `data_cold`).

`max_primary_shard_size` est préférable à `max_size` (taille totale de l'index, replicas exclus): c'est la taille d'un shard que l'on cherche à maîtriser (10-50 Go).

## Partie 3: Créer un index template de data stream

Un **data stream** est la façon moderne de stocker des données horodatées: un seul nom pour écrire et lire, des index cachés (`.ds-…`) derrière, et un rollover géré par ILM sans alias à configurer.

```bash
PUT /_index_template/app-logs-template
{
  "index_patterns": ["app-logs*"],
  "data_stream": {},
  "priority": 500,
  "template": {
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs-policy"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "message": { "type": "text" }
      }
    }
  }
}
```

**Attention au nom**: Elasticsearch fournit déjà un template `logs` sur `logs-*-*` (priorité 100), utilisé par Elastic Agent. Un template à vous sur `logs-*` entrerait en concurrence avec lui; d'où le nom `app-logs` et une priorité explicite.

## Partie 4: Créer le data stream

Il est créé automatiquement au premier document indexé, ou explicitement:

```bash
PUT /_data_stream/app-logs

GET /_data_stream/app-logs
```

La réponse liste la backing index (`.ds-app-logs-<date>-000001`), le template et la policy ILM.

**Ancienne méthode — ne plus l'utiliser**: créer `logs-000001` à la main avec un alias `is_write_index` et le setting `index.lifecycle.rollover_alias`. Avec un template de data stream, Elasticsearch le refuse:

<!-- ci: expect-error -->
```bash
PUT /app-logs-000001
{
  "aliases": {
    "app-logs-alias": { "is_write_index": true }
  }
}
```

**Résultat attendu**: `cannot create index with name [app-logs-000001], because it matches with template [app-logs-template] that creates data streams only, use create data stream api instead`

## Partie 5: Tester le rollover

Indexez des données. Un data stream n'accepte que des créations (pas de mise à jour par `_id`), et chaque document doit avoir un `@timestamp`:

```bash
POST /app-logs/_doc
{
  "@timestamp": "2026-10-08T10:00:00Z",
  "message": "Test log entry"
}
```

Forcez un rollover manuel (pour test):

```bash
POST /app-logs/_rollover
```

**Résultat attendu** (extrait):
```json
{
  "acknowledged": true,
  "rolled_over": true
}
```

Vérifiez les backing indices: il y en a maintenant deux, et seule la plus récente reçoit les écritures.

```bash
GET /_data_stream/app-logs

GET /_cat/indices/.ds-app-logs-*?v&h=index,health,status,docs.count,store.size
```

## Partie 6: Simuler les transitions de phase

ILM n'évalue les policies que toutes les 10 minutes (`indices.lifecycle.poll_interval`). Pour le TP, réduisez cet intervalle:

```bash
PUT /_cluster/settings
{
  "persistent": {
    "indices.lifecycle.poll_interval": "10s"
  }
}
```

Puis modifiez la policy pour raccourcir les délais:

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
        "min_age": "1m",
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

Attendez 1-2 minutes et vérifiez: la première backing index (déjà rollée) passe en `warm`, la seconde reste en `hot`.

```bash
GET /app-logs/_ilm/explain
```

Remettez l'intervalle par défaut après le TP:

```bash
PUT /_cluster/settings
{
  "persistent": {
    "indices.lifecycle.poll_interval": null
  }
}
```

## Tableau de comparaison Hot-Warm-Cold

| Tier | Hardware | Cas d'usage | Coût | Performance |
|------|----------|-------------|------|-------------|
| **Hot** | SSD NVMe, 64GB RAM, 16 cores | Logs <7j, indexation + recherche intensive | Élevé | Très haute |
| **Warm** | SSD SATA, 32GB RAM, 8 cores | Logs 7-30j, recherche occasionnelle | Moyen | Moyenne |
| **Cold** | HDD ou S3, 16GB RAM, 4 cores | Logs >30j, archivage, recherche rare | Bas | Basse |

## Questions à répondre

1. **Quand utiliser shrink dans la phase warm ?**
   - Quand les données ne changent plus (read-only)
   - Pour réduire le nombre de shards et améliorer les recherches
   - PAS sur des index actifs (write)

2. **Qu'est-ce qu'un searchable snapshot ?**
   - Index stocké dans un object store (S3, GCS, Azure Blob)
   - Données chargées à la demande
   - Coût de stockage très réduit (~90% moins cher)

3. **Comment forcer une transition immédiate ?**

Avec l'API `move`, en remplaçant le nom par celui d'une backing index (`GET /_data_stream/app-logs`):

<!-- ci: skip -->
```bash
POST /_ilm/move/.ds-app-logs-2026.10.08-000001
{
  "current_step": {
    "phase": "hot",
    "action": "complete",
    "name": "complete"
  },
  "next_step": {
    "phase": "warm"
  }
}
```

## Critères de Succès

- Comprendre l'architecture hot-warm-cold
- Savoir créer une ILM policy multi-phases
- Maîtriser les actions: rollover, shrink, forcemerge, searchable_snapshot
- Utiliser un data stream plutôt qu'un alias de rollover
