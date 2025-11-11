## Lab 5.2: Configuration d'Actions Avancées (Webhook et Index)

**Objectif**: Configurer des actions sophistiquées pour vos alertes - envoyer des webhooks vers des services externes et indexer les alertes pour analyse historique.

**Contexte**: Les alertes ne sont utiles que si elles déclenchent les bonnes actions. Dans ce lab, vous allez configurer deux types d'actions essentielles en production: les webhooks (pour intégrer avec des outils externes comme Slack, PagerDuty, ou vos propres services) et l'indexation (pour garder une trace de toutes les alertes).

### Partie A: Créer un Connecteur Webhook

Les connecteurs sont des configurations réutilisables qui définissent comment se connecter à des services externes.

#### Étape 1: Créer un Service de Test pour Recevoir les Webhooks

Nous allons utiliser **webhook.site** pour tester nos webhooks:

1. Ouvrez votre navigateur et allez sur https://webhook.site
2. Notez l'URL unique générée (format: `https://webhook.site/abc-def-123...`)
   - Cette URL affichera tous les webhooks reçus en temps réel
3. Gardez cet onglet ouvert pour voir les webhooks arriver

**Alternative locale avec Netcat**:
```bash
# Terminal 1: Démarrer un serveur HTTP simple
while true; do echo -e "HTTP/1.1 200 OK\n\n" | nc -l 8888; done

# Votre webhook URL locale: http://localhost:8888
```

#### Étape 2: Créer le Connecteur Webhook dans Kibana

1. Dans Kibana, allez dans **Stack Management** → **Connectors**
2. Cliquez sur **Create connector**
3. Sélectionnez **Webhook** dans la liste des types
4. Configurez le connecteur:

**Configuration**:
- **Connector name**: `ops-webhook-notifier`
- **URL**: Collez l'URL de webhook.site ou votre URL locale
- **Method**: `POST`
- **Headers**: Ajoutez les en-têtes suivants

```json
{
  "Content-Type": "application/json",
  "X-Alert-Source": "elasticsearch-ops"
}
```

5. Testez le connecteur:
   - Cliquez sur **Test** en bas
   - Vérifiez que webhook.site reçoit bien la requête

6. Cliquez sur **Save**

#### Étape 3: Créer un Connecteur Index Action

Ce connecteur permettra d'indexer les alertes dans Elasticsearch pour analyse historique.

1. Dans **Stack Management** → **Connectors**, cliquez sur **Create connector**
2. Sélectionnez **Index** dans la liste
3. Configurez:

**Configuration**:
- **Connector name**: `alert-history-index`
- **Index**: `alert-history`
- **Refresh**: `true` (pour que les documents soient immédiatement disponibles)
- **Time field**: `@timestamp` (sera ajouté automatiquement)

4. Cliquez sur **Save**

### Partie B: Créer une Alerte avec Actions Multiples

Maintenant créons une alerte qui utilise ces deux connecteurs.

#### Étape 4: Créer l'Alerte de Monitoring de Heap

1. Allez dans **Stack Management** → **Rules**
2. Cliquez sur **Create rule**
3. Configurez la règle:

**Informations de base**:
- **Name**: `heap-usage-critical`
- **Tags**: `performance`, `heap`, `critical`
- **Rule type**: **Elasticsearch query**

**Query definition**:
- **Index**: `.monitoring-es-*` ou créez un index de simulation
- **Time field**: `@timestamp`
- **Query**:

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "range": {
            "@timestamp": {
              "gte": "now-5m"
            }
          }
        },
        {
          "range": {
            "node_stats.jvm.mem.heap_used_percent": {
              "gte": 85
            }
          }
        }
      ]
    }
  },
  "aggs": {
    "max_heap": {
      "max": {
        "field": "node_stats.jvm.mem.heap_used_percent"
      }
    },
    "avg_heap": {
      "avg": {
        "field": "node_stats.jvm.mem.heap_used_percent"
      }
    }
  }
}
```

**Threshold**:
- **WHEN**: `query matches`
- **FOR THE LAST**: `5 minutes`
- **GROUPED OVER**: `top 5 'node_stats.node_id'` (pour identifier les nœuds problématiques)

**Schedule**:
- **Check every**: `1 minute`
- **Notify**: `On status change` (pour éviter le spam)

#### Étape 5: Créer un Index de Simulation pour Tests

Comme nous n'avons peut-être pas de données de monitoring réelles:

```bash
# Créer l'index de simulation
PUT /heap-monitoring
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "node_id": { "type": "keyword" },
      "node_name": { "type": "keyword" },
      "heap_used_percent": { "type": "float" }
    }
  }
}

# Indexer des données simulant un heap critique
POST /heap-monitoring/_bulk
{"index":{}}
{"@timestamp":"2024-01-15T10:00:00Z","node_id":"node-1","node_name":"es-ops-node-1","heap_used_percent":87.5}
{"index":{}}
{"@timestamp":"2024-01-15T10:01:00Z","node_id":"node-1","node_name":"es-ops-node-1","heap_used_percent":89.2}
{"index":{}}
{"@timestamp":"2024-01-15T10:02:00Z","node_id":"node-2","node_name":"es-ops-node-2","heap_used_percent":91.8}
{"index":{}}
{"@timestamp":"2024-01-15T10:00:00Z","node_id":"node-3","node_name":"es-ops-node-3","heap_used_percent":75.3}
```

Modifiez votre règle pour utiliser cet index:
- **Index**: `heap-monitoring`
- **Query**: Rechercher `heap_used_percent >= 85`

#### Étape 6: Configurer l'Action Webhook

Dans la section **Actions** de votre règle:

1. Cliquez sur **Add action**
2. Sélectionnez le connecteur `ops-webhook-notifier`
3. Configurez le payload JSON:

```json
{
  "alert_id": "{{alertId}}",
  "alert_name": "{{alertName}}",
  "alert_type": "heap_usage",
  "severity": "critical",
  "timestamp": "{{date}}",
  "context": {
    "cluster_name": "{{context.cluster.name}}",
    "condition": "Heap usage exceeded 85%",
    "details": {
      "max_heap_percent": "{{context.max_heap}}",
      "avg_heap_percent": "{{context.avg_heap}}",
      "affected_nodes": "{{context.groupBy}}"
    }
  },
  "actions_required": [
    "Check heap usage: GET _nodes/stats/jvm",
    "Review GC activity: GET _nodes/stats/jvm?filter_path=nodes.*.jvm.gc",
    "Consider increasing heap or clearing cache"
  ],
  "links": {
    "kibana_dashboard": "https://kibana.example.com/app/monitoring",
    "runbook": "https://docs.example.com/runbooks/elasticsearch-heap"
  }
}
```

4. **Action group**: `Alert` (quand l'alerte est active)
5. **Throttle**: `15 minutes` (éviter les alertes répétées)

#### Étape 7: Configurer l'Action Index

1. Dans la même règle, cliquez sur **Add action** à nouveau
2. Sélectionnez le connecteur `alert-history-index`
3. Configurez le document à indexer:

```json
{
  "@timestamp": "{{date}}",
  "alert": {
    "id": "{{alertId}}",
    "name": "{{alertName}}",
    "action_group": "{{context.group}}",
    "instance_id": "{{alertInstanceId}}"
  },
  "rule": {
    "id": "{{rule.id}}",
    "name": "{{rule.name}}",
    "type": "{{rule.type}}",
    "tags": {{#toJson}}rule.tags{{/toJson}}
  },
  "metrics": {
    "heap": {
      "max_percent": {{context.max_heap}},
      "avg_percent": {{context.avg_heap}},
      "threshold": 85
    }
  },
  "nodes": {
    "affected": "{{context.groupBy}}"
  },
  "status": "triggered",
  "severity": "critical",
  "message": "Heap usage critical: {{context.max_heap}}% detected on cluster {{context.cluster.name}}"
}
```

4. **Action group**: `Alert`
5. Pas de throttle nécessaire (nous voulons toutes les occurrences dans l'historique)

#### Étape 8: Sauvegarder et Activer

1. Cliquez sur **Save** pour créer la règle avec les deux actions
2. La règle est automatiquement activée

### Partie C: Déclencher et Vérifier les Actions

#### Étape 9: Déclencher l'Alerte

Indexez des données qui déclencheront l'alerte:

```bash
# Indexer des données avec heap > 85%
POST /heap-monitoring/_doc
{
  "@timestamp": "{{NOW}}",
  "node_id": "node-1",
  "node_name": "es-ops-node-1",
  "heap_used_percent": 92.5
}

# Forcer le refresh
POST /heap-monitoring/_refresh
```

Attendez 1-2 minutes (la fréquence de vérification de la règle).

#### Étape 10: Vérifier l'Action Webhook

1. Retournez sur webhook.site (ou votre serveur local)
2. Vous devriez voir une requête POST arriver avec le payload JSON
3. Vérifiez que les données sont correctes:
   - `alert_name`: "heap-usage-critical"
   - `severity`: "critical"
   - `context.details.max_heap_percent`: valeur > 85

**Exemple de requête reçue**:
```json
{
  "alert_id": "alert-123-abc",
  "alert_name": "heap-usage-critical",
  "severity": "critical",
  "timestamp": "2024-01-15T10:05:30.123Z",
  "context": {
    "condition": "Heap usage exceeded 85%",
    "details": {
      "max_heap_percent": "92.5",
      "avg_heap_percent": "88.7",
      "affected_nodes": "node-1"
    }
  }
}
```

#### Étape 11: Vérifier l'Action Index

Interrogez l'index d'historique des alertes:

```bash
# Vérifier que l'index a été créé
GET alert-history

# Rechercher les alertes récentes
GET alert-history/_search
{
  "query": {
    "range": {
      "@timestamp": {
        "gte": "now-1h"
      }
    }
  },
  "sort": [
    { "@timestamp": "desc" }
  ]
}
```

**Résultat attendu**:
```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [
      {
        "_source": {
          "@timestamp": "2024-01-15T10:05:30.123Z",
          "alert": {
            "id": "alert-123-abc",
            "name": "heap-usage-critical"
          },
          "metrics": {
            "heap": {
              "max_percent": 92.5,
              "avg_percent": 88.7,
              "threshold": 85
            }
          },
          "status": "triggered",
          "severity": "critical",
          "message": "Heap usage critical: 92.5% detected..."
        }
      }
    ]
  }
}
```

#### Étape 12: Créer des Visualisations de l'Historique d'Alertes

Créons un dashboard Kibana pour visualiser l'historique:

1. Allez dans **Kibana** → **Discover**
2. Créez un **Data View** pour `alert-history`
3. Allez dans **Dashboard** → **Create dashboard**
4. Ajoutez des visualisations:

**Visualisation 1: Timeline des Alertes**
```
Visualization type: Line chart
X-axis: @timestamp (Date histogram)
Y-axis: Count
Break down by: alert.name.keyword
```

**Visualisation 2: Répartition par Sévérité**
```
Visualization type: Pie chart
Slice by: severity.keyword
```

**Visualisation 3: Top Nœuds Problématiques**
```
Visualization type: Table
Rows: nodes.affected.keyword
Metrics: Count, Max heap_percent
```

### Validation

Vérifiez tous les éléments:

```bash
# 1. Vérifier les connecteurs
GET _kibana/api/actions/connectors

# 2. Vérifier la règle et ses actions
GET _kibana/api/alerting/rules

# 3. Compter les alertes dans l'index
GET alert-history/_count

# 4. Statistiques sur les alertes par sévérité
GET alert-history/_search
{
  "size": 0,
  "aggs": {
    "by_severity": {
      "terms": {
        "field": "severity.keyword"
      }
    },
    "by_alert_name": {
      "terms": {
        "field": "alert.name.keyword"
      }
    }
  }
}
```

### Points Clés à Retenir

✅ Les **connecteurs** sont réutilisables entre plusieurs règles
✅ Les **webhooks** permettent d'intégrer avec n'importe quel service externe
✅ L'**indexation des alertes** crée une base de données d'historique analysable
✅ Les **actions multiples** permettent de notifier ET d'archiver simultanément
✅ Le **throttling** évite les alertes répétées (alert fatigue)
✅ Les **payloads personnalisés** incluent contexte et actions recommandées
✅ Les **variables de contexte** (`{{context.*}}`) rendent les alertes dynamiques
✅ webhook.site est un outil pratique pour tester les webhooks
✅ L'historique d'alertes permet de créer des dashboards et des rapports

---

