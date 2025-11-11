## Lab 2.2: Configuration des Rôles de Nœuds

**Topic**: Installation et Configuration - Rôles de Nœuds
**Prérequis**: Lab 2.1 complété (cluster à 2 nœuds)

### Objectif

Configurer un nœud avec des rôles spécifiques (master-only, data-only) en modifiant `elasticsearch.yml` pour optimiser l'architecture du cluster.

### Contexte

Votre cluster grandit et vous souhaitez séparer les responsabilités: nœuds master dédiés pour la gestion du cluster, et nœuds data dédiés pour le stockage. Cette séparation améliore la stabilité et les performances.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Arrêtez le second nœud (celui démarré dans Lab 2.1)
2. Localisez le fichier `config/elasticsearch.yml` du second nœud
3. Faites une sauvegarde: `cp elasticsearch.yml elasticsearch.yml.backup`

#### Étapes

**Étape 1**: Configurer un nœud data-only

Éditez `elasticsearch.yml` du second nœud pour en faire un nœud data-only:

```yaml
# config/elasticsearch.yml (node-2)

cluster.name: elasticsearch
node.name: data-node-1

# Définir les rôles (data uniquement, pas master)
node.roles: [ data, ingest ]

# Configuration réseau (ajustez selon votre environnement)
network.host: 0.0.0.0
http.port: 9201
transport.port: 9301

# Découverte
discovery.seed_hosts: ["localhost:9300"]
```

**Explication des rôles**:
- `data`: Stockage et recherche de données
- `ingest`: Preprocessing de documents (pipelines)
- Absence de `master`: Ce nœud ne participera PAS à l'élection du master

**Étape 2**: Redémarrer le nœud avec la nouvelle configuration

```bash
bin/elasticsearch
```

**Résultat attendu**: Le nœud démarre et rejoint le cluster avec ses nouveaux rôles.

**Étape 3**: Vérifier les rôles des nœuds

```bash
GET /_cat/nodes?v&h=name,node.role,master
```

**Résultat attendu**:
```
name         node.role   master
node-1       cdfhilmrstw *
data-node-1  di          -
```

**Légende des rôles**:
- `c` = cold_data
- `d` = data
- `f` = frozen_data
- `h` = hot_data
- `i` = ingest
- `l` = ml (machine learning)
- `m` = master
- `r` = remote_cluster_client
- `s` = content_data
- `t` = transform
- `w` = warm_data

**Étape 4**: Créer un nœud master-only (simulation)

Si vous avez un troisième environnement, configurez un nœud master-only:

```yaml
# config/elasticsearch.yml (node-3)

cluster.name: elasticsearch
node.name: master-node-1

# Master uniquement
node.roles: [ master ]

network.host: 0.0.0.0
http.port: 9202
transport.port: 9302

discovery.seed_hosts: ["localhost:9300", "localhost:9301"]
cluster.initial_master_nodes: ["node-1", "master-node-1"]
```

**Ressources recommandées**:
- Master-only: 2-4 cores, 8 GB RAM, 50 GB disque
- Data-only: 8-16 cores, 64 GB RAM, 1+ TB disque SSD

**Étape 5**: Vérifier l'allocation des shards

Vérifiez que les shards ne sont alloués QUE sur les nœuds data:

```bash
GET /_cat/shards?v&h=index,shard,prirep,state,node
```

**Résultat attendu**: Tous les shards doivent être sur `data-node-1` ou `node-1` (si node-1 a le rôle `data`).

#### Validation

**Commandes de vérification**:

1. Détails complets des rôles:
```bash
GET /_nodes?filter_path=nodes.*.name,nodes.*.roles
```

**Résultat attendu**:
```json
{
  "nodes": {
    "abc123": {
      "name": "node-1",
      "roles": ["master", "data", "ingest", ...]
    },
    "def456": {
      "name": "data-node-1",
      "roles": ["data", "ingest"]
    }
  }
}
```

2. Vérifier que le nœud master-only ne stocke PAS de données:
```bash
GET /_cat/allocation?v&h=node,shards,disk.used
```

**Observation**: Un nœud master-only doit avoir `shards: 0`.

3. Tester l'élection du master:
```bash
GET /_cat/master?v
```
**Résultat attendu**: Seuls les nœuds avec rôle `master` peuvent être élus.

#### Critères de Succès

- ✅ Nœud data-only configuré avec `node.roles: [data, ingest]`
- ✅ `_cat/nodes` affiche les rôles corrects pour chaque nœud
- ✅ Shards ne sont PAS alloués sur les nœuds master-only
- ✅ Cluster fonctionne normalement après changement de rôles

#### Dépannage

**Problème**: Nœud refuse de démarrer après changement de rôles
→ Vérifiez la syntaxe YAML (indentation, pas de tabs)
→ Consultez les logs: `tail -f logs/elasticsearch.log`
→ Erreur commune: `cluster.initial_master_nodes` doit être retiré après la première initialisation

**Problème**: Shards restent sur le nœud master-only
→ Les shards existants ne migrent pas automatiquement. Forcez la réallocation:
```bash
POST /_cluster/reroute
```

**Problème**: "master_not_discovered_exception"
→ Au moins un nœud avec rôle `master` doit être actif
→ Vérifiez `discovery.seed_hosts` pour que les nœuds se trouvent

---

