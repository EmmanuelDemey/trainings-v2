# Workshop 1 — Installation and first steps: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the workshop README, and checks each « Expected result ».

## Step 1

```json
GET /
```

**Expected result**:

```json
{
  "version": { "distribution": "opensearch", "number": "3.9.0" }
}
```

## Step 2

<!-- ci: retry -->

```json
GET /_cluster/health
```

**Expected result**:

```json
{ "status": "green", "number_of_nodes": 1 }
```

```json
GET /_cat/nodes?v&h=name,node.roles,cluster_manager
```

The only node is the `cluster_manager` (`*`), with all the roles: `cluster_manager`,
`data`, `ingest`, `remote_cluster_client`.

## Step 3

```json
DELETE /hello

PUT /hello
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 1 }
}

GET /_cluster/health/hello
```

**Expected result**:

```json
{ "status": "yellow", "active_primary_shards": 1, "unassigned_shards": 1 }
```

```json
GET /_cat/shards/hello?v
```

The replica is `UNASSIGNED`: it cannot sit on the node of its primary, and there
is no other one.

## Step 4

```json
PUT /hello/_settings
{ "index": { "number_of_replicas": 0 } }

GET /_cluster/health/hello
```

**Expected result**:

```json
{ "status": "green", "unassigned_shards": 0 }
```

## Step 5

```bash
curl -s 'http://localhost:9200/_cat/indices?v&h=index,health,docs.count'
```
