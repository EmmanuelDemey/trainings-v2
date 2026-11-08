# Workshop 14 — Snapshots and restore: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Step 1

```json
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

**Expected result**:

```json
{ "acknowledged": true }
```

```json
POST /_snapshot/my_backup/_verify
```

It lists the nodes that could write to the repository. A node that did not
mount the folder makes it fail with a `repository_verification_exception`
naming that node.

## Step 2

```json
PUT /_snapshot/my_backup/snapshot_full_2024_01_15?wait_for_completion=true
{
  "indices": "*",
  "ignore_unavailable": true,
  "include_global_state": true,
  "metadata": {
    "taken_by": "ops-team",
    "taken_because": "lab-exercise-full-backup"
  }
}
```

**Expected result**:

```json
{
  "snapshot": {
    "snapshot": "snapshot_full_2024_01_15",
    "state": "SUCCESS",
    "metadata": {
      "taken_by": "ops-team",
      "taken_because": "lab-exercise-full-backup"
    }
  }
}
```

Progress: `GET /_snapshot/my_backup/snapshot_full_2024_01_15/_status`. The
global state: the persistent cluster settings, the index and component
templates, the ingest pipelines, the ILM policies — everything that is not an
index — and with it the feature states (system indices).

## Step 3

```json
PUT /_snapshot/my_backup/snapshot_products_orders?wait_for_completion=true
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

**Expected result**:

```json
{
  "snapshot": {
    "snapshot": "snapshot_products_orders",
    "state": "SUCCESS",
    "indices": ["products", "orders"]
  }
}
```

Next to nothing: snapshots are incremental, at the level of Lucene segment
files. The files of `products` and `orders` are already in the repository and
unchanged: the new snapshot only references them.

## Step 4

```json
GET /_snapshot/my_backup/_all
```

`GET /_snapshot/my_backup/*` too; `GET /_cat/snapshots/my_backup?v` for a table.

## Step 5

```json
DELETE /orders
```

```json
POST /_snapshot/my_backup/snapshot_full_2024_01_15/_restore?wait_for_completion=true
{
  "indices": "orders",
  "ignore_unavailable": true,
  "include_global_state": false
}
```

```json
GET /_cat/recovery?v&h=index,stage,type,files_percent&s=index
```

```json
GET /orders/_count
```

**Expected result**:

```json
{ "count": 3 }
```

Restoring it again while it exists fails:

<!-- ci: expect-error -->
```json
POST /_snapshot/my_backup/snapshot_full_2024_01_15/_restore
{
  "indices": "orders"
}
```

`cannot restore index [orders] because an open index with same name already
exists in the cluster`.

## Step 6

```json
POST /_snapshot/my_backup/snapshot_full_2024_01_15/_restore?wait_for_completion=true
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

```json
GET /restored_products/_count
```

**Expected result**:

```json
{ "count": 5 }
```

## Step 7

```json
DELETE /products,orders,users,restored_products
```

```json
POST /_snapshot/my_backup/snapshot_full_2024_01_15/_restore?wait_for_completion=true
{
  "indices": "products,orders,users",
  "include_global_state": false
}
```

```json
GET /_cat/indices/products,orders,users?format=json&h=index,docs.count
```

**Expected result**:

```json
[
  { "index": "products", "docs.count": "5" },
  { "index": "orders", "docs.count": "3" },
  { "index": "users", "docs.count": "3" }
]
```

`"indices": "*"` also holds the system indices (`.security`, `.kibana`…) and
internal data streams: restored over a running cluster, it fails (an open index
with the same name exists) — or, worse, overwrites the users and roles. System
indices are restored as feature states (`"feature_states": ["security"]`), and
`include_global_state: true` belongs to rebuilding an empty cluster.
