## Lab 6.1: Création et Restauration de Snapshots

**Objectif**: Maîtriser la configuration de repositories de snapshots, la création de sauvegardes, et la restauration d'indices pour assurer la protection des données.

**Contexte**: Les snapshots sont essentiels pour protéger vos données contre les suppressions accidentelles, les corruptions, et les pannes matérielles. Dans ce lab, vous allez configurer un repository filesystem, créer plusieurs snapshots, et pratiquer différents scénarios de restauration.

### Étape 1: Configurer le Chemin du Repository

Avant de créer un repository, vous devez déclarer le chemin autorisé dans `elasticsearch.yml`.

**Sur un cluster Docker/local** :

1. Localiser le fichier de configuration :

```bash
# Docker
docker exec -it elasticsearch-node-1 cat /usr/share/elasticsearch/config/elasticsearch.yml

# Installation locale
cat /etc/elasticsearch/elasticsearch.yml
```

2. Ajouter la configuration `path.repo` :

```yaml
# Configuration pour snapshots
path.repo: ["/usr/share/elasticsearch/backups"]
```

3. **Pour Docker**, créer le répertoire et monter le volume :

```bash
# Créer le répertoire sur l'hôte
mkdir -p ~/elasticsearch-backups

# Redémarrer le conteneur avec le volume
docker run -d \
  --name elasticsearch-node-1 \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "path.repo=/usr/share/elasticsearch/backups" \
  -v ~/elasticsearch-backups:/usr/share/elasticsearch/backups \
  docker.elastic.co/elasticsearch/elasticsearch:8.12.0
```

4. **Pour installation locale**, créer le répertoire et définir les permissions :

```bash
sudo mkdir -p /mnt/elasticsearch/backups
sudo chown elasticsearch:elasticsearch /mnt/elasticsearch/backups
sudo chmod 775 /mnt/elasticsearch/backups
```

5. Redémarrer Elasticsearch pour appliquer la configuration :

```bash
# Docker
docker restart elasticsearch-node-1

# systemd
sudo systemctl restart elasticsearch
```

### Étape 2: Créer un Repository de Snapshots

Une fois le chemin configuré, créez le repository via l'API :

```bash
PUT /_snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/backups",
    "compress": true,
    "chunk_size": "128mb",
    "max_restore_bytes_per_sec": "40mb",
    "max_snapshot_bytes_per_sec": "40mb"
  }
}
```

**Résultat attendu** :
```json
{
  "acknowledged": true
}
```

**Vérifier le repository** :

```bash
GET /_snapshot/my_backup
```

**Résultat attendu** :
```json
{
  "my_backup": {
    "type": "fs",
    "settings": {
      "location": "/usr/share/elasticsearch/backups",
      "compress": "true",
      "chunk_size": "128mb",
      "max_restore_bytes_per_sec": "40mb",
      "max_snapshot_bytes_per_sec": "40mb"
    }
  }
}
```

**Tester la connectivité du repository** :

```bash
POST /_snapshot/my_backup/_verify
```

**Résultat attendu** :
```json
{
  "nodes": {
    "abc123xyz": {
      "name": "elasticsearch-node-1"
    }
  }
}
```

### Étape 3: Créer des Données de Test

Créons plusieurs indices avec des données pour tester les snapshots :

```bash
# Index 1: Produits
PUT /products
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}

POST /products/_bulk
{"index":{"_id":"1"}}
{"name":"Laptop","price":999,"category":"electronics"}
{"index":{"_id":"2"}}
{"name":"Mouse","price":25,"category":"electronics"}
{"index":{"_id":"3"}}
{"name":"Desk Chair","price":199,"category":"furniture"}
{"index":{"_id":"4"}}
{"name":"Monitor","price":299,"category":"electronics"}
{"index":{"_id":"5"}}
{"name":"Keyboard","price":79,"category":"electronics"}

# Index 2: Commandes
PUT /orders
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}

POST /orders/_bulk
{"index":{"_id":"1"}}
{"order_id":"ORD-001","customer":"Alice","total":999,"date":"2024-01-15"}
{"index":{"_id":"2"}}
{"order_id":"ORD-002","customer":"Bob","total":324,"date":"2024-01-16"}
{"index":{"_id":"3"}}
{"order_id":"ORD-003","customer":"Charlie","total":199,"date":"2024-01-17"}

# Index 3: Utilisateurs
PUT /users
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}

POST /users/_bulk
{"index":{"_id":"1"}}
{"username":"alice","email":"alice@example.com","role":"admin"}
{"index":{"_id":"2"}}
{"username":"bob","email":"bob@example.com","role":"user"}
{"index":{"_id":"3"}}
{"username":"charlie","email":"charlie@example.com","role":"user"}
```

**Vérifier les indices créés** :

```bash
GET /_cat/indices?v&h=index,docs.count,store.size
```

**Résultat attendu** :
```
index    docs.count store.size
products 5          4.2kb
orders   3          3.1kb
users    3          2.8kb
```

### Étape 4: Créer un Snapshot Complet

Créons un premier snapshot incluant tous les indices :

```bash
PUT /_snapshot/my_backup/snapshot_full_2024_01_15
{
  "indices": "*",
  "ignore_unavailable": true,
  "include_global_state": true,
  "metadata": {
    "taken_by": "ops-team",
    "taken_because": "lab-exercise-full-backup",
    "environment": "development"
  }
}
```

**Résultat attendu** :
```json
{
  "accepted": true
}
```

**Surveiller la progression du snapshot** :

```bash
GET /_snapshot/my_backup/snapshot_full_2024_01_15/_status
```

**Résultat pendant la création** :
```json
{
  "snapshots": [{
    "snapshot": "snapshot_full_2024_01_15",
    "repository": "my_backup",
    "state": "IN_PROGRESS",
    "shards_stats": {
      "initializing": 0,
      "started": 2,
      "finalizing": 0,
      "done": 1,
      "failed": 0,
      "total": 3
    }
  }]
}
```

**Attendre que l'état devienne SUCCESS** :

```bash
GET /_snapshot/my_backup/snapshot_full_2024_01_15
```

**Résultat attendu** :
```json
{
  "snapshots": [{
    "snapshot": "snapshot_full_2024_01_15",
    "uuid": "abc-123-xyz",
    "state": "SUCCESS",
    "indices": ["products", "orders", "users"],
    "include_global_state": true,
    "shards": {
      "total": 3,
      "failed": 0,
      "successful": 3
    },
    "start_time": "2024-01-15T10:00:00.000Z",
    "end_time": "2024-01-15T10:00:05.432Z",
    "duration_in_millis": 5432
  }]
}
```

### Étape 5: Créer un Snapshot Partiel

Créons un snapshot incluant uniquement les indices "products" et "orders" :

```bash
PUT /_snapshot/my_backup/snapshot_products_orders
{
  "indices": "products,orders",
  "ignore_unavailable": false,
  "include_global_state": false,
  "partial": false,
  "metadata": {
    "taken_by": "ops-team",
    "taken_because": "lab-exercise-partial-backup"
  }
}
```

**Vérifier que le snapshot est terminé** :

```bash
GET /_snapshot/my_backup/snapshot_products_orders
```

**Résultat attendu** :
```json
{
  "snapshots": [{
    "snapshot": "snapshot_products_orders",
    "state": "SUCCESS",
    "indices": ["products", "orders"],
    "include_global_state": false,
    "shards": {
      "total": 2,
      "successful": 2
    }
  }]
}
```

### Étape 6: Lister Tous les Snapshots

```bash
GET /_snapshot/my_backup/_all
```

**Résultat attendu** :
```json
{
  "snapshots": [
    {
      "snapshot": "snapshot_full_2024_01_15",
      "state": "SUCCESS",
      "indices": ["products", "orders", "users"]
    },
    {
      "snapshot": "snapshot_products_orders",
      "state": "SUCCESS",
      "indices": ["products", "orders"]
    }
  ]
}
```

### Étape 7: Scénario de Restauration 1 - Suppression Accidentelle

Simulons une suppression accidentelle et restaurons depuis le snapshot :

1. **Supprimer accidentellement l'index "orders"** :

```bash
DELETE /orders
```

2. **Vérifier que l'index n'existe plus** :

```bash
GET /_cat/indices?v&h=index
```

3. **Restaurer uniquement l'index "orders" depuis le snapshot** :

```bash
POST /_snapshot/my_backup/snapshot_full_2024_01_15/_restore
{
  "indices": "orders",
  "ignore_unavailable": true,
  "include_global_state": false
}
```

**Résultat attendu** :
```json
{
  "accepted": true
}
```

4. **Surveiller la restauration** :

```bash
GET /_cat/recovery?v&h=index,stage,type,files_percent&s=index
```

**Résultat pendant la restauration** :
```
index  stage     type     files_percent
orders translog  snapshot 100.0%
```

5. **Vérifier que les données sont restaurées** :

```bash
GET /orders/_search
{
  "query": {
    "match_all": {}
  }
}
```

**Résultat attendu** :
```json
{
  "hits": {
    "total": { "value": 3 },
    "hits": [
      {
        "_source": {
          "order_id": "ORD-001",
          "customer": "Alice",
          "total": 999
        }
      },
      ...
    ]
  }
}
```

### Étape 8: Scénario de Restauration 2 - Restauration avec Renommage

Restaurons un index sous un nouveau nom pour comparer des versions ou tester :

```bash
POST /_snapshot/my_backup/snapshot_full_2024_01_15/_restore
{
  "indices": "products",
  "rename_pattern": "(.+)",
  "rename_replacement": "restored_$1",
  "include_aliases": false,
  "index_settings": {
    "index.number_of_replicas": 0
  }
}
```

**Vérifier que le nouvel index existe** :

```bash
GET /_cat/indices?v&h=index,docs.count
```

**Résultat attendu** :
```
index             docs.count
products          5
orders            3
users             3
restored_products 5
```

**Comparer les données** :

```bash
# Original
GET /products/_count

# Restauré
GET /restored_products/_count
```

Les deux devraient retourner `{"count": 5}`.

### Étape 9: Scénario de Restauration 3 - Restauration Complète

Simulons une corruption complète du cluster et restaurons tout :

1. **Supprimer tous les indices (ATTENTION : uniquement en environnement de test !)** :

```bash
DELETE /products,orders,users,restored_products
```

2. **Vérifier qu'il n'y a plus d'indices** :

```bash
GET /_cat/indices
```

3. **Restaurer tous les indices depuis le snapshot** :

```bash
POST /_snapshot/my_backup/snapshot_full_2024_01_15/_restore
{
  "indices": "*",
  "include_global_state": true,
  "ignore_unavailable": true
}
```

4. **Vérifier la restauration complète** :

```bash
GET /_cat/indices?v&h=index,docs.count,store.size
```

**Résultat attendu** :
```
index    docs.count store.size
products 5          4.2kb
orders   3          3.1kb
users    3          2.8kb
```

### Validation Finale

Vérifiez que vous avez réussi le lab :

```bash
# 1. Lister les repositories
GET /_snapshot/_all

# 2. Lister tous les snapshots
GET /_snapshot/my_backup/_all

# 3. Vérifier que tous les indices sont présents
GET /_cat/indices?v

# 4. Compter les documents
GET /products/_count
GET /orders/_count
GET /users/_count
```

**Résultats attendus** :
- Repository `my_backup` existe et est accessible
- Au moins 2 snapshots présents et en état `SUCCESS`
- 3 indices présents : `products`, `orders`, `users`
- Counts : products=5, orders=3, users=3

### Points Clés à Retenir

✅ Le chemin du repository doit être déclaré dans `path.repo` dans `elasticsearch.yml`  
✅ Les snapshots sont **incrémentaux** : seuls les nouveaux segments sont copiés  
✅ Utilisez `include_global_state: true` pour sauvegarder templates et policies  
✅ La restauration nécessite que les indices n'existent pas (ou soient fermés)  
✅ `rename_pattern` et `rename_replacement` permettent de restaurer avec un nouveau nom  
✅ Les snapshots sont **repository-scoped** : supprimer le repository supprime tous ses snapshots  
✅ Utilisez `_verify` pour tester la connectivité du repository  
✅ Les métadonnées personnalisées (`metadata`) aident à documenter les snapshots

---

