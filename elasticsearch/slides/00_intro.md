---
layout: cover
---

# Agenda

---

# Day 1 — Fundamentals and indexing

<table>
<tbody>
 <tr style="border: 0; font-size: 0.95em">
    <td>
        <ul>
            <li>0 - Introduction to the training</li>
            <li>1 - Elasticsearch
                <ul>
                    <li>Search engines, Lucene, the Elastic Stack</li>
                    <li>Use cases, search vs database</li>
                </ul>
            </li>
            <li>2 - Architecture and concepts
                <ul>
                    <li>Inverted index, life of a document</li>
                    <li>Cluster, nodes, indices, shards, replicas</li>
                </ul>
            </li>
            <li>3 - Installation and REST API
                <ul>
                    <li>Docker, <code>elasticsearch.yml</code>, security</li>
                    <li>Kibana, Dev Tools, <code>_cat</code> APIs</li>
                </ul>
            </li>
        </ul>
    </td>
    <td>
        <ul>
            <li>4 - Documents
                <ul>
                    <li>CRUD, versions, <code>_bulk</code>, refresh</li>
                </ul>
            </li>
            <li>5 - Mapping
                <ul>
                    <li>Dynamic and explicit mapping, data types</li>
                    <li><code>text</code> vs <code>keyword</code>, <code>nested</code></li>
                </ul>
            </li>
            <li>6 - Text analysis
                <ul>
                    <li>Char filters, tokenizer, token filters</li>
                    <li>Custom analyzers</li>
                </ul>
            </li>
            <li>7 - Reindex, aliases and templates</li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

# Day 2 — Search and data

<table>
<tbody>
 <tr style="border: 0; font-size: 0.95em">
    <td>
        <ul>
            <li>8 - Search
                <ul>
                    <li>Query DSL: full text, exact values, <code>bool</code></li>
                    <li>Query vs filter context</li>
                </ul>
            </li>
            <li>9 - Relevance
                <ul>
                    <li>BM25, <code>boost</code>, <code>function_score</code></li>
                </ul>
            </li>
            <li>10 - Advanced search
                <ul>
                    <li>Sort, pagination, geo, highlighting, percolation</li>
                </ul>
            </li>
            <li>11 - Aggregations
                <ul>
                    <li>Metrics, buckets, pipeline</li>
                </ul>
            </li>
        </ul>
    </td>
    <td>
        <ul>
            <li>12 - ES|QL
                <ul>
                    <li>Pipes, <code>STATS</code>, <code>LOOKUP JOIN</code></li>
                </ul>
            </li>
            <li>13 - Vector search
                <ul>
                    <li>kNN, hybrid search, <code>semantic_text</code></li>
                </ul>
            </li>
            <li>14 - Ingest pipelines
                <ul>
                    <li>Processors, <code>_simulate</code>, errors</li>
                </ul>
            </li>
            <li>15 - Transforms
                <ul>
                    <li>Pivot, <code>latest</code>, continuous mode</li>
                </ul>
            </li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

# Day 3 — Developing and operating

<table>
<tbody>
 <tr style="border: 0; font-size: 0.95em">
    <td>
        <ul>
            <li>16 - Developing with an SDK
                <ul>
                    <li>Official client, Testcontainers</li>
                </ul>
            </li>
            <li>17 - Security
                <ul>
                    <li>TLS, users, roles, DLS / FLS, API keys</li>
                </ul>
            </li>
            <li>18 - Snapshots and upgrades
                <ul>
                    <li>Repositories, SLM, rolling upgrade</li>
                </ul>
            </li>
            <li>19 - Data retention
                <ul>
                    <li>Close, shrink, ILM, data tiers</li>
                </ul>
            </li>
            <li>20 - Data streams
                <ul>
                    <li>Lifecycle, LogsDB, failure store</li>
                </ul>
            </li>
        </ul>
    </td>
    <td>
        <ul>
            <li>21 - Sizing and performance
                <ul>
                    <li>CPU, RAM, disk, JVM, thread pools</li>
                </ul>
            </li>
            <li>22 - Production architecture
                <ul>
                    <li>Node roles, hot-warm-cold, HA, awareness</li>
                </ul>
            </li>
            <li>23 - Monitoring
                <ul>
                    <li>Stats APIs, critical metrics, Stack Monitoring</li>
                </ul>
            </li>
            <li>24 - Alerting
                <ul>
                    <li>Kibana rules, connectors</li>
                </ul>
            </li>
            <li>25 - Conclusion</li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

# Training goals

By the end of the three days, you will be able to:

- **Explain** how Elasticsearch stores, distributes and searches data
- **Install** a cluster, **check** its health and talk to it through the REST API
- **Index** documents and **design** a mapping with the right types and analyzers
- **Search** with the Query DSL and ES|QL, **tune** relevance, **aggregate**
- **Transform** data with ingest pipelines and transforms
- **Develop** against Elasticsearch with an official client, tests included
- **Secure**, **back up**, **size** and **monitor** a production cluster

<br />

> The training is based on **Elasticsearch 9.5.6** and **Kibana 9.5.6**.

---

# Audience and prerequisites

**Audience**: developers, system administrators, DevOps and data engineers.

**Prerequisites**:

- Know structured data formats, **JSON** in particular
- Basics of HTTP and of a command line
- Prior experience with a database helps, but is not required

**Equipment**: a machine with **Docker** (4 GB of free RAM) and a browser.

---

# Three days, three themes

| | Theme | Chapters | Workshops |
|---|---|---|---|
| **Day 1** | Fundamentals and indexing | 0 → 7 | 1 → 4 |
| **Day 2** | Search and data | 8 → 15 | 5 → 11 |
| **Day 3** | Developing and operating | 16 → 25 | 12 → 20 |

<br />

- **Twenty workshops**, each **self-contained**: it creates its own data
- Each workshop has a **"Going further"** section, for after the session
- A **quiz** closes the key chapters, a **final quiz** and a **retrospective** close the training
- An **appendix** — disaster recovery, checklists, runbooks — to keep for later

---

# Teaching methods

- Alternating **theory** and **hands-on practice**
- Live demos in **Kibana Dev Tools**
- Feedback from the trainer's experience
- Digital materials provided: slides, workshop instructions, solutions

<br />

# Assessment

- A **self-assessment questionnaire** before the session
- **Quizzes** corrected together
- Continuous assessment through the **workshops**
- A **final questionnaire**, mirroring the self-assessment

---

# The lab

One Elasticsearch node and Kibana, locally, with Docker:

<!-- ci: skip -->
```bash
docker network create elastic
docker run -d --name es --net elastic -p 9200:9200 -m 2GB \
  -e discovery.type=single-node -e ELASTIC_PASSWORD=training \
  docker.elastic.co/elasticsearch/elasticsearch:9.5.6
```

- Elasticsearch: **https://localhost:9200** — user `elastic`, self-signed certificate
- Kibana, enrolled in chapter 3: **http://localhost:5601** → ☰ menu → **Dev Tools**

<br />

> Security is **on by default** since 8.0: TLS, users, passwords.
> Chapter 3 starts the lab step by step, Kibana included.

On Linux, Elasticsearch requires `vm.max_map_count` ≥ 262144:

```bash
sudo sysctl -w vm.max_map_count=262144
```
