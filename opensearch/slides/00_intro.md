---
layout: cover
---

# Agenda

---

<table>
<tbody>
 <tr style="border: 0; font-size: 0.95em">
    <td>
        <ul>
            <li>0 - Introduction to the training
                <ul>
                    <li>Goals and schedule</li>
                    <li>The lab: OpenSearch and Dashboards</li>
                </ul>
            </li>
            <li>1 - OpenSearch
                <ul>
                    <li>A fork of Elasticsearch 7.10</li>
                    <li>Licences: Apache 2.0, SSPL, ELv2, AGPL</li>
                    <li>Use cases, role of OpenSearch Dashboards</li>
                </ul>
            </li>
            <li>2 - Architecture and concepts
                <ul>
                    <li>Distributed search, inverted index</li>
                    <li>Nodes, indices, shards, replicas</li>
                    <li>Scalability and resilience</li>
                </ul>
            </li>
            <li>3 - Installation and REST API
                <ul>
                    <li>Docker, configuration, startup</li>
                    <li>Cluster health, <code>_cat</code> API</li>
                    <li>JSON, REST and Dev Tools</li>
                </ul>
            </li>
            <li>4 - Indexing and mapping
                <ul>
                    <li>Create and manage an index</li>
                    <li>Data types, explicit mapping</li>
                    <li>CRUD, <code>_bulk</code>, aliases</li>
                </ul>
            </li>
            <li>5 - Search and relevance
                <ul>
                    <li>Query DSL: <code>match</code>, <code>term</code>, <code>bool</code></li>
                    <li>BM25 scoring, <code>boost</code>, <code>function_score</code></li>
                </ul>
            </li>
        </ul>
    </td>
    <td>
        <ul>
            <li>6 - Text analysis
                <ul>
                    <li>Analyzers: char filters, tokenizer, token filters</li>
                    <li>Custom analyzers</li>
                </ul>
            </li>
            <li>7 - Aggregations
                <ul>
                    <li>Metrics, buckets, pipeline</li>
                    <li>Sub-aggregations</li>
                </ul>
            </li>
            <li>8 - Advanced search features
                <ul>
                    <li>Filters, sorting, pagination</li>
                    <li>Highlighting, suggestions</li>
                    <li>Geo queries, percolation</li>
                </ul>
            </li>
            <li>9 - Ingest pipelines
                <ul>
                    <li>Processors, <code>_simulate</code></li>
                    <li>Enrich before indexing</li>
                </ul>
            </li>
            <li>10 - OpenSearch Dashboards
                <ul>
                    <li>Index patterns, Discover</li>
                    <li>Visualizations, maps</li>
                    <li>Interactive dashboards</li>
                </ul>
            </li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

# Training goals

By the end of the day, you will be able to:

- **Explain** where OpenSearch comes from and its distributed architecture
- **Install** and configure a cluster, and **check** its health
- **Index** and **search** documents with the REST API
- **Design** a mapping with the right data types
- **Use** text analysis, aggregations and scoring
- **Transform** data before indexing with an ingest pipeline
- **Build** visualizations and dashboards in OpenSearch Dashboards

<br />

> The training is based on **OpenSearch 3.9** and **OpenSearch Dashboards 3.9**.

---

# Audience and prerequisites

**Audience**: system and network administrators, data analysts,
developers, Big Data and DevOps engineers.

**Prerequisites**:

- Know structured data formats, **JSON** in particular
- Basics of system architecture or database administration
- Prior experience with a search engine or a NoSQL database helps, but is not
  required

**Equipment**: a machine with **Docker** (4 GB of free RAM) and a browser.

---

# A packed day

The programme is designed for **two days**: we cover it in **one**.

| | Chapters | Practice |
|---|---|---|
| **Morning** | 0 → 5 — OpenSearch, architecture, installation, mapping, search | Workshop 1 · Workshop 2 · Workshop 3 |
| **Afternoon** | 6 → 10 — analysis, aggregations, advanced search, ingest, Dashboards | Workshop 4 · Workshop 5 · Workshop 6 · Workshop 7 · Workshop 8 |

<br />

- **Eight short workshops** (20 to 30 min), each self-contained: it creates its own data
- Each workshop has a **"Going further"** section: to do after the session
- A **quiz** closes the key chapters, a **retrospective** closes the day

---

# Teaching methods

- Alternating **theory** and **hands-on practice**
- Live demos in **Dev Tools**
- Feedback from the trainer's experience
- Digital materials provided: slides, workshop instructions

<br />

# Assessment

- A **self-assessment questionnaire** before the session
- **Quizzes** corrected together
- Continuous assessment through the **workshops**
- A **final questionnaire**, mirroring the self-assessment

---

# The lab

One OpenSearch node and OpenSearch Dashboards, locally, with Docker:

```bash
cd workshops/01_installation
docker compose up -d --wait
```

- OpenSearch: **http://localhost:9200**
- OpenSearch Dashboards: **http://localhost:5601** → ☰ menu → **Dev Tools**

<br />

> The lab disables the **security plugin**: plain HTTP, no user.
> Handy for learning, **never** in production.

On Linux, OpenSearch requires `vm.max_map_count` ≥ 262144:

```bash
sudo sysctl -w vm.max_map_count=262144
```
