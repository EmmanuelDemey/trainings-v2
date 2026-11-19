---
layout: cover
---

# 27 - Deployment options

---

# Learning objectives

By the end of this sequence (**~30 min**), you will be able to:

- **List** the ways to run Elasticsearch: self-managed, Elastic Cloud Hosted, Elastic Cloud Serverless
- **Explain** what Serverless manages for you, and what it takes away
- **Choose** a deployment option from your constraints: control, operations, cost, compliance
- **Plan** a move from one option to another: snapshot, reindex from remote, cross-cluster search

---

# Three ways to run the Elastic Stack

| | **Self-managed** | **Elastic Cloud Hosted** | **Elastic Cloud Serverless** |
|---|---|---|---|
| Who runs it | You | Elastic, on AWS / GCP / Azure | Elastic, on AWS / GCP / Azure |
| You choose | Everything | Version, size, topology, regions | A **project type** and a region |
| Unit | Nodes | A **deployment** (a cluster + Kibana…) | A **project** |
| Upgrades | You (chapter 18) | One click, rolling | Continuous, invisible |
| Billing | Hardware + licence | Capacity per hour | **Usage**: ingest, search, storage |

<br />

- The **same** Elasticsearch, the same REST API, the same Kibana: what changes is who operates it
- In between: **ECE** (Elastic Cloud Enterprise) and **ECK** — Elastic's orchestration, on your own infrastructure

---

# Self-managed: the flavours

| Method | For |
|---|---|
| `.deb` / `.rpm` packages | Servers managed by systemd, Ansible, Puppet… |
| `.tar.gz` / `.zip` archives | Anywhere, no root needed |
| **Docker** images | The lab, Compose stacks, your own orchestration |
| **ECK** (Elastic Cloud on Kubernetes) | Kubernetes: an operator and CRDs |
| `start-local` | A throw-away dev stack on a laptop |

- **Full control**: hardware, network, versions, plugins, `elasticsearch.yml`
- **Full responsibility**: sizing (chapter 21), security (17), backups (18), upgrades, monitoring (23)
- Licences: **Free and open** (Basic), Platinum, Enterprise — chapter 1

---

# ECK: Elasticsearch on Kubernetes

<!-- ci: skip -->
```yaml
apiVersion: elasticsearch.k8s.elastic.co/v1
kind: Elasticsearch
metadata:
  name: shop
spec:
  version: 9.5.6
  nodeSets:
    - name: default
      count: 3
      config:
        node.roles: ["master", "data", "ingest"]
      volumeClaimTemplates:
        - metadata: { name: elasticsearch-data }
          spec:
            accessModes: ["ReadWriteOnce"]
            resources: { requests: { storage: 100Gi } }
```

- The operator handles **TLS**, users, rolling upgrades, scaling, the discovery settings
- Kibana, Fleet Server, Agents, Logstash: their own CRDs
- You still own the **Kubernetes** cluster, its storage, and the sizing

---

# Elastic Cloud Hosted

A **deployment** = an Elasticsearch cluster + Kibana (+ Integrations Server, ML nodes…) run by Elastic.

- A **hardware profile** to start from: general purpose, storage optimized, CPU optimized, vector search optimized
- **Data tiers** and **autoscaling** per tier (disk-driven), ML autoscaling
- Snapshots taken for you (the `found-snapshots` repository), one-click restores
- Upgrades: pick the version, the platform runs the rolling upgrade
- **Your** responsibility stays: shard sizing, mappings, ILM policies, queries

<br />

> Close to self-managed: the same APIs, `_cat/nodes`, ILM, Watcher, plugins (bundled or custom)…
> but no SSH to the nodes and no `elasticsearch.yml` beyond the allowed settings.

---

# Elastic Cloud Serverless

No cluster to size: you create a **project**, Elastic runs it.

| Project type | For |
|---|---|
| **Elasticsearch** | Search, RAG, vector and semantic search, applications |
| **Observability** | Logs, metrics, traces, APM |
| **Security** | SIEM, endpoint, cloud security |

- **Search AI Lake**: the data lives in **object storage**; indexing and search tiers are separated and scale on their own
- No nodes, no shards, no replicas, no tiers to plan: **autoscaling** on the load
- Billed per **usage**: compute units for ingest, search and ML, plus the GB stored and retained
- Always on the latest version: new features land there **first** (ES|QL `DEDUP`, for instance)

---

# Serverless: what you no longer touch

| Area | Self-managed / Hosted | Serverless |
|---|---|---|
| Node and cluster APIs | `_cat/nodes`, `_nodes/stats`, `_cluster/settings` | Not available |
| Shards | `number_of_shards`, `number_of_replicas` | Managed for you |
| Retention | ILM, data tiers | **Data stream lifecycle** (chapter 20) |
| Backups | `_snapshot`, SLM | Handled by Elastic, no snapshot API |
| Alerting | Watcher and Kibana rules | Kibana rules only |
| Tuning | Thread pools, heap, `elasticsearch.yml` | **Search power**, search boost window |

- The **document, search, mapping, ingest, ES|QL** APIs are the same: your application code does not change
- Check the « Elasticsearch API differences in Serverless » page before moving

---

# Which one am I on?

```json
GET /
```

**Expected result** (excerpt):

```json
{
  "version": { "number": "9.5.6", "build_flavor": "default" },
  "tagline": "You Know, for Search"
}
```

- `build_flavor`: `default` for self-managed and Hosted, `serverless` on Serverless
- On Serverless, `version.number` is a fixed placeholder: the version **is** the latest

---

# How to choose

| Your constraint | Leaning towards |
|---|---|
| Air-gapped network, data that must stay on premises | **Self-managed** (or ECE / ECK) |
| A Kubernetes platform team already in place | **ECK** |
| Full API control, Watcher, custom plugins, long-term version pinning | **Hosted** or self-managed |
| A small team, no Elasticsearch operations skills | **Serverless** |
| A spiky, unpredictable load | **Serverless** (pay per use) |
| A large, steady load you size well | **Hosted** or self-managed (capacity is cheaper) |

<br />

- Compare the **total** cost: hardware + licence + the people who run it
- Check the **regions** and certifications (SOC 2, ISO 27001, HIPAA, FedRAMP…) your data needs

---

# Moving between options

| From → To | How |
|---|---|
| Self-managed → Hosted | **Snapshot** to a shared repository (S3, GCS, Azure), **restore** on the deployment |
| Any → Serverless | **Reindex from remote**, or re-ingest from the source (Logstash, Agent, your app) |
| Any → any, without moving data | **Cross-cluster search** while the old one ages out |
| Old cluster → new major | Snapshot / restore, or reindex from remote (chapter 18) |

<!-- ci: skip -->
```json
POST /_reindex
{
  "source": {
    "remote": { "host": "https://old-cluster:9200", "api_key": "<encoded API key>" },
    "index": "products"
  },
  "dest": { "index": "products" }
}
```

- `reindex.remote.whitelist` (the target cluster) must allow the source host
- Create the mappings and templates on the target **first**: the reindex only copies documents

---

# Quiz

**A team wants Elasticsearch for a new semantic search feature. Nobody knows how to operate a cluster, and the traffic is unknown. Which option fits best?**

- A) Self-managed on three virtual machines
- B) ECK on the company's Kubernetes
- C) An Elasticsearch project on Elastic Cloud Serverless
- D) Elastic Cloud Hosted with Watcher

<v-click>

**Answer: C** — no nodes or shards to size, autoscaling on an unknown load, billing per use, and the
latest search features first. Hosted would also work, but leaves the sizing to the team.

</v-click>
