## Lab 4.1: Utilisation de l'API Cluster Health

**Topic**: Monitoring - APIs de Surveillance
**Prérequis**: Cluster Elasticsearch avec au moins 1 nœud actif

### Objectif

Maîtriser l'API `_cluster/health` pour diagnostiquer l'état du cluster, interpréter les statuts (green/yellow/red), et identifier les shards non alloués.

### Contexte

Vous recevez une alerte indiquant que le cluster est passé en statut `yellow`. Vous devez diagnostiquer la cause et comprendre l'impact sur le service.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Vérifiez que votre cluster est accessible: `GET /`
2. Créez un index de test avec replicas:

```bash
PUT /health-test
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}
```

#### Étapes

**Étape 1**: Consulter le cluster health basique

```bash
GET /_cluster/health
```

**Résultat attendu**:
```json
{
  "cluster_name": "elasticsearch",
  "status": "yellow",
  "timed_out": false,
  "number_of_nodes": 1,
  "number_of_data_nodes": 1,
  "active_primary_shards": 2,
  "active_shards": 2,
  "relocating_shards": 0,
  "initializing_shards": 0,
  "unassigned_shards": 2,
  "delayed_unassigned_shards": 0,
  "number_of_pending_tasks": 0,
  "number_of_in_flight_fetch": 0,
  "task_max_waiting_in_queue_millis": 0,
  "active_shards_percent_as_number": 50.0
}
```

**Interprétation**:
- 🟡 **status: "yellow"**: Au moins un replica shard non alloué
- ✅ **active_primary_shards: 2**: Tous les primaires sont actifs (pas de perte de données)
- ⚠️ **unassigned_shards: 2**: 2 replicas ne peuvent pas être alloués (cluster à 1 nœud)
- ⚠️ **active_shards_percent: 50%**: Seulement la moitié des shards sont actifs

**Étape 2**: Obtenir des détails par index

```bash
GET /_cluster/health?level=indices
```

**Résultat attendu**:
```json
{
  "cluster_name": "elasticsearch",
  "status": "yellow",
  "indices": {
    "health-test": {
      "status": "yellow",
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "active_primary_shards": 2,
      "active_shards": 2,
      "relocating_shards": 0,
      "initializing_shards": 0,
      "unassigned_shards": 2
    }
  }
}
```

**Observation**: L'index `health-test` est responsable du statut yellow.

**Étape 3**: Identifier les shards non alloués

```bash
GET /_cat/shards/health-test?v&h=index,shard,prirep,state,unassigned.reason
```

**Résultat attendu**:
```
index       shard prirep state      unassigned.reason
health-test 0     p      STARTED    
health-test 0     r      UNASSIGNED NODE_LEFT
health-test 1     p      STARTED    
health-test 1     r      UNASSIGNED NODE_LEFT
```

**Explication**:
- Les 2 shards primaires (p) sont STARTED ✅
- Les 2 shards replicas (r) sont UNASSIGNED avec raison "NODE_LEFT"
- **Cause**: Pas assez de nœuds pour allouer les replicas (besoin de 2 nœuds minimum)

**Étape 4**: Comprendre les couleurs de statut

| Statut | Signification | Impact | Action |
|--------|---------------|--------|--------|
| 🟢 **GREEN** | Tous les shards (primaires + replicas) alloués | Aucun | Normal |
| 🟡 **YELLOW** | Tous primaires alloués, certains replicas manquants | Fonctionnel, mais pas de HA | Surveillance, non urgent |
| 🔴 **RED** | Au moins un primaire manquant | **PERTE DE DONNÉES** | Action immédiate |

**Étape 5**: Simuler un cluster RED (optionnel, avec précaution)

**Attention**: Cette manipulation peut entraîner une perte de données temporaire.

```bash
# Créer un index
PUT /red-test
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 0
  }
}

# Indexer des documents
POST /red-test/_doc/1
{"message": "Test document"}

# Fermer l'index (simule un shard primaire indisponible)
POST /red-test/_close

# Vérifier le cluster health
GET /_cluster/health
```

**Résultat attendu**: `"status": "red"` (au moins un shard primaire fermé)

**Reopen pour restaurer**:
```bash
POST /red-test/_open
GET /_cluster/health
```

**Étape 6**: Utiliser les paramètres de l'API

**Attendre le statut green** (timeout 30s):
```bash
GET /_cluster/health?wait_for_status=green&timeout=30s
```

**Attendre qu'aucun shard ne soit relocating**:
```bash
GET /_cluster/health?wait_for_no_relocating_shards=true&timeout=30s
```

**Filtrer un index spécifique**:
```bash
GET /_cluster/health/health-test
```

#### Validation

**Commandes de vérification**:

1. Résumé cluster avec métriques clés:
```bash
GET /_cluster/health?filter_path=status,number_of_nodes,active_shards,unassigned_shards
```

2. Santé de tous les index:
```bash
GET /_cluster/health?level=indices&filter_path=indices.*.status
```

3. Identifier tous les shards unassigned du cluster:
```bash
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason | grep UNASSIGNED
```

4. Expliquer pourquoi un shard est unassigned:
```bash
GET /_cluster/allocation/explain
{
  "index": "health-test",
  "shard": 0,
  "primary": false
}
```

**Résultat exemple**:
```json
{
  "index": "health-test",
  "shard": 0,
  "primary": false,
  "current_state": "unassigned",
  "unassigned_info": {
    "reason": "INDEX_CREATED",
    "at": "2023-11-10T10:00:00.000Z",
    "details": "not enough data nodes to allocate shard, allocation would violate shard allocation rules"
  },
  "can_allocate": "no",
  "allocate_explanation": "cannot allocate because allocation is not permitted to any of the nodes"
}
```

#### Critères de Succès

- ✅ Comprendre les 3 statuts (green/yellow/red) et leur signification
- ✅ Identifier les shards unassigned avec `_cat/shards`
- ✅ Utiliser `_cluster/allocation/explain` pour diagnostiquer
- ✅ Interpréter `active_shards_percent` (100% = green, <100% = yellow/red)
- ✅ Savoir quand un statut yellow est acceptable (dev/test avec 1 nœud)

#### Dépannage

**Problème**: Cluster reste yellow même avec 2 nœuds
→ Vérifiez les règles d'allocation: `GET /_cluster/settings`
→ Vérifiez que les nœuds ont le rôle `data`: `GET /_cat/nodes?v&h=name,node.role`
→ Vérifiez l'espace disque: watermark flood peut bloquer l'allocation

**Problème**: Cluster passe en red après suppression d'un index
→ Normal temporairement, les shards doivent être réalloués
→ Attendez quelques secondes et revérifiez: `GET /_cluster/health`
→ Si reste red, vérifiez les logs: `tail -f /var/log/elasticsearch/elasticsearch.log`

**Problème**: `active_shards_percent` bloqué à un pourcentage
→ Des shards sont INITIALIZING (en cours de copie)
→ Vérifiez avec: `GET /_cat/recovery?v`
→ Attendez la fin de la récupération

---

