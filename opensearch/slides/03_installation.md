---
layout: cover
---

# 3 - Installation and REST API

---

# Learning objectives

By the end of this section (**~30 min**, workshop included), you will be able to:

- **Start** OpenSearch and OpenSearch Dashboards with Docker
- **Read** the essential configuration files and settings
- **Check** the health of the cluster with the REST API and the `_cat` APIs
- **Send** requests from Dev Tools and from `curl`

---

# Installation options

| Option | For whom |
|---|---|
| **Docker / Docker Compose** | Lab, CI, most containerized deployments |
| **`tar.gz` archive**, **RPM / DEB** packages | Classic servers, managed by systemd |
| **Helm chart / Operator** | Kubernetes |
| **Managed service** | Amazon OpenSearch Service, Aiven… |

<br />

- OpenSearch ships its own **JDK**: nothing else to install
- **Linux**: `vm.max_map_count` ≥ **262144** (Lucene memory-maps its files)

---

# The lab: Docker Compose

```yaml
services:
  opensearch:
    image: opensearchproject/opensearch:3.9.0
    environment:
      - discovery.type=single-node          # a single node, no election
      - DISABLE_SECURITY_PLUGIN=true        # lab only!
      - OPENSEARCH_JAVA_OPTS=-Xms1g -Xmx1g  # JVM heap
    ports: ["9200:9200"]

  dashboards:
    image: opensearchproject/opensearch-dashboards:3.9.0
    environment:
      - OPENSEARCH_HOSTS=["http://opensearch:9200"]
      - DISABLE_SECURITY_DASHBOARDS_PLUGIN=true
    ports: ["5601:5601"]
```

The full file: `workshops/01_installation/docker-compose.yml`.

---

# Configuration

`config/opensearch.yml` — or environment variables, with Docker:

```yaml
cluster.name: training
node.name: node-1
node.roles: [cluster_manager, data, ingest]
path.data: /var/lib/opensearch
network.host: 0.0.0.0
http.port: 9200
discovery.seed_hosts: ["node-1", "node-2", "node-3"]
cluster.initial_cluster_manager_nodes: ["node-1", "node-2", "node-3"]
```

- `config/jvm.options`: the **heap**. Rule: **≤ 50 %** of the RAM, **≤ ~31 GB**, `Xms` = `Xmx`
- `cluster.initial_cluster_manager_nodes`: **only once**, on the very first startup

---

# Security, for real

In production, the **security plugin** is **enabled**:

- **TLS** on the transport layer (between nodes) and on HTTP
- **Authentication**: internal users, LDAP, SAML, OpenID Connect
- **Authorization**: roles, at the cluster, index, document and field level
- **Audit log**

<br />

Without disabling it, the Docker image requires an admin password:

```bash
docker run -e OPENSEARCH_INITIAL_ADMIN_PASSWORD='Str0ng-Passw0rd!' \
  -e discovery.type=single-node -p 9200:9200 opensearchproject/opensearch:3.9.0
curl -k -u admin:'Str0ng-Passw0rd!' https://localhost:9200
```

---

# The REST API

Everything goes through **HTTP + JSON**: `METHOD /path`, and an optional JSON body.

| Method | Usage |
|---|---|
| `GET` | Read: a document, a search, a state |
| `PUT` | Create or replace at a known path: an index, a document with a given `_id` |
| `POST` | Create without an `_id`, or an action: `_search`, `_bulk`, `_update` |
| `DELETE` | Delete |
| `HEAD` | Test existence |

<br />

- Paths starting with `_` are **APIs**: `_search`, `_cat`, `_cluster`…
- `?pretty`, `?format=json`, `?v`: output options

---

# Is the cluster up?

```json
GET /
```

**Expected result**:

```json
{
  "version": { "distribution": "opensearch" },
  "tagline": "The OpenSearch Project: https://opensearch.org/"
}
```

```json
GET /_cluster/health
```

- `status`: `green`, `yellow`, `red`
- `number_of_nodes`, `active_shards`, `unassigned_shards`

---

# The `_cat` APIs

Human-readable tables — `?v` adds the headers:

```json
GET /_cat/nodes?v
GET /_cat/indices?v
GET /_cat/shards?v
GET /_cat/health?v
```

```text
ip         heap.percent ram.percent cpu load_1m node.role node.roles                                  cluster_manager name
172.18.0.2           24          71   3    0.52 dimr      cluster_manager,data,ingest,remote_cluster_client *  opensearch-node1
```

- `?format=json`: the same table, as JSON, for a script
- `?h=index,health,docs.count`: pick your columns; `?s=docs.count:desc`: sort

---

# Dev Tools

OpenSearch Dashboards → ☰ menu → **Management** → **Dev Tools**

- The console sends the request **to the cluster**: no need for `curl`
- Auto-completion of APIs, indices and fields
- `Ctrl + Enter`: send the request under the cursor
- Wrench icon → **Copy as cURL**

The same call, from the command line:

```bash
curl -s 'http://localhost:9200/_cat/indices?v'
curl -s -X PUT 'http://localhost:9200/test' -H 'Content-Type: application/json' \
  -d '{ "settings": { "number_of_replicas": 0 } }'
```

---

# Hands-on

## Workshop 1 - Installation and first steps
