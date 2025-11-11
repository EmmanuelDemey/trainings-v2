---
layout: cover
---

# Systèmes d'Alertes

Surveillance proactive et notifications automatiques avec Elasticsearch Alerting

---

# Objectifs d'Apprentissage

À la fin de cette section, vous serez capable de:

- Comprendre les mécanismes d'alerting d'Elasticsearch (Watcher et Kibana Rules)
- Créer des alertes basées sur des conditions de cluster, métriques, ou requêtes
- Configurer des actions d'alerte (email, webhook, Slack, index)
- Utiliser les dashboards de monitoring Kibana pour gérer les alertes actives

---

# Pourquoi l'Alerting est Critique

L'alerting proactif permet de détecter et réagir aux problèmes avant qu'ils n'impactent les utilisateurs.

**Scénarios d'alerting courants**:
- 🔴 Cluster passe en statut RED (perte de données)
- 🟡 Cluster passe en statut YELLOW (perte de HA)
- 💾 Utilisation disque >85% (watermark LOW)
- 🧠 Heap JVM >85% (risque OutOfMemoryError)
- 📊 Taux d'erreur >5% (dégradation service)
- ⏱️ Latence p95 >1s (expérience utilisateur)
- 🚫 Thread pool rejections >100/min (surcharge)

---

# Pourquoi l'Alerting est Critique

**Bénéfices**:
- ✅ Détection précoce des incidents
- ✅ Réduction du MTTR (Mean Time To Recovery)
- ✅ Prévention des pannes majeures
- ✅ Conformité aux SLA

---

# Elasticsearch Alerting: Deux Solutions

Elasticsearch propose deux systèmes d'alerting complémentaires.

## 1. Watcher (Elasticsearch Alerting API)

**Caractéristiques**:
- Basé sur des requêtes Elasticsearch (DSL JSON)
- Exécution programmée (schedule)
- Très flexible et puissant
- Configuration via API REST

**Cas d'usage**: Alertes complexes basées sur agrégations, transformations de données, logique métier avancée.

---

# Elasticsearch Alerting: Deux Solutions

## 2. Kibana Rules & Connectors

**Caractéristiques**:
- Interface graphique dans Kibana
- Rule types prédéfinis (Elasticsearch query, index threshold, etc.)
- Intégration avec Kibana Stack Monitoring
- Plus simple à configurer

**Cas d'usage**: Alertes standard sur métriques Elasticsearch, logs, APM.

**Recommendation**: Utilisez Kibana Rules pour les cas simples, Watcher pour les cas complexes.

---

# Anatomie d'une Alerte Watcher

Une [alerte Watcher](https://www.elastic.co/guide/en/elasticsearch/reference/current/xpack-alerting.html) se compose de 5 éléments principaux.

```
Watch = Trigger + Input + Condition + Transform + Actions
```

**1. Trigger** (quand exécuter):
```json
"trigger": {
  "schedule": {
    "interval": "1m"  // Toutes les minutes
  }
}
```

**2. Input** (collecter données):
```json
"input": {
  "search": {
    "request": {
      "indices": ["logs-*"],
      "body": {
        "query": { "range": { "@timestamp": { "gte": "now-5m" }}}
      }
    }
  }
}
```

---

# Anatomie d'une Alerte Watcher

**3. Condition** (évaluer si alerte):
```json
"condition": {
  "compare": {
    "ctx.payload.hits.total": {
      "gte": 100  // Si ≥100 erreurs
    }
  }
}
```

**4. Transform** (optionnel, transformer données):
```json
"transform": {
  "script": "return ['error_count': ctx.payload.hits.total]"
}
```

---

# Anatomie d'une Alerte Watcher

**5. Actions** (notifier):
```json
"actions": {
  "send_email": {
    "email": {
      "to": "ops@company.com",
      "subject": "Erreurs détectées: {{ctx.payload.hits.total}}"
    }
  }
}
```

---

# Trigger: Planification d'Exécution

Le [trigger](https://www.elastic.co/guide/en/elasticsearch/reference/current/trigger.html) définit quand la watch est exécutée.

**Schedule types**:

**1. Interval** (périodique):
```json
"trigger": {
  "schedule": {
    "interval": "30s"  // 30s, 5m, 1h, 1d
  }
}
```

**2. Cron** (horaires spécifiques):
```json
"trigger": {
  "schedule": {
    "cron": "0 0 12 * * ?"  // Tous les jours à midi
  }
}
```

---

# Trigger: Planification d'Exécution

**3. Hourly** (toutes les heures):
```json
"trigger": {
  "schedule": {
    "hourly": {
      "minute": [0, 30]  // À xx:00 et xx:30
    }
  }
}
```

**4. Daily** (tous les jours):
```json
"trigger": {
  "schedule": {
    "daily": {
      "at": ["08:00", "20:00"]  // À 8h et 20h
    }
  }
}
```

---

# Input: Collecte de Données

L'[input](https://www.elastic.co/guide/en/elasticsearch/reference/current/input.html) récupère les données à analyser pour l'alerte.

**Types d'input principaux**:

**1. Search Input** (requête Elasticsearch):
```json
"input": {
  "search": {
    "request": {
      "indices": ["logs-*"],
      "body": {
        "query": {
          "bool": {
            "must": [
              { "range": { "@timestamp": { "gte": "now-5m" }}},
              { "term": { "level": "error" }}
            ]
          }
        },
        "aggs": {
          "error_count": {
            "value_count": { "field": "message.keyword" }
          }
        }
      }
    }
  }
}
```

---

# Input: Collecte de Données

**2. HTTP Input** (API externe):
```json
"input": {
  "http": {
    "request": {
      "url": "https://api.example.com/metrics",
      "method": "GET",
      "headers": {
        "Authorization": "Bearer {{ctx.metadata.token}}"
      }
    }
  }
}
```

---

# Input: Collecte de Données

**3. Chain Input** (combiner plusieurs inputs):
```json
"input": {
  "chain": {
    "inputs": [
      { "first": { "search": {...}}},
      { "second": { "http": {...}}}
    ]
  }
}
```

---

# Condition: Évaluation de l'Alerte

La [condition](https://www.elastic.co/guide/en/elasticsearch/reference/current/condition.html) détermine si les actions doivent être déclenchées.

**Types de conditions**:

**1. Compare** (comparaison simple):
```json
"condition": {
  "compare": {
    "ctx.payload.hits.total": {
      "gte": 100
    }
  }
}
```

---

# Condition: Évaluation de l'Alerte

**2. Array Compare** (tous/au moins un élément):
```json
"condition": {
  "array_compare": {
    "ctx.payload.aggregations.nodes.buckets": {
      "path": "heap_percent",
      "gte": {
        "value": 85
      }
    }
  }
}
```

---

# Condition: Évaluation de l'Alerte

**3. Script** (logique personnalisée):
```json
"condition": {
  "script": {
    "source": "return ctx.payload.hits.total > 100 && ctx.payload.aggregations.error_count.value > 50"
  }
}
```

**4. Always** (toujours déclencher):
```json
"condition": {
  "always": {}
}
```

**5. Never** (désactiver temporairement):
```json
"condition": {
  "never": {}
}
```

---

# Condition: Évaluation de l'Alerte

**Context variables**:
- `ctx.trigger.scheduled_time`: Heure prévue d'exécution
- `ctx.execution_time`: Heure réelle d'exécution
- `ctx.payload`: Données de l'input
- `ctx.metadata`: Métadonnées de la watch

---

# Actions: Notifications et Réponses

Les [actions](https://www.elastic.co/guide/en/elasticsearch/reference/current/actions.html) définissent la réponse quand une alerte se déclenche.

**Types d'actions**:

**1. Email** (notification par email):
```json
"actions": {
  "send_email": {
    "email": {
      "to": ["ops@company.com", "oncall@company.com"],
      "subject": "ALERT: Cluster {{ctx.metadata.cluster}} - Heap >85%",
      "body": {
        "text": "Heap usage: {{ctx.payload.aggregations.avg_heap.value}}%\nNodes affected: {{ctx.payload.hits.total}}"
      }
    }
  }
}
```

---

# Actions: Notifications et Réponses

**2. Webhook** (HTTP POST vers API externe):
```json
"actions": {
  "notify_slack": {
    "webhook": {
      "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
      "method": "POST",
      "body": "{\"text\":\"Heap alert: {{ctx.payload.aggregations.avg_heap.value}}%\"}"
    }
  }
}
```

**3. Index** (indexer l'alerte dans Elasticsearch):
```json
"actions": {
  "log_alert": {
    "index": {
      "index": "alerts-history",
      "doc_id": "{{ctx.watch_id}}-{{ctx.execution_time}}"
    }
  }
}
```

---

# Actions: Notifications et Réponses

**4. Logging** (écrire dans les logs Elasticsearch):
```json
"actions": {
  "log_action": {
    "logging": {
      "level": "error",
      "text": "Heap alert triggered: {{ctx.payload.aggregations.avg_heap.value}}%"
    }
  }
}
```

**Throttling**: Éviter les alertes en rafale:
```json
"throttle_period": "15m"  // Max 1 alerte toutes les 15min
```

---

# Exemple Complet: Alerte Heap >85%

**Watch complète** pour surveiller le heap JVM:

```json
PUT _watcher/watch/heap_usage_alert
{
  "metadata": {
    "cluster": "production",
    "threshold": 85
  },
  "trigger": {
    "schedule": {
      "interval": "1m"
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
                { "range": { "@timestamp": { "gte": "now-2m" }}},
                { "range": { "node_stats.jvm.mem.heap_used_percent": { "gte": 85 }}}
              ]
            }
          },
          "aggs": {
            "nodes_high_heap": {
              "terms": {
                "field": "node_stats.node_id",
                "size": 10
              },
              "aggs": {
                "avg_heap": {
                  "avg": { "field": "node_stats.jvm.mem.heap_used_percent" }
                }
              }
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.hits.total": {
        "gt": 0
      }
    }
  },
  "actions": {
    "notify_ops": {
      "email": {
        "to": "ops@company.com",
        "subject": "[CRITICAL] Heap usage >85% on {{ctx.payload.aggregations.nodes_high_heap.buckets.size}} nodes",
        "body": {
          "text": "Heap alert triggered at {{ctx.execution_time}}.\n\nAffected nodes:\n{{#ctx.payload.aggregations.nodes_high_heap.buckets}}- Node {{key}}: {{avg_heap.value}}%\n{{/ctx.payload.aggregations.nodes_high_heap.buckets}}"
        }
      },
      "throttle_period": "15m"
    },
    "log_to_index": {
      "index": {
        "index": "watcher-alerts",
        "doc_id": "{{ctx.watch_id}}-{{ctx.execution_time}}"
      }
    }
  }
}
```

**Tester la watch**:
```bash
POST _watcher/watch/heap_usage_alert/_execute
```

---

# Kibana Rules: Alerting Simplifié

Les [Kibana Rules](https://www.elastic.co/guide/en/kibana/current/alerting-getting-started.html) offrent une interface graphique pour créer des alertes.

**Accès**: Kibana → Stack Management → Rules and Connectors

**Rule types disponibles**:

| Rule Type | Usage | Exemple |
|-----------|-------|---------|
| **Elasticsearch query** | Alerte basée sur requête ES | Nombre d'erreurs >100 |
| **Index threshold** | Seuil sur agrégation | Moyenne heap >85% |
| **ES query** | Requête ES avec condition | Documents manquants |
| **Metrics threshold** | Seuils sur métriques APM/infra | CPU >80% |

---

# Kibana Rules: Alerting Simplifié

**Workflow de création**:
1. **Define rule**: Nom, type, query/condition
2. **Add connector**: Slack, email, PagerDuty, webhook
3. **Configure action**: Message template, variables
4. **Set schedule**: Interval d'évaluation (1m, 5m, etc.)
5. **Save and enable**: Activer la rule

**Avantages vs Watcher**:
- ✅ Interface graphique (pas de JSON)
- ✅ Intégration native avec Kibana visualizations
- ✅ Gestion centralisée des connectors (réutilisables)
- ⚠️ Moins flexible que Watcher pour logique complexe

---

# Connectors: Intégrations Externes

Les [Connectors](https://www.elastic.co/guide/en/kibana/current/action-types.html) permettent d'envoyer des notifications vers des systèmes externes.

**Connectors populaires**:

**1. Slack**:
```
- Type: Webhook
- URL: https://hooks.slack.com/services/YOUR/WEBHOOK
- Message: Utilise Markdown Slack
```

**2. Email (SMTP)**:
```
- Host: smtp.gmail.com
- Port: 587
- Username/Password: Credentials SMTP
- From: alerts@company.com
```

**3. PagerDuty**:
```
- Integration Key: Clé API PagerDuty
- Severity: critical, error, warning, info
```

**4. Webhook (générique)**:
```
- URL: API externe
- Method: POST, PUT, etc.
- Headers: Authorization, Content-Type
- Body: JSON payload
```

**5. Index** (Elasticsearch):
```
- Index: alerts-history-*
- Document: JSON avec détails alerte
```

**Configuration**: Stack Management → Rules and Connectors → Connectors → Create connector

**Best practice**: Créez un connector par type de notification (1 pour Slack prod, 1 pour Slack dev, etc.)

---

# Kibana Stack Monitoring Alerts

Kibana propose des [alertes prédéfinies pour Stack Monitoring](https://www.elastic.co/guide/en/kibana/current/kibana-alerts.html).

**Alertes disponibles** (prêtes à l'emploi):

| Alerte | Condition | Criticité |
|--------|-----------|-----------|
| **Cluster health** | Status = yellow ou red | Critique |
| **Node disk usage** | Disk >80% | Warning |
| **CPU usage** | CPU >95% pour 5min | Warning |
| **Memory usage (JVM)** | Heap >85% pour 5min | Critique |
| **Missing monitoring data** | Pas de données >15min | Warning |
| **License expiration** | License expire <30j | Warning |
| **Large shard size** | Shard >50GB | Info |

**Activation**:
1. Stack Management → Rules and Connectors
2. Cliquez sur "Create rule"
3. Sélectionnez "Elasticsearch health" ou autre rule type
4. Configurez les seuils et connector
5. Save and enable

**Alert history**: Kibana → Stack Monitoring → Alerts

**Visualisation**:
- 🔴 Alertes actives (currently firing)
- 🟢 Alertes récupérées (recovered)
- ⚪ Alertes en erreur (execution error)

---

# Gestion du Cycle de Vie des Alertes

**États d'une alerte**:
1. **Active** (firing): Condition remplie, actions déclenchées
2. **OK** (recovered): Condition revenue à la normale
3. **Pending**: En cours d'évaluation
4. **Error**: Erreur d'exécution (query invalide, connector indisponible)

**Historique des alertes**:
```bash
GET .watcher-history-*/_search
{
  "query": {
    "match": {
      "watch_id": "heap_usage_alert"
    }
  },
  "sort": [{ "@timestamp": "desc" }],
  "size": 100
}
```

**Désactiver temporairement**:
```bash
PUT _watcher/watch/heap_usage_alert/_deactivate
# Réactiver:
PUT _watcher/watch/heap_usage_alert/_activate
```

---

# Gestion du Cycle de Vie des Alertes

**Supprimer une watch**:
```bash
DELETE _watcher/watch/heap_usage_alert
```

**Monitoring des watches**:
```bash
GET _watcher/stats
{
  "watcher_state": "started",
  "watch_count": 10,
  "execution_thread_pool": {
    "queue_size": 0,
    "max_size": 1000
  }
}
```

---

# Best Practices d'Alerting

**1. Éviter l'Alert Fatigue**:
- ⚠️ Trop d'alertes → équipe les ignore
- ✅ Alertez uniquement sur les métriques critiques
- ✅ Utilisez throttling (15-30min minimum)
- ✅ Groupez les alertes similaires

**2. Actionnable**:
- ❌ "Cluster unhealthy" (trop vague)
- ✅ "Heap >85% on node-1, consider scaling or optimizing queries"

**3. Contexte**:
- ✅ Incluez des liens vers dashboards Kibana
- ✅ Incluez des commandes de diagnostic
- ✅ Incluez l'historique (trend)

**4. Escalation**:
```
1. Warning (>75%) → Log + Slack
2. Critical (>85%) → Email ops + PagerDuty
3. Emergency (>95%) → PagerDuty + Appel téléphonique
```

**5. Testing**:
- ✅ Testez chaque alerte avec `_execute`
- ✅ Validez que les connectors fonctionnent
- ✅ Vérifiez les templates de message

**6. Documentation**:
- ✅ Playbook pour chaque alerte (que faire quand elle se déclenche)
- ✅ Fréquence attendue (si alerte fréquente = normal ou problème)

---

# Résumé

## Points Clés

- Les **systèmes d'alerting** (Watcher et Kibana Rules) permettent la surveillance proactive du cluster
- Une **watch Watcher** se compose de: trigger, input, condition, transform, actions
- Les **Kibana Rules** offrent une interface graphique pour des alertes simples
- Les **connectors** (Slack, email, PagerDuty, webhook) permettent des notifications externes
- Les **Stack Monitoring alerts** fournissent des alertes prédéfinies pour Elasticsearch
- **Best practices**: éviter alert fatigue, rendre les alertes actionnables, documenter les playbooks

## Formules et Exemples

**Trigger cron**: `"0 0 12 * * ?"` = Tous les jours à midi
**Condition seuil**: `"ctx.payload.hits.total": {"gte": 100}` = Si ≥100 résultats
**Throttling**: `"throttle_period": "15m"` = Max 1 alerte/15min
**Context variable**: `{{ctx.payload.aggregations.avg_heap.value}}` = Valeur agrégation

---

# Exercices Pratiques

Passez maintenant au **cahier d'exercices** pour mettre en pratique ces concepts.

**Labs à réaliser**:
- Lab 5.1: Création d'une alerte simple (cluster health)
- Lab 5.2: Configuration des actions d'alerte (webhook, index)
- Bonus 5.A: Alerte Watcher avancée avec agrégations complexes

Temps estimé: **45-60 minutes**

**Ces exercices couvrent**:
- Création de Kibana Rules avec interface graphique
- Configuration de connectors (Slack, webhook)
- Création de Watcher avec JSON
- Test et validation des alertes
