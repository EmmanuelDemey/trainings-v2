# Workshop 1 — Installation and first steps

> Start OpenSearch and OpenSearch Dashboards with Docker, query the cluster, and understand why it turns yellow.

**Duration**: 20 min · **Chapter**: 3 — Installation and REST API

## Context

The lab fits in one file, `docker-compose.yml`, in this folder: one OpenSearch node and OpenSearch Dashboards, with the security plugin disabled. You start it, then you talk to the cluster through its REST API, from Dev Tools and from a terminal.

Each step states **what** to do, not **how**: look for the API in the documentation, try it, read the response, adjust. The expected result lets you check your answer. Hints are folded — open them only once you are stuck.

## Setup

On Linux, once per machine:

```bash
sudo sysctl -w vm.max_map_count=262144
```

In this folder:

```bash
docker compose up -d --wait
```

Open **http://localhost:5601**, then ☰ menu → **Management** → **Dev Tools**.

Reference: [Installing OpenSearch with Docker](https://docs.opensearch.org/latest/install-and-configure/install-opensearch/docker/).

## Exercises

### Step 1: Who is answering?

Ask the cluster for its version and its distribution.

<details>
<summary>Hint</summary>

The root `/` of the API.

</details>

**Expected result**:

```json
{
  "version": { "distribution": "opensearch", "number": "3.9.0" }
}
```

### Step 2: How healthy is it?

Display the health of the cluster, then the list of its nodes with their roles, as a table.

<details>
<summary>Hint</summary>

`_cluster/health`, then a `_cat` API — `?v` adds the headers.

</details>

**Expected result** (the health):

```json
{ "status": "green", "number_of_nodes": 1 }
```

**Question**: which node is the `cluster_manager`? Which roles does it have?

### Step 3: A yellow index

Create a `hello` index with **1 shard** and **1 replica**, then display the health of this index.

<details>
<summary>Hint</summary>

`PUT /hello` with a `settings` block. The health of an index: `_cluster/health/<index>`, or `_cat/indices`.

</details>

**Expected result**:

```json
{ "status": "yellow", "active_primary_shards": 1, "unassigned_shards": 1 }
```

**Question**: where could the replica go? Display the shards of the index with `_cat/shards` to see it.

### Step 4: Back to green

Without recreating the index, make it `green`.

<details>
<summary>Hint</summary>

`number_of_replicas` is a **dynamic** setting: `PUT /hello/_settings`.

</details>

**Expected result** (the health of the index):

```json
{ "status": "green", "unassigned_shards": 0 }
```

### Step 5: Without Dev Tools

From a terminal, list the indices with `curl`, showing only the `index`, `health` and `docs.count` columns.

<details>
<summary>Hint</summary>

`_cat/indices?v&h=…`. In Dev Tools, the wrench icon → **Copy as cURL** gives you the command.

</details>

## Success criteria

- The lab is running: OpenSearch on 9200, Dashboards on 5601
- You can read `status`, and explain a `yellow` on a single node
- You have changed a dynamic setting live

## Going further

- Add a **second node** to `docker-compose.yml` (same `cluster.name`, `discovery.seed_hosts`, `cluster.initial_cluster_manager_nodes`, no `discovery.type`). Give `hello` a replica again: it turns green. Stop a node: what happens to the index?
- Start OpenSearch **with** the security plugin (`OPENSEARCH_INITIAL_ADMIN_PASSWORD`): what must change in your `curl` calls?

## Troubleshooting

**Problem**: the `opensearch` container keeps restarting, `max virtual memory areas vm.max_map_count [65530] is too low`
→ `sudo sysctl -w vm.max_map_count=262144` (and in `/etc/sysctl.conf` to keep it).

**Problem**: `port is already allocated`
→ Another service listens on 9200 or 5601. Change the port **on the left** in `ports:` (`"9201:9200"`).

**Problem**: Dashboards shows "OpenSearch Dashboards server is not ready yet"
→ Wait a minute: it waits for OpenSearch to be ready.
