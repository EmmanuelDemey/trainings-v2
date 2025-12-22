---
theme: seriph
highlighter: shiki
lineNumbers: true
css: unocss
download: true
exportFilename: elasticsearch-parkki-jour1-slides
info: |
  ## Elasticsearch - Formation Parkki - Jour 1
  Par Emmanuel DEMEY - HumanCoders

  Formation personnalisée pour Parkki : Fondamentaux et Architecture
  Focus sur les problématiques spécifiques : JVM, indexation, coûts
drawings:
  persist: false
---

# Elasticsearch - Formation Parkki
## Jour 1 : Fondamentaux et Architecture

Formation personnalisée sur 3 jours

Par Emmanuel DEMEY

---
layout: center
---

# Contexte et Objectifs

---

# Votre situation actuelle

<v-clicks>

- **3 développeurs** utilisant la Suite Elastic
- **15M+ de logs par jour**
- **Utilisation** : logs applicatifs + APM

</v-clicks>

---

# Problématiques identifiées

<v-clicks>

- JVM qui s'emballent
- Indexation non optimale
- Facturation croissante (rétention 10 jours uniquement)
- Problèmes récurrents lors des mises à jour Elastic.co

</v-clicks>

---

# Objectifs de la formation

<v-clicks>

1. Reposer les bonnes bases Elasticsearch
2. Auditer vos clusters dev et prod
3. Identifier et résoudre vos problématiques actuelles
4. Optimiser vos coûts et performances
5. Améliorer la stabilité de votre infrastructure

</v-clicks>

---
layout: intro
---

# Programme Jour 1
## Fondamentaux et Architecture (9h-17h)

**Matin (9h-12h30)**:
- Présentation générale et concepts (1h)
- Installation et configuration (1h)
- Indexation et gestion des documents (1h30)

**Après-midi (14h-17h)**:
- Mapping et Schémas - Critique pour votre cas (2h)
- Recherche de base (1h)

---
layout: section
---

# Partie 1 : Présentation générale et concepts
*Durée : 1h*

---
src: ./chapters/elasticsearch/01_general_concepts.md
hide: false
---

---
layout: center
---

# Focus Parkki : Observability

Elasticsearch n'est pas seulement un moteur de recherche

<v-clicks>

- **Search Engine** : recherche full-text
- **Observability** : logs, métriques, APM (votre cas d'usage)
- **SIEM** : sécurité et analyse de menaces

</v-clicks>

<br>

<v-click>

> Votre utilisation principale : **15M+ logs/jour + APM**
>
> L'observability est un use case critique avec des enjeux de performance et de coûts

</v-click>

---
layout: section
---

# Partie 2 : Installation et configuration
*Durée : 1h*

---
src: ./chapters/elasticsearch/02_installation_config.md
hide: false
---

---
layout: center
---

# Focus Parkki : Elastic Cloud

Vous utilisez Elastic.co (cloud managé)

<v-clicks>

**Avantages** :
- Pas de gestion infrastructure
- Mise à jour automatique
- Scaling simplifié

**Challenges identifiés** :
- Problèmes lors des mises à jour
- Facturation croissante
- Configuration optimale ?

</v-clicks>

---

# Types de nœuds : Impact pour vous

Pour un cluster Observability avec 15M logs/jour :

<v-clicks>

| Type | Rôle | Importance pour vous |
|------|------|---------------------|
| **Master** | Gestion cluster | Critique (stabilité) |
| **Data (Hot)** | Logs récents | Très critique (performance) |
| **Data (Warm)** | Logs anciens | Important (coûts) |
| **Ingest** | Prétraitement | Optionnel selon pipeline |
| **Coordinating** | Routage requêtes | Important (Kibana) |

</v-clicks>

<br>

<v-click>

> Architecture recommandée : **Hot/Warm** pour optimiser coûts et performances

</v-click>

---
layout: section
---

# Partie 3 : Indexation et gestion des documents
*Durée : 1h30*

---
src: ./chapters/elasticsearch/03_indexation.md
hide: false
---

---
layout: center
---

# Focus Parkki : Indexation non optimale

Avec **15M logs/jour**, l'indexation doit être optimisée

<v-clicks>

**Problèmes potentiels** :
- Refresh interval trop court
- Bulk API mal utilisée
- Nombre de shards inadapté
- Réplicas mal configurés

**Impact** :
- JVM qui s'emballe
- Performance dégradée
- Coûts augmentés

</v-clicks>

---

# Bulk API : Bonnes pratiques

Pour vos 15M logs/jour :

```json
POST /_bulk
{"index":{"_index":"logs-app-2025.01.15"}}
{"timestamp":"2025-01-15T10:30:00","level":"ERROR","message":"..."}
{"index":{"_index":"logs-app-2025.01.15"}}
{"timestamp":"2025-01-15T10:30:01","level":"INFO","message":"..."}
```

<v-clicks>

**Recommandations** :
- Taille batch : **5-15 MB** (optimal)
- Utiliser des **data streams** pour les logs
- Désactiver refresh pendant bulk massif
- Monitorer les erreurs de bulk

</v-clicks>

---

# Refresh Interval : Impact sur la JVM

Le `refresh_interval` contrôle la visibilité des documents

```json
PUT /logs-app
{
  "settings": {
    "refresh_interval": "30s"  // Au lieu de "1s" par défaut
  }
}
```

<v-clicks>

**Impact pour vous** :
- Refresh fréquent = JVM surchargée
- 15M logs/jour = beaucoup de refresh
- **Recommandation** : 30s ou plus pour les logs

> Le refresh crée des segments → trop de segments = JVM sous pression

</v-clicks>

---

# Cluster Status : Comprendre les couleurs

<v-clicks>

| Status | Signification | Action |
|--------|---------------|--------|
| **Green** | Tous les shards sont assignés | RAS |
| **Yellow** | Tous les primary OK, mais pas tous les replicas | Vérifier allocation |
| **Red** | Au moins un primary non assigné | URGENT ! |

</v-clicks>

<br>

<v-click>

```bash
GET /_cluster/health

{
  "status": "yellow",
  "number_of_nodes": 3,
  "unassigned_shards": 5  // ⚠️ À investiguer
}
```

</v-click>

---
layout: center
---

# Pause déjeuner
## 12h30 - 14h00

Retour à 14h pour la partie la plus critique : **Mapping et Schémas**

---
layout: section
---

# Partie 4 : Mapping et Schémas
*Durée : 2h*

## ⭐ CRITIQUE POUR VOTRE CAS

---
src: ./chapters/elasticsearch/04_mapping.md
hide: false
---

---
layout: center
---

# Pourquoi le Mapping est CRITIQUE pour vous ?

<v-clicks>

1. **15M logs/jour** = beaucoup de champs
2. Mauvais mapping = **JVM surchargée**
3. Mauvais mapping = **coûts explosés**
4. Mauvais mapping = **recherches lentes**

> Un mapping optimisé peut diviser vos coûts par 2 !

</v-clicks>

---

# text vs keyword : L'erreur coûteuse

Pour les logs applicatifs :

<v-clicks>

**text** :
- Analysé (tokenization)
- Recherche full-text
- Consomme beaucoup de mémoire
- ⚠️ Ne pas utiliser pour filtering/aggregation

**keyword** :
- Non analysé
- Exact match
- Peu de mémoire
- ✅ Parfait pour filtering/aggregation

</v-clicks>

---

# Exemple : Mapping de logs optimisé

```json {all|3-5|6-9|10-11|12-15|all}
PUT /logs-app
{
  "mappings": {
    "properties": {
      "timestamp": { "type": "date" },
      "level": { "type": "keyword" },          // ✅ Pour filter (level:ERROR)
      "message": {
        "type": "text",                        // ✅ Pour recherche full-text
        "fields": {
          "keyword": { "type": "keyword" }     // ✅ Multi-field optionnel
        }
      },
      "user_id": { "type": "keyword" },        // ✅ Pas besoin d'analyse
      "response_time": { "type": "long" },
      "ip": { "type": "ip" }                   // ✅ Type spécialisé
    }
  }
}
```

---

# Erreur fréquente : text pour tout

❌ **Mapping non optimisé** :

```json
{
  "properties": {
    "level": { "type": "text" },      // ❌ Gaspillage !
    "user_id": { "type": "text" },    // ❌ Gaspillage !
    "ip": { "type": "text" }          // ❌ Gaspillage !
  }
}
```

<v-clicks>

**Conséquences** :
- Fielddata cache surchargé → **JVM qui s'emballe**
- Index plus gros → **coûts augmentés**
- Recherches plus lentes

> C'est probablement une cause de vos problèmes JVM !

</v-clicks>

---

# Object vs Nested : Le piège des tableaux

Problème avec les **arrays d'objets** :

```json
{
  "users": [
    { "name": "Alice", "role": "admin" },
    { "name": "Bob", "role": "user" }
  ]
}
```

<v-clicks>

Elasticsearch aplatit en interne :
```json
{
  "users.name": ["Alice", "Bob"],
  "users.role": ["admin", "user"]
}
```

**Problème** : Query `name:Alice AND role:user` matche le document !

</v-clicks>

---

# Solution : Type nested

```json {all|4|5-8|all}
PUT /logs-app
{
  "mappings": {
    "properties": {
      "users": {
        "type": "nested",              // ✅ Préserve la relation
        "properties": {
          "name": { "type": "keyword" },
          "role": { "type": "keyword" }
        }
      }
    }
  }
}
```

<v-clicks>

**Attention** : `nested` consomme plus de ressources
- À utiliser uniquement si nécessaire
- Pour vos logs APM, souvent utile pour les spans

</v-clicks>

---

# Dynamic Templates : Automatiser le mapping

Pour vos logs avec beaucoup de champs :

```json {all|4-10|11-17|all}
PUT /logs-app
{
  "mappings": {
    "dynamic_templates": [
      {
        "strings_as_keywords": {
          "match_mapping_type": "string",
          "mapping": { "type": "keyword" }    // Par défaut keyword
        }
      },
      {
        "message_as_text": {
          "match": "message",
          "mapping": { "type": "text" }       // Exception pour message
        }
      }
    ]
  }
}
```

---

# Index Templates : Centraliser la config

Pour vos logs quotidiens :

```json {all|3|4-6|7-16|all}
PUT /_index_template/logs-app-template
{
  "index_patterns": ["logs-app-*"],
  "data_stream": { },                        // ✅ Active data streams
  "priority": 500,
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "refresh_interval": "30s"              // ✅ Optimisé pour bulk
    },
    "mappings": {
      "properties": {
        // ... votre mapping optimisé
      }
    }
  }
}
```

<v-click>

> Avec data streams + template, chaque jour = nouvel index automatique

</v-click>

---

# Component Templates : Réutilisation

Modulaire et réutilisable :

```json
PUT /_component_template/logs-settings
{
  "template": {
    "settings": {
      "number_of_shards": 1,
      "refresh_interval": "30s"
    }
  }
}

PUT /_component_template/logs-mappings
{
  "template": {
    "mappings": {
      "properties": {
        "timestamp": { "type": "date" },
        "level": { "type": "keyword" }
      }
    }
  }
}
```

---

# Combiner les Component Templates

```json {all|3|4-7|all}
PUT /_index_template/logs-app-template
{
  "index_patterns": ["logs-app-*"],
  "composed_of": [
    "logs-settings",
    "logs-mappings"
  ],
  "priority": 500
}
```

<v-clicks>

**Avantages** :
- Réutilisation entre différents types de logs
- Maintenance simplifiée
- Cohérence garantie

</v-clicks>

---

# Bonnes pratiques Mapping pour Parkki

<v-clicks>

1. **Utilisez keyword par défaut** (sauf message/description)
2. **Évitez text pour les IDs, status, levels**
3. **Utilisez des types spécialisés** : `ip`, `date`, `geo_point`
4. **Désactivez** `_source` si pas besoin (rare)
5. **Multi-fields uniquement si nécessaire**
6. **Index Templates** pour tous vos indices de logs
7. **Dynamic templates** pour gérer les champs inconnus
8. **Testez** votre mapping sur un petit index d'abord

</v-clicks>

<br>

<v-click>

> Action immédiate : Auditer vos mappings actuels (demain après-midi)

</v-click>

---
layout: section
---

# Partie 5 : Recherche de base
*Durée : 1h*

---
src: ./chapters/elasticsearch/05_search.md
hide: false
---

---
layout: center
---

# Focus Parkki : Recherche dans les logs

Pour 15M logs/jour, la recherche doit être efficace

<v-clicks>

**Use cases typiques** :
- Rechercher les erreurs : `level:ERROR`
- Trouver logs d'un user : `user_id:12345`
- Recherche full-text : `message:"connection timeout"`
- Période spécifique : `timestamp:[now-1h TO now]`

</v-clicks>

---

# API Search : Bases

```bash
GET /logs-app-*/_search
{
  "query": {
    "match": {
      "message": "error"
    }
  },
  "size": 20,
  "from": 0,
  "sort": [
    { "timestamp": "desc" }
  ]
}
```

<v-clicks>

- `size` : nombre de résultats (max 10000)
- `from` : offset pour pagination
- `sort` : tri personnalisé

</v-clicks>

---

# Query DSL : Match vs Term

<v-clicks>

**match** : recherche analysée (pour text)
```json
{
  "query": {
    "match": { "message": "connection error" }
  }
}
```

**term** : recherche exacte (pour keyword)
```json
{
  "query": {
    "term": { "level": "ERROR" }
  }
}
```

</v-clicks>

---

# Query DSL : Bool Query

Combiner plusieurs conditions :

```json {all|4-6|7-9|10-12|all}
GET /logs-app-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "level": "ERROR" } }
      ],
      "filter": [
        { "range": { "timestamp": { "gte": "now-1h" } } }
      ],
      "must_not": [
        { "term": { "user_id": "bot" } }
      ]
    }
  }
}
```

<v-clicks>

- `must` : doit matcher (calcule score)
- `filter` : doit matcher (pas de score, plus rapide)
- `must_not` : ne doit pas matcher
- `should` : peut matcher (bonus au score)

</v-clicks>

---

# Pagination : Deep Pagination Problem

<v-clicks>

❌ **Évitez la deep pagination** :
```json
{
  "from": 10000,
  "size": 100
}
```

**Problème** : Elasticsearch doit trier 10100 docs sur chaque shard !

✅ **Solutions** :
- **Search After** : pagination efficace
- **Scroll API** : pour export de données
- **Point in Time** : pour parcourir snapshot

</v-clicks>

---

# Search After : Pagination efficace

```json
// Première requête
GET /logs-app-*/_search
{
  "size": 100,
  "sort": [
    { "timestamp": "desc" },
    { "_id": "asc" }
  ]
}

// Requête suivante avec search_after
GET /logs-app-*/_search
{
  "size": 100,
  "search_after": ["2025-01-15T10:30:00", "doc_123"],
  "sort": [
    { "timestamp": "desc" },
    { "_id": "asc" }
  ]
}
```

---
layout: center
---

# Récapitulatif Jour 1

---

# Ce que nous avons vu aujourd'hui

<v-clicks>

1. **Contexte Parkki** : 15M logs/jour, problèmes JVM, coûts
2. **Concepts fondamentaux** : Cluster, Index, Shard, Document
3. **Installation** : Types de nœuds, configuration
4. **Indexation** : CRUD, Bulk API, refresh_interval
5. **Mapping** ⭐ : text vs keyword, nested, templates
6. **Recherche** : Query DSL, pagination

</v-clicks>

---

# Points clés pour Parkki

<v-clicks>

| Sujet | Impact pour vous | Action |
|-------|------------------|--------|
| **Mapping** | Critique (JVM + coûts) | Audit demain |
| **Refresh interval** | JVM | Augmenter à 30s |
| **Bulk API** | Performance | Vérifier sizing |
| **text vs keyword** | Mémoire | Utiliser keyword |
| **Templates** | Cohérence | Centraliser config |

</v-clicks>

---

# Demain : Jour 2

**Performance, Optimisation et Production**

<v-clicks>

**Matin** :
- **Dimensionnement et Sizing** ⭐ (15M logs/jour)
- **Data Retention et ILM** ⭐ (optimiser coûts)

**Après-midi** :
- **Operating et Troubleshooting** ⭐ (JVM)
- **Audit de votre cluster** 🎯

> Nous allons résoudre vos problématiques !

</v-clicks>

---
layout: end
---

# Merci !

## Questions ?

**À demain 9h pour le Jour 2**

Contact : demey.emmanuel@gmail.com
