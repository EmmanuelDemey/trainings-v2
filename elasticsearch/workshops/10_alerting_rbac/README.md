# TP 10 — Alertes et Notifications

> Créer des alertes de surveillance avec Kibana Rules, configurer des actions avancées (webhook, index), et implémenter la gestion des utilisateurs avec RBAC et Document-Level Security.

**Contexte**: Les alertes ne sont utiles que si elles déclenchent les bonnes actions. Dans ce TP, vous allez créer des règles de surveillance, configurer des webhooks, archiver l'historique des alertes, et implémenter le contrôle d'accès basé sur les rôles.

## Setup

Ce TP est autonome. Créez les indices de simulation avant de commencer:

```bash
PUT /cluster_health_logs
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "status": { "type": "keyword" },
      "cluster_name": { "type": "keyword" },
      "number_of_nodes": { "type": "integer" },
      "unassigned_shards": { "type": "integer" }
    }
  }
}

POST /cluster_health_logs/_doc
{
  "@timestamp": "2024-01-15T10:00:00Z",
  "status": "yellow",
  "cluster_name": "es-ops-training",
  "number_of_nodes": 3,
  "unassigned_shards": 2
}
```

## Partie A: Création d'une Alerte Simple avec Kibana Rules

### Étape 1: Accéder à l'Interface de Gestion des Règles

1. Ouvrez Kibana dans votre navigateur
2. Dans le menu latéral, cliquez sur **Stack Management**
3. Sous la section **Alerts and Insights**, cliquez sur **Rules**

### Étape 2: Créer une Nouvelle Règle

1. Cliquez sur **Create rule**
2. Sélectionnez le type: **Elasticsearch query**
3. Nom: `cluster-health-monitor`
4. Tags: `cluster`, `health`, `ops`

### Étape 3: Configurer la Requête de Surveillance

- **Index**: `cluster_health_logs`
- **Time field**: `@timestamp`
- **Query**:

```json
{
  "query": {
    "bool": {
      "must": [
        { "range": { "@timestamp": { "gte": "now-5m" } } }
      ],
      "filter": [
        { "terms": { "status": ["yellow", "red"] } }
      ]
    }
  }
}
```

### Étape 4: Configurer la Fréquence

- **Check every**: `1 minute`
- **Notify**: `Every time alert is active`

### Étape 5: Définir les Actions

1. **Add action** → **Server log**
2. Message:

```
Alerte: Le cluster {{context.cluster.name}} est en état {{context.status}}!

Détails:
- Statut: {{context.status}}
- Nœuds: {{context.number_of_nodes}}
- Shards non assignés: {{context.unassigned_shards}}
- Date: {{context.date}}

Action requise: Vérifier l'état du cluster avec GET _cluster/health
```

### Étape 6: Tester le Déclenchement

```bash
POST /cluster_health_logs/_doc
{
  "@timestamp": "2024-01-15T10:05:00Z",
  "status": "yellow",
  "cluster_name": "es-ops-training",
  "number_of_nodes": 3,
  "unassigned_shards": 5
}

POST /cluster_health_logs/_refresh
```

Attendez 1-2 minutes, puis vérifiez dans **Stack Management** → **Rules** → votre règle → onglet **History**.

## Partie B: Configuration d'Actions Avancées (Webhook et Index)

### Étape 1: Créer un Service de Test pour Recevoir les Webhooks

1. Ouvrez https://webhook.site et notez l'URL unique générée

**Alternative locale**:
```bash
while true; do echo -e "HTTP/1.1 200 OK\n\n" | nc -l 8888; done
```

### Étape 2: Créer le Connecteur Webhook dans Kibana

1. **Stack Management** → **Connectors** → **Create connector** → **Webhook**
2. Configuration:
   - **Connector name**: `ops-webhook-notifier`
   - **URL**: URL de webhook.site
   - **Method**: `POST`
   - **Headers**: `{"Content-Type": "application/json", "X-Alert-Source": "elasticsearch-ops"}`
3. Testez et sauvegardez

### Étape 3: Créer un Connecteur Index Action

1. **Create connector** → **Index**
2. Configuration:
   - **Connector name**: `alert-history-index`
   - **Index**: `alert-history`
   - **Refresh**: `true`
   - **Time field**: `@timestamp`
3. Sauvegardez

### Étape 4: Créer un Index de Simulation

```bash
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

### Étape 5: Créer une Alerte avec Actions Multiples

1. Créez une règle `heap-usage-critical` de type **Elasticsearch query**
2. Index: `heap-monitoring`, Time field: `@timestamp`
3. Query pour détecter heap > 85%:

```json
{
  "query": {
    "bool": {
      "must": [
        { "range": { "@timestamp": { "gte": "now-5m" } } },
        { "range": { "heap_used_percent": { "gte": 85 } } }
      ]
    }
  }
}
```

4. Configurez l'action Webhook avec payload:

```json
{
  "alert_id": "{{alertId}}",
  "alert_name": "{{alertName}}",
  "alert_type": "heap_usage",
  "severity": "critical",
  "timestamp": "{{date}}",
  "context": {
    "condition": "Heap usage exceeded 85%"
  }
}
```

5. Configurez l'action Index pour archiver les alertes

### Étape 6: Déclencher et Vérifier

```bash
POST /heap-monitoring/_doc
{
  "@timestamp": "2024-01-15T10:10:00Z",
  "node_id": "node-1",
  "node_name": "es-ops-node-1",
  "heap_used_percent": 92.5
}

POST /heap-monitoring/_refresh
```

Vérifiez les alertes indexées:

```bash
GET alert-history/_search
{
  "query": { "range": { "@timestamp": { "gte": "now-1h" } } },
  "sort": [{ "@timestamp": "desc" }]
}
```

## Partie C: Création d'Utilisateurs et de Rôles (RBAC)

### Étape 1: Vérifier l'Utilisateur Actuel et Créer les Indices

```bash
GET /_security/_authenticate

PUT /logs-2024-01
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

POST /logs-2024-01/_bulk
{"index":{"_id":"1"}}
{"timestamp":"2024-01-15T10:00:00Z","level":"INFO","message":"Application started","service":"api"}
{"index":{"_id":"2"}}
{"timestamp":"2024-01-15T10:05:00Z","level":"WARN","message":"High memory usage","service":"api"}
{"index":{"_id":"3"}}
{"timestamp":"2024-01-15T10:10:00Z","level":"ERROR","message":"Database connection failed","service":"database"}
```

### Étape 2: Créer les Rôles

```bash
# Rôle lecture seule sur logs
POST /_security/role/logs_readonly
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-*", "filebeat-*", "logstash-*"],
      "privileges": ["read", "view_index_metadata"]
    }
  ],
  "metadata": {
    "description": "Read-only access to logs indices"
  }
}

# Rôle développeur
POST /_security/role/developer
{
  "cluster": ["monitor", "manage_index_templates", "manage_ilm", "manage_pipeline"],
  "indices": [
    {
      "names": ["dev-*", "test-*"],
      "privileges": ["all"]
    },
    {
      "names": ["products", "orders"],
      "privileges": ["read", "view_index_metadata"]
    }
  ],
  "metadata": {
    "description": "Developer with full access to dev/test indices"
  }
}
```

### Étape 3: Créer des Utilisateurs

```bash
POST /_security/user/alice_reader
{
  "password": "ReadOnlyPass123!",
  "roles": ["logs_readonly"],
  "full_name": "Alice Reader",
  "email": "alice@example.com"
}

POST /_security/user/charlie_dev
{
  "password": "DevPass789!",
  "roles": ["developer"],
  "full_name": "Charlie Developer",
  "email": "charlie@example.com"
}
```

### Étape 4: Tester les Permissions

```bash
# Lecture autorisée pour alice_reader
curl -u alice_reader:ReadOnlyPass123! "https://localhost:9200/logs-2024-01/_search?pretty"
# Résultat attendu: Succès (200 OK)

# Écriture NON autorisée pour alice_reader
curl -u alice_reader:ReadOnlyPass123! -X POST "https://localhost:9200/logs-2024-01/_doc" \
  -H 'Content-Type: application/json' \
  -d '{"timestamp":"2024-01-15T11:00:00Z","level":"INFO","message":"Test"}'
# Résultat attendu: Erreur 403 Forbidden
```

### Étape 5: Implémenter Document-Level Security (DLS)

Créez des données multi-tenant:

```bash
PUT /orders
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "order_id": { "type": "keyword" },
      "customer": { "type": "keyword" },
      "amount": { "type": "float" },
      "department": { "type": "keyword" },
      "region": { "type": "keyword" },
      "status": { "type": "keyword" },
      "created_at": { "type": "date" }
    }
  }
}

POST /orders/_bulk
{"index":{"_id":"1"}}
{"order_id":"ORD-001","customer":"Alice Corp","amount":5000,"department":"sales","region":"EMEA","status":"completed","created_at":"2024-01-15T10:00:00Z"}
{"index":{"_id":"2"}}
{"order_id":"ORD-002","customer":"Bob LLC","amount":3000,"department":"sales","region":"AMER","status":"pending","created_at":"2024-01-16T10:00:00Z"}
{"index":{"_id":"3"}}
{"order_id":"ORD-003","customer":"Charlie Inc","amount":7500,"department":"marketing","region":"EMEA","status":"completed","created_at":"2024-01-17T10:00:00Z"}
{"index":{"_id":"4"}}
{"order_id":"ORD-004","customer":"David Co","amount":2000,"department":"sales","region":"APAC","status":"completed","created_at":"2024-01-18T10:00:00Z"}
{"index":{"_id":"5"}}
{"order_id":"ORD-005","customer":"Eve Enterprises","amount":9000,"department":"marketing","region":"AMER","status":"pending","created_at":"2024-01-19T10:00:00Z"}
```

Créez un rôle avec DLS pour la sales team:

```bash
POST /_security/role/sales_team
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["orders"],
      "privileges": ["read", "view_index_metadata"],
      "query": {
        "term": {
          "department": "sales"
        }
      }
    }
  ],
  "metadata": {
    "description": "Sales team - can only see sales department orders"
  }
}

POST /_security/user/sarah_sales
{
  "password": "SalesPass123!",
  "roles": ["sales_team"],
  "full_name": "Sarah Sales",
  "email": "sarah@example.com"
}
```

Testez le filtrage DLS:

```bash
# sarah_sales ne voit que les commandes "sales" (3 sur 5)
curl -u sarah_sales:SalesPass123! "https://localhost:9200/orders/_count?pretty"
# Résultat attendu: {"count": 3}

# Même avec l'ID d'un document marketing, il est inaccessible
curl -u sarah_sales:SalesPass123! "https://localhost:9200/orders/_doc/3?pretty"
# Résultat attendu: 404 Not Found
```

Créez un rôle EMEA Manager (DLS par région):

```bash
POST /_security/role/emea_manager
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["orders"],
      "privileges": ["read", "view_index_metadata"],
      "query": {
        "term": {
          "region": "EMEA"
        }
      }
    }
  ],
  "metadata": {
    "description": "EMEA regional manager - can only see EMEA region data"
  }
}
```

## Validation

```bash
# 1. Vérifier les rôles créés
GET /_security/role/logs_readonly,developer,sales_team,emea_manager

# 2. Vérifier les utilisateurs
GET /_security/user

# 3. Compter les alertes indexées
GET alert-history/_count
```

## Points Clés à Retenir

- **Kibana Rules** offrent une interface graphique pour créer des alertes sans JSON
- Les **connecteurs** sont réutilisables entre plusieurs règles
- Les **webhooks** permettent d'intégrer avec n'importe quel service externe
- L'**indexation des alertes** crée une base de données d'historique analysable
- Le **throttling** évite les alertes répétées (alert fatigue)
- **DLS filtre les documents** visibles selon une query Elasticsearch
- La query DLS est **transparente** pour l'utilisateur (documents invisibles comme s'ils n'existaient pas)
- Même avec `GET /_doc/{id}`, un document filtré retourne **404 Not Found**
