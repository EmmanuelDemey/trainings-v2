# Workshop 9 — ILM and data retention

> Design a hot-warm-cold architecture that balances cost and performance, and set up Index Lifecycle Management (ILM) policies that automate the transitions.

**Level**: Advanced
**Topic**: Performance and sizing — Index Lifecycle Management

## Context

Your cluster stores logs whose access pattern changes with age: recent logs (under 7 days) are searched a lot (hot), the next ones (7–30 days) now and then (warm), and the old ones (over 30 days) rarely (cold).

Each step states **what** to build, not **how**: look for the API or the action in the documentation, try it, read the response, adjust. The expected result lets you check your own answer. Hints are folded — open them only once you are stuck.

## Setup

Before starting, check that your cluster answers:

```json
GET /_cluster/health
```

The cold phase turns indices into **searchable snapshots**: it needs a snapshot repository, whose path must be listed in `path.repo` (`-e path.repo=/usr/share/elasticsearch/backups` with Docker). Register it:

```json
PUT /_snapshot/my-repository
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/backups/ilm"
  }
}
```

Reference: [Index lifecycle management](https://www.elastic.co/docs/manage-data/lifecycle/index-lifecycle-management).

## Part 1: The data tiers

### Step 1: Declare the tiers

On a cluster of three nodes, make one node **hot** (and holder of the indices that are not time series), one **warm**, one **cold**. Then list the nodes with their roles.

<details>
<summary>Hint</summary>

Since 7.10 the tiers are [node roles](https://www.elastic.co/docs/deploy-manage/distributed-architecture/clusters-nodes-shards/node-roles), set in `elasticsearch.yml`, not custom attributes. Look for the `data_*` roles. A `_cat` API lists the nodes and their roles.

</details>

On a one-node cluster (Docker), that node holds every role: the whole workshop works, the data simply changes phase without changing node.

**Question**: what do the letters of the `node.role` column mean for your nodes?

## Part 2: The ILM policy

### Step 2: Create the policy

Create the policy `logs-policy`:

- **hot**: roll over when a primary shard reaches 50 GB or the index is 1 day old; priority 100;
- **warm**, after 7 days: shrink to 1 shard, force-merge to 1 segment; priority 50;
- **cold**, after 30 days: turn into a searchable snapshot in `my-repository`; priority 0;
- **delete**, after 90 days.

<details>
<summary>Hint</summary>

Every action has its page under [Index lifecycle actions](https://www.elastic.co/docs/reference/elasticsearch/index-lifecycle-actions). A phase starts after its `min_age`, counted from the rollover. Look at the conditions of `rollover`: which one is about the size of a **shard**?

</details>

**Expected result**:

```json
{ "acknowledged": true }
```

**Questions**:
- The indices must move from the hot nodes to the warm ones, then to the cold ones. Did you add an action for that? Do you need one? Look for the `migrate` action in the documentation.
- Why roll over on the size of a primary shard rather than on the size of the index?

## Part 3: A data stream

A **data stream** is the modern way to store timestamped data: one name to write to and read from, hidden indices (`.ds-…`) behind it, and a rollover run by ILM with no alias to set up.

Reference: [Data streams](https://www.elastic.co/docs/manage-data/data-store/data-streams).

### Step 3: The template

Create the index template `app-logs-template`, priority 500, that makes `app-logs*` a **data stream**, with 2 shards, 1 replica, managed by `logs-policy`, and a mapping of `@timestamp` (date) and `message` (text).

<details>
<summary>Hint</summary>

A template becomes a data stream template with one key next to `index_patterns`. The policy is an index setting.

</details>

**Expected result**:

```json
{ "acknowledged": true }
```

**Question**: why `app-logs` and not `logs-…`? Look at `GET /_index_template/logs`.

### Step 4: The data stream

Create the data stream `app-logs`, then look at it.

<details>
<summary>Hint</summary>

It is created at the first document indexed, or with an API of its own.

</details>

**Expected result** (the look):

```json
{
  "data_streams": [
    {
      "name": "app-logs",
      "generation": 1,
      "template": "app-logs-template",
      "ilm_policy": "logs-policy"
    }
  ]
}
```

**Try**: the « old way » — create the index `app-logs-000001` yourself, with an alias `app-logs-alias` as its write index. What does Elasticsearch answer?

## Part 4: Rollover

### Step 5: Index, then roll over

Index into `app-logs` a document with the `@timestamp` `2026-10-08T10:00:00Z` and the message `Test log entry`. Then force a rollover, by hand, for the test.

<details>
<summary>Hint</summary>

A data stream only takes **creations**, and every document needs a `@timestamp`. The rollover API takes the name of the data stream.

</details>

**Expected result** (the rollover):

```json
{
  "acknowledged": true,
  "rolled_over": true
}
```

**Question**: how many backing indices are there now? Which one gets the writes? List them with their health and their document count.

## Part 5: Watch the phases change

### Step 6: Speed ILM up

ILM checks its policies every 10 minutes. For the workshop, make it check every **10 seconds**.

<details>
<summary>Hint</summary>

It is a dynamic cluster setting: `indices.lifecycle.poll_interval`.

</details>

**Expected result**:

```json
{ "acknowledged": true }
```

### Step 7: A short policy

Replace `logs-policy` with a quick one: **hot** rolls over at 100 documents; **warm**, after 1 minute, force-merges to 1 segment. Wait 1–2 minutes, then ask ILM where each backing index of `app-logs` stands.

<details>
<summary>Hint</summary>

Updating a policy is creating it again under the same name. Another ILM API **explains** the state of an index.

</details>

**Question**: which backing index moved to `warm`, and why not the other one?

### Step 8: Clean up

Put the ILM poll interval back to its default.

<details>
<summary>Hint</summary>

A setting set to `null` goes back to its default.

</details>

## Part 6: Questions

1. When should a policy **shrink** in the warm phase, and when not?
2. What is a **searchable snapshot**? Why is it so much cheaper?
3. How do you push an index to the next phase **right now**, without waiting for its `min_age`?

## Hot-warm-cold comparison

| Tier | Hardware | Use case | Cost | Performance |
|------|----------|----------|------|-------------|
| **Hot** | NVMe SSD, 64 GB RAM, 16 cores | Logs < 7 days, heavy indexing and search | High | Very high |
| **Warm** | SATA SSD, 32 GB RAM, 8 cores | Logs 7–30 days, occasional search | Medium | Medium |
| **Cold** | HDD or S3, 16 GB RAM, 4 cores | Logs > 30 days, archive, rare search | Low | Low |

## Success criteria

- The hot-warm-cold architecture understood
- A multi-phase ILM policy created
- The actions rollover, shrink, forcemerge and searchable_snapshot used
- A data stream rather than a rollover alias
- A phase change watched through the API

## Troubleshooting

**Problem**: `[my-repository] location [...] doesn't match any of the locations specified by path.repo`
→ The path of the repository must be under one of the `path.repo` of every node, set before they start.

**Problem**: `cannot create index with name [...], because it matches with template [...] that creates data streams only`
→ The name matches a data stream template: write to the data stream itself.

**Problem**: nothing moves to `warm`
→ ILM checks only every `poll_interval`; and an index moves on only once rolled over.
