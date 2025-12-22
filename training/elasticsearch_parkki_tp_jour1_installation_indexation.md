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

## Points clés pour Parkki

| Problème | Solution |
|----------|----------|
| JVM surchargée | `refresh_interval: 30s` + `keyword` au lieu de `text` |
| Indexation lente | Bulk API avec batches 5-15 MB |
| Cluster yellow | Vérifier avec `_cat/shards` |
| Mapping non optimisé | Dynamic templates + index templates |
| Champs inutilement analysés | Utiliser `keyword` pour level, service, user_id |
| Recherches lentes | Utiliser `filter` au lieu de `must` pour les filtres stricts |

## Nettoyage

```bash
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
DELETE /_index_template/logs-parkki-template
DELETE /_index_template/logs-combined-template
DELETE /_component_template/logs-settings
DELETE /_component_template/logs-mappings-base
```
