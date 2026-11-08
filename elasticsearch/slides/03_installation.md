---
layout: cover
---

# 3 - Installation and REST API

---

# Learning objectives

By the end of this sequence (**~45 min**, workshop included), you will be able to:

- **Choose** an installation method: package, archive, Docker, Elastic Cloud
- **Start** a development node and **find** its configuration, data and logs
- **Set** the essential parameters of `elasticsearch.yml`
- **Send** requests to the REST API from Kibana Dev Tools or `curl`
- **Check** a cluster with `GET /`, `_cluster/health` and the `_cat` APIs

---

# Installation methods

| Method | For |
|---|---|
| **Packages** — APT, YUM | Servers: `systemd` service, upgrades by the package manager |
| **Archives** — `tar.gz`, `zip` | Full control, no root access |
| **Docker** — `docker.elastic.co/elasticsearch/elasticsearch` | Development, Kubernetes (**ECK**, Helm) |
| **Elastic Cloud** | Managed: no infrastructure to run |

<br />

> No Java to install: every distribution **bundles its JDK** — the one to use.
> `ES_JAVA_HOME` only to force another JVM.

---

# A development node with Docker

```shell
docker run --name es -p 9200:9200 -m 2GB \
  -e "discovery.type=single-node" \
  docker.elastic.co/elasticsearch/elasticsearch:9.5.6
```

- `discovery.type=single-node`: no attempt to find other nodes
- **Security is on**: the logs print the `elastic` password and a Kibana **enrollment token**
- Reset the password later: `docker exec -it es bin/elasticsearch-reset-password -u elastic`

---

# Starting a packaged node

```bash
sudo systemctl enable --now elasticsearch
sudo systemctl status elasticsearch
sudo journalctl -u elasticsearch -f
```

With an archive:

```bash
./bin/elasticsearch            # foreground
./bin/elasticsearch -d -p pid  # daemon
kill -SIGTERM $(cat pid)       # clean shutdown
```

- The node refuses to run as `root`; the packages use the `elasticsearch` user

---

# Where things are (packages)

| Directory | Content |
|---|---|
| `/usr/share/elasticsearch/` | Binaries (`bin/`), libraries, modules |
| `/etc/elasticsearch/` | `elasticsearch.yml`, `jvm.options.d/`, `log4j2.properties`, `certs/` |
| `/var/lib/elasticsearch/` | Data: `path.data` |
| `/var/log/elasticsearch/` | Logs: `path.logs` |

<br />

- In an archive, everything lives under the extracted folder (`config/`, `data/`, `logs/`)
- Snapshots need a `path.repo`: no default (chapter 18)

---

# `elasticsearch.yml`: the essentials

```yaml
cluster.name: training
node.name: node-1

network.host: 0.0.0.0
http.port: 9200

path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch

# Written by the auto-configuration on the first start
xpack.security.enabled: true
```

- A change in `elasticsearch.yml` needs a **restart**
- `index.*` settings are **refused** here: they belong to the index or to a template
- Node roles, cluster formation, JVM: chapter 21

---

# Security on by default

Since 8.0, the first start **auto-configures** security:

- **TLS** on HTTP and transport, certificates in `config/certs/`
- A password for the `elastic` superuser
- An **enrollment token** to connect Kibana (or another node), valid 30 min

```bash
./bin/elasticsearch-create-enrollment-token -s kibana
```

> Do not switch it off "to simplify": a cluster open on the network gets wiped by bots
> within hours.

---

# The REST API

Everything is **HTTP + JSON**: `METHOD /path` + an optional body.

- Endpoints starting with `_` are **APIs**: `_search`, `_doc`, `_bulk`, `_analyze`, `_cat`, `_reindex`…
- Without `_`, the segment is an **index** name: `/movies/_search`

```json
GET /
```

**Expected result**:

```json
{ "tagline": "You Know, for Search" }
```

---

# Talking to Elasticsearch

- **Kibana Dev Tools** — the console of this training: completion, documentation link
- **curl** — scripts, servers without Kibana
- **Clients** — Java, JavaScript, Python, Go, .NET… (chapter 16)
- **Postman**, Bruno, HTTPie…

```bash
curl -u elastic --cacert config/certs/http_ca.crt https://localhost:9200/
```

---
src: ../../elasticsearch-common/slides/kibana/presentation.md
---

---
src: ../../elasticsearch-common/slides/kibana/tour.md
---

---

# Kibana Dev Tools

- **Management → Dev Tools**, or the `>_` icon
- One request per block: `METHOD /path`, then the JSON body
- `Ctrl + Enter` sends the request under the cursor
- **Copy as curl** to paste it in a terminal

<!-- ci: no-compare -->
```json
GET /_cluster/health
```

**Expected result** (one node, no index):

```json
{ "status": "green", "number_of_nodes": 1 }
```

---

# The `_cat` APIs

Readable, column-based answers — for humans, not programs:

```json
GET /_cat/health?v
GET /_cat/nodes?v
GET /_cat/indices?v
GET /_cat/shards?v
GET /_cat/master?v
```

| Parameter | Effect |
|---|---|
| `?v` | Column headers |
| `?h=index,docs.count` | Chosen columns |
| `?s=store.size:desc` | Sort |
| `?format=json` | JSON output |

---

# `_cat/indices`: the indices at a glance

```json
GET /_cat/indices?v&s=store.size:desc&h=index,health,pri,rep,docs.count,store.size
```

```text
index      health pri rep docs.count store.size
logs-2025  green    1   1   15000000      2.5gb
products   green    1   1     100000       50mb
users      yellow   1   1      50000       10mb
```

- `pri` / `rep`: primaries and replicas
- `store.size`: primaries **and** replicas

---

# Quiz

**You changed `cluster.name` in `elasticsearch.yml`. When is it taken into account?**

- A) At once
- B) After `POST /_refresh`
- C) After a restart of the node
- D) Never: it is an index setting

<v-click>

**Answer: C** — `elasticsearch.yml` is only read at start-up. Dynamic settings go through `PUT /_cluster/settings`.

</v-click>

---
layout: cover
---

# Workshop 1

## Inspecting the cluster with the `_cat` APIs
