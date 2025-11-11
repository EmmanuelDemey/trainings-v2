## 🌟 Bonus 4.A: Création de Dashboards Kibana pour Monitoring

**Niveau**: Avancé
**Durée Estimée**: 30-40 minutes
**Prérequis**: Kibana installé et accessible, Stack Monitoring activé

### Objectif

Créer un dashboard Kibana personnalisé pour surveiller les KPIs clés du cluster (cluster health, heap usage, indexing rate, search latency) avec des visualisations en temps réel.

### Contexte

L'équipe DevOps souhaite un dashboard centralisé pour surveiller le cluster Elasticsearch sans avoir à exécuter manuellement des requêtes API. Vous allez créer un dashboard Kibana avec les métriques essentielles.

### Challenge

**Partie 1**: Activer Monitoring (si pas déjà fait)

Activez la collecte de métriques:

```bash
PUT /_cluster/settings
{
  "persistent": {
    "xpack.monitoring.collection.enabled": true
  }
}
```

Vérifiez dans Kibana: **Stack Monitoring** → **Overview** devrait afficher les métriques.

**Partie 2**: Créer des visualisations dans Kibana

1. **Cluster Health Gauge** (statut vert/jaune/rouge)
   - Type: **Gauge**
   - Index pattern: `.monitoring-es-*`
   - Metric: `cluster_stats.status` (field mapping)
   - Color ranges: Green (0-1), Yellow (1-2), Red (2-3)

2. **Heap Usage Line Chart** (évolution temporelle)
   - Type: **Line**
   - Index pattern: `.monitoring-es-*`
   - X-axis: `@timestamp` (Date Histogram, interval: 1 minute)
   - Y-axis: `node_stats.jvm.mem.heap_used_percent` (Average)
   - Threshold line: 85% (critical)

3. **Indexing Rate Area Chart**
   - Type: **Area**
   - Index pattern: `.monitoring-es-*`
   - X-axis: `@timestamp`
   - Y-axis: `node_stats.indices.indexing.index_total` (Derivative → docs/sec)

4. **Search Latency Bar Chart**
   - Type: **Vertical Bar**
   - Index pattern: `.monitoring-es-*`
   - X-axis: `node_stats.name` (Terms, size: 10)
   - Y-axis: `node_stats.indices.search.query_time_in_millis / node_stats.indices.search.query_total` (Scripted field)

5. **Disk Usage Metric**
   - Type: **Metric**
   - Index pattern: `.monitoring-es-*`
   - Metric: `(node_stats.fs.total.total_in_bytes - node_stats.fs.total.available_in_bytes) / node_stats.fs.total.total_in_bytes * 100` (Scripted)
   - Format: Percentage

**Partie 3**: Assembler le dashboard

1. Créez un nouveau dashboard: **Kibana → Dashboard → Create new dashboard**
2. Ajoutez toutes les visualisations créées
3. Organisez en grid:
   ```
   +-------------------+-------------------+
   | Cluster Health    | Heap Usage        |
   | (Gauge)           | (Line Chart)      |
   +-------------------+-------------------+
   | Indexing Rate     | Search Latency    |
   | (Area Chart)      | (Bar Chart)       |
   +-------------------+-------------------+
   | Disk Usage        | Thread Pool       |
   | (Metric)          | Rejections (Table)|
   +-------------------+-------------------+
   ```

**Partie 4**: Configurer les alertes (Watcher)

Créez une alerte pour heap >85%:

```bash
PUT _watcher/watch/heap_alert
{
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
                {
                  "range": {
                    "@timestamp": {
                      "gte": "now-2m"
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
            "nodes": {
              "terms": {
                "field": "node_stats.node_id"
              },
              "aggs": {
                "avg_heap": {
                  "avg": {
                    "field": "node_stats.jvm.mem.heap_used_percent"
                  }
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
    "log_action": {
      "logging": {
        "text": "Heap usage above 85% on nodes: {{ctx.payload.aggregations.nodes.buckets}}"
      }
    }
  }
}
```

**Partie 5**: Configurer le refresh automatique

Dans le dashboard Kibana:
- Cliquez sur l'horloge (en haut à droite)
- Sélectionnez "Auto refresh: 10 seconds"
- Time range: "Last 15 minutes"

### Validation

**Checklist dashboard complet**:

- [ ] Cluster health gauge (vert/jaune/rouge)
- [ ] Heap usage line chart avec threshold 85%
- [ ] Indexing rate area chart (docs/sec)
- [ ] Search latency bar chart par nœud
- [ ] Disk usage metric avec %
- [ ] Thread pool rejections table
- [ ] Auto-refresh configuré (10s)
- [ ] Time picker sur "Last 15 minutes"

**Questions à répondre**:

1. **Pourquoi utiliser `.monitoring-es-*` comme index pattern ?**
   - Elasticsearch stocke les métriques de monitoring dans ces index
   - Pattern avec wildcard pour inclure tous les index de monitoring (par jour)

2. **Comment calculer le taux (rate) à partir d'un compteur cumulatif ?**
   - Utiliser l'agrégation **Derivative** dans Kibana
   - Exemple: `indexing.index_total` (compteur) → Derivative → docs/sec (taux)

3. **Quelle est la différence entre Average et Sum pour les métriques ?**
   - **Average**: Moyenne sur tous les nœuds (ex: heap moyen du cluster)
   - **Sum**: Total cumulé (ex: nombre total de documents indexés)

**Critère de succès**: 
- Dashboard fonctionnel avec au moins 5 visualisations
- Métriques en temps réel (auto-refresh)
- Capable d'identifier un problème visuellement (heap spike, rejections)

---


---

