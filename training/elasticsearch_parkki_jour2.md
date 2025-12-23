---
theme: seriph
highlighter: shiki
lineNumbers: true
css: unocss
download: true
exportFilename: elasticsearch-parkki-jour2-slides
info: |
  ## Elasticsearch - Formation Parkki - Jour 2
  Par Emmanuel DEMEY - HumanCoders

  Performance, Optimisation et Production
  Focus sur les problematiques specifiques : JVM, sizing, ILM, couts
drawings:
  persist: false
---

# Elasticsearch - Formation Parkki
## Jour 2 : Performance, Optimisation et Production

Formation personnalisee sur 3 jours

Par Emmanuel DEMEY

---
layout: center
---

# Rappel Jour 1

<v-clicks>

- **Concepts fondamentaux** : Cluster, Index, Shard, Document
- **Mapping** : text vs keyword (critique pour JVM)
- **Templates** : Index templates, component templates
- **Recherche** : Query DSL, bool query

</v-clicks>

<br>

<v-click>

> Aujourd'hui : On attaque les **problemes concrets** !

</v-click>

---
layout: intro
---

# Programme Jour 2
## Performance, Optimisation et Production (9h-17h)

**Matin (9h-12h30)**:
- Dimensionnement et Sizing (2h)
- Data Retention et ILM (1h30)

**Apres-midi (14h-17h)**:
- Operating et Troubleshooting (2h)
- Audit de votre cluster (1h)

---
layout: section
---

# Partie 6 : Dimensionnement et Sizing
*Duree : 2h*

## ESSENTIEL POUR VOS 15M LOGS/JOUR

---

# Pourquoi le sizing est critique ?

<v-clicks>

Avec **15M logs/jour** :

| Probleme | Consequence |
|----------|-------------|
| Trop de shards | JVM surchargee |
| Shards trop gros | Recherches lentes |
| Mauvais ratio memory:data | Couts exploses |
| Replicas mal configures | Ressources gaspillees |

</v-clicks>

<br>

<v-click>

> Un bon sizing peut **reduire vos couts de 50%** !

</v-click>

---

# Calcul du nombre de shards

Regles de base :

<v-clicks>

| Regle | Valeur |
|-------|--------|
| Taille par shard | 20-40 GB (max 50 GB) |
| Shards par GB de heap | ~20 shards max |
| Shards par noeud | Eviter > 1000 |

</v-clicks>

<br>

<v-click>

```
Calcul pour Parkki :
- 15M logs/jour x 1 KB = 15 GB/jour
- 15 GB / 30 GB (cible) = 0.5 → 1 shard par index quotidien
```

</v-click>

---

# Votre volume de donnees

```
Volume quotidien = Nombre de logs x Taille moyenne

Pour Parkki :
- 15M logs/jour
- Taille moyenne : 1 KB/log
- Volume quotidien = 15 GB/jour

Avec 10 jours de retention :
- Volume total = 150 GB
- Avec replicas (x2) = 300 GB
```

<v-click>

**Recommendation** : 1 shard primaire par index quotidien

</v-click>

---

# Ratios Memory:Data

<v-clicks>

| Tier | Ratio | Usage |
|------|-------|-------|
| **Hot** | 1:30 | Donnees recentes, indexation active |
| **Warm** | 1:160 | Donnees moins consultees |
| **Cold** | 1:500 | Archives rarement consultees |
| **Frozen** | 1:2000+ | Archives tres rarement consultees |

</v-clicks>

<br>

<v-click>

```
Calcul RAM pour Parkki (Hot tier) :
- Donnees Hot (2 jours) = 30 GB x 2 (replicas) = 60 GB
- RAM necessaire = 60 GB / 30 = 2 GB minimum
```

</v-click>

---

# Dimensionnement complet pour Parkki

```
Architecture recommandee :

Hot tier (jours 0-2) :
- 45 GB de donnees (x2 = 90 GB)
- RAM : 90 GB / 30 = 3 GB

Warm tier (jours 3-10) :
- 120 GB de donnees (x2 = 240 GB)
- RAM : 240 GB / 160 = 1.5 GB

Total RAM data nodes : 5-8 GB recommande
```

<v-click>

> Avec ILM Hot/Warm : **-65% de RAM** vs tout en Hot !

</v-click>

---

# Thread Pools

Les thread pools gerent les operations :

<v-clicks>

| Thread Pool | Usage | Symptome si sature |
|-------------|-------|-------------------|
| `write` | Indexation | Indexation lente/rejetee |
| `search` | Recherches | Requetes lentes/timeout |
| `get` | Recuperation doc | GET lents |
| `bulk` | Bulk API | Bulk rejetes |

</v-clicks>

---

# Monitoring des Thread Pools

```bash
GET /_cat/thread_pool?v&h=node_name,name,active,queue,rejected

# Resultat exemple :
node_name  name   active queue rejected
node-1     write  5      0     0         # OK
node-1     search 2      0     0         # OK
node-1     bulk   0      50    123       # Probleme !
```

<v-clicks>

**Si rejected > 0** :
- Le cluster n'arrive pas a suivre la charge
- Reduire le debit d'indexation
- Augmenter les ressources

</v-clicks>

---

# Disk Watermarks

<v-clicks>

| Watermark | Seuil | Action |
|-----------|-------|--------|
| **Low** | 85% | Nouveaux shards non alloues |
| **High** | 90% | Shards deplaces vers autres noeuds |
| **Flood stage** | 95% | Index en READ-ONLY ! |

</v-clicks>

<br>

<v-click>

```bash
# Verifier l'utilisation disque
GET /_cat/allocation?v&h=node,shards,disk.used,disk.avail,disk.percent
```

</v-click>

<br>

<v-click>

> **Attention** : A 95%, l'indexation s'arrete !

</v-click>

---

# Espace disque pour Parkki

```
Calcul :
- Volume quotidien : 15 GB
- Retention : 10 jours
- Volume total : 150 GB
- Avec replicas (x2) : 300 GB
- Avec marge watermark (x1.25) : 375 GB

Espace disque minimum recommande : 400 GB
```

---
layout: section
---

# Partie 7 : Data Retention et ILM
*Duree : 1h30*

## CRITIQUE POUR REDUIRE VOS COUTS

---

# Strategies de retention

<v-clicks>

| Strategie | Ressources | Acces | Use Case |
|-----------|------------|-------|----------|
| Index ouvert | CPU + RAM + Disk | Temps reel | Donnees actives |
| Index closed | Disk uniquement | Rouvrir necessaire | Archives court terme |
| Index shrinked | Moins de shards | Temps reel (lecture) | Reduire overhead |
| Snapshot | Stockage externe | Restauration | Backup/archives |
| Suppression | Aucune | Aucun | Donnees expirees |

</v-clicks>

---

# Open/Close API

```bash
# Fermer un index (libere RAM/CPU)
POST /logs-2025.01.01/_close

# Verifier
GET /_cat/indices/logs-*?v&h=index,status

# Rouvrir
POST /logs-2025.01.01/_open
```

<v-clicks>

**Avantages** :
- Libere immediatement la memoire
- Donnees toujours sur disque
- Reouverture rapide

</v-clicks>

---

# Shrink API

Reduire le nombre de shards :

```bash
# Preparer l'index (read-only)
PUT /logs-old/_settings
{
  "settings": {
    "index.blocks.write": true
  }
}

# Shrink de 4 shards vers 1
POST /logs-old/_shrink/logs-shrunk
{
  "settings": {
    "index.number_of_shards": 1
  }
}
```

<v-click>

> Shrink = moins de shards = moins de heap

</v-click>

---

# Data Streams

Parfaits pour vos logs :

```
Data Stream: logs-parkki
├── .ds-logs-parkki-2025.01.13-000001 (read)
├── .ds-logs-parkki-2025.01.14-000002 (read)
└── .ds-logs-parkki-2025.01.15-000003 (write)
```

<v-clicks>

**Avantages** :
- Rollover automatique
- Nom unique (plus de gestion manuelle)
- Suppression facile des anciens indices
- Recherche transparente

</v-clicks>

---

# Index Lifecycle Management (ILM)

Phases du cycle de vie :

```
Hot → Warm → Cold → Frozen → Delete
 │      │      │       │        │
 │      │      │       │        └─ Suppression definitive
 │      │      │       └─ Snapshot + minimal resources
 │      │      └─ Read-only, moins de replicas
 │      └─ Read-only, shrink, force merge
 └─ Indexation active, recherches frequentes
```

---

# Policy ILM pour Parkki

```json
PUT /_ilm/policy/logs-parkki-policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_primary_shard_size": "20gb"
          }
        }
      },
      "warm": {
        "min_age": "2d",
        "actions": {
          "readonly": {},
          "forcemerge": { "max_num_segments": 1 }
        }
      },
      "delete": {
        "min_age": "10d",
        "actions": { "delete": {} }
      }
    }
  }
}
```

---

# Timeline ILM pour Parkki

<v-clicks>

| Jour | Phase | Actions |
|------|-------|---------|
| 0-1 | Hot | Indexation active |
| 1 | Hot | Rollover (nouveau backing index) |
| 2 | Warm | readonly, forcemerge |
| 10 | Delete | Suppression automatique |

</v-clicks>

<br>

<v-click>

**Economies estimees** :

```
Sans ILM : 150 GB hot → RAM 5 GB
Avec ILM : 30 GB hot + 120 GB warm → RAM 1.75 GB

Reduction : -65% de RAM !
```

</v-click>

---

# Associer ILM a un template

```json
PUT /_index_template/logs-parkki-template
{
  "index_patterns": ["logs-parkki-*"],
  "data_stream": {},
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "refresh_interval": "30s",
      "index.lifecycle.name": "logs-parkki-policy"
    }
  }
}
```

<v-click>

> Chaque nouvel index herite automatiquement de la policy ILM

</v-click>

---

# Monitoring ILM

```bash
# Statut global ILM
GET /_ilm/status

# Index geres par ILM
GET /*/_ilm/explain?only_managed=true

# Index en erreur
GET /*/_ilm/explain?only_errors=true

# Retry apres erreur
POST /logs-parkki/_ilm/retry
```

---
layout: center
---

# Pause dejeuner
## 12h30 - 14h00

Retour a 14h pour : **Operating et Troubleshooting**

---
layout: section
---

# Partie 8 : Operating et Troubleshooting
*Duree : 2h*

## POUR VOS PROBLEMES JVM

---

# Internals : Processus d'indexation

```
Document → Ingest Pipeline → Index Buffer → Segment → Merge
                                  │
                                  ├─ refresh (1s par defaut)
                                  │     └─ Cree un nouveau segment
                                  │
                                  └─ flush
                                        └─ Ecrit sur disque
```

<v-clicks>

**Impact pour vous** :
- Refresh frequent = beaucoup de segments
- Beaucoup de segments = merges frequents
- Merges = CPU + I/O

</v-clicks>

---

# Segments et Merge

```bash
# Voir les segments d'un index
GET /_cat/segments/logs-parkki-*?v

# Forcer un merge (attention en prod !)
POST /logs-parkki-2025.01.14/_forcemerge?max_num_segments=1
```

<v-clicks>

**Bonnes pratiques** :
- `refresh_interval: 30s` pour les logs
- Force merge uniquement sur index read-only
- ILM gere le force merge automatiquement

</v-clicks>

---

# Slow Queries

Configuration des slowlogs :

```json
PUT /logs-parkki-*/_settings
{
  "index.search.slowlog.threshold.query.warn": "10s",
  "index.search.slowlog.threshold.query.info": "5s",
  "index.search.slowlog.threshold.fetch.warn": "1s"
}
```

<v-clicks>

**Ou trouver les logs** :
- Elastic Cloud : Stack Monitoring > Logs
- Self-hosted : `/var/log/elasticsearch/`

</v-clicks>

---

# Debug des shards non assignes

```bash
# Voir les shards non assignes
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason

# Comprendre pourquoi
GET /_cluster/allocation/explain
{
  "index": "logs-parkki-2025.01.15",
  "shard": 0,
  "primary": true
}
```

<v-clicks>

**Causes courantes** :
- Disk watermark atteint
- Node down
- Allocation filtering

</v-clicks>

---

# CAT APIs essentielles

```bash
# Sante du cluster
GET /_cat/health?v

# Noeuds et leurs metriques
GET /_cat/nodes?v&h=name,heap.percent,ram.percent,cpu,disk.used_percent

# Indices et leur taille
GET /_cat/indices?v&h=index,pri,rep,docs.count,store.size&s=store.size:desc

# Shards et leur allocation
GET /_cat/shards?v&h=index,shard,prirep,state,node

# Utilisation disque par noeud
GET /_cat/allocation?v
```

---

# Gestion de la memoire JVM

<v-clicks>

**Configuration heap** :
- 50% de la RAM disponible
- Maximum 31 GB (compressed oops)
- Minimum = Maximum (eviter resize)

**Symptomes de problemes JVM** :
- Heap > 85% en permanence
- GC frequents et longs
- Latence des requetes variable
- Node qui "disparait" du cluster

</v-clicks>

---

# Monitoring JVM

```bash
# Heap usage
GET /_cat/nodes?v&h=name,heap.percent,heap.current,heap.max

# Stats JVM detaillees
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_used_percent

# Garbage Collection
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.gc
```

<v-clicks>

**Seuils critiques** :
- < 75% : OK
- 75-85% : Attention
- > 85% : Probleme imminent

</v-clicks>

---

# Field Data Cache

**Le piege classique** : aggregations sur champs `text`

```bash
# Voir l'utilisation du fielddata
GET /_cat/fielddata?v

# Stats detaillees
GET /_nodes/stats/indices/fielddata?fields=*
```

<v-clicks>

**Probleme** :
- Champ `text` dans aggregation = fielddata en memoire
- Fielddata peut exploser la heap

**Solution** :
- Utiliser `keyword` pour les aggregations
- Ou `text` avec sous-champ `keyword`

</v-clicks>

---

# Solutions aux problemes JVM

<v-clicks>

| Probleme | Solution |
|----------|----------|
| Heap > 85% | Reduire shards, augmenter refresh_interval |
| Fielddata eleve | Utiliser keyword au lieu de text |
| Trop de shards | ILM + shrink |
| GC frequents | Augmenter heap (max 31GB) |
| Segments nombreux | Force merge sur index read-only |

</v-clicks>

<br>

<v-click>

> La plupart de vos problemes JVM viennent probablement du **mapping** !

</v-click>

---
layout: section
---

# Partie 9 : Audit de votre cluster
*Duree : 1h*

## SESSION PRATIQUE SUR VOS CLUSTERS

---

# Checklist d'audit

<v-clicks>

**1. Configuration** :
- [ ] Verifier elasticsearch.yml
- [ ] Roles des noeuds
- [ ] Settings JVM

**2. Mappings** :
- [ ] Identifier les champs `text` inutiles
- [ ] Verifier les dynamic templates
- [ ] Analyser le fielddata

**3. Sizing** :
- [ ] Nombre de shards vs volume
- [ ] Ratio memory:data
- [ ] Utilisation disque

</v-clicks>

---

# Commandes d'audit

```bash
# 1. Sante globale
GET /_cluster/health

# 2. Nodes et ressources
GET /_cat/nodes?v&h=name,heap.percent,ram.percent,disk.used_percent,node.role

# 3. Indices problematiques
GET /_cat/indices?v&s=store.size:desc&h=index,pri,rep,docs.count,store.size

# 4. Shards non assignes
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason&s=state

# 5. Thread pool rejections
GET /_cat/thread_pool?v&h=node_name,name,rejected&s=rejected:desc
```

---

# Audit des mappings

```bash
# Voir le mapping d'un index
GET /logs-parkki-*/_mapping

# Chercher les champs text
GET /logs-parkki-*/_mapping?filter_path=**.type

# Fielddata cache
GET /_cat/fielddata?v&format=json
```

<v-click>

**Questions a se poser** :
- Ce champ `text` est-il vraiment necessaire ?
- Fait-on des aggregations sur ce champ ?
- Peut-on le passer en `keyword` ?

</v-click>

---

# Recommandations immediates

<v-clicks>

**Quick wins** :
1. Augmenter `refresh_interval` a 30s
2. Passer les champs filtres en `keyword`
3. Mettre en place ILM Hot/Warm/Delete
4. Configurer les slowlogs

**Moyen terme** :
1. Revoir les mappings
2. Implementer les data streams
3. Optimiser les templates

**Long terme** :
1. Architecture Hot/Warm sur noeuds dedies
2. Monitoring proactif avec alerting
3. Procedures de maintenance automatisees

</v-clicks>

---
layout: center
---

# Recapitulatif Jour 2

---

# Ce que nous avons vu aujourd'hui

<v-clicks>

1. **Sizing** : Calcul shards, ratios memory:data
2. **Thread Pools** : Monitoring des rejections
3. **Watermarks** : Gestion de l'espace disque
4. **ILM** : Hot/Warm/Delete automatise
5. **Data Streams** : Gestion simplifiee des logs
6. **Troubleshooting** : Debug JVM, shards, slowlogs
7. **Audit** : Analyse de votre cluster

</v-clicks>

---

# Impact pour Parkki

<v-clicks>

| Action | Impact |
|--------|--------|
| ILM Hot/Warm/Delete | **-65% RAM** |
| refresh_interval: 30s | **JVM stabilisee** |
| keyword vs text | **Moins de fielddata** |
| 1 shard/index quotidien | **Overhead reduit** |
| Monitoring thread pools | **Anticipation problemes** |

</v-clicks>

---

# Demain : Jour 3

**Monitoring, Securite et APM**

<v-clicks>

**Matin** :
- **Monitoring approfondi** (anticiper les problemes)
- **Alerting** (reagir proactivement)

**Apres-midi** :
- **Securite** (authentification, autorisation)
- **APM** (votre use case)
- **Synthese et plan d'action**

</v-clicks>

---
layout: end
---

# Merci !

## Questions ?

**A demain 9h pour le Jour 3**

Contact : demey.emmanuel@gmail.com
