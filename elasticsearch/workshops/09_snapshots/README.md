# TP 9 — Sécurité: Snapshots et Restauration

> Maîtriser la configuration de repositories de snapshots, la création de sauvegardes, et la restauration d'indices pour assurer la protection des données.

**Contexte**: Les snapshots sont essentiels pour protéger vos données contre les suppressions accidentelles, les corruptions, et les pannes matérielles. Dans ce lab, vous allez configurer un repository filesystem, créer plusieurs snapshots, et pratiquer différents scénarios de restauration.

## Setup

Ce TP est autonome. Commencez par configurer le chemin du repository et le créer.

## Étape 1: Configurer le Chemin du Repository

Ajoutez la configuration `path.repo` dans `elasticsearch.yml`:

```yaml
path.repo: ["/usr/share/elasticsearch/backups"]
```

**Pour Docker**, créez le répertoire et montez le volume:

```bash
mkdir -p ~/elasticsearch-backups

docker run -d \
  --name elasticsearch-node-1 \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "path.repo=/usr/share/elasticsearch/backups" \
  -v ~/elasticsearch-backups:/usr/share/elasticsearch/backups \
  docker.elastic.co/elasticsearch/elasticsearch:8.12.0
```

**Pour installation locale**:

```bash
sudo mkdir -p /mnt/elasticsearch/backups
sudo chown elasticsearch:elasticsearch /mnt/elasticsearch/backups
sudo chmod 775 /mnt/elasticsearch/backups
```

Redémarrez Elasticsearch pour appliquer la configuration.

## Étape 2: Créer un Repository de Snapshots

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

**Tester la connectivité du repository**:

```bash
POST /_snapshot/my_backup/_verify
```

## Étape 3: Créer des Données de Test

```bash
# Index 1: Produits
PUT /products
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
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
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
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
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

POST /users/_bulk
{"index":{"_id":"1"}}
{"username":"alice","email":"alice@example.com","role":"admin"}
{"index":{"_id":"2"}}
{"username":"bob","email":"bob@example.com","role":"user"}
{"index":{"_id":"3"}}
{"username":"charlie","email":"charlie@example.com","role":"user"}
```

Vérifiez les indices créés:

```bash
GET /_cat/indices?v&h=index,docs.count,store.size
```

## Étape 4: Créer un Snapshot Complet

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

**Surveiller la progression**:

```bash
GET /_snapshot/my_backup/snapshot_full_2024_01_15/_status
```

**Attendre que l'état devienne SUCCESS**:

```bash
GET /_snapshot/my_backup/snapshot_full_2024_01_15
```

## Étape 5: Créer un Snapshot Partiel

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

## Étape 6: Lister Tous les Snapshots

```bash
GET /_snapshot/my_backup/_all
```

## Étape 7: Scénario de Restauration 1 - Suppression Accidentelle

1. Supprimer accidentellement l'index "orders":

```bash
DELETE /orders
```

2. Vérifier que l'index n'existe plus:

```bash
GET /_cat/indices?v&h=index
```

3. Restaurer uniquement l'index "orders":

```bash
POST /_snapshot/my_backup/snapshot_full_2024_01_15/_restore
{
  "indices": "orders",
  "ignore_unavailable": true,
  "include_global_state": false
}
```

4. Surveiller la restauration:

```bash
GET /_cat/recovery?v&h=index,stage,type,files_percent&s=index
```

5. Vérifier que les données sont restaurées:

```bash
GET /orders/_search
{
  "query": { "match_all": {} }
}
```

## Étape 8: Scénario de Restauration 2 - Restauration avec Renommage

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

Comparer les données:

```bash
GET /products/_count
GET /restored_products/_count
```

## Étape 9: Scénario de Restauration 3 - Restauration Complète

1. Supprimer tous les indices (ATTENTION: uniquement en environnement de test):

```bash
DELETE /products,orders,users,restored_products
```

2. Restaurer tous les indices:

```bash
POST /_snapshot/my_backup/snapshot_full_2024_01_15/_restore
{
  "indices": "*",
  "include_global_state": true,
  "ignore_unavailable": true
}
```

3. Vérifier la restauration complète:

```bash
GET /_cat/indices?v&h=index,docs.count,store.size
```

## Validation Finale

```bash
GET /_snapshot/_all
GET /_snapshot/my_backup/_all
GET /_cat/indices?v
GET /products/_count
GET /orders/_count
GET /users/_count
```

**Résultats attendus**:
- Repository `my_backup` existe et est accessible
- Au moins 2 snapshots présents et en état `SUCCESS`
- 3 indices présents: `products`, `orders`, `users`
- Counts: products=5, orders=3, users=3

## Points Clés à Retenir

- Le chemin du repository doit être déclaré dans `path.repo` dans `elasticsearch.yml`
- Les snapshots sont **incrémentaux**: seuls les nouveaux segments sont copiés
- Utilisez `include_global_state: true` pour sauvegarder templates et policies
- La restauration nécessite que les indices n'existent pas (ou soient fermés)
- `rename_pattern` et `rename_replacement` permettent de restaurer avec un nouveau nom
- Utilisez `_verify` pour tester la connectivité du repository
