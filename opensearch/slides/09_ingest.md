---
layout: cover
---

# 9 - Ingest pipelines

---

# Objectifs pédagogiques

À la fin de cette séquence (**~30 min**, TP compris), vous saurez :

- **Expliquer** où s'exécute un ingest pipeline, et quand l'utiliser
- **Enchaîner** des processeurs : `grok`, `date`, `set`, `rename`, `remove`, `convert`
- **Tester** un pipeline avec `_simulate`, sans rien indexer
- **Gérer** les erreurs, et **brancher** le pipeline sur un index

---

# Transformer avant d'indexer

```text
 application ──► nœud ingest ──► [ grok → date → set → remove ] ──► shard primaire
                                       ingest pipeline
```

- Une suite de **processeurs** qui modifient le document **avant** l'indexation
- Exécuté par les nœuds de rôle `ingest` — tous, par défaut
- Pour : extraire des champs d'un log, normaliser, enrichir, nettoyer

| Où transformer ? | Quand |
|---|---|
| **Ingest pipeline** | Transformations simples, au plus près du cluster |
| **Data Prepper**, Logstash, Fluent Bit | Volumes importants, sources multiples, buffers, routage |
| **L'application** | Logique métier |

---

# Créer un pipeline

```json
PUT /_ingest/pipeline/restaurants-clean
{
  "description": "Normalise les restaurants avant indexation",
  "processors": [
    { "trim":      { "field": "name" } },
    { "uppercase": { "field": "city_code" } },
    { "convert":   { "field": "price", "type": "integer" } },
    { "set":       { "field": "indexed_at", "value": "{{_ingest.timestamp}}" } },
    { "remove":    { "field": "internal_note", "ignore_missing": true } }
  ]
}
```

- Les processeurs s'exécutent **dans l'ordre**
- `{{…}}` : un modèle Mustache — un autre champ, ou une méta-donnée `_ingest`

---

# Tester : `_simulate`

```json
POST /_ingest/pipeline/restaurants-clean/_simulate
{
  "docs": [
    { "_source": { "name": "  Chez Paul ", "city_code": "lyo", "price": "27", "internal_note": "à revoir" } }
  ]
}
```

**Résultat attendu** :

```json
{
  "docs": [
    { "doc": { "_source": { "name": "Chez Paul", "city_code": "LYO", "price": 27 } } }
  ]
}
```

- `?verbose=true` : l'état du document **après chaque** processeur
- Sans pipeline enregistré : `POST /_ingest/pipeline/_simulate` avec `"pipeline": { … }`

---

# Les processeurs utiles

| Processeur | Effet |
|---|---|
| `set`, `remove`, `rename`, `copy` | Écrire, supprimer, renommer un champ |
| `convert`, `lowercase`, `uppercase`, `trim` | Typer, normaliser |
| `grok`, `dissect` | Extraire des champs d'un texte (regex nommées / séparateurs) |
| `date` | Lire une date dans un format donné → `@timestamp` |
| `split`, `join`, `csv`, `json`, `kv` | Découper ou parser un texte structuré |
| `geoip`, `user_agent` | Enrichir une IP, un navigateur |
| `script` | Painless, quand rien d'autre ne suffit |
| `pipeline` | Appeler un autre pipeline |
| `drop`, `fail` | Ignorer le document, ou le rejeter |

---

# Parser un log : `grok` et `date`

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      { "grok": { "field": "message", "patterns": ["%{IP:client_ip} %{WORD:method} %{URIPATHPARAM:path} %{NUMBER:status:int}"] } },
      { "date": { "field": "ts", "formats": ["dd/MM/yyyy HH:mm:ss"], "target_field": "@timestamp" } },
      { "remove": { "field": ["ts", "message"] } }
    ]
  },
  "docs": [ { "_source": { "message": "203.0.113.5 GET /menu 200", "ts": "27/10/2026 12:30:00" } } ]
}
```

**Résultat attendu** :

```json
{
  "docs": [
    { "doc": { "_source": { "client_ip": "203.0.113.5", "method": "GET", "path": "/menu", "status": 200, "@timestamp": "2026-10-27T12:30:00.000Z" } } }
  ]
}
```

---

# Conditions et erreurs

Tout processeur accepte un `if` (Painless) et un `on_failure` :

```json
PUT /_ingest/pipeline/price-range
{
  "processors": [
    { "set": { "field": "range", "value": "budget", "if": "ctx.price != null && ctx.price < 20" } },
    { "set": { "field": "range", "value": "premium", "if": "ctx.price != null && ctx.price >= 50" } },
    { "convert": { "field": "rating", "type": "float", "ignore_missing": true } }
  ],
  "on_failure": [
    { "set": { "field": "ingest_error", "value": "{{ _ingest.on_failure_message }}" } }
  ]
}
```

- Sans `on_failure`, une erreur **rejette** le document
- Avec, il est indexé **marqué** : on le retrouve, on le corrige

---

# Brancher le pipeline

Sur une requête :

```json
PUT /prices/_doc/1?pipeline=price-range
{ "name": "Chez Paul", "price": 15 }
```

Ou par défaut, pour **toutes** les écritures d'un index :

```json
PUT /prices/_settings
{ "index.default_pipeline": "price-range" }

PUT /prices/_doc/2
{ "name": "L'Étoile du Nord", "price": 125, "rating": "4.9" }

GET /prices/_doc/2
```

**Résultat attendu** :

```json
{ "_source": { "range": "premium", "rating": 4.9 } }
```

- `index.final_pipeline` : s'exécute **après**, toujours — même si la requête en nomme un autre

---

# En pratique

## TP 7 - Ingest pipelines
