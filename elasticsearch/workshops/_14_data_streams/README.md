# TP 14 — Data Streams Modernes: LogsDB, Lifecycle, Failure Store et TSDS

> Stocker des logs et des métriques comme le fait Elastic Agent: des data streams en mode LogsDB et time series, une rétention gérée par le data stream lifecycle, et un failure store pour ne plus perdre les documents rejetés.

**Niveau**: Avancé
**Topic**: Rétention et stockage - Data Streams

## Contexte

Une application de e-commerce envoie ses logs et ses métriques dans Elasticsearch. L'équipe veut réduire la facture de stockage, garder les logs 7 jours sans maintenir de policy ILM, et ne plus perdre silencieusement les documents mal formés.

## Setup

Ce TP est autonome. Vérifiez que le cluster répond:

```bash
GET /_cluster/health
```

## Partie A: Un data stream de logs en mode LogsDB

### Étape 1: Le template intégré

Elasticsearch fournit déjà un template pour `logs-*-*`, utilisé par Elastic Agent:

```bash
GET /_index_template/logs
```

**Résultat attendu** (extrait):
```json
{
  "index_templates": [
    {
      "name": "logs",
      "index_template": {
        "index_patterns": ["logs-*-*"],
        "priority": 100,
        "data_stream": {}
      }
    }
  ]
}
```

La convention de nommage est `<type>-<dataset>-<namespace>`: `logs-shop-production`, `logs-shop-staging`… Ne créez jamais de template `logs-*`: il masquerait celui-ci pour toutes les sources de logs.

### Étape 2: Votre template

Créez un template pour les logs de la boutique, plus prioritaire que le template intégré sur `logs-shop-*`:

```bash
PUT /_index_template/logs-shop-template
{
  "index_patterns": ["logs-shop-*"],
  "data_stream": {},
  "priority": 200,
  "template": {
    "settings": {
      "index.mode": "logsdb",
      "number_of_replicas": 0
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "host.name": { "type": "keyword" },
        "message": { "type": "match_only_text" },
        "http.status": { "type": "integer" }
      }
    },
    "lifecycle": { "data_retention": "7d" },
    "data_stream_options": {
      "failure_store": { "enabled": true }
    }
  }
}
```

**Points clés**:
- `index.mode: logsdb`: documents triés par `host.name` puis `@timestamp`, `_source` synthétique, compression ZSTD — environ 65% de stockage en moins. C'est le défaut pour `logs-*-*` depuis la 9.0.
- `match_only_text`: un `text` sans positions ni scoring, idéal pour les messages de logs
- `lifecycle`: le **data stream lifecycle** gère rollover et suppression à partir d'une simple rétention
- `failure_store`: les documents rejetés sont conservés à part (partie C)

### Étape 3: Indexer des logs

Le data stream est créé au premier document:

```bash
POST /logs-shop-production/_bulk?refresh=true
{"create":{}}
{"@timestamp":"2026-10-08T10:00:00Z","host.name":"web-1","message":"GET /home 200","http.status":200}
{"create":{}}
{"@timestamp":"2026-10-08T10:01:00Z","host.name":"web-2","message":"POST /cart 500","http.status":500}
{"create":{}}
{"@timestamp":"2026-10-08T10:02:00Z","host.name":"web-1","message":"GET /product/42 200","http.status":200}
```

Un data stream n'accepte que des **créations** (`create`, pas `index` avec un `_id` existant).

```bash
GET /_data_stream/logs-shop-production
```

**Résultat attendu** (extrait):
```json
{
  "data_streams": [
    {
      "name": "logs-shop-production",
      "template": "logs-shop-template",
      "index_mode": "logsdb",
      "lifecycle": { "enabled": true, "data_retention": "7d" },
      "failure_store": { "enabled": true }
    }
  ]
}
```

### Étape 4: Le _source synthétique

En LogsDB, le `_source` n'est pas stocké: il est **reconstruit** à partir des doc values. Indexez un document avec une valeur invalide:

```bash
POST /logs-shop-production/_doc?refresh=true
{ "@timestamp": "2026-10-08T10:03:00Z", "host.name": "web-3", "message": "GET /status", "http.status": "oops" }
```

```bash
POST /logs-shop-production/_search
{
  "query": { "term": { "host.name": "web-3" } }
}
```

**Résultat attendu** (extrait):
```json
{
  "hits": {
    "hits": [
      {
        "_ignored": ["http.status"],
        "_source": {
          "host": { "name": "web-3" },
          "http": { "status": "oops" }
        }
      }
    ]
  }
}
```

**Questions**:
- Pourquoi `host.name` est-il devenu un objet `host: { name }` ? (Le `_source` est reconstruit: équivalent, pas identique.)
- Pourquoi le document a-t-il été accepté malgré `"oops"` ? (LogsDB active `ignore_malformed`: la valeur est gardée mais pas indexée, et listée dans `_ignored`.)

## Partie B: Le data stream lifecycle

### Étape 5: Consulter et modifier la rétention

```bash
GET /_data_stream/logs-shop-production/_lifecycle
```

L'équipe sécurité demande 30 jours. Modifiez la rétention du data stream existant, sans toucher au template:

```bash
PUT /_data_stream/logs-shop-production/_lifecycle
{ "data_retention": "30d" }
```

```bash
GET /logs-shop-production/_lifecycle/explain
```

**Questions**:
- Quelle différence avec ILM ? (Le lifecycle ne connaît qu'une rétention, et éventuellement un downsampling: pas de tiers hot/warm/cold, pas de searchable snapshots. ILM reste l'outil pour une architecture multi-tiers.)
- Que se passera-t-il pour les prochains data streams `logs-shop-*` ? (Ils prendront la rétention du template: 7 jours.)

## Partie C: Le failure store

### Étape 6: Un document rejeté

Un document sans `@timestamp` ne peut pas entrer dans un data stream. Sans failure store, il serait perdu (et le client recevrait une erreur qu'il ignore souvent):

```bash
POST /logs-shop-production/_doc
{ "host.name": "web-2", "message": "log sans horodatage" }
```

**Résultat attendu** (extrait):
```json
{
  "result": "created",
  "failure_store": "used"
}
```

### Étape 7: Lire les échecs

Le sélecteur `::failures` donne accès au failure store, comme à un index:

```bash
POST /logs-shop-production::failures/_refresh
```

```bash
POST /logs-shop-production::failures/_search
{
  "_source": ["error.type", "error.message", "document.source"]
}
```

**Résultat attendu** (extrait):
```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [
      {
        "_source": {
          "error": { "type": "document_parsing_exception" },
          "document": { "source": { "host.name": "web-2" } }
        }
      }
    ]
  }
}
```

Et en ES|QL, pour un tableau de bord des échecs:

```bash
POST /_query?format=json
{
  "query": """
    FROM logs-shop-production::failures
    | STATS failures = COUNT(*) BY error.type
  """
}
```

**Résultat attendu**:
```json
{
  "values": [ [ 1, "document_parsing_exception" ] ]
}
```

## Partie D: Un time series data stream (TSDS) pour les métriques

### Étape 8: Horodater à l'ingestion

Un TSDS n'accepte que les points proches de « maintenant » (par défaut, de 2 heures avant à 30 minutes après). Elastic Agent horodate ses métriques; ici, un pipeline d'ingestion pose `@timestamp` à l'heure de réception:

```bash
PUT /_ingest/pipeline/metrics-shop-timestamp
{
  "processors": [
    { "set": { "field": "@timestamp", "value": "{{{_ingest.timestamp}}}", "override": false } }
  ]
}
```

### Étape 9: Le template time series

```bash
PUT /_index_template/metrics-shop-template
{
  "index_patterns": ["metrics-shop-*"],
  "data_stream": {},
  "priority": 200,
  "template": {
    "settings": {
      "index.mode": "time_series",
      "index.default_pipeline": "metrics-shop-timestamp",
      "number_of_replicas": 0
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "host.name": { "type": "keyword", "time_series_dimension": true },
        "cpu.pct": { "type": "double", "time_series_metric": "gauge" },
        "http.requests": { "type": "long", "time_series_metric": "counter" }
      }
    },
    "lifecycle": {
      "data_retention": "90d",
      "downsampling": [
        { "after": "1d", "fixed_interval": "1h" },
        { "after": "7d", "fixed_interval": "1d" }
      ]
    }
  }
}
```

**Points clés**:
- `time_series_dimension`: ce qui identifie une série (ici, la machine)
- `time_series_metric`: `gauge` (une valeur qui monte et descend) ou `counter` (un compteur qui ne fait que croître)
- `downsampling`: après 1 jour, un point par heure et par série; après 7 jours, un point par jour

### Étape 10: Envoyer des métriques

```bash
POST /metrics-shop-production/_bulk?refresh=true
{"create":{}}
{"host.name":"web-1","cpu.pct":0.42,"http.requests":1000}
{"create":{}}
{"host.name":"web-2","cpu.pct":0.87,"http.requests":2500}
```

```bash
GET /_data_stream/metrics-shop-production
```

**Résultat attendu** (extrait):
```json
{
  "data_streams": [
    { "name": "metrics-shop-production", "index_mode": "time_series" }
  ]
}
```

Regardez `time_series.temporal_ranges`: la plage de temps acceptée par la backing index courante.

### Étape 11: Interroger les séries

La commande source `TS` d'ES|QL lit un time series data stream:

```bash
POST /_query?format=json
{
  "query": """
    TS metrics-shop-production
    | STATS max_cpu = MAX(cpu.pct) BY host.name
    | SORT host.name
  """
}
```

**Résultat attendu**:
```json
{
  "values": [
    [ 0.42, "web-1" ],
    [ 0.87, "web-2" ]
  ]
}
```

**Question**: indexez de nouveau un point pour `web-1` avec un `@timestamp` d'il y a 3 jours. Que se passe-t-il ? (Il est hors des bornes du TSDS: rejeté avec `timestamp_error`. La réponse indique `"failure_store": "not_enabled"`: activez le failure store dans ce template aussi pour le conserver.)

## Critères de Succès

- Nommer un data stream selon la convention `<type>-<dataset>-<namespace>` sans masquer les templates intégrés
- Activer LogsDB et comprendre le `_source` synthétique
- Gérer une rétention avec le data stream lifecycle
- Activer le failure store et lire les échecs avec `::failures`
- Créer un TSDS avec dimensions, metrics et downsampling, et l'interroger avec `TS`

## Dépannage

**Problème**: Le data stream n'a pas les réglages attendus (mode, rétention…)
→ Un autre template l'a peut-être emporté. Vérifiez lequel s'applique, et le résultat de la fusion: `POST /_index_template/_simulate_index/logs-shop-production`. Le template de plus haute priorité gagne (200 > 100 pour le template intégré `logs`).

**Problème**: `the document timestamp [...] is outside of ranges of currently writable indices`
→ Le point est trop ancien (ou trop dans le futur) pour le TSDS: c'est voulu, un TSDS n'accepte que des données récentes.

**Problème**: Le failure store reste vide
→ Il ne s'applique qu'aux data streams créés après l'activation dans le template. Pour un data stream existant: `PUT /_data_stream/<nom>/_options { "failure_store": { "enabled": true } }`.
