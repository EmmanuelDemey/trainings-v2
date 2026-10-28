# Workshop 15 — Sizing and performance: solution

For the trainer. Not published: the learners work these out themselves.
The CI replays the requests right after the README, and checks each
« Expected result ».

## Part A

### Step 1

```text
Initial volume:   500 GB
Growth (30 days): 50 GB/day × 30 = 1,500 GB
Total:            500 + 1,500    = 2,000 GB
With 1 replica:   2,000 × 2      = 4,000 GB
```

### Step 2

Between 10 and 50 GB per shard, and under 200 million documents. 25–30 GB is a
safe choice for logs: big enough to keep the shard count low, small enough to
recover and relocate fast.

### Step 3

```text
One day:          50 GB / 25 GB = 2 primary shards per daily index
30 days:          2 × 30 = 60 primaries, + 60 replicas = 120 shards
The initial 500 GB, at ~25 GB per shard: ~20 primaries, + 20 replicas = 40 shards
Total:            ~160 shards / 5 nodes = ~32 shards per node
Disk:             4,000 GB / (5 × 2 TB) = 40% — below the 85% low watermark
```

Older guides gave a « 20 shards per GB of heap » rule; the current one reasons
on the heap the mappings of each shard take, and on shards of a sensible size.
~32 per node is far from any limit (`cluster.max_shards_per_node` is 1,000 by
default).

### Step 4

```json
PUT /_index_template/logs-template
{
  "index_patterns": ["logs-*"],
  "priority": 200,
  "template": {
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "refresh_interval": "5s"
    }
  }
}
```

**Expected result**:

```json
{ "acknowledged": true }
```

`priority` above 100 is needed: the built-in template `logs`, priority 100,
already matches `logs-*-*`, and two overlapping templates of the same priority
are refused. Without a priority, the template gets 0 and the built-in one wins
for `logs-*-*` names.

A daily index is deleted whole, without `_delete_by_query`; a search on a time
range only touches the days it needs. A data stream with ILM rolls over on
size rather than on the calendar — shards stay the same size even when the
daily volume changes — and deletes on age by itself.

## Part B

### Step 1

At most 50% of the RAM, and below ~32 GB so that the JVM keeps compressed
oops (the exact limit depends on the JVM: check it in step 3). For 64 GB of
RAM: **31 GB** of heap; the other 33 GB go to the filesystem cache, which
Lucene relies on heavily.

### Step 2

A file in `jvm.options.d/`, for instance `/etc/elasticsearch/jvm.options.d/heap.options`:

```text
-Xms31g
-Xmx31g
```

With Docker: `-e ES_JAVA_OPTS="-Xms31g -Xmx31g"`. `Xms` = `Xmx`: the heap is
allocated once at start, never resized under load. Since 7.11, Elasticsearch
sizes the heap by itself from the RAM and the node roles when nothing is set —
a good default.

### Step 3

```json
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_max_in_bytes,nodes.*.jvm.mem.heap_used_percent
```

```json
GET /_nodes?filter_path=nodes.*.jvm.using_compressed_ordinary_object_pointers
```

**Expected result**:

```json
{
  "nodes": {}
}
```

Each node shows `"using_compressed_ordinary_object_pointers": "true"` — a
string, not a boolean.

Below 75% of heap used: fine. 75–85%: watch. Above 85% for long: the circuit
breakers start to trip and the garbage collector runs all the time.

## Part C

### Step 1

```json
GET /_cat/thread_pool?v
```

### Step 2

```json
GET /_cat/thread_pool/write,search,get?v&h=node_name,name,active,queue,rejected,completed
```

### Step 3

```json
GET /_nodes?filter_path=nodes.*.thread_pool.search,nodes.*.thread_pool.write
```

`write`: as many threads as cores; `search`: `cores × 3 / 2 + 1` threads. On the
CI's Elasticsearch 9.5.5, with 16 cores: `write` has 16 threads and a queue of
12,000, `search` 25 threads and a queue of 25,000. The queue sizes change from
one version to the next: read them from the node, not from memory.

### Step 4

```text
Rejection rate = rejected / (completed + rejected) × 100
```

Below 0.1%: occasional peaks, fine. 0.1–1%: a regular overload, watch. Above
1%: the cluster is undersized for its load.

`write` rejects: on the client side, use `_bulk` with batches of 5–15 MB and
retry with a backoff on 429; on the cluster side, raise `refresh_interval`, add
data nodes. `search` rejects: cheaper queries (filter context, fewer
aggregations), fewer shards per search, more data or coordinating-only nodes.
Never raise the queue size: it only hides the overload and costs heap.
