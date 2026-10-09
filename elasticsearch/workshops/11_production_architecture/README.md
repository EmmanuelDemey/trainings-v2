# TP 11 — Architecture Avancée et Production

> Maîtriser les configurations avancées: shard allocation awareness, Snapshot Lifecycle Management, Field-Level Security, et architecture complète de production.

**Niveau**: Avancé

## Setup

Ce TP est autonome. Vérifiez que votre cluster est accessible et que les fonctionnalités de sécurité et snapshots sont disponibles.

## Partie A: Shard Allocation Awareness

### Objectif

Configurer la "shard allocation awareness" pour répartir intelligemment les shards en fonction de zones de disponibilité et forcer la relocation de shards.

### Étape 1: Définir des attributs personnalisés

Éditez `elasticsearch.yml` de chaque nœud:

```yaml
# Nœud 1 (AZ1)
node.name: node-az1
node.attr.zone: az1

# Nœud 2 (AZ2)
node.name: node-az2
node.attr.zone: az2

# Nœud 3 (AZ3 - optionnel)
node.name: node-az3
node.attr.zone: az3
```

Vérification:
```bash
GET /_cat/nodeattrs?v&h=node,attr,value
```

**Résultat attendu**:
```
node      attr  value
node-az1  zone  az1
node-az2  zone  az2
node-az3  zone  az3
```

<!-- ci: skip-start -->

Les étapes 2 à 6 demandent un cluster dont les nœuds portent l'attribut `zone`. Sur un nœud qui ne l'a pas, la forced awareness empêche d'allouer le moindre shard: le cluster passe au rouge.

### Étape 2: Activer la shard allocation awareness

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": "zone"
  }
}
```

**Effet**: Elasticsearch évitera de placer un replica sur le même `zone` que son primaire.

### Étape 3: Forcer l'allocation avec forced awareness

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": "zone",
    "cluster.routing.allocation.awareness.force.zone.values": "az1,az2,az3"
  }
}
```

**Différence**:
- `awareness`: Préférence, Elasticsearch réallouera ailleurs si nécessaire
- `forced awareness`: Strict, Elasticsearch refuse de réallouer si la zone cible n'est pas disponible

### Étape 4: Créer un index et vérifier la distribution

```bash
PUT /zone-aware-index
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}

GET /_cat/shards/zone-aware-index?v&h=index,shard,prirep,state,node
```

**Observation**: Pour chaque shard primaire, son replica est sur un nœud avec un `zone` différent.

### Étape 5: Forcer la relocation d'un shard

```bash
POST /_cluster/reroute
{
  "commands": [
    {
      "move": {
        "index": "zone-aware-index",
        "shard": 0,
        "from_node": "node-az1",
        "to_node": "node-az2"
      }
    }
  ]
}
```

**Suivi de la relocation**:
```bash
GET /_cat/recovery/zone-aware-index?v&h=index,shard,stage,source_node,target_node
```

### Étape 6: Exclure un nœud de l'allocation (maintenance)

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.exclude._name": "node-az1"
  }
}
```

**Effet**: Tous les shards quittent `node-az1` et sont réalloués sur les autres nœuds.

**Retour à la normale**:
```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.exclude._name": null
  }
}
```

<!-- ci: skip-end -->

### Étape 7: Désactiver l'awareness avant la suite

Les parties suivantes n'ont pas besoin de zones. Retirez les réglages de la partie A, sans quoi un cluster sans attribut `zone` ne pourrait plus allouer les nouveaux index:

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": null,
    "cluster.routing.allocation.awareness.force.zone.values": null
  }
}
```

## Partie B: Snapshot Lifecycle Management (SLM)

### Objectif

Automatiser la création et le nettoyage de snapshots avec des politiques SLM, incluant la rétention automatique et la planification flexible.

### Setup de cette partie

Vérifiez qu'un repository existe (créé au TP 9):

<!-- ci: skip -->
```bash
GET /_snapshot/my_backup
```

Si le repository n'existe pas:

```bash
PUT /_snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/backups",
    "compress": true
  }
}
```

Créez des indices de test:

```bash
PUT /orders-2024-01
PUT /orders-2024-02
PUT /payments-2024-01
PUT /analytics-2024-q1
PUT /logs-2024.01.15

POST /orders-2024-01/_bulk
{"index":{"_id":"1"}}
{"order_id":"ORD-001","amount":100}
{"index":{"_id":"2"}}
{"order_id":"ORD-002","amount":200}

POST /analytics-2024-q1/_doc
{"metric":"revenue","value":50000,"period":"Q1"}

POST /logs-2024.01.15/_bulk
{"index":{}}
{"timestamp":"2024-01-15T10:00:00Z","level":"INFO","message":"Application started"}
{"index":{}}
{"timestamp":"2024-01-15T10:05:00Z","level":"WARN","message":"High memory usage"}
```

### Étape 1: Politique SLM pour Indices Transactionnels (Critiques)

```bash
PUT /_slm/policy/daily-critical-backup
{
  "schedule": "0 0 2 * * ?",
  "name": "<critical-{now/d}>",
  "repository": "my_backup",
  "config": {
    "indices": ["orders-*", "payments-*"],
    "ignore_unavailable": false,
    "include_global_state": false,
    "metadata": {
      "criticality": "high",
      "team": "finance"
    }
  },
  "retention": {
    "expire_after": "90d",
    "min_count": 30,
    "max_count": 120
  }
}
```

**Explication**:
- `schedule: "0 0 2 * * ?"`: Expression cron pour 2h00 tous les jours
- `name: "<critical-{now/d}>"`: Template générant `critical-2024-01-15`
- `metadata`: libre, recopiée dans chaque snapshot — sauf la clé `policy`, réservée: SLM y écrit lui-même le nom de la politique
- `expire_after: "90d"`: Supprimer les snapshots de plus de 90 jours
- `min_count: 30`: Toujours garder au moins 30 snapshots
- `max_count: 120`: Ne jamais dépasser 120 snapshots

### Étape 2: Politique SLM pour Indices Analytiques (Hebdomadaire)

```bash
PUT /_slm/policy/weekly-analytics-backup
{
  "schedule": "0 0 3 ? * SUN",
  "name": "<analytics-{now/w}>",
  "repository": "my_backup",
  "config": {
    "indices": ["analytics-*"],
    "ignore_unavailable": true,
    "include_global_state": false,
    "metadata": {
      "criticality": "medium",
      "team": "data-science"
    }
  },
  "retention": {
    "expire_after": "180d",
    "min_count": 10,
    "max_count": 52
  }
}
```

### Étape 3: Politique SLM pour Logs (Quotidien, Courte Rétention)

```bash
PUT /_slm/policy/daily-logs-backup
{
  "schedule": "0 0 1 * * ?",
  "name": "<logs-{now/d}>",
  "repository": "my_backup",
  "config": {
    "indices": ["logs-*"],
    "ignore_unavailable": true,
    "include_global_state": false,
    "partial": true,
    "metadata": {
      "criticality": "low",
      "team": "ops"
    }
  },
  "retention": {
    "expire_after": "14d",
    "min_count": 7,
    "max_count": 30
  }
}
```

### Étape 4: Lister les Politiques et Exécuter Manuellement

```bash
# Lister toutes les politiques
GET /_slm/policy

# Exécuter manuellement pour test
POST /_slm/policy/daily-critical-backup/_execute
POST /_slm/policy/weekly-analytics-backup/_execute
POST /_slm/policy/daily-logs-backup/_execute

# Vérifier les snapshots créés
GET /_snapshot/my_backup/_all
```

### Étape 5: Consulter les Statistiques

```bash
GET /_slm/policy/daily-critical-backup
GET /_slm/stats
```

### Étape 6: Tester la Rétention et Gérer SLM

```bash
# Forcer l'exécution de la rétention
POST /_slm/_execute_retention

# Désactiver SLM (pour maintenance)
POST /_slm/stop

# Vérifier le statut
GET /_slm/status

# Réactiver
POST /_slm/start

# Supprimer une politique (ne supprime pas les snapshots existants)
DELETE /_slm/policy/weekly-analytics-backup
```

## Partie C: Field-Level Security (FLS) pour Masquer des Champs Sensibles

### Objectif

Implémenter la sécurité au niveau des champs pour cacher des données sensibles selon les rôles.

### Étape 1: Créer un Index d'Employés Enrichi

```bash
PUT /employees_full
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "employee_id": { "type": "keyword" },
      "name": { "type": "keyword" },
      "department": { "type": "keyword" },
      "position": { "type": "keyword" },
      "hire_date": { "type": "date" },
      "email_corporate": { "type": "keyword" },
      "email_personal": { "type": "keyword" },
      "phone_work": { "type": "keyword" },
      "phone_personal": { "type": "keyword" },
      "address": {
        "properties": {
          "street": { "type": "text" },
          "city": { "type": "keyword" },
          "country": { "type": "keyword" },
          "postal_code": { "type": "keyword" }
        }
      },
      "ssn": { "type": "keyword" },
      "salary": { "type": "float" },
      "performance_review": {
        "properties": {
          "rating": { "type": "keyword" },
          "comments": { "type": "text" },
          "reviewer": { "type": "keyword" }
        }
      },
      "disciplinary_notes": { "type": "text" }
    }
  }
}

POST /employees_full/_bulk
{"index":{"_id":"1"}}
{"employee_id":"EMP-001","name":"Alice Johnson","department":"sales","position":"Sales Manager","hire_date":"2020-01-15","email_corporate":"alice.johnson@company.com","email_personal":"alice.j@gmail.com","phone_work":"+33-1-23-45-67-89","phone_personal":"+33-6-12-34-56-78","address":{"street":"10 Rue de Rivoli","city":"Paris","country":"France","postal_code":"75001"},"ssn":"123-45-6789","salary":75000,"performance_review":{"rating":"excellent","comments":"Top performer","reviewer":"Director Sales"},"disciplinary_notes":null}
{"index":{"_id":"2"}}
{"employee_id":"EMP-002","name":"Bob Smith","department":"hr","position":"HR Specialist","hire_date":"2021-03-20","email_corporate":"bob.smith@company.com","email_personal":"bob.smith@yahoo.com","phone_work":"+33-1-98-76-54-32","phone_personal":"+33-6-98-76-54-32","address":{"street":"25 Avenue des Champs","city":"Lyon","country":"France","postal_code":"69001"},"ssn":"987-65-4321","salary":60000,"performance_review":{"rating":"good","comments":"Solid contributor","reviewer":"HR Director"},"disciplinary_notes":"Late arrival incident - 2023-05-10"}
{"index":{"_id":"3"}}
{"employee_id":"EMP-003","name":"Charlie Brown","department":"engineering","position":"Senior Engineer","hire_date":"2019-05-10","email_corporate":"charlie.brown@company.com","email_personal":"cbrown@outlook.com","phone_work":"+33-1-11-22-33-44","phone_personal":"+33-6-11-22-33-44","address":{"street":"5 Boulevard Saint-Germain","city":"Paris","country":"France","postal_code":"75005"},"ssn":"555-12-3456","salary":95000,"performance_review":{"rating":"excellent","comments":"Technical leader","reviewer":"CTO"},"disciplinary_notes":null}
```

### Étape 2: Créer un Rôle "Public" avec FLS Restrictif

```bash
POST /_security/role/employee_public_view
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["employees_full"],
      "privileges": ["read"],
      "field_security": {
        "grant": [
          "employee_id",
          "name",
          "department",
          "position",
          "hire_date",
          "email_corporate",
          "phone_work"
        ]
      }
    }
  ]
}
```

**Champs accordés**: ID, nom, département, poste, date d'embauche, email pro, téléphone pro
**Champs cachés**: SSN, salaire, adresse, emails/téléphones persos, évaluations, notes disciplinaires

### Étape 3: Créer un Rôle "HR Team" avec FLS Modéré

```bash
POST /_security/role/hr_team_view
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["employees_full"],
      "privileges": ["read", "write"],
      "field_security": {
        "grant": ["*"],
        "except": [
          "ssn",
          "disciplinary_notes"
        ]
      }
    }
  ]
}
```

**`grant` + `except`**:
- `grant: ["*"]`: tous les champs…
- `except`: …sauf `ssn` et `disciplinary_notes`
- `except` doit être **inclus dans** `grant`: avec un `grant` qui ne liste pas `ssn`, l'exclure serait refusé (« Exceptions for field permissions must be a subset of the granted fields »)
- Les wildcards marchent dans les deux listes: `email_*` couvre `email_corporate` ET `email_personal`, `address.*` tous les sous-champs de `address`

### Étape 4: Créer un Rôle "HR Manager" avec Accès Complet

```bash
POST /_security/role/hr_manager_full
{
  "cluster": ["monitor", "manage"],
  "indices": [
    {
      "names": ["employees_full"],
      "privileges": ["all"],
      "field_security": {
        "grant": ["*"]
      }
    }
  ]
}
```

### Étape 5: Créer des Utilisateurs et Tester

```bash
POST /_security/user/intern_view
{
  "password": "InternPass123!",
  "roles": ["employee_public_view"],
  "full_name": "Intern Viewer"
}

POST /_security/user/jane_hr
{
  "password": "HRPass456!",
  "roles": ["hr_team_view"],
  "full_name": "Jane HR Specialist"
}

POST /_security/user/susan_hrmanager
{
  "password": "ManagerPass789!",
  "roles": ["hr_manager_full"],
  "full_name": "Susan HR Manager"
}
```

**Tester vue publique (intern) - 7 champs seulement**:
```bash
curl -u intern_view:InternPass123! "https://localhost:9200/employees_full/_search?pretty"
```

**Tester vue HR team - tout sauf ssn et disciplinary_notes**:
```bash
curl -u jane_hr:HRPass456! "https://localhost:9200/employees_full/_doc/1?pretty"
```

**Tester vue HR manager - tous les champs**:
```bash
curl -u susan_hrmanager:ManagerPass789! "https://localhost:9200/employees_full/_doc/2?pretty"
```

**Les agrégations respectent également FLS**:
```bash
# intern_view n'a pas accès à salary → agrégation vide/erreur
curl -u intern_view:InternPass123! -X GET "https://localhost:9200/employees_full/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{"size":0,"aggs":{"avg_salary":{"avg":{"field":"salary"}}}}'

# jane_hr a accès à salary → résultat correct
curl -u jane_hr:HRPass456! -X GET "https://localhost:9200/employees_full/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{"size":0,"aggs":{"avg_salary":{"avg":{"field":"salary"}}}}'
```

### Étape 6: Combiner DLS + FLS

```bash
POST /_security/role/sales_dept_restricted
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["employees_full"],
      "privileges": ["read"],
      "query": {
        "term": {
          "department": "sales"
        }
      },
      "field_security": {
        "grant": [
          "employee_id",
          "name",
          "department",
          "position",
          "email_corporate",
          "phone_work"
        ]
      }
    }
  ]
}

POST /_security/user/sales_viewer
{
  "password": "SalesView123!",
  "roles": ["sales_dept_restricted"]
}
```

Test DLS + FLS combinés:
```bash
curl -u sales_viewer:SalesView123! "https://localhost:9200/employees_full/_search?pretty"
```
**Résultat attendu**: 1 seul document (EMP-001, seul employé "sales"), avec champs limités.

## Partie D: Architecture Complète de Production

### Dimensionnement pour 500 GB/jour, rétention 90 jours

**Calcul de stockage**:
- 500 GB/jour × 90 jours = 45 TB total
- Hot tier (7 jours): 3.5 TB
- Warm tier (30 jours): 15 TB
- Cold tier (53 jours): 26.5 TB

**Dimensionnement nœuds**:

| Tier | Nœuds | RAM | CPU | Disque | Total Disque |
|------|-------|-----|-----|--------|--------------|
| Master | 3 | 8 GB | 4 cores | 100 GB | 300 GB |
| Hot | 6 | 32 GB | 16 cores | 1 TB SSD | 6 TB |
| Warm | 4 | 16 GB | 8 cores | 5 TB HDD | 20 TB |
| Cold | 3 | 8 GB | 4 cores | 12 TB HDD | 36 TB |

**Total**: 16 nœuds

### Architecture multi-zone (schéma textuel)

```
ZONE A                           ZONE B
  Master-A1                        Master-B1
  Master-A2                        Master-B2

HOT TIER (SSD, 7 jours)
  Hot-A1  Hot-A2    Hot-B1  Hot-B2  Hot-B3  Hot-A3

WARM TIER (HDD, 30 jours)
  Warm-A1  Warm-A2    Warm-B1  Warm-B2

COLD TIER (Searchable Snapshots, 53 jours)
  Cold-A1    Cold-B1  Cold-B2
```

### Configuration ILM Policy de Production

En production, `s3_backup` est un dépôt S3 (`"type": "s3"`, plugin intégré depuis la 8.0). Pour essayer les requêtes de cette partie sur votre cluster de TP, créez un dépôt `fs` du même nom:

```bash
PUT /_snapshot/s3_backup
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/backups/s3_backup"
  }
}
```

```bash
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
          "set_priority": { "priority": 100 }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "set_priority": { "priority": 50 },
          "migrate": { "enabled": true },
          "shrink": { "number_of_shards": 1 },
          "forcemerge": { "max_num_segments": 1 },
          "readonly": {}
        }
      },
      "cold": {
        "min_age": "37d",
        "actions": {
          "set_priority": { "priority": 0 },
          "migrate": { "enabled": true },
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

### Configuration Index Template de Production

```bash
PUT _index_template/logs-myapp-template
{
  "index_patterns": ["logs-myapp-*"],
  "data_stream": {},
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs-lifecycle"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "message": { "type": "text" },
        "level": { "type": "keyword" },
        "service": { "type": "keyword" },
        "host": { "type": "keyword" }
      }
    }
  },
  "priority": 500
}
```

**Pourquoi `logs-myapp-*` et pas `logs-*` ?** Elasticsearch fournit un template `logs` sur `logs-*-*` (priorité 100), utilisé par Elastic Agent et qui active LogsDB. Un template `logs-*` de priorité 500 le masquerait pour **toutes** les sources de logs. On suit plutôt la convention `logs-<dataset>-<namespace>`: `logs-myapp-production`, `logs-myapp-staging`… Et plus d'alias de rollover: c'est un data stream.

### Configuration SLM de Production

```bash
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

### Checklist de Validation Architecture Production

- **Sizing**: Calculé selon charges réelles (500 GB/jour)
- **HA**: Multi-zone, répliques, quorum masters (3 dédiés)
- **Performance**: Hot tier SSD, shards < 50 GB
- **Coûts**: Warm/Cold HDD pour archives, Cold via Searchable Snapshots S3
- **Lifecycle**: ILM automatisé (hot→warm→cold→delete en 90 jours)
- **Backups**: SLM quotidien, rétention 7 jours (données protégées par ILM)
- **Security**: RBAC, TLS, DLS/FLS si requis, audit logging
- **Monitoring**: Alertes critiques (health, heap, disk, thread pool rejections)
- **Documentation**: Architecture diagrams, runbooks DR

## Points Clés à Retenir

- **Allocation awareness** garantit la résilience aux pannes de zone
- `awareness` est une préférence, `forced awareness` est strict
- **SLM automatise** la création et le nettoyage de snapshots
- Les expressions cron définissent une planification flexible
- **FLS cache complètement les champs** (comme s'ils n'existaient pas)
- `grant` liste les champs autorisés, `except` liste les champs exclus
- **DLS + FLS combinés** offrent une protection multicouche
- Les agrégations sur champs cachés par FLS retournent vide ou erreur
- Même avec `GET /_doc/{id}`, les champs cachés sont absents du `_source`
- **Architecture hot-warm-cold** optimise les coûts avec SSD uniquement pour données actives
- Dimensionnement basé sur charges réelles et croissance prévisible
- **Tests réguliers** (DR, load testing) valident l'architecture en production
