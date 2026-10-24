# Workshop 12 — _cat APIs: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Step 1

```json
GET /_cat/indices?v
```

`pri`: primary shards; `rep`: replicas per primary; `docs.count`: documents
(primaries only, nested documents included); `store.size`: size of primaries
and replicas. `logs-2023.11` is `yellow`: its replicas cannot be allocated on
the node that holds their primary, and there is only one node.

## Step 2

```json
GET /_cat/indices?v&h=index,health,docs.count,store.size&s=store.size:desc
```

`expand_wildcards=all` adds the hidden and system indices.

## Step 3

```json
GET /_cat/shards/logs-2023.11?format=json&h=index,shard,prirep,state,unassigned.reason
```

**Expected result**:

```json
[
  { "index": "logs-2023.11", "shard": "0", "prirep": "p", "state": "STARTED" },
  { "index": "logs-2023.11", "shard": "0", "prirep": "r", "state": "UNASSIGNED", "unassigned.reason": "INDEX_CREATED" },
  { "index": "logs-2023.11", "shard": "1", "prirep": "p", "state": "STARTED" },
  { "index": "logs-2023.11", "shard": "1", "prirep": "r", "state": "UNASSIGNED", "unassigned.reason": "INDEX_CREATED" }
]
```

2 × (1 + 1) = 4 rows. Other reasons: `NODE_LEFT` (a node left — the shard waits
`index.unassigned.node_left.delayed_timeout`, 1 minute by default, before being
rebuilt elsewhere), `REPLICA_ADDED`, `ALLOCATION_FAILED` (the one to worry about:
`GET /_cluster/allocation/explain` tells why — disk, allocation filters…).

## Step 4

```json
GET /_cat/allocation?v
```

The `UNASSIGNED` row counts the shards on no node. The low disk watermark, 85%
by default, stops new shards on a node; the high one, 90%, moves shards away; the
flood stage, 95%, makes its indices read-only.

## Step 5

```json
GET /_cat/pending_tasks?format=json
```

**Expected result**:

```json
[]
```

A long queue with a high `timeInQueue` is an overloaded master: too many
shards, mapping updates in a loop, too many index creations.

## Step 6

```json
GET /_cat/nodes?format=json&h=name,heap.percent,ram.percent,cpu,node.role
```

The _cat columns and their format may change between versions: a script should
call the JSON APIs — `_cluster/health`, `_nodes/stats`, `_cluster/allocation/explain`.
