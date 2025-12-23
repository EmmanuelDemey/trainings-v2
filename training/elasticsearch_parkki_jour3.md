---
theme: seriph
highlighter: shiki
lineNumbers: true
css: unocss
download: true
exportFilename: elasticsearch-parkki-jour3-slides
info: |
  ## Elasticsearch - Formation Parkki - Jour 3
  Par Emmanuel DEMEY - HumanCoders

  Monitoring, Securite et APM
  Focus sur l'observability et la stabilite de production
drawings:
  persist: false
---

# Elasticsearch - Formation Parkki
## Jour 3 : Monitoring, Securite et APM

Formation personnalisee sur 3 jours

Par Emmanuel DEMEY

---
layout: center
---

# Rappel Jours 1 et 2

<v-clicks>

**Jour 1** :
- Concepts, Mapping (critique!), Recherche

**Jour 2** :
- Sizing, ILM, Troubleshooting JVM

</v-clicks>

<br>

<v-click>

> Aujourd'hui : **Monitoring, Securite et APM** pour une production stable

</v-click>

---
layout: intro
---

# Programme Jour 3
## Monitoring, Securite et APM (9h-17h)

**Matin (9h-12h30)**:
- Monitoring approfondi (2h)
- Alerting (1h30)

**Apres-midi (14h-17h)**:
- Securite (1h30)
- APM et Logs Applicatifs (1h)
- Synthese et Q&A (30min)

---
layout: section
---

# Partie 10 : Monitoring approfondi
*Duree : 2h*

## POUR ANTICIPER LES PROBLEMES

---

# Cluster Health APIs

```bash
GET /_cluster/health

{
  "cluster_name": "parkki-prod",
  "status": "yellow",
  "number_of_nodes": 3,
  "number_of_data_nodes": 3,
  "active_primary_shards": 150,
  "active_shards": 280,
  "unassigned_shards": 20,        // A investiguer !
  "delayed_unassigned_shards": 0,
  "number_of_pending_tasks": 0,
  "task_max_waiting_in_queue_millis": 0
}
```

<v-clicks>

| Status | Signification |
|--------|---------------|
| **green** | Tout va bien |
| **yellow** | Replicas manquants |
| **red** | URGENT - Primaires manquants |

</v-clicks>

---

# CAT APIs en detail

```bash
# Noeuds avec metriques cles
GET /_cat/nodes?v&h=name,ip,heap.percent,ram.percent,cpu,load_1m,node.role

# Indices tries par taille
GET /_cat/indices?v&h=index,health,pri,rep,docs.count,store.size&s=store.size:desc

# Shards avec etat
GET /_cat/shards?v&h=index,shard,prirep,state,docs,store,node

# Allocation disque
GET /_cat/allocation?v&h=node,shards,disk.indices,disk.used,disk.avail,disk.percent

# Thread pools
GET /_cat/thread_pool?v&h=node_name,name,active,queue,rejected
```

---

# Cluster Allocation Explain

Pourquoi un shard n'est pas assigne ?

```bash
GET /_cluster/allocation/explain
{
  "index": "logs-parkki-2025.01.15",
  "shard": 0,
  "primary": false
}
```

<v-clicks>

**Reponses courantes** :
- `"DISK_THRESHOLD"` : Watermark atteint
- `"NODE_LEFT"` : Noeud parti
- `"ALLOCATION_FAILED"` : Erreur d'allocation
- `"NO_VALID_SHARD_COPY"` : Pas de copie valide

</v-clicks>

---

# Field Data Cache Monitoring

```bash
# Utilisation du fielddata par champ
GET /_cat/fielddata?v&fields=*

# Stats par noeud
GET /_nodes/stats/indices/fielddata

# Eviction stats
GET /_nodes/stats/indices/fielddata?filter_path=nodes.*.indices.fielddata
```

<v-clicks>

**Alerte si** :
- Fielddata > 20% de la heap
- Evictions frequentes
- Champs `text` dans le fielddata

</v-clicks>

---

# Stack Monitoring avec Metricbeat

Architecture :

```
Cluster de Production          Cluster de Monitoring
┌─────────────────────┐        ┌─────────────────────┐
│  Elasticsearch      │        │  Elasticsearch      │
│  + Metricbeat       │───────▶│  + Kibana           │
│                     │        │                     │
└─────────────────────┘        └─────────────────────┘
```

<v-click>

> **Best practice** : Cluster de monitoring separe

</v-click>

---

# Configuration Metricbeat

```yaml
# metricbeat.yml
metricbeat.modules:
- module: elasticsearch
  xpack.enabled: true
  period: 10s
  hosts: ["https://localhost:9200"]
  username: "monitoring_user"
  password: "xxx"
  ssl:
    certificate_authorities: ["/etc/pki/ca.crt"]

output.elasticsearch:
  hosts: ["https://monitoring-cluster:9200"]
  username: "remote_monitoring_user"
  password: "xxx"
```

---

# Filebeat pour les logs Elasticsearch

```yaml
# filebeat.yml
filebeat.modules:
- module: elasticsearch
  server:
    enabled: true
    var.paths:
      - /var/log/elasticsearch/*_server.json
  slowlog:
    enabled: true
    var.paths:
      - /var/log/elasticsearch/*_index_search_slowlog.json
      - /var/log/elasticsearch/*_index_indexing_slowlog.json
  gc:
    enabled: true
    var.paths:
      - /var/log/elasticsearch/gc.log*
```

---

# Kibana Stack Monitoring

Metriques cles a surveiller :

<v-clicks>

| Metrique | Seuil d'alerte |
|----------|----------------|
| JVM Heap Usage | > 85% |
| GC Duration | > 1s |
| Thread Pool Rejections | > 0 |
| Disk Usage | > 85% |
| Query Latency (p99) | > 1s |
| Indexing Rate | Chute soudaine |
| Shard Count | > 1000/noeud |

</v-clicks>

---

# Dashboard Monitoring

```
┌─────────────────────────────────────────────────────┐
│                  Cluster Health                      │
│  ● GREEN   Nodes: 3   Indices: 45   Shards: 180     │
├─────────────────────────────────────────────────────┤
│  JVM Heap          │  CPU Usage        │  Disk      │
│  ████████░░ 78%    │  ███░░░░░░ 35%    │  ██████░ 60%│
├─────────────────────────────────────────────────────┤
│  Indexing Rate: 15,234 docs/s                       │
│  Search Rate: 245 queries/s                         │
│  Latency (p99): 450ms                               │
├─────────────────────────────────────────────────────┤
│  Thread Pool Rejections: 0                          │
│  Pending Tasks: 0                                   │
└─────────────────────────────────────────────────────┘
```

---
layout: section
---

# Partie 11 : Alerting
*Duree : 1h30*

---

# Watcher API (Elasticsearch)

Structure d'une watch :

```json
PUT _watcher/watch/jvm_heap_alert
{
  "trigger": { ... },      // Quand declencher
  "input": { ... },        // Donnees a collecter
  "condition": { ... },    // Condition de declenchement
  "actions": { ... }       // Actions a executer
}
```

---

# Exemple : Alerte JVM Heap

```json
PUT _watcher/watch/jvm_heap_alert
{
  "trigger": {
    "schedule": { "interval": "1m" }
  },
  "input": {
    "http": {
      "request": {
        "host": "localhost",
        "port": 9200,
        "path": "/_nodes/stats/jvm",
        "auth": { "basic": { "username": "elastic", "password": "xxx" } }
      }
    }
  },
  "condition": {
    "script": {
      "source": "return ctx.payload.nodes.values().stream().anyMatch(n -> n.jvm.mem.heap_used_percent > 85)"
    }
  },
  "actions": {
    "notify_slack": {
      "slack": {
        "message": {
          "to": ["#alerts"],
          "text": "JVM Heap > 85% !"
        }
      }
    }
  }
}
```

---

# Types de triggers

```json
// Interval regulier
{ "schedule": { "interval": "5m" } }

// Cron expression
{ "schedule": { "cron": "0 0 * * * ?" } }

// Horaires specifiques
{ "schedule": {
    "daily": { "at": ["09:00", "17:00"] }
  }
}
```

---

# Types d'inputs

```json
// Recherche Elasticsearch
{
  "input": {
    "search": {
      "request": {
        "indices": ["logs-*"],
        "body": {
          "query": { "term": { "level": "ERROR" } },
          "aggs": { "error_count": { "value_count": { "field": "_id" } } }
        }
      }
    }
  }
}

// HTTP externe
{
  "input": {
    "http": {
      "request": { "url": "https://api.example.com/status" }
    }
  }
}
```

---

# Types d'actions

```json
"actions": {
  // Email
  "send_email": {
    "email": {
      "to": ["ops@parkki.com"],
      "subject": "Alerte Elasticsearch",
      "body": "JVM Heap critique !"
    }
  },

  // Webhook
  "notify_pagerduty": {
    "webhook": {
      "url": "https://events.pagerduty.com/...",
      "body": "{ \"event\": \"trigger\", ... }"
    }
  },

  // Slack
  "notify_slack": {
    "slack": {
      "message": { "to": ["#alerts"], "text": "Alerte !" }
    }
  }
}
```

---

# Kibana Alerting

Plus simple que Watcher :

<v-clicks>

1. **Stack Management** > **Rules and Connectors**
2. **Create rule**
3. Choisir le type (Elasticsearch query, threshold, etc.)
4. Configurer la condition
5. Ajouter les actions (Slack, Email, Webhook)

**Avantages** :
- Interface graphique
- Gestion centralisee
- Historique des executions

</v-clicks>

---

# Alertes recommandees pour Parkki

<v-clicks>

| Alerte | Condition | Action |
|--------|-----------|--------|
| JVM Heap | > 85% pendant 5min | Slack + PagerDuty |
| Disk Watermark | > 80% | Slack |
| Cluster Status | != green | Slack + Email |
| Thread Rejections | > 0 | Slack |
| Erreurs applicatives | > 100/min | Slack |
| Latence p99 | > 2s | Slack |

</v-clicks>

---

# Exemple : Alerte erreurs applicatives

```json
PUT _watcher/watch/app_errors_alert
{
  "trigger": { "schedule": { "interval": "1m" } },
  "input": {
    "search": {
      "request": {
        "indices": ["logs-parkki-*"],
        "body": {
          "query": {
            "bool": {
              "filter": [
                { "term": { "level": "ERROR" } },
                { "range": { "@timestamp": { "gte": "now-1m" } } }
              ]
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": { "ctx.payload.hits.total.value": { "gt": 100 } }
  },
  "actions": {
    "notify_slack": {
      "slack": {
        "message": {
          "to": ["#parkki-alerts"],
          "text": "Plus de 100 erreurs dans la derniere minute !"
        }
      }
    }
  }
}
```

---
layout: center
---

# Pause dejeuner
## 12h30 - 14h00

Retour a 14h pour : **Securite et APM**

---
layout: section
---

# Partie 12 : Securite
*Duree : 1h30*

---

# Activation de la securite

```yaml
# elasticsearch.yml
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.http.ssl.enabled: true
```

<v-clicks>

**Setup initial** :
```bash
# Generer les mots de passe
bin/elasticsearch-setup-passwords auto

# Ou interactif
bin/elasticsearch-setup-passwords interactive
```

</v-clicks>

---

# Authentication : Realms

Chaine d'authentification :

```yaml
xpack.security.authc.realms:
  native:
    native1:
      order: 0
  ldap:
    ldap1:
      order: 1
      url: "ldap://ldap.parkki.com:389"
      bind_dn: "cn=admin,dc=parkki,dc=com"
  file:
    file1:
      order: 2
```

<v-click>

> Les realms sont evalues dans l'ordre

</v-click>

---

# Creation d'utilisateurs

```bash
# Via API
POST /_security/user/dev_user
{
  "password": "secure_password",
  "roles": ["kibana_user", "logs_reader"],
  "full_name": "Developer User",
  "email": "dev@parkki.com"
}

# Verification
GET /_security/user/dev_user
```

---

# Privileges cluster

<v-clicks>

| Privilege | Description |
|-----------|-------------|
| `all` | Acces total au cluster |
| `monitor` | Lecture des metriques |
| `manage` | Gestion du cluster |
| `create_snapshot` | Creation de snapshots |
| `manage_ilm` | Gestion ILM |
| `manage_pipeline` | Gestion pipelines ingest |

</v-clicks>

---

# Privileges index

<v-clicks>

| Privilege | Description |
|-----------|-------------|
| `all` | Acces total |
| `read` | Lecture (search, get) |
| `write` | Ecriture (index, update, delete) |
| `create` | Creation de documents |
| `delete` | Suppression |
| `manage` | Gestion index (settings, mappings) |
| `monitor` | Metriques de l'index |

</v-clicks>

---

# Creation de roles

```json
POST /_security/role/logs_reader
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-parkki-*"],
      "privileges": ["read", "view_index_metadata"]
    }
  ],
  "applications": [
    {
      "application": "kibana-.kibana",
      "privileges": ["read"],
      "resources": ["*"]
    }
  ]
}
```

---

# Document-Level Security

Filtrer les documents par role :

```json
POST /_security/role/team_a_logs
{
  "indices": [
    {
      "names": ["logs-parkki-*"],
      "privileges": ["read"],
      "query": {
        "term": { "team": "team-a" }
      }
    }
  ]
}
```

<v-click>

> L'utilisateur ne voit que les docs avec `team: team-a`

</v-click>

---

# Field-Level Security

Masquer des champs :

```json
POST /_security/role/logs_anonymized
{
  "indices": [
    {
      "names": ["logs-parkki-*"],
      "privileges": ["read"],
      "field_security": {
        "grant": ["@timestamp", "level", "message", "service"],
        "except": ["user_id", "ip", "email"]
      }
    }
  ]
}
```

<v-click>

> Les champs sensibles sont masques

</v-click>

---

# API Keys

```bash
# Creer une API key
POST /_security/api_key
{
  "name": "parkki-app-key",
  "expiration": "30d",
  "role_descriptors": {
    "logs_writer": {
      "indices": [
        {
          "names": ["logs-parkki-*"],
          "privileges": ["create_doc", "create_index"]
        }
      ]
    }
  }
}

# Reponse
{
  "id": "VuaCfGcBCdbkQm...",
  "api_key": "ui2lp2axTNmsyakw9tvNnw"
}
```

---

# Audit Logging

```yaml
# elasticsearch.yml
xpack.security.audit.enabled: true
xpack.security.audit.logfile.events.include:
  - access_denied
  - authentication_failed
  - connection_denied
  - run_as_denied
  - anonymous_access_denied
```

<v-click>

```json
// Exemple de log d'audit
{
  "type": "audit",
  "event.action": "access_denied",
  "user.name": "unknown",
  "request.name": "SearchRequest",
  "indices": ["logs-parkki-prod"]
}
```

</v-click>

---
layout: section
---

# Partie 13 : APM et Logs Applicatifs
*Duree : 1h*

## POUR VOTRE USE CASE APM

---

# Architecture APM

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Application    │     │   APM Server    │     │ Elasticsearch   │
│  + APM Agent    │────▶│                 │────▶│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │  Kibana APM UI  │
                                                └─────────────────┘
```

<v-clicks>

**Composants** :
- **APM Agent** : Instrumente votre application
- **APM Server** : Collecte et transforme les donnees
- **Elasticsearch** : Stockage
- **Kibana APM UI** : Visualisation

</v-clicks>

---

# APM Agents disponibles

<v-clicks>

| Langage | Agent |
|---------|-------|
| Java | elastic-apm-agent |
| Node.js | elastic-apm-node |
| Python | elastic-apm |
| .NET | Elastic.Apm |
| Go | apm-agent-go |
| Ruby | elastic-apm |
| PHP | elastic-apm-php-agent |

</v-clicks>

---

# Configuration APM Agent (Node.js)

```javascript
// Premiere ligne de votre app !
const apm = require('elastic-apm-node').start({
  serviceName: 'parkki-api',
  serverUrl: 'http://apm-server:8200',
  environment: 'production',

  // Sampling
  transactionSampleRate: 0.1,  // 10% des transactions

  // Capture
  captureBody: 'all',
  captureHeaders: true
});
```

---

# Configuration APM Agent (Java)

```bash
# Demarrage avec agent
java -javaagent:/path/to/elastic-apm-agent.jar \
     -Delastic.apm.service_name=parkki-api \
     -Delastic.apm.server_urls=http://apm-server:8200 \
     -Delastic.apm.environment=production \
     -Delastic.apm.transaction_sample_rate=0.1 \
     -jar parkki-api.jar
```

<v-click>

Ou via `elasticapm.properties` :
```properties
service_name=parkki-api
server_urls=http://apm-server:8200
environment=production
transaction_sample_rate=0.1
```

</v-click>

---

# Instrumentation automatique vs manuelle

**Automatique** (par defaut) :

<v-clicks>

- HTTP requests/responses
- Database queries (SQL, MongoDB, Redis)
- External HTTP calls
- Message queues (RabbitMQ, Kafka)

</v-clicks>

<v-click>

**Manuelle** (pour custom) :
```javascript
const span = apm.startSpan('custom-operation');
try {
  // Votre code
  await processOrder(order);
} finally {
  span.end();
}
```

</v-click>

---

# Sampling Strategies

```javascript
// Sample rate (% des transactions)
transactionSampleRate: 0.1  // 10%

// Ou dynamique
transactionSampleRate: (transactionName) => {
  if (transactionName.includes('/health')) return 0;
  if (transactionName.includes('/api/critical')) return 1;
  return 0.1;
}
```

<v-clicks>

**Pour Parkki** :
- Health checks : 0%
- API critiques : 100%
- Reste : 10%

</v-clicks>

---

# Correlation logs/APM

Injection du Trace ID dans les logs :

```javascript
// Logger avec trace ID
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format((info) => {
      const traceId = apm.currentTransaction?.traceId;
      if (traceId) {
        info.trace_id = traceId;
        info.transaction_id = apm.currentTransaction.id;
      }
      return info;
    })(),
    winston.format.json()
  )
});
```

---

# Navigation logs <-> traces

Dans Kibana :

```
┌─────────────────────────────────────────────────────┐
│  APM Transaction: GET /api/orders                   │
│  Duration: 450ms                                    │
├─────────────────────────────────────────────────────┤
│  ├─ MySQL query (120ms)                             │
│  ├─ Redis cache (5ms)                               │
│  └─ External API call (200ms)                       │
├─────────────────────────────────────────────────────┤
│  Related Logs (3)                          [View]   │
│  - INFO: Order fetched                              │
│  - WARN: Slow query detected                        │
│  - ERROR: Payment timeout                           │
└─────────────────────────────────────────────────────┘
```

---

# Best Practices APM pour Parkki

<v-clicks>

1. **Sampling** : 10% en prod, 100% en dev
2. **Nommer les transactions** : `GET /api/orders/:id`
3. **Custom spans** : Pour les operations metier
4. **Trace ID dans les logs** : Correlation
5. **Alertes** : Latence p99, error rate
6. **Retention** : 7 jours pour APM data

</v-clicks>

---

# Sizing APM pour Parkki

```
Estimation :
- 15M logs/jour
- 10% sampling APM = 1.5M transactions/jour
- Taille moyenne transaction = 5 KB
- Volume APM = 7.5 GB/jour

Retention 7 jours :
- Volume total = 52.5 GB
- Avec compression = ~30 GB
```

<v-click>

> ILM specifique pour APM avec retention 7 jours

</v-click>

---
layout: section
---

# Partie 14 : Synthese et Q&A
*Duree : 30min*

---

# Recapitulatif des 3 jours

<v-clicks>

**Jour 1 - Fondamentaux** :
- Concepts, Installation, Indexation
- Mapping (critique!) : text vs keyword
- Templates et Recherche

**Jour 2 - Performance** :
- Sizing et ratios memory:data
- ILM Hot/Warm/Delete
- Troubleshooting JVM

**Jour 3 - Production** :
- Monitoring et Alerting
- Securite
- APM

</v-clicks>

---

# Plan d'action pour Parkki

## Quick Wins (cette semaine)

<v-clicks>

1. **Augmenter refresh_interval** a 30s
2. **Configurer les slowlogs**
3. **Mettre en place les alertes** JVM/Disk
4. **Auditer les mappings** (champs text inutiles)

</v-clicks>

---

# Plan d'action pour Parkki

## Moyen terme (1-2 semaines)

<v-clicks>

1. **Implementer ILM** Hot/Warm/Delete
2. **Migrer vers Data Streams**
3. **Revoir les mappings** avec dynamic templates
4. **Configurer le monitoring** Metricbeat

</v-clicks>

---

# Plan d'action pour Parkki

## Long terme (1 mois+)

<v-clicks>

1. **Architecture Hot/Warm** sur noeuds dedies
2. **Correlation logs/APM** complete
3. **Dashboards de monitoring** personnalises
4. **Procedures de maintenance** documentees
5. **Formation continue** de l'equipe

</v-clicks>

---

# Impact attendu

<v-clicks>

| Metrique | Avant | Apres |
|----------|-------|-------|
| RAM utilisee | 5+ GB | 2 GB |
| Problemes JVM | Frequents | Rares |
| Couts mensuels | X | X * 0.5 |
| Temps de debug | Heures | Minutes |
| Alertes proactives | 0 | 5+ |

</v-clicks>

---

# Ressources

<v-clicks>

**Documentation officielle** :
- https://www.elastic.co/guide/

**Blogs** :
- https://www.elastic.co/blog/

**Forums** :
- https://discuss.elastic.co/

**Monitoring** :
- Kibana Stack Monitoring
- Elastic Cloud Console

</v-clicks>

---

# Questions / Reponses

<v-clicks>

**Sujets frequents** :
- Comment migrer vers les Data Streams ?
- Quelle strategie de backup ?
- Comment gerer les mises a jour Elastic Cloud ?
- Comment optimiser les dashboards Kibana ?

</v-clicks>

---
layout: end
---

# Merci pour ces 3 jours !

## Formation Elasticsearch Parkki

**Prochaines etapes** :
1. Appliquer le plan d'action
2. Suivi post-formation si besoin
3. Contact pour questions

**Emmanuel DEMEY**
demey.emmanuel@gmail.com
