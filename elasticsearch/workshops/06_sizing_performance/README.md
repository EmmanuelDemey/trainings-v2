# TP 6 — Dimensionnement et Performance

> Apprendre à calculer le nombre optimal de shards, configurer correctement le heap JVM, et analyser les thread pools pour diagnostiquer les problèmes de performance.

**Topic**: Performance et Dimensionnement - Planification de Capacité, Configuration JVM, Thread Pools

## Contexte

Vous êtes chargé de dimensionner un cluster Elasticsearch pour un système de logs applicatifs, puis de valider la configuration mémoire et d'analyser les rejections de requêtes.

## Partie A: Dimensionnement de Cluster - Calcul du Nombre de Shards

### Scénario

**Cas d'usage**: Logs d'application e-commerce

**Exigences**:
- Volume initial: 500 GB de logs
- Croissance: 50 GB/jour (nouveaux logs)
- Rétention: 30 jours
- Replicas: 1 (haute disponibilité)
- Taux d'indexation: 10,000 documents/seconde (pics)
- Taux de recherche: 100 requêtes/seconde
- Latence cible: p95 < 200ms pour les recherches

**Infrastructure disponible**:
- Nœuds data: 5 nœuds
- CPU par nœud: 16 cores
- RAM par nœud: 64 GB (31 GB heap, 33 GB OS cache)
- Disque par nœud: 2 TB SSD

### Étape 1: Calculer le volume total après 30 jours

```
Volume initial:     500 GB
Croissance (30j):   50 GB/jour × 30 = 1,500 GB
Volume total:       500 + 1,500 = 2,000 GB

Avec 1 replica (×2):
Volume avec replicas: 2,000 GB × 2 = 4,000 GB
```

### Étape 2: Déterminer la taille cible d'un shard

**Règles de sizing**:
- Taille optimale: 10-50 GB par shard
- Maximum recommandé: 50 GB
- Minimum recommandé: 1 GB

**Choix**: 30 GB par shard

### Étape 3: Calculer le nombre de shards primaires

```
Nombre de shards primaires = 2,000 GB / 30 GB = 66.67 ≈ 67 shards primaires
```

### Étape 4: Vérifier la contrainte de shards par nœud

**Règle**: Maximum 20 shards par GB de heap JVM

```
Heap par nœud:       31 GB
Max shards/nœud:     31 GB × 20 = 620 shards
Shards totaux:       67 primaires + 67 replicas = 134 shards
Shards par nœud:     134 / 5 nœuds = 26.8 ≈ 27 shards/nœud
```

**Validation**: 27 << 620 max - OK

### Étape 5: Stratégie d'indexation - Index par jour (Time-Based Indices)

```bash
PUT /_index_template/logs-template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "refresh_interval": "5s"
    }
  }
}
```

**Avantages**:
- Suppression facile des vieux logs (DELETE index entier)
- Réduction de la taille de l'index (recherches plus rapides)
- Gestion ILM simplifiée

### Validation

| Métrique | Valeur | Statut |
|----------|--------|--------|
| Volume total (avec replicas) | 4,000 GB | OK |
| Shards primaires par jour | 2 | OK |
| Shards totaux (30 jours) | 120 (60p + 60r) | OK |
| Shards par nœud | 24 | OK (< 620 max) |
| Utilisation disque | 40% | OK (< 85%) |

## Partie B: Configuration du Heap JVM

### Setup

```bash
# Vérifiez la RAM totale du serveur
free -h

# Localisez le fichier jvm.options
# Installation par package: /etc/elasticsearch/jvm.options
# Installation par archive: config/jvm.options

# Arrêtez Elasticsearch
sudo systemctl stop elasticsearch
```

### Étape 1: Calculer le heap optimal

**Règles de sizing**:
1. **50% de la RAM**: Le heap doit être au maximum 50% de la RAM physique
2. **Maximum 32 GB**: Ne jamais dépasser 32 GB (limite compressed oops)
3. **Xms = Xmx**: Les deux valeurs doivent être identiques

**Pour un serveur avec 64 GB de RAM**:
```
RAM totale:     64 GB
50% de la RAM:  32 GB
Heap configuré: 31 GB (laisse 1 GB de marge pour la JVM)
OS cache:       33 GB (le reste)
```

### Étape 2: Modifier jvm.options

```bash
sudo vi /etc/elasticsearch/jvm.options
```

```
-Xms31g
-Xmx31g
```

**Important**: Utilisez `g` pour gigabytes, les deux valeurs DOIVENT être identiques.

### Étape 3: Vérifier les autres paramètres JVM critiques

```
-XX:+UseG1GC
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/lib/elasticsearch
```

### Étape 4: Redémarrer et vérifier

```bash
sudo systemctl start elasticsearch

# Vérifier la configuration heap via l'API
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_max_in_bytes

# Vérifier compressed oops (doit être true si heap < 32 GB)
GET /_nodes?filter_path=nodes.*.jvm.using_compressed_ordinary_object_pointers

# Monitorer l'utilisation du heap
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_used_percent
```

**Interprétation**:
- <75%: Sain
- 75-85%: Surveiller
- >85%: Critique (risque OutOfMemoryError)

## Partie C: Analyse des Thread Pools et Rejections

### Setup

Générez de la charge si nécessaire:

```bash
for i in {1..1000}; do
  curl -X POST "localhost:9200/load-test/_doc" -H 'Content-Type: application/json' -d'
  {
    "timestamp": "'$(date -Iseconds)'",
    "value": '$RANDOM'
  }
  ' &
done
```

### Étape 1: Lister tous les thread pools

```bash
GET /_cat/thread_pool?v
```

**Colonnes clés**:
- `active`: Nombre de threads en cours d'exécution
- `queue`: Nombre de tâches en attente
- `rejected`: Nombre de tâches rejetées (cumul depuis démarrage)

### Étape 2: Filtrer les thread pools importants

```bash
GET /_cat/thread_pool/write,search,get?v&h=node_name,name,active,queue,rejected,completed
```

### Étape 3: Analyser les rejections en détail

```bash
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.write,nodes.*.thread_pool.search
```

### Étape 4: Calculer le taux de rejection

```
Taux de rejection = rejected / (completed + rejected) × 100%
```

**Interprétation**:
- <0.1%: Acceptable (pics occasionnels)
- 0.1-1%: Attention (surcharge régulière)
- >1%: Critique (cluster sous-dimensionné)

### Étape 5: Identifier la cause des rejections

```bash
# Le thread pool est-il à sa capacité max ?
GET /_cat/thread_pool/search?v&h=node_name,active,threads

# La queue est-elle pleine ?
GET /_nodes/stats/thread_pool?filter_path=nodes.*.thread_pool.search.queue,nodes.*.thread_pool.search.queue_size

# Charge CPU du cluster
GET /_nodes/stats/os?filter_path=nodes.*.os.cpu.percent
```

### Solutions aux Rejections

**Si thread pool WRITE saturé**:
- Augmenter le refresh_interval
- Utiliser Bulk API avec batches appropriés (5-15 MB)
- Ajouter des nœuds data (scale horizontal)

**Si thread pool SEARCH saturé**:
- Optimiser les requêtes (utiliser filter context)
- Réduire le nombre de shards
- Ajouter des nœuds data ou coordinating-only

## Critères de Succès

- Volume total calculé correctement (4 TB avec replicas)
- Heap configuré à 31 GB avec Xms = Xmx
- Compressed oops activé (true)
- Capable de lister les thread pools et identifier les rejections
- Calculer le taux de rejection et proposer des solutions

## Dépannage

**Problème**: Elasticsearch ne démarre pas après modification du heap
→ Vérifiez les logs: `sudo journalctl -u elasticsearch -f`
→ Erreur courante: Syntaxe invalide dans jvm.options

**Problème**: Compressed oops = false
→ Heap configuré > 32 GB, réduisez à 31 GB maximum

**Problème**: Rejections même avec CPU/RAM disponibles
→ Bottleneck peut être ailleurs (disque I/O, réseau)
→ Vérifiez disk I/O: `iostat -x 1` (Linux)
