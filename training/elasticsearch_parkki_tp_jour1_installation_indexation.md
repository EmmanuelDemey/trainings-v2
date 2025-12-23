# Cahier d'Exercices Pratiques - Elasticsearch Parkki
## Jour 1 - Installation, Configuration et Indexation

Formation personnalisée pour Parkki

---

# Lab 1.1: Démarrage et Vérification du Cluster

**Topic**: Installation et Configuration
**Durée**: 15 minutes

## Objectif

Démarrer un cluster Elasticsearch et vérifier son bon fonctionnement.

## Exercice

### Étape 1: Démarrer Elasticsearch avec Docker

```bash
docker network create elastic

docker run -d \
  --name elasticsearch \
  --net elastic \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "ES_JAVA_OPTS=-Xms2g -Xmx2g" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

### Étape 2: Vérifier l'accès au cluster

```bash
GET /
```

**Résultat attendu**: Informations du cluster avec `"tagline": "You Know, for Search"`

### Étape 3: Vérifier la santé du cluster

```bash
GET /_cluster/health
```

**Résultat attendu**: `"status": "green"` ou `"yellow"`

### Étape 4: Démarrer Kibana

```bash
docker run -d \
  --name kibana \
  --net elastic \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  docker.elastic.co/kibana/kibana:8.11.0
```

Accédez à http://localhost:5601 → Dev Tools

### Validation

```bash
GET /_cat/nodes?v
```

✅ 1 nœud affiché avec ses métriques

---

# Lab 1.2: Inspection du Cluster avec les _cat APIs

**Topic**: Installation et Configuration
**Durée**: 15 minutes

## Objectif

Maîtriser les commandes de diagnostic essentielles.

## Exercice

### Étape 1: Lister les nœuds

```bash
GET /_cat/nodes?v
```

### Étape 2: Voir les rôles du nœud

```bash
GET /_cat/nodes?v&h=name,node.role,heap.percent,ram.percent,cpu
```

### Étape 3: Lister les indices

```bash
GET /_cat/indices?v
```

### Étape 4: Vérifier l'utilisation disque

```bash
GET /_cat/allocation?v
```

### Étape 5: Voir les shards

```bash
GET /_cat/shards?v
```

### Validation

✅ Capable d'utiliser les _cat APIs pour diagnostiquer le cluster

---

# Lab 1.3: Configuration via elasticsearch.yml

**Topic**: Installation et Configuration
**Durée**: 10 minutes

## Objectif

Comprendre les paramètres de configuration principaux.

## Exercice

### Étape 1: Voir la configuration actuelle

```bash
GET /_nodes/settings?filter_path=nodes.*.settings.cluster,nodes.*.settings.node
```

### Étape 2: Paramètres importants à connaître

| Paramètre | Description |
|-----------|-------------|
| `cluster.name` | Nom du cluster |
| `node.name` | Nom du nœud |
| `node.roles` | Rôles du nœud (master, data, ingest...) |
| `network.host` | Adresse d'écoute |
| `discovery.seed_hosts` | Liste des nœuds pour la découverte |

### Étape 3: Voir les settings modifiables dynamiquement

```bash
GET /_cluster/settings?include_defaults=true&flat_settings=true
```

### Validation

✅ Comprendre où se trouvent les paramètres de configuration

---

# Lab 2.1: Opérations CRUD sur les Documents

**Topic**: Indexation et Gestion des Documents
**Durée**: 20 minutes

## Objectif

Maîtriser les opérations de base : Create, Read, Update, Delete.

## Exercice

### Setup: Créer un index de test

```bash
PUT /logs-test
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
```

### Étape 1: Créer un document (POST - ID auto)

```bash
POST /logs-test/_doc
{
  "@timestamp": "2025-01-15T10:30:00.000Z",
  "level": "INFO",
  "service": "parkki-api",
  "message": "User login successful",
  "user_id": "user_12345"
}
```

### Étape 2: Créer un document avec ID spécifique (PUT)

```bash
PUT /logs-test/_doc/log-001
{
  "@timestamp": "2025-01-15T10:31:00.000Z",
  "level": "ERROR",
  "service": "parkki-api",
  "message": "Database connection timeout",
  "response_time_ms": 5000
}
```

### Étape 3: Lire un document (GET)

```bash
GET /logs-test/_doc/log-001
```

### Étape 4: Mettre à jour un document

```bash
POST /logs-test/_update/log-001
{
  "doc": {
    "resolved": true,
    "resolved_by": "ops-team"
  }
}
```

**Vérification**:
```bash
GET /logs-test/_doc/log-001
```

### Étape 5: Supprimer un document

```bash
DELETE /logs-test/_doc/log-001
```

**Vérification** (retourne `"found": false`):
```bash
GET /logs-test/_doc/log-001
```

### Validation

```bash
GET /logs-test/_count
```

✅ Capable de créer, lire, modifier et supprimer des documents

---

# Lab 2.2: Bulk API - Indexation en Masse

**Topic**: Indexation et Gestion des Documents
**Durée**: 20 minutes

## Objectif

Indexer efficacement de grandes quantités de documents.

## Contexte Parkki

Avec 15M logs/jour, la Bulk API est essentielle pour les performances.

## Exercice

### Étape 1: Indexation bulk basique

```bash
POST /_bulk
{"index":{"_index":"logs-test"}}
{"@timestamp":"2025-01-15T11:00:00.000Z","level":"INFO","service":"parkki-api","message":"Request received"}
{"index":{"_index":"logs-test"}}
{"@timestamp":"2025-01-15T11:00:01.000Z","level":"INFO","service":"parkki-api","message":"Request processed"}
{"index":{"_index":"logs-test"}}
{"@timestamp":"2025-01-15T11:00:02.000Z","level":"WARN","service":"parkki-api","message":"Slow query detected"}
{"index":{"_index":"logs-test"}}
{"@timestamp":"2025-01-15T11:00:03.000Z","level":"ERROR","service":"parkki-api","message":"Connection refused"}
```

**Important**: Chaque ligne JSON sur une seule ligne.

### Étape 2: Vérifier le résultat

```bash
GET /logs-test/_count
```

### Étape 3: Bulk avec différentes opérations

```bash
POST /_bulk
{"index":{"_index":"logs-test","_id":"bulk-001"}}
{"@timestamp":"2025-01-15T12:00:00.000Z","level":"INFO","message":"Index operation"}
{"create":{"_index":"logs-test","_id":"bulk-002"}}
{"@timestamp":"2025-01-15T12:00:01.000Z","level":"INFO","message":"Create operation"}
{"update":{"_index":"logs-test","_id":"bulk-001"}}
{"doc":{"updated":true}}
{"delete":{"_index":"logs-test","_id":"bulk-002"}}
```

**Opérations**:
- `index`: Crée ou remplace
- `create`: Crée uniquement (erreur si existe)
- `update`: Met à jour partiellement
- `delete`: Supprime

### Étape 4: Analyser une erreur partielle

```bash
POST /_bulk
{"index":{"_index":"logs-test"}}
{"@timestamp":"invalid-date","level":"INFO"}
{"index":{"_index":"logs-test"}}
{"@timestamp":"2025-01-15T14:00:00.000Z","level":"INFO","message":"Valid log"}
```

**Observer**: `"errors": true` mais le 2ème document est quand même indexé.

### Bonnes pratiques Bulk

| Paramètre | Recommandation |
|-----------|----------------|
| Taille batch | 5-15 MB |
| Nombre de docs | 1000-5000 par batch |

### Validation

```bash
GET /logs-test/_search
{
  "query": { "match_all": {} },
  "size": 20
}
```

✅ Documents indexés en masse avec succès

---

# Lab 2.3: Gestion des Index

**Topic**: Indexation et Gestion des Documents
**Durée**: 15 minutes

## Objectif

Créer et gérer des index avec les bons settings.

## Exercice

### Étape 1: Créer un index avec settings

```bash
PUT /logs-parkki-2025.01.15
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "refresh_interval": "30s"
  }
}
```

**Explication**:
- `number_of_shards`: Nombre de partitions (non modifiable après)
- `number_of_replicas`: Copies pour la haute dispo
- `refresh_interval`: Fréquence de visibilité des nouveaux docs

### Étape 2: Vérifier les settings

```bash
GET /logs-parkki-2025.01.15/_settings
```

### Étape 3: Modifier les settings

```bash
PUT /logs-parkki-2025.01.15/_settings
{
  "index": {
    "refresh_interval": "60s",
    "number_of_replicas": 1
  }
}
```

**Note**: `number_of_shards` ne peut PAS être modifié !

### Étape 4: Vérifier les shards

```bash
GET /_cat/shards/logs-parkki-2025.01.15?v
```

### Étape 5: Comprendre le cluster status

```bash
GET /_cluster/health
```

| Status | Signification |
|--------|---------------|
| `green` | Tout OK |
| `yellow` | Replicas manquants |
| `red` | Primaires manquants - URGENT |

### Étape 6: Fermer et rouvrir un index

```bash
# Fermer (libère les ressources)
POST /logs-parkki-2025.01.15/_close

# Vérifier
GET /_cat/indices/logs-parkki-2025.01.15?v

# Rouvrir
POST /logs-parkki-2025.01.15/_open
```

### Étape 7: Supprimer un index

```bash
DELETE /logs-parkki-2025.01.15
```

### Validation

```bash
GET /_cat/indices?v
```

✅ Capable de créer, modifier et supprimer des index

---

# Lab 2.4: Refresh Interval et Performance

**Topic**: Indexation et Gestion des Documents
**Durée**: 10 minutes

## Objectif

Comprendre l'impact du `refresh_interval` sur les performances.

## Contexte Parkki

Un `refresh_interval` trop court (1s par défaut) peut surcharger la JVM avec 15M logs/jour.

## Exercice

### Étape 1: Créer un index avec refresh par défaut (1s)

```bash
PUT /test-refresh-default
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
```

### Étape 2: Indexer et rechercher immédiatement

```bash
POST /test-refresh-default/_doc
{
  "message": "Test document"
}

# Recherche immédiate (peut ne pas trouver le doc)
GET /test-refresh-default/_search
{
  "query": { "match_all": {} }
}
```

### Étape 3: Forcer un refresh manuel

```bash
POST /test-refresh-default/_refresh

GET /test-refresh-default/_search
{
  "query": { "match_all": {} }
}
```

### Étape 4: Créer un index avec refresh optimisé

```bash
PUT /test-refresh-optimized
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "refresh_interval": "30s"
  }
}
```

### Impact pour Parkki

| Refresh Interval | Impact |
|------------------|--------|
| 1s (défaut) | Données visibles vite, mais JVM surchargée |
| 30s | Bon compromis pour les logs |
| -1 | Désactivé (bulk massif uniquement) |

**Recommandation**: `30s` pour vos index de logs.

### Validation

✅ Comprendre l'impact du refresh_interval sur les performances

---

# Lab 3.1: Comprendre le Mapping

**Topic**: Mapping et Schémas
**Durée**: 20 minutes

## Objectif

Comprendre ce qu'est un mapping et comment Elasticsearch le génère automatiquement.

## Contexte Parkki

Un mapping mal configuré est souvent la cause de problèmes JVM et de coûts élevés. Cette partie est CRITIQUE pour votre cas.

## Exercice

### Étape 1: Créer un index sans mapping explicite

```bash
PUT /logs-mapping-test
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
```

### Étape 2: Indexer un document (mapping dynamique)

```bash
POST /logs-mapping-test/_doc
{
  "@timestamp": "2025-01-15T10:30:00.000Z",
  "level": "ERROR",
  "service": "parkki-api",
  "message": "Database connection failed",
  "user_id": "user_12345",
  "response_time_ms": 5000,
  "success": false
}
```

### Étape 3: Voir le mapping généré automatiquement

```bash
GET /logs-mapping-test/_mapping
```

**Observer** : Elasticsearch a deviné les types :
- `@timestamp` → `date`
- `level` → `text` + `keyword` (multi-field)
- `response_time_ms` → `long`
- `success` → `boolean`

### Étape 4: Problème du mapping dynamique

Le mapping dynamique crée des champs `text` par défaut pour les strings. C'est souvent inutile et coûteux !

```bash
GET /logs-mapping-test/_mapping?filter_path=**.level
```

**Résultat** :
```json
{
  "logs-mapping-test": {
    "mappings": {
      "properties": {
        "level": {
          "type": "text",
          "fields": {
            "keyword": { "type": "keyword" }
          }
        }
      }
    }
  }
}
```

**Problème** : `level` n'a pas besoin d'être analysé en full-text !

### Validation

✅ Comprendre que le mapping dynamique peut créer des types inefficaces

---

# Lab 3.2: text vs keyword

**Topic**: Mapping et Schémas
**Durée**: 25 minutes

## Objectif

Comprendre la différence entre `text` et `keyword` et choisir le bon type.

## Contexte Parkki

Utiliser `text` au lieu de `keyword` pour des champs comme `level`, `user_id`, `service` surcharge la JVM inutilement.

## Exercice

### Étape 1: Créer un index avec mapping explicite

```bash
PUT /logs-optimized
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "service": { "type": "keyword" },
      "message": { "type": "text" },
      "user_id": { "type": "keyword" },
      "response_time_ms": { "type": "long" },
      "success": { "type": "boolean" },
      "ip": { "type": "ip" }
    }
  }
}
```

### Étape 2: Indexer des documents

```bash
POST /_bulk
{"index":{"_index":"logs-optimized"}}
{"@timestamp":"2025-01-15T10:00:00.000Z","level":"INFO","service":"parkki-api","message":"User logged in successfully","user_id":"user_001","response_time_ms":45,"success":true,"ip":"192.168.1.100"}
{"index":{"_index":"logs-optimized"}}
{"@timestamp":"2025-01-15T10:01:00.000Z","level":"ERROR","service":"parkki-api","message":"Database connection timeout","user_id":"user_002","response_time_ms":5000,"success":false,"ip":"192.168.1.101"}
{"index":{"_index":"logs-optimized"}}
{"@timestamp":"2025-01-15T10:02:00.000Z","level":"WARN","service":"parkki-worker","message":"Slow query detected in payment module","user_id":"user_001","response_time_ms":1200,"success":true,"ip":"192.168.1.100"}
```

### Étape 3: Recherche sur keyword (exact match)

```bash
GET /logs-optimized/_search
{
  "query": {
    "term": {
      "level": "ERROR"
    }
  }
}
```

### Étape 4: Recherche sur text (full-text)

```bash
GET /logs-optimized/_search
{
  "query": {
    "match": {
      "message": "connection timeout"
    }
  }
}
```

### Étape 5: Aggregation sur keyword

```bash
GET /logs-optimized/_search
{
  "size": 0,
  "aggs": {
    "logs_par_level": {
      "terms": {
        "field": "level"
      }
    }
  }
}
```

### Étape 6: Erreur courante - aggregation sur text

```bash
GET /logs-optimized/_search
{
  "size": 0,
  "aggs": {
    "logs_par_message": {
      "terms": {
        "field": "message"
      }
    }
  }
}
```

**Résultat** : Erreur ! On ne peut pas faire d'aggregation sur un champ `text`.

### Quand utiliser quoi ?

| Type | Utilisation | Exemples |
|------|-------------|----------|
| `keyword` | Valeurs exactes, filtres, aggregations | level, service, user_id, status |
| `text` | Recherche full-text | message, description, body |

### Validation

✅ Savoir choisir entre `text` et `keyword` selon le use case

---

# Lab 3.3: Multi-fields et Propriétés

**Topic**: Mapping et Schémas
**Durée**: 20 minutes

## Objectif

Utiliser les multi-fields et les propriétés de mapping avancées.

## Exercice

### Étape 1: Créer un index avec multi-fields

```bash
PUT /logs-multifield
{
  "mappings": {
    "properties": {
      "message": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "user_agent": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      }
    }
  }
}
```

### Étape 2: Indexer un document

```bash
POST /logs-multifield/_doc
{
  "message": "Connection timeout after 30 seconds",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"
}
```

### Étape 3: Recherche full-text sur message

```bash
GET /logs-multifield/_search
{
  "query": {
    "match": {
      "message": "timeout"
    }
  }
}
```

### Étape 4: Aggregation sur message.keyword

```bash
GET /logs-multifield/_search
{
  "size": 0,
  "aggs": {
    "top_messages": {
      "terms": {
        "field": "message.keyword",
        "size": 10
      }
    }
  }
}
```

### Étape 5: Propriété index:false (économiser de l'espace)

```bash
PUT /logs-no-index
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "raw_payload": {
        "type": "keyword",
        "index": false
      }
    }
  }
}
```

Le champ `raw_payload` est stocké mais pas indexé → économie d'espace.

### Validation

✅ Savoir utiliser les multi-fields pour combiner text et keyword

---

# Lab 3.4: Object vs Nested

**Topic**: Mapping et Schémas
**Durée**: 20 minutes

## Objectif

Comprendre la différence entre `object` et `nested` pour les tableaux d'objets.

## Exercice

### Étape 1: Problème avec object (type par défaut)

```bash
PUT /logs-object
{
  "mappings": {
    "properties": {
      "request": {
        "properties": {
          "headers": {
            "properties": {
              "name": { "type": "keyword" },
              "value": { "type": "keyword" }
            }
          }
        }
      }
    }
  }
}

POST /logs-object/_doc
{
  "request": {
    "headers": [
      { "name": "Content-Type", "value": "application/json" },
      { "name": "Authorization", "value": "Bearer xxx" }
    ]
  }
}
```

### Étape 2: Recherche qui donne un faux positif

```bash
GET /logs-object/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "request.headers.name": "Content-Type" } },
        { "term": { "request.headers.value": "Bearer xxx" } }
      ]
    }
  }
}
```

**Problème** : Le document est trouvé alors que "Content-Type" n'a pas la valeur "Bearer xxx" !

### Étape 3: Solution avec nested

```bash
PUT /logs-nested
{
  "mappings": {
    "properties": {
      "request": {
        "properties": {
          "headers": {
            "type": "nested",
            "properties": {
              "name": { "type": "keyword" },
              "value": { "type": "keyword" }
            }
          }
        }
      }
    }
  }
}

POST /logs-nested/_doc
{
  "request": {
    "headers": [
      { "name": "Content-Type", "value": "application/json" },
      { "name": "Authorization", "value": "Bearer xxx" }
    ]
  }
}
```

### Étape 4: Recherche correcte avec nested query

```bash
GET /logs-nested/_search
{
  "query": {
    "nested": {
      "path": "request.headers",
      "query": {
        "bool": {
          "must": [
            { "term": { "request.headers.name": "Content-Type" } },
            { "term": { "request.headers.value": "Bearer xxx" } }
          ]
        }
      }
    }
  }
}
```

**Résultat** : Aucun document trouvé (correct !).

### Attention

`nested` consomme plus de ressources. À utiliser uniquement si nécessaire.

### Validation

✅ Comprendre quand utiliser `nested` au lieu de `object`

---

# Lab 3.5: Dynamic Templates

**Topic**: Mapping et Schémas
**Durée**: 15 minutes

## Objectif

Configurer des règles automatiques pour le mapping dynamique.

## Contexte Parkki

Avec 15M logs/jour, vous ne pouvez pas définir manuellement chaque champ. Les dynamic templates permettent de contrôler le mapping automatique.

## Exercice

### Étape 1: Créer un index avec dynamic templates

```bash
PUT /logs-dynamic
{
  "mappings": {
    "dynamic_templates": [
      {
        "strings_as_keywords": {
          "match_mapping_type": "string",
          "mapping": {
            "type": "keyword"
          }
        }
      },
      {
        "message_as_text": {
          "match": "message",
          "mapping": {
            "type": "text"
          }
        }
      },
      {
        "ids_as_keyword": {
          "match": "*_id",
          "mapping": {
            "type": "keyword"
          }
        }
      }
    ]
  }
}
```

### Étape 2: Indexer un document avec nouveaux champs

```bash
POST /logs-dynamic/_doc
{
  "@timestamp": "2025-01-15T10:00:00.000Z",
  "level": "INFO",
  "message": "User authenticated successfully",
  "user_id": "user_123",
  "session_id": "sess_456",
  "new_field": "some value"
}
```

### Étape 3: Vérifier le mapping généré

```bash
GET /logs-dynamic/_mapping
```

**Observer** :
- `level` → `keyword` (règle strings_as_keywords)
- `message` → `text` (règle message_as_text)
- `user_id`, `session_id` → `keyword` (règle ids_as_keyword)
- `new_field` → `keyword` (règle strings_as_keywords)

### Validation

✅ Savoir configurer des dynamic templates pour contrôler le mapping automatique

---

# Lab 3.6: Index Templates

**Topic**: Mapping et Schémas
**Durée**: 20 minutes

## Objectif

Créer des templates pour appliquer automatiquement des settings et mappings.

## Contexte Parkki

Vos logs quotidiens (logs-YYYY.MM.DD) doivent tous avoir la même configuration.

## Exercice

### Étape 1: Créer un index template

```bash
PUT /_index_template/logs-parkki-template
{
  "index_patterns": ["logs-parkki-*"],
  "priority": 500,
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "refresh_interval": "30s"
    },
    "mappings": {
      "dynamic_templates": [
        {
          "strings_as_keywords": {
            "match_mapping_type": "string",
            "mapping": { "type": "keyword" }
          }
        }
      ],
      "properties": {
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "service": { "type": "keyword" },
        "message": { "type": "text" },
        "user_id": { "type": "keyword" },
        "response_time_ms": { "type": "long" },
        "trace_id": { "type": "keyword" },
        "span_id": { "type": "keyword" }
      }
    }
  }
}
```

### Étape 2: Créer un index qui matche le pattern

```bash
PUT /logs-parkki-2025.01.15
```

### Étape 3: Vérifier que le template a été appliqué

```bash
GET /logs-parkki-2025.01.15/_settings
GET /logs-parkki-2025.01.15/_mapping
```

### Étape 4: Indexer un document

```bash
POST /logs-parkki-2025.01.15/_doc
{
  "@timestamp": "2025-01-15T10:00:00.000Z",
  "level": "INFO",
  "service": "parkki-api",
  "message": "Request processed",
  "user_id": "user_001",
  "response_time_ms": 45,
  "trace_id": "abc123",
  "custom_field": "test"
}
```

### Étape 5: Vérifier le mapping du nouveau champ

```bash
GET /logs-parkki-2025.01.15/_mapping?filter_path=**.custom_field
```

**Observer** : `custom_field` est de type `keyword` grâce au dynamic template.

### Étape 6: Lister les templates

```bash
GET /_index_template/logs-parkki-template
```

### Validation

✅ Savoir créer un index template pour standardiser la configuration

---

# Lab 3.7: Component Templates (Bonus)

**Topic**: Mapping et Schémas
**Durée**: 15 minutes

## Objectif

Créer des templates modulaires et réutilisables.

## Exercice

### Étape 1: Créer un component template pour les settings

```bash
PUT /_component_template/logs-settings
{
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "refresh_interval": "30s"
    }
  }
}
```

### Étape 2: Créer un component template pour le mapping de base

```bash
PUT /_component_template/logs-mappings-base
{
  "template": {
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "service": { "type": "keyword" },
        "message": { "type": "text" }
      }
    }
  }
}
```

### Étape 3: Combiner les component templates

```bash
PUT /_index_template/logs-combined-template
{
  "index_patterns": ["logs-combined-*"],
  "priority": 600,
  "composed_of": [
    "logs-settings",
    "logs-mappings-base"
  ]
}
```

### Étape 4: Tester

```bash
PUT /logs-combined-2025.01.15

GET /logs-combined-2025.01.15/_settings
GET /logs-combined-2025.01.15/_mapping
```

### Validation

✅ Savoir créer des component templates modulaires

---

# Lab 4.1: API _search et Recherche Simple

**Topic**: Recherche de base
**Durée**: 20 minutes

## Objectif

Maîtriser les bases de l'API _search et les différentes façons de rechercher.

## Setup

Créons un index avec des données de test :

```bash
PUT /logs-search
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "service": { "type": "keyword" },
      "message": { "type": "text" },
      "user_id": { "type": "keyword" },
      "response_time_ms": { "type": "long" },
      "status_code": { "type": "integer" }
    }
  }
}

POST /_bulk
{"index":{"_index":"logs-search"}}
{"@timestamp":"2025-01-15T10:00:00.000Z","level":"INFO","service":"parkki-api","message":"User login successful","user_id":"user_001","response_time_ms":45,"status_code":200}
{"index":{"_index":"logs-search"}}
{"@timestamp":"2025-01-15T10:01:00.000Z","level":"ERROR","service":"parkki-api","message":"Database connection timeout after 30 seconds","user_id":"user_002","response_time_ms":30000,"status_code":500}
{"index":{"_index":"logs-search"}}
{"@timestamp":"2025-01-15T10:02:00.000Z","level":"WARN","service":"parkki-worker","message":"Slow query detected in payment module","user_id":"user_001","response_time_ms":1200,"status_code":200}
{"index":{"_index":"logs-search"}}
{"@timestamp":"2025-01-15T10:03:00.000Z","level":"INFO","service":"parkki-api","message":"Payment processed successfully","user_id":"user_003","response_time_ms":89,"status_code":200}
{"index":{"_index":"logs-search"}}
{"@timestamp":"2025-01-15T10:04:00.000Z","level":"ERROR","service":"parkki-worker","message":"Connection refused to external API","user_id":"user_002","response_time_ms":5000,"status_code":503}
{"index":{"_index":"logs-search"}}
{"@timestamp":"2025-01-15T10:05:00.000Z","level":"INFO","service":"parkki-api","message":"User logout","user_id":"user_001","response_time_ms":12,"status_code":200}
{"index":{"_index":"logs-search"}}
{"@timestamp":"2025-01-15T10:06:00.000Z","level":"DEBUG","service":"parkki-api","message":"Cache hit for user session","user_id":"user_003","response_time_ms":2,"status_code":200}
{"index":{"_index":"logs-search"}}
{"@timestamp":"2025-01-15T10:07:00.000Z","level":"ERROR","service":"parkki-api","message":"Authentication failed invalid token","user_id":"user_004","response_time_ms":15,"status_code":401}
```

## Exercice

### Étape 1: Recherche simple avec match_all

```bash
GET /logs-search/_search
{
  "query": {
    "match_all": {}
  }
}
```

### Étape 2: Recherche avec query parameter q

```bash
GET /logs-search/_search?q=error
```

Équivalent à une recherche sur tous les champs.

### Étape 3: Recherche sur un champ spécifique

```bash
GET /logs-search/_search?q=level:ERROR
```

### Étape 4: Limiter les champs retournés

```bash
GET /logs-search/_search
{
  "query": { "match_all": {} },
  "_source": ["@timestamp", "level", "message"]
}
```

### Étape 5: Exclure des champs

```bash
GET /logs-search/_search
{
  "query": { "match_all": {} },
  "_source": {
    "excludes": ["user_id", "response_time_ms"]
  }
}
```

### Validation

✅ Savoir utiliser l'API _search de base

---

# Lab 4.2: Pagination et Tri

**Topic**: Recherche de base
**Durée**: 15 minutes

## Objectif

Paginer et trier les résultats de recherche.

## Exercice

### Étape 1: Pagination avec size et from

```bash
# Première page (docs 0-2)
GET /logs-search/_search
{
  "query": { "match_all": {} },
  "size": 3,
  "from": 0
}

# Deuxième page (docs 3-5)
GET /logs-search/_search
{
  "query": { "match_all": {} },
  "size": 3,
  "from": 3
}
```

### Étape 2: Tri simple

```bash
GET /logs-search/_search
{
  "query": { "match_all": {} },
  "sort": [
    { "@timestamp": "desc" }
  ]
}
```

### Étape 3: Tri multiple

```bash
GET /logs-search/_search
{
  "query": { "match_all": {} },
  "sort": [
    { "level": "asc" },
    { "@timestamp": "desc" }
  ]
}
```

### Étape 4: Tri sur champ numérique

```bash
GET /logs-search/_search
{
  "query": { "match_all": {} },
  "sort": [
    { "response_time_ms": "desc" }
  ],
  "_source": ["@timestamp", "message", "response_time_ms"]
}
```

### Attention : Deep Pagination

```bash
# ⚠️ À éviter en production !
GET /logs-search/_search
{
  "from": 10000,
  "size": 10
}
```

Pour paginer au-delà de 10000 résultats, utilisez `search_after` (Lab bonus).

### Validation

✅ Savoir paginer et trier les résultats

---

# Lab 4.3: Query DSL - Requêtes de base

**Topic**: Recherche de base
**Durée**: 25 minutes

## Objectif

Maîtriser les requêtes Query DSL essentielles.

## Exercice

### Étape 1: match - Recherche full-text

```bash
GET /logs-search/_search
{
  "query": {
    "match": {
      "message": "connection timeout"
    }
  }
}
```

Retourne les documents contenant "connection" OU "timeout".

### Étape 2: match_phrase - Phrase exacte

```bash
GET /logs-search/_search
{
  "query": {
    "match_phrase": {
      "message": "connection timeout"
    }
  }
}
```

Retourne uniquement les documents avec "connection timeout" dans cet ordre.

### Étape 3: term - Valeur exacte (keyword)

```bash
GET /logs-search/_search
{
  "query": {
    "term": {
      "level": "ERROR"
    }
  }
}
```

### Étape 4: terms - Plusieurs valeurs

```bash
GET /logs-search/_search
{
  "query": {
    "terms": {
      "level": ["ERROR", "WARN"]
    }
  }
}
```

### Étape 5: range - Plage de valeurs

```bash
# Logs avec response_time > 1000ms
GET /logs-search/_search
{
  "query": {
    "range": {
      "response_time_ms": {
        "gt": 1000
      }
    }
  }
}

# Logs de la dernière heure
GET /logs-search/_search
{
  "query": {
    "range": {
      "@timestamp": {
        "gte": "now-1h",
        "lte": "now"
      }
    }
  }
}
```

### Étape 6: exists - Champ présent

```bash
GET /logs-search/_search
{
  "query": {
    "exists": {
      "field": "user_id"
    }
  }
}
```

### Étape 7: wildcard - Pattern matching

```bash
GET /logs-search/_search
{
  "query": {
    "wildcard": {
      "service": "parkki-*"
    }
  }
}
```

### Validation

✅ Connaître les requêtes Query DSL de base

---

# Lab 4.4: Query DSL - Bool Query

**Topic**: Recherche de base
**Durée**: 20 minutes

## Objectif

Combiner plusieurs conditions avec bool query.

## Exercice

### Étape 1: must - Toutes les conditions requises

```bash
GET /logs-search/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "level": "ERROR" } },
        { "term": { "service": "parkki-api" } }
      ]
    }
  }
}
```

### Étape 2: should - Au moins une condition

```bash
GET /logs-search/_search
{
  "query": {
    "bool": {
      "should": [
        { "term": { "level": "ERROR" } },
        { "term": { "level": "WARN" } }
      ],
      "minimum_should_match": 1
    }
  }
}
```

### Étape 3: must_not - Exclure des résultats

```bash
GET /logs-search/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "message": "connection" } }
      ],
      "must_not": [
        { "term": { "level": "DEBUG" } }
      ]
    }
  }
}
```

### Étape 4: filter - Filtrage sans scoring

```bash
GET /logs-search/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "message": "error" } }
      ],
      "filter": [
        { "term": { "service": "parkki-api" } },
        { "range": { "response_time_ms": { "gt": 100 } } }
      ]
    }
  }
}
```

**Important** : `filter` est plus performant car il ne calcule pas de score et peut être mis en cache.

### Étape 5: Combinaison complète

```bash
# Logs d'erreur de parkki-api avec response_time > 1s, excluant user_004
GET /logs-search/_search
{
  "query": {
    "bool": {
      "must": [
        { "terms": { "level": ["ERROR", "WARN"] } }
      ],
      "filter": [
        { "term": { "service": "parkki-api" } },
        { "range": { "response_time_ms": { "gte": 1000 } } }
      ],
      "must_not": [
        { "term": { "user_id": "user_004" } }
      ]
    }
  },
  "sort": [
    { "@timestamp": "desc" }
  ]
}
```

### Quand utiliser quoi ?

| Clause | Calcule le score | Mise en cache | Usage |
|--------|------------------|---------------|-------|
| `must` | Oui | Non | Recherche full-text |
| `should` | Oui | Non | Boost optionnel |
| `filter` | Non | Oui | Filtres stricts |
| `must_not` | Non | Oui | Exclusions |

### Validation

✅ Savoir combiner des conditions avec bool query

---

# Lab 4.5: Recherche dans les logs (Cas pratiques Parkki)

**Topic**: Recherche de base
**Durée**: 15 minutes

## Objectif

Appliquer les recherches aux cas d'usage Parkki.

## Exercice

### Cas 1: Trouver toutes les erreurs de la dernière heure

```bash
GET /logs-search/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "level": "ERROR" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "sort": [{ "@timestamp": "desc" }]
}
```

### Cas 2: Logs lents (> 1 seconde)

```bash
GET /logs-search/_search
{
  "query": {
    "bool": {
      "filter": [
        { "range": { "response_time_ms": { "gt": 1000 } } }
      ]
    }
  },
  "sort": [{ "response_time_ms": "desc" }],
  "_source": ["@timestamp", "service", "message", "response_time_ms"]
}
```

### Cas 3: Erreurs 5xx

```bash
GET /logs-search/_search
{
  "query": {
    "bool": {
      "filter": [
        { "range": { "status_code": { "gte": 500, "lt": 600 } } }
      ]
    }
  }
}
```

### Cas 4: Activité d'un utilisateur spécifique

```bash
GET /logs-search/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "user_id": "user_001" } }
      ]
    }
  },
  "sort": [{ "@timestamp": "asc" }]
}
```

### Cas 5: Recherche dans les messages d'erreur

```bash
GET /logs-search/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "message": "connection refused timeout" } }
      ],
      "filter": [
        { "terms": { "level": ["ERROR", "WARN"] } }
      ]
    }
  },
  "highlight": {
    "fields": {
      "message": {}
    }
  }
}
```

### Validation

✅ Savoir appliquer les recherches aux cas d'usage réels

---

# Lab 4.6: Count et Aggregations simples (Bonus)

**Topic**: Recherche de base
**Durée**: 15 minutes

## Objectif

Compter et agréger les résultats.

## Exercice

### Étape 1: Compter les documents

```bash
GET /logs-search/_count
{
  "query": {
    "term": { "level": "ERROR" }
  }
}
```

### Étape 2: Aggregation terms - Répartition par level

```bash
GET /logs-search/_search
{
  "size": 0,
  "aggs": {
    "par_level": {
      "terms": {
        "field": "level"
      }
    }
  }
}
```

### Étape 3: Aggregation avec filtre

```bash
GET /logs-search/_search
{
  "size": 0,
  "query": {
    "range": {
      "@timestamp": { "gte": "now-1d" }
    }
  },
  "aggs": {
    "erreurs_par_service": {
      "terms": {
        "field": "service"
      }
    }
  }
}
```

### Étape 4: Stats sur les temps de réponse

```bash
GET /logs-search/_search
{
  "size": 0,
  "aggs": {
    "response_time_stats": {
      "stats": {
        "field": "response_time_ms"
      }
    }
  }
}
```

### Étape 5: Percentiles

```bash
GET /logs-search/_search
{
  "size": 0,
  "aggs": {
    "response_time_percentiles": {
      "percentiles": {
        "field": "response_time_ms",
        "percents": [50, 90, 95, 99]
      }
    }
  }
}
```

### Validation

✅ Savoir utiliser count et les aggregations simples

---

# Lab 5.1: Calcul du Nombre de Shards

**Topic**: Dimensionnement et Sizing
**Durée**: 25 minutes

## Objectif

Comprendre comment calculer le bon nombre de shards pour vos index.

## Contexte Parkki

Avec 15M logs/jour, un mauvais dimensionnement des shards peut :
- Surcharger la JVM (trop de shards)
- Créer des goulots d'étranglement (shards trop gros)
- Augmenter vos coûts (ressources mal utilisées)

## Exercice

### Règles de base

| Règle | Recommandation |
|-------|----------------|
| Taille par shard | 20-40 GB (max 50 GB) |
| Shards par GB de heap | ~20 shards max par GB de heap |
| Shards par nœud | Éviter > 1000 shards par nœud |

### Étape 1: Calculer votre volume de données

```
Volume quotidien = Nombre de logs × Taille moyenne par log

Pour Parkki:
- 15M logs/jour
- Taille moyenne estimée: 1 KB/log
- Volume quotidien = 15M × 1 KB = 15 GB/jour
```

### Étape 2: Calculer le nombre de shards par index quotidien

```
Nombre de shards = Volume / Taille cible par shard

Pour un index quotidien de 15 GB:
- Taille cible par shard: 30 GB
- Nombre de shards = 15 GB / 30 GB = 0.5 → 1 shard

Recommandation: 1 shard primaire par index quotidien
```

### Étape 3: Voir les shards actuels

```bash
GET /_cat/shards?v&s=store:desc
```

### Étape 4: Voir le nombre de shards par index

```bash
GET /_cat/indices?v&h=index,pri,rep,docs.count,store.size&s=store.size:desc
```

### Étape 5: Calculer le total de shards

```bash
GET /_cluster/health?filter_path=active_primary_shards,active_shards
```

### Étape 6: Vérifier la heap utilisée par les shards

```bash
GET /_cat/nodes?v&h=name,heap.percent,heap.current,heap.max,shards
```

**Règle**: ~20 shards max par GB de heap

```
Exemple:
- Heap: 4 GB
- Max shards recommandés: 4 × 20 = 80 shards
```

### Calcul pour Parkki (10 jours de rétention)

```
Volume total = 15 GB/jour × 10 jours = 150 GB
Avec replicas (×2) = 300 GB

Si 1 shard par jour × 10 jours = 10 index × 1 shard = 10 shards primaires
Avec 1 replica = 20 shards total

C'est très raisonnable !
```

### Validation

✅ Savoir calculer le nombre optimal de shards

---

# Lab 5.2: Sizing des Nœuds et Ratios Memory:Data

**Topic**: Dimensionnement et Sizing
**Durée**: 25 minutes

## Objectif

Comprendre les ratios Memory:Data pour dimensionner correctement vos nœuds.

## Contexte Parkki

Le ratio Memory:Data détermine combien de données un nœud peut gérer par GB de RAM.

## Exercice

### Ratios recommandés par Elastic

| Tier | Ratio Memory:Data | Usage |
|------|-------------------|-------|
| Hot | 1:30 | Données récentes, indexation active |
| Warm | 1:160 | Données moins consultées |
| Cold | 1:500 | Archives rarement consultées |
| Frozen | 1:2000+ | Archives très rarement consultées |

### Étape 1: Voir les ressources actuelles

```bash
GET /_cat/nodes?v&h=name,heap.max,ram.max,disk.total,disk.used,disk.avail
```

### Étape 2: Calculer la capacité d'un nœud Hot

```
Formule:
Capacité data = RAM × Ratio

Exemple pour un nœud Hot avec 8 GB RAM:
- Ratio Hot = 1:30
- Capacité = 8 GB × 30 = 240 GB de données
```

### Étape 3: Dimensionner pour Parkki

```
Données Hot (2 derniers jours):
- 15 GB/jour × 2 jours = 30 GB
- Avec replicas = 60 GB

RAM nécessaire (Hot):
- 60 GB / 30 (ratio) = 2 GB de RAM minimum

Données Warm (jours 3-10):
- 15 GB/jour × 8 jours = 120 GB
- Avec replicas = 240 GB

RAM nécessaire (Warm):
- 240 GB / 160 (ratio) = 1.5 GB de RAM minimum
```

### Étape 4: Vérifier l'utilisation actuelle de la heap

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_used_percent,nodes.*.name
```

**Seuils critiques**:
- < 75%: OK
- 75-85%: Attention
- \> 85%: Problème imminent

### Étape 5: Voir les statistiques détaillées

```bash
GET /_nodes/stats?filter_path=nodes.*.name,nodes.*.jvm.mem,nodes.*.fs.total
```

### Formule complète de dimensionnement

```
Total storage = Raw data × (1 + replicas) × (1 + 0.15 watermark + 0.1 marge)

Pour Parkki (10 jours):
- Raw data = 150 GB
- Avec 1 replica = 300 GB
- Avec marges = 300 × 1.25 = 375 GB de stockage nécessaire

Nombre de nœuds data:
- Si nœuds avec 500 GB disque et 8 GB RAM
- Capacité par nœud (Hot ratio) = 8 × 30 = 240 GB
- Nœuds nécessaires = 375 / 240 = 1.6 → 2 nœuds minimum
```

### Validation

✅ Savoir calculer les ressources nécessaires pour un cluster

---

# Lab 5.3: Thread Pools et Rejections

**Topic**: Dimensionnement et Sizing
**Durée**: 20 minutes

## Objectif

Comprendre les thread pools et détecter les problèmes de saturation.

## Contexte Parkki

Les "rejections" dans les thread pools indiquent que le cluster est surchargé. C'est souvent lié à vos problèmes de JVM.

## Exercice

### Thread pools principaux

| Thread Pool | Usage | Symptôme si saturé |
|-------------|-------|---------------------|
| `write` | Indexation | Indexation lente/rejetée |
| `search` | Recherches | Requêtes lentes/timeout |
| `get` | Récupération doc | GET lents |
| `bulk` | Bulk API | Bulk rejetés |

### Étape 1: Voir l'état des thread pools

```bash
GET /_cat/thread_pool?v&h=node_name,name,active,queue,rejected
```

### Étape 2: Filtrer sur les pools critiques

```bash
GET /_cat/thread_pool/write,search,bulk?v&h=node_name,name,active,queue,rejected
```

### Étape 3: Voir les détails d'un thread pool

```bash
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.write,nodes.*.thread_pool.search
```

### Étape 4: Interpréter les résultats

```
Exemple de sortie:
node_name  name   active queue rejected
node-1     write  5      0     0         ✅ OK
node-1     search 2      0     0         ✅ OK
node-1     bulk   0      50    123       ⚠️ Rejections !
```

**Si rejected > 0**:
- Le cluster n'arrive pas à suivre la charge
- Réduire le débit d'indexation
- Augmenter les ressources

### Étape 5: Voir la configuration des thread pools

```bash
GET /_nodes?filter_path=nodes.*.thread_pool
```

### Étape 6: Surveiller en temps réel

```bash
# Répéter cette commande pour voir l'évolution
GET /_cat/thread_pool/write?v&h=node_name,active,queue,rejected
```

### Actions correctives

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| write rejections | Trop d'indexation | Réduire bulk size, augmenter refresh_interval |
| search rejections | Trop de requêtes | Optimiser requêtes, ajouter nœuds |
| queue élevée | Charge temporaire | Attendre ou augmenter ressources |

### Validation

✅ Savoir détecter les problèmes de thread pool

---

# Lab 5.4: Disk Watermarks

**Topic**: Dimensionnement et Sizing
**Durée**: 15 minutes

## Objectif

Comprendre les watermarks disque et éviter les blocages.

## Contexte Parkki

Les watermarks peuvent bloquer l'indexation si le disque est trop plein. C'est critique pour vos 15M logs/jour.

## Exercice

### Watermarks par défaut

| Watermark | Seuil | Action |
|-----------|-------|--------|
| Low | 85% | Nouveaux shards non alloués sur ce nœud |
| High | 90% | Elasticsearch déplace les shards vers d'autres nœuds |
| Flood stage | 95% | Index passent en READ-ONLY ! |

### Étape 1: Voir l'utilisation disque actuelle

```bash
GET /_cat/allocation?v&h=node,shards,disk.used,disk.avail,disk.percent
```

### Étape 2: Voir les watermarks configurés

```bash
GET /_cluster/settings?include_defaults=true&filter_path=*.cluster.routing.allocation.disk
```

### Étape 3: Simuler un dépassement (NE PAS FAIRE EN PROD)

```bash
# Voir la configuration actuelle
GET /_cluster/settings?flat_settings=true&filter_path=*.cluster.routing.allocation.disk.watermark
```

### Étape 4: Vérifier si un index est en read-only

```bash
GET /_all/_settings?filter_path=**.blocks.read_only_allow_delete
```

### Étape 5: Débloquer un index en read-only (si nécessaire)

```bash
# Après avoir libéré de l'espace disque !
PUT /_all/_settings
{
  "index.blocks.read_only_allow_delete": null
}
```

### Calcul de l'espace nécessaire pour Parkki

```
Volume quotidien: 15 GB
Rétention: 10 jours
Volume total: 150 GB

Avec replicas (×2): 300 GB
Avec marge watermark (×1.25): 375 GB

Espace disque minimum recommandé: 400 GB
```

### Validation

✅ Comprendre les watermarks et savoir réagir

---

# Lab 5.5: Calcul Complet pour Parkki

**Topic**: Dimensionnement et Sizing
**Durée**: 20 minutes

## Objectif

Appliquer toutes les formules pour dimensionner le cluster Parkki.

## Exercice

### Données du problème

```
- 15M logs/jour
- Taille moyenne: 1 KB/log
- Rétention: 10 jours
- Usage: Observability (logs + APM)
```

### Étape 1: Calculer le volume de données

```
Volume quotidien = 15M × 1 KB = 15 GB/jour
Volume total (10 jours) = 150 GB

Avec 1 replica = 300 GB
Avec marges (watermark + overhead) = 375 GB
```

### Étape 2: Calculer le nombre de shards

```
Shards par index quotidien:
- 15 GB / 30 GB (taille cible) = 1 shard primaire

Total shards (10 jours):
- 10 index × 1 shard × 2 (replica) = 20 shards

C'est très gérable !
```

### Étape 3: Calculer la RAM nécessaire

```
Architecture recommandée:
- Hot tier (jours 0-2): 45 GB de données (×2 = 90 GB)
- Warm tier (jours 3-10): 120 GB de données (×2 = 240 GB)

RAM Hot tier:
- 90 GB / 30 (ratio) = 3 GB RAM

RAM Warm tier:
- 240 GB / 160 (ratio) = 1.5 GB RAM

Total RAM data nodes: 5-8 GB recommandé
```

### Étape 4: Configuration recommandée

```
Option 1 - Elastic Cloud (recommandé):
- Hot tier: 4 GB RAM (120 GB stockage)
- Warm tier: 2 GB RAM (320 GB stockage)
- Coût estimé: ~$150-200/mois

Option 2 - Self-hosted (3 nœuds):
- 3 nœuds × 8 GB RAM × 500 GB disque
- Heap: 4 GB par nœud (50% de RAM)
- Capacité: 3 × 4 GB × 30 = 360 GB Hot
```

### Étape 5: Vérifier votre configuration actuelle

```bash
# Résumé du cluster
GET /_cluster/stats?human&filter_path=nodes.count,nodes.jvm.mem,indices.count,indices.store

# Détail par nœud
GET /_cat/nodes?v&h=name,heap.max,ram.max,disk.total,node.role
```

### Étape 6: Créer un template optimisé

```bash
PUT /_index_template/logs-parkki-optimized
{
  "index_patterns": ["logs-parkki-*"],
  "priority": 500,
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "refresh_interval": "30s",
      "codec": "best_compression"
    }
  }
}
```

### Résumé pour Parkki

| Paramètre | Valeur recommandée |
|-----------|-------------------|
| Shards par index | 1 primaire + 1 replica |
| Refresh interval | 30s |
| Stockage total | 400 GB minimum |
| RAM (Hot) | 4-8 GB |
| Rétention | 10 jours avec ILM |

### Validation

✅ Savoir dimensionner un cluster pour un use case concret

---

# Lab 6.1: Stratégies de Rétention

**Topic**: Data Retention et ILM
**Durée**: 20 minutes

## Objectif

Comprendre les différentes stratégies de rétention et leur impact sur les coûts.

## Contexte Parkki

Avec 15M logs/jour et une rétention de 10 jours, optimiser la rétention peut **réduire significativement vos coûts**.

## Stratégies disponibles

| Stratégie | Ressources | Accès | Use Case |
|-----------|------------|-------|----------|
| Index ouvert | CPU + RAM + Disk | Temps réel | Données actives |
| Index closed | Disk uniquement | Rouvrir nécessaire | Archives court terme |
| Index shrinked | Moins de shards | Temps réel (lecture) | Réduire overhead |
| Snapshot | Stockage externe | Restauration nécessaire | Backup/archives |
| Suppression | Aucune | Aucun | Données expirées |

## Exercice

### Étape 1: Voir l'état des index

```bash
GET /_cat/indices?v&h=index,status,pri,rep,docs.count,store.size&s=index
```

### Étape 2: Fermer un index (libérer RAM/CPU)

```bash
# Créer un index de test
PUT /logs-old-2025.01.01
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}

POST /logs-old-2025.01.01/_doc
{
  "@timestamp": "2025-01-01T10:00:00.000Z",
  "message": "Old log entry"
}

# Fermer l'index
POST /logs-old-2025.01.01/_close

# Vérifier le status
GET /_cat/indices/logs-old-*?v
```

**Observer**: L'index est maintenant `close` - il ne consomme plus de RAM.

### Étape 3: Rouvrir un index

```bash
POST /logs-old-2025.01.01/_open

# Vérifier que les données sont accessibles
GET /logs-old-2025.01.01/_search
```

### Étape 4: Comparer les ressources

```bash
# Index ouvert - consomme de la heap
GET /_cat/segments/logs-old-2025.01.01?v

# Index fermé - pas de segments en mémoire
POST /logs-old-2025.01.01/_close
GET /_cat/segments/logs-old-2025.01.01?v
```

### Validation

✅ Comprendre la différence entre index ouvert et fermé

---

# Lab 6.2: Open/Close et Delete APIs

**Topic**: Data Retention et ILM
**Durée**: 15 minutes

## Objectif

Maîtriser les APIs de gestion du cycle de vie des index.

## Exercice

### Étape 1: Créer plusieurs index de test

```bash
PUT /logs-retention-2025.01.01
PUT /logs-retention-2025.01.02
PUT /logs-retention-2025.01.03
PUT /logs-retention-2025.01.04
PUT /logs-retention-2025.01.05
```

### Étape 2: Fermer plusieurs index avec pattern

```bash
# Fermer les index des 3 premiers jours
POST /logs-retention-2025.01.01,logs-retention-2025.01.02,logs-retention-2025.01.03/_close

# Vérifier
GET /_cat/indices/logs-retention-*?v&h=index,status
```

### Étape 3: Delete by Query (supprimer des documents)

```bash
# Rouvrir un index
POST /logs-retention-2025.01.01/_open

# Ajouter des documents
POST /_bulk
{"index":{"_index":"logs-retention-2025.01.01"}}
{"level":"INFO","message":"Keep this"}
{"index":{"_index":"logs-retention-2025.01.01"}}
{"level":"DEBUG","message":"Delete this"}
{"index":{"_index":"logs-retention-2025.01.01"}}
{"level":"DEBUG","message":"Delete this too"}

# Supprimer les logs DEBUG
POST /logs-retention-2025.01.01/_delete_by_query
{
  "query": {
    "term": {
      "level": "DEBUG"
    }
  }
}

# Vérifier
GET /logs-retention-2025.01.01/_search
```

### Étape 4: Supprimer un index complet

```bash
DELETE /logs-retention-2025.01.05

# Vérifier
GET /_cat/indices/logs-retention-*?v
```

### Étape 5: Supprimer plusieurs index

```bash
DELETE /logs-retention-2025.01.01,logs-retention-2025.01.02

# Ou avec pattern (⚠️ dangereux en prod !)
DELETE /logs-retention-*
```

### Validation

✅ Savoir gérer le cycle de vie des index manuellement

---

# Lab 6.3: Shrink API

**Topic**: Data Retention et ILM
**Durée**: 20 minutes

## Objectif

Réduire le nombre de shards d'un index pour économiser des ressources.

## Contexte Parkki

Un index avec trop de shards consomme plus de heap. Shrink permet de réduire ce coût pour les anciens index.

## Exercice

### Étape 1: Créer un index avec plusieurs shards

```bash
PUT /logs-to-shrink
{
  "settings": {
    "number_of_shards": 4,
    "number_of_replicas": 0
  }
}

# Ajouter des documents
POST /_bulk
{"index":{"_index":"logs-to-shrink"}}
{"@timestamp":"2025-01-15T10:00:00.000Z","message":"Log 1"}
{"index":{"_index":"logs-to-shrink"}}
{"@timestamp":"2025-01-15T10:01:00.000Z","message":"Log 2"}
{"index":{"_index":"logs-to-shrink"}}
{"@timestamp":"2025-01-15T10:02:00.000Z","message":"Log 3"}
{"index":{"_index":"logs-to-shrink"}}
{"@timestamp":"2025-01-15T10:03:00.000Z","message":"Log 4"}
```

### Étape 2: Vérifier les shards actuels

```bash
GET /_cat/shards/logs-to-shrink?v
```

**Observer**: 4 shards primaires.

### Étape 3: Préparer l'index pour le shrink

```bash
# L'index doit être read-only et tous les shards sur un seul nœud
PUT /logs-to-shrink/_settings
{
  "settings": {
    "index.blocks.write": true
  }
}
```

### Étape 4: Exécuter le shrink

```bash
POST /logs-to-shrink/_shrink/logs-shrunk
{
  "settings": {
    "index.number_of_shards": 1,
    "index.number_of_replicas": 0,
    "index.blocks.write": null
  }
}
```

### Étape 5: Vérifier le résultat

```bash
# Comparer les deux index
GET /_cat/indices/logs-to-shrink,logs-shrunk?v&h=index,pri,rep,docs.count,store.size

# Vérifier les shards
GET /_cat/shards/logs-shrunk?v
```

**Observer**: L'index shrunk n'a qu'1 shard au lieu de 4.

### Étape 6: Supprimer l'ancien index

```bash
DELETE /logs-to-shrink
```

### Règles du Shrink

- Le nouveau nombre de shards doit être un diviseur de l'ancien (4→2, 4→1, 6→3, 6→2, 6→1)
- L'index doit être en read-only
- Tous les shards doivent être sur le même nœud (pour single-node c'est automatique)

### Validation

✅ Savoir utiliser shrink pour réduire le nombre de shards

---

# Lab 6.4: Data Streams

**Topic**: Data Retention et ILM
**Durée**: 25 minutes

## Objectif

Comprendre les Data Streams pour gérer automatiquement les time series data.

## Contexte Parkki

Les Data Streams sont **parfaits pour vos logs** : ils gèrent automatiquement le rollover et simplifient la rétention.

## Concepts clés

```
Data Stream: logs-parkki
├── .ds-logs-parkki-2025.01.13-000001 (backing index - read)
├── .ds-logs-parkki-2025.01.14-000002 (backing index - read)
└── .ds-logs-parkki-2025.01.15-000003 (write index - read/write)
```

## Exercice

### Étape 1: Créer un index template pour data stream

```bash
PUT /_index_template/logs-stream-template
{
  "index_patterns": ["logs-stream-*"],
  "data_stream": {},
  "priority": 500,
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "service": { "type": "keyword" },
        "message": { "type": "text" }
      }
    }
  }
}
```

**Important**: `"data_stream": {}` active le mode data stream.

### Étape 2: Créer le data stream (implicite via indexation)

```bash
POST /logs-stream-parkki/_doc
{
  "@timestamp": "2025-01-15T10:00:00.000Z",
  "level": "INFO",
  "service": "parkki-api",
  "message": "First log in data stream"
}
```

### Étape 3: Voir le data stream

```bash
GET /_data_stream/logs-stream-parkki
```

**Observer**:
- `name`: nom du data stream
- `indices`: liste des backing indices
- `generation`: numéro de génération

### Étape 4: Indexer plus de documents

```bash
POST /logs-stream-parkki/_doc
{
  "@timestamp": "2025-01-15T10:01:00.000Z",
  "level": "ERROR",
  "service": "parkki-api",
  "message": "Error in data stream"
}

POST /logs-stream-parkki/_doc
{
  "@timestamp": "2025-01-15T10:02:00.000Z",
  "level": "WARN",
  "service": "parkki-worker",
  "message": "Warning in data stream"
}
```

### Étape 5: Rechercher dans le data stream

```bash
GET /logs-stream-parkki/_search
{
  "query": {
    "term": { "level": "ERROR" }
  }
}
```

### Étape 6: Voir les backing indices

```bash
GET /_cat/indices/.ds-logs-stream-parkki-*?v
```

### Étape 7: Rollover manuel

```bash
POST /logs-stream-parkki/_rollover
```

Vérifier:
```bash
GET /_data_stream/logs-stream-parkki
```

**Observer**: Un nouveau backing index a été créé (generation +1).

### Avantages des Data Streams

| Avantage | Description |
|----------|-------------|
| Rollover automatique | Avec ILM |
| Nom unique | Plus besoin de gérer les noms d'index |
| Suppression facile | Supprimer les anciens backing indices |
| Recherche transparente | Query sur le data stream = tous les indices |

### Validation

✅ Comprendre les Data Streams et leur utilité pour les logs

---

# Lab 6.5: Index Lifecycle Management (ILM) - Bases

**Topic**: Data Retention et ILM
**Durée**: 30 minutes

## Objectif

Créer une policy ILM pour automatiser le cycle de vie des index.

## Contexte Parkki

ILM peut **automatiquement**:
- Faire un rollover quand l'index est trop gros/vieux
- Déplacer les données vers des tiers moins chers
- Supprimer les données après 10 jours

## Phases ILM

```
Hot → Warm → Cold → Frozen → Delete 
 │      │      │       │        │
 │      │      │       │        └─ Suppression définitive
 │      │      │       └─ Snapshot + minimal resources
 │      │      └─ Read-only, moins de replicas
 │      └─ Read-only, shrink, force merge
 └─ Indexation active, recherches fréquentes
```

## Exercice

### Étape 1: Créer une policy ILM simple

```bash
PUT /_ilm/policy/logs-parkki-policy
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_primary_shard_size": "10gb"
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "delete": {
        "min_age": "10d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

**Explication**:
- **Hot phase**: Rollover après 1 jour OU si shard > 10GB
- **Delete phase**: Suppression après 10 jours (depuis le rollover)

### Étape 2: Voir la policy

```bash
GET /_ilm/policy/logs-parkki-policy
```

### Étape 3: Créer un template avec ILM

```bash
PUT /_index_template/logs-ilm-template
{
  "index_patterns": ["logs-ilm-*"],
  "data_stream": {},
  "priority": 500,
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "index.lifecycle.name": "logs-parkki-policy"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "message": { "type": "text" }
      }
    }
  }
}
```

### Étape 4: Créer le data stream et indexer

```bash
POST /logs-ilm-parkki/_doc
{
  "@timestamp": "2025-01-15T10:00:00.000Z",
  "level": "INFO",
  "message": "Log with ILM"
}
```

### Étape 5: Vérifier l'association ILM

```bash
GET /logs-ilm-parkki/_ilm/explain
```

**Observer**:
- `managed`: true (géré par ILM)
- `policy`: logs-parkki-policy
- `phase`: hot
- `age`: temps depuis la création

### Étape 6: Voir toutes les policies

```bash
GET /_ilm/policy
```

### Validation

✅ Savoir créer et associer une policy ILM de base

---

# Lab 6.6: ILM Avancé - Hot/Warm/Delete

**Topic**: Data Retention et ILM
**Durée**: 30 minutes

## Objectif

Créer une policy ILM complète avec Hot, Warm et Delete phases.

## Contexte Parkki

Pour optimiser vos coûts avec 15M logs/jour :
- **Hot** (jours 0-2): Accès fréquent, indexation
- **Warm** (jours 3-10): Accès occasionnel, read-only
- **Delete** (après 10 jours): Suppression

## Exercice

### Étape 1: Créer une policy Hot/Warm/Delete

```bash
PUT /_ilm/policy/logs-parkki-optimized
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_primary_shard_size": "15gb"
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "2d",
        "actions": {
          "set_priority": {
            "priority": 50
          },
          "readonly": {},
          "forcemerge": {
            "max_num_segments": 1
          },
          "shrink": {
            "number_of_shards": 1
          }
        }
      },
      "delete": {
        "min_age": "10d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

**Explication des actions Warm**:
- `readonly`: Bloque l'écriture
- `forcemerge`: Fusionne les segments (meilleure perf lecture)
- `shrink`: Réduit le nombre de shards

### Étape 2: Voir la policy détaillée

```bash
GET /_ilm/policy/logs-parkki-optimized
```

### Étape 3: Créer un template avec cette policy

```bash
PUT /_index_template/logs-optimized-template
{
  "index_patterns": ["logs-opt-*"],
  "data_stream": {},
  "priority": 600,
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "refresh_interval": "30s",
      "index.lifecycle.name": "logs-parkki-optimized"
    },
    "mappings": {
      "dynamic_templates": [
        {
          "strings_as_keywords": {
            "match_mapping_type": "string",
            "mapping": { "type": "keyword" }
          }
        }
      ],
      "properties": {
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "service": { "type": "keyword" },
        "message": { "type": "text" }
      }
    }
  }
}
```

### Étape 4: Tester avec des données

```bash
POST /logs-opt-parkki/_doc
{
  "@timestamp": "2025-01-15T10:00:00.000Z",
  "level": "INFO",
  "service": "parkki-api",
  "message": "Optimized log entry"
}
```

### Étape 5: Voir le statut ILM

```bash
GET /logs-opt-parkki/_ilm/explain
```

### Étape 6: Forcer une transition (pour test)

```bash
# Forcer le passage à la phase suivante (⚠️ test uniquement)
POST /_ilm/move/logs-opt-parkki
{
  "current_step": {
    "phase": "hot",
    "action": "complete",
    "name": "complete"
  },
  "next_step": {
    "phase": "warm",
    "action": "readonly",
    "name": "readonly"
  }
}
```

### Timeline pour Parkki

| Jour | Phase | Actions |
|------|-------|---------|
| 0-1 | Hot | Indexation active |
| 1 | Hot | Rollover (nouveau backing index) |
| 2 | Warm | readonly, forcemerge, shrink |
| 10 | Delete | Suppression automatique |

### Validation

✅ Savoir créer une policy ILM Hot/Warm/Delete

---

# Lab 6.7: Monitoring et Troubleshooting ILM

**Topic**: Data Retention et ILM
**Durée**: 20 minutes

## Objectif

Surveiller et débugger les policies ILM.

## Exercice

### Étape 1: Voir le statut ILM global

```bash
GET /_ilm/status
```

**Résultat attendu**: `"operation_mode": "RUNNING"`

### Étape 2: Voir tous les index gérés par ILM

```bash
GET /*/_ilm/explain?only_managed=true
```

### Étape 3: Voir les index en erreur

```bash
GET /*/_ilm/explain?only_errors=true
```

### Étape 4: Détail d'un index spécifique

```bash
GET /logs-opt-parkki/_ilm/explain
```

**Champs importants**:
- `phase`: Phase actuelle (hot, warm, delete)
- `action`: Action en cours
- `step`: Étape dans l'action
- `age`: Âge depuis le rollover
- `failed_step`: Étape qui a échoué (si erreur)

### Étape 5: Retry après une erreur

```bash
# Si une policy est bloquée sur une erreur
POST /logs-opt-parkki/_ilm/retry
```

### Étape 6: Arrêter/Démarrer ILM

```bash
# Arrêter ILM (maintenance)
POST /_ilm/stop

# Vérifier
GET /_ilm/status

# Redémarrer ILM
POST /_ilm/start
```

### Étape 7: Supprimer une policy d'un index

```bash
# Retirer la gestion ILM d'un index
POST /logs-opt-parkki/_ilm/remove
```

### Étape 8: Modifier une policy existante

```bash
# Mettre à jour la policy (nouveaux index seulement)
PUT /_ilm/policy/logs-parkki-optimized
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "12h",
            "max_primary_shard_size": "10gb"
          }
        }
      },
      "delete": {
        "min_age": "7d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

**Note**: Les index existants gardent l'ancienne version de la policy.

### Problèmes courants

| Problème | Cause | Solution |
|----------|-------|----------|
| Index bloqué en Hot | Rollover conditions non atteintes | Attendre ou rollover manuel |
| Erreur shrink | Shards pas sur même nœud | Vérifier allocation |
| Delete ne se fait pas | min_age pas atteint | Vérifier l'âge depuis rollover |

### Validation

✅ Savoir monitorer et débugger ILM

---

# Lab 6.8: Configuration Recommandée pour Parkki

**Topic**: Data Retention et ILM
**Durée**: 25 minutes

## Objectif

Mettre en place la configuration ILM optimale pour Parkki.

## Exercice

### Étape 1: Créer la policy de production

```bash
PUT /_ilm/policy/parkki-logs-production
{
  "policy": {
    "_meta": {
      "description": "Policy pour logs Parkki - 15M logs/jour, rétention 10 jours"
    },
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_primary_shard_size": "20gb"
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "2d",
        "actions": {
          "set_priority": {
            "priority": 50
          },
          "readonly": {},
          "forcemerge": {
            "max_num_segments": 1
          }
        }
      },
      "delete": {
        "min_age": "10d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

### Étape 2: Créer le component template pour settings

```bash
PUT /_component_template/parkki-settings
{
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "refresh_interval": "30s",
      "index.lifecycle.name": "parkki-logs-production",
      "codec": "best_compression"
    }
  }
}
```

### Étape 3: Créer le component template pour mappings

```bash
PUT /_component_template/parkki-mappings
{
  "template": {
    "mappings": {
      "dynamic_templates": [
        {
          "strings_as_keywords": {
            "match_mapping_type": "string",
            "mapping": { "type": "keyword" }
          }
        },
        {
          "message_as_text": {
            "match": "message",
            "mapping": { "type": "text" }
          }
        }
      ],
      "properties": {
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "service": { "type": "keyword" },
        "message": { "type": "text" },
        "user_id": { "type": "keyword" },
        "trace_id": { "type": "keyword" },
        "span_id": { "type": "keyword" },
        "response_time_ms": { "type": "long" },
        "status_code": { "type": "integer" }
      }
    }
  }
}
```

### Étape 4: Créer l'index template final

```bash
PUT /_index_template/parkki-logs-template
{
  "index_patterns": ["logs-parkki-*"],
  "data_stream": {},
  "priority": 500,
  "composed_of": [
    "parkki-settings",
    "parkki-mappings"
  ],
  "_meta": {
    "description": "Template pour logs Parkki avec ILM"
  }
}
```

### Étape 5: Tester la configuration complète

```bash
# Indexer un document (crée le data stream)
POST /logs-parkki-prod/_doc
{
  "@timestamp": "2025-01-15T10:00:00.000Z",
  "level": "INFO",
  "service": "parkki-api",
  "message": "Production log with ILM",
  "user_id": "user_001",
  "trace_id": "abc123",
  "response_time_ms": 45,
  "status_code": 200
}

# Vérifier le data stream
GET /_data_stream/logs-parkki-prod

# Vérifier ILM
GET /logs-parkki-prod/_ilm/explain

# Vérifier le mapping
GET /.ds-logs-parkki-prod-*/_mapping
```

### Étape 6: Rollover manuel pour test

```bash
POST /logs-parkki-prod/_rollover

# Vérifier les backing indices
GET /_cat/indices/.ds-logs-parkki-prod-*?v
```

### Résumé de la configuration

| Composant | Valeur |
|-----------|--------|
| Rollover | 1 jour OU 20GB |
| Hot phase | Jours 0-2 |
| Warm phase | Jours 2-10 (readonly, forcemerge) |
| Delete | Après 10 jours |
| Shards | 1 primaire + 1 replica |
| Refresh | 30 secondes |
| Compression | best_compression |

### Économies estimées

```
Sans ILM (10 jours d'index ouverts):
- 10 × 15 GB = 150 GB hot
- RAM nécessaire (ratio 1:30) = 5 GB

Avec ILM (2 jours hot, 8 jours warm):
- 2 × 15 GB = 30 GB hot → RAM 1 GB
- 8 × 15 GB = 120 GB warm → RAM 0.75 GB
- Total RAM: 1.75 GB vs 5 GB = -65% !
```

### Validation

✅ Avoir une configuration ILM de production prête pour Parkki

---

# Lab 7.1: Comprendre les Segments et le Merge

**Topic**: Operating et Troubleshooting
**Durée**: 20 minutes

## Objectif

Comprendre le processus d'indexation interne et l'impact des segments sur les performances.

## Contexte Parkki

Avec 15M logs/jour, comprendre les segments est essentiel pour diagnostiquer les problèmes de performance.

## Concepts clés

```
Document → Index Buffer → Segment (refresh) → Merge → Segment final
                              │
                              └─ Chaque refresh crée un nouveau segment
                                 Trop de segments = overhead JVM
```

## Exercice

### Étape 1: Créer un index de test

```bash
PUT /logs-segments-test
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "refresh_interval": "1s"
  }
}
```

### Étape 2: Indexer quelques documents

```bash
POST /_bulk
{"index":{"_index":"logs-segments-test"}}
{"@timestamp":"2025-01-15T10:00:00.000Z","message":"Log 1"}
{"index":{"_index":"logs-segments-test"}}
{"@timestamp":"2025-01-15T10:00:01.000Z","message":"Log 2"}
{"index":{"_index":"logs-segments-test"}}
{"@timestamp":"2025-01-15T10:00:02.000Z","message":"Log 3"}
```

### Étape 3: Voir les segments

```bash
GET /_cat/segments/logs-segments-test?v
```

**Observer** :
- `segment` : nom du segment
- `generation` : numéro de génération
- `docs.count` : nombre de documents
- `size` : taille du segment

### Étape 4: Forcer un refresh et voir les nouveaux segments

```bash
# Indexer plus de documents
POST /logs-segments-test/_doc
{"@timestamp":"2025-01-15T10:01:00.000Z","message":"Log 4"}

# Forcer un refresh
POST /logs-segments-test/_refresh

# Voir les segments
GET /_cat/segments/logs-segments-test?v
```

### Étape 5: Force merge

```bash
# Fusionner tous les segments en 1 seul
POST /logs-segments-test/_forcemerge?max_num_segments=1

# Vérifier le résultat
GET /_cat/segments/logs-segments-test?v
```

### Impact des segments

| Nombre de segments | Impact |
|-------------------|--------|
| Peu (1-5) | Recherches rapides |
| Beaucoup (>50) | Overhead mémoire, recherches lentes |
| Après force merge | Optimal pour lecture |

### Validation

✅ Comprendre le cycle de vie des segments

---

# Lab 7.2: Configuration des Slowlogs

**Topic**: Operating et Troubleshooting
**Durée**: 20 minutes

## Objectif

Configurer les slowlogs pour identifier les requêtes lentes.

## Contexte Parkki

Les slowlogs sont essentiels pour identifier pourquoi certaines requêtes prennent du temps.

## Exercice

### Étape 1: Configurer les slowlogs sur un index

```bash
PUT /logs-search/_settings
{
  "index.search.slowlog.threshold.query.warn": "5s",
  "index.search.slowlog.threshold.query.info": "2s",
  "index.search.slowlog.threshold.query.debug": "1s",
  "index.search.slowlog.threshold.query.trace": "500ms",
  "index.search.slowlog.threshold.fetch.warn": "1s",
  "index.search.slowlog.threshold.fetch.info": "500ms",
  "index.indexing.slowlog.threshold.index.warn": "10s",
  "index.indexing.slowlog.threshold.index.info": "5s"
}
```

### Étape 2: Vérifier la configuration

```bash
GET /logs-search/_settings?filter_path=**.slowlog
```

### Étape 3: Exécuter une requête complexe

```bash
GET /logs-search/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "message": "error connection timeout" } }
      ],
      "filter": [
        { "range": { "@timestamp": { "gte": "now-1d" } } }
      ]
    }
  },
  "aggs": {
    "par_level": {
      "terms": { "field": "level" }
    },
    "par_service": {
      "terms": { "field": "service" }
    }
  }
}
```

### Étape 4: Où trouver les slowlogs

**Elastic Cloud** :
- Stack Monitoring > Logs
- Ou via l'API logs

**Self-hosted** :
```bash
# Emplacement typique
/var/log/elasticsearch/<cluster_name>_index_search_slowlog.json
/var/log/elasticsearch/<cluster_name>_index_indexing_slowlog.json
```

### Étape 5: Configurer via template pour tous les index

```bash
PUT /_index_template/logs-slowlog-template
{
  "index_patterns": ["logs-*"],
  "priority": 100,
  "template": {
    "settings": {
      "index.search.slowlog.threshold.query.warn": "5s",
      "index.search.slowlog.threshold.query.info": "2s",
      "index.indexing.slowlog.threshold.index.warn": "10s"
    }
  }
}
```

### Seuils recommandés pour Parkki

| Type | Warn | Info |
|------|------|------|
| Query | 5s | 2s |
| Fetch | 1s | 500ms |
| Indexing | 10s | 5s |

### Validation

✅ Savoir configurer et utiliser les slowlogs

---

# Lab 7.3: Debug des Shards Non Assignés

**Topic**: Operating et Troubleshooting
**Durée**: 25 minutes

## Objectif

Diagnostiquer et résoudre les problèmes de shards non assignés.

## Contexte Parkki

Un cluster "yellow" ou "red" indique des shards non assignés. Savoir les diagnostiquer est critique.

## Exercice

### Étape 1: Voir l'état du cluster

```bash
GET /_cluster/health
```

### Étape 2: Identifier les shards non assignés

```bash
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason&s=state
```

**États possibles** :
- `STARTED` : OK
- `INITIALIZING` : En cours d'initialisation
- `RELOCATING` : En cours de déplacement
- `UNASSIGNED` : Non assigné (problème !)

### Étape 3: Comprendre pourquoi un shard n'est pas assigné

```bash
GET /_cluster/allocation/explain
{
  "index": "logs-search",
  "shard": 0,
  "primary": false
}
```

**Ou automatiquement pour le premier shard non assigné** :
```bash
GET /_cluster/allocation/explain
```

### Étape 4: Causes courantes et solutions

| Raison | Cause | Solution |
|--------|-------|----------|
| `CLUSTER_RECOVERED` | Cluster en recovery | Attendre |
| `INDEX_CREATED` | Index vient d'être créé | Attendre |
| `NODE_LEFT` | Nœud parti | Attendre le retour ou réassigner |
| `ALLOCATION_FAILED` | Échec d'allocation | Vérifier les logs |
| `NO_VALID_SHARD_COPY` | Pas de copie valide | Données potentiellement perdues |
| `DISK_THRESHOLD` | Watermark atteint | Libérer de l'espace |

### Étape 5: Simuler un problème de replica (single-node)

```bash
# Créer un index avec replica
PUT /test-unassigned
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 1
  }
}

# Vérifier - le replica sera UNASSIGNED car on n'a qu'un nœud
GET /_cat/shards/test-unassigned?v
```

### Étape 6: Résoudre en ajustant les replicas

```bash
PUT /test-unassigned/_settings
{
  "number_of_replicas": 0
}

# Vérifier
GET /_cat/shards/test-unassigned?v
GET /_cluster/health
```

### Étape 7: Forcer une réallocation (cas extrême)

```bash
# Réassigner un shard manuellement (à utiliser avec précaution !)
POST /_cluster/reroute
{
  "commands": [
    {
      "allocate_replica": {
        "index": "logs-search",
        "shard": 0,
        "node": "node-1"
      }
    }
  ]
}
```

### Validation

✅ Savoir diagnostiquer et résoudre les problèmes de shards

---

# Lab 7.4: Gestion de la Mémoire JVM

**Topic**: Operating et Troubleshooting
**Durée**: 25 minutes

## Objectif

Comprendre et diagnostiquer les problèmes de mémoire JVM.

## Contexte Parkki

Les problèmes JVM sont votre principal souci. Ce lab est critique.

## Exercice

### Étape 1: Voir l'utilisation de la heap

```bash
GET /_cat/nodes?v&h=name,heap.percent,heap.current,heap.max,ram.percent
```

### Étape 2: Stats JVM détaillées

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem
```

**Champs importants** :
- `heap_used_percent` : % de heap utilisée
- `heap_used_in_bytes` : Heap utilisée
- `heap_max_in_bytes` : Heap max

### Étape 3: Voir le Garbage Collection

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.gc
```

**Observer** :
- `collection_count` : Nombre de GC
- `collection_time_in_millis` : Temps passé en GC

### Étape 4: Seuils critiques

| Métrique | OK | Attention | Critique |
|----------|----|-----------||----------|
| Heap % | < 75% | 75-85% | > 85% |
| GC time | < 5% | 5-10% | > 10% |

### Étape 5: Voir la configuration JVM

```bash
GET /_nodes?filter_path=nodes.*.jvm.mem.heap_max_in_bytes,nodes.*.jvm.mem.heap_init_in_bytes
```

### Étape 6: Recommandations JVM

```
Configuration recommandée :
- Heap = 50% de la RAM disponible
- Max heap = 31 GB (compressed oops)
- Min heap = Max heap (éviter resize)

Pour un nœud avec 16 GB RAM :
- Heap : 8 GB
- ES_JAVA_OPTS="-Xms8g -Xmx8g"
```

### Étape 7: Hot threads (debug performance)

```bash
GET /_nodes/hot_threads
```

Cette API montre les threads les plus actifs - utile pour diagnostiquer les pics CPU.

### Symptômes et solutions JVM

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| Heap > 85% constant | Trop de données | Réduire shards, augmenter refresh_interval |
| GC fréquents | Fielddata, trop de shards | Utiliser keyword, réduire shards |
| OOM (Out of Memory) | Heap insuffisante | Augmenter heap (max 31GB) |
| Latence variable | GC stop-the-world | Optimiser mapping, réduire fielddata |

### Validation

✅ Savoir diagnostiquer les problèmes JVM

---

# Lab 7.5: Field Data Cache

**Topic**: Operating et Troubleshooting
**Durée**: 20 minutes

## Objectif

Comprendre et surveiller le Field Data Cache.

## Contexte Parkki

Le fielddata est souvent la cause cachée des problèmes JVM.

## Concepts

```
Fielddata = Cache mémoire pour :
- Aggregations sur champs text (à éviter !)
- Scripts sur champs text
- Tri sur champs text

Problème : Le fielddata peut exploser la heap !
```

## Exercice

### Étape 1: Voir l'utilisation du fielddata

```bash
GET /_cat/fielddata?v
```

### Étape 2: Fielddata par champ

```bash
GET /_cat/fielddata?v&fields=*
```

### Étape 3: Stats détaillées du fielddata

```bash
GET /_nodes/stats/indices/fielddata?fields=*
```

### Étape 4: Simuler un problème de fielddata

```bash
# Créer un index avec un champ text
PUT /test-fielddata
{
  "mappings": {
    "properties": {
      "description": { "type": "text" }
    }
  }
}

# Indexer des documents
POST /_bulk
{"index":{"_index":"test-fielddata"}}
{"description":"This is a test description for fielddata"}
{"index":{"_index":"test-fielddata"}}
{"description":"Another description to test fielddata cache"}
```

### Étape 5: Essayer une aggregation sur text (génère une erreur)

```bash
GET /test-fielddata/_search
{
  "size": 0,
  "aggs": {
    "descriptions": {
      "terms": { "field": "description" }
    }
  }
}
```

**Résultat** : Erreur ! Fielddata désactivé par défaut sur les champs text.

### Étape 6: Solution correcte - utiliser keyword

```bash
PUT /test-fielddata-fixed
{
  "mappings": {
    "properties": {
      "description": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      }
    }
  }
}

POST /test-fielddata-fixed/_doc
{"description":"Test description"}

# Aggregation correcte sur le sous-champ keyword
GET /test-fielddata-fixed/_search
{
  "size": 0,
  "aggs": {
    "descriptions": {
      "terms": { "field": "description.keyword" }
    }
  }
}
```

### Étape 7: Limiter le fielddata cache

```bash
# Configuration cluster (à faire avec précaution)
PUT /_cluster/settings
{
  "transient": {
    "indices.fielddata.cache.size": "20%"
  }
}
```

### Points clés pour Parkki

| Problème | Solution |
|----------|----------|
| Aggregation sur text | Utiliser keyword |
| Fielddata élevé | Vérifier les mappings |
| Heap surchargée | Limiter fielddata cache |

### Validation

✅ Comprendre et éviter les problèmes de fielddata

---

# Lab 7.6: CAT APIs pour le Troubleshooting

**Topic**: Operating et Troubleshooting
**Durée**: 15 minutes

## Objectif

Maîtriser les CAT APIs pour le diagnostic rapide.

## Exercice

### Étape 1: Santé du cluster

```bash
GET /_cat/health?v
```

### Étape 2: Nœuds avec métriques clés

```bash
GET /_cat/nodes?v&h=name,ip,heap.percent,ram.percent,cpu,load_1m,node.role
```

### Étape 3: Indices triés par taille

```bash
GET /_cat/indices?v&h=index,health,pri,rep,docs.count,store.size&s=store.size:desc
```

### Étape 4: Shards avec leur état

```bash
GET /_cat/shards?v&h=index,shard,prirep,state,docs,store,node&s=state
```

### Étape 5: Allocation disque

```bash
GET /_cat/allocation?v&h=node,shards,disk.indices,disk.used,disk.avail,disk.percent
```

### Étape 6: Thread pools

```bash
GET /_cat/thread_pool?v&h=node_name,name,active,queue,rejected&s=rejected:desc
```

### Étape 7: Pending tasks

```bash
GET /_cat/pending_tasks?v
```

### Étape 8: Recovery en cours

```bash
GET /_cat/recovery?v&active_only=true
```

### Cheatsheet CAT APIs

| Commande | Usage |
|----------|-------|
| `_cat/health` | État général du cluster |
| `_cat/nodes` | Ressources des nœuds |
| `_cat/indices` | Liste et taille des index |
| `_cat/shards` | Allocation des shards |
| `_cat/allocation` | Espace disque |
| `_cat/thread_pool` | Rejections |
| `_cat/pending_tasks` | Tâches en attente |
| `_cat/recovery` | Recoveries en cours |
| `_cat/segments` | Segments par shard |
| `_cat/fielddata` | Utilisation fielddata |

### Validation

✅ Connaître les CAT APIs essentielles pour le troubleshooting

---

# Lab 8.1: Cluster Health API en Détail

**Topic**: Monitoring approfondi
**Durée**: 20 minutes

## Objectif

Maîtriser l'API Cluster Health pour le monitoring.

## Exercice

### Étape 1: Santé globale du cluster

```bash
GET /_cluster/health
```

**Champs importants** :
- `status` : green/yellow/red
- `number_of_nodes` : Nombre de nœuds
- `active_primary_shards` : Shards primaires actifs
- `active_shards` : Total shards actifs
- `unassigned_shards` : Shards non assignés

### Étape 2: Santé par index

```bash
GET /_cluster/health?level=indices
```

### Étape 3: Santé par shard

```bash
GET /_cluster/health?level=shards
```

### Étape 4: Attendre un état spécifique

```bash
# Attendre que le cluster soit green (timeout 30s)
GET /_cluster/health?wait_for_status=green&timeout=30s

# Attendre qu'il n'y ait plus de relocating shards
GET /_cluster/health?wait_for_no_relocating_shards=true&timeout=30s
```

### Étape 5: Cluster stats complets

```bash
GET /_cluster/stats?human
```

### Étape 6: Filtrer les informations

```bash
GET /_cluster/stats?filter_path=indices.count,indices.shards,nodes.count
```

### Interprétation des états

| Status | Signification | Action |
|--------|---------------|--------|
| **green** | Tous les shards assignés | RAS |
| **yellow** | Primaires OK, replicas manquants | Vérifier replicas |
| **red** | Primaires manquants | URGENT ! |

### Validation

✅ Savoir interpréter l'état de santé du cluster

---

# Lab 8.2: Node Stats API

**Topic**: Monitoring approfondi
**Durée**: 25 minutes

## Objectif

Utiliser l'API Node Stats pour le monitoring détaillé.

## Exercice

### Étape 1: Stats complètes d'un nœud

```bash
GET /_nodes/stats
```

### Étape 2: Filtrer par catégorie

```bash
# JVM uniquement
GET /_nodes/stats/jvm

# Indices uniquement
GET /_nodes/stats/indices

# OS uniquement
GET /_nodes/stats/os

# Thread pools
GET /_nodes/stats/thread_pool
```

### Étape 3: Stats JVM détaillées

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem,nodes.*.jvm.gc
```

### Étape 4: Stats d'indexation

```bash
GET /_nodes/stats/indices/indexing
```

**Métriques clés** :
- `index_total` : Documents indexés
- `index_time_in_millis` : Temps d'indexation
- `index_failed` : Échecs d'indexation

### Étape 5: Stats de recherche

```bash
GET /_nodes/stats/indices/search
```

**Métriques clés** :
- `query_total` : Nombre de requêtes
- `query_time_in_millis` : Temps total de recherche
- `fetch_total` : Nombre de fetch

### Étape 6: Stats disque et FS

```bash
GET /_nodes/stats/fs
```

### Étape 7: Calculer les ratios de performance

```bash
# Voir toutes les stats d'indices
GET /_nodes/stats/indices?filter_path=nodes.*.indices.indexing,nodes.*.indices.search,nodes.*.indices.merges
```

**Calculs utiles** :
```
Latence moyenne indexation = index_time_in_millis / index_total
Latence moyenne recherche = query_time_in_millis / query_total
Temps de merge = merges.total_time_in_millis
```

### Métriques à surveiller

| Métrique | Seuil d'alerte | Action |
|----------|----------------|--------|
| `jvm.mem.heap_used_percent` | > 85% | Optimiser ou scale |
| `thread_pool.*.rejected` | > 0 | Réduire charge |
| `fs.total.available_in_bytes` | < 15% | Libérer espace |
| `indices.indexing.index_failed` | > 0 | Investiguer erreurs |

### Validation

✅ Savoir extraire et interpréter les métriques des nœuds

---

# Lab 8.3: Index Stats API

**Topic**: Monitoring approfondi
**Durée**: 20 minutes

## Objectif

Surveiller les performances au niveau des index.

## Exercice

### Étape 1: Stats d'un index spécifique

```bash
GET /logs-search/_stats
```

### Étape 2: Stats pour tous les index

```bash
GET /_stats
```

### Étape 3: Filtrer par type de stats

```bash
# Stats d'indexation
GET /logs-search/_stats/indexing

# Stats de recherche
GET /logs-search/_stats/search

# Stats de merge
GET /logs-search/_stats/merge

# Stats de refresh
GET /logs-search/_stats/refresh

# Stats de flush
GET /logs-search/_stats/flush
```

### Étape 4: Stats combinées

```bash
GET /logs-search/_stats/indexing,search,merge
```

### Étape 5: Voir les segments d'un index

```bash
GET /logs-search/_segments
```

### Étape 6: Voir le mapping et settings

```bash
# Mapping
GET /logs-search/_mapping

# Settings
GET /logs-search/_settings

# Les deux
GET /logs-search
```

### Métriques index à surveiller

| Métrique | Description | Action si élevé |
|----------|-------------|-----------------|
| `primaries.indexing.index_time` | Temps d'indexation | Optimiser bulk |
| `primaries.search.query_time` | Temps de recherche | Optimiser requêtes |
| `primaries.merges.total_time` | Temps de merge | Augmenter refresh_interval |
| `primaries.refresh.total_time` | Temps de refresh | Augmenter refresh_interval |

### Validation

✅ Savoir surveiller les performances d'un index

---

# Lab 8.4: Cluster Allocation Explain

**Topic**: Monitoring approfondi
**Durée**: 20 minutes

## Objectif

Comprendre en détail pourquoi les shards sont (ou ne sont pas) alloués.

## Exercice

### Étape 1: Explication automatique (premier shard non assigné)

```bash
GET /_cluster/allocation/explain
```

### Étape 2: Explication pour un shard spécifique

```bash
GET /_cluster/allocation/explain
{
  "index": "logs-search",
  "shard": 0,
  "primary": true
}
```

### Étape 3: Comprendre la réponse

**Champs importants** :
- `current_state` : État actuel du shard
- `unassigned_info.reason` : Raison du non-assignement
- `can_allocate` : Si le shard peut être alloué
- `allocate_explanation` : Explication détaillée
- `node_allocation_decisions` : Décisions par nœud

### Étape 4: Voir l'allocation sur un nœud spécifique

```bash
GET /_cluster/allocation/explain
{
  "index": "logs-search",
  "shard": 0,
  "primary": false,
  "current_node": "node-1"
}
```

### Étape 5: Raisons courantes de non-allocation

| Raison | Description | Solution |
|--------|-------------|----------|
| `INDEX_CREATED` | Index créé récemment | Attendre |
| `CLUSTER_RECOVERED` | Cluster en recovery | Attendre |
| `DANGLING_INDEX_IMPORTED` | Index dangling importé | Vérifier |
| `NEW_INDEX_RESTORED` | Restore en cours | Attendre |
| `REPLICA_ADDED` | Replica ajouté | Attendre |
| `ALLOCATION_FAILED` | Échec d'allocation | Investiguer |
| `NODE_LEFT` | Nœud parti | Attendre retour |
| `REROUTE_CANCELLED` | Reroute annulé | Réessayer |

### Étape 6: Comprendre les décisions par nœud

```bash
GET /_cluster/allocation/explain?include_disk_info=true
{
  "index": "logs-search",
  "shard": 0,
  "primary": false
}
```

### Validation

✅ Savoir diagnostiquer les problèmes d'allocation de shards

---

# Lab 8.5: Surveillance des Thread Pools

**Topic**: Monitoring approfondi
**Durée**: 20 minutes

## Objectif

Surveiller les thread pools pour détecter les problèmes de saturation.

## Contexte Parkki

Les rejections dans les thread pools indiquent une surcharge du cluster.

## Exercice

### Étape 1: Vue d'ensemble des thread pools

```bash
GET /_cat/thread_pool?v
```

### Étape 2: Filtrer les thread pools critiques

```bash
GET /_cat/thread_pool/write,search,bulk,get?v&h=node_name,name,active,queue,rejected,completed
```

### Étape 3: Stats détaillées des thread pools

```bash
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.write,nodes.*.thread_pool.search
```

### Étape 4: Configuration des thread pools

```bash
GET /_nodes?filter_path=nodes.*.thread_pool
```

### Étape 5: Surveiller en continu

```bash
# Exécuter plusieurs fois pour voir l'évolution
GET /_cat/thread_pool/write,search?v&h=node_name,name,active,queue,rejected
```

### Thread pools importants

| Pool | Usage | À surveiller |
|------|-------|--------------|
| `write` | Indexation | rejected > 0 |
| `search` | Recherches | rejected > 0, queue élevée |
| `bulk` | Bulk API | rejected > 0 |
| `get` | Get documents | queue élevée |
| `refresh` | Refresh | queue élevée |
| `flush` | Flush to disk | queue élevée |

### Étape 6: Que faire en cas de rejections

| Thread Pool | Cause probable | Solution |
|-------------|----------------|----------|
| `write` | Trop d'indexation | Réduire bulk size, augmenter refresh_interval |
| `search` | Trop de requêtes | Optimiser requêtes, ajouter nœuds |
| `bulk` | Bulk trop fréquents | Augmenter intervalle entre bulks |
| `get` | Trop de gets | Utiliser mget, cache applicatif |

### Validation

✅ Savoir surveiller et interpréter l'état des thread pools

---

# Lab 8.6: Métriques Clés pour Dashboard

**Topic**: Monitoring approfondi
**Durée**: 25 minutes

## Objectif

Identifier et collecter les métriques essentielles pour un dashboard de monitoring.

## Contexte Parkki

Ces métriques permettent d'anticiper les problèmes avant qu'ils ne deviennent critiques.

## Exercice

### Étape 1: Script de collecte des métriques clés

```bash
# Santé du cluster
GET /_cluster/health?filter_path=status,number_of_nodes,active_shards,unassigned_shards

# JVM
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_used_percent

# Disque
GET /_cat/allocation?format=json&h=node,disk.percent

# Thread pools
GET /_cat/thread_pool/write,search?format=json&h=node_name,name,rejected

# Indexing rate
GET /_nodes/stats/indices/indexing?filter_path=nodes.*.indices.indexing.index_total

# Search rate
GET /_nodes/stats/indices/search?filter_path=nodes.*.indices.search.query_total
```

### Étape 2: Métriques avec seuils d'alerte

| Métrique | Source | Seuil Warning | Seuil Critical |
|----------|--------|---------------|----------------|
| Cluster status | `_cluster/health` | yellow | red |
| JVM Heap % | `_nodes/stats/jvm` | > 75% | > 85% |
| Disk % | `_cat/allocation` | > 75% | > 85% |
| Rejections | `_cat/thread_pool` | > 0 (alerte) | > 100 |
| Unassigned shards | `_cluster/health` | > 0 | > 0 (primaires) |

### Étape 3: Créer un endpoint de health check

```bash
# Check complet en une requête
GET /_cluster/health?wait_for_status=yellow&timeout=5s
```

### Étape 4: Surveiller les latences

```bash
# Latence moyenne de recherche
GET /_nodes/stats/indices/search?filter_path=nodes.*.indices.search.query_time_in_millis,nodes.*.indices.search.query_total

# Latence moyenne d'indexation
GET /_nodes/stats/indices/indexing?filter_path=nodes.*.indices.indexing.index_time_in_millis,nodes.*.indices.indexing.index_total
```

### Étape 5: Vérification rapide de l'état

```bash
# One-liner pour état rapide
GET /_cat/nodes?v&h=name,heap.percent,cpu,disk.used_percent,node.role
```

### Dashboard recommandé pour Parkki

```
┌─────────────────────────────────────────────────────┐
│  Cluster: parkki-prod    Status: ● GREEN            │
├─────────────────────────────────────────────────────┤
│  Nodes: 3    Indices: 45    Shards: 180            │
├─────────────────────────────────────────────────────┤
│  JVM Heap        │  Disk Usage      │  CPU          │
│  ████████░░ 78%  │  ██████░░░░ 60%  │  ███░░░ 30%   │
├─────────────────────────────────────────────────────┤
│  Indexing: 15,234 docs/s    Search: 245 req/s      │
│  Latency (p99): 450ms       Rejections: 0          │
├─────────────────────────────────────────────────────┤
│  Alertes actives: 0                                 │
└─────────────────────────────────────────────────────┘
```

### Validation

✅ Connaître les métriques essentielles pour le monitoring

---

# Lab 9.1: Introduction au Watcher API

**Topic**: Alerting
**Durée**: 25 minutes

## Objectif

Comprendre la structure d'une watch et créer des alertes basiques.

## Contexte Parkki

L'alerting est critique pour anticiper les problèmes avant qu'ils n'impactent vos utilisateurs (JVM, disk, erreurs).

## Structure d'une Watch

```
Watch
├── trigger    → Quand exécuter ? (schedule)
├── input      → Quelles données récupérer ? (search, http)
├── condition  → Faut-il alerter ? (compare, script)
└── actions    → Que faire ? (email, webhook, slack)
```

## Exercice

### Étape 1: Vérifier que Watcher est disponible

```bash
GET /_watcher/stats
```

### Étape 2: Créer une watch simple (erreurs applicatives)

```bash
PUT /_watcher/watch/parkki-errors-watch
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["logs-*"],
        "body": {
          "size": 0,
          "query": {
            "bool": {
              "filter": [
                { "term": { "level": "ERROR" } },
                { "range": { "@timestamp": { "gte": "now-5m" } } }
              ]
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.hits.total.value": {
        "gt": 10
      }
    }
  },
  "actions": {
    "log_error": {
      "logging": {
        "text": "ALERTE: {{ctx.payload.hits.total.value}} erreurs détectées dans les 5 dernières minutes!"
      }
    }
  }
}
```

### Étape 3: Voir la watch créée

```bash
GET /_watcher/watch/parkki-errors-watch
```

### Étape 4: Exécuter la watch manuellement (test)

```bash
POST /_watcher/watch/parkki-errors-watch/_execute
```

### Étape 5: Voir le résultat d'exécution

**Observer** :
- `watch_record.result.condition.met` : true/false
- `watch_record.result.actions` : actions exécutées

### Validation

✅ Comprendre la structure d'une watch

---

# Lab 9.2: Watch pour Monitoring JVM

**Topic**: Alerting
**Durée**: 25 minutes

## Objectif

Créer une alerte sur l'utilisation de la heap JVM.

## Contexte Parkki

Les problèmes JVM sont votre souci principal. Cette alerte vous préviendra avant que ça ne devienne critique.

## Exercice

### Étape 1: Créer une watch JVM heap

```bash
PUT /_watcher/watch/parkki-jvm-heap-watch
{
  "trigger": {
    "schedule": {
      "interval": "1m"
    }
  },
  "input": {
    "http": {
      "request": {
        "host": "localhost",
        "port": 9200,
        "path": "/_nodes/stats/jvm",
        "params": {
          "filter_path": "nodes.*.jvm.mem.heap_used_percent,nodes.*.name"
        }
      }
    }
  },
  "condition": {
    "script": {
      "source": """
        for (node in ctx.payload.nodes.values()) {
          if (node.jvm.mem.heap_used_percent > 85) {
            return true;
          }
        }
        return false;
      """
    }
  },
  "actions": {
    "log_jvm_alert": {
      "logging": {
        "text": "ALERTE JVM: Heap > 85% détectée!"
      }
    }
  }
}
```

### Étape 2: Tester la watch

```bash
POST /_watcher/watch/parkki-jvm-heap-watch/_execute
```

### Étape 3: Voir l'historique des exécutions

```bash
GET /.watcher-history-*/_search
{
  "query": {
    "term": { "watch_id": "parkki-jvm-heap-watch" }
  },
  "sort": [{ "trigger_event.triggered_time": "desc" }],
  "size": 5
}
```

### Seuils JVM recommandés

| Seuil | Action |
|-------|--------|
| > 75% | Warning - surveiller |
| > 85% | Critical - intervenir |
| > 95% | Emergency - action immédiate |

### Validation

✅ Savoir créer une alerte sur les métriques JVM

---

# Lab 9.3: Watch pour Disk Watermarks

**Topic**: Alerting
**Durée**: 20 minutes

## Objectif

Créer une alerte sur l'utilisation disque.

## Contexte Parkki

Les watermarks peuvent bloquer l'indexation. Il faut être alerté avant d'atteindre les seuils.

## Exercice

### Étape 1: Créer une watch disk

```bash
PUT /_watcher/watch/parkki-disk-watch
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "http": {
      "request": {
        "host": "localhost",
        "port": 9200,
        "path": "/_cat/allocation",
        "params": {
          "format": "json",
          "h": "node,disk.percent"
        }
      }
    }
  },
  "condition": {
    "script": {
      "source": """
        for (node in ctx.payload) {
          def diskPercent = Integer.parseInt(node['disk.percent'].replace('%', '').trim());
          if (diskPercent > 80) {
            return true;
          }
        }
        return false;
      """
    }
  },
  "actions": {
    "log_disk_alert": {
      "logging": {
        "text": "ALERTE DISK: Utilisation disque > 80%!"
      }
    }
  }
}
```

### Étape 2: Tester

```bash
POST /_watcher/watch/parkki-disk-watch/_execute
```

### Rappel des watermarks

| Watermark | Seuil | Impact |
|-----------|-------|--------|
| Low | 85% | Nouveaux shards bloqués |
| High | 90% | Shards relocalisés |
| Flood | 95% | Index en READ-ONLY |

### Validation

✅ Savoir créer une alerte sur l'espace disque

---

# Lab 9.4: Watch pour Thread Pool Rejections

**Topic**: Alerting
**Durée**: 20 minutes

## Objectif

Créer une alerte sur les rejections des thread pools.

## Contexte Parkki

Les rejections indiquent une surcharge. Il faut être alerté immédiatement.

## Exercice

### Étape 1: Créer une watch thread pool

```bash
PUT /_watcher/watch/parkki-threadpool-watch
{
  "trigger": {
    "schedule": {
      "interval": "2m"
    }
  },
  "input": {
    "http": {
      "request": {
        "host": "localhost",
        "port": 9200,
        "path": "/_cat/thread_pool/write,search,bulk",
        "params": {
          "format": "json",
          "h": "node_name,name,rejected"
        }
      }
    }
  },
  "condition": {
    "script": {
      "source": """
        for (pool in ctx.payload) {
          if (pool.rejected != null && Integer.parseInt(pool.rejected) > 0) {
            return true;
          }
        }
        return false;
      """
    }
  },
  "actions": {
    "log_rejection_alert": {
      "logging": {
        "text": "ALERTE THREADPOOL: Rejections détectées! Vérifier la charge du cluster."
      }
    }
  }
}
```

### Étape 2: Tester

```bash
POST /_watcher/watch/parkki-threadpool-watch/_execute
```

### Validation

✅ Savoir alerter sur les rejections thread pool

---

# Lab 9.5: Watch avec Action Webhook

**Topic**: Alerting
**Durée**: 20 minutes

## Objectif

Configurer une action webhook pour envoyer des alertes vers un système externe.

## Contexte Parkki

En production, vous voudrez envoyer les alertes vers Slack, Teams, PagerDuty, etc.

## Exercice

### Étape 1: Créer une watch avec webhook (exemple Slack)

```bash
PUT /_watcher/watch/parkki-slack-alert
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["logs-*"],
        "body": {
          "size": 0,
          "query": {
            "bool": {
              "filter": [
                { "term": { "level": "ERROR" } },
                { "range": { "@timestamp": { "gte": "now-5m" } } }
              ]
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.hits.total.value": {
        "gt": 5
      }
    }
  },
  "actions": {
    "notify_slack": {
      "webhook": {
        "scheme": "https",
        "host": "hooks.slack.com",
        "port": 443,
        "method": "post",
        "path": "/services/YOUR/SLACK/WEBHOOK",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": """{"text": "🚨 Parkki Alert: {{ctx.payload.hits.total.value}} erreurs détectées dans les 5 dernières minutes!"}"""
      }
    },
    "log_action": {
      "logging": {
        "text": "Alerte envoyée: {{ctx.payload.hits.total.value}} erreurs"
      }
    }
  }
}
```

**Note**: Remplacer `YOUR/SLACK/WEBHOOK` par votre vrai webhook.

### Étape 2: Structure d'un webhook générique

```bash
PUT /_watcher/watch/parkki-generic-webhook
{
  "trigger": {
    "schedule": { "interval": "5m" }
  },
  "input": {
    "simple": {
      "message": "Test webhook"
    }
  },
  "condition": {
    "always": {}
  },
  "actions": {
    "call_api": {
      "webhook": {
        "scheme": "https",
        "host": "your-api.example.com",
        "port": 443,
        "method": "post",
        "path": "/alerts",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer YOUR_TOKEN"
        },
        "body": """{"alert": "parkki", "message": "{{ctx.payload.message}}"}"""
      }
    }
  }
}
```

### Validation

✅ Savoir configurer des webhooks pour les alertes

---

# Lab 9.6: Stack Beats - Metricbeat et Filebeat

**Topic**: Alerting et Monitoring
**Durée**: 30 minutes

## Objectif

Comprendre et configurer Metricbeat et Filebeat pour collecter métriques et logs.

## Contexte Parkki

Les Beats sont essentiels pour :
- **Metricbeat** : Collecter les métriques système et Elasticsearch
- **Filebeat** : Collecter les logs applicatifs et Elasticsearch

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Serveurs Parkki                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Metricbeat  │  │  Filebeat   │  │  Filebeat   │          │
│  │ (métriques) │  │   (logs)    │  │ (logs app)  │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                  ┌─────────────────┐
                  │  Elasticsearch  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │     Kibana      │
                  │ Stack Monitoring│
                  └─────────────────┘
```

## Exercice

### Partie 1: Metricbeat

#### Étape 1: Lancer Metricbeat avec Docker

```bash
docker run -d \
  --name metricbeat \
  --net elastic \
  --user root \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /sys/fs/cgroup:/hostfs/sys/fs/cgroup:ro \
  -v /proc:/hostfs/proc:ro \
  -v /:/hostfs:ro \
  -e ELASTICSEARCH_HOSTS=http://elasticsearch:9200 \
  docker.elastic.co/beats/metricbeat:8.11.0 \
  metricbeat -e -system.hostfs=/hostfs
```

#### Étape 2: Vérifier les index Metricbeat

```bash
GET /_cat/indices/metricbeat-*?v&s=index
```

#### Étape 3: Voir les métriques système

```bash
GET /metricbeat-*/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "metricset.name": "cpu" } },
        { "range": { "@timestamp": { "gte": "now-5m" } } }
      ]
    }
  },
  "sort": [{ "@timestamp": "desc" }],
  "size": 5,
  "_source": ["@timestamp", "system.cpu.user.pct", "system.cpu.system.pct", "host.name"]
}
```

#### Étape 4: Voir les métriques mémoire

```bash
GET /metricbeat-*/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "metricset.name": "memory" } },
        { "range": { "@timestamp": { "gte": "now-5m" } } }
      ]
    }
  },
  "sort": [{ "@timestamp": "desc" }],
  "size": 5,
  "_source": ["@timestamp", "system.memory.used.pct", "system.memory.actual.used.bytes", "host.name"]
}
```

#### Étape 5: Configuration Metricbeat pour Elasticsearch monitoring

```yaml
# metricbeat.yml - extrait pour monitoring Elasticsearch
metricbeat.modules:
- module: elasticsearch
  xpack.enabled: true
  period: 10s
  hosts: ["http://elasticsearch:9200"]
  scope: cluster

- module: system
  period: 30s
  metricsets:
    - cpu
    - memory
    - network
    - process
    - filesystem
    - diskio
```

### Partie 2: Filebeat

#### Étape 6: Lancer Filebeat avec Docker

```bash
docker run -d \
  --name filebeat \
  --net elastic \
  --user root \
  -v /var/log:/var/log:ro \
  -v /var/lib/docker/containers:/var/lib/docker/containers:ro \
  -e ELASTICSEARCH_HOSTS=http://elasticsearch:9200 \
  docker.elastic.co/beats/filebeat:8.11.0
```

#### Étape 7: Vérifier les index Filebeat

```bash
GET /_cat/indices/filebeat-*?v&s=index
```

#### Étape 8: Voir les logs collectés

```bash
GET /filebeat-*/_search
{
  "query": {
    "bool": {
      "filter": [
        { "range": { "@timestamp": { "gte": "now-10m" } } }
      ]
    }
  },
  "sort": [{ "@timestamp": "desc" }],
  "size": 10,
  "_source": ["@timestamp", "message", "log.file.path", "host.name"]
}
```

#### Étape 9: Configuration Filebeat pour logs applicatifs Parkki

```yaml
# filebeat.yml - extrait pour logs Parkki
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/parkki-api/*.log
  fields:
    service: parkki-api
  fields_under_root: true
  multiline:
    pattern: '^\d{4}-\d{2}-\d{2}'
    negate: true
    match: after

- type: log
  enabled: true
  paths:
    - /var/log/parkki-worker/*.log
  fields:
    service: parkki-worker
  fields_under_root: true

processors:
  - add_host_metadata: ~
  - add_docker_metadata: ~
  - decode_json_fields:
      fields: ["message"]
      target: ""
      overwrite_keys: true
```

### Partie 3: Monitoring Elasticsearch avec Beats

#### Étape 10: Voir les métriques Elasticsearch (si Metricbeat configuré)

```bash
GET /metricbeat-*/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "metricset.module": "elasticsearch" } },
        { "range": { "@timestamp": { "gte": "now-5m" } } }
      ]
    }
  },
  "sort": [{ "@timestamp": "desc" }],
  "size": 5
}
```

### Comparaison Metricbeat vs Filebeat

| Aspect | Metricbeat | Filebeat |
|--------|------------|----------|
| **Type de données** | Métriques (CPU, RAM, disk) | Logs (fichiers texte) |
| **Format** | Structuré (JSON) | Texte ou JSON |
| **Modules** | system, docker, elasticsearch, etc. | system, nginx, elasticsearch, etc. |
| **Fréquence** | Périodique (10s, 30s) | Temps réel (tail) |
| **Use case Parkki** | Monitoring infra | Logs applicatifs |

### Index patterns pour Parkki

| Beat | Index Pattern | Usage |
|------|---------------|-------|
| Metricbeat | `metricbeat-*` | Dashboard infrastructure |
| Filebeat | `filebeat-*` | Analyse logs |
| APM | `traces-apm-*` | Traces application |

### Validation

✅ Comprendre le rôle de Metricbeat et Filebeat dans l'observabilité

---

# Lab 9.7: Gestion des Watchers

**Topic**: Alerting
**Durée**: 15 minutes

## Objectif

Gérer le cycle de vie des watchers.

## Exercice

### Étape 1: Lister toutes les watches

```bash
GET /_watcher/_query/watches
{
  "query": {
    "match_all": {}
  }
}
```

### Étape 2: Désactiver une watch

```bash
PUT /_watcher/watch/parkki-errors-watch/_deactivate
```

### Étape 3: Réactiver une watch

```bash
PUT /_watcher/watch/parkki-errors-watch/_activate
```

### Étape 4: Voir l'état d'une watch

```bash
GET /_watcher/watch/parkki-errors-watch
```

**Observer** : `status.state.active` = true/false

### Étape 5: Supprimer une watch

```bash
DELETE /_watcher/watch/parkki-generic-webhook
```

### Étape 6: Voir l'historique des exécutions

```bash
GET /.watcher-history-*/_search
{
  "query": {
    "range": {
      "trigger_event.triggered_time": {
        "gte": "now-1d"
      }
    }
  },
  "sort": [{ "trigger_event.triggered_time": "desc" }],
  "size": 20
}
```

### États des watches

| État | Signification |
|------|---------------|
| `active` | Watch active et exécutée |
| `not_active` | Watch désactivée |

### Validation

✅ Savoir gérer le cycle de vie des watchers

---

# Lab 10.1: Activation de la Sécurité

**Topic**: Sécurité
**Durée**: 20 minutes

## Objectif

Comprendre l'activation et la configuration de base de la sécurité.

## Contexte Parkki

La sécurité est essentielle pour protéger vos données de logs et d'APM.

## Exercice

### Étape 1: Vérifier si la sécurité est activée

```bash
GET /_xpack
```

**Observer** : `features.security.enabled`

### Étape 2: Voir les informations de sécurité

```bash
GET /_security/_authenticate
```

**Résultat** : Informations sur l'utilisateur courant.

### Étape 3: Configuration Docker avec sécurité

```bash
# Arrêter les containers actuels
docker stop elasticsearch kibana

# Redémarrer avec sécurité
docker run -d \
  --name elasticsearch-secure \
  --net elastic \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=true" \
  -e "ELASTIC_PASSWORD=changeme" \
  -e "ES_JAVA_OPTS=-Xms2g -Xmx2g" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

### Étape 4: Tester l'authentification

```bash
# Sans auth (erreur 401)
curl http://localhost:9200

# Avec auth
curl -u elastic:changeme http://localhost:9200
```

### Note importante

Pour les labs suivants, nous travaillerons en mode **sans sécurité** pour simplifier les exercices. En production, la sécurité doit TOUJOURS être activée.

### Validation

✅ Comprendre l'activation de la sécurité

---

# Lab 10.2: Gestion des Utilisateurs

**Topic**: Sécurité
**Durée**: 25 minutes

## Objectif

Créer et gérer des utilisateurs Elasticsearch.

## Exercice

### Étape 1: Créer un utilisateur

```bash
POST /_security/user/parkki_reader
{
  "password": "reader_password_123",
  "roles": ["viewer"],
  "full_name": "Parkki Reader",
  "email": "reader@parkki.com",
  "metadata": {
    "team": "ops"
  }
}
```

### Étape 2: Voir l'utilisateur créé

```bash
GET /_security/user/parkki_reader
```

### Étape 3: Créer un utilisateur pour l'indexation

```bash
POST /_security/user/parkki_indexer
{
  "password": "indexer_password_123",
  "roles": ["editor"],
  "full_name": "Parkki Indexer",
  "email": "indexer@parkki.com"
}
```

### Étape 4: Lister tous les utilisateurs

```bash
GET /_security/user
```

### Étape 5: Modifier un utilisateur

```bash
PUT /_security/user/parkki_reader/_password
{
  "password": "new_secure_password_456"
}
```

### Étape 6: Désactiver un utilisateur

```bash
PUT /_security/user/parkki_reader/_disable
```

### Étape 7: Réactiver un utilisateur

```bash
PUT /_security/user/parkki_reader/_enable
```

### Étape 8: Supprimer un utilisateur

```bash
DELETE /_security/user/parkki_reader
```

### Rôles built-in

| Rôle | Permissions |
|------|-------------|
| `superuser` | Tous les privilèges |
| `kibana_admin` | Admin Kibana |
| `editor` | Lecture/écriture indices |
| `viewer` | Lecture seule |
| `monitoring_user` | Accès monitoring |

### Validation

✅ Savoir créer et gérer des utilisateurs

---

# Lab 10.3: Création de Rôles Personnalisés

**Topic**: Sécurité
**Durée**: 30 minutes

## Objectif

Créer des rôles avec des permissions granulaires.

## Contexte Parkki

Vous voulez que vos développeurs puissent lire les logs mais pas les modifier.

## Exercice

### Étape 1: Créer un rôle lecture seule sur les logs

```bash
POST /_security/role/parkki_logs_reader
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-*", ".ds-logs-*"],
      "privileges": ["read", "view_index_metadata"]
    }
  ]
}
```

### Étape 2: Créer un rôle pour l'indexation des logs

```bash
POST /_security/role/parkki_logs_writer
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-*", ".ds-logs-*"],
      "privileges": ["read", "write", "create_index", "view_index_metadata"]
    }
  ]
}
```

### Étape 3: Créer un rôle admin pour Parkki

```bash
POST /_security/role/parkki_admin
{
  "cluster": ["monitor", "manage_index_templates", "manage_ilm"],
  "indices": [
    {
      "names": ["logs-parkki-*", "apm-*"],
      "privileges": ["all"]
    }
  ]
}
```

### Étape 4: Voir un rôle

```bash
GET /_security/role/parkki_logs_reader
```

### Étape 5: Lister tous les rôles

```bash
GET /_security/role
```

### Étape 6: Créer un utilisateur avec le rôle personnalisé

```bash
POST /_security/user/dev_parkki
{
  "password": "dev_password_123",
  "roles": ["parkki_logs_reader"],
  "full_name": "Développeur Parkki"
}
```

### Privilèges index courants

| Privilège | Description |
|-----------|-------------|
| `read` | Lire les documents |
| `write` | Écrire des documents |
| `create_index` | Créer des index |
| `delete_index` | Supprimer des index |
| `manage` | Gérer l'index (settings, mappings) |
| `all` | Tous les privilèges |

### Privilèges cluster courants

| Privilège | Description |
|-----------|-------------|
| `monitor` | Voir l'état du cluster |
| `manage` | Gérer le cluster |
| `manage_index_templates` | Gérer les templates |
| `manage_ilm` | Gérer ILM |

### Validation

✅ Savoir créer des rôles personnalisés

---

# Lab 10.4: API Keys

**Topic**: Sécurité
**Durée**: 20 minutes

## Objectif

Créer et gérer des API Keys pour l'authentification programmatique.

## Contexte Parkki

Les API Keys sont idéales pour vos scripts d'indexation et applications.

## Exercice

### Étape 1: Créer une API Key

```bash
POST /_security/api_key
{
  "name": "parkki-indexer-key",
  "expiration": "30d",
  "role_descriptors": {
    "parkki_indexer": {
      "cluster": ["monitor"],
      "index": [
        {
          "names": ["logs-parkki-*"],
          "privileges": ["write", "create_index"]
        }
      ]
    }
  },
  "metadata": {
    "application": "parkki-log-shipper",
    "environment": "production"
  }
}
```

**Résultat** :
```json
{
  "id": "abc123...",
  "name": "parkki-indexer-key",
  "api_key": "xyz789...",
  "encoded": "base64_encoded_key..."
}
```

**Important** : Sauvegarder `encoded` ! Il ne sera plus accessible.

### Étape 2: Utiliser l'API Key

```bash
# Header Authorization avec la clé encodée
curl -H "Authorization: ApiKey <encoded_key>" http://localhost:9200/logs-parkki-test/_doc -d '{"message":"test"}' -H "Content-Type: application/json"
```

### Étape 3: Voir les API Keys existantes

```bash
GET /_security/api_key?owner=true
```

### Étape 4: Voir une API Key spécifique

```bash
GET /_security/api_key?id=<api_key_id>
```

### Étape 5: Invalider une API Key

```bash
DELETE /_security/api_key
{
  "ids": ["<api_key_id>"]
}
```

### Bonnes pratiques API Keys

| Pratique | Description |
|----------|-------------|
| Expiration | Toujours définir une expiration |
| Rotation | Renouveler régulièrement |
| Minimal privileges | Donner le minimum de droits nécessaires |
| Nommage | Nommer clairement (application, env) |

### Validation

✅ Savoir créer et gérer des API Keys

---

# Lab 10.5: Document-Level Security

**Topic**: Sécurité
**Durée**: 25 minutes

## Objectif

Restreindre l'accès aux documents selon des critères.

## Contexte Parkki

Vous pouvez vouloir que certains utilisateurs ne voient que les logs de certains services.

## Exercice

### Étape 1: Créer un rôle avec filtre de documents

```bash
POST /_security/role/parkki_api_only
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-*"],
      "privileges": ["read"],
      "query": {
        "term": {
          "service": "parkki-api"
        }
      }
    }
  ]
}
```

### Étape 2: Créer un utilisateur avec ce rôle

```bash
POST /_security/user/api_team_member
{
  "password": "api_team_password_123",
  "roles": ["parkki_api_only"],
  "full_name": "API Team Member"
}
```

### Étape 3: Tester - cet utilisateur ne verra que les logs de parkki-api

```bash
# En tant que api_team_member
GET /logs-search/_search
{
  "query": { "match_all": {} }
}
```

**Résultat** : Seuls les documents avec `service: parkki-api` sont retournés.

### Étape 4: Rôle avec filtre sur level

```bash
POST /_security/role/parkki_errors_only
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-*"],
      "privileges": ["read"],
      "query": {
        "terms": {
          "level": ["ERROR", "WARN"]
        }
      }
    }
  ]
}
```

### Validation

✅ Comprendre le Document-Level Security

---

# Lab 10.6: Field-Level Security

**Topic**: Sécurité
**Durée**: 20 minutes

## Objectif

Masquer certains champs selon les rôles.

## Contexte Parkki

Masquer les champs sensibles (user_id, ip) pour certains utilisateurs.

## Exercice

### Étape 1: Créer un rôle avec restriction de champs

```bash
POST /_security/role/parkki_limited_fields
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-*"],
      "privileges": ["read"],
      "field_security": {
        "grant": ["@timestamp", "level", "service", "message"]
      }
    }
  ]
}
```

### Étape 2: Alternative - exclure des champs

```bash
POST /_security/role/parkki_no_pii
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-*"],
      "privileges": ["read"],
      "field_security": {
        "grant": ["*"],
        "except": ["user_id", "ip", "email"]
      }
    }
  ]
}
```

### Étape 3: Créer un utilisateur

```bash
POST /_security/user/limited_viewer
{
  "password": "limited_password_123",
  "roles": ["parkki_no_pii"],
  "full_name": "Limited Viewer"
}
```

### Cas d'usage

| Scénario | Configuration |
|----------|---------------|
| Masquer PII | `except: [user_id, email, ip]` |
| Logs minimal | `grant: [@timestamp, level, message]` |
| Debug complet | `grant: [*]` |

### Validation

✅ Comprendre le Field-Level Security

---

# Lab 11.1: Architecture APM

**Topic**: APM et Logs Applicatifs
**Durée**: 20 minutes

## Objectif

Comprendre l'architecture APM et ses composants.

## Contexte Parkki

Vous utilisez déjà APM. Comprendre l'architecture vous aidera à l'optimiser.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Applications Parkki                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ parkki-api  │  │parkki-worker│  │parkki-front │          │
│  │ (Java Agent)│  │(Node Agent) │  │ (RUM Agent) │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                  ┌─────────────────┐
                  │   APM Server    │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Elasticsearch  │
                  │   (apm-*)       │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Kibana APM UI  │
                  └─────────────────┘
```

## Exercice

### Étape 1: Voir les index APM

```bash
GET /_cat/indices/apm-*?v&s=index
```

### Étape 2: Voir les data streams APM

```bash
GET /_data_stream/traces-apm*
GET /_data_stream/metrics-apm*
GET /_data_stream/logs-apm*
```

### Étape 3: Comprendre les types de données APM

| Type | Index Pattern | Description |
|------|---------------|-------------|
| Traces | `traces-apm-*` | Transactions et spans |
| Metrics | `metrics-apm-*` | Métriques applications |
| Logs | `logs-apm-*` | Logs APM (erreurs, events) |

### Étape 4: Voir le mapping des traces

```bash
GET /traces-apm-default/_mapping?filter_path=**.properties.trace,**.properties.transaction,**.properties.span
```

### Validation

✅ Comprendre l'architecture APM

---

# Lab 11.2: Exploration des Données APM

**Topic**: APM et Logs Applicatifs
**Durée**: 25 minutes

## Objectif

Explorer et rechercher dans les données APM.

## Exercice

### Étape 1: Rechercher les transactions récentes

```bash
GET /traces-apm-*/_search
{
  "query": {
    "bool": {
      "filter": [
        { "exists": { "field": "transaction.id" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "sort": [{ "@timestamp": "desc" }],
  "size": 10,
  "_source": ["@timestamp", "service.name", "transaction.name", "transaction.duration.us", "transaction.result"]
}
```

### Étape 2: Rechercher les transactions lentes (> 1s)

```bash
GET /traces-apm-*/_search
{
  "query": {
    "bool": {
      "filter": [
        { "exists": { "field": "transaction.id" } },
        { "range": { "transaction.duration.us": { "gt": 1000000 } } }
      ]
    }
  },
  "sort": [{ "transaction.duration.us": "desc" }],
  "size": 10,
  "_source": ["@timestamp", "service.name", "transaction.name", "transaction.duration.us"]
}
```

### Étape 3: Rechercher les erreurs APM

```bash
GET /logs-apm*/_search
{
  "query": {
    "bool": {
      "filter": [
        { "exists": { "field": "error.exception" } },
        { "range": { "@timestamp": { "gte": "now-1d" } } }
      ]
    }
  },
  "sort": [{ "@timestamp": "desc" }],
  "size": 10,
  "_source": ["@timestamp", "service.name", "error.exception.message", "error.exception.type"]
}
```

### Étape 4: Aggregation par service

```bash
GET /traces-apm-*/_search
{
  "size": 0,
  "query": {
    "bool": {
      "filter": [
        { "exists": { "field": "transaction.id" } },
        { "range": { "@timestamp": { "gte": "now-1d" } } }
      ]
    }
  },
  "aggs": {
    "par_service": {
      "terms": {
        "field": "service.name",
        "size": 20
      },
      "aggs": {
        "avg_duration": {
          "avg": {
            "field": "transaction.duration.us"
          }
        },
        "p99_duration": {
          "percentiles": {
            "field": "transaction.duration.us",
            "percents": [99]
          }
        }
      }
    }
  }
}
```

### Étape 5: Latence par endpoint

```bash
GET /traces-apm-*/_search
{
  "size": 0,
  "query": {
    "bool": {
      "filter": [
        { "term": { "service.name": "parkki-api" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "aggs": {
    "par_transaction": {
      "terms": {
        "field": "transaction.name",
        "size": 20
      },
      "aggs": {
        "avg_duration_ms": {
          "avg": {
            "field": "transaction.duration.us"
          }
        }
      }
    }
  }
}
```

### Validation

✅ Savoir explorer les données APM

---

# Lab 11.3: Corrélation Logs et APM

**Topic**: APM et Logs Applicatifs
**Durée**: 30 minutes

## Objectif

Corréler les logs applicatifs avec les traces APM.

## Contexte Parkki

La corrélation logs/APM permet de debugger plus efficacement les problèmes de performance.

## Concepts clés

```
Transaction
├── trace.id: "abc123"      ← Identifiant de la trace complète
├── transaction.id: "def456" ← Identifiant de la transaction
└── span.id: "ghi789"       ← Identifiant du span (optionnel)

Log corrélé
├── trace.id: "abc123"      ← Même identifiant
├── message: "Processing..."
└── @timestamp: "..."
```

## Exercice

### Étape 1: Trouver une transaction lente

```bash
GET /traces-apm-*/_search
{
  "query": {
    "bool": {
      "filter": [
        { "exists": { "field": "transaction.id" } },
        { "range": { "transaction.duration.us": { "gt": 500000 } } }
      ]
    }
  },
  "sort": [{ "transaction.duration.us": "desc" }],
  "size": 1,
  "_source": ["trace.id", "transaction.id", "transaction.name", "transaction.duration.us", "service.name"]
}
```

### Étape 2: Récupérer le trace.id

**Résultat exemple** : `trace.id: "abc123def456..."`

### Étape 3: Rechercher les logs associés

```bash
GET /logs-*/_search
{
  "query": {
    "term": {
      "trace.id": "abc123def456..."
    }
  },
  "sort": [{ "@timestamp": "asc" }],
  "_source": ["@timestamp", "message", "level", "service"]
}
```

### Étape 4: Rechercher tous les spans de la trace

```bash
GET /traces-apm-*/_search
{
  "query": {
    "term": {
      "trace.id": "abc123def456..."
    }
  },
  "sort": [{ "@timestamp": "asc" }],
  "_source": ["@timestamp", "span.name", "span.duration.us", "span.type", "transaction.name"]
}
```

### Étape 5: Vue complète d'une transaction

```bash
# 1. Transaction principale
GET /traces-apm-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "trace.id": "abc123def456..." } },
        { "exists": { "field": "transaction.id" } }
      ]
    }
  }
}

# 2. Spans associés
GET /traces-apm-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "trace.id": "abc123def456..." } },
        { "exists": { "field": "span.id" } }
      ]
    }
  },
  "sort": [{ "@timestamp": "asc" }]
}

# 3. Logs associés
GET /logs-*/_search
{
  "query": {
    "term": { "trace.id": "abc123def456..." }
  },
  "sort": [{ "@timestamp": "asc" }]
}
```

### Configuration de l'injection trace.id dans les logs

**Java (Log4j2)** :
```xml
<PatternLayout pattern="%d{ISO8601} [%t] %-5level %logger{36} - trace.id=%X{trace.id} span.id=%X{span.id} - %msg%n"/>
```

**Node.js (Winston)** :
```javascript
const apm = require('elastic-apm-node');
logger.info('Message', { trace_id: apm.currentTraceIds['trace.id'] });
```

### Validation

✅ Savoir corréler les logs et les traces APM

---

# Lab 11.4: Métriques APM et Dashboards

**Topic**: APM et Logs Applicatifs
**Durée**: 25 minutes

## Objectif

Créer des aggregations pour construire des dashboards APM.

## Exercice

### Étape 1: Throughput par service (requests/min)

```bash
GET /traces-apm-*/_search
{
  "size": 0,
  "query": {
    "bool": {
      "filter": [
        { "exists": { "field": "transaction.id" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "aggs": {
    "par_service": {
      "terms": {
        "field": "service.name"
      },
      "aggs": {
        "throughput": {
          "date_histogram": {
            "field": "@timestamp",
            "fixed_interval": "1m"
          }
        }
      }
    }
  }
}
```

### Étape 2: Taux d'erreur par service

```bash
GET /traces-apm-*/_search
{
  "size": 0,
  "query": {
    "bool": {
      "filter": [
        { "exists": { "field": "transaction.id" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "aggs": {
    "par_service": {
      "terms": {
        "field": "service.name"
      },
      "aggs": {
        "total": {
          "value_count": {
            "field": "transaction.id"
          }
        },
        "errors": {
          "filter": {
            "term": { "transaction.result": "HTTP 5xx" }
          }
        }
      }
    }
  }
}
```

### Étape 3: Distribution des latences (histogramme)

```bash
GET /traces-apm-*/_search
{
  "size": 0,
  "query": {
    "bool": {
      "filter": [
        { "term": { "service.name": "parkki-api" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "aggs": {
    "latency_distribution": {
      "histogram": {
        "field": "transaction.duration.us",
        "interval": 100000
      }
    }
  }
}
```

### Étape 4: Top erreurs

```bash
GET /logs-apm*/_search
{
  "size": 0,
  "query": {
    "bool": {
      "filter": [
        { "exists": { "field": "error.exception" } },
        { "range": { "@timestamp": { "gte": "now-1d" } } }
      ]
    }
  },
  "aggs": {
    "top_errors": {
      "terms": {
        "field": "error.exception.type",
        "size": 10
      },
      "aggs": {
        "par_service": {
          "terms": {
            "field": "service.name"
          }
        }
      }
    }
  }
}
```

### Métriques clés APM pour Parkki

| Métrique | Description | Seuil d'alerte |
|----------|-------------|----------------|
| Throughput | Requests/min | Anomalie |
| Latency p99 | 99e percentile | > 1s |
| Error rate | % erreurs | > 1% |
| Saturation | Queue depth | > 100 |

### Validation

✅ Savoir créer des métriques pour dashboards APM

---

# Lab 11.5: ILM pour les Données APM

**Topic**: APM et Logs Applicatifs
**Durée**: 20 minutes

## Objectif

Configurer la rétention des données APM.

## Contexte Parkki

Les données APM peuvent vite consommer beaucoup d'espace. Une bonne stratégie ILM est essentielle.

## Exercice

### Étape 1: Voir les policies ILM actuelles pour APM

```bash
GET /_ilm/policy/traces-apm*
GET /_ilm/policy/metrics-apm*
```

### Étape 2: Créer une policy optimisée pour APM Parkki

```bash
PUT /_ilm/policy/parkki-apm-policy
{
  "policy": {
    "_meta": {
      "description": "Policy pour données APM Parkki"
    },
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_primary_shard_size": "30gb"
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "3d",
        "actions": {
          "set_priority": {
            "priority": 50
          },
          "readonly": {},
          "forcemerge": {
            "max_num_segments": 1
          }
        }
      },
      "delete": {
        "min_age": "7d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

### Étape 3: Rétention différenciée par type de données

```bash
# Traces (7 jours) - données volumineuses
PUT /_ilm/policy/parkki-apm-traces
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_primary_shard_size": "30gb"
          }
        }
      },
      "delete": {
        "min_age": "7d",
        "actions": { "delete": {} }
      }
    }
  }
}

# Métriques (14 jours) - moins volumineuses
PUT /_ilm/policy/parkki-apm-metrics
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_primary_shard_size": "50gb"
          }
        }
      },
      "delete": {
        "min_age": "14d",
        "actions": { "delete": {} }
      }
    }
  }
}
```

### Recommandations rétention APM

| Type | Rétention recommandée | Justification |
|------|----------------------|---------------|
| Traces | 7 jours | Volumineuses, debug récent |
| Métriques | 14-30 jours | Moins volumineuses, trending |
| Erreurs | 30 jours | Analyse incidents |

### Validation

✅ Savoir configurer ILM pour les données APM

---

# Récapitulatif

## Ce que vous avez appris

1. **Installation**: Démarrer Elasticsearch et Kibana avec Docker
2. **Diagnostic**: Utiliser les _cat APIs (_cat/nodes, _cat/indices, _cat/shards)
3. **CRUD**: POST, GET, PUT, DELETE sur les documents
4. **Bulk API**: Indexation en masse efficace
5. **Gestion index**: Settings, refresh_interval, open/close
6. **Mapping**: text vs keyword, multi-fields, nested
7. **Templates**: Dynamic templates, index templates, component templates
8. **Recherche**: Query DSL, bool query, pagination, tri, aggregations
9. **Dimensionnement**: Calcul des shards, ratios memory:data, thread pools, watermarks
10. **Data Retention**: Stratégies de rétention, open/close, shrink, delete
11. **Data Streams**: Gestion automatique des time series avec rollover
12. **ILM**: Automatisation du cycle de vie Hot → Warm → Delete
13. **Operating**: Segments, slowlogs, debug shards, JVM, fielddata
14. **Monitoring**: Cluster Health, Node Stats, Index Stats, Thread Pools
15. **Alerting**: Watcher API, conditions, actions, webhooks
16. **Sécurité**: Utilisateurs, rôles, API Keys, DLS, FLS
17. **APM**: Architecture, exploration données, corrélation logs/traces, ILM APM

## Points clés pour Parkki

| Problème | Solution |
|----------|----------|
| JVM surchargée | `refresh_interval: 30s` + `keyword` au lieu de `text` |
| Indexation lente | Bulk API avec batches 5-15 MB |
| Cluster yellow | Vérifier avec `_cat/shards` |
| Mapping non optimisé | Dynamic templates + index templates |
| Champs inutilement analysés | Utiliser `keyword` pour level, service, user_id |
| Recherches lentes | Utiliser `filter` au lieu de `must` pour les filtres stricts |
| Coûts croissants | ILM Hot/Warm/Delete avec rétention 10 jours |
| Trop de shards | 1 shard par index quotidien (15 GB/jour) |
| Données anciennes trop actives | Data Streams + ILM pour automatiser warm/delete |
| Disk watermarks | Prévoir 400 GB minimum (150 GB × 2 replicas + marges) |
| Pas d'alerting | Watcher API pour JVM, disk, thread pools |
| Accès non contrôlé | Rôles personnalisés + API Keys avec expiration |
| Debug difficile | Corrélation logs/APM via trace.id |
| Données APM volumineuses | ILM différencié traces (7j) / métriques (14j) |

## Nettoyage

```bash
# Index de test
DELETE /logs-test
DELETE /test-refresh-default
DELETE /test-refresh-optimized
DELETE /logs-mapping-test
DELETE /logs-optimized
DELETE /logs-multifield
DELETE /logs-no-index
DELETE /logs-object
DELETE /logs-nested
DELETE /logs-dynamic
DELETE /logs-parkki-2025.01.15
DELETE /logs-combined-2025.01.15
DELETE /logs-search
DELETE /logs-segments-test
DELETE /test-fielddata
DELETE /test-fielddata-fixed
DELETE /test-unassigned

# Index de rétention et ILM
DELETE /logs-old-2025.01.01
DELETE /logs-retention-*
DELETE /logs-to-shrink
DELETE /logs-shrunk

# Data streams
DELETE /_data_stream/logs-stream-parkki
DELETE /_data_stream/logs-ilm-parkki
DELETE /_data_stream/logs-opt-parkki
DELETE /_data_stream/logs-parkki-prod

# Templates
DELETE /_index_template/logs-parkki-template
DELETE /_index_template/logs-combined-template
DELETE /_index_template/logs-stream-template
DELETE /_index_template/logs-ilm-template
DELETE /_index_template/logs-optimized-template
DELETE /_index_template/parkki-logs-template
DELETE /_index_template/logs-slowlog-template

# Component templates
DELETE /_component_template/logs-settings
DELETE /_component_template/logs-mappings-base
DELETE /_component_template/parkki-settings
DELETE /_component_template/parkki-mappings

# ILM Policies
DELETE /_ilm/policy/logs-parkki-policy
DELETE /_ilm/policy/logs-parkki-optimized
DELETE /_ilm/policy/parkki-logs-production
DELETE /_ilm/policy/parkki-apm-policy
DELETE /_ilm/policy/parkki-apm-traces
DELETE /_ilm/policy/parkki-apm-metrics

# Watchers
DELETE /_watcher/watch/parkki-errors-watch
DELETE /_watcher/watch/parkki-jvm-heap-watch
DELETE /_watcher/watch/parkki-disk-watch
DELETE /_watcher/watch/parkki-threadpool-watch
DELETE /_watcher/watch/parkki-slack-alert
DELETE /_watcher/watch/parkki-generic-webhook

# Sécurité (si activée)
DELETE /_security/user/parkki_reader
DELETE /_security/user/parkki_indexer
DELETE /_security/user/dev_parkki
DELETE /_security/user/api_team_member
DELETE /_security/user/limited_viewer
DELETE /_security/role/parkki_logs_reader
DELETE /_security/role/parkki_logs_writer
DELETE /_security/role/parkki_admin
DELETE /_security/role/parkki_api_only
DELETE /_security/role/parkki_errors_only
DELETE /_security/role/parkki_limited_fields
DELETE /_security/role/parkki_no_pii
```
