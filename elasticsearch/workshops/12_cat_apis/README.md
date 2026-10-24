# Workshop 12 — Inspecting the cluster with the _cat APIs

> Use the _cat APIs to inspect quickly the state of the cluster, its indices, its shards and how resources are allocated.

**Topic**: Installation and configuration — Checking APIs

## Context

As an administrator, you diagnose the state of the cluster regularly. The _cat APIs give a short, readable view that points at a problem fast.

Each step states **what** to find, not **how**: look for the API and its parameters in the documentation, try it, read the response. Where an expected result is given, ask for **JSON** (`format=json`) so you can compare. Hints are folded — open them only once you are stuck.

## Setup

Before starting, create a test index with some data:

```json
DELETE /logs-2023.11

PUT /logs-2023.11
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}

POST /logs-2023.11/_bulk?refresh=true
{"index":{}}
{"message":"Log entry 1","timestamp":"2023-11-10T10:00:00"}
{"index":{}}
{"message":"Log entry 2","timestamp":"2023-11-10T10:01:00"}
{"index":{}}
{"message":"Log entry 3","timestamp":"2023-11-10T10:02:00"}
```

## Exercises

Reference: [Compact and aligned text (CAT) APIs](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-cat).

### Step 1: Every index

List every index of the cluster, **with the column headers**.

<details>
<summary>Hint</summary>

The `_cat` API about indices. One short URL parameter adds the headers.

</details>

**Question**: what do the columns `pri`, `rep`, `docs.count` and `store.size` mean? Why is `logs-2023.11` `yellow`?

### Step 2: Choose the columns, sort the rows

List the indices with **only** the columns `index`, `health`, `docs.count` and `store.size`, the **largest first**.

<details>
<summary>Hint</summary>

Every _cat API takes the same parameters: one picks the columns, another sorts (`column:desc`).

</details>

**Try**: the system indices, starting with a `.`, do not show. Find the parameter that adds them.

### Step 3: The shards of an index

For `logs-2023.11` only, show for each shard: `index`, `shard`, `prirep`, `state` and the **reason** why it is unassigned — in JSON.

<details>
<summary>Hint</summary>

The `_cat` API about shards takes an index in its path. `?help` on any _cat API lists the columns it can show.

</details>

**Expected result**:

```json
[
  { "index": "logs-2023.11", "shard": "0", "prirep": "p", "state": "STARTED" },
  { "index": "logs-2023.11", "shard": "0", "prirep": "r", "state": "UNASSIGNED", "unassigned.reason": "INDEX_CREATED" },
  { "index": "logs-2023.11", "shard": "1", "prirep": "p", "state": "STARTED" },
  { "index": "logs-2023.11", "shard": "1", "prirep": "r", "state": "UNASSIGNED", "unassigned.reason": "INDEX_CREATED" }
]
```

**Questions**:
- Check that `pri × (1 + rep)` from step 1 is the number of rows here.
- Besides `INDEX_CREATED`, which other unassigned reasons can you meet? Which one should worry you?

### Step 4: Disk per node

Show the disk usage and the number of shards **per node**.

<details>
<summary>Hint</summary>

The `_cat` API about shard **allocation**.

</details>

**Question**: what is the row named `UNASSIGNED`? At which disk percentage does Elasticsearch stop putting new shards on a node?

### Step 5: Pending tasks

Show the cluster-level changes waiting for the master node.

<details>
<summary>Hint</summary>

Its name is the one of a queue of tasks not done yet.

</details>

**Expected result** (on a quiet cluster):

```json
[]
```

**Question**: what does a long list, with a `timeInQueue` of several seconds, tell you?

### Step 6: The nodes, in JSON

List the nodes with only `name`, `heap.percent`, `ram.percent`, `cpu` and `node.role`, in JSON.

<details>
<summary>Hint</summary>

The same column and format parameters as before, on the `_cat` API about nodes.

</details>

**Question**: the _cat APIs are meant for humans. What should a monitoring script call instead?

## Success criteria

- Every index listed, with its health and size
- Columns chosen and rows sorted
- The unassigned shards found, with their reason
- Disk usage per node read
- A _cat output in JSON

## Troubleshooting

**Problem**: `no handler found for uri [/_cat/...]`
→ Check the name of the API: `/_cat/indices`, not `/_cat/index`.

**Problem**: too many columns, unreadable output
→ Pick the columns you need — `?help` lists them all.
