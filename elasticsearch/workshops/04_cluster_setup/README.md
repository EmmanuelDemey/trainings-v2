# TP 4 — Installation et Configuration du Cluster

> Démarrer un second nœud Elasticsearch, le joindre au cluster existant, puis configurer des rôles de nœuds spécifiques (master-only, data-only) pour optimiser l'architecture.

**Topic**: Installation et Configuration - Formation de Cluster et Rôles de Nœuds

## Contexte

Votre cluster à nœud unique doit évoluer pour supporter plus de charge et assurer la haute disponibilité. Vous allez ajouter un second nœud, puis séparer les responsabilités par rôles de nœuds.

## Setup

**Avant de commencer**:
1. Vérifiez que le premier nœud est en cours d'exécution: `GET /`
2. Notez le `cluster_name`: `GET /_cluster/health`
3. Préparez un second terminal pour le nouveau nœud

## Partie A: Formation d'un Cluster Multi-Nœuds

### Étape 1: Générer un enrollment token

Depuis le premier nœud, générez un token d'enrollment:

```bash
cd /path/to/elasticsearch
bin/elasticsearch-create-enrollment-token -s node
```

**Résultat attendu**: Un token long (JWT) sera affiché:
```
eyJ2ZXIiOiI4LjAuMCIsImFkciI6WyIxOTIuMTY4LjEuMTA6OTIwMCJdLCJmZ3IiOiJhYmMxMjMuLi4iLCJrZXkiOiJ4eXo3ODkuLi4ifQ==
```

**Note**: Ce token expire après 30 minutes.

### Étape 2: Préparer le répertoire du second nœud

```bash
# Option 1: Copier l'installation Elasticsearch
cp -r elasticsearch-8.x elasticsearch-node2

# Option 2: Utiliser la même installation avec des répertoires data séparés
# (configuration via elasticsearch.yml)
```

### Étape 3: Démarrer le second nœud avec l'enrollment token

```bash
cd elasticsearch-node2
bin/elasticsearch --enrollment-token <VOTRE_TOKEN>
```

**Résultat attendu**: Le nœud démarre et affiche:
```
[INFO ][o.e.n.Node] [node-2] started
[INFO ][o.e.c.s.ClusterApplierService] [node-2] detected_master {node-1}{...}
```

### Étape 4: Vérifier la formation du cluster

```bash
GET /_cat/nodes?v
```

**Résultat attendu**:
```
ip           heap.percent ram.percent cpu load_1m node.role master name
192.168.1.10 45           60          2   0.50    cdfhilmrstw *      node-1
192.168.1.11 30           55          1   0.40    cdfhilmrstw -      node-2
```

### Étape 5: Vérifier le statut du cluster

<!-- ci: no-compare -->
```bash
GET /_cluster/health
```

**Résultat attendu**:
```json
{
  "cluster_name": "elasticsearch",
  "status": "green",
  "number_of_nodes": 2,
  "number_of_data_nodes": 2,
  "active_primary_shards": 5,
  "active_shards": 10,
  "unassigned_shards": 0
}
```

### Validation

1. Lister tous les nœuds avec leurs rôles:
```bash
GET /_cat/nodes?v&h=name,ip,node.role,master,heap.percent,ram.percent
```

2. Vérifier l'allocation des shards entre les nœuds:
```bash
GET /_cat/shards?v
```

3. Tester la résilience (optionnel):
```bash
PUT /test-resilience
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}
GET /_cat/shards/test-resilience?v
```

## Partie B: Configuration des Rôles de Nœuds

### Étape 1: Configurer un nœud data-only

Éditez `elasticsearch.yml` du second nœud:

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

### Étape 2: Redémarrer le nœud avec la nouvelle configuration

```bash
bin/elasticsearch
```

### Étape 3: Vérifier les rôles des nœuds

```bash
GET /_cat/nodes?v&h=name,node.role,master
```

**Résultat attendu**:
```
name         node.role   master
node-1       cdfhilmrstw *
data-node-1  di          -
```

**Légende des rôles**: `d` = data, `i` = ingest, `m` = master, `h` = hot_data, `w` = warm_data, `c` = cold_data

### Étape 4: Configurer un nœud master-only (simulation)

Si vous avez un troisième environnement:

```yaml
# config/elasticsearch.yml (node-3)

cluster.name: elasticsearch
node.name: master-node-1

node.roles: [ master ]

network.host: 0.0.0.0
http.port: 9202
transport.port: 9302

discovery.seed_hosts: ["localhost:9300", "localhost:9301"]
cluster.initial_master_nodes: ["node-1", "master-node-1"]
```

### Étape 5: Vérifier l'allocation des shards

```bash
GET /_cat/shards?v&h=index,shard,prirep,state,node
```

### Validation

```bash
GET /_nodes?filter_path=nodes.*.name,nodes.*.roles
GET /_cat/allocation?v&h=node,shards,disk.used
GET /_cat/master?v
```

## Critères de Succès

- Enrollment token généré avec succès
- Second nœud démarré et rejoint le cluster avec statut green
- `GET /_cat/nodes` affiche 2 nœuds
- Nœud data-only configuré avec `node.roles: [data, ingest]`
- Shards ne sont PAS alloués sur les nœuds master-only

## Dépannage

**Problème**: "Enrollment token has expired"
→ Régénérez un token avec `elasticsearch-create-enrollment-token -s node`

**Problème**: Le second nœud ne rejoint pas le cluster
→ Vérifiez la connectivité réseau (port 9300 pour transport)
→ Vérifiez les logs: `tail -f logs/elasticsearch.log`

**Problème**: Cluster reste en statut `yellow`
→ Normal avec 1 seul nœud et des replicas configurés
→ Vérifiez: `GET /_cat/shards?h=index,shard,prirep,state,unassigned.reason`

**Problème**: Nœud refuse de démarrer après changement de rôles
→ Vérifiez la syntaxe YAML (indentation, pas de tabs)
→ `cluster.initial_master_nodes` doit être retiré après la première initialisation
