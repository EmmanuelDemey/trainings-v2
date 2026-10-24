# Workshop 9 — Sizing and performance

> Compute the right number of shards, set the JVM heap correctly, and read the thread pools to diagnose performance problems.

**Topic**: Performance and sizing — Capacity planning, JVM configuration, thread pools

## Context

You size an Elasticsearch cluster for application logs, then check its memory configuration and look for rejected requests.

Each step states **what** to find, not **how**: work out the numbers, look for the API in the documentation, try it, read the response. Hints are folded — open them only once you are stuck.

## Part A: Sizing the cluster

### Scenario

**Use case**: logs of an e-commerce application

**Requirements**:
- Initial volume: 500 GB of logs
- Growth: 50 GB/day of new logs
- Retention: 30 days
- Replicas: 1 (high availability)
- Indexing rate: 10,000 documents/second at peak
- Search rate: 100 requests/second
- Target latency: p95 < 200 ms for searches

**Available infrastructure**:
- 5 data nodes
- 16 cores per node
- 64 GB of RAM per node
- 2 TB of SSD per node

Reference: [Size your shards](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards).

### Step 1: The total volume

Compute the volume stored after 30 days, **with** the replicas.

<details>
<summary>Hint</summary>

Initial volume + daily growth over the retention, then think about what one replica costs.

</details>

**Expected result**: `4,000 GB`.

### Step 2: The size of a shard

Pick a target size for a shard, and justify it.

<details>
<summary>Hint</summary>

The sizing guide gives a range in GB for search and log workloads, and a number of documents per shard not to exceed.

</details>

### Step 3: The number of shards

Logs arrive every day: they go into **one index per day**. How many primary shards per daily index? How many shards in the cluster after 30 days, replicas included? How many per node?

<details>
<summary>Hint</summary>

Divide one day of logs by your target shard size. Then multiply by the days kept, and by the copies of each shard.

</details>

**Question**: is that number of shards per node a problem? Look for the guidance on shards per node and heap in the sizing guide. And the disk: what percentage of it is used?

### Step 4: The template of the daily indices

Create an index template `logs-template` for the indices `logs-*`, with the number of primary shards you computed, 1 replica, and a refresh interval of 5 seconds — logs do not need to be searchable within a second.

<details>
<summary>Hint</summary>

The [index template API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-indices-put-index-template). The settings go under `template`.

</details>

**Expected result**:

```json
{ "acknowledged": true }
```

**Question**: why one index per day rather than one big index? What would make a data stream with ILM better still?

## Part B: The JVM heap

Reference: [JVM settings](https://www.elastic.co/docs/reference/elasticsearch/jvm-settings).

### Step 1: Size the heap

For a node with **64 GB of RAM**, what heap do you give Elasticsearch? What is the rest of the RAM for?

<details>
<summary>Hint</summary>

Two rules: a share of the physical RAM, and a ceiling linked to how the JVM addresses objects (look for « compressed oops »).

</details>

### Step 2: Set it

On a node installed from a package or an archive, set that heap — `Xms` and `Xmx` — without editing the `jvm.options` file shipped with Elasticsearch, then restart the node. With Docker, find how the image takes it.

<details>
<summary>Hint</summary>

Look at the `jvm.options.d` folder, and at the `ES_JAVA_OPTS` environment variable. Why should `Xms` and `Xmx` be equal?

</details>

### Step 3: Check it

With the APIs, find on your node: the **maximum heap**, the **heap used in percent**, and whether it uses **compressed ordinary object pointers**.

<details>
<summary>Hint</summary>

The node info API (`_nodes`) has the static JVM facts, the node stats API (`_nodes/stats`) the live numbers. `filter_path` keeps the response short.

</details>

**Expected result** (compressed oops):

```json
{
  "nodes": {}
}
```

Each node of `nodes` shows `"using_compressed_ordinary_object_pointers": "true"`.

**Question**: from what percentage of heap used do you start to worry?

## Part C: Thread pools and rejections

Reference: [Thread pools](https://www.elastic.co/docs/reference/elasticsearch/configuration-reference/thread-pool-settings).

### Step 1: Every thread pool

List the thread pools of every node, with their active threads, their queue and their rejections.

<details>
<summary>Hint</summary>

There is a `_cat` API for them.

</details>

### Step 2: The ones that matter

Show only the `write`, `search` and `get` pools, with the columns `node_name`, `name`, `active`, `queue`, `rejected` and `completed`.

<details>
<summary>Hint</summary>

The pools go in the path, the columns in a parameter.

</details>

### Step 3: Size and queue

Find the **number of threads** and the **queue size** of the `search` and `write` pools of your node. Do they match what the documentation says for your number of cores?

<details>
<summary>Hint</summary>

They are static facts of the node: node info, not node stats.

</details>

### Step 4: Generate load, read the rejections

Load the cluster, from a terminal:

```bash
for i in {1..1000}; do
  curl -s -u elastic:$ES_PASSWORD -X POST "localhost:9200/load-test/_doc" \
    -H 'Content-Type: application/json' \
    -d "{\"timestamp\": \"$(date -Iseconds)\", \"value\": $RANDOM}" > /dev/null &
done
```

Then compute the **rejection rate** of the `write` pool.

**Questions**:
- From what rate is it a problem?
- When `write` rejects, what do you change — on the client side, and on the cluster side? And when `search` rejects?

## Success criteria

- Total volume, shards per day, per cluster and per node computed and justified
- A template for the daily indices
- A heap of at most half the RAM and below the compressed oops limit, `Xms` = `Xmx`
- Compressed oops checked through the API
- The rejections of a thread pool found, and a rate computed

## Troubleshooting

**Problem**: Elasticsearch does not start after changing the heap
→ Read its logs (`journalctl -u elasticsearch` for a package install): most often a syntax error in a `jvm.options.d` file.

**Problem**: compressed oops is `false`
→ The heap is too large for compressed oops.

**Problem**: `index template [logs-template] has index patterns [logs-*] matching patterns from existing templates [logs]`
→ Elasticsearch ships its own templates for `logs-*-*`. Look at `GET /_index_template/logs`: what is its priority? Yours must differ.

**Problem**: rejections while CPU and RAM are fine
→ The bottleneck may be elsewhere: disk I/O (`iostat -x 1` on Linux), network.
