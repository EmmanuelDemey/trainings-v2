# Workshop 17 — Monitoring

> Use the monitoring APIs to diagnose the state of the cluster, watch the metrics of its nodes, and set up slow query logs to find the requests that hurt.

**Topic**: Monitoring — monitoring APIs, critical metrics, slow query logs

## Context

The team gets an alert: the cluster turned `yellow`, and users complain that searches are slow. You diagnose why, then set up the monitoring that would have caught it earlier.

Each step states **what** to find, not **how**: look for the API in the documentation, try it, read the response. The expected result lets you check your answer. Hints are folded — open them only once you are stuck.

## Setup

This workshop stands on its own. Create the test index before starting:

```json
PUT /health-test
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}
```

## Part A: Cluster health

Reference: [Cluster health API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-cluster-health).

### Step 1: The health of the cluster, then of one index

Get the health of the whole cluster, then the health of `health-test` only.

The status of the cluster is the **worst** status of its indices. Its counters (`active_shards`…) also count the system indices (`.security`, `.kibana`…), whose number changes from one cluster to the other — which is why you narrow it to one index.

<details>
<summary>Hint</summary>

The cluster health API accepts an index name in its path.

</details>

**Expected result** (one-node cluster, health of `health-test`):

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

**Question**: why are 2 shards unassigned? Would adding documents change anything? Would adding a node?

### Step 2: Health per index

Get the health of the cluster with **one entry per index**, to spot which index makes it yellow.

<details>
<summary>Hint</summary>

The API has a `level` parameter.

</details>

### Step 3: Which shards are unassigned, and why

List the shards of `health-test` with, for each one: index, shard number, primary or replica, state, and the reason it is unassigned.

<details>
<summary>Hint</summary>

A `_cat` API lists shards. Its `h` parameter picks the columns, `?help` lists those available.

</details>

**Expected result**:

```
index       shard prirep state      unassigned.reason
health-test 0     p      STARTED
health-test 0     r      UNASSIGNED INDEX_CREATED
health-test 1     p      STARTED
health-test 1     r      UNASSIGNED INDEX_CREATED
```

### Step 4: The status colours

Fill this table from what you saw and from the documentation:

| Status | Which shards are allocated? | Impact | Action |
|--------|-----------------------------|--------|--------|
| **GREEN** | ? | ? | ? |
| **YELLOW** | ? | ? | ? |
| **RED** | ? | ? | ? |

### Step 5: Ask the cluster why

Ask Elasticsearch to explain why the **replica** of shard `0` of `health-test` is not allocated.

<details>
<summary>Hint</summary>

Look at the [cluster allocation explain API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-cluster-allocation-explain). Without a body, it explains the first unassigned shard it finds — maybe not yours.

</details>

**Expected result** (excerpt):

```json
{
  "index": "health-test",
  "shard": 0,
  "primary": false,
  "current_state": "unassigned",
  "can_allocate": "no"
}
```

**Question**: which decider says no, and what does its explanation say?

### Step 6: Wait for a status

A deployment script must wait until the cluster is at least `yellow`, for 30 seconds at most. Write the request it sends.

<details>
<summary>Hint</summary>

Look at the `wait_for_status` and `timeout` parameters of the cluster health API.

</details>

**Expected result** (excerpt):

```json
{
  "timed_out": false
}
```

**Try**: wait for `green` instead. What happens on a one-node cluster, and after how long?

## Part B: Node statistics

Reference: [Nodes stats API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-nodes-stats).

The responses of this API are huge. For each step, keep **only** the node name and the metrics asked for.

<details>
<summary>Hint (for all of part B)</summary>

The nodes stats API takes a metric in its path (`jvm`, `os`, `fs`, `indices`…), and every API accepts a [`filter_path`](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/common-options#common-options-response-filtering) parameter, with `*` wildcards: `nodes.*.name`.

</details>

### Step 1: Heap usage

Get the JVM memory of each node.

**Question**: what percentage of its heap does your node use? Read it against these thresholds:

- below 75%: healthy
- 75–85%: watch it
- above 85%: critical (risk of `OutOfMemoryError`)

### Step 2: Garbage collection

Get the garbage collection statistics of each node.

**Question**: how many young and old collections so far, and how long did they take in total? Alerting thresholds: a young GC above 50 ms means the heap is under pressure; an old GC above 1000 ms means it is critically full.

### Step 3: CPU and RAM

Get the CPU and the memory of the operating system of each node.

Thresholds:

- CPU: below 60% OK, 60–80% attention, above 80% critical
- RAM: more than 20% free OK, 10–20% attention, below 10% critical

### Step 4: Disk

Get the total disk space and the I/O statistics of each node.

**Question**: what does Elasticsearch do when the disk reaches 85%? 90%? 95%? Look for the **disk watermarks** in the documentation.

### Step 5: Indexing and search

Get the indexing and search statistics of each node.

### Step 6: A one-line dashboard

In **one request**, keep only, for each node: its name, its heap used percentage, its CPU percentage, its available disk in bytes, and the total time spent in search queries.

**Expected result** (the values depend on your machine):

```json
{
  "nodes": {
    "<node id>": {
      "name": "…",
      "jvm": { "mem": { "heap_used_percent": 42 } },
      "os": { "cpu": { "percent": 3 } },
      "fs": { "total": { "available_in_bytes": 123456789 } },
      "indices": { "search": { "query_time_in_millis": 12 } }
    }
  }
}
```

## Part C: Slow query logs

### Setup of this part

Create a test index, with data:

```json
PUT /slowlog-test
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "content": { "type": "text" },
      "category": { "type": "keyword" },
      "views": { "type": "integer" }
    }
  }
}

POST /slowlog-test/_bulk
{"index":{}}
{"title":"Article 1","content":"Long content here with many words to search","category":"tech","views":100}
{"index":{}}
{"title":"Article 2","content":"Another long content for searching purposes","category":"science","views":200}
```

Reference: [Slow query and index logging](https://www.elastic.co/docs/reference/elasticsearch/index-settings/slow-log).

### Step 1: Set the thresholds

On `slowlog-test`, log the **query** phase of the searches that take longer than 500 ms as `warn`, 250 ms as `info`, 100 ms as `debug`, and 50 ms as `trace`.

<details>
<summary>Hint</summary>

These are dynamic index settings: `index.search.slowlog.threshold.<phase>.<level>`, changed with the update index settings API.

</details>

**Expected result**:

```json
{ "acknowledged": true }
```

### Step 2: Where the slow logs go

They are written as JSON (ECS) next to the other logs:

```
/var/log/elasticsearch/<cluster_name>_index_search_slowlog.json
/var/log/elasticsearch/<cluster_name>_index_indexing_slowlog.json
```

With the Docker image, every log goes to the standard output: `docker logs <container> | grep slowlog`.

### Step 3: Run a slow search

Search `slowlog-test` for the documents whose `content` holds a term matching the pattern `*long*content*`, up to 100 hits.

<details>
<summary>Hint</summary>

Look at the [term-level queries](https://www.elastic.co/docs/reference/query-languages/query-dsl/term-level-queries): one takes a pattern with `*`.

</details>

**Question**: how many hits? Why? (Think about what the pattern is matched against: the text, or each of its terms?)

**Try**: an aggregation also goes through the slow log. Compute the average `views` per `category`.

### Step 4: Read the slow log

Lower the `trace` threshold to `0ms`, run your search again, and find its entry in the logs.

```bash
tail -f /var/log/elasticsearch/<cluster_name>_index_search_slowlog.json
# or, with Docker
docker logs -f <container> 2>&1 | grep slowlog
```

**Question**: what does the entry hold? The duration, the number of hits, the request itself?

### Step 5: Make it fast

A leading wildcard has to walk every term of the index. Rewrite the search of step 3 with a **full-text** query that finds the posts about « long content ».

**Expected result** (excerpt):

```json
{
  "hits": { "total": { "value": 2 } }
}
```

**Question**: compare both with `"profile": true` in the body. Where does the time go?

### Step 6: Check, then turn off

Show the slow log settings of `slowlog-test` — defaults included, nothing else. Then turn off the four thresholds you set.

<details>
<summary>Hint</summary>

`include_defaults` and `filter_path` are parameters of the get index settings API. A threshold of `-1` turns it off.

</details>

## Success criteria

- You can tell green, yellow and red apart, and know what each one requires
- You get the heap usage of each node from the nodes stats
- You read the CPU, RAM and disk metrics against their thresholds
- You set slow log thresholds with the index settings API
- You found why the wildcard search was slow, and rewrote it

## Troubleshooting

**Problem**: the cluster stays yellow, even with 2 nodes
→ Check the allocation rules: `GET /_cluster/settings`
→ Check the disk: the flood stage watermark can block allocation

**Problem**: heap usage constantly above 85%
→ The cluster is undersized: add nodes
→ Or increase the heap (if the RAM allows it, and below 32 GB)

**Problem**: no slow log, even for slow searches
→ Check that the search does exceed the threshold (measure it with `"profile": true`)
→ Check the permissions of the log file
