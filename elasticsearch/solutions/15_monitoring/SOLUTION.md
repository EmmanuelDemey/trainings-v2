# Workshop 15 — Monitoring: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Part A: Cluster health

### Step 1

```json
GET /_cluster/health

GET /_cluster/health/health-test
```

**Expected result**:

```json
{
  "status": "yellow",
  "number_of_nodes": 1,
  "number_of_data_nodes": 1,
  "active_primary_shards": 2,
  "active_shards": 2,
  "unassigned_shards": 2,
  "active_shards_percent_as_number": 50.0
}
```

The 2 replicas are unassigned because a replica is never allocated on the node
that holds its primary, and there is only one node. Documents change nothing; a
second node lets them be allocated, and the index turns green.

### Step 2

```json
GET /_cluster/health?level=indices
```

`level=shards` goes down to each shard.

### Step 3

```json
GET /_cat/shards/health-test?v&h=index,shard,prirep,state,unassigned.reason
```

`GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason` lists the
unassigned shards of the whole cluster.

### Step 4

| Status | Which shards are allocated? | Impact | Action |
|--------|-----------------------------|--------|--------|
| **GREEN** | All of them, primaries and replicas | None | Normal |
| **YELLOW** | Every primary, some replicas missing | Works, but no high availability | Watch it, not urgent |
| **RED** | At least one primary missing | Data unavailable, maybe lost | Act now |

### Step 5

```json
GET /_cluster/allocation/explain
{
  "index": "health-test",
  "shard": 0,
  "primary": false
}
```

**Expected result**:

```json
{
  "index": "health-test",
  "shard": 0,
  "primary": false,
  "current_state": "unassigned",
  "can_allocate": "no"
}
```

The `same_shard` decider: a copy of this shard is already allocated to this
node — the primary — and a replica may not sit next to it.

### Step 6

```json
GET /_cluster/health?wait_for_status=yellow&timeout=30s
```

**Expected result**:

```json
{
  "timed_out": false
}
```

With `wait_for_status=green`, a one-node cluster answers after the 30 s, with
`"timed_out": true` and a `408` status: its replicas will never be allocated.

## Part B: Node statistics

### Step 1

```json
GET /_nodes/stats/jvm?filter_path=nodes.*.name,nodes.*.jvm.mem
```

The percentage is `jvm.mem.heap_used_percent`.

### Step 2

```json
GET /_nodes/stats/jvm?filter_path=nodes.*.name,nodes.*.jvm.gc
```

`jvm.gc.collectors.young` and `.old`: `collection_count` and
`collection_time_in_millis`.

### Step 3

```json
GET /_nodes/stats/os?filter_path=nodes.*.name,nodes.*.os.cpu,nodes.*.os.mem
```

### Step 4

```json
GET /_nodes/stats/fs?filter_path=nodes.*.name,nodes.*.fs.total,nodes.*.fs.io_stats
```

The disk watermarks (`cluster.routing.allocation.disk.watermark.*`):

- **low**, 85%: no new shard is allocated to the node;
- **high**, 90%: shards are moved away from the node;
- **flood_stage**, 95%: every index with a shard on the node turns read-only
  (`index.blocks.read_only_allow_delete`), lifted once the disk is below high.

### Step 5

```json
GET /_nodes/stats/indices?filter_path=nodes.*.name,nodes.*.indices.indexing,nodes.*.indices.search
```

### Step 6

```json
GET /_nodes/stats?filter_path=nodes.*.name,nodes.*.jvm.mem.heap_used_percent,nodes.*.os.cpu.percent,nodes.*.fs.total.available_in_bytes,nodes.*.indices.search.query_time_in_millis
```

## Part C: Slow query logs

### Step 1

```json
PUT /slowlog-test/_settings
{
  "index.search.slowlog.threshold.query.warn": "500ms",
  "index.search.slowlog.threshold.query.info": "250ms",
  "index.search.slowlog.threshold.query.debug": "100ms",
  "index.search.slowlog.threshold.query.trace": "50ms"
}
```

**Expected result**:

```json
{ "acknowledged": true }
```

### Step 3

```json
POST /slowlog-test/_search
{
  "query": {
    "wildcard": {
      "content": "*long*content*"
    }
  },
  "size": 100
}
```

**Expected result**:

```json
{
  "hits": { "total": { "value": 0 } }
}
```

No hit: `content` is a `text` field, so the pattern is matched against each of
its terms (`long`, `content`, `here`…), and no single term holds both « long »
and « content ».

The aggregation:

```json
POST /slowlog-test/_search
{
  "size": 0,
  "aggs": {
    "categories": {
      "terms": { "field": "category", "size": 100 },
      "aggs": {
        "avg_views": { "avg": { "field": "views" } }
      }
    }
  }
}
```

### Step 4

```json
PUT /slowlog-test/_settings
{
  "index.search.slowlog.threshold.query.trace": "0ms"
}
```

The entry is an ECS JSON line: `elasticsearch.slowlog.took`, `took_millis`,
`total_hits`, `search_type`, the shard (`[slowlog-test][0]`) and
`elasticsearch.slowlog.source`, the request itself.

### Step 5

```json
POST /slowlog-test/_search
{
  "query": {
    "match": {
      "content": "long content"
    }
  }
}
```

**Expected result**:

```json
{
  "hits": { "total": { "value": 2 } }
}
```

With `"profile": true`, the wildcard spends its time in rewriting the pattern
into the terms it matches (walking the whole terms dictionary); the `match`
looks two terms up directly. On two documents both are fast — the gap shows on
millions.

### Step 6

```json
GET /slowlog-test/_settings?include_defaults&filter_path=*.*.index.search.slowlog*,*.index.search.slowlog*

PUT /slowlog-test/_settings
{
  "index.search.slowlog.threshold.query.warn": "-1",
  "index.search.slowlog.threshold.query.info": "-1",
  "index.search.slowlog.threshold.query.debug": "-1",
  "index.search.slowlog.threshold.query.trace": "-1"
}
```
