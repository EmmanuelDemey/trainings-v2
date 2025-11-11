## Lab 2.3: Inspection du Cluster avec les _cat APIs

**Topic**: Installation et Configuration - APIs de Vérification
**Prérequis**: Lab 2.1 complété (cluster à 2+ nœuds)

### Objectif

Maîtriser les _cat APIs pour inspecter rapidement l'état du cluster, des indices, des shards, et de l'allocation de ressources.

### Contexte

En tant qu'administrateur, vous devez diagnostiquer régulièrement l'état du cluster. Les _cat APIs fournissent une vue concise et lisible pour identifier rapidement les problèmes.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Assurez-vous que votre cluster a au moins 2 nœuds actifs
2. Créez quelques index de test avec des données:

```bash
# Créer un index avec 2 shards, 1 replica
PUT /logs-2023.11
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}

# Indexer quelques documents
POST /logs-2023.11/_bulk
{"index":{}}
{"message":"Log entry 1","timestamp":"2023-11-10T10:00:00"}
{"index":{}}
{"message":"Log entry 2","timestamp":"2023-11-10T10:01:00"}
{"index":{}}
{"message":"Log entry 3","timestamp":"2023-11-10T10:02:00"}
```

#### Étapes

**Étape 1**: Lister tous les indices avec _cat/indices

```bash
GET /_cat/indices?v
```

**Résultat attendu**:
```
health status index        pri rep docs.count store.size
green  open   logs-2023.11   2   1          3       15kb
green  open   products       1   0          5       10kb
```

**Colonnes clés**:
- `health`: green/yellow/red
- `pri`: Nombre de shards primaires
- `rep`: Nombre de replicas
- `docs.count`: Nombre de documents
- `store.size`: Taille totale (primaires + replicas)

**Étape 2**: Filtrer et trier les indices

Afficher uniquement les indices avec plus de 10 GB, triés par taille:

```bash
GET /_cat/indices?v&s=store.size:desc&h=index,health,docs.count,store.size
```

**Personnalisation**:
- `s=colonne:desc`: Tri par colonne (desc ou asc)
- `h=col1,col2`: Sélection des colonnes à afficher
- `v`: Affiche les headers (verbose)

**Étape 3**: Inspecter l'allocation des shards avec _cat/shards

```bash
GET /_cat/shards?v
```

**Résultat attendu**:
```
index        shard prirep state   node
logs-2023.11 0     p      STARTED node-1
logs-2023.11 0     r      STARTED data-node-1
logs-2023.11 1     p      STARTED data-node-1
logs-2023.11 1     r      STARTED node-1
```

**Colonnes clés**:
- `prirep`: `p` (primary) ou `r` (replica)
- `state`: STARTED, RELOCATING, INITIALIZING, UNASSIGNED
- `node`: Nœud hébergeant le shard

**Étape 4**: Identifier les shards problématiques

Filtrer uniquement les shards UNASSIGNED:

```bash
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason | grep UNASSIGNED
```

**Raisons d'unassignment courantes**:
- `INDEX_CREATED`: Nouveau shard, allocation en cours
- `NODE_LEFT`: Nœud déconnecté, réallocation nécessaire
- `REPLICA_ADDED`: Replica ajouté, recherche de nœud disponible
- `ALLOCATION_FAILED`: Échec d'allocation (disque plein, règles d'allocation)

**Étape 5**: Vérifier l'utilisation disque avec _cat/allocation

```bash
GET /_cat/allocation?v
```

**Résultat attendu**:
```
shards disk.indices disk.used disk.avail disk.total node
     4         15kb      2gb       48gb       50gb node-1
     4         15kb      1.5gb     48.5gb     50gb data-node-1
```

**Métriques clés**:
- `shards`: Nombre de shards sur ce nœud
- `disk.used`: Espace disque utilisé
- `disk.avail`: Espace disque disponible
- `disk.total`: Capacité disque totale

**Alerte**: Si `disk.used` >85%, le watermark LOW est atteint (plus de nouveaux shards).

**Étape 6**: Surveiller les pending tasks avec _cat/pending_tasks

```bash
GET /_cat/pending_tasks?v
```

**Résultat attendu** (si aucune tâche en attente):
```
insertOrder timeInQueue priority source
```

**Si des tâches sont en attente**:
```
insertOrder timeInQueue priority source
       1234        10s     URGENT  shard-started
```

**Interprétation**: Des pending tasks avec `timeInQueue` >10s indiquent un master surchargé.

#### Validation

**Commandes de vérification**:

1. Comparer _cat/indices et _cat/shards pour un index:
```bash
GET /_cat/indices/logs-2023.11?v
GET /_cat/shards/logs-2023.11?v
```
**Vérification**: `pri × (1 + rep)` = nombre total de shards dans _cat/shards.

2. Exporter les résultats en JSON (pour scripts):
```bash
GET /_cat/nodes?format=json
GET /_cat/indices?format=json&pretty
```

3. Utiliser help pour découvrir toutes les colonnes disponibles:
```bash
GET /_cat/indices?help
GET /_cat/nodes?help
```

**Exemple de sortie**:
```
health                | h                              | current health status
status                | s                              | open/close status
index                 | i,idx                          | index name
...
```

#### Critères de Succès

- ✅ _cat/indices liste tous les indices avec santé et taille
- ✅ _cat/shards montre l'allocation des shards entre nœuds
- ✅ _cat/allocation affiche l'utilisation disque par nœud
- ✅ Capable de filtrer et trier les résultats avec `?h=` et `?s=`
- ✅ Capable d'identifier les shards UNASSIGNED et leur raison

#### Dépannage

**Problème**: "No handler found for uri [/_cat/...]"
→ Vérifiez l'orthographe de l'API (sensible à la casse)
→ Exemple correct: `/_cat/indices` (pas `/_cat/index`)

**Problème**: Colonnes désalignées dans la sortie
→ Utilisez `?v` pour afficher les headers
→ Utilisez `?format=json` pour une sortie structurée

**Problème**: Trop de colonnes, sortie illisible
→ Utilisez `?h=col1,col2,col3` pour sélectionner uniquement les colonnes nécessaires
→ Exemple: `GET /_cat/nodes?v&h=name,heap.percent,ram.percent,cpu,load_1m`

---

