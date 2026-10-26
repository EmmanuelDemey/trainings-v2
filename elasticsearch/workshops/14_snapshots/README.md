# Workshop 14 — Snapshots and restore

> Set up a snapshot repository, take backups, and restore indices to protect your data.

**Topic**: Operations — Snapshots and restore

## Context

Snapshots protect your data against accidental deletes, corruption and hardware failures. In this lab you register a filesystem repository, take several snapshots, and practise different restore scenarios.

Each step states **what** to do, not **how**: look for the API in the documentation, try it, read the response, adjust. The expected result lets you check your own answer. Hints are folded — open them only once you are stuck.

## Setup

This workshop stands on its own.

### The path of the repository

A filesystem repository must sit under a path listed in `path.repo`, in `elasticsearch.yml` of **every** node:

```yaml
path.repo: ["/usr/share/elasticsearch/backups"]
```

**With Docker**, create the folder and mount it:

```bash
mkdir -p ~/elasticsearch-backups

docker run -d \
  --name elasticsearch-node-1 \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "path.repo=/usr/share/elasticsearch/backups" \
  -v ~/elasticsearch-backups:/usr/share/elasticsearch/backups \
  docker.elastic.co/elasticsearch/elasticsearch:9.5.5
```

**For a local install**:

```bash
sudo mkdir -p /mnt/elasticsearch/backups
sudo chown elasticsearch:elasticsearch /mnt/elasticsearch/backups
sudo chmod 775 /mnt/elasticsearch/backups
```

Restart Elasticsearch to apply it.

### The test data

```json
# Index 1: products
PUT /products
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

POST /products/_bulk?refresh=true
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

# Index 2: orders
PUT /orders
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

POST /orders/_bulk?refresh=true
{"index":{"_id":"1"}}
{"order_id":"ORD-001","customer":"Alice","total":999,"date":"2024-01-15"}
{"index":{"_id":"2"}}
{"order_id":"ORD-002","customer":"Bob","total":324,"date":"2024-01-16"}
{"index":{"_id":"3"}}
{"order_id":"ORD-003","customer":"Charlie","total":199,"date":"2024-01-17"}

# Index 3: users
PUT /users
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}

POST /users/_bulk?refresh=true
{"index":{"_id":"1"}}
{"username":"alice","email":"alice@example.com","role":"admin"}
{"index":{"_id":"2"}}
{"username":"bob","email":"bob@example.com","role":"user"}
{"index":{"_id":"3"}}
{"username":"charlie","email":"charlie@example.com","role":"user"}
```

## Exercises

Reference: [Snapshot and restore](https://www.elastic.co/docs/deploy-manage/tools/snapshot-and-restore).

### Step 1: Register a repository

Register a **filesystem** repository named `my_backup`, at `/usr/share/elasticsearch/backups`, **compressed**, with chunks of 128 MB and snapshot and restore throttled to 40 MB/s each. Then check that every node can write to it.

<details>
<summary>Hint</summary>

Look at the [shared filesystem repository](https://www.elastic.co/docs/deploy-manage/tools/snapshot-and-restore/shared-file-system-repository) settings. A repository has a `_verify` endpoint.

</details>

**Expected result** (the registration):

```json
{ "acknowledged": true }
```

**Question**: what does the verification answer? What would it tell you on a cluster where one node did not mount the shared folder?

### Step 2: A full snapshot

Take the snapshot `snapshot_full_2024_01_15` of **every** index, **with** the global state, and the metadata `taken_by: ops-team` and `taken_because: lab-exercise-full-backup`. Make the request wait until the snapshot is done.

<details>
<summary>Hint</summary>

By default the snapshot API answers right away and the snapshot carries on in the background. One URL parameter makes it wait.

</details>

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

**Questions**:
- Without waiting, how would you follow the progress of a big snapshot?
- What is the « global state »?

### Step 3: A partial snapshot

Take the snapshot `snapshot_products_orders` of `products` and `orders` only, **without** the global state, failing if one of them is missing.

<details>
<summary>Hint</summary>

Look at `ignore_unavailable` and `partial`.

</details>

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

**Question**: this second snapshot copies `products` and `orders` again. How much disk does it take in the repository? Why?

### Step 4: List the snapshots

List every snapshot of `my_backup`.

<details>
<summary>Hint</summary>

The get snapshot API takes a name, or a wildcard.

</details>

### Step 5: Scenario 1 — an accidental delete

Delete the `orders` index — by mistake: `DELETE /orders`.

Restore **only** `orders` from the full snapshot, without the global state, and make the request wait for the end of the restore. Then count its documents.

<details>
<summary>Hint</summary>

The `_restore` endpoint of a snapshot takes the same `indices` filter as the snapshot API. A `_cat` API follows the shard recoveries.

</details>

**Expected result** (the count):

```json
{ "count": 3 }
```

**Try**: restore `orders` again, while it exists. What does Elasticsearch answer?

### Step 6: Scenario 2 — restore under another name

Restore `products` from the full snapshot as `restored_products`, next to the live `products`, without its aliases and with 0 replicas. Then count its documents.

<details>
<summary>Hint</summary>

Look at `rename_pattern` and `rename_replacement`: a regular expression and its replacement. Settings can be changed at restore time.

</details>

**Expected result** (the count):

```json
{ "count": 5 }
```

### Step 7: Scenario 3 — restore everything

Delete `products`, `orders`, `users` and `restored_products` (only on a test cluster!), then restore the **three application indices** from the full snapshot.

<details>
<summary>Hint</summary>

Restoring `"*"` looks like the obvious answer. Think about what else the full snapshot holds: why would it fail, and how are the system indices restored instead?

</details>

**Expected result** (`GET /_cat/indices/products,orders,users?format=json&h=index,docs.count`):

```json
[
  { "index": "products", "docs.count": "5" },
  { "index": "orders", "docs.count": "3" },
  { "index": "users", "docs.count": "3" }
]
```

## Key points

- The repository path must be listed in `path.repo`
- Snapshots are **incremental**
- The global state holds templates, ILM policies and persistent settings: restore it only on an empty cluster
- System indices are backed up and restored as **feature states** (`GET /_features`)
- An open index cannot be restored over: delete it, close it, or rename it at restore time

## Success criteria

- The repository `my_backup` registered and verified
- At least 2 snapshots in state `SUCCESS`
- `orders` restored after its deletion
- `products` restored under another name
- `products`, `orders` and `users` restored, with 5, 3 and 3 documents

## Troubleshooting

**Problem**: `location [...] doesn't match any of the locations specified by path.repo`
→ `path.repo` is missing, or does not hold the location, on at least one node. It is read at start: restart after changing it.

**Problem**: `cannot restore index [...] because an open index with same name already exists`
→ Delete or close the index first, or restore it under another name.

**Problem**: the verification fails on some nodes
→ On several nodes, the folder must be **shared** (NFS…) and mounted at the same path everywhere.
