# TP 1 — Installation et premiers pas : solution

Pour le formateur. Non publié : les participants trouvent ces requêtes eux-mêmes.
La CI les rejoue juste après le README du TP, et vérifie chaque « Résultat attendu ».

## Étape 1

```json
GET /
```

**Résultat attendu** :

```json
{
  "version": { "distribution": "opensearch", "number": "3.9.0" }
}
```

## Étape 2

```json
GET /_cluster/health
```

**Résultat attendu** :

```json
{ "status": "green", "number_of_nodes": 1 }
```

```json
GET /_cat/nodes?v&h=name,node.roles,cluster_manager
```

L'unique nœud est `cluster_manager` (`*`), avec tous les rôles : `cluster_manager`,
`data`, `ingest`, `remote_cluster_client`.

## Étape 3

```json
DELETE /hello

PUT /hello
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 1 }
}

GET /_cluster/health/hello
```

**Résultat attendu** :

```json
{ "status": "yellow", "active_primary_shards": 1, "unassigned_shards": 1 }
```

```json
GET /_cat/shards/hello?v
```

Le réplica est `UNASSIGNED` : il ne peut pas être sur le nœud de son primaire, et
il n'y en a pas d'autre.

## Étape 4

```json
PUT /hello/_settings
{ "index": { "number_of_replicas": 0 } }

GET /_cluster/health/hello
```

**Résultat attendu** :

```json
{ "status": "green", "unassigned_shards": 0 }
```

## Étape 5

```bash
curl -s 'http://localhost:9200/_cat/indices?v&h=index,health,docs.count'
```
