---
layout: cover
---

# 22 - Production architecture

---

# Learning objectives

By the end of this sequence (**~60 min**, workshop included), you will be able to:

- **Design** a topology: node roles, dedicated masters, coordinating nodes
- **Build** a hot-warm-cold architecture driven by ILM
- **Configure** high availability: replicas, allocation awareness across zones
- **Control** where shards go: allocation filtering, disk watermarks, rebalancing
- **Replicate** to another region with cross-cluster replication

---

# Topology by size

| Cluster | Topology |
|---|---|
| **Small** (3–10 nodes) | Every node `master` + `data` + `ingest`: simple, 3 master-eligible for the quorum |
| **Medium** (10–50 nodes) | **3 dedicated masters**, 10–20 data nodes, 2–3 coordinating nodes |
| **Large** (50+ nodes) | Load balancer, coordinating nodes, **data tiers** hot / warm / cold / frozen, 3–5 masters |

<br />

- Start simple: separate the roles when a load (indexing, big aggregations) **disturbs** the master
- A coordinating node: `node.roles: []` — it routes requests and merges results

---

# The basic production cluster

```text
 ┌────────┐  ┌────────┐  ┌────────┐
 │  M+D+I │  │  M+D+I │  │  M+D+I │      3 nodes, every role
 │ node-1 │  │ node-2 │  │ node-3 │      quorum = 2: tolerates 1 failure
 └────────┘  └────────┘  └────────┘
```

```yaml
node.roles: [master, data, ingest]
discovery.seed_hosts: ["node-1:9300", "node-2:9300", "node-3:9300"]
cluster.initial_master_nodes: ["node-1", "node-2", "node-3"]   # first start only
```

- **+** Simple to run, highly available
- **−** A data node overloaded by a query is also a master: the whole cluster suffers

---

# Dedicated masters

When: more than ~10 nodes, heavy loads, the need for maximum stability.

```yaml
# master nodes                         # data nodes
node.name: master-1                    node.name: data-1
node.roles: [master]                   node.roles: [data, ingest]
```

- Data nodes are added **horizontally**, without touching the quorum
- A data node going down never costs the quorum
- Resources: 2–4 cores, 8 GB RAM (4 GB heap), a small fast disk

---

# The master quorum

```text
 quorum = (master-eligible nodes / 2) + 1

 3 masters → quorum 2 → tolerates 1 failure
 5 masters → quorum 3 → tolerates 2 failures
```

- Always an **odd** number: 4 masters tolerate 1 failure, like 3
- Without a quorum, no master: no index creation, no mapping change, no allocation
- `voting_only` master-eligible node: a cheap tie-breaker, in a third zone

```json
GET /_cat/master?v
```

---

# Hot-warm-cold: the tiers

| Tier | Hardware | Data | `node.roles` |
|---|---|---|---|
| **hot** | NVMe SSD, 64 GB RAM, 16 cores | Recent, written and searched | `[data_hot, data_content]` |
| **warm** | SATA SSD / HDD, 32 GB, 8 cores | 7–90 days, read-only | `[data_warm, data_content]` |
| **cold** | Cheap disks, searchable snapshots | Older, rarely searched | `[data_cold]` |
| **frozen** | Object storage + local cache | Archives | `[data_frozen]` |

- `data_content`: the non time series indices (products, users…)
- **ILM** moves the indices between tiers — the `migrate` action is implicit in each phase

---

# Hot-warm-cold: the policy

<!-- ci: skip -->
```json
PUT /_ilm/policy/logs-tiers
{
  "policy": {
    "phases": {
      "hot":  { "actions": { "rollover": { "max_primary_shard_size": "50gb", "max_age": "1d" } } },
      "warm": {
        "min_age": "7d",
        "actions": { "shrink": { "number_of_shards": 1 }, "forcemerge": { "max_num_segments": 1 } }
      },
      "cold": {
        "min_age": "30d",
        "actions": { "searchable_snapshot": { "snapshot_repository": "my_backup" } }
      },
      "delete": { "min_age": "90d", "actions": { "delete": {} } }
    }
  }
}
```

- Needs a node of each tier and a snapshot repository: skipped on the lab cluster

---

# High availability: the pieces

1. **Master quorum**: 3+ master-eligible nodes, ideally in 3 zones
2. **Replicas**: 1+ per primary shard
3. **Allocation awareness**: the copies of a shard in **different** zones
4. **Load balancing**: clients spread over several nodes (sniffing, a load balancer)
5. **Snapshots**: the copy that survives a mistake (chapter 18)
6. **Monitoring and alerting**: know before the users (chapters 23–24)

---

# Replicas

```json
PUT /orders
{
  "settings": { "number_of_shards": 3, "number_of_replicas": 1 }
}
```

```json
PUT /orders/_settings
{ "number_of_replicas": 2 }
```

| Environment | Replicas |
|---|---|
| Dev / test | 0 |
| Production | 1 — 2 for the critical data |

- `number_of_replicas: 2` = **3 copies**; dynamic, unlike `number_of_shards`
- Replicas also **serve searches**: more replicas, more read throughput

---

# Allocation awareness

Without it, a primary and its replica may sit in the **same** zone: one zone down, data lost.

```yaml
# a node in zone A                         # a node in zone B
node.attr.zone: zone_a                     node.attr.zone: zone_b
cluster.routing.allocation.awareness.attributes: zone
```

```text
   Zone A           Zone B
 ┌──────────┐    ┌──────────┐
 │ P0   R1  │    │ R0   P1  │     zone A down → zone B holds every shard
 └──────────┘    └──────────┘
```

- On Elastic Cloud and the ECK operator, the zones are set for you

---

# Forced awareness

```yaml
cluster.routing.allocation.awareness.force.zone.values: zone_a,zone_b
```

- Awareness alone already spreads the copies over the zones
- **Forced**: if a zone goes down, its replicas are **not** rebuilt in the surviving zone
  - otherwise that zone would hold twice the shards — and could fill up
  - they stay `UNASSIGNED` (cluster `yellow`) until the zone comes back

> Size each zone to hold **all** the data, or use forced awareness — not neither.

---

# Allocation filtering: an index

Custom node attributes, in `elasticsearch.yml`: `node.attr.type: hot`, `node.attr.rack: r1`…

<!-- ci: skip -->
```json
PUT /app-logs-2024.01/_settings
{ "index.routing.allocation.require.type": "hot" }
```

```json
PUT /app-logs-2024.01/_settings
{ "index.routing.allocation.exclude._name": "node-3,node-4" }
```

- `require`: **every** rule must match · `include`: **one** must match · `exclude`: **none** may match
- Built-in attributes: `_name`, `_host`, `_ip`, `_id`, `_tier`
- For hot / warm / cold, use the **data tiers**, not a custom attribute

---

# Allocation filtering: drain a node

Before maintenance, move every shard away from a node:

```json
PUT /_cluster/settings
{
  "persistent": { "cluster.routing.allocation.exclude._ip": "192.168.1.50" }
}
```

```json
GET /_cat/allocation?v
```

Once the node holds no shard, stop it. Afterwards:

```json
PUT /_cluster/settings
{
  "persistent": { "cluster.routing.allocation.exclude._ip": null }
}
```

---

# Disk watermarks

| Watermark | Default | Effect |
|---|---|---|
| **low** | 85 % | No **new** shard on this node |
| **high** | 90 % | Shards are **moved away** from this node |
| **flood stage** | 95 % | Indices with a shard there become **read-only** (`index.blocks.read_only_allow_delete`) |

```json
GET /_cluster/settings?include_defaults=true&filter_path=*.cluster.routing.allocation.disk.watermark*
```

- Since 8.x, the block is lifted **automatically** once the disk goes back under `high`
- Free space, or add nodes: never just raise the watermarks

---

# Rebalancing

The cluster moves shards to even out the nodes: when one joins, leaves, or fills up.

```json
PUT /_cluster/settings
{
  "persistent": { "cluster.routing.rebalance.enable": "all" }
}
```

| Value | Effect |
|---|---|
| `all` (default) | Every shard can move |
| `primaries`, `replicas` | Only those |
| `none` | No rebalancing — during a maintenance, then back to `all` |

> Always `persistent`: `transient` settings are deprecated, and lost on a full restart.

---

# The write path

```text
 client ──► coordinating node ──► primary shard (node A)  shard = hash(_routing) % primaries
                                     │           │
                                     ▼           ▼
                                 replica (B)  replica (C)
                                     └── all ACK ──► response to the client
```

- A write goes to the primary, then to **every in-sync replica** — not to a quorum
- `wait_for_active_shards`: a **pre-flight** check, how many copies must be active before the write starts

```json
PUT /my-index/_settings
{ "index.write.wait_for_active_shards": "2" }
```

---

# Cross-cluster replication

```text
 Paris (leader)                    London (follower)
 ┌──────────────┐   replication   ┌──────────────┐
 │ orders       │ ──────────────► │ orders       │   read-only
 └──────────────┘                 └──────────────┘
```

- **Disaster recovery**: a standby cluster in another region
- **Geo-distribution**: the data close to the users
- **Isolation**: reporting on its own cluster
- Active-passive, per index or with **auto-follow** patterns; needs a Platinum license

---

# Cross-cluster replication: setup

On the follower, declare the leader:

<!-- ci: skip -->
```json
PUT /_cluster/settings
{
  "persistent": {
    "cluster.remote.leader_cluster.seeds": ["paris-node1:9300", "paris-node2:9300"]
  }
}
```

Then follow an index:

<!-- ci: skip -->
```json
PUT /orders/_ccr/follow
{
  "remote_cluster": "leader_cluster",
  "leader_index": "orders"
}
```

- Failover: pause, `_ccr/unfollow`, then write to London

---

# Quiz

**3 dedicated masters, one goes down. Then a second one. What happens?**

- A) Nothing: the data nodes elect a master
- B) After the first failure the cluster works; after the second, no master — no cluster changes
- C) The cluster turns red at the first failure

<v-click>

**Answer: B** — quorum is 2 out of 3: one failure is tolerated, two are not. Data nodes are not master-eligible and cannot vote.

</v-click>

---
layout: cover
---

# Workshop 18

## Advanced architecture and production
