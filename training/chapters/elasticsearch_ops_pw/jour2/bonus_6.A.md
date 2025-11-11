## 🌟 Bonus Challenge 6.A: Configuration de Snapshot Lifecycle Management (SLM)

**Niveau**: Avancé  
**Objectif**: Automatiser la création et le nettoyage de snapshots avec des politiques SLM, incluant la rétention automatique et la planification flexible.

**Contexte**: Créer manuellement des snapshots quotidiens est fastidieux et sujet aux oublis. Snapshot Lifecycle Management (SLM) permet d'automatiser ce processus avec des politiques déclaratives incluant la planification, la rétention, et les alertes en cas d'échec.

### Scénario

Vous gérez un cluster Elasticsearch avec plusieurs types d'indices :
- **Indices transactionnels** (`orders-*`, `payments-*`) : Critiques, nécessitent des sauvegardes fréquentes
- **Indices analytiques** (`analytics-*`) : Moins critiques, sauvegardes hebdomadaires suffisantes
- **Indices de logs** (`logs-*`) : Volumineux, sauvegardes quotidiennes avec courte rétention

Vous allez créer **3 politiques SLM** avec différentes stratégies de rétention et planification.

### Étape 1: Prérequis - Repository Configuré

Vérifiez que vous avez un repository configuré (depuis Lab 6.1) :

```bash
GET /_snapshot/my_backup
```

Si le repository n'existe pas, créez-le :

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

### Étape 2: Créer des Indices de Test

Créons des indices représentant différents cas d'usage :

```bash
# Indices transactionnels (critiques)
PUT /orders-2024-01
PUT /orders-2024-02
PUT /payments-2024-01

# Indices analytiques
PUT /analytics-2024-q1
PUT /analytics-2024-q2

# Indices de logs (volumineux)
PUT /logs-2024-01-15
PUT /logs-2024-01-16
PUT /logs-2024-01-17

# Indexer quelques données
POST /orders-2024-01/_bulk
{"index":{"_id":"1"}}
{"order_id":"ORD-001","amount":100}
{"index":{"_id":"2"}}
{"order_id":"ORD-002","amount":200}

POST /analytics-2024-q1/_doc
{"metric":"revenue","value":50000,"period":"Q1"}

POST /logs-2024-01-15/_bulk
{"index":{}}
{"timestamp":"2024-01-15T10:00:00Z","level":"INFO","message":"Application started"}
{"index":{}}
{"timestamp":"2024-01-15T10:05:00Z","level":"WARN","message":"High memory usage"}
```

### Étape 3: Politique SLM pour Indices Transactionnels (Critiques)

**Exigences** :
- Snapshots **quotidiens** à 2h du matin
- Inclure uniquement `orders-*` et `payments-*`
- Rétention : **90 jours**
- Garder au minimum **30 snapshots**
- Limite maximale : **120 snapshots**

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
    "partial": false,
    "metadata": {
      "policy": "daily-critical-backup",
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

**Explication des paramètres** :
- `schedule: "0 0 2 * * ?"` : Expression cron pour 2h00 tous les jours
  - Format : `<second> <minute> <hour> <day_of_month> <month> <day_of_week>`
  - `?` signifie "n'importe quel" pour day_of_month ou day_of_week
- `name: "<critical-{now/d}>"` : Template générant `critical-2024-01-15`
- `expire_after: "90d"` : Supprimer les snapshots de plus de 90 jours
- `min_count: 30` : Toujours garder au moins 30 snapshots, même si expirés
- `max_count: 120` : Ne jamais dépasser 120 snapshots (suppression du plus ancien)

### Étape 4: Politique SLM pour Indices Analytiques (Hebdomadaire)

**Exigences** :
- Snapshots **hebdomadaires** le dimanche à 3h du matin
- Inclure uniquement `analytics-*`
- Rétention : **180 jours** (6 mois)
- Garder au minimum **10 snapshots**
- Limite maximale : **52 snapshots** (1 an de semaines)

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
    "partial": false,
    "metadata": {
      "policy": "weekly-analytics-backup",
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

**Explication** :
- `schedule: "0 0 3 ? * SUN"` : Tous les dimanches à 3h00
- `name: "<analytics-{now/w}>"` : Template générant `analytics-2024-w03` (semaine 3)

### Étape 5: Politique SLM pour Indices de Logs (Quotidien, Courte Rétention)

**Exigences** :
- Snapshots **quotidiens** à 1h du matin
- Inclure uniquement `logs-*`
- Rétention : **14 jours** seulement (logs ont courte valeur)
- Garder au minimum **7 snapshots** (1 semaine)
- Limite maximale : **30 snapshots**

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
      "policy": "daily-logs-backup",
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

**Explication** :
- `partial: true` : Permet au snapshot de réussir même si certains shards primaires échouent
- `ignore_unavailable: true` : Ignore les indices logs-* qui n'existent pas encore

### Étape 6: Lister Toutes les Politiques SLM

```bash
GET /_slm/policy
```

**Résultat attendu** :
```json
{
  "daily-critical-backup": {
    "version": 1,
    "modified_date": "2024-01-15T10:00:00.000Z",
    "policy": {
      "schedule": "0 0 2 * * ?",
      "name": "<critical-{now/d}>",
      ...
    },
    "next_execution_millis": 1705287600000,
    "stats": {
      "policy": "daily-critical-backup",
      "snapshots_taken": 0,
      "snapshots_failed": 0,
      "snapshots_deleted": 0,
      "snapshot_deletion_failures": 0
    }
  },
  "weekly-analytics-backup": { ... },
  "daily-logs-backup": { ... }
}
```

### Étape 7: Exécuter Manuellement les Politiques (Pour Tests)

Plutôt que d'attendre la planification, exécutons les politiques manuellement :

```bash
# Exécuter la politique critical
POST /_slm/policy/daily-critical-backup/_execute

# Exécuter la politique analytics
POST /_slm/policy/weekly-analytics-backup/_execute

# Exécuter la politique logs
POST /_slm/policy/daily-logs-backup/_execute
```

**Résultat attendu pour chaque** :
```json
{
  "snapshot_name": "critical-2024-01-15"
}
```

### Étape 8: Vérifier les Snapshots Créés

```bash
GET /_snapshot/my_backup/_all
```

**Résultat attendu** :
```json
{
  "snapshots": [
    {
      "snapshot": "critical-2024-01-15",
      "state": "SUCCESS",
      "indices": ["orders-2024-01", "orders-2024-02", "payments-2024-01"]
    },
    {
      "snapshot": "analytics-2024-w03",
      "state": "SUCCESS",
      "indices": ["analytics-2024-q1", "analytics-2024-q2"]
    },
    {
      "snapshot": "logs-2024-01-15",
      "state": "SUCCESS",
      "indices": ["logs-2024-01-15", "logs-2024-01-16", "logs-2024-01-17"]
    }
  ]
}
```

### Étape 9: Consulter les Statistiques des Politiques

```bash
GET /_slm/policy/daily-critical-backup
```

**Résultat attendu** :
```json
{
  "daily-critical-backup": {
    "policy": { ... },
    "version": 1,
    "modified_date_millis": 1705305600000,
    "last_success": {
      "snapshot_name": "critical-2024-01-15",
      "time_string": "2024-01-15T10:05:00.000Z",
      "time": 1705305900000
    },
    "last_failure": null,
    "next_execution": "2024-01-16T02:00:00.000Z",
    "next_execution_millis": 1705374000000,
    "stats": {
      "policy": "daily-critical-backup",
      "snapshots_taken": 1,
      "snapshots_failed": 0,
      "snapshots_deleted": 0,
      "snapshot_deletion_failures": 0
    }
  }
}
```

### Étape 10: Tester la Rétention Automatique

Pour tester la rétention, simulons des snapshots anciens :

1. **Créer manuellement des snapshots avec dates anciennes** (simulant des anciens backups) :

```bash
# Snapshot de 100 jours (devrait être supprimé par daily-critical-backup)
PUT /_snapshot/my_backup/critical-2023-10-07
{
  "indices": "orders-2024-01",
  "metadata": {
    "simulated_old_snapshot": true
  }
}

# Snapshot de 20 jours (devrait être conservé)
PUT /_snapshot/my_backup/critical-2023-12-26
{
  "indices": "orders-2024-01"
}
```

2. **Forcer l'exécution de la rétention** :

```bash
POST /_slm/_execute_retention
```

**Résultat attendu** :
```json
{
  "acknowledged": true
}
```

3. **Vérifier que le snapshot ancien a été supprimé** :

```bash
GET /_snapshot/my_backup/_all
```

Le snapshot `critical-2023-10-07` (100 jours) devrait avoir été supprimé automatiquement.

### Étape 11: Surveillance et Alertes SLM

**Vérifier l'historique global de SLM** :

```bash
GET /_slm/stats
```

**Résultat attendu** :
```json
{
  "retention_runs": 1,
  "retention_failed": 0,
  "retention_timed_out": 0,
  "retention_deletion_time": "15ms",
  "retention_deletion_time_millis": 15,
  "total_snapshots_taken": 3,
  "total_snapshots_failed": 0,
  "total_snapshots_deleted": 1,
  "total_snapshot_deletion_failures": 0,
  "policy_stats": [
    {
      "policy": "daily-critical-backup",
      "snapshots_taken": 1,
      "snapshots_failed": 0
    },
    ...
  ]
}
```

**Consulter le statut d'une politique spécifique** :

```bash
GET /_slm/policy/daily-critical-backup/_status
```

### Étape 12: Modifier une Politique SLM

Imaginons que nous voulons changer la fréquence de `daily-logs-backup` à toutes les 6 heures :

```bash
PUT /_slm/policy/daily-logs-backup
{
  "schedule": "0 0 */6 * * ?",
  "name": "<logs-{now/d}>",
  "repository": "my_backup",
  "config": {
    "indices": ["logs-*"],
    "ignore_unavailable": true,
    "include_global_state": false
  },
  "retention": {
    "expire_after": "14d",
    "min_count": 7,
    "max_count": 30
  }
}
```

**Vérifier la modification** :

```bash
GET /_slm/policy/daily-logs-backup
```

Le `version` devrait avoir incrémenté, et le `schedule` être `"0 0 */6 * * ?"`.

### Étape 13: Désactiver/Activer une Politique SLM

**Désactiver temporairement une politique** (ex: maintenance) :

```bash
POST /_slm/stop
```

Ceci arrête **toutes** les politiques SLM.

**Vérifier le statut** :

```bash
GET /_slm/status
```

**Résultat attendu** :
```json
{
  "operation_mode": "STOPPED"
}
```

**Réactiver SLM** :

```bash
POST /_slm/start
```

**Vérifier** :

```bash
GET /_slm/status
```

**Résultat attendu** :
```json
{
  "operation_mode": "RUNNING"
}
```

### Étape 14: Supprimer une Politique SLM

```bash
DELETE /_slm/policy/weekly-analytics-backup
```

**Résultat attendu** :
```json
{
  "acknowledged": true
}
```

**Note** : Supprimer une politique SLM **ne supprime pas** les snapshots déjà créés. Ils restent dans le repository.

### Validation Finale

Vérifiez que vous avez réussi le bonus challenge :

```bash
# 1. Lister toutes les politiques SLM actives
GET /_slm/policy

# 2. Vérifier les statistiques globales
GET /_slm/stats

# 3. Vérifier les snapshots créés
GET /_snapshot/my_backup/_all

# 4. Vérifier le statut SLM
GET /_slm/status
```

**Résultats attendus** :
- Au moins 2 politiques SLM configurées et actives
- `operation_mode: "RUNNING"`
- Au moins 2 snapshots créés par les politiques
- Statistiques montrant `total_snapshots_taken > 0` et `total_snapshots_failed = 0`

### Défis Supplémentaires

**Défi 1** : Créer une politique SLM mensuelle pour les archives

```bash
PUT /_slm/policy/monthly-archive
{
  "schedule": "0 0 4 1 * ?",
  "name": "<archive-{now/M}>",
  "repository": "my_backup",
  "config": {
    "indices": "*",
    "include_global_state": true
  },
  "retention": {
    "expire_after": "365d",
    "min_count": 12,
    "max_count": 24
  }
}
```

**Défi 2** : Créer une alerte Kibana pour surveiller les échecs SLM

1. Aller dans **Stack Management** → **Rules**
2. Créer une règle **Elasticsearch query**
3. Query pour détecter les échecs :

```json
{
  "query": {
    "bool": {
      "must": [
        { "term": { "event.action": "snapshot-failed" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  }
}
```

### Points Clés à Retenir

✅ **SLM automatise** la création et le nettoyage de snapshots selon des politiques déclaratives  
✅ Les **expressions cron** définissent la planification (quotidien, hebdomadaire, mensuel)  
✅ La **rétention** combine `expire_after`, `min_count`, et `max_count` pour contrôler le nettoyage  
✅ Les **templates de noms** (`{now/d}`, `{now/w}`) génèrent des noms uniques avec dates  
✅ `POST /_slm/_execute_retention` force l'exécution de la rétention  
✅ `POST /_slm/policy/<name>/_execute` exécute manuellement une politique (utile pour tests)  
✅ `POST /_slm/stop` et `POST /_slm/start` contrôlent globalement toutes les politiques  
✅ Supprimer une politique **ne supprime pas** les snapshots déjà créés  
✅ Les **métadonnées personnalisées** aident à documenter et organiser les snapshots  
✅ Utilisez différentes politiques SLM pour différents types de données (criticité, fréquence)

**Félicitations !** Vous maîtrisez maintenant les opérations de maintenance avancées d'Elasticsearch ! 🎉


---

