## Lab 2.1: Formation d'un Cluster Multi-Nœuds

**Topic**: Installation et Configuration - Formation de Cluster
**Durée Estimée**: 20-25 minutes
**Prérequis**: Un nœud Elasticsearch 8.x déjà démarré

### Objectif

Démarrer un second nœud Elasticsearch et le joindre au cluster existant en utilisant les enrollment tokens pour former un cluster multi-nœuds sécurisé.

### Contexte

Votre cluster à nœud unique doit évoluer pour supporter plus de charge et assurer la haute disponibilité. Vous allez ajouter un second nœud en utilisant les mécanismes de sécurité automatique d'Elasticsearch 8.x.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Vérifiez que le premier nœud est en cours d'exécution: `GET /`
2. Notez le `cluster_name` du nœud actuel: `GET /_cluster/health`
3. Préparez un second terminal pour le nouveau nœud

#### Étapes

**Étape 1**: Générer un enrollment token

Depuis le premier nœud, générez un token d'enrollment pour permettre à un nouveau nœud de rejoindre le cluster:

```bash
cd /path/to/elasticsearch
bin/elasticsearch-create-enrollment-token -s node
```

**Résultat attendu**: Un token long (JWT) sera affiché:
```
eyJ2ZXIiOiI4LjAuMCIsImFkciI6WyIxOTIuMTY4LjEuMTA6OTIwMCJdLCJmZ3IiOiJhYmMxMjMuLi4iLCJrZXkiOiJ4eXo3ODkuLi4ifQ==
```

**Note**: Ce token expire après 30 minutes. Si expiré, régénérez-en un nouveau.

**Étape 2**: Préparer le répertoire du second nœud

Créez un nouveau répertoire pour le second nœud (pour simulation locale):

```bash
# Option 1: Copier l'installation Elasticsearch
cp -r elasticsearch-8.x elasticsearch-node2

# Option 2: Utiliser la même installation avec des répertoires data séparés
# (configuration via elasticsearch.yml)
```

**Étape 3**: Démarrer le second nœud avec l'enrollment token

Démarrez le nouveau nœud en passant le token:

```bash
cd elasticsearch-node2
bin/elasticsearch --enrollment-token <VOTRE_TOKEN>
```

**Résultat attendu**: Le nœud démarre et affiche des logs indiquant:
```
[INFO ][o.e.n.Node] [node-2] started
[INFO ][o.e.c.s.ClusterApplierService] [node-2] detected_master {node-1}{...}
```

**Étape 4**: Vérifier la formation du cluster

Vérifiez que les deux nœuds sont visibles dans le cluster:

```bash
GET /_cat/nodes?v
```

**Résultat attendu**:
```
ip           heap.percent ram.percent cpu load_1m node.role master name
192.168.1.10 45           60          2   0.50    cdfhilmrstw *      node-1
192.168.1.11 30           55          1   0.40    cdfhilmrstw -      node-2
```

L'astérisque (*) indique le nœud master élu.

**Étape 5**: Vérifier le statut du cluster

Vérifiez que le cluster est passé en statut `green`:

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

**Pourquoi `green` ?** Avec 2 nœuds, les replicas des shards peuvent maintenant être alloués sur le second nœud (réplication fonctionnelle).

#### Validation

**Commandes de vérification**:

1. Lister tous les nœuds avec leurs rôles:
```bash
GET /_cat/nodes?v&h=name,ip,node.role,master,heap.percent,ram.percent
```

2. Vérifier l'allocation des shards entre les nœuds:
```bash
GET /_cat/shards?v
```
**Observation**: Les shards primaires et replicas doivent être répartis entre les 2 nœuds.

3. Vérifier les détails du cluster:
```bash
GET /_cluster/stats?human&pretty
```
**Résultat attendu**: `"number_of_nodes": 2`

4. Tester la résilience (optionnel):
```bash
# Créer un index avec 1 replica
PUT /test-resilience
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}

# Vérifier l'allocation
GET /_cat/shards/test-resilience?v
```
**Observation**: Chaque shard primaire a un replica sur l'autre nœud.

#### Critères de Succès

- ✅ Enrollment token généré avec succès
- ✅ Second nœud démarré et rejoint le cluster
- ✅ `GET /_cat/nodes` affiche 2 nœuds
- ✅ Cluster status = `green`
- ✅ Shards répliqués sur les deux nœuds

#### Dépannage

**Problème**: "Enrollment token has expired"
→ Le token expire après 30 minutes. Régénérez-en un nouveau avec `elasticsearch-create-enrollment-token -s node`

**Problème**: Le second nœud démarre mais ne rejoint pas le cluster
→ Vérifiez la connectivité réseau entre les nœuds (port 9300 pour transport)
→ Vérifiez les logs du second nœud: `tail -f logs/elasticsearch.log`
→ Assurez-vous que `cluster.name` est identique sur les deux nœuds

**Problème**: Cluster reste en statut `yellow`
→ Normal si vous n'avez qu'un seul nœud et des replicas configurés
→ Avec 2 nœuds, vérifiez qu'aucun shard n'est unassigned: `GET /_cat/shards?h=index,shard,prirep,state,unassigned.reason`

**Problème**: "security_exception" lors de requêtes API
→ Elasticsearch 8.x active la sécurité par défaut. Utilisez les credentials générés au premier démarrage
→ Ou désactivez temporairement: `xpack.security.enabled: false` (NON recommandé en production)

---

